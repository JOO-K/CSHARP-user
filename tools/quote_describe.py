"""tools/quote_describe.py - a one-line description for the songs that have
no karaoke lyrics (instrumentals, mumbled / buried vocals, experimental).

CLAP (laion/clap-htsat-unfused, audio + text) scores the
30s preview against short phrases in four groups and the best of each makes
the line:

    MOOD  LEAD-SOUND  over  BED-SOUND  ·  tempo        kicker: what the voice is
    "Dreamy hazy synth pads over breakbeat drums · slow"   INSTRUMENTAL

Writes quote-desc.json at the repo root (quotes.js shows it where the lyrics
go): { "<deezer id>": { "a": artist, "t": title, "k": kicker, "d": line } }

  python tools/quote_describe.py [--limit N] [--only ID] [--redo] [--all]

By default it describes the songs in tools/quote-songs.json that have NO
lyrics in quote-lyrics.json; --all does every song (to compare). Previews
are cached in tools/.lyrcache/. The phrases below are the whole vocabulary -
edit them to change the voice.
"""
import argparse
import json
import os
import subprocess
import sys
import urllib.request

import numpy as np
import torch

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SONGS = os.path.join(HERE, 'quote-songs.json')
LYR = os.path.join(ROOT, 'quote-lyrics.json')
OUT = os.path.join(ROOT, 'quote-desc.json')
CACHE = os.path.join(HERE, '.lyrcache')
UA = 'Spindeck-prototype (github.com/JOO-K/CSHARP-user)'
DEV = 'cuda' if torch.cuda.is_available() else 'cpu'
MODEL = 'laion/clap-htsat-unfused'   # larger_clap_music's TEXT side is broken in transformers 4.56 (every phrase ~0.999 alike)

# display phrase -> what CLAP is asked about
MOOD = {
    'dreamy': 'dreamy music', 'melancholy': 'sad melancholic music', 'euphoric': 'euphoric uplifting music',
    'hypnotic': 'hypnotic repetitive music', 'nostalgic': 'nostalgic music', 'tense': 'tense dark music',
    'playful': 'playful bouncy music', 'serene': 'calm serene music', 'eerie': 'eerie unsettling music',
    'gritty': 'gritty raw music', 'warm': 'warm cozy music', 'aggressive': 'aggressive loud music',
    'wistful': 'wistful bittersweet music', 'cinematic': 'cinematic epic music',
}
# Round 2: coarse families. CLAP can't tell a Rhodes from a marimba reliably,
# but it can tell piano from guitars from synths.
LEAD = {
    'piano': 'piano music', 'guitars': 'electric guitar music', 'acoustic guitar': 'acoustic guitar music',
    'synths': 'synthesizer music', 'hazy synth pads': 'ambient synth pads', 'strings': 'orchestral strings',
    'horns': 'brass and saxophone', 'voices': 'choir and vocal harmonies', 'glitchy electronics': 'glitchy experimental electronic music',
    'drones': 'ambient drone', 'chopped samples': 'sample based chopped loops', 'noise': 'harsh noise and distortion',
}
BED = {
    'a hip-hop beat': 'hip hop beat', 'a dance beat': 'electronic dance beat four on the floor',
    'breakbeats': 'breakbeat jungle drums', 'live drums': 'live acoustic drum kit', 'heavy bass': 'heavy bass music',
    'a lo-fi loop': 'lo-fi beat', '': 'music with no drums or percussion',
}
TEMPO = {'slow': 'slow tempo music', 'mid-tempo': 'medium tempo music', 'fast': 'fast energetic tempo music'}
VOICE = {
    'Instrumental': 'instrumental music with no vocals',
    'Wordless vocals': 'wordless humming and ooh vocals',
    'Vocal chops': 'chopped and pitched vocal samples',
    'Hazy vocals': 'mumbled distant buried vocals',
    'Lyrics not found': 'clear sung or rapped vocals with lyrics',
}


def get(url, raw=False):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    try:
        with urllib.request.urlopen(req, timeout=25) as r:
            d = r.read()
        return d if raw else json.loads(d)
    except Exception:
        return None


def preview(sid):
    path = os.path.join(CACHE, sid + '.mp3')
    if not os.path.exists(path):
        tr = get(f'https://api.deezer.com/track/{sid}')
        data = tr and tr.get('preview') and get(tr['preview'], raw=True)
        if not data:
            return None
        open(path, 'wb').write(data)
    raw = subprocess.run(['ffmpeg', '-v', 'quiet', '-i', path, '-f', 'f32le', '-ac', '1', '-ar', '48000', '-'],
                         capture_output=True).stdout
    a = np.frombuffer(raw, dtype=np.float32)
    return a if len(a) > 48000 * 5 else None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--limit', type=int, default=0)
    ap.add_argument('--only', type=int, default=0)
    ap.add_argument('--redo', action='store_true')
    ap.add_argument('--all', action='store_true')
    ap.add_argument('--vocab', action='store_true', help='only write quote-clap.json (for the in-browser describer)')
    args = ap.parse_args()

    songs = json.load(open(SONGS, encoding='utf-8'))
    lyr = json.load(open(LYR, encoding='utf-8')) if os.path.exists(LYR) else {}
    out = json.load(open(OUT, encoding='utf-8')) if os.path.exists(OUT) else {}
    todo = [s for s in songs if (args.all or str(s['id']) not in lyr)
            and (args.redo or str(s['id']) not in out) and (not args.only or s['id'] == args.only)]
    if args.limit:
        todo = todo[:args.limit]
    print(f'{len(todo)} to describe')
    if not todo and not args.vocab:
        return
    os.makedirs(CACHE, exist_ok=True)

    from transformers import ClapModel, ClapProcessor
    model = ClapModel.from_pretrained(MODEL).to(DEV).eval()
    proc = ClapProcessor.from_pretrained(MODEL)

    def text_emb(d):
        keys = list(d)
        with torch.inference_mode():
            t = proc(text=[d[k] for k in keys], return_tensors='pt', padding=True).to(DEV)
            e = model.get_text_features(**t)
        return keys, torch.nn.functional.normalize(e, dim=-1)
    groups = {n: text_emb(d) for n, d in [('mood', MOOD), ('lead', LEAD), ('bed', BED), ('tempo', TEMPO), ('voice', VOICE)]}

    # 1. an audio embedding for EVERY song in the list (cached), so each phrase
    #    can be judged against the whole set: CLAP rates some phrases high for
    #    nearly anything ("harp" won every song on the first try), so a song
    #    gets a phrase only if it fits it MORE than the other songs do (z-score
    #    per phrase across all songs).
    emb_dir = os.path.join(CACHE, 'clap')
    os.makedirs(emb_dir, exist_ok=True)
    embs = {}
    for k, s in enumerate(songs, 1):
        sid = str(s['id'])
        f = os.path.join(emb_dir, sid + '.npy')
        if os.path.exists(f):
            embs[sid] = np.load(f); continue
        a = preview(sid)
        if a is None:
            continue
        L = 48000 * 10
        starts = [int(x) for x in np.linspace(0, max(0, len(a) - L), 3)]
        with torch.inference_mode():
            x = proc(audios=[a[st:st + L] for st in starts], sampling_rate=48000, return_tensors='pt').to(DEV)
            e = torch.nn.functional.normalize(model.get_audio_features(**x), dim=-1).mean(0)
            e = torch.nn.functional.normalize(e, dim=-1).cpu().numpy()
        np.save(f, e); embs[sid] = e
        if k % 25 == 0:
            print(f'  embedded {k}/{len(songs)}')
    # compare like with like: the songs WITHOUT lyrics against each other (next to
    # the vocal pop/rock that has lyrics, every instrumental reads "synthy hip-hop")
    pool = {str(x['id']) for x in songs if str(x['id']) not in lyr} if not args.all else set(embs)
    ids = [i for i in embs if i in pool] or list(embs)
    A = np.stack([embs[i] for i in ids])
    # The in-browser describer (lyrics-live.js) runs only CLAP's AUDIO model on
    # the phone; the phrase embeddings and each phrase's mean / spread over this
    # pool are shipped here, so its lines are judged exactly like these.
    vocab = {'model': 'Xenova/clap-htsat-unfused', 'groups': {}}
    zs = {}
    for g, (keys, te) in groups.items():
        S = A @ te.cpu().numpy().T                      # songs x phrases
        Zc = (S - S.mean(0)) / (S.std(0) + 1e-6)        # how much more than the other songs
        Zr = (S - S.mean(1, keepdims=True)) / (S.std(1, keepdims=True) + 1e-6)   # how well it fits this song at all
        Z = Zc + 0.25 * Zr                              # mostly relative: raw fit alone makes every song the same
        zs[g] = (keys, {sid: Z[r] for r, sid in enumerate(ids)})
        vocab['groups'][g] = {'keys': keys, 'emb': np.round(te.cpu().numpy(), 4).tolist(),
                              'mean': np.round(S.mean(0), 5).tolist(), 'std': np.round(S.std(0), 5).tolist()}
    json.dump(vocab, open(os.path.join(ROOT, 'quote-clap.json'), 'w', encoding='utf-8'), separators=(',', ':'))
    if args.vocab:
        print('wrote quote-clap.json'); return

    def rank(g, sid):
        keys, Z = zs[g]
        z = Z[sid]
        return [keys[i] for i in np.argsort(-z)]

    # 2. the line for each song without lyrics
    for n, s in enumerate(todo, 1):
        sid = str(s['id'])
        if sid not in embs:
            print(f"[{n}/{len(todo)}] {s['artist']} - {s['title']}: no preview"); continue
        mood, lead, bed, tempo, voice = (rank(g, sid) for g in ('mood', 'lead', 'bed', 'tempo', 'voice'))
        line = f'{mood[0].capitalize()} {lead[0]}'
        line += f' over {bed[0]}' if bed[0] else ', no drums'
        line += f' · {tempo[0]}'
        out[sid] = {'a': s['artist'], 't': s['title'], 'k': voice[0], 'd': line}
        print(f"[{n}/{len(todo)}] {s['artist']} - {s['title']}")
        print(f"    {voice[0].upper()} · {line}")
    json.dump(out, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print(f'{len(out)} songs described in quote-desc.json')


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    main()
