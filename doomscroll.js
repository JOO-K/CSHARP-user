/* ══════════════════════════════════════════════════════════════════════════
   SCROLL MODE — the Trending page's full-screen "doomscroll" (2026-11-03)
   ══════════════════════════════════════════════════════════════════════════
   Eric: a button at the top of Trending turns on a TikTok-style feed. One album
   per screen as a CD that spins while its 30s Deezer preview plays; the score
   above the disc, the songs below it; a right-hand rail with heart, comment,
   + (review) and the streaming services; the background takes the cover's
   colours (the same computeAlbumColors the bento uses). When a preview ends the
   feed moves on to the next album.

   Round 23: albums with no preview are taken out of the feed (prune);
   Deezer's tile is the real 2023 mark (SD_SERVICES, screens.js).

   Round 22: a cover spins in only once loaded (it used to leave the disc
   see-through); Reviews opens a sheet inside the feed so you read while
   the preview plays.

   Round 20: the CD stays put while the pages swipe under it; changing
   album spins the old disc out and the new one in (placeFixCd / swapFixCd).

   Round 19: the album name stays between the rails — it shrinks to fit two
   lines (fitTitle), and is clamped at two.

   Round 18: back from a page whose cover is out of sight (the Reviews
   button's scrolled album page, the artist page) opens the feed with a
   circle reveal out of the CD; the score block sits 8px higher.

   Round 17: Trending's entry reads "Swipe" with a small beta tag at its
   lower right; the right rail is Like · Listened · Later, and Reviews · Review
   moved to a left rail on Listened's and Later's rows.

   Round 16: Trending's entry is a swipe icon + Beta in the tab row (the
   Genre tab's place); Back from the album page glides the cover into the CD.

   Round 15: no sparks from the playhead (old peaks still shed a few);
   FOR YOU is the base feed — onboarding's genres first (see tasteGenres) —
   with a For You bubble beside an icon-only Genres button.

   Round 14: the level line is a liquid ribbon with sparks rising off the
   peaks; no volume control (phones use their own buttons; desktop 25%); the
   album name opens the album page and the artist name the artist page, and
   Back returns here from both.

   Round 13: the bottom line is the old flat grey line ahead of the
   playhead and, behind it, a smooth filled area whose height is the music's
   loudness as it played (drawViz).

   Round 11: a genre pick the shelf can't fill is topped up from Deezer and
   cached per genre for 3 days (GENRES FROM DEEZER, CACHED).

   Round 10: Genres is the app's full list (SD_GENRE_TREE, the wall's
   matcher) in a bottom sheet; Reviews opens the album page at its reviews and
   Back returns here where you were (DS.resume + the goBack wrapper).

   Round 9: narrower chat icon; the score + count centred as a pair with
   "ratings" on the number's baseline; Genres left of the volume; a finished
   preview plays the next song, not the next album.

   Round 8: the score, CD and title are centred on the SCREEN (the rail no
   longer pushes them left; only the song list keeps clear of it), and the
   count is stacked again, 89k over "ratings".

   Round 7 (same day): "Songs" label left of the song toggle, which now reads
   Chrono · Popular; a Genres button under the volume opens a popup that
   filters the feed (sdDoomGenre).

   Round 5 (same day): smaller rail labels; songs + streaming icons 10px
   lower (the three actions stay); "89k ratings" on one line on the big
   number's baseline; no dot before the year, year smaller; the song sort is a
   small segmented toggle.

   Round 4 (same day): like column fixed width; no circles behind the rail's
   three icons; services Deezer · Apple Music · Spotify · YouTube Music; five
   songs show, the list fades when more are below; bigger score with the
   ratings count beside it; discs closer together; bigger CD, centred.

   Round 3 (same day): the song list scrolls on its own; each song shows a
   heart + like count left of its length (tap = favourite that song); no EQ
   bars (the colour says which is playing); the bottom progress line is a row
   of bars that move with the music (drawViz).

   Round 2 (same day, Eric): the score is ONE big number with the discs under
   it (the discs are also the quick-rate control); the Popular / Chronological
   toggle sorts the SONGS and sits over the tracklist; track numbers stay put
   when a row is playing and the list is flush left; volume starts at 25% with
   a slider.

   ⚠ VOLUME ON iOS: Safari ignores audio.volume. The element is routed through
   a Web Audio GainNode instead, which iOS does honour. That needs the preview
   to be CORS-readable (crossOrigin = 'anonymous'): Deezer's preview CDN sends
   Access-Control-Allow-Origin: * (checked 2026-11-03). If the AudioContext
   can't be made, it falls back to audio.volume (fine on desktop / Android).

   Self-contained on purpose: app.js's own preview engine is switched off
   (PREVIEWS_ENABLED) and stays that way — this mode has its own <audio>.
   Entering the mode is the user's tap, so audio is allowed (unlocked inside
   that gesture).

   Leans on these app.js globals: dz, (sdDzAlbumId if present), computeAlbumColors,
   writeDraftFlag, logDrafts, logKey, openLogSheet, openAlbumPage, serviceGo,
   silentClipUrl, SD_SERVICES, svcMarkHtml, sdHaptic, applyAlbumColorsUrl.

   Preview links from Deezer EXPIRE, so tracks are fetched with a 10-minute
   bucket in the path (dz caches by path) instead of being stored. Previews are
   Deezer's 128 kbps MP3s — that is the ceiling, not a setting here. */
(function () {
  'use strict';

  const BATCH = 8;                       // cards appended at a time
  const FRESH_MS = 10 * 60 * 1000;       // how long a preview link is trusted
  const VOL_KEY = 'sd-doom-vol', SORT_KEY = 'sd-doom-songsort';
  const SONG_SORTS = [['order', 'Chrono'], ['popular', 'Popular']];

  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
  };

  const DS = {
    root: null, scroller: null, list: [], shown: 0, active: -1,
    audio: null, ctx: null, gain: null, an: null, bins: null, raf: 0, gen: 0, track: -1, obs: null, watch: null,
    // No volume control (round 14): a phone's own buttons set the level, so
    // touch devices play at full; desktop sits at 25%.
    vol: (window.matchMedia && matchMedia('(pointer: coarse)').matches) ? 1 : 0.25,
    parts: [],                              // the level line's sparkles
    songSort: store.get(SORT_KEY, 'popular') === 'order' ? 'order' : 'popular',
    mode: 'foryou',                         // 'foryou' (onboarding's genres) · 'genres' (the sheet's picks) · 'all'
    genres: [],                             // the sheet's committed picks (mode 'genres')
    gpick: new Set(), gopen: new Set(),     // the sheet's working picks / expanded mains
    resume: null,                           // where to land when Back returns from the album page
    gfTok: 0, fxTok: 0,                               // the latest genre pick (a slow fetch for an older one is dropped)
  };

  const esc = s => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const fmtN = n => n >= 1e6 ? (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M'
                  : n >= 1e3 ? Math.round(n / 1e3) + 'k' : String(n || 0);
  const fmtT = s => Math.floor(s / 60) + ':' + String(Math.round(s % 60)).padStart(2, '0');
  const subjOf = a => ({ title: a.album, subtitle: a.artist, image: a.image, year: a.year || '' });
  const draftOf = a => {
    try { return (logDrafts()[logKey(subjOf(a))]) || {}; } catch (e) { return {}; }
  };
  /* Song likes. A song's own draft is song::<title>::<album> (the key the
     song sheet, the tracklist heart and the profile's Fav songs read), so a
     heart here is the same favourite as everywhere else. The count is mock,
     like every count in the app: derived from Deezer's real per-song
     popularity (rank), plus one if you liked it. */
  const songSubj = (a, t) => ({ title: t.title, subtitle: a.album, image: a.image, isSong: true });
  const songFav = (a, t) => {
    try { return !!((logDrafts()[logKey(songSubj(a, t))]) || {}).fav; } catch (e) { return false; }
  };
  const songLikes = (a, t) => Math.max(3, Math.round((t.rank || 0) / 240)) + (songFav(a, t) ? 1 : 0);
  const HEART = '<svg viewBox="0 0 24 24"><path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 7.9 3.6 4.5 7 4.5c2 0 3.6 1.1 5 2.9 1.4-1.8 3-2.9 5-2.9 3.4 0 5.6 3.4 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2z"/></svg>';
  const haptic = () => { try { if (typeof sdHaptic === 'function') sdHaptic(8); } catch (e) {} };

  /* ── the album list: most reviewed first ─────────────────────────────── */
  function allAlbums() {
    const all = (window.ARCHIVE || []).filter(a => a && a.album && a.image);
    const seen = new Set();
    return all.filter(a => { const k = a.artist + '|' + a.album; if (seen.has(k)) return false; seen.add(k); return true; });
  }
  /* Genres = the app's own list (SD_GENRE_TREE, the Trending wall's and
     onboarding's: mains, each with its subgenres) and the wall's own matcher
     (wallPickedPool: loose, case-blind, a thin subgenre widens to its family),
     so a pick here means exactly what it means on the wall. */
  const GENRE_TREE = () => (typeof SD_GENRE_TREE !== 'undefined' ? SD_GENRE_TREE : {});   // a top-level const
  // A pick's search terms: a main brings its subgenres (the wall's rule).
  function genreTerms(picks) {
    const T = GENRE_TREE();
    return [...new Set(picks.flatMap(g => (g in T) ? [g, ...T[g]] : [g]))].map(x => x.toLowerCase());
  }
  // EXACT matches only (no family widening) — what decides whether to ask Deezer.
  function exactMatches(picks) {
    const terms = genreTerms(picks);
    return allAlbums().filter(a => { const g = String(a.genre || '').toLowerCase(); return g && terms.some(t => g.includes(t)); });
  }
  function listFor() {
    const byReviews = (a, b) => (b.reviewCount || 0) - (a.reviewCount || 0) || (b.rating || 0) - (a.rating || 0);
    const picks = activePicks();
    if (!picks.length) return allAlbums().sort(byReviews);
    const exact = exactMatches(picks).sort(byReviews);
    if (DS.mode === 'foryou') {
      // Your genres first, taken in turn (one Jazz, one Shoegaze, …) so one
      // genre can't bury the others; then the rest of the shelf.
      const lanes = picks.map(g => exactMatches([g]).sort(byReviews));
      const seen = new Set(), mixed = [];
      for (let r = 0; lanes.some(l => l.length > r); r++)
        lanes.forEach(l => { const a = l[r]; if (a && !seen.has(a)) { seen.add(a); mixed.push(a); } });
      return mixed.concat(allAlbums().filter(a => !seen.has(a)).sort(byReviews));
    }
    if (exact.length) return exact;
    // nothing exact (Deezer had nothing either): the wall's widened pool
    const pool = typeof wallPickedPool === 'function' ? new Set(wallPickedPool(picks)) : new Set();
    return allAlbums().filter(a => pool.has(a)).sort(byReviews);
  }

  /* ── GENRES FROM DEEZER, CACHED (round 11) ──────────────────────────────
     A pick the shelf can't fill (fewer than GF_ENOUGH exact albums) is
     topped up from Deezer, and the answer is KEPT so the same pick never asks
     again for GC_TTL — on this device, across reloads. Cost per genre:
       · a main with a Deezer genre id → ONE call: chart/<id>/albums (50).
       · a subgenre / a main Deezer has no id for (Shoegaze, Punk, Indie…) →
         TWO calls: the top playlist for that name, then its tracks' albums.
     So a pick costs 1–2 requests the first time and 0 after; at most
     GF_MAX_FETCH genres are fetched per Pick, in-flight lookups are shared,
     and dz() already paces every call inside Deezer's ~50 per 5s.
     ⚠ Only a NON-EMPTY answer is cached (a throttled or failed call must not
     pin "nothing" for three days — the trap dz() documents).
     The cache stores the minimum (title, ids, cover, artist, year) and
     rebuilds each record through dzRecord, whose rating / reviews are seeded
     off the title, so a cached album reads identically every time.
     Records join ARCHIVE (not the bento's queue), tagged with the pick as
     their genre so the wall's genre matching finds them too.
     NEXT STEP FOR SCALE: the same cache in a Supabase table keyed by genre,
     filled by whoever asks first — then a genre costs Deezer 1–2 calls per
     TTL for EVERY user, not per device. */
  const GC_KEY = 'sd-genre-cache-v1', GC_TTL = 3 * 864e5, GC_MAX = 40;
  const GF_PER = 40, GF_ENOUGH = 15, GF_MAX_FETCH = 4;
  const DZ_GENRE_ID = {                      // our main genre → Deezer's genre id (stable; see DZ_GID in app.js)
    'Electronic': 106, 'Rock': 152, 'Alternative': 85, 'Pop': 132, 'Hip-Hop': 116, 'R&B': 165,
    'Jazz': 129, 'Metal': 464, 'Folk': 466, 'Country': 84, 'Classical': 98, 'Soundtrack': 173,
  };
  const GF_PENDING = new Map();
  const gcRead = () => { try { return JSON.parse(localStorage.getItem(GC_KEY)) || {}; } catch (e) { return {}; } };
  function gcPut(key, albums) {
    const all = gcRead();
    all[key] = { at: Date.now(), albums };
    Object.keys(all).sort((x, y) => all[y].at - all[x].at).slice(GC_MAX).forEach(k => { delete all[k]; });
    try { localStorage.setItem(GC_KEY, JSON.stringify(all)); } catch (e) {}
  }
  const slim = (al, ar) => al && ar && al.title && ar.name && (al.cover_xl || al.cover_big) ? {
    t: al.title, id: al.id, img: al.cover_xl || al.cover_big, a: ar.name, aid: ar.id,
    y: parseInt(String(al.release_date || '').slice(0, 4), 10) || 0,
  } : null;
  async function fetchGenre(g) {
    if (typeof dz !== 'function') return [];
    let out = [];
    const gid = DZ_GENRE_ID[g];
    if (gid) {
      const r = await dz('chart/' + gid + '/albums?limit=50');
      out = ((r && r.data) || []).filter(al => typeof dzGoodAlbum !== 'function' || dzGoodAlbum(al))
        .map(al => slim(al, al.artist));
    } else {
      const sr = await dz('search/playlist?limit=6&q=' + encodeURIComponent(g));
      const pls = (sr && sr.data) || [];
      const pl = pls.find(x => (x.nb_tracks || 0) >= 30) || pls[0];
      if (pl) {
        const tr = await dz('playlist/' + pl.id + '/tracks?limit=100');
        const junk = typeof DZ_JUNK !== 'undefined' ? DZ_JUNK : null;
        out = ((tr && tr.data) || []).map(t => t.album && (!junk || !junk.test(t.album.title || '')) ? slim(t.album, t.artist) : null);
      }
    }
    const seen = new Set();                  // one album per artist, like the rec deal
    return out.filter(m => m && !seen.has(m.a.toLowerCase()) && seen.add(m.a.toLowerCase())).slice(0, GF_PER);
  }
  function genreAlbums(g) {
    const key = g.toLowerCase();
    const hit = gcRead()[key];
    if (hit && Date.now() - hit.at < GC_TTL) return Promise.resolve(hit.albums);
    if (GF_PENDING.has(key)) return GF_PENDING.get(key);
    const p = fetchGenre(g).catch(() => []).then(albums => {
      GF_PENDING.delete(key);
      if (albums.length) gcPut(key, albums);
      return albums;
    });
    GF_PENDING.set(key, p);
    return p;
  }
  // Slim cache rows → app records in ARCHIVE (skipping anything already there).
  function adoptGenre(g, albums) {
    if (typeof dzRecord !== 'function') return;
    const A = window.ARCHIVE || [];
    const k = (ar, al) => String(ar).toLowerCase() + '::' + String(al).toLowerCase();
    const have = new Set(A.map(a => k(a.artist, a.album)));
    const fresh = [];
    albums.forEach(m => {
      if (have.has(k(m.a, m.t))) return;
      have.add(k(m.a, m.t));
      const r = dzRecord({ title: m.t, id: m.id, cover_xl: m.img, release_date: m.y ? String(m.y) : '', genre_id: 0 }, { name: m.a, id: m.aid });
      r.genre = g;
      fresh.push(r);
    });
    if (!fresh.length) return;
    window.ARCHIVE = A.concat(fresh);
    window.SEARCH_INDEX = null;              // search memoises the archive
  }
  // Top the picks up from Deezer when the shelf is thin. Resolves when done.
  function topUpGenres(picks) {
    if (exactMatches(picks).length >= GF_ENOUGH) return Promise.resolve(false);
    const want = picks.slice(0, GF_MAX_FETCH);
    return Promise.all(want.map(g => genreAlbums(g).then(al => adoptGenre(g, al)))).then(() => true);
  }
  /* FOR YOU (round 15) — the feed's base. It is the genres picked in
     ONBOARDING (OB.genres, app.js — in memory only, so a copy is kept here
     and survives a reload): albums in those genres lead, topped up from
     Deezer through the same cache when the shelf is thin, then everything
     else follows so the feed never runs dry. No onboarding picks → the
     shelf, most reviewed first. */
  const TASTE_KEY_DS = 'sd-doom-taste';
  function tasteGenres() {
    const ob = (typeof OB !== 'undefined' && OB.genres) ? [...OB.genres] : [];
    if (ob.length) { store.set(TASTE_KEY_DS, JSON.stringify(ob)); return ob; }
    try { return JSON.parse(store.get(TASTE_KEY_DS, '[]')) || []; } catch (e) { return []; }
  }
  // The picks the current mode deals from.
  const activePicks = () => DS.mode === 'genres' ? DS.genres : DS.mode === 'foryou' ? tasteGenres() : [];
  const genreLabel = () => DS.mode === 'genres' && DS.genres.length
    ? DS.genres[0] + (DS.genres.length > 1 ? ' +' + (DS.genres.length - 1) : '') : 'For You';

  /* ── Deezer album id ──────────────────────────────────────────────────────
     Uses app.js's sdDzAlbumId when the build has it; otherwise its own match:
     the strict artist + album search, then a plain one, keeping only the right
     artist (a bare search returns covers and tribute records first). Exposed as
     sdDzFindAlbum so fetchPreviewUrl (app.js) shares it. */
  const norm = x => String(x || '').toLowerCase().replace(/&/g, 'and').replace(/\(.*?\)|\[.*?\]/g, '').replace(/[^a-z0-9]/g, '');
  function albumId(a) {
    if (a.deezerId) return Promise.resolve(a.deezerId);
    if (typeof sdDzAlbumId === 'function') return sdDzAlbumId(a);
    if (typeof dz !== 'function') return Promise.resolve(null);
    const A = norm(a.artist), B = norm(a.album);
    const pick = r => {
      const mine = ((r && r.data) || []).filter(x => norm(x.artist && x.artist.name) === A);
      return mine.find(x => norm(x.title) === B) || mine.find(x => B && norm(x.title).startsWith(B)) || null;
    };
    return dz('search/album?limit=15&q=' + encodeURIComponent('artist:"' + a.artist + '" album:"' + a.album + '"'))
      .then(r => pick(r) || dz('search/album?limit=25&q=' + encodeURIComponent(a.artist + ' ' + a.album)).then(pick))
      .then(hit => { if (hit) a.deezerId = hit.id; return hit ? hit.id : null; })
      .catch(() => null);
  }
  window.sdDzFindAlbum = albumId;

  /* ── tracks + previews (Deezer) ───────────────────────────────────────── */
  const TRACKS = new Map();   // "artist|album" → { at, list | null, p }
  function tracksFor(a) {
    const k = a.artist + '|' + a.album;
    const hit = TRACKS.get(k);
    if (hit && (hit.p || Date.now() - hit.at < FRESH_MS)) return hit.p || Promise.resolve(hit.list);
    if (typeof dz !== 'function') return Promise.resolve(null);
    const bucket = Math.floor(Date.now() / FRESH_MS);
    const p = albumId(a)
      .then(id => id ? dz('album/' + id + '/tracks?limit=60&b=' + bucket) : null)
      .then(r => {
        const list = ((r && r.data) || []).map((x, n) => ({
          n, pos: x.track_position || n + 1, rank: x.rank || 0,
          title: x.title_short || x.title || '', dur: x.duration || 0, preview: x.preview || '',
        }));
        return list.length ? list : null;
      })
      .catch(() => null)
      .then(list => { TRACKS.set(k, { at: Date.now(), list }); return list; });
    TRACKS.set(k, { at: Date.now(), list: null, p });
    return p;
  }
  const cachedTracks = a => { const h = TRACKS.get(a.artist + '|' + a.album); return h && !h.p ? h.list : null; };
  // Display order. Popular = Deezer's rank, most played first; numbers stay the album's own.
  const ordered = list => DS.songSort === 'popular'
    ? list.slice().sort((x, y) => (y.rank - x.rank) || (x.n - y.n)) : list;

  /* ── markup ───────────────────────────────────────────────────────────── */
  const ICO = {
    heart: '<svg viewBox="0 0 24 24"><path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 7.9 3.6 4.5 7 4.5c2 0 3.6 1.1 5 2.9 1.4-1.8 3-2.9 5-2.9 3.4 0 5.6 3.4 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2z"/></svg>',
    cmt: '<svg viewBox="0 0 24 24"><path d="M6.5 5.5h11A1.5 1.5 0 0 1 19 7v8.5a1.5 1.5 0 0 1-1.5 1.5h-5l-4 3.2V17H6.5A1.5 1.5 0 0 1 5 15.5V7a1.5 1.5 0 0 1 1.5-1.5z"/></svg>',
    plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
    close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    genre: '<svg viewBox="0 0 24 24"><path d="M4 6h16M7 12h10M10 18h4"/></svg>',
    // the app's own Listened / Listen later glyphs (SD_LINE_ICONS ear / clock, screens.js)
    ear: '<svg viewBox="0 0 24 24"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/><path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>',
    clock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    sound: '<svg viewBox="0 0 24 24"><path class="ds-spk" d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path class="ds-wave" d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/><path class="ds-x" d="M16 9.5l5 5M21 9.5l-5 5"/></svg>',
  };

  function shellHtml() {
    return `
      <div class="ds-top">
        <button class="ds-ibtn ds-close" aria-label="Close scroll mode" onclick="event.stopPropagation(); sdDoomClose()">${ICO.close}</button>
        <div class="ds-topr">
        <button class="ds-fybtn${DS.mode === 'foryou' ? ' on' : ''}" onclick="event.stopPropagation(); sdDoomForYou()">For You</button>
        <button class="ds-genbtn${DS.mode === 'genres' ? ' on' : ''}" aria-label="Genres" onclick="event.stopPropagation(); sdDoomGenreSheet()">${ICO.genre}</button>
        </div>
      </div>
      <div class="ds-scroll"></div>
      <div class="ds-rsheet" hidden>
        <div class="ds-rscrim" onclick="event.stopPropagation(); sdDoomReviewsClose()"></div>
        <div class="ds-rpanel">
          <div class="ds-gnub" onclick="sdDoomReviewsClose()"></div>
          <div class="ds-rhd">
            <div class="ds-rhd-t"><b>Reviews</b><span class="v3-rev-count"></span></div>
            <button class="ds-rpage" onclick="event.stopPropagation(); sdDoomReviewsPage()">Album page ›</button>
          </div>
          <div class="ds-rbody"><div class="v3-rev-list"></div></div>
        </div>
      </div>
      <div class="ds-fixcd" aria-hidden="true">
        <div class="ds-fx cur"><div class="ds-disc"><span class="ds-hole"></span></div></div>
        <div class="ds-fx"><div class="ds-disc"><span class="ds-hole"></span></div></div>
        <span class="ds-pause"></span>
      </div>
      <div class="ds-gsheet" hidden>
        <div class="ds-gscrim" onclick="event.stopPropagation(); sdDoomGenreClose()"></div>
        <div class="ds-gpanel" onclick="event.stopPropagation()">
          <div class="ds-gnub"></div>
          <div class="ds-ghd"><b>Genres</b><button class="ds-gclear" onclick="sdDoomGenreClear()">Show everything</button></div>
          <div class="ds-glist"></div>
          <button class="ds-ggo" onclick="sdDoomGenreCommit()" hidden>Pick genres</button>
        </div>
      </div>`;
  }

  function discsHtml(r) {
    let s = '';
    for (let i = 1; i <= 5; i++) {
      const cls = r >= i ? 'full' : r >= i - 0.5 ? 'half' : 'empty';
      s += `<button class="ds-star" data-v="${i}" aria-label="Rate ${i}"><span class="hstar ${cls}"></span></button>`;
    }
    return s;
  }
  // The score block: the big number, the discs under it, one caption line.
  // Before you rate: the community score in gold. After: yours, in green.
  function scoreInner(a, d) {
    const mine = d.rating > 0, avg = +a.rating || 0;
    return `
      <div class="ds-score-row">
        <div class="ds-big">${(mine ? d.rating : avg).toFixed(1)}</div>
        <div class="ds-side">${mine
          ? `<b>Your rating</b><span>avg ${avg.toFixed(1)}</span>`
          : `<b>${fmtN(a.reviewCount)}</b><span>ratings</span>`}</div>
      </div>
      <div class="ds-discs">${discsHtml(mine ? d.rating : avg)}</div>`;
  }

  function songSortHtml() {
    return SONG_SORTS.map(([id, label]) =>
      `<button class="ds-ss${id === DS.songSort ? ' on' : ''}" data-s="${id}" onclick="event.stopPropagation(); sdDoomSongSort('${id}')">${label}</button>`).join('');
  }

  function railHtml(i, d) {
    const ORDER = ['deezer', 'apple', 'spotify', 'ytmusic'];
    const svc = (typeof SD_SERVICES !== 'undefined' ? SD_SERVICES : [])   // a top-level const: never on window
      .slice().sort((x, y) => ORDER.indexOf(x.id) - ORDER.indexOf(y.id))
      .map(sv => `<button class="ds-svc" aria-label="Open in ${esc(sv.name)}" onclick="event.stopPropagation(); sdDoomService(this, ${i}, '${sv.id}')">${
        typeof svcMarkHtml === 'function' ? svcMarkHtml(sv, 'ds-svc-ico') : ''}</button>`).join('');
    return `
      <div class="ds-rail">
        <button class="ds-rbtn ds-fav${d.fav ? ' on' : ''}" aria-label="Favorite" onclick="event.stopPropagation(); sdDoomFav(this, ${i})">${ICO.heart}<span>Like</span></button>
        <button class="ds-rbtn ds-listened${d.listened ? ' on' : ''}" aria-label="Listened" onclick="event.stopPropagation(); sdDoomFlag(this, ${i}, 'listened')">${ICO.ear}<span>Listened</span></button>
        <button class="ds-rbtn ds-later${d.later ? ' on' : ''}" aria-label="Listen later" onclick="event.stopPropagation(); sdDoomFlag(this, ${i}, 'later')">${ICO.clock}<span>Later</span></button>
        <div class="ds-rail-svcs"><span class="ds-rail-sep"></span>${svc}</div>
      </div>
      <div class="ds-lrail">
        <button class="ds-rbtn ds-cmt" aria-label="Reviews and comments" onclick="event.stopPropagation(); sdDoomReviews(${i})">${ICO.cmt}<span>Reviews</span></button>
        <button class="ds-rbtn ds-add${d.rating > 0 || (d.text || '').trim() ? ' on' : ''}" aria-label="Write a review" onclick="event.stopPropagation(); sdDoomReview(this, ${i})">${ICO.plus}<span>Review</span></button>
      </div>`;
  }

  function cardHtml(a, i) {
    const d = draftOf(a);
    return `
      <section class="ds-card" data-i="${i}">
        <div class="ds-bg" style="background-image:url('${esc(a.image)}')"></div>
        <div class="ds-main">
          <div class="ds-score${d.rating > 0 ? ' is-mine' : ''}" onclick="event.stopPropagation(); sdDoomRate(event, ${i})">${scoreInner(a, d)}</div>
          <div class="ds-cd" onclick="event.stopPropagation(); sdDoomToggle(${i})">
            <div class="ds-disc" style="background-image:url('${esc(a.image)}')"><span class="ds-hole"></span></div>
            <span class="ds-pause" aria-hidden="true"></span>
          </div>
          <div class="ds-title">
            <div class="ds-album"><span class="ds-link" onclick="event.stopPropagation(); sdDoomOpenAlbum(${i}, 'album')">${esc(a.album)}</span>${a.year ? `<span class="ds-year">${esc(a.year)}</span>` : ''}</div>
            <div class="ds-artist"><span class="ds-link" onclick="event.stopPropagation(); sdDoomOpenAlbum(${i}, 'artist')">${esc(a.artist)}</span></div>
          </div>
          <div class="ds-songs-hd"><span class="ds-songs-lbl">Songs</span><div class="ds-ssw">${songSortHtml()}</div></div>
          <ol class="ds-tracks"><li class="ds-tr-msg">Loading songs…</li></ol>
        </div>
        ${railHtml(i, d)}
        <canvas class="ds-viz" aria-hidden="true"></canvas>
      </section>`;
  }

  function paintTracks(card, list) {
    const ol = card.querySelector('.ds-tracks');
    if (!ol) return;
    if (!list) { ol.innerHTML = '<li class="ds-tr-msg">No preview for this one</li>'; return; }
    const a = DS.list[+card.dataset.i];
    ol.innerHTML = ordered(list).map(t => `
      <li class="ds-tr${t.preview ? '' : ' none'}" data-n="${t.n}">
        <span class="ds-tr-n">${t.pos}</span><span class="ds-tr-t">${esc(t.title)}</span>
        <button class="ds-tr-like${songFav(a, t) ? ' on' : ''}" data-n="${t.n}" aria-label="Like this song">${HEART}<span>${songLikes(a, t).toLocaleString('en-US')}</span></button>
        <span class="ds-tr-d">${fmtT(t.dur)}</span>
      </li>`).join('');
    ol.scrollTop = 0;
    fadeTracks(ol);
    alignRail(card);
    if (+card.dataset.i === DS.active && DS.track >= 0) paintTrack(card, DS.track);
  }

  /* The streaming icons' TOP lines up with the top of the first song's length
     (round 12). Measured, not hard-coded: the stack is centred, so where the
     songs land depends on the screen. Rects are divided by the frame's scale
     (the desktop viewer shrinks the phone) before becoming a CSS offset. */
  function alignRail(card) {
    if (+card.dataset.i === DS.active) requestAnimationFrame(placeFixCd);
    const scale0 = card.getBoundingClientRect().height / (card.offsetHeight || 1) || 1;
    const lr = card.querySelector('.ds-lrail'), lis = card.querySelector('.ds-listened');
    if (lr && lis) {                                // Reviews sits on Listened's row, Review on Later's
      const cur = parseFloat(lr.style.top) || 0;
      lr.style.top = (cur + (lis.getBoundingClientRect().top - lr.firstElementChild.getBoundingClientRect().top) / scale0).toFixed(1) + 'px';
    }
    const box = card.querySelector('.ds-rail-svcs'), ol = card.querySelector('.ds-tracks');
    const icon = box && box.querySelector('.ds-svc'), li = ol && ol.querySelector('li');
    if (!icon || !li) return;
    const d = li.querySelector('.ds-tr-d') || li;
    const scale = card.getBoundingClientRect().height / (card.offsetHeight || 1) || 1;
    const want = ol.getBoundingClientRect().top + (d.getBoundingClientRect().top - li.getBoundingClientRect().top);
    const cur = parseFloat(box.style.top) || parseFloat(getComputedStyle(box).top) || 0;
    box.style.top = (cur + (want - icon.getBoundingClientRect().top) / scale).toFixed(1) + 'px';
  }
  window.addEventListener('resize', () => {
    if (DS.scroller) DS.scroller.querySelectorAll('.ds-card').forEach(c => { fitTitle(c); alignRail(c); });
  });

  /* A long album name steps its font down until it fits in two lines of the
     column between the rails (round 19); .ds-album's 2-line clamp catches
     anything still too long at the floor size. */
  const TITLE_MAX = 20, TITLE_MIN = 13;
  function fitTitle(card) {
    const el = card.querySelector('.ds-album');
    if (!el) return;
    let fs = TITLE_MAX;
    el.style.fontSize = fs + 'px';
    while (fs > TITLE_MIN && el.scrollHeight > fs * 1.2 * 2 + 2) { fs -= 1; el.style.fontSize = fs + 'px'; }
  }

  // Five rows show; the list fades out at the bottom while there is more below it.
  function fadeTracks(ol) {
    ol.classList.toggle('has-more', ol.scrollTop + ol.clientHeight < ol.scrollHeight - 2);
  }

  /* ── colours: the cover's palette, as the bento does ──────────────────── */
  function tint(card, a) {
    if (typeof computeAlbumColors !== 'function') return;
    computeAlbumColors(a.image).then(c => {
      if (!c) return;
      card.style.setProperty('--ds-accent', c.accent);
      card.style.setProperty('--ds-base', c.box1color);
      card.style.setProperty('--ds-star', c.star || c.accent);
      card.classList.add('tinted');
      if (+card.dataset.i === DS.active) placeFixCd();
    });
  }

  const hasPreview = l => !!(l && l.some(t => t.preview));
  // Take album j's card out of the feed. One you've already scrolled past stays
  // (removing it would shift the page under you); the one on screen goes and
  // the next slides into its place.
  function prune(j) {
    if (!DS.root || j < DS.active) return;
    const c = cardAt(j);
    if (!c) return;
    if (DS.obs) DS.obs.unobserve(c);
    const wasActive = j === DS.active;
    c.remove();
    if (wasActive) {
      DS.active = -2;                                   // not -1: the next disc should still spin in
      const nextCard = [...DS.scroller.querySelectorAll('.ds-card')].find(x => +x.dataset.i > j);
      if (nextCard) setActive(+nextCard.dataset.i);
    }
    const ahead = [...DS.scroller.querySelectorAll('.ds-card')].filter(x => +x.dataset.i > DS.active).length;
    if (ahead < 3) appendBatch();
  }

  function appendBatch() {
    const from = DS.shown, to = Math.min(DS.list.length, from + BATCH);
    if (from >= to) return;
    const tmp = document.createElement('div');
    tmp.innerHTML = DS.list.slice(from, to).map((a, k) => cardHtml(a, from + k)).join('');
    [...tmp.children].forEach(card => {
      DS.scroller.appendChild(card);
      tint(card, DS.list[+card.dataset.i]);
      DS.obs.observe(card);
      fitTitle(card);
      alignRail(card);
    });
    DS.shown = to;
    // warm the next couple of tracklists so the songs are there on arrival
    /* NO PREVIEW, NO CARD (round 23: "its weird to get recommended something
       and it says preview not available"). Every new card's songs are asked
       for now, and a card whose album turns out to have no preview at all is
       taken out before you reach it (prune). Deezer calls are paced by dz(). */
    const tok = DS.buildTok;
    DS.list.slice(from, to).forEach((a, k) => tracksFor(a).then(l => { if (tok === DS.buildTok && !hasPreview(l)) prune(from + k); }));
    DS.list.slice(from, to).forEach(a => { const im = new Image(); im.src = a.image; });   // covers warm before they spin in
  }

  /* ── playback + volume ────────────────────────────────────────────────── */
  function audio() {
    if (!DS.audio) {
      const a = new Audio();
      a.preload = 'auto';
      a.crossOrigin = 'anonymous';           // needed for the GainNode route (see the header)
      a.setAttribute('playsinline', '');
      a.addEventListener('ended', () => nextSong());
      a.addEventListener('playing', () => paintPlaying(true));
      a.addEventListener('pause', () => paintPlaying(false));
      DS.audio = a;
    }
    return DS.audio;
  }
  // Inside a tap only: build (once) and wake the GainNode route.
  function wakeVolume() {
    const el = audio();
    if (!DS.ctx) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        const ctx = new AC();
        const gain = ctx.createGain();
        const an = ctx.createAnalyser();          // before the gain: the levels don't follow the volume
        an.fftSize = 256; an.smoothingTimeConstant = 0.72;
        ctx.createMediaElementSource(el).connect(an);
        an.connect(gain);
        gain.connect(ctx.destination);
        DS.ctx = ctx; DS.gain = gain; DS.an = an; DS.bins = new Uint8Array(an.frequencyBinCount);
      } catch (e) { DS.ctx = null; DS.gain = null; }
    }
    if (DS.ctx && DS.ctx.state !== 'running') DS.ctx.resume().catch(() => {});
    applyVolume();
  }
  function applyVolume() {
    const el = audio();
    if (DS.gain) { DS.gain.gain.value = DS.vol; el.volume = 1; }
    else el.volume = DS.vol;
  }

  /* THE LEVEL LINE (round 13) — the progress line along the card's bottom
     edge. Ahead of the playhead it is the old flat grey line. Behind it is a
     filled area in the album's colour whose top edge is a smooth vector line:
     at each point along the line it holds the loudness the song had when the
     playhead passed there, so the peaks stay put and the area grows as the
     preview plays through. Levels are an average of the AnalyserNode's
     spectrum, recorded per slot (LV_N across the width) and reset per song.
     Without an analyser it is a plain progress bar. */
  const LV_N = 160, LINE_H = 3;
  function lvReset() { DS.lv = new Float32Array(LV_N); DS.lvAt = -1; DS.parts = []; }
  function lvLevel() {
    if (!DS.an || !DS.bins) return 0;
    DS.an.getByteFrequencyData(DS.bins);
    const n = Math.floor(DS.bins.length * 0.7);
    let sum = 0;
    for (let k = 1; k < n; k++) sum += DS.bins[k];
    return sum / ((n - 1) * 255);                   // raw loudness; drawViz scales it per song
  }
  /* Round 14 (Eric: "the vector shape sucks ... it can be stylized ...
     a dot effect at the peaks so it sprinkles upwards ... point clouds or
     fluid"): the played part is a LIQUID ribbon — the recorded levels
     smoothed hard (moving average, then Catmull-Rom curves), a slow ripple
     running along its top so it never sits still, a gradient fill and a soft
     glow — and the playhead throws SPARKS: little dots that rise, drift and
     fade, more of them the louder the moment. Old peaks shed the odd spark
     too, so the whole line breathes. Accuracy was traded for feel on purpose.
     The canvas is taller than the line (.ds-viz) to give the sparks air;
     reduce motion keeps the ribbon and drops the sparks and the ripple. */
  const SPARK_MAX = 160;
  function drawViz() {
    DS.raf = requestAnimationFrame(drawViz);
    const card = cardAt(DS.active), cv = card && card.querySelector('.ds-viz');
    if (!cv) return;
    const dpr = window.devicePixelRatio || 1, W = cv.clientWidth, H = cv.clientHeight;
    if (!W || !H) return;
    if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) {
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    }
    const g = cv.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    if (!DS.lv) lvReset();
    const calm = document.documentElement.classList.contains('sd-reduce-motion');
    const el = DS.audio, playing = !!(el && !el.paused);
    const prog = el && el.duration ? Math.min(1, el.currentTime / el.duration) : 0;
    const at = Math.min(LV_N - 1, Math.floor(prog * LV_N));
    let now = 0;
    if (playing && at >= 0) {
      now = lvLevel();
      const from = DS.lvAt < 0 || DS.lvAt > at ? at : DS.lvAt + 1;
      for (let k = from; k <= at; k++) DS.lv[k] = Math.max(DS.lv[k], now);
      DS.lvAt = at;
    }
    const star = card.style.getPropertyValue('--ds-star') || '#e8a83c';
    const base = H - LINE_H;                          // the line's top edge
    const px = prog * W;
    // ahead: the flat grey line
    g.fillStyle = 'rgba(255,255,255,.18)';
    g.fillRect(px, base, W - px, LINE_H);

    // recorded levels → this song's own range → smoothed heights
    const last = Math.max(0, Math.ceil(prog * LV_N) - 1);
    let lo = 1, hi = 0;
    for (let k = 0; k <= last; k++) { const v = DS.lv[k]; if (v > 0) { lo = Math.min(lo, v); hi = Math.max(hi, v); } }
    const span = Math.max(0.04, hi - lo), ROOM = 28;
    const norm = v => v > 0 ? Math.min(1, (v - lo) / span) : 0;
    const raw = [];
    for (let k = 0; k <= last; k++) raw.push(DS.lv[k] > 0 ? 0.24 + 0.76 * Math.pow(norm(DS.lv[k]), 1.15) : 0);
    const sm = raw.map((_, k) => {                    // 7-wide moving average: soft hills, not spikes
      let s2 = 0, n = 0;
      for (let j = Math.max(0, k - 3); j <= Math.min(raw.length - 1, k + 3); j++) { s2 += raw[j]; n++; }
      return s2 / n;
    });
    const t = performance.now() / 1000;
    const pts = [];
    const STEP = 3;                                   // every 3rd slot is a curve point
    for (let k = 0; k < sm.length; k += STEP) {
      const x = Math.min(px, (k + 0.5) * W / LV_N);
      const ripple = calm ? 0 : Math.sin(x * 0.07 - t * 3.2) * 1.2 * sm[k];
      pts.push([x, base - sm[k] * ROOM + ripple]);
    }
    if (px > 0) {
      const endY = base - (sm.length ? sm[sm.length - 1] : 0) * ROOM;
      pts.push([px, endY]);
      // the ribbon: Catmull-Rom through the points, closed down to the baseline
      const edge = new Path2D();                    // the curve alone (stroked as the glowing top edge)
      edge.moveTo(0, pts[0][1]);
      for (let k = 0; k < pts.length - 1; k++) {
        const p0 = pts[Math.max(0, k - 1)], p1 = pts[k], p2 = pts[k + 1], p3 = pts[Math.min(pts.length - 1, k + 2)];
        edge.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6,
                           p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]);
      }
      const path = new Path2D(edge);                // …and closed down to the baseline as the body
      path.lineTo(px, H); path.lineTo(0, H); path.closePath();
      const grad = g.createLinearGradient(0, base - ROOM, 0, H);
      grad.addColorStop(0, star);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      g.save();
      g.globalAlpha = 0.35; g.fillStyle = star; g.fill(path);      // the body
      g.globalAlpha = 0.85; g.fillStyle = grad; g.fill(path);      // brighter toward the crest
      g.globalAlpha = 1; g.shadowColor = star; g.shadowBlur = 8;
      g.strokeStyle = star; g.lineWidth = 1.6; g.lineJoin = 'round'; g.stroke(edge);
      g.restore();
      // a solid line along the bottom so the played length still reads as progress
      g.fillStyle = star;
      g.fillRect(0, base, px, LINE_H);
      // the playhead: a small bright bead
      g.beginPath(); g.arc(px, endY, 2.2, 0, Math.PI * 2);
      g.fillStyle = '#fff'; g.globalAlpha = 0.9; g.fill(); g.globalAlpha = 1;
    }

    // sparks: born at the playhead on loud moments, the odd one off an old peak
    const P = DS.parts;
    if (!calm && playing) {
      if (sm.length > 6 && Math.random() < 0.25 && P.length < SPARK_MAX) {
        const k = Math.floor(Math.random() * sm.length);
        if (sm[k] > 0.55) P.push({ x: (k + 0.5) * W / LV_N, y: base - sm[k] * ROOM, vx: (Math.random() - 0.5) * 0.3,
                                   vy: -(0.25 + Math.random() * 0.5), life: 0.8, r: 0.6 + Math.random() });
      }
    }
    g.fillStyle = star;
    for (let k = P.length - 1; k >= 0; k--) {
      const q = P[k];
      q.x += q.vx; q.y += q.vy; q.vy *= 0.985; q.life -= 0.012;
      if (q.life <= 0 || q.y < 0) { P.splice(k, 1); continue; }
      g.globalAlpha = Math.min(1, q.life * 1.4);
      g.beginPath(); g.arc(q.x, q.y, q.r, 0, Math.PI * 2); g.fill();
    }
    g.globalAlpha = 1;
  }

  const cardAt = i => DS.scroller && DS.scroller.querySelector(`.ds-card[data-i="${i}"]`);

  function paintPlaying(on) {
    DS.scroller && DS.scroller.querySelectorAll('.ds-card.is-playing').forEach(c => c.classList.remove('is-playing'));
    const c = cardAt(DS.active);
    if (c && on) c.classList.add('is-playing');
    if (DS.root) DS.root.classList.toggle('is-playing', !!(c && on));   // the fixed CD spins
  }

  /* THE CD STAYS (round 20). Eric: swiping sent everything up at once and it
     was a lot. So there is ONE CD, .ds-fixcd, laid over the feed at the CD's
     place; the pages (background, score, title, songs) still swipe underneath,
     and each card's own disc is only an invisible spacer + tap target. When
     the album changes the old disc spins out and fades while the new one
     spins and fades in (.ds-fx.in / .out). Its box is read off the ACTIVE
     card's spacer (relative to the card, which fills the feed when snapped),
     so a two-line title nudging the CD a few px is followed with a glide. */
  function placeFixCd() {
    const fx = DS.root && DS.root.querySelector('.ds-fixcd'), c = cardAt(DS.active);
    const cd = c && c.querySelector('.ds-cd');
    if (!fx || !cd) return;
    const scale = c.getBoundingClientRect().height / (c.offsetHeight || 1) || 1;
    const cr = c.getBoundingClientRect(), r = cd.getBoundingClientRect();
    if (!r.width) return;
    fx.style.left = ((r.left - cr.left) / scale).toFixed(1) + 'px';
    fx.style.top = ((r.top - cr.top) / scale).toFixed(1) + 'px';
    fx.style.width = fx.style.height = (r.width / scale).toFixed(1) + 'px';
    ['--ds-base', '--ds-star', '--ds-accent'].forEach(v => { const x = c.style.getPropertyValue(v); if (x) fx.style.setProperty(v, x); });
    // ⚠ The FIRST placement must not animate (it would grow from 0 and Back's
    // cover glide would land on a dot): apply, flush, then turn the glide on.
    if (!fx.classList.contains('placed')) { void fx.offsetWidth; fx.classList.add('placed'); }
  }
  /* ⚠ A cover that had not LOADED yet left the disc see-through — just the
     hole and the sheen over the page, i.e. "the album doesn't cover the whole
     CD" (round 22). Now the new disc waits for its image to decode (600ms at
     most) before it spins in, the discs have a dark vinyl base under the
     art, and covers a few cards ahead are warmed in appendBatch. */
  function swapFixCd(a, first) {
    if (!a) return;
    const tok = ++DS.fxTok;
    const im = new Image();
    im.src = a.image;
    const ready = im.decode ? im.decode().catch(() => {}) : Promise.resolve();
    if (first) { swapFixCdNow(a, true); return; }
    Promise.race([ready, new Promise(r => setTimeout(r, 600))]).then(() => { if (tok === DS.fxTok) swapFixCdNow(a, false); });
  }
  function swapFixCdNow(a, first) {
    const fx = DS.root && DS.root.querySelector('.ds-fixcd');
    if (!fx || !a) return;
    const img = `url("${String(a.image).replace(/"/g, '%22')}")`;
    const cur = fx.querySelector('.ds-fx.cur'), nxt = [...fx.querySelectorAll('.ds-fx')].find(e => e !== cur);
    const calm = document.documentElement.classList.contains('sd-reduce-motion');
    if (first || calm) {
      cur.querySelector('.ds-disc').style.backgroundImage = img;
      fx.querySelectorAll('.ds-fx').forEach(e => e.classList.remove('in', 'out'));
      return;
    }
    nxt.querySelector('.ds-disc').style.backgroundImage = img;
    cur.classList.remove('cur', 'in'); cur.classList.add('out');
    nxt.classList.remove('out'); nxt.classList.add('cur', 'in');
    clearTimeout(DS.fxT);
    DS.fxT = setTimeout(() => fx.querySelectorAll('.ds-fx').forEach(e => e.classList.remove('in', 'out')), 560);
  }
  function paintTrack(card, n) {
    card.querySelectorAll('.ds-tr.on').forEach(li => li.classList.remove('on'));
    const li = card.querySelector(`.ds-tr[data-n="${n}"]`);
    if (li) li.classList.add('on');
  }

  function playTrack(i, n, startAt) {
    const a = DS.list[i], card = cardAt(i);
    if (!a || !card) return;
    const gen = ++DS.gen;
    const el = audio();
    el.pause();
    tracksFor(a).then(list => {
      if (gen !== DS.gen || !DS.root) return;
      if (!hasPreview(list)) { prune(i); return; }   // nothing to play: the next album takes its place
      if (n == null) { const first = list && ordered(list).find(t => t.preview); DS.track = first ? first.n : -1; }
      else DS.track = n;
      paintTracks(card, list);
      const t = list && list[DS.track];
      if (!t || !t.preview) return;
      paintTrack(card, DS.track);
      el.src = t.preview;
      lvReset();                                    // the level line starts over with each song
      if (startAt > 0) el.addEventListener('loadedmetadata', () => { try { el.currentTime = startAt; } catch (e) {} }, { once: true });
      applyVolume();
      el.play().catch(() => {});
    });
  }

  function setActive(i) {
    if (i === DS.active) return;
    const first = DS.active === -1;                // a fresh deal (-2 = a pruned card handing over)
    DS.active = i;
    swapFixCd(DS.list[i], first);
    placeFixCd();
    DS.track = -1;
    const r = DS.landing;
    if (r && r.i === i) { DS.landing = null; playTrack(i, r.n, r.t); }
    else playTrack(i);
    if (i >= DS.shown - 3) appendBatch();
    // the screen behind takes this album's colours too, like the deck does
    const a = DS.list[i], host = DS.root && DS.root.parentElement;
    if (a && host && typeof applyAlbumColorsUrl === 'function') applyAlbumColorsUrl(host, a.image);
  }

  /* When a preview ends, the next song in the list's current order plays
     (round 9: "take you through the songs ... until u swipe"); after the last
     one it wraps to the first. The album only changes on a swipe. */
  function nextSong() {
    const i = DS.active, a = DS.list[i], card = cardAt(i);
    const list = a && cachedTracks(a);
    if (!list || !card) return;
    const ord = ordered(list).filter(t => t.preview);
    if (!ord.length) return;
    const at = ord.findIndex(t => t.n === DS.track);
    const t = ord[(at + 1) % ord.length];
    playTrack(i, t.n);
    const ol = card.querySelector('.ds-tracks'), li = ol && ol.querySelector(`.ds-tr[data-n="${t.n}"]`);
    if (li) ol.scrollTo({ top: Math.max(0, li.offsetTop - 32), behavior: 'smooth' });
  }

  /* ── open / close ─────────────────────────────────────────────────────── */
  window.sdDoomOpen = function (btn, resume) {
    const host = (btn && btn.closest('.app-screen')) || document.querySelector('.s-wall2');
    if (!host) return;
    window.sdDoomClose();
    // Unlock audio INSIDE this tap, or iOS refuses the play() that comes later.
    const el = audio();
    wakeVolume();
    try { if (typeof silentClipUrl === 'function') { el.src = silentClipUrl(); el.play().catch(() => {}); } } catch (e) {}

    const root = document.createElement('div');
    root.className = 'ds-root';
    root.innerHTML = shellHtml();
    root.addEventListener('click', e => {
      e.stopPropagation();
    });
    host.classList.add('ds-host');
    host.appendChild(root);
    DS.root = root;
    DS.scroller = root.querySelector('.ds-scroll');
    DS.scroller.addEventListener('click', e => {
      const like = e.target.closest('.ds-tr-like');
      if (like) {                                   // the song's heart: favourite it, don't play it
        e.stopPropagation();
        const card = like.closest('.ds-card'), a = DS.list[+card.dataset.i];
        const t = (cachedTracks(a) || [])[+like.dataset.n];
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
      const i = +li.closest('.ds-card').dataset.i;
      if (i !== DS.active) return;
      e.stopPropagation(); haptic();
      playTrack(i, +li.dataset.n);
    });
    DS.scroller.addEventListener('scroll', e => {     // scroll doesn't bubble: catch the song lists' own
      if (e.target.classList && e.target.classList.contains('ds-tracks')) fadeTracks(e.target);
    }, true);
    deal(resume);
    cancelAnimationFrame(DS.raf);
    DS.raf = requestAnimationFrame(drawViz);
    if (resume) {
      root.classList.add('ds-instant', 'open');               // no fade: the cover glides into the CD…
      if (resume.reveal) circleReveal(root);                 // …or, with no cover in sight, a circle opens out of it
    }
    else requestAnimationFrame(() => root.classList.add('open'));
  };

  /* The circle reveal: the feed opens as a circle growing out of the CD's
     centre (clip-path), so coming back from the reviews / artist page still
     reads as "back into the CD". Reduced motion: it just appears. */
  function circleReveal(root) {
    if (document.documentElement.classList.contains('sd-reduce-motion')) return;
    const at = () => {
      const c = cardAt(DS.active) || cardAt(0), disc = c && c.querySelector('.ds-disc');
      const R = root.getBoundingClientRect(), d = disc && disc.getBoundingClientRect();
      if (!d || !d.width) return '50% 40%';
      return ((d.left + d.width / 2 - R.left) / R.width * 100).toFixed(1) + '% ' + ((d.top + d.height / 2 - R.top) / R.height * 100).toFixed(1) + '%';
    };
    root.style.clipPath = 'circle(0% at 50% 40%)';
    requestAnimationFrame(() => {
      const o = at();
      root.animate([{ clipPath: `circle(14% at ${o})` }, { clipPath: `circle(150% at ${o})` }],
                   { duration: 520, easing: 'cubic-bezier(.3,0,.2,1)' });
      root.style.clipPath = '';
    });
  }

  function build(resume) {
    if (DS.obs) DS.obs.disconnect();
    DS.list = listFor();
    DS.buildTok = (DS.buildTok || 0) + 1;
    DS.landing = null;
    DS.shown = 0; DS.active = -1; DS.gen++;
    DS.scroller.innerHTML = DS.list.length ? '' :
      '<div class="ds-empty">No albums in these genres yet.<br><button onclick="event.stopPropagation(); sdDoomGenreSheet()">Pick other genres</button></div>';
    DS.scroller.scrollTop = 0;
    DS.obs = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) setActive(+en.target.dataset.i); });
    }, { root: DS.scroller, threshold: 0.6 });
    appendBatch();
    if (resume) {                                   // land back on the album (and song, and second) you left
      const i = DS.list.findIndex(a => a.artist + '|' + a.album === resume.key);
      if (i > 0) {
        while (DS.shown <= i && DS.shown < DS.list.length) appendBatch();
        const c = cardAt(i);
        if (c) DS.scroller.scrollTop = c.offsetTop;
      }
      if (i >= 0) DS.landing = { i, n: resume.n, t: resume.t };
    }
  }

  window.sdDoomClose = function () {
    DS.gen++;
    cancelAnimationFrame(DS.raf);
    if (DS.audio) { DS.audio.pause(); DS.audio.removeAttribute('src'); }
    if (DS.obs) { DS.obs.disconnect(); DS.obs = null; }
    clearInterval(DS.watch);
    document.querySelectorAll('.ds-host').forEach(h => h.classList.remove('ds-host'));
    if (DS.root) DS.root.remove();
    DS.root = DS.scroller = null;
    DS.active = -1;
  };

  // Songs: Popular (Deezer rank) ⇄ Chronological (album order). Remembered.
  window.sdDoomSongSort = function (id) {
    if (!DS.root || id === DS.songSort) return;
    DS.songSort = id;
    store.set(SORT_KEY, id);
    haptic();
    DS.scroller.querySelectorAll('.ds-card').forEach(card => {
      card.querySelectorAll('.ds-ss').forEach(b => b.classList.toggle('on', b.dataset.s === id));
      const list = cachedTracks(DS.list[+card.dataset.i]);
      if (list) paintTracks(card, list);
    });
  };

  /* THE GENRE SHEET (round 10): a bottom sheet with the full list, the wall
     picker's behaviour — tap a main to pick it and open its subgenres, tap a
     sub to toggle it; nothing changes until Pick genres. All genres clears. */
  function paintGenres() {
    const box = DS.root && DS.root.querySelector('.ds-glist');
    if (!box) return;
    const T = GENRE_TREE();
    const bub = (g, cls, fn) => `<button class="ds-gb${cls}" data-g="${esc(g)}" onclick="${fn}(this.dataset.g)">${esc(g)}</button>`;
    box.innerHTML = Object.keys(T).map(m => {
      const on = DS.gpick.has(m), open = DS.gopen.has(m);
      const lit = !on && (T[m] || []).some(g => DS.gpick.has(g));
      const subs = (T[m] || []).filter(x => x.toLowerCase() !== m.toLowerCase());
      return bub(m, (on ? ' on' : lit ? ' lit' : '') + (open ? ' open' : ''), 'sdDoomGenreMain') +
        (open ? `<div class="ds-gsubs">${subs.map(x => bub(x, DS.gpick.has(x) ? ' on' : '', 'sdDoomGenreSub')).join('')}</div>` : '');
    }).join('');
    const n = DS.gpick.size, go = DS.root.querySelector('.ds-ggo');
    go.hidden = !n; go.textContent = n > 1 ? `Pick ${n} genres` : 'Pick genres';
  }
  window.sdDoomGenreSheet = function () {
    if (!DS.root) return;
    DS.gpick = new Set(DS.mode === 'genres' ? DS.genres : []); DS.gopen = new Set();
    paintGenres();
    const sh = DS.root.querySelector('.ds-gsheet');
    sh.hidden = false;
    requestAnimationFrame(() => sh.classList.add('open'));
    haptic();
  };
  window.sdDoomGenreClose = function () {
    const sh = DS.root && DS.root.querySelector('.ds-gsheet');
    if (!sh || sh.hidden) return;
    sh.classList.remove('open');
    setTimeout(() => { if (!sh.classList.contains('open')) sh.hidden = true; }, 260);
  };
  window.sdDoomGenreMain = function (m) {
    if (DS.gopen.has(m)) { DS.gopen.delete(m); DS.gpick.delete(m); }
    else { DS.gopen.add(m); DS.gpick.add(m); }
    paintGenres(); haptic();
  };
  window.sdDoomGenreSub = function (g) {
    DS.gpick.has(g) ? DS.gpick.delete(g) : DS.gpick.add(g);
    paintGenres(); haptic();
  };
  function paintModeBtns() {
    if (!DS.root) return;
    DS.root.querySelector('.ds-fybtn').classList.toggle('on', DS.mode === 'foryou');
    DS.root.querySelector('.ds-genbtn').classList.toggle('on', DS.mode === 'genres');
  }
  // Deal the feed for the current mode. A thin shelf asks Deezer (or the cache)
  // first, behind a loader; a newer deal wins over a slow older one.
  function deal(resume) {
    paintModeBtns();
    const picks = activePicks();
    if (!picks.length || exactMatches(picks).length >= GF_ENOUGH) { build(resume); return; }
    const tok = ++DS.gfTok;
    DS.gen++;
    if (DS.obs) DS.obs.disconnect();
    DS.scroller.innerHTML = `<div class="ds-empty"><span class="ds-spin"></span>Finding ${esc(genreLabel())} albums…</div>`;
    const timeout = new Promise(r => setTimeout(r, 9000));
    Promise.race([topUpGenres(picks), timeout]).then(() => {
      if (tok !== DS.gfTok || !DS.root) return;
      build(resume);
    });
  }
  function applyGenres(list) {
    DS.genres = list;
    DS.mode = list.length ? 'genres' : 'all';
    window.sdDoomGenreClose();
    if (DS.audio) DS.audio.pause();
    haptic();
    deal();
  }
  window.sdDoomForYou = function () {
    if (!DS.root) return;
    window.sdDoomGenreClose();
    if (DS.mode === 'foryou') return;
    DS.mode = 'foryou';
    if (DS.audio) DS.audio.pause();
    haptic();
    deal();
  };
  window.sdDoomGenreCommit = function () { if (DS.root && DS.gpick.size) applyGenres([...DS.gpick]); };
  window.sdDoomGenreClear = function () { if (DS.root) applyGenres([]); };

  // The CD: pause / resume.
  window.sdDoomToggle = function (i) {
    if (i !== DS.active) return;
    const el = audio();
    haptic();
    wakeVolume();
    if (!el.src || DS.track < 0) { playTrack(i); return; }
    if (el.paused) el.play().catch(() => {}); else el.pause();
  };

  /* ── the score + the rail ─────────────────────────────────────────────── */
  function repaintState(i) {
    const a = DS.list[i], card = cardAt(i);
    if (!a || !card) return;
    const d = draftOf(a);
    card.querySelector('.ds-fav').classList.toggle('on', !!d.fav);
    card.querySelector('.ds-listened').classList.toggle('on', !!d.listened);
    card.querySelector('.ds-later').classList.toggle('on', !!d.later);
    card.querySelector('.ds-add').classList.toggle('on', d.rating > 0 || !!(d.text || '').trim());
    const sc = card.querySelector('.ds-score');
    sc.classList.toggle('is-mine', d.rating > 0);
    sc.innerHTML = scoreInner(a, d);
  }

  window.sdDoomFav = function (btn, i) {
    const a = DS.list[i];
    if (!a || typeof writeDraftFlag !== 'function') return;
    const on = !draftOf(a).fav;
    writeDraftFlag(subjOf(a), 'fav', on);
    btn.classList.toggle('on', on);
    if (on) { btn.classList.remove('pop'); void btn.offsetWidth; btn.classList.add('pop'); }
    haptic();
  };

  // Listened / Listen later: the same flags as the review sheet and the album page's row.
  window.sdDoomFlag = function (btn, i, k) {
    const a = DS.list[i];
    if (!a || typeof writeDraftFlag !== 'function') return;
    const on = !draftOf(a)[k];
    writeDraftFlag(subjOf(a), k, on);
    btn.classList.toggle('on', on);
    haptic();
  };

  // Quick rate on the discs under the big number: the left half of a disc is a
  // half. Tap your own rating again to clear it.
  window.sdDoomRate = function (e, i) {
    const star = e.target.closest('.ds-star');
    const a = DS.list[i];
    if (!star || !a || typeof writeDraftFlag !== 'function') return;
    const r = star.getBoundingClientRect();
    let v = +star.dataset.v - ((e.clientX - r.left) < r.width / 2 ? 0.5 : 0);
    if (draftOf(a).rating === v) v = 0;
    writeDraftFlag(subjOf(a), 'rating', v);
    haptic();
    repaintState(i);
  };

  window.sdDoomReview = function (btn, i) {
    const a = DS.list[i];
    if (!a || typeof openLogSheet !== 'function') return;
    openLogSheet(btn, Object.assign(subjOf(a), { ref: a }));
    // the sheet can change the rating / heart — repaint once it closes
    clearInterval(DS.watch);
    DS.watch = setInterval(() => {
      if (document.querySelector('.sd-log-overlay.open')) return;
      clearInterval(DS.watch);
      repaintState(i);
    }, 400);
  };

  /* REVIEWS → the album page, glided down to its reviews (as the wall's "See
     all reviews" does), and Back lands you here again — same genres, same
     album, same song, same second (round 10).
     openAlbumPage from Trending navigates HOME and pushes Trending's snapshot
     onto backStack (a top-level let in app.js — reachable by name, not on
     window). Back re-renders Trending from scratch, which drops this overlay,
     so the goBack wrapper below re-opens it once THAT snapshot is popped. A
     nav-tab tap clears the stack and the pending resume with it. */
  // mode: 'reviews' (the rail's button: album page, glided to its reviews) ·
  // 'album' (the title) · 'artist' (the artist's name). Back returns here in all three.
  window.sdDoomOpenAlbum = function (i, mode) {
    const a = DS.list[i];
    if (!a || typeof openAlbumPage !== 'function') return;
    if (mode === 'artist' && typeof openArtistPageFor !== 'function') return;
    const el = DS.audio;
    DS.resume = {
      key: a.artist + '|' + a.album, n: DS.track, t: el && !isNaN(el.currentTime) ? el.currentTime : 0,
      genres: DS.genres.slice(), mode: DS.mode,
      depth: typeof backStack !== 'undefined' ? backStack.length : 0,
    };
    hookCoverHome();
    window.sdDoomClose();
    if (mode === 'artist') { openArtistPageFor(a.artist); return; }
    openAlbumPage(a);
    if (mode !== 'album') setTimeout(() => { if (typeof fbGlideToReviews === 'function') fbGlideToReviews(); }, 450);
  };
  function resumeDoom(st, tries) {
    const btn = [...document.querySelectorAll('.s-wall2 .ds-swipe, .s-wall2 .ds-entry')].find(e => e.offsetParent !== null);
    if (!btn) { if ((tries || 0) < 40) setTimeout(() => resumeDoom(st, (tries || 0) + 1), 60); return; }
    DS.genres = st.genres; DS.mode = st.mode || 'foryou';
    activePicks().forEach(g => { const h = gcRead()[g.toLowerCase()]; if (h) adoptGenre(g, h.albums); });
    window.sdDoomOpen(btn, st);
  }
  const _goBack = window.goBack;
  if (typeof _goBack === 'function') {
    window.goBack = function () {
      /* Is the album page's cover on screen as Back is pressed? Only then can
         it glide into the CD. Scrolled down to the reviews (the Reviews
         button) or on the artist page, the cover is out of sight — a glide
         would drop in from off the top — so the feed opens with a CIRCLE
         REVEAL out of the CD instead (round 18). Measured BEFORE the real
         goBack, while the page is still there. */
      const cover = [...document.querySelectorAll('.s-home-v3--album:not(.s-home-v3--artist) .v3-album')].find(e => e.offsetParent);
      const r = cover && cover.getBoundingClientRect();
      const coverSeen = !!(r && r.width && r.bottom > 80 && r.top < window.innerHeight - 80);
      const out = _goBack.apply(this, arguments);
      const st = DS.resume;
      if (st && typeof backStack !== 'undefined' && backStack.length <= st.depth) {
        DS.resume = null;
        st.reveal = !coverSeen;
        DS.landingMorph = coverSeen;                  // the cover's glide aims at our CD
        setTimeout(() => { DS.landingMorph = false; }, 1200);
        setTimeout(() => resumeDoom(st), 0);
      }
      return out;
    };
  }
  /* BACK INTO THE CD (round 16). Back from an album page runs morph.js:
     the cover glides to wherever sdFindCoverHome says it came from — the
     Trending deck's front card. While a scroll-mode resume is pending the
     answer is this feed's CD instead, so the square cover shrinks into the
     disc and rounds into a circle as it lands (the disc is 50% round, and
     the ghost animates border-radius to the target's). The finder returns
     nothing until the feed has re-opened on that album; morph.js polls it. */
  /* ⚠ Hooked LAZILY (from sdDoomOpenAlbum): morph.js loads AFTER this file,
     so at load time there is no sdFindCoverHome to wrap. */
  function hookCoverHome() {
    const f = window.sdFindCoverHome;
    if (typeof f !== 'function' || f._ds) return;
    const wrapped = function (album) {
      if (DS.resume) return null;                   // leaving for a review-scrolled page: no glide target yet
      if (DS.landingMorph) {
        const c = DS.root && cardAt(DS.active);
        return c && DS.list[DS.active] === album ? DS.root.querySelector('.ds-fixcd .ds-fx.cur .ds-disc') : null;
      }
      return f.apply(this, arguments);
    };
    wrapped._ds = true;
    window.sdFindCoverHome = wrapped;
  }

  const _navTab = window.sdNavTab;
  if (typeof _navTab === 'function') {
    window.sdNavTab = function () { DS.resume = null; return _navTab.apply(this, arguments); };
  }

  /* REVIEWS WHILE YOU LISTEN (round 22). The left rail's Reviews opens a sheet
     over the lower part of the feed — the CD keeps spinning above it and the
     preview keeps playing. The cards are the album page's own
     (populateReviewList, given the panel as its "screen": it only needs
     _album and a .v3-rev-list inside), so likes, threads and the review popup
     (z 220, above this overlay) all work. "Album page ›" is the old route. */
  window.sdDoomReviews = function (i) {
    const a = DS.list[i], sh = DS.root && DS.root.querySelector('.ds-rsheet');
    if (!a || !sh || typeof populateReviewList !== 'function') return;
    const panel = sh.querySelector('.ds-rpanel');
    panel._album = a;
    DS.rsheetI = i;
    populateReviewList(panel, 'popular');
    sh.querySelector('.ds-rbody').scrollTop = 0;
    sh.hidden = false;
    requestAnimationFrame(() => sh.classList.add('open'));
    haptic();
  };
  window.sdDoomReviewsClose = function () {
    const sh = DS.root && DS.root.querySelector('.ds-rsheet');
    if (!sh || sh.hidden) return;
    sh.classList.remove('open');
    setTimeout(() => { if (!sh.classList.contains('open')) sh.hidden = true; }, 280);
  };
  window.sdDoomReviewsPage = function () {
    const i = DS.rsheetI;
    window.sdDoomReviewsClose();
    if (i != null) window.sdDoomOpenAlbum(i);
  };

  /* Anything that navigates away while the feed is up (a face in a review →
     that profile) takes the feed down first, or the preview would keep
     playing over the next screen. */
  const _navigate = window.navigate;
  if (typeof _navigate === 'function') {
    window.navigate = function () {
      if (DS.root) window.sdDoomClose();
      return _navigate.apply(this, arguments);
    };
  }

  window.sdDoomService = function (btn, i, svc) {
    const a = DS.list[i];
    if (a && typeof serviceGo === 'function') serviceGo(btn, svc, a, null);
  };
})();
