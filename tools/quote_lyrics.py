"""tools/quote_lyrics.py - step 2 of the Comments page's karaoke lyrics.

Deezer never says where in a song its 30-second preview starts, so the
exact lines can't be looked up. This works it out per song, offline:

  1. Deezer: the track's fresh preview URL (links expire), downloaded.
  2. LRCLIB: the song's SYNCED lyrics (every line stamped with its time in
     the full song).
  3. Whisper: transcribes the preview with a timestamp per word.
  4. Alignment: slides the preview along the song and keeps the start time
     at which the most heard words land inside the lyric line playing then.
     Unsure matches (too few words heard, too few landing) are SKIPPED -
     better no lyrics than wrong ones.
  5. Each lyric line in the clip gets its words' times (Whisper's where a
     word was heard, spread evenly between them where not), all relative to
     the PREVIEW, so the app drives it straight off audio.currentTime.

Writes quote-lyrics.json at the repo root (quotes.js fetches it once):
  { "<deezer id>": { "a": artist, "t": title, "o": start in song, "c": confidence,
                     "l": [[lineStart, lineEnd, [[word, t], ...]], ...] } }

  python tools/quote_lyrics.py [--limit N] [--only ID] [--redo] [--model turbo]

Song list: tools/quote-songs.json (step 1: node tools/quote_songs.js).
Needs: pip install openai-whisper, ffmpeg on PATH, a GPU helps (CPU works, slowly).
Downloads cache in tools/.lyrcache/ (gitignored). Skips are remembered there
so a re-run only does new songs; --redo does them all again.
"""
import argparse
import warnings
warnings.filterwarnings("ignore", message="Failed to launch Triton")
import bisect
import json
import os
import re
import sys
import time
import unicodedata
import urllib.parse
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SONGS = os.path.join(HERE, 'quote-songs.json')
OUT = os.path.join(ROOT, 'quote-lyrics.json')
CACHE = os.path.join(HERE, '.lyrcache')
SKIPS = os.path.join(CACHE, 'skips.json')
UA = 'Spindeck-prototype (github.com/JOO-K/CSHARP-user)'

MIN_WORDS = 5        # matched words needed to trust an alignment
MIN_FRAC = 0.35      # ...and the share of heard words that must land


def get(url, raw=False):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    try:
        with urllib.request.urlopen(req, timeout=25) as r:
            data = r.read()
        return data if raw else json.loads(data.decode('utf-8'))
    except Exception:
        return None


def norm(w):
    w = unicodedata.normalize('NFKC', w).lower()
    return ''.join(ch for ch in w if ch.isalnum())


def lrclib(artist, title, album, dur):
    q = urllib.parse.urlencode({'artist_name': artist, 'track_name': title,
                                'album_name': album, 'duration': int(dur or 0)})
    j = get('https://lrclib.net/api/get?' + q)
    if j and j.get('syncedLyrics'):
        return j
    clean = re.sub(r'\s*[\(\[].*?[\)\]]', '', title).strip() or title
    hits = get('https://lrclib.net/api/search?' + urllib.parse.urlencode(
        {'track_name': clean, 'artist_name': artist})) or []
    hits = [h for h in hits if h.get('syncedLyrics')]
    if not hits:
        return None
    hits.sort(key=lambda h: abs((h.get('duration') or 0) - (dur or 0)))
    h = hits[0]
    return h if not dur or abs((h.get('duration') or 0) - dur) <= 10 else None


TAG = re.compile(r'\[(\d+):(\d+(?:\.\d+)?)\]')


def parse_lrc(text):
    out = []
    for raw in text.splitlines():
        tags = TAG.findall(raw)
        words = TAG.sub('', raw).strip()
        for m, s in tags:
            out.append((int(m) * 60 + float(s), words))
    out.sort(key=lambda x: x[0])
    return out


def heard_words(model, path, prompt=None):
    r = model.transcribe(path, word_timestamps=True, condition_on_previous_text=False,
                         initial_prompt=prompt, fp16=True, verbose=None)
    out = []
    for seg in r.get('segments', []):
        for w in seg.get('words', []) or []:
            n = norm(w['word'])
            if n:
                out.append((n, float(w['start']), float(w['end'])))
    return out


def align(lines, W, clip_len, song_len):
    """Best start time of the clip in the song, and how sure we are."""
    starts = [t for t, _ in lines]
    sets = [set(norm(x) for x in txt.split()) - {''} for _, txt in lines]
    mids = [(n, (a + b) / 2) for n, a, b in W]

    def score(o):
        m = 0.0
        for n, mid in mids:
            T = o + mid
            i = bisect.bisect_right(starts, T) - 1
            if i >= 0 and n in sets[i]:
                m += 1
            elif i + 1 < len(lines) and n in sets[i + 1] and starts[i + 1] - T < 0.8:
                m += 0.6
            elif i >= 1 and n in sets[i - 1] and T - starts[i] < 0.8:
                m += 0.6
        return m

    top = max(song_len - clip_len + 1, 1)
    steps = [k / 10 for k in range(int(top * 10) + 1)]
    sc = [score(o) for o in steps]
    best = max(sc)
    # the plateau of best offsets: take the middle of the longest run
    runs, cur = [], []
    for o, s in zip(steps, sc):
        if s >= best - 1e-9:
            cur.append(o)
        elif cur:
            runs.append(cur); cur = []
    if cur:
        runs.append(cur)
    run = max(runs, key=len)
    return run[len(run) // 2], best, len(runs)


def word_times(tokens, W, s, e, used_from):
    """Times for a line's words (relative to the clip)."""
    times = [None] * len(tokens)
    j = used_from
    for k, tok in enumerate(tokens):
        n = norm(tok)
        if not n:
            continue
        for q in range(j, len(W)):
            wn, a, _ = W[q]
            if a > e + 0.5:
                break
            if wn == n and a >= s - 0.8:
                times[k] = a; j = q + 1
                break
    anchors = [(k, t) for k, t in enumerate(times) if t is not None]
    weight = [max(1, len(t)) for t in tokens]

    def spread(i0, t0, i1, t1):           # fill (i0, i1) exclusive by character weight
        tot = sum(weight[i0:i1]) or 1
        acc = 0
        for k in range(i0 + 1, i1):
            acc += weight[k - 1]
            times[k] = t0 + (t1 - t0) * acc / tot

    if not anchors:
        times[0] = s
        span = min(e - s, 0.32 * len(tokens) + 0.4)
        spread(0, s, len(tokens), s + span)
        if len(tokens) > 1 and times[-1] is None:
            times[-1] = s + span * (1 - weight[-1] / (sum(weight) or 1))
    else:
        k0, t0 = anchors[0]
        if k0 > 0:
            lead = max(s, t0 - 0.3 * k0)
            times[0] = lead
            spread(0, lead, k0, t0)
        for (a, ta), (b, tb) in zip(anchors, anchors[1:]):
            spread(a, ta, b, tb)
        kl, tl = anchors[-1]
        if kl < len(tokens) - 1:
            tail = min(e, tl + 0.32 * (len(tokens) - 1 - kl) + 0.3)
            spread(kl, tl, len(tokens), tail)
            times[-1] = times[-1] if times[-1] is not None else tail
    for k in range(len(times)):                 # tidy: no gaps, never backwards
        if times[k] is None:
            times[k] = times[k - 1] if k else s
        if k and times[k] < times[k - 1]:
            times[k] = times[k - 1]
    return times, j


def build(lines, W, o, clip_len):
    out, j = [], 0
    for idx, (t, txt) in enumerate(lines):
        if not txt:
            continue
        nxt = lines[idx + 1][0] if idx + 1 < len(lines) else t + 6
        s, e = t - o, min(nxt, t + 9) - o
        if e < 0.2 or s > clip_len - 0.3:
            continue
        tokens = txt.split()
        times, j = word_times(tokens, W, s, e, j)
        out.append([round(max(s, times[0] - 0.05), 2), round(e, 2),
                    [[tok, round(tt, 2)] for tok, tt in zip(tokens, times)]])
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--limit', type=int, default=0)
    ap.add_argument('--only', type=int, default=0)
    ap.add_argument('--redo', action='store_true')
    ap.add_argument('--model', default='turbo')
    args = ap.parse_args()

    songs = json.load(open(SONGS, encoding='utf-8'))
    os.makedirs(CACHE, exist_ok=True)
    out = json.load(open(OUT, encoding='utf-8')) if os.path.exists(OUT) else {}
    skips = json.load(open(SKIPS, encoding='utf-8')) if os.path.exists(SKIPS) else {}
    if args.only:
        songs = [s for s in songs if s['id'] == args.only]
    todo = [s for s in songs if args.redo or (str(s['id']) not in out and str(s['id']) not in skips)]
    if args.limit:
        todo = todo[:args.limit]
    print(f'{len(todo)} to do ({len(out)} done, {len(skips)} skipped before)')
    if not todo:
        return

    import whisper
    from whisper.audio import load_audio, SAMPLE_RATE
    t0 = time.time()
    model = whisper.load_model(args.model)
    print(f'model {args.model} loaded in {time.time() - t0:.0f}s')

    def skip(s, why):
        skips[str(s['id'])] = why
        out.pop(str(s['id']), None)
        print(f"  skip: {why}")

    for n, s in enumerate(todo, 1):
        sid = str(s['id'])
        print(f"[{n}/{len(todo)}] {s['artist']} - {s['title']}")
        tr = get(f'https://api.deezer.com/track/{sid}')
        if not tr or not tr.get('preview'):
            skip(s, 'no preview'); continue
        song_len = tr.get('duration') or s.get('dur') or 0
        lr = lrclib(s['artist'], s['title'], s.get('album', ''), song_len)
        if not lr:
            skip(s, 'no synced lyrics on LRCLIB'); continue
        lines = parse_lrc(lr['syncedLyrics'])
        if sum(1 for _, x in lines if x) < 4:
            skip(s, 'too few lyric lines'); continue
        song_len = max(song_len, lines[-1][0] + 5)
        path = os.path.join(CACHE, sid + '.mp3')
        data = get(tr['preview'], raw=True)
        if not data:
            skip(s, 'preview download failed'); continue
        open(path, 'wb').write(data)
        clip_len = len(load_audio(path)) / SAMPLE_RATE

        W = heard_words(model, path)
        o, best, runs = align(lines, W, clip_len, song_len) if len(W) >= 3 else (0, 0, 0)
        frac = best / max(1, len(W))
        if best < MIN_WORDS or frac < MIN_FRAC:
            # second try: the lyrics as Whisper's prompt (helps it hear sung words)
            hint = ' '.join(x for _, x in lines if x)[-600:]
            W2 = heard_words(model, path, prompt=hint)
            if len(W2) >= 3:
                o2, b2, r2 = align(lines, W2, clip_len, song_len)
                f2 = b2 / max(1, len(W2))
                if b2 >= MIN_WORDS and f2 >= MIN_FRAC and (b2 > best or f2 > frac):
                    W, o, best, runs, frac = W2, o2, b2, r2, f2
        if best < MIN_WORDS or frac < MIN_FRAC:
            skip(s, f'unsure match ({best:.0f} of {len(W)} words heard)'); continue
        L = build(lines, W, o, clip_len)
        if not L:
            skip(s, 'no lyric lines inside the preview'); continue
        out[sid] = {'a': s['artist'], 't': s['title'], 'o': round(o, 2),
                    'c': round(frac, 2), 'l': L}
        skips.pop(sid, None)
        print(f"  ok: clip starts at {int(o // 60)}:{o % 60:04.1f}, {best:.0f}/{len(W)} words "
              f"({frac:.0%}), {len(L)} lines{'' if runs == 1 else f', {runs} candidate spots'}")
        # save as we go: a long run can be stopped any time
        json.dump(out, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
        json.dump(skips, open(SKIPS, 'w', encoding='utf-8'), indent=1)
    json.dump(out, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    json.dump(skips, open(SKIPS, 'w', encoding='utf-8'), indent=1)
    print(f'{len(out)} songs with lyrics in quote-lyrics.json, {len(skips)} skipped')


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    main()
