/* ============================================================
   SESSION RECORDER — user testing (csharpuser, 2026-09-25).
   Eric: "copy the exact movement through the app as they use it … it asks
   'hey what's your name', then logs whatever their activity is under that
   name … saves as use case #X so we can look at it later".

   HOW: rrweb records the DOM — a snapshot, then every change, tap, scroll
   and input with timestamps — so a session replays exactly as the tester
   saw it, with real timing, and it is JSON, not video. Beside it a small
   SEMANTIC LOG (screen entered, what was tapped, what was typed) for
   reading a session at a glance and for counting across many.

   WHERE: a Supabase Storage bucket. The site carries only the project's
   PUBLIC (anon) key, which is designed to be public, and the bucket's one
   rule lets that key ADD files and nothing else — no listing, no reading.
   Recordings go up as gzipped chunks, <session id>/0001.json.gz, 0002…,
   every few seconds and on the way out of the page. Reading them is
   sessions.html with the project's private key, which never leaves Eric's
   own browser. No personal account of Eric's is involved.

   Runs on the desktop viewer and on phones, in testing mode only
   (`?tools` and `?norec` both switch it off). Not configured (empty
   REC_CFG) → it does nothing at all, quietly.
   ============================================================ */

const REC_CFG = {
  url: 'https://msxbtpnpioqtypkfyzhm.supabase.co',              // the Supabase project URL (project ref + .supabase.co)
  anonKey: 'sb_publishable_jPR6r7DVZTNMv_KPesf8uw_urETvpwt',   // the project's PUBLIC (publishable) key — designed to ship on the site
  bucket: 'sessions', // the storage bucket (created by tools/supabase-setup.sql)
};

(function () {
  if (/[?&](tools|norec)\b/.test(location.search)) return;
  if (!REC_CFG.url || !REC_CFG.anonKey) { console.info('[rec] not configured — no recording'); return; }

  const NAME_KEY = 'spindeck-tester';
  const FLUSH_MS = 8000, FLUSH_RAW = 150000, KEEPALIVE_MAX = 60000;
  const LIBS = [
    'https://cdn.jsdelivr.net/npm/rrweb@1.1.3/dist/rrweb.min.js',
    'https://cdn.jsdelivr.net/npm/fflate@0.8.2/umd/index.js',
  ];

  const S = { sid: '', startedAt: 0, seq: 0, events: [], log: [], raw: 0, timer: 0, dead: false, fails: 0, meta: null, stop: null };
  const loadScript = src => new Promise((ok, no) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = no; document.head.appendChild(s); });

  /* ── Upload ──────────────────────────────────────────────── */
  function put(path, bytes, keepalive) {
    return fetch(`${REC_CFG.url.replace(/\/$/, '')}/storage/v1/object/${REC_CFG.bucket}/${path}`, {
      method: 'POST', keepalive: !!keepalive,
      headers: {
        apikey: REC_CFG.anonKey, Authorization: 'Bearer ' + REC_CFG.anonKey,
        'Content-Type': 'application/octet-stream', 'x-upsert': 'false',
      },
      body: bytes,
    }).then(r => { if (!r.ok) throw new Error('upload ' + r.status); });
  }
  let chain = Promise.resolve();
  function upload(path, bytes, final) {
    const fail = e => { console.warn('[rec] upload failed', e); if (++S.fails >= 4) S.dead = true; };
    // On the way out of the page there is no time to queue: a keepalive
    // request is one the browser finishes after the page has gone.
    if (final && bytes.length < KEEPALIVE_MAX) { put(path, bytes, true).catch(fail); return; }
    chain = chain.then(() => put(path, bytes, false)).catch(fail);
  }

  /* ── The chunks ──────────────────────────────────────────── */
  function flush(final) {
    if (S.dead || !S.sid || (!S.events.length && !S.log.length)) return;
    const seq = ++S.seq;
    const body = { sid: S.sid, seq, at: Date.now(), events: S.events, log: S.log };
    if (seq === 1) body.meta = S.meta;
    S.events = []; S.log = []; S.raw = 0;
    let gz;
    try { gz = fflate.gzipSync(fflate.strToU8(JSON.stringify(body)), { level: 6 }); } catch (e) { console.warn('[rec] gzip', e); return; }
    upload(`${S.sid}/${String(seq).padStart(4, '0')}.json.gz`, gz, final);
  }

  /* ── The semantic log ────────────────────────────────────── */
  function log(k, v, extra) { S.log.push(Object.assign({ t: Date.now() - S.startedAt, k, v }, extra || {})); }
  function screenState() {
    let v = '?';
    try { if (typeof SCREENS !== 'undefined' && typeof currentIdx !== 'undefined' && SCREENS[currentIdx]) v = SCREENS[currentIdx].id; } catch (e) {}
    const shell = document.querySelector('#phone-container .s-home-v3, #mobile-content .s-home-v3');
    if (shell) {
      const c = shell.classList;
      if (c.contains('s-home-v3--artist')) v += '/artist';
      else if (c.contains('s-home-v3--album')) v += '/album';
      if (c.contains('s-home-v3--rvp')) v += '/review';
      if (c.contains('s-home-v3--mixing')) v += '+mix';
      if (c.contains('s-home-v3--console')) v += '+console';
    }
    try { if (v.indexOf('onboarding') === 0 && typeof OB !== 'undefined') v += '/step' + OB.step; } catch (e) {}
    const search = document.getElementById('sd-search'); if (search && search.classList.contains('open')) v += '+search';
    if (document.querySelector('.v3-rsh-ov')) v += '+reviewsheet';
    const lg = document.getElementById('sd-log'); if (lg && lg.classList.contains('open')) v += '+logsheet';
    if (document.querySelector('#sd-share.open, .sd-share-overlay.open')) v += '+share';
    return v;
  }
  function labelOf(el) {
    const t = el.closest('button, a, [onclick], [role="button"], label, input, textarea, select, .v3-fb-card, .wall2-cell, .v3-nav-item') || el;
    const lbl = t.getAttribute('aria-label') || t.getAttribute('title') || t.getAttribute('placeholder')
      || (t.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40)
      || [...t.classList].slice(0, 2).join('.') || t.tagName.toLowerCase();
    const sel = t.id ? '#' + t.id : (t.className && typeof t.className === 'string' ? '.' + t.className.trim().split(/\s+/).slice(0, 2).join('.') : t.tagName.toLowerCase());
    return { lbl, sel };
  }
  const inputTimers = new WeakMap();
  function wireLog() {
    let last = '';
    setInterval(() => { const v = screenState(); if (v !== last) { last = v; log('screen', v); } }, 250);
    document.addEventListener('click', e => {
      if (!(e.target instanceof Element)) return;
      if (e.target.closest('#sd-rec-prompt')) return;
      const { lbl, sel } = labelOf(e.target);
      log('tap', lbl, { sel, x: Math.round(e.clientX), y: Math.round(e.clientY) });
    }, true);
    document.addEventListener('input', e => {
      const el = e.target; if (!(el instanceof Element) || el.closest('#sd-rec-prompt')) return;
      clearTimeout(inputTimers.get(el));
      inputTimers.set(el, setTimeout(() => {
        const { lbl } = labelOf(el);
        log('input', lbl, { val: String(el.value || '').slice(0, 160) });
      }, 600));
    }, true);
  }

  /* ── Start ───────────────────────────────────────────────── */
  function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 24) || 'tester'; }
  function begin(name) {
    S.startedAt = Date.now();
    const ts = new Date(S.startedAt).toISOString().replace(/[:.]/g, '-').slice(0, 19);
    S.sid = `${ts}_${slug(name)}_${Math.random().toString(36).slice(2, 6)}`;
    S.meta = {
      name, sid: S.sid, startedAt: new Date(S.startedAt).toISOString(),
      ua: navigator.userAgent, w: innerWidth, h: innerHeight, dpr: devicePixelRatio || 1,
      mobile: matchMedia('(max-width: 767px)').matches, href: location.href,
      build: (window.PATCH_NOTES && PATCH_NOTES[0]) ? PATCH_NOTES[0].date : '',
      persona: window.ACTIVE_PERSONA || '',
    };
    log('screen', screenState());
    S.stop = rrweb.record({
      emit(ev) {
        S.events.push(ev);
        S.raw += ev.type === 2 ? JSON.stringify(ev).length : 120;   // the full snapshot is the one big event
        if (S.raw > FLUSH_RAW) flush(false);
      },
      sampling: { mousemove: 60, mouseInteraction: true, scroll: 150, media: 800, input: 'last' },
      blockSelector: '#devbox, #petbox, #roadmap, #recbox, #page-nav, .tb-dev, #sd-rec-prompt',
      slimDOMOptions: { script: true, comment: true, headFavicon: true, headWhitespace: true, headMetaDescKeywords: true, headMetaSocial: true, headMetaRobots: true, headMetaHttpEquiv: true, headMetaAuthorship: true, headMetaVerification: true },
      inlineStylesheet: true, recordCanvas: false, collectFonts: false,
    });
    wireLog();
    S.timer = setInterval(() => flush(false), FLUSH_MS);
    const bye = () => flush(true);
    addEventListener('pagehide', bye);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') bye(); });
    console.info('[rec] recording as', name, S.sid);
  }

  /* ── The name prompt ─────────────────────────────────────── */
  function ask() {
    const ov = document.createElement('div');
    ov.id = 'sd-rec-prompt'; ov.className = 'rec-prompt';
    ov.innerHTML = `
      <form class="rec-card">
        <div class="rec-title">Before you start</div>
        <label class="rec-lbl" for="rec-name">What's your name?</label>
        <input class="rec-input" id="rec-name" type="text" autocomplete="name" maxlength="40" placeholder="Your name" required>
        <p class="rec-note">Your taps and the screens you visit are recorded (no camera, no mic) so we can see how the app gets used and improve it. By pressing Start you approve of this recording.</p>
        <button class="rec-go" type="submit">Start</button>
      </form>`;
    document.body.appendChild(ov);
    const inp = ov.querySelector('input');
    setTimeout(() => inp.focus(), 60);
    ov.querySelector('form').addEventListener('submit', e => {
      e.preventDefault();
      const name = inp.value.trim(); if (!name) { inp.focus(); return; }
      try { localStorage.setItem(NAME_KEY, name); } catch (err) {}
      ov.remove();
      begin(name);
    });
  }

  function init() {
    let name = '';
    try { name = localStorage.getItem(NAME_KEY) || ''; } catch (e) {}
    if (name) begin(name); else ask();
    holdToAskAgain();
  }
  /* Hold the corner "sessions" link for three seconds (Eric, 2026-09-26) and
     the site forgets the name and reloads — the prompt comes back and the
     next session files under whatever is typed. A plain click still opens
     the sessions page. */
  function holdToAskAgain() {
    const link = document.querySelector('.sd-sessions-link');
    if (!link) return;
    let t = 0;
    const start = () => { clearTimeout(t); t = setTimeout(() => { try { localStorage.removeItem(NAME_KEY); } catch (e) {} flush(true); location.reload(); }, 3000); link.classList.add('is-holding'); };
    const stop = () => { clearTimeout(t); link.classList.remove('is-holding'); };
    link.addEventListener('pointerdown', start);
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => link.addEventListener(ev, stop));
    link.addEventListener('contextmenu', e => e.preventDefault());
  }
  const ready = () => Promise.all(LIBS.map(loadScript)).then(init, e => console.warn('[rec] libraries failed to load', e));
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(ready, 0));
  else setTimeout(ready, 0);
})();
