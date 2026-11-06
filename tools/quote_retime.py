"""tools/quote_retime.py - step 3 of the Comments page's karaoke lyrics.

Step 2 (quote_lyrics.py) finds WHERE in the song each preview starts, and
that part is solid. Its per-word times are Whisper's, which are rough (often
0.2-0.5s off, worse over loud music), and words Whisper missed were spread
evenly through the line - so the ball runs "almost there but not".

This re-times every word properly, now that we KNOW the words:
  1. Demucs (htdemucs) separates the VOCALS from the preview.
  2. torchaudio's MMS forced aligner pins each lyric line's known words onto
     the vocal track, inside a window around the line's current time.
  3. A line whose alignment scores poorly keeps its old times.
Words the clip cuts off (a line already under way when the preview starts,
or still going when it ends) keep their old times.

  python tools/quote_retime.py [--only ID] [--limit N]

Rewrites quote-lyrics.json in place; each entry gets "r": 1 once re-timed, so
a re-run skips it (--redo to do them all again). Uses the previews cached in
tools/.lyrcache/ by step 2 (re-downloads any that are missing).
Needs: pip install demucs (torch + torchaudio already there), ffmpeg on PATH.
"""
import argparse
import json
import os
import re
import subprocess
import sys
import urllib.request

import numpy as np
import torch
import torchaudio

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(ROOT, 'quote-lyrics.json')
CACHE = os.path.join(HERE, '.lyrcache')
UA = 'Spindeck-prototype (github.com/JOO-K/CSHARP-user)'
DEV = 'cuda' if torch.cuda.is_available() else 'cpu'
PAD = 0.7            # seconds of slack either side of a line's current window
MIN_SCORE = 0.10     # mean alignment confidence below this keeps the old times (soft vocals score 0.14-0.3)


def decode(path, sr, ch):
    """Any audio file -> float32 numpy (ch, n) via ffmpeg."""
    raw = subprocess.run(['ffmpeg', '-v', 'quiet', '-i', path, '-f', 'f32le', '-ac', str(ch), '-ar', str(sr), '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, ch).T.copy()


def fetch_preview(sid, path):
    if os.path.exists(path):
        return True
    try:
        req = urllib.request.Request(f'https://api.deezer.com/track/{sid}', headers={'User-Agent': UA})
        tr = json.loads(urllib.request.urlopen(req, timeout=25).read())
        data = urllib.request.urlopen(urllib.request.Request(tr['preview'], headers={'User-Agent': UA}), timeout=25).read()
        open(path, 'wb').write(data)
        return True
    except Exception:
        return False


def clean(word):
    """A lyric word as the MMS aligner's alphabet wants it (latin letters + apostrophe)."""
    w = word.lower().replace('’', "'")
    w = re.sub(r"[^a-z']", '', w).strip("'")
    return w


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--only', type=int, default=0)
    ap.add_argument('--limit', type=int, default=0)
    ap.add_argument('--redo', action='store_true')
    ap.add_argument('--debug', action='store_true')
    args = ap.parse_args()

    data = json.load(open(OUT, encoding='utf-8'))
    ids = [k for k in data if (args.redo or not data[k].get('r')) and (not args.only or k == str(args.only))]
    if args.limit:
        ids = ids[:args.limit]
    print(f'{len(ids)} to re-time')
    if not ids:
        return

    from demucs.pretrained import get_model
    from demucs.apply import apply_model
    sep = get_model('htdemucs').to(DEV).eval()
    vocals_i = sep.sources.index('vocals')
    bundle = torchaudio.pipelines.MMS_FA
    fa = bundle.get_model(with_star=False).to(DEV).eval()
    tok = bundle.get_tokenizer()
    aligner = bundle.get_aligner()
    SR = bundle.sample_rate                                   # 16k

    done = 0
    for n, sid in enumerate(ids, 1):
        e = data[sid]
        print(f"[{n}/{len(ids)}] {e['a']} - {e['t']}")
        path = os.path.join(CACHE, sid + '.mp3')
        if not fetch_preview(sid, path):
            print('  no preview'); continue
        # 1. vocals
        mix = torch.from_numpy(decode(path, sep.samplerate, 2))
        with torch.inference_mode():
            src = apply_model(sep, mix[None].to(DEV), device=DEV, progress=False)[0]
        voc = src[vocals_i].mean(0, keepdim=True).cpu()
        voc = torchaudio.functional.resample(voc, sep.samplerate, SR)
        clip_len = voc.shape[1] / SR
        # 2. one emission for the clip, sliced per line
        with torch.inference_mode():
            em, _ = fa(voc.to(DEV))
        em = em[0].cpu()
        fps = em.shape[0] / clip_len                           # frames per second
        moved, kept, total_shift, nshift = 0, 0, 0.0, 0
        for line in e['l']:
            t0, t1, words = line
            # only words the clip actually holds
            idx = [k for k, (w, wt) in enumerate(words) if wt >= -0.05 and wt < clip_len - 0.25 and clean(w)]
            if len(idx) < 1:
                kept += 1; continue
            if len(idx) != len([1 for w, wt in words if clean(w)]):
                # a cut-off line: only re-time the run of words inside the clip
                pass
            lo = max(0.0, words[idx[0]][1] - PAD)
            hi = min(clip_len, max(t1, words[idx[-1]][1] + 0.6) + PAD)
            f0, f1 = int(lo * fps), max(int(lo * fps) + 2, int(hi * fps))
            seg = em[f0:f1]
            transcript = [clean(words[k][0]) for k in idx]
            try:
                spans = aligner(seg, tok(transcript))
            except Exception:
                kept += 1; continue
            if len(spans) != len(idx):
                kept += 1; continue
            scores = [sum(s.score * (s.end - s.start) for s in sp) / max(1, sum(s.end - s.start for s in sp)) for sp in spans]
            if args.debug:
                print(f"    {float(np.mean(scores)):.2f}  {' '.join(transcript)[:60]}")
            if float(np.mean(scores)) < MIN_SCORE:
                kept += 1; continue
            for k, sp in zip(idx, spans):
                new = round(lo + sp[0].start / fps, 2)
                total_shift += abs(new - words[k][1]); nshift += 1
                words[k][1] = new
            # keep it monotonic and pull the line's start onto its first word
            for k in range(1, len(words)):
                if words[k][1] < words[k - 1][1]:
                    words[k][1] = words[k - 1][1]
            line[0] = round(min(line[0], words[0][1] - 0.05), 2) if words[0][1] >= 0 else line[0]
            moved += 1
        e['r'] = 1
        done += 1
        avg = total_shift / max(1, nshift)
        print(f'  {moved} lines re-timed, {kept} kept; words moved {avg:.2f}s on average')
        json.dump(data, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print(f'{done} songs re-timed')


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    main()
