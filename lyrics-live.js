/* ══════════════════════════════════════════════════════════════════════════
   LIVE LYRICS — the Comments page's karaoke for songs nobody prepared (2026-11-06)
   ══════════════════════════════════════════════════════════════════════════
   Eric: "if u don't have it can we make it happen in real time … download it
   on loading the app … a loading bar if it's taking too long … audio
   transcription like YouTube where it guesses … and the interpretation on the
   instrumental as well".

   quote-lyrics.json / quote-desc.json (made on Eric's desktop by tools/) cover
   the songs the scripts saw. Every OTHER song is worked out here, on the
   phone, in a background worker, with two small models fetched the first time
   the Comments page opens (~75 MB, then the browser keeps them):
     · Whisper tiny (onnx-community/whisper-tiny_timestamped, q8, ~41 MB) —
       hears the preview's words, each with a time.
     · CLAP's AUDIO half (Xenova/clap-htsat-unfused, q8, ~34 MB) — a sound
       fingerprint. Its TEXT half (127 MB) is never downloaded: the phrase
       vocabulary was embedded on the desktop and ships as quote-clap.json
       (tools/quote_describe.py --vocab), with each phrase's mean / spread over
       the no-lyric songs, so a line made here reads like the prepared ones.

   For a song, in order:
     1. LRCLIB has SYNCED lyrics → slide Whisper's words along them to find where
        the 30s clip starts (the desktop script's alignment, ported) → karaoke.
     2. Words were heard but there are no lyrics → YouTube-style CAPTIONS: what
        Whisper heard, grouped into lines, flagged `heard` (the page labels them).
     3. No usable words (instrumental, mumbled, Whisper's music hallucinations
        like "Thank you.") → CLAP's interpretive line: kicker + "Mood lead over bed".
   Results are cached in memory and localStorage (LS_KEY), so a song is worked
   out once per device. Jobs run one at a time; the page asks for the NEXT song
   while the current one plays, so it's usually ready on the swipe.

   window.sdLive = { start(), ready, state, analyze(item) → Promise<entry|null> }
   An entry is quote-lyrics.json's shape ({ l: [[t, e, [[word, t]…]]…] }, plus
   `heard: true` for captions) or { k, d } for a description. */
(function () {
  'use strict';

  const TJS = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.6/dist/transformers.min.js';
  const ASR = 'onnx-community/whisper-tiny_timestamped';
  const CLAP = 'Xenova/clap-htsat-unfused';
  const LS_KEY = 'sd-live-lyrics-v1', LS_MAX = 80;
  const BAR_AFTER = 1200;                    // show the boot bar only if it's taking a while
  /* LITE on phones (round 15, Eric 11-06: "after like 2 songs the app crashes").
     Whisper + CLAP in a wasm worker is ~75 MB of download and several hundred MB
     of memory once both run, and iOS Safari kills the tab for it a couple of
     songs in. A touch phone gets the part that needs no model: LRCLIB's synced
     lyrics from the usual start, no Whisper refine, no captions / CLAP line
     (a song with no synced lyrics says "No lyrics"). No download, so no bar. */
  const LITE = !!(window.matchMedia && matchMedia('(pointer: coarse)').matches);

  const WORKER_SRC = `
import { pipeline, AutoProcessor, ClapAudioModelWithProjection, env } from '${TJS}';
env.allowLocalModels = false;
let asr = null, proc = null, clap = null;
const files = {};
function report(p) {
  if (!p || !p.file) return;
  if (p.status === 'progress' && p.total) files[p.file] = [p.loaded, p.total];
  else if (p.status === 'done' && files[p.file]) files[p.file][0] = files[p.file][1];
  let l = 0, t = 0;
  for (const k in files) { l += files[k][0]; t += files[k][1]; }
  postMessage({ type: 'progress', loaded: l, total: t });
}
async function load() {
  asr = await pipeline('automatic-speech-recognition', '${ASR}', { dtype: 'q8', device: 'wasm', progress_callback: report });
  proc = await AutoProcessor.from_pretrained('${CLAP}', { progress_callback: report });
  clap = await ClapAudioModelWithProjection.from_pretrained('${CLAP}', { dtype: 'q8', progress_callback: report });
}
self.onmessage = async e => {
  const m = e.data;
  try {
    if (m.type === 'load') { if (!asr) await load(); postMessage({ type: 'ready' }); return; }
    if (m.type === 'words') {
      const out = await asr(m.audio, { return_timestamps: 'word', chunk_length_s: 30 });
      postMessage({ type: 'words', id: m.id, chunks: out.chunks || [] });
    }
    if (m.type === 'embed') {
      const W = 480000, a = m.audio;
      const starts = [Math.max(0, (a.length - W) >> 1)];          // one 10s slice from the middle (round 12: 3x faster)
      let sum = null;
      for (const st of starts) {
        const x = await proc(a.subarray(st, st + W));
        const out = await clap(x);
        const v = out.audio_embeds.data;
        if (!sum) sum = new Float32Array(v.length);
        let n = 0; for (let i = 0; i < v.length; i++) n += v[i] * v[i];
        n = Math.sqrt(n) || 1;
        for (let i = 0; i < v.length; i++) sum[i] += v[i] / n;
      }
      postMessage({ type: 'embed', id: m.id, emb: sum });
    }
  } catch (err) { postMessage({ type: 'error', id: m.id, msg: String((err && err.message) || err) }); }
};`;

  const S = {
    worker: null, state: 'idle', ready: null, readyRes: null, loaded: 0, total: 0,
    waits: new Map(), seq: 0, queue: Promise.resolve(), mem: new Map(), vocab: null, bar: null, barT: 0,
  };
  const lsRead = () => { try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; } catch (e) { return {}; } };
  function lsPut(id, entry) {
    try {
      const all = lsRead();
      all[id] = Object.assign({ at: Date.now() }, entry);
      Object.keys(all).sort((a, b) => all[b].at - all[a].at).slice(LS_MAX).forEach(k => { delete all[k]; });
      localStorage.setItem(LS_KEY, JSON.stringify(all));
    } catch (e) {}
  }

  /* ── the worker + the boot bar ──────────────────────────────────────────── */
  function start() {
    if (S.ready) return S.ready;
    if (LITE) { S.state = 'off'; S.ready = Promise.resolve(false); return S.ready; }
    S.t0 = Date.now();
    S.ready = new Promise(res => { S.readyRes = res; });
    try {
      const url = URL.createObjectURL(new Blob([WORKER_SRC], { type: 'text/javascript' }));
      S.worker = new Worker(url, { type: 'module' });
    } catch (e) { S.state = 'off'; S.readyRes(false); return S.ready; }
    S.state = 'loading';
    S.worker.onmessage = e => {
      const m = e.data;
      if (m.type === 'progress') { S.loaded = m.loaded; S.total = m.total; paintBar(); return; }
      if (m.type === 'ready') { S.state = 'ready'; hideBar(); S.readyRes(true); return; }
      const w = S.waits.get(m.id);
      if (!w) { if (m.type === 'error' && S.state === 'loading') { S.state = 'off'; hideBar(); S.readyRes(false); } return; }
      S.waits.delete(m.id);
      m.type === 'error' ? w.rej(new Error(m.msg)) : w.res(m);
    };
    S.worker.onerror = () => { S.state = 'off'; hideBar(); S.readyRes(false); };
    S.worker.postMessage({ type: 'load' });
    S.barT = setTimeout(() => { if (S.state === 'loading') paintBar(); }, BAR_AFTER);
    return S.ready;
  }
  function ask(type, audio) {
    const id = ++S.seq;
    return new Promise((res, rej) => {
      S.waits.set(id, { res, rej });
      S.worker.postMessage({ type, id, audio }, [audio.buffer]);
    });
  }
  /* The bar shows ONCE (round 15, Eric: "it should show once when u turn the
     mode on and that's it"): only on the Comments page, and only until the
     first song starts or the page closes (quotes.js calls sdLive.doneBar()).
     After that it never comes back, even if the download is still going. */
  function paintBar() {
    if (S.barDone || S.state !== 'loading' || Date.now() - S.t0 < BAR_AFTER) return;
    const qs = [...document.querySelectorAll('.qs-root')].find(e => e.getBoundingClientRect().width);
    const scr = qs && qs.closest('.app-screen');
    if (!scr) return;
    if (!S.bar || !scr.contains(S.bar)) {
      if (S.bar) S.bar.remove();
      S.bar = document.createElement('div');
      S.bar.className = 'sd-live-bar';
      S.bar.innerHTML = '<span>Getting live lyrics ready</span><i><b></b></i>';
      scr.appendChild(S.bar);
    }
    const p = S.total ? Math.min(1, S.loaded / S.total) : 0;
    S.bar.querySelector('b').style.width = (p * 100).toFixed(1) + '%';
    S.bar.querySelector('span').textContent = 'Getting live lyrics ready · ' + Math.round(p * 100) + '%';
  }
  function hideBar() {
    S.barDone = true;
    clearTimeout(S.barT);
    const b = S.bar; S.bar = null;
    if (b) { b.classList.add('done'); setTimeout(() => b.remove(), 400); }
  }

  /* ── audio: the preview, decoded and resampled (16k for Whisper, 48k for CLAP) ── */
  async function decode(url) {
    const buf = await fetch(url).then(r => { if (!r.ok) throw new Error('preview'); return r.arrayBuffer(); });
    const AC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    const src = await new AC(1, 1, 44100).decodeAudioData(buf);
    const at = async sr => {
      const ctx = new AC(1, Math.ceil(src.duration * sr), sr);
      const node = ctx.createBufferSource();
      node.buffer = src; node.connect(ctx.destination); node.start();
      return (await ctx.startRendering()).getChannelData(0).slice();
    };
    return { a16: await at(16000), a48: await at(48000), len: src.duration };
  }

  /* ── LRCLIB ─────────────────────────────────────────────────────────────── */
  async function lrclib(artist, title, album, dur) {
    const q = o => Object.entries(o).map(([k, v]) => k + '=' + encodeURIComponent(v)).join('&');
    const j = u => fetch(u).then(r => r.ok ? r.json() : null).catch(() => null);
    const hit = await j('https://lrclib.net/api/get?' + q({ artist_name: artist, track_name: title, album_name: album || '', duration: Math.round(dur || 0) }));
    if (hit && hit.syncedLyrics) return hit;
    const clean = title.replace(/\s*[([].*?[)\]]/g, '').trim() || title;
    const hits = ((await j('https://lrclib.net/api/search?' + q({ track_name: clean, artist_name: artist }))) || []).filter(h => h.syncedLyrics);
    hits.sort((a, b) => Math.abs((a.duration || 0) - dur) - Math.abs((b.duration || 0) - dur));
    return hits[0] && (!dur || Math.abs((hits[0].duration || 0) - dur) <= 10) ? hits[0] : null;
  }
  function parseLrc(text) {
    const out = [];
    String(text).split('\n').forEach(raw => {
      const tags = [...raw.matchAll(/\[(\d+):(\d+(?:\.\d+)?)\]/g)];
      const words = raw.replace(/\[(\d+):(\d+(?:\.\d+)?)\]/g, '').trim();
      tags.forEach(m => out.push([+m[1] * 60 + +m[2], words]));
    });
    return out.sort((a, b) => a[0] - b[0]);
  }
  const norm = w => String(w).normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');

  /* ── 1. align heard words with synced lyrics (tools/quote_lyrics.py, ported) ── */
  function align(lines, W, clipLen, songLen) {
    const starts = lines.map(l => l[0]);
    const sets = lines.map(l => new Set(l[1].split(/\s+/).map(norm).filter(Boolean)));
    const mids = W.map(w => [w.n, (w.s + w.e) / 2]);
    const idxAt = T => { let lo = 0, hi = starts.length; while (lo < hi) { const m = (lo + hi) >> 1; if (starts[m] <= T) lo = m + 1; else hi = m; } return lo - 1; };
    const score = o => {
      let m = 0;
      for (const [n, mid] of mids) {
        const T = o + mid, i = idxAt(T);
        if (i >= 0 && sets[i].has(n)) m += 1;
        else if (i + 1 < lines.length && sets[i + 1].has(n) && starts[i + 1] - T < 0.8) m += 0.6;
        else if (i >= 1 && sets[i - 1].has(n) && T - starts[i] < 0.8) m += 0.6;
      }
      return m;
    };
    const top = Math.max(songLen - clipLen + 1, 1);
    let best = -1, run = [], runs = [];
    for (let k = 0; k <= top * 10; k++) {
      const o = k / 10, s = score(o);
      if (s > best + 1e-9) { best = s; runs = []; run = [o]; }
      else if (Math.abs(s - best) < 1e-9) { if (run.length && Math.abs(run[run.length - 1] - (o - 0.1)) < 1e-6) run.push(o); else { if (run.length) runs.push(run); run = [o]; } }
      else if (run.length) { runs.push(run); run = []; }
    }
    if (run.length) runs.push(run);
    const longest = runs.sort((a, b) => b.length - a.length)[0] || [0];
    return { o: longest[longest.length >> 1], best };
  }
  function wordTimes(tokens, W, s, e, from) {
    const times = tokens.map(() => null);
    let j = from;
    tokens.forEach((tok, k) => {
      const n = norm(tok);
      if (!n) return;
      for (let q = j; q < W.length; q++) {
        if (W[q].s > e + 0.5) break;
        if (W[q].n === n && W[q].s >= s - 0.8) { times[k] = W[q].s; j = q + 1; break; }
      }
    });
    const anchors = times.map((t, k) => [k, t]).filter(x => x[1] != null);
    const wt = tokens.map(t => Math.max(1, t.length));
    const spread = (i0, t0, i1, t1) => {
      const tot = wt.slice(i0, i1).reduce((a, b) => a + b, 0) || 1;
      let acc = 0;
      for (let k = i0 + 1; k < i1; k++) { acc += wt[k - 1]; times[k] = t0 + (t1 - t0) * acc / tot; }
    };
    if (!anchors.length) { times[0] = s; spread(0, s, tokens.length, s + Math.min(e - s, 0.32 * tokens.length + 0.4)); }
    else {
      const [k0, t0] = anchors[0];
      if (k0 > 0) { const lead = Math.max(s, t0 - 0.3 * k0); times[0] = lead; spread(0, lead, k0, t0); }
      for (let a = 0; a + 1 < anchors.length; a++) spread(anchors[a][0], anchors[a][1], anchors[a + 1][0], anchors[a + 1][1]);
      const [kl, tl] = anchors[anchors.length - 1];
      if (kl < tokens.length - 1) { const tail = Math.min(e, tl + 0.32 * (tokens.length - 1 - kl) + 0.3); spread(kl, tl, tokens.length, tail); if (times[tokens.length - 1] == null) times[tokens.length - 1] = tail; }
    }
    for (let k = 0; k < times.length; k++) {
      if (times[k] == null) times[k] = k ? times[k - 1] : s;
      if (k && times[k] < times[k - 1]) times[k] = times[k - 1];
    }
    return { times, j };
  }
  function buildLines(lines, W, o, clipLen) {
    const out = [];
    let j = 0;
    lines.forEach(([t, txt], i) => {
      if (!txt) return;
      const nxt = i + 1 < lines.length ? lines[i + 1][0] : t + 6;
      const s = t - o, e = Math.min(nxt, t + 9) - o;
      if (e < 0.2 || s > clipLen - 0.3) return;
      const tokens = txt.split(/\s+/).filter(Boolean);
      const r = wordTimes(tokens, W, s, e, j); j = r.j;
      out.push([+Math.max(s, r.times[0] - 0.05).toFixed(2), +e.toFixed(2), tokens.map((tok, k) => [tok, +r.times[k].toFixed(2)])]);
    });
    return out;
  }

  /* ── 2. captions from heard words ───────────────────────────────────────── */
  // What Whisper says over music with no words in it (YouTube's "[Music]").
  const HALLU = /^(thank you|thanks for watching|you|bye|music|subtitles by.*|please subscribe.*|so|oh|uh|um)[.!]*$/i;
  function usable(W, chunks) {
    const text = chunks.map(c => c.text).join(' ').trim();
    if (!text || /♪|\[(music|instrumental)[^\]]*\]/i.test(text) && W.length < 10) return false;
    const real = W.filter(w => w.n.length > 1);
    if (real.length < 6) return false;
    if (HALLU.test(text)) return false;
    const distinct = new Set(real.map(w => w.n)).size;
    return distinct >= 4;                            // "la la la la" or one word looped is not a caption
  }
  function captions(W) {
    const lines = [];
    let cur = [];
    W.forEach((w, k) => {
      const prev = W[k - 1];
      const chars = cur.reduce((a, x) => a + x.w.length + 1, 0);
      if (cur.length && (w.s - prev.e > 0.7 || cur.length >= 7 || chars > 38)) { lines.push(cur); cur = []; }
      cur.push(w);
    });
    if (cur.length) lines.push(cur);
    return lines.map(ws => [+Math.max(0, ws[0].s - 0.05).toFixed(2), +(ws[ws.length - 1].e + 0.4).toFixed(2), ws.map(w => [w.w, +w.s.toFixed(2)])]);
  }

  /* ── 3. the interpretive line (tools/quote_describe.py's scoring) ───────── */
  async function vocab() {
    if (!S.vocab) S.vocab = fetch('quote-clap.json').then(r => r.json()).catch(() => null);
    return S.vocab;
  }
  function describeFrom(emb, V) {
    let n = 0; for (let i = 0; i < emb.length; i++) n += emb[i] * emb[i];
    n = Math.sqrt(n) || 1;
    const top = g => {
      const G = V.groups[g];
      const sims = G.emb.map(t => { let d = 0; for (let i = 0; i < t.length; i++) d += t[i] * emb[i]; return d / n; });
      const mu = sims.reduce((a, b) => a + b, 0) / sims.length;
      const sd = Math.sqrt(sims.reduce((a, b) => a + (b - mu) ** 2, 0) / sims.length) || 1;
      let bi = 0, bz = -1e9;
      sims.forEach((s, i) => { const z = (s - G.mean[i]) / (G.std[i] || 1) + 0.25 * (s - mu) / sd; if (z > bz) { bz = z; bi = i; } });
      return G.keys[bi];
    };
    const mood = top('mood'), lead = top('lead'), bed = top('bed'), tempo = top('tempo'), voice = top('voice');
    return { k: voice, d: `${mood.charAt(0).toUpperCase() + mood.slice(1)} ${lead}${bed ? ' over ' + bed : ', no drums'} · ${tempo}` };
  }

  /* ── one song ───────────────────────────────────────────────────────────── */
  /* ── round 12: FAST FIRST, LISTEN LATER ──────────────────────────────────
     Eric: "it's working now … but it's slow". Every song used to wait for the
     whole listening pass (decode, Whisper over 30s, CLAP) before showing
     anything. Now:
       · a song with LRCLIB synced lyrics shows AT ONCE, started at the usual
         spot (0:48, else 0:30 / 0:00 for a short song) — no audio work at all —
         and Whisper listens afterwards as a low-priority REFINE that swaps in
         an exact (or better-picked) timing if it finds one (sdLive.onUpdate);
       · songs with no lyrics (captions / description) still need to listen,
         and their jobs jump ahead of any refines;
       · CLAP looks at one slice, not three.
     Worker jobs run one at a time, highest priority first. */
  const JOBS = [];
  let busy = false;
  function job(pri, fn) {
    return new Promise(res => { JOBS.push({ pri, fn, res }); JOBS.sort((x, y) => y.pri - x.pri); pump(); });
  }
  async function pump() {
    if (busy || !JOBS.length) return;
    busy = true;
    const j = JOBS.shift();
    let r = null;
    try { r = await j.fn(); } catch (e) { r = null; }
    j.res(r);
    busy = false;
    pump();
  }
  async function previewOf(it) {
    const list = typeof window.sdDzTracks === 'function' ? await window.sdDzTracks(it.a).catch(() => null) : null;
    const t = (list || []).find(x => x.id === it.t.id && x.preview) || it.t;
    return t.preview || null;
  }
  // decode + Whisper: the heard words with their times
  async function listen(it) {
    if (!(await start())) return null;
    const url = await previewOf(it);
    if (!url) return null;
    const { a16, a48, len } = await decode(url);
    const heard = await ask('words', a16);
    const chunks = heard.chunks || [];
    const W = chunks.map(c => {
      const ts = c.timestamp || [];
      const s = +ts[0] || 0, e = ts[1] != null ? +ts[1] : s + 0.3;
      return { w: String(c.text || '').trim(), n: norm(c.text || ''), s, e };
    }).filter(w => w.n);
    S.last = { id: it.t.id, title: it.t.title, heard: W.length, text: chunks.map(c => c.text).join(' ').slice(0, 160) };
    return { W, chunks, a48, len };
  }
  const CLIP = 30;                                          // Deezer previews are 30s
  const USUAL = [48.2, 30.3, 0.2];
  function synced(lrc, it) {
    const L = parseLrc(lrc.syncedLyrics);
    const songLen = Math.max(it.t.dur || lrc.duration || 0, L.length ? L[L.length - 1][0] + 5 : 0);
    return { L, songLen, cands: USUAL.filter(o => o + CLIP <= songLen + 1) };
  }
  // the low-priority refine: listen, and swap in a better timing if there is one
  function refine(it, first) {
    if (LITE) return;
    const id = String(it.t.id);
    job(1, async () => {
      const lrc = await lrclib(it.a.artist, it.t.title, it.a.album, it.t.dur);
      if (!lrc) return null;
      const x = await listen(it);
      if (!x || x.W.length < 3) return null;
      const { L, songLen, cands } = synced(lrc, it);
      let entry = null;
      const { o, best } = align(L, x.W, x.len, songLen);
      if (best >= 4 && best / x.W.length >= 0.3) entry = { o, l: buildLines(L, x.W, o, x.len), live: 1, rf: 1 };
      else {
        const sets = L.map(l => new Set(l[1].split(/\s+/).map(norm)));
        const scoreAt = at => { let m = 0; x.W.forEach(w => { const T = at + (w.s + w.e) / 2; let i = -1; for (let k = 0; k < L.length && L[k][0] <= T; k++) i = k; if (i >= 0 && sets[i].has(w.n)) m++; }); return m; };
        let pick = first.o, bestM = scoreAt(first.o);
        cands.forEach(c => { const m = scoreAt(c); if (m > bestM) { bestM = m; pick = c; } });
        if (bestM >= 2) entry = { o: pick, l: buildLines(L, x.W, pick, x.len), live: 1, approx: 1, rf: 1 };
      }
      const out = entry && entry.l.length ? entry : Object.assign({}, first, { rf: 1 });
      lsPut(id, out);
      S.mem.set(id, Promise.resolve(out));
      if (entry && typeof window.sdLive.onUpdate === 'function') window.sdLive.onUpdate(id, out);
      return out;
    });
  }
  async function work(it) {
    const lrc = await lrclib(it.a.artist, it.t.title, it.a.album, it.t.dur);
    if (lrc) {
      const { L, cands } = synced(lrc, it);
      const o = cands[0] != null ? cands[0] : 0.2;
      const l = buildLines(L, [], o, CLIP);
      if (l.length) { const first = { o, l, live: 1, approx: 1 }; refine(it, first); return first; }
    }
    // no lyrics: what can be heard, else the interpretive line (ahead of refines)
    return job(2, async () => {
      const x = await listen(it);
      if (!x) return null;
      if (usable(x.W, x.chunks)) return { l: captions(x.W), heard: 1, live: 1 };
      const V = await vocab();
      if (!V) return null;
      const em = await ask('embed', x.a48);
      return Object.assign(describeFrom(em.emb, V), { live: 1 });
    });
  }
  function analyze(it) {
    const id = String(it && it.t && it.t.id);
    if (!it || !it.t || !it.t.id) return Promise.resolve(null);
    if (S.mem.has(id)) return S.mem.get(id);
    const saved = lsRead()[id];
    if (saved) {
      const p = Promise.resolve(saved);
      S.mem.set(id, p);
      if (saved.approx && !saved.rf) refine(it, saved);      // a refine that never finished: try again
      return p;
    }
    const p = work(it).catch(() => null).then(r => { if (r && !S.mem.get(id + ':rf')) lsPut(id, r); return r; });
    S.mem.set(id, p);
    return p;
  }

  window.sdLive = { start, analyze, onUpdate: null, doneBar: hideBar, lite: LITE, get state() { return S.state; }, get last() { return S.last; } };

  /* NOT at boot (round 13, Eric: "put the install … when u open comments
     instead"): quotes.js calls sdLive.start() as the Comments page opens, and
     the bar shows on that screen if the download takes more than a moment.
     The browser keeps the models, so it's a wait only the first time. */
})();
