/* ══════════════════════════════════════════════════════════════════════════
   COMMENTS MODE — the Trending page's third view (2026-11-05)
   ══════════════════════════════════════════════════════════════════════════
   Eric: a review-focused swipe feed, built around SONGS. One popular comment
   per screen, written big (the reference was a red Instagram-style quote card),
   with the song's 30s Deezer preview playing under it. The CD sits in the lower
   right with the streaming icons stacked above it; the song + artist + album
   sit lower left and open the album. Each page takes its cover's colour, and
   where two pages meet the colours BLEND into each other, so the feed reads as
   one long receipt rather than a stack of cards.

   How the seams blend: every card knows its own colour (--c) and its
   neighbours' (--cp above, --cn below). Its background runs from the 50/50 mix
   of --cp and --c at its top edge, to --c through the middle, to the 50/50 mix
   of --c and --cn at its bottom edge — so the two sides of every seam are the
   same colour. Colours arrive async (computeAlbumColors), and each arrival
   repaints the card and both neighbours (paintSeams).

   Like Swipe (doomscroll.js), the CD is ONE fixed disc laid over the feed; the
   pages scroll under it and changing song spins the old disc out and the new
   one in. A finished preview scrolls to the next comment.

   The songs: the shelf's most reviewed albums, each album's most played song
   (Deezer rank) that has a preview. Tracks come from doomscroll.js's cache
   (window.sdDzTracks); the preview link is re-asked at play time because
   Deezer's links expire.

   The comments are MOCK, like every comment in the app: seeded off the song
   (seedRand), so a song always shows the same comment, handle and like count
   on any machine. Handles are CMT_CAST's (app.js), the same faces as the
   review threads. Your likes are kept on this device (LIKE_KEY).

   Leans on app.js / screens.js globals: seedRand, CMT_CAST, computeAlbumColors,
   SD_SERVICES, svcMarkHtml, serviceGo, openAlbumPage, openArtistPageFor,
   silentClipUrl, sdHaptic, backStack, goBack, navigate, sdNavTab. */
(function () {
  'use strict';

  const BATCH = 8;                          // albums asked for at a time
  const LIKE_KEY = 'sd-quote-likes', MUTE_KEY = 'sd-quote-muted';

  const Q = {
    root: null, scroller: null, albums: [], next: 0, list: [], active: -1,
    audio: null, gen: 0, obs: null, filling: null, raf: 0, fxTok: 0,
    resume: null, landing: null, used: [],
    muted: (() => { try { return localStorage.getItem('sd-quote-muted') === '1'; } catch (e) { return false; } })(),
  };

  const esc = s => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const fmtN = n => n >= 1e6 ? (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M'
                  : n >= 1e4 ? Math.round(n / 1e3) + 'k'
                  : n >= 1e3 ? (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'k' : String(n || 0);
  const haptic = () => { try { if (typeof sdHaptic === 'function') sdHaptic(8); } catch (e) {} };
  const calm = () => document.documentElement.classList.contains('sd-reduce-motion');
  const likes = () => { try { return new Set(JSON.parse(localStorage.getItem(LIKE_KEY)) || []); } catch (e) { return new Set(); } };
  const saveLikes = s => { try { localStorage.setItem(LIKE_KEY, JSON.stringify([...s])); } catch (e) {} };
  const itemKey = it => it.t.title + '::' + it.a.album;

  /* ── the comments ─────────────────────────────────────────────────────────
     The way people write under a song (not a review): short, personal, a bit
     dramatic. {song} becomes the song's title. */
  const LINES = [
    '{song} is the kind of song you find once and then spend years trying to find again',
    'played this at 2am with the windows down and for four minutes nothing was wrong',
    'the moment the drums come in i forget whatever i was worried about',
    'my dad used to play this in the car. this is how i visit him now',
    'how is this only a few minutes long. it feels like a whole summer',
    'the bassline is doing something illegal and i am not reporting it',
    'came for the preview, stayed for the next six hours',
    'nobody talks about the last thirty seconds of {song} and it breaks my heart',
    'this song knows something about me i haven’t told anyone',
    'i put this on every first cold morning of the year. it’s a ritual now',
    'the way the voice cracks on the second chorus. that’s the whole song',
    'listening to this feels like remembering a place you’ve never been',
    'if this song were a colour it would be the one on your screen right now',
    'headphones on, eyes closed, this is the closest i get to flying',
    '{song} got me through the worst year of my life. not exaggerating',
    'every time i think i’m over this song the chorus comes back around',
    'the production on this still sounds like next year',
    'i’ve had this on repeat so long it feels like part of my body',
    'sounds like a sunday that never ends',
    'showed this to my little sister and now she won’t stop playing it. job done',
    'every single sound on this is exactly where it should be',
    'this came on shuffle at a party and the whole room went quiet',
    'i want to hear {song} again for the first time',
    'the outro of this is a warm bath',
    'this song is a hug from someone who understands',
    'imagine making something this good and just putting it out like it’s normal',
    'it starts small and then suddenly you’re crying on a bus',
    'the lyrics hit different at 25 than they did at 15',
    'late night drive song of the decade, no contest',
    'still finding new sounds in this after a hundred listens',
    '{song} is proof some people are tuned to a different frequency',
    'the silence right before the last chorus is my favourite second of music',
    'this is the song i’d play to explain myself to an alien',
    'nostalgic for a time i wasn’t even alive for',
    'the way it fades out like it doesn’t want to leave either',
    'play this at my funeral but make everyone dance',
    'this track sounds like the last day of school felt',
    'whoever mixed the vocals on {song} deserves a statue',
  ];
  const YEARS = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];
  function proper(t) {
    t = t.charAt(0).toUpperCase() + t.slice(1).replace(/([.!?] )([a-z])/g, (_, p, c) => p + c.toUpperCase());
    t = t.replace(/\bi\b/g, 'I').replace(/\bi(['’])/g, 'I$1');
    return /[.!?]$/.test(t) ? t : t + '.';
  }
  /* Seeded per song. The line is the seed's pick unless it was used in the
     last dozen cards, then the next free one — two pages in a row with the
     same comment reads as a bug. (So a song's line can differ by what came
     before it; the handle, likes and year never do.) */
  function quoteFor(a, t) {
    const r = typeof seedRand === 'function' ? seedRand('quote::' + t.title + '::' + a.album) : Math.random;
    let k = Math.floor(r() * LINES.length);
    for (let n = 0; n < LINES.length && Q.used.includes(k); n++) k = (k + 1) % LINES.length;
    Q.used.push(k); if (Q.used.length > 12) Q.used.shift();
    let text = LINES[k].replace('{song}', t.title);
    if (r() < 0.5) text = proper(text);
    const cast = typeof CMT_CAST !== 'undefined' ? CMT_CAST : ['echoplex'];
    return {
      text,
      user: cast[Math.floor(r() * cast.length)],
      likes: 140 + Math.floor(Math.pow(r(), 2) * 12000),
      year: YEARS[Math.floor(r() * YEARS.length)],
    };
  }

  /* ── the songs ──────────────────────────────────────────────────────────── */
  function shelf() {
    const seen = new Set();
    return (window.ARCHIVE || [])
      .filter(a => a && a.album && a.image)
      .filter(a => { const k = a.artist + '|' + a.album; if (seen.has(k)) return false; seen.add(k); return true; })
      .sort((x, y) => (y.reviewCount || 0) - (x.reviewCount || 0) || (y.rating || 0) - (x.rating || 0));
  }
  const tracks = a => typeof window.sdDzTracks === 'function' ? window.sdDzTracks(a) : Promise.resolve(null);
  const topSong = list => (list || []).filter(t => t.preview).sort((x, y) => (y.rank - x.rank) || (x.n - y.n))[0] || null;

  // Ask for the next albums' songs and append a card per album that has one.
  function fill() {
    if (Q.filling) return Q.filling;
    const gen = Q.gen;
    const run = () => {
      if (gen !== Q.gen || !Q.root || Q.next >= Q.albums.length) return Promise.resolve();
      const batch = Q.albums.slice(Q.next, Q.next + BATCH);
      Q.next += batch.length;
      return Promise.all(batch.map(a => tracks(a).then(topSong).catch(() => null))).then(songs => {
        if (gen !== Q.gen || !Q.root) return;
        const fresh = [];
        batch.forEach((a, k) => { const t = songs[k]; if (t) fresh.push({ a, t, q: quoteFor(a, t) }); });
        appendCards(fresh);
        // keep going until a few pages are waiting ahead
        if (Q.list.length - Math.max(0, Q.active) < 4) return run();
      });
    };
    Q.filling = run().finally(() => { Q.filling = null; });
    return Q.filling;
  }

  /* ── markup ─────────────────────────────────────────────────────────────── */
  const ICO = {
    close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    heart: '<svg viewBox="0 0 24 24"><path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 7.9 3.6 4.5 7 4.5c2 0 3.6 1.1 5 2.9 1.4-1.8 3-2.9 5-2.9 3.4 0 5.6 3.4 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2z"/></svg>',
    sound: '<svg viewBox="0 0 24 24"><path class="ds-spk" d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path class="ds-wave" d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/><path class="ds-x" d="M16 9.5l5 5M21 9.5l-5 5"/></svg>',   // Swipe's
    cmt: '<svg viewBox="0 0 24 24"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.4 8.4 0 0 1-3.6-.8L3 21l1.9-5.4A8.4 8.4 0 1 1 21 11.5z"/></svg>',   // the app's CMT_SVG bubble
  };

  function servicesHtml() {
    const ORDER = ['spotify', 'apple', 'ytmusic', 'deezer'];
    return (typeof SD_SERVICES !== 'undefined' ? SD_SERVICES : [])
      .slice().sort((x, y) => ORDER.indexOf(x.id) - ORDER.indexOf(y.id))
      .map(sv => `<button class="ds-svc" aria-label="Listen on ${esc(sv.name)}" onclick="event.stopPropagation(); sdQuoteService(this, '${sv.id}')">${
        typeof svcMarkHtml === 'function' ? svcMarkHtml(sv, 'ds-svc-ico') : ''}</button>`).join('');
  }

  function shellHtml() {
    return `
      <div class="qs-scroll"><div class="qs-wait"><span class="qs-spin"></span>Finding songs…</div></div>
      <div class="qs-top">
        <button class="ds-ibtn" aria-label="Close comments mode" onclick="event.stopPropagation(); sdQuoteClose()">${ICO.close}</button>
        <span class="qs-credit">Previews by Deezer</span>
        <button class="ds-ibtn ds-mute qs-mute${Q.muted ? ' is-muted' : ''}" aria-label="Mute" onclick="event.stopPropagation(); sdQuoteMute(this)">${ICO.sound}</button>
      </div>
      <div class="qs-dock">
        <div class="qs-svcs">${servicesHtml()}</div>
        <div class="qs-listen">Listen now</div>
        <div class="qs-cd" role="button" aria-label="Listen now" onclick="event.stopPropagation(); sdQuoteToggle()">
          <div class="qs-fx cur"><div class="ds-disc"><span class="ds-hole"></span></div></div>
          <div class="qs-fx"><div class="ds-disc"><span class="ds-hole"></span></div></div>
          <span class="qs-pause" aria-hidden="true"></span>
        </div>
      </div>
      <div class="qs-prog"><i></i></div>
      <div class="ds-rsheet qs-csheet" hidden>
        <div class="ds-rscrim" onclick="event.stopPropagation(); sdQuoteCommentsClose()"></div>
        <div class="ds-rpanel">
          <div class="ds-gnub" onclick="sdQuoteCommentsClose()"></div>
          <div class="ds-rhd"><div class="ds-rhd-t"><b>Replies</b><span class="qs-chd-n"></span></div></div>
          <div class="qs-cquote"></div>
          <div class="ds-rbody v3-rsh-body qs-cbody"></div>
        </div>
      </div>`;
  }

  /* ── the album: score + likes (round 2) ─────────────────────────────────
     The big number is the album's community score, the discs under it, and
     the heart is the album's FAVOURITE (the same draft flag as Swipe, the
     review sheet and the album page) with the album's like count — mock,
     Swipe's formula: 62% of its review count, plus you. */
  const subjOf = a => ({ title: a.album, subtitle: a.artist, image: a.image, year: a.year || '' });
  const albumFav = a => { try { return !!((logDrafts()[logKey(subjOf(a))]) || {}).fav; } catch (e) { return false; } };
  const albumLikes = a => Math.round((a.reviewCount || 4000) * 0.62) + (albumFav(a) ? 1 : 0);
  function discsHtml(r) {
    let s = '';
    for (let k = 1; k <= 5; k++) s += `<span class="hstar ${r >= k ? 'full' : r >= k - 0.5 ? 'half' : 'empty'}"></span>`;
    return s;
  }

  /* ── the comment's own thread (round 2) ─────────────────────────────────
     The app's thread machinery (cmtWrapHtml / cmtAdd / cmtRender, app.js),
     keyed 'quote::<song>::<album>'. Its seeded filler is written for REVIEWS
     ("this is the review that finally made me put it on"), so the thread is
     seeded HERE first, into CMT_CACHE, with replies to a comment about a song;
     cmtRoots uses a cached thread before generating one. Same node shape as
     revThread's. Your own posts go through cmtAdd into CMT_MINE as anywhere. */
  const REPLIES = [
    'this is exactly it', 'the way you put this', 'came to the comments to find this',
    'not me reading this with the song on', 'ok now i have to listen again', 'saving this comment',
    'every single time', 'you put into words what i couldn’t', 'the 2am part is so real',
    'this comment is part of the song now', 'literally me', 'the last minute is everything',
    'said it better than any review', 'whoever you are, same', 'needed to read this today',
    'nah this one hurts', 'chills reading this', 'my exact thought at the chorus',
  ];
  const AGOS = ['3w', '2w', '1w', '5d', '3d', '2d', '1d', '16h', '9h', '5h', '2h', '1h', '35m', '12m', '4m'];
  const cmtKey = it => 'quote::' + itemKey(it);
  function cmtTotal(it) {
    const r = typeof seedRand === 'function' ? seedRand('quotecmt::' + itemKey(it)) : Math.random;
    return 4 + Math.floor(Math.pow(r(), 1.6) * 60);
  }
  function seedThread(it) {
    const key = cmtKey(it);
    if (typeof CMT_CACHE === 'undefined' || CMT_CACHE[key]) return;
    const n = Math.min(48, cmtTotal(it));
    const r = typeof seedRand === 'function' ? seedRand('quotethread::' + itemKey(it)) : Math.random;
    const cast = typeof CMT_CAST !== 'undefined' ? CMT_CAST : ['echoplex'];
    const roots = [], flat = [];
    let last = -1;
    for (let k = 0; k < n; k++) {
      let li = Math.floor(r() * REPLIES.length);
      if (li === last) li = (li + 1) % REPLIES.length;
      last = li;
      let text = REPLIES[li];
      if (r() < 0.5) text = proper(text);
      const node = { id: 'q' + k, kids: [], depth: 0, user: cast[Math.floor(r() * cast.length)],
        ago: AGOS[Math.min(AGOS.length - 1, Math.floor(k / n * AGOS.length))],
        likes: Math.floor(r() * 40), text };
      const parents = flat.filter(c => c.depth < 1);
      if (k && parents.length && r() < 0.3) {
        const p = parents[Math.floor(r() * parents.length)];
        node.depth = 1; p.kids.push(node);
      } else roots.push(node);
      flat.push(node);
    }
    CMT_CACHE[key] = roots;
  }
  const cmtN = it => {
    seedThread(it);
    try { return cmtCount(cmtKey(it), cmtTotal(it)); } catch (e) { return cmtTotal(it); }
  };

  function cardHtml(it, i) {
    const liked = likes().has(itemKey(it));
    const n = it.q.likes + (liked ? 1 : 0);
    const a = it.a, fav = albumFav(a), avg = +a.rating || 0;
    return `
      <section class="qs-card" data-i="${i}">
        <div class="qs-bg" style="background-image:url('${esc(a.image)}')"></div>
        <div class="qs-body">
          <blockquote class="qs-quote"><span class="qs-oq">“</span>${esc(it.q.text)}”</blockquote>
          <div class="qs-meta">
            <span class="qs-user">@${esc(it.q.user)}</span>
            <button class="qs-like${liked ? ' on' : ''}" aria-label="Like this comment" onclick="event.stopPropagation(); sdQuoteLike(this, ${i})">${ICO.heart}<span>${fmtN(n)}</span></button>
            <button class="qs-cbtn v3-cmt-btn" data-k="${esc(cmtKey(it))}" data-n="${cmtTotal(it)}" aria-label="Reply to this comment" onclick="event.stopPropagation(); sdQuoteComments(${i})">${ICO.cmt}<span class="v3-up-n">${cmtN(it)}</span></button>
            <span class="qs-yr">${it.q.year}</span>
          </div>
          <div class="qs-lyr" aria-hidden="true"></div>
        </div>
        <div class="qs-song">
          <div class="qs-score">
            <div class="qs-big">${avg.toFixed(1)}</div>
            <div class="qs-side">
              <div class="qs-discs">${discsHtml(avg)}</div>
              <div class="qs-arow">
              <button class="qs-afav${fav ? ' on' : ''}" aria-label="Like this album" onclick="event.stopPropagation(); sdQuoteFav(this, ${i})">${ICO.heart}<span>${fmtN(albumLikes(a))}</span></button>
              <span class="qs-revs qs-link" onclick="event.stopPropagation(); sdQuoteOpenAlbum(${i}, 'reviews')">${fmtN(a.reviewCount || 0)} reviews</span>
              </div>
            </div>
          </div>
          <div class="qs-st">${esc(it.t.title)}</div>
          <div class="qs-sa"><span class="qs-link" onclick="event.stopPropagation(); sdQuoteOpenAlbum(${i}, 'artist')">${esc(it.a.artist)}</span><span class="qs-dot">·</span><span class="qs-link" onclick="event.stopPropagation(); sdQuoteOpenAlbum(${i}, 'album')">${esc(it.a.album)}</span></div>
          <button class="qs-go" onclick="event.stopPropagation(); sdQuoteOpenAlbum(${i}, 'album')">Go to album <span>›</span></button>
        </div>
      </section>`;
  }

  const cardAt = i => Q.scroller && Q.scroller.querySelector(`.qs-card[data-i="${i}"]`);

  function appendCards(items) {
    if (!items.length) return;
    const wait = Q.scroller.querySelector('.qs-wait');
    if (wait) wait.remove();
    const tmp = document.createElement('div');
    tmp.innerHTML = items.map((it, k) => cardHtml(it, Q.list.length + k)).join('');
    Q.list.push(...items);
    [...tmp.children].forEach(card => {
      Q.scroller.appendChild(card);
      const i = +card.dataset.i;
      paintSeams(i - 1); paintSeams(i);            // the card above learns its new neighbour
      fitQuote(card);
      tint(i);
      Q.obs.observe(card);
      const im = new Image(); im.src = Q.list[i].a.image;   // covers warm before they spin in
    });
    const L = Q.landing;
    if (L && !L.done) {
      const i = Q.list.findIndex(it => itemKey(it) === L.key);
      if (i >= 0) { L.done = true; Q.scroller.scrollTop = cardAt(i).offsetTop; }
      else if (Q.next < Q.albums.length && Q.list.length < 200) { Q.filling = null; setTimeout(fill, 0); }
    }
  }

  /* The quote steps its size down until it fits its share of the page: big
     and few words like the reference, smaller for a long one. */
  const Q_MAX = 34, Q_MIN = 20;
  function fitQuote(card) {
    const el = card.querySelector('.qs-quote'), body = card.querySelector('.qs-body');
    if (!el || !body) return;
    const room = card.clientHeight * 0.5;
    let fs = Q_MAX;
    el.style.fontSize = fs + 'px';
    while (fs > Q_MIN && el.scrollHeight > room) { fs -= 1; el.style.fontSize = fs + 'px'; }
    const lyr = card.querySelector('.qs-lyr');
    if (lyr) lyr.style.fontSize = Math.round(fs / 2) + 'px';    // the lyrics are half the quote's size
  }
  window.addEventListener('resize', () => {
    if (Q.scroller) Q.scroller.querySelectorAll('.qs-card').forEach(fitQuote);
  });

  /* ── colour: one per page, blended at the seams ─────────────────────────── */
  /* White text sits on it, and the reference was a loud red, so the cover's
     colour is made more saturated and its lightness held in a band where
     white reads (HSL: saturation up ~30%, lightness .24–.42; greys stay grey). */
  function deepen(hex) {
    const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim());
    if (!m) return null;
    const [r, g, b] = [0, 2, 4].map(k => parseInt(m[1].slice(k, k + 2), 16) / 255);
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
    let h = 0, l = (mx + mn) / 2, sat = d ? d / (1 - Math.abs(2 * l - 1)) : 0;
    if (d) h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h = (h * 60 + 360) % 360;
    sat = sat < 0.08 ? sat : Math.min(0.85, sat * 1.3 + 0.06);
    l = Math.min(0.42, Math.max(0.24, l));
    const c = (1 - Math.abs(2 * l - 1)) * sat, x = c * (1 - Math.abs((h / 60) % 2 - 1)), o = l - c / 2;
    const [R, G, B] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x]
                    : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
    const hx = v => Math.round(Math.min(1, Math.max(0, v + o)) * 255).toString(16).padStart(2, '0');
    return '#' + hx(R) + hx(G) + hx(B);
  }
  function tint(i) {
    const it = Q.list[i];
    if (!it || typeof computeAlbumColors !== 'function') return;
    computeAlbumColors(it.a.image).then(c => {
      if (!c || !Q.root) return;
      it.col = deepen(c.accent) || deepen(c.box1color);
      if (!it.col) return;
      paintSeams(i - 1); paintSeams(i); paintSeams(i + 1);
      if (i === Q.active) paintDock();
    });
  }
  const DEF = '#2a2a33';
  function paintSeams(i) {
    const card = cardAt(i), it = Q.list[i];
    if (!card || !it) return;
    const own = it.col || DEF;
    const prev = (Q.list[i - 1] && Q.list[i - 1].col) || (i === 0 ? own : DEF);
    const next = (Q.list[i + 1] && Q.list[i + 1].col) || (Q.list[i + 1] ? DEF : own);
    card.style.setProperty('--c', own);
    card.style.setProperty('--cp', prev);
    card.style.setProperty('--cn', next);
    card.classList.toggle('tinted', !!it.col);
  }
  function paintDock() {
    const it = Q.list[Q.active], dock = Q.root && Q.root.querySelector('.qs-dock');
    if (dock && it) dock.style.setProperty('--ds-base', it.col || DEF);
  }

  /* ── playback ───────────────────────────────────────────────────────────── */
  function audio() {
    if (!Q.audio) {
      const el = new Audio();
      el.preload = 'auto';
      el.setAttribute('playsinline', '');
      el.muted = Q.muted;
      el.addEventListener('ended', () => goNext());
      el.addEventListener('playing', () => Q.root && Q.root.classList.add('is-playing'));
      el.addEventListener('pause', () => Q.root && Q.root.classList.remove('is-playing'));
      Q.audio = el;
    }
    return Q.audio;
  }
  function play(i, startAt) {
    const it = Q.list[i];
    if (!it) return;
    const gen = ++Q.gen2;
    const el = audio();
    el.pause();
    // the preview link expires: ask the (10-minute) cache for a fresh one
    tracks(it.a).then(list => {
      if (gen !== Q.gen2 || !Q.root) return;
      const t = (list || []).find(x => x.title === it.t.title && x.preview) || it.t;
      if (!t.preview) { goNext(); return; }
      el.src = t.preview;
      if (startAt > 0) el.addEventListener('loadedmetadata', () => { try { el.currentTime = startAt; } catch (e) {} }, { once: true });
      el.play().catch(() => {});
    });
  }
  Q.gen2 = 0;
  function goNext() {
    const c = cardAt(Q.active + 1);
    if (c) Q.scroller.scrollTo({ top: c.offsetTop, behavior: calm() ? 'auto' : 'smooth' });
  }
  function tick() {
    Q.raf = requestAnimationFrame(tick);
    const bar = Q.root && Q.root.querySelector('.qs-prog i'), el = Q.audio;
    if (!bar) return;
    const p = el && el.duration ? Math.min(1, el.currentTime / el.duration) : 0;
    bar.style.transform = `scaleX(${p.toFixed(4)})`;
    karaoke();
  }

  /* ── KARAOKE (round 4) ──────────────────────────────────────────────────
     Eric: the EXACT lyrics of the part the preview plays, under the comment
     at half its size, one line at a time: the line comes in grey, a ball
     bounces word to word and each word lights as it's sung, then the line
     fades and the next comes in.
     Deezer never says where in the song its 30s preview starts, so the timing
     is worked out OFFLINE by tools/quote_lyrics.py: Whisper transcribes the
     preview (word timestamps), the words are matched against LRCLIB's synced
     lyrics to find the clip's start, and every word gets its time in the clip.
     The result is quote-lyrics.json, keyed by Deezer track id:
       { "<id>": { o: start in song (s), l: [[lineStart, lineEnd, [[word, t], …]], …] } }
     with every time relative to the PREVIEW, so audio.currentTime drives it
     directly. A song the script hasn't done (or couldn't match) shows nothing.
     The phone downloads one small file, once; no lyrics service is called. */
  const LYR_URL = 'quote-lyrics.json';      // fetched no-cache: a re-run of the script shows up without a version bump
  let LYR = null, LYR_P = null;
  function loadLyrics() {
    if (LYR || LYR_P) return LYR_P;
    const get = u => fetch(u, { cache: 'no-cache' }).then(r => r.ok ? r.json() : {}).catch(() => ({}));
    LYR_P = Promise.all([get(LYR_URL), get('quote-desc.json')]).then(([l, d]) => {
      LYR = l || {}; DESC = d || {};
      // by name too: Deezer lists one song under several ids (explicit / clean
      // editions, re-releases), so the feed's copy may not be the one processed
      LYR_N = {}; DESC_N = {};
      Object.values(LYR).forEach(e => { LYR_N[nameKey(e.a, e.t)] = e; });
      Object.values(DESC).forEach(e => { DESC_N[nameKey(e.a, e.t)] = e; });
      return LYR;
    });
    return LYR_P;
  }
  /* NO LYRICS → A DESCRIPTION (round 7). Instrumentals, mumbled or buried
     vocals and experimental tracks get one still line where the lyrics go:
     a kicker for the voice (Instrumental · Wordless vocals · Vocal chops ·
     Hazy vocals · Lyrics not found) over "Dreamy piano over a hip-hop beat ·
     slow". Written offline by tools/quote_describe.py: CLAP scores the
     preview against short phrases (mood, lead sound, rhythm, tempo, voice),
     each judged against the other no-lyric songs. Deliberately static — a
     running play-by-play of the music was too much. */
  let DESC = null;
  let LYR_N = {}, DESC_N = {};
  const nameKey = (a, t) => (String(a || '') + '|' + String(t || '').replace(/\s*[\(\[].*?[\)\]]/g, ''))
    .toLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N}|]/gu, '');
  const lyrOf = it => (LYR && LYR[it.t.id]) || LYR_N[nameKey(it.a.artist, it.t.title)] || null;
  const descOf = it => (DESC && DESC[it.t.id]) || DESC_N[nameKey(it.a.artist, it.t.title)] || null;
  /* LIVE (round 10, sped up in 12): a song neither file covers is worked out on
     the phone by lyrics-live.js (window.sdLive) - real lyrics at once from the
     usual preview start, refined by Whisper in the background; else captions of
     what it heard; else CLAP's interpretive line.
     LIVE[id]: 'pending' while it works, then the entry, or null. */
  const LIVE = new Map();
  // a background refine found better timing for a song: use it
  if (window.sdLive) window.sdLive.onUpdate = (id, entry) => {
    LIVE.set(String(id), entry);
    const k = Q.list.findIndex(x => String(x.t.id) === String(id));
    const b = k >= 0 && cardAt(k) && cardAt(k).querySelector('.qs-lyr');
    if (b) { b._li = undefined; b.querySelectorAll('.qs-ln').forEach(n => n.remove()); }
  };
  function liveFor(it) {
    const id = String(it.t.id);
    if (!LIVE.has(id)) {
      if (!window.sdLive || descOf(it)) return null;      // a prepared description needs nothing live
      LIVE.set(id, 'pending');
      window.sdLive.analyze(it).then(r => {
        LIVE.set(id, r || null);
        const k = Q.list.indexOf(it);
        const b = k >= 0 && cardAt(k) && cardAt(k).querySelector('.qs-lyr');
        if (b) b._desc = null;                               // repaint the slot with the answer
      });
    }
    return LIVE.get(id);
  }
  const READY_WAIT = 6000;
  function lyricsReady(it) {
    if (!it || !window.sdLive || !LYR || lyrOf(it) || descOf(it)) return Promise.resolve();
    if (liveFor(it) !== 'pending') return Promise.resolve();
    const id = String(it.t.id), t0 = Date.now();
    return new Promise(res => {
      const poll = () => (LIVE.get(id) !== 'pending' || Date.now() - t0 > READY_WAIT) ? res() : setTimeout(poll, 120);
      poll();
    });
  }
  function describe(box, id, it, live) {
    const state = id + ':' + (live === 'pending' ? 'wait' : live ? 'live' : 'none');
    if (box._desc === state) return;
    box._desc = state;
    box._li = undefined;
    box.removeAttribute('data-heard');
    const D = descOf(it) || (live && live.d ? live : null);
    // waiting on the live pass, a description, or nothing at all: say so (round 9)
    box.innerHTML = live === 'pending' && !D
      ? `<div class="qs-desc qs-desc--wait"><b>Listening</b><span><i></i><i></i><i></i></span></div>`
      : D ? `<div class="qs-desc"><b>${esc(D.k)}</b><span>${esc(D.d)}</span></div>`
          : `<div class="qs-desc qs-desc--none"><b>No lyrics</b><span>We don't have the lyrics for this one yet.</span></div>`;
    const el = box.firstChild;
    if (el) requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('in')));
  }
  const LYR_LEAD = 0.08;                     // seconds the karaoke runs ahead of the audio
  const BALL_H = 13;                         // how high the ball hops between words (px)
  function karaoke() {
    const it = Q.list[Q.active], card = cardAt(Q.active), el = Q.audio;
    if (!it || !card || !LYR) return;
    const box = card.querySelector('.qs-lyr');
    let L = lyrOf(it);
    if (!box) return;
    if (!L || !L.l || !L.l.length) {
      const live = liveFor(it);
      if (live && live.l && live.l.length) L = live;
      else { if (DESC) describe(box, it.t.id, it, live); return; }
    }
    if (box._desc) { box.innerHTML = ''; box._desc = null; box._li = undefined; }   // the Listening / description slot gives way
    // captions of what was heard, not official lyrics: the page says so
    if (!!L.heard !== box.hasAttribute('data-heard')) box.toggleAttribute('data-heard', !!L.heard);
    /* The clock runs LYR_LEAD ahead (round 6): a word lit exactly as it's sung
       reads as late, so the ball lands a beat early. Word times themselves are
       forced-aligned to the separated vocals (tools/quote_retime.py). */
    const now = (el ? el.currentTime : 0) + LYR_LEAD;
    // the line on stage: from a beat before it starts until its end
    let li = -1;
    for (let k = 0; k < L.l.length; k++) {
      const ln = L.l[k], next = L.l[k + 1];
      const show = ln[0] - 0.45, hide = Math.max(ln[1], (ln[2].length ? ln[2][ln[2].length - 1][1] : ln[0]) + 0.6);
      if (now >= show && now < Math.min(hide, next ? next[0] - 0.45 : hide)) { li = k; break; }
    }
    if (li !== box._li) swapLine(box, li >= 0 ? L.l[li] : null);
    box._li = li;
    if (li < 0) return;
    const line = box.querySelector('.qs-ln:not(.out)');
    if (!line) return;
    const words = line._w, spans = line._s;
    if (!words || !spans) return;
    // light every word whose time has come
    let k = -1;
    for (let n = 0; n < words.length; n++) {
      const on = now >= words[n][1];
      if (on) k = n;
      if (spans[n]._on !== on) { spans[n]._on = on; spans[n].classList.toggle('on', on); }
    }
    // the ball: arcs from word k to word k+1; before the first word it drops in from the left
    const ball = line.querySelector('.qs-ball');
    if (!line._pos) line._pos = spans.map(sp => ({ x: sp.offsetLeft + sp.offsetWidth / 2, y: sp.offsetTop }));
    const P = line._pos;
    let x, y, hop;
    const calmNow = calm();
    if (k < 0) {
      const t0 = words[0][1], lead = 0.45, f = Math.max(0, Math.min(1, 1 - (t0 - now) / lead));
      x = P[0].x - 18 * (1 - f); y = P[0].y; hop = (1 - f) * BALL_H;
    } else if (k >= words.length - 1) {
      x = P[k].x; y = P[k].y; hop = 0;
    } else {
      const a = words[k][1], b = words[k + 1][1];
      const f = Math.max(0, Math.min(1, (now - a) / Math.max(0.05, b - a)));
      x = P[k].x + (P[k + 1].x - P[k].x) * f;
      y = P[k].y + (P[k + 1].y - P[k].y) * f;
      // a short gap gets a small hop, a long one the full arc
      hop = Math.sin(Math.PI * f) * BALL_H * Math.min(1, (b - a) / 0.35);
    }
    if (calmNow) hop = 0;
    ball.style.transform = `translate(${x.toFixed(1)}px, ${(y - hop).toFixed(1)}px)`;
  }
  // Fade the old line out, the new one in (grey until sung).
  function swapLine(box, ln) {
    box.querySelectorAll('.qs-ln:not(.out)').forEach(o => {
      o.classList.add('out');
      setTimeout(() => o.remove(), 380);
    });
    if (!ln || !ln[2].length) return;
    const d = document.createElement('div');
    d.className = 'qs-ln';
    d.innerHTML = '<span class="qs-ball"></span>' + ln[2].map(w => `<span class="qs-w">${esc(w[0])}</span>`).join(' ');
    d._w = ln[2];
    d._s = [...d.querySelectorAll('.qs-w')];
    box.appendChild(d);
    requestAnimationFrame(() => d.classList.add('in'));
  }

  /* For tools/quote_lyrics.py: the songs the feed would deal, as the script
     needs them (Deezer track id + names). Run from a page: see the script. */
  window.sdQuoteSongList = async function (n) {
    const albums = shelf().slice(0, n || 60), out = [];
    for (const a of albums) {
      const t = topSong(await tracks(a).catch(() => null));
      if (t && t.id) out.push({ id: t.id, artist: a.artist, album: a.album, title: t.title, dur: t.dur });
    }
    return out;
  };

  /* The fixed CD: the old disc spins out while the new one spins in (Swipe's
     swap, round 20), once the new cover has decoded (600ms at most). */
  function swapCd(it, first) {
    const fx = Q.root && Q.root.querySelector('.qs-cd');
    if (!fx || !it) return;
    const tok = ++Q.fxTok;
    const img = `url("${String(it.a.image).replace(/"/g, '%22')}")`;
    const go = () => {
      if (tok !== Q.fxTok || !Q.root) return;
      const cur = fx.querySelector('.qs-fx.cur'), nxt = [...fx.querySelectorAll('.qs-fx')].find(e => e !== cur);
      if (first || calm()) {
        cur.querySelector('.ds-disc').style.backgroundImage = img;
        fx.querySelectorAll('.qs-fx').forEach(e => e.classList.remove('in', 'out'));
        return;
      }
      nxt.querySelector('.ds-disc').style.backgroundImage = img;
      cur.classList.remove('cur', 'in'); cur.classList.add('out');
      nxt.classList.remove('out'); nxt.classList.add('cur', 'in');
      clearTimeout(Q.fxT);
      Q.fxT = setTimeout(() => fx.querySelectorAll('.qs-fx').forEach(e => e.classList.remove('in', 'out')), 560);
    };
    if (first) { go(); return; }
    const im = new Image(); im.src = it.a.image;
    const ready = im.decode ? im.decode().catch(() => {}) : Promise.resolve();
    Promise.race([ready, new Promise(r => setTimeout(r, 600))]).then(go);
  }

  function setActive(i) {
    if (i === Q.active) return;
    const first = Q.active === -1;
    Q.active = i;
    Q.scroller.querySelectorAll('.qs-card.on').forEach(c => c.classList.remove('on'));
    const card = cardAt(i);
    if (card) card.classList.add('on');
    swapCd(Q.list[i], first);
    paintDock();
    const r = Q.landing;
    /* LYRICS FIRST (round 14, Eric: "begin with the lyrics ready instead of
       loading while the previews are playing"). A song with nothing prepared
       waits — "Listening" up — until its live lyrics / description arrive, at
       most READY_WAIT, then plays. Prepared songs (and repeats) start at once. */
    const at = r && r.key === itemKey(Q.list[i]) && r.t != null ? r.t : 0;
    if (r && at) r.t = null;
    if (Q.audio && !Q.audio.paused) Q.audio.pause();      // the last song doesn't play on under the wait
    lyricsReady(Q.list[i]).then(() => { if (Q.active === i && Q.root) play(i, at); });
    if (i >= Q.list.length - 4) fill();
    // the next two songs' live lyrics are worked out while this one plays
    [Q.list[i + 1], Q.list[i + 2]].forEach(nx => { if (nx && LYR && !lyrOf(nx)) liveFor(nx); });
    const host = Q.root && Q.root.parentElement;
    if (host && typeof applyAlbumColorsUrl === 'function') applyAlbumColorsUrl(host, Q.list[i].a.image);
  }

  /* ── open / close ───────────────────────────────────────────────────────── */
  window.sdQuoteOpen = function (btn, resume) {
    const host = (btn && btn.closest('.app-screen')) || document.querySelector('.s-wall2');
    if (!host) return;
    window.sdQuoteClose();
    if (typeof window.sdDoomClose === 'function') window.sdDoomClose();
    // the live-lyrics models (lyrics-live.js) download now, the first time Comments opens
    if (window.sdLive) window.sdLive.start();
    // Unlock audio INSIDE this tap, or iOS refuses the play() that comes later.
    const el = audio();
    try { if (typeof silentClipUrl === 'function') { el.src = silentClipUrl(); el.play().catch(() => {}); } } catch (e) {}

    const root = document.createElement('div');
    root.className = 'qs-root';
    root.innerHTML = shellHtml();
    root.addEventListener('click', e => e.stopPropagation());
    host.classList.add('ds-host');
    host.appendChild(root);
    Q.root = root;
    Q.scroller = root.querySelector('.qs-scroll');
    Q.gen++;
    Q.active = -1;
    Q.landing = resume ? { key: resume.key, t: resume.t, done: false } : null;
    // A resume rebuilds the same list (same shelf order, same songs) and lands on the card left.
    Q.albums = []; Q.next = 0; Q.list = []; Q.used = [];
    Q.obs = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) setActive(+en.target.dataset.i); });
    }, { root: Q.scroller, threshold: 0.6 });
    /* READY SONGS FIRST (round 8). Lyrics and descriptions exist only for the
       songs tools/quote_songs.js saw, and a tester's shelf differs (their Deezer
       recs, genre fills from Swipe), so their feed ran into unprocessed songs
       after a couple and the karaoke "stopped". Albums by an artist the two
       files know now lead (shelf order kept within each group); the rest
       follow. Waits for the files (2s at most) before dealing. */
    const gen0 = Q.gen;
    Promise.race([loadLyrics(), new Promise(r => setTimeout(r, 2000))]).then(() => {
      if (gen0 !== Q.gen || !Q.root) return;
      const known = new Set(Object.values(Object.assign({}, LYR || {}, DESC || {})).map(e => String(e.a || '').toLowerCase()));
      const all = shelf();
      Q.albums = all.filter(a => known.has(a.artist.toLowerCase())).concat(all.filter(a => !known.has(a.artist.toLowerCase())));
      fill();
    });
    cancelAnimationFrame(Q.raf);
    Q.raf = requestAnimationFrame(tick);
    if (resume) root.classList.add('qs-instant', 'open');
    else requestAnimationFrame(() => root.classList.add('open'));
  };

  window.sdQuoteClose = function () {
    Q.gen++; Q.gen2++;
    cancelAnimationFrame(Q.raf);
    if (Q.audio) { Q.audio.pause(); Q.audio.removeAttribute('src'); }
    if (Q.obs) { Q.obs.disconnect(); Q.obs = null; }
    if (Q.root) {
      const host = Q.root.parentElement;
      Q.root.remove();
      if (host && !host.querySelector('.ds-root')) host.classList.remove('ds-host');
    }
    Q.root = Q.scroller = null;
    Q.active = -1;
    Q.filling = null;
  };

  /* THE CD (round 3) opens and closes the streaming icons above "Listen now"
     (they used to sit there all the time, and the CD paused the preview).
     Sound is the mute button's job now; a preview that never started (the
     browser blocked it) is started by this tap too. */
  window.sdQuoteToggle = function () {
    const el = audio(), dock = Q.root && Q.root.querySelector('.qs-dock');
    haptic();
    if (dock) dock.classList.toggle('svcs-open');
    if (!el.src || /^data:/.test(el.src)) play(Q.active);
    else if (el.paused) el.play().catch(() => {});
  };
  /* MUTE (round 3), upper right, this page only. Remembered on the device. */
  window.sdQuoteMute = function (btn) {
    Q.muted = !Q.muted;
    try { localStorage.setItem(MUTE_KEY, Q.muted ? '1' : '0'); } catch (e) {}
    audio().muted = Q.muted;
    btn.classList.toggle('is-muted', Q.muted);
    btn.setAttribute('aria-label', Q.muted ? 'Unmute' : 'Mute');
    haptic();
  };

  window.sdQuoteLike = function (btn, i) {
    const it = Q.list[i];
    if (!it) return;
    const s = likes(), k = itemKey(it), on = !s.has(k);
    on ? s.add(k) : s.delete(k);
    saveLikes(s);
    btn.classList.toggle('on', on);
    btn.querySelector('span').textContent = fmtN(it.q.likes + (on ? 1 : 0));
    if (on) { btn.classList.remove('pop'); void btn.offsetWidth; btn.classList.add('pop'); }
    haptic();
  };

  // The album's heart: the album favourite, shared with the rest of the app.
  window.sdQuoteFav = function (btn, i) {
    const it = Q.list[i];
    if (!it || typeof writeDraftFlag !== 'function') return;
    const on = !albumFav(it.a);
    writeDraftFlag(subjOf(it.a), 'fav', on);
    btn.classList.toggle('on', on);
    btn.querySelector('span').textContent = fmtN(albumLikes(it.a));
    if (on) { btn.classList.remove('pop'); void btn.offsetWidth; btn.classList.add('pop'); }
    haptic();
  };

  /* REPLIES: a sheet inside the feed (Swipe's review-sheet chrome, .ds-r*) so
     the preview keeps playing. The comment repeats small at the top, then the
     thread with its composer first; the body carries v3-rsh-body so app.js's
     cmtFill / cmtAutoMore page it in as you scroll. cmtRender repaints the
     card's count live (the button is a .v3-cmt-btn with data-k). */
  window.sdQuoteComments = function (i) {
    const it = Q.list[i], sh = Q.root && Q.root.querySelector('.qs-csheet');
    if (!it || !sh || typeof cmtWrapHtml !== 'function') return;
    seedThread(it);
    const key = cmtKey(it), total = cmtTotal(it);
    CMT_OPEN[key] = true;
    Q.ckey = key;
    sh.querySelector('.qs-cquote').innerHTML =
      `<span class="qs-cq-t">“${esc(it.q.text)}”</span><span class="qs-cq-by">@${esc(it.q.user)} · ${esc(it.t.title)}</span>`;
    sh.querySelector('.qs-chd-n').textContent = cmtCount(key, total);
    const body = sh.querySelector('.qs-cbody');
    body.innerHTML = cmtWrapHtml(key, total);
    body.scrollTop = 0;
    // the header count follows a post (cmtRender repaints the wrap, not this)
    if (Q.cobs) Q.cobs.disconnect();
    Q.cobs = new MutationObserver(() => { sh.querySelector('.qs-chd-n').textContent = cmtCount(key, total); });
    Q.cobs.observe(body, { childList: true, subtree: true });
    sh.hidden = false;
    requestAnimationFrame(() => sh.classList.add('open'));
    setTimeout(() => { if (typeof cmtFill === 'function') cmtFill(); }, 60);
    // quick comment: the box is ready to type into (desktop; on a phone the tap opens the keyboard composer)
    if (!(window.matchMedia && matchMedia('(pointer: coarse)').matches))
      setTimeout(() => { const inp = body.querySelector('.v3-cmt-input'); if (inp) inp.focus({ preventScroll: true }); }, 320);
    haptic();
  };
  window.sdQuoteCommentsClose = function () {
    const sh = Q.root && Q.root.querySelector('.qs-csheet');
    if (!sh || sh.hidden) return;
    sh.classList.remove('open');
    const key = Q.ckey;
    if (key && typeof CMT_OPEN !== 'undefined') { delete CMT_OPEN[key]; if (typeof cmtRender === 'function') cmtRender(key); }
    setTimeout(() => { if (!sh.classList.contains('open')) { sh.hidden = true; sh.querySelector('.qs-cbody').innerHTML = ''; } }, 280);
  };

  window.sdQuoteService = function (btn, svc) {
    const it = Q.list[Q.active];
    if (it && typeof serviceGo === 'function') serviceGo(btn, svc, it.a, null);
  };

  /* Album / artist page, and Back lands you on the same song at the same
     second (Swipe's resume, simplified: no cover glide, just the feed). */
  window.sdQuoteOpenAlbum = function (i, mode) {
    const it = Q.list[i];
    if (!it || typeof openAlbumPage !== 'function') return;
    if (mode === 'artist' && typeof openArtistPageFor !== 'function') return;
    const el = Q.audio;
    Q.resume = {
      key: itemKey(it), t: i === Q.active && el && !isNaN(el.currentTime) ? el.currentTime : 0,
      depth: typeof backStack !== 'undefined' ? backStack.length : 0,
    };
    window.sdQuoteClose();
    if (mode === 'artist') openArtistPageFor(it.a.artist);
    else openAlbumPage(it.a);
    // the review count: the album page, glided down to its reviews (as Swipe's Reviews does)
    if (mode === 'reviews') setTimeout(() => { if (typeof fbGlideToReviews === 'function') fbGlideToReviews(); }, 450);
  };
  function resumeQuote(st, tries) {
    const btn = [...document.querySelectorAll('.s-wall2 .qs-entry')].find(e => e.offsetParent !== null);
    if (!btn) { if ((tries || 0) < 40) setTimeout(() => resumeQuote(st, (tries || 0) + 1), 60); return; }
    window.sdQuoteOpen(btn, st);
  }
  const _goBack = window.goBack;
  if (typeof _goBack === 'function') {
    window.goBack = function () {
      const out = _goBack.apply(this, arguments);
      const st = Q.resume;
      if (st && typeof backStack !== 'undefined' && backStack.length <= st.depth) {
        Q.resume = null;
        setTimeout(() => resumeQuote(st), 0);
      }
      return out;
    };
  }
  const _navTab = window.sdNavTab;
  if (typeof _navTab === 'function') {
    window.sdNavTab = function () { Q.resume = null; return _navTab.apply(this, arguments); };
  }
  // Anything that navigates away takes the feed down first, or the preview keeps playing.
  const _navigate = window.navigate;
  if (typeof _navigate === 'function') {
    window.navigate = function () {
      if (Q.root) window.sdQuoteClose();
      return _navigate.apply(this, arguments);
    };
  }
})();
