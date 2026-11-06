/* ══════════════════════════════════════════════════════════════════════════
   CD PLAYER — the Trending page's fourth view (2026-11-06)
   ══════════════════════════════════════════════════════════════════════════
   Eric: "a digital cd player … made with our logo in mind in the upper left
   corner and a ring of albums that are cds circle the cd player and scrolling
   gives u an infinite scroll of albums to choose from, and dragging one in lets
   u play and u can drag the cd out to not play and once u drag a cd in at the
   bottom it shows the album and songs info and plays the previews, similar ui
   to our swipe page … for the songs".

   THE PLAYER IS THE LOGO. The belt-drive mark (SD_INTRO_BELT + the record,
   its centre circle and the motor, app.js's intro) drawn as a deck: the CD
   sits on the record, the motor pulley turns and the belt RUNS (a dash
   pattern sliding along it) while a preview plays — the record turning at
   the belt ratio (~5× slower than the motor). Paused / empty: all still.

   THE RING: CDs on a circle round the record's centre. Only the lower-right
   arc is on screen (the deck is in the corner), so the ring reads as a wheel
   coming out of the corner. It is INFINITE: slot i holds album i mod n of the
   shelf (most reviewed first, like Swipe's base), and `pos` is a continuous
   slot position. Wheel / trackpad turns it; a finger drag on the ring turns
   it by ANGLE round the centre, so the CD under the finger stays under it;
   it carries momentum and settles on a slot.

   DRAG IN / DRAG OUT: a drag that starts on a ring CD and heads along the
   radius (toward or away from the deck) LIFTS the CD instead of turning the
   ring; dropped on the deck it flies onto the record and plays. A tap does
   the same (desktop / quick). The CD on the deck can be dragged off — let go
   outside the deck and it ejects: the music stops and the panel empties. A
   tap on the deck's CD pauses / resumes.

   THE PANEL (bottom) is Swipe's song list (.ds-tracks rows, Chrono · Popular,
   per-song hearts = the song:: favourite) under the album's title, score and
   a progress line, then the streaming tiles and Go to album. A finished
   preview plays the next song.

   Leans on: window.sdDzTracks (doomscroll.js), computeAlbumColors, SD_SERVICES,
   svcMarkHtml, serviceGo, openAlbumPage, openArtistPageFor, writeDraftFlag,
   logDrafts, logKey, silentClipUrl, sdHaptic, SD_INTRO_BELT, backStack. */
(function () {
  'use strict';

  const SORT_KEY = 'sd-cp-songsort';
  // Geometry (screen px). The deck is the logo's viewBox (-20 -20 1140 1005) at DECK_W wide.
  const VB = { x: -20, y: -20, w: 1140, h: 1005 };
  const REC = { cx: 480.68, cy: 479.79, r: 409.75 }, HUB = 41.85, MOT = { cx: 969.17, cy: 833.22, r: 79.7 };
  const DECK_X = 12, DECK_Y = 58, DECK_W = 200;
  const K = DECK_W / VB.w;
  const C = { x: DECK_X + (REC.cx - VB.x) * K, y: DECK_Y + (REC.cy - VB.y) * K };   // the record's centre
  const RR = REC.r * K;                                  // the record's radius
  const RING_R = 184, CD = 60;                           // the ring and its CDs
  const STEP = 22 * Math.PI / 180;                       // angle between slots
  const A0 = -40 * Math.PI / 180;                        // slot `pos` sits here (upper right)
  const PANEL_TOP = Math.round(C.y + RING_R + CD / 2 + 16);

  const P = {
    root: null, list: [], pos: 0, vel: 0, raf: 0, els: new Map(),
    album: null, tracks: null, track: -1, audio: null, gen: 0,
    sort: (() => { try { return localStorage.getItem(SORT_KEY) === 'order' ? 'order' : 'popular'; } catch (e) { return 'popular'; } })(),
    drag: null, resume: null, pending: null,
    genre: (() => { try { return localStorage.getItem('sd-cp-genre') || ''; } catch (e) { return ''; } })(), gtok: 0,
  };

  const esc = s => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const fmtN = n => n >= 1e6 ? (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M'
                  : n >= 1e4 ? Math.round(n / 1e3) + 'k'
                  : n >= 1e3 ? (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'k' : String(n || 0);
  const fmtT = s => Math.floor(s / 60) + ':' + String(Math.round(s % 60)).padStart(2, '0');
  const haptic = () => { try { if (typeof sdHaptic === 'function') sdHaptic(8); } catch (e) {} };
  const calm = () => document.documentElement.classList.contains('sd-reduce-motion');
  const mod = (a, n) => ((a % n) + n) % n;
  const urlOf = a => `url("${String(a.image).replace(/"/g, '%22')}")`;

  function shelf() {
    const seen = new Set();
    return (window.ARCHIVE || [])
      .filter(a => a && a.album && a.image)
      .filter(a => { const k = a.artist + '|' + a.album; if (seen.has(k)) return false; seen.add(k); return true; })
      .sort((x, y) => window.sdFresh ? window.sdFresh.score(y, 'cp') - window.sdFresh.score(x, 'cp')
                                     : (y.reviewCount || 0) - (x.reviewCount || 0));   // fresh order (doomscroll.js)
  }
  /* THE GENRE PICKER (round 2): lower right of the ring. One genre at a time
     (a main brings its subgenres, Swipe's rule), or All. A thin genre is topped
     up from Deezer through Swipe's per-genre cache (window.sdGenreTopUp), then
     the wall's widened matcher (wallPickedPool) if it's still thin. */
  const TREE = () => (typeof SD_GENRE_TREE !== 'undefined' ? SD_GENRE_TREE : {});
  function genreShelf(g) {
    if (!g) return shelf();
    const T = TREE();
    const terms = [g, ...(T[g] || [])].map(x => x.toLowerCase());
    const hit = shelf().filter(a => { const x = String(a.genre || '').toLowerCase(); return x && terms.some(t => x.includes(t)); });
    if (hit.length >= 4 || typeof wallPickedPool !== 'function') return hit;
    const pool = new Set(wallPickedPool([g]));
    return shelf().filter(a => pool.has(a));
  }
  const tracksOf = a => typeof window.sdDzTracks === 'function' ? window.sdDzTracks(a) : Promise.resolve(null);
  const ordered = l => P.sort === 'popular' ? l.slice().sort((x, y) => (y.rank - x.rank) || (x.n - y.n)) : l;
  const songSubj = (a, t) => ({ title: t.title, subtitle: a.album, image: a.image, isSong: true });
  const songFav = (a, t) => { try { return !!((logDrafts()[logKey(songSubj(a, t))]) || {}).fav; } catch (e) { return false; } };
  const songLikes = (a, t) => Math.max(3, Math.round((t.rank || 0) / 240)) + (songFav(a, t) ? 1 : 0);
  const HEART = '<svg viewBox="0 0 24 24"><path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 7.9 3.6 4.5 7 4.5c2 0 3.6 1.1 5 2.9 1.4-1.8 3-2.9 5-2.9 3.4 0 5.6 3.4 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2z"/></svg>';
  const CLOSE = '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  /* ── markup ─────────────────────────────────────────────────────────────── */
  function deckSvg() {
    const belt = typeof SD_INTRO_BELT !== 'undefined' ? SD_INTRO_BELT : '';
    return `
      <svg class="cp-svg" viewBox="${VB.x} ${VB.y} ${VB.w} ${VB.h}" style="left:${DECK_X}px;top:${DECK_Y}px;width:${DECK_W}px" aria-hidden="true">
        <path class="cp-belt" d="${belt}"/>
        <path class="cp-belt-run" d="${belt}"/>
        <g class="cp-motor">
          <circle class="cp-ink" cx="${MOT.cx}" cy="${MOT.cy}" r="${MOT.r}"/>
          <path class="cp-ink cp-motor-mark" d="M${MOT.cx} ${MOT.cy - MOT.r + 18}V${MOT.cy - 18}"/>
        </g>
        <circle class="cp-ink cp-plat" cx="${REC.cx}" cy="${REC.cy}" r="${REC.r}"/>
      </svg>`;
  }
  function servicesHtml() {
    const ORDER = ['spotify', 'apple', 'ytmusic', 'deezer'];
    return (typeof SD_SERVICES !== 'undefined' ? SD_SERVICES : [])
      .slice().sort((x, y) => ORDER.indexOf(x.id) - ORDER.indexOf(y.id))
      .map(sv => `<button class="ds-svc" aria-label="Listen on ${esc(sv.name)}" onclick="event.stopPropagation(); sdCpService(this, '${sv.id}')">${
        typeof svcMarkHtml === 'function' ? svcMarkHtml(sv, 'ds-svc-ico') : ''}</button>`).join('');
  }
  function shellHtml() {
    return `
      <div class="cp-bg"></div>
      <div class="cp-top">
        <button class="ds-ibtn" aria-label="Close the CD player" onclick="event.stopPropagation(); sdCpClose()">${CLOSE}</button>
        <span class="cp-credit">Previews by Deezer</span>
        <button class="cp-genre" onclick="event.stopPropagation(); sdCpGenres()">
          <svg viewBox="0 0 24 24"><path d="M4 6h16M7 12h10M10 18h4"/></svg><span>${esc(P.genre || 'All genres')}</span>
        </button>
      </div>
      <div class="cp-ring"></div>
      ${deckSvg()}
      <div class="cp-slot" style="left:${(C.x - RR).toFixed(1)}px;top:${(C.y - RR).toFixed(1)}px;width:${(RR * 2).toFixed(1)}px;height:${(RR * 2).toFixed(1)}px">
        <div class="cp-disc"></div>
        <span class="cp-hub" style="width:${(HUB * 2 * K).toFixed(1)}px;height:${(HUB * 2 * K).toFixed(1)}px"></span>
        <span class="cp-drop">Drop a CD</span>
        <span class="cp-play" aria-hidden="true"></span>
      </div>
      <div class="ds-gsheet cp-gsheet" hidden>
        <div class="ds-gscrim" onclick="event.stopPropagation(); sdCpGenresClose()"></div>
        <div class="ds-gpanel" onclick="event.stopPropagation()">
          <div class="ds-gnub" onclick="sdCpGenresClose()"></div>
          <div class="ds-ghd"><b>Genres</b></div>
          <div class="ds-glist"></div>
        </div>
      </div>
      <button class="cp-go" style="left:${DECK_X + DECK_W / 2}px;top:${Math.round(DECK_Y + DECK_W * VB.h / VB.w + 10)}px" aria-label="Go to album" onclick="event.stopPropagation(); sdCpOpen('album')">
        <svg viewBox="0 0 24 24"><rect x="2.5" y="5" width="12" height="14" rx="1.5"/><path d="M14.5 7.2a5 5 0 0 1 0 9.6"/><circle cx="8.5" cy="12" r="2.2"/></svg>
        <span class="cp-go-t">Album</span>
        <svg class="cp-go-arr" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>
      </button>
      <div class="cp-panel" style="top:${PANEL_TOP}px">
        <div class="cp-empty"><b>Pick a CD</b><span>Drag one from the ring onto the player.<br>Scroll to spin the ring.</span></div>
        <div class="cp-info" hidden>
          <div class="cp-sugg">Suggested for you · tap the CD to play</div>
          <div class="cp-head">
            <div class="cp-titles">
              <div class="cp-album"><span class="cp-link" onclick="event.stopPropagation(); sdCpOpen('album')"></span><span class="cp-year"></span></div>
              <div class="cp-artist"><span class="cp-link" onclick="event.stopPropagation(); sdCpOpen('artist')"></span></div>
            </div>
            <div class="cp-score"><b></b><span class="cp-discs"></span></div>
          </div>
          <div class="cp-prog"><i></i></div>
          <div class="ds-songs-hd"><span class="ds-songs-lbl">Songs</span><div class="ds-ssw">${
            [['order', 'Chrono'], ['popular', 'Popular']].map(([id, l]) =>
              `<button class="ds-ss${id === P.sort ? ' on' : ''}" data-s="${id}" onclick="event.stopPropagation(); sdCpSort('${id}')">${l}</button>`).join('')
          }</div></div>
          <ol class="ds-tracks"></ol>
          <div class="cp-foot">
            <div class="cp-svcs">${servicesHtml()}</div>
          </div>
        </div>
      </div>
`;
  }

  /* ── the ring ───────────────────────────────────────────────────────────── */
  function slotXY(i) {
    const a = A0 + (i - P.pos) * STEP;
    return { a, x: C.x + RING_R * Math.cos(a), y: C.y + RING_R * Math.sin(a) };
  }
  /* WHO'S ON IT (round 3): the right-hand CDs carry a small tag — the friends
     who listened (faces + count), or, when none of your friends has, whether
     it's RECOMMENDED for you (a Deezer rec, a._rec) or just POPULAR (its
     review count). Friends come from wallFriendsFor (app.js, Trending's
     Friends row: real reviewers + seeded listeners) — but that seeds at least
     one listener on EVERY album, so here an album with no real reviewer only
     counts friends about 45% of the time (seeded per album, so it never flips),
     which is what leaves room for Popular / Recommended. */
  function friendsOn(a) {
    if (typeof wallFriendsFor !== 'function') return [];
    const f = wallFriendsFor(a);
    if (f.reviewed.length) return f.listened;
    const r = typeof seedRand === 'function' ? seedRand('cpf::' + a.album + '::' + a.artist) : Math.random;
    return r() < 0.45 ? f.listened : [];
  }
  function tagHtml(a) {
    const fr = friendsOn(a);
    if (fr.length) {
      const faces = fr.slice(0, 3).map(u => `<span class="cp-tag-face" style="background-image:url('${esc(typeof feedFace === 'function' ? feedFace(u) : '')}')"></span>`).join('');
      return `<div class="cp-tag cp-tag--fr"><span class="cp-tag-faces">${faces}</span><span class="cp-tag-t">${fr.length === 1 ? esc(fr[0]) : fr.length + ' friends'}</span><span class="cp-tag-s">listened</span></div>`;
    }
    if (a._rec && !a._gfill) return `<div class="cp-tag cp-tag--rec"><b>Recommended</b><span class="cp-tag-s">for you</span></div>`;
    return `<div class="cp-tag cp-tag--pop"><b>Popular</b><span class="cp-tag-s">${fmtN(a.reviewCount || 0)} reviews</span></div>`;
  }
  /* THE SWAP (round 6). The deck's CD is never in the ring: the ring is P.list,
     and a slot can be EMPTY (null). Taking a CD from slot i puts whatever was
     on the deck into slot i - it flies out of the deck into that slot while
     the new one flies in. Ejecting a CD drops it into an empty slot in sight
     (else into a hole / the end of the ring, out of sight). Elements carry
     their album, so any change to P.list rebuilds the ring (rebuildRing). */
  function rebuildRing() { P.els.forEach(el => el.remove()); P.els.clear(); render(); }
  function startSwap(i) {
    const j = mod(i, P.list.length), old = P.album;
    P.list[j] = old || null;
    if (old) {
      P.pending = i;                                   // slot i shows a sleeve until the old CD lands in it
      const f = fly(old, CD);
      place(f, C.x, C.y, (RR * 2) / CD);
      P.root.classList.add('deck-lifted');
      void f.offsetWidth;
      const sp = slotXY(i);
      glide(f, sp.x, sp.y, 1, 420, () => { f.remove(); if (P.pending === i) P.pending = null; render(); });
    }
    rebuildRing();
  }
  function render() {
    const ring = P.root && P.root.querySelector('.cp-ring');
    if (!ring || !P.list.length) return;
    // slots from just off the top-right to past the left edge
    const lo = Math.floor(P.pos + (-95 * Math.PI / 180 - A0) / STEP), hi = Math.ceil(P.pos + (175 * Math.PI / 180 - A0) / STEP);
    const want = new Set();
    const lifted = P.drag && P.drag.kind === 'ring' && P.drag.picked ? P.drag.i : null;
    for (let i = lo; i <= hi; i++) {
      want.add(i);
      let el = P.els.get(i);
      const a = P.list[mod(i, P.list.length)];          // null = an empty sleeve (round 6)
      if (!el) {
        el = document.createElement('div');
        el.className = 'cp-cd';
        el.dataset.i = i;
        el.innerHTML = `<div class="cp-cd-disc"><span class="cp-cd-hole"></span></div>${a ? tagHtml(a) : ''}`;
        /* ⚠ Set by PROPERTY. urlOf() is url("…"), and written into a
           style="…" attribute its quotes closed the attribute — every CD
           came out blank (round 2 fix). */
        if (a) el.firstChild.style.backgroundImage = urlOf(a);
        ring.appendChild(el);
        P.els.set(i, el);
      }
      const p = slotXY(i);
      // fade at the two ends of the arc; the album on the deck leaves an empty slot
      const deg = p.a * 180 / Math.PI;
      const fade = Math.max(0, Math.min(1, (deg + 30) / 8, (170 - deg) / 30));   // gone before the top bar
      el.style.opacity = fade.toFixed(3);
      el.classList.toggle('is-out', !a || i === lifted || i === P.pending);
      el.style.transform = `translate(${(p.x - CD / 2).toFixed(1)}px, ${(p.y - CD / 2).toFixed(1)}px)`;
      el.firstChild.style.transform = `rotate(${(p.a * 1.4).toFixed(3)}rad)`;   // the disc turns; its tag stays level
      // the tag shows on the right-hand CDs only (about -35° to 45°), fading at the ends
      const tg = Math.max(0, Math.min(1, (deg + 30) / 8, (66 - deg) / 10));   // four CDs tagged (round 5)
      el.style.setProperty('--tag', tg.toFixed(3));
    }
    P.els.forEach((el, i) => { if (!want.has(i)) { el.remove(); P.els.delete(i); } });
  }
  // Momentum, then settle on the nearest slot.
  function spin() {
    cancelAnimationFrame(P.raf);
    const step = () => {
      if (!P.root || (P.drag && P.drag.mode === 'turn')) return;
      if (Math.abs(P.vel) > 0.0006) {
        P.pos += P.vel * 16; P.vel *= 0.94;
      } else {
        P.vel = 0;
        const t = Math.round(P.pos), d = t - P.pos;
        if (Math.abs(d) < 0.002) { P.pos = t; render(); return; }
        P.pos += d * 0.18;
      }
      render();
      P.raf = requestAnimationFrame(step);
    };
    P.raf = requestAnimationFrame(step);
  }

  /* ── pointer: turn the ring, lift a CD, lift the deck's CD ──────────────── */
  function local(e) {
    const r = P.root.getBoundingClientRect(), s = r.width / (P.root.offsetWidth || 1) || 1;
    return { x: (e.clientX - r.left) / s, y: (e.clientY - r.top) / s };
  }
  const onDeck = p => Math.hypot(p.x - C.x, p.y - C.y) < RR + 14;
  function fly(a, size) {
    const f = document.createElement('div');
    f.className = 'cp-fly';
    f.style.width = f.style.height = size + 'px';
    f.innerHTML = `<div class="cp-cd-disc"><span class="cp-cd-hole"></span></div>`;
    f.firstChild.style.backgroundImage = urlOf(a);
    P.root.appendChild(f);
    return f;
  }
  const place = (f, x, y, s) => { f.style.transform = `translate(${(x - f.offsetWidth / 2).toFixed(1)}px, ${(y - f.offsetHeight / 2).toFixed(1)}px) scale(${s.toFixed(3)})`; };
  // Animate a flying CD to (x, y) at scale s, then run done.
  function glide(f, x, y, s, ms, done) {
    if (calm()) ms = 1;
    f.style.transition = `transform ${ms}ms cubic-bezier(.2,.7,.2,1), opacity ${ms}ms`;
    place(f, x, y, s);
    let ran = false;
    const end = () => { if (ran) return; ran = true; done && done(); };
    f.addEventListener('transitionend', end, { once: true });
    setTimeout(end, ms + 80);
  }

  function onDown(e) {
    if (!P.root || e.button > 0) return;
    if (e.target.closest('.cp-panel, .cp-top, .ds-svc, .cp-genre, .cp-gsheet, .cp-go')) return;
    const p = local(e);
    const cdEl = e.target.closest('.cp-cd');
    // by position, not target: the ring's layer lies over the deck
    const slot = P.album && Math.hypot(p.x - C.x, p.y - C.y) < RR;
    if (cdEl && !cdEl.classList.contains('is-out')) {
      P.drag = { kind: 'ring', i: +cdEl.dataset.i, start: p, last: p, mode: null };
    } else if (slot && P.album) {
      P.drag = { kind: 'deck', start: p, last: p, mode: null };
    } else if (Math.abs(Math.hypot(p.x - C.x, p.y - C.y) - RING_R) < CD) {
      P.drag = { kind: 'ring', i: null, start: p, last: p, mode: 'turn' };
    } else return;
    P.drag.ang = Math.atan2(p.y - C.y, p.x - C.x);
    P.drag.t = performance.now();
    P.vel = 0;
    cancelAnimationFrame(P.raf);
    try { P.root.setPointerCapture(e.pointerId); } catch (err) {}
  }
  function onMove(e) {
    const D = P.drag;
    if (!D) return;
    const p = local(e);
    const dx = p.x - D.start.x, dy = p.y - D.start.y;
    if (!D.mode) {
      if (Math.hypot(dx, dy) < 8) return;
      if (D.kind === 'deck') D.mode = 'lift';
      else {
        // along the radius → lift the CD; across it → turn the ring
        const sp = slotXY(D.i), rx = sp.x - C.x, ry = sp.y - C.y, rl = Math.hypot(rx, ry) || 1;
        const radial = Math.abs((dx * rx + dy * ry) / rl) / Math.hypot(dx, dy);
        D.mode = radial > 0.62 ? 'lift' : 'turn';
      }
      if (D.mode === 'lift') liftStart(D, p);
    }
    if (D.mode === 'turn') {
      const ang = Math.atan2(p.y - C.y, p.x - C.x);
      let d = ang - D.ang;
      if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI;
      D.ang = ang;
      const now = performance.now(), dt = Math.max(1, now - D.t);
      P.pos -= d / STEP;
      P.vel = 0.7 * P.vel + 0.3 * (-d / STEP / dt);
      D.t = now;
      render();
    } else if (D.mode === 'lift' && D.fly) {
      place(D.fly, p.x, p.y, D.scale || 1);
      const ready = onDeck(p);
      P.root.classList.toggle('drop-ready', ready && D.kind === 'ring');
      P.root.classList.toggle('eject-ready', !ready && D.kind === 'deck');
    }
    D.last = p;
  }
  function liftStart(D, p) {
    haptic();
    P.root.classList.add('lifting');
    if (D.kind === 'ring') {
      D.album = P.list[mod(D.i, P.list.length)];
      D.picked = true;
      D.fly = fly(D.album, CD);
      place(D.fly, p.x, p.y, 1.08);
      D.scale = 1.08;
      render();
    } else {
      D.album = P.album;
      D.fly = fly(D.album, CD);
      place(D.fly, C.x, C.y, (RR * 2) / CD);
      P.root.classList.add('deck-lifted');
      void D.fly.offsetWidth;
      D.fly.style.transition = 'transform .18s ease';
      D.scale = 1.08;
      place(D.fly, p.x, p.y, D.scale);
      setTimeout(() => { if (D.fly) D.fly.style.transition = ''; }, 200);
    }
  }
  function onUp(e) {
    const D = P.drag;
    if (!D) return;
    P.drag = null;
    P.root.classList.remove('drop-ready', 'eject-ready', 'lifting');
    const p = D.last;
    if (!D.mode) {                                     // a tap
      if (D.kind === 'ring' && D.i != null) {
        const a = P.list[mod(D.i, P.list.length)], sp = slotXY(D.i);
        const f = fly(a, CD);
        place(f, sp.x, sp.y, 1);
        void f.offsetWidth;
        haptic();
        startSwap(D.i);
        glide(f, C.x, C.y, (RR * 2) / CD, 420, () => { f.remove(); insert(a); });
      } else if (D.kind === 'deck') window.sdCpToggle();
      return;
    }
    if (D.mode === 'turn') { spin(); return; }
    const f = D.fly;
    if (!f) return;
    if (D.kind === 'ring') {
      if (onDeck(p)) { startSwap(D.i); glide(f, C.x, C.y, (RR * 2) / CD, 300, () => { f.remove(); insert(D.album); }); }
      else {
        const sp = slotXY(D.i);
        glide(f, sp.x, sp.y, 1, 320, () => { f.remove(); render(); });
      }
      render();
    } else {
      P.root.classList.remove('deck-lifted');
      if (onDeck(p)) { glide(f, C.x, C.y, (RR * 2) / CD, 240, () => f.remove()); return; }
      // ejected: back to its place in the ring if it's in sight, else it fades out where it was let go
      const a = D.album;
      eject();
      // into the empty slot in sight nearest where it was let go; else a hole / the ring's end, out of sight
      let home = null, best = 1e9;
      P.els.forEach((el, i) => {
        if (P.list[mod(i, P.list.length)] || +el.style.opacity < 0.3) return;
        const sp = slotXY(i), d = Math.hypot(sp.x - p.x, sp.y - p.y);
        if (d < best) { best = d; home = i; }
      });
      if (home != null) {
        P.list[mod(home, P.list.length)] = a;
        P.pending = home;
        rebuildRing();
        const sp = slotXY(home);
        glide(f, sp.x, sp.y, 1, 360, () => { f.remove(); if (P.pending === home) P.pending = null; render(); });
      } else {
        const hole = P.list.indexOf(null);
        if (hole >= 0) P.list[hole] = a; else P.list.push(a);
        rebuildRing();
        f.style.opacity = '0'; glide(f, p.x, p.y + 30, 0.6, 300, () => f.remove());
      }
    }
  }
  function onWheel(e) {
    if (!P.root || e.target.closest('.ds-tracks, .cp-gsheet')) return;
    e.preventDefault();
    const d = (Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX) * (e.deltaMode === 1 ? 16 : 1);
    P.pos += d / 140;
    P.vel = 0;
    render();
    clearTimeout(P.wheelT);
    P.wheelT = setTimeout(spin, 90);                   // settle on a slot once the wheel stops
  }

  /* ── the deck ───────────────────────────────────────────────────────────── */
  function audio() {
    if (!P.audio) {
      const el = new Audio();
      el.preload = 'auto';
      el.setAttribute('playsinline', '');
      el.addEventListener('ended', nextSong);
      el.addEventListener('playing', () => P.root && P.root.classList.add('is-playing'));
      el.addEventListener('pause', () => P.root && P.root.classList.remove('is-playing'));
      P.audio = el;
    }
    return P.audio;
  }
  /* opts.play === false: a SUGGESTION (round 4) — on the deck with its songs
     listed, silent until the CD is tapped or another CD is dragged in. */
  function insert(a, opts) {
    if (!P.root || !a) return;
    const auto = !(opts && opts.play === false);
    P.album = a;
    if (window.sdFresh) window.sdFresh.seen(a);
    P.root.classList.toggle('is-suggested', !auto);
    P.root.classList.remove('deck-lifted');
    const disc = P.root.querySelector('.cp-disc');
    disc.style.backgroundImage = urlOf(a);
    P.root.classList.add('has-cd');
    if (!calm()) { disc.classList.remove('land'); void disc.offsetWidth; disc.classList.add('land'); }
    if (auto) haptic();
    render();
    tint(a);
    paintInfo(a);
    P.track = -1;
    const gen = ++P.gen;
    const ol = P.root.querySelector('.ds-tracks');
    ol.innerHTML = '<li class="ds-tr-msg">Loading songs…</li>';
    tracksOf(a).then(list => {
      if (gen !== P.gen || !P.root) return;
      P.tracks = list;
      paintTracks();
      const first = list && ordered(list).find(t => t.preview);
      if (first && auto) play(first.n);
    });
  }
  /* THE SUGGESTION on launch: one of your Deezer recommendations if the ring
     has any (not a genre fill), else one of its ten most reviewed — drawn at
     random each time the player opens. */
  function suggest() {
    const recs = P.list.filter(a => a && a._rec && !a._gfill).slice(0, 12);
    const pool = recs.length ? recs : P.list.filter(Boolean).slice(0, 10);
    return pool[Math.floor(Math.random() * pool.length)] || null;
  }
  function eject() {
    P.gen++;
    P.album = null; P.tracks = null; P.track = -1;
    if (P.audio) { P.audio.pause(); P.audio.removeAttribute('src'); }
    if (!P.root) return;
    P.root.classList.remove('has-cd', 'is-playing', 'deck-lifted', 'is-suggested');
    P.root.querySelector('.cp-disc').style.backgroundImage = '';
    P.root.querySelector('.cp-info').hidden = true;
    P.root.querySelector('.cp-empty').hidden = false;
    P.root.style.removeProperty('--cp-accent'); P.root.style.removeProperty('--ds-star');
    P.root.querySelector('.cp-bg').style.backgroundImage = '';
    haptic();
    render();
  }
  function play(n, startAt) {
    const a = P.album, list = P.tracks;
    const t = list && list[n];
    if (!a || !t || !t.preview) return;
    P.track = n;
    if (P.root) P.root.classList.remove('is-suggested');
    const el = audio();
    el.src = t.preview;
    if (startAt > 0) el.addEventListener('loadedmetadata', () => { try { el.currentTime = startAt; } catch (e) {} }, { once: true });
    el.play().catch(() => {});
    paintTrack();
  }
  function nextSong() {
    const list = P.tracks;
    if (!list) return;
    const ord = ordered(list).filter(t => t.preview);
    if (!ord.length) return;
    const at = ord.findIndex(t => t.n === P.track);
    const t = ord[(at + 1) % ord.length];
    play(t.n);
    const li = P.root && P.root.querySelector(`.ds-tr[data-n="${t.n}"]`);
    if (li) li.scrollIntoView({ block: 'nearest', behavior: calm() ? 'auto' : 'smooth' });
  }
  function tick() {
    P.tickRaf = requestAnimationFrame(tick);
    const bar = P.root && P.root.querySelector('.cp-prog i'), el = P.audio;
    if (!bar) return;
    const p = el && el.duration && P.album && P.track >= 0 ? Math.min(1, el.currentTime / el.duration) : 0;   // not the silent unlock clip
    bar.style.transform = `scaleX(${p.toFixed(4)})`;
  }

  /* ── the panel ──────────────────────────────────────────────────────────── */
  function discsHtml(r) {
    let s = '';
    for (let k = 1; k <= 5; k++) s += `<span class="hstar ${r >= k ? 'full' : r >= k - 0.5 ? 'half' : 'empty'}"></span>`;
    return s;
  }
  function paintInfo(a) {
    const R = P.root;
    R.querySelector('.cp-empty').hidden = true;
    R.querySelector('.cp-info').hidden = false;
    R.querySelector('.cp-album .cp-link').textContent = a.album;
    R.querySelector('.cp-year').textContent = a.year || '';
    R.querySelector('.cp-artist .cp-link').textContent = a.artist;
    R.querySelector('.cp-score b').textContent = (+a.rating || 0).toFixed(1);
    R.querySelector('.cp-discs').innerHTML = discsHtml(+a.rating || 0);
  }
  function paintTracks() {
    const ol = P.root && P.root.querySelector('.ds-tracks'), a = P.album, list = P.tracks;
    if (!ol || !a) return;
    if (!list || !list.some(t => t.preview)) { ol.innerHTML = '<li class="ds-tr-msg">No preview for this one</li>'; return; }
    ol.innerHTML = ordered(list).map(t => `
      <li class="ds-tr${t.preview ? '' : ' none'}" data-n="${t.n}">
        <span class="ds-tr-n">${t.pos}</span><span class="ds-tr-t">${esc(t.title)}</span>
        <button class="ds-tr-like${songFav(a, t) ? ' on' : ''}" data-n="${t.n}" aria-label="Like this song">${HEART}<span>${songLikes(a, t).toLocaleString('en-US')}</span></button>
        <span class="ds-tr-d">${fmtT(t.dur)}</span>
      </li>`).join('');
    ol.scrollTop = 0;
    paintTrack();
  }
  function paintTrack() {
    if (!P.root) return;
    P.root.querySelectorAll('.ds-tr.on').forEach(li => li.classList.remove('on'));
    const li = P.root.querySelector(`.ds-tr[data-n="${P.track}"]`);
    if (li) li.classList.add('on');
  }
  /* The screen takes the album's colour, deepened so white reads (the
     Comments page's rule), with the cover blurred faintly behind the deck. */
  function tint(a) {
    P.root.querySelector('.cp-bg').style.backgroundImage = urlOf(a);
    if (typeof computeAlbumColors !== 'function') return;
    computeAlbumColors(a.image).then(c => {
      if (!c || !P.root || P.album !== a) return;
      P.root.style.setProperty('--cp-accent', c.accent);
      P.root.style.setProperty('--ds-star', c.star || c.accent);
    });
  }

  /* ── open / close ───────────────────────────────────────────────────────── */
  window.sdCpLaunch = function (btn, resume) {
    const host = (btn && btn.closest('.app-screen')) || document.querySelector('.s-wall2');
    if (!host) return;
    window.sdCpClose();
    if (!resume && window.sdFresh) window.sdFresh.reset('cp');   // a new open deals a new order
    if (typeof window.sdDoomClose === 'function') window.sdDoomClose();
    if (typeof window.sdQuoteClose === 'function') window.sdQuoteClose();
    const el = audio();                                // unlock audio inside this tap (iOS)
    try { if (typeof silentClipUrl === 'function') { el.src = silentClipUrl(); el.play().catch(() => {}); } } catch (e) {}
    const root = document.createElement('div');
    root.className = 'cp-root';
    root.innerHTML = shellHtml();
    root.addEventListener('click', e => e.stopPropagation());
    root.addEventListener('pointerdown', onDown);
    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerup', onUp);
    root.addEventListener('pointercancel', onUp);
    root.addEventListener('wheel', onWheel, { passive: false });
    root.querySelector('.ds-tracks').addEventListener('click', onTrackClick);
    host.classList.add('ds-host');
    host.appendChild(root);
    P.root = root;
    P.list = genreShelf(P.genre);
    if (!P.list.length) { P.genre = ''; P.list = shelf(); }
    P.pos = Math.round(P.pos) || 0;
    P.els = new Map();
    render();
    cancelAnimationFrame(P.tickRaf);
    P.tickRaf = requestAnimationFrame(tick);
    if (resume && resume.album) {
      root.classList.add('cp-instant', 'open');
      P.list = P.list.filter(x => x !== resume.album); rebuildRing();
      insert(resume.album);
    } else {
      requestAnimationFrame(() => root.classList.add('open'));
      const s = suggest();
      if (s) { P.list = P.list.filter(x => x !== s); rebuildRing(); insert(s, { play: false }); }
    }
  };
  window.sdCpClose = function () {
    P.gen++;
    cancelAnimationFrame(P.raf); cancelAnimationFrame(P.tickRaf);
    if (P.audio) { P.audio.pause(); P.audio.removeAttribute('src'); }
    if (P.root) {
      const host = P.root.parentElement;
      P.root.remove();
      if (host && !host.querySelector('.ds-root, .qs-root')) host.classList.remove('ds-host');
    }
    P.root = null; P.album = null; P.tracks = null; P.drag = null;
  };
  function onTrackClick(e) {
    const like = e.target.closest('.ds-tr-like');
    const a = P.album;
    if (like && a) {
      e.stopPropagation();
      const t = (P.tracks || [])[+like.dataset.n];
      if (!t || typeof writeDraftFlag !== 'function') return;
      const on = !songFav(a, t);
      writeDraftFlag(songSubj(a, t), 'fav', on);
      like.classList.toggle('on', on);
      like.querySelector('span').textContent = songLikes(a, t).toLocaleString('en-US');
      haptic();
      return;
    }
    const li = e.target.closest('.ds-tr');
    if (!li || li.classList.contains('none')) return;
    haptic();
    play(+li.dataset.n);
  }
  window.sdCpToggle = function () {
    const el = audio();
    if (!P.album) return;
    haptic();
    if (!el.src || /^data:/.test(el.src) || P.track < 0) {
      const first = P.tracks && ordered(P.tracks).find(t => t.preview);
      if (first) play(first.n);
      return;
    }
    if (el.paused) el.play().catch(() => {}); else el.pause();
  };
  window.sdCpGenres = function () {
    const sh = P.root && P.root.querySelector('.cp-gsheet');
    if (!sh) return;
    const all = ['', ...Object.keys(TREE())];
    sh.querySelector('.ds-glist').innerHTML = all.map(g =>
      `<button class="ds-gb${g === P.genre ? ' on' : ''}" data-g="${esc(g)}" onclick="sdCpGenre(this.dataset.g)">${esc(g || 'All genres')}</button>`).join('');
    sh.hidden = false;
    requestAnimationFrame(() => sh.classList.add('open'));
    haptic();
  };
  window.sdCpGenresClose = function () {
    const sh = P.root && P.root.querySelector('.cp-gsheet');
    if (!sh || sh.hidden) return;
    sh.classList.remove('open');
    setTimeout(() => { if (!sh.classList.contains('open')) sh.hidden = true; }, 260);
  };
  window.sdCpGenre = function (g) {
    if (!P.root) return;
    window.sdCpGenresClose();
    haptic();
    const btn = P.root.querySelector('.cp-genre span');
    const tok = ++P.gtok;
    const done = () => {
      if (tok !== P.gtok || !P.root) return;
      let list = genreShelf(g);
      if (!list.length) { btn.textContent = 'Nothing yet'; setTimeout(() => { if (P.root) btn.textContent = P.genre || 'All genres'; }, 1400); return; }
      P.genre = g;
      try { localStorage.setItem('sd-cp-genre', g); } catch (e) {}
      btn.textContent = g || 'All genres';
      P.list = list.filter(x => x !== P.album);         // the deck's CD stays out of the ring
      P.pos = 0; P.vel = 0; P.pending = null;
      P.els.forEach(el => el.remove()); P.els.clear();
      render();
    };
    if (!g || genreShelf(g).length >= 15 || typeof window.sdGenreTopUp !== 'function') { done(); return; }
    btn.textContent = 'Finding ' + g + '…';
    Promise.race([window.sdGenreTopUp([g]).catch(() => {}), new Promise(r => setTimeout(r, 9000))]).then(done);
  };
  window.sdCpSort = function (id) {
    if (!P.root || id === P.sort) return;
    P.sort = id;
    try { localStorage.setItem(SORT_KEY, id); } catch (e) {}
    P.root.querySelectorAll('.ds-ss').forEach(b => b.classList.toggle('on', b.dataset.s === id));
    paintTracks();
    haptic();
  };
  window.sdCpService = function (btn, svc) {
    if (P.album && typeof serviceGo === 'function') serviceGo(btn, svc, P.album, null);
  };

  // Album / artist page; Back reopens the player with the same CD in.
  window.sdCpOpen = function (mode) {
    const a = P.album;
    if (!a || typeof openAlbumPage !== 'function') return;
    if (mode === 'artist' && typeof openArtistPageFor !== 'function') return;
    P.resume = { album: a, depth: typeof backStack !== 'undefined' ? backStack.length : 0 };
    window.sdCpClose();
    if (mode === 'artist') openArtistPageFor(a.artist); else openAlbumPage(a);
  };
  function resumeCp(st, tries) {
    const btn = [...document.querySelectorAll('.s-wall2 .cp-entry')].find(e => e.offsetParent !== null);
    if (!btn) { if ((tries || 0) < 40) setTimeout(() => resumeCp(st, (tries || 0) + 1), 60); return; }
    window.sdCpLaunch(btn, st);
  }
  const _goBack = window.goBack;
  if (typeof _goBack === 'function') {
    window.goBack = function () {
      const out = _goBack.apply(this, arguments);
      const st = P.resume;
      if (st && typeof backStack !== 'undefined' && backStack.length <= st.depth) {
        P.resume = null;
        setTimeout(() => resumeCp(st), 0);
      }
      return out;
    };
  }
  const _navTab = window.sdNavTab;
  if (typeof _navTab === 'function') window.sdNavTab = function () { P.resume = null; return _navTab.apply(this, arguments); };
  const _navigate = window.navigate;
  if (typeof _navigate === 'function') {
    window.navigate = function () { if (P.root) window.sdCpClose(); return _navigate.apply(this, arguments); };
  }
})();
