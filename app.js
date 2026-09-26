// ============================================================
//  APP.JS — Viewer (desktop) + Prototype (mobile) + Variants
// ============================================================

const SVG_SIGNAL = `<svg viewBox="0 0 17 12" width="17" height="12" fill="currentColor"><rect x="0" y="9" width="3" height="3" rx="1"/><rect x="4.5" y="6" width="3" height="6" rx="1"/><rect x="9" y="3" width="3" height="9" rx="1"/><rect x="13.5" y="0" width="3" height="12" rx="1"/></svg>`;
const SVG_WIFI   = `<svg viewBox="0 0 16 12" width="16" height="12" fill="none" stroke="currentColor" stroke-linecap="round"><circle cx="8" cy="11" r="1.2" fill="currentColor" stroke="none"/><path d="M5.2 8.2 Q8 6 10.8 8.2" stroke-width="1.4"/><path d="M2.5 5.5 Q8 1.5 13.5 5.5" stroke-width="1.4"/></svg>`;
const SVG_BATTERY= `<svg viewBox="0 0 25 12" width="25" height="12" fill="currentColor"><rect x="0" y="1.5" width="21" height="9" rx="2.5" stroke="currentColor" stroke-width="1.5" fill="none"/><rect x="22" y="4" width="2.5" height="4" rx="1"/><rect x="2" y="3.5" width="15" height="5" rx="1.5"/></svg>`;

// ── State ─────────────────────────────────────────────────────
let currentIdx   = 2;
let viewMode     = 'single';
let isMobile     = false;
let navHistory   = [];
let variantState = { home: 0 };      // v3.0 dark, index 0 after filter
let _dragActive  = false;

/* ALTS (Eric, 2026-09-25) — the comparison phones. A variant marked `alt: true`
   (home's Compact and Review-first, screens.js) is on stage only while this is
   on; the toolbar switch beside Free | Pro flips it and it survives a reload.
   ⚠ A viewer control like the plan, not app state: nothing in a phone reads it. */
const ALT_KEY = 'spindeck-alt';
/* USER TESTING (Eric, 2026-09-25): the desktop viewer opens with none of the
   dev chrome — no persona / plan / Alts switches, no prev · next, no zoom or
   tool buttons, no left page rail, no recs bar. `?tools` on the URL brings
   all of it back (body.sd-tools; style.css hides `.tb-dev`, #page-nav and
   #recbox without it), the same switch the mobile side has had since 09-18.
   What testers get instead is Patch notes + Feedback (patchnotes.js). */
const SD_TOOLS = /[?&]tools/.test(location.search);
let SD_ALT = false;
try { SD_ALT = SD_TOOLS && localStorage.getItem(ALT_KEY) === '1'; } catch (e) {}   // the comparison phones are a tool
// The variants of a screen that are on stage right now, each with its REAL
// index — `pickVariant` / `setVariant` index into `s.variants`, so hiding a
// column must not renumber the ones beside it.
function stageVariants(s) {
  const all = s.variants.map((v, i) => ({ v, i })).filter(x => SD_ALT || !x.v.alt);
  // ONE PHONE for user testing (Eric, 2026-09-25): without ?tools only the
  // active variant is on stage — home's Float·Dark unless something picked
  // another. The tools bring the side-by-side columns back.
  if (!SD_TOOLS) { const one = all.find(x => x.i === getVariantIdx(s)) || all[0]; return one ? [one] : []; }
  return all;
}

// ── Helpers ───────────────────────────────────────────────────
function currentScreen()  { return SCREENS[currentIdx]; }
function getVariantIdx(s) {
  const i = variantState[s.id] || 0;
  // An alt column that was active when the switch went off → back to the first.
  const v = s.variants[i];
  return (v && v.alt && !SD_ALT) ? 0 : i;
}
function getVariant(s)    { const i = getVariantIdx(s); return s.variants[Math.min(i, s.variants.length-1)]; }

// ── Init ─────────────────────────────────────────────────────
// ── Fillet PNG masks ──────────────────────────────────────────
let filletBLUrl = null, filletTLUrl = null;

function stripWhite(src) {
  return new Promise(res => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const d = ctx.getImageData(0, 0, c.width, c.height);
      for (let i = 0; i < d.data.length; i += 4) {
        if (d.data[i] > 200 && d.data[i+1] > 200 && d.data[i+2] > 200) d.data[i+3] = 0;
      }
      ctx.putImageData(d, 0, 0);
      res(c.toDataURL());
    };
    img.onerror = () => res(null);
    img.src = src;
  });
}

async function initFillets() {
  try {
    [filletBLUrl, filletTLUrl] = await Promise.all([
      stripWhite('images/topbox.png'),
      stripWhite('images/bottombox.png'),
    ]);
    applyFilletMasks();
  } catch(e) {}
}

function applyFilletMasks() {
  if (!filletBLUrl || !filletTLUrl) return;
  let styleEl = document.getElementById('v3-fillet-mask-style');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'v3-fillet-mask-style';
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = `
    .v3-fillet-bl::after {
      -webkit-mask-image: url(${filletBLUrl});
      mask-image: url(${filletBLUrl});
    }
    .v3-fillet-tl::after {
      -webkit-mask-image: url(${filletTLUrl});
      mask-image: url(${filletTLUrl});
    }
  `;
}

function init() {
  // Show only v3.x home variants (v1/v2 retired)
  const homeScreen = SCREENS.find(s => s.id === 'home');
  if (homeScreen) {
    // A phone has one home; the comparison alts are a desktop thing.
    const phone = window.matchMedia('(max-width: 767px)').matches;
    homeScreen.variants = homeScreen.variants.filter(
      v => v.version && v.version >= 'v3.0' && !(phone && v.alt)
    );
  }

  isMobile = window.matchMedia('(max-width: 767px)').matches;
  document.body.classList.toggle('sd-tools', SD_TOOLS);   // the dev chrome, only with ?tools

  const params = new URLSearchParams(window.location.search);
  const p = params.get('screen');
  if (p) { const i = SCREENS.findIndex(s => s.id === p); if (i !== -1) currentIdx = i; }

  /* Before the first render: the plan decides what some screens are made of
     (see PLAN above), so `body.sd-pro` has to be on before anything paints. */
  initPlan();
  initTags();          // before the first render: the picker and shop read it

  if (isMobile) { initMobile(); } else { initViewer(); }
  initFillets();
  // After the first render: fills the persona switcher and, if one was in use
  // last visit, swaps the catalogue over to it (which re-renders).
  initPersonas();
  if (!isMobile) { initDevBox(); initRecBox(); }
}

/* ⚠️ NO AUTOPLAY, and not because it is hard. Previews were briefly armed by the
   first touch of the phone (a browser will not allow sound before one — `play()`
   before a gesture is rejected, and iOS additionally needs the element itself
   played once inside a real gesture, which is what `unlockAudio` is for). It
   worked, and it is not what this app is: music that starts on its own is a
   thing to switch off, not a feature. The row in the CD's menu is the whole of
   it — you ask for a preview, you get one. Don't wire this back up.
   The service handoff is what the CD is for: see LISTEN ON above. */

// ============================================================
//  DESKTOP VIEWER
// ============================================================
function initViewer() {
  renderViewer();
  bindViewerEvents();
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  navigatePrev();
    if (e.key === 'ArrowRight') navigateNext();
  });
  /* ⚠️ Must be renderViewer, NOT renderSingle. renderSingle only rebuilds the
     phones from their static templates — every screen comes back with the
     placeholder cover baked into the markup and no data. Calling it alone left
     the album art stuck on `images/album-crystalcastles1.png` and `_albumIdx`
     undefined, which looked exactly like the colour extraction being broken. */
  window.addEventListener('resize', debounce(() => {
    if (viewMode === 'single') renderViewer();
  }, 100));
}

function renderViewer() {
  if (viewMode === 'single') renderSingle();
  else                        renderMulti();
  renderThumbs();
  updateToolbar();
  // renderSingle/renderMulti rebuild the screens from scratch, so the active
  // persona's class has to be stamped back on before anything paints.
  if (typeof applyPersonaClass === 'function') applyPersonaClass();
  requestAnimationFrame(paintAfterRender);
}

/* Everything that has to run against the freshly-built screens. Kept separate
   so any path that rebuilds the DOM can re-run it — a rebuild without this is
   a screen full of placeholder markup. */
/* ═══════════════════════════════════════════════════════════════════
   VIDEO COVERS — play only what is on screen (`plVideoWatch`)
   ═══════════════════════════════════════════════════════════════════
   ⚠️ This is why the markup ships no `autoplay`. A wall of ten cards can hold
   ten videos, and ten decoders running at once is what turns a scroll into a
   slideshow — on Eric's phone over 5G, the exact case this prototype exists to
   test. Nothing plays until it is actually visible, and it stops again on the
   way out.

   ⚠️ The root is `.v3-body`, the element that actually scrolls, NOT the
   viewport. In the desktop viewer the phone is a box on a page that never
   scrolls itself, so a viewport-rooted observer would report every card as
   permanently visible and play all ten. */
function plVideoWatch(screenEl) {
  const vids = screenEl.querySelectorAll('.pl2-art-vid');
  if (!vids.length || screenEl._vidWatch) return;
  const root = screenEl.querySelector('.v3-body');
  screenEl._vidWatch = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      const v = e.target;
      // `play()` rejects if the element is torn down mid-promise (a re-render
      // between the callback and the decode). Nothing to recover, so swallow it.
      if (e.isIntersecting) v.play().catch(() => {});
      else v.pause();
    });
  }, { root: root || null, rootMargin: '40px' });
  vids.forEach(v => screenEl._vidWatch.observe(v));
}

/* The phone takes its background from the screen it is showing, so the status
   bar and the home indicator sit on the app's own colour instead of on two
   black strips — see `.phone-screen` in style.css. One shot, after render:
   every screen's background is a theme token fixed per variant, not something
   that animates. Reads the FIRST child of `.screen-content`, which is the
   screen root (`.app-screen` / `.s-home-v3` / …). */
function paintPhoneChrome() {
  document.querySelectorAll('.phone-screen').forEach(ps => {
    const first = ps.querySelector('.screen-content > *');
    const bg = first && getComputedStyle(first).backgroundColor;
    const solid = bg && bg !== 'transparent' && !/^rgba\(.*,\s*0\)$/.test(bg);
    if (solid) ps.style.setProperty('--pscreen-bg', bg);
    else ps.style.removeProperty('--pscreen-bg');
    /* ⚠ The icons follow the COLOUR, not `statusTheme`. That flag is per screen,
       and a screen has a dark and a light variant — on a black phone white
       icons were right for both; on the app's own cream they vanish. So the
       time, the icons and the indicator go dark on a light background, read
       off the same colour the phone just took. */
    const m = solid && bg.match(/\d+(\.\d+)?/g);
    if (m && m.length >= 3) {
      const lum = (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / 255;
      ps.querySelectorAll('.status-bar, .home-indicator').forEach(el => el.classList.toggle('dark-icons', lum > 0.5));
    }
  });
}

function paintAfterRender() {
  paintPhoneChrome();
  document.querySelectorAll('.s-home-v3').forEach(el => populateHomeData(el));
  document.querySelectorAll('.s-pl2').forEach(plVideoWatch);
  document.querySelectorAll('.s-onboarding').forEach(obInit);
  applyFilletMasks();
  initScenes();   // the nav scoop's face — repainted whenever the shells are rebuilt
}

// ── Home screen data population ───────────────────────────────
function reloadCD(cdEl, newUrl) {
  cdEl.style.transition = 'top 0.14s ease-in';
  cdEl.style.top = '62%';
  setTimeout(() => {
    sdCover(cdEl, newUrl);
    cdEl.style.transition = 'top 0.22s cubic-bezier(0.34,1.28,0.64,1)';
    cdEl.style.top = '87.62%';
    setTimeout(() => { cdEl.style.top = ''; cdEl.style.transition = ''; }, 230);
  }, 150);
}

/* ── Progressive cover load ────────────────────────────────────
   Big pixels resolving into small ones while a cover is still on the wire.

   ⚠️ **It only runs when the image is actually slow.** If the picture decodes
   within `PIX_GRACE` — cache, wifi, a local file — the cover simply appears and
   none of this happens. An effect that fires every time is a gimmick, and on a
   fast connection it is worse than a gimmick: it is pure added latency, half a
   second of watching pixels resolve over a picture that had already arrived.

   ⚠️ **The placeholder is a real low-resolution FETCH, not a blur of something
   we already have.** Deezer serves every cover at any size off the same path
   (`…/<md5>/1000x1000-000000-80-0-0.jpg`), so rewriting that one segment gets a
   ~2KB thumbnail that lands almost immediately on a bad connection. That is
   what makes this progressive rather than decorative — there is genuinely more
   picture on screen sooner, which is the whole point on 5G. Local
   `images/album-*` files have no such variant; they also never trip the grace
   timer, so they never need one.

   ⚠️ **No `crossOrigin` here, deliberately** — unlike `computeAlbumColors`,
   which needs it to read pixels back. We only ever DRAW, and a tainted canvas
   draws fine. Setting it would make the cover fail outright on any host that
   doesn't send CORS headers. */
const PIX_GRACE = 190;                       // ms of patience before engaging at all
const PIX_STEPS = [5, 8, 13, 21, 34, 56];    // canvas backing-store size, coarse → fine
const PIX_MS    = 620;                       // time to walk the steps
const PIX_TINY  = 56;                        // thumbnail we fetch (matches the last step)
const PIX_SEEN  = new Set();                 // covers already resolved once — never again

function pixTinyUrl(url) {
  return /\/\d+x\d+-/.test(url)
    ? url.replace(/\/\d+x\d+-/, '/' + PIX_TINY + 'x' + PIX_TINY + '-') : null;
}

function sdCover(el, url) {
  if (!el || !url) return;
  if (el._pixStop) el._pixStop();            // a swipe can outrun the last load
  const paint = () => { el.style.backgroundImage = `url('${url}')`; };

  // Seen it already, or the user asked for less motion → just show the picture.
  if (PIX_SEEN.has(url) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    PIX_SEEN.add(url); paint(); return;
  }

  let engaged = false, dead = false, cv = null, tiny = null, raf = 0, t0 = 0;
  let timer = setTimeout(engage, PIX_GRACE);

  const cleanup = () => {
    clearTimeout(timer); cancelAnimationFrame(raf);
    if (cv) { cv.remove(); cv = null; }
    if (el._pixStop) el._pixStop = null;
  };
  el._pixStop = () => { dead = true; cleanup(); };

  function draw(n) {
    if (!cv || !tiny) return;
    /* Match the ELEMENT's aspect, not the artwork's. `.v3-for-single` is 113×415
       — stretching a square thumbnail across it would smear the pixels into
       tall rectangles. So the backing store takes the box's ratio and the
       thumbnail is cover-cropped into it, exactly like `background-size: cover`. */
    const ratio = el.clientHeight / Math.max(el.clientWidth, 1) || 1;
    const w = Math.max(2, n), h = Math.max(2, Math.round(n * ratio));
    cv.width = w; cv.height = h;
    const g = cv.getContext('2d');
    g.imageSmoothingEnabled = false;
    const s = Math.max(w / tiny.width, h / tiny.height);
    const dw = tiny.width * s, dh = tiny.height * s;
    g.drawImage(tiny, (w - dw) / 2, (h - dh) / 2, dw, dh);
  }

  function walk(ts) {
    if (dead) return;
    if (!t0) t0 = ts;
    const p = Math.min(1, (ts - t0) / PIX_MS);
    // ease-in-out: holds the coarse blocks a beat, then resolves in a rush
    const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
    draw(PIX_STEPS[Math.min(PIX_STEPS.length - 1, Math.floor(e * PIX_STEPS.length))]);
    if (p < 1) raf = requestAnimationFrame(walk);
  }

  function engage() {
    if (dead) return;
    engaged = true;
    const src = pixTinyUrl(url);
    if (!src) return;                        // local file: no small variant, no effect
    cv = document.createElement('canvas');
    cv.className = 'sd-pix';
    el.prepend(cv);                          // behind slideIn's layers and the CD's hole
    const t = new Image();
    t.onload = () => {
      if (dead || !cv) return;
      tiny = t;
      draw(PIX_STEPS[0]);
      requestAnimationFrame(() => { if (cv) cv.style.opacity = '1'; });   // fade in, don't pop
      raf = requestAnimationFrame(walk);
    };
    t.src = src;
  }

  const full = new Image();
  full.onload = () => {
    if (dead) return;
    PIX_SEEN.add(url);
    if (!engaged || !cv) { cleanup(); paint(); return; }   // beat the grace timer
    paint();                                 // sharp underneath, then dissolve the blocks
    cv.style.transition = 'opacity .24s ease';
    cv.style.opacity = '0';
    const gone = cv;
    setTimeout(() => { if (gone) gone.remove(); if (cv === gone) cv = null; cleanup(); }, 260);
  };
  full.onerror = () => { if (!dead) { cleanup(); paint(); } };
  full.src = url;
}

function slideIn(el, newUrl, reverse) {
  // Left-hand layout is mirrored, so images travel left→right instead of right→left.
  // `reverse` flips it again for backward navigation (swiping to a previous album).
  let flip = !!el.closest('.s-home-v3--left');
  if (reverse) flip = !flip;
  const enterFrom = flip ? '-100%' : '100%';
  const oldExit   = flip ? '28%'   : '-28%';
  const old = document.createElement('div');
  old.style.cssText = `position:absolute;inset:0;background:${el.style.backgroundImage} center/cover no-repeat;z-index:1;transform:translateX(0);will-change:transform;transition:transform 0.42s cubic-bezier(0.4,0,0.2,1)`;
  const next = document.createElement('div');
  // The url is left OFF the shorthand (size/position stay) so the incoming panel
  // can resolve progressively too — a swipe onto an unloaded cover is exactly
  // when you're most likely to be staring at an empty box.
  next.style.cssText = `position:absolute;inset:0;background:center/cover no-repeat;z-index:2;transform:translateX(${enterFrom});will-change:transform;transition:transform 0.42s cubic-bezier(0.4,0,0.2,1)`;
  el.appendChild(old);
  el.appendChild(next);
  sdCover(next, newUrl);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    old.style.transform = `translateX(${oldExit})`;
    next.style.transform = 'translateX(0)';
    next.addEventListener('transitionend', () => {
      // Hands the cover to the real element. Usually instant — `next` has
      // already resolved it, so PIX_SEEN short-circuits — but if the swipe
      // outran the download this keeps the blocks going on `el` instead of
      // snapping back to an empty box.
      sdCover(el, newUrl);
      old.remove();
      next.remove();
    }, { once: true });
  }));
}

function typewrite(el, text, speed = 16) {
  el.textContent = '';
  if (!text) return;
  let i = 0;
  const tick = () => {
    el.textContent = text.slice(0, ++i);
    if (i < text.length) setTimeout(tick, speed);
  };
  setTimeout(tick, speed);
}

function setMainAlbum(screenEl, album, animate = false, animateText = animate) {
  screenEl._album = album;   // track the album currently shown in the bento
  const albumEl = screenEl.querySelector('.v3-album');
  if (albumEl) {
    if (animate) slideIn(albumEl, album.image);
    else sdCover(albumEl, album.image);
    /* ⚠️ Not in the shop's Pro showcase. There the cover's gesture is a HOLD
       (shopProInit), and a tap-through would navigate the shop screen itself
       to an album page. Re-checked on every album change because this handler
       is reassigned each time. */
    albumEl.onclick = albumEl.closest('.shop-showcase') ? null : (e) => {
      if (albumEl._swiped) { if (e) e.stopPropagation(); return; }  // a swipe, not a tap
      if (e) e.stopPropagation();   // don't let the tap bubble and undo the fullscreen state
      window.activeAlbum = album;
      enterAlbumPage(screenEl);   // tap the hero → straight to the album page
    };
  }
  const cdEl = screenEl.querySelector('.v3-cd');
  if (cdEl) {
    if (animate) reloadCD(cdEl, album.image);
    else sdCover(cdEl, album.image);
  }

  const infoRow = screenEl.querySelector('.v3-blue-info-row');
  if (infoRow && album.artist && album.album) {
    const combined = album.artist.length + album.album.length;
    const wdth = combined <= 22 ? 100 : combined <= 30 ? 88 : combined <= 38 ? 76 : combined <= 46 ? 64 : 52;
    infoRow.style.fontVariationSettings = `'wdth' ${wdth}`;
  }
  const artistEl = screenEl.querySelector('.v3-blue-artist');
  const albumNameEl = screenEl.querySelector('.v3-blue-album');
  if (animateText) {
    if (artistEl) typewrite(artistEl, album.artist, 16);
    if (albumNameEl) typewrite(albumNameEl, album.album, 14);
  } else {
    if (artistEl) artistEl.textContent = album.artist;
    if (albumNameEl) albumNameEl.textContent = album.album;
  }
  // Release year — inline after the artist (bento) / beside the album (fullscreen)
  screenEl.querySelectorAll('.v3-blue-date').forEach(el => { el.textContent = album.year || ''; });

  // On the album page, a 2-line album title needs the CTA pushed down a line
  if (albumNameEl && screenEl.classList.contains('s-home-v3--review')) {
    albumNameEl.textContent = album.album;                 // full text for a sync measure
    // .v3-blue-album is display:inline in review — its bounding box spans all line boxes,
    // so height > 1.5 lines means the title wrapped to two lines (offsetHeight would lie).
    const lh2 = parseFloat(getComputedStyle(albumNameEl).lineHeight) || 20;
    screenEl.classList.toggle('v3-rev-title-2line', albumNameEl.getBoundingClientRect().height > lh2 * 1.5);
    if (animateText) albumNameEl.textContent = '';         // let the typewrite refill from empty
  }

  const starsRow = screenEl.querySelector('.v3-blue-stars-row');
  if (starsRow) {
    // Just "12.5k" in the compact bento; "12.5k reviews" on the album page. The
    // bento's count shares a line with the vinyls in a column ~60px wide, and
    // beside a row of discs the bare number reads as a count on its own.
    // ⚠️ The word is a SPAN that CSS hides, and the leading space lives inside
    // it so nothing trails when it goes. Branching on the state class in JS
    // looks equivalent and is not — this row is painted once per album, while
    // `.s-home-v3--review` is added and removed under it, so the text would
    // keep whichever state it happened to be written in.
    const rc = `${window.fmtRc(album.reviewCount)}<span class="v3-rc-long"> reviews</span>`;
    const html = `<span class="v3-blue-score">${album.rating.toFixed(1)}</span>${halfStars(album.rating, 14)}<span class="v3-blue-count">${rc}</span>`;
    if (animateText) {
      starsRow.style.cssText += ';transition:opacity 0.18s;opacity:0';
      setTimeout(() => { starsRow.innerHTML = html; starsRow.style.opacity = '1'; }, 200);
    } else {
      starsRow.innerHTML = html;
    }
    starsRow.parentElement.onclick = (e) => {
      e.stopPropagation();
      window.activeAlbum = album;
      enterAlbumPage(screenEl);
    };
    sizeTitleExtra(screenEl);
  }
  populateCredits(screenEl, album);

  const quoteTextEl = screenEl.querySelector('.v3-blue-quote-text');
  if (quoteTextEl) {
    const quoteContainer = quoteTextEl.parentElement;
    quoteContainer.classList.remove('v3-blue-quote--scroll');
    quoteTextEl.style.removeProperty('--quote-scroll');
    if (album.reviews && album.reviews.length) {
      const text = `"${album.reviews[0].text}"`;
      if (animateText) {
        typewrite(quoteTextEl, text, 11);
        setTimeout(() => {
          if (quoteTextEl.scrollWidth > quoteContainer.offsetWidth) {
            const overflow = quoteTextEl.scrollWidth - quoteContainer.offsetWidth;
            quoteTextEl.style.setProperty('--quote-scroll', `-${overflow}px`);
            quoteContainer.classList.add('v3-blue-quote--scroll');
          }
        }, text.length * 11 + 80);
      } else {
        quoteTextEl.textContent = text;
        requestAnimationFrame(() => {
          if (quoteTextEl.scrollWidth > quoteContainer.offsetWidth) {
            const overflow = quoteTextEl.scrollWidth - quoteContainer.offsetWidth;
            quoteTextEl.style.setProperty('--quote-scroll', `-${overflow}px`);
            quoteContainer.classList.add('v3-blue-quote--scroll');
          }
        });
      }
    }
  }

  applyAlbumColorsUrl(screenEl, album.image);
  loadPreview(album);

  // If we're in fullscreen review mode, refresh reviews for the new album
  if (screenEl.classList.contains('s-home-v3--review')) populateReviewPanel(screenEl);
}

// ── Fullscreen review mode ────────────────────────────────────
// ══════════════════════════════════════════════════════════════
//  BACK-NAVIGATION HISTORY
//  A single global stack of view snapshots. Every forward transition pushes the view it
//  leaves; Back pops one and restores it atomically (no flashing through in-between states).
//  A snapshot is either a home-shell state {review,album,artist,albumRef} or {screenId}.
// ══════════════════════════════════════════════════════════════
let backStack = [];

function homeShells() {
  // the home-shell instances currently in the DOM (dark + light on desktop; one on mobile)
  return [...document.querySelectorAll('.s-home-v3')].filter(el => el.querySelector('.v3-album'));
}
// Capture the current PLAIN screen plus any sub-state needed to restore it faithfully
// (a profile's exact persona, the open playlist) — so Back returns you to the same view,
// not a freshly-randomised one.
function captureScreenSnap() {
  const id = currentScreen().id;
  const snap = { review: false, screenId: id };
  if (id === 'profile')  snap.profile  = { ...window.PROFILE };
  if (id === 'playlist') snap.playlist = window.activePlaylist;
  return snap;
}
function snapView(scr) {
  if (scr && scr.classList.contains('s-home-v3--review')) {
    return {
      review: true,
      album:  scr.classList.contains('s-home-v3--album'),
      artist: scr.classList.contains('s-home-v3--artist'),
      albumRef: scr._album,
    };
  }
  return captureScreenSnap();   // bento home, or a plain screen (profile / playlist / …)
}
// The current view, whether a fullscreen home shell or a plain screen.
function captureLocation() { return snapView(homeShells()[0]); }
function pushBack() { backStack.push(captureLocation()); }
function measure2Line(scr) {
  const alb = scr.querySelector('.v3-blue-album');
  if (!alb) return;
  alb.style.transition = 'none'; alb.style.fontSize = '18px';
  const lh = parseFloat(getComputedStyle(alb).lineHeight) || 20;
  scr.classList.toggle('v3-rev-title-2line', alb.getBoundingClientRect().height > lh * 1.5);
  alb.style.transition = ''; alb.style.fontSize = '';
}
/* The cover's two gestures — swipe for the next album, hold for the shelf
   wheel — are BENTO gestures, and only the bento's. Fullscreen reuses the very
   same `.v3-album` element as the album page's header, where there is exactly
   one album, it is the one you just chose, and swiping it away undoes the tap
   that got you there. So the cover stops taking the finger and hands it back to
   the page, which by then is a page you scroll.
   ⚠ Both gestures are wired ONCE per element (`_swipeInit` / `_wired`) and the
   album page is that element in a different state — so the question has to be
   asked at gesture START, never at wire time.
   ⚠ `--review` is never set without `--album`, and `--artist` layers on top of
   both, so this one class covers the album page and the artist page alike. */
/* ⚠ The mix dial counts as "gestures off" too. It covers `.v3-album`, so while
   it is up the swipe underneath it would change the album out from under the
   dial and the cover-hold would arm the shelf wheel on top of it — both reading
   the same drag the dial's taps are landing in. */
function bentoGesturesOn(screenEl) {
  return !!screenEl
      && !screenEl.classList.contains('s-home-v3--review')
      && !screenEl.classList.contains('s-home-v3--mixing');
}

// Drop straight into the album page for `album`, all classes set at once (no review flash).
function enterAlbumPageState(scr, album) {
  setMainAlbum(scr, album, false);
  scr.classList.remove('s-home-v3--artist');
  scr.classList.add('s-home-v3--review', 's-home-v3--album');
  populateReviewPanel(scr);
  measure2Line(scr);
  const body = scr.querySelector('.v3-body'); if (body) body.scrollTop = 0;
}
// Restore an arbitrary home-shell snapshot in one shot.
function applyShellState(scr, snap) {
  if (snap.albumRef) setMainAlbum(scr, snap.albumRef, false);   // restores cover/name (undoes artist)
  scr.classList.toggle('s-home-v3--review', !!snap.review);
  scr.classList.toggle('s-home-v3--album',  !!snap.album);
  scr.classList.toggle('s-home-v3--artist', !!snap.artist);
  scr.classList.remove('v3-rev-title-2line');
  if (snap.review) {
    populateReviewPanel(scr);
    if (snap.artist) populateArtistPage(scr);
    else measure2Line(scr);
  }
  const body = scr.querySelector('.v3-body'); if (body) body.scrollTop = 0;
}
window.goBack = function (fallbackId) {
  const snap = backStack.pop();
  const shells = homeShells();
  if (!snap) {                                                         // nothing recorded
    if (fallbackId) { navigate(fallbackId, 'back'); return; }         // caller's default (e.g. Library)
    shells.forEach(s => exitToBento(s)); return;                       // else the bento home
  }
  if (snap.review) { shells.forEach(s => applyShellState(s, snap)); return; }   // an earlier shell state
  // A plain-screen snapshot — restore its sub-state, then go there WITHOUT re-randomising.
  if (snap.profile)  Object.assign(window.PROFILE, snap.profile);
  if (snap.playlist) window.activePlaylist = snap.playlist;
  if (snap.screenId && snap.screenId !== currentScreen().id) {        // a different screen
    navigate(snap.screenId, 'back');
    return;
  }
  shells.forEach(s => exitToBento(s));                                  // back to the bento home
};

// ── Bento → album page ────────────────────────────────────────
// There used to be a plain fullscreen "review" state in between: tapping the
// bento opened it, and tapping the album title *inside* it stepped up to the
// album page. That middle layer is gone: the review state was a whole extra
// level of navigation that showed nearly the same thing (plus the For You box)
// — going straight there is the same screen one tap sooner. (It was ALSO
// swipeable then. It isn't now — `bentoGesturesOn` keeps the swipe and the hold
// on the bento, so the cover here is a header and nothing else.)
//
// ⚠️ `--review` is therefore never set without `--album`. The class pair is kept
// because the CSS is tuned for the combination, but there is no longer any way
// to reach `--review` alone, and `.s-home-v3--review:not(.s-home-v3--album)`
// styles nothing.
window.enterAlbumPage = function (scr) {
  if (!scr) return;
  if (scr.classList.contains('s-home-v3--review')) return;   // already fullscreen
  pushBack();                                                // record the bento before entering
  const album = scr.querySelector('.v3-blue-album');
  const albumText = album ? album.textContent : '';

  // 1. Album fades out of the (small, inline) line it currently shares with the artist
  if (album) album.style.opacity = '0';

  // 2. After the fade, expand fullscreen: flood + artist grows + title stacks (CSS)
  setTimeout(() => {
    scr.classList.add('s-home-v3--review', 's-home-v3--album');
    populateReviewPanel(scr);
    const body = scr.querySelector('.v3-body');
    if (body) body.scrollTop = 0;
    // 3. Album typewrites back in below the artist, at the larger 18px size
    if (album) {
      album.style.opacity = '1';
      album.textContent = albumText;
      // The review font-size (18px) is still mid-transition here, so force it (no tween) to
      // measure wrapping at the FINAL size. An inline element's bounding box spans all its
      // line boxes, so height > 1.5 lines ⇒ the title wrapped to two lines.
      album.style.transition = 'none';
      album.style.fontSize = '18px';
      const lh2 = parseFloat(getComputedStyle(album).lineHeight) || 20;
      scr.classList.toggle('v3-rev-title-2line', album.getBoundingClientRect().height > lh2 * 1.5);
      album.style.transition = '';
      album.style.fontSize = '';
      typewrite(album, albumText, 24);
    }
  }, 170);
};
// `onAlbumTitle` is gone with the review state — the album title no longer has
// a step to take you up to. The title span simply lets its tap bubble to
// `.v3-blue`, which opens the album page like the rest of the box.
window.onAlbumArt = function (el) {
  const scr = el && el.closest('.s-home-v3');
  if (!scr || scr.classList.contains('s-home-v3--review')) return;   // in-shell handled by setMainAlbum's tap
  navigate('album');
};

// ── Artist page — an --artist variation of the album page: banner instead of the
//    square cover, no CD / tracklist, artist + genre text, and a grid of albums below.
const ARTIST_IMG = {
  'Crystal Castles': 'images/artist-crystalcastles.jpg',
  'Phoebe Bridgers': 'images/artist-phoebe.jpg',
  '100 gecs': 'images/artist-100gecs.jpg',
  'Carpenter Brut': 'images/artist-carpenterbrut.jpg',
};
/* Label / members / description for the artist page. Hand-written for the four
   artists with a banner; anything else falls back to the album's label (from
   the build data, when it has one) and a one-line genre description. Members
   is "if any" — a solo act simply has no row (see .v3-ai-row.is-empty) — and
   so is Description. */
const ARTIST_INFO = {
  'Crystal Castles': {
    label: 'Fiction / Last Gang',
    members: ['Ethan Kath', 'Edith Frances'],
    desc: 'Toronto electronic duo formed in 2006. Lo-fi, abrasive synth-punk built on chiptune noise and buried, screamed vocals.',
  },
  'Phoebe Bridgers': {
    label: 'Dead Oceans',
    members: [],
    desc: 'Los Angeles singer-songwriter. Hushed, dark-humoured indie folk; also one third of boygenius and half of Better Oblivion Community Center.',
  },
  '100 gecs': {
    label: 'Dog Show / Atlantic',
    members: ['Laura Les', 'Dylan Brady'],
    desc: 'Hyperpop duo from St. Louis. A maximalist collage of pop-punk, ska, dubstep and nightcore, pitched somewhere between a joke and a manifesto.',
  },
  'Carpenter Brut': {
    label: 'No Quarter Prod.',
    members: ['Franck Hueso'],
    desc: 'French darksynth project from Poitiers. Horror-movie synths over metal drums, wrapped in an ’80s VHS aesthetic.',
  },
};
function artistInfoHtml(a) {
  const info = ARTIST_INFO[a.artist] || {};
  // No invented description: an artist without one loses the row, and the
  // strip's reserved overhang shrinks with it (see --rev-cred-h in app.css).
  const rows = [
    ['Label',       info.label || a.label || ''],
    ['Members',     (info.members || []).join(', ')],
    ['Description', info.desc || ''],
  ];
  return rows.map(([lbl, val]) =>
    `<div class="v3-ai-row v3-ai-row--${lbl.toLowerCase()}${val ? '' : ' is-empty'}">` +
    `<span class="v3-ai-lbl">${lbl}</span><span class="v3-ai-val">${val}</span></div>`
  ).join('');
}
window.onArtistName = function (el) {
  const scr = el && el.closest('.s-home-v3');
  if (!scr) return;
  pushBack();   // record the current view (review or album page) before the artist page
  homeShells().forEach(s => {
    s.classList.add('s-home-v3--review', 's-home-v3--album', 's-home-v3--artist');
    populateReviewPanel(s);
    populateArtistPage(s);
    const body = s.querySelector('.v3-body'); if (body) body.scrollTop = 0;
  });
};
function populateArtistPage(scr) {
  const a = scr._album || window.activeAlbum || window.featuredAlbum;
  if (!a) return;
  const banner = ARTIST_IMG[a.artist] || a.image;
  const albumEl = scr.querySelector('.v3-album');
  if (albumEl) albumEl.style.backgroundImage = `url('${banner}')`;
  const nameEl = scr.querySelector('.v3-blue-album');     // now the artist name
  if (nameEl) nameEl.textContent = a.artist;
  const genreEl = scr.querySelector('.v3-blue-artist');   // now the genre
  if (genreEl) genreEl.textContent = a.genre || '';
  const box = scr.querySelector('.v3-artist-albums');
  if (box) box.innerHTML = artistAlbumsHtml(a);
  const info = scr.querySelector('.v3-artist-info');
  if (info) info.innerHTML = artistInfoHtml(a);
}

/* The artist's albums — replaces the rating histogram (an artist has no single
   score). Two views of the same cells: a horizontal rail or the trending grid.
   ARTIST_ALBUM_VIEW is module-global so both the dark and light instances agree
   and the choice survives a re-render. */
let ARTIST_ALBUM_VIEW = 'grid';

function artistAlbumsFor(a) {
  const arch = window.ARCHIVE || [];
  let albums = arch.filter(x => x.artist === a.artist);
  // The archive holds one album per artist, so pad with the rest of the shelf —
  // a one-cell "discography" reads as a bug rather than as a short catalogue.
  if (albums.length < 3) albums = albums.concat(arch.filter(x => x.artist !== a.artist)).slice(0, 6);
  return albums;
}

function artistAlbumsHtml(a) {
  const albums = artistAlbumsFor(a);
  const row = ARTIST_ALBUM_VIEW === 'row';
  const cells = albums.map(al => `
      <div class="wall2-cell" ${sdAlbumData(al)} onclick="openAlbumByData(this, event)">
        <div class="wall2-art" style="background-image:url('${al.image}')"></div>
        <div class="wall2-meta"><span class="wall2-album">${al.album}</span><span class="wall2-artist">${al.artist}</span></div>
        <div class="wall2-rating">${halfStars(al.rating, 11)}<span class="wall2-score">${al.rating.toFixed(1)}</span></div>
      </div>`).join('');
  const icoRow  = `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="7" width="5.5" height="10" rx="1.4"/><rect x="9.25" y="7" width="5.5" height="10" rx="1.4"/><rect x="16.5" y="7" width="5.5" height="10" rx="1.4"/></svg>`;
  const icoGrid = `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="8" height="8" rx="1.6"/><rect x="13" y="3" width="8" height="8" rx="1.6"/><rect x="3" y="13" width="8" height="8" rx="1.6"/><rect x="13" y="13" width="8" height="8" rx="1.6"/></svg>`;
  return `
      <div class="v3-aa-hd">
        <span class="v3-aa-title">Albums</span>
        <span class="v3-aa-n">${albums.length}</span>
        <div class="v3-aa-seg">
          <button class="${row ? 'active' : ''}" title="Row" onclick="event.stopPropagation(); setArtistAlbumView('row')">${icoRow}</button>
          <button class="${row ? '' : 'active'}" title="Grid" onclick="event.stopPropagation(); setArtistAlbumView('grid')">${icoGrid}</button>
        </div>
      </div>
      <div class="${row ? 'v3-aa-row' : 'wall2-grid'}">${cells}</div>
      <div class="v3-aa-hd v3-aa-hd--rev"><span class="v3-aa-title">Popular reviews</span></div>`;
}

// Both home shells hold an artist page, so repaint every one of them — a
// document-wide toggle that only redrew the clicked copy would leave the
// dark/light pair disagreeing (same rule as plTab / ntfTab).
window.setArtistAlbumView = function (mode) {
  ARTIST_ALBUM_VIEW = mode;
  homeShells().forEach(s => {
    if (!s.classList.contains('s-home-v3--artist')) return;
    const a = s._album || window.activeAlbum || window.featuredAlbum;
    const box = s.querySelector('.v3-artist-albums');
    if (a && box) box.innerHTML = artistAlbumsHtml(a);
  });
};

// Album / artist page → back to the bento home.
window.exitToBento = function (scr) {
  if (!scr) return;
  // Freeze the For You box's geometry transition on the way back to the bento —
  // it should already be sitting in its spot, not slide into it (same trick as toggleHand).
  // (The For You box is hidden on the album page, so this is the transition it
  // makes on the way *in* to view, not out.)
  scr.classList.add('v3-hand-swapping');
  requestAnimationFrame(() => requestAnimationFrame(() => scr.classList.remove('v3-hand-swapping')));
  scr.classList.remove('s-home-v3--review');
  scr.classList.remove('s-home-v3--album');
  scr.classList.remove('s-home-v3--artist');
  scr.classList.remove('v3-rev-title-2line');
  // Restore the album name in full (in case Back was hit mid-typewriter) + reset fade
  const album = scr.querySelector('.v3-blue-album');
  if (album) {
    album.style.opacity = '1';
    if (scr._album) album.textContent = scr._album.album;
  }
  const body = scr.querySelector('.v3-body');
  if (body) body.scrollTop = 0;
};
// Trending page — Genres / time-range filter panels (in-flow so they don't clip in the scroller).
function closeWallMenus(scr) {
  scr.querySelectorAll('.wall2-menu').forEach(m => (m.hidden = true));
  scr.querySelectorAll('.wall2-drop-btn').forEach(b => b.classList.remove('open'));
}
window.toggleWallPanel = function (btn) {
  const scr = btn.closest('.app-screen');
  if (!scr) return;
  const wrap = btn.closest('.wall2-menuwrap');
  const menu = wrap && wrap.querySelector('.wall2-menu');
  const wasOpen = menu && !menu.hidden;
  closeWallMenus(scr);
  if (menu && !wasOpen) { menu.hidden = false; btn.classList.add('open'); }
};
/* Popular ⇄ Controversial. Repaints the grid in place rather than re-rendering
   the screen: `renderViewer()` would rebuild both shells and lose the dropdowns'
   state along with the scroll position. Both shells are updated together — the
   viewer shows dark and light side by side and they must agree. */
window.pickWallSort = function (btn) {
  const sort = btn.dataset.sort;
  if (!sort || sort === window.WALL_SORT) return;
  window.WALL_SORT = sort;
  document.querySelectorAll('.s-wall2').forEach(scr => {
    scr.querySelectorAll('.wall2-sort').forEach(b =>
      b.classList.toggle('active', b.dataset.sort === sort));
    const grid = scr.querySelector('.wall2-grid');
    if (grid) grid.innerHTML = wallGridHtml();
    renderDiscoveryDeck(scr);                       // the deck follows the sort
  });
  closeWallMenus(btn.closest('.app-screen'));
};
window.pickWallGenre = function (el) {
  const menu = el.closest('.wall2-menu');
  if (menu) menu.querySelectorAll('.wall2-menu-item').forEach(g => g.classList.remove('active'));
  el.classList.add('active');
  closeWallMenus(el.closest('.app-screen'));
};
window.pickWallTime = function (el) {
  const scr = el.closest('.app-screen');
  const menu = el.closest('.wall2-menu');
  if (menu) menu.querySelectorAll('.wall2-menu-item').forEach(o => o.classList.remove('active'));
  el.classList.add('active');
  const lbl = scr.querySelector('.wall2-time-label');
  if (lbl) lbl.textContent = el.textContent.replace(/^(This |Past )/, '');
  closeWallMenus(scr);
};

/* ── Notifications (s-ntf) ──────────────────────────────────────
   Every handler scopes to the clicked `.app-screen` — the viewer shows the
   dark and light variants side by side, so a document-wide query would
   drive both copies at once. */

// Filter pills. Rows carry data-tab; a time-bucket group hides itself when
// all of its rows filter out, and the empty state shows if nothing is left.
// CURRENTLY UNUSED — the pill row was removed from the page (the rows still
// carry data-tab, so re-adding a `.ntf-bar` of pills brings this straight back).
window.ntfTab = function (btn, tab) {
  const scr = btn.closest('.app-screen');
  if (!scr) return;
  scr.querySelectorAll('.ntf-bar .wall2-cat').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  let shown = 0;
  scr.querySelectorAll('.ntf-row').forEach(r => {
    r.hidden = tab !== 'all' && r.dataset.tab !== tab;
    if (!r.hidden) shown++;
  });
  scr.querySelectorAll('.ntf-group').forEach(g => {
    g.hidden = !g.querySelector('.ntf-row:not([hidden])');
  });
  const empty = scr.querySelector('.ntf-empty');
  if (empty) empty.hidden = shown > 0;
};

// "Mark all read" — drops the unread treatment and the header count chip.
window.ntfMarkAll = function (btn) {
  const scr = btn.closest('.app-screen');
  if (!scr) return;
  scr.querySelectorAll('.ntf-row--new').forEach(r => r.classList.remove('ntf-row--new'));
  const chip = scr.querySelector('.ntf-count');
  if (chip) chip.remove();
  btn.disabled = true;
};

// Follow back from a follow notification.
window.ntfFollowBack = function (btn) {
  const on = btn.classList.toggle('is-on');
  btn.textContent = on ? 'Following' : 'Follow';
};

/* ── Settings (s-set) ───────────────────────────────────────── */

// Switch row.
window.sdToggle = function (btn) {
  const on = btn.classList.toggle('is-on');
  btn.setAttribute('aria-checked', String(on));
};

// Segmented picker (Theme) — active moves within its own group.
window.sdSeg = function (btn) {
  const seg = btn.closest('.set-seg');
  if (!seg) return;
  seg.querySelectorAll('button').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
};

// Connected-service row — flips the trailing pill between the two states.
window.sdConnect = function (row) {
  const pill = row.querySelector('.set-pill');
  if (!pill) return;
  // The pill alone carries the state; the sub-label stays the description of
  // what the service gives you, connected or not.
  const on = pill.classList.toggle('set-pill--on');
  pill.textContent = on ? 'Connected' : 'Connect';
};

// Playlists page — in-page tab switching (Lists / Artists / Albums / Songs / Genres).
window.plTab = function (btn, tab) {
  const scr = btn.closest('.app-screen');
  if (!scr) return;
  // Discover (outside the pill bar) acts as a tab too — clear/set active on both
  scr.querySelectorAll('.pl2-bar .wall2-cat, .pl2-discover').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  // Stamped so the choice survives a re-render (coming Back from an album you
  // opened off the Listened tab should land on Listened) — the wall's WALL_SORT idiom.
  window.PL_TAB = tab;
  // Five pills overflow the row; bring the one you picked fully into it. Set
  // scrollLeft by hand — scrollIntoView would also scroll the page's own body.
  const bar = btn.parentElement;
  if (bar && bar.classList.contains('pl2-bar')) {
    const l = btn.offsetLeft - 16, r = btn.offsetLeft + btn.offsetWidth + 40 - bar.clientWidth;
    if (bar.scrollLeft > l) bar.scrollLeft = Math.max(0, l);
    else if (bar.scrollLeft < r) bar.scrollLeft = r;
  }
  scr.querySelectorAll('.pl2-sec').forEach(s => { s.hidden = s.dataset.tab !== tab; });
};
/* Open an album from the library tabs. In ARCHIVE → open it. Not there (a rec
   the runtime pool dealt in an earlier session) → rebuild it from the draft's
   `snap` with dzRecord's own seeded numbers, so it is the same record it was,
   adopt it into ARCHIVE, then open it. */
window.plLibOpen = function (title, artist) {
  let a = (window.ARCHIVE || []).find(x => x.album === title && x.artist === artist);
  if (!a) {
    const d = logDrafts()[logKey({ title: title, subtitle: artist })];
    const s = d && d.snap;
    if (!s) return;
    const rating = Math.round((3.8 + (dzSeed(artist, title) % 11) * 0.1) * 10) / 10;
    a = Object.assign({ album: title, artist: artist, rating: rating,
      reviewCount: 4000 + (dzSeed(title, 'rc') % 86) * 1000,
      reviews: dzReviews(title, rating), _rec: true, _lite: true }, s);
    window.ARCHIVE.push(a);
    window.SEARCH_INDEX = null;
  }
  openAlbumPage(a);
};
// Open a playlist's page from the Lists tab. plLists() (screens.js) is the
// shared data source; the playlist screen's getter renders window.activePlaylist.
window.openPlaylistPage = function (name) {
  const pl = plLists().find(l => l.name === name);
  if (!pl) return;
  backStack.push(captureLocation());   // remember where we came from (profile / Library / …)
  window.activePlaylist = pl;
  navigate('playlist');
};
// Favorite the playlist — heart toggle; count follows, and the change is kept
// on activePlaylist so it survives a re-render of this screen.
window.togglePlFav = function (btn) {
  const on = btn.classList.toggle('on');
  const n = btn.querySelector('.plp-fav-n');
  const v = (parseInt(n && n.textContent, 10) || 0) + (on ? 1 : -1);
  if (n) n.textContent = v;
  if (window.activePlaylist) { window.activePlaylist.favs = v; window.activePlaylist.faved = on; }
};
/* The back pill used to grin — `plRingSmile` morphed its arrow dots into a
   smiley on every favourite and on an 11s timer. Gone: the nav's pet carries the
   app's personality now, so Back is purely a control. */

/* ============================================================
   NEW PLAYLIST — the creation page behind the Playlists "+"
   ------------------------------------------------------------
   Same multi-instance discipline as the onboarding wizard: ALL state lives in
   PLNEW, every action mutates it and then plnewSync() re-applies the whole
   thing to EVERY .s-plnew on the page. That matters because the desktop viewer
   renders the dark and light variants side by side — mutating only the clicked
   instance would leave the other one stale.

   Finished playlists land in PLNEW_CREATED, which plLists() (screens.js) spreads
   in at the FRONT of the library, so a new one shows up top of the Playlists tab
   and its detail page renders the real tracks you picked.
   ============================================================ */
window.PLNEW_CREATED = [];
// mode: 'search' (type to find anything) | 'library' (browse your own playlists)
// libOpen: the playlist name being browsed inside library mode, or null for the
// list of playlists. cover is a data: URL once the user uploads one.
// `editing` is the stable key of the playlist being edited, or null when this is
// a new one. It is what makes `plnewCreate` update instead of insert.
const PLNEW = { name: '', cover: null, privacy: 'public', songs: [], q: '', mode: 'search', libOpen: null, editing: null };
/* ⚠️ A top-level `const` is NOT a window property. `playlistNewHtml` reads
   `window.PLNEW` to paint a fresh render, and without this line it was quietly
   getting its empty fallback — so the edit page opened with a blank name, no
   cover and Public selected, whatever the playlist actually was. */
window.PLNEW = PLNEW;
const PLNEW_FALLBACK_COVER = 'images/spindeck-appicon.png';

// Every song in the archive, flattened once — songsFor() is deterministic per
// album, so the pool is stable across renders and a row keeps its identity.
let _plnewPool = null;
function plnewPool() {
  if (_plnewPool) return _plnewPool;
  _plnewPool = [];
  (window.ARCHIVE || []).forEach(a => {
    (typeof songsFor === 'function' ? songsFor(a) : []).forEach(t => {
      _plnewPool.push({
        // Track number is part of the key on purpose: songsFor() picks titles
        // from a word list, so one album can end up with two tracks of the same
        // name. Keying on album+title alone would make them one row.
        key: a.album + '::' + t.n + '::' + t.title,
        title: t.title, dur: t.dur, rating: t.rating,
        album: a.album, artist: a.artist, image: a.image, genre: a.genre,
      });
    });
  });
  return _plnewPool;
}

window.openNewPlaylist = function () {
  PLNEW.editing = null;            // ⚠️ or "+" would silently overwrite whatever was edited last
  PLNEW.name = ''; PLNEW.cover = null; PLNEW.privacy = 'public';
  PLNEW.songs = []; PLNEW.q = ''; PLNEW.mode = 'search'; PLNEW.libOpen = null;
  backStack.push(captureLocation());
  navigate('playlist-new');
};
/* EDIT an existing playlist — the same page, seeded.
   ⚠️ There is no separate edit screen and there should not be one: everything
   you can change about a playlist (name, cover, privacy, tracks) is already a
   field on this one, and a second screen would be the same form drifting out of
   sync with the first. `PLNEW.editing` holds the playlist's stable `key` and is
   the only thing that tells the two apart. */
window.openEditPlaylist = function (key) {
  const pl = plLists().find(l => l.key === key || l.name === key);
  if (!pl) return;
  PLNEW.editing = pl.key || pl.name;
  PLNEW.name = pl.name;
  PLNEW.cover = pl.image || null;
  PLNEW.privacy = pl.private ? 'private' : 'public';
  // The sample lists have no authored tracklist — `plTracksFor` deals them a
  // deterministic one, which is what the detail page already shows, so the
  // editor opens on the songs the user believes are in there.
  PLNEW.songs = (typeof plTracksFor === 'function' ? plTracksFor(pl) : (pl.songs || [])).slice();
  PLNEW.q = ''; PLNEW.mode = 'search'; PLNEW.libOpen = null;
  backStack.push(captureLocation());
  navigate('playlist-new');
};

window.plnewCancel = function () { PLNEW.editing = null; goBack('playlists'); };

/* DELETE — only offered while editing an existing playlist (the button is not
   rendered on a new one; there is nothing to delete yet). It always asks first:
   a playlist is the one thing in the app the user MADE, and the delete button
   sits a thumb's width from Save.

   The confirm is a small bottom sheet mounted INTO the .s-plnew the tap came
   from (dark and light are separate elements in the viewer, so it has to be the
   right one), riding .sd-log-overlay for the scrim like the badges sheet. */
function ensurePldelSheet() {
  let ov = document.getElementById('pldel');
  if (ov) return ov;
  ov = document.createElement('div');
  ov.id = 'pldel';
  ov.className = 'sd-log-overlay pldel-overlay';
  ov.innerHTML = `
    <div class="pldel-sheet" role="alertdialog" aria-modal="true" aria-labelledby="pldel-title">
      <div class="sd-log-grab"></div>
      <div class="pldel-title" id="pldel-title"></div>
      <p class="pldel-sub">Are you sure you want to delete it? This can't be undone.</p>
      <div class="pldel-btns">
        <button class="pldel-cancel" type="button">Cancel</button>
        <button class="pldel-go" type="button">Delete</button>
      </div>
    </div>`;
  ov.addEventListener('click', e => { if (e.target === ov) closePlnewDelete(); });
  ov.querySelector('.pldel-cancel').addEventListener('click', closePlnewDelete);
  wireSheetGrab(ov, '.pldel-sheet', closePlnewDelete);
  ov.querySelector('.pldel-go').addEventListener('click', plnewDelete);
  return ov;
}

window.plnewAskDelete = function (btn) {
  if (!PLNEW.editing) return;
  const host = (btn && btn.closest && btn.closest('.s-plnew')) || document.querySelector('.s-plnew');
  if (!host) return;
  const ov = ensurePldelSheet();
  ov.querySelector('.pldel-title').textContent = `Delete “${PLNEW.name.trim() || PLNEW.editing}”?`;
  host.appendChild(ov);
  requestAnimationFrame(() => ov.classList.add('open'));
};

function closePlnewDelete() {
  const ov = document.getElementById('pldel');
  if (ov) ov.classList.remove('open');
}

/* Two homes, same as saving: one you created is a real object in PLNEW_CREATED
   and is spliced out; an authored sample is re-dealt by `plLists()` on every
   call, so it gets a `deleted` flag in plCustom under its stable key and
   `plLists()` filters it out. That flag lives in localStorage with the badges,
   so a deleted sample stays gone across reloads — clear
   `spindeck-pl-custom` to get the sample wall back. */
window.plnewDelete = function () {
  const key = PLNEW.editing;
  if (!key) return;
  const made = window.PLNEW_CREATED || [];
  const i = made.findIndex(l => l.name === key);
  if (i !== -1) made.splice(i, 1);
  else plSetCustom(key, { deleted: true });
  if (window.activePlaylist && (window.activePlaylist.key === key || window.activePlaylist.name === key)) {
    window.activePlaylist = null;
  }
  PLNEW.editing = null;
  closePlnewDelete();
  // Not goBack(): the recorded location may be the page of the playlist that no
  // longer exists. The wall is the only sensible place to land.
  backStack.length = 0;
  navigate('playlists', 'back');
};

window.plnewSetName = function (v) { PLNEW.name = v;  plnewSync(); };
window.plnewSetPriv = function (p) { PLNEW.privacy = p; plnewSync(); };
// Typing switches back out of library mode — you're searching now.
window.plnewSearch  = function (q) { PLNEW.q = q; if (q.trim()) PLNEW.mode = 'search'; plnewSync(); };

// Cover is a real upload: the well is a <label> wrapping a file input, so the
// picker opens natively. The image is read to a data: URL and lives in PLNEW,
// which means it survives re-renders (the file input's own value does not).
window.plnewUpload = function (input) {
  const f = input && input.files && input.files[0];
  if (!f) return;
  const fr = new FileReader();
  fr.onload = () => { PLNEW.cover = fr.result; plnewSync(); };
  fr.readAsDataURL(f);
};

// ── "Add from library" — pull songs in from playlists you already have.
// (In this app the Playlists screen IS the library, hence the name.)
window.plnewToggleLib = function () {
  PLNEW.mode = PLNEW.mode === 'library' ? 'search' : 'library';
  PLNEW.libOpen = null;
  plnewSync();
};
window.plnewOpenList  = function (name) { PLNEW.libOpen = name; plnewSync(); };
window.plnewCloseList = function ()     { PLNEW.libOpen = null; plnewSync(); };
window.plnewAddAll = function (name) {
  const pl = plLists().find(l => l.name === name);
  if (!pl) return;
  sceneReact('playlist');
  const have = new Set(PLNEW.songs.map(s => s.key));
  plTracksFor(pl).forEach(t => { if (!have.has(t.key)) { PLNEW.songs.push(t); have.add(t.key); } });
  plnewSync();
};
window.plnewAddSong = function (key) {
  if (PLNEW.songs.some(s => s.key === key)) return;
  sceneReact('playlist');
  // The pool covers every archive track; a playlist row resolves there too,
  // since plTracksFor() builds its keys the same way.
  const t = plnewPool().find(s => s.key === key)
         || (PLNEW.libOpen ? plTracksFor(plLists().find(l => l.name === PLNEW.libOpen) || {}).find(s => s.key === key) : null);
  if (t) PLNEW.songs.push(t);
  plnewSync();
};
window.plnewRemoveSong = function (key) {
  PLNEW.songs = PLNEW.songs.filter(s => s.key !== key);
  plnewSync();
};

window.plnewCreate = function () {
  const name = PLNEW.name.trim();
  if (!name) return;                               // the button is disabled anyway

  /* EDITING an existing one. Two homes to write to, because a playlist can come
     from either place:
       • one you created lives as a real object in PLNEW_CREATED — mutate it.
       • an authored sample lives in `plLists()`, which is regenerated on every
         call — so the change goes to `plCustom` under the STABLE KEY and gets
         merged back over the literal. Storing under the key rather than the
         name is what lets a rename stick without orphaning the badges. */
  if (PLNEW.editing) {
    const key = PLNEW.editing;
    const made = (window.PLNEW_CREATED || []).find(l => l.name === key);
    const patch = {
      name,
      image: PLNEW.cover || (PLNEW.songs[0] && PLNEW.songs[0].image) || PLNEW_FALLBACK_COVER,
      private: PLNEW.privacy === 'private',
      tracks: PLNEW.songs.length,
      songs: PLNEW.songs.slice(),
      edited: 'just now',
    };
    if (made) Object.assign(made, patch);
    else plSetCustom(key, patch);
    PLNEW.editing = null;
    window.activePlaylist = plLists().find(l => l.key === key || l.name === name) || null;
    navigate('playlist');
    return;
  }

  const pl = {
    name,
    creator: 'you',
    tracks:  PLNEW.songs.length,
    favs: 0, plays: 0,
    edited: 'just now',
    // No upload? borrow the first track's album art, and only fall back to the
    // app mark if the playlist is empty too — so a card is never a broken image.
    image:  PLNEW.cover || (PLNEW.songs[0] && PLNEW.songs[0].image) || PLNEW_FALLBACK_COVER,
    private: PLNEW.privacy === 'private',
    songs:  PLNEW.songs.slice(),                   // the real picks, for the detail page
  };
  window.PLNEW_CREATED.unshift(pl);
  window.activePlaylist = pl;
  navigate('playlist');                            // straight into the thing you just made
};

/* The three list bodies. These are shared: playlistNewHtml() calls them so a
   FRESH render already paints the current PLNEW (the getter pattern the rest of
   the dynamic screens use), and plnewSync() calls them again to patch the live
   instances between renders without a full re-render — which would blow away
   the focus/caret of whatever field is being typed in. */
// The chosen list sits directly under the search, so songs stack up beneath it
// as you add them. Empty renders NOTHING (not an empty-state line) — the results
// hint below already says what to do, and a placeholder here would just push the
// results down for no reason.
window.plnewChosenHtml = function () {
  if (!PLNEW.songs.length) return '';
  return PLNEW.songs.map((t, i) => `
    <div class="plp-song plnew-row">
      <div class="plp-song-num">${i + 1}</div>
      <div class="plp-song-line"><span class="plp-song-title">${obEsc(t.title)}</span><span class="plp-song-album">${obEsc(t.album)}</span> · <span class="plp-song-artist">${obEsc(t.artist)}</span></div>
      <div class="plp-song-dur">${t.dur}</div>
      <button class="plnew-x" title="Remove" aria-label="Remove"
              onclick="plnewRemoveSong('${obOc(t.key)}')">×</button>
    </div>`).join('');
};

// One track row with an add / remove control, shared by search and library.
function plnewTrackRow(t, picked) {
  const has = picked.has(t.key);
  return `
    <div class="plp-song plnew-row plnew-res${has ? ' plnew-res--on' : ''}">
      <div class="plnew-res-art" style="background-image:url('${t.image}')"></div>
      <div class="plp-song-line"><span class="plp-song-title">${obEsc(t.title)}</span><span class="plp-song-album">${obEsc(t.album)}</span> · <span class="plp-song-artist">${obEsc(t.artist)}</span></div>
      <div class="plp-song-dur">${t.dur}</div>
      <button class="plnew-plus" title="${has ? 'Added' : 'Add to playlist'}" aria-label="Add"
              onclick="plnew${has ? 'RemoveSong' : 'AddSong'}('${obOc(t.key)}')">${has ? '✓' : '+'}</button>
    </div>`;
}

window.plnewResultsHtml = function () {
  const picked = new Set(PLNEW.songs.map(s => s.key));

  // ── library mode: your own playlists, then one opened to its tracks ──
  if (PLNEW.mode === 'library') {
    if (!PLNEW.libOpen) {
      const lists = plLists().filter(l => l.name !== PLNEW.name.trim());
      if (!lists.length) return `<div class="plnew-empty">No playlists to pull from yet.</div>`;
      return lists.map(l => `
        <button class="plnew-liblist" onclick="plnewOpenList('${obOc(l.name)}')">
          <span class="plnew-lib-art" style="background-image:url('${l.image}')"></span>
          <span class="plnew-lib-meta">
            <span class="plnew-lib-name">${obEsc(l.name)}</span>
            <span class="plnew-lib-sub">${l.tracks} songs · by ${obEsc(l.creator)}</span>
          </span>
          <span class="plnew-lib-chev">›</span>
        </button>`).join('');
    }
    const pl = plLists().find(l => l.name === PLNEW.libOpen);
    if (!pl) return `<div class="plnew-empty">That playlist is gone.</div>`;
    const tracks = plTracksFor(pl);
    const left = tracks.filter(t => !picked.has(t.key)).length;
    return `
      <div class="plnew-libhead">
        <button class="plnew-libback" onclick="plnewCloseList()" aria-label="Back to playlists">‹</button>
        <span class="plnew-libhead-t">${obEsc(pl.name)}</span>
        <button class="plnew-liball" onclick="plnewAddAll('${obOc(pl.name)}')" ${left ? '' : 'disabled'}>
          ${left ? `Add all · ${left}` : 'All added'}
        </button>
      </div>
      ${tracks.map(t => plnewTrackRow(t, picked)).join('')}`;
  }

  // ── search mode: nothing until you actually type ──
  const term = PLNEW.q.trim().toLowerCase();
  if (!term) {
    return `<div class="plnew-empty">Search for a song, album or artist — or pull one in from <b>Library</b>.</div>`;
  }
  const list = plnewPool().filter(t =>
    t.title.toLowerCase().includes(term) ||
    t.album.toLowerCase().includes(term) ||
    t.artist.toLowerCase().includes(term)).slice(0, 40);
  if (!list.length) return `<div class="plnew-empty">Nothing matches “${obEsc(PLNEW.q)}”.</div>`;
  return list.map(t => plnewTrackRow(t, picked)).join('');
};

window.plnewCountLabel  = function () { const n = PLNEW.songs.length; return n === 1 ? '1 song' : `${n} songs`; };
window.plnewCreateLabel = function () {
  const n = PLNEW.songs.length;
  const verb = PLNEW.editing ? 'Save changes' : 'Create playlist';
  return n ? `${verb} · ${n} song${n === 1 ? '' : 's'}` : verb;
};

// Patch every live .s-plnew after an edit. The screen's own getter already
// paints the initial state, so this only has to keep the two side-by-side
// variants agreeing once the user starts interacting.
function plnewSync() { document.querySelectorAll('.s-plnew').forEach(plnewSyncOne); }

function plnewSyncOne(root) {
  const q = sel => root.querySelector(`[data-plnew="${sel}"]`);
  const cover = PLNEW.cover;

  /* ⚠️ A video cover cannot be previewed as a `background-image` — it would
     paint nothing and read as a failed upload. The well keeps a `<video>` of its
     own, created only when one is needed and removed the moment it is not, so a
     still cover leaves no idle element behind. */
  const coverEl = q('cover');
  if (coverEl) {
    const vid = plIsVideo(cover);
    coverEl.style.backgroundImage = (cover && !vid) ? `url('${cover}')` : '';
    coverEl.classList.toggle('plnew-cover--set', !!cover);
    let v = coverEl.querySelector('.plnew-cover-vid');
    if (vid) {
      if (!v) {
        v = document.createElement('video');
        v.className = 'plnew-cover-vid';
        v.muted = true; v.loop = true; v.playsInline = true;
        coverEl.appendChild(v);
      }
      if (v.getAttribute('src') !== cover) v.src = cover;
      v.play().catch(() => {});          // a blocked autoplay is not an error here
    } else if (v) { v.remove(); }
  }
  const cd = q('cd');
  if (cd) cd.style.backgroundImage = (cover && !plIsVideo(cover)) ? `url('${cover}')` : '';

  // Only write an input when it actually differs — assigning .value on the field
  // being typed in would jump the caret to the end. The typing instance already
  // matches, so this only ever touches the OTHER variant.
  const nameEl = q('name');
  if (nameEl && nameEl.value !== PLNEW.name) nameEl.value = PLNEW.name;
  const qEl = q('q');
  if (qEl && qEl.value !== PLNEW.q) qEl.value = PLNEW.q;

  const countEl = q('count');
  if (countEl) countEl.textContent = plnewCountLabel();

  root.querySelectorAll('.plnew-priv-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.priv === PLNEW.privacy);
  });
  const libBtn = q('libbtn');
  if (libBtn) libBtn.classList.toggle('active', PLNEW.mode === 'library');

  const chosen = q('chosen');  if (chosen)  chosen.innerHTML  = plnewChosenHtml();
  const results = q('results'); if (results) results.innerHTML = plnewResultsHtml();

  const create = q('create');
  if (create) {
    create.disabled = !PLNEW.name.trim();
    create.textContent = plnewCreateLabel();
  }
}

/* The live pill has NO face any more. It used to greet you with a smile+wink on
   the first home render (greetRing) and reform into the smiley every ~10s
   (homeRingPeek). Both are gone — the nav's pet carries the app's personality
   now, and these two buttons are controls. The dots keep only their arrow
   formation and the swipe / For-You / CD reactions. */
// CD tap → pick a streaming platform to open this playlist on (prototype menu).
window.togglePlPlat = function (cd) {
  const hero = cd.closest('.plp-hero');
  const menu = hero && hero.querySelector('.plp-plat');
  if (menu) menu.hidden = !menu.hidden;
};
// Playlists song row → log sheet for that song. Subject is passed inline from
// data-attrs: the playlists screen has no _album, so openSongLog's fallback
// (activeAlbum/featuredAlbum) would caption the sheet with the wrong album.
window.plSongTap = function (el) {
  openLogSheet(el, { image: el.dataset.image, title: el.dataset.title, subtitle: el.dataset.sub, isSong: true });
};
/* The artist's name under the deck → the ARTIST PAGE (Eric, 2026-09-25), on
   home's friends deck and the Trending wall's discovery deck alike. The strip
   it sits in opens the album, so the tap is stopped here. The name is read
   off the element — it is what the strip was last painted with, and both
   painters write `album.artist` there verbatim. */
window.fbArtistTap = function (el, e) {
  if (e) e.stopPropagation();
  const name = (el.textContent || '').trim();
  if (name && typeof openArtistPageFor === 'function') openArtistPageFor(name);
};
// Open the artist page for an artist by name, arriving from another screen
// (e.g. the playlists Artists tab) — mirrors openAlbumPage: go home, enter the
// --artist state, and Back returns to the origin screen.
window.openArtistPageFor = function (artistName) {
  const album = (window.ARCHIVE || []).find(a => a.artist === artistName);
  if (!album) return;
  window.activeAlbum = album;
  const enter = s => {
    setMainAlbum(s, album, false);
    s.classList.add('s-home-v3--review', 's-home-v3--album', 's-home-v3--artist');
    populateReviewPanel(s);
    populateArtistPage(s);
    const body = s.querySelector('.v3-body'); if (body) body.scrollTop = 0;
  };
  if (currentScreen().id === 'home' && homeShells().length) {
    pushBack();
    homeShells().forEach(enter);
    return;
  }
  const originSnap = captureScreenSnap();              // origin screen + its sub-state (persona/…)
  navigate('home');
  requestAnimationFrame(() => requestAnimationFrame(() => {
    backStack.push(originSnap);                        // Back → that origin screen
    homeShells().forEach(enter);
  }));
};

// Open the official album page (the fullscreen --album state on the home shell) for a given
// album, arriving from another screen (e.g. trending). Back returns to that origin screen.
window.openAlbumPage = function (album, pinnedReview) {
  if (!album) return;
  // A review tapped in a feed rides along and gets pinned atop the album's
  // review list; any other path into an album page clears the pin.
  window._pinnedReview = pinnedReview || null;
  window.activeAlbum = album;
  const shells = homeShells();
  // Already on the home shell (e.g. tapping an album on the artist page) → transition in place.
  if (currentScreen().id === 'home' && shells.length) {
    pushBack();                                        // remember the current view (artist page, etc.)
    shells.forEach(s => enterAlbumPageState(s, album));
    return;
  }
  // Coming from another screen (e.g. trending): remember it, then go home + straight to album page.
  const originSnap = captureScreenSnap();              // origin screen + its sub-state (persona/…)
  navigate('home');
  requestAnimationFrame(() => requestAnimationFrame(() => {
    backStack.push(originSnap);                        // Back → that origin screen
    homeShells().forEach(s => enterAlbumPageState(s, album));
  }));
};

/* How far the album title may overhang the rating column.
   The rating column is as wide as its widest row — the review count plus the
   vinyls — but the title's only neighbour is the compact score above them, so
   the difference is dead space the title can have. Both figures are measured
   rather than assumed: the score is always "N.N" and so effectively constant,
   but the count is not ("6k" vs "156k"), and it is the count that sets the
   column's width. app.css turns this into a negative margin on the info row and
   an equal padding on the artist beneath it.
   ⚠️ Compact bento only. The review state puts all three on one line, where
   there is no strip to reclaim and an overhang would collide. */
function sizeTitleExtra(screenEl) {
  if (!screenEl || screenEl.classList.contains('s-home-v3--review')) return;
  const row = screenEl.querySelector('.v3-blue-stars-row');
  const score = screenEl.querySelector('.v3-blue-score');
  if (!row || !score) return;
  /* ⚠️ Measured SYNCHRONOUSLY, not in a requestAnimationFrame. rAF doesn't fire
     in a background tab (same trap as paintAfterRender), so the callback simply
     never ran and the title silently kept its old width — reproducibly, whenever
     the tab wasn't focused. Reading a rect forces layout on demand, so waiting
     for a frame bought nothing here in the first place.
     ⚠️ No feedback loop: the rating column is `auto`, sized by this row, and the
     margin below lands on the info row in the OTHER column. */
  const rowW = row.getBoundingClientRect().width;
  const scoreW = score.getBoundingClientRect().width;
  if (!rowW || !scoreW) return;
  // Leave a little air so the title never actually touches the score.
  const extra = Math.max(0, rowW - scoreW - 6);
  screenEl.style.setProperty('--sd-title-extra', extra.toFixed(1) + 'px');
}

// Live-pill ring reactions — swipe / For You / CD each fire a distinct animation;
// idle it spins slowly. (Later this can become a real music visualizer.)
function reactRing(screenEl, type) {
  const ring = screenEl && screenEl.querySelector('.v3-ring');
  if (!ring) return;
  ring.classList.remove('v3-ring--swipe', 'v3-ring--foryou', 'v3-ring--cd');
  void ring.offsetWidth;                       // restart the animation if re-triggered
  ring.classList.add('v3-ring--' + type);
  if (window.sceneCheer) sceneCheer();         // the scoop reacts to the same events
  clearTimeout(ring._reactT);
  ring._reactT = setTimeout(() => ring.classList.remove('v3-ring--' + type), type === 'foryou' ? 340 : 650);
}
window.reactRing = reactRing;

// CD tap — react the ring and toggle the compact CD popup (preview + streaming
// platforms), anchored above the CD like the playlist page's plat menu.
/* ══════════════════════════════════════════════════════════════════════════
   THE NAV CONSOLE — where a CD tap goes now (`openConsole` · `closeConsole`)
   ══════════════════════════════════════════════════════════════════════════
   ⚠️ Tapping a CD used to raise a POPUP over the screen. It does not any more,
   and it should not go back: a floating panel covered the record you had just
   tapped, and it was a second surface to dismiss on top of a screen that already
   has a nav. The nav's hump is already the app's "what is playing" strip, so
   the answer to "where do I hear this?" belongs in it. The plateau GROWS
   (`.s-home-v3--console`, see app.css), the friends ticker gives way to the
   album you tapped, and the room that opens up holds the four services.

   ⚠️ It closes on the next thing you do — a scroll, or a touch on the bento.
   That is what keeps it from being a mode: you never have to put it away, and
   the ticker comes back on its own. `closeConsole` is idempotent so every one of
   those paths can call it without checking.

   ⚠️ The album lives on the SHELL (`_consoleAlbum`), not in a global. Several
   `.s-home-v3` exist at once and the first is often not the visible one — the
   same trap that once played previews for the wrong track — and the console can
   be showing a profile favourite, which is not the shell's bento album. */
window.openConsole = function (screenEl, album) {
  if (!screenEl || !album) return;
  if (window.closeFriends) window.closeFriends(screenEl);   // one thing in the hump at a time
  screenEl._consoleAlbum = album;

  const box = screenEl.querySelector('.v3-console');
  if (box) {
    const art = box.querySelector('.v3-nc-art');
    if (art) art.style.backgroundImage = album.image ? `url('${album.image}')` : '';
    const alb = box.querySelector('.v3-nc-alb');
    if (alb) alb.textContent = album.album || '';
    const yr = box.querySelector('.v3-nc-yr');
    if (yr) yr.textContent = album.year ? String(album.year) : '';
    const who = box.querySelector('.v3-nc-artist');
    if (who) who.textContent = album.artist || '';
    box.setAttribute('aria-hidden', 'false');
  }
  screenEl.classList.add('s-home-v3--console');

  /* Resolve all four links while the plateau is still growing, so the button you
     then tap opens its tab synchronously and is not caught by the popup blocker. */
  warmServiceLinks(album);
  consoleArmDismiss(screenEl);
};

window.closeConsole = function (elOrScreen) {
  const scr = (elOrScreen && elOrScreen.closest)
    ? elOrScreen.closest('.s-home-v3') : elOrScreen;
  if (!scr || !scr.classList.contains('s-home-v3--console')) return;
  scr.classList.remove('s-home-v3--console');
  scr._consoleAlbum = null;
  const box = scr.querySelector('.v3-console');
  if (box) box.setAttribute('aria-hidden', 'true');
  if (scr._consoleOff) { scr._consoleOff(); scr._consoleOff = null; }
};

/* What puts it away again. ⚠ The scroll listener goes on `.v3-body` — the
   element that actually scrolls — not the window: in the desktop viewer the
   phone is a box on a page that never scrolls itself, so a window listener would
   never fire. ⚠ Wired per OPEN and torn down on close, rather than once at
   build: a permanent `pointerdown` listener on the bento would run on every tap
   of a screen that is usually not in console state at all.
   ⚠ `capture` on the bento so it lands even though the CD, the cover and the
   For You box all stop propagation on their own handlers. */
function consoleArmDismiss(scr) {
  if (scr._consoleOff) scr._consoleOff();
  const body  = scr.querySelector('.v3-body');
  const bento = scr.querySelector('.v3-bento');
  const bye = () => window.closeConsole(scr);
  /* ⚠ A tap on the console itself must not close it — the service buttons live
     in there. They stop propagation, but the padding between them does not.
     ⚠ Nor a tap on the CD. This fires on pointerdown, before the CD's click:
     it was closing the console and `onCdTap` then found it closed and opened
     it straight back up, so the CD could never put its own console away. The
     CD is the toggle; it decides for itself. */
  const onBento = (ev) => { if (!ev.target.closest('.v3-console, .v3-cd')) bye(); };
  if (body)  body.addEventListener('scroll', bye, { passive: true });
  if (bento) bento.addEventListener('pointerdown', onBento, true);
  scr._consoleOff = () => {
    if (body)  body.removeEventListener('scroll', bye, { passive: true });
    if (bento) bento.removeEventListener('pointerdown', onBento, true);
  };
}

window.onCdTap = function (el, e) {
  if (e) e.stopPropagation();
  const scr = el.closest('.s-home-v3');
  if (!scr) return;
  reactRing(scr, 'cd');
  // Tapping the CD again puts the console away — the CD is the toggle.
  if (scr.classList.contains('s-home-v3--console')) { window.closeConsole(scr); return; }
  window.openConsole(scr, scr._album || currentBentoAlbum());
};

// Play a 30s preview from the stream sheet — toggles play/pause on the button itself.
window.playPreview = function (el, e) {
  if (e) e.stopPropagation();
  const album = (window.currentBentoAlbum && currentBentoAlbum()) || window.activeAlbum || window.featuredAlbum;
  if (!album) return;
  const a = previewAudioEl();
  unlockAudio(a);                          // iOS: unlock inside the tap gesture
  if (el.classList.contains('playing')) { a.pause(); el.classList.remove('playing'); return; }
  a.onended = () => el.classList.remove('playing');
  const start = (url) => {
    if (!url) { el.classList.add('none'); setTimeout(() => el.classList.remove('none'), 1400); return; }
    if (a.src !== url) { a.src = url; a.currentTime = 0; }
    a.play().then(() => { PREVIEW.unlocked = true; el.classList.add('playing'); }).catch(() => {});
  };
  const cached = PREVIEW_CACHE.get(albumKey(album).toLowerCase());
  if (cached !== undefined) start(cached);
  else fetchPreviewUrl(album).then(start);
};

// Live pill doubles as the Back button in the fullscreen states — pops the history stack.
window.onLivePill = function (btn) {
  const scr = btn.closest('.s-home-v3');
  if (!scr) return;
  /* Checked FIRST. The mix dial is a state you are HELD in — the cover-hold
     handed over to it and the gesture does not resolve until you pick a mix or
     leave — so while the dial is up this pill means "back" ahead of anything
     the screen underneath would otherwise make it mean. */
  /* ⚠ ONE LEVEL AT A TIME. Inside a main's ring, Back means back to the mains —
     not out of the dial. Closing from two levels deep would throw away the step
     you took as well as the one you meant to undo, and there is no other way
     back up: the mains are not on screen while you are inside one. */
  if (scr.classList.contains('s-home-v3--mixing')) {
    if (MIX.at) mixGoto(null); else closeMixDial();
    return;
  }
  if (scr.classList.contains('s-home-v3--review')) { goBack(); return; }
  toggleHand();   // regular bento state: the pill is the hand-layout switch
};
// Tap a star to set your own rating — left half = .5, right half = whole
window.setMyRating = function (starEl, e) {
  const wrap = starEl.parentElement;
  const base = parseInt(starEl.dataset.v);
  const rect = starEl.getBoundingClientRect();
  const isHalf = e && (e.clientX - rect.left) < rect.width / 2;
  const val = isHalf ? base - 0.5 : base;
  wrap.dataset.rating = String(val);
  paintMyStars(wrap, val);
};
function paintMyStars(wrap, val) {
  if (!wrap) return;
  wrap.querySelectorAll('.v3-rev-star').forEach(s => {
    const i = parseInt(s.dataset.v);
    s.classList.remove('on', 'half');
    if (val >= i)            s.classList.add('on');
    else if (val >= i - 0.5) s.classList.add('half');
  });
}
// Grow the review box to fit its content; reveal Post only once there's text
window.autoGrowReview = function (ta) {
  ta.style.height = 'auto';
  ta.style.height = ta.scrollHeight + 'px';
  const mine = ta.closest('.v3-rev-mine');
  const btn = mine && mine.querySelector('.v3-rev-submit');
  if (btn && !btn.disabled) btn.style.display = ta.value.trim() ? 'inline-block' : 'none';
};
// Post the review — prepends it as a "You" card, then resets the form
window.submitReview = function (btn) {
  const scr = btn.closest('.s-home-v3');
  if (!scr) return;
  const ta = scr.querySelector('.v3-rev-write');
  const wrap = scr.querySelector('.v3-rev-stars');
  const rating = parseFloat(wrap && wrap.dataset.rating) || 0;
  const text = (ta && ta.value.trim()) || '';
  if (!rating && !text) return;
  const list = scr.querySelector('.v3-rev-list');
  if (list) {
    // Same key the saved-draft "mine" card uses — it's the same review, so a
    // comment left here survives the next populateReviewList.
    const alb = scr._album || window.featuredAlbum || {};
    const myKey = 'mine::' + (alb.album || '');
    const card = document.createElement('div');
    card.className = 'v3-rev-card v3-rev-card--mine';
    card.dataset.k = myKey;                     // the 4th card builder — tap opens its page
    REV_INDEX[myKey] = { key: myKey, album: alb, name: 'You', mine: true, rating, text, ago: 'just now', likes: 0, comments: 0 };
    card.onclick = () => cmtCardTap(card);
    card.innerHTML = revCardInner({
      key: myKey, name: 'You', handle: (window.PROFILE || {}).handle || 'you',
      face: (window.PROFILE || {}).pic || 'images/rp-01.jpg', ago: 'just now',
      rating, text, likes: null, comments: 0, share: true,
    });
    list.insertBefore(card, list.firstChild);
  }
  btn.textContent = 'Posted ✓';
  btn.disabled = true;
  btn.style.display = 'inline-block';
  if (ta) { ta.value = ''; ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 'px'; }
  if (wrap) { wrap.dataset.rating = '0'; paintMyStars(wrap, 0); }
  setTimeout(() => {
    btn.textContent = 'Post review';
    btn.disabled = false;
    btn.style.display = 'none';
  }, 1500);
};
// Listen-later / Favorite toggle buttons in the action grid, and the album
// page's quick-log squares.
window.toggleRevAction = function (btn, e) {
  if (e) e.stopPropagation();
  btn.classList.toggle('on');
  // A quick-log square IS the log sheet's own toggle, so it writes straight
  // into that album's draft — otherwise the square and the sheet would
  // disagree about whether you'd favourited the record.
  if (!btn.classList.contains('v3-rev-q') && !btn.classList.contains('v3-rg-btn')) return;
  const k = btn.dataset.k;
  const scr = btn.closest('.s-home-v3');
  const a = shellAlbum(scr);
  if (!k || !a) return;
  const on = btn.classList.contains('on');
  writeDraftFlag({ title: a.album, subtitle: a.artist, image: a.image }, k, on);
  // The dark/light shells show the SAME album, and this is state about the
  // record rather than about the screen — so the twin follows. (Deliberate
  // exception to the usual "scope handlers to the clicked shell" rule.)
  // ALL matching squares, this shell included: the artist page's corner
  // Favorite pill and the album page's quick-log square are the same toggle.
  homeShells().forEach(s => {
    if (s !== scr && s._album !== a) return;
    s.querySelectorAll(`.v3-rev-q[data-k="${k}"], .v3-rg-btn[data-k="${k}"]`).forEach(b => {
      if (b !== btn) b.classList.toggle('on', on);
    });
  });
};

/* The album a home shell is showing. ⚠️ `_album` is set by setMainAlbum, which
   only runs on the swipe and openAlbumPage paths — tapping the bento into the
   album page never calls it, so on that route `_album` is undefined and the
   fallback is what resolves the record. Anything reading the current album off
   a shell has to go through here or it silently gets nothing. */
function shellAlbum(scr) {
  return (scr && scr._album) || window.activeAlbum || window.featuredAlbum || null;
}

// Paint a shell's quick-log squares from the saved draft for its album.
// `album` is passed in where the caller already resolved one, so the squares
// can never disagree with the panel they sit in.
function syncQuickLog(scr, album) {
  if (!scr) return;
  const d = albumDraft(album || shellAlbum(scr));
  scr.querySelectorAll('.v3-rev-q[data-k], .v3-rg-btn[data-k]').forEach(b => b.classList.toggle('on', !!d[b.dataset.k]));
  syncRevCta(scr, d);
}
/* YOUR REVIEW answers to the draft (the CTA did, from 2026-09-11; the rate
   circle from 2026-09-18; the band since 2026-09-24). Untouched record →
   "_._" dim with empty discs and a "Tap to rate". Rated → your number in the
   album gold with your discs. Written but unrated → the blank with
   "Reviewed" beside it. Same tap either way (the log sheet); only the face
   changes. The state is stamped in `data-state` and the markup is only
   rebuilt when it changes — this runs on every autosave. */
function syncRevCta(scr, d) {
  const box = scr.querySelector('.v3-rev-yours');
  if (!box) return;
  const rated = d.rating > 0, wrote = !!(d.text || '').trim();
  const state = rated ? 'r' + d.rating : (wrote ? 'w' : '');
  if (box.dataset.state === state) return;
  box.dataset.state = state;
  box.classList.toggle('is-rated', rated);
  box.classList.toggle('is-written', !rated && wrote);
  const n = box.querySelector('.v3-rev-mine-n'), sub = box.querySelector('.v3-rev-mine-sub');
  if (n) n.textContent = rated ? Number(d.rating).toFixed(1) : '0.0';
  if (sub) sub.innerHTML = halfStars(rated ? Number(d.rating) : 0, 13, true) +
    `<span class="v3-rev-score-count">${wrote ? 'Reviewed' : ''}</span>`;   // the "Tap to rate" is the sideways marquee (markup), not this
}
// Friends / Popular / New filter tabs
window.setReviewFilter = function (btn) {
  const bar = btn.parentElement;
  bar.querySelectorAll('.v3-rev-filter').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  populateReviewList(btn.closest('.s-home-v3'), btn.dataset.f);
};

function populateReviewPanel(scr) {
  const a = scr._album || window.featuredAlbum;
  if (!a) return;
  const nameEl = scr.querySelector('.v3-rev-album-name');
  if (nameEl) nameEl.textContent = a.album;
  // reset your draft (rating + text) when the album changes
  const stars = scr.querySelector('.v3-rev-stars');
  if (stars) { stars.dataset.rating = '0'; paintMyStars(stars, 0); }
  const ta = scr.querySelector('.v3-rev-write');
  if (ta) { ta.value = ''; autoGrowReview(ta); }
  scr.querySelectorAll('.v3-rev-btn.on').forEach(b => b.classList.remove('on'));
  // The quick-log squares are your state on THIS record, so they don't carry
  // across a swipe — they're re-read from the new album's saved draft instead
  // of just cleared, which is what makes a favourite survive a reload.
  syncQuickLog(scr, a);
  populateRecTag(scr, a);
  populateHist(scr, a);
  populateSongList(scr);
  const active = scr.querySelector('.v3-rev-filter.active');
  populateReviewList(scr, active ? active.dataset.f : 'popular');
}

// ── Tracklist under the review CTA ────────────────────────────
// Titles/durations/ratings are deterministic placeholders (seeded per album)
// until real per-song data exists. Each row opens the log sheet for that song.
const SONG_WORDS = ['Ceremony','Glass','Velvet','Static','Halcyon','Ember','Marrow','Neon','Pale','Drift','Saints','Cinder','Vermilion','Lull','Fathom','Wax','Ghost','Iron','Petals','Sable','Hollow','Aurora','Mercury','Slow','Cobalt','Fever','Tundra','Opal','Riptide','Lantern','Cavern','Dial','Salt','Bloom','Anthem','Dusk','Vessel','Crown','Signal','Amber'];

function seedRand(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return () => {
    h += 0x6D2B79F5; let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function songsFor(album) {
  const n = Math.max(1, album.tracks || 10);
  const rnd = seedRand(album.album || 'x');
  const out = [];
  for (let i = 0; i < n; i++) {
    const w1 = SONG_WORDS[Math.floor(rnd() * SONG_WORDS.length)];
    const w2 = rnd() < 0.35 ? ' ' + SONG_WORDS[Math.floor(rnd() * SONG_WORDS.length)] : '';
    const secs = 150 + Math.floor(rnd() * 210);                 // 2:30–6:00
    const dur = Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0');
    const rating = Math.round((3.5 + rnd() * 1.5) * 2) / 2;      // 3.5–5.0 in half steps
    out.push({ n: i + 1, title: w1 + w2, dur, rating });
  }
  return out;
}
// Rating-distribution histogram — 10 buckets (½★ … 5★), seeded per album and
// peaked around the album's own score so each album has a distinct, stable spread.
function ratingSpreadFor(album) {
  const rnd = seedRand((album.album || 'x') + '::spread');
  const peak = Math.min(10, Math.max(1, Math.round((album.rating || 4) * 2)));
  const w = [];
  for (let i = 1; i <= 10; i++) {
    const d = i - peak;
    let v = Math.exp(-(d * d) / 5.5);       // bell curve centered on the score
    v *= 0.6 + rnd() * 0.75;                // per-bucket jitter
    if (i <= 2) v *= 0.35 + rnd() * 0.3;    // very low ratings are rarer
    w.push(v);
  }
  const max = Math.max(...w) || 1;
  return w.map(v => Math.max(0.05, v / max));   // normalize 0–1, keep a visible floor
}
function populateHist(scr, album) {
  const box = scr && scr.querySelector('.v3-rev-hist');
  if (!box || !album) return;
  const bars = ratingSpreadFor(album);
  const barsEl = box.querySelector('.v3-rev-hist-bars');
  if (barsEl) barsEl.innerHTML = bars.map((h, i) =>
    `<span class="v3-rev-hist-bar" title="${(i + 1) / 2}★"><span style="height:${Math.round(h * 100)}%"></span></span>`
  ).join('');
  const sub = box.querySelector('.v3-rev-hist-sub');
  if (sub) sub.textContent = (window.fmtRc ? fmtRc(album.reviewCount || 0) : (album.reviewCount || 0)) + ' reviews';
  populateBigScore(scr, album);
}

/* The album page's headline score — the big number above the histogram.
   ⚠️ Deliberately a SECOND printing of the same rating that `.v3-blue-score`
   shows under the artist. They aren't redundant: the one-liner is a label on
   the record (album · year · artist · score), while this one is the heading for
   the ratings section beneath it, which is why it takes the histogram's
   alignment and not the stats strip's.
   ⚠️ Hidden on the artist page — an artist isn't a thing you score, same reason
   `.v3-blue-score` is hidden there. */
function populateBigScore(scr, album) {
  // ⚠️ The COMMUNITY score's number, not yours: `.v3-rev-yours` above it wears
  // the same classes (so the two match), and a bare `.v3-rev-score-n` query
  // found that one first and left this one blank (2026-09-25).
  const n = scr && scr.querySelector('.v3-rev-score:not(.v3-rev-score--mine) .v3-rev-score-n');
  if (!n || !album) return;
  n.textContent = (album.rating || 0).toFixed(1);
  // cssSized: the discs take their size from app.css so the dev box can tune
  // them. An inline width/height would beat any rule short of !important.
  const sub = scr.querySelector('.v3-rev-score:not(.v3-rev-score--mine) .v3-rev-score-sub');
  // The review COUNT rides after the discs (Eric, 2026-09-18) — the one-liner
  // that used to carry it is hidden on this page (see .v3-blue-stars-row).
  if (sub) sub.innerHTML = halfStars(album.rating, 13, true) +
    (album.reviewCount ? `<span class="v3-rev-score-count">${window.fmtRc(album.reviewCount)} reviews</span>` : '');
}
/* A favourited song's TRACK NUMBER becomes a heart (Eric, 2026-09-18 — it was
   a heart left of the rating for a minute; this is cuter), read from the same
   draft the song's log sheet writes (`song::title::album`). The number cell
   keeps its width, so the columns hold. */
function songIsFav(album, title) {
  const d = logDrafts()[`song::${title}::${album.album}`];
  return !!(d && d.fav);
}
function songNumHtml(album, title, i) {
  return songIsFav(album, title)
    ? `<span class="v3-song-fav">${typeof RVP_HEART !== 'undefined' ? RVP_HEART : '♥'}</span>`
    : String(i + 1);
}
function refreshSongFavs(scr) {
  const a = scr && scr._album; if (!a) return;
  scr.querySelectorAll('.v3-song-row').forEach((row, i) => {
    const cell = row.querySelector('.v3-song-num'); if (!cell) return;
    const want = songNumHtml(a, row.dataset.title, i);
    if (cell.innerHTML !== want) cell.innerHTML = want;
  });
}
// The tracklist shows its first SONGS_SHOWN rows; a longer album gets a
// "View all songs" button that expands the list in place (expandSongList).
// Opening the page always starts collapsed — `all` is only ever passed by the
// button. An album at or under the cap has no button at all.
const SONGS_SHOWN = 8;
function populateSongList(scr, all) {
  const wrap = scr && scr.querySelector('.v3-rev-songs');
  if (!wrap) return;
  const a = scr._album || window.featuredAlbum;
  if (!a) { wrap.innerHTML = ''; return; }
  const songs = songsFor(a);
  const shown = all ? songs : songs.slice(0, SONGS_SHOWN);
  const more = songs.length - shown.length;
  // In flow, not a nested scroller — the page is the scroller. The header row
  // reuses the row's own cell classes so the labels can only ever sit over the
  // columns they name (see .v3-song-head in app.css).
  wrap.innerHTML = `
    <div class="v3-song-head">
      <span class="v3-song-num"></span>
      <span class="v3-song-title">Song</span>
      <span class="v3-song-dur">Length</span>
      <span class="v3-song-rate">Rating</span>
    </div>
    <div class="v3-rev-songs-scroll">` + shown.map((s, i) => `
    <button class="v3-song-row" onclick="event.stopPropagation(); openSongLog(this)" data-title="${s.title}">
      <span class="v3-song-num">${songNumHtml(a, s.title, i)}</span>
      <span class="v3-song-title">${s.title}</span>
      <span class="v3-song-dur">${s.dur}</span>
      <span class="v3-song-rate">${s.rating.toFixed(1)}</span>
    </button>`).join('') + `</div>` + (more > 0 ? `
    <button class="v3-songs-more" onclick="event.stopPropagation(); expandSongList(this)">View all ${songs.length} songs</button>` : '');
}
window.expandSongList = function (el) {
  const scr = el.closest('.s-home-v3');
  if (scr) populateSongList(scr, true);
};
window.openSongLog = function(el) {
  const scr = el.closest('.app-screen');
  const a = (scr && scr._album) || window.activeAlbum || window.featuredAlbum;
  openLogSheet(el, { image: a ? a.image : '', title: el.dataset.title, subtitle: a ? a.album : '', year: a ? (a.year || '') : '', isSong: true });
};

// Friend-rec tag at the top of the review panel — populated only when a friend
// has activity on this album; otherwise it's algo-served and stays hidden.
function populateRecTag(scr, album) {
  const rec = scr && scr.querySelector('.v3-rev-rec');
  if (!rec) return;
  const f = (window.friendRecFor && window.friendRecFor(album)) || null;
  if (!f) { rec.hidden = true; return; }
  rec.hidden = false;
  const av = rec.querySelector('.v3-rev-rec-av');
  if (av) { av.style.background = f.grad; av.textContent = f.init; }
  const nm = rec.querySelector('.v3-rev-rec-name');
  if (nm) nm.textContent = f.user;
}

// Deterministic engagement meta (time / likes / comments) for a review, so the
// numbers stay put across filter re-renders instead of reshuffling.
const REV_TIMES = ['just now', '2h', '5h', '9h', '1d', '2d', '4d', '1w', '2w', '3w'];
function revMeta(r, i) {
  const seed = (r.name || '').length * 3 + (r.text || '').length + i * 7;
  return {
    ago: REV_TIMES[seed % REV_TIMES.length],
    likes: 3 + (seed * 13) % 140,
    comments: 6 + (seed * 7) % 38,          // 6–43: enough that the page scrolls into them (2026-09-11)
  };
}

// ── Review upvotes ────────────────────────────────────────────
// Counts are seeded per review so they're stable across re-renders and filter
// switches. Most reviews sit in the ordinary 5–50 band; a thin tail gets the
// "this one blew up" treatment.
function revUpvotes(r, i) {
  const rnd = seedRand('up::' + (r.name || '') + '::' + (r.text || '').slice(0, 24) + '::' + i);
  const roll = rnd();
  if (roll > 0.985) return 8000 + Math.floor(rnd() * 4500);   // ~1.5% — viral
  if (roll > 0.94)  return 700 + Math.floor(rnd() * 900);     // ~4.5% — big hit
  return 5 + Math.floor(rnd() * 46);                          // the usual 5–50
}

// Your own votes, keyed per review so a re-render (or a filter switch) keeps them.
const REV_VOTES = Object.create(null);
function _revAttr(s) { return _sdsEsc(s).replace(/"/g, '&quot;'); }

const THUMB_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 22V11m0 0 4.2-8.4a2 2 0 0 1 2.9 2.5L12.8 9H19a2 2 0 0 1 2 2.4l-1.6 8A2 2 0 0 1 17.4 21H7"/><path d="M3 22h4V11H3z"/></svg>`;

// One upvote pill. `key` must be stable for the same review across renders.
function upvoteHtml(key, base, extraClass = '') {
  const on = !!REV_VOTES[key];
  return `<button class="v3-up${extraClass ? ' ' + extraClass : ''}${on ? ' is-on' : ''}"
    data-k="${_revAttr(key)}" data-n="${base}"
    aria-pressed="${on}" aria-label="Upvote review"
    onclick="event.stopPropagation(); toggleRevUp(this)">${THUMB_SVG}<span class="v3-up-n">${window.fmtRc(base + (on ? 1 : 0))}</span></button>`;
}

window.toggleRevUp = function (btn) {
  const k = btn.dataset.k;
  const base = +btn.dataset.n || 0;
  const on = !REV_VOTES[k];
  if (on) REV_VOTES[k] = true; else delete REV_VOTES[k];
  btn.classList.toggle('is-on', on);
  btn.setAttribute('aria-pressed', String(on));
  const n = btn.querySelector('.v3-up-n');
  if (n) n.textContent = window.fmtRc(base + (on ? 1 : 0));
  // Every other like pill on this key follows (the deck's under the sheet,
  // the feed card behind it, the light shell's twin) — one like, wherever.
  document.querySelectorAll('.v3-up[data-k]').forEach(b => {
    if (b === btn || b.dataset.k !== k || b.classList.contains('v3-cmt-btn')) return;
    b.classList.toggle('is-on', on);
    b.setAttribute('aria-pressed', String(on));
    const bn = b.querySelector('.v3-up-n');
    if (bn) bn.textContent = window.fmtRc((+b.dataset.n || 0) + (on ? 1 : 0));
  });
  sceneReact(on ? 'like' : 'undo');
};

/* ── Review comments ──────────────────────────────────────────
   A review's replies, as a Reddit-shaped tree: top-level comments with nested
   children behind an indent rail, `CMT_DEFAULT` threads shown and the rest
   behind "View n more comments".

   ⚠️ **The `💬 n` count is the INPUT to the generator, not a second seeded
   number.** Every card already advertised a count (`revMeta`, or the feed
   event's own `comments`), and a thread dealt independently of it would
   disagree with the button that opened it — a thread of five under a badge
   saying nine is the kind of detail that reads as broken.

   ⚠️ **One KEY per review, used by every map here and by the upvote pill.**
   The same review shows up in three places — the home feed row, the pinned
   card and the list card — and they only reach the same thread (and the same
   like state) if they compute the same string. `feedRevKey` and the pinned
   card's key are deliberately identical for this reason.

   Everything is cached per key, so opening a thread, liking a comment or
   switching the review filter never re-deals it. */
const CMT_DEFAULT = 3;                   // top-level threads shown before "view more"
const CMT_CACHE = Object.create(null);   // key → root nodes
const CMT_OPEN  = Object.create(null);   // key → thread expanded?
const CMT_ALL   = Object.create(null);   // key → past the first CMT_DEFAULT?
const CMT_LIKED = Object.create(null);   // key::id → your like
const CMT_MINE  = Object.create(null);   // key → BASE-level comments you posted, newest first
const CMT_REPLY_TO = Object.create(null);// key → id of the comment you're replying to
const CMT_SEQ   = Object.create(null);   // key → id counter for your comments
/* ⚠️ Past this, a reply attaches to its target's PARENT rather than the target.
   Each level costs 17px of a ~360px column, so a fifth indent leaves the text
   too narrow to read — Reddit stops the same way rather than marching off the
   right edge. Generated comments cap at depth 2; this is the ceiling for the
   ones you write. */
const CMT_MAX_DEPTH = 3;
/* ⚠️ FLAT (2026-09-11): no comments on comments. A thread is one level —
   everyone answers the review — so nothing indents and nothing needs a
   "replying to" chip. The generator deals every node as a root, the Reply
   button is not emitted, and the nesting machinery below is left intact
   behind this flag for the day threads come back. */
const CMT_FLAT = true;

// Same handles the inbox pins and the feed casts, so a commenter has the same
// face here as everywhere else (feedFace hashes anything it doesn't know).
const CMT_CAST = ['velvetblast', 'staticfog', 'echoplex', 'moonwire', 'tapehiss',
                  'glassmoth', 'kira_m', 'nova_wr', 'drumkid', 'helio',
                  'vxblank', 'marshmist'];

// Two pools, because a top-level comment answers the REVIEW and a nested one
// answers a COMMENT — one pool for both gives you replies that agree with
// nothing and openers that read as non-sequiturs.
const CMT_OPEN_LINES = [
  'this is the review that finally made me put it on',
  'the second half of this record never gets talked about and it should',
  'genuinely a grower — took me four listens to get there',
  'the mixing on this is doing so much heavy lifting',
  'saw them play it front to back last year and it changed how i hear it',
  'had this on repeat for a whole winter, can barely listen to it now',
  'the drums alone are worth the rating tbh',
  'coming back to this a year later and you were right',
  'perfect album to walk home to at 2am',
  'you and i heard two completely different records lol',
  'track 4 is the whole thesis of the album',
  'aged better than anything else that came out that year',
];
const CMT_REPLY_LINES = [
  'hard agree',
  'nah i think you’re underselling side b',
  'this exactly',
  'the deluxe tracks wreck the pacing though',
  'came here to say the same thing',
  'literally what i tell everyone',
  'respectfully, no',
  'the vinyl master fixes most of that',
  'wait i never noticed that until now',
  'this is the take',
  'give it another spin on headphones',
  'you’re describing my exact experience with it',
];
// Oldest → newest. Indexed by the node's position, never rolled — see below.
const CMT_AGOS = ['3w', '2w', '1w', '5d', '3d', '2d', '1d', '16h',
                  '9h', '5h', '2h', '1h', '35m', '12m', '4m'];

/* Draws from a shuffled queue and reshuffles when it runs dry, rather than
   rolling each time. ⚠️ A plain roll put the SAME line in two adjacent rows —
   with a dozen lines and up to 13 top-level comments that's near-certain, and
   two identical comments in a row reads as a bug, not as coincidence. The
   reshuffle also refuses to lead with the line it just dealt, which is the only
   place a repeat could still land next to itself. */
function cmtDealer(pool, rnd) {
  let q = [];
  let last = null;
  return () => {
    if (!q.length) {
      q = pool.slice();
      for (let i = q.length - 1; i > 0; i--) {
        const j = Math.floor(rnd() * (i + 1));
        [q[i], q[j]] = [q[j], q[i]];
      }
      if (q.length > 1 && q[0] === last) [q[0], q[1]] = [q[1], q[0]];
    }
    return (last = q.shift());
  };
}

function revThread(key, total) {
  if (CMT_CACHE[key]) return CMT_CACHE[key];
  const n = Math.max(0, Math.min(48, Number(total) || 0));
  const rnd = seedRand('cmt::' + key);
  const pick = a => a[Math.floor(rnd() * a.length)];
  const dealOpen = cmtDealer(CMT_OPEN_LINES, rnd);
  const dealReply = cmtDealer(CMT_REPLY_LINES, rnd);
  const roots = [], flat = [];
  for (let i = 0; i < n; i++) {
    /* ⚠️ `ago` comes from the node's ORDER, not a roll. A node is always
       created after its parent, so walking the pool oldest→newest is what
       stops a reply predating the comment it answers. */
    const node = {
      id: 'c' + i, kids: [], depth: 0,
      user: pick(CMT_CAST),
      ago: CMT_AGOS[Math.min(CMT_AGOS.length - 1, Math.floor(i / n * CMT_AGOS.length))],
      likes: Math.floor(rnd() * 24),
      text: '',
    };
    // Reddit's shape is mostly top-level with a few deep pockets — and a reply
    // needs something to answer, hence the 45% split and the depth cap at 2.
    const parents = CMT_FLAT ? [] : flat.filter(c => c.depth < 2);
    if (i && parents.length && rnd() < 0.45) {
      const p = parents[Math.floor(rnd() * parents.length)];
      node.depth = p.depth + 1;
      node.text = dealReply();
      p.kids.push(node);
    } else {
      node.text = dealOpen();
      roots.push(node);
    }
    // Half of them write properly (Eric, 2026-09-24: "proper punctuation
    // half the time"): a capital, an I, a full stop. The other half stay
    // lowercase, no stop — the way most people type in a thread.
    if (rnd() < 0.5) node.text = cmtProper(node.text);
    flat.push(node);
  }
  return (CMT_CACHE[key] = roots);
}
function cmtProper(t) {
  t = String(t || '').trim();
  if (!t) return t;
  t = t.charAt(0).toUpperCase() + t.slice(1);
  t = t.replace(/\bi\b/g, 'I').replace(/\bi(['’])/g, 'I$1');
  if (!/[.!?…]$/.test(t)) t += '.';
  return t;
}

// A subtree's size — what "view n more" has to promise, since a hidden thread
// takes its replies down with it.
function cmtSize(c) { return 1 + c.kids.reduce((s, k) => s + cmtSize(k), 0); }

// Everything in the thread, yours included. ⚠️ Counting CMT_MINE.length instead
// would miss every reply you nested — those live in their parent's `kids`, not
// in the base-level list.
function cmtRoots(key, total) {
  return (CMT_MINE[key] || []).concat(CMT_CACHE[key] || revThread(key, total));
}
function cmtCount(key, total) {
  return cmtRoots(key, total).reduce((s, c) => s + cmtSize(c), 0);
}

/* Locate a node and its parent across BOTH root lists — your base-level
   comments live in CMT_MINE, everyone else's in CMT_CACHE, and Reply can
   target either. */
function cmtFind(key, id) {
  const walk = (list, parent) => {
    for (const c of list) {
      if (c.id === id) return { node: c, parent };
      const hit = walk(c.kids, c);
      if (hit) return hit;
    }
    return null;
  };
  return walk(CMT_MINE[key] || [], null) || walk(CMT_CACHE[key] || [], null);
}

/* csharpuser (2026-09-23): ERIC'S COMMENT GLYPH — a speech bubble that is a belt
   over two pulleys, three pulleys inside for the dots (images/comment-icon.svg
   has the construction). Same 100-unit box and padding as RVP_HEART; stroke
   8.3 here is the 2-in-24 the old glyph wore. The home card thins both (app.css). */
const CMT_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.4 8.4 0 0 1-3.6-.8L3 21l1.9-5.4A8.4 8.4 0 1 1 21 11.5z"/></svg>`;   /* csharpuser (2026-09-25): basic bubble; the belt-over-pulleys glyph and its blinking dots are gone */

/* The comment pill. Same object as the upvote pill (`.v3-up`) so the pair reads
   as one control.
   ⚠️ Two gestures, two verbs: tapping the CARD opens the comments to READ
   them, tapping this pill starts WRITING one. The pill used to toggle, which
   made "comment" the button you pressed to hide the comments — and pressing it
   mid-sentence threw away what you'd typed. */
/* Have YOU commented on this review — at the base or as a reply anywhere in
   the tree? Drives `.is-mine` on the comment button: the bubble turns blue
   and its dots go solid (Eric, 2026-09-23). */
function cmtHasMine(key) {
  if ((CMT_MINE[key] || []).length) return true;
  const deep = n => !!n && (n.mine || (n.kids || []).some(deep));
  return (CMT_CACHE[key] || []).some(deep);
}
function cmtBtnHtml(key, total, extraClass = '') {
  const open = !!CMT_OPEN[key];
  return `<button class="v3-up v3-cmt-btn${extraClass ? ' ' + extraClass : ''}${open ? ' is-open' : ''}${cmtHasMine(key) ? ' is-mine' : ''}"
    type="button" data-k="${_revAttr(key)}" data-n="${Math.max(0, Number(total) || 0)}"
    aria-expanded="${open}" aria-label="Write a comment"
    onclick="event.stopPropagation(); cmtCompose(this)">${CMT_SVG}<span class="v3-up-n">${cmtCount(key, total)}</span></button>`;
}

/* One comment. ⚠️ The indent is REAL NESTING — `.v3-cmt-kids` wraps a node's
   children and carries the offset and the rail, so depth needs no class, no
   inline style and no arithmetic: a child of a child indents twice because it
   sits inside two wrappers. */
function cmtNodeHtml(key, c) {
  const lk = !!CMT_LIKED[key + '::' + c.id];
  const kids = c.kids.length
    ? `<div class="v3-cmt-kids">${c.kids.map(k => cmtNodeHtml(key, k)).join('')}</div>` : '';
  /* THE REVIEW CARD'S SHAPE, minus the score and the share (Eric, 2026-09-17 —
     the old row, small face · name · when over the text with "♥ n" under it,
     read as Reddit): a top row of photo · name over @handle · heart · time,
     then the text full width underneath, like every review card. */
  // ONE name per comment (Eric, 2026-09-24): the username, no @handle under it.
  return `
        <div class="v3-cmt${c.mine ? ' v3-cmt--mine' : ''}">
          <div class="v3-cmt-top">
            <div class="v3-cmt-av" style="background-image:url('${c.face || feedFace(c.user)}')" data-user="${c.mine ? 'You' : sdAttr(c.user)}" onclick="sdPerson(this, event)"></div>
            <div class="v3-cmt-who">
              <span class="v3-cmt-user" data-user="${c.mine ? 'You' : sdAttr(c.user)}" onclick="sdPerson(this, event)">${c.user}</span>
            </div>
            <button class="v3-cmt-like${lk ? ' is-on' : ''}" type="button"
              data-k="${_revAttr(key)}" data-i="${c.id}" data-n="${c.likes}"
              aria-pressed="${lk}" aria-label="Like this comment"
              onclick="event.stopPropagation(); cmtLike(this)">${typeof RVP_HEART !== 'undefined' ? RVP_HEART : '♥'}<span>${c.likes + (lk ? 1 : 0)}</span></button>
            <span class="v3-cmt-ago">${c.ago}</span>
          </div>
          <div class="v3-cmt-text">${c.text}</div>
          ${CMT_FLAT ? '' : `<div class="v3-cmt-acts"><button class="v3-cmt-reply" type="button"
            data-k="${_revAttr(key)}" data-i="${c.id}"
            onclick="event.stopPropagation(); cmtReply(this)">Reply</button></div>`}
        </div>${kids}`;
}

function cmtThreadHtml(key, total) {
  if (!CMT_OPEN[key]) return '';
  const roots = cmtRoots(key, total);
  const shown = CMT_ALL[key] ? roots : roots.slice(0, CMT_SHOWN[key] || CMT_DEFAULT);
  const rest = roots.slice(shown.length).reduce((s, c) => s + cmtSize(c), 0);
  /* The composer is one box that does both jobs: with a target it posts a
     nested reply, without one it posts at the base of the thread. The chip is
     the only thing that says which — so it doubles as the way out of reply
     mode. */
  const to = CMT_REPLY_TO[key] ? cmtFind(key, CMT_REPLY_TO[key]) : null;
  /* The composer comes FIRST (2026-09-11) — commenting should not cost a
     scroll to the bottom of a list that now pages in as you go — and the list
     ends in a sentinel that the page's scroll listener (cmtAutoMore) reads to
     reveal the next few. The "View n more" button stays as the no-scroll
     fallback. */
  return `
      <div class="v3-cmt-thread">
        <form class="v3-cmt-add" data-k="${_revAttr(key)}" onsubmit="return cmtAdd(this)">
          ${to ? `<button class="v3-cmt-to" type="button" data-k="${_revAttr(key)}"
            onclick="event.stopPropagation(); cmtReplyCancel(this)">replying to @${to.node.user}<span>✕</span></button>` : ''}
          <div class="v3-cmt-add-row">
            <textarea class="v3-cmt-input" rows="1" maxlength="180"
                   placeholder="${to ? 'Write a reply…' : 'Add a comment…'}"
                   onclick="event.stopPropagation()" oninput="cmtGrow(this)" onblur="cmtGrow(this)"
                   onkeydown="if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); this.form.requestSubmit(); }"></textarea>
            <button class="v3-cmt-post" type="submit">${to ? 'Reply' : 'Post'}</button>
          </div>
        </form>
        ${shown.map(c => cmtNodeHtml(key, c)).join('')
          || `<div class="v3-cmt-none">No comments yet — start it off.</div>`}
        ${rest > 0 ? `<button class="v3-cmt-more" type="button" data-k="${_revAttr(key)}" data-rest="${rest}"
          onclick="event.stopPropagation(); cmtMore(this)">View ${rest} more comment${rest > 1 ? 's' : ''}</button>` : ''}
      </div>`;
}

/* Infinite-ish: as the review page's body nears its bottom, reveal CMT_PAGE
   more (up to the thread's total). Delegated in the capture phase because
   scroll does not bubble; the wrap's innerHTML is replaced but the scrolling
   body is not, so the reader's position holds. */
const CMT_SHOWN = Object.create(null);
const CMT_PAGE = 5;
function cmtAutoMore(body) {
  const page = body.closest('.s-rvp, .s-home-v3--rvp, .v3-rsh'); if (!page) return;
  const more = page.querySelector('.v3-cmt-more'); if (!more) return;
  if (body.scrollTop + body.clientHeight < body.scrollHeight - 140) return;
  const key = more.dataset.k;
  const wrap = more.closest('.v3-cmt-wrap');
  const total = wrap ? +wrap.dataset.n || 0 : 0;
  CMT_SHOWN[key] = (CMT_SHOWN[key] || CMT_DEFAULT) + CMT_PAGE;
  cmtRender(key);
}
document.addEventListener('scroll', e => {
  const t = e.target;
  if (t && t.classList && (t.classList.contains('v3-body') || t.classList.contains('v3-rsh-body'))) cmtAutoMore(t);
}, true);
/* ⚠️ A thread that does not overflow the screen can never BE scrolled, so the
   first page would be the last. After any thread paint, keep paging while the
   body still fits (bounded: it stops when the list runs out or overflows). */
function cmtFill() {
  document.querySelectorAll('.s-rvp .v3-body, .s-home-v3--rvp .v3-body, .v3-rsh-body').forEach(b => {
    if (b.scrollHeight <= b.clientHeight + 140) cmtAutoMore(b);
  });
}

/* The slot a thread renders into. Always emitted (and empty while collapsed) so
   re-rendering never has to touch the card around it.
   ⚠️ It swallows clicks. The thread lives INSIDE the review card, and the card
   now toggles the thread — so without this, clicking a comment, or just the
   space beside one, would bubble up and collapse the whole thread you were
   reading. */
function cmtWrapHtml(key, total) {
  return `<div class="v3-cmt-wrap" data-cmt="${_revAttr(key)}" data-n="${Math.max(0, Number(total) || 0)}"
    onclick="event.stopPropagation()">${cmtThreadHtml(key, total)}</div>`;
}

/* ⚠️ Repaint EVERY wrap carrying this key, not the one that was clicked. The
   dark and light shells render side by side in the viewer and both hold a copy
   of the same review — updating one leaves the other showing a stale thread.
   Same reason `setArtistAlbumView` repaints every shell. */
function cmtRender(key) {
  document.querySelectorAll('.v3-cmt-wrap').forEach(w => {
    if (w.dataset.cmt !== key) return;
    w.innerHTML = cmtThreadHtml(key, +w.dataset.n || 0);
  });
  setTimeout(cmtFill, 0);                    // a thread must overflow the screen to be scrollable
  document.querySelectorAll('.rvp-cmts-n').forEach(n => {
    if (n.dataset.k === key) n.textContent = cmtCount(key, +n.dataset.n || 0);
  });
  document.querySelectorAll('.v3-cmt-btn').forEach(b => {
    if (b.dataset.k !== key) return;
    const open = !!CMT_OPEN[key];
    b.classList.toggle('is-open', open);
    b.classList.toggle('is-mine', cmtHasMine(key));
    b.setAttribute('aria-expanded', String(open));
    const n = b.querySelector('.v3-up-n');
    if (n) n.textContent = cmtCount(key, +b.dataset.n || 0);
  });
}

/* ── The review PAGE (2026-09-11) ────────────────────────────────────────
   A review card is a summary; tapping it opens the review as a page of its
   own (`review-page` screen, `reviewPageHtml` in screens.js) — the full text,
   the reviewer, the record, and the comments. The Reddit-style thread that
   used to unfold inside every card is gone from the album page: the list is
   for reviews, the page is for the conversation.
   `REV_INDEX` is what the card builders write into (key → the review as the
   page needs it) so a tap only has to carry the key; the same key drives the
   upvote pill and the comment thread on both surfaces, so a like or a comment
   on the page is the like or comment on the card. */
const REV_INDEX = Object.create(null);
/* Back from the review page: the album page re-renders behind, so it gets an
   entrance of its own (body.sd-return → .s-home-v3--review animates in). */
/* ── IN PLACE: the review as a state of the album page's shell (2026-09-11) ─
   The bento→album page transition works because it is the SAME shell changing
   state. So is this: `.s-home-v3--rvp` on the shell hides the bento and the
   review panel and shows `.v3-rvp-panel`, filled with `reviewPanelHtml`. The
   header, the nav and the album colour are never touched, so there is nothing
   to flash and nothing to reload. `--rvp-out` is the 200ms fade of whatever is
   leaving (the album content on the way in, the panel on the way out). Both
   shells on stage are switched together, like every other shell state. */
function rvpOpenInPlace(R, compose) {
  const shells = homeShells().filter(sh => sh.classList.contains('s-home-v3--review'));
  if (!shells.length) return false;
  shells.forEach(sh => sh.classList.add('s-home-v3--rvp-out'));
  setTimeout(() => {
    shells.forEach(sh => {
      const panel = sh.querySelector('.v3-rvp-panel');
      if (panel) panel.innerHTML = reviewPanelHtml(R);
      sh.classList.add('s-home-v3--rvp');
      sh.classList.remove('s-home-v3--rvp-out');
      const body = sh.querySelector('.v3-body'); if (body) body.scrollTop = 0;
    });
    setTimeout(cmtFill, 60); setTimeout(cmtFill, 420);
    if (compose) setTimeout(() => { const inp = document.querySelector('.s-home-v3--rvp .v3-cmt-input'); if (inp) inp.focus(); }, 380);
  }, 200);
  return true;
}
window.rvpBack = function () {
  const shells = [...document.querySelectorAll('.s-home-v3--rvp')];
  if (shells.length) {                        // in place: fade the panel, put the album page back
    shells.forEach(sh => sh.classList.add('s-home-v3--rvp-out'));
    setTimeout(() => shells.forEach(sh => {
      sh.classList.remove('s-home-v3--rvp', 's-home-v3--rvp-out');
      const p = sh.querySelector('.v3-rvp-panel'); if (p) p.innerHTML = '';
      const b = sh.querySelector('.v3-body'); if (b) b.scrollTop = 0;
    }), 200);
    return;
  }
  const body = document.querySelector('.s-rvp .v3-body');
  sdFadeOut(body, () => {
    document.body.classList.add('sd-return');
    goBack('home');
    setTimeout(() => document.body.classList.remove('sd-return'), 600);
  });
};
// The record line: in place it is the album you are on, so it is Back; on
// the standalone page it opens the album.
window.rvpRecordTap = function (btn, name) {
  if (btn.closest('.s-home-v3--rvp')) { rvpBack(); return; }
  const a = albumByTitle(name) || window.activeAlbum;
  if (a) openAlbumPage(a);
};
/* Fade a scroller's CONTENT out, then do the thing. The shell — and with it
   the album colour — stays put, so the screen never flashes; the next screen's
   content fades in on its own (rvpIn / rvpReturn). Reduced motion skips it. */
function sdFadeOut(el, then) {
  const reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!el || !el.animate || reduced) { then(); return; }
  let done = false;
  const go = () => { if (!done) { done = true; then(); } };
  el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: 'ease-out', fill: 'forwards' }).onfinish = go;
  setTimeout(go, 320);                       // an animation paused in a background tab still has to navigate
}
window.openReviewPage = function (key, compose, card) {
  const R = REV_INDEX[key];
  if (!R) return;
  CMT_OPEN[key] = true;                       // the thread IS the page — always open here
  window.activeReview = R;
  // From a card on the album page: open IN PLACE (see rvpOpenInPlace). From
  // anywhere else (the profile's pins, the rail): the standalone screen.
  if (card && card.closest && card.closest('.s-home-v3--review') && typeof reviewPanelHtml === 'function') {
    if (rvpOpenInPlace(R, compose)) return;
  }
  backStack.push(captureLocation());          // Back lands where you left
  navigate('review-page');
  // Colour the page from the record once the shell exists (the cold-cover
  // case; a cached palette is already inline from the getter), and aim the
  // composer if the comment pill was what brought you here.
  const paint = () => document.querySelectorAll('.s-rvp').forEach(s => {
    if (R.album && R.album.image && typeof applyAlbumColorsUrl === 'function') applyAlbumColorsUrl(s, R.album.image);
  });
  setTimeout(paint, 80); setTimeout(paint, 320); setTimeout(paint, 900);   // a cold cover extracts async
  setTimeout(cmtFill, 400); setTimeout(cmtFill, 1200);                     // first page → enough to scroll
  if (compose) setTimeout(() => { const inp = document.querySelector('.s-rvp .v3-cmt-input'); if (inp) inp.focus(); }, 380);
};
/* Tapping a review card opens its page. (It used to toggle the thread in
   place — see the note above.) The card itself is handed along so it can fly. */
/* The record line on a card that ISN'T a feed row (the profile's pins and
   history, 2026-09-18): the cover opens the album, read off REV_INDEX. */
window.revCardArt = function (el) {
  const card = el.closest('.v3-rev-card');
  const R = card && REV_INDEX[card.dataset.k];
  if (R && R.album && typeof openAlbumPage === 'function') openAlbumPage(R.album);
};
window.cmtCardTap = function (card) {
  if (card.classList.contains('v3-rev-card--hero')) return;   // already the page
  // A feed card: the REVIEW SHEET (Eric, 2026-09-24) — the same popup the
  // deck's review opens, so every review on home reads the same way. The
  // record line on the card still goes to the album (feedOpenArt).
  if (card.dataset.feed) return feedOpenReview(+card.dataset.feed, false, card);
  const k = card.dataset.k;
  if (k) openReviewPage(k, false, card);
};

/* The pill starts a comment: opens the thread if it's shut, then puts the
   cursor in the composer.
   ⚠️ It does NOT toggle. "Comment" is the wrong label for a button that hides
   the comments, and toggling it shut mid-sentence threw away what you'd typed.
   ⚠️ Hold the WRAP across the render — cmtRender replaces the thread markup,
   so an input reference taken before it is stale, but the wrap survives. */
window.cmtCompose = function (btn) {
  const k = btn.dataset.k;
  // On a card: the conversation lives on the review page — go there with the
  // composer aimed. On the page itself: just put the cursor in it.
  const page = btn.closest('.s-rvp, .s-home-v3--rvp, .v3-rsh');
  const feedCard = btn.closest('.v3-rev-card[data-feed]');
  if (feedCard) return feedOpenReview(+feedCard.dataset.feed, true, btn);   // home feed → the review SHEET with the composer aimed (2026-09-24)
  if (!page) { if (REV_INDEX[k]) openReviewPage(k, true, btn); return; }
  if (!CMT_OPEN[k]) { CMT_OPEN[k] = true; cmtRender(k); }
  const input = page.querySelector('.v3-cmt-input');
  if (input) input.focus();
};
window.cmtMore = function (btn) {
  CMT_ALL[btn.dataset.k] = true;
  cmtRender(btn.dataset.k);
};
/* Updated in place rather than through cmtRender: a re-render would wipe
   whatever the user had half-typed in the composer below. */
window.cmtLike = function (btn) {
  const k = btn.dataset.k + '::' + btn.dataset.i;
  const on = !CMT_LIKED[k];
  if (on) CMT_LIKED[k] = true; else delete CMT_LIKED[k];
  btn.classList.toggle('is-on', on);
  btn.setAttribute('aria-pressed', String(on));
  const n = btn.querySelector('span');
  if (n) n.textContent = (+btn.dataset.n || 0) + (on ? 1 : 0);
};
/* Reply AIMS the thread's one composer at a comment; posting then nests under
   it. There's still a single box per thread rather than one per comment —
   what changes is where its output lands.
   ⚠️ Hold the WRAP, not the thread: cmtRender replaces the thread's markup, so
   a reference into it is stale by the time we want to focus the input. The
   wrap element itself survives. */
window.cmtReply = function (btn) {
  const k = btn.dataset.k;
  const wrap = btn.closest('.v3-cmt-wrap');
  CMT_REPLY_TO[k] = btn.dataset.i;
  cmtRender(k);
  const input = wrap && wrap.querySelector('.v3-cmt-input');
  if (input) input.focus();
};
window.cmtReplyCancel = function (btn) {
  delete CMT_REPLY_TO[btn.dataset.k];
  cmtRender(btn.dataset.k);
};

/* The composer is a textarea that grows down with what's typed (Eric,
   2026-09-24); Enter posts, Shift+Enter breaks a line. The height follows
   the content (the CSS min/max bound it); empty and unfocused it falls back
   to one line. */
window.cmtGrow = function (ta) {
  ta.style.height = 'auto';
  if (ta.value) ta.style.height = ta.scrollHeight + 'px';
};
window.cmtAdd = function (form) {
  const k = form.dataset.k;
  const input = form.querySelector('.v3-cmt-input');
  const text = ((input && input.value) || '').trim();
  if (text) {
    const P = window.PROFILE || {};
    const mine = CMT_MINE[k] || (CMT_MINE[k] = []);
    /* ⚠️ ids can't come from `mine.length` any more — a nested reply lives in
       its parent's `kids`, never in that list, so two replies in a row would
       both be "me0" and cmtFind/CMT_LIKED would confuse them. */
    const node = {
      id: 'me' + (CMT_SEQ[k] = (CMT_SEQ[k] || 0) + 1),
      kids: [], depth: 0, mine: true,
      user: P.handle || 'you', face: P.pic || feedFace('you'),
      ago: 'now', likes: 0, text: _sdsEsc(text),
    };
    // Aimed at a comment → nest under it. Aimed at nothing → base of the thread.
    const to = CMT_REPLY_TO[k] ? cmtFind(k, CMT_REPLY_TO[k]) : null;
    if (to) {
      const host = (to.node.depth >= CMT_MAX_DEPTH && to.parent) ? to.parent : to.node;
      node.depth = host.depth + 1;
      host.kids.push(node);
      CMT_ALL[k] = true;   // a reply is no use hidden behind "view more"
    } else {
      mine.unshift(node);
    }
    delete CMT_REPLY_TO[k];
    cmtRender(k);
  }
  return false;    // never submit — there is no server behind this
};

/* ── The reviews an album SHOWS (2026-09-11) ────────────────────────────
   The archive authors three one-liners per record and Deezer records get
   three generated ones — a list that ends after three cards reads as a dead
   page. `revsFor(a)` pads to REV_TARGET with seeded extras (names from
   DZ_NAMES, lines from DZ_QUOTES, no name or line used twice on one album)
   and then LENGTHENS about a third of them with one to three sentences from
   REV_MORE, so the list mixes a quick take with a paragraph the way a real
   one does. Deterministic per album and cached on it, so keys, likes and
   comment threads stay put across filter switches and re-renders.
   ⚠️ `order` in populateReviewList must be THIS list, not `a.reviews` — the
   extras are not in the archive array, and indexOf would key them all to 0. */
const REV_TARGET = 8;                  // about one screen of cards (was 14 — too many)
// DZ_NAMES is seven handles — not enough to pad a list to fourteen without
// repeats — so the extras also draw on these. Faces come from feedFace(name).
const REV_NAMES = [['nova_wr', 'NW'], ['drumkid', 'DK'], ['helio', 'H'], ['vxblank', 'VB'], ['marshmist', 'MM'],
  ['tapehiss', 'TH'], ['lo_fi_lena', 'LL'], ['bassline_b', 'BB'], ['reverbqueen', 'RQ'], ['crateduster', 'CD'],
  ['sidechain', 'SC'], ['glasswing', 'GW'], ['moth_light', 'ML'], ['pocketradio', 'PR'], ['synthwren', 'SW'], ['okcomputerfan', 'OK']];
const REV_MORE = [
  'the sequencing is the thing nobody talks about — every track hands off to the next like it knew it was coming.',
  'i had this on in the background for a week before it clicked, and then it clicked hard.',
  'the production is doing so much quiet work. listen on headphones, then listen again on speakers.',
  'not every song lands, but the ones that do land so hard it hardly matters.',
  'the back half is where it lives. people bail after track five and miss the whole point.',
  'there is a two minute stretch in the middle of this record i would put up against anything.',
  'i keep trying to explain it to people and end up just playing it for them instead.',
  'the lyrics read like nothing on paper and then the delivery makes them the saddest thing you have heard.',
  'it sounds like the year it came out and somehow also like right now.',
  'the closer recontextualises everything before it. do not skip it, do not shuffle this.',
  'my only complaint is that it ends. forty minutes is not enough of this.',
  'i understand why some people bounce off it. i also think they are wrong.',
];
function revsFor(a) {
  if (!a) return [];
  if (a._revsFull) return a._revsFull;
  const base = (a.reviews || []).slice();
  const names = base.map(r => r.name), lines = base.map(r => r.text);
  const scale = (a.rating || 4) >= 4.4 ? [5, 4.5, 4.5, 4, 5, 3.5] : [4.5, 4, 4, 3.5, 4.5, 3];
  for (let i = 0, tries = 0; base.length < REV_TARGET && tries < 80; tries++) {
    const pool = DZ_NAMES.concat(REV_NAMES);
    const u = pool[dzSeed(a.album, 'xn', tries) % pool.length];
    const q = DZ_QUOTES[dzSeed(a.album, 'xq', tries) % DZ_QUOTES.length];
    if (names.indexOf(u[0]) >= 0 || lines.indexOf(q) >= 0) continue;
    names.push(u[0]); lines.push(q);
    base.push({ name: u[0], init: u[1], grad: DZ_GRADS[DZ_NAMES.indexOf(u)] || '#555',
                rating: scale[dzSeed(a.album, 'xr', i) % scale.length], text: q, _extra: true });
    i++;
  }
  /* Re-deal every RATING (2026-09-11): the archive authors [4.5, 4, 4] for
     nearly every record and the extras drew from a six-value scale, so a list
     read as a wall of 4.5s. Seeded per album + reviewer through seedRand (not
     dzSeed % n — see the profReviewLog note on why that is linear), from a
     pool skewed by the album's own score: a loved record still collects a 3
     and the odd 2.5; a middling one still gets its 5s. */
  const hi = (a.rating || 4) >= 4.4;
  const pool = hi ? [5, 5, 4.5, 4.5, 4, 4, 4, 3.5, 3.5, 3, 2.5, 5]
                  : [4.5, 4, 4, 3.5, 3.5, 3.5, 3, 3, 2.5, 2, 5, 4];
  // Lengthen about a third, by a different amount each — a copy, never the
  // archive object itself.
  a._revsFull = base.map((r, i) => {
    const rating = pool[Math.floor(seedRand('rv::' + a.album + '::' + (r.name || '') + '::' + i)() * pool.length)];
    const h = dzSeed(a.album, 'len', r.name, i);
    if (h % 2) return { ...r, rating };            // about half run long (was a third)
    const n = 2 + (h >> 4) % 4;                    // by two to five sentences — enough to cross the card's clamp
    const extra = [];
    for (let k = 0; k < n; k++) extra.push(REV_MORE[(h >> (6 + k * 4)) % REV_MORE.length]);
    return { ...r, rating, text: r.text + ' ' + extra.filter((x, j, arr) => arr.indexOf(x) === j).join(' ') };
  });
  return a._revsFull;
}

/* ── ONE review card builder (2026-09-11) ────────────────────────────────
   The pinned card, the list card and both "mine" cards used to be four copies
   of the same markup ("change all four together"). They are one function now.
   The card echoes the REVIEW PAGE's hero at list scale: photo · name over
   @handle · when on the left, the big score with the small records under it
   on the right, then the text, then the pills at the foot. No "rated" — the
   number says it. `share` adds the Instagram button (your own card only).
   `preview` (2026-09-16) is up to two root comments from the thread, shown
   under the text as short rows (face · name · text, two lines clamped);
   `previewTotal` adds a "View all n comments" line when there are more than
   shown. ⚠️ The album page passes NO preview any more (Eric, 2026-09-18 —
   the two rows came off; the card is the feed's card now), just the total,
   so it gets the "View all" line alone. Either alone is enough to render
   the block.
   `record` ({image, album, artist}) adds the RECORD LINE under the name — a
   small square cover with album (regular) over artist (bold) — for a card
   that sits away from its album (the home feed). On the album page the record
   is the page, so no card there passes it. `feed` is the row's index into
   `_FEED`: it lands on the card as `data-feed`, which is how cmtCardTap and
   cmtCompose know to route a feed card through feedOpen (album page, review
   pinned, thread open) instead of the review page. */
function revCardInner(o) {
  const handle = o.handle || String(o.name || 'listener').toLowerCase().replace(/[^a-z0-9_]+/g, '_');
  /* `timeRight` (the home feed, Eric 2026-09-15): the time leaves the byline
     and sits hard right on the top row, squaring off the card's corner. */
  const timeRight = !!(o.timeRight && o.ago);
  /* `actsTop` (the home feed, Eric 2026-09-15): the like and the comment count
     ride the top row too, between the byline and the time, so the score
     column is just number-over-discs and the review runs clean underneath. */
  // The hero and the feed take the HEART (RVP_HEART); the album page's list keeps the thumb.
  const likeHtml = o.likes == null ? '' : ((o.big || o.actsTop)
    ? upvoteHtml(o.key, o.likes, 'v3-up--sm v3-up--like v3-up--heart').replace(/<svg[\s\S]*?<\/svg>/, typeof RVP_HEART !== 'undefined' ? RVP_HEART : '')
    : upvoteHtml(o.key, o.likes, 'v3-up--sm v3-up--like'));
  const cmtHtml = o.big
    ? (typeof shareBtnHtml === 'function' ? shareBtnHtml('rev', o.key, 'sd-share-btn--hero') : '')
    : cmtBtnHtml(o.key, o.comments || 0, 'v3-up--sm v3-up--cmtcol');
  return `
      <div class="v3-rev-card-top">
        <div class="v3-rev-av" style="background-image:url('${o.face}')" data-user="${o.mine ? 'You' : sdAttr(o.name)}" onclick="sdPerson(this, event)"></div>
        <div class="v3-rev-who">
          <span class="v3-rev-name-row"><span class="v3-rev-name" data-user="${o.mine ? 'You' : sdAttr(o.name)}" onclick="sdPerson(this, event)">${o.name}</span>${o.chip ? `<span class="v3-rev-pin-chip">${o.chip}</span>` : ''}</span>
          <span class="v3-rev-sub">@${handle}${o.ago && !timeRight ? ` · ${o.ago}` : ''}</span>
        </div>${o.actsTop ? `<span class="v3-rev-top-acts">${o.big ? cmtHtml : cmtHtml + likeHtml}</span>` : ''}${timeRight ? `<span class="v3-rev-time">${o.ago}</span>` : ''}
      </div>
      <!-- A grid AREA beside both the top row and the text (see .v3-rev-card in
           app.css), so the like button's height pushes nothing down. -->
      <div class="v3-rev-big">
        <span class="v3-rev-big-n">${Number(o.rating || 0).toFixed(1)}</span>
        ${halfStars(o.rating || 0, o.big ? 17 : 13)}
        ${o.actsTop ? '' : likeHtml + cmtHtml}
      </div>
      ${o.big && o.actsTop && likeHtml ? `<!-- The hero's heart (Eric, 2026-09-17): the score row's right end, level
           with the number — same grid area as .v3-rev-big, hung the other way. -->
      <span class="v3-rev-top-acts v3-rev-score-like">${likeHtml}</span>` : ''}
      ${o.record ? `<div class="v3-rev-record" onclick="event.stopPropagation(); ${o.feed != null ? `feedOpenArt(${o.feed})` : 'revCardArt(this)'}">
        <div class="v3-rev-record-art" style="background-image:url('${o.record.image}')"></div>
        <div class="v3-rev-record-who">${recordWhoHtml(o.record)}</div>
      </div>` : ''}
      ${o.text ? `<div class="v3-rev-text">${revNoWidow(o.text)}</div>` : ''}
      ${(o.preview && o.preview.length) || o.previewTotal ? `<div class="v3-rev-cmts">${(o.preview || []).map(c => `<div class="v3-rev-cmt">
          <span class="v3-rev-cmt-av" style="background-image:url('${c.face || feedFace(c.user)}')"></span>
          <span class="v3-rev-cmt-body"><b>${c.user}</b> ${c.text}</span>
        </div>`).join('')}${o.previewTotal > (o.preview || []).length ? `<div class="v3-rev-cmt-more">View all ${window.fmtRc(o.previewTotal)} comments</div>` : ''}</div>` : ''}
      ${o.share && !o.big && typeof shareBtnHtml === 'function' ? `<div class="v3-rev-foot">
        <span class="v3-rev-acts">${shareBtnHtml('review', '')}<span class="v3-rev-share-lbl">Share your review</span></span>
      </div>` : ''}`;
}
/* No widows: the last two words are joined with a non-breaking space so a
   review never ends on a line holding one word. (CSS `text-wrap: pretty` does
   the same where the browser has it; this is the guarantee.) */
function revNoWidow(t) {
  const s = String(t || '').trim();
  const i = s.lastIndexOf(' ');
  return (i > 0 && s.length > 24) ? s.slice(0, i) + ' ' + s.slice(i + 1) : s;
}
/* The record line's titles (the home feed): the ALBUM on one line, the
   artist under it. The year was here, left of the album name, for an
   afternoon (2026-09-16) and came off the same day — too much for the feed.
   `tag` fills the slot on a follow row ("Artist"). The album name never ellipses: it FADES at the right edge when
   it overflows (`.is-long`, set by markLongReviews the way review text is —
   a mask on every name would dim the end of short ones too). */
function recordWhoHtml(r) {
  /* The YEAR is back, LEFT of the album name (Eric, 2026-09-17) — "2004 Hot
     Fuss". It left on 2026-09-16 as too much; the deal now is that it is
     dropped on a long title: markLongReviews measures the line and puts
     `.no-year` on it when the album can't fit at full width beside it. It
     takes the same lead slot a follow row's "Artist" tag does. */
  const lead = r.tag || (r.year ? String(r.year) : '');
  const cls = r.tag ? 'v3-rev-record-year' : 'v3-rev-record-year v3-rev-record-year--auto';
  return `<span class="v3-rev-record-line">${lead ? `<span class="${cls}">${lead}</span>` : ''}<span class="v3-rev-record-album">${r.album}</span></span>` +
    (r.artist && r.artist !== r.album ? `<span class="v3-rev-record-artist">${r.artist}</span>` : '');
}
function revCardHtml(o) {
  return `
    <div class="v3-rev-card${o.cls ? ' ' + o.cls : ''}" data-k="${_revAttr(o.key)}"${o.feed != null ? ` data-feed="${o.feed}"` : ''} onclick="cmtCardTap(this)">${revCardInner(o)}
    </div>`;
}

function populateReviewList(scr, filter) {
  const a = scr._album || window.featuredAlbum;
  const list = scr && scr.querySelector('.v3-rev-list');
  if (!a || !list) return;
  let revs = revsFor(a).slice();
  if (filter === 'popular') revs.sort((x, y) => (y.rating || 0) - (x.rating || 0));
  else if (filter === 'new') revs.reverse();
  const countEl = scr.querySelector('.v3-rev-count');
  if (countEl) countEl.textContent = `${window.fmtRc(a.reviewCount || revs.length)} reviews`;
  // A review arrived pinned from the home feed → it leads the list, regardless of filter
  const pin = (window._pinnedReview && window._pinnedReview.album === a.album) ? window._pinnedReview : null;
  // ⚠️ Must match `feedRevKey` exactly — the feed row's like and this card's
  // like are the same act, and its comment button opens THIS thread.
  const pinKey = 'pin::' + a.album + '::' + (pin ? pin.name || '' : '');
  if (pin) REV_INDEX[pinKey] = { key: pinKey, album: a, name: pin.name || 'Listener', init: pin.init, grad: pin.grad,
    rating: pin.rating || 4, text: pin.text || '', ago: pin.ago || '', likes: pin.likes || revUpvotes(pin, 0),
    comments: pin.comments || 0, pinned: true };
  const pinHtml = pin ? revCardHtml({
    key: pinKey, cls: 'v3-rev-card--page v3-rev-card--pinned', name: pin.name || 'Listener', face: feedFace(pin.name || 'listener'),
    ago: pin.ago || '', chip: 'from your feed', rating: pin.rating || 4, text: pin.text || '',
    likes: pin.likes || revUpvotes(pin, 0), comments: pin.comments || 0, timeRight: true, actsTop: true,
    previewTotal: pin.comments ? cmtCount(pinKey, pin.comments) : 0,   // the "View all" line only — no preview rows (Eric, 2026-09-18)
  }) : '';
  // Identify each review by its position in the album's OWN list, not its
  // position in the filtered array — otherwise switching filter reshuffles the
  // seeded timestamps/counts and orphans your upvotes.
  /* YOUR review, from the log-sheet draft for this album. It leads the list —
     above even a pinned one — and is the only card that gets a share button:
     you can post your own take, not someone else's. */
  const mine = (window.albumDraft && albumDraft(a)) || {};
  const myText = (mine.text || '').trim();
  const myKey = 'mine::' + a.album;
  REV_INDEX[myKey] = { key: myKey, album: a, name: 'You', mine: true, rating: mine.rating || 0, text: myText,
    ago: 'your review', likes: 0, comments: 0 };
  const mineHtml = (mine.rating || myText) ? revCardHtml({
    key: myKey, cls: 'v3-rev-card--page v3-rev-card--mine', name: 'You', handle: (window.PROFILE || {}).handle || 'you',
    face: (window.PROFILE || {}).pic || 'images/rp-01.jpg', ago: 'your review',
    rating: mine.rating || 0, text: myText, likes: null, comments: 0, share: true, timeRight: true, actsTop: true,
  }) : '';

  /* THE FEED'S CARD, on the album page (Eric, 2026-09-16): the home feed's
     review card is the look — byline with the like · comment count · time on
     the top row, the score on its own row, the text full width beneath. So
     every card here wears `.v3-rev-card--page` with `timeRight` + `actsTop`,
     the feed's flags. No record line: the album is the page. */
  const order = revsFor(a);                // ⚠️ the padded list — see revsFor
  list.innerHTML = mineHtml + pinHtml + revs.map((r) => {
    const i = Math.max(0, order.indexOf(r));
    const m = revMeta(r, i);
    const key = a.album + '::' + (r.name || '') + '::' + i;
    REV_INDEX[key] = { key, album: a, name: r.name || 'Listener', init: r.init, grad: r.grad,
      rating: r.rating || 4, text: r.text || '', ago: m.ago, likes: revUpvotes(r, i), comments: m.comments };
    return revCardHtml({
      key, cls: 'v3-rev-card--page', name: r.name || 'Listener', face: feedFace(r.name || 'listener'), ago: m.ago,
      rating: r.rating || 4, text: r.text || '', likes: revUpvotes(r, i), comments: m.comments,
      timeRight: true, actsTop: true,
      // Just the "View all n comments" line (Eric, 2026-09-18) — the two
      // preview rows it carried from 2026-09-16 came off. cmtCount seeds (and
      // caches) the thread, the same one the review page shows.
      previewTotal: m.comments ? cmtCount(key, m.comments) : 0,
    });
  }).join('') || `<div class="v3-rev-empty">No reviews yet — be the first.</div>`;
  /* A long review FADES at the clamp instead of ending in an ellipsis — but only
     one that really overflows: a mask on every card would dim the last line of
     a short review too. ⚠️ Measured now AND again after layout: when the panel
     is still display:none (the --review class lands after this runs on some
     routes) every card measures 0×0 and nothing is marked — which is how the
     fade shipped invisible the first time. */
  markLongReviews(list);
  setTimeout(() => markLongReviews(list), 80);
  setTimeout(() => markLongReviews(list), 600);
}
function markLongReviews(list) {
  if (!list || !list.isConnected) return;
  // The review text and the comment previews under it (two lines; they faded
  // off the right edge until 2026-09-17) both fade out at the BOTTOM.
  list.querySelectorAll('.v3-rev-text, .v3-rev-cmt-body').forEach(t => {
    if (!t.clientHeight) return;                          // not laid out yet — leave it for the next pass
    t.classList.toggle('is-long', t.scrollHeight > t.clientHeight + 2);
  });
  // The record line's album name: the same idea sideways — one line that
  // fades at the right edge, no ellipsis. ⚠️ The year beside it goes FIRST:
  // it is shown again (a re-measure after a re-deal must not inherit the last
  // verdict), and if the name can't fit at full width with it there, the year
  // is dropped (`.no-year`) before the name is judged long on its own.
  list.querySelectorAll('.v3-rev-record-album').forEach(t => {
    if (!t.clientWidth) return;
    const line = t.closest('.v3-rev-record-line');
    if (line && line.querySelector('.v3-rev-record-year--auto')) {
      line.classList.remove('no-year');
      if (t.scrollWidth > t.clientWidth + 1) line.classList.add('no-year');
    }
    t.classList.toggle('is-long', t.scrollWidth > t.clientWidth + 1);
  });
}

// Friend-feed card taps: the card is the review → album page scrolled to the
// review section with that review pinned on top; the art is the album → album
// page from the top. (i indexes window.FRIEND_ACTIVITY — no attr-escaping woes.)
/* ⚠️ NO MORE `|| ARCHIVE[0]` (2026-09-26). Every tile that named its album
   inside an inline onclick string fell back to the FIRST record in the
   archive when the lookup missed — a title with a double quote broke the
   attribute, a title shared by two records matched the wrong one, and the
   notifications' hand-authored albums never exist under a persona — so a
   tap opened a record that had nothing to do with the tile ("sometimes the
   wrong album comes up"). Tiles now carry the title AND artist as data
   attributes (no quoting games) and resolve through here; a genuine miss
   opens nothing rather than something else. */
window.albumByTitle = function (title, artist) {
  const arc = window.ARCHIVE || [];
  return (artist && arc.find(x => x.album === title && x.artist === artist)) || arc.find(x => x.album === title) || null;
};
window.sdAttr = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
window.sdAlbumData = a => `data-alb="${sdAttr(a.album)}" data-art="${sdAttr(a.artist)}"`;   // put on the tile
window.openAlbumByData = function (el, e) {
  if (e) e.stopPropagation();
  const a = albumByTitle(el.dataset.alb, el.dataset.art);
  if (a) openAlbumPage(a);
};
function friendAlbumFor(f) {
  return (window.ARCHIVE || []).find(x => x.album === f.album && x.artist === f.artist)
      || (window.ARCHIVE || []).find(x => x.album === f.album) || null;
}
window.openFriendAlbum = function (i) {
  const f = (window.FRIEND_ACTIVITY || [])[i];
  const album = f && friendAlbumFor(f);
  if (album) openAlbumPage(album);
};
// The key a review carries from the feed into the album page. ⚠️ Must stay in
// step with `pinKey` in populateReviewList — it's how a like in the feed and
// the pinned card's like are the same act, and how the feed's comment button
// knows which thread to open.
function feedRevKey(e) { return 'pin::' + e.album + '::' + e.user; }

window.openFriendReview = function (i) {
  const f = (window.FRIEND_ACTIVITY || [])[i];
  const album = f && friendAlbumFor(f);
  if (!album) return;
  // You came here for this review — its thread is already open when you land.
  CMT_OPEN[feedRevKey(f)] = true;
  openAlbumPage(album, {
    album: f.album, name: f.user, init: f.init, grad: f.grad,
    rating: f.rating, text: f.quote, ago: f.ago, likes: f.likes, comments: f.comments,
  });
  // After the album state renders, glide each shell down to the review list.
  // Rect deltas are visually scaled by the phone-wrap transform → divide it out.
  setTimeout(() => {
    homeShells().forEach(s => {
      const body = s.querySelector('.v3-body');
      const target = s.querySelector('.v3-rev-list');
      if (!body || !target) return;
      const scale = body.getBoundingClientRect().width / body.offsetWidth || 1;
      const top = (target.getBoundingClientRect().top - body.getBoundingClientRect().top) / scale + body.scrollTop - 130;
      body.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' });
    });
  }, 150);
};

// ── Home activity feed ────────────────────────────────────────
// The homepage feed is built out of the NOTIFICATIONS row (`.ntf-*`): avatar +
// kind badge · copy · time · trailing album thumb. Same component, different
// content — the inbox is what happened *to you*, this is what the people you
// follow are doing. Both sides read the shared `--sd-*` tokens, so the row
// styling lives in one place.
//
// The deal is memoised into `window._FEED` (the idiom the retired "you may
// know" rails used) for two reasons: the dark and light shells render
// separately and would otherwise each deal their own feed, and re-rendering the
// home screen shouldn't reshuffle it under the user. `reshuffleHome` and
// `applyPersona` clear it.
const FEED_N = 9;

// Row rhythm. Reviews are the backbone — a quote is the thing the app is
// actually for — and the other kinds punctuate. It's a fixed pattern rather
// than a roll so the feed can never deal four follows in a row.
/* ⚠️ Every type here is something a PERSON YOU FOLLOW DID. That is the line
   between this and the inbox: the feed is other people's activity, the inbox is
   things that happened to YOU. Nothing systemic belongs here — `release` ("X is
   out now") and `trending` ("this is climbing") used to sit in this rhythm and
   were neither, so they read as noise between real friend activity.
   The verbs deliberately mirror the log sheet's own toggles — reviewed, rated,
   favourited, logged, saved for later — so the feed shows friends doing exactly
   the things you can do. */
/* csharpuser (2026-09-22): the feed is REVIEWS ONLY. The other verbs
   (favourited · logged · saved for later · playlisted · followed) still render
   if they ever land here, but the rhythm no longer deals them — the whole
   point of this fork is one thing on screen. */
const FEED_RHYTHM = ['review', 'review', 'rating', 'review', 'review', 'review', 'rating'];

// One photo per handle so a person looks like themselves wherever they appear.
// ntfPeople() pins the community accounts by hand; the feed cast is generated,
// so it hashes into the same rp-* pool instead.
function feedFace(user) {
  const pinned = (typeof ntfPeople === 'function') ? ntfPeople() : {};
  if (pinned[user]) return pinned[user];
  let h = 7;
  for (const c of String(user)) h = (h * 31 + c.charCodeAt(0)) | 0;
  return `images/rp-${String(Math.abs(h) % 64 + 1).padStart(2, '0')}.jpg`;
}

// "12m" / "3h" / "2d" / "1w" → minutes, for sorting and time-bucketing. The
// feed's ago strings are generated (personaFeed) rather than authored, so the
// buckets have to be derived from them.
const AGO_UNIT = { m: 1, h: 60, d: 1440, w: 10080 };
function agoMins(ago) {
  const m = /^(\d+)\s*([mhdw])/.exec(String(ago || ''));
  return m ? Number(m[1]) * AGO_UNIT[m[2]] : 1e9;
}

function feedEvents() {
  if (window._FEED) return window._FEED;
  const src = window.FRIEND_ACTIVITY || [];
  if (!src.length) return (window._FEED = []);

  // Playlists someone else made — "you added to your own playlist" is not news.
  const lists = (typeof plLists === 'function' ? plLists() : [])
    .filter(p => p.creator && p.creator !== 'you');

  // `idx` indexes FRIEND_ACTIVITY and travels with the event, so review rows
  // still open the pinned-review flow (openFriendReview) — same escaping-free
  // idiom as before.
  // Sorted newest-first after the shuffle so the time buckets below come out
  // contiguous and in order, the way the inbox's hand-authored list already is.
  // No popular reviews down here (Eric, 2026-09-24): the feed is friends only;
  // the popular ones live in the deck.
  const order = src.map((_, i) => i).filter(i => !src[i].popular)
    .sort(() => Math.random() - 0.5)
    .slice(0, FEED_N)
    .sort((a, b) => agoMins(src[a].ago) - agoMins(src[b].ago));

  window._FEED = order.map((idx, n) => {
    const f = src[idx];
    // A row with no quote has nothing to say as a review, so it falls back to
    // the bare rating rather than rendering an empty blockquote.
    let type = FEED_RHYTHM[n % FEED_RHYTHM.length];
    if (type === 'review' && !f.quote) type = 'rating';
    const list = lists.length ? lists[(idx + n) % lists.length] : null;
    if (type === 'playlist' && !list) type = 'rating';

    return {
      type, idx, popular: !!f.popular,
      user: f.user, face: feedFace(f.user),
      album: f.album, artist: f.artist, image: f.image,
      // A follow row is about the artist, so its trailing slot wants the artist
      // photo. The cover stands in only when there isn't one.
      thumb: type === 'follow'
        ? ((window.ARTIST_IMG && window.ARTIST_IMG[f.artist]) || f.image)
        : f.image,
      playlist: list ? list.name : '',
      /* ⚠ `comments` has to be copied across like everything else. It was
         missing, and `acts()` reads `e.comments || 0` — so every row on the home
         feed showed a comment count of ZERO while `FRIEND_ACTIVITY` had real
         numbers sitting in it the whole time. Found by putting the feed next to
         the profile's review history, which builds its own counts. */
      rating: f.rating, quote: f.quote, ago: f.ago,
      likes: f.likes || 0, comments: f.comments || 0,
      // The record line on a review card names the year too; a persona feed
      // row may not carry one, so fall back to the archive's.
      year: f.year || (friendAlbumFor(f) || {}).year || '',
      // The inbox fills its unread rows and leaves the rest flat on the bg —
      // that contrast is most of why the screen reads as well as it does. A
      // feed has no read state, so "today" stands in for it: the newest group
      // is the filled one.
      fresh: agoMins(f.ago) <= 60 * 24,
    };
  });
  return window._FEED;
}

// Where a row takes you. Routed through the event index rather than inlined
// names so nothing needs quote-escaping into an onclick.
/* The feed card's COMMENT pill goes to the review page itself (Eric,
   2026-09-18), not the album page — the card tap still does the album page
   with the review pinned, so the two taps lead to two different places. The
   page reads REV_INDEX, which the feed never fills (the album page does, as
   it renders), so the entry is written here from the feed event, under the
   SAME key the album page's card would use (feedRevKey) — one thread, one
   like, wherever you came in. */
window.feedOpenReview = function (n, compose, trigger) {
  const e = feedEvents()[n];
  if (!e) return;
  if (!(e.type === 'review' || e.type === 'rating')) return feedOpen(n);
  const f = (window.FRIEND_ACTIVITY || [])[e.idx];
  const album = f && friendAlbumFor(f);
  if (!album) return feedOpen(n);
  const key = feedRevKey(f);
  REV_INDEX[key] = REV_INDEX[key] || {
    key, album, name: f.user, init: f.init, grad: f.grad,
    rating: f.rating || 0, text: e.type === 'review' ? feedUnquote(f.quote) : '',
    ago: f.ago, likes: f.likes || 0, comments: f.comments || 0,
    face: f.face, popular: !!f.popular,
  };
  // The REVIEW SHEET (Eric, 2026-09-24), not the page: it slides up over the
  // feed and drops back down, so the feed is still where you left it.
  openReviewSheet(key, !!compose, trigger || null);
};
window.feedOpen = function (n) {
  const e = feedEvents()[n];
  if (!e) return;
  if (e.type === 'review' || e.type === 'rating') return openFriendReview(e.idx);
  if (e.type === 'playlist') return window.openPlaylistPage && window.openPlaylistPage(e.playlist);
  if (e.type === 'follow')   return window.openArtistPageFor && window.openArtistPageFor(e.artist);
  return openFriendAlbum(e.idx);          // release / milestone → the album page
};
// The trailing thumb goes straight to whatever it is a picture OF — the album,
// or the artist on a follow row, where the thumb is their photo.
window.feedOpenArt = function (n) {
  const e = feedEvents()[n];
  if (!e) return;
  if (e.type === 'follow') return window.openArtistPageFor && window.openArtistPageFor(e.artist);
  openFriendAlbum(e.idx);
};

// Strip one pair of wrapping quote marks (straight or curly) off a feed quote.
function feedUnquote(q) {
  return String(q || '').trim().replace(/^["“”]+/, '').replace(/["“”]+$/, '').trim();
}

function renderFriendFeed(screenEl) {
  const container = screenEl.querySelector('.v3-feed-items');
  if (!container) return;
  const events = feedEvents();
  if (!events.length) { container.innerHTML = ''; return; }

  // Kind glyph, clipped to the avatar's bottom-right — says what happened
  // before you've read a word of the copy. `rating` borrows the milestone star;
  // the rest reuse the inbox's badges so the two screens stay one vocabulary.
  const BADGE = {
    review:    '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    rating:    '<path d="m12 3.5 2.6 5.6 6.1.8-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6L3.3 9.9l6.1-.8Z"/>',
    follow:    '<path d="M10 11a3.4 3.4 0 1 0 0-6.8A3.4 3.4 0 0 0 10 11Z"/><path d="M3.5 20v-1.5A4.5 4.5 0 0 1 8 14h4a4.5 4.5 0 0 1 4.5 4.5V20Z"/><path d="M19 6.5v5M21.5 9h-5" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round"/>',
    playlist:  '<path d="M4 6h12v2H4zM4 11h12v2H4zM4 16h8v2H4z"/><path d="M18.5 11.5v6.2a2 2 0 1 1-1.6-2V10l3.6-.9v2Z"/>',
    // The three log-sheet verbs, drawn (not filled) — same glyphs as SD_ICONS.
    fav:       '<path d="M12 21s-7.5-4.9-9.5-9C1 8.5 3 5 6.5 5 9 5 12 8 12 8s3-3 5.5-3C21 5 23 8.5 21.5 12c-2 4.1-9.5 9-9.5 9z" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/>',
    listened:  '<path d="M7 8a5 5 0 0 1 10 0c0 3-2.2 4.1-3.4 5.3-.8.8-1.2 1.5-1.2 2.7A2.4 2.4 0 0 1 7.6 17" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/>',
    later:     '<circle cx="12" cy="12" r="8.6" fill="none" stroke="currentColor" stroke-width="2.1"/><path d="M12 7.4V12l3 1.8" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/>',
  };

  /* ⚠️ ACTIVITY CARDS (Eric, 2026-09-15). The rows that are NOT reviews —
     favourited, logged, saved for later, added to a playlist, followed — used
     to be the inbox's `.ntf-row` (avatar · one-line sentence · trailing thumb).
     They wear the REVIEW CARD's anatomy now, so the feed is one shape top to
     bottom: byline (photo · name · @handle, the time hard right), then the
     record row (cover · album / artist / year), with the VERB where the review
     card puts its score — the kind's badge glyph over a mono label — and the
     same badge on the photo, as the inbox rows had. The sentence the old row
     spelled out ("drumkid favourited Loveless by My Bloody Valentine") is now
     read off the parts: who, badge, what.
     A follow's object is the ARTIST, so its record row is their photo (round —
     the app's shape rule for people) over the name, captioned Artist. A
     playlist row names its second thing in the byline: "@who · to <list>".
     Taps are the old row's: the card opens what feedOpen opens, the record
     what feedOpenArt opens. Review and rating rows are `card` above. */
  const VERB = { fav: 'favourited', listened: 'logged', later: 'saved', playlist: 'playlisted', follow: 'followed' };
  const act = (e, n) => {
    const follow = e.type === 'follow';
    const handle = String(e.user || 'listener').toLowerCase().replace(/[^a-z0-9_]+/g, '_');
    const sub = e.type === 'playlist' && e.playlist ? `@${handle} · to <i>${e.playlist}</i>` : `@${handle}`;
    const glyph = `<svg viewBox="0 0 24 24" fill="currentColor">${BADGE[e.type] || ''}</svg>`;
    /* A LIKE on these too (Eric, 2026-09-15), the review card's heart in the
       same top-row slot — and no comment count: there is no thread on a
       favourite. Keyed by kind + record + person so it is its own act, not
       the review's. */
    const likeKey = 'act::' + e.type + '::' + e.album + '::' + e.user;
    const like = upvoteHtml(likeKey, e.likes || 0, 'v3-up--sm v3-up--like v3-up--heart')
      .replace(/<svg[\s\S]*?<\/svg>/, typeof RVP_HEART !== 'undefined' ? RVP_HEART : '');
    // A follow row is the artist alone — no "Artist" tag in front (Eric,
    // 2026-09-18): the round photo already says it isn't a record.
    const who = follow
      ? recordWhoHtml({ album: e.artist })
      : recordWhoHtml({ album: e.album, artist: e.artist, year: e.year });
    return `
              <div class="v3-rev-card v3-rev-card--feed v3-rev-card--act" data-feed="${n}" onclick="event.stopPropagation(); feedOpen(${n})">
                <div class="v3-rev-card-top">
                  <div class="v3-rev-av" style="background-image:url('${e.face}')" data-user="${sdAttr(e.user)}" onclick="sdPerson(this, event)">
                    <span class="ntf-badge ntf-badge--${e.type}">${glyph}</span>
                  </div>
                  <div class="v3-rev-who">
                    <span class="v3-rev-name-row"><span class="v3-rev-name" data-user="${sdAttr(e.user)}" onclick="sdPerson(this, event)">${e.user}</span></span>
                    <span class="v3-rev-sub">${sub}</span>
                  </div><span class="v3-rev-top-acts">${like}</span><span class="v3-rev-time">${e.ago}</span>
                </div>
                <div class="v3-rev-record" onclick="event.stopPropagation(); feedOpenArt(${n})">
                  <div class="v3-rev-record-art${follow ? ' v3-rev-record-art--round' : ''}" style="background-image:url('${e.thumb}')"></div>
                  <div class="v3-rev-record-who">${who}</div>
                </div>
                <div class="v3-rev-act">${glyph}<span>${VERB[e.type] || e.type}</span></div>
              </div>`;
  };

  /* Review and rating rows are the ALBUM PAGE'S REVIEW CARD (2026-09-14) —
     `revCardHtml`, with the same key as the album page's pinned card
     (`feedRevKey`), so the like and the comment count are the same act on both
     surfaces. What the album page doesn't need and the feed does: the RECORD
     LINE (cover · album · artist), tappable to the album; `feed: n` routes the
     card tap and the comment pill through feedOpen (see cmtCardTap).
     `.v3-rev-card--feed` re-inks the card off the --sd-* tokens: the album
     page's card sits on the album's dark colour, this one sits on the screen
     bg, cream in the light theme. */
  const card = (e, n) => revCardHtml({
    key: feedRevKey(e), cls: 'v3-rev-card--feed', feed: n,
    name: e.user, face: e.face, ago: e.ago, timeRight: true, actsTop: true,
    chip: e.popular ? 'popular review' : undefined,   // the community leaking in (see FB_POPULAR_PER_DEAL)
    /* No quote marks on the feed (Eric, 2026-09-15): the card's shape already
       says "this is what they wrote". The data carries them for the inbox's
       one-line rows, so they come off here. */
    rating: e.rating || 0, text: e.type === 'review' ? feedUnquote(e.quote) : '',
    likes: e.likes || 0, comments: e.comments || 0,
    record: { image: e.image, album: e.album, artist: e.artist, year: e.year },
  });

  const row = (e, n) => (e.type === 'review' || e.type === 'rating') ? card(e, n) : act(e, n);

  // One flat list (Eric, 2026-09-15). The inbox's Today / This week / Earlier
  // headers were tried here and read as clutter between cards that already
  // carry their own time — the feed is sorted newest-first, which says it.
  container.innerHTML = events.map((e, n) => row(e, n)).join('');
  // The cards' five-line fade, measured the way the album page measures it —
  // now and again after layout, since the other shell is display:none.
  markLongReviews(container);
  setTimeout(() => markLongReviews(container), 80);
  setTimeout(() => markLongReviews(container), 600);
  tintFeedRecords(container);
}

/* ═══════════════════════════════════════════════════════════════════════
   csharpuser (2026-09-23) — THE FRIENDS DECK (markup: friendsBentoHtml)
   ═══════════════════════════════════════════════════════════════════════
   Your friends' recent album reviews, dealt as a deck of drop-shadow cards
   where the bento was. ONE list per page load (`fbReviews`), ONE cursor per
   shell (`screenEl._fbCur`): the card at the cursor is the FRONT, and the
   strip and the shell's colour follow it.
   ⚠️ The front card's album becomes the shell's MAIN ALBUM (setMainAlbum) —
   that tints the shell and keeps the hidden hero in step, so a cold colour
   extraction on it can never land the wrong palette. It does NOT touch
   `_albumIdx`: the hero's own sequence is left alone for the album page.
   ⚠️ Taps: a card behind deals itself to the front; the FRONT card (and the
   strip) open that review on the album page — openFriendReview, the same
   door the feed's cards use. A horizontal drag over the deck steps it; the
   click that lands after a drag is swallowed (`flow._swiped`). */
/* ⚠️ FRIEND_ACTIVITY is REBUILT on a persona switch, and the deck's list
   (`_FB_LIST`) and its covers were built once off the first one — so a cover
   dealt from the old list opened, by index, a record in the new one: the
   WRONG ALBUM (Eric, 2026-09-25). Every rebuild goes through here now, which
   drops the cache; renderFriendsBento re-deals a flow whose list changed. */
function setFriendActivity(list) {
  window.FRIEND_ACTIVITY = list;
  window._FB_LIST = null;
}
function fbReviews() {
  if (window._FB_LIST) return window._FB_LIST;
  const src = window.FRIEND_ACTIVITY || [];
  const list = src.map((f, idx) => Object.assign({ idx }, f))
    .filter(f => f.quote)                                   // a review, not a bare rating
    .sort((a, b) => agoMins(a.ago) - agoMins(b.ago))        // newest first
    // Every review a friend wrote — only three or four SHOW at once (fbLayout
    // fades the rest), but you can keep flicking through all of them (Eric).
    .map(f => Object.assign(f, { face: feedFace(f.user) }));
  // FOR NOW (Eric, 2026-09-24): a popular review leads the deck, so the
  // ribbon is the first thing on screen. Flip FB_POPULAR_FIRST off to let
  // the newest lead again.
  if (FB_POPULAR_FIRST) { const i = list.findIndex(f => f.popular); if (i > 0) list.unshift(list.splice(i, 1)[0]); }
  return (window._FB_LIST = list);
}
const FB_POPULAR_FIRST = true;
// The album object the front review is about — the archive's record when it
// has one (so the album page gets the real thing), else the review's own
// fields, which carry everything the shell reads.
function fbAlbumOf(f) {
  return friendAlbumFor(f) || { album: f.album, artist: f.artist, year: f.year, image: f.image, reviewCount: 0 };
}

/* THE DECK'S LIST IS PER SCREEN (2026-09-24): home's is the friends' reviews
   (fbReviews); the Trending wall's is its DISCOVERY deck (renderDiscoveryDeck
   writes `_fbList`). Everything that paints or steps the deck reads this. */
function fbListOf(screenEl) { return (screenEl && screenEl._fbList) || fbReviews(); }

function renderFriendsBento(screenEl) {
  const fb = screenEl.querySelector('.v3-fb');
  if (!fb || fb.classList.contains('v3-fb--dd')) return;   // the wall's deck is renderDiscoveryDeck's
  const list = fbReviews();
  if (!list.length) { fb.hidden = true; return; }
  const flow = fb.querySelector('.v3-fb-flow');
  /* ⚠️ THE DECK OWNS ITS LIST (2026-09-26). `fbReviews()` is re-dealt by
     every `setFriendActivity` — the rec deal's `dzRefreshHome` a few seconds
     after load, a persona switch, pull-to-refresh — and only a full render
     repaints this deck. Between the two, everything that reads the list by
     index (the cover tap, the strip, the review tap) has to see the SAME list
     the covers were painted from, or a tap on Hyperdrama opens Talisman and
     the review tap finds no key and does nothing (reproduced in Chrome).
     So the list is pinned on the screen as `_fbList` — exactly what the
     Trending wall's discovery deck already does — and `fbListOf` reads it. */
  screenEl._fbList = list;
  if (flow && flow._list !== list) {           // first paint, or the list was rebuilt (setFriendActivity)
    flow._list = list;
    flow.innerHTML = list.map((f, i) => `
              <div class="v3-fb-card" data-i="${i}" style="background-image:url('${f.image}')" onclick="fbCardTap(this, event)"></div>`).join('');
    if (!flow._built) { flow._built = true; fbSwipe(screenEl, flow); }   // the gesture is wired once
    screenEl._fbCur = 0;
    // Warm the palettes the deck will step through, like the hero's preload.
    list.forEach(f => { if (f.image && typeof computeAlbumColors === 'function') computeAlbumColors(f.image); });
  }
  if (screenEl._fbCur == null) screenEl._fbCur = 0;
  fbGo(screenEl, screenEl._fbCur);
}

/* THE DECK'S GEOMETRY — COVER FLOW, the iPod classic's (Eric, 2026-09-23,
   with the photo). The FRONT card sits in the middle facing you. The covers
   either side FACE THE CENTRE: each is turned hard so its OUTER edge swings
   toward you — the outer top corner is the highest point of the card — while
   its inner edge tucks away behind the cover in front of it. Cards to come
   on the right, dealt ones on the left, mirror images.
   ONE RULE FOR THE WALL (Eric, 2026-09-23: "consistently spaced and arced,
   three albums a side"): the side covers' turn, edge position, depth and
   opacity per step live in FB_TUNE (below) — set from the dev box's Deck
   tab. Out of the box: the same turn for all, edges 23px apart, ONE depth
   (Eric: "not progressively further back"), so they are the same size and
   stand in a row; three show a side (the third fading), the fourth is out.
   ⚠️ THE CORNERS LINE UP, THE EDGES STAY SHARP (Eric): the perspective
   origin is the covers' middle, so a turned cover is a symmetric trapezoid
   — top AND bottom edges slant, the outer corners pointed. Pushed back, it
   draws smaller about that middle, so its bottom would float above the
   front cover's. Each side cover is therefore DROPPED (`y`, solved below)
   by exactly what its near edge lost, so the near edge's bottom corner
   lands on the front cover's bottom line; the far edge's bottom rises from
   there — the slant. The lower corner you see, on every side cover, is on
   the floor. (A vanishing point at floor level would flatten the bottoms
   into one line — tried, Eric: "don't make them flat".) Because a hard turn is narrow, the cards are placed by their
   OUTER edge, which is what has to step evenly; the inner edge falls behind
   the card in front. Checked (245 / P600 / 75° / z160): outer edges at +148,
   +171, +194 from centre (screen 345 / 368 / 391); every near edge 229 tall
   off the floor, far edge 167; each inner edge (65 / 82 / 98) sits behind
   the card before it.
   ⚠️ DEPTH ORDER IS REAL 3D, not z-index: `.v3-fb-flow` is preserve-3d, so
   the browser sorts the covers by their actual z and, mid-swipe, two covers
   crossing are split along their intersection rather than one popping over
   the other on an integer swap — the "flash" Eric saw. fbPaintDeck sets no
   z-index. */
const FB_CARD = 245;
/* THE TUNE TABLE (Eric, 2026-09-23: "give me controls to adjust the
   translation and rotation of the cards … describing it is incredibly
   hard"). Per step back (index 1–3; 0 is the front): the turn, where the
   near edge lands from the centre, the push-back, a Y nudge, the opacity.
   Past step 3 the 2→3 deltas carry on. `p` is the flow's perspective, which
   the dev box also writes onto `.v3-fb-flow` inline. The DEV BOX's "Deck"
   tab drives this live and prints it back as this block — paste it here.
   ⚠️ Keep `p` in step with `.v3-fb-flow { perspective }` (app.css). */
const FB_TUNE = {
  p: 600,
  a: [0, 75, 94, 101],        // rotateY toward the centre, deg (Eric's tune, 2026-09-23)
  o: [0, 158, 184, 206],      // near (outer) edge from the centre, px (Eric's tune, 2026-09-24)
  z: [0, 160, 160, 160],      // push-back, px
  y: [0, 0, 0, 0],            // extra Y nudge, px (the floor drop is solved on top)
  fade: [1, 1, 0.85, 0.55],   // opacity
};
function fbDist(k, cur, n) {
  let d = k - cur;
  if (d > n / 2) d -= n;
  else if (d < -n / 2) d += n;
  return d;
}
// The pose for a card `a` steps from the front (a ≥ 0, integer), unsigned.
function fbPoseAt(a) {
  if (!a) return { x: 0, y: 0, z: 0, rot: 0, o: 1 };
  const T = FB_TUNE, i = Math.min(a, 3), ext = Math.max(0, a - 3);
  const at = arr => arr[i] + (arr[3] - arr[2]) * ext;
  const rot = at(T.a), z = at(T.z), outer = at(T.o), ny = at(T.y);
  const rad = rot * Math.PI / 180, h = FB_CARD / 2;
  const near = (T.p + z - h * Math.sin(rad)) / T.p;            // 1 / the near edge's projection scale
  const x = outer * near - h * Math.cos(rad);
  const y = h * near - h + ny;                                  // drop, so the near edge's bottom corner meets the floor
  const o = ext ? 0 : (T.fade[i] != null ? T.fade[i] : 0);
  return { x, y, z, rot, o };
}
/* The pose for ANY distance, fractional included — a drag puts every card
   part-way between two integer poses, so this lerps x, z, turn and opacity
   between the poses either side. The sign flips the side (and the turn:
   rotateY(−θ) on the right turns its right edge toward you, mirrored on the
   left), so a card crossing the middle swings from one turn to the other
   through flat, which is the iPod's flip. */
function fbLayout(d) {
  const a = Math.abs(d), sg = d < 0 ? -1 : 1;
  const i0 = Math.floor(a), t = a - i0;
  const A = fbPoseAt(i0), B = t ? fbPoseAt(i0 + 1) : A;
  const L = (p, q) => p + (q - p) * t;
  const x = L(A.x, B.x), y = L(A.y, B.y), z = L(A.z, B.z), rot = L(A.rot, B.rot), o = L(A.o, B.o);
  /* THE VEIL (Eric, 2026-09-23: "instead of opacity, a slight fade into the
     bg with the same colour"): a card stays opaque and is washed toward the
     screen's background by `--fb-veil` (its `::after`, app.css) — the
     table's fade value, inverted, over a 10% base shade for any card that
     is not the front. Only a card faded all the way out goes transparent. */
  const veil = a < 0.5 ? 0 : 1 - o * 0.9;
  return { t: `translate3d(${(sg * x).toFixed(1)}px, ${y.toFixed(1)}px, ${(-z).toFixed(1)}px) rotateY(${(-sg * rot).toFixed(2)}deg)`, o, veil };
}

// Paint the deck at a cursor position, which may be fractional mid-drag.
function fbPaintDeck(screenEl, curF) {
  const list = fbListOf(screenEl); if (!list.length) return;
  const n = list.length, ci = Math.round(curF), frac = curF - ci;
  screenEl.querySelectorAll('.v3-fb-card').forEach(card => {
    const k = Number(card.dataset.i);
    const L = fbLayout(fbDist(k, ((ci % n) + n) % n, n) - frac);
    card.style.transform = L.t;
    card.style.opacity = L.o > 0 ? 1 : 0;
    card.style.setProperty('--fb-veil', L.veil.toFixed(3));
    card.style.pointerEvents = L.o ? '' : 'none';
    card.classList.toggle('is-front', !frac && fbDist(k, ((ci % n) + n) % n, n) === 0);
  });
}

function fbGo(screenEl, i) {
  const list = fbListOf(screenEl);
  if (!list.length) return;
  const cur = ((i % list.length) + list.length) % list.length;
  screenEl._fbCur = cur;
  const f = list[cur];
  const album = fbAlbumOf(f);
  screenEl._fbAlbum = album;

  // The deck.
  fbPaintDeck(screenEl, cur);

  /* THE DISCOVERY DECK (the Trending wall, Eric 2026-09-24): the same deck
     and the same title strip, but under it the ACTUAL REVIEW — the record's
     aggregate score, discs and count — and no user review. Painted here and
     done; the shell takes the album like home does. */
  if (f._dd) {
    const strip = screenEl.querySelector('.v3-fb-strip');
    if (strip) {
      strip.querySelector('.v3-fb-album').textContent = album.album;
      strip.querySelector('.v3-fb-year').textContent = album.year || '';
      strip.querySelector('.v3-fb-artist').textContent = album.artist;
    }
    const sc = screenEl.querySelector('.v3-dd-score');
    if (sc) {
      const r = Number(album.rating) || 0;
      sc.querySelector('.v3-dd-n').textContent = r.toFixed(1);
      sc.querySelector('.v3-dd-discs').innerHTML = halfStars(r, 13);
      sc.querySelector('.v3-dd-count').textContent = window.fmtRc(album.reviewCount || 0) + ' reviews';
    }
    setMainAlbum(screenEl, album, false);
    applyAlbumColorsUrl(screenEl, album.image);
    return;
  }

  /* The strip: the ALBUM PAGE's info box — the title large with the year
     beside it, the artist below (Eric: "larger, like the album year and then
     artist below like we had it") — and under it THE FRIEND'S REVIEW (Eric,
     2026-09-23), CENTRED, its own shape (`.v3-fbr`, not the feed card's
     grid): the face large in the middle with the like on its left and the
     comment count on its right ("since we have space there"), the name with
     when beside it under that (one name, no @handle — Eric), the score
     beside the discs under that, and the
     review beneath. The pills are the feed's own (upvoteHtml / cmtBtnHtml)
     with the feed's key (feedRevKey), so a like here and a like on the same
     review in the feed or on the album page are the same act. No record
     line — the album is right above it. The card's tap, and the comment
     pill's, go where the front card's does: the album page with this review
     pinned and its thread open (fbOpenFront), not the review page.
     ⚠️ NO album score line between them (Eric): the bento's score · discs ·
     count row was here for an hour and read as a second rating over the
     friend's — one rating on screen, and it is the friend's. */
  const strip = screenEl.querySelector('.v3-fb-strip');
  if (strip) {
    const key = feedRevKey(f);
    REV_INDEX[key] = { key, album, name: f.user, init: f.init, grad: f.grad, rating: f.rating || 0,
      text: feedUnquote(f.quote), ago: f.ago, likes: f.likes || 0, comments: f.comments || 0,
      face: f.face, popular: !!f.popular };
    const like = upvoteHtml(key, f.likes || 0, 'v3-up--sm v3-up--like v3-up--heart')
      .replace(/<svg[\s\S]*?<\/svg>/, typeof RVP_HEART !== 'undefined' ? RVP_HEART : '');
    const cmt = cmtBtnHtml(key, f.comments || 0, 'v3-up--sm v3-up--cmtcol')
      .replace('cmtCompose(this)', 'fbOpenFront(this, event)');
    const rating = Number(f.rating) || 0;
    const text = revNoWidow(feedUnquote(f.quote));
    /* BUILT ONCE, UPDATED IN PLACE (Eric, 2026-09-23): rebuilding the card's
       markup on every deal replaced the face outright and reset the counts.
       Now the info lines are written in, the face CROSSFADES (fbFace) and the
       like / comment counts ROLL from the old number to the new (fbTick).
       Only the pills' markup is re-rendered, for their keys; their counts are
       then animated from what was showing. */
    // The review lives in its own box ABOVE the deck (Eric, 2026-09-23); the
    // title and artist stay in the strip UNDER it.
    const revBox = screenEl.querySelector('.v3-fb-review') || strip;
    let rev = revBox.querySelector('.v3-fbr');
    if (!rev) {
      strip.innerHTML = `
              <div class="v3-fb-title"><span class="v3-fb-album"></span><span class="v3-fb-year"></span></div>
              <div class="v3-fb-artist" onclick="fbArtistTap(this, event)"></div>`;
      revBox.insertAdjacentHTML('beforeend', `
              <div class="v3-fbr" onclick="fbOpenFront(this, event)">
                <div class="v3-fbr-head">
                  <!-- csharpuser (2026-09-25): the POPULAR REVIEW ribbon that ran
                       round the face is gone (Eric: no 3D ribbons), and so is
                       the flat tag that briefly replaced it — a popular review
                       looks like any other; .is-popular is data only. -->
                  <div class="v3-fbr-av-wrap">
                    <div class="v3-fbr-av" onclick="sdPerson(this, event)"></div>
                  </div>
                </div>
                <div class="v3-fbr-name"><span class="v3-fbr-who" onclick="sdPerson(this, event)"></span><span class="v3-fbr-ago"></span></div>
                <!-- The like and the comment flank the SCORE now, not the face (Eric, 2026-09-23). -->
                <!-- .v3-fbr-acts groups the comment · like · when for the compact layout
                     (one grid cell); the centred layout sets it display:contents and
                     orders the like back to the score's left. -->
                <div class="v3-fbr-score">
                  <span class="v3-fbr-scorebox"><span class="v3-fbr-n"></span><span class="v3-fbr-discs"></span></span>
                  <span class="v3-fbr-acts">
                    <span class="v3-fbr-act v3-fbr-act--like"></span>
                    <span class="v3-fbr-act v3-fbr-act--cmt"></span>
                    <span class="v3-fbr-ago v3-fbr-ago--row"></span>
                  </span>
                </div>
                <div class="v3-fbr-text"></div>
                <button class="v3-fbr-more" type="button" onclick="fbMore(this, event)">View more</button>
              </div>`);
      rev = revBox.querySelector('.v3-fbr');
    }
    rev.dataset.k = _revAttr(key);
    strip.querySelector('.v3-fb-album').textContent = album.album;
    strip.querySelector('.v3-fb-year').textContent = album.year || '';
    strip.querySelector('.v3-fb-artist').textContent = album.artist;
    fbFace(rev.querySelector('.v3-fbr-av'), f.face);
    rev.classList.toggle('is-popular', !!f.popular);   // data only — no ribbon, no tag (Eric, 2026-09-25)
    rev.querySelector('.v3-fbr-who').textContent = f.user;
    rev.querySelectorAll('.v3-fbr-ago').forEach(el => { el.textContent = f.ago; });   // the name's and the score row's (one shows per layout)
    rev.querySelector('.v3-fbr-n').textContent = rating.toFixed(1);
    rev.querySelector('.v3-fbr-discs').innerHTML = halfStars(rating, 13);
    const likeSlot = rev.querySelector('.v3-fbr-act--like'), cmtSlot = rev.querySelector('.v3-fbr-act--cmt');
    const prevLike = fbShown(likeSlot), prevCmt = fbShown(cmtSlot);
    likeSlot.innerHTML = like; cmtSlot.innerHTML = cmt;
    fbTick(likeSlot.querySelector('.v3-up-n'), prevLike, (f.likes || 0) + (REV_VOTES[key] ? 1 : 0));
    fbTick(cmtSlot.querySelector('.v3-up-n'), prevCmt, cmtCount(key, f.comments || 0));
    const t = rev.querySelector('.v3-fbr-text');
    t.innerHTML = text;
    rev.classList.remove('is-open');
    rev.querySelector('.v3-fbr-more').textContent = 'View more';
    /* Four lines, then a fade and "View more" (Eric, 2026-09-23) — the fade
       only on a review that really overflows (`.is-long`, measured after
       layout and again a beat later for a cold font). The text block is a
       FIXED four lines tall and the button row is always there (hidden when
       there is nothing more), so the deck under it sits at one distance
       whatever the review's length. */
    const mark = () => { if (t.clientHeight) { rev.classList.toggle('is-long', t.scrollHeight > t.clientHeight + 2); fbMarkShort(rev, t); } };
    requestAnimationFrame(mark); setTimeout(mark, 120);
  }

  // The shell takes the front review's album.
  setMainAlbum(screenEl, album, false);
  applyAlbumColorsUrl(screenEl, album.image);
}

/* A TAP ON A SIDE (Eric, 2026-09-23: "if I click on the left or right can I
   go one album next or prev"): anything tapped left of the middle steps
   back one, right of it steps on one — whichever cover was under the finger,
   or none. Only the FRONT cover opens its review. Same rule for a tap on the
   flow's empty floor (fbFlowTap, on the flow itself). */
function fbSideStep(scr, flow, e) {
  const r = flow.getBoundingClientRect();
  const x = e && e.clientX != null ? e.clientX : r.left + r.width / 2;
  fbGo(scr, (scr._fbCur || 0) + (x < r.left + r.width / 2 ? -1 : 1));
}
window.fbCardTap = function (el, e) {
  if (e) e.stopPropagation();
  const scr = el.closest('.s-home-v3');
  const flow = el.closest('.v3-fb-flow');
  if (!scr || (flow && flow._swiped)) return;
  const i = Number(el.dataset.i);
  if (i === scr._fbCur) {
    const f = fbListOf(scr)[i];
    // The cover is the ALBUM (Eric, 2026-09-25): its page from the top — the
    // record resolved from the deck's own entry, never by index into a list
    // that may have been rebuilt — with no review pinned and no glide down
    // to the comments. The review block under the deck is what opens the review.
    if (f && f._dd) openAlbumPage(f.rec);
    else if (f) openAlbumPage(fbAlbumOf(f));
  }
  else fbSideStep(scr, flow, e);
};
// The title strip under the deck: the album too (Eric, 2026-09-25).
window.fbOpenAlbum = function (el, e) {
  if (e) e.stopPropagation();
  const scr = el.closest('.s-home-v3');
  const f = scr && fbListOf(scr)[scr._fbCur || 0];
  if (!f) return;
  openAlbumPage(f._dd ? f.rec : fbAlbumOf(f));
};
// The discovery deck's strip and score row: the album page (Eric, 2026-09-24).
window.ddOpenFront = function (el, e) {
  if (e) e.stopPropagation();
  const scr = el.closest('.s-home-v3');
  const f = scr && fbListOf(scr)[scr._fbCur || 0];
  if (f && f._dd) openAlbumPage(f.rec);
};

/* THE DISCOVERY DECK (Eric, 2026-09-24: "on the discovery page, a similar
   album slider at the top with the album info but no user review, just the
   actual aggregated review, then the tiled wall below — it takes the place
   of our bento"). The wall's `.v3-fb--dd` (discoveryDeckHtml, screens.js)
   is the home deck's markup with `.v3-dd-score` in the review's place; the
   list is the wall's own ranking (wallItems), the first DD_N records, each
   wrapped so the deck code reads it like a friend's card (`_dd`, `rec`).
   Built once per screen; the sort chips re-deal it (pickWallSort). */
const DD_N = 12;
function renderDiscoveryDeck(screenEl) {
  const fb = screenEl.querySelector('.v3-fb--dd');
  if (!fb || typeof wallItems !== 'function') return;
  const list = wallItems().slice(0, DD_N).map(a => ({ _dd: true, rec: a, album: a.album, artist: a.artist, year: a.year, image: a.image }));
  if (!list.length) { fb.hidden = true; return; }
  screenEl._fbList = list;
  const flow = fb.querySelector('.v3-fb-flow');
  if (flow) {
    flow.innerHTML = list.map((f, i) => `
              <div class="v3-fb-card" data-i="${i}" style="background-image:url('${f.image}')" onclick="fbCardTap(this, event)"></div>`).join('');
    if (!flow._built) { flow._built = true; fbSwipe(screenEl, flow); }
    list.forEach(f => { if (f.image && typeof computeAlbumColors === 'function') computeAlbumColors(f.image); });
  }
  screenEl._fbCur = 0;
  fbGo(screenEl, 0);
}
window.fbFlowTap = function (flow, e) {
  if (e) e.stopPropagation();
  const scr = flow.closest('.s-home-v3');
  if (!scr || flow._swiped) return;
  fbSideStep(scr, flow, e);
};
/* THE FACE CROSSFADES (Eric): the avatar is a stack of face layers. A new
   face is laid on top at 0 and faded up over the one showing; once it has
   landed the layers under it are dropped. A fast run of deals just stacks
   and drops — nothing waits on the fade. */
function fbFace(av, url) {
  if (!av) return;
  const cur = av.lastElementChild;
  if (cur && cur.dataset.url === url) return;
  const layer = document.createElement('span');
  layer.className = 'v3-fbr-face';
  layer.dataset.url = url;
  layer.style.backgroundImage = `url('${url}')`;
  if (!cur) { layer.classList.add('is-in'); av.appendChild(layer); return; }
  av.appendChild(layer);
  requestAnimationFrame(() => requestAnimationFrame(() => layer.classList.add('is-in')));
  setTimeout(() => { while (av.firstElementChild && av.firstElementChild !== layer) av.firstElementChild.remove(); }, 480);
}
// What a count slot is showing right now (the pill is about to be re-rendered).
function fbShown(slot) {
  const n = slot && slot.querySelector('.v3-up-n');
  if (!n) return 0;
  if (n._tickTo != null) return n._tickTo;
  const txt = String(n.textContent).trim();
  const v = parseFloat(txt) * (/k$/i.test(txt) ? 1000 : 1);
  return isFinite(v) ? v : 0;
}
/* THE TICKER (Eric: "like an airport ticker — it counts up"): a count rolls
   from the number that was showing to the new one, fast at first and
   settling, each change of digit a little split-flap flip (the `.is-flip`
   pulse, app.css). Rolls DOWN too when the new review has fewer. A deal
   mid-roll retargets from wherever the roll had got to. */
const FB_TICK_STEPS = 5;
/* SPLIT-FLAP (Eric, 2026-09-24: "actually flip like flip cards … so fast,
   and when it's close to the number it slows down slightly"): the count
   turns over one card at a time — a real flip about its middle (`fbr-flip`,
   app.css: down to edge-on, the new number rides back up) — and each flip
   takes a little longer than the last, most of the slowing at the end, so
   it clatters in and settles. At most FB_TICK_STEPS cards on the way (fewer
   when the numbers are that close), FB_FLIP_FAST ms for the first and
   FB_FLIP_SLOW for the last. */
const FB_FLIP_FAST = 110, FB_FLIP_SLOW = 300;
function fbTick(el, from, to) {
  if (!el) return;
  if (el._tickTimer) clearTimeout(el._tickTimer);
  if (el._tickSwap) clearTimeout(el._tickSwap);
  const a = Number(from) || 0, b = Number(to) || 0;
  el._tickTo = b;
  if (a === b) { el.textContent = window.fmtRc(b); return; }
  const steps = Math.min(FB_TICK_STEPS, Math.abs(b - a));
  let k = 0;
  const flip = () => {
    k++;
    const v = k >= steps ? b : a + Math.round((b - a) * k / steps);
    const t = k / steps;
    const dur = Math.round(FB_FLIP_FAST + (FB_FLIP_SLOW - FB_FLIP_FAST) * t * t);
    el.style.animationDuration = dur + 'ms';
    el.classList.remove('is-flip'); void el.offsetWidth; el.classList.add('is-flip');
    el._tickSwap = setTimeout(() => { el.textContent = window.fmtRc(v); }, dur / 2);   // swapped while edge-on
    el._tickTimer = k < steps ? setTimeout(flip, dur) : null;
  };
  flip();
}

/* csharpuser (2026-09-25): the POPULAR REVIEW belt (fbBeltHtml and the
   FB_BELT_* geometry) is gone — Eric asked for no 3D ribbons, and then for
   no tag either: a popular review is not marked at all. The builder is in
   git history (commit 54e24ad and before) if it is wanted. */

// "View more" opens the whole review in place; again to fold it back.
window.fbMore = function (btn, e) {
  if (e) e.stopPropagation();
  const rev = btn.closest('.v3-fbr');
  if (!rev) return;
  const open = rev.classList.toggle('is-open');
  btn.textContent = open ? 'View less' : 'View more';
};
window.fbOpenFront = function (el, e) {
  if (e) e.stopPropagation();
  const scr = el.closest('.s-home-v3');
  const f = scr && fbListOf(scr)[scr._fbCur || 0];   // the deck's OWN list (see renderFriendsBento), never the live one
  if (!f) return;
  // The REVIEW SHEET (Eric, 2026-09-24): the review, its comments and the
  // composer slide up over the deck. From the comment pill, the composer is
  // aimed. The entry was written by fbGo under the feed's key.
  openReviewSheet(feedRevKey(f), el.classList.contains('v3-cmt-btn'), el);
};

/* A review of two lines or fewer under the deck reads better CENTRED (Eric,
   2026-09-24: "when there is only two lines, centre that"); a longer one
   keeps its left edge. Measured against the line-height, so it follows the
   font. Shared with the sheet's copy of the same block. */
function fbMarkShort(rev, t) {
  if (!t || !t.clientHeight) return;
  const lh = parseFloat(getComputedStyle(t).lineHeight) || 22;
  rev.classList.toggle('is-short', t.scrollHeight <= lh * 2 + 2);
}

/* ── THE REVIEW SHEET (Eric, 2026-09-24) ───────────────────────────────────
   "A consistent review screen … a popup instead of a whole page … goes from
   the bottom up and then goes down when you close it … the similar elements
   to the homepage review's top part." One popup for every review on home:
   the deck's review and the feed's cards both open it (fbOpenFront,
   cmtCardTap, cmtCompose). It mounts INSIDE the phone screen that was tapped
   (like the search overlay), so the light shell gets a light sheet and the
   dark a dark one off the --sd-* tokens, and the two viewer shells never
   share one.
   TOP PART = the deck's review block, the SAME markup and classes (`.v3-fbr`:
   face with the POPULAR belt, name · when, the score flanked by the like and
   the comment), so the two cannot drift — the sheet only unclamps the text.
   Under it a record line (cover · album · artist, tap → the album page),
   then the comments: the composer first, the thread under it, paging as you
   scroll (cmtAutoMore knows `.v3-rsh-body`). The pills carry the feed's key,
   so a like or a comment here IS the one on the card and in the deck.
   CLOSE: tap the dimmed backdrop, Escape, or pull the sheet down by its
   handle or head past RSH_CLOSE_PX — it follows the finger, then either
   drops away or springs back. The album page's in-place review and the
   profile's standalone page are untouched (Eric wants to rethink that
   system; this is home's). */
const RSH_CLOSE_PX = 90;
function rshHtml(R) {
  return `
    <div class="v3-rsh" role="dialog" aria-modal="true" aria-label="Review" onclick="event.stopPropagation()">
      <div class="v3-rsh-grab" aria-hidden="true"><i></i></div>
      <div class="v3-rsh-body">${rshBodyHtml(R)}
      </div>
    </div>`;
}
/* THE SHEET'S CONTENT on its own — the review block, the record line and the
   comments — so the REVIEW PAGE and the album page's in-place review
   (reviewPanelHtml, screens.js) can wear the same look (Eric, 2026-09-25:
   "redo the review page so it's the same style as the inner review page").
   The sheet wraps it in `.v3-rsh-body`; the page in `.v3-rsh-body--page`. */
function rshBodyHtml(R) {
  const key = R.key;
  const P = window.PROFILE || {};
  const face = R.mine ? (P.pic || 'images/rp-01.jpg') : (R.face || R.pic || (typeof feedFace === 'function' ? feedFace(R.name) : ''));
  const rating = Number(R.rating) || 0;
  const like = R.mine ? '' : upvoteHtml(key, R.likes || 0, 'v3-up--sm v3-up--like v3-up--heart')
    .replace(/<svg[\s\S]*?<\/svg>/, typeof RVP_HEART !== 'undefined' ? RVP_HEART : '');
  const cmt = cmtBtnHtml(key, R.comments || 0, 'v3-up--sm v3-up--cmtcol');
  const a = R.album || {};
  const text = R.text ? (typeof revNoWidow === 'function' ? revNoWidow(R.text) : R.text) : '';
  return `
        <div class="v3-fbr v3-fbr--sheet${R.popular ? ' is-popular' : ''}" data-k="${_revAttr(key)}">
          <div class="v3-fbr-head">
            <div class="v3-fbr-av-wrap">
              <div class="v3-fbr-av" data-user="${R.mine ? 'You' : sdAttr(R.name || '')}" onclick="sdPerson(this, event)"><span class="v3-fbr-face is-in" style="background-image:url('${face}')"></span></div>
            </div>
          </div>
          <div class="v3-fbr-name"><span class="v3-fbr-who" data-user="${R.mine ? 'You' : sdAttr(R.name || '')}" onclick="sdPerson(this, event)">${R.name || 'Listener'}</span><span class="v3-fbr-ago">${R.ago || ''}</span></div>
          <div class="v3-fbr-score">
            <span class="v3-fbr-scorebox"><span class="v3-fbr-n">${rating.toFixed(1)}</span><span class="v3-fbr-discs">${halfStars(rating, 13)}</span></span>
            <span class="v3-fbr-acts">
              <span class="v3-fbr-act v3-fbr-act--like">${like}</span>
              <span class="v3-fbr-act v3-fbr-act--cmt">${cmt}</span>
              <span class="v3-fbr-ago v3-fbr-ago--row">${R.ago || ''}</span>
            </span>
          </div>
          ${text ? `<div class="v3-fbr-text">${text}</div>` : ''}
        </div>
        <!-- The record line: the whole box goes to the album — except the CD
             pushed hard right, which raises the NAV CONSOLE (the streaming
             links) for this review's album, exactly as the album page's CD
             does (Eric, 2026-09-25). It played a 30s preview before, and
             previews are not a feature — see PREVIEWS_ENABLED. -->
        <div class="v3-rsh-record" onclick="rshRecordTap(this)" title="Open the album">
          <div class="v3-rsh-art" style="background-image:url('${a.image || ''}')"></div>
          <div class="v3-rsh-rec-who">
            <span class="v3-rsh-rec-album">${a.album || ''}</span>
            <span class="v3-rsh-rec-artist">${a.artist || ''}${a.year ? ` · ${a.year}` : ''}</span>
          </div>
          <div class="v3-rsh-cd" style="background-image:url('${a.image || ''}')" title="Listen on…" onclick="rshCdTap(this, event)"><div class="v3-cd-hole"></div></div>
        </div>
        <div class="rvp-cmts">
          <div class="rvp-cmts-hd">Comments <span class="rvp-cmts-n" data-k="${_revAttr(key)}" data-n="${R.comments || 0}">${cmtCount(key, R.comments || 0)}</span></div>
          ${cmtWrapHtml(key, R.comments || 0)}
        </div>`;
}
window.rshBodyHtml = rshBodyHtml;
window.openReviewSheet = function (key, compose, triggerEl) {
  const R = REV_INDEX[key];
  if (!R) return;
  closeReviewSheet(true);
  CMT_OPEN[key] = true;                       // the thread IS the sheet — always open here
  const host = (triggerEl && triggerEl.closest && triggerEl.closest('.app-screen'))
             || document.querySelector('.app-screen.s-home-v3') || document.body;
  const ov = document.createElement('div');
  ov.className = 'v3-rsh-ov';
  ov.innerHTML = rshHtml(R);
  ov.addEventListener('click', () => closeReviewSheet());
  host.appendChild(ov);
  const sheet = ov.querySelector('.v3-rsh');
  const body = ov.querySelector('.v3-rsh-body');
  window._rsh = ov;
  // Pull it down to close: the handle and the head follow the pointer.
  let y0 = null, dy = 0;
  const grabs = [ov.querySelector('.v3-rsh-grab'), ov.querySelector('.v3-fbr--sheet')];
  grabs.forEach(g => g && g.addEventListener('pointerdown', e => {
    if (e.target.closest('button, input, a')) return;
    y0 = e.clientY; dy = 0;
    sheet.classList.add('is-drag');
    try { g.setPointerCapture(e.pointerId); } catch (_) {}
  }));
  const move = e => { if (y0 == null) return; dy = Math.max(0, e.clientY - y0); sheet.style.transform = `translateY(${dy}px)`; };
  const up = () => {
    if (y0 == null) return;
    y0 = null; sheet.classList.remove('is-drag'); sheet.style.transform = '';
    if (dy > RSH_CLOSE_PX) closeReviewSheet();
  };
  ov.addEventListener('pointermove', move);
  ov.addEventListener('pointerup', up); ov.addEventListener('pointercancel', up);
  ov._esc = e => { if (e.key === 'Escape') closeReviewSheet(); };
  document.addEventListener('keydown', ov._esc);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    ov.classList.add('open');
    const rev = ov.querySelector('.v3-fbr--sheet'), t = rev && rev.querySelector('.v3-fbr-text');
    fbMarkShort(rev, t); setTimeout(() => fbMarkShort(rev, t), 150);
  }));
  setTimeout(cmtFill, 80); setTimeout(cmtFill, 420);
  if (compose) setTimeout(() => { const inp = ov.querySelector('.v3-cmt-input'); if (inp) inp.focus(); }, 380);
  if (body) body.scrollTop = 0;
};
/* The CD on the record line → the NAV CONSOLE (Eric, 2026-09-25): the same
   popup the album page's CD raises — the record's line and the four services
   in the nav's grown pill — but for THIS review's album, not the shell's.
   ⚠️ No preview. This used to play the 30s clip through `previewAudioEl`, and
   previews are not a feature (`PREVIEWS_ENABLED`); the CD is the toggle, as on
   the album page: tap again and the console goes away.
   ⚠️ The sheet's overlay stacks ABOVE the nav (z 220 over 5), so app.css lifts
   the nav over it while a sheet is up and the console is open. The console's
   own dismiss listeners watch the bento and the body, which the sheet covers —
   so the overlay gets its own: a touch anywhere on it that is not the nav (or
   the CD, which toggles for itself), or a scroll of the sheet's body, puts the
   console away. Torn down through `_consoleOff`, the same hook `closeConsole`
   already fires, so the listeners never outlive the console. */
window.rshCdTap = function (el, e) {
  if (e) e.stopPropagation();
  const scr = el.closest('.s-home-v3');
  const host = el.closest('.v3-rsh-body');
  const rev = host && host.querySelector('.v3-fbr--sheet');
  const R = rev && REV_INDEX[rev.dataset.k];
  const album = R && R.album;
  if (!scr || !album || typeof openConsole !== 'function') return;
  if (scr.classList.contains('s-home-v3--console')) { closeConsole(scr); return; }
  openConsole(scr, album);
  const ov = el.closest('.v3-rsh-ov');
  if (!ov) return;                                   // the album page's in-place review: the bento's own dismiss applies
  const bye = () => closeConsole(scr);
  const onOv = ev => { if (!ev.target.closest('.v3-bottom-nav, .v3-rsh-cd')) bye(); };
  ov.addEventListener('pointerdown', onOv, true);
  if (host) host.addEventListener('scroll', bye, { passive: true });
  const prev = scr._consoleOff;
  scr._consoleOff = () => {
    if (prev) prev();
    ov.removeEventListener('pointerdown', onOv, true);
    if (host) host.removeEventListener('scroll', bye, { passive: true });
  };
};
window.closeReviewSheet = function (now) {
  const ov = window._rsh; if (!ov) return;
  window._rsh = null;
  // A console the sheet's CD raised goes with the sheet.
  if (typeof closeConsole === 'function') closeConsole(ov.closest('.s-home-v3'));
  document.removeEventListener('keydown', ov._esc);
  if (now) { ov.remove(); return; }
  ov.classList.remove('open');
  setTimeout(() => ov.remove(), 340);
};
// The record line: close the sheet, open the album.
window.rshRecordTap = function (el) {
  // On the album page's in-place review the record IS the album you are on: Back.
  if (el.closest('.s-home-v3--rvp')) { rvpBack(); return; }
  const rev = el.closest('.v3-rsh-body').querySelector('.v3-fbr--sheet');
  const R = rev && REV_INDEX[rev.dataset.k];
  closeReviewSheet();
  if (R && R.album && typeof openAlbumPage === 'function') openAlbumPage(R.album);
};

/* THE SWIPE IS TACTILE (Eric, 2026-09-23: "follows the swipe amount … a
   point where it just goes when you let go"). While the finger is down the
   deck RIDES it: FB_DRAG_PX of travel is one card, and every card is painted
   at that fractional position (fbPaintDeck), transitions off. On release it
   decides: past FB_COMMIT of a card, or flicked faster than FB_FLICK, it
   goes on to the next (or previous); otherwise it springs back. Either way
   the transitions come back on for the settle, and only then is the strip
   repainted (fbGo) — the review under the deck changes when the cover has
   landed, not while you're dragging it. One card per gesture: the travel is
   clamped to ±1, with a little give past it so a long pull still answers.
   `touch-action: pan-y` (app.css) keeps the page's vertical scroll; the
   gesture claims the horizontal once it is clearly sideways. */
const FB_DRAG_PX = 150, FB_COMMIT = 0.37, FB_FLICK = 0.5;    // px per card · fraction · px/ms (commit 0.32 → 0.37, Eric: "a little less sensitive")
function fbSwipe(screenEl, flow) {
  let x0 = 0, y0 = 0, on = false, claimed = false, p = 0, lastX = 0, lastT = 0, vx = 0;
  const clampP = v => { const m = Math.abs(v); return Math.sign(v) * (m <= 1 ? m : 1 + (m - 1) * 0.25); };
  flow.addEventListener('pointerdown', e => {
    x0 = lastX = e.clientX; y0 = e.clientY; lastT = performance.now();
    on = true; claimed = false; p = 0; vx = 0;
    flow._swiped = false;
  });
  flow.addEventListener('pointermove', e => {
    if (!on) return;
    const dx = e.clientX - x0, dy = e.clientY - y0;
    if (!claimed) {
      if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
      claimed = true; flow._swiped = true;
      flow.classList.add('is-dragging');
      try { flow.setPointerCapture(e.pointerId); } catch (_) {}
    }
    const now = performance.now(), dt = now - lastT;
    if (dt > 0) { vx = 0.6 * vx + 0.4 * ((e.clientX - lastX) / dt); lastX = e.clientX; lastT = now; }
    p = clampP(-dx / FB_DRAG_PX);                   // drag left → the next card comes
    fbPaintDeck(screenEl, (screenEl._fbCur || 0) + p);
  });
  const end = e => {
    if (!on) return;
    on = false;
    if (!claimed) return;
    flow.classList.remove('is-dragging');
    const cur = screenEl._fbCur || 0;
    let step = 0;
    if (Math.abs(p) >= FB_COMMIT) step = Math.sign(p);
    else if (Math.abs(vx) >= FB_FLICK) step = vx < 0 ? 1 : -1;
    fbGo(screenEl, cur + step);                     // settles with the transition on
    setTimeout(() => { flow._swiped = false; }, 60);   // let the click after a drag see the flag
  };
  flow.addEventListener('pointerup', end);
  flow.addEventListener('pointercancel', end);
}

/* Each card's discs take the colour of ITS OWN cover (Eric, 2026-09-18), not
   the bento's. Same extractor and cache as the bento (`computeAlbumColors` —
   a 48×48 canvas per cover, once per URL per session), so a feed of ~18
   cards is ~18 tiny draws the first time and nothing after.
   ⚠️ `--star` is set on the CARD, on purpose, despite the rule that nothing
   sets `--star` directly. That rule guards the bento, where `--star` has to
   FOLLOW the swiped cover through `--v3-star`; here each card IS its own
   cover. Writing `--v3-star` on the card would do nothing — `--star` is
   resolved on `.s-home-v3` and inherits down as a plain colour. It is the
   same `star` value the bento uses (the accent unless it is too grey, then
   the house gold) — except that a black-and-white sleeve gets a MIDDLE GREY
   here rather than the gold (Eric, 2026-09-18): on the bento the gold stands
   in for a colour the cover hasn't got; on a card it's the record's own
   colour or nothing, and grey is honest about a grey sleeve. `starGrey` is
   the extractor saying the fallback fired. */
const FEED_GREY_STAR = '#9c9ca3';
function tintFeedRecords(container) {
  container.querySelectorAll('.v3-rev-card--feed').forEach(card => {
    const art = card.querySelector('.v3-rev-record-art');
    if (!art || !card.querySelector('.hstars')) return;
    const m = (art.style.backgroundImage || '').match(/url\(['"]?([^'"]+?)['"]?\)/);
    if (!m) return;
    computeAlbumColors(m[1]).then(c => {
      if (c && card.isConnected) card.style.setProperty('--star', c.starGrey ? FEED_GREY_STAR : (c.star || c.accent));
    });
  });
}

/* ── The pet ─ six dots in the nav's scoop ────────────────────────
   Two eyes and a four-dot mouth arc — the same six the live pill's arrow is made
   of, and the same offsets the retired `.v3-ring--smile` used. It reacts to what
   you DO: favourite, rate, listen, save for later, like, follow.

   ⚠️ Formations, not sprites. This replaced an SD_DOTS pixel grid that swapped a
   whole 21×10 SVG per frame, and the difference is the point: a sprite swap is a
   CUT, while these six dots inherit a 0.4s spring transition and MORPH between
   formations. The morph is the character. A new reaction is now six numbers in
   app.css plus one row in SCENE_REACTIONS — not a hand-drawn sprite.
   ⚠️ The grid is still worth knowing about: it died because detail dies at
   63×30px, which is also why the budget here is six dots and no more. A cat
   mascot and a whole landscape were lost to that box before this.
   ⚠️ Frames live in app.css as `.sd-face--<name>`. paintScene swaps ONE class,
   so a name with no rule silently renders the previous formation. */

/* The idle rhythm. Mostly the smile, blinking now and then, and every few passes
   it hums along to itself for a beat or two before settling back.
   ⚠️ A face that moves constantly reads as broken rather than alive, so the
   still frames are long and the moving ones are short. */
const SCENE_LOOP = [
  ['smile', 3200], ['blink', 170], ['smile', 2600], ['wink', 260], ['smile', 3000],
  ['blink', 170], ['blink', 150], ['smile', 2400],
  // …and it hums along
  ['music', 320], ['music2', 320], ['music', 300], ['music2', 320], ['music', 300],
  ['music2', 320], ['smile', 260],
  ['smile', 3400], ['blink', 170], ['smile', 2800], ['wink', 260],
];

/* ── What the pet reacts to ────────────────────────────────────────────────
   One entry per thing you can DO. `seq` is cycled for `ms`, then the idle loop
   picks up where it left off. Adding a reaction is adding a row here plus one
   `sceneReact('…')` call at the site — no engine changes.
   ⚠️ Keep every sequence at least two frames. A single held frame reads as the
   face having got stuck, not as a reaction. */
const SCENE_REACTIONS = {
  music:    { seq: [['music', 300], ['music2', 300]],  ms: 1800 },  // swipe · CD · For You
  listened: { seq: [['music', 300], ['music2', 300]],  ms: 2000 },
  fav:      { seq: [['love', 420], ['love2', 300]],    ms: 1900 },
  later:    { seq: [['sleep', 720], ['blink', 420]],   ms: 2000 },
  rate:     { seq: [['star', 380], ['star2', 320]],    ms: 1800 },
  like:     { seq: [['yes', 520], ['smile', 260]],     ms: 1500 },
  comment:  { seq: [['yes', 420], ['wink', 300]],      ms: 1500 },
  follow:   { seq: [['yes', 420], ['wink', 320]],      ms: 1600 },
  playlist: { seq: [['star', 340], ['yes', 420]],      ms: 1600 },
  // Turning something back OFF. Deliberately small — an undo shouldn't
  // celebrate, it should just acknowledge.
  undo:     { seq: [['blink', 220], ['smile', 440]],   ms: 900 },
};

let _sceneStep = 0, _sceneT = null, _sceneRx = null, _sceneQ = [], _sceneQT = null;

/* One class swap. The dots' own transition does the animating, so this is the
   whole renderer — there is no canvas, no SVG rebuild, and nothing to measure. */
function paintScene(el, frame) {
  const face = el.querySelector('.sd-face');
  if (!face) return;
  face.className = 'sd-face sd-face--' + frame;
}

/* One shared clock paints every face on screen — the viewer shows the dark and
   light shells side by side and two timers would visibly drift apart. */
function sceneTick() {
  clearTimeout(_sceneT);
  let frame, hold;
  if (_sceneRx && Date.now() < _sceneRx.until) {
    [frame, hold] = _sceneRx.seq[_sceneRx.i++ % _sceneRx.seq.length];
  } else {
    _sceneRx = null;
    [frame, hold] = SCENE_LOOP[_sceneStep++ % SCENE_LOOP.length];
  }
  document.querySelectorAll('.sd-scene').forEach(el => paintScene(el, frame));
  _sceneT = setTimeout(sceneTick, Math.max(hold, 120));
}

/* ⚠️ Is the pet actually on screen? The log sheet — where favourite, listen,
   listen-later and the rating all live — covers the scoop COMPLETELY (verified
   by hit-test: elementFromPoint at the scoop's centre returns `.sd-log-song`).
   Reacting there would animate behind the sheet and be seen by nobody, so a
   covered reaction is QUEUED and replayed when the pet comes back into view.
   That is also the better behaviour: you log a record, dismiss the sheet, and
   the pet is waiting to react to what you just did. */
const SCENE_Z = 7;   // .sd-scene's z-index — keep in step with app.css

function sceneVisible() {
  const el = document.querySelector('.sd-scene');
  if (!el) return false;
  const r = el.getBoundingClientRect();
  if (!r.width || !r.height) return false;
  const host = el.closest('.app-screen');
  const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
  if (!top || !host || !host.contains(top)) return false;
  /* ⚠️ Don't test `el.contains(top)` — `.sd-scene` is `pointer-events: none`, so
     the probe always lands on whatever is UNDER it and that test is false even
     on a wide-open home screen. Compare STACKING instead: walk to the shell and
     take the highest z-index on the way. Anything covering the pet has to
     out-stack the nav to do it, so this needs no list of overlay class names —
     measured, the bare home screen tops out at 5 (`.v3-bottom-nav`) and the log
     sheet at 200 (`.sd-log-overlay`). */
  let n = top, z = 0;
  while (n && n !== host) {
    const cs = getComputedStyle(n);
    if (cs.position !== 'static') {
      const v = parseInt(cs.zIndex, 10);
      if (!isNaN(v)) z = Math.max(z, v);
    }
    n = n.parentElement;
  }
  return z <= SCENE_Z;
}

function sceneFlush() {
  if (!_sceneQ.length) return;
  if (!sceneVisible()) {
    // Poll rather than hooking every overlay's close — one 400ms timer that
    // only exists while something is waiting, and it works for any sheet.
    if (!_sceneQT) _sceneQT = setInterval(sceneFlush, 400);
    return;
  }
  clearInterval(_sceneQT); _sceneQT = null;
  const kind = _sceneQ.shift();
  scenePlay(kind);
  // Anything still queued goes after this one finishes, so reactions to a
  // multi-toggle log read as a little sequence instead of all at once.
  if (_sceneQ.length) setTimeout(sceneFlush, (SCENE_REACTIONS[kind] || {}).ms || 1200);
}

function scenePlay(kind) {
  const rx = SCENE_REACTIONS[kind] || SCENE_REACTIONS.music;
  // Re-firing the SAME reaction extends it instead of restarting it — otherwise
  // dragging across the rating track would reset the twinkle on every half-star
  // and the face would never actually animate.
  if (_sceneRx && _sceneRx.seq === rx.seq && Date.now() < _sceneRx.until) {
    _sceneRx.until = Date.now() + rx.ms;
    return;
  }
  _sceneRx = { until: Date.now() + rx.ms, seq: rx.seq, i: 0 };
  sceneTick();                     // cut to it now, don't wait out the current hold
}

/* ══════════════════════════════════════════════════════════════════════════
   SHOP — the Pro showcase (`shopProInit`)
   ══════════════════════════════════════════════════════════════════════════
   The showcase is the REAL compact-state bento — same `bentoHtml()` the home
   screen renders, filled by the same `populateHomeData`. This function only
   adds the one thing Pro contributes: hold the cover, a vertical wheel comes up
   over the art, drag to pick For You or a genre, release and the bento MOVES TO
   THAT SHELF for real — `setMainAlbum` re-tints the box, re-runs the typewriter
   and swaps the art, exactly as it would on the home screen.

   ⚠️ The picker is built HERE, not in `bentoHtml()`. That component is shared
   with the home screen and must stay pristine; the shop is the one that wants
   an overlay, so the shop is what adds it.
   ⚠️ HOLD, not tap. The delay is what separates "open this album" from "change
   shelf" on the real screen, so the demo has to teach the delay too. */
const SHOP_HOLD_MS = 240;   // long enough to read as a hold, short enough not to feel broken
/* ⚠ The drag/selection unit, in px. It is ONE number in TWO files: this, and
   `--pick-h` on `.shop-pick` in app.css (which sizes the rows and centres both
   the lens and the list). The drag counts in whole units of it, so if the two
   disagree the row under the lens stops being the row you get. Change both. */
const SHOP_PICK_H  = 34;

/* Two callers, one wheel:
     shopProInit — the storefront demo. Anyone can hold it, Free included; that
                   is the point of a showcase.
     homeProInit — the real feature, on your own home bento. Pro only.
   `box` is whatever carries `is-armed` and holds the art; `root` is the screen,
   because `setMainAlbum` moves the WHOLE screen to the chosen shelf. */
function shopProInit(root) { proWheelInit(root, root.querySelector('#shopPro')); }

/* ── The shop's aisles (`shopCat`) ────────────────────────────
   Tapping a category writes ONE attribute and lets CSS do the hiding — see the
   `.s-shop[data-cat=...]` block in app.css.

   ⚠ Not a re-render, deliberately. The Pro showcase is a live bento with the
   shelf wheel bound to it (`shopProInit`), and rebuilding the screen to change
   tabs would tear that down and rebuild it four times a browse. It would also
   drop the tiles you had already bought back to their price.

   ⚠ Every shell on stage, not just the one you clicked. Float·Dark and
   Float·Light are the SAME screen in two themes, and a filter that moved on one
   of them would read as two different storefronts standing side by side — the
   same reason the plan switch writes to `body` rather than to a screen.

   ⚠ And back to the top: the aisle you just asked for starts at its first
   shelf, not wherever the last one happened to leave you. */
window.shopCat = function (btn, id) {
  window.SHOP_CAT = id;
  document.querySelectorAll('.s-shop').forEach(scr => {
    scr.setAttribute('data-cat', id);
    scr.querySelectorAll('.shop-cat').forEach(b => {
      const on = b.dataset.go === id;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-selected', on);
    });
    const body = scr.querySelector('.v3-body');
    if (body) body.scrollTop = 0;
  });
};

/* The home bento's cover, once you own Pro. Same wheel, one difference: here
   the cover still has its tap-to-open-album handler, so an armed release has to
   eat the click that follows it (see `suppressClick`). The shop drops that
   handler entirely instead. */
function homeProInit(root) {
  if (!isPro()) return;
  proWheelInit(root, root.querySelector('.v3-bento'), { suppressClick: true, realShelf: true });
}

/* On home the cover is still a link to the album page, and every pointerup is
   followed by a click — so releasing the wheel would change shelf AND navigate
   away from the screen it just changed.

   ⚠ Listen on DOCUMENT, not on the cover. At the TARGET phase the DOM fires
   capture and bubble listeners in the order they were REGISTERED, so a capture
   listener added to `.v3-album` still runs after the `onclick` `setMainAlbum`
   put there first. Only an ancestor's capture listener is guaranteed to go
   first, and `document` is the one ancestor that is always there.

   Self-removing, with a timer in case no click ever arrives (pointercancel,
   a release outside the frame) — otherwise it would sit and eat an innocent
   click much later. */
/* What "move to that shelf" means — and why it differs by host.

   SHOP (showcase) — COSMETIC. `setMainAlbum` swaps the cover, the tint and the
   text on that one bento and nothing else. A storefront demo must not re-deal
   the real home screen sitting behind it.

   HOME (the feature) — REAL. The shelf becomes the QUEUE. `albumSeq()` is built
   from `featuredAlbum` + `trendingAlbums`, and the For You box shows `seq[i+1]`,
   so writing those two globals moves the main cover, the For You box AND every
   album you would swipe into next. Swapping only the main cover (what this used
   to do) left For You and the whole queue on the shelf you just left.

   ⚠ This is `reshuffleHome` scoped to one genre — same two globals, same
   `shuffled` deal. If the deal ever changes there, it changes here too. */
/* One shelf → its albums. The ONLY place that knows what each shelf means, and
   it is called twice: when the wheel is built (to drop any shelf that cannot
   field two albums) and again at commit (so a shelf reflects an ARCHIVE that
   `expandRecs` may have widened in the meantime). */
function shelfPool(shelf) {
  const A = window.ARCHIVE || [];
  switch (shelf.kind) {
    // The unfiltered catalogue — the shelf you are on before you choose one.
    case 'all': return A.slice();
    /* Albums a friend actually logged. `friendRecFor` is the same lookup the
       feed and the bento's friend tag use, so this shelf can never disagree
       with the "… rated this" line that shows up on the cover. */
    case 'friends': return A.filter(a => window.friendRecFor && window.friendRecFor(a));
    /* Charted off the review counts already in the catalogue — no new data, and
       it stays true as the archive grows. */
    case 'popular': return A.slice()
                            .sort((x, y) => (y.reviewCount || 0) - (x.reviewCount || 0))
                            .slice(0, 20);
    /* Several primary genres at once — Pro's mix dial.
       ⚠ The dial's labels are an EDITORIAL list (`SD_GENRES` in screens.js), NOT
       read back out of the archive the way the wheel's rows are — so they have
       to be matched loosely or they match nothing. This was an exact,
       case-sensitive compare, and the archive writes `Hip-hop` where the dial
       says `Hip-Hop`: the single biggest genre in the catalogue (38 albums)
       scored ZERO, so the hub read "0 albums" and the button stayed dead.
       Lowercased containment fixes the casing and folds the compound names in
       with it, which is what a broad genre shelf is supposed to mean —
       `Indie` takes Indie rock / Indie pop / Indie Folk, `Rock` takes
       Alternative rock / Art rock / Noise rock / J-rock, `Soul` takes Neo-soul
       and Electronic soul. `Pop` deliberately also takes K-Pop and Hyperpop.
       ⚠ An album can now match SEVERAL picked genres, so the old note that "an
       album has ONE primary genre, so it can match at most one member" no
       longer holds — but `filter` visits each album exactly once, so the pool
       still cannot contain a duplicate. Don't rewrite this as a pass per genre
       that concatenates the results: that one can. */
    case 'mix': {
      const want = (shelf.genres || []).map(g => String(g).toLowerCase());
      if (!want.length) return [];
      return A.filter(a => {
        const p = String(a.genre || '').split('/')[0].trim().toLowerCase();
        return !!p && want.some(w => p.includes(w));
      });
    }
    // Primary genre only — the part before the `/`.
    default: return A.filter(a => String(a.genre || '').split('/')[0].trim() === shelf.label);
  }
}

function commitShelf(shelf) {
  const pool = shelfPool(shelf);
  if (pool.length < 2) return;      // belt and braces; the wheel already filters these out
  const order = shuffled(pool);
  window.featuredAlbum  = order[0];
  window.trendingAlbums = order.slice(1);
  window.activeAlbum    = window.featuredAlbum;
  /* EVERY home shell, not just the one being held. The queue is global, so
     leaving the other variant on the old shelf would be two phones on stage
     disagreeing about the same state — the same reason `toggleHand` iterates.
     The shop is excluded: its bento is the demo, and it runs on its own. */
  document.querySelectorAll('.s-home-v3:not(.s-shop)').forEach(el =>
    applyAlbumIndex(el, 0, true, true));
}

function eatNextClick(el) {
  const stop = e => {
    clearTimeout(t);
    document.removeEventListener('click', stop, true);
    if (el.contains(e.target) || e.target === el) { e.stopPropagation(); e.preventDefault(); }
  };
  const t = setTimeout(() => document.removeEventListener('click', stop, true), 400);
  document.addEventListener('click', stop, true);
}

function proWheelInit(root, box, opts) {
  opts = opts || {};
  if (!box || box._wired) return;
  const album = box.querySelector('.v3-album');
  if (!album) return;             // bento not built yet — a later repaint will catch it
  box._wired = true;

  /* The wheel's drag is VERTICAL, so it needs the one gesture the swipe leaves
     to the page: `touch-action: none` takes both axes.
     ⚠ A CLASS, not an inline write. This and `setupAlbumSwipe` both want a say
     over the same element, and two inline writes can only ever resolve by who
     ran last — which also meant no rule in app.css could win, whichever way it
     was aimed. As a class it is ordinary specificity, so the album page can
     out-specify both and hand the finger back to the page. */
  album.classList.add('v3-album--wheel');

  /* Shelves are read from the catalogue, not invented: primary genre only (the
     part before the '/'), first album in that genre stands for it, For You
     pinned first and carrying whatever the bento is already showing. */
  /* The three ways of cutting the WHOLE catalogue, and then the door to the
     dial. Broad → narrow, as before.

     ⚠️ THE GENRE ROWS ARE GONE FROM THE WHEEL. It used to list the archive's
     first eight genres here, which was the only way to pick one before the mix
     dial existed. Now that the dial is the place genres are chosen, keeping a
     second flat list of them meant two controls for one job that could not
     agree: the wheel offered eight bare labels read off the catalogue, the
     dial offers sixteen families and 236 subgenres and can combine them. One
     of the two had to go, and it is the one that cannot express a mix.
     ⚠️ `shelfPool`'s `genre` branch (the `default:` case) is deliberately left
     in place — the shop's cosmetic commit still resolves shelves by label, and
     it is the fallback for any shelf kind that has no branch of its own. */
  const all = [{ label: 'For You',     kind: 'all' },
               { label: 'Friends',     kind: 'friends' },
               { label: 'Popular USA', kind: 'popular' }];

  /* ⚠ A shelf you cannot swipe is not a shelf. Anything that cannot field two
     albums is dropped HERE, at build time, so it never appears — rather than
     appearing and then doing nothing when you release on it. Friends is the one
     that really needs this: it depends on who the persona follows. */
  const shelves = all.filter(sh => shelfPool(sh).length >= 2);
  shelves.forEach(sh => {
    const pool = shelfPool(sh);
    sh.album = pool[0] || null;   // the shop's cosmetic commit needs one album per shelf
    sh.count = pool.length;       // and the wheel prints it, see below
  });
  /* The last row is the way OUT of the wheel and into the mix dial, so it is
     appended AFTER the two-album filter — it has no pool of its own to pass it.
     ⚠ Only on the real home. The shop's showcase commits cosmetically to one
     bento, and a sheet sliding up over the storefront to change a demo would be
     the demo reaching out of its case.
     ⚠️ IT IS CALLED "Genre", not "Custom mix". With the flat genre rows gone
     this is the only genre control there is, so it should be named for what it
     gives you rather than for the shape of the thing behind it — "Custom mix"
     described the dial, which you have not seen yet at the moment you are
     reading the row. */
  if (opts.realShelf) shelves.push({ label: 'Genre', kind: 'mix-open', count: '+' });

  const wheel = document.createElement('div');
  wheel.className = 'shop-pick';
  wheel.setAttribute('aria-hidden', 'true');
  /* Four layers, painted in DOM order: a blurred copy of the cover, a dark
     wash over it, then the lens and the list. See the CSS for why the blur is
     a real layer and not `backdrop-filter`. */
  wheel.innerHTML =
    `<span class="shop-pick-bg"></span>` +
    `<span class="shop-pick-tint"></span>` +
    `<span class="shop-pick-lens"></span><ul class="shop-pick-list">${
      shelves.map((s, i) => `<li class="shop-pick-i${i === 0 ? ' is-on' : ''}">` +
        /* The count is the "how much of me is this" number: For You is the whole
           catalogue, a genre is your slice of it, so reading down the wheel
           tells you where your listening actually sits. It is set in the serif
           against the labels' DM Sans — a different voice, so it reads as an
           annotation on the list rather than part of a label. */
        `<span class="shop-pick-n">${s.count}</span>` +
        `<span class="shop-pick-l">${s.label}</span></li>`).join('')}</ul>`;
  album.appendChild(wheel);
  const list  = wheel.querySelector('.shop-pick-list');
  const items = [...wheel.querySelectorAll('.shop-pick-i')];
  const bg    = wheel.querySelector('.shop-pick-bg');

  /* Copied on every arm, not once at wire time — the cover under the wheel
     changes with every swipe and every shelf commit, and a blur of the album
     you were looking at three swipes ago is worse than no blur at all.
     `sdCover` writes the url to `style.backgroundImage`, so that is where it
     is read from. */
  const syncBg = () => { if (bg) bg.style.backgroundImage = album.style.backgroundImage; };

  /* ⚠ The finger is measured in RENDERED px; the list is moved in CSS px. On
     the home screen those are the same number. They are NOT in the shop, where
     the whole model is `transform: scale()`d — nor anywhere when the desktop
     viewer is zoomed. `paint()` moves the list from INSIDE the scaled box, so
     it keeps `SHOP_PICK_H`; the drag happens outside it, so it counts in what a
     row actually measures on screen. The wheel only has `opacity: 0` when
     idle, never `display: none`, so this measures correctly before the arm. */
  const rowPx = () => (items[0] && items[0].getBoundingClientRect().height) || SHOP_PICK_H;

  let idx = 0, startIdx = 0, startY = 0, holdT = null, armed = false;

  // The list slides so the chosen row sits under the lens, which is centred on
  // the art — that is what makes it read as a wheel rather than a menu.
  function paint() {
    list.style.transform = `translateY(${-idx * SHOP_PICK_H}px)`;
    items.forEach((el, i) => el.classList.toggle('is-on', i === idx));
  }
  /* The shelf the bento is actually ON. ⚠ Releasing on the shelf you are
     already on must do NOTHING — a hold that ends where it started is a
     cancelled gesture, and re-dealing there would throw away the album you were
     looking at for no reason the user can see. */
  let liveIdx = 0;

  function commit() {
    const shelf = shelves[idx];
    /* Checked BEFORE the no-op guard: releasing on this row is a request to
       open the dial, and it stays a request the second and third time. It also
       never becomes `liveIdx` — the wheel has not moved shelf, it has handed
       over to something that will. */
    if (shelf && shelf.kind === 'mix-open') { openMixDial(root); return; }
    if (idx === liveIdx) return;
    liveIdx = idx;
    if (opts.realShelf) { commitShelf(shelf); return; }
    const a = shelf.album;
    if (a) setMainAlbum(root, a, true);   // showcase: this one cover, cosmetically
  }
  function disarm() {
    clearTimeout(holdT); holdT = null;
    if (!armed) return;
    armed = false;
    window._sdHold = false;           // the pull may have the axis back
    box.classList.remove('is-armed');
    if (opts.suppressClick) eatNextClick(album);
    commit();
  }

  /* ⚠️ TWO GESTURES SHARE THE COVER'S VERTICAL AXIS (Eric, 2026-09-14): the
     hold-to-open-the-wheel here, and pull-to-refresh (`sdPtr*`, delegated at
     the document). They used to fire into each other both ways —
       · a finger dragging DOWN to refresh, still on the cover 240ms later,
         armed the wheel under it (the hold timer never looked at movement);
       · once the wheel WAS open, dragging the list was also a pull, so
         picking a shelf translated the body and re-dealt the feed.
     The rules now: a finger that MOVES before the timer fires is scrolling
     or pulling, not holding — HOLD_SLOP cancels the timer. And the moment
     the wheel arms it takes the axis: `_sdHold` is read by every pull
     handler (start, move, and the touchmove guard), and any pull already
     in flight is dropped (`_ptr = null`). */
  const HOLD_SLOP = 8;
  let startX = 0;
  album.addEventListener('pointerdown', e => {
    if (!bentoGesturesOn(root)) return;   // album page: no shelf wheel over the header
    if (e.button != null && e.button > 0) return;
    if (typeof _ptr !== 'undefined' && _ptr && _ptr.active) return;   // a pull is already going
    startX = e.clientX; startY = e.clientY; startIdx = idx;
    holdT = setTimeout(() => {
      holdT = null;
      armed = true;
      window._sdHold = true;
      if (typeof _ptr !== 'undefined') _ptr = null;   // whatever pull was pending is not happening
      syncBg();                       // blur the cover that is actually under the finger
      box.classList.add('is-armed');
      album.setPointerCapture?.(e.pointerId);
    }, SHOP_HOLD_MS);
  });
  // Before the arm: movement means it is not a hold.
  album.addEventListener('pointermove', e => {
    if (armed || !holdT) return;
    if (Math.abs(e.clientX - startX) > HOLD_SLOP || Math.abs(e.clientY - startY) > HOLD_SLOP) {
      clearTimeout(holdT); holdT = null;
    }
  });
  album.addEventListener('pointermove', e => {
    if (!armed) return;
    e.preventDefault(); e.stopPropagation();   // this drag is ours, not the album swipe's
    // Drag DOWN moves down the list, so the row you pull toward the lens is the
    // one you get — matching how the list itself travels.
    const next = Math.max(0, Math.min(items.length - 1,
      Math.round(startIdx + (e.clientY - startY) / rowPx())));
    if (next !== idx) { idx = next; paint(); }
  }, true);
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev =>
    album.addEventListener(ev, disarm));
  // Android's long-press menu would land exactly when the wheel arms.
  album.addEventListener('contextmenu', e => { if (bentoGesturesOn(root)) e.preventDefault(); });

  paint();
}

/* ═══════════════════════════════════════════════════════════════════════
   CUSTOMISE A PLAYLIST (`openPlCustomize`)
   ═══════════════════════════════════════════════════════════════════════
   The sheet behind the ⋯ on your own playlist cards: pin up to PL_BADGE_MAX
   badges. Reuses `.sd-log-overlay`'s geometry and mounting so there is one
   bottom-sheet behaviour in the app rather than two.

   ⚠️ BADGES ONLY. This briefly also picked between five card themes; the themes
   are gone (see the card block in app.css — a wall of different shapes reads as
   a mess) and the card is fixed for everyone. Badges survive because they are
   small, they sit in a slot the design reserves for them, and no arrangement of
   them can make the wall look broken.
   ⚠️ WRITES THROUGH IMMEDIATELY. No Save button, the same as the log sheet and
   the dev box: every tap lands in `plSetCustom` and re-renders the wall behind
   the sheet, so you choose against the real card rather than a preview.
   ⚠️ EVERYTHING IS UNLOCKED and there is no ownership check to add back — these
   were briefly sold, and charging for how a user dresses their own work turns it
   into a tier list. Every playlist has the same editability. */
/* `light` remembers WHICH shell the sheet was opened from. Dark and Light are
   two separate screen elements, and every change re-renders both — without this
   the sheet would re-mount onto whichever one `querySelector` happened to reach
   first and could jump variants mid-edit. */
const PLC = { name: null, light: false };

// The `.s-pl2` matching the shell the sheet belongs to.
function plcHost() {
  const sel = PLC.light ? '.s-pl2.s-home-v3--light' : '.s-pl2:not(.s-home-v3--light)';
  return document.querySelector(sel) || document.querySelector('.s-pl2')
      || document.querySelector('.app-screen');
}

function ensurePlcSheet() {
  let ov = document.getElementById('plc');
  if (ov) return ov;
  ov = document.createElement('div');
  ov.id = 'plc';
  ov.className = 'sd-log-overlay plc-overlay';
  ov.innerHTML = `
    <div class="plc-sheet" role="dialog" aria-modal="true">
      <div class="sd-log-grab"></div>
      <div class="plc-head">
        <div class="plc-cover"></div>
        <div class="plc-head-txt">
          <div class="plc-title"></div>
          <div class="plc-sub">Make it yours</div>
        </div>
        <button class="plc-x" aria-label="Close">✕</button>
      </div>
      <div class="plc-sec-hd">Badges<span>up to ${PL_BADGE_MAX}</span></div>
      <div class="plc-badges"></div>
      <p class="plc-note">Badges are free — pin whichever fit the list.</p>
    </div>`;

  ov.addEventListener('click', e => { if (e.target === ov) closePlCustomize(); });
  ov.querySelector('.plc-x').addEventListener('click', closePlCustomize);
  wireSheetGrab(ov, '.plc-sheet', closePlCustomize);
  return ov;
}

/* The playlist as it stands right now. Re-read on every paint rather than held,
   because each change re-renders the wall and re-deals `plLists()`.
   ⚠️ Matched on `key`, the stable original name — not on the displayed name,
   which the editor can change. `name` is kept as a fallback only for callers
   that predate the key. */
function plcCurrent() {
  return (plLists().find(l => l.key === PLC.name || l.name === PLC.name)) || null;
}

function plcPaint() {
  const ov = document.getElementById('plc');
  const pl = plcCurrent();
  if (!ov || !pl) return;

  ov.querySelector('.plc-title').textContent = pl.name;
  ov.querySelector('.plc-cover').style.backgroundImage = `url('${pl.image}')`;

  const badges = pl.badges || [];
  ov.querySelector('.plc-badges').innerHTML = PL_BADGES.map(b => `
            <button class="plc-badge${badges.indexOf(b.id) !== -1 ? ' is-on' : ''}" data-badge="${b.id}">
              <span class="pl2-badge pl2-badge--${b.id}">${SD_ICONS[b.id] || ''}</span>
              <span class="plc-badge-name">${b.name}</span>
            </button>`).join('');

  ov.querySelectorAll('.plc-badge').forEach(el =>
    el.addEventListener('click', () => plcToggleBadge(el.dataset.badge)));
}

function plcToggleBadge(id) {
  const pl = plcCurrent();
  if (!pl) return;
  const list = (pl.badges || []).slice();
  const i = list.indexOf(id);
  if (i !== -1) { list.splice(i, 1); }
  else {
    if (list.length >= PL_BADGE_MAX) return;   // the cap is the design; see PL_BADGES
    list.push(id);
  }
  plSetCustom(pl.key || PLC.name, { badges: list });
  plcApply();
}

/* Re-render the wall UNDER the open sheet, then repaint the sheet.
   ⚠️ `renderViewer` rebuilds the screens from scratch, which throws away the
   overlay we are standing in — so it has to be re-mounted and re-opened after,
   and the `open` class re-applied on the next frame or the transition replays
   from the bottom every time you tap a badge. */
function plcApply() {
  renderViewer();
  requestAnimationFrame(() => {
    const host = plcHost();
    const ov = ensurePlcSheet();
    if (host) host.appendChild(ov);
    ov.classList.add('open');
    plcPaint();
  });
}

window.openPlCustomize = function (name, triggerEl) {
  PLC.name = name;
  const scr = triggerEl && triggerEl.closest && triggerEl.closest('.app-screen');
  PLC.light = !!(scr && scr.classList.contains('s-home-v3--light'));
  const host = scr || plcHost();
  const ov = ensurePlcSheet();
  if (host) host.appendChild(ov);
  plcPaint();
  requestAnimationFrame(() => ov.classList.add('open'));
};

function closePlCustomize() {
  const ov = document.getElementById('plc');
  if (ov) ov.classList.remove('open');
}

/* Shop — placeholder purchase. There is no cart, no price total and no
   payment: the button becomes the state it would have bought. Enough to show
   what owning something looks like without pretending to charge for it. */
/* ══ THE PROFILE SKIN — the card's colour and the page behind it ═══════════
   Two things the owner picks, and each is TWO decisions: an RGB value and a
   LIGHTNESS. They are separate controls on purpose — "what colour" and "how
   dark" are not the same question, and folding them into one picker means every
   change of hue throws away the depth you had already settled on. The slider
   mixes the picked colour toward black or white, so the hue survives it.

   ⚠ Only `--pf-base` (the card) and `--sd-bg` (the page) are PICKED. Everything
   else here is DERIVED, because a colour system where the user sets ten tokens
   by hand is a colour system where nine of them end up unreadable. The ink is
   chosen by luminance against whatever the surface turned out to be, which is
   the whole reason you can pick a near-white card in dark mode and still read
   your own bio.

   ⚠ `--pf-lt` / `--pf-dk` (the emboss) are deliberately NOT derived. They are
   rgba white and black, so they already work over any base — the card keeps its
   embossed edge whatever colour it becomes.
   ─────────────────────────────────────────────────────────────────────────── */
function sdRgb(hex) {
  const h = String(hex || '').replace('#', '');
  const n = h.length === 3 ? h.split('').map(x => x + x).join('') : h;
  const v = parseInt(n, 16);
  return isNaN(v) || n.length !== 6
    ? null
    : { r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255 };
}
/* Mix toward white (l > 0) or black (l < 0). ⚠ A straight multiply would drag
   everything toward black and desaturate on the way up; mixing against a target
   keeps the hue where the user put it at both ends of the slider. */
function sdMix(c, l) {
  const t = Math.max(-100, Math.min(100, l || 0)) / 100;
  const to = t >= 0 ? 255 : 0;
  const k = Math.abs(t);
  return { r: Math.round(c.r + (to - c.r) * k),
           g: Math.round(c.g + (to - c.g) * k),
           b: Math.round(c.b + (to - c.b) * k) };
}
const sdCss = c => 'rgb(' + c.r + ',' + c.g + ',' + c.b + ')';
const sdCssA = (c, a) => 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + a + ')';
/* Perceived brightness (ITU-R BT.601). Good enough to answer the only question
   asked of it: does black or white read on this? */
const sdLum = c => (c.r * 299 + c.g * 587 + c.b * 114) / 255000;
const sdInk = c => sdLum(c) > 0.56 ? { r: 22, g: 19, b: 13 } : { r: 255, g: 255, b: 255 };

/* The inline style for a skinned profile screen, or '' when the owner has not
   picked anything — an unset skin must leave the theme's own tokens completely
   alone rather than re-stating them. */
window.profSkinCss = function (P) {
  const S = P && P.skin;
  if (!S) return '';
  const out = [];
  const card = S.card && sdRgb(S.card);
  if (card) {
    const c = sdMix(card, S.cardL);
    const ink = sdInk(c);
    out.push('--pf-base:' + sdCss(c));
    // The recessed inner face reads as a hollow in the card, so it steps AWAY
    // from the light: darker on a light card, lighter on a dark one.
    out.push('--pf-face:' + sdCss(sdMix(c, sdLum(c) > 0.5 ? -10 : 12)));
    out.push('--pf-ink:' + sdCss(ink));
    out.push('--pf-ink2:' + sdCssA(ink, 0.6));
    out.push('--pf-edge:' + sdCssA(sdInk(c), 0.32));
  }
  const bg = S.bg && sdRgb(S.bg);
  if (bg) {
    const c = sdMix(bg, S.bgL);
    const ink = sdInk(c);
    out.push('--sd-bg:' + sdCss(c));
    out.push('--pf-fg:' + sdCss(ink));
    out.push('--pf-fg2:' + sdCssA(ink, 0.55));
    out.push('--pf-border:' + sdCssA(ink, 0.14));
    // ⚠ The username pill IS the screen background — that is what seats it in
    // the banner. Its ink has to follow the page, not the card.
    out.push('--pf-slot:' + sdCss(c));
    out.push('--pf-slot-ink:' + sdCss(ink));
    out.push('--pf-slot-ink2:' + sdCssA(ink, 0.55));
  }
  return out.join(';');
};

/* Live-edit. ⚠ Writes the variables straight onto every profile screen in the
   DOM rather than re-rendering: a colour input dragged through a gradient fires
   `input` on every frame, and a re-render per frame would both stutter and hand
   the user a fresh element mid-drag. Same rule as `pfeditField` and
   `profTagSync` — patch by hand, never re-render under a live control. */
window.profSkinSet = function (key, value) {
  const D = pfeditDraft();
  if (!D.skin) D.skin = {};
  D.skin[key] = (key === 'cardL' || key === 'bgL') ? Number(value) : value;
  profSkinApply();
};
/* Clear one half of the skin back to the theme's own colours. */
window.profSkinClear = function (which) {
  const D = pfeditDraft();
  if (!D.skin) return;
  delete D.skin[which];
  delete D.skin[which + 'L'];
  if (!D.skin.card && !D.skin.bg) D.skin = null;
  renderViewer();               // safe here: a reset is a click, not a drag
};
/* ⚠ `.s-prof2`, NOT `.s-pfedit`. The viewer can have the profile and the edit
   page on stage at once (multi view, and both variants of each), and a skin that
   only reached the form meant the card you were colouring sat there in the old
   colour while you dragged. The preview needs nothing from here — it inherits
   the same variables — but the real card does.
   ⚠ setAttribute, not per-property writes: clearing half the skin has to REMOVE
   the variables it set, and `style.foo = ''` one at a time leaves whatever the
   new string no longer mentions. These screens carry no other inline style,
   which is what makes that safe. */
function profSkinApply() {
  const css = profSkinCss(pfeditDraft());
  document.querySelectorAll('.s-prof2').forEach(el => el.setAttribute('style', css));
}

/* Tags you own, for THIS SESSION only.
   ⚠ Deliberately not persisted. The storefront's own note says nothing is
   charged and nothing is kept, and a prototype that quietly remembers purchases
   across reloads is lying about that. The free tags are not listed here — they
   are owned by definition (anything in SD_TAGS without a `price`). */
window.SD_TAG_OWNED = [];
window.sdOwnsTag = function (id) {
  const t = (window.SD_TAGS || []).find(x => x.id === id);
  return !!t && (!t.price || SD_TAG_OWNED.indexOf(id) >= 0);
};
/* ⚠ Seeded from what the signed-in profile is already WEARING — you cannot own
   less than you have on, and without this the shop would offer to sell you a tag
   that is visible on your own page. Runs from `init()` before the first render,
   same slot as `initPlan`. */
function initTags() {
  ((window.PROFILE && window.PROFILE.tags) || []).forEach(id => {
    if (SD_TAG_OWNED.indexOf(id) < 0) SD_TAG_OWNED.push(id);
  });
}

window.sdBuy = function (btn) {
  if (!btn || btn.disabled) return;
  /* ⚠ A tag is the one purchase here that has to be RECORDED, not just
     acknowledged: it turns up in the picker on the edit page afterwards. The
     label swap below still runs — the storefront behaves the same, it just
     means something now. */
  if (btn.dataset && btn.dataset.tag && SD_TAG_OWNED.indexOf(btn.dataset.tag) < 0) {
    SD_TAG_OWNED.push(btn.dataset.tag);
  }
  /* ⚠ Pro is not a purchase, it is the PLAN. Everything else in here changes
     one button; Pro changes what the whole app renders as, so it routes through
     `setPlan` — which re-renders the screen, and brings this row back already
     reading "Active" from `shopHtml`. Nothing to swap in by hand. */
  if (btn.classList.contains('shop-pro-btn')) { setPlan(true); return; }
  /* A skin goes on the bento the moment it is bought — and the tile becomes a
     Wear/Wearing toggle, which is markup `shopHtml` owns, so re-render the way
     Pro does rather than swapping in an "Owned" pill that could never take it
     off again. */
  if (btn.dataset && btn.dataset.skin) { buyBentoSkin(btn.dataset.skin); renderViewer(); return; }
  const owned = document.createElement('span');
  owned.className = 'shop-owned shop-owned--new';   // --new = start transparent, fade in below
  /* ⚠ The word is the TILE's to choose. Everything cosmetic in here becomes
     "Owned", but a ticket is not a thing you own, it is a night you are Going
     to — and a storefront that told you you now own Berghain would be reading
     as a bug. `data-owned` on the button, 'Owned' when it says nothing. */
  owned.textContent = btn.dataset.owned || 'Owned';
  btn.replaceWith(owned);
  requestAnimationFrame(() => owned.classList.add('is-in'));
};

/* The one entry point. Call it from anywhere the user does a thing. */
window.sceneReact = function (kind) {
  if (!SCENE_REACTIONS[kind]) return;
  /* ⚠️ The pet is PARKED (screens.js `SD_PET_ENABLED`) — the nav scoop holds the
     shop button instead, so nothing carries `.sd-scene`. Bail before the queue:
     with no pet to flush to, `sceneFlush`'s 400ms interval would start on the
     first reaction and tick forever. */
  if (!document.querySelector('.sd-scene')) return;
  if (!sceneVisible()) {
    if (_sceneQ[_sceneQ.length - 1] !== kind) _sceneQ.push(kind);
    if (_sceneQ.length > 3) _sceneQ.shift();   // a queue, not a parade
    if (!_sceneQT) _sceneQT = setInterval(sceneFlush, 400);
    return;
  }
  scenePlay(kind);
};
/* Legacy name — reactRing still calls this for swipe / CD / For You. */
window.sceneCheer = function () { sceneReact('music'); };

/* ══════════════════════════════════════════════════════════════════════════
   PET BOX — every reaction the pet can play, looping, with what fires it
   ══════════════════════════════════════════════════════════════════════════
   Desktop viewer only, behind the toolbar's ☺ Pet button. Each cell runs the
   REAL `SCENE_REACTIONS` sequence rather than a still, because these reactions
   only read as themselves in motion — a single frame of `music` is six bars at
   arbitrary heights and tells you nothing.
   ⚠️ Cells must not carry `.sd-scene`: `sceneTick` repaints everything with
   that class, so a preview wearing it gets stamped with the live frame and the
   grid collapses to one pose. Found the hard way. */
const PET_TRIGGERS = {
  music:    'album swipe · CD · For You',
  listened: 'log sheet → Listened',
  fav:      'log sheet → Favorite',
  later:    'log sheet → Listen later',
  rate:     'log sheet → rating',
  like:     'thumbs-up a review',
  comment:  'comment on a review',
  follow:   'follow an artist',
  playlist: 'add to a playlist',
  undo:     'un-toggling any of the above',
};
let _petT = null;

function initPetBox() {
  const body = document.getElementById('pet-body');
  if (!body || body._built) return;
  body._built = true;
  const keys = Object.keys(SCENE_REACTIONS);
  body.innerHTML = `<div class="pet-grid">${keys.map(k => `
    <div class="pet-cell" data-k="${k}" title="Play on the phone">
      <div class="pet-stage"><span class="sd-face sd-face--smile">${
        '<i class="sd-face-dot"></i>'.repeat(6)}</span></div>
      <div class="pet-name">${k}</div>
      <div class="pet-trig">${PET_TRIGGERS[k] || ''}</div>
    </div>`).join('')}</div>`;
  // One delegated listener — the grid is rebuilt only once, but this keeps the
  // cells free of inline handlers like the rest of the viewer's panels.
  body.addEventListener('click', e => {
    const cell = e.target.closest('.pet-cell');
    if (cell) sceneReact(cell.dataset.k);
  });
}

/* One clock for the whole grid, stepping each cell through its own sequence.
   Each cell keeps its own index so sequences of different lengths stay in step
   with themselves rather than with each other. */
function petBoxTick() {
  const body = document.getElementById('pet-body');
  if (!body) return;
  body.querySelectorAll('.pet-cell').forEach(cell => {
    const rx = SCENE_REACTIONS[cell.dataset.k];
    if (!rx) return;
    const now = Date.now();
    if (!cell._next || now >= cell._next) {
      const [frame, hold] = rx.seq[(cell._i = (cell._i || 0) + 1) % rx.seq.length];
      cell.querySelector('.sd-face').className = 'sd-face sd-face--' + frame;
      cell._next = now + hold;
    }
  });
  _petT = setTimeout(petBoxTick, 90);
}

window.togglePetBox = function () {
  const box = document.getElementById('petbox');
  if (!box) return;
  const open = box.hidden;
  box.hidden = !open;
  document.getElementById('btn-petbox')?.classList.toggle('on', open);
  if (open) { initPetBox(); clearTimeout(_petT); petBoxTick(); }
  else { clearTimeout(_petT); _petT = null; }   // costs nothing while closed
};

function initScenes() {
  const els = document.querySelectorAll('.sd-scene');
  if (!els.length) return;
  els.forEach(el => paintScene(el, 'smile'));   // never a blank box
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!_sceneT) sceneTick();
}

// ── Now-playing ticker: what friends are listening to right now ──
const NOW_WAVE_BARS = 5;

// Build the colorful waveform once per bar (structure is static; CSS animates it).
function buildNowWave(waveEl) {
  if (!waveEl || waveEl._built) return;
  waveEl._built = true;
  let html = '';
  for (let i = 0; i < NOW_WAVE_BARS; i++) {
    const delay = (i * 0.06).toFixed(2);
    const dur = (0.7 + (i % 5) * 0.13).toFixed(2);
    html += `<span class="v3-now-bar" style="animation-delay:${delay}s;animation-duration:${dur}s"></span>`;
  }
  waveEl.innerHTML = html;
}

// A shuffled handful of friends "currently listening" — song title is generated
// deterministically from the album (no real per-song data; mirrors songsFor()).
function nowFriends() {
  const src = window.FRIEND_ACTIVITY || [];
  return [...src].sort(() => Math.random() - 0.5).slice(0, 4).map(f => ({
    name: f.user,
    song: (songsFor({ album: f.album, tracks: 10 })[0] || {}).title || 'Untitled',
    album: f.album,
    artist: f.artist,
  }));
}

function paintNow(textEl, item) {
  if (!textEl || !item) return;
  textEl.innerHTML =
    `<span class="v3-now-name">${item.name}</span>` +
    `<span class="v3-now-song">${item.song}</span>` +
    `<span class="v3-now-album">${item.album}</span>` +
    `<span class="v3-now-artist">${item.artist}</span>`;
  fitNowText(textEl);
}

// Grow the ticker text to fill the pill when the names are short: bump font-size
// (and raise opsz alongside it) until the line nearly spans the available width.
// Long entries stay at the base size and just condense/ellipsize as before.
function fitNowText(textEl) {
  const MIN = 11.5, MAX = 16;
  const avail = textEl.clientWidth;
  if (!avail) return;                        // hidden instance — leave at base size
  let size = MIN;
  textEl.style.fontSize = size + 'px';
  while (size < MAX && textEl.scrollWidth < avail - 2) {
    size += 0.5;
    textEl.style.fontSize = size + 'px';
  }
  if (textEl.scrollWidth > avail && size > MIN) {
    size -= 0.5;
    textEl.style.fontSize = size + 'px';
  }
  const opsz = Math.max(25, Math.min(48, Math.round(size * 2.6)));
  textEl.style.fontVariationSettings = `'wdth' 25, 'opsz' ${opsz}`;
}

/* ══════════════════════════════════════════════════════════════════════════
   THE FRIENDS PANEL — where a ticker tap goes (`openFriends` · `closeFriends`)
   ══════════════════════════════════════════════════════════════════════════
   The console's twin: `.s-home-v3--friends` grows the hump to half the screen
   and `.v3-friends` (inside the nav, see bottomNav) fills with everyone in
   FRIEND_ACTIVITY and the song they are on. It closes on the chevron, a scroll
   of the page, or a touch anywhere outside the panel — same arming/tear-down
   pattern as consoleArmDismiss, on the SCREEN rather than the bento because the
   panel stands over the page and any touch off it should put it away. The two
   humps are exclusive: opening one closes the other. */
function friendsNowList() {
  return (window.FRIEND_ACTIVITY || []).map(f => ({
    name: f.user, init: f.init || (f.user || '?')[0].toUpperCase(), grad: f.grad || '',
    song: (songsFor({ album: f.album, tracks: 10 })[0] || {}).title || 'Untitled',
    album: f.album, artist: f.artist,
  }));
}
function friendRowHtml(f) {
  const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const arg = String(f.name || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  return `
    <button class="v3-fr-row" type="button" onclick="event.stopPropagation(); closeFriends(this); openFriendProfile('${arg}')">
      <span class="v3-fr-av" style="background:${esc(f.grad)}">${esc(f.init)}</span>
      <span class="v3-fr-txt">
        <span class="v3-fr-name">${esc(f.name)}</span>
        <span class="v3-fr-line"><span class="v3-fr-song">${esc(f.song)}</span><span class="v3-fr-sep">·</span><span class="v3-fr-album">${esc(f.album)}</span><span class="v3-fr-sep">·</span><span class="v3-fr-artist">${esc(f.artist)}</span></span>
      </span>
      <span class="v3-now-wave v3-fr-wave" aria-hidden="true"></span>
    </button>`;
}
window.openFriends = function (scr) {
  if (!scr) return;
  window.closeConsole(scr);
  const box = scr.querySelector('.v3-friends');
  if (!box) return;
  const list = box.querySelector('.v3-fr-list');
  if (list) {
    list.innerHTML = friendsNowList().map(friendRowHtml).join('');
    list.querySelectorAll('.v3-now-wave').forEach(buildNowWave);
    list.scrollTop = 0;
  }
  box.setAttribute('aria-hidden', 'false');
  scr.classList.add('s-home-v3--friends');
  friendsArmDismiss(scr);
};
window.closeFriends = function (elOrScreen) {
  const scr = (elOrScreen && elOrScreen.closest)
    ? elOrScreen.closest('.s-home-v3') : elOrScreen;
  if (!scr || !scr.classList.contains('s-home-v3--friends')) return;
  scr.classList.remove('s-home-v3--friends');
  const box = scr.querySelector('.v3-friends');
  if (box) box.setAttribute('aria-hidden', 'true');
  if (scr._friendsOff) { scr._friendsOff(); scr._friendsOff = null; }
};
function friendsArmDismiss(scr) {
  if (scr._friendsOff) scr._friendsOff();
  const body = scr.querySelector('.v3-body');
  const bye = () => window.closeFriends(scr);
  /* A touch inside the panel is a row, the chevron, or a scroll of the list;
     none of those is "outside". Capture, because the bento's children stop
     propagation on their own handlers. */
  const onDown = (ev) => { if (!ev.target.closest('.v3-friends')) bye(); };
  if (body) body.addEventListener('scroll', bye, { passive: true });
  scr.addEventListener('pointerdown', onDown, true);
  scr._friendsOff = () => {
    if (body) body.removeEventListener('scroll', bye, { passive: true });
    scr.removeEventListener('pointerdown', onDown, true);
  };
}

/* How long a friend holds the bar. It is also a READING window, not just a
   ticker interval — the bar is now a tap target, so it has to sit still long
   enough to notice a name, decide, and reach it. 4.2s was tuned for something
   you only glance at. */
const NOW_SWAP_MS = 10000;

function renderNowBar(screenEl) {
  const bar = screenEl.querySelector('.v3-nowbar');
  if (!bar) return;
  const textEl = bar.querySelector('.v3-now-text');
  const waveEl = bar.querySelector('.v3-now-wave');
  buildNowWave(waveEl);

  const list = nowFriends();
  if (!list.length) return;

  if (screenEl._nowTimer) { clearInterval(screenEl._nowTimer); screenEl._nowTimer = null; }
  let i = 0;
  paintNow(textEl, list[i]);
  bar._nowItem = list[i];

  /* The bar opens the FRIENDS PANEL (openFriends) — the hump grows and lists
     everyone listening, and a row is what opens a profile. It used to jump
     straight to whoever was on the bar, which meant tapping a name you had
     half-read as it swapped out from under you. `bar._nowItem` is still kept
     in step for anything else that wants the person on the bar. */
  if (!bar._tapWired) {
    bar._tapWired = true;
    bar.addEventListener('click', (e) => {
      e.stopPropagation();
      window.openFriends(bar.closest('.s-home-v3'));
    });
  }

  // Shuffle through friends if more than one is listening at once.
  if (list.length > 1) {
    screenEl._nowTimer = setInterval(() => {
      bar.classList.add('is-swapping');            // fade + lift out
      setTimeout(() => {
        i = (i + 1) % list.length;
        paintNow(textEl, list[i]);
        bar._nowItem = list[i];                    // keep the tap target in step
        bar.classList.remove('is-swapping');       // fade back in
      }, 300);
    }, NOW_SWAP_MS);
  }
}

/* ═══════════════════════════════════════════════════════════════════════
   PLAN — Free vs Pro (`isPro()` · `setPlan()` · `renderPlanBar()`)
   ═══════════════════════════════════════════════════════════════════════
   ONE global: which account is looking at the mockup. It is a VIEWER control,
   not an in-app setting — the toolbar switch sits beside the persona switcher
   because it answers the same question (who is looking at this screen), and the
   whole app re-renders as that account.

   ⚠ The gate is `body.sd-pro`, NOT a class per screen. Dark and Light are two
   live phones on stage at once, and the mobile prototype has no toolbar at all
   — one write on `body` covers every shell. CSS gates with `body.sd-pro .x`,
   JS gates with `isPro()`.
   ⚠ Buying Pro in the shop routes through `setPlan(true)`, so the storefront
   and the toolbar can never disagree about what you own. There is one source of
   truth for the plan and this is it. */
const PLAN_KEY = 'spindeck-pro';
let SD_PRO = false;
try { SD_PRO = localStorage.getItem(PLAN_KEY) === '1'; } catch (e) {}
/* A PHONE IS PRO (Eric, 2026-09-18). The mobile prototype has no Free | Pro
   switch, so it was stuck on Free unless you bought Pro in the shop — which is
   why the cover's hold did nothing there and the drag fell through to
   pull-to-refresh. Not persisted: the desktop viewer keeps its own choice.
   `?free` on the URL opts a phone back out. */
if (window.matchMedia('(max-width: 767px)').matches && !/[?&]free/.test(location.search)) SD_PRO = true;

window.isPro = function () { return SD_PRO; };

window.setPlan = function (pro) {
  pro = !!pro;
  if (pro === SD_PRO) return;
  SD_PRO = pro;
  try { localStorage.setItem(PLAN_KEY, SD_PRO ? '1' : '0'); } catch (e) {}
  applyPlanClass();
  renderPlanBar();
  /* Full rebuild, not a patch. Pro changes what screens are MADE OF (the shop's
     pitch row becomes a status row, the home cover grows a gesture) — the same
     reason `applyPersona` re-renders rather than reaching in. */
  renderViewer();
};

// Stamped on `body`, so it survives every screen rebuild without being re-applied.
function applyPlanClass() { document.body.classList.toggle('sd-pro', SD_PRO); }

/* ══ THE BENTO SKIN — OWNED vs WORN ═════════════════════════════════════════
   Same shape as the plan: a body class (`sd-skin-<id>`) so every shell on
   stage wears it at once, kept in localStorage so it survives a reload. The
   artwork itself is in bentoSkinBackHtml / bentoSkinFrontHtml (screens.js);
   this only says which one shows.

   ⚠️ Two facts, two keys. `SD_SKIN` is the one being WORN (or null);
   `SD_SKIN_OWNED` is every skin bought. They used to be the same thing — buying
   Furry put it on and there was no way to take it off short of clearing
   localStorage — which is why the shop tile is now a Wear/Wearing toggle once
   owned, and Settings › Appearance carries the same switch. A skin you have
   taken off is still yours; only `bentoSkinOwned` decides what the shop sells. */
const SKIN_KEY = 'spindeck-skin';
const SKIN_OWNED_KEY = 'spindeck-skin-owned';
const SKIN_IDS = ['furry'];
let SD_SKIN = null;
let SD_SKIN_OWNED = [];
try { SD_SKIN = localStorage.getItem(SKIN_KEY) || null; } catch (e) {}
try { SD_SKIN_OWNED = JSON.parse(localStorage.getItem(SKIN_OWNED_KEY)) || []; } catch (e) {}
if (SKIN_IDS.indexOf(SD_SKIN) < 0) SD_SKIN = null;
SD_SKIN_OWNED = SD_SKIN_OWNED.filter(id => SKIN_IDS.indexOf(id) >= 0);
// Migration: before the split, "worn" implied "owned". Anyone already wearing
// Furry from the old single key keeps it in the wardrobe.
if (SD_SKIN && SD_SKIN_OWNED.indexOf(SD_SKIN) < 0) SD_SKIN_OWNED.push(SD_SKIN);
function applySkinClass() {
  SKIN_IDS.forEach(id => document.body.classList.toggle('sd-skin-' + id, SD_SKIN === id));
}
function saveSkin() {
  try {
    SD_SKIN ? localStorage.setItem(SKIN_KEY, SD_SKIN) : localStorage.removeItem(SKIN_KEY);
    localStorage.setItem(SKIN_OWNED_KEY, JSON.stringify(SD_SKIN_OWNED));
  } catch (e) {}
}
window.bentoSkin      = function () { return SD_SKIN; };
window.bentoSkinOwned = function (id) { return SD_SKIN_OWNED.indexOf(id) >= 0; };
// Wear one (or null = bare bento). Only an owned skin can be worn.
window.setBentoSkin = function (id) {
  SD_SKIN = (SKIN_IDS.indexOf(id) >= 0 && SD_SKIN_OWNED.indexOf(id) >= 0) ? id : null;
  saveSkin();
  applySkinClass();
  syncSkinControls();
};
// Buy = own it AND put it on, so the purchase shows up on the bento straight away.
window.buyBentoSkin = function (id) {
  if (SKIN_IDS.indexOf(id) < 0) return;
  if (SD_SKIN_OWNED.indexOf(id) < 0) SD_SKIN_OWNED.push(id);
  setBentoSkin(id);
};
window.toggleBentoSkin = function (id) { setBentoSkin(SD_SKIN === id ? null : id); };
/* Every control that shows the worn state, in every shell on stage (Dark and
   Light render side by side, and the shop tile and the Settings switch both
   exist). Patched in place rather than re-rendering, so flipping the switch
   does not lose the scroll position of the page you flipped it on. */
function syncSkinControls() {
  document.querySelectorAll('[data-skin-wear]').forEach(el => {
    const on = el.dataset.skinWear === SD_SKIN;
    el.classList.toggle('is-on', on);
    if (el.classList.contains('set-sw')) el.setAttribute('aria-checked', String(on));
    else el.textContent = on ? 'Wearing' : 'Wear';
  });
}

const PLANS = [
  { id: 'free', label: 'Free', hint: 'View the app as a free account' },
  { id: 'pro',  label: 'Pro',  hint: 'View the app as a Pro subscriber' },
];

function renderPlanBar() {
  const bar = document.getElementById('plan-bar');
  if (!bar) return;
  bar.innerHTML = PLANS.map(p => {
    const on = (p.id === 'pro') === SD_PRO;
    return `<button class="tb-plan-b${on ? ' active' : ''}" data-plan="${p.id}" title="${p.hint}">` +
           `${p.id === 'pro' ? '<span class="tb-plan-star">✦</span>' : ''}${p.label}</button>`;
  }).join('');
  bar.querySelectorAll('.tb-plan-b').forEach(b =>
    b.addEventListener('click', () => setPlan(b.dataset.plan === 'pro')));
}

function initPlan() { applyPlanClass(); applySkinClass(); renderPlanBar(); initAltBar(); }

/* The Alts switch, beside Free | Pro — same segmented family (`.tb-plan`),
   one cell. Counts how many alt phones the current screen would add. */
window.setAlt = function (on) {
  on = !!on;
  if (on === SD_ALT) return;
  SD_ALT = on;
  try { localStorage.setItem(ALT_KEY, SD_ALT ? '1' : '0'); } catch (e) {}
  renderAltBar();
  renderViewer();
};
function renderAltBar() {
  const bar = document.getElementById('alt-bar');
  if (!bar) return;
  const n = (SCREENS.find(x => x.id === 'home') || { variants: [] }).variants.filter(v => v.alt).length;
  bar.innerHTML = `<button class="tb-plan-b${SD_ALT ? ' active' : ''}" title="${SD_ALT ? 'Hide' : 'Show'} the ${n} comparison phones (Compact · Review first) beside home">⧉ Alts</button>`;
  bar.querySelector('.tb-plan-b').addEventListener('click', () => setAlt(!SD_ALT));
}
function initAltBar() {
  renderAltBar();
  /* The toolbar's Labs menu (index.html) — a click anywhere else shuts it. */
  document.addEventListener('click', e => {
    document.querySelectorAll('.tb-menu.open').forEach(m => { if (!m.contains(e.target)) m.classList.remove('open'); });
  });
}
window.toggleTbMenu = function (btn) { btn.parentNode.classList.toggle('open'); };

// ── Hand layout (left/right) ──────────────────────────────────
function getHand() { return localStorage.getItem('spindeck-hand') || 'left'; }
function applyHand(screenEl) {
  const left = getHand() === 'left';
  screenEl.classList.toggle('s-home-v3--left', left);
  const lbl = screenEl.querySelector('.v3-hand-label');
  if (lbl) lbl.textContent = left ? 'Left' : 'Right';
}
window.toggleHand = function () {
  localStorage.setItem('spindeck-hand', getHand() === 'left' ? 'right' : 'left');
  document.querySelectorAll('.s-home-v3').forEach(scr => {
    scr.classList.add('v3-hand-swapping');   // freeze the For You slide so it snaps, not floats
    applyHand(scr);                           // mirror the cells (instant) + morph the arrow dots
    requestAnimationFrame(() => requestAnimationFrame(() => scr.classList.remove('v3-hand-swapping')));
  });
};

// The album carousel: featured first, then trending. Main + For You are one apart.
function albumSeq() {
  const t = window.trendingAlbums || (window.ARCHIVE || []).slice(1, 6);
  const f = window.featuredAlbum || (window.ARCHIVE || [])[0];
  return f ? [f, ...t.filter(x => x !== f)] : t.slice();
}

// Move the main album to a sequence index; For You always shows the next one up.
function applyAlbumIndex(screenEl, idx, animateMain, animateForYou, backward, animateText = animateMain) {
  const seq = albumSeq();
  if (!seq.length) return;
  idx = ((idx % seq.length) + seq.length) % seq.length;
  preloadColors(seq, idx);   // this album ±2

  screenEl._albumIdx = idx;
  setMainAlbum(screenEl, seq[idx], animateMain, animateText);
  const forSingle = screenEl.querySelector('.v3-for-single');
  if (forSingle) {
    const nextIdx = (idx + 1) % seq.length;
    if (animateForYou) slideIn(forSingle, seq[nextIdx].image, backward);
    else sdCover(forSingle, seq[nextIdx].image);
    preloadForYou(seq, nextIdx);
  }
}

function populateHomeData(screenEl) {
  applyProfColors(screenEl);   // no-op unless this is the profile card
  // Handle under the wordmark. Set here rather than in the markup because two of
  // the three headers live in static templates (see the note in screens.js), and
  // because this runs on every render — so it follows a persona switch.
  const handleEl = screenEl.querySelector('.v3-header-handle');
  if (handleEl) handleEl.textContent = '@' + ((window.PROFILE && window.PROFILE.handle) || 'you');
  sdScrollWatch(screenEl);   // csharpuser: the header's logo goes and "back 2 top" comes as you scroll

  const seq = albumSeq();
  if (!seq.length) return;
  preloadColors(seq, screenEl._albumIdx || 0);
  // Fresh render: the markup is right-handed and the stored hand pref lands a
  // frame after first paint — freeze the For You geometry transition so the box
  // appears in its spot instead of sliding across (Eric's #1 pet peeve).
  screenEl.classList.add('v3-hand-swapping');
  applyHand(screenEl);
  requestAnimationFrame(() => requestAnimationFrame(() => screenEl.classList.remove('v3-hand-swapping')));

  if (screenEl._albumIdx == null) screenEl._albumIdx = 0;
  const idx = ((screenEl._albumIdx % seq.length) + seq.length) % seq.length;
  screenEl._albumIdx = idx;

  setMainAlbum(screenEl, seq[idx], false);
  renderFriendFeed(screenEl);
  renderNowBar(screenEl);
  renderFriendsBento(screenEl);   // csharpuser: the friends bento, painted AFTER the hero so its album wins
  renderDiscoveryDeck(screenEl);  // the Trending wall's deck (a no-op elsewhere)

  const forSingle = screenEl.querySelector('.v3-for-single');
  if (forSingle) {
    const nextIdx = (idx + 1) % seq.length;
    sdCover(forSingle, seq[nextIdx].image);
    preloadForYou(seq, nextIdx);
    // Tapping For You promotes the queued album — same as swiping forward
    forSingle.onclick = (e) => { e.stopPropagation(); reactRing(screenEl, 'foryou'); applyAlbumIndex(screenEl, (screenEl._albumIdx || 0) + 1, true, true); };
  }

  setupAlbumSwipe(screenEl);
  /* The shop's Pro showcase is a real bento, so it comes through this function
     like any home — it just wants one extra thing hung off the finished art.
     On an actual home screen the same wheel is what Pro buys, so it is gated. */
  if (screenEl.classList.contains('s-shop')) shopProInit(screenEl);
  else                                       homeProInit(screenEl);
}

/* SCROLLED STATE (Eric, 2026-09-24): as the body scrolls past SD_SCROLLED_AT
   the shell gets `.is-scrolled` — the header's wordmark and handle fade out
   while the notification and settings bubbles stay put, and the nav's
   "back 2 top" tab rises out of the pill. One listener per body; a re-render
   makes a new body, so the flag on the element is the guard. */
const SD_SCROLLED_AT = 60;
function sdScrollWatch(screenEl) {
  const body = screenEl.querySelector('.v3-body');
  if (!body || body._sdScroll) return;
  body._sdScroll = true;
  let on = false;
  const check = () => {
    const now = body.scrollTop > SD_SCROLLED_AT;
    if (now !== on) { on = now; screenEl.classList.toggle('is-scrolled', on); }
  };
  body.addEventListener('scroll', check, { passive: true });
  check();
}
window.sdBackToTop = function (el, e) {
  if (e) e.stopPropagation();
  const scr = el.closest('.s-home-v3');
  const body = scr && scr.querySelector('.v3-body');
  if (body) body.scrollTo({ top: 0, behavior: 'smooth' });
};

// Swipe the album art to move through albums: drag-left = next, drag-right = previous.
// The image follows the finger; past 45% of the album width it commits, else snaps back.
function setupAlbumSwipe(screenEl) {
  const album = screenEl.querySelector('.v3-album');
  if (!album || album._swipeInit) return;
  album._swipeInit = true;
  // `touch-action` lives in app.css now (`.v3-album`) — see the note there.

  let startX = 0, startY = 0, progress = 0, width = 1;
  let active = false, decided = false, horizontal = false, dir = 0, targetIdx = 0, stepDir = 1;
  let cur = null, peek = null, fy = null, fyCur = null, fyPeek = null;

  // Ring (in the Live pill) reacts LIVE to the swipe: dots form a ring and partially rotate
  // as you drag, then complete a full spin on commit (or unwind on cancel) — tactile.
  let ringAngle = 0;
  function ringDrag(p) {
    const ring = screenEl.querySelector('.v3-ring');
    const spin = screenEl.querySelector('.v3-ring-spin');
    if (!ring) return;
    ring.classList.add('v3-ring--swipe');            // dots separate into the ring
    ringAngle = p * 210;                             // partial rotation tracks the finger
    if (spin) { spin.style.transition = 'none'; spin.style.transform = `rotate(${ringAngle}deg)`; }
  }
  function ringRelease(committed) {
    const ring = screenEl.querySelector('.v3-ring');
    const spin = screenEl.querySelector('.v3-ring-spin');
    if (!ring) return;
    if (spin) {
      spin.style.transition = 'transform 0.34s cubic-bezier(0.2,0.85,0.25,1)';
      spin.style.transform = `rotate(${committed ? ringAngle + (ringAngle >= 0 ? 360 : -360) : 0}deg)`;
    }
    setTimeout(() => {
      ring.classList.remove('v3-ring--swipe');       // dots reform the arrow the instant the spin lands
      if (spin) { spin.style.transition = ''; spin.style.transform = ''; }
    }, committed ? 340 : 300);
  }

  function buildLayers() {
    const seq = albumSeq();
    const idx = screenEl._albumIdx || 0;
    dir = progress < 0 ? -1 : 1;   // drag direction only (visual follows the finger): -1=left, +1=right
    // Which album the drag lands on depends on hand mode, since For You sits on the CD side:
    //   left-hand  (For You on the left):  drag-right → next, drag-left → previous
    //   right-hand (For You on the right): drag-left → next, drag-right → previous
    const leftHand = screenEl.classList.contains('s-home-v3--left');
    const step = leftHand ? (dir < 0 ? -1 : 1) : (dir < 0 ? 1 : -1);
    stepDir = step;   // +1 = forward/next, -1 = backward/previous (for the commit slide direction)
    targetIdx = (((idx + step) % seq.length) + seq.length) % seq.length;
    const basePct = dir < 0 ? 100 : -100;
    cur = document.createElement('div');
    cur.style.cssText = `position:absolute;inset:0;background:${album.style.backgroundImage} center/cover no-repeat;z-index:2;will-change:transform`;
    peek = document.createElement('div');
    peek.style.cssText = `position:absolute;inset:0;background:url('${seq[targetIdx].image}') center/cover no-repeat;z-index:3;will-change:transform;transform:translateX(${basePct}%)`;
    album.appendChild(cur);
    album.appendChild(peek);

    // For You box gets the same filmstrip: its own next-queued cover peeks in from the same
    // side as the drag, so you see its edge slide in live instead of it swapping after release.
    fy = screenEl.querySelector('.v3-for-single');
    if (fy) {
      const fyNextImg = seq[(targetIdx + 1) % seq.length].image;
      fyCur = document.createElement('div');
      fyCur.style.cssText = `position:absolute;inset:0;background:${fy.style.backgroundImage} center/cover no-repeat;z-index:2;will-change:transform`;
      fyPeek = document.createElement('div');
      fyPeek.style.cssText = `position:absolute;inset:0;background:url('${fyNextImg}') center/cover no-repeat;z-index:3;will-change:transform;transform:translateX(${basePct}%)`;
      fy.appendChild(fyCur);
      fy.appendChild(fyPeek);
    }
  }

  function render() {
    if (!cur) return;
    const basePct = dir < 0 ? 100 : -100;
    cur.style.transform  = `translateX(${progress * 100}%)`;
    peek.style.transform = `translateX(${basePct + progress * 100}%)`;
    if (fyCur) {
      fyCur.style.transform  = `translateX(${progress * 100}%)`;
      fyPeek.style.transform = `translateX(${basePct + progress * 100}%)`;
    }
  }

  function finish(committed) {
    if (!cur) { cleanup(); return; }
    const t = 'transform 0.28s cubic-bezier(0.4,0,0.2,1)';
    cur.style.transition = t; peek.style.transition = t;
    if (fyCur) { fyCur.style.transition = t; fyPeek.style.transition = t; }
    const basePct = dir < 0 ? 100 : -100;
    const offPct = dir < 0 ? -100 : 100;
    if (committed) {
      ringRelease(true);   // finish the full spin
      cur.style.transform  = `translateX(${offPct}%)`;
      peek.style.transform = 'translateX(0%)';
      if (fyCur) { fyCur.style.transform = `translateX(${offPct}%)`; fyPeek.style.transform = 'translateX(0%)'; }
      // recolour now (from cache), so the accent transitions in as the cover slides — no lag
      const ta = albumSeq()[targetIdx];
      if (ta) applyAlbumColorsUrl(screenEl, ta.image);
    } else {
      ringRelease(false);   // unwind back to the arrow
      cur.style.transform  = 'translateX(0%)';
      peek.style.transform = `translateX(${basePct}%)`;
      if (fyCur) { fyCur.style.transform = 'translateX(0%)'; fyPeek.style.transform = `translateX(${basePct}%)`; }
    }
    let done = false;
    const end = () => {
      if (done) return; done = true;
      const c = cur, p = peek, fc = fyCur, fp = fyPeek;
      cur = peek = fyCur = fyPeek = null;
      // animateForYou=false: we already filmstripped the For You box, so just set its final image.
      // animateText=true: still typewrite the new title/quote — the art was filmstripped, not the text.
      if (committed) applyAlbumIndex(screenEl, targetIdx, false, false, stepDir < 0, true);
      if (c) c.remove(); if (p) p.remove();
      if (fc) fc.remove(); if (fp) fp.remove();
    };
    peek.addEventListener('transitionend', end, { once: true });
    setTimeout(end, 380);
  }

  function cleanup() {
    active = decided = horizontal = false;
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerup', onUp);
    document.removeEventListener('pointercancel', onUp);
  }

  function onDown(e) {
    if (!bentoGesturesOn(screenEl)) return;   // album page: the cover is a header, not a deck
    if (e.button != null && e.button > 0) return;
    if (cur) return;   // a previous swipe is still animating
    active = true; decided = false; horizontal = false; progress = 0;
    startX = e.clientX; startY = e.clientY;
    width = album.getBoundingClientRect().width || 1;   // rendered width (scale-safe)
    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', onUp);
  }

  function onMove(e) {
    if (!active) return;
    const mx = e.clientX - startX, my = e.clientY - startY;
    if (!decided) {
      if (Math.abs(mx) < 6 && Math.abs(my) < 6) return;
      decided = true;
      horizontal = Math.abs(mx) > Math.abs(my) * 1.2;
      if (!horizontal) { cleanup(); return; }   // vertical → let it scroll
      progress = mx / width;
      buildLayers();
      album._swiped = true;
    }
    if (e.cancelable) e.preventDefault();
    progress = Math.max(-1, Math.min(1, mx / width));
    render();
    ringDrag(progress);
  }

  function onUp() {
    if (horizontal && cur) finish(Math.abs(progress) >= 0.33);
    setTimeout(() => { album._swiped = false; }, 60);   // let a real tap through afterwards
    cleanup();
  }

  album.addEventListener('pointerdown', onDown);
  album.addEventListener('mousedown', (e) => e.stopPropagation());  // don't start the viewer's drag-scroll
  // Cancel the browser's vertical scroll the moment a gesture is horizontal-dominant, so a
  // diagonal swipe doesn't drift the page down (and doesn't fire pointercancel, killing the
  // swipe). Vertical-dominant drags fall through and scroll natively.
  album.addEventListener('touchmove', (e) => {
    if (!active) return;
    const tt = e.touches && e.touches[0];
    if (!tt) return;
    const mx = tt.clientX - startX, my = tt.clientY - startY;
    if (Math.abs(mx) > 5 && Math.abs(mx) > Math.abs(my) * 1.2 && e.cancelable) e.preventDefault();
  }, { passive: false });
}

// Forward-only on purpose: For You always shows the album AFTER the current
// one, so there is nothing behind it to warm.
function preloadForYou(trending, fromIdx, count = 3) {
  for (let i = 1; i <= count; i++) {
    const img = new Image();
    img.src = trending[(fromIdx + i) % trending.length].image;
  }
}

// ── Apple Music 30-second previews (iTunes Search API via JSONP) ──────
// The iTunes Search API doesn't send CORS headers, so we use JSONP. Playing the
// returned previewUrl in an <audio> element needs no CORS. Browsers block autoplay
// with sound until a user gesture, so playback starts on the first tap.
const PREVIEW_CACHE = new Map();   // "artist – album" (lowercased) → previewUrl | null (miss)
let __jsonpSeq = 0;
function jsonp(url, timeout = 6000) {
  return new Promise((resolve) => {
    const cb = '__itp' + (++__jsonpSeq);
    const s = document.createElement('script');
    let settled = false;
    const done = (v) => { if (settled) return; settled = true; delete window[cb]; s.remove(); resolve(v); };
    window[cb] = (data) => done(data);
    s.onerror = () => done(null);
    s.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + cb;
    document.head.appendChild(s);
    setTimeout(() => done(null), timeout);
  });
}

/* Matching one of our records to an iTunes result — worst bug first: a search
   for "Phoebe Bridgers Punisher" returns a COVER of Punisher, by a different
   artist, above anything of hers, and the old picker took it (the title
   contained the album, so it stopped looking). The artist has to agree before
   the title counts at all.

   Two title tests, because each catches what the other cannot:
     `normFull` keeps everything — "Crystal Castles (II)" and "(III)" are
       different records, and stripping the numeral would merge them.
     `normBase` drops parentheses and edition suffixes — "In Utero" has to match
       "In Utero (20th Anniversary Edition)", which is the only In Utero there.
   Within a tier the SHORTEST title wins: that is what keeps a plain album ahead
   of its own deluxe reissue (SOS over "SOS Deluxe: LANA").

   ⚠️ Tier 2 — right artist, wrong record — is still RETURNED, not dropped. The
   preview wants something by this artist and has always settled for that. The
   Apple *link* does not: see `serviceUrlFor`, which refuses to point at a
   record it cannot vouch for. Callers decide how much certainty they need. */
const normFull = t => String(t || '').toLowerCase().replace(/&/g, ' and ')
  .replace(/[^a-z0-9]+/g, ' ').trim();
const normBase = t => normFull(String(t || '')
  .replace(/[\(\[][^\)\]]*[\)\]]/g, ' ')
  .replace(/\s+-\s+(single|ep|deluxe.*|.*edition|.*version|remaster.*)$/i, ' '));

function pickItunesAlbum(results, album) {
  const wantA = normFull(album.artist), wantF = normFull(album.album), wantB = normBase(album.album);
  /* The archive stores self-titled-with-a-numeral records as the numeral alone
     — Crystal Castles' second album is literally `"(II)"` — where the service
     lists the full "Crystal Castles (II)". Comparing artist+title as well is
     what closes that gap; on every other record the two agree anyway. */
  const wantAF = normFull(album.artist + ' ' + album.album);
  const artistOk = r => {
    const n = normFull(r.artistName);
    return !!n && (n === wantA || n.includes(wantA) || wantA.includes(n));
  };
  const tier = r => {
    if (!artistOk(r)) return 3;                              // someone else entirely
    const cf = normFull(r.collectionName);
    if (cf === wantF || cf === wantAF) return 0;             // the record
    // ⚠ `wantB` guard: "(II)" strips to nothing, and an empty string would
    // then match every other title that also strips to nothing.
    if (wantB && normBase(r.collectionName) === wantB) return 1;   // the record, reissued
    return 2;                                                // right artist, wrong record
  };
  const best = results.map(r => ({ r, t: tier(r), len: normFull(r.collectionName).length }))
                      .sort((x, y) => x.t - y.t || x.len - y.len)[0];
  if (!best) return null;
  best.r._sdTier = best.t;
  return best.r;
}

/* The album search, lifted out of `fetchPreviewUrl` — two features want the
   SAME iTunes record now. The preview needs its `collectionId` to reach the
   tracks; "Listen on Apple Music" needs its `collectionViewUrl`. They are used
   within a second of each other on the same album, so they share one request
   and one cache. `null` is cached too: a record iTunes doesn't have is asked
   about once, not on every tap. */
const ITUNES_CACHE = new Map();     // "artist – album" (lowercased) → the picked album result | null
const ITUNES_PENDING = new Map();
function fetchItunesAlbum(album) {
  const key = albumKey(album).toLowerCase();
  if (ITUNES_CACHE.has(key))   return Promise.resolve(ITUNES_CACHE.get(key));
  if (ITUNES_PENDING.has(key)) return ITUNES_PENDING.get(key);
  const p = (async () => {
    let pick = null;
    try {
      const term = encodeURIComponent(album.artist + ' ' + album.album);
      const ad = await jsonp(`https://itunes.apple.com/search?term=${term}&entity=album&limit=6`);
      pick = pickItunesAlbum((ad && ad.results) || [], album);
    } catch (e) { /* leave pick null */ }
    ITUNES_CACHE.set(key, pick);
    ITUNES_PENDING.delete(key);
    return pick;
  })();
  ITUNES_PENDING.set(key, p);
  return p;
}

// In-flight dedupe: concurrent lookups for the same album share one request instead of
// firing parallel JSONP calls (mirrors COLOR_PENDING). Completed results land in PREVIEW_CACHE.
const PREVIEW_PENDING = new Map();
function fetchPreviewUrl(album) {
  const key = albumKey(album).toLowerCase();
  if (PREVIEW_CACHE.has(key))   return Promise.resolve(PREVIEW_CACHE.get(key));
  if (PREVIEW_PENDING.has(key)) return PREVIEW_PENDING.get(key);
  const p = (async () => {
    let url = null;
    try {
      const pick = await fetchItunesAlbum(album);
      if (pick && pick.collectionId) {
        const sd = await jsonp(`https://itunes.apple.com/lookup?id=${pick.collectionId}&entity=song&limit=4`);
        const track = ((sd && sd.results) || []).find(s => s.wrapperType === 'track' && s.previewUrl);
        if (track) url = track.previewUrl;
      }
    } catch (e) { /* leave url null */ }
    PREVIEW_CACHE.set(key, url);
    PREVIEW_PENDING.delete(key);
    return url;
  })();
  PREVIEW_PENDING.set(key, p);
  return p;
}

/* ══════════════════════════════════════════════════════════════════════════
   LISTEN ON — handing the album off to a streaming service
   ══════════════════════════════════════════════════════════════════════════
   The rows under the preview in a CD's menu. In a shipped app these are deep
   links and the OS swaps to Spotify / Apple Music / Deezer. Nothing has to be
   faked here to test that: the URLs below are the ones a phone actually
   resolves — Apple's and Deezer's album pages are UNIVERSAL LINKS, so tapping
   one on a real device opens the app on that album, and on desktop the same URL
   opens the web player.

   ⚠️ SPOTIFY IS A SEARCH, NOT AN ALBUM LINK. Spotify's API needs an OAuth
   token, and a static page with no server has nowhere to keep one — there is no
   keyless way to turn "artist + album" into a Spotify album id.
   `open.spotify.com/search/<artist album>` is the honest stand-in: still a
   universal link, still opens the app, lands one tap from the record. Apple and
   Deezer both have open endpoints, so they get the real page.
   (If exact Spotify album links matter later: Odesli / song.link takes one
   service's URL and returns every other service's, free and keyless — one more
   hop on top of the Apple lookup we already do.)

   ⚠️ THE TAB IS OPENED INSIDE THE GESTURE. `window.open` called after an
   `await` is a popup, and every browser blocks it — the feature would silently
   do nothing on the first tap of each album, which is indistinguishable from a
   dead button. So a warm link opens directly, and a cold one opens a BLANK tab
   now and steers it when the lookup lands. It is also why opening the menu
   warms all three (`warmServiceLinks`): by the time a finger travels from the
   CD to a row, the tap is almost always the clean path.
   ⚠️ Cached BY SERVICE, and `null` is a real answer — "Deezer hasn't got this
   record" is worth remembering, or every tap re-asks and the row goes on
   feeling broken in a new way each time. */
const SERVICE_URL_CACHE = new Map();   // "svc|artist – album" → url | null

/* Deezer needs no search for most albums: anything dealt out of the rec pool
   already carries `deezerId` (see `expandRecs`), and an id is a URL with no
   request at all. Only the baked archive albums have to be looked up. */
function fetchDeezerAlbumUrl(album) {
  if (album.deezerId) return Promise.resolve('https://www.deezer.com/album/' + album.deezerId);
  return dz('search/album?limit=1&q=' + encodeURIComponent(album.artist + ' ' + album.album))
    .then(d => (d && d.data && d.data[0] && d.data[0].link) || null)
    .catch(() => null);
}

function serviceUrlFor(album, svc) {
  if (!album) return Promise.resolve(null);
  const key = svc + '|' + albumKey(album).toLowerCase();
  if (SERVICE_URL_CACHE.has(key)) return Promise.resolve(SERVICE_URL_CACHE.get(key));
  let p;
  if (svc === 'spotify') {
    p = Promise.resolve('https://open.spotify.com/search/' +   // no lookup possible — see the ⚠ above
        encodeURIComponent(album.artist + ' ' + album.album));
  } else if (svc === 'apple') {
    /* Only link to a record we can vouch for (tier 0 or 1). The iTunes Search
       API indexes the STORE, not all of Apple Music, so plenty of real albums
       simply are not in it — Blonde and Loveless among them — and the top
       result is then an unrelated single by the right artist. Handing someone a
       search page there is the correct answer, the same shape as Spotify's.
       ⚠ Deezer deliberately does NOT do this: its API reflects its actual
       catalogue, so a miss means the record isn't there, and a search page for
       a record a service hasn't got is a dead end. */
    p = fetchItunesAlbum(album).then(a =>
      (a && a._sdTier <= 1 && a.collectionViewUrl) ||
      'https://music.apple.com/search?term=' + encodeURIComponent(album.artist + ' ' + album.album));
  } else if (svc === 'ytmusic') {
    /* Search, for the same reason as Spotify: there is no public YouTube Music
       lookup without an API key. Being honest about that is better than a keyed
       call in a static prototype, or a guessed watch URL that 404s. */
    p = Promise.resolve('https://music.youtube.com/search?q=' +
        encodeURIComponent(album.artist + ' ' + album.album));
  } else {
    p = fetchDeezerAlbumUrl(album);
  }
  return p.then(url => { SERVICE_URL_CACHE.set(key, url || null); return url || null; });
}

/* Which album a menu belongs to. The bento's menu reads the SHELL it sits in
   (`_album`, written by `setMainAlbum`) rather than a global: there are several
   `.s-home-v3` in the DOM at once and the first is often not the visible one —
   the same trap that made previews play the wrong track. The profile card's
   menus cannot use that, since five CDs share one screen, so they name their
   favourite's slot instead. */
function menuAlbum(el, slot) {
  if (slot != null) {
    const name = ((window.PROFILE && window.PROFILE.favs) || [])[slot];
    return (name && (window.ARCHIVE || []).find(a => a.album === name)) || null;
  }
  const scr = el.closest('.s-home-v3');
  return (scr && scr._album) || currentBentoAlbum() || window.activeAlbum || window.featuredAlbum || null;
}

// Nothing to open. The row dips and comes back — the same "no result" language
// the preview button already speaks, rather than a new kind of error.
function serviceMiss(el) {
  el.classList.add('none');
  setTimeout(() => el.classList.remove('none'), 1400);
}

/* Open one album on one service. Shared by the CD menus and the nav console, so
   the popup and the console can never disagree about what a service link means —
   the cache, the miss behaviour and the gesture trick all live here once.
   ⚠ `done` runs only on a real open, so a caller that wants to dismiss itself
   does NOT dismiss on a miss: the row has to stay put to show the dip. */
function serviceGo(el, svc, album, done) {
  if (!album) return;
  const cached = SERVICE_URL_CACHE.get(svc + '|' + albumKey(album).toLowerCase());
  if (cached) { if (done) done(); window.open(cached, '_blank', 'noopener'); return; }
  if (cached === null) { serviceMiss(el); return; }    // asked before; this service has not got it
  /* Cold — open the tab INSIDE the gesture and point it once the lookup answers.
     A popup opened later is blocked. `noopener` cannot ride along (we need the
     handle to steer it), so the link back is cut by hand instead. */
  const w = window.open('', '_blank');
  el.classList.add('is-wait');
  serviceUrlFor(album, svc).then(url => {
    el.classList.remove('is-wait');
    if (!url) { if (w) w.close(); serviceMiss(el); return; }
    if (done) done();
    if (w) { try { w.opener = null; } catch (err) {} w.location.replace(url); }
    else window.open(url, '_blank', 'noopener');
  });
}

window.openOnService = function (el, svc, slot) {
  const menu = el.closest('.wall2-menu');
  const album = menuAlbum(el, slot);
  if (!album) { if (menu) menu.hidden = true; return; }
  serviceGo(el, svc, album, () => { if (menu) menu.hidden = true; });
};

/* The console's own opener. ⚠ It reads the album off the SHELL (`_consoleAlbum`)
   rather than through `menuAlbum`: the console can be showing a profile
   favourite, which is not the shell's current bento album and has no slot index
   once it is on the nav. The console stays open — you may well want to try a
   second service — so no `done`. */
window.consoleGo = function (btn, svc) {
  const scr = btn.closest('.s-home-v3');
  if (scr && scr._consoleAlbum) serviceGo(btn, svc, scr._consoleAlbum, null);
};

/* Called when a CD menu OPENS, so the tap that follows is the synchronous path.
   Costs one iTunes call and at most one Deezer call per album — both cached,
   and on most albums both already paid for by the preview and credits lookups. */
function warmServiceLinks(album) {
  if (!album) return;
  SD_SERVICES.forEach(s => serviceUrlFor(album, s.id));
}

// Previews are OFF by default. The speaker button arms "preview mode": the current album
// plays and each album previews as you swipe. The CD button pauses/resumes within the mode.
//
// Robustness model (the old version desynced on slow networks):
//   • PREVIEW.on / PREVIEW.paused are the ONLY source of truth for what the user wants.
//     The UI reflects INTENT, never <audio>.paused — that flag lags while buffering, which
//     is what made the speaker icon "invert" on 5G.
//   • PREVIEW.gen is a token bumped on every tap and every album change. A slow preview-URL
//     fetch captures the gen it started under and bails if the user has since tapped or
//     swiped — so a late fetch can't "come back" and start audio you already muted.
//   • The <audio> element is unlocked once, synchronously, inside the first tap gesture.
//     iOS only permits programmatic play() after that, so a URL that arrives later can
//     still start playing (this is why the first song refused to play before).
const PREVIEW = { audio: null, on: false, paused: false, gen: 0, unlocked: false, key: null };

function previewAudioEl() {
  if (!PREVIEW.audio) {
    const a = new Audio();
    a.loop = true; a.volume = 0.5; a.preload = 'auto';
    a.setAttribute('playsinline', '');   // iOS: stay inline, never go fullscreen
    PREVIEW.audio = a;
  }
  return PREVIEW.audio;
}

// A tiny silent WAV built at runtime (no risk of a bad base64 literal). Playing it inside a
// user gesture unlocks the element so later programmatic play() calls are allowed on iOS.
let __silentUrl = null;
function silentClipUrl() {
  if (__silentUrl) return __silentUrl;
  const sr = 8000, n = 400, buf = new ArrayBuffer(44 + n * 2), dv = new DataView(buf);
  const wr = (o, s) => { for (let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i)); };
  wr(0, 'RIFF'); dv.setUint32(4, 36 + n * 2, true); wr(8, 'WAVE');
  wr(12, 'fmt '); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 1, true);
  dv.setUint32(24, sr, true); dv.setUint32(28, sr * 2, true); dv.setUint16(32, 2, true); dv.setUint16(34, 16, true);
  wr(36, 'data'); dv.setUint32(40, n * 2, true);   // sample bytes stay zero → silence
  return (__silentUrl = URL.createObjectURL(new Blob([buf], { type: 'audio/wav' })));
}
function unlockAudio(a) {
  if (PREVIEW.unlocked) return;
  try {
    a.src = silentClipUrl();
    const p = a.play();
    if (p) p.then(() => { PREVIEW.unlocked = true; }).catch(() => {});
    else PREVIEW.unlocked = true;
  } catch (e) { /* ignore */ }
}

function setPreviewUI() {
  const playing = PREVIEW.on && !PREVIEW.paused;   // intent, not audio.paused
  document.querySelectorAll('.s-home-v3').forEach(s => {
    s.classList.toggle('v3-preview-on', PREVIEW.on);   // speaker lit while armed
    s.classList.toggle('v3-cd-paused', !playing);      // CD frozen when off or paused
  });
}
// Only the tap handlers use this (a swipe passes its album explicitly). Prefer a VISIBLE
// home screen over whichever happens to be first in the DOM, so on mobile / multi-variant
// layouts the tap acts on the album the user is actually looking at.
function currentBentoAlbum() {
  const screens = document.querySelectorAll('.s-home-v3');
  for (const s of screens) if (s._album && s.offsetParent !== null) return s._album;
  return screens[0] && screens[0]._album;
}
function albumKey(album) { return album ? album.artist + ' – ' + album.album : null; }

// The single audio actuator. Plays the preview for a SPECIFIC album — a swipe passes the
// album it landed on, a tap passes the visible album — so it never guesses via the DOM and
// switching albums always loads the matching track. Everything that changes intent bumps gen
// and calls this; a stale fetch bails on the gen/key check instead of fighting current state.
const PREVIEWS_ENABLED = false;   // 30s previews are not a feature — see the note below

async function playPreviewFor(album, gen) {
  const a = previewAudioEl();
  if (!PREVIEWS_ENABLED) { a.pause(); return; }
  if (!PREVIEW.on || PREVIEW.paused || !album) { a.pause(); return; }
  const key = albumKey(album);
  PREVIEW.key = key;
  // Resolve through the cache: a hit plays synchronously (best case: inside the tap gesture);
  // only a genuine miss (undefined) hits the network — a known miss (null) means no preview.
  let url = PREVIEW_CACHE.get(key.toLowerCase());
  if (url === undefined) url = await fetchPreviewUrl(album);
  // Bail if the user swiped again / muted / paused while the fetch was in flight (gen changed),
  // or a newer album change moved the target (key changed) — so a late result can't hijack audio.
  if (gen !== PREVIEW.gen || PREVIEW.key !== key || !PREVIEW.on || PREVIEW.paused) return;
  if (!url) { a.pause(); a.removeAttribute('src'); return; }
  if (a.src !== url) { a.src = url; a.currentTime = 0; }
  a.play().then(() => { PREVIEW.unlocked = true; }).catch(() => {});
  preloadPreviews(albumSeq(), album);
}

/* Warm the preview cache around the album playing now.
   ⚠️ This once took the WHOLE queue — `seq.forEach(fetchPreviewUrl)` — which
   against a 100-album rec deal is 100 iTunes lookups fired at once. It then
   took the same five-wide window as `preloadColors`, which is right for images
   and wrong for a rate-limited API. Now:

   FORWARD ONLY, for the same reason `preloadForYou` is — a swipe goes forward,
   For You shows what's next, and the album behind you is already cached, so
   warming backwards spends a budget you cannot get back.

   STAGGERED, because iTunes starts refusing outright when several requests land
   in the same instant (measured: a ~120ms gap errors, 400ms+ is clean, and the
   empty results in between were real catalogue gaps, not throttling).

   ⚠️ The album you are ACTUALLY listening to is never in this queue —
   `playPreviewFor` fetches it directly, so nothing warm is ever in front of the
   thing making sound. */
const PREVIEW_WARM_FWD = 2, PREVIEW_WARM_GAP = 400;
function preloadPreviews(seq, current) {
  if (!PREVIEW.on) return;
  const list = seq || [];
  if (!list.length) return;
  windowAround(list, Math.max(0, list.indexOf(current)), 0, PREVIEW_WARM_FWD)
    .forEach((a, i) => {
      if (a && a !== current) setTimeout(() => fetchPreviewUrl(a), i * PREVIEW_WARM_GAP);
    });
}
// Called on every album change (swipe). While muted it just warms the cache so a later
// unmute is instant; while armed it plays THIS album's preview (tied to the album passed in,
// not a DOM lookup — this is what makes swiping switch to the right track every time).
function loadPreview(album) {
  if (!PREVIEWS_ENABLED) return;
  if (!album) return;
  if (!PREVIEW.on) { fetchPreviewUrl(album); return; }   // muted: warm the cache for later
  playPreviewFor(album, ++PREVIEW.gen);
}

// Speaker → arm / disarm preview mode.
window.togglePreviewMode = function (e) {
  if (e) e.stopPropagation();
  if (!PREVIEWS_ENABLED) return;
  const a = previewAudioEl();
  if (PREVIEW.on) {                    // → OFF
    PREVIEW.on = false; PREVIEW.paused = false; PREVIEW.gen++;
    a.pause();
  } else {                             // → ON
    PREVIEW.on = true; PREVIEW.paused = false;
    unlockAudio(a);                    // must run inside this gesture
    playPreviewFor(currentBentoAlbum(), ++PREVIEW.gen);
  }
  setPreviewUI();
};
// CD → pause / resume within preview mode (arms the mode if it's off).
window.togglePreview = function (e) {
  if (e) e.stopPropagation();
  if (!PREVIEWS_ENABLED) return;
  if (!PREVIEW.on) { window.togglePreviewMode(); return; }
  PREVIEW.paused = !PREVIEW.paused;
  playPreviewFor(currentBentoAlbum(), ++PREVIEW.gen);
  setPreviewUI();
};

// ── Album colour extraction + cache ───────────────────────────
// Palettes are cached by image URL and precomputed for the whole album window
// (mirroring the image preload), so swiping applies a ready palette synchronously
// instead of extracting on arrival — no fallback flash.
const COLOR_CACHE   = new Map();   // image url → { accent, box1, box2, box1color }
const COLOR_PENDING = new Map();   // image url → in-flight Promise (dedupe concurrent loads)

// ROYGBIV hue buckets — perceptual ranges (not equal 360/7 slices), index 0=red … 6=violet.
// Red wraps around 0°. Used to vote for the album's dominant hue family by pixel area.
function hueBucket(h) {
  if (h < 15 || h >= 345) return 0;   // red
  if (h < 45)  return 1;              // orange
  if (h < 70)  return 2;              // yellow
  if (h < 165) return 3;             // green
  if (h < 255) return 4;             // blue
  if (h < 290) return 5;             // indigo
  return 6;                          // violet
}
// HSV → RGB.  h∈[0,360)  s,v∈[0,1]  →  [r,g,b] in 0..255
function hsv2rgb(h, s, v) {
  const c = v * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = v - c;
  let r, g, b;
  if (h < 60)       [r,g,b] = [c,x,0];
  else if (h < 120) [r,g,b] = [x,c,0];
  else if (h < 180) [r,g,b] = [0,c,x];
  else if (h < 240) [r,g,b] = [0,x,c];
  else if (h < 300) [r,g,b] = [x,0,c];
  else              [r,g,b] = [c,0,x];
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

// Extract the palette for one image URL. Resolves from cache instantly if present,
// dedupes concurrent extractions, and never rejects: on a tainted canvas (file://) or
// load error it resolves null so callers keep the CSS defaults.
function computeAlbumColors(url) {
  if (!url) return Promise.resolve(null);
  if (COLOR_CACHE.has(url))   return Promise.resolve(COLOR_CACHE.get(url));
  if (COLOR_PENDING.has(url)) return COLOR_PENDING.get(url);

  const p = new Promise((resolve) => {
    const img = new Image();
    img.onerror = () => resolve(null);
    img.onload = () => {
      try {
        const sz = 48;
        const cv = document.createElement('canvas');
        cv.width = cv.height = sz;
        const ctx = cv.getContext('2d');
        ctx.drawImage(img, 0, 0, sz, sz);
        const d = ctx.getImageData(0, 0, sz, sz).data;

        // Pass 1: greyscale stats + a 7-bucket ROYGBIV hue histogram of the COLOURED pixels.
        // The dominant hue is chosen by AREA ALONE (no saturation/brightness weighting) — that
        // is what stops mixed covers collapsing into one homogenous brown. Saturation/brightness
        // only come in afterwards, to shape the representative colour inside the winning bucket.
        let tR = 0, tG = 0, tB = 0, n = 0;   // overall average (greyscale detection)
        let satSum = 0, darkCount = 0;         // colourfulness + how much of the cover is near-black
        const SATFLOOR = 0.12;                 // below this a pixel is near-grey → hue is noise, no vote
        const NB = 7;
        const hCount = new Array(NB).fill(0);              // AREA vote per hue bucket
        const hSin = new Array(NB).fill(0), hCos = new Array(NB).fill(0);   // count-weighted hue (circular mean)
        const sW = new Array(NB).fill(0), s2 = new Array(NB).fill(0), vW = new Array(NB).fill(0); // sat/val, sat-weighted
        for (let i = 0; i < d.length; i += 4) {
          if (d[i+3] < 120) continue;
          const r = d[i], g = d[i+1], b = d[i+2];
          const mx = Math.max(r,g,b), mn = Math.min(r,g,b), dd = mx - mn;
          const sat = mx ? dd/mx : 0;
          const val = mx / 255;
          const lum = (mx+mn)/510;
          tR += r; tG += g; tB += b; n++;
          satSum += sat;
          if (lum <= 0.05 || (sat < SATFLOOR && lum < 0.22)) darkCount++;   // near-black / very-dark neutral
          if (sat < SATFLOOR || lum <= 0.05 || lum >= 0.97) continue;   // only vivid-enough pixels vote a hue
          let h = 0;
          if (dd) { h = (mx===r) ? ((g-b)/dd)%6 : (mx===g) ? (b-r)/dd+2 : (r-g)/dd+4; h *= 60; if (h < 0) h += 360; }
          const bk = hueBucket(h), rad = h * Math.PI/180;
          hCount[bk] += 1;                     // pure area — one pixel, one vote
          hSin[bk] += Math.sin(rad); hCos[bk] += Math.cos(rad);
          sW[bk] += sat; s2[bk] += sat*sat; vW[bk] += val*sat;
        }
        if (!n) { resolve(null); return; }

        const meanSat = satSum / n;                  // ~0 greyscale · ~0.3+ colourful
        const votes = hCount.reduce((a,c)=>a+c, 0);  // how many pixels had a real hue
        const darkFrac = darkCount / n;              // black-dominant covers → neutral grey, not mud
        const cl  = v => Math.max(0, Math.min(255, Math.round(v)));
        const hex = v => cl(v).toString(16).padStart(2,'0');

        let accent, b1r, b1g, b1b, box1, box2;

        if (meanSat < 0.10 || votes < n * 0.02) {
        // ── Near-greyscale cover → stay dark, but carry the cover's subtle tint ──
        // B&W covers still lean faintly warm (sepia/film) or cool (silver/cyanotype).
        // Pull that cast out of the mean colour and amplify it onto a FIXED dark box,
        // rather than tracking brightness — everything stays dark-themed, just tinted.
        const aR = tR / n, aG = tG / n, aB = tB / n;      // mean colour (near-grey)
        const grey = (aR + aG + aB) / 3;
        const rawR = aR - grey, rawG = aG - grey, rawB = aB - grey;   // signed tint direction

        const darkBase = 34;                       // constant dark box — no brightness tracking
        const boxAmp = 3.4;                        // exaggerate the faint cast so it reads
        b1r = darkBase + rawR * boxAmp;
        b1g = darkBase + rawG * boxAmp;
        b1b = darkBase + rawB * boxAmp;
        box1 = `linear-gradient(155deg,rgb(${cl(b1r)},${cl(b1g)},${cl(b1b)}),rgb(${cl(b1r+8)},${cl(b1g+8)},${cl(b1b+8)}))`;
        box2 = `linear-gradient(155deg,rgb(${cl(18+rawR*1.3)},${cl(18+rawG*1.3)},${cl(22+rawB*1.3)}),rgb(${cl(24+rawR*1.3)},${cl(24+rawG*1.3)},${cl(30+rawB*1.3)}))`;

        const aBase = 172;                         // fixed readable lightness, tinted to match
        const accAmp = 4.6;
        accent = `#${hex(aBase + rawR * accAmp)}${hex(aBase + rawG * accAmp)}${hex(aBase + rawB * accAmp)}`;
      } else if (darkFrac >= 0.33) {
        // ── Black-dominant / high-contrast cover → NEUTRAL grey ──
        // e.g. a black cover with a vivid accent (black + yellow). The dark tone dominates,
        // and averaging it WITH the accent is exactly what made the muddy brown — so render a
        // clean neutral grey bento with no hue tint at all.
        b1r = 42; b1g = 42; b1b = 46;
        box1 = `linear-gradient(155deg,rgb(42,42,46),rgb(50,50,55))`;
        box2 = `linear-gradient(155deg,rgb(22,22,26),rgb(28,28,33))`;
        accent = '#b9b9c1';
      } else {
        // ── Colourful cover → dominant ROYGBIV hue → representative accent ──
        // Winning bucket = most pixel area. On a tie, >= resolves to the HIGHER bucket
        // (violet-ward), per spec ("in even numbers take the highest one").
        let dom = 0;
        for (let k = 1; k < NB; k++) if (hCount[k] >= hCount[dom]) dom = k;
        // Representative colour of that hue family:
        //   hue  = circular mean of the bucket's pixels
        //   sat  = Σsat²/Σsat  (leans toward the family's more vivid pixels, not the muddy ones)
        //   val  = Σ(val·sat)/Σsat  (brightness of the coloured pixels, not the dark background)
        let Hd = Math.atan2(hSin[dom], hCos[dom]) * 180/Math.PI; if (Hd < 0) Hd += 360;
        let Sd = sW[dom] ? s2[dom]/sW[dom] : 0.5;
        let Vd = sW[dom] ? vW[dom]/sW[dom] : 0.6;
        Sd = Math.max(0.42, Math.min(1, Sd));       // floors keep the bento from sliding back to mud
        Vd = Math.max(0.45, Math.min(1, Vd));
        const rep = hsv2rgb(Hd, Sd, Vd);
        const ar = rep[0], ag = rep[1], ab = rep[2];
        let bAR = ar, bAG = ag, bAB = ab;
        const aLum = (Math.max(bAR,bAG,bAB) + Math.min(bAR,bAG,bAB)) / 510;
        if (aLum < 0.55) {                          // boost so the score reads on dark
          const scale = 0.65 / Math.max(aLum, 0.05);
          bAR = Math.min(255, bAR*scale); bAG = Math.min(255, bAG*scale); bAB = Math.min(255, bAB*scale);
        }
        accent = `#${hex(bAR)}${hex(bAG)}${hex(bAB)}`;
        b1r = Math.min(90, ar*0.30+22);
        b1g = Math.min(72, ag*0.22+14);
        b1b = Math.min(80, ab*0.28+16);
        const b2r = Math.min(35, (255-ar)*0.10+4);
        const b2g = Math.min(35, (255-ag)*0.10+4);
        const b2b = Math.min(55, (255-ab)*0.15+8);
        box1 = `linear-gradient(155deg,rgb(${cl(b1r)},${cl(b1g)},${cl(b1b)}),rgb(${cl(Math.min(b1r+12,65))},${cl(Math.min(b1g+8,45))},${cl(Math.min(b1b+8,45))}))`;
        box2 = `linear-gradient(155deg,rgb(${cl(b2r)},${cl(b2g)},${cl(b2b)}),rgb(${cl(Math.min(b2r+6,40))},${cl(Math.min(b2g+6,40))},${cl(Math.min(b2b+14,65))}))`;
      }

        // ── Light-theme palette: same extracted hue, but tinted onto the cream bg ──
        // instead of a dark box. Mix the accent toward #f0ece3 so the box reads as a
        // pale wash of the album colour — a slight lift over the dark theme's boxes.
        const ah = accent.replace('#','');
        const AR = parseInt(ah.slice(0,2),16), AG = parseInt(ah.slice(2,4),16), AB = parseInt(ah.slice(4,6),16);
        const CR = 240, CG = 236, CB = 227;              // #f0ece3 cream
        const mixC = (c, a, t) => Math.round(c*(1-t) + a*t);
        const t1 = 0.44;                                  // box1 — the visible tint
        const L1r = mixC(CR,AR,t1), L1g = mixC(CG,AG,t1), L1b = mixC(CB,AB,t1);
        const t2 = 0.25;                                  // box2 — subtler, cooler wash
        const L2r = mixC(CR,AR,t2), L2g = mixC(CG,AG,t2), L2b = mixC(CB,AB,t2);
        const box1L = `linear-gradient(155deg,rgb(${cl(L1r+6)},${cl(L1g+6)},${cl(L1b+6)}),rgb(${cl(L1r-6)},${cl(L1g-6)},${cl(L1b-6)}))`;
        const box2L = `linear-gradient(155deg,rgb(${cl(L2r+5)},${cl(L2g+5)},${cl(L2b+7)}),rgb(${cl(L2r-4)},${cl(L2g-4)},${cl(L2b-2)}))`;

        /* The RATING colour, separate from the bento accent. A greyscale or
           black-dominant cover deliberately extracts to a neutral (the
           darkFrac branch hard-codes #b9b9c1) — right for the box, dreadful for
           the vinyls, which just go grey. So the star falls back to the house
           gold whenever the accent has too little colour in it to read as a
           deliberate choice. `accent` itself is left alone: the boxes still want
           the neutral. */
        const starGrey = (() => {
          const h = accent.replace('#', '');
          const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
          const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
          const sat = mx ? (mx - mn) / mx : 0;
          return sat < 0.22;
        })();
        const star = starGrey ? '#e8a83c' : accent;

        const colors = {
          accent, star, starGrey, box1, box2,   // starGrey: the star is the gold FALLBACK, not the cover's own colour
          box1color: `rgb(${cl(b1r)},${cl(b1g)},${cl(b1b)})`,
          box1L, box2L,
          box1colorL: `rgb(${L1r},${L1g},${L1b})`,
        };
        COLOR_CACHE.set(url, colors);
        resolve(colors);
      } catch (e) { resolve(null); /* CORS / tainted canvas — keep CSS defaults */ }
    };
    /* Personas serve their covers from Deezer's CDN. Reading pixels back out of
       a canvas that has drawn a cross-origin image throws SecurityError, so the
       extraction silently failed and every persona album fell back to the
       hard-coded flood colour. Request CORS for absolute URLs; the CDN sends
       Access-Control-Allow-Origin. If it ever doesn't, the load errors and we
       resolve(null) — the artwork itself still renders, because CSS
       background-image never needed CORS in the first place. */
    if (/^https?:/i.test(url)) img.crossOrigin = 'anonymous';
    img.src = url;
  });
  COLOR_PENDING.set(url, p);
  p.then(() => COLOR_PENDING.delete(url));
  return p;
}

function applyColorVars(screenEl, c) {
  if (!screenEl || !c) return;
  screenEl.style.setProperty('--v3-accent', c.accent);
  // Ratings read --v3-star, not --v3-accent — see the `star` note in computeAlbumColors.
  screenEl.style.setProperty('--v3-star', c.star || c.accent);
  // Bento + fullscreen use the SAME album-derived color in both themes (dark values),
  // so the light theme no longer lightens the bento/review flood.
  screenEl.style.setProperty('--v3-box1-bg', c.box1);
  screenEl.style.setProperty('--v3-box2-bg', c.box2);
  screenEl.style.setProperty('--v3-box1-color', c.box1color);
}

// Apply the palette for a KNOWN image URL. Uses the album's own (relative) image, which
// matches the preload cache key — so it lands synchronously instead of re-extracting under
// the absolute URL getComputedStyle returns (that mismatch is what made colours lag a swipe).
function applyAlbumColorsUrl(screenEl, url) {
  if (!screenEl || !url) return;
  if (COLOR_CACHE.has(url)) { applyColorVars(screenEl, COLOR_CACHE.get(url)); return; }
  computeAlbumColors(url).then(c => { if (c) applyColorVars(screenEl, c); });
}

// Colour the bento from the cover on .v3-album. A cached palette applies synchronously
// (the common case after preload — no flash); a cold cover extracts once, then applies,
// guarding against the album changing mid-extract.
function applyAlbumColors(screenEl) {
  const albumEl = screenEl && screenEl.querySelector('.v3-album');
  if (!albumEl) return;
  const bg = getComputedStyle(albumEl).backgroundImage;
  const m  = bg.match(/url\(['"]?([^'"]+?)['"]?\)/);
  if (!m) return;
  const url = m[1];
  if (COLOR_CACHE.has(url)) { applyColorVars(screenEl, COLOR_CACHE.get(url)); return; }
  computeAlbumColors(url).then(c => {
    if (!c) return;
    const now = getComputedStyle(albumEl).backgroundImage;   // still the same cover?
    if (now.indexOf(url) !== -1) applyColorVars(screenEl, c);
  });
}

// Procedurally colour the profile base to match the profile image. Reuses the
// album-cover extractor to get a representative accent, takes its hue, and feeds
// profBaseColors() so the embossed card echoes the picture's colour scheme.
// Applied to every .s-prof2 instance so the dark + light variants stay matched.
// Rebuild the name-banner path with its right-side anchor points shifted by `dx`
// SVG units (the move Eric described as "drag the right points to the right").
/* The banner, with every point on its RIGHT half slid out by `dx` — the left
   edge, the corner radius and the slant's shape are untouched, so the tab grows
   without deforming. Retraced from ProfileTheme_Regular4 (1).svg: the banner is
   both taller (bottom 69 → 74.9) and wider (right 409.9 → 467.5) than the one
   it replaces. */
function profNameTabPath(dx) {
  const x = n => (n + dx).toFixed(3);
  return `M0.500139 74.9079H${x(467.5)}H${x(437.414)}C${x(420.568)} 74.9079 ${x(404.855)} 66.4255 ${x(395.612)} 52.3422L${x(373.436)} 18.5525C${x(366.042)} 7.28593 ${x(353.471)} 0.5 ${x(339.995)} 0.5H35.5001C16.1702 0.5 0.500139 16.17 0.500139 35.5V74.9079Z`;
}

// Size the pill (and the banner around it) so the right edge clears the username.
// Measures the rendered label, converts px → SVG units, then slides the banner's
// right edge (path) and the pill's right edge (div width) out together via one `dx`.
function sizeProfName(screenEl) {
  const canvas = screenEl && screenEl.querySelector('.prof-canvas');
  const lbl  = screenEl && screenEl.querySelector('.prof-name-tab-lbl');
  const tab  = screenEl && screenEl.querySelector('.prof-name-tab');
  const pill = screenEl && screenEl.querySelector('.prof-name-pill');
  if (!canvas || !lbl || !tab || !pill) return;
  const cw = canvas.offsetWidth;
  if (!cw) return;
  const u = 690 / cw;                              // px → SVG units
  const textUnits = lbl.offsetWidth * u;
  const labelLeft = 0.06 * 690;                    // .prof-name-tab-lbl left (6%) in units
  const padR = 20;                                 // gap from text end to the pill's straight-edge point
  /* ⚠ All four numbers below are read off ProfileTheme_Regular4 (1).svg and move
     together — they are the banner's slant anchor (339.995), the white pill's
     left edge (16) and its right cap (360). The pill sits 20 units inside the
     anchor in the new file exactly as it sat 18.9 inside the old one, so the tab
     and the pill still grow as one shape. Clamp so the slant stays on-canvas:
     the banner's right edge is 467.5, and 467.5 + 200 = 667.5 is still inside
     the 690 box. */
  const dx = Math.max(0, Math.min(200, labelLeft + textUnits + padR - 339.995));
  tab.setAttribute('d', profNameTabPath(dx));
  // Pill div: left is 16u, right cap reaches 360u+dx → width in %.
  pill.style.width = ((360 + dx - 16) / 690 * 100).toFixed(2) + '%';
}

function applyProfColors(screenEl) {
  sizeProfName(screenEl);
  /* ⚠ SYNCHRONOUS — do not wrap this in `requestAnimationFrame`. It was, and
     the rail then failed to initialise at all in a tab that is not frontmost:
     browsers throttle rAF to nothing in a backgrounded or occluded tab, so the
     callback simply never arrived and the rail sat on disc 1 with an empty info
     panel until the user scrolled it by hand. Caught by driving the viewer
     through CDP, where the tab is exactly that.
     Nothing here needs a frame. If the rail already has a width `profFavBoot`
     finishes immediately; if it does not, its ResizeObserver picks it up when
     one arrives — and observers are not tied to the frame clock. */
  if (screenEl) screenEl.querySelectorAll('.prof-fav-rail').forEach(r => profFavBoot(r));
  // The pins and the history are the feed's card now (2026-09-18): each one's
  // discs take its own cover's colour, and the long-text / long-title fades
  // are measured, exactly as the home feed does after it renders.
  if (screenEl && typeof tintFeedRecords === 'function') {
    tintFeedRecords(screenEl);
    markLongReviews(screenEl); setTimeout(() => markLongReviews(screenEl), 80); setTimeout(() => markLongReviews(screenEl), 600);
  }
  const pic = screenEl && screenEl.querySelector('.prof-pic');
  if (!pic) return;
  const bg = getComputedStyle(pic).backgroundImage;
  const m = bg.match(/url\(['"]?([^'"]+?)['"]?\)/);
  if (!m) return;
  const url = m[1];
  computeAlbumColors(url).then(c => {
    if (!c || !c.accent) return;
    if (getComputedStyle(pic).backgroundImage.indexOf(url) === -1) return;   // still same pic?
    const hx = c.accent.replace('#', '');
    const r = parseInt(hx.slice(0, 2), 16) / 255, g = parseInt(hx.slice(2, 4), 16) / 255, b = parseInt(hx.slice(4, 6), 16) / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), dd = mx - mn;
    if (mx === 0 || dd / mx < 0.12) return;   // near-greyscale → keep the neutral default base
    let h = 0;
    if (dd) { h = (mx === r) ? ((g - b) / dd) % 6 : (mx === g) ? (b - r) / dd + 2 : (r - g) / dd + 4; h *= 60; if (h < 0) h += 360; }
    const cols = window.profBaseColors(Math.round(h));
    document.querySelectorAll('.s-prof2').forEach(el => { for (const k in cols) el.style.setProperty(k, cols[k]); });
  });
}

// Warm the palette cache for every album in the window (mirrors preloadForYou).
/* Extract the accent colour for a WINDOW of the sequence, not all of it.
   Each call loads the image and runs it through a canvas; with a persona's
   ~28 remote Deezer covers, doing the whole sequence on every swipe meant 28
   fetches per index change. computeAlbumColors memoises, so a 5-wide window
   walking forward still has every cover ready by the time you reach it. */
/* ── The loaded window ────────────────────────────────────────
   The rec queue is ~100 albums, but only ever a handful are LOADED: the queue
   carries identity (title / artist / cover url / deezerId), and the expensive
   parts — the cover bitmap, its extracted palette, the preview lookup, the rest
   of the metadata — are pulled in a small window around the current index. That
   is what keeps a 100-album shelf usable on a low-end phone; you only hit it by
   swiping faster than the window can refill.

   ⚠️ The window is SYMMETRIC. It used to run `idx … idx+4` — five ahead, none
   behind — so swiping BACKWARD always landed on a cold palette and flashed the
   fallback colour. Same budget, spread either side. */
const PRELOAD_BACK = 2, PRELOAD_FWD = 2;

// Window helper: the albums around `at`, wrapped. Shared so the colour and
// preview warmers can't drift apart again.
function windowAround(list, at, back = PRELOAD_BACK, fwd = PRELOAD_FWD) {
  const out = [];
  if (!list || !list.length) return out;
  for (let d = -back; d <= fwd; d++) {
    out.push(list[(((at + d) % list.length) + list.length) % list.length]);
  }
  return out;
}

function preloadColors(seq, fromIdx = 0) {
  windowAround(seq, fromIdx).forEach(a => { if (a && a.image) computeAlbumColors(a.image); });
}

function renderSingle() {
  const c = document.getElementById('phone-container');
  const s = currentScreen();

  // Always lay out as a 2-up (dark + light) so the phone is the SAME size on every page
  // and doesn't jump when switching. Pages with one variant just fill the left slot.
  c.className = 'multi-variant';
  const vis    = stageVariants(s);                  // alts only while the switch is on
  const n      = Math.max(vis.length, 2);
  /* ⚠ THE RAIL (Eric, 2026-09-25: "the left side isn't accounting for that bar").
     `#page-nav` FLOATS over the stage (style.css) so a pair centres in the true
     middle of the window — but four phones fill the width, and the first one
     went under it. With more than the pair, the container is padded past the
     rail and the width budget is what is left. `--nav-w` is the rail's width. */
  const GAP  = 10;                                  // the columns' gap (style.css)
  const navW = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-w')) || 148;
  const rail = n > 2 ? navW + 12 : 0;
  c.style.paddingLeft = rail ? rail + 'px' : '';
  const scaleH = (c.clientHeight - 70) / 852;
  const scaleW = ((c.clientWidth - rail - 24) / n - GAP) / 393;   // 24 = the side padding
  const scale  = Math.min(scaleH, scaleW, 0.88);
  /* ⚠ `transform: scale` leaves the LAYOUT box at 393×852 — the vertical dead
     space was already pulled in by the margins; the horizontal never was, so
     shrunken phones sat in full-width columns and the gap between them was
     mostly that slack ("closer together, man"). Both axes now. */
  const dead   = 852 * (scale - 1);
  const deadW  = 393 * (scale - 1);
  const curr   = getVariantIdx(s);

  c.innerHTML = vis.map(({ v, i }) => `
    <div class="var-col ${i === curr ? 'var-active' : ''}" onclick="pickVariant('${s.id}',${i})">
      <div class="var-label">${v.version || v.label}</div>
      <div class="phone-wrap" style="transform:scale(${scale});margin:${dead/2}px ${deadW/2}px">
        ${buildPhoneHTML(s, v)}
      </div>
      <div class="var-sublabel">${v.label}</div>
    </div>`
  ).join('');
  initDragScroll(c);
}

// ── Drag-to-scroll for multi-variant view ────────────────────
function initDragScroll(el) {
  if (el._dragInit) return;
  el._dragInit = true;

  el.addEventListener('mousedown', e => {
    const startX     = e.clientX;
    const scrollLeft = el.scrollLeft;
    _dragActive = false;

    const move = e2 => {
      const dx = e2.clientX - startX;
      if (Math.abs(dx) > 4) _dragActive = true;
      if (_dragActive) el.scrollLeft = scrollLeft - dx;
    };
    const up = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      el.style.userSelect = '';
      el.classList.remove('is-grabbing');
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    el.style.userSelect = 'none';
    el.classList.add('is-grabbing');
  });

  el.addEventListener('click', e => {
    if (_dragActive) { e.stopPropagation(); _dragActive = false; }
  }, true);
}

window.pickVariant = function(screenId, idx) {
  if (_dragActive) return;
  // No-op when the clicked column is already the active variant — a bubbled
  // click would otherwise re-render the screen and wipe in-page state
  // (open menus, tab selection).
  const s = SCREENS.find(x => x.id === screenId);
  if (s && getVariantIdx(s) === idx) return;
  setVariant(screenId, idx);
};

function renderMulti() {
  const container = document.getElementById('phone-container');
  container.className = 'multi';
  container.style.paddingLeft = '';        // renderSingle pads past the rail for 3+ phones; not here
  const cols   = Math.min(SCREENS.length, Math.floor(container.clientWidth / 220));
  const scaleH = (container.clientHeight - 80) / 852;
  const scaleW = (container.clientWidth / cols - 32) / 393;
  const scale  = Math.min(scaleH, scaleW, 0.55);
  const dead   = 852 * (scale - 1);

  container.innerHTML = SCREENS.map((s, i) => `
    <div style="display:flex;flex-direction:column;align-items:center">
      <div class="phone-wrap" style="transform:scale(${scale});margin-top:${dead/2}px;margin-bottom:${dead/2}px"
           onclick="goToScreen(${i})">
        ${buildPhoneHTML(s)}
      </div>
      <div class="phone-multi-label">${s.name}</div>
    </div>
  `).join('');
}

function buildPhoneHTML(screen, variant) {
  const v = variant || getVariant(screen);
  return `
  <div class="phone-frame">
    <div class="side-btn action"></div>
    <div class="side-btn vol-up"></div>
    <div class="side-btn vol-dn"></div>
    <div class="side-btn power"></div>
    <div class="phone-screen">
      <div class="status-bar ${screen.statusTheme === 'dark' ? 'dark-icons' : ''}">
        <div class="sb-time">9:41</div>
        <div class="dynamic-island"></div>
        <div class="sb-icons">${SVG_SIGNAL}${SVG_WIFI}${SVG_BATTERY}</div>
      </div>
      <div class="screen-content">${v.html}</div>
      <div class="home-indicator ${screen.statusTheme === 'dark' ? 'dark-icons' : ''}"></div>
    </div>
  </div>`;
}

function setPhoneScale() {
  if (viewMode !== 'single') return;
  const container = document.getElementById('phone-container');
  const wrap = document.querySelector('.phone-wrap');
  if (!wrap || !container) return;
  const scale = Math.min((container.clientHeight - 32) / 852, (container.clientWidth - 40) / 393, 1.0);
  const dead  = 852 * (scale - 1);
  wrap.style.transform    = `scale(${scale})`;
  wrap.style.marginTop    = dead / 2 + 'px';
  wrap.style.marginBottom = dead / 2 + 'px';
}

function renderThumbs() {
  renderPageNav();
  renderVariantBar();
}

// The demo nav is decoupled from SCREENS: some entries are real screens, others
// (search / album / artist / review) launch the live in-app flow they now live
// in (they're no longer standalone screens). `flow:true` marks the latter.
const NAV_PAGES = [
  { id: 'auth',       label: 'Auth / Login'  },
  { id: 'onboarding', label: 'Onboarding'    },
  { id: 'home',       label: 'Home'          },
  { id: 'wall',       label: 'Album Wall'    },
  { id: 'search',     label: 'Search',        flow: true },
  { id: 'album',      label: 'Album Page',    flow: true },
  { id: 'artist',     label: 'Artist Page',   flow: true },
  { id: 'song',       label: 'Song / Track'  },
  // No 'Review' entry: the fullscreen review state it opened is gone, so it
  // would just be a second button for Album Page.
  { id: 'profile',      label: 'Profile'       },
  { id: 'profile-edit', label: 'Edit Profile'  },
  { id: 'review-page',  label: 'Review Page'   },
  { id: 'notifications',label: 'Notifications' },
  { id: 'settings',     label: 'Settings'      },
];
let activeNavId = 'home';

function renderPageNav() {
  if (window.renderTestNav) window.renderTestNav();   // the tester rail (patchnotes.js) follows the same beats
  const nav = document.getElementById('page-nav');
  if (!nav) return;
  nav.innerHTML = NAV_PAGES.map(p =>
    `<button class="pnav-btn ${p.id === activeNavId ? 'active' : ''}${p.flow ? ' pnav-flow' : ''}" onclick="navPage('${p.id}')">${p.label}</button>`
  ).join('') + `
    <div class="pnav-divider"></div>
    <button class="pnav-btn pnav-multi ${viewMode === 'multi' ? 'multi-active' : ''}" onclick="toggleMulti()">⊞ Multi</button>
  `;
}

// Left-nav click: open a real screen, or fire the live flow for the pages that
// are now sub-states of the home shell.
window.navPage = function (id) {
  activeNavId = id;
  const goScreen = sid => { const i = SCREENS.findIndex(s => s.id === sid); if (i !== -1) goToScreen(i); };
  const arc = window.ARCHIVE || [];
  const feat = window.featuredAlbum || arc[0];
  switch (id) {
    case 'search':
      goScreen('home');
      requestAnimationFrame(() => window.openSearch(document.querySelector('#phone-container .app-screen')));
      break;
    case 'album':
      if (feat) window.openAlbumPage(feat);
      break;
    case 'artist':
      if (feat) window.openArtistPageFor(feat.artist);
      break;
    case 'review':                       // legacy id — the album page is what it meant
      if (feat) window.openAlbumPage(feat);
      break;
    default:
      goScreen(id);
  }
  renderPageNav();   // reflect the active state now (live flows re-render async)
};

// Ensure the home shell is showing, then run fn on each home-shell instance.
function goHomeThenShells(fn) {
  if (currentScreen().id === 'home' && homeShells().length) { homeShells().forEach(fn); return; }
  navigate('home');
  requestAnimationFrame(() => requestAnimationFrame(() => homeShells().forEach(fn)));
}

function updateToolbar() {
  const s = currentScreen();
  document.getElementById('lbl-name').textContent = s.name;
  document.getElementById('lbl-idx').textContent  = `${currentIdx + 1} / ${SCREENS.length}`;
  document.getElementById('btn-prev').disabled = currentIdx === 0;
  document.getElementById('btn-next').disabled = currentIdx === SCREENS.length - 1;
}

// ── Variant switcher (bottom tray) ───────────────────────────
function renderVariantBar() {
  const bar = document.getElementById('thumb-tray');
  if (!bar) return;
  const s   = currentScreen();
  const curr = getVariantIdx(s);
  const vis = stageVariants(s);
  if (vis.length <= 1) { bar.innerHTML = ''; return; }
  bar.innerHTML = vis.map(({ v, i }) =>
    `<button class="vpill ${i === curr ? 'active' : ''}" onclick="setVariant('${s.id}',${i})">${v.label}</button>`
  ).join('');
}

window.setVariant = function(screenId, idx) {
  variantState[screenId] = idx;
  renderViewer();
};

// ── Navigation ───────────────────────────────────────────────
function navigatePrev() { if (currentIdx > 0) { currentIdx--; activeNavId = currentScreen().id; renderViewer(); } }
function navigateNext() { if (currentIdx < SCREENS.length - 1) { currentIdx++; activeNavId = currentScreen().id; renderViewer(); } }

function goToScreen(idx) {
  if (viewMode === 'multi') viewMode = 'single';
  currentIdx = idx;
  activeNavId = SCREENS[idx] ? SCREENS[idx].id : activeNavId;
  // A persona has an AUTHORED profile — re-rolling the random one would wipe it.
  if (SCREENS[idx] && SCREENS[idx].id === 'profile' && !window.ACTIVE_PERSONA) randomizeProfile();
  renderViewer();
}

window.toggleMulti = function() {
  viewMode = viewMode === 'multi' ? 'single' : 'multi';
  renderViewer();
};

// ── Zoom ─────────────────────────────────────────────────────
let zoomLevel = 1.35;   // csharpuser (2026-09-24): opens at 135% (Eric) — ± still steps by a quarter
const ZOOM_STEP = 0.25;
const ZOOM_MIN  = 0.25;
const ZOOM_MAX  = 4;

function setZoom(level) {
  zoomLevel = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, level));
  document.getElementById('phone-container').style.zoom = zoomLevel;
  document.getElementById('lbl-zoom').textContent = Math.round(zoomLevel * 100) + '%';
}

function shuffleAlbums() {
  reshuffleHome();
  renderViewer();
}

function bindViewerEvents() {
  document.getElementById('btn-prev').addEventListener('click', navigatePrev);
  document.getElementById('btn-next').addEventListener('click', navigateNext);
  document.getElementById('btn-export').addEventListener('click', exportPNG);
  document.getElementById('btn-shuffle').addEventListener('click', shuffleAlbums);
  document.getElementById('btn-zoom-in').addEventListener('click', () => setZoom(zoomLevel + ZOOM_STEP));
  document.getElementById('btn-zoom-out').addEventListener('click', () => setZoom(zoomLevel - ZOOM_STEP));

  document.getElementById('stage').addEventListener('wheel', (e) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    setZoom(zoomLevel + (e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP));
  }, { passive: false });
  setZoom(zoomLevel);   // the opening zoom is applied, not just labelled
}

// ── PNG Export ───────────────────────────────────────────────
async function exportPNG() {
  const btn  = document.getElementById('btn-export');
  const wrap = document.querySelector('.phone-wrap');
  if (!wrap || typeof html2canvas === 'undefined') {
    alert('html2canvas not loaded — check your internet connection.'); return;
  }
  btn.textContent = '…'; btn.disabled = true;

  const prev = wrap.style.transform;
  wrap.style.transform = 'scale(1)'; wrap.style.marginTop = '0'; wrap.style.marginBottom = '0';

  try {
    const canvas = await html2canvas(wrap.querySelector('.phone-frame'), {
      scale: 2, backgroundColor: null, useCORS: true, logging: false,
    });
    const name = currentScreen().name.toLowerCase().replace(/[\s/]+/g, '-');
    const v    = getVariant(currentScreen()).label;
    const link = document.createElement('a');
    link.download = `c-sharp-${name}-${v}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } finally {
    wrap.style.transform = prev; setPhoneScale();
    btn.textContent = '⬇'; btn.disabled = false;   // icon-only since 2026-09-25 (index.html)
  }
}

// ============================================================
//  MOBILE PROTOTYPE
// ============================================================
const SVG_EXPAND   = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M1 5V1h4M9 1h4v4M13 9v4H9M5 13H1V9"/></svg>`;
const SVG_COMPRESS = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M5 1v4H1M9 5V1h4M9 13v-4h4M5 9v4H1"/></svg>`;

let mobileViewMode = 'single';

function initMobile() {
  document.getElementById('mb-fs').innerHTML = SVG_EXPAND;
  bindMobileBarEvents();
  window.addEventListener('resize', debounce(scaleMobilePhone, 100));
  /* A phone gets the APP, not the viewer (Eric, 2026-09-18): Live, edge to edge,
     full screen height, and no Single / Multi / Flow / Live bar. `?tools` on the
     URL brings the bar (and the persona switcher in it) back for design work. */
  const tools = /[?&]tools/.test(location.search);
  document.body.classList.toggle('mb-bare', !tools);
  setMobileView(tools ? 'single' : 'live');
}

function bindMobileBarEvents() {
  document.getElementById('mb-seg').addEventListener('click', e => {
    const btn = e.target.closest('.mb-btn');
    if (!btn) return;
    setMobileView(btn.dataset.mview);
  });

  document.getElementById('mb-prev').addEventListener('click', () => {
    if (currentIdx > 0) { currentIdx--; renderMobileSingle(); }
  });
  document.getElementById('mb-next').addEventListener('click', () => {
    if (currentIdx < SCREENS.length - 1) { currentIdx++; renderMobileSingle(); }
  });

  const fsBtn = document.getElementById('mb-fs');
  fsBtn.addEventListener('click', () => {
    const el = document.documentElement;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
    }
  });

  document.addEventListener('fullscreenchange', () => {
    document.getElementById('mb-fs').innerHTML =
      document.fullscreenElement ? SVG_COMPRESS : SVG_EXPAND;
  });
}

function setMobileView(mode) {
  mobileViewMode = mode;
  document.querySelectorAll('.mb-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.mview === mode)
  );
  document.querySelectorAll('.mb-view').forEach(v => { v.style.display = 'none'; });
  const view = document.getElementById('mb-' + mode);
  if (view) view.style.display = 'flex';

  if (mode === 'single') renderMobileSingle();
  else if (mode === 'multi') renderMobileMultiGrid();
  else if (mode === 'live') renderMobileLive(currentIdx);
}

function renderMobileSingle() {
  const center = document.getElementById('mb-phone-center');
  center.innerHTML = `<div class="phone-wrap">${buildPhoneHTML(currentScreen())}</div>`;
  document.getElementById('mb-screen-name').textContent = currentScreen().name;
  document.getElementById('mb-prev').disabled = currentIdx === 0;
  document.getElementById('mb-next').disabled = currentIdx === SCREENS.length - 1;
  requestAnimationFrame(() => {
    scaleMobilePhone();
    paintPhoneChrome();
    center.querySelectorAll('.s-home-v3').forEach(el => populateHomeData(el));
    center.querySelectorAll('.s-onboarding').forEach(obInit);
    applyFilletMasks();
  });
}

function scaleMobilePhone() {
  const center = document.getElementById('mb-phone-center');
  const wrap   = center && center.querySelector('.phone-wrap');
  if (!wrap) return;
  const scale  = Math.min((center.clientWidth - 8) / 393, (center.clientHeight - 8) / 852, 1.0);
  const dead   = 852 * (scale - 1);
  wrap.style.transform    = `scale(${scale})`;
  wrap.style.marginTop    = dead / 2 + 'px';
  wrap.style.marginBottom = dead / 2 + 'px';
}

function renderMobileMultiGrid() {
  const grid  = document.getElementById('mb-multi-grid');
  const stage = document.getElementById('mb-multi');
  const colW  = (stage.clientWidth - 40) / 2;
  const scale = Math.min(colW / 393, 0.42);
  const dead  = 852 * (scale - 1);

  grid.innerHTML = SCREENS.map((s, i) => `
    <div style="display:flex;flex-direction:column;align-items:center">
      <div class="phone-wrap" style="transform:scale(${scale});margin-top:${dead/2}px;margin-bottom:${dead/2}px;cursor:pointer"
           onclick="goToMobileScreen(${i})">
        ${buildPhoneHTML(s)}
      </div>
      <div class="phone-multi-label" style="display:block">${s.name}</div>
    </div>
  `).join('');
}

function renderMobileLive(idx) {
  const content = document.getElementById('mobile-content');
  content.innerHTML = getVariant(SCREENS[idx]).html;
  currentIdx = idx;
  requestAnimationFrame(() => {
    content.querySelectorAll('.s-home-v3').forEach(el => populateHomeData(el));
    content.querySelectorAll('.s-onboarding').forEach(obInit);
    applyFilletMasks();
  });
}

window.goToMobileScreen = function(idx) {
  currentIdx = idx;
  setMobileView('single');
};

// ── navigate() — called from screen HTML onclick ─────────────
window.navigate = function(targetId, direction) {
  /* Leaving the screen leaves the dial. `renderViewer` rebuilds the shells, so
     the markup carrying `--mixing` is thrown away either way — this is what
     stops `mixHost` from being left pointing at a detached node, which would
     read as "still open" to `mixDialSync` and to the corner pill. */
  closeMixDial();
  // search / album / artist / review are no longer standalone screens — any
  // onclick that still asks for them routes to the live in-app flow instead.
  // 'review' is a legacy id: the state it named is gone, and the album page is
  // what it was reaching for.
  if (targetId === 'search' || targetId === 'album' || targetId === 'artist' || targetId === 'review') {
    const arc = window.ARCHIVE || [];
    const a = window.activeAlbum || window.featuredAlbum || arc[0];
    activeNavId = targetId;
    if (targetId === 'search') window.openSearch();
    else if ((targetId === 'album' || targetId === 'review') && a) window.openAlbumPage(a);
    else if (targetId === 'artist' && a) window.openArtistPageFor(a.artist);
    renderPageNav();
    return;
  }

  const idx = SCREENS.findIndex(s => s.id === targetId);
  if (idx === -1) return;
  activeNavId = targetId;
  /* Any navigation that is not the one opening a guest hands your own profile
     back — including a tap on Profile in the nav, which means YOURS. */
  if (window.PROFILE_GUEST && direction !== 'guest') restoreOwnProfile();
  // New personality on a fresh visit, but NOT when Back restores an earlier
  // profile, and not when we have just dealt a friend's.
  if (targetId === 'profile' && direction !== 'back' && direction !== 'guest'
      && !window.ACTIVE_PERSONA) randomizeProfile();

  if (isMobile) {
    if (mobileViewMode !== 'live') {
      currentIdx = idx;
      if (mobileViewMode === 'single') renderMobileSingle();
      return;
    }

    const content = document.getElementById('mobile-content');
    const isBack  = direction === 'back' || (navHistory.length && navHistory[navHistory.length-1] === idx);
    if (isBack) navHistory.pop(); else navHistory.push(currentIdx);

    /* A tap during a fade leaves two screens in here — the one leaving and the
       one arriving. The arriving one (last) is the screen you are on; anything
       before it is already gone as far as the user is concerned. */
    [...content.children].slice(0, -1).forEach(el => el.remove());
    const oldEl = content.firstElementChild;
    if (oldEl) oldEl.classList.remove('fade-enter');
    const temp  = document.createElement('div');
    temp.innerHTML = getVariant(SCREENS[idx]).html;
    const newEl = temp.firstElementChild;
    content.appendChild(newEl);
    requestAnimationFrame(() => {
      if (newEl.classList.contains('s-home-v3')) populateHomeData(newEl);
      applyFilletMasks();
    });

    /* A CROSSFADE, the same both ways (Eric, 2026-09-18). This was a sideways
       push — new screen in from the right, old one out to the left, mirrored for
       Back — and on a real phone it was bad: a whole-screen slide between pages
       that are not spatially left or right of each other, and both screens sat
       in flow during it. Now the old screen fades out where it stands and the
       new one fades in over it (`.fade-enter` lifts it out of flow for the
       duration so the two overlap instead of stacking).
       ⚠ Only THIS path changed. The album page, the review page, the sheets and
       the bento swipe have transitions of their own and don't come through here. */
    if (oldEl) {
      oldEl.classList.add('fade-exit');
      newEl.classList.add('fade-enter');
      setTimeout(() => {
        oldEl.remove();
        newEl.classList.remove('fade-enter');
      }, MOBILE_FADE_MS);
    }
    currentIdx = idx;
  } else {
    currentIdx = idx;
    renderViewer();
  }
};

const MOBILE_FADE_MS = 300;   // ⚠ must outlast fadeScreenIn's delay + duration in style.css

function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }

// ══════════════════════════════════════════════════════════════
//  LOG SHEET — Letterboxd-style bottom sheet for rating & logging.
//  Reusable from anywhere: openLogSheet(triggerEl) resolves the album
//  from the bento context and mounts a singleton sheet inside the
//  triggering phone screen (.app-screen) so it stays in the frame.
// ══════════════════════════════════════════════════════════════
// Aliased from screens.js (SD_ICONS) rather than redefined — the album page's
// quick-log squares are built into static screen markup there, and the two sets
// of buttons have to draw the same glyphs.
const SDLOG_ICONS = SD_ICONS;
// A single vinyl record used as the rating unit (label punched in the sheet bg colour)
const SDLOG_REC = `<svg class="sd-rec" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="currentColor"/><circle cx="12" cy="12" r="8" fill="none" stroke="rgba(0,0,0,0.28)" stroke-width="0.8"/><circle cx="12" cy="12" r="4.4" fill="#1c1c22"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/></svg>`;
const SDLOG_RECS = SDLOG_REC.repeat(5);
const SDLOG_PENCIL = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>`;
let SDLOG = null;   // { subject, rating, listened, later, fav, text, songs:[{title,rating,text}] }

/* ── Log drafts — an explicit SAVE, with the unsaved work kept aside ─────
   The sheet has a Save button (Eric, 2026-09-18; it autosaved before). Nothing
   you do in the sheet reaches your review — the album page's card, the quick-log
   squares, the library — until Save. But an edit is never LOST either: every
   change writes through to a second store (`spindeck-logs-wip`), so a half-typed
   review survives dismissing the sheet, swiping to another album, and a reload,
   and the sheet reopens on it with Save lit. Typing is debounced (~400ms) so a
   keystroke isn't a storage write; taps write immediately, and closing the
   sheet flushes whatever is still pending. */
const SDLOG_STORE = 'spindeck-logs';
const SDLOG_WIP = 'spindeck-logs-wip';
const SDLOG_DEBOUNCE = 400;
let _sdlogT = null;
// Set while openLogSheet is repainting the sheet from a saved draft. The paint
// helpers (setLogRating / setSongRating) are the same ones the user's taps go
// through, so without this, restoring a draft would immediately re-save it.
let _sdlogRestoring = false;

function logDrafts() {
  try { return JSON.parse(localStorage.getItem(SDLOG_STORE)) || {}; }
  catch (e) { return {}; }        // corrupt or blocked storage → behave as empty
}
function logWips() {
  try { return JSON.parse(localStorage.getItem(SDLOG_WIP)) || {}; }
  catch (e) { return {}; }
}
function putWip(key, d) {               // d = null drops it (saved, so nothing is pending)
  const all = logWips();
  if (d) all[key] = d; else delete all[key];
  try { localStorage.setItem(SDLOG_WIP, JSON.stringify(all)); } catch (e) {}
}
// Subject identity. The title alone collides — two albums can share a name, and
// a song title is not unique across the catalogue — so kind and subtitle ride along.
function logKey(subj) {
  const kind = subj.isSong ? 'song' : subj.isArtist ? 'artist' : 'album';
  return `${kind}::${subj.title}::${subj.subtitle || ''}`;
}
// Write one draft, or drop it if nothing is left in it — an opened-and-abandoned
// sheet must not leave an empty draft behind that reads as "in progress".
function putDraft(key, d) {
  const all = logDrafts();
  const empty = !d.rating && !d.listened && !d.later && !d.fav
             && !(d.text || '').trim() && !(d.songs || []).length;
  if (empty) delete all[key]; else all[key] = { ...d, updated: Date.now() };
  try { localStorage.setItem(SDLOG_STORE, JSON.stringify(all)); } catch (e) {}
}
// The sheet as it stands, in the shape both stores keep.
function logSnapshot() {
  return {
    rating: SDLOG.rating, listened: SDLOG.listened, later: SDLOG.later, fav: SDLOG.fav,
    text: SDLOG.text || '',
    image: SDLOG.subject.image || '', snap: libSnapFor(SDLOG.subject),   // for the Playlists page's library tabs
    // only tracks the user actually touched — the rest is just the tracklist
    songs: (SDLOG.songs || []).filter(s => s.rating > 0 || (s.text || '').trim()),
  };
}
// Every edit lands here. It keeps the work (WIP store) and lights Save — it does
// NOT publish; commitLog does.
function saveLog(now) {
  if (_sdlogRestoring || !SDLOG || !SDLOG.subject) return;
  clearTimeout(_sdlogT); _sdlogT = null;
  SDLOG.dirty = true;
  paintLogSave();
  const write = () => { _sdlogT = null; putWip(logKey(SDLOG.subject), logSnapshot()); };
  if (now) write(); else _sdlogT = setTimeout(write, SDLOG_DEBOUNCE);
}
// The Save button: publish the sheet, drop the WIP, close.
function commitLog() {
  if (!SDLOG || !SDLOG.subject) return;
  clearTimeout(_sdlogT); _sdlogT = null;
  const key = logKey(SDLOG.subject);
  putDraft(key, logSnapshot());
  putWip(key, null);
  SDLOG.dirty = false;
  flashLogSaved();
  closeLogSheet();
}
/* A save does two things beyond the localStorage put: YOUR review card on the
   album page behind the sheet is re-rendered (rating and text), and the
   quick-log squares / CTA / tracklist hearts follow. */
function flashLogSaved() {
  paintLogSave();
  homeShells().forEach(s => syncQuickLog(s));
  homeShells().forEach(s => refreshSongFavs(s));   // the tracklist's hearts follow a song's favourite live
  if (typeof populateReviewList === 'function') homeShells().forEach(s => {
    const active = s.querySelector('.v3-rev-filter.active');       // keep the tab the user chose
    populateReviewList(s, active ? active.dataset.f : 'popular');
  });
}
// Save is lit only while there is something unsaved; otherwise it reads "Saved".
/* POST / REVISE (Eric, 2026-09-25). Something unposted → "Post", lit. Posted
   and unchanged → "Revise" (a tap puts the cursor back in the text; the next
   edit turns it into Post again). Nothing at all yet → "Post", quiet. */
function paintLogSave() {
  const b = document.querySelector('#sd-log .sd-log-save');
  if (!b) return;
  const dirty = !!(SDLOG && SDLOG.dirty);
  const posted = !!(SDLOG && SDLOG.subject && (() => { const d = logDrafts()[logKey(SDLOG.subject)] || {}; return d.rating > 0 || (d.text || '').trim() || (d.songs || []).some(x => x.rating > 0); })());
  b.dataset.mode = dirty ? 'post' : (posted ? 'revise' : 'empty');
  b.disabled = !dirty && !posted;
  b.textContent = dirty ? 'Post' : (posted ? 'Revise' : 'Post');
}
/* What the library tabs need to draw — and reopen — an album that has since
   left ARCHIVE (the rec pool is re-dealt every session). Albums only; a song's
   draft carries just its `image`. Ratings and reviews are NOT stored: they are
   seeded off the title, so plLibOpen regenerates identical ones. */
function libSnapFor(subj) {
  if (!subj || subj.isSong || subj.isArtist) return undefined;
  const a = (window.ARCHIVE || []).find(x => x.album === subj.title && x.artist === (subj.subtitle || ''));
  if (!a) return undefined;
  return { year: a.year || 0, genre: a.genre || '', tracks: a.tracks || 10, image: a.image || '',
           deezerId: a.deezerId, artistId: a.artistId };
}
// Flip one flag on a subject's draft WITHOUT opening the sheet — the album
// page's quick-log squares write through here, so the two surfaces agree.
function writeDraftFlag(subj, k, on) {
  const key = logKey(subj);
  const d = logDrafts()[key] || { rating: 0, listened: false, later: false, fav: false, text: '', songs: [] };
  d[k] = on;
  if (subj.image) d.image = subj.image;
  d.snap = libSnapFor(subj) || d.snap;
  putDraft(key, d);
  // unsaved sheet work for this record must not reopen with the old flag
  const w = logWips()[key];
  if (w) { w[k] = on; putWip(key, w); }
}
// The saved draft for an album, as the quick-log squares need it.
function albumDraft(a) {
  return a ? (logDrafts()[logKey({ title: a.album, subtitle: a.artist })] || {}) : {};
}

/* The grab nub on every bottom sheet: TAP closes, DRAG DOWN follows the finger
   and closes past 70px (or snaps back). Pointer events with capture, so the
   drag survives leaving the nub; `touch-action: none` on the nub keeps the
   sheet's own scroller out of it. The finger's travel is divided by the
   viewer's zoom (rendered / layout width) so the sheet tracks the finger
   rather than moving faster or slower than it. Closing by drag leaves the
   inline transform in place for one frame so the exit transition runs from
   where the sheet was let go, not from the top. */
function wireSheetGrab(ov, sheetSel, close) {
  const grab = ov.querySelector('.sd-log-grab');
  const sheet = ov.querySelector(sheetSel);
  if (!grab || !sheet || grab._wired) return;
  grab._wired = true;
  let y0 = null, dy = 0, k = 1;
  grab.addEventListener('pointerdown', e => {
    y0 = e.clientY; dy = 0;
    k = sheet.getBoundingClientRect().width / sheet.offsetWidth || 1;
    try { grab.setPointerCapture(e.pointerId); } catch (x) {}
    sheet.classList.add('is-dragging');
    e.preventDefault(); e.stopPropagation();
  });
  grab.addEventListener('pointermove', e => {
    if (y0 === null) return;
    dy = Math.max(0, (e.clientY - y0) / k);
    sheet.style.transform = `translateY(${dy}px)`;
  });
  const end = e => {
    if (y0 === null) return;
    y0 = null;
    sheet.classList.remove('is-dragging');
    if (dy > 70 || dy < 6) {                 // a real pull, or a tap
      requestAnimationFrame(() => { sheet.style.transform = ''; close(); });
    } else {
      sheet.style.transform = '';            // snap back up
    }
    e.stopPropagation();
  };
  grab.addEventListener('pointerup', end);
  grab.addEventListener('pointercancel', end);
  grab.addEventListener('click', e => e.stopPropagation());
}

/* ══ PULL TO REFRESH — the home feed and the album wall (2026-09-11) ═══════
   Delegated at the document, so it survives every renderViewer() rebuild
   without being re-wired. A pull starts only on a `.v3-body` that is already
   at the top, inside a shell that has something to refresh (`sdPtrTarget`),
   and never on the album page (the same body, in --review state).

   THE FEEL. The body follows the finger at ~55% (resistance), a vinyl fades
   in and rotates with the pull, and at THRESH it "lands": the disc snaps to
   the album accent and bumps up, the phone buzzes (sdHaptic) — that is the
   moment. Release past it and the disc spins while the feed re-deals; short
   of it, everything eases back. Touch and mouse are handled separately —
   touch needs a non-passive touchmove to stop the scroller (and the
   browser's own pull-to-refresh: `.v3-body` is also `overscroll-behavior-y:
   contain`), mouse is for the desktop viewer.

   ⚠️ A mouse pull ends with mouseup on whatever is under the cursor, and a
   click would follow — on the wall that opens an album. `_ptrSwallow` eats
   the one click that follows an active pull. */
const PTR_THRESH = 64, PTR_MAX = 112;
let _ptr = null, _ptrSwallow = false;
/* `window._sdHold` — true while the cover's shelf wheel is armed (proWheelInit).
   The wheel drags DOWN the same axis a pull does, so while it is up no pull
   may start or continue. See the ⚠️ above the wheel's pointerdown. */
window._sdHold = false;
function sdPtrTarget(t) {
  const body = t && t.closest && t.closest('.v3-body');
  if (!body) return null;
  const scr = body.closest('.s-home-v3');
  if (!scr || scr.classList.contains('s-home-v3--review')) return null;
  const kind = scr.querySelector('.v3-feed-items') ? 'feed' : scr.querySelector('.wall2-grid') ? 'wall' : null;
  return kind ? { body, scr, kind } : null;
}
function sdPtrIndicator(scr, body) {
  let ind = scr.querySelector(':scope > .sd-ptr');
  if (!ind) {
    ind = document.createElement('div');
    ind.className = 'sd-ptr';
    // Two copies of the record: a faint ghost, and the accent one revealed by a
    // clockwise sweep (a conic mask on --p) — it fills like a clock as you pull.
    ind.innerHTML = `<span class="sd-ptr-disc"><span class="sd-ptr-ghost">${SDLOG_REC}</span><span class="sd-ptr-fill">${SDLOG_REC}</span></span>`;
    scr.insertBefore(ind, body);
  }
  ind.style.top = body.offsetTop + 'px';
  return ind;
}
/* Haptics where the web has them. Android: navigator.vibrate. iOS Safari has
   no vibration API; toggling a native `switch` checkbox is the one thing that
   clicks the Taptic engine from a page (17.4+), and only inside a user gesture
   — so it is tried, and nothing is promised. */
function sdHaptic(ms) {
  try { if (navigator.vibrate) navigator.vibrate(ms || 12); } catch (x) {}
  try {
    let sw = document.getElementById('sd-haptic');
    if (!sw) {
      sw = document.createElement('input');
      sw.type = 'checkbox'; sw.id = 'sd-haptic'; sw.setAttribute('switch', '');
      sw.style.cssText = 'position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;left:-9px;top:-9px';
      document.body.appendChild(sw);
    }
    sw.click();
  } catch (x) {}
}
function sdRefreshShell(kind) {
  if (kind === 'feed') {
    window._FEED = null;                                   // feedEvents() deals a fresh feed
    document.querySelectorAll('.v3-feed-items').forEach(el => {
      const scr = el.closest('.s-home-v3');
      if (scr && typeof renderFriendFeed === 'function') renderFriendFeed(scr);
    });
  } else if (kind === 'wall') {
    document.querySelectorAll('.wall2-grid').forEach(g => { g.innerHTML = wallGridHtml(); });
  }
}
function sdPtrStart(t, x, y) {
  if (_ptr || window._sdHold) return;
  const h = sdPtrTarget(t);
  if (!h || h.body.scrollTop > 0 || h.body.classList.contains('is-refreshing')) return;
  _ptr = { ...h, x0: x, y0: y, pull: 0, armed: false, active: false,
           k: h.body.getBoundingClientRect().width / h.body.offsetWidth || 1 };
}
// Returns true while the pull owns the gesture (caller preventDefaults).
function sdPtrMove(x, y) {
  const s = _ptr; if (!s) return false;
  if (window._sdHold) { _ptr = null; return false; }     // the wheel armed mid-pull: it owns the axis now
  const dy = (y - s.y0) / s.k, dx = (x - s.x0) / s.k;
  if (!s.active) {
    if (dy < -4 || Math.abs(dx) > 12 && Math.abs(dx) > dy) { _ptr = null; return false; }   // a scroll up or a sideways swipe
    if (dy < 8) return false;
    s.active = true;
    s.ind = sdPtrIndicator(s.scr, s.body);
    s.body.classList.add('is-pulling');
    s.body.classList.remove('ptr-settle');
  }
  const pull = Math.max(0, Math.min(PTR_MAX, dy * 0.55));
  s.pull = pull;
  s.body.style.transform = `translateY(${pull}px)`;
  s.ind.style.setProperty('--p', Math.min(1, pull / PTR_THRESH).toFixed(3));
  const armed = pull >= PTR_THRESH;
  if (armed !== s.armed) {
    s.armed = armed;
    s.ind.classList.toggle('is-armed', armed);
    if (armed) sdHaptic(12);
  }
  return true;
}
function sdPtrEnd() {
  const s = _ptr; _ptr = null;
  if (!s || !s.active) return;
  _ptrSwallow = true; setTimeout(() => { _ptrSwallow = false; }, 0);
  s.body.classList.remove('is-pulling');
  s.body.classList.add('ptr-settle');
  const done = () => {
    s.body.style.transform = '';
    s.ind.classList.remove('is-armed', 'is-refreshing');
    s.ind.style.setProperty('--p', '0');       // the disc's opacity rides --p: put it away, or it stays
    s.body.classList.remove('is-refreshing');
    setTimeout(() => s.body.classList.remove('ptr-settle'), 420);
  };
  if (!s.armed) { done(); return; }
  // Landed: hold the body a little open, spin the disc, re-deal, settle.
  s.body.classList.add('is-refreshing');
  s.ind.classList.add('is-refreshing');
  s.body.style.transform = `translateY(${Math.round(PTR_THRESH * 0.75)}px)`;
  sdHaptic(8);
  setTimeout(() => { sdRefreshShell(s.kind); done(); }, 700);
}
document.addEventListener('touchstart', e => { if (e.touches.length === 1) sdPtrStart(e.target, e.touches[0].clientX, e.touches[0].clientY); }, { passive: true, capture: true });
document.addEventListener('touchmove',  e => {
  if (window._sdHold) { if (e.cancelable) e.preventDefault(); return; }   // the wheel's drag: nothing else scrolls
  if (_ptr && e.touches.length === 1 && sdPtrMove(e.touches[0].clientX, e.touches[0].clientY)) e.preventDefault();
}, { passive: false, capture: true });
document.addEventListener('touchend',    sdPtrEnd, true);
document.addEventListener('touchcancel', sdPtrEnd, true);
document.addEventListener('mousedown', e => { if (e.button === 0) sdPtrStart(e.target, e.clientX, e.clientY); }, true);
document.addEventListener('mousemove', e => { if (_ptr && sdPtrMove(e.clientX, e.clientY)) e.preventDefault(); }, true);
document.addEventListener('mouseup', sdPtrEnd, true);
document.addEventListener('click', e => { if (_ptrSwallow) { e.stopPropagation(); e.preventDefault(); } }, true);

/* csharpuser (2026-09-25, later the same day): the toggle belts (the
   POPULAR ribbon round each word once it was on) are gone with the ribbon.
   An ON toggle is now just the icon and the word in the toggle's colour. */
function ensureLogSheet() {
  let ov = document.getElementById('sd-log');
  if (ov) return ov;
  ov = document.createElement('div');
  ov.id = 'sd-log';
  ov.className = 'sd-log-overlay';
  ov.innerHTML = `
    <div class="sd-log-sheet" role="dialog" aria-modal="true">
      <div class="sd-log-grab"></div>
      <div class="sd-log-head">
        <!-- ONE button, centred over the cover (Eric, 2026-09-25): POST while
             there is something to post, REVISE once it is — a tap on Revise
             puts the cursor back in the review. No Share here any more. No ✕:
             the sheet is dismissed by the nub (tap / drag down) or a tap
             outside it. Keeps the .sd-log-save class: paintLogSave drives it. -->
        <!-- The Post button sits OVER the cover (Eric, 2026-09-25), with a drop
             shadow, so it takes no room — and it is only there once something
             has changed (paintLogSave shows it on data-mode="post"). -->
        <div class="sd-log-cover">
          <div class="sd-log-actions">
            <button class="sd-log-save sd-log-post" type="button" disabled>Post</button>
          </div>
        </div>
        <div class="sd-log-meta">
          <div class="sd-log-title"><span class="sd-log-album"></span><span class="sd-log-year"></span></div>
          <div class="sd-log-artist"></div>
        </div>
      </div>
      <div class="sd-log-rate">
        <span class="sd-log-num is-blank" aria-hidden="true">0.0</span>
        <span class="sd-log-stars-track" role="slider" tabindex="0" aria-label="Rating"
              aria-valuemin="0" aria-valuemax="5" aria-valuenow="0" aria-valuetext="No rating">
          <span class="sd-log-stars-empty">${SDLOG_RECS}</span>
          <span class="sd-log-stars-fill">${SDLOG_RECS}</span>
        </span>
      </div>
      <div class="sd-log-opts">
        <button class="sd-log-opt" data-k="listened"><span class="sd-log-opt-ico">${SDLOG_ICONS.ear}</span><span class="sd-log-opt-lbl">Listened</span></button>
        <button class="sd-log-opt" data-k="later"><span class="sd-log-opt-ico">${SDLOG_ICONS.clock}</span><span class="sd-log-opt-lbl">Listen later</span></button>
        <button class="sd-log-opt" data-k="fav"><span class="sd-log-opt-ico">${SDLOG_ICONS.heart}</span><span class="sd-log-opt-lbl">Favorite</span></button>
      </div>
      <div class="sd-log-review">
        <textarea class="sd-log-write" rows="3" placeholder="Write a review…"></textarea>
      </div>
      <div class="sd-log-songs" hidden>
        <div class="sd-log-songs-hd">Optional <span class="sd-log-songs-sub">only rated songs get logged</span></div>
        <div class="sd-log-songs-list"></div>
      </div>
    </div>`;

  ov.addEventListener('click', e => { e.stopPropagation(); if (e.target === ov) closeLogSheet(); });
  ov.addEventListener('mousedown', e => e.stopPropagation());
  ov.querySelector('.sd-log-sheet').addEventListener('click', e => e.stopPropagation());
  ov.querySelector('.sd-log-save').addEventListener('click', function () {
    // Revise: nothing new to post — put the cursor back in the review.
    if (this.dataset.mode === 'revise') { const w = ov.querySelector('.sd-log-write'); if (w) { w.focus(); w.setSelectionRange(w.value.length, w.value.length); } return; }
    commitLog();
  });
  wireSheetGrab(ov, '.sd-log-sheet', closeLogSheet);
  /* Share what you just wrote. Reads live SDLOG rather than the saved draft so
     the post reflects the sheet as it stands, saved or not. */
  const shareBtn0 = ov.querySelector('.sd-log-share');
  if (shareBtn0) shareBtn0.addEventListener('click', function (e) {
    if (!SDLOG || !SDLOG.subject) return;
    const arch = window.ARCHIVE || [];
    const album = arch.find(x => x.album === SDLOG.subject.title);
    if (!album) return;                       // songs / artists have no card yet
    openShareSheet(e.currentTarget, album, {
      rating: SDLOG.rating, text: SDLOG.text,
      songs: (SDLOG.songs || []).filter(x => x.rating > 0),   // only what you actually scored
    });
  });
  ov.querySelectorAll('.sd-log-opt').forEach(b => b.addEventListener('click', () => toggleLogOpt(b.dataset.k, b)));
  // The review itself — kept (debounced) on every keystroke; published on Save.
  ov.querySelector('.sd-log-write').addEventListener('input', e => {
    if (!SDLOG) return;
    SDLOG.text = e.target.value;
    e.target.classList.toggle('has-text', !!e.target.value.trim());   // keeps the box grown after blur
    saveLog();
  });

  /* ── The vinyl rate control ─────────────────────────────────────────────
     Built to the usual five-star guidance, translated to records:
       • each record is its own SQUARE hit cell (a fifth of the track, padded
         vertically by ::before to match) — ≥44px, the WCAG touch minimum;
       • the LEFT half of a record is the half, the RIGHT half the whole —
         Letterboxd's half-star rule — so a tap needs no second control;
       • a PRESS sets, a SLIDE adjusts with the fill and the number following
         the finger live (feedback while you act, not after);
       • sliding LEFT past the first record clears to nothing (tapping the
         value you already have does NOT clear it — Eric, 2026-09-11: a tap
         always sets what it lands on, so a re-tap is just a confirmation);
       • a step change buzzes on devices that can (`navigator.vibrate`,
         Android; iOS Safari has no web haptics), and the keyboard works:
         ←/→ by a half, Home/End, Delete to clear (role="slider").
     Only the RELEASE commits: painting is free, but `setLogRating` also saves
     the draft and pokes the pet, and neither should fire sixty times a drag. */
  const track = ov.querySelector('.sd-log-stars-track');
  let rateDown = null;                      // { x0, v0, last } while a finger is on it
  const valueAt = clientX => {
    const r = track.getBoundingClientRect();
    const x = clientX - r.left;
    if (x < -8) return 0;                   // slid off the left edge → clear
    const cell = r.width / 5;
    const i = Math.max(0, Math.min(4, Math.floor(x / cell)));
    const half = (x - i * cell) < cell / 2;
    return Math.min(5, i + (half ? 0.5 : 1));
  };
  const buzz = () => { try { navigator.vibrate && navigator.vibrate(6); } catch (x) {} };
  track.addEventListener('pointerdown', e => {
    if (!SDLOG) return;
    e.preventDefault(); e.stopPropagation();
    try { track.setPointerCapture(e.pointerId); } catch (x) {}
    const v = valueAt(e.clientX);
    rateDown = { x0: e.clientX, v0: SDLOG.rating, last: v };
    track.classList.add('is-rating');
    paintLogRating(v); buzz();
  });
  track.addEventListener('pointermove', e => {
    if (!rateDown) return;
    const v = valueAt(e.clientX);
    if (v === rateDown.last) return;
    rateDown.last = v;
    paintLogRating(v); buzz();
  });
  const rateEnd = e => {
    if (!rateDown) return;
    const d = rateDown; rateDown = null;
    track.classList.remove('is-rating');
    setLogRating(d.last);
  };
  track.addEventListener('pointerup', rateEnd);
  track.addEventListener('pointercancel', e => { if (rateDown) { rateDown = null; track.classList.remove('is-rating'); paintLogRating(SDLOG ? SDLOG.rating : 0); } });
  track.addEventListener('click', e => e.stopPropagation());   // the pointer pair already handled it
  track.addEventListener('keydown', e => {
    if (!SDLOG) return;
    const cur = SDLOG.rating || 0;
    let v = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp')   v = Math.min(5, cur + 0.5);
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowDown') v = Math.max(0, cur - 0.5);
    if (e.key === 'Home') v = 0.5;
    if (e.key === 'End')  v = 5;
    if (e.key === 'Delete' || e.key === 'Backspace') v = 0;
    if (v === null) return;
    e.preventDefault();
    setLogRating(v);
  });

  // Per-song rating + note (event-delegated over the song list)
  const songs = ov.querySelector('.sd-log-songs-list');
  songs.addEventListener('click', e => {
    // The quick favourite (Eric, 2026-09-18): the heart left of the discs.
    // It writes the SONG's own draft (`song::title::album`), the one the
    // song's sheet and the tracklist's heart-for-a-number read, so all three
    // agree — not the album draft's `songs[]`, which is ratings and notes.
    const fb = e.target.closest('.sd-log-song-fav');
    if (fb) {
      e.stopPropagation();
      const row = fb.closest('.sd-log-song');
      const s = SDLOG && SDLOG.songs[+row.dataset.i];
      if (!s || !SDLOG.subject) return;
      const key = `song::${s.title}::${SDLOG.subject.title}`;
      const d = logDrafts()[key] || {};
      d.fav = !d.fav;
      putDraft(key, d);
      fb.classList.toggle('on', d.fav);
      homeShells().forEach(sc => refreshSongFavs(sc));
      return;
    }
    const rt = e.target.closest('.sd-log-song-rate-track');
    if (rt) {
      const row = rt.closest('.sd-log-song');
      const r = rt.getBoundingClientRect();
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
      setSongRating(+row.dataset.i, Math.max(0.5, Math.min(5, Math.ceil((x / r.width) * 10) / 2)));
      return;
    }
    const nb = e.target.closest('.sd-log-song-note-btn');
    if (nb) {
      const row = nb.closest('.sd-log-song');
      row.classList.toggle('open-note');
      const inp = row.querySelector('.sd-log-song-note');
      if (row.classList.contains('open-note') && inp) inp.focus();
    }
  });
  songs.addEventListener('input', e => {
    const inp = e.target.closest('.sd-log-song-note');
    if (!inp || !SDLOG) return;
    const row = inp.closest('.sd-log-song');
    const i = +row.dataset.i;
    if (SDLOG.songs[i]) { SDLOG.songs[i].text = inp.value; markSongLogged(row, i); saveLog(); }
  });
  return ov;
}

window.openLogSheet = function(triggerEl, subject) {
  const album = (window.currentBentoAlbum && currentBentoAlbum()) || window.activeAlbum || window.featuredAlbum;
  const scrEl = triggerEl && triggerEl.closest && triggerEl.closest('.s-home-v3');
  const artistMode = scrEl && scrEl.classList.contains('s-home-v3--artist');
  // subject lets a song / artist reuse the sheet; falls back to the album
  let subj = subject;
  if (!subj) {
    if (artistMode && album) subj = { image: ARTIST_IMG[album.artist] || album.image, title: album.artist, subtitle: album.genre || '', isArtist: true };
    else if (album) subj = { image: album.image, title: album.album, subtitle: album.artist, year: album.year || '' };
  }
  if (!subj) return;
  const host = (triggerEl && triggerEl.closest && triggerEl.closest('.app-screen'))
             || document.querySelector('.app-screen') || document.body;
  const ov = ensureLogSheet();
  host.appendChild(ov);   // mount into the triggering phone screen so it stays in-frame

  // Reopen where you left off — unsaved work first (Save comes back lit), else
  // what was last saved.
  const wip = logWips()[logKey(subj)];
  const saved = wip || logDrafts()[logKey(subj)] || {};
  _sdlogRestoring = true;
  SDLOG = {
    subject: subj,
    rating: saved.rating || 0,
    listened: !!saved.listened, later: !!saved.later, fav: !!saved.fav,
    text: saved.text || '',
    songs: [],
    dirty: !!wip,
  };
  paintLogSave();
  ov.querySelector('.sd-log-cover').style.backgroundImage = `url("${subj.image}")`;
  ov.querySelector('.sd-log-album').textContent = subj.title;
  ov.querySelector('.sd-log-year').textContent = subj.year || '';   // :empty hides it (songs / artists)
  ov.querySelector('.sd-log-artist').textContent = subj.subtitle;
  ov.querySelector('.sd-log-write').value = SDLOG.text;
  ov.querySelector('.sd-log-write').classList.toggle('has-text', !!(SDLOG.text || '').trim());
  ov.querySelectorAll('.sd-log-opt').forEach(b => b.classList.toggle('on', !!SDLOG[b.dataset.k]));
  setLogRating(SDLOG.rating);
  // Album mode → per-song rows below; single-song mode → no nested song list,
  // and no text review (songs are vinyl-rated only).
  const reviewBox = ov.querySelector('.sd-log-review');
  if (subj.isSong) {
    const box = ov.querySelector('.sd-log-songs'); if (box) box.hidden = true;
    if (reviewBox) reviewBox.hidden = true;                 // song: vinyl only
  } else if (subj.isArtist) {
    const box = ov.querySelector('.sd-log-songs'); if (box) box.hidden = true;
    if (reviewBox) reviewBox.hidden = false;                // artist: vinyl + text review, no songs
  } else {
    if (reviewBox) reviewBox.hidden = false;
    fillLogSongs(ov, album);
  }
  const shareBtn = ov.querySelector('.sd-log-share');
  if (shareBtn) shareBtn.hidden = !!(subj.isSong || subj.isArtist);
  const sheet = ov.querySelector('.sd-log-sheet');
  if (sheet) {
    sheet.scrollTop = 0;
    // A song has no review box and no song list, so the sheet ends under the
    // three buttons instead of standing 95% tall over nothing (2026-09-11).
    sheet.classList.toggle('sd-log-sheet--song', !!subj.isSong);
  }
  _sdlogRestoring = false;              // paints done — live edits count from here
  requestAnimationFrame(() => ov.classList.add('open'));
};

// Build the per-song rating/review rows for an album's log sheet.
function fillLogSongs(ov, album) {
  const box = ov.querySelector('.sd-log-songs');
  const list = ov.querySelector('.sd-log-songs-list');
  if (!box || !list) return;
  const songs = album ? songsFor(album) : [];
  if (!songs.length) { box.hidden = true; list.innerHTML = ''; if (SDLOG) SDLOG.songs = []; return; }
  // Merge any saved per-song ratings back in, keyed by TITLE rather than index:
  // the draft only stores the tracks that were touched, so its indices are not
  // the tracklist's.
  const savedSongs = (SDLOG && (logWips()[logKey(SDLOG.subject)] || logDrafts()[logKey(SDLOG.subject)]) || {}).songs || [];
  const byTitle = new Map(savedSongs.map(s => [s.title, s]));
  if (SDLOG) SDLOG.songs = songs.map(s => {
    const prev = byTitle.get(s.title);
    return { title: s.title, rating: (prev && prev.rating) || 0, text: (prev && prev.text) || '' };
  });
  box.hidden = false;
  const heart = typeof RVP_HEART !== 'undefined' ? RVP_HEART : '♥';
  list.innerHTML = songs.map((s, i) => `
    <div class="sd-log-song" data-i="${i}">
      <span class="sd-log-song-num">${i + 1}</span>
      <span class="sd-log-song-title">${s.title}</span>
      <button class="sd-log-song-fav${songIsFav(album, s.title) ? ' on' : ''}" type="button" aria-label="Favourite">${heart}</button>
      <span class="sd-log-song-val is-blank">0.0</span>
      <span class="sd-log-song-rate-track">
        <span class="sd-log-song-empty">${SDLOG_RECS}</span>
        <span class="sd-log-song-fill" style="width:0">${SDLOG_RECS}</span>
      </span>
    </div>`).join('');
  // Repaint whatever came back from the draft (rows render empty).
  if (SDLOG) SDLOG.songs.forEach((s, i) => { if (s.rating) setSongRating(i, s.rating); });
}

function setSongRating(i, v) {
  if (!SDLOG || !SDLOG.songs[i]) return;
  SDLOG.songs[i].rating = v;
  const ov = document.getElementById('sd-log');
  const row = ov && ov.querySelector(`.sd-log-song[data-i="${i}"]`);
  if (!row) return;
  const fill = row.querySelector('.sd-log-song-fill');
  if (fill) fill.style.width = recFillWidth(v);
  const val = row.querySelector('.sd-log-song-val');
  if (val) { val.textContent = v ? Number(v).toFixed(1) : '0.0'; val.classList.toggle('is-blank', !v); }   // the big number's rule, per song
  markSongLogged(row, i);
  saveLog(true);
}

// A song is "logged" once it has a rating or a note; reflected as a highlight.
function markSongLogged(row, i) {
  const s = SDLOG && SDLOG.songs[i];
  const logged = !!s && (s.rating > 0 || (s.text && s.text.trim().length > 0));
  row.classList.toggle('is-logged', logged);
}

window.closeLogSheet = function() {
  if (_sdlogT) saveLog(true);   // flush a pending debounce into the WIP — dismissing must never drop keystrokes
  const ov = document.getElementById('sd-log');
  if (ov) ov.classList.remove('open');
  // Whatever was just logged may light the album page's quick-log squares.
  // (Not `forEach(syncQuickLog)` — that hands the array INDEX in as the album,
  // so the second shell read albumDraft(1) → {} and was wiped on every close.)
  homeShells().forEach(s => syncQuickLog(s));
};

/* ⚠️ The fill's width is measured in RECORDS AND GAPS, not as a percentage of
   the row. The row is 5 discs + 4 gaps, so "70%" of it is not the middle of
   the fourth disc — at 0.5 a 10% fill covered 55% of the first record, at 4.5
   a 90% fill covered 45% of the last. `--rec` / `--gap` live on the track's
   container in app.css (the big control and the per-song rows each set their
   own), so the maths follows any resize. A full five is simply 100%. */
function recFillWidth(v) {
  const whole = Math.floor(v), half = (v - whole) >= 0.5;
  if (whole >= 5) return '100%';
  if (!whole && !half) return '0px';
  return `calc(${whole} * (var(--rec) + var(--gap))${half ? ' + var(--rec) / 2' : ''})`;
}
// Paint only — the fill and the slider's ARIA value. Used live while a finger
// is on the track; nothing is saved until it lifts.
function paintLogRating(v) {
  const ov = document.getElementById('sd-log');
  if (!ov) return;
  const label = v ? String(v).replace(/\.0$/, '') : '';
  ov.querySelector('.sd-log-stars-fill').style.width = recFillWidth(v);
  // The big number beside the discs follows (Eric, 2026-09-25): "_._" until rated.
  const num = ov.querySelector('.sd-log-num');
  if (num) { num.textContent = v ? Number(v).toFixed(1) : '0.0'; num.classList.toggle('is-blank', !v); }
  const track = ov.querySelector('.sd-log-stars-track');
  if (track) {
    track.setAttribute('aria-valuenow', String(v || 0));
    track.setAttribute('aria-valuetext', v ? `${label} of 5` : 'No rating');
  }
}
function setLogRating(v) {
  if (!SDLOG) return;
  SDLOG.rating = v;
  const ov = document.getElementById('sd-log');
  if (!ov) return;
  paintLogRating(v);
  saveLog(true);          // a tap, not typing — no reason to debounce it
  // ⚠️ Only for a real tap. openLogSheet() calls this to REPAINT a saved draft,
  // so without the guard the pet threw a rating reaction every time the sheet
  // opened on an album you'd already scored — the same reason saveLog() checks
  // this flag two lines up.
  if (!_sdlogRestoring) sceneReact('rate');
}

function toggleLogOpt(k, btn) {
  if (!SDLOG) return;
  SDLOG[k] = !SDLOG[k];
  btn.classList.toggle('on', SDLOG[k]);
  /* The three toggles PUBLISH THEMSELVES (Eric, 2026-09-25: "only do a Post
     for number and text reviews, not the three icons"): the flag goes
     straight into the saved draft — and into the work-in-progress too, if
     one is pending, so the eventual Post carries it — without marking the
     sheet dirty, so no Post button appears for a tap on Listened. */
  const key = logKey(SDLOG.subject);
  const d = logDrafts()[key] || { rating: 0, listened: false, later: false, fav: false, text: '', songs: [],
                                  image: SDLOG.subject.image || '', snap: libSnapFor(SDLOG.subject) };
  d[k] = SDLOG[k];
  putDraft(key, d);
  const w = logWips()[key];
  if (w) { w[k] = SDLOG[k]; putWip(key, w); }
  homeShells().forEach(s => syncQuickLog(s));
  // The pet is behind the sheet right now, so this queues and plays on close.
  sceneReact(SDLOG[k] ? k : 'undo');
}

/* ============================================================
   SEARCH — fullscreen overlay over the current phone screen.
   TikTok-style: a search field, live autocomplete suggestions on
   top (top 5, per keystroke), then Artists / Albums / Songs result
   sections. Tabs below the field funnel results into one category.
   All data comes from the local catalogue (ARCHIVE + songsFor).
   ============================================================ */
function buildSearchIndex() {
  if (window.SEARCH_INDEX) return window.SEARCH_INDEX;
  const arch = window.ARCHIVE || [];
  const artistMap = new Map();
  const albums = [], songs = [];
  arch.forEach(a => {
    albums.push({ album: a.album, artist: a.artist, image: a.image, genre: a.genre, year: a.year, rating: a.rating, ref: a });
    if (!artistMap.has(a.artist)) {
      artistMap.set(a.artist, { name: a.artist, image: (window.ARTIST_IMG && ARTIST_IMG[a.artist]) || a.image, genre: a.genre, count: 0 });
    }
    artistMap.get(a.artist).count++;
    songsFor(a).forEach(s => songs.push({ title: s.title, album: a.album, artist: a.artist, image: a.image, dur: s.dur, rating: s.rating, ref: a }));
  });
  window.SEARCH_INDEX = { artists: [...artistMap.values()], albums, songs };
  return window.SEARCH_INDEX;
}
// Match rank: prefix (0) beats word-start (1) beats anywhere (2); -1 = no match.
function _sdsRank(text, q) {
  const t = String(text).toLowerCase();
  const i = t.indexOf(q);
  if (i < 0) return -1;
  if (i === 0) return 0;
  if (t[i - 1] === ' ') return 1;
  return 2;
}
function _sdsEsc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
// Bold the matched substring within a result/suggestion label.
function _sdsHi(text, q) {
  const lo = String(text).toLowerCase(), i = lo.indexOf(q);
  if (i < 0) return _sdsEsc(text);
  return _sdsEsc(text.slice(0, i)) + '<b>' + _sdsEsc(text.slice(i, i + q.length)) + '</b>' + _sdsEsc(text.slice(i + q.length));
}

// ── Search zero state ─────────────────────────────────────────
// Trending searches + a rail of trending covers, shown whenever the field is
// empty. Typing replaces it (runSearch rebuilds .sds-results every keystroke),
// clearing the field brings it back.

// A blend of archive artists and albums, ranked by a day-seeded "heat" so the
// chart rotates daily like featuredAlbum but stays put within a session.
function sdsTrendingSearches(n = 8) {
  const idx = buildSearchIndex();
  const rnd = seedRand('trend::' + Math.floor(Date.now() / 86400000));
  const pool = [
    ...idx.artists.map(a => ({ term: a.name, kind: 'Artist' })),
    ...idx.albums.map(a => ({ term: a.album, kind: 'Album', sub: a.artist })),
  ];
  pool.forEach(p => { p.heat = rnd(); });
  pool.sort((a, b) => b.heat - a.heat);

  const seen = new Set(), out = [];
  for (const p of pool) {
    const k = p.term.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(p);
    if (out.length >= n) break;
  }
  // Fictional search volume. The jitter band (±800) stays under the step
  // (3200) so the chart is always strictly descending.
  out.forEach((p, i) => {
    p.count = Math.max(900, Math.round(34000 - i * 3200 + (p.heat - 0.5) * 1600));
  });
  return out;
}

const SDS_RAIL_N = 10;   // covers in the "Trending now" rail

function sdsZeroHtml(ov) {
  // trendingAlbums is the whole rotated archive, not a short list — take the
  // head of it, and fall back to the most-reviewed albums if it's ever empty.
  const source = (window.trendingAlbums || []).length
    ? window.trendingAlbums
    : (window.ARCHIVE || []).slice().sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
  const cards = source.slice(0, SDS_RAIL_N);

  // sdsOpenResult resolves taps through ov._last.albums[i].ref — index the
  // rail the same way so the existing open path works unchanged.
  ov._last = { artists: [], albums: cards.map(a => ({ ref: a })), songs: [] };

  const rows = sdsTrendingSearches(8).map((t, i) => `
    <button class="sds-trend${i < 3 ? ' sds-trend--top' : ''}" data-pick="${_sdsEsc(t.term).replace(/"/g, '&quot;')}">
      <span class="sds-trend-n">${i + 1}</span>
      <span class="sds-row-main">
        <span class="sds-row-t">${_sdsEsc(t.term)}</span>
        <span class="sds-row-s">${t.kind}${t.sub ? ' · <b>' + _sdsEsc(t.sub) + '</b>' : ''}</span>
      </span>
      <span class="sds-trend-ct">${window.fmtRc(t.count)}</span>
    </button>`).join('');

  const railCards = cards.map((a, i) => `
    <button class="sds-tcard" data-type="album" data-i="${i}">
      <span class="sds-tcard-art" style="background-image:url('${a.image}')"></span>
      <span class="sds-tcard-t">${_sdsEsc(a.album)}</span>
      <span class="sds-tcard-s">${_sdsEsc(a.artist)}</span>
    </button>`).join('');

  return `
    <div class="sds-sec">
      <div class="sds-sec-hd">Trending searches</div>
      ${rows}
    </div>
    <div class="sds-sec">
      <div class="sds-sec-hd">Trending now</div>
      <div class="sds-rail">${railCards}</div>
    </div>`;
}

function runSearch() {
  const ov = document.getElementById('sd-search');
  if (!ov) return;
  const q = ov.querySelector('.sds-input').value.trim().toLowerCase();
  const cat = ov._cat || 'all';
  const idx = buildSearchIndex();
  const sugEl = ov.querySelector('.sds-suggest');
  const resEl = ov.querySelector('.sds-results');
  ov.querySelector('.sds-clear').classList.toggle('show', !!q);

  if (!q) {
    sugEl.innerHTML = '';
    resEl.innerHTML = sdsZeroHtml(ov);   // sets ov._last for the rail
    return;
  }

  const rank = (arr, key) => arr
    .map(o => ({ o, r: _sdsRank(o[key], q) }))
    .filter(x => x.r >= 0)
    .sort((a, b) => a.r - b.r || String(a.o[key]).length - String(b.o[key]).length)
    .map(x => x.o);
  const artists = rank(idx.artists, 'name');
  const albums  = rank(idx.albums, 'album');
  const songs   = rank(idx.songs, 'title');
  ov._last = { artists, albums, songs };

  // ── Autocomplete suggestions (top 5) — only on the All tab ──
  if (cat === 'all') {
    const seen = new Set(), sug = [];
    [...artists.map(a => a.name), ...albums.map(a => a.album), ...songs.map(s => s.title)].forEach(n => {
      const r = _sdsRank(n, q); if (r < 0) return;
      const k = n.toLowerCase(); if (seen.has(k)) return; seen.add(k);
      sug.push({ n, r });
    });
    sug.sort((a, b) => a.r - b.r || a.n.length - b.n.length);
    sugEl.innerHTML = sug.slice(0, 5).map(s => `
      <button class="sds-sug" data-pick="${_sdsEsc(s.n).replace(/"/g, '&quot;')}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
        <span class="sds-sug-t">${_sdsHi(s.n, q)}</span>
        <svg class="sds-sug-go" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8"/></svg>
      </button>`).join('');
  } else {
    sugEl.innerHTML = '';
  }

  // ── Result rows ──
  const artHtml = (a, i) => `
    <button class="sds-row" data-type="artist" data-i="${i}">
      <span class="sds-thumb sds-thumb--round" style="background-image:url('${a.image}')"></span>
      <span class="sds-row-main"><span class="sds-row-t">${_sdsHi(a.name, q)}</span><span class="sds-row-s">Artist · ${a.count} album${a.count > 1 ? 's' : ''}</span></span>
    </button>`;
  const albHtml = (a, i) => `
    <button class="sds-row" data-type="album" data-i="${i}">
      <span class="sds-thumb" style="background-image:url('${a.image}')"></span>
      <span class="sds-row-main"><span class="sds-row-t">${_sdsHi(a.album, q)}</span><span class="sds-row-s">Album · <b>${_sdsEsc(a.artist)}</b>${a.year ? ' · ' + a.year : ''}</span></span>
    </button>`;
  const sngHtml = (s, i) => `
    <button class="sds-row" data-type="song" data-i="${i}">
      <span class="sds-thumb" style="background-image:url('${s.image}')"></span>
      <span class="sds-row-main"><span class="sds-row-t">${_sdsHi(s.title, q)}</span><span class="sds-row-s">Song · ${_sdsEsc(s.album)} · <b>${_sdsEsc(s.artist)}</b></span></span>
      <span class="sds-row-dur">${s.dur}</span>
    </button>`;
  // All tab shows a compact top-3 per category; typing narrows it and the
  // tabs above open the full per-category list. No "see all" rows.
  const section = (title, items, render) => {
    if (!items.length) return '';
    return `<div class="sds-sec"><div class="sds-sec-hd">${title}</div>${items.slice(0, 3).map(render).join('')}</div>`;
  };

  let html = '';
  if (cat === 'all') {
    html += section('Artists', artists, artHtml);
    html += section('Albums', albums, albHtml);
    html += section('Songs', songs, sngHtml);
  } else if (cat === 'artists') { html = artists.map(artHtml).join(''); }
  else if (cat === 'albums')   { html = albums.map(albHtml).join(''); }
  else if (cat === 'songs')    { html = songs.map(sngHtml).join(''); }
  if (!html.trim()) html = `<div class="sds-empty">No matches for &ldquo;${_sdsEsc(q)}&rdquo;.</div>`;
  resEl.innerHTML = html;
  // …then let Deezer fill in underneath (debounced, appends its own section).
  // The index only holds the persona's ~30 albums, so anything outside their
  // shelf — "steely dan" — has no local match at all.
  if (typeof sdsRemoteSearch === 'function') sdsRemoteSearch(q, ov);
}

// Result tap → browse to it (artist / album page), then close the overlay.
function sdsOpenResult(type, i) {
  const ov = document.getElementById('sd-search');
  const last = (ov && ov._last) || {};
  closeSearch();
  if (type === 'artist') { const a = (last.artists || [])[i]; if (a) window.openArtistPageFor(a.name); }
  else if (type === 'album') { const a = (last.albums || [])[i]; if (a && a.ref) window.openAlbumPage(a.ref); }
  else if (type === 'song') { const s = (last.songs || [])[i]; if (s && s.ref) window.openAlbumPage(s.ref); }
}

function ensureSearchOverlay() {
  let ov = document.getElementById('sd-search');
  if (ov) return ov;
  ov = document.createElement('div');
  ov.id = 'sd-search';
  ov.className = 'sds-overlay';
  ov.innerHTML = `
    <div class="sds-panel" role="dialog" aria-modal="true" aria-label="Search">
      <div class="sds-top">
        <button class="sds-back" aria-label="Close search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <div class="sds-inputwrap">
          <svg class="sds-input-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
          <input class="sds-input" type="text" placeholder="Artists, albums, songs" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false">
          <button class="sds-clear" aria-label="Clear search">✕</button>
        </div>
      </div>
      <div class="sds-tabs">
        <button class="sds-tab active" data-cat="all">All</button>
        <button class="sds-tab" data-cat="artists">Artists</button>
        <button class="sds-tab" data-cat="albums">Albums</button>
        <button class="sds-tab" data-cat="songs">Songs</button>
      </div>
      <div class="sds-body">
        <div class="sds-suggest"></div>
        <div class="sds-results"></div>
      </div>
    </div>`;

  ov.querySelector('.sds-back').addEventListener('click', closeSearch);
  const inp = ov.querySelector('.sds-input');
  inp.addEventListener('input', runSearch);
  inp.addEventListener('keydown', e => { if (e.key === 'Escape') closeSearch(); });
  ov.querySelector('.sds-clear').addEventListener('click', () => { inp.value = ''; inp.focus(); runSearch(); });
  ov.querySelectorAll('.sds-tab').forEach(t => t.addEventListener('click', () => {
    ov._cat = t.dataset.cat;
    ov.querySelectorAll('.sds-tab').forEach(x => x.classList.toggle('active', x === t));
    ov.querySelector('.sds-body').scrollTop = 0;
    runSearch();
  }));
  // Delegated taps, matched on data attributes rather than class so the zero
  // state's trending rows (.sds-trend) and cover rail (.sds-tcard) ride the
  // same two paths as .sds-sug / .sds-row.
  ov.addEventListener('click', e => {
    const pick = e.target.closest('[data-pick]');       // fill the field + search
    if (pick) { inp.value = pick.dataset.pick; inp.focus(); runSearch(); return; }
    const row = e.target.closest('[data-type][data-i]'); // browse to the result
    if (row) sdsOpenResult(row.dataset.type, +row.dataset.i);
  });
  return ov;
}

window.openSearch = function (triggerEl) {
  const host = (triggerEl && triggerEl.closest && triggerEl.closest('.app-screen'))
             || document.querySelector('.app-screen') || document.body;
  // The nav's Search button while searching: put it away (Eric, 2026-09-24).
  if (host.classList.contains('is-searching') && triggerEl && triggerEl.closest('.v3-bottom-nav')) { closeSearch(); return; }
  const ov = ensureSearchOverlay();
  host.classList.add('is-searching');       // lifts the bottom nav over the overlay (app.css)
  ov.classList.toggle('sds-overlay--light', !!host.querySelector('.s-home-v3--light'));
  host.appendChild(ov);   // mount into the current phone screen so it stays in-frame
  ov._cat = 'all';
  ov.querySelectorAll('.sds-tab').forEach(x => x.classList.toggle('active', x.dataset.cat === 'all'));
  const inp = ov.querySelector('.sds-input');
  inp.value = '';
  ov.querySelector('.sds-body').scrollTop = 0;
  runSearch();
  requestAnimationFrame(() => { ov.classList.add('open'); setTimeout(() => inp.focus(), 80); });
};

document.addEventListener('click', e => {
  const item = e.target.closest && e.target.closest('.is-searching .v3-bottom-nav .v3-nav-item');
  if (item && !item.closest('.v3-nav-item[title="Search"]')) closeSearch();
}, true);
window.closeSearch = function () {
  const ov = document.getElementById('sd-search');
  if (!ov) return;
  ov.classList.remove('open');
  document.querySelectorAll('.is-searching').forEach(h => h.classList.remove('is-searching'));
  const inp = ov.querySelector('.sds-input'); if (inp) inp.blur();
};

// ══════════════════════════════════════════════════════════════
//  ONBOARDING WIZARD
//  8 steps: username · connect · tracking · genres · artists ·
//  albums · people you may know · profile. State lives in OB and is
//  synced onto every rendered .s-onboarding instance (the viewer shows
//  the dark + light variants side by side).
// ══════════════════════════════════════════════════════════════
const OB = {
  step: 0,
  username: '',
  service: null,        // 'spotify' | 'apple' | 'soundcloud'
  tracking: null,       // null = undecided, then true/false
  genres:   new Set(),  // ⚠ shared BY REFERENCE with OB_MIX — never reassign it
  artists:  new Set(),  // artist names
  albums:   new Set(),  // "artist – album" keys
  following:new Set(),  // handles
  q: { artists: '', albums: '' },
  genreView: 'wheel',   // step 3: 'wheel' (the mix dial) | 'list' (the same tree, flat)
  genreOpen: new Set(), // step 3 list: which mains are unfolded
};

// The tracking step only appears once a service is connected.
function obActiveSteps() { return OB.service ? [0,1,2,3,4,5,6,7] : [0,1,3,4,5,6,7]; }

const obEsc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
// onclick-safe: survives HTML-decode then JS single-quote parse.
const obOc  = s => String(s).replace(/\\/g,'\\\\').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,"\\'");
const obUserValid = () => /^[a-zA-Z0-9_]{4,18}$/.test(OB.username);
// (albumKey() — "artist – album" — is defined above, reused here for album selection.)

// Kick off a fresh signup (from the auth screen).
window.obStart = function () {
  OB.step = 0; OB.username = ''; OB.service = null; OB.tracking = null;
  OB.genres.clear(); OB.artists.clear(); OB.albums.clear(); OB.following.clear();
  OB.q.artists = ''; OB.q.albums = '';
  OB.genreView = 'wheel'; OB.genreOpen.clear();
  OB_MIX.at = null; OB_MIX.from = null;
  navigate('onboarding');
};

// ── Derived data ──────────────────────────────────────────────
let _obArtists = null;
function obArtistList() {
  if (_obArtists) return _obArtists;
  const seen = new Map();
  (window.ARCHIVE || []).forEach(a => {
    if (!seen.has(a.artist)) seen.set(a.artist, { name: a.artist, image: a.image, genre: a.genre });
  });
  _obArtists = [...seen.values()];
  return _obArtists;
}
function obAlbumList() { return (window.ARCHIVE || []); }

let _obPeople = null;
function obPeopleList() {
  if (_obPeople) return _obPeople;
  const base = (window.FRIEND_ACTIVITY || []).map(f => ({ user: f.user, init: f.init, grad: f.grad }));
  const extra = [
    { user:'lena.fm',  init:'LF', grad:'linear-gradient(135deg,#334155,#0ea5e9)' },
    { user:'toshi_x',  init:'TX', grad:'linear-gradient(135deg,#3f2d1a,#d97706)' },
    { user:'rrrei',    init:'R',  grad:'linear-gradient(135deg,#3b0764,#a21caf)' },
    { user:'mono.no',  init:'MN', grad:'linear-gradient(135deg,#052e2b,#14b8a6)' },
  ];
  _obPeople = [...base, ...extra].map((p, i) => ({ ...p, mutual: (i * 7 + 3) % 11 + 1 }));
  return _obPeople;
}

// ── Init / sync ───────────────────────────────────────────────
function obInit(root) {
  if (typeof OB.step !== 'number') OB.step = 0;
  obSyncOne(root);
}
function obSync() { document.querySelectorAll('.s-onboarding').forEach(obSyncOne); }

function obSyncOne(root) {
  const active = obActiveSteps();
  const idx = Math.max(0, active.indexOf(OB.step));
  const num = idx + 1, total = active.length;

  const bar = root.querySelector('.ob-prog-bar'); if (bar) bar.style.width = (num / total * 100) + '%';
  const pad = n => String(n).padStart(2, '0');
  const nEl = root.querySelector('.ob-step-n');   if (nEl) nEl.textContent = pad(num);
  const tEl = root.querySelector('.ob-step-t');   if (tEl) tEl.textContent = pad(total);

  root.querySelectorAll('.ob-panel').forEach(p => p.classList.toggle('ob-panel--on', +p.dataset.step === OB.step));

  const back = root.querySelector('.ob-back'); if (back) back.style.visibility = num <= 1 ? 'hidden' : 'visible';

  const ui = root.querySelector('.ob-user-input');
  if (ui && document.activeElement !== ui && ui.value !== OB.username) ui.value = OB.username;
  obUserHint(root);

  root.querySelectorAll('.ob-svc').forEach(b => b.classList.toggle('ob-svc--on', b.dataset.svc === OB.service));
  root.querySelectorAll('.ob-track-opt').forEach(b =>
    b.classList.toggle('ob-track-opt--on', OB.tracking !== null && ((+b.dataset.track === 1) === OB.tracking)));
  /* Step 3 — the dial is built into this instance on first sync, then only
     repainted; the list and the chips are re-rendered from OB.genres. */
  obMixBuild(root);
  root.querySelectorAll('.ob-mix .mix-inline').forEach(w => mixWrapSync(w, OB_MIX));
  obSyncGenres(root);

  obRenderWall(root, 'artists');
  obRenderWall(root, 'albums');
  obRenderPeople(root);
  obRenderProfile(root);
  obSyncFooter(root);
}

/* Repaints everything on step 0 that reacts to what's typed: the hint line, the
   motor pulley (hollow → solid + turning once the handle is valid) and the
   18-pulley character meter. */
function obUserHint(root) {
  const ok = obUserValid();
  const n  = OB.username.length;

  // ⚠ The panel, not `.ob-plate` — step 0 has no plate any more. Kept as the
  // same class name so the rig's own lit states still work if it is restored.
  const panel = root.querySelector('.ob-panel--user') || root.querySelector('.ob-plate');
  if (panel) panel.classList.toggle('ob-plate--ok', ok);

  root.querySelectorAll('.ob-user-meter i').forEach((d, i) => d.classList.toggle('on', i < n));

  const uh = root.querySelector('.ob-user-hint'); if (!uh) return;
  uh.classList.toggle('ob-user-hint--ok', ok);
  uh.textContent = ok ? '@' + OB.username + ' — available' : '4–18 chars · a–z 0–9 _';
}

function obSyncFooter(root) {
  const skip = root.querySelector('.ob-skip');
  const next = root.querySelector('.ob-next');
  const step = OB.step;
  if (skip) skip.style.visibility = 'visible';   // every step (Eric, 2026-09-26: "a skip option at the top for all the onboarding pages for now")
  if (!next) return;
  next.dataset.lbl = step === 7 ? 'Finish' : 'Next';   // the band's small label (::before)
  if (step === 7)      { next.textContent = 'Start exploring';                       next.disabled = false; }
  else if (step === 0) { next.textContent = 'Continue';                              next.disabled = !obUserValid(); }
  else if (step === 3) { next.textContent = OB.genres.size    ? `Continue · ${OB.genres.size}`    : 'Continue'; next.disabled = false; }
  else if (step === 4) { next.textContent = OB.artists.size   ? `Continue · ${OB.artists.size}`   : 'Continue'; next.disabled = false; }
  else if (step === 5) { next.textContent = OB.albums.size    ? `Continue · ${OB.albums.size}`    : 'Continue'; next.disabled = false; }
  else if (step === 6) { next.textContent = OB.following.size ? `Continue · ${OB.following.size}` : 'Continue'; next.disabled = false; }
  else                 { next.textContent = 'Continue';                              next.disabled = false; }
}

// ── Step 3 · genres: Pro's mix dial, and a list of the same tree ──────────
/* ⚠ THE SAME DIAL AS PRO'S, not a copy of it. `mixDialSvg`, `mixGoto`,
   `mixToggle` and the rest take a dial CONTEXT (see `MIX`); this is
   onboarding's. `genres` IS `OB.genres` — the one Set, shared by reference — so
   the wheel, the list, the chip row and the footer count cannot disagree, and
   `obStart`'s `.clear()` empties the dial with everything else.
   ⚠ `wraps()` is EVERY onboarding instance's dial. The viewer shows the dark
   and light variants side by side, and a step into a main has to happen on
   both — the same multi-instance discipline as the rest of `OB`.
   ⚠ `onSync` repaints the rest of the step on every dial tap, so a pick made
   on the wheel shows up in the chip row, the list and the Continue count. Taps
   made in the list go the other way: `obToggleGenre` → `obSync` →
   `obSyncOne` → `mixWrapSync`. Both roads end at the same DOM. */
const OB_MIX = {
  genres: OB.genres, at: null, from: null,
  ring: { items: [], seat: [] },
  wraps: () => [...document.querySelectorAll('.s-onboarding .ob-mix .mix-inline')],
  // The chips, the list AND the footer's count — a wheel tap has to move all three.
  onSync: () => document.querySelectorAll('.s-onboarding').forEach(r => { obSyncGenres(r); obSyncFooter(r); }),
};

/* Build this instance's dial into `.ob-mix`, once. Mirrors `mixInlineBuild`
   minus the cover: there is no album behind it here, so no blur and no tint —
   the wrap wears the screen's own palette (`.mix-inline--ob` in app.css).
   ⚠ Inserted BEFORE the back pill, which is already in the markup, so the pill
   paints on top. */
function obMixBuild(root) {
  const host = root.querySelector('.ob-mix'); if (!host) return;
  if (host.querySelector('.mix-inline')) return;
  const wrap = document.createElement('div');
  wrap.className = 'mix-inline mix-inline--ob';
  wrap.innerHTML = mixDialSvg(OB_MIX) + mixHubSvg(OB_MIX);
  host.insertBefore(wrap, host.firstChild);
  mixDialTap(wrap, OB_MIX);
  const dial = wrap.querySelector('.ob-dial');
  mixDialFitLabels(dial);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => mixDialFitLabels(dial));
  mixWrapSync(wrap, OB_MIX);
  /* ⚠ It spins in on BUILD as well as on arrival — a page loaded straight onto
     this step, or the screen re-rendered under you, still gets the entrance.
     If the panel is hidden at the time the keyframe is simply never seen. */
  obMixSpinWrap(wrap);
}

/* Everything on step 3 that is not the dial's own ring: which view is up, the
   back pill, the chip row, the list, and the label fit. */
function obSyncGenres(root) {
  const panel = root.querySelector('.ob-panel[data-step="3"]'); if (!panel) return;
  const view = OB.genreView;
  panel.querySelectorAll('.ob-view-btn').forEach(b => b.classList.toggle('is-on', b.dataset.view === view));
  panel.querySelectorAll('.ob-genres').forEach(g => g.classList.toggle('is-on', g.dataset.genres === view));
  // The dial's back: only inside a main, and only while the wheel is the view.
  panel.classList.toggle('ob-panel--in', view === 'wheel' && !!OB_MIX.at);

  obRenderGenreList(panel);
  obSyncDock(root);

  /* ⚠ Labels can only be MEASURED while the wheel is on screen. The panel is
     `display: none` on every other step and the wheel is hidden behind the list
     view, and `getComputedTextLength` reports 0 for anything not rendered — so
     a dial built on step 0 was never fitted. Refit whenever it is showing; the
     fit resets first, so running it again costs nothing. */
  if (view === 'wheel' && panel.classList.contains('ob-panel--on'))
    panel.querySelectorAll('.ob-dial:not(.is-ghost), .ob-hub-svg').forEach(mixDialFitLabels);
}

/* ── THE DOCK — what you have picked on this step, against Continue ────────
   One strip between the stage and the footer (`.ob-picks-dock`), outside the
   scroll, so it is always in reach and can never push the wheel or the walls.
   ⚠ It began as step 3's chip row and is now every pick step's: genres (3),
   artists (4), albums (5), people (6). The artist/album walls used to pin
   their picks in an `.ob-pinned` row ABOVE the wall — moved here so the whole
   wizard keeps its picks in one place, on the button they feed.
   Two rows, then a fade — the mask only once there is overflow (`is-over`,
   measured), so a two-row set that fits is never dimmed. Each chip removes its
   own pick. Empty, it is the step's one-line instruction. */
const OB_DOCK_HINT = {
  4: 'Tap artists to follow them',
  5: 'Tap the records that made you',
  6: 'Follow a few to start',
};
function obSyncDock(root) {
  const dock = root.querySelector('.ob-picks-dock'); if (!dock) return;
  const step = OB.step;
  root.classList.toggle('ob-has-dock', step >= 3 && step <= 6);
  root.dataset.obStep = step;
  /* The stage fades out at the bottom on the steps that SCROLL — the walls,
     the people, the genre bubbles — so cards dissolve into the dock instead of
     being cut off at a hard edge above Skip and Continue. Not on the wheel:
     it is sized to fit, and a fade across its lower rim would read as a bug. */
  root.classList.toggle('ob-stage-fade', step === 4 || step === 5 || step === 6 || (step === 3 && OB.genreView === 'list'));

  let html = '', hint = '';
  if (step === 3) {
    hint = OB.genreView === 'list' ? 'Open a genre and tap what you like'
         : OB_MIX.at               ? 'Tap the subgenres you want'
                                   : 'Tap a genre to open it';
    html = [...OB.genres].map(g =>
      `<button class="ob-mix-chip" type="button" onclick="obToggleGenre(this,'${obOc(g)}')" title="Remove ${obEsc(g)}">` +
      `${obEsc(mixChipLabel(g))}<i>×</i></button>`).join('');
  } else if (step === 4) {
    hint = OB_DOCK_HINT[4];
    html = obArtistList().filter(a => OB.artists.has(a.name)).map(a => obChip('artist', a.name, a.image, a.name)).join('');
  } else if (step === 5) {
    hint = OB_DOCK_HINT[5];
    html = obAlbumList().filter(a => OB.albums.has(albumKey(a))).map(a => obChip('album', albumKey(a), a.image, a.album)).join('');
  } else if (step === 6) {
    hint = OB_DOCK_HINT[6];
    // ⚠ Deduped by handle: FRIEND_ACTIVITY lists a user once per post, so the
    // people list carries repeats, and one follow must not become three chips.
    const seen = new Set();
    html = obPeopleList().filter(p => OB.following.has(p.user) && !seen.has(p.user) && seen.add(p.user)).map(p =>
      `<button class="ob-chip" onclick="obToggleFollow('${obOc(p.user)}')">` +
      `<span class="ob-chip-av" style="background:${p.grad}">${obEsc(p.init)}</span>` +
      `<span class="ob-chip-t">@${obEsc(p.user)}</span><span class="ob-chip-x">×</span></button>`).join('');
  }
  dock.classList.toggle('is-empty', !html);
  if (html) dock.innerHTML = html; else dock.textContent = hint;
  // Measurable only while shown; hidden it reads 0/0 and simply stays unfaded.
  dock.classList.toggle('is-over', dock.scrollHeight > dock.clientHeight + 1);
  /* ⚠ On the fade steps `.ob-foot` (dock + footer) is an OVERLAY on the stage,
     and the stage's fade spans exactly its height — measured HERE, after the
     dock has been filled, because the dock is 0, 1 or 2 rows tall depending
     on what is picked and a measurement taken before the render is one sync
     stale. The panel's bottom padding takes the same number. */
  const foot = root.querySelector('.ob-foot');
  if (foot) root.style.setProperty('--ob-foot', foot.offsetHeight + 'px');
}

/* The LIST: the same two levels as the dial, as BUBBLES — the chips step 3 had
   before the dial, in the wheel's margins and the step's emboss. The sixteen
   mains are raised pills. ⚠ Tapping a main PICKS it and unfolds its subs in a
   well beneath — the dial's rule ("going in picks it"), kept on purpose so the
   two views mean the same thing by the same tap; an earlier cut had rows that
   unfolded without picking, and the two views then disagreed about what a tap
   on "Rock" was. Tapping it again takes the pick out and folds the well; subs
   picked inside stay picked (they are in the chip row) and the main stays LIT
   — accent rim, not pressed — the dial's "something in here" ring.
   ⚠ The well is a full-width flex item, so it breaks the line: it lands under
   the ROW its main is on, not necessarily right under the bubble. That is the
   price of a wrap of bubbles rather than a column of rows, and it reads fine
   because the pressed bubble is the only pressed one on the row. */
function obRenderGenreList(panel) {
  const box = panel.querySelector('.ob-glist'); if (!box) return;
  box.innerHTML = Object.keys(SD_GENRE_TREE).map(m => {
    const on = OB.genres.has(m);
    const lit = !on && mixPicksIn(m, OB_MIX).length > 0;
    const open = OB.genreOpen.has(m);
    const subs = (SD_GENRE_TREE[m] || []).filter(x => x.toLowerCase() !== m.toLowerCase());
    const bub = (g, cls, fn) =>
      `<button class="ob-gbub${cls}" type="button" onclick="${fn}('${obOc(g)}')">${obEsc(g)}</button>`;
    return bub(m, (on ? ' is-on' : lit ? ' is-lit' : '') + (open ? ' is-open' : ''), 'obListMain') +
      (open ? `<div class="ob-gsubs">${subs.map(x => bub(x, OB.genres.has(x) ? ' is-on' : '', 'obToggleGenre')).join('')}</div>` : '');
  }).join('');
}

/* The dial's entrance, replayed on every arrival at the step and every switch
   back to the wheel — the same `is-opening` keyframe the home plays. */
function obMixSpinWrap(wrap) {
  const still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (still) return;
  wrap.classList.remove('is-opening');
  void wrap.getBoundingClientRect();
  wrap.classList.add('is-opening');
  clearTimeout(wrap._spin);
  wrap._spin = setTimeout(() => wrap.classList.remove('is-opening'), MIX_OPEN_MS);
}
function obMixSpin() { OB_MIX.wraps().forEach(obMixSpinWrap); }
/* Landing on step 3 always lands on the TOP ring — the picks survive, the ring
   you were standing in when you left does not, the same rule `openMixDial`
   keeps. Called after `obSync`, so the wraps exist. */
function obMixArrive() {
  if (OB.step !== 3) return;
  if (OB_MIX.at) { OB_MIX.at = null; OB_MIX.from = null; mixDialRender(null, OB_MIX); }
  obMixSpin();
}

/* The wheel's own back — one ring up, as the home's corner pill does. ⚠ Its
   OWN button, on the left of the switch row, and not folded into the rail's
   Back: that was tried, and a Back that sometimes means "up a ring" and
   sometimes "previous step" is two buttons wearing one coat. */
window.obMixBack = function () { if (OB_MIX.at) mixGoto(null, OB_MIX); };
window.obSetGenreView = function (v) {
  if (OB.genreView === v) return;
  OB.genreView = v;
  obSync();
  if (v === 'wheel') obMixSpin();
};
// A main bubble: in and picked, or out and unpicked — one tap either way.
window.obListMain = function (m) {
  if (OB.genreOpen.has(m)) { OB.genreOpen.delete(m); OB.genres.delete(m); }
  else                     { OB.genreOpen.add(m);    OB.genres.add(m);    }
  obSync();
};

/* ══════════════════════════════════════════════════════════════════════════
   THE MIX DIAL — Pro's multi-genre shelf (`mixInlineBuild` · `openMixDial`)
   ══════════════════════════════════════════════════════════════════════════
   The logo is a belt drive, so this builds one. Genres are the holes of a dial;
   picking one turns it into a PULLEY and the belt re-wraps to take it in. Pick
   one and the shape on screen is the Spindeck logo exactly — big wheel, small
   wheel, belt. Pick six and it is a machine you built. The mark isn't printed
   on the screen, it is what your choices make.

   ⚠️ IT IS ALSO ONBOARDING'S STEP 3 — again, and by decision (2026-09-03). It
   left once because a new user's first thirty seconds is a bad place to teach
   a gesture and a wall of chips is instantly legible where a dial is not. It
   came back with that objection answered rather than overruled: step 3 offers
   the wheel AND a list of the same tree, one switch apart, so nobody has to
   learn the dial to get through the door — and anyone who takes to it has met
   the app's signature control before they have seen the home. Same code, via
   the dial CONTEXT (`OB_MIX`, in the onboarding section).

   WHERE IT SITS — IN THE BENTO, not in a window.
   Pro's cover-hold opens the shelf wheel: a vertical scroll that picks ONE
   shelf, over the album art. Its bottom row is **Custom mix**, which opens this
   dial instead of committing. The dial takes the SAME square — `.v3-album` —
   and the commit sits in `.v3-blue` directly beneath it, so the whole thing
   happens on the object it changes.
   ⚠️ It was a bottom sheet, and must not go back to being one. A window sliding
   up in front of the bento covered the very thing you were deciding about, and
   added a surface you then had to get out of.

   THE GESTURE — a TAP (`mixDialTap`)
   ⚠️ It was a rotary turn: press a hole, turn it clockwise to a finger stop.
   That was a lovely gesture in a sheet 340px wide and it does not survive the
   move into a 291px square, where the same travel is a few degrees of a much
   smaller circle. Tapping is also the only thing that lets you add a second
   genre without undoing the first, which is the entire point of a mix.
   The belt is untouched by any of this: it was never the gesture, it is the
   picture of what you have built.
   ⚠️ Each genre's target is the 18° WEDGE it owns (`dialWedge`), not its hole.
   Twenty holes on a 74-unit ring sit 23 units apart, so a hole grown into a
   decent target would touch its neighbours.

   ⚠️ EVERY HOLE IS LABELLED, always. An earlier cut showed a label only once
   the genre was picked, which reads fine on a desktop with a cursor and is
   useless on a phone: there is no hover, so you would be choosing blind. The
   labels RADIATE — each one rotated to point out of the ring, flipped on the
   left half so it never reads upside down — because radial text costs angle,
   not arc: a label subtends about 4° where each genre owns 18°. Tangential
   text is what could never fit, not the labels themselves.

   ⚠️ ONE INSTANCE PER SCREEN, built into whichever home opened it, and `MIX` is
   the truth — the SVG is only a picture of it. */

/* What the dial is holding. Kept OUTSIDE the DOM so closing and reopening the
   sheet returns you to the mix you were building rather than a blank dial. */
/* `genres` is what you have PICKED — a flat set of labels, each either a main
   genre (meaning "all of it") or a subgenre, gathered across as many mains as
   you like. `at` is which main's ring is on screen, or null for the top.
   ⚠ `at` resets on every open, `genres` never does: the ring you were last
   looking at is not work, the picks are. */
/* ⚠ A DIAL CONTEXT, and there are two of them. Everything below that draws or
   reads a dial takes one as its last argument (`d`, defaulting to this one, so
   the home's call sites read exactly as they did). Onboarding's is `OB_MIX`,
   whose `genres` is `OB.genres` itself. The context carries:
     genres / at / from   the state, as documented above
     ring                 the ring as drawn — items, and seat[hole] = item index
                          (was the module-global MIX_RING)
     wraps()              every `.mix-inline` this dial is currently drawn in —
                          ONE on the home, one per `.s-onboarding` instance in
                          the viewer, all of which must step and light together
     onSync()             what to repaint besides the dial itself: the home's
                          info-box readout, onboarding's chips and list */
const MIX = {
  genres: new Set(), at: null, from: null,
  ring: { items: [], seat: [] },
  wraps: () => (mixHost ? [mixHost.querySelector('.mix-inline')].filter(Boolean) : []),
  onSync: () => mixHomeReadout(),
};

/* ── The ring currently on screen ──────────────────────────────────────────
   Top level: the eight mains. Inside one: "All <main>" first, then its subs.
   ⚠ "All X" is a PICK, not a shortcut that ticks every sub — it stores the main
   itself, and `mixShelf` expands that to the main plus all its subs at commit
   time. Ticking the subs instead would make deselecting one of them silently
   turn "all" into "some", which is not what the hole says it does. */
function mixRing(d = MIX) {
  if (!d.at) return Object.keys(SD_GENRE_TREE).map(m => ({ label: m, value: m, kind: 'main' }));
  /* ⚠ THE MAIN ITSELF HEADS ITS OWN RING, under its own name — it read "All
     Electronic" once. Two things changed with the label. It is the genre you
     just tapped, so it has to be spelled the way it was spelled on the ring
     you tapped it from, or "the one that did not move" is not recognisably the
     same thing. And it is a legitimate pick in its own right rather than a
     special "everything" control — picking it still takes the whole main,
     because mixShelf expands it to [main, ...subs] at commit.
     ⚠ Its VALUE is unchanged, so MIX.genres, mixHoleOn and mixShelf all speak
     exactly what they spoke before. Only the label moved. */
  /* ⚠ A MAIN THAT LISTS ITS OWN NAME AMONG ITS SUBS IS DROPPED FROM THE SUBS,
     and that only became a bug when the head stopped saying "All X". Seven of
     the sixteen do it — Jazz, Punk, Folk, Country, Classical, Soundtrack,
     Experimental — because straight-ahead jazz is a genre as well as a family.
     With the head labelled "All Jazz" the two were merely redundant; labelled
     "Jazz" they are the same word twice on one ring AND the same value, so
     mixHoleOn lights both and either one toggles the same pick. The head is
     the one that stays: it is the hole that holds its place from the ring you
     came from. ⚠ Those rings are therefore 14-15 holes, not 16, which is what
     mixHerePin's angle fallback exists for. */
  const subs = (SD_GENRE_TREE[d.at] || [])
    .filter(s => s.toLowerCase() !== d.at.toLowerCase())
    .map(s => ({ label: s, value: s, kind: 'sub' }));
  return [{ label: d.at, value: d.at, kind: 'all' }].concat(subs);
}
// Everything picked that lives under this main — what makes a main read as "on".
const mixPicksIn = (m, d = MIX) => [m].concat(SD_GENRE_TREE[m] || []).filter(g => d.genres.has(g));
// Is this hole lit?
const mixHoleOn = (it, d = MIX) => it.kind === 'main' ? mixPicksIn(it.value, d).length > 0
                                                      : d.genres.has(it.value);

/* ⚠ EVERY NUMBER HERE IS SIZED TO THE BENTO'S ALBUM CELL, not to a sheet.
   The dial used to be a bottom sheet 340px wide; it now lives inside
   `.v3-album`, which is ~291×289 at the 393px frame, so the 320-unit viewBox
   renders at about 0.91 px per unit and everything has to fit inside it —
   labels included, and they radiate OUTWARD.
   The budget, from the middle out: ring + holeOn + 5 (label gap) + the longest
   label must stay under 158. "Alternative" at 10 units is ~57, so
   74 + 11 + 5 + 57 = 147. That is what caps `ring`, and it is why pulling the
   genres in toward the centre is what made this fit at all. */
const DIAL = {
  vb: 320,        // square viewBox; every number below is in its units
  cx: 160, cy: 160,
  /* ⚠ These five are one set, and `ring` + `holeOn` are what the label budget
     is left over from: a corner slice reaches 177.6, a label starts at
     `ring + holeOn + 5`, and "Alternative" needs ~77 of what remains. At 80/12
     that leaves 80.6 — about three units of slack. Push `ring` past 84 or
     `holeOn` past 12 and the longest names start condensing again.
     The other limit is that neighbours must not merge: holes sit
     `2·ring·sin(9°)` apart, so a picked pair at 80/12 clears by 1.0 units. */
  /* ⚠ PULLED IN, and the dots shrank with it — the two move together or the
     picked holes merge. The label budget is what is left after
     `ring + holeOn + 5`, so every unit the ring comes in is a unit the names
     gain, and at twenty holes the floor is set by neighbours touching:
     spacing is 2·ring·sin(9°), which must clear 2·holeOn.
         80 / 12 at 20 holes  →  25.0 apart,  1.0 clear, budget 61
         62 /  9 at 20 holes  →  19.4 apart,  1.4 clear, budget 82
         59 / 10.5 at 16      →  23.0 apart,  2.0 clear, budget 83
     ⚠ WHICH IS WHY EVERY RING IS CAPPED AT 16 HOLES (`SD_GENRE_TREE` gives each
     main at most 15 subs). Bigger dots and a tighter ring are only compatible
     with FEWER holes: at twenty the dots have to shrink to stay apart, which is
     the opposite of what was asked for. Sixteen buys larger pulleys, a ring
     closer to the record, more daylight between neighbours AND a slightly
     better label budget, all at once. Add a 17th sub to any main and the picked
     holes start touching. */
  ring: 59,       // where the holes sit
  hole: 8,        // a hole …
  holeOn: 10.5,   // … and a picked one, so a pulley reads heavier than a hole
  hub: 30,        // the record in the middle
  gap: 5,         // belt clearance off every wheel — the logo's belt never touches
  /* ⚠ There is no `hit` radius any more, and don't add one back: how far a
     slice may reach is not one number. `dialReach` computes it per angle,
     because a wedge pointing at a corner has 41% further to go than one
     pointing at an edge — which is the whole reason the long names are seated
     where they are. */
};

// Degrees clockwise from 12 o'clock → a point on a circle about the hub.
function dialPt(deg, r) {
  const a = (deg - 90) * Math.PI / 180;
  return { x: DIAL.cx + Math.cos(a) * r, y: DIAL.cy + Math.sin(a) * r };
}
/* ⚠ The ring no longer has a fixed size. It was `SD_GENRES.length` everywhere —
   twenty — and the dial now draws eight mains or four-to-seven subs, so every
   one of these takes the count. */

/* ── ⚠ THE RING IS ROTATED, and with few holes it has to be ────────────────
   The box is square and the dial is round, so a label pointing into a CORNER
   has 41% further to go than one pointing along an axis (226 units against
   160). At twenty holes that averaged out. At FOUR — R&B's ring — every hole
   lands exactly on an axis, the four tightest directions on the dial, and
   "Electronic soul" needed 92 units in the 61 it was given.
   So each ring is turned by whatever offset maximises its WORST label budget.
   For n=4 that is 45°, putting all four on the diagonals and taking the
   tightest budget from 61 to 127. Searched rather than derived: the room
   function is a max of two cosines and the best offset is not a formula worth
   writing when a degree-by-degree sweep over one step is exact and runs once
   per ring size.
   ⚠ Cached by n, not by ring — it depends only on the count. */
const DIAL_OFF = {};
function dialOffset(n) {
  if (DIAL_OFF[n] != null) return DIAL_OFF[n];
  let best = 0, bestMin = -1;
  for (let off = 0; off < 360 / n; off++) {
    let worst = Infinity;
    for (let i = 0; i < n; i++) worst = Math.min(worst, dialRoom(i * 360 / n + off));
    if (worst > bestMin) { bestMin = worst; best = off; }
  }
  return (DIAL_OFF[n] = best);
}
const dialAngleOf = (i, n) => i * 360 / n + dialOffset(n);

/* ── The box is a SQUARE and the dial is a CIRCLE, so the corners are free ──
   How far the middle can reach before it hits the viewBox depends entirely on
   which way it is pointing: `vb/2` straight up, and `vb/2 × √2` — 41% further —
   into a corner. A ring of labels that all budget for the WORST direction
   throws that away, and it is a lot: 160 units on the axes against 226 on the
   diagonals. */
function dialRoom(deg) {
  const a = (deg - 90) * Math.PI / 180;
  return (DIAL.vb / 2) / Math.max(Math.abs(Math.cos(a)), Math.abs(Math.sin(a)));
}

/* How far a genre's slice may reach — the room at its NARROWEST edge, not along
   its centre line. A wedge drawn to the room at its middle would poke out of
   the square along the edge nearer an axis, and the label with it. */
function dialReach(deg, n) {
  const half = 360 / n / 2;
  return Math.min(dialRoom(deg - half), dialRoom(deg + half)) - 2;
}

/* ── Seating: the longest names get the roomiest slots ──────────────────
   The eight holes flanking the diagonals have ~81 units for a label; the other
   twelve have ~63. So "Alternative" and "Electronic" go in the corners and
   "Pop" and "R&B" take the axes, and every name fits at FULL WIDTH — the
   condensing in `mixDialFitLabels` becomes the safety net it should be rather
   than the thing holding the dial together.

   ⚠ This is the one place the dial stops following `SD_GENRES` order, and it is
   a real trade: that list is editorial (related genres adjacent), and seating
   by length scrambles that around the ring. It was worth it once the dial
   stopped TURNING — adjacency used to mean "a related pick is a short turn",
   and there is no turn any more. Return `SD_GENRES.map((_, i) => i)` here to
   put the editorial order back; nothing else needs to change.
   ⚠ Both sorts fall back to the original index on a tie, so the seating is
   deterministic — the ring must not reshuffle between renders. */
/* ⚠ Computed PER RING now, not once at load. It used to be a module constant
   because `SD_GENRES` was one; the ring changes every time you step in or out
   of a main, so the seating has to be worked out with it. */
/* ⚠ Seated by `dialRoom` — the room along the label's OWN bearing — not by
   `dialReach`, which is the wedge's narrowest edge. With twenty holes the wedge
   was ±9° and the two answers were nearly the same; at seven the wedge is ±26°
   and they diverge hard: straight up, `dialReach` reports 175.6 because the
   wedge's edges point at the corners, while the label going straight up only
   has 160. That put "Psychedelic pop" in the tightest slot on the dial believing
   it was the roomiest, and it drew off the top of the viewBox. */
/* ⚠ `pin` NAILS ONE ITEM TO ONE HOLE and seats everything else around it — how
   the main you chose keeps the place it had on the ring you came from. Without
   a pin this is byte-for-byte the old function: same sort keys, same tie-break
   on the original index, so an unpinned ring is seated exactly as before. */
function dialSeating(labels, pin) {
  const n = labels.length;
  const seat = new Array(n);
  let holes = labels.map((_, i) => i);
  let items = labels.map((_, i) => i);
  if (pin && pin.hole >= 0 && pin.hole < n && pin.item >= 0 && pin.item < n) {
    seat[pin.hole] = pin.item;
    holes = holes.filter(h => h !== pin.hole);
    items = items.filter(i => i !== pin.item);
  }
  const slots = holes.map(h => ({ h, room: dialRoom(dialAngleOf(h, n)) }))
                     .sort((x, y) => (y.room - x.room) || (x.h - y.h));
  const byLen = items.map(i => ({ i, len: labels[i].length }))
                     .sort((x, y) => (y.len - x.len) || (x.i - y.i));
  byLen.forEach((e, k) => { seat[slots[k].h] = e.i; });
  return seat;
}

/* Where the main you are inside should sit: the hole it occupied on the ring
   you came from.
   ⚠ The two rings are BOTH 16 holes today (16 mains, and 15 subs plus the main
   itself), so this is normally the same hole index at the same angle — the
   name genuinely does not move. The fallback matters if a main is ever given a
   different number of subs: the hole index alone would then point somewhere
   else entirely, because `dialAngleOf` folds in a per-count rotation
   (`dialOffset`), so it is the ANGLE that is matched and the nearest hole to it
   that is taken. */
function mixHerePin(items, n, d = MIX) {
  if (!d.at || !d.from) return null;
  const item = items.findIndex(it => it.kind === 'all');
  if (item < 0) return null;
  if (d.from.n === n) return { item, hole: d.from.hole };
  const a = dialAngleOf(d.from.hole, d.from.n) - dialOffset(n);
  const hole = ((Math.round(a / (360 / n)) % n) + n) % n;
  return { item, hole };
}

/* The ring as drawn — the items, and seat[hole] = item index — lives on the
   dial context as `d.ring`. Written by `mixDialSvg` and read by `dialWheels` /
   `mixDialSync` / `mixGoto`, which need to know where each item ended up
   without walking the seating again. ⚠ Per CONTEXT, not a module global: the
   home and onboarding can each be standing in a different ring. */

/* A genre's TAP TARGET: the wedge it owns, from the hub out to its reach, with
   its hole and its label both inside.
   ⚠ Without this the target is the hole itself — 16 units across, about 15px on
   a phone. Twenty holes on a 74-unit ring sit 23 units apart, so the holes
   cannot simply be grown into a decent target; they would touch. The wedge is
   the way out: each genre already OWNS 18° of the dial, so tapping anywhere in
   its slice — the name most of all — is unambiguous, and the target becomes a
   ~26×80px slab instead of a dot. */
function dialWedge(a, half, r0, r1) {
  const f = n => n.toFixed(2);
  const A = dialPt(a - half, r0), B = dialPt(a - half, r1);
  const C = dialPt(a + half, r1), D = dialPt(a + half, r0);
  return `M ${f(A.x)} ${f(A.y)} L ${f(B.x)} ${f(B.y)}` +
         ` A ${r1} ${r1} 0 0 1 ${f(C.x)} ${f(C.y)}` +
         ` L ${f(D.x)} ${f(D.y)}` +
         ` A ${r0} ${r0} 0 0 0 ${f(A.x)} ${f(A.y)} Z`;
}

/* ── The belt: the convex hull of a set of CIRCLES ───────────────────────
   Not the hull of their centres. The wheels have different radii — the hub is
   three times a pulley — so an outline offset from a centre-hull would cut
   through the hub and float off the small ones. The real thing is what a belt
   physically is: an external tangent between each consecutive pair of wheels,
   joined by the arc each wheel actually wraps.

   Gift-wrapping, one wheel at a time. Standing on wheel `cur` with the outward
   normal at angle `ang`, the next wheel is whichever needs the least clockwise
   turn to reach. For an external tangent touching both wheels on the same side,
   the shared normal φ satisfies

       (c2 − c1) · n(φ) = r1 − r2      →      φ = atan2(dy,dx) ± acos((r1−r2)/d)

   ⚠ MINUS, not plus. The two solutions are the two external tangents, one down
   each side, and only one of them belongs to a CLOCKWISE walk with an outward
   normal — take the other and the loop still closes for two wheels (which is
   why the logo case can pass while everything else is wrong) but from three
   wheels up the least-turn choice starts skipping wheels and the belt runs
   straight through the hub. Sanity check it on two equal circles side by side:
   the top run's outward normal points UP, i.e. base − acos.

   Start from the topmost extreme point, which is always on the hull.

   ⚠ Radii arrive already grown by `DIAL.gap`, so the belt is drawn where a belt
   sits — off the wheels, with the clearance the logo has.
   ⚠ The iteration cap is not decoration: a degenerate set (two wheels sharing a
   centre) would otherwise wrap forever and hang the tab instead of drawing
   nothing. */
/* The convex hull of a set of CIRCLES — what a belt physically is. The solver
   lives in belt.js as `SD_BELT.hull` so belt-lab.html can drive the same one;
   this is just the dial's clearance applied to it.
   ⚠ Not an outline offset from the hull of the CENTRES: that cuts through the
   big wheels' hubs and floats off the small ones. */
function beltPath(circles) { return SD_BELT.hull(circles, DIAL.gap); }

/* What the belt has to wrap: the hub, plus a pulley for every LIT hole on the
   ring you are looking at.
   ⚠ On the top ring that means a main lights when anything under it is picked,
   so the belt still shows where your mix is even when the picks themselves are
   one level down. */
function dialWheels(d = MIX) {
  const w = [{ x: DIAL.cx, y: DIAL.cy, r: DIAL.hub }];
  const n = d.ring.items.length;
  d.ring.seat.forEach((idx, h) => {
    if (!mixHoleOn(d.ring.items[idx], d)) return;
    const p = dialPt(dialAngleOf(h, n), DIAL.ring);
    w.push({ x: p.x, y: p.y, r: DIAL.holeOn });
  });
  return w;
}

function mixDialSvg(d = MIX) {
  const items = mixRing(d);
  const n = items.length;
  const seat = dialSeating(items.map(it => it.label), mixHerePin(items, n, d));
  d.ring = { items, seat };                   // what dialWheels / mixDialSync read
  const half = 360 / n / 2;
  const lr = DIAL.ring + DIAL.holeOn + 5;
  /* ⚠ Walks HOLES, not items — the seating decides which name sits in which, so
     the long ones land in the corners. `data-i` is the index into the RING,
     which is what everything downstream speaks in. */
  const holes = seat.map((gi, h) => {
    const it = items[gi];
    const g = it.label;
    const a = dialAngleOf(h, n);
    const p = dialPt(a, DIAL.ring);
    const reach = dialReach(a, n);
    /* Radial labels. The text is laid out along +x at the label radius and the
       whole group is turned to the hole's bearing, so it points straight out of
       the ring. `a - 90` because the SVG's 0° is 3 o'clock and the dial's is 12.
       ⚠ FLIPPED on the left half (a > 180): without it every label from 7
       o'clock round to 11 reads upside down. The flip swaps the anchor with it,
       so text still grows away from the ring rather than back across it. */
    const flip = a > 180;
    const t = flip
      ? `rotate(${(a - 90 + 180).toFixed(2)}) translate(${-lr} 0)`
      : `rotate(${(a - 90).toFixed(2)}) translate(${lr} 0)`;
    /* ⚠ The budget is stamped on the label, not recomputed later: it is a
       property of WHERE this one sits, and `mixDialFitLabels` would otherwise
       have to walk back from `data-i` through the seating to find the angle. */
    /* ⚠ Off `dialRoom` at the label's own bearing, NOT off the wedge's reach —
       see `dialSeating`. The wedge may legitimately reach further than the
       label can, and budgeting from it is what let a name run off the crop. */
    const budget = (dialRoom(a) - lr - 2).toFixed(1);
    /* ⚠ The hit wedge is FIRST, so it paints under its own hole and label. It
       is invisible but it is the only thing here that takes a pointer — the
       circle and the text are `pointer-events: none`, so a tap anywhere in the
       slice reports the same target and there are no dead gaps between them. */
    return `<g class="ob-hole ob-hole--${it.kind}" data-i="${gi}">
        <path class="ob-hole-hit" d="${dialWedge(a, half, DIAL.hub, reach)}"/>
        <circle class="ob-hole-c" cx="${p.x.toFixed(2)}" cy="${p.y.toFixed(2)}" r="${DIAL.hole}"/>
        <g transform="translate(${DIAL.cx} ${DIAL.cy})">
          <text class="ob-hole-t" data-w="${budget}" data-full="${obEsc(g)}" transform="${t}"
                text-anchor="${flip ? 'end' : 'start'}">${obEsc(g)}</text>
        </g>
      </g>`;
  }).join('');

  /* ⚠ No faceplate, no finger stop, and no readout in the hub — all three were
     about TURNING. You tap a genre now, so there is no plate to turn against
     and no stop to turn to; and the readout moved to the info box below, where
     there is room to say it in words. What is left is the machine: a record in
     the middle and the belt that wraps whatever you picked. */
  return `<svg class="ob-dial" viewBox="0 0 ${DIAL.vb} ${DIAL.vb}" role="group" aria-label="Pick genres">
      <!-- ⚠ The belt stays INSIDE the group with the holes it wraps, and first,
           so the wheels sit on top of it. -->
      <g class="ob-dial-ring">
        <path class="ob-dial-belt" d=""/>
        ${holes}
      </g>
    </svg>`;
}

/* ── The record, on its OWN layer ─────────────────────────────────────────
   ⚠ It used to live inside the dial's svg. It had to come out: the transition
   flies the whole RING through 3D space, and the one thing that must not move
   is the record it flies out of and back into. Anything sharing the animated
   element goes with it.
   Kept as a second svg on the same viewBox, so hub and ring are in one
   coordinate system and `DIAL` still describes both. */
function mixHubSvg(d = MIX) {
  return `<svg class="ob-hub-svg" viewBox="0 0 ${DIAL.vb} ${DIAL.vb}" aria-hidden="true">
      <g class="ob-dial-hub">
        <circle class="ob-hub-disc" cx="${DIAL.cx}" cy="${DIAL.cy}" r="${DIAL.hub}"/>
        <circle class="ob-hub-groove" cx="${DIAL.cx}" cy="${DIAL.cy}" r="${DIAL.hub - 7}"/>
        ${d.at
          ? `<text class="ob-hub-t" data-w="48" data-full="${obEsc(d.at)}" x="${DIAL.cx}" y="${DIAL.cy}">${obEsc(d.at)}</text>`
          : `<circle class="ob-hub-hole" cx="${DIAL.cx}" cy="${DIAL.cy}" r="3.6"/>`}
      </g>
    </svg>`;
}

/* Rewrite the record in place — it is not part of the flying ring, so it is
   never replaced, only relabelled. */
function mixHubSync(d = MIX) {
  d.wraps().forEach(wrap => {
    const old = wrap.querySelector('.ob-hub-svg');
    if (old) old.insertAdjacentHTML('afterend', mixHubSvg(d)), old.remove();
    else wrap.insertAdjacentHTML('beforeend', mixHubSvg(d));
    const svg = wrap.querySelector('.ob-hub-svg');
    /* ⚠ THE RECORD LIGHTS WHEN THE MIX IS NON-EMPTY. It is the one part of the
       dial that is always on screen and never scrolls past, so it is where "you
       have something" belongs — and it takes the ALBUM's accent, like everything
       else here, so the machine agrees with the cover behind it. */
    svg.classList.toggle('is-lit', d.genres.size > 0);
    mixDialFitLabels(svg);
  });
}

/* ⚠ TAP, not turn. The rotary drag is gone: it was a lovely gesture in a sheet
   340px wide, and it does not survive being moved into a 291px square where a
   genre's whole travel is a few degrees of a much smaller circle. Tapping is
   also the only thing that lets you pick a second genre without undoing the
   first, which is the point of a mix.
   The belt survives all of it — that was never the gesture, it is the picture
   of what you have built, and it still redraws on every toggle. */
/* ── Fitting the labels: MEASURED, not estimated ────────────────────────
   Roboto Flex's `wdth` axis is what lets a long genre keep the same type size
   as a short one — it gives up width instead. Which labels need it, and how
   much, is not something to guess at: it depends on the face that actually
   loaded, the axis position, and the letter-spacing, so this asks the engine.
   `getComputedTextLength()` reports in USER UNITS, the same units as the budget
   below, and the rotate/translate the label sits under preserve length.

   ⚠ Iterated, because width is NOT linear in `wdth` — the first guess is a
   proportional one and two corrections land it. It bails the moment a pass
   stops making the label narrower, so a name that cannot fit even fully
   condensed settles rather than looping.
   ⚠ `DIAL_WDTH_MIN` is 60, not the axis floor of 25. Roboto Flex will happily
   go to a hairline at 25 and the label stops being readable long before it
   stops fitting; a name that needs more than this should be shortened in
   `SD_GENRES` instead. */
const DIAL_WDTH_MIN = 60;

function mixDialFitLabels(svg) {
  if (!svg) return;
  /* What a label actually has, radially: from where it starts out to the
     viewBox edge, less two units so a glyph never sits flush on the crop.
     Derived from `DIAL` rather than written out, so moving the ring in or out
     moves the budget with it. */
  svg.querySelectorAll('[data-w]').forEach(t => {
    /* ⚠ PER LABEL, read off the element. A name in a corner has ~88 units and
       one on an axis has ~70, so a single shared budget would either condense
       the corners for nothing or let the axes overflow. Stamped by
       `mixDialSvg`, which is where the angle is known. */
    const budget = parseFloat(t.dataset.w);
    if (!budget) return;
    /* ⚠ RESET FIRST. The fit can shrink the size and trim characters, and it
       runs a second time when the webfont lands — measuring an already-trimmed
       label against the same budget would trim it again, and again. Every pass
       starts from the name as written. */
    if (t.dataset.full != null) t.textContent = t.dataset.full;
    t.style.removeProperty('--lsize');
    const measure = w => { t.style.setProperty('--lwdth', w);
                           try { return t.getComputedTextLength(); } catch (e) { return null; } };
    const full = measure(100);
    if (full === null) return;
    if (full <= budget) return;                       // fits as drawn

    /* ⚠ BINARY SEARCH, not a proportional walk. The walk guessed
       `wdth × budget / measured` and iterated three times, which assumes width
       responds roughly in proportion to the axis — and it does not. Measured on
       Roboto Flex here: "Psychedelic pop" is 106.8 units at wdth 100 and 101.4
       at wdth 60, so the whole axis buys 5%. A proportional guess therefore
       moves the axis about two points a pass and the loop ran out of passes
       still overflowing, with the label reading as clipped and the safety net
       looking broken. Five halvings find the widest axis that fits whatever the
       response curve is. */
    let lo = DIAL_WDTH_MIN, hi = 100, best = DIAL_WDTH_MIN;
    for (let pass = 0; pass < 5 && lo <= hi; pass++) {
      const mid = Math.floor((lo + hi) / 2);
      const w = measure(mid);
      if (w === null) return;
      if (w <= budget) { best = mid; lo = mid + 1; } else { hi = mid - 1; }
    }
    t.style.setProperty('--lwdth', best);

    /* ⚠ NOTHING LEAVES THE BOX. The axis alone buys about 5%, so a genuinely
       long name in a tight slice is still over after the search — and a label
       running off the crop is the one failure that looks like a broken app
       rather than a full one. Two more steps, in the order that costs least:
       give up SIZE (down to 82% — the ring reads as one row of type, so that is
       the last thing worth spending), and only then give up CHARACTERS. */
    let w2 = t.getComputedTextLength();
    if (w2 > budget) {
      t.style.setProperty('--lsize', Math.max(0.82, budget / w2).toFixed(3));
      w2 = t.getComputedTextLength();
    }
    if (w2 > budget) {
      const full = t.textContent;
      for (let k = full.length - 1; k > 1 && w2 > budget; k--) {
        t.textContent = full.slice(0, k) + '…';
        w2 = t.getComputedTextLength();
      }
    }
  });
}

/* ⚠ Wired to the WRAPPER, not the svg. Stepping between rings replaces the svg
   wholesale, and a listener on the element being replaced dies with it. */
function mixDialTap(wrap, d = MIX) {
  if (!wrap || wrap._wired) return;
  wrap._wired = true;
  wrap.addEventListener('click', (e) => {
    /* ⚠ Swallowed whether or not it hit a genre. The dial covers `.v3-album`,
       which carries `onAlbumArt` — a tap on the empty middle would otherwise
       fall through and navigate to the album page out from under the dial. */
    e.stopPropagation();
    const g = e.target.closest && e.target.closest('.ob-hole');
    if (!g) return;
    const it = d.ring.items[+g.dataset.i];
    if (!it) return;
    // A main takes you INTO it; everything else is a pick — including the
    // head of a sub ring, which picks the overall genre (it just is not
    // picked FOR you on the way in any more).
    if (it.kind === 'main') mixGoto(it.value, d);
    else mixToggle(it.value, d);
  });
}

/* Step into a main's ring, or back out to the top. Redraws — the holes change.
   ⚠ IT STEPS ON THE FRAME YOU TAP, and an earlier cut did not: the chosen hole
   was held lit for 190ms and its label then FLEW into the record and became the
   label there. It answered the right question — which genre did I just open —
   and it was rejected for how it read: a name crawling out of the ring and into
   the middle of the disc is unsettling to watch, and it put a 490ms toll on
   every step into a genre. The answer moved to the destination instead, where
   it costs nothing: the main you chose is IN the ring you land on, lit, in the
   hole it already occupied. ⚠ Gone with it: MIX_PICK_MS, MIX_FLY_MS,
   mixFlying, mixPicking, mixPickIn, mixFlyLabel, .ob-fly-* and .is-handoff. */
function mixGoto(main, d = MIX) {
  /* ⚠ The direction is what the animation MEANS: going in, the ring you leave
     opens outward past you and the new one rises from the hub; coming out, the
     reverse. Same transition played both ways, so the gesture reads as depth
     rather than as a generic fade. */
  /* ⚠ WHICH HOLE THE MAIN WAS IN, recorded on the way through. The ring it
     opens has that same main in it, and it has to land in the SAME PLACE or it
     is just another name in a new arrangement — the whole point is that the
     one hole which does not move is the one you pressed. Read off `d.ring`,
     which is the ring as actually drawn, seating included. */
  if (main) {
    const h = d.ring.seat.findIndex(gi => {
      const it = d.ring.items[gi];
      return it && it.kind === 'main' && it.value === main;
    });
    d.from = h >= 0 ? { hole: h, n: d.ring.items.length } : null;
  } else d.from = null;
  /* ⚠️ GOING IN PICKS IT. Tapping a main is a statement that you want that
     genre — the ring of subgenres is there to REFINE it, not to make you say it
     twice — so the main lands in the mix on the way through and the hole you
     arrive on is already filled rather than merely outlined. Removing it is one
     tap on that same hole, or its chip in the info box.
     ⚠️ It is re-added on every entry, including after you have removed it and
     stepped back out and in. That is the price of "the genre you opened is in
     your mix" being true without exception, and it is the behaviour that makes
     one tap enough. */
  /* ⚠ NOT ANY MORE (2026-09-04): the main is not added FOR you on the way in.
     Landing with "All Electronic" already in the mix read as weird next to
     the subgenres. The overall genre is still a pick — tap the head hole of
     the sub ring — it is just your tap, not the step in, that makes it one. */
  /* ⚠ `stay` is the genre that must not move while the rings swap: the main
     you are opening, or — on the way out — the one you are leaving. Read by
     mixDialRender, which holds that hole on its own layer. */
  d.stay = main || d.at || null;
  d.at = main || null;
  mixDialRender(main ? 'in' : 'out', d);
}

function mixToggle(g, d = MIX) {
  d.genres.has(g) ? d.genres.delete(g) : d.genres.add(g);
  mixDialSync(d);
}

/* Redraw the ring itself. `mixDialSync` only repaints STATE on the holes that
   are already there, so stepping between levels — where the holes themselves
   change — has to come through here. */
/* ⚠ Must outlast the LONGEST of the transitions in app.css — the incoming
   ring's .2s delay plus its .3s growth. Cut this short and the outgoing dial is
   yanked out of the DOM mid-move. */
/* ⚠ The outgoing ring is GONE by the time the new one starts (.2s out, .22s
   before the next begins), so this only has to outlast the exit. */
const MIX_ANIM_MS = 240;

function mixDialRender(dir, d = MIX) {
  const still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* ⚠ EVERY wrap this dial is drawn in. On the home that is one; in onboarding
     it is one per rendered `.s-onboarding` (dark + light in the viewer), and a
     step into a main has to happen on all of them or the two variants end up
     showing different rings of the same state. */
  d.wraps().forEach(wrap => {
    /* ⚠ CLEAR ANY GHOST STILL IN FLIGHT FIRST. The outgoing dial is removed on a
       timer, so tapping again before it fires left two, three, four rings stacked
       on top of each other — every one of them mid-transition and all of them
       drawing labels. The timer is a fallback; this is the guarantee.
       ⚠ It has to run BEFORE the live ring is picked, not after: a ghost sits
       ahead of its replacement in the DOM, so querySelector would hand back the
       ghost and the sweep would then detach the very node we were about to
       insert next to. */
    wrap.querySelectorAll('.ob-dial.is-ghost').forEach(g => g.remove());
    const old = wrap.querySelector('.ob-dial'); if (!old) return;

    old.insertAdjacentHTML('afterend', mixDialSvg(d));
    const dial = old.nextElementSibling;
    mixDialFitLabels(dial);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => mixDialFitLabels(dial));

    if (!dir || still) { old.remove(); return; }

    /* ⚠ THE TWO RINGS OVERLAP for one transition — the old one is still in the
       DOM while the new one arrives, which is the whole reason this reads as
       depth instead of a swap. The hub is deliberately OUTSIDE the animated
       group: it stays put and the rings move past it, so there is a fixed thing
       to read the movement against.
       ⚠ The outgoing dial is marked `is-ghost` so `mixDialSync` cannot pick it up and
       repaint the ring that is already on its way out. */
    old.classList.add('is-ghost', 'ob-dial--leave-' + dir);
    dial.classList.add('ob-dial--enter-' + dir);
    void dial.getBoundingClientRect();          // commit the start state
    dial.classList.remove('ob-dial--enter-' + dir);
    setTimeout(() => old.remove(), MIX_ANIM_MS + 40);
    mixStayHole(wrap, old, dial, d);
  });
  mixHubSync(d);
  mixDialSync(d);
}

/* ⚠ THE ONE HOLE THAT DOES NOT MOVE. The seating already puts the genre you
   tapped in the same hole on both rings, but both rings are whole <svg>s that
   scale into the record and back — so its name went to the middle and came
   out again with everything else, and "the one that stays" was only true of
   where it ended up. A child cannot opt out of its parent's transform, so for
   the length of the swap the hole is lifted onto a THIRD layer on the same
   viewBox (like the record): the copy stands still, the same hole is hidden
   on the outgoing ring and on the arriving one, and when the arrival has
   finished the copy goes and the real hole is shown in its place.
   ⚠ Matched by LABEL (`data-full`), not by ring index — the old ring's items
   are already gone from `d.ring` by the time this runs. A main and its head
   hole share one label, which is what makes them the same hole.
   ⚠ `is-ghost` on the layer, so the sweep at the top of mixDialRender clears
   it if the next tap comes before the timer, and mixWrapSync never repaints
   it. It sits AFTER the live dial, so `querySelector('.ob-dial')` still finds
   the live one first. */
const MIX_STAY_MS = 540;   // outlasts the arrival's .22s delay + .26s growth
function mixStayHole(wrap, oldDial, newDial, d) {
  const want = d.stay;
  if (!want) return;
  const holeIn = svg => [...svg.querySelectorAll('.ob-hole')]
    .find(g => { const t = g.querySelector('.ob-hole-t'); return t && t.dataset.full === want; });
  const a = holeIn(oldDial), b = holeIn(newDial);
  if (!a || !b) return;
  mixWrapSync(wrap, d);                       // so the copy carries the lit state
  newDial.insertAdjacentHTML('afterend',
    `<svg class="ob-dial is-ghost ob-dial--stay" viewBox="0 0 ${DIAL.vb} ${DIAL.vb}" aria-hidden="true">` +
    `<g class="ob-dial-ring">${b.outerHTML}</g></svg>`);
  const layer = newDial.nextElementSibling;
  a.classList.add('is-held'); b.classList.add('is-held');
  setTimeout(() => {
    b.classList.remove('is-held');
    if (layer && layer.parentNode) layer.remove();
  }, MIX_STAY_MS);
}

function mixWrapSync(wrap, d = MIX) {
  const svg = wrap.querySelector('.ob-dial:not(.is-ghost)');
  if (svg) {
    svg.querySelectorAll('.ob-hole').forEach(g => {
      const it = d.ring.items[+g.dataset.i];
      const on = !!it && mixHoleOn(it, d);
      g.classList.toggle('is-on', on);
      const c = g.querySelector('.ob-hole-c');
      if (c) c.setAttribute('r', on ? DIAL.holeOn : DIAL.hole);
    });
    const belt = svg.querySelector('.ob-dial-belt');
    if (belt) belt.setAttribute('d', beltPath(dialWheels(d)));
  }
  const hub = wrap.querySelector('.ob-hub-svg');
  if (hub) hub.classList.toggle('is-lit', d.genres.size > 0);
}

/* Repaint STATE onto every wrap of this dial — lit holes, the belt, the record —
   then whatever else the context wants painted (`d.onSync`). The ring itself is
   not rebuilt here; that is `mixDialRender`. */
function mixDialSync(d = MIX) {
  d.wraps().forEach(w => mixWrapSync(w, d));
  if (d.onSync) d.onSync();
}

/* The HOME's readout — `MIX.onSync`. Lives in the info box under the dial. */
function mixHomeReadout() {
  const host = mixHost;
  if (!host) return;

  /* The readout lives in the INFO BOX now, not in the hub. The box that
     normally says what this album is says what the mix is instead — same slot,
     same voice, and it has the room to count in words where a 52-unit record
     did not.
     ⚠ It counts ALBUMS, not genres. "3 picked" tells you what you did; "41
     albums" tells you whether the shelf is worth having. */
  /* ⚠ ONE shelf, read twice. The count in the box and the deck the button
     commits have to be the same thing — building the shelf here and letting
     the button build its own is how the two come to disagree. */
  const picked = MIX.genres.size;
  const shelf = picked ? mixShelf() : null;
  const n = shelf ? shelfPool(shelf).length : 0;
  const nEl = host.querySelector('.v3-blue-mix-n');
  if (nEl) nEl.textContent = !picked ? 'Build your genre mix'
                           : n + (n === 1 ? ' album' : ' albums') +
                             (shelf.widened ? ' · related' : '');

  /* ⚠ THE PICKS THEMSELVES, not a count of them. "3 genres" tells you how many
     you have and nothing about WHICH — and with the picks now scattered across
     several rings, the ring in front of you can only ever show one main's
     worth. This row is the only place the whole mix is visible, so it lists it,
     and each chip removes its own pick: the thing you can see is the thing you
     can undo. It WRAPS across the top of the box and `mixFitChips` shrinks the
     chips until every one of them fits above the count / New deck row. */
  const picks = host.querySelector('.v3-blue-mix-picks');
  if (picks) {
    if (!picked) {
      picks.classList.add('is-empty');
      picks.textContent = MIX.at ? 'Tap the subgenres you want' : 'Tap a genre to open it';
    } else {
      picks.classList.remove('is-empty');
      /* ⚠ `obEsc` on the label AND on the attribute. "R&B" is a genre and a
         bare & in either place is malformed markup. */
      picks.innerHTML = [...MIX.genres].map(g =>
        `<button class="v3-mix-chip" type="button" data-g="${obEsc(g)}" title="Remove ${obEsc(g)}">` +
        `${obEsc(mixChipLabel(g))}<i>×</i></button>`).join('');
      mixFitChips(picks);
      // The bar may have only just been shown (or the mono face only just
      // loaded) — measure again once layout has settled.
      requestAnimationFrame(() => mixFitChips(picks));
    }
  }

  /* ⚠ NO MINIMUM NUMBER OF GENRES — one genre is a mix. The dial is an
     ALTERNATIVE way to cut the catalogue, not a "combine several things"
     puzzle, and making you add a second genre you don't want is a toll on the
     way to a shelf you have already described. The only floor left is the one
     the QUEUE needs: a shelf you cannot swipe is not a shelf, which is what
     `commitShelf` refuses under two albums — and the button says WHICH of the
     two is stopping you rather than sitting dead under one generic label. */
  const go = host.querySelector('.v3-blue-mix-go');
  if (go) {
    go.disabled = !picked || n < 2;
    go.textContent = !picked ? 'Pick a genre'
                   : n < 2   ? (n ? 'Too few' : 'None yet')
                   : 'New deck';
  }
}

/* THE PILLS SHRINK TO FIT (Eric, 2026-09-18): the more you add, the smaller
   they get, so the whole mix is always visible and none of it overflows the
   box or drops under the New deck row. Every measure on `.v3-mix-chip` is in
   `em`, so one custom property (`--chip`, the font size) scales the lot.
   Steps down from 9px until the wrapped rows fit the picks area; at the floor
   (5.5px — below that a name stops being a word) the tail is folded into a
   "+N" chip instead. ⚠ scrollHeight / clientHeight are LAYOUT px, so the
   viewer's zoom and the shop's scale() don't skew this. Skips when the bar is
   not laid out yet (0 tall) — the caller's rAF pass catches that. */
const MIX_CHIP_MAX = 9, MIX_CHIP_MIN = 5.5;
function mixFitChips(picks) {
  if (!picks || !picks.clientHeight) return;
  const fits = () => picks.scrollHeight <= picks.clientHeight + 1 && picks.scrollWidth <= picks.clientWidth + 1;
  picks.querySelectorAll('.v3-mix-more').forEach(m => m.remove());
  picks.querySelectorAll('.v3-mix-chip[hidden]').forEach(c => { c.hidden = false; });
  let fs = MIX_CHIP_MAX;
  picks.style.setProperty('--chip', fs + 'px');
  while (!fits() && fs > MIX_CHIP_MIN) {
    fs = Math.max(MIX_CHIP_MIN, fs - 0.5);
    picks.style.setProperty('--chip', fs + 'px');
  }
  if (fits()) return;
  const chips = [...picks.querySelectorAll('.v3-mix-chip')];
  const more = document.createElement('span');
  more.className = 'v3-mix-chip v3-mix-more';
  picks.appendChild(more);
  let cut = 0;
  while (!fits() && cut < chips.length - 1) {
    chips[chips.length - 1 - cut].hidden = true;
    more.textContent = '+' + (++cut);
  }
}

// In the chips, a main reads as it does on the ring — "Electronic", not
// "All Electronic" (the "All" prefix was the weird part).
const mixChipLabel = g => g;

/* ⚠ A picked MAIN expands to itself plus every sub under it. Containment alone
   is not enough: "Electronic" catches Electronic and Electronic soul but not
   Ambient, Techno or UK Garage, so "All Electronic" would quietly be NARROWER
   than the subs it is offered above. Expanding here keeps `shelfPool` a dumb
   matcher and puts the meaning of "all" in one place.
   ⚠ Deduped: subs overlap between mains (Indie rock is under Rock and Indie),
   and `shelfPool` visits each album once so a duplicate label is harmless — but
   it would show up in any count taken off this list. */
// Every main a subgenre sits under. ⚠ Deliberately more than one — Shoegaze is
// under Alternative AND Indie, Trip-hop under Electronic AND Hip-Hop.
const mixParentsOf = s => Object.keys(SD_GENRE_TREE)
  .filter(m => (SD_GENRE_TREE[m] || []).indexOf(s) >= 0);

/* ⚠ A SHELF THAT CANNOT BE SWIPED IS NOT A SHELF, so a pick that cannot fill
   one WIDENS to the family it belongs to rather than sitting there dead.
   Picking one subgenre is meant to be enough — there has never been a minimum
   number of genres — but "enough" was being decided by the archive rather than
   by the design: 233 of the 236 subgenres match fewer than two albums, so
   almost every single pick left New deck disabled and the dial looked broken.

   ⚠ EXACT FIRST, ALWAYS. The widening only happens when the exact pool is
   under the queue floor, so a subgenre that CAN stand on its own is never
   quietly broadened — and with real genre data behind it this branch stops
   running altogether. It is a graceful degradation, not the normal path.

   ⚠ It is not silent: the readout says "· related" when it fires, because a
   shelf that is not what you asked for has to say so.

   ⚠ Only SUBGENRES widen. A main already reaches its whole family through the
   expansion below, so a main with nothing under it genuinely has nothing. */
const MIX_MIN = 2;                 // the queue floor commitShelf enforces
const MIX_OPEN_MS = 560;           // the spin-in; must outlast the keyframe
const mixShelf = () => {
  const picks = [...MIX.genres];
  /* ⚠ A picked MAIN expands to [main, ...subs]: containment on the main's name
     alone would reach "Electronic soul" but not Ambient or Techno, so "all of
     Electronic" would be NARROWER than the subs offered under it. */
  const exact = [...new Set(picks.flatMap(g =>
    (g in SD_GENRE_TREE) ? [g, ...SD_GENRE_TREE[g]] : [g]))];
  const shelf = { label: 'Your mix', kind: 'mix', genres: exact };
  if (!picks.length || shelfPool(shelf).length >= MIX_MIN) return shelf;
  const family = [...new Set(picks.filter(g => !(g in SD_GENRE_TREE))
                                  .flatMap(mixParentsOf))];
  if (!family.length) return shelf;
  const wide = { label: shelf.label, kind: shelf.kind,
                 genres: [...new Set(exact.concat(family))], widened: true };
  // No point saying "related" if the family cannot field a deck either.
  return shelfPool(wide).length >= MIX_MIN ? wide : shelf;
};
const mixPool  = () => (MIX.genres.size ? shelfPool(mixShelf()) : []);

/* ── Mounted IN THE BENTO ───────────────────────────────────────────────
   ⚠ This was a bottom sheet (`.sd-log-overlay` + `.mix-sheet`) and deliberately
   is not any more. The dial chooses what the bento shows, so it belongs in the
   bento: the ring goes in `.v3-album` — the same square the shelf wheel covers
   — and the commit goes in `.v3-blue` underneath it. A window sliding up in
   front of the object is one more surface to get out of, and the thing it was
   covering was the thing you were deciding about.

   ⚠ Built by JS into the finished bento, NOT added to `bentoHtml()`. That
   component is shared with the shop's showcase and stays pristine — the same
   rule `proWheelInit` follows for the shelf wheel. */

// The screen the dial is currently open on — and the flag for whether it is
// open at all. `mixDialSync` scopes every lookup to it.
let mixHost = null;

function mixInlineBuild(host) {
  const album = host.querySelector('.v3-album');
  const blue  = host.querySelector('.v3-blue');
  if (!album || !blue) return false;          // bento not built yet

  if (!album.querySelector('.mix-inline')) {
    const wrap = document.createElement('div');
    wrap.className = 'mix-inline';
    /* The same three layers as `.shop-pick`, for the same reasons documented
       there: a PAINTED blur of the cover (not `backdrop-filter`, which samples
       in the wrong coordinate space under the bento's transform and the
       viewer's zoom), a wash over it, then the dial. */
    wrap.innerHTML = `<span class="mix-inline-bg"></span>` +
                     `<span class="mix-inline-tint"></span>` +
                     mixDialSvg() + mixHubSvg();
    wrap.addEventListener('click', e => e.stopPropagation());
    album.appendChild(wrap);
    const dial = wrap.querySelector('.ob-dial');
    mixDialTap(wrap);
    /* ⚠ Measurable HERE because `.mix-inline` is only `opacity: 0` when idle,
       never `display: none` — the same reason the shelf wheel's `rowPx()` can
       measure a row before the wheel is armed. */
    mixDialFitLabels(dial);
    /* ⚠ And again once the webfont has actually landed. Roboto Flex arrives
       over the network; until it does, the first pass measures the FALLBACK
       face, which has no `wdth` axis to condense and reports somebody else's
       widths. */
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => mixDialFitLabels(dial));
    }
  }

  if (!blue.querySelector('.v3-blue-mix')) {
    const bar = document.createElement('div');
    bar.className = 'v3-blue-mix';
    /* Pills on TOP, the count and the button on the FLOOR (Eric, 2026-09-18 —
       it was the other way up, with the pills in a sideways scroller beside the
       button). The pills get the box's whole width and shrink to fit it
       (`mixFitChips`), so nothing scrolls and nothing reaches the bottom row. */
    bar.innerHTML = `<div class="v3-blue-mix-picks"></div>` +
                    `<div class="v3-blue-mix-row">` +
                      `<span class="v3-blue-mix-n"></span>` +
                      `<button class="v3-blue-mix-go" type="button"></button>` +
                    `</div>`;
    /* ⚠ `.v3-blue` opens the album page on click. The bar covers it completely
       and stops the bubble, so choosing a mix cannot navigate away from the
       screen you are choosing it for. */
    bar.addEventListener('click', e => e.stopPropagation());
    // Delegated: the chips are rebuilt on every pick.
    bar.addEventListener('click', e => {
      const chip = e.target.closest && e.target.closest('.v3-mix-chip[data-g]');
      if (chip) { MIX.genres.delete(chip.dataset.g); mixDialSync(); }
    });
    bar.querySelector('.v3-blue-mix-go').addEventListener('click', () => {
      if (!MIX.genres.size || mixPool().length < 2) return;
      commitShelf(mixShelf());
      closeMixDial();
    });
    blue.appendChild(bar);
  }
  return true;
}

window.openMixDial = function (fromEl) {
  const host = (fromEl && fromEl.closest && fromEl.closest('.s-home-v3'))
            || document.querySelector('.s-home-v3:not(.s-shop)');
  if (!host || !mixInlineBuild(host)) return;
  /* ⚠ Taken off the OLD host first: the dial can be reopened from the other
     home variant, and a screen left marked keeps a dial over its cover and a
     pill saying Back with nothing to go back from. */
  if (mixHost && mixHost !== host) mixHost.classList.remove('s-home-v3--mixing');
  mixHost = host;
  /* Copied on every open, not once at build: the cover changes with every swipe
     and every shelf commit, and a blur of the album you were looking at three
     swipes ago is worse than no blur at all. */
  const bg = host.querySelector('.mix-inline-bg');
  const album = host.querySelector('.v3-album');
  if (bg && album) bg.style.backgroundImage = album.style.backgroundImage;
  /* The class does the rest in app.css: shows the dial, swaps the info box for
     the mix readout, and flips the corner pill to Back — the app's one
     dedicated back button, which is how you leave a gesture still "held". */
  host.classList.add('s-home-v3--mixing');
  /* ⚠ Always opens on the TOP ring. The picks survive — they are the work — but
     the ring you happened to be standing in when you left is not, and dropping
     someone back inside "Alternative" with no memory of why is worse than one
     extra tap. */
  MIX.at = null;
  MIX.from = null;
  mixDialRender();
  /* ⚠️ THE ENTRANCE, and the one moment the dial moves as a WHOLE — ring and
     record together, because a record is a thing that spins and this is the
     only time the two are not telling you about a step between rings. Stepping
     keeps the record still on purpose (it is the fixed thing the rings move
     against); arriving has nothing to be fixed against yet.
     ⚠️ A CLASS ON THE WRAP, not on the dial: `mixDialRender` replaces the ring
     on every step, so a class living on it would be lost — and the record is a
     sibling that has to spin with it.
     ⚠️ Removed and re-added around a reflow so a reopen actually replays it;
     an animation does not restart just because its element was re-marked. */
  const wrap = host.querySelector('.mix-inline');
  const still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (wrap && !still) {
    wrap.classList.remove('is-opening');
    void wrap.getBoundingClientRect();
    wrap.classList.add('is-opening');
    clearTimeout(wrap._spin);
    wrap._spin = setTimeout(() => wrap.classList.remove('is-opening'), MIX_OPEN_MS);
  }
};

function closeMixDial() {
  if (mixHost) mixHost.classList.remove('s-home-v3--mixing');
  mixHost = null;
}

// ── Walls (artists / albums) ──────────────────────────────────
function obCard(type, key, image, sub, on, title) {
  const fn    = type === 'artist' ? 'obToggleArtist' : 'obToggleAlbum';
  const label = type === 'artist' ? key : title;
  const round = type === 'artist' ? ' ob-card-img--round' : '';
  return `<button class="ob-card${on ? ' ob-card--on' : ''}" onclick="${fn}('${obOc(key)}')">
    <span class="ob-card-img${round}" style="background-image:url('${image}')">
      <span class="ob-card-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>
    </span>
    <span class="ob-card-t">${obEsc(label)}</span>
    <span class="ob-card-s">${obEsc(sub)}</span>
  </button>`;
}
function obChip(type, key, image, label) {
  const fn    = type === 'artist' ? 'obToggleArtist' : 'obToggleAlbum';
  const round = type === 'artist' ? ' ob-chip-img--round' : '';
  return `<button class="ob-chip" onclick="${fn}('${obOc(key)}')">
    <span class="ob-chip-img${round}" style="background-image:url('${image}')"></span>
    <span class="ob-chip-t">${obEsc(label)}</span>
    <span class="ob-chip-x">×</span>
  </button>`;
}
function obRenderWall(root, kind) {
  const wall   = root.querySelector(`.ob-wall[data-wall="${kind}"]`);
  if (!wall) return;
  // ⚠ The picks are no longer pinned above the wall — they are in the dock (obSyncDock).
  const q = OB.q[kind];
  if (kind === 'artists') {
    const sel = OB.artists, list = obArtistList();
    const match  = list.filter(a => !q || a.name.toLowerCase().includes(q));
    wall.innerHTML = match.map(a => obCard('artist', a.name, a.image, a.genre, sel.has(a.name))).join('')
      || `<div class="ob-empty">No artists match “${obEsc(q)}”.</div>`;
  } else {
    const sel = OB.albums, list = obAlbumList();
    const match  = list.filter(a => !q || a.album.toLowerCase().includes(q) || a.artist.toLowerCase().includes(q));
    wall.innerHTML = match.slice(0, 60).map(a => obCard('album', albumKey(a), a.image, a.artist, sel.has(albumKey(a)), a.album)).join('')
      || `<div class="ob-empty">No albums match “${obEsc(q)}”.</div>`;
  }
}

function obRenderPeople(root) {
  const box = root.querySelector('.ob-people'); if (!box) return;
  box.innerHTML = obPeopleList().map(p => {
    const on = OB.following.has(p.user);
    return `<div class="ob-person">
      <span class="ob-person-av" style="background:${p.grad}">${obEsc(p.init)}</span>
      <span class="ob-person-main">
        <span class="ob-person-user">@${obEsc(p.user)}</span>
        <span class="ob-person-mutual">${p.mutual} mutual${p.mutual > 1 ? 's' : ''}</span>
      </span>
      <button class="ob-follow${on ? ' ob-follow--on' : ''}" onclick="obToggleFollow('${obOc(p.user)}')">${on ? 'Following' : 'Follow'}</button>
    </div>`;
  }).join('');
}

function obRenderProfile(root) {
  const box = root.querySelector('.ob-profile'); if (!box) return;
  const u = OB.username || 'you';
  const init = (u[0] || '?').toUpperCase();
  const svc = OB.service ? OB.service[0].toUpperCase() + OB.service.slice(1) : null;
  const stat = (n, l) => `<div class="ob-stat"><div class="ob-stat-n">${n}</div><div class="ob-stat-l">${l}</div></div>`;
  box.innerHTML = `
    <div class="ob-pf-hero">
      <div class="ob-pf-av">${obEsc(init)}</div>
      <div class="ob-pf-name">@${obEsc(u)}</div>
      <div class="ob-pf-tagline">fresh on Spindeck</div>
      ${svc ? `<div class="ob-pf-badge"><span class="ob-pf-badge-dot"></span>${obEsc(svc)} connected${OB.tracking ? ' · sharing' : ''}</div>` : ''}
    </div>
    <div class="ob-pf-stats">
      ${stat(OB.genres.size, 'genres')}
      ${stat(OB.artists.size, 'artists')}
      ${stat(OB.albums.size, 'albums')}
      ${stat(OB.following.size, 'following')}
    </div>
    <div class="ob-pf-note">You can refine all of this any time from your profile.</div>`;
}

// ── Actions ───────────────────────────────────────────────────
window.obSetUsername = function (v) {
  OB.username = String(v).replace(/[^a-zA-Z0-9_]/g, '').slice(0, 18);
  document.querySelectorAll('.s-onboarding').forEach(r => {
    const ui = r.querySelector('.ob-user-input');
    if (ui && ui.value !== OB.username) ui.value = OB.username;   // echo the sanitized value
    obUserHint(r);
    obSyncFooter(r);
  });
};
window.obConnect      = function (id)  { OB.service = OB.service === id ? null : id; obSync(); };
window.obSetTracking  = function (v)   { OB.tracking = v; obSync(); setTimeout(() => obNext(), 240); };
// ⚠ Called as (el, name) by the chip row and as (name) by the bubbles; `el` was never used.
window.obToggleGenre  = function (a, b) { const name = b === undefined ? a : b; OB.genres.has(name) ? OB.genres.delete(name) : OB.genres.add(name); obSync(); };
window.obToggleArtist = function (name){ OB.artists.has(name) ? OB.artists.delete(name) : OB.artists.add(name); obSync(); };
window.obToggleAlbum  = function (key) { OB.albums.has(key) ? OB.albums.delete(key) : OB.albums.add(key); obSync(); };
window.obToggleFollow = function (user){ OB.following.has(user) ? OB.following.delete(user) : OB.following.add(user); obSync(); };
window.obSearch       = function (kind, v) { OB.q[kind] = String(v).toLowerCase(); document.querySelectorAll('.s-onboarding').forEach(r => obRenderWall(r, kind)); };

window.obNext = function (skip) {
  if (!skip && OB.step === 0 && !obUserValid()) return;   // username required — unless skipping (the rail's Skip passes true)
  const active = obActiveSteps();
  const i = active.indexOf(OB.step);
  if (i >= active.length - 1) { obFinish(); return; }
  OB.step = active[i + 1];
  obSync();
  obScrollTop();
  obMixArrive();
};
window.obBack = function () {
  const active = obActiveSteps();
  const i = active.indexOf(OB.step);
  if (i <= 0) { navigate('auth'); return; }
  OB.step = active[i - 1];
  obSync();
  obScrollTop();
  obMixArrive();
};
function obScrollTop() { document.querySelectorAll('.s-onboarding .ob-stage').forEach(s => s.scrollTop = 0); }
window.obFinish = function () { navigate('home'); };

// ══════════════════════════════════════════════════════════════
//  PROFILE — "Funky" theme 01 (5 favourite albums · social · info)
// ══════════════════════════════════════════════════════════════
window.PROFILE = {
  name:   'Eric',
  handle: 'ericd',
  bio:    'Shoegaze apologist and lifelong crate-digger. I review mostly ambient, dream-pop and hip-hop, but I\'ll give anything one honest listen. Half my week is spent building playlists like mixtapes for people I haven\'t met yet.',
  location:   'South Korea',
  /* ⚠ `occupation` is DATA ONLY now — the tags below replaced it in the UI and
     nothing renders it. The personas still carry the field. */
  occupation: 'Motion Designer',
  /* Worn tags, and the reason one of them is an event: the collectibles are the
     point of the system, and a mockup where the default profile has none never
     shows it. `initTags` reads this and treats what you are wearing as owned. */
  tags:   ['daisychains2026', 'shoegazer', 'nightowl'],
  pic:    'images/playlist-statue-night.jpg',
  favs:   ['Punisher', 'Loveless', 'Blonde', 'Currents', 'To Pimp a Butterfly'],
  socials:{ instagram: 'ericd', x: 'ericd', soundcloud: 'ericd' },
  // Prototype stats (fictional)
  reviews:   328,
  playlists: 12,
  followers: 1900,
  following: 214,
  since:     '2023',
  // Favourite artists (4) and songs (5). Album names supply the artwork.
  favArtists: ['Phoebe Bridgers', 'Frank Ocean', 'My Bloody Valentine', 'Tame Impala'],
  favSongs: [
    { title: 'Scott Street',                 artist: 'Phoebe Bridgers', album: 'Punisher' },
    { title: 'Ivy',                          artist: 'Frank Ocean',     album: 'Blonde' },
    { title: 'Only Shallow',                 artist: 'My Bloody Valentine', album: 'Loveless' },
    { title: 'The Less I Know the Better',   artist: 'Tame Impala',     album: 'Currents' },
    { title: 'Alright',                      artist: 'Kendrick Lamar',  album: 'To Pimp a Butterfly' },
  ],
};

// Curated photo pool (lo-fi / Y2K / nature / surreal) used for random profile
// pictures and playlist covers. 64 web-optimised crops from Eric's set, plus
// the existing playlist photos.
const PROFILE_PHOTOS = [
  'images/rp-01.jpg', 'images/rp-02.jpg', 'images/rp-03.jpg', 'images/rp-04.jpg', 'images/rp-05.jpg', 'images/rp-06.jpg', 'images/rp-07.jpg', 'images/rp-08.jpg',
  'images/rp-09.jpg', 'images/rp-10.jpg', 'images/rp-11.jpg', 'images/rp-12.jpg', 'images/rp-13.jpg', 'images/rp-14.jpg', 'images/rp-15.jpg', 'images/rp-16.jpg',
  'images/rp-17.jpg', 'images/rp-18.jpg', 'images/rp-19.jpg', 'images/rp-20.jpg', 'images/rp-21.jpg', 'images/rp-22.jpg', 'images/rp-23.jpg', 'images/rp-24.jpg',
  'images/rp-25.jpg', 'images/rp-26.jpg', 'images/rp-27.jpg', 'images/rp-28.jpg', 'images/rp-29.jpg', 'images/rp-30.jpg', 'images/rp-31.jpg', 'images/rp-32.jpg',
  'images/rp-33.jpg', 'images/rp-34.jpg', 'images/rp-35.jpg', 'images/rp-36.jpg', 'images/rp-37.jpg', 'images/rp-38.jpg', 'images/rp-39.jpg', 'images/rp-40.jpg',
  'images/rp-41.jpg', 'images/rp-42.jpg', 'images/rp-43.jpg', 'images/rp-44.jpg', 'images/rp-45.jpg', 'images/rp-46.jpg', 'images/rp-47.jpg', 'images/rp-48.jpg',
  'images/rp-49.jpg', 'images/rp-50.jpg', 'images/rp-51.jpg', 'images/rp-52.jpg', 'images/rp-53.jpg', 'images/rp-54.jpg', 'images/rp-55.jpg', 'images/rp-56.jpg',
  'images/rp-57.jpg', 'images/rp-58.jpg', 'images/rp-59.jpg', 'images/rp-60.jpg', 'images/rp-61.jpg', 'images/rp-62.jpg', 'images/rp-63.jpg', 'images/rp-64.jpg',
  'images/playlist-cyano-birds.jpg', 'images/playlist-car-dash.jpg', 'images/playlist-misty-lake.jpg', 'images/playlist-chrome-ooh.jpg', 'images/playlist-city-red.jpg',
  'images/playlist-wildflowers.jpg', 'images/playlist-hibiscus.jpg', 'images/playlist-statue-night.jpg', 'images/playlist-ink-alley.jpg', 'images/playlist-cyano-horse.jpg',
];

// ── Random persona: rolled once on load so every visit shows a new profile ──
// (image · nickname/handle · bio · location · job · numbers · favourite albums ·
//  artists · playlists · recently-rated). Edits (picker) still persist per visit.
/* A string → a repeatable stream of numbers. Used to deal a FRIEND's profile:
   the same name must produce the same person every time you open them, or the
   app looks like it forgot who they were between taps. FNV-1a into mulberry32
   — both are four lines and neither needs to be good, only stable. */
function seedRng(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return function () {
    h |= 0; h = h + 0x6D2B79F5 | 0;
    let t = Math.imul(h ^ h >>> 15, 1 | h);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/* Deal a profile into `window.PROFILE`.

   No argument — a fresh random person, the demo's own behaviour on every visit
   to your profile.
   `seedName` — THAT person, dealt from a seeded stream and wearing that name.
   This is how a friend's page works: the profile screen reads one global
   object, so viewing someone else is a temporary, repeatable overwrite of it.
   ⚠ Every draw below goes through `R`, never `Math.random` directly — one
   stray call and a seeded profile stops being stable. */
function randomizeProfile(seedName) {
  const A = window.ARCHIVE || [];
  if (!A.length) return;
  const R = seedName ? seedRng(seedName) : Math.random;
  const rnd = arr => arr[Math.floor(R() * arr.length)];
  const sample = (arr, n) => {
    const c = arr.slice();
    for (let i = c.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [c[i], c[j]] = [c[j], c[i]]; }
    return c.slice(0, n);
  };
  const ri = (lo, hi) => lo + Math.floor(R() * (hi - lo + 1));

  const nicks = ['Mira', 'Dev', 'Sasha', 'Ken', 'Luca', 'Noa', 'Remy', 'Yuki', 'Ira', 'Theo', 'Juno', 'Cass', 'Wren', 'Sol', 'Nadia', 'Bram', 'Pax', 'Indie', 'Roan', 'Suki', 'Milo', 'Fern', 'Dae', 'Otis', 'Vera', 'Kai',
    // Long-username examples — the pill + banner stretch to fit these, no overflow
    'Konstantina', 'Alexandrina', 'Bartholomew', 'Maximiliano', 'Anastasiya', 'Persephone', 'shoegazer_fm', 'vinyl_goblin', 'moonlit_echo', 'reverb_witch'];
  const sfx = ['', '', '_', 'xo', '.wav', '_fm', 'core', 'zzz', '.mp3', 'beats', 'fm', '_hifi', '777'];
  const bios = [
    'shoegaze apologist. i will make you a playlist whether you asked or not',
    '19 | i make beats in my closet | do not perceive me',
    'certified yapper. i will review your favorite album and hurt your feelings <3',
    'bassist for a band you haven\'t heard of (yet). we play basements only.',
    '23, gemini, emotionally distributed across four streaming services',
    'music is just vibes with extra steps',
    'i peaked musically in 2016 and honestly i\'m okay with that',
    'drummer 🥁 yes i heard you talking during the quiet part',
    'put a song on aux and watch me make it everyone\'s problem',
    'former emo → current emo → future emo. it\'s a cycle.',
    'i don\'t have a personality, i have a rate-your-music account',
    'lead singer of Wet Sockets 🎤 stream our EP or don\'t (please do)',
    '17 y/o aspiring producer. my mom says i\'m talented.',
    'will trade playlists for emotional support',
    'professional overthinker, amateur guitarist',
    'if it\'s not shoegaze i\'m asleep 💤',
    '26 | dog dad | i cry to jazz and i\'m not ashamed',
    'here to rate albums and touch grass. mostly the albums.',
    'i listen to everything and remember absolutely nothing',
    'sad girl autumn, all year round',
    'synth hoarder. i own more cables than friends.',
    'my toxic trait is thinking i could\'ve produced that better',
    '31, dad of two, still think about that one breakcore set weekly',
    'aux cord dictator. benevolent, mostly.',
    'i made my whole personality one obscure band and i regret nothing',
    'ur honor, i was simply feeling the music',
    'vinyl guy at parties (insufferable). digital everywhere else.',
    'screamo for breakfast, ambient for dinner',
    'i rate everything 4 stars because commitment is scary',
    'guitarist in three group chats and zero actual bands',
    '20 | film photography + slowcore | ask me about my tote bags',
    'heard it before it was cool and i WILL bring it up',
  ];
  const countries = ['South Korea', 'Japan', 'United States', 'United Kingdom', 'Germany', 'Brazil', 'Canada', 'France', 'Australia', 'Mexico', 'Sweden', 'Netherlands', 'Spain', 'Italy', 'Nigeria', 'Philippines', 'Poland', 'Portugal'];
  const jobs = ['Motion Designer', 'Barista', 'Software Engineer', 'Illustrator', 'Student', 'Music Teacher', 'Photographer', 'DJ', 'Producer', 'Bookseller', 'Architect', 'Nurse', 'Sound Engineer', 'Freelance Writer', 'Game Dev', 'Line Cook', 'Librarian', 'Tattoo Artist'];
  const pics = PROFILE_PHOTOS;

  const nick = rnd(nicks);
  const handle = nick.toLowerCase() + rnd(sfx);
  const artists = [...new Set(A.map(a => a.artist))];
  const pls = (typeof plLists === 'function') ? plLists() : [];

  const P = window.PROFILE;
  P.name = nick;
  P.handle = handle;
  P.bio = rnd(bios);
  P.location = rnd(countries);
  P.occupation = rnd(jobs);
  P.pic = rnd(pics);
  P.favs = sample(A, 5).map(a => a.album);
  P.favArtists = sample(artists, 4);
  // Favourite songs — one track pulled from each fav album (deterministic titles)
  P.favSongs = P.favs.map(albName => {
    const a = A.find(x => x.album === albName);
    if (!a) return null;
    const tr = (typeof songsFor === 'function') ? songsFor(a) : [];
    const t = tr.length ? tr[Math.floor(R() * tr.length)] : null;
    return { title: t ? t.title : a.album, artist: a.artist, album: a.album };
  }).filter(Boolean);
  P.reviews = ri(12, 940);
  P.playlists = ri(3, 48);
  P.followers = ri(30, 48000);
  P.following = ri(20, 1400);
  P.socials = { instagram: handle, x: handle, soundcloud: handle };
  P.playlistNames = sample(pls, Math.min(3, pls.length)).map(p => p.name);
  P.playlistCovers = sample(pics, 3);   // photo covers for the shown playlists
  P.recent = sample(A, 4).map(a => a.album);

  // A named friend keeps their name; only the rest of the person is dealt.
  if (seedName) { P.name = seedName; P.handle = seedName.toLowerCase(); }
}
randomizeProfile();

/* ═══════════════════════════════════════════════════════════════════
   SOMEONE ELSE'S PROFILE (`openFriendProfile` · `restoreOwnProfile`)
   ═══════════════════════════════════════════════════════════════════
   There is no second profile screen. `profileHtml` reads ONE global object, so
   opening a friend is a temporary overwrite of it: stash yours, deal theirs
   into the same object, navigate. Leaving hands yours back.

   ⚠ The stash is what makes that safe. Without it your own profile would
   quietly stay whoever you looked at last — the screen has no idea it is
   showing a guest.
   ⚠ Dealt from the NAME (`randomizeProfile(name)` → `seedRng`), so a friend is
   the same person every time you open them. Re-rolling per visit would read as
   the app forgetting who they were. */
let PROFILE_OWNER = null;             // your profile, parked while a guest is up
window.PROFILE_GUEST = null;          // the name being viewed, or null

/* A NAME OR A FACE IS A DOOR TO THAT PERSON (Eric, 2026-09-26: "when you
   click someone's profile name or picture it should take you to their
   profile"). Every byline — the deck's review, the review sheet, the feed
   and album-page cards, the activity cards, the comments — carries
   `onclick="sdPerson(this, event)"` on the face and the name. The name is
   `data-user`, or, on the deck's block (filled at runtime), the `.v3-fbr-who`
   beside it. Your own name ("You", or the profile on screen) goes to your
   profile; a sheet closes first so the page underneath can navigate. */
window.sdPerson = function (el, e) {
  if (e) e.stopPropagation();
  const blk = el.closest('.v3-fbr');
  const name = (el.dataset.user || (blk && blk.querySelector('.v3-fbr-who') && blk.querySelector('.v3-fbr-who').textContent) || el.textContent || '').trim();
  if (!name) return;
  if (el.closest('.v3-rsh-ov') && typeof closeReviewSheet === 'function') closeReviewSheet(true);
  const P = window.PROFILE || {};
  const mine = name === 'You' || (!window.PROFILE_GUEST && (name === P.name || name === P.handle));
  if (mine) { if (currentScreen().id !== 'profile') navigate('profile'); return; }
  if (window.PROFILE_GUEST === name && currentScreen().id === 'profile') return;   // already on their page
  openFriendProfile(name);
};
window.openFriendProfile = function (name) {
  if (!name) return;
  if (!PROFILE_OWNER) PROFILE_OWNER = Object.assign({}, window.PROFILE);
  randomizeProfile(name);
  window.PROFILE_GUEST = name;
  /* 'guest' is what keeps `navigate` from re-rolling the profile we just dealt
     and from restoring the one we just stashed. */
  navigate('profile', 'guest');
};

function restoreOwnProfile() {
  if (!PROFILE_OWNER) return;
  Object.assign(window.PROFILE, PROFILE_OWNER);
  PROFILE_OWNER = null;
  window.PROFILE_GUEST = null;
}

/* ══════════════════════════════════════════════════════════════════════════
   PERSONAS — the mockup, shown as four different people
   ══════════════════════════════════════════════════════════════════════════
   window.PERSONAS comes from personas.js, GENERATED by tools/build_personas.py
   out of personas/personas.csv + personas/taste/*.csv. Each persona carries
   its own catalogue (real albums + Deezer CDN artwork), its own profile, and a
   skin. Switching one swaps ARCHIVE wholesale, so every screen — home bento,
   wall, playlists, artist pages — re-derives from that person's taste.

   `null` is a real state: the built-in data.js archive with the random persona,
   i.e. the mockup as it was before any of this. The switcher calls it "Demo".  */

const BASE_ARCHIVE = window.ARCHIVE;          // data.js's hand-authored catalogue
const BASE_ARTIST_IMG = Object.assign({}, window.ARTIST_IMG || {});
const BASE_FRIEND_ACTIVITY = (window.FRIEND_ACTIVITY || []).slice();
window.ACTIVE_PERSONA = null;

function personaById(id) {
  return (window.PERSONAS || []).find(p => p.id === id) || null;
}

// One persona album → an ARCHIVE-shaped record. The build script already emits
// rating/reviewCount/reviews in data.js's shape; this only fills the artist
// blurbs, which Deezer has no field for.
function personaAlbums(p) {
  return p.albums.map(a => Object.assign({}, a, {
    artistDesc: a.artistDesc || `${a.genre} artist`,
    artistBio: a.artistBio ||
      `${a.artist} is an artist working in ${String(a.genre).toLowerCase()}. ${a.album} came out in ${a.year || 'recent years'}.`,
  }));
}

/* The skin. The app's screens were built on hard-coded hex, so a persona can't
   simply re-declare a handful of tokens — it overrides the surfaces carrying
   most of the look (page, cards, accent, type, corner radius) through one
   injected stylesheet scoped to `.persona-<id>` on the screen. Deliberately a
   broad first pass: enough that four personas read as four different apps,
   with per-persona detailing still to come. */
/* Elements a persona may re-ink: page CHROME only — headings and labels that sit
   on the persona's own background.
   ⚠️ Nothing from the bento stats block or the review panel belongs here
   (`.v3-blue-album`, `.v3-blue-count`, `.v3-rev-name`, `.v3-rev-text`, …). Those
   sit on the album's PROCEDURAL flood colour, which is dark in both themes, and
   they already carry theming that accounts for it. Re-inking them from the
   persona's light set put dark text on a dark album and made it unreadable. */
const PERSONA_INK1 = ['.v3-brand-name', '.wall2-title', '.pl2-title',
  '.set-title', '.v3-aa-title'];
const PERSONA_INK2 = ['.v3-brand-tag', '.wall2-sub'];

function personaSkinCss(p) {
  const s = p.skin, k = `.app-screen.persona-${p.id}`;
  // A screen is the LIGHT variant when it carries --light (home-shell screens)
  // or sd-theme-light (auth / onboarding / song). Both sets are emitted so the
  // viewer's side-by-side Dark|Light pair stays a real comparison — a persona
  // that declared one background painted both variants the same.
  const darkBases = [k];
  const lightBases = [`${k}.s-home-v3--light`, `${k}.sd-theme-light`];

  // Each base selector needs its OWN descendant — "a, b .x" would only scope
  // .x under b, silently dropping the rule for every light screen but the last.
  const each = (bases, kids) => bases.flatMap(b => kids.map(c => `${b} ${c}`)).join(',\n');

  /* ⚠️ NOT set here, deliberately:
     - `--v3-accent` / `--v3-box*` — the accent is EXTRACTED FROM THE ALBUM ART
       (`applyAlbumColors`). "Album art drives colour" is a core rule; a persona
       tinting it would flatten every album to the same hue.
     - `--star` — the rating gold now RESOLVES from `--v3-accent` first (see
       app.css), so setting it here would pin the vinyls to one colour and stop
       them following the album. The persona only supplies `--persona-accent`,
       which is the fallback for screens that have no cover to extract from.
     - `--text3` — the empty-vinyl grey, already themed per variant. */
  const tokens = (t) => `
  --persona-accent: ${t.accent};
  --sd-bg: ${t.bg};     --sd-ink: ${t.ink};   --sd-ink2: ${t.ink2};
  --sd-ink3: ${t.ink2}; --sd-card: ${t.card}; --sd-well: ${t.card};`;

  /* The page fill, held OFF the review/album/artist states. Those flood the
     screen with the album's procedural colour via `.s-home-v3--review`, which is
     only (0,1,0) specificity — a plain `.app-screen.persona-x` rule is (0,2,0)
     and silently beat it, killing the fullscreen fill. */
  /* ⚠️ The REVIEW PAGE (.s-rvp) floods with the album colour the same way and
     is held off here too — without this the persona's cream beat the page's
     dark fallback at (0,4,0) and its light ink vanished (2026-09-11). */
  const bg = (bases, t) =>
    bases.map(b => `${b}:not(.s-home-v3--review):not(.s-rvp)`).join(',\n') + ` { background: ${t.bg}; }`;

  const block = (bases, t) => `
${each(bases, PERSONA_INK1)} { color: ${t.ink}; }
${each(bases, PERSONA_INK2)} { color: ${t.ink2}; }`;

  /* ⚠️ `.v3-album` is NOT in the radius rule, and must not be added back.
     Its corner is STRUCTURAL: it sits flush inside the bento silhouette, whose
     corner is a fixed 20 units of the 689×638 viewBox and therefore scales
     with the phone. `s.radius` is a px value, so it can only be correct at one
     width — the exact trap the comment on `.v3-album` in app.css warns about —
     and a persona has no business restyling a corner that has to line up with
     a path. `eric`'s 15px rendered the cover at ~27 units against the shell's
     20, leaving a visible crescent of shell colour at all three corners.
     `.pl2-card` is a free-floating card; it keeps it.
     ⚠️ `.wall2-art` came OUT of this list. The wall is a dense 3-up grid meant
     to read as one surface, so its corner is a layout decision (3px, set in
     app.css) rather than a persona flourish — with the token applied, eric's
     15px made every cell float as a separate card and no amount of editing
     app.css could show it, because this rule is (0,3,0) and wins. Same family
     of mistake as `.v3-album`: if the shape is doing structural work, it is not
     a persona knob. */
  /* ⚠️ `s.font` is NOT emitted (Eric, 2026-09-17). Hank's skin set the whole
     app in Crimson and 16yearold's in SUSE Mono, and every screen that didn't
     pin its own face inherited it — the review bylines, the playlist page…
     "No serif unless Eric names the spot" applies to personas too, so a
     persona skins colour and radius only. The CSV column stays; nothing reads it. */
  return `
${k} {${tokens(s.dark)}}
${lightBases.join(',\n')} {${tokens(s.light)}}
${bg(darkBases, s.dark)}
${bg(lightBases, s.light)}
${block(darkBases, s.dark)}
${block(lightBases, s.light)}
${each([k], ['.pl2-card'])} { border-radius: ${s.radius}; }`;
}

function applyPersonaSkins() {
  let el = document.getElementById('persona-skins');
  if (!el) {
    el = document.createElement('style');
    el.id = 'persona-skins';
    document.head.appendChild(el);
  }
  el.textContent = (window.PERSONAS || []).map(personaSkinCss).join('\n');
}

/* Swap the whole app over to one persona (or back to the demo data with null).
   Order matters: ARCHIVE first, because featuredAlbum/trendingAlbums and the
   profile are all derived FROM it. */
window.applyPersona = function (id) {
  const p = id ? personaById(id) : null;
  window.ACTIVE_PERSONA = p ? p.id : null;
  try { localStorage.setItem('spindeck-persona', p ? p.id : ''); } catch (e) {}

  if (p && p.albums.length) {
    window.ARCHIVE = personaAlbums(p);
    window.ARTIST_IMG = Object.assign({}, BASE_ARTIST_IMG, p.artistImg || {});
  } else {
    window.ARCHIVE = BASE_ARCHIVE;
    window.ARTIST_IMG = Object.assign({}, BASE_ARTIST_IMG);
  }
  const A = window.ARCHIVE;
  window._pinnedReview = null;
  if (p) {
    /* A persona's identity is authored and fixed, so it can't get its variety
       the way the demo does (randomizeProfile re-rolls a whole new person each
       visit). It comes from the HOME instead: every switch — and every page
       load, since initPersonas re-applies — deals a fresh featured album, swipe
       queue, rails and feed. */
    reshuffleHome();
    personaProfile(p);
  } else {
    window.featuredAlbum = A[Math.floor(Date.now() / 86400000) % A.length];
    window.trendingAlbums = A.filter(x => x !== window.featuredAlbum);
    window.activeAlbum = window.featuredAlbum;
    setFriendActivity(BASE_FRIEND_ACTIVITY.slice());
    // feedEvents() memoises its deal into window._FEED, which would otherwise
    // keep serving the PREVIOUS persona's activity after the swap.
    window._FEED = null;
    randomizeProfile();
  }

  applyPersonaClass();
  renderPersonaBar();
  renderViewer();
  // Widen the shelf in the background. ~30 albums cycled fast enough that the
  // bento started repeating; expandRecs pulls a few hundred off Deezer radios
  // seeded by this persona's own artists. Deliberately NOT awaited — the home
  // paints from the persona's records immediately and the rest arrive under it.
  if (typeof expandRecs === 'function') expandRecs();
};

// Every screen instance carries the persona class so the skin sheet can bite.
// Re-applied after each render, since renderViewer rebuilds the screens.
function applyPersonaClass() {
  const id = window.ACTIVE_PERSONA;
  document.querySelectorAll('.app-screen').forEach(el => {
    el.classList.forEach(c => { if (c.startsWith('persona-')) el.classList.remove(c); });
    if (id) el.classList.add('persona-' + id);
  });
}

function shuffled(arr) {
  const c = arr.slice();
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
}

/* Re-deal the home page: featured album, the bento's swipe queue, the
   you-may-know rails and (for a persona) the friend feed.
   ⚠️ `trendingAlbums` gets the WHOLE remaining catalogue. It reads like it
   should be five — the name says so and data.js's comment says so — but
   `albumSeq()` is `featured + trendingAlbums`, so slicing it to five silently
   shrinks the bento's swipe queue to six albums. */
function reshuffleHome() {
  const A = window.ARCHIVE;
  if (!A || !A.length) return;
  const order = shuffled(A);
  window.featuredAlbum = order[0];
  window.trendingAlbums = order.slice(1);
  window.activeAlbum = window.featuredAlbum;
  window._FEED = null;            // feedEvents() deals a fresh activity feed
  const p = window.ACTIVE_PERSONA && personaById(window.ACTIVE_PERSONA);
  if (p) setFriendActivity(personaFeed(p));
}

/* The home feed for a persona, generated fresh each deal.
   data.js's FRIEND_ACTIVITY names demo albums by title, so under a persona
   every card would point at a record no longer in ARCHIVE (broken art, dead
   taps). Rather than remap it 1:1 — which produced the same feed every load —
   this deals a new one: people from the demo's cast, albums drawn at random
   from the persona's own shelf, and the QUOTE taken from that album's own
   generated reviews, so the card and the album page agree with each other. */
/* LONG REVIEWS (Eric, 2026-09-23: "let's have some longer reviews"). The
   album pools top out around 250 characters — four lines on the home card —
   so the five-line fade and its View more never fired. These are dealt in
   every fourth card, and PUSHED INTO THAT ALBUM'S OWN LIST so the album page
   shows the same review the card did. Album-agnostic on purpose: the album
   is drawn at random, so nothing here names a record or a track. */
const FB_LONG_REVIEWS = [
  { name: 'drumkid', init: 'DK', grad: 'linear-gradient(135deg,#7c2d12,#ea580c)', rating: 5,
    text: "i put this on for the first time on a train with a dead phone battery and nothing else to do, which turned out to be the only correct way to hear it. it does not want you half listening. the first two tracks are a slow dare, the third is where it turns, and by the middle of the record i had stopped looking out the window. every listen since has found something new: a bass line buried under a verse, a sample i missed, a lyric that lands differently now that i know how the album ends. i have had it on rotation for months and i am still not at the top" },
  { name: 'vxblank', init: 'VB', grad: 'linear-gradient(135deg,#4c0519,#be123c)', rating: 4.5,
    text: "the rare album that gets quieter as it goes and somehow bigger at the same time. the front half is all hooks, big and generous, the kind you can play at a party. then it thins out, the drums drop away, and the back half is basically one long exhale. i docked half a star because there is a track in the middle that i skip every single time, but the last three songs are among the best sequencing i have heard on a record this decade. listen front to back or do not bother" },
  { name: 'nova_wr', init: 'NW', grad: 'linear-gradient(135deg,#064e3b,#059669)', rating: 5,
    text: "i went in expecting a competent album and came out needing to text four people about it. what gets me is the restraint. every song has a moment where a lesser producer would have added a layer, and instead it just sits there and lets the space do the work. the vocals are recorded close enough that you can hear the breath before each line. it is a headphones record, a late record, a walk home record. i keep trying to describe it to people and i keep landing on the same word, which is patient" },
  { name: 'marshmist', init: 'MM', grad: 'linear-gradient(135deg,#500724,#db2777)', rating: 4,
    text: "small quiet verses and then a wall. the whole record is built on that trick and it works every single time, which should be annoying and somehow is not. the lyrics are plain, almost conversational, and then one line in each song is a knife. it is short, under forty minutes, and it knows exactly how long it needs to be, which almost nobody gets right. four stars only because the production is a little thin in places and i wanted the low end to hit harder on the big moments. otherwise, no notes" },
  { name: 'echoplex', init: 'E', grad: 'linear-gradient(135deg,#1c1c3e,#3b1fa8)', rating: 4.5,
    text: "first heard this on a night bus with a broken window and it has never sounded better than that, the rain getting in and the opener looping. every voice on it sounds like somebody you half remember. the crackle is not a gimmick, it is the room. people file it under one genre and it is technically true and completely useless as a description. it is a record about being awake when you should not be, and it is one of the only ones that gets the feeling exactly right" },
];
/* THE CAST (Eric, 2026-09-23: "a larger variety of usernames"). The demo's
   FRIEND_ACTIVITY has eight people; a feed dealt from eight names repeats
   fast. These forty follow the onboarding's own handle rule — 4–18 chars,
   a–z 0–9 _ (checked below) — and get initials and a gradient off the name,
   so each looks like themselves everywhere (feedFace hashes the handle for
   the photo the same way). The demo's eight stay in, deduplicated. */
const FB_CAST_EXTRA = ['tapehiss_', 'lowpass99', 'static_kid', 'b_side_b', 'ninetiesgirl', 'reverb_tank', 'dustyneedle', 'hifi_hana', 'moss_and_wire', 'sub_bass_sam', 'night_bus_', 'latch_key', 'koto_dreams', 'ferris_wheel7', 'paper_crane', 'chrome_heart', 'glassbeach', 'moonpie_44', 'deep_cuts', 'sidechain', 'offbeat_ollie', 'vinylvicky', 'warmtape', 'quietstorm_', 'loop_de_loop', 'halfspeed', 'crate_digger', 'bedroomtapes', 'monotone_m', 'shoegazer_x', 'pulsewidth', 'tremolo_tess', 'saltwater_', 'blue_note_bo', 'riff_raff01', 'cassette_cat', 'echo_park', 'slowdive_sue', 'freq_out', 'wavetable'];
const FB_GRADS = [
  'linear-gradient(135deg,#1c1c3e,#3b1fa8)', 'linear-gradient(135deg,#164e63,#0284c7)', 'linear-gradient(135deg,#3b0764,#9333ea)',
  'linear-gradient(135deg,#064e3b,#059669)', 'linear-gradient(135deg,#7c2d12,#ea580c)', 'linear-gradient(135deg,#134e4a,#0d9488)',
  'linear-gradient(135deg,#4c0519,#be123c)', 'linear-gradient(135deg,#500724,#db2777)', 'linear-gradient(135deg,#3f3f46,#a1a1aa)',
  'linear-gradient(135deg,#713f12,#ca8a04)', 'linear-gradient(135deg,#1e3a8a,#60a5fa)', 'linear-gradient(135deg,#365314,#84cc16)',
];
const FB_HANDLE_RE = /^[a-z0-9_]{4,18}$/;
let _fbCast = null;
function fbCast() {
  if (_fbCast) return _fbCast;
  const out = [], seen = new Set();
  BASE_FRIEND_ACTIVITY.forEach(f => { if (!seen.has(f.user)) { seen.add(f.user); out.push({ user: f.user, init: f.init, grad: f.grad }); } });
  FB_CAST_EXTRA.forEach(u => {
    if (seen.has(u) || !FB_HANDLE_RE.test(u)) return;
    seen.add(u);
    let h = 7; for (const c of u) h = (h * 31 + c.charCodeAt(0)) | 0;
    const parts = u.replace(/[0-9_]+/g, ' ').trim().split(/\s+/);
    const init = (parts.length > 1 ? parts[0][0] + parts[1][0] : u.slice(0, 1)).toUpperCase();
    out.push({ user: u, init, grad: FB_GRADS[Math.abs(h) % FB_GRADS.length] });
  });
  return (_fbCast = out);
}
/* POPULAR REVIEWS (Eric, 2026-09-24): every deal carries a couple of cards
   that are NOT a friend's — a review that went round, by someone you don't
   follow, on a record in a genre you listen to. They read as the community
   leaking in: big like and comment counts, a longer write-up, and a
   "Popular review · <genre>" chip on the card. FB_POPULAR_PER_DEAL of them
   in sixteen cards (Eric: "mostly friends, like *:1"), slotted in at fixed
   spots so they never lead the deck. The names are their own pool — never a
   friend's — and the write-ups are album-agnostic like FB_LONG_REVIEWS. */
const FB_POPULAR_PER_DEAL = 2;
const FB_COMMUNITY = ['hi_fi_hollow', 'lastfm_lifer', 'analog_ana', 'the_needle_drop_', 'liner_notes', 'octave_oscar',
  'tape_deck_tina', 'rym_refugee', 'basement_show', 'crate_club', 'sleeve_notes', 'deep_listen'];
const FB_VIRAL_REVIEWS = [
  { rating: 5, text: "ok i need everyone to stop what they are doing and put this on. not in the background, not while you cook. sit down. the opener is a slow build that most bands would have made the closer, and it is only track one. the middle stretch is where it becomes a different record, three songs that feel like one long thought, and then the last two pull the whole thing back to earth. i have been listening to music seriously for twenty years and i do not say this lightly: this is the one from this year that people will still be arguing about in ten. it is not perfect. it does not need to be. it knows exactly what it is" },
  { rating: 4.5, text: "the thing nobody is saying about this record is how FUNNY it is. everyone is treating it like a monument, and it is, but the lyrics are full of little jokes at its own expense, the kind you only catch on the fourth listen when you have stopped being impressed and started actually paying attention. the production is enormous, all low end and room, and then it drops out for one verse and the voice is just there, cracked and close. the second half sags a little. i do not care. the high points are higher than anything else i have heard this year and the low points are still better than most people's best" },
  { rating: 5, text: "i have written and deleted this review four times because every version sounded like i was selling something. so, plainly: this album made me call my brother, who i had not spoken to in a year. that is not a metaphor. there is a song near the end about exactly that, and it is written so plainly and so without self-pity that it went straight through the part of me that usually manages these things. the rest of the record earns that moment. it is patient and strange and it never once asks you to like it. i am going to be recommending this to people for the rest of my life and most of them are going to think i am overselling it. i am not" },
  { rating: 4.5, text: "a record that sounds like it cost nothing and feels like it cost everything. the whole thing was apparently made in a spare room over a winter and you can hear the room, the radiator, the way the vocal sits too close to the mic on the quiet songs. that closeness is the point. it is a small album about small things and by the end the small things are the only things. two of the songs in the middle blur together for me and i think one of them should have been cut, which is the only reason this is not five. everything else is the best version of itself. the last song is a hymn" },
];
function personaFeed(p) {
  const A = window.ARCHIVE;
  if (!A.length) return [];
  const cast = fbCast();
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const ago = () => {
    const h = 1 + Math.floor(Math.random() * 47);
    return h < 24 ? `${h}h` : `${Math.round(h / 24)}d`;
  };
  // No quote twice on one feed: the pool is 36 lines across ~100 albums, so
  // two cards saying "review pending. still crying." was a regular sight.
  const used = new Set();
  // Sixteen cards a deal (the demo list's size), each a different person where the cast allows.
  const people = shuffled(cast);
  const deck = shuffled(A);
  const cards = deck.slice(0, Math.min(16, A.length)).map((a, i) => {
    let who = people[i % people.length];
    const fresh = (a.reviews || []).filter(r => !used.has(r.text));
    let rev = fresh.length ? pick(fresh) : ((a.reviews && a.reviews.length) ? pick(a.reviews) : null);
    // Every fourth card: a LONG one, from the pool above, written into the album too.
    if (i % 4 === 1) {
      const L = FB_LONG_REVIEWS[Math.floor(i / 4) % FB_LONG_REVIEWS.length];
      if (!(a.reviews || []).some(r => r.text === L.text)) a.reviews = [...(a.reviews || []), L];
      rev = L;
      who = cast.find(c => c.user === L.name) || who;
    }
    if (rev) used.add(rev.text);
    return {
      user: who.user, init: who.init, grad: who.grad,
      album: a.album, artist: a.artist, year: a.year, image: a.image,
      rating: rev ? rev.rating : a.rating,
      quote: rev ? `"${rev.text}"` : '',
      likes: 3 + Math.floor(Math.random() * 60),
      comments: Math.floor(Math.random() * 14),
      ago: ago(),
    };
  });

  /* The popular ones: records NOT in the friends' deal, in a genre this
     persona's shelf is heavy on (the top three genres by count), reviewed
     by someone from the community pool with a viral write-up and the counts
     to match. Written into the album's own list like the long reviews are,
     so the album page shows the same review. Slotted at cards 4 and 11. */
  const byGenre = {};
  A.forEach(x => { const g = String(x.genre || '').trim(); if (g) byGenre[g] = (byGenre[g] || 0) + 1; });
  const top = Object.keys(byGenre).sort((x, y) => byGenre[y] - byGenre[x]).slice(0, 3);
  const dealt = new Set(cards.map(c => c.album));
  const pool = deck.filter(x => !dealt.has(x.album) && (!top.length || top.includes(String(x.genre || '').trim())));
  const rest = deck.filter(x => !dealt.has(x.album) && !pool.includes(x));
  const names = shuffled(FB_COMMUNITY), virals = shuffled(FB_VIRAL_REVIEWS);
  const slots = [4, 11];
  for (let k = 0; k < FB_POPULAR_PER_DEAL; k++) {
    const a = pool[k] || rest[k];
    if (!a) break;
    const V = virals[k % virals.length], user = names[k % names.length];
    let h = 7; for (const c of user) h = (h * 31 + c.charCodeAt(0)) | 0;
    const rev = { name: user, init: user.replace(/[^a-z]/g, '').slice(0, 2).toUpperCase(), grad: FB_GRADS[Math.abs(h) % FB_GRADS.length], rating: V.rating, text: V.text };
    if (!(a.reviews || []).some(r => r.text === V.text)) a.reviews = [...(a.reviews || []), rev];
    cards.splice(Math.min(slots[k] || cards.length, cards.length), 0, {
      user, init: rev.init, grad: rev.grad, popular: true, genre: String(a.genre || '').trim(),
      album: a.album, artist: a.artist, year: a.year, image: a.image,
      rating: V.rating, quote: `"${V.text}"`,
      likes: 400 + Math.floor(Math.random() * 2000),
      comments: 40 + Math.floor(Math.random() * 220),
      ago: ago(),
    });
  }
  return cards;
}

// The persona's profile: authored identity from the CSV, taste from their
// catalogue — so the favourites shown are always albums they actually have.
function personaProfile(p) {
  const A = window.ARCHIVE, P = window.PROFILE;
  Object.assign(P, p.profile);
  P.pic = p.profile.pic || PROFILE_PHOTOS[
    Math.abs([...p.id].reduce((h, c) => h * 31 + c.charCodeAt(0), 7)) % PROFILE_PHOTOS.length];
  P.favs = A.slice(0, 5).map(a => a.album);
  P.favArtists = [...new Set(A.map(a => a.artist))].slice(0, 4);
  P.favSongs = A.slice(0, 5).map(a => ({
    // favTrack is the CSV's `track` column when filled in; otherwise a
    // deterministic stand-in from the same generator the tracklist uses.
    title: a.favTrack || ((typeof songsFor === 'function') ? ((songsFor(a)[0] || {}).title || '') : '') || a.album,
    artist: a.artist, album: a.album,
  }));
  P.socials = { instagram: p.profile.handle, x: p.profile.handle, soundcloud: p.profile.handle };
  P.playlistNames = (typeof plLists === 'function') ? plLists().slice(0, 3).map(x => x.name) : [];
  P.playlistCovers = A.slice(5, 8).map(a => a.image);
  P.recent = A.slice(5, 9).map(a => a.album);
}

/* The switcher. Two presentations of one list:
   - desktop toolbar: a segmented control, all options visible at once;
   - mobile bar: a <select>, because five names will not fit beside the
     Single/Multi/Flow/Live segment on a phone. */
function renderPersonaBar() {
  const list = window.PERSONAS || [];
  if (!list.length) return;
  // No "Demo" entry: `eric` IS the demo now — a real person's catalogue reads
  // better than the random one, and the slot was the widest button in a row
  // that had already outgrown its section. `applyPersona('')` still works and
  // still restores data.js's catalogue; it just has no button.
  const opts = list.map(p => ({ id: p.id, name: p.profile.name }));
  const active = window.ACTIVE_PERSONA || '';

  const bar = document.getElementById('persona-bar');
  if (bar) {
    bar.innerHTML = opts.map(o =>
      `<button class="tb-pers${active === o.id ? ' active' : ''}"` +
      ` onclick="applyPersona('${o.id}')" title="${o.id}">${o.name}</button>`).join('');
  }

  const mb = document.getElementById('persona-bar-mb');
  if (mb) {
    mb.innerHTML = `<select class="tb-pers-sel" aria-label="Persona"
        onchange="applyPersona(this.value)">${opts.map(o =>
      `<option value="${o.id}"${active === o.id ? ' selected' : ''}>${o.name}</option>`).join('')}</select>`;
  }
}

/* ══════════════════════════════════════════════════════════════════════════
   DEV BOX — tune the compact bento's two info lines, then copy the CSS
   ══════════════════════════════════════════════════════════════════════════
   Sliders write a <style> block; the SAME string is what "Copy CSS" hands over,
   so what you see is exactly what you paste. Rules are scoped
   `.s-home-v3:not(.s-home-v3--review)` — (0,2,0), which beats the base
   `.v3-blue-info-row` declarations without touching the review/album state.
   Defaults below are the CURRENT values in app.css, so an untouched panel emits
   the layout as it already stands.
   ⚠️ This panel writes a <style> that is injected AT LOAD, not when the panel
   opens — and it is appended to <head>, so at equal specificity it beats
   app.css. Anything it emits therefore silently overrides the stylesheet for
   the same selector. If a change to app.css appears to do nothing in the bento
   info box, look here first; that is exactly how the two-column rebuild spent a
   round being "ignored".

   ⚠️ The box is now TWO COLUMNS (album·year over artist on one side, the score
   with the vinyls under it on the other), so "Line 1" and "Line 2" are really
   the left and right columns. **Size is a font-size in px, no longer a
   `scale()`** — a transform on a grid item is paint-only, so the track is sized
   from the untransformed box and the scaled result spills out of `.v3-blue`,
   which clips. Line 1's size rides on `.v3-blue-info-row` and the album/artist
   inherit it as `1em`; line 2's rides on `.v3-blue-score`. */

/* ── The panel's tabs ──────────────────────────────────────────────────────
   One entry per thing you can tune. Each owns its FIELDS and the CSS block it
   emits, so adding a tab is adding a row here — nothing else in the panel knows
   how many there are.
   ⚠️ Field keys are flat in DEVBOX and therefore share ONE namespace across
   tabs. Prefix new ones (the album-score tab uses `s*`) or a collision will
   silently drive two sliders from one value.
   ⚠️ Every `def` must equal what app.css already declares. The live <style> is
   injected at LOAD and wins ties, so a default that disagrees with the
   stylesheet doesn't just mislead the panel — it overrides the real value on
   every page view. */
const DEVBOX_TABS = [
  {
    id: 'bento', label: 'Bento info',
    fields: [
      { grp: 'Block' },
      { k: 'gap',  label: 'Col gap', min: 0, max: 40, step: 0.5, def: 10 },
      { k: 'padT', label: 'Pad T', min: 0,   max: 24, step: 0.5, def: 9 },
      { k: 'padL', label: 'Pad L', min: 0,   max: 32, step: 0.5, def: 12 },
      { grp: 'Line 1 — album · year / artist' },
      { k: 'l1x', label: 'X',       min: -20, max: 20, step: 0.5, def: 0 },
      { k: 'l1y', label: 'Y',       min: -20, max: 20, step: 0.5, def: 4.5 },
      { k: 'l1s', label: 'Size',    min: 7,   max: 20, step: 0.1, def: 14 },
      { k: 'l1g', label: 'Row gap', min: 0,   max: 12, step: 0.5, def: 5.5 },
      { grp: 'Line 2 — rating' },
      { k: 'l2x', label: 'X',       min: -20, max: 20, step: 0.5, def: 0 },
      { k: 'l2y', label: 'Y',       min: -20, max: 20, step: 0.5, def: 2 },
      { k: 'l2s', label: 'Size',    min: 12,  max: 44, step: 0.5, def: 22.5 },
      { k: 'l2g', label: 'Row gap', min: 0,   max: 12, step: 0.5, def: 1 },
      { k: 'l2cg', label: 'Revs gap', min: 0, max: 20, step: 0.5, def: 5 },
    ],
    css: d => `.s-home-v3:not(.s-home-v3--review) .v3-blue {
  column-gap: ${d.gap}px;
  padding: ${d.padT}px ${d.padL}px 8px;
}
.s-home-v3:not(.s-home-v3--review) .v3-blue-info-row {
  left: ${d.l1x}px;
  top: ${d.l1y}px;
  font-size: ${d.l1s}px;
  row-gap: ${d.l1g}px;
}
.s-home-v3:not(.s-home-v3--review) .v3-blue-stars-row {
  left: ${d.l2x}px;
  top: ${d.l2y}px;
  row-gap: ${d.l2g}px;
  column-gap: ${d.l2cg}px;
}
.s-home-v3:not(.s-home-v3--review) .v3-blue-score {
  font-size: ${d.l2s}px;
}`,
  },
  {
    id: 'score', label: 'Album score',
    fields: [
      { grp: 'Block' },
      { k: 'sx',    label: 'X',      min: -40, max: 40, step: 0.5, def: 15.5 },
      { k: 'sy',    label: 'Y',      min: -40, max: 40, step: 0.5, def: 5.5 },
      { k: 'spadT', label: 'Pad T',  min: 0,   max: 48, step: 0.5, def: 23 },
      { k: 'spadB', label: 'Pad B',  min: 0,   max: 48, step: 0.5, def: 2 },
      { grp: 'Number' },
      { k: 'ssz',   label: 'Size',   min: 16,  max: 84, step: 0.5, def: 51 },
      { grp: 'Vinyls' },
      { k: 'sgap',  label: 'Gap',    min: 0,   max: 40, step: 0.5, def: 9 },
      { k: 'svz',   label: 'Size',   min: 4,   max: 28, step: 0.5, def: 18 },
      { k: 'svy',   label: 'Y',      min: -20, max: 20, step: 0.5, def: -2 },
    ],
    css: d => `.s-home-v3--review .v3-rev-score {
  left: ${d.sx}px;
  top: ${d.sy}px;
  gap: ${d.sgap}px;
  padding: ${d.spadT}px 0 ${d.spadB}px;
}
.s-home-v3--review .v3-rev-score-n { font-size: ${d.ssz}px; }
.s-home-v3--review .v3-rev-score-sub { top: ${d.svy}px; }
.s-home-v3--review .v3-rev-score-sub .hstar { width: ${d.svz}px; height: ${d.svz}px; }`,
  },
];

const DEVBOX = {};
/* THE DECK TAB (Eric, 2026-09-23). Not CSS: it drives FB_TUNE (the home
   deck's geometry) live and prints the table back as JS to paste over the
   `const FB_TUNE` block in app.js. `js: true` keeps it out of the injected
   <style>; `apply` is what makes it live. Keys are `fb*` — one flat DEVBOX. */
DEVBOX_TABS.push({
  id: 'deck', label: 'Deck', js: true,
  fields: [
    { grp: 'Camera' },
    { k: 'fbP',  label: 'Perspective', min: 80, max: 1600, step: 10, def: 600 },
    { grp: '1st card back' },
    { k: 'fbA1', label: 'Turn °', min: -180, max: 180, step: 1, def: 75 },
    { k: 'fbO1', label: 'Edge X', min: 100, max: 260, step: 1, def: 158 },
    { k: 'fbZ1', label: 'Depth', min: -300, max: 800, step: 5, def: 160 },
    { k: 'fbY1', label: 'Y nudge', min: -60, max: 60, step: 1, def: 0 },
    { grp: '2nd card back' },
    { k: 'fbA2', label: 'Turn °', min: -180, max: 180, step: 1, def: 94 },
    { k: 'fbO2', label: 'Edge X', min: 100, max: 300, step: 1, def: 184 },
    { k: 'fbZ2', label: 'Depth', min: -300, max: 800, step: 5, def: 160 },
    { k: 'fbY2', label: 'Y nudge', min: -60, max: 60, step: 1, def: 0 },
    { k: 'fbF2', label: 'Opacity', min: 0, max: 1, step: 0.05, def: 0.85 },
    { grp: '3rd card back' },
    { k: 'fbA3', label: 'Turn °', min: -180, max: 180, step: 1, def: 101 },
    { k: 'fbO3', label: 'Edge X', min: 100, max: 340, step: 1, def: 206 },
    { k: 'fbZ3', label: 'Depth', min: -300, max: 800, step: 5, def: 160 },
    { k: 'fbY3', label: 'Y nudge', min: -60, max: 60, step: 1, def: 0 },
    { k: 'fbF3', label: 'Opacity', min: 0, max: 1, step: 0.05, def: 0.55 },
  ],
  apply: d => {
    FB_TUNE.p = d.fbP;
    FB_TUNE.a = [0, d.fbA1, d.fbA2, d.fbA3];
    FB_TUNE.o = [0, d.fbO1, d.fbO2, d.fbO3];
    FB_TUNE.z = [0, d.fbZ1, d.fbZ2, d.fbZ3];
    FB_TUNE.y = [0, d.fbY1, d.fbY2, d.fbY3];
    FB_TUNE.fade = [1, 1, d.fbF2, d.fbF3];
    document.querySelectorAll('.s-home-v3').forEach(scr => {
      const flow = scr.querySelector('.v3-fb-flow');
      if (!flow) return;
      flow.style.perspective = d.fbP + 'px';
      if (typeof fbPaintDeck === 'function') fbPaintDeck(scr, scr._fbCur || 0);
    });
  },
  css: d => `const FB_TUNE = {
  p: ${d.fbP},
  a: [0, ${d.fbA1}, ${d.fbA2}, ${d.fbA3}],         // rotateY toward the centre, deg
  o: [0, ${d.fbO1}, ${d.fbO2}, ${d.fbO3}],      // near (outer) edge from the centre, px
  z: [0, ${d.fbZ1}, ${d.fbZ2}, ${d.fbZ3}],      // push-back, px
  y: [0, ${d.fbY1}, ${d.fbY2}, ${d.fbY3}],            // extra Y nudge, px (the floor drop is solved on top)
  fade: [1, 1, ${d.fbF2}, ${d.fbF3}],   // opacity
};
/* and in app.css: .v3-fb-flow { perspective: ${d.fbP}px; } */`,
});
DEVBOX_TABS.forEach(t => t.fields.forEach(f => { if (f.k) DEVBOX[f.k] = f.def; }));
let DEVBOX_TAB = DEVBOX_TABS[0].id;

const devBoxTab = () => DEVBOX_TABS.find(t => t.id === DEVBOX_TAB) || DEVBOX_TABS[0];

/* Rounded once, here, so the live style and the copied text can never disagree
   about a value the way they would if each formatted its own numbers. */
function devBoxVals() {
  const n = v => (Math.round(v * 100) / 100);
  const d = {};
  Object.keys(DEVBOX).forEach(k => { d[k] = n(DEVBOX[k]); });
  return d;
}

/* What gets INJECTED: every tab, because all of them have to be in force at
   once — you can't tune the album score with the bento's block switched off. */
function devBoxCss() {
  const d = devBoxVals();
  return DEVBOX_TABS.filter(t => !t.js).map(t =>
    `/* ${t.label} — tuned in the dev box */\n${t.css(d)}`).join('\n\n');
}

/* What gets COPIED and shown in the textarea: the ACTIVE tab only, since that
   is the block you are pasting into app.css. */
function devBoxTabCss() {
  const t = devBoxTab();
  return `/* ${t.label} — tuned in the dev box */\n${t.css(devBoxVals())}`;
}

function devBoxApply() {
  let el = document.getElementById('devbox-live');
  if (!el) {
    el = document.createElement('style');
    el.id = 'devbox-live';
    document.head.appendChild(el);   // last in head → wins ties with app.css
  }
  // Injected: every tab. Shown/copied: the active one — that's the block you
  // paste into app.css, and it keeps "what you see is what you paste" per tab.
  el.textContent = devBoxCss();
  // A tab that drives JS rather than CSS (the deck) applies itself here.
  DEVBOX_TABS.forEach(t => { if (t.apply) t.apply(devBoxVals()); });
  const out = document.getElementById('db-out');
  if (out) out.value = devBoxTabCss();
  document.querySelectorAll('#db-body input[type=range]').forEach(inp => {
    const lbl = inp.parentElement.querySelector('.db-val');
    if (lbl) lbl.textContent = DEVBOX[inp.dataset.k];
  });
}

function devBoxRenderTabs() {
  const strip = document.getElementById('db-tabs');
  if (!strip) return;
  strip.innerHTML = DEVBOX_TABS.map(t =>
    `<button class="db-tab${t.id === DEVBOX_TAB ? ' on' : ''}" data-t="${t.id}">${t.label}</button>`
  ).join('');
}

function devBoxRenderFields() {
  const body = document.getElementById('db-body');
  if (!body) return;
  body.innerHTML = devBoxTab().fields.map(f => f.grp
    ? `<div class="db-grp">${f.grp}</div>`
    : `<label class="db-row"><span>${f.label}</span>
         <input type="range" data-k="${f.k}" min="${f.min}" max="${f.max}" step="${f.step}" value="${DEVBOX[f.k]}">
         <span class="db-val">${DEVBOX[f.k]}</span></label>`).join('');
}

window.devBoxPickTab = function (id) {
  if (!DEVBOX_TABS.some(t => t.id === id)) return;
  DEVBOX_TAB = id;
  devBoxRenderTabs();
  devBoxRenderFields();   // values come from DEVBOX, so a switch never loses a tune
  devBoxApply();
};

function initDevBox() {
  const body = document.getElementById('db-body');
  if (!body) return;
  devBoxRenderTabs();
  devBoxRenderFields();
  const strip = document.getElementById('db-tabs');
  if (strip) strip.addEventListener('click', e => {
    const b = e.target.closest('.db-tab');
    if (b) devBoxPickTab(b.dataset.t);
  });
  // Delegated: devBoxRenderFields() rebuilds the rows on every tab switch, so
  // per-input listeners would leak one set per switch.
  body.addEventListener('input', e => {
    const inp = e.target.closest('input[type=range]');
    if (!inp) return;
    DEVBOX[inp.dataset.k] = parseFloat(inp.value);
    devBoxApply();
  });
  devBoxApply();
}

window.toggleDevBox = function () {
  const el = document.getElementById('devbox');
  if (el) el.hidden = !el.hidden;
};

/* Resets the ACTIVE tab only — the button sits under that tab's sliders, and
   wiping a tune you can't currently see would be a nasty surprise. */
window.devBoxReset = function () {
  devBoxTab().fields.forEach(f => { if (f.k) DEVBOX[f.k] = f.def; });
  devBoxRenderFields();
  devBoxApply();
};

window.devBoxCopy = function (btn) {
  const css = devBoxTabCss();
  const done = () => {
    const was = btn.textContent;
    btn.textContent = 'Copied ✓';
    setTimeout(() => { btn.textContent = was; }, 1200);
  };
  // The textarea is the fallback path when the clipboard API is unavailable
  // (it is, on file:// in some browsers) — select it so Ctrl+C still works.
  const out = document.getElementById('db-out');
  if (navigator.clipboard) navigator.clipboard.writeText(css).then(done, () => { if (out) out.select(); });
  else if (out) { out.select(); document.execCommand('copy'); done(); }
};

// Boot: restore the last-used persona, else open as `eric` — with the Demo
// button gone there is no way back to the unpersona'd data.js catalogue from
// the UI, so booting into it would leave every button unlit.
function initPersonas() {
  if (!(window.PERSONAS || []).length) return;
  applyPersonaSkins();
  let saved = '';
  try { saved = localStorage.getItem('spindeck-persona') || ''; } catch (e) {}
  const start = (saved && personaById(saved)) ? saved
              : (personaById('eric') ? 'eric' : window.PERSONAS[0].id);
  applyPersona(start);
}

/* ── The category-aware content editor ────────────────────────
   ONE bottom sheet behind every media slot on the profile. What it searches is
   decided by the KIND it's opened with, so filling an album disc, a playlist
   row, a favourite song or the photo all use the same popup:

     album | song | playlist | photo   → a searchable grid

   ⚠ It used to carry two more kinds, `name` and `text`, which drew a little
   form for the display name, handle, bio, location and occupation. Those are
   gone: Edit Profile is a form now (`profileEditHtml` in screens.js) and types
   those fields inline, so a popup for them would be a second way to do the same
   thing — and the worse one, since it hid the field you were filling behind a
   sheet. Every kind left here is a CHOICE from a list, which is what the sheet
   is actually good at.

   Everything writes through profFavTarget(), which is the Edit Profile DRAFT
   when that page is open and PROFILE otherwise — so an unsaved change on the
   edit page can still be thrown away by Cancel.
   ───────────────────────────────────────────────────────────── */
const PFE_KIND = {
  album:    { title: 'Choose an album',   ph: 'Search albums' },
  song:     { title: 'Choose a song',     ph: 'Search songs, albums, artists' },
  playlist: { title: 'Choose a playlist', ph: 'Search your playlists' },
  photo:    { title: 'Choose a photo',    ph: '' },
  tag:      { title: 'Your tags',        ph: '' },
  review:   { title: 'Pin a review',      ph: 'Search your reviews' },
};
let _profSlot = 0;
let _profKind = 'album';

window.openProfEditor = function (kind, slot) {
  _profKind = kind || 'album';
  _profSlot = (slot == null) ? 0 : (isNaN(slot) ? slot : Number(slot));
  const host = document.querySelector('.app-screen.s-pfedit')
            || document.querySelector('.app-screen.s-prof2')
            || document.querySelector('.app-screen') || document.body;
  const ov = ensureProfPicker();
  host.appendChild(ov);   // inherits the panel/home palette vars from .s-prof2
  profPickerBuild();
  requestAnimationFrame(() => {
    ov.classList.add('open');
    const f = ov.querySelector('.pp-input');
    setTimeout(() => f && f.focus(), 80);
  });
};
// Back-compat: the profile card's album discs still call openProfPicker(slot).
window.openProfPicker = function (slot) { openProfEditor('album', slot); };

function ensureProfPicker() {
  let ov = document.getElementById('prof-picker');
  if (ov) return ov;
  ov = document.createElement('div');
  ov.id = 'prof-picker';
  ov.className = 'prof-picker';
  ov.addEventListener('click', e => { if (e.target === ov) closeProfPicker(); });
  return ov;
}

// Build the sheet for the current kind — a searchbar over a grid, except for
// `photo`, whose grid is the built-in set plus a real upload tile — then fill it.
function profPickerBuild() {
  const ov = document.getElementById('prof-picker'); if (!ov) return;
  const k = PFE_KIND[_profKind] || PFE_KIND.album;
  /* Neither of these searches. The photo grid is a dozen pictures you look at,
     and the tag list is short and read as a whole — a searchbar over either is
     a control with nothing to do. */
  const noSearch = _profKind === 'photo' || _profKind === 'tag';
  const body = `
      ${_profKind === 'photo' ? `
      <label class="pp-upload">
        <input type="file" accept="image/*" onchange="profPhotoUpload(this)">
        Upload your own
      </label>` : noSearch ? '' : `
      <div class="pp-searchbar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/></svg>
        <input class="pp-input" type="text" placeholder="${k.ph}" autocomplete="off" spellcheck="false" oninput="profPickerRender(this.value)">
      </div>`}
      <div class="pp-grid"></div>`;
  ov.innerHTML = `
    <div class="pp-sheet">
      <div class="pp-handle-bar"></div>
      <div class="pp-top">
        <div class="pp-title">${k.title}</div>
        <button class="pp-close" onclick="closeProfPicker()" aria-label="Close">×</button>
      </div>
      ${body}
    </div>`;
  profPickerRender('');
}

// The searchable kinds, normalised to one row shape.
function profPickerItems(q) {
  q = String(q || '').toLowerCase();
  const T = profFavTarget();
  if (_profKind === 'album') {
    const cur = (T.favs || [])[_profSlot];
    return (window.ARCHIVE || [])
      .filter(a => !q || a.album.toLowerCase().includes(q) || a.artist.toLowerCase().includes(q))
      .slice(0, 60)
      .map(a => ({ img: a.image, t: a.album, s: a.artist, on: a.album === cur, pick: `profPick('${obOc(a.album)}')` }));
  }
  if (_profKind === 'song') {
    const cur = (T.favSongs || [])[_profSlot];
    return plnewPool()
      .filter(x => !q || x.title.toLowerCase().includes(q) || x.album.toLowerCase().includes(q) || x.artist.toLowerCase().includes(q))
      .slice(0, 60)
      .map(x => ({ img: x.image, t: x.title, s: x.album + ' · ' + x.artist,
                   on: !!cur && cur.title === x.title && cur.album === x.album,
                   pick: `profPickSong('${obOc(x.key)}')` }));
  }
  if (_profKind === 'review') {
    // Your own review log, one per album — the pin is the album's name.
    const cur = (window.profPins ? profPins(T) : [])[_profSlot];
    return profReviewLog(T)
      .filter(e => !q || e.album.album.toLowerCase().includes(q) || e.album.artist.toLowerCase().includes(q) || String(e.text).toLowerCase().includes(q))
      .map(e => ({ img: e.album.image, t: e.album.album, s: Number(e.rating).toFixed(1) + ' · ' + e.text,
                   on: e.album.album === cur, pick: `profPickReview('${obOc(e.album.album)}')` }));
  }
  if (_profKind === 'playlist') {
    const cur = (T.playlistNames || [])[_profSlot];
    return plLists()
      .filter(p => !q || p.name.toLowerCase().includes(q) || String(p.creator).toLowerCase().includes(q))
      .map(p => ({ img: p.image, t: p.name, s: p.tracks + ' songs', on: p.name === cur,
                   pick: `profPickPlaylist('${obOc(p.name)}')` }));
  }
  // photo
  return PROFILE_PHOTOS.map(src => ({ img: src, t: '', s: '', on: src === T.pic, pick: `profPickPhoto('${src}')` }));
}

/* The tag sheet.
   ⚠ MULTI-SELECT, and it does NOT close on a pick: you are assembling a set of
   three, not answering one question. That is also why it repaints itself and
   the row behind it by hand rather than going through `profAfterPick` — that
   calls renderViewer(), which would tear the open sheet out of the DOM.
   ⚠ A LOCKED tag is not disabled, it is a link to the shop. A tag you can't
   wear yet is the whole advertisement for the ones that are for sale; greying
   it out would say "not for you" where the truth is "not yet". */
function profTagGrid(grid) {
  const T = profFavTarget();
  const worn = T.tags || [];
  const rows = (window.SD_TAGS || []).map(t => {
    const on = worn.indexOf(t.id) >= 0;
    // csharpuser: no shop, so a tag you don't own simply isn't offered.
    if (!sdOwnsTag(t.id)) return '';
    // Full and not one of yours → dimmed, and it says so by not lighting up.
    const full = !on && worn.length >= SD_TAG_MAX;
    return `<button class="pp-tag${on ? ' pp-tag--on' : ''}${full ? ' pp-tag--full' : ''}${sdTagTex(t)}"
            style="--tint:${t.tint}" onclick="profPickTag('${t.id}')">
      <span class="pp-tag-l">${obEsc(t.label)}</span>
    </button>`;
  }).join('');
  grid.className = 'pp-grid pp-grid--tag';
  grid.innerHTML = `<div class="pp-tag-hint">Wear up to ${SD_TAG_MAX}.</div>${rows}`;
}

window.profPickTag = function (id) {
  const T = profFavTarget();
  if (!T.tags) T.tags = [];
  const i = T.tags.indexOf(id);
  if (i >= 0) T.tags.splice(i, 1);
  else if (T.tags.length < SD_TAG_MAX) T.tags.push(id);
  else return;                    // full: the row is already dimmed, say nothing
  const ov = document.getElementById('prof-picker');
  const grid = ov && ov.querySelector('.pp-grid');
  if (grid) profTagGrid(grid);
  profTagSync();
};

/* Repaint the form's Tags row under the open sheet. ⚠ By hand, not
   renderViewer() — see above. Same move `pfeditField` makes for the bio
   counter, and for the same reason. */
function profTagSync() {
  if (!window.pfeTagChips) return;
  const T = profFavTarget();
  document.querySelectorAll('.s-pfedit .pfe-tags').forEach(el => { el.innerHTML = pfeTagChips(T); });
}

function profPickerRender(q) {
  const ov = document.getElementById('prof-picker'); if (!ov) return;
  const grid = ov.querySelector('.pp-grid'); if (!grid) return;
  if (_profKind === 'tag') { profTagGrid(grid); return; }
  const items = profPickerItems(q);
  grid.className = 'pp-grid' + (_profKind === 'photo' ? ' pp-grid--photo' : '');
  grid.innerHTML = items.map(it => `
    <button class="pp-item${it.on ? ' pp-item--on' : ''}" onclick="${it.pick}">
      <span class="pp-img" style="background-image:url('${it.img}')"></span>
      ${it.t ? `<span class="pp-t">${obEsc(it.t)}</span>` : ''}
      ${it.s ? `<span class="pp-s">${obEsc(it.s)}</span>` : ''}
    </button>`).join('') || `<div class="pp-empty">Nothing matches “${obEsc(q)}”.</div>`;
}

// On the Edit Profile page everything edits the DRAFT, so an unsaved change can
// still be thrown away by Cancel; elsewhere it edits PROFILE directly.
function profFavTarget() { return window.PFEDIT || window.PROFILE; }
function profAfterPick() { closeProfPicker(); renderViewer(); }

window.profPick = function (name) {
  const T = profFavTarget();
  if (!T.favs) T.favs = [];
  T.favs[_profSlot] = name;
  profAfterPick();
};
/* Pin = set this slot to the album; picking the one already there clears it,
   and a review pinned in another slot moves rather than duplicates. */
window.profPickReview = function (name) {
  const T = profFavTarget();
  const pins = (window.profPins ? profPins(T) : []).slice();
  while (pins.length < 3) pins.push('');
  if (pins[_profSlot] === name) pins[_profSlot] = '';
  else {
    const j = pins.indexOf(name);
    if (j >= 0) pins[j] = '';
    pins[_profSlot] = name;
  }
  T.pins = pins;
  profAfterPick();
};
window.profPickSong = function (key) {
  const t = plnewPool().find(x => x.key === key); if (!t) return;
  const T = profFavTarget();
  if (!T.favSongs) T.favSongs = [];
  T.favSongs[_profSlot] = { title: t.title, album: t.album, artist: t.artist };
  profAfterPick();
};
window.profPickPlaylist = function (name) {
  const T = profFavTarget();
  if (!T.playlistNames || !T.playlistNames.length) {
    // Seed from what the profile is currently showing, so replacing one slot
    // doesn't silently drop the other two.
    T.playlistNames = plLists().filter(p => p.creator === 'you')
      .sort((a, b) => b.favs - a.favs).slice(0, 3).map(p => p.name);
  }
  T.playlistNames[_profSlot] = name;
  profAfterPick();
};
window.profPickPhoto = function (src) {
  profFavTarget().pic = src;
  profAfterPick();
};
window.profPhotoUpload = function (input) {
  const f = input && input.files && input.files[0]; if (!f) return;
  const T = profFavTarget();
  const fr = new FileReader();
  fr.onload = () => { T.pic = fr.result; profAfterPick(); };
  fr.readAsDataURL(f);
};
/* ============================================================
   EDIT PROFILE — the customising page behind the card's pencil
   ------------------------------------------------------------
   PFEDIT is a DRAFT copied from PROFILE when the page opens, so Cancel can
   genuinely throw the changes away and Save is the only thing that commits.

   The page IS a form now (`profileEditHtml` in screens.js): the text fields are
   typed into directly and the media slots — photo, albums, playlists, songs —
   still go through the content editor popup (openProfEditor).

   ⚠ Those two halves have to disagree about re-rendering. A pick from the popup
   re-renders the whole screen; a keystroke MUST NOT, or the caret is dropped
   mid-word. So `pfeditField` writes to the draft and returns, and the re-render
   a pick does is harmless because it rebuilds the inputs FROM the draft, which
   already holds everything typed so far.
   ============================================================ */
window.PFEDIT = null;

// Seed the draft on demand, so the screen also works when it's opened straight
// from the viewer's left rail rather than through the pencil.
window.pfeditDraft = function () {
  if (!window.PFEDIT) {
    const P = window.PROFILE || {};
    window.PFEDIT = { ...P, socials: { ...(P.socials || {}) }, favs: (P.favs || []).slice(),
      /* ⚠ Seeded THROUGH profTags, not copied. A profile with no `tags` still
         shows two (seeded off the handle), so a form that opened blank would
         look like the edit page had lost them. */
      tags: (window.profTags ? profTags(P) : []).map(t => t.id),
      // Seeded through profPins like tags: a persona with none authored still
      // shows two, so the form must open on what the profile shows.
      pins: (window.profPins ? profPins(P) : (P.pins || [])).slice(),
      skin: P.skin ? { ...P.skin } : null };
  }
  return window.PFEDIT;
};

/* A keystroke in the form. Writes the draft and stops there — see the ⚠ above.
   ⚠ The viewer draws the Dark and Light shells SIDE BY SIDE, so the same field
   exists twice in the DOM. Without mirroring, the copy you aren't typing in sits
   on a stale value until something else re-renders, and switching variant then
   looks like the edit was lost. `data-k` is what pairs them up. */
window.pfeditField = function (key, el) {
  if (!el) return;
  // A handle is a handle: no spaces, no '@', nothing the profile can't print.
  if (key === 'handle') {
    const clean = el.value.replace(/[^A-Za-z0-9._]/g, '');
    if (clean !== el.value) el.value = clean;
  }
  pfeditDraft()[key] = el.value;
  document.querySelectorAll('.s-pfedit [data-k="' + key + '"]').forEach(o => {
    if (o !== el && o.value !== el.value) o.value = el.value;
  });
  if (key === 'bio') {
    document.querySelectorAll('.s-pfedit .pfe-count')
      .forEach(c => { c.textContent = el.value.length + '/240'; });
  }
};

window.openProfileEdit = function () {
  window.PFEDIT = null;
  pfeditDraft();
  backStack.push(captureLocation());
  navigate('profile-edit');
};

window.pfeditCancel = function () {
  window.PFEDIT = null;          // draft dies here — PROFILE was never touched
  goBack('profile');
};

window.pfeditSave = function () {
  const D = pfeditDraft();
  // Commit only the fields this page owns; the stats and generated persona bits
  // on PROFILE are left alone.
  Object.assign(window.PROFILE, {
    name: (D.name || '').trim() || window.PROFILE.name,
    handle: (D.handle || '').trim().replace(/^@/, '') || window.PROFILE.handle,
    bio: D.bio,
    location: (D.location || '').trim(),
    /* ⚠ `occupation` is NOT here any more — the form dropped that row for tags.
       Leaving it in the whitelist would only copy PROFILE's own value back over
       itself. The personas still carry the field; nothing shows it. */
    tags: (D.tags || []).slice(),
    /* ⚠ Copied, not referenced: `skin` is an object, and assigning the draft's
       own would leave PROFILE holding the thing Cancel is supposed to throw
       away. `null` when the owner cleared it, which is what puts the theme's
       colours back. */
    skin: D.skin ? { ...D.skin } : null,
    pic: D.pic,
    favs: (D.favs || []).slice(),
    socials: { ...(D.socials || {}) },
    // The slots below the card. These MUST be listed here — the page edits them
    // on the draft, so anything missing from this whitelist is silently dropped
    // on save even though the edit page showed it working.
    favSongs: (D.favSongs || []).slice(),
    pins: (D.pins || []).slice(),
    playlistNames: (D.playlistNames || []).slice(),
    playlistCovers: (D.playlistCovers || []).slice(),
  });
  window.PFEDIT = null;
  if (window.__sdToast) window.__sdToast('Profile updated');
  // NOT goBack(): the snapshot it pops holds a copy of PROFILE from before the
  // edit and goBack Object.assign()s it back, which would silently revert the
  // save. Drop that snapshot and go forward-as-back instead — the 'back'
  // direction is what stops navigate() from re-rolling the random persona.
  backStack.pop();
  navigate('profile', 'back');
};

window.closeProfPicker = function () {
  const ov = document.getElementById('prof-picker'); if (!ov) return;
  ov.classList.remove('open');
  setTimeout(() => { if (ov.parentElement) ov.parentElement.removeChild(ov); }, 220);
};

// ── Social links ──────────────────────────────────────────────
window.toggleProfSocial = function (btn) {
  const menu = btn.parentElement.querySelector('.prof-soc-menu');
  if (!menu) return;
  const willOpen = menu.hidden;
  document.querySelectorAll('.prof-soc-menu').forEach(m => m.hidden = true);
  menu.hidden = !willOpen;
  if (willOpen) {
    const close = e => {
      if (!menu.contains(e.target) && !btn.contains(e.target)) {
        menu.hidden = true;
        document.removeEventListener('click', close, true);
      }
    };
    setTimeout(() => document.addEventListener('click', close, true), 0);
  }
};
window.openSocial = function (id) {
  document.querySelectorAll('.prof-soc-menu').forEach(m => m.hidden = true);
  const handle = (window.PROFILE.socials || {})[id] || '';
  const base = { instagram: 'https://instagram.com/', x: 'https://x.com/', soundcloud: 'https://soundcloud.com/' }[id];
  if (base) window.open(base + handle, '_blank', 'noopener');
};

// ── Profile base colour (hand slider, prototype) ──────────────
// Recolours the embossed base + inner face live from a single hue. Dark and
// light instances get theme-appropriate saturation/lightness. Persisted on
// PROFILE.hue so it survives re-renders (applied inline in profileHtml).
// One hue drives a full token set so the card looks the SAME in dark and light
// (a colourful embossed panel, not a theme-tinted one). Ink is kept light so it
// reads on the mid-dark base regardless of the page theme.
window.profBaseColors = function (hue) {
  return {
    '--pf-base':    `hsl(${hue}, 22%, 30%)`,
    '--pf-face':    `hsl(${hue}, 24%, 25%)`,
    '--pf-ink':     `hsl(${hue}, 32%, 93%)`,
    '--pf-ink2':    `hsla(${hue}, 24%, 90%, 0.62)`,
    '--pf-lt':      'rgba(255,255,255,0.07)',
    '--pf-dk':      'rgba(0,0,0,0.5)',
    '--pf-well-dk': 'rgba(0,0,0,0.6)',
    '--pf-well-lt': 'rgba(255,255,255,0.12)',
  };
};

// ── Favourite CD → preview / platforms popup (like the homepage) ──
/* ── The favourites rail ─────────────────────────────────────────────────
   A tap on a CD that ISN'T the centred one brings it to the middle instead of
   acting on it. That is what a carousel means, and it is the only sane reading
   of a tap on a disc that is half off the screen — the alternative is opening a
   menu for an album you can barely see. */
window.profFavTap = function (btn, e, slot, picker) {
  if (e) e.stopPropagation();
  const rail = btn.closest('.prof-fav-rail');
  if (rail && !btn.classList.contains('is-mid')) {
    rail.scrollTo({ left: btn.offsetLeft - (rail.clientWidth - btn.offsetWidth) / 2,
                    behavior: 'smooth' });
    return;
  }
  if (picker) { openProfPicker(slot, btn); return; }
  /* ⚠ The console, not the popup — same as the bento's CD. The profile screen is
     an `.s-home-v3` and carries the same nav, so the plateau is right there. The
     album comes from the SLOT: five discs share one screen, so `_album` (the
     bento's notion of "current") means nothing here. */
  const scr = btn.closest('.s-home-v3');
  const name = ((window.PROFILE && window.PROFILE.favs) || [])[slot];
  const album = name && (window.ARCHIVE || []).find(a => a.album === name);
  if (!scr || !album) return;
  if (scr.classList.contains('s-home-v3--console') && scr._consoleAlbum === album) {
    window.closeConsole(scr); return;          // same disc twice = put it away
  }
  window.openConsole(scr, album);
};

/* Scroll → which disc is centred → the panel underneath.
   ⚠ rAF-throttled. `scroll` fires far faster than paint, and this measures every
   item on each call; without the gate a flick down the rail runs the whole loop
   dozens of times per frame. */
/* ⚠ The rail opens on the SECOND disc, not the first. At `scrollLeft: 0` the
   first disc is centred against an empty spacer — nothing to its left, one
   neighbour to its right — which reads as the start of a list rather than as a
   carousel you can work in both directions. One step in and it is three discs
   with the middle one framed, from the moment the page lands.
   ⚠ Once per rail (`_favInit`). `renderViewer` rebuilds the DOM, so the flag
   goes with it and a genuine re-render re-centres; what it stops is a repaint
   yanking the rail back under a finger mid-scroll. Set directly rather than
   smooth-scrolled: this is the starting position, not a movement. */
/* ⚠ A ResizeObserver, NOT a retry counter. Both steps below need a laid-out
   rail, and this was `requestAnimationFrame` up to three times — which is a
   race, and one the profile loses often enough to see: the viewer builds both
   theme variants and the screen can be zero-width for an unbounded number of
   frames while it is assembled. When the retries ran out the rail was left
   sitting on disc 1 with a blank info panel until you happened to touch it.
   An observer fires exactly when there IS a width, however long that takes.
   ⚠ `_favInit` is set HERE, not in `profFavStart`, and only on a run that
   actually did the work — a bailed attempt must not count as having run, or a
   later paint would yank the rail back to disc 2 under the user's finger. */
function profFavBoot(rail) {
  if (!rail || rail._favInit) return;
  const go = () => {
    if (rail._favInit || !rail.clientWidth) return false;
    rail._favInit = 1;
    profFavSettle(rail);  // arm the loop's wrap-on-idle before anything can scroll
    profFavStart(rail);   // centre disc 2 BEFORE the first paint, not after
    profFavPaint(rail);
    return true;
  };
  if (go() || rail._favRO) return;
  rail._favRO = new ResizeObserver(() => {
    if (!go()) return;
    rail._favRO.disconnect();
    rail._favRO = null;
  });
  rail._favRO.observe(rail);
}

function profFavStart(rail) {
  if (!rail || !rail.clientWidth) return;
  const items = rail.querySelectorAll('.prof-fav');
  // Open in the MIDDLE copy, not at item 0 — there has to be runway on both
  // sides from the first frame or the first flick left runs straight off the end.
  const el = items[profFavHome(rail, items) + 1] || items[0];
  if (el) rail.scrollLeft = el.offsetLeft - (rail.clientWidth - el.offsetWidth) / 2;
}

/* ══════════════════════════════════════════════════════════════════════════
   THE RAIL LOOPS (`profFavLoop` · `profFavSettle`)
   ══════════════════════════════════════════════════════════════════════════
   There is no end to reach. `profFavsHtml` emits the five discs five times over
   and this teleports the scroll back to the middle copy by exactly ONE SET
   WIDTH. That jump is invisible: either side of the seam is the same five
   records in the same order, so the pixels before and after are identical and
   the disc you were looking at is still under your thumb.

   ⚠ It runs when the scroll SETTLES, not the moment you drift out of the middle
   copy. Writing `scrollLeft` during a fling cancels the momentum in Chrome —
   wrapping eagerly would stop the rail dead in your hand every few discs. The
   settle timer is what buys the jump a moment when nothing is moving.

   ⚠ The one exception is the EMERGENCY wrap in `profFavPaint`: if the centred
   disc has reached the outermost copy, a stalled fling is still better than
   running out of rail, so that one goes through immediately. With five copies
   it should never fire — it is the backstop, not the mechanism.

   ⚠ `scroll-snap-type` does not fight this. The jump is a whole number of disc
   pitches, so it lands on an equivalent snap position and the scroller has
   nothing to correct. */
function profFavHome(rail, items) {
  const n = +rail.dataset.n || 0;
  const copies = n ? Math.round(items.length / n) : 1;
  return (copies >= 3) ? (copies >> 1) * n : 0;
}

function profFavLoop(rail, items, best, urgentOnly) {
  const n = +rail.dataset.n || 0;
  const copies = n ? Math.round(items.length / n) : 0;
  if (copies < 3) return false;                       // not a looping rail
  const home = copies >> 1;
  const copy = Math.min(copies - 1, Math.max(0, Math.floor(best / n)));
  if (copy === home) return false;
  if (urgentOnly && copy !== 0 && copy !== copies - 1) return false;
  const setW = items[n].offsetLeft - items[0].offsetLeft;
  if (!setW) return false;
  rail.scrollLeft -= (copy - home) * setW;
  return true;
}

/* ⚠ `scrollend` where it exists, a timer where it does not. The timer is not a
   fallback nobody hits — it is also what covers a fling that decays without the
   browser firing anything, and it is cheap: one pending timeout per rail. */
function profFavSettle(rail) {
  if (rail._favEnd) return;
  rail._favEnd = 1;
  const settle = () => {
    const items = [].slice.call(rail.querySelectorAll('.prof-fav'));
    if (!items.length || !rail.clientWidth) return;
    if (profFavLoop(rail, items, profFavMid(rail, items), false)) profFavPaint(rail);
  };
  if ('onscrollend' in rail) rail.addEventListener('scrollend', settle);
  rail._favSettle = () => { clearTimeout(rail._favT); rail._favT = setTimeout(settle, 180); };
}

window.profFavSync = function (rail) {
  if (!rail) return;
  if (rail._favSettle) rail._favSettle();
  if (rail._favRaf) return;
  rail._favRaf = requestAnimationFrame(() => { rail._favRaf = 0; profFavPaint(rail); });
};

/* ══════════════════════════════════════════════════════════════════════════
   THE FAVOURITES WHEEL (`profFavArc`)
   ══════════════════════════════════════════════════════════════════════════
   The discs do not sit on a line, they sit on the rim of a BIG WHEEL whose hub
   is a long way below the screen. Scrolling turns the wheel, so a disc leaving
   the centre swings DOWN and away rather than sliding flat — the side discs end
   up lower than the middle one, and tilted by however far round they have gone.

   ⚠ The hub is not a made-up number. `PROF_ARC_DEG` says how far a disc has
   turned by the time it reaches its NEIGHBOUR's slot, and the radius falls out
   of that: R = spacing / θ. So the wheel is re-derived from the measured layout
   every paint and stays right at any frame width — there is no magic px here to
   go stale when the rail changes size.

   ⚠ The X is left alone. A true wheel would also pull the discs horizontally
   towards the centre (x = R·sinθ, not R·θ), but the rail's x is owned by
   scroll-snap, and fighting the scroller for it is how a carousel starts
   feeling slippery under a thumb. At 12° the two differ by well under a pixel.

   ⚠ `u` is CLAMPED to one neighbour. Past that the drop grows fast (the second
   neighbour would be ~100px down), and it buys nothing: a disc two slots out is
   completely outside the rail — its near edge lands at 383px from the centre of
   a box that is only 192px wide. The clamp is also what bounds the rail's
   bottom padding, which is the room the drop has to live in. */
/* ⚠ 24°, up from 12. At twelve the wheel was arithmetically real and visually
   deniable — you had to be told it was there. Halving the radius (θ doubles, and
   R = spacing/θ) doubles the tilt and near-quadruples the drop, because the fall
   goes with 1−cos θ rather than with θ: 26px became 52px. That second number is
   the one with a cost — it is the room `.prof-fav-rail`'s bottom padding has to
   find, and the reason the padding moved with this. */
const PROF_ARC_DEG = 24;     // how far a disc has turned once it is one slot out
const PROF_ARC_DIM = 0.55;   // opacity given up over that same slot
const PROF_ARC_SHR = 0.24;   // and scale — a touch deeper, so the swing reads as
                             // going AWAY from you and not merely downward

function profFavArc(rail, items) {
  const w = rail.clientWidth;
  if (!w || items.length < 2) return;
  const spacing = items[1].offsetLeft - items[0].offsetLeft;
  if (!spacing) return;
  const step = PROF_ARC_DEG * Math.PI / 180;
  const R    = spacing / step;                       // the hub, in the rail's own px
  const mid  = rail.scrollLeft + w / 2;
  /* ⚠ The class is what turns OFF the CSS transition. The discrete
     `.prof-fav` / `.is-mid` transform pair still ships as the no-JS base, and
     its .28s ease would smear every one of these per-frame writes into mush. A
     transform driven straight off scrollLeft needs no easing — the scroll IS
     the easing. */
  rail.classList.add('is-arc');
  items.forEach(el => {
    const dx  = el.offsetLeft + el.offsetWidth / 2 - mid;
    const u   = Math.max(-1, Math.min(1, dx / spacing));
    const th  = u * step;
    const dy  = R * (1 - Math.cos(th));              // how far the rim has fallen
    const s   = 1 - PROF_ARC_SHR * Math.abs(u);
    el.style.transform = 'translateY(' + dy.toFixed(2) + 'px) rotate(' +
                         (th * 180 / Math.PI).toFixed(2) + 'deg) scale(' + s.toFixed(3) + ')';
    el.style.opacity = (1 - PROF_ARC_DIM * Math.abs(u)).toFixed(3);
  });
}


/* Which disc is under the middle of the rail.
   ⚠ Measured against the rail's own scroll box, so `.prof-fav-rail` must stay
   `position: relative` — that is what makes it each button's `offsetParent` and
   keeps `offsetLeft` in the same space as `scrollLeft`. */
function profFavMid(rail, items) {
  const mid = rail.scrollLeft + rail.clientWidth / 2;
  let best = 0, bd = Infinity;
  items.forEach((el, i) => {
    const d = Math.abs(el.offsetLeft + el.offsetWidth / 2 - mid);
    if (d < bd) { bd = d; best = i; }
  });
  return best;
}

function profFavPaint(rail) {
  const sec = rail && rail.closest('.prof-favs');
  if (!sec) return;
  const items = [].slice.call(rail.querySelectorAll('.prof-fav'));
  if (!items.length || !rail.clientWidth) return;
  /* ⚠ The emergency wrap, and it re-reads the centre afterwards rather than
     recursing: the jump moves `scrollLeft` by a whole set, so an index found
     before it is measured against a position that no longer exists. */
  const first = profFavMid(rail, items);
  const best  = profFavLoop(rail, items, first, true) ? profFavMid(rail, items) : first;
  items.forEach((el, i) => el.classList.toggle('is-mid', i === best));
  profFavArc(rail, items);

  const set  = (sel, v) => { const el = sec.querySelector(sel); if (el) el.textContent = v; };
  const name = items[best].dataset.alb;
  const a = name && (window.ARCHIVE || []).find(x => x.album === name);
  if (!a) {
    set('.prof-fav-name', 'Empty slot');
    set('.prof-fav-yr', '');
    set('.prof-fav-artist', 'Tap to add a favourite');
    return;
  }
  /* The whole reason the rail exists: a cover alone does not tell you what an
     album is. ⚠ The YEAR sits with the title — it is part of naming a record,
     not a statistic about it — and the genre is gone. It said little at this
     size, and the archive's genre strings are inconsistent enough ("Hip-hop",
     "Experimental hip-hop", "Korean hip-hop") that it read as noise. */
  set('.prof-fav-name', a.album);
  set('.prof-fav-yr', a.year ? String(a.year) : '');
  set('.prof-fav-artist', a.artist);
  // Name, year, artist — and that is the panel (2026-09-11). The stars, the
  // review count and their line about it are gone; what they wrote lives in
  // PINNED REVIEWS under the rail now.
}

window.toggleProfCd = function (btn, e, slot) {
  if (e) e.stopPropagation();
  /* ⚠ Found by `data-slot`, not by adjacency. The favourites rail is
     `overflow-x: auto` and would clip a popup, so the menus live AFTER it as
     siblings of the rail rather than next to their own button. The old
     `nextElementSibling` lookup is kept as the first branch for any caller that
     still pairs them. */
  const menu = (btn.nextElementSibling && btn.nextElementSibling.classList &&
                btn.nextElementSibling.classList.contains('prof-cd-menu'))
    ? btn.nextElementSibling
    : (btn.closest('.prof-favs') || document).querySelector('.prof-cd-menu[data-slot="' + slot + '"]');
  if (!menu) return;
  const willOpen = menu.hidden;
  const scope = btn.closest('.app-screen') || document;
  scope.querySelectorAll('.prof-cd-menu').forEach(m => { if (m !== menu) m.hidden = true; });
  menu.hidden = !willOpen;
  if (willOpen) {
    warmServiceLinks(menuAlbum(btn, slot));   // same reason as the bento's CD
    const close = ev => {
      if (!menu.contains(ev.target) && !btn.contains(ev.target)) {
        menu.hidden = true;
        document.removeEventListener('click', close, true);
      }
    };
    setTimeout(() => document.addEventListener('click', close, true), 0);
  }
};

// Play/pause a CD's 30s preview; the tapped CD spins while it plays.
window.profCdPreview = function (prevBtn, slot) {
  const name = (window.PROFILE.favs || [])[slot];
  const album = name && (window.ARCHIVE || []).find(a => a.album === name);
  if (!album) return;
  const menu = prevBtn.closest('.prof-cd-menu');
  // Same reason as `toggleProfCd`: the menu sits after the rail, not beside its
  // own CD, so the disc is found by slot.
  const sec = menu && menu.closest('.prof-favs');
  const cdBtn = sec && sec.querySelector('.prof-fav[data-i="' + slot + '"]');
  const img = cdBtn && cdBtn.querySelector('.prof-fav-img');
  if (!cdBtn) return;
  const a = previewAudioEl();
  unlockAudio(a);                                            // iOS: unlock in-gesture
  const stop = () => { prevBtn.classList.remove('playing'); if (img) img.classList.remove('prof-fav--spin'); };
  if (prevBtn.classList.contains('playing')) { a.pause(); stop(); return; }
  // stop any other CD that was spinning
  (cdBtn.closest('.app-screen') || document).querySelectorAll('.prof-cd-prev.playing').forEach(b => b.classList.remove('playing'));
  (cdBtn.closest('.app-screen') || document).querySelectorAll('.prof-fav-img.prof-fav--spin').forEach(x => x.classList.remove('prof-fav--spin'));
  a.onended = stop;
  const start = (url) => {
    if (!url) { prevBtn.classList.add('none'); setTimeout(() => prevBtn.classList.remove('none'), 1400); return; }
    if (a.src !== url) { a.src = url; a.currentTime = 0; }
    a.play().then(() => { PREVIEW.unlocked = true; prevBtn.classList.add('playing'); if (img) img.classList.add('prof-fav--spin'); }).catch(() => {});
  };
  const cached = PREVIEW_CACHE.get(albumKey(album).toLowerCase());
  if (cached !== undefined) start(cached);
  else fetchPreviewUrl(album).then(start);
};

// ── The picks under the pins — Favourite songs · Listened · Listen later ──
/* The picker swaps panes in place: all three lists are already in the markup
   (profPicksHtml, screens.js), so a tab is a class flip and a `hidden` toggle,
   never a re-render. Scoped to the section that was tapped — the dark and
   light shells each keep their own tab, per the usual rule. */
window.profPicksTab = function (btn) {
  const sec = btn.closest('.prof-picks');
  if (!sec) return;
  const k = btn.dataset.k;
  sec.querySelectorAll('.prof-picks-tab').forEach(b => {
    const on = b === btn;
    b.classList.toggle('active', on);
    b.setAttribute('aria-selected', on ? 'true' : 'false');
  });
  sec.querySelectorAll('.prof-picks-pane').forEach(p => { p.hidden = p.dataset.k !== k; });
};
/* A row opens its album. Found by name + artist (a title alone collides), and
   a record that has since left ARCHIVE — the rec pool is re-dealt each load —
   falls back to what the log draft snapped for it, the way the library does. */
window.profPickOpen = function (el) {
  const name = el.dataset.alb, artist = el.dataset.artist || '';
  const A = window.ARCHIVE || [];
  let a = A.find(x => x.album === name && x.artist === artist) || A.find(x => x.album === name);
  if (!a) {
    const d = logDrafts()[logKey({ title: name, subtitle: artist })];
    if (d && d.snap) a = { album: name, artist, ...d.snap, image: d.snap.image || d.image || '' };
  }
  if (a && typeof openAlbumPage === 'function') openAlbumPage(a);
};

// ── Follow (the dot-mascot button) ────────────────────────────
/* Toggles Follow ⇄ Following. The wink that used to fire here went with the
   rest of the face — and it only ever half-worked: it added `--wink` without
   `--smile`, so it animated dots that were still in the ARROW formation. */
window.toggleProfFollow = function (btn) {
  const on = btn.classList.toggle('is-following');
  btn.setAttribute('aria-pressed', on ? 'true' : 'false');
  const lbl = btn.querySelector('.prof-act-lbl');
  if (lbl) lbl.textContent = on ? 'Following' : 'Follow';
  sceneReact(on ? 'follow' : 'undo');
};

/* ══════════════════════════════════════════════════════════════════════════
   DEEZER AT RUNTIME — the recommendation pool + the search fallback
   ══════════════════════════════════════════════════════════════════════════
   A persona ships ~30 albums and the bento cycles the whole catalogue, so the
   home screen ran out of records and started repeating. This widens it to a few
   hundred WITHOUT shipping them: on every load a handful of the persona's own
   artists seed `artist/<id>/radio`, and what comes back is folded into ARCHIVE.
   Deezer's radio is itself randomised and the seeds are re-drawn each load, so
   a reload genuinely deals a different shelf.

   The same client backs search. The local index only knows the persona's own
   albums, so "steely dan" found nothing; Deezer is queried as a fallback and
   its hits open like any other album.

   Records arrive LITE — radio carries title / artist / cover but no year, genre
   or track count. That is everything the compact bento needs (it hides the
   year), and `dzHydrate` fills the rest in one call when the album is opened.
   Ratings and reviews come from the same seeded algorithm as
   tools/build_personas.py, so a fetched album renders identically to a built-in
   one and always shows the same numbers. */

/* Tunable live from the rec box at the bottom of the desktop viewer, so these
   are `let`. One album per artist by default: four in a row by the same act
   read as the shelf repeating, which is the thing this feature exists to fix.
   The fan-out is wider to compensate — breadth now comes from more ARTISTS. */
let RECS_ENABLED    = true;
let RECS_SEEDS      = 10;  // of the persona's own artists, re-drawn each load
let RECS_PER_SEED   = 10;  // related artists taken per seed
let RECS_PER_ARTIST = 1;   // albums taken per related artist — never two in a row
let RECS_TARGET     = 100; // ceiling on the queue
let   RECS_GEN        = 0;   // bumped on persona switch; in-flight deals bail

/* Deezer allows roughly 50 requests / 5s per client. Filling the rec pool is
   ~45 calls, which sat right on that line and starved whatever came next — the
   search fallback would come back empty seconds after a page load, looking
   like a broken feature. So every call is PACED, and a failure is retried once.

   ⚠️ Only successful responses are cached. Caching the `null` from a throttled
   call pinned the failure for the rest of the session: search stayed broken
   until reload even once the quota had recovered. */
const DZ_CACHE = new Map();
const DZ_GAP = 115;          // ms between requests → ~43 per 5s, inside the limit
let DZ_NEXT = 0;
function dz(path, retry) {
  if (DZ_CACHE.has(path)) return Promise.resolve(DZ_CACHE.get(path));
  const url = 'https://api.deezer.com/' + path +
              (path.indexOf('?') >= 0 ? '&' : '?') + 'output=jsonp';
  const now = Date.now();
  const at = Math.max(now, DZ_NEXT);
  DZ_NEXT = at + DZ_GAP;
  return new Promise(function (res) { setTimeout(res, at - now); })
    .then(function () { return jsonp(url, 8000); })
    .then(function (d) {
      if (d && !d.error) { DZ_CACHE.set(path, d); return d; }
      if (retry) return d;                        // one retry, then give up
      DZ_NEXT = Date.now() + 1200;                // back off past the window
      return dz(path, true);
    });
}

/* ══════════════════════════════════════════════════════════════════════════
   CREDITS — producer / mix / engineer, from MusicBrainz
   ══════════════════════════════════════════════════════════════════════════
   ⚠️ **Deezer does not carry credits.** Checked against the live album
   endpoint: the only people in it are `contributors`, and their `role` is
   "Main" or "Featured" — performers, not producers. What it does give that is
   credit-adjacent is `label`, `release_date` and `upc`.

   MusicBrainz has the rest, is free, needs no key, and — the part that makes
   this reliable — matches EXACTLY on Deezer's `upc` via its `barcode` query, so
   there is no fuzzy title guessing. The chain is three calls:
     dz('album/<deezerId>')  →  upc          (JSONP; Deezer sends no CORS headers)
     mb('release/?query=barcode:<upc>')  →  mbid
     mb('release/<mbid>?inc=recordings+artist-rels+recording-level-rels')  →  credits

   ⚠️ All THREE inc values are required. `recording-level-rels` only says
   WHERE to apply relationship includes; `artist-rels` says WHICH kind. Without
   the latter the request still returns 200 and every recording simply arrives
   with no `relations` key — indistinguishable from "this album has no credits"
   unless you look at the payload.
   ⚠️ The producers live at RECORDING level, not release level — the release's
   own `relations` array came back empty for every record tested, so the heavy
   `recordings` include is unavoidable (~100KB). That is why this is fetched for
   the ONE album on screen, debounced, and cached for the session.
   ⚠️ MusicBrainz asks for ≤1 request/second. `MB_GAP` paces every call through
   one queue, the same shape as `dz()`'s `DZ_GAP`. */
const MB_CACHE = new Map();
const MB_GAP = 1100;
let MB_NEXT = 0;

function mb(path, retry) {
  if (MB_CACHE.has(path)) return Promise.resolve(MB_CACHE.get(path));
  const url = 'https://musicbrainz.org/ws/2/' + path +
              (path.indexOf('?') >= 0 ? '&' : '?') + 'fmt=json';
  const now = Date.now();
  const at = Math.max(now, MB_NEXT);
  MB_NEXT = at + MB_GAP;
  return new Promise(res => setTimeout(res, at - now))
    .then(() => fetch(url))
    .then(r => {
      /* ⚠️ 503 means THROTTLED, not broken — "the web server is currently
         busy". Measured from the page, three identical requests at 1.5s spacing
         returned 200 / 503 / 200 while the same URL from curl was 200 every
         time: MusicBrainz load-sheds anonymous CROSS-ORIGIN traffic, and a
         browser cannot set the descriptive User-Agent their policy asks for.
         Each album needs two calls, so a single retry still fails often —
         hence up to three, backing off 1.5s / 3s / 6s. The first build treated
         every 503 as "this album has no credits", which looked like patchy
         coverage rather than a network problem.
         ⚠️ This is why credits are BAKED AT BUILD TIME by
         `tools/fetch_credits.py`, which can send a proper User-Agent and pace
         itself. This runtime path only serves albums the build never saw —
         i.e. the recommendation pool Deezer hands us at load. */
      if (r.status === 503 && (retry || 0) < 3) {
        MB_NEXT = Date.now() + 1500 * Math.pow(2, retry || 0);
        return mb(path, (retry || 0) + 1);
      }
      return r.ok ? r.json() : null;
    })
    .then(d => { if (d) MB_CACHE.set(path, d); return d; })
    .catch(() => null);          // credits are a bonus; never break the screen
}

/* Roles worth showing, in the order they're shown. Deliberately short — the
   strip has room for a line or two, not a liner-notes dump. */
const CREDIT_ROLES = [['producer', 'Produced by'], ['mix', 'Mixed by'], ['engineer', 'Engineered by']];

function creditsFor(album) {
  if (!album) return Promise.resolve(null);
  /* ⚠️ Baked credits win, and an EMPTY array is an answer — `tools/fetch_credits.py`
     writes `[]` for "looked, MusicBrainz has nothing", which is why this tests
     for the property rather than for truthiness. Without that check every
     credit-less album would fall through and re-ask the network on every swipe,
     forever, for a question already answered at build time. */
  if (Array.isArray(album.credits)) {
    return Promise.resolve(album.credits.length ? album.credits : null);
  }
  const key = 'credits:' + (album.deezerId || album.album + '|' + album.artist);
  if (MB_CACHE.has(key)) return Promise.resolve(MB_CACHE.get(key));
  /* ⚠️ Only a DEFINITIVE answer is cached. `ok:false` means the network gave
     up (a 503 that outlasted its retries), which is not the same as "this
     record has no credits" — caching that pins the album to blank for the rest
     of the session and looks exactly like missing data. This is the same trap
     `dz()` documents: an earlier cut cached the null from a throttled call and
     search silently returned nothing until reload. */
  const finish = (v, ok) => { if (ok !== false) MB_CACHE.set(key, v); return v; };

  const byBarcode = album.deezerId
    ? dz('album/' + album.deezerId).then(d => (d && d.upc) || null)
    : Promise.resolve(null);

  return byBarcode
    .then(upc => upc
      ? mb('release/?query=barcode:' + encodeURIComponent(upc) + '&limit=1')
      // No upc (a hand-authored album): fall back to an artist+title search.
      : mb('release/?query=' + encodeURIComponent(
            'release:"' + album.album + '" AND artist:"' + album.artist + '"') + '&limit=1'))
    .then(r => {
      if (!r) return finish(null, false);            // request failed, not "no credits"
      const rel = r.releases && r.releases[0];
      if (!rel) return finish(null);                 // genuinely unmatched

      return mb('release/' + rel.id + '?inc=recordings+artist-rels+recording-level-rels')
        .then(full => {
          if (!full) return finish(null, false);       // request failed
          const seen = {};
          (full.media || []).forEach(m => (m.tracks || []).forEach(t =>
            ((t.recording || {}).relations || []).forEach(rl => {
              const name = (rl.artist || {}).name;
              if (!name) return;
              (seen[rl.type] = seen[rl.type] || []).indexOf(name) < 0 && seen[rl.type].push(name);
            })));
          const out = CREDIT_ROLES
            .map(([k, label]) => (seen[k] && seen[k].length ? { label, names: seen[k] } : null))
            .filter(Boolean);
          return finish(out.length ? out : null);
        });
    })
    .catch(() => finish(null, false));
}

/* The fallback line. ⚠️ Credits only exist for ~14% of what the bento cycles
   (the bake covers personas.js; two thirds of ARCHIVE is the runtime rec pool),
   so without this the new space is empty on most albums and reads as broken.
   The label is one field of the SAME Deezer album call `creditsFor` already
   makes for the upc, so it costs nothing extra, and it is a real credit — for
   small artists "Independent" is itself the answer.
   ⚠️ `album.label` is baked by tools/fetch_credits.py; `''` means "asked,
   Deezer had none", which is why this tests for the property, not truthiness. */
function labelFor(album) {
  if (!album) return Promise.resolve(null);
  if (typeof album.label === 'string') return Promise.resolve(album.label || null);
  if (!album.deezerId) return Promise.resolve(null);
  return dz('album/' + album.deezerId)
    .then(d => {
      const l = d && d.label ? String(d.label).trim() : '';
      album.label = l;                 // cache on the record itself
      return l || null;
    })
    .catch(() => null);
}

/* ⚠️ The three rows are FIXED and always drawn — Produced by / Mixed by /
   Label — with the value left blank when we don't have it, rather than the row
   being dropped. That's a deliberate reversal of the earlier "hide it when
   empty" rule: a strip whose contents change shape album to album reads as
   unstable, and the standing labels double as a statement of what the app
   thinks is worth crediting. `Engineered by` is still collected by the bake but
   not shown here; there is only room for three.

   ⚠️ Baked albums paint SYNCHRONOUSLY, without the debounce. Both lookups
   resolve from the record itself for anything the build saw, and routing those
   through a 520ms timer made the block visibly pop in on every swipe. The
   debounce exists to keep the network quiet, so it should only apply when
   there IS a network call — i.e. the runtime rec pool.
   ⚠️ It re-checks the album before painting the async path: the bento swipes
   faster than three calls resolve, so a slow lookup would otherwise land on
   whatever record happened to be on screen by then. */
const CREDIT_ROWS = ['Produced by', 'Mixed by'];

function creditRowsHtml(list, label) {
  const by = {};
  (list || []).forEach(c => { by[c.label] = c.names; });
  const rows = CREDIT_ROWS.map(l => [l, by[l]]);
  rows.push(['Label', label ? [label] : null]);
  return rows.map(([lbl, names]) =>
    `<div class="v3-cred-row${names && names.length ? '' : ' is-empty'}">` +
    `<span class="v3-cred-lbl">${lbl}</span>` +
    `<span class="v3-cred-names">${names ? names.slice(0, 3).join(', ') : ''}</span></div>`
  ).join('');
}

function paintCredits(album, list, label) {
  const html = creditRowsHtml(list, label);
  document.querySelectorAll('.s-home-v3').forEach(scr => {
    const el = scr.querySelector('.v3-blue-credits');
    if (!el || scr.classList.contains('s-home-v3--review')) return;
    el.innerHTML = html;
    el.hidden = false;
  });
}

let _credT = null;
function populateCredits(screenEl, album) {
  const box = screenEl && screenEl.querySelector('.v3-blue-credits');
  if (!box) return;
  clearTimeout(_credT);
  if (!album) { box.hidden = true; box.innerHTML = ''; return; }

  // Everything the build saw: paint now, no timer, no request.
  if (Array.isArray(album.credits) && typeof album.label === 'string') {
    paintCredits(album, album.credits.length ? album.credits : null, album.label || null);
    return;
  }

  // Runtime recs: keep the labels up so the strip doesn't change shape, and
  // fill the values in when the lookups land.
  paintCredits(album, null, null);
  _credT = setTimeout(() => {
    Promise.all([creditsFor(album), labelFor(album)]).then(([list, label]) => {
      if (currentBentoAlbum && currentBentoAlbum() !== album) return;
      paintCredits(album, list, label);
    });
  }, 520);
}
window.populateCredits = populateCredits;

// ── The generated-review algorithm, ported from tools/build_personas.py ──
/* ⚠️ REALISTIC (Eric, 2026-09-15): the pool used to be twenty tidy one-liners
   of one voice. Real posts on the music and film sites are a MIX of registers
   — one-line jokes, lowercase stream-of-thought, punctuated paragraphs,
   lists — so this is that mix, with a few that run past the feed's four-line
   clamp. Lists carry real newlines; `.v3-rev-text` is `pre-line` for them.
   ⚠️ Keep in step with POOL in tools/build_personas.py — the persona
   archives' reviews are built from that copy, not this one. */
const DZ_QUOTES = [
  "no skips. none. i checked twice.",
  "this album is my roman empire",
  "5 stars because i'm scared of the fans",
  "review pending. still crying.",
  "wow.",
  "this goes so hard for no reason",
  "listened on the bus. missed my stop. worth it.",
  "hot take: the deluxe is the real album",
  "the way the strings come in on track 6??? hello???",
  "mom said it's my turn to be the friend who won't shut up about this record",
  "the vinyl is $60 and i have never clicked add to cart faster",
  "it's giving 3am walk home",
  "put it on for the dishes. ended up sitting down.",
  "it's fine. it's FINE. why is everyone acting like this is scripture",
  "10/10 no notes. ok one note: track 4 could be shorter. 10/10 still.",
  "3.5 rounded up because the closer made me text my ex. rounded back down because the closer made me text my ex.",
  "not for me. i can hear exactly why it's for everyone else.",
  "Honestly? Better than the debut. Not close.",
  "Fine, I'll say it: the singles are the weakest part.",
  "Pros: everything.\nCons: ends.",
  "Top 3, no order:\n1. the opener\n2. the one with the choir\n3. whatever track 8 is called",
  "Highs: the title track, the horns on 4.\nLows: track 9 is a skit and it knows it.\nVerdict: keep.",
  "Ranking every song would take a week, so the short version: all of them, in that order.",
  "i put this on expecting background music and ended up sitting on the kitchen floor for the whole second side. the way the drums drop out of the fourth track and leave that one synth line hanging is the best thirty seconds of music i've heard this year",
  "took me three listens to get it and now i can't stop. the first half feels like a different album from the second, and then the last song ties them together so neatly you go back to the start to check if it was planned. it was",
  "everyone i know rates this for the singles and sure, they're great. but the deep cuts are where the record actually lives. track seven especially, which nobody talks about and which is quietly the best thing on it",
  "sounds thin on speakers and enormous on headphones, so listen to it the right way. the low end on the title track is the kind of thing you feel in your teeth",
  "grew on me. first listen confused me, tenth listen floored me",
  "i've recommended this to six people and lost two friends",
  "criminally short. i wanted twenty more minutes",
  "A remarkable record. The first half is patient, almost withholding, and then the second half pays out everything it saved. Track seven, in particular, is the best thing they have made.",
  "Not what I wanted from them and exactly what I needed. Slower, sadder and stranger than anything they've done, and the production is so close-mic'd you can hear the room. Give it a night drive and it opens right up.",
  "Great production, wildly overwritten. Half these songs would land twice as hard with a verse cut. Still a four, because the good half is really good.",
  "Skipped this for two years because of the cover. My fault. Genuinely one of the best things I've heard this decade.",
  "The lyrics are doing a lot here, and I mean that as praise. Every verse is a small short story, and the way the chorus changes one word each time it comes round is the kind of detail you only catch on headphones.",
  "Criminally underrated. It came out the same month as three bigger records and got buried, which is a shame, because it's better than all of them. The sequencing alone is a masterclass.",
];
const DZ_NAMES = [['echoplex', 'EP'], ['staticfog', 'SF'], ['velvetblast', 'VB'],
                  ['noisegate', 'NG'], ['dustpan', 'DP'], ['kira.wav', 'KW'], ['vxblank', 'VX']];
const DZ_GRADS = ['linear-gradient(135deg,#e05a6b,#8a2f52)', 'linear-gradient(135deg,#2f7fe0,#1c3f8a)',
                  'linear-gradient(135deg,#3fae7a,#1d6b4a)', 'linear-gradient(135deg,#b06ae0,#5f2f8a)',
                  'linear-gradient(135deg,#e0a53f,#8a5f1d)', 'linear-gradient(135deg,#e05aa8,#8a2f6b)',
                  'linear-gradient(135deg,#4fc3d0,#1d6b7a)'];
/* Deezer's genre vocabulary -> ours. ⚠ The regional genres all land on World:
   the dial has one hole for them and eight separate labels would each match
   nothing. */
const DZ_GEN = { 'Rap/Hip Hop': 'Hip-Hop', 'Electro': 'Electronic', 'Films/Games': 'Soundtrack',
                 'Dance': 'Electronic', 'Soul & Funk': 'Soul', 'Asian Music': 'K-Pop',
                 'African Music': 'World', 'Brazilian Music': 'World', 'Cumbia': 'World',
                 'Indian Music': 'World', 'Latin Music': 'World', 'Salsa': 'World',
                 'Traditional Mexicano': 'World', 'Reggaeton': 'World' };

/* ⚠ THE FIX THIS FILE HAS BEEN PROMISING: `genre_id` -> a genre name.
   `dzRecord` set `genre: ''` on every album the rec deal dealt, which is TWO
   THIRDS of the live archive (measured: 67 of 100), so the other 33 carried
   eight labels between them and most of the mix dial matched nothing at all.
   ⚠ It costs NO extra requests. `genre_id` is already in the payload
   `artist/<id>/albums` returns — the same response the deal is reading for the
   title and the cover — so this is a lookup, not a fetch. That is why it is
   done here and not by hydrating each album.
   ⚠ Ids are stable and there are 28 of them, so the table is written out
   rather than pulled from `/genre` at boot: one fewer request, and one fewer
   thing that can fail and leave the whole archive genre-less again. */
const DZ_GID = {
  132: 'Pop', 116: 'Rap/Hip Hop', 122: 'Reggaeton', 152: 'Rock', 113: 'Dance',
  165: 'R&B', 85: 'Alternative', 186: 'Christian', 106: 'Electro', 466: 'Folk',
  144: 'Reggae', 129: 'Jazz', 84: 'Country', 67: 'Salsa', 65: 'Traditional Mexicano',
  98: 'Classical', 173: 'Films/Games', 464: 'Metal', 169: 'Soul & Funk',
  2: 'African Music', 16: 'Asian Music', 153: 'Blues', 75: 'Brazilian Music',
  71: 'Cumbia', 81: 'Indian Music', 95: 'Kids', 197: 'Latin Music'
};
/* ⚠ genre_id 0 is 'All', which means Deezer does not know — it must stay blank
   rather than becoming a label, or a third of the archive joins one bogus
   shelf. Same for an id not in the table. */
const dzGenreOf = id => { const g = DZ_GID[id]; return g ? (DZ_GEN[g] || g) : ""; };

function dzSeed() {
  let h = 0;
  for (let i = 0; i < arguments.length; i++) {
    const p = String(arguments[i]);
    for (let j = 0; j < p.length; j++) h = (h * 131 + p.charCodeAt(j)) & 0x7FFFFFFF;
  }
  return h;
}
function dzReviews(title, rating) {
  const idxs = [], used = {};
  for (let i = 0; i < 12 && idxs.length < 3; i++) {
    const k = dzSeed(title, i) % DZ_QUOTES.length;
    if (!used[k]) { used[k] = 1; idxs.push(k); }
  }
  while (idxs.length < 3) idxs.push((idxs[idxs.length - 1] + 1) % DZ_QUOTES.length);
  const scale = rating >= 4.4 ? [5, 4.5, 4] : [4.5, 4, 4];
  return idxs.map(function (pi, k) {
    const u = dzSeed(title, 'u', k) % DZ_NAMES.length;
    return { name: DZ_NAMES[u][0], init: DZ_NAMES[u][1], grad: DZ_GRADS[u],
             rating: scale[k], text: DZ_QUOTES[pi] };
  });
}

/* One Deezer album object (from radio, search or an artist's list) → an app
   record. `_lite` marks the fields that endpoint did not carry. */
function dzRecord(al, artist) {
  const title = (al && al.title) || '';
  const ar = artist || (al && al.artist) || {};
  const rating = Math.round((3.8 + (dzSeed(ar.name, title) % 11) * 0.1) * 10) / 10;
  return {
    album: title, artist: ar.name || '',
    year: parseInt((al.release_date || '').slice(0, 4), 10) || 0,
    genre: dzGenreOf(al.genre_id), tracks: al.nb_tracks || 10,
    image: al.cover_xl || al.cover_big || al.cover_medium || '',
    rating: rating,
    reviewCount: 4000 + (dzSeed(title, 'rc') % 86) * 1000,
    reviews: dzReviews(title, rating),
    deezerId: al.id, artistId: ar.id,
    _rec: true, _lite: true
  };
}

// Fill year / genre / track count. One call, only when an album is opened.
function dzHydrate(a) {
  if (!a || !a._lite || a._hydrating || !a.deezerId) return Promise.resolve(a);
  a._hydrating = true;
  return dz('album/' + a.deezerId).then(function (d) {
    if (d && !d.error) {
      a.year   = parseInt((d.release_date || '').slice(0, 4), 10) || a.year;
      const g  = (((d.genres || {}).data || [{}])[0] || {}).name || '';
      a.genre  = DZ_GEN[g] || g || a.genre || 'Alternative';
      a.tracks = d.nb_tracks || a.tracks;
      a._lite  = false;
    }
    a._hydrating = false;
    return a;
  });
}

function dzKey(artist, album) { return String(artist || '').toLowerCase() + '::' + String(album || '').toLowerCase(); }

/* Round-robin a list by artist: take one album from each artist in turn, so two
   records by the same act are as far apart as the list allows. */
function dzSpread(list) {
  const byArtist = new Map();
  list.forEach(function (a) {
    const k = String(a.artist || '').toLowerCase();
    if (!byArtist.has(k)) byArtist.set(k, []);
    byArtist.get(k).push(a);
  });
  const lanes = shuffled([...byArtist.values()]);
  const out = [];
  for (let i = 0; out.length < list.length; i++) {
    let placed = false;
    lanes.forEach(function (lane) { if (lane[i]) { out.push(lane[i]); placed = true; } });
    if (!placed) break;
  }
  return out;
}

/* How much of the queue is already SPOKEN FOR and must not be re-ordered.

   ⚠️ `_albumIdx` is a POSITION, not an album, and the For-You panel is already
   showing the album at `idx + 1` — a promise about what the next swipe lands
   on. Re-dealing either of those swaps the record out from under the user:
   For You offers one album and you get a different one. `+2` covers the album
   on screen and that promise; the extra 1 absorbs `albumSeq()` prepending
   `featuredAlbum` (so a seq index runs one ahead of a trending index). */
function dzQueueFloor() {
  let maxIdx = 0;
  homeShells().forEach(function (s) {
    if (typeof s._albumIdx === 'number') maxIdx = Math.max(maxIdx, s._albumIdx);
  });
  return maxIdx + 3;
}

/* Fold new albums into ARCHIVE + the bento queue.

   ⚠️ Only the part of the queue the user has NOT reached is re-dealt. This
   function runs once per artist per seed — several DOZEN times while a deal
   streams in — and it used to re-spread the whole of `trendingAlbums` on every
   one of them. Two bugs fell out of that, and they were the same bug:
   the For-You preview lied (it painted `seq[idx+1]`, the array was re-dealt
   underneath, and the swipe landed somewhere else), and the queue appeared to
   REPEAT — swiping never made progress through the catalogue because each
   re-deal re-randomised the positions just ahead, so albums came back around.
   Re-dealing only the tail keeps the interleaving this was added for (recs
   mixed through your own records rather than stacked behind all ~30 of them)
   without moving anything already on screen or already promised. */
function dzAdopt(records) {
  const A = window.ARCHIVE || [];
  const have = new Set(A.map(function (a) { return dzKey(a.artist, a.album); }));
  const fresh = [];
  records.forEach(function (r) {
    const k = dzKey(r.artist, r.album);
    if (!r.artist || !r.album || !r.image || have.has(k)) return;
    have.add(k); fresh.push(r);
  });
  if (!fresh.length) return 0;
  window.ARCHIVE = A.concat(fresh);
  /* Re-deal round-robin by artist — the persona's own records and the fetched
     ones together, not recs appended behind them. Appending meant swiping all
     ~30 of your own albums before a single recommendation appeared, which is
     the same wall of familiar covers this feature exists to break up.
     Round-robin also keeps two records by one act apart; they arrive grouped,
     one artist's batch at a time.
     ⚠️ From `dzQueueFloor()` onward ONLY — see the note above. */
  const queue = window.trendingAlbums || [];
  const floor = Math.min(dzQueueFloor(), queue.length);
  window.trendingAlbums = queue.slice(0, floor)
    .concat(dzSpread(queue.slice(floor).concat(fresh)));
  window.SEARCH_INDEX = null;   // memoised — must be dropped or search misses them
  return fresh.length;
}

/* Releases that are not the thing a review app wants to show. `artist/<id>/
   radio` was the first cut and it is a trap: seeded off a K-ballad singer it
   comes back as forty "Crash Landing on You (Original Television Soundtrack),
   Pt. 3" singles. Related-artist ALBUMS carry `record_type` and `nb_tracks`,
   which is what makes real filtering possible. */
/* ⚠️ Two things this endpoint does NOT give you: `nb_tracks` is absent
   entirely, and `record_type` reads "album" for live records and compilations
   just the same as for studio LPs. The title is the only real signal, so the
   filter has to be generous — a raw Steely Dan list is Alive In America, Gold,
   A Decade Of…, Showbiz Kids and Citizen 1972-1980 before it is Aja. */
const DZ_JUNK = new RegExp([
  'original (television |motion picture )?soundtrack', '\\bost\\b',
  'karaoke', 'tribute', '\\bcovers?\\b', '\\bremix(es|ed)?\\b',
  'greatest hits', '\\bbest of\\b', 'the essential', 'anthology', '\\bcollection\\b',
  '\\bhits\\b', '\\blive\\b', '\\bunplugged\\b', '\\bdemos\\b', '\\bkaraoke\\b',
  '(19|20)\\d{2}\\s*[-–]\\s*(19|20)\\d{2}',      // "1972 - 1980" — a compilation span
  '\\bthe .{2,30} story\\b',
].join('|'), 'i');
function dzGoodAlbum(al) {
  return !!al && !!al.title && (al.record_type || 'album') === 'album'
      && !DZ_JUNK.test(al.title);
}
/* Rank an artist's releases by Deezer's own `fans` count and keep the head of
   the list — the records people actually listen to — then draw randomly from
   that shortlist so two loads don't pick the same ones. */
function dzPickAlbums(list, n) {
  const good = (list || []).filter(dzGoodAlbum)
    .sort(function (a, b) { return (b.fans || 0) - (a.fans || 0); });
  return shuffled(good.slice(0, Math.max(n, n * 2))).slice(0, n);
}

/* Deal a fresh shelf: a few of the persona's own artists → Deezer's RELATED
   artists → the records those artists actually released. Two levels of
   randomness (which seeds, which of their neighbours) is what makes a reload
   feel like a different day rather than the same twenty albums. */
async function expandRecs() {
  if (!RECS_ENABLED) return 0;
  const gen = ++RECS_GEN;
  const added = await dzDeal(gen);
  /* ⚠️ Refresh from the ONE exit point. This used to sit at the bottom of the
     deal loop, which has several early returns — and hitting RECS_TARGET took
     one of them, so with a target the rails and feed were never refreshed and
     stayed on the persona's own albums. That is the actual "everything below
     the bento repeats" bug. */
  if (added) dzRefreshHome();
  return added;
}

// The deal itself. Returns how many albums it adopted; may bail early.
async function dzDeal(gen) {
  const own = (window.ARCHIVE || []).filter(function (a) { return a.artistId && !a._rec; });
  if (!own.length) return 0;
  let added = 0;
  const seen = {};
  const seeds = shuffled(own).slice(0, RECS_SEEDS);
  for (const s of seeds) {
    if (gen !== RECS_GEN) return added;                  // persona switched under us
    if ((window.ARCHIVE || []).length >= RECS_TARGET) return added;
    const rel = await dz('artist/' + s.artistId + '/related?limit=12');
    if (gen !== RECS_GEN) return added;
    const near = shuffled((((rel || {}).data) || []).filter(function (a) {
      if (!a.id || seen[a.id]) return false;
      seen[a.id] = 1; return true;
    })).slice(0, RECS_PER_SEED);

    // One seed's neighbours are fetched in PARALLEL — serially this took ~12s
    // to fill the shelf, which is long enough that the first swipes still see
    // the short catalogue. Deezer's limit is ~50 requests / 5s and a seed is
    // only RECS_PER_SEED of them, so the burst is well inside it.
    const lists = await Promise.all(near.map(function (ar) {
      return dz('artist/' + ar.id + '/albums?limit=20').then(function (r) { return { ar: ar, r: r }; });
    }));
    if (gen !== RECS_GEN) return added;
    lists.forEach(function (x) {
      const room = RECS_TARGET - (window.ARCHIVE || []).length;
      if (room <= 0) return;
      const good = dzPickAlbums(((x.r || {}).data) || [], RECS_PER_ARTIST);
      // Adopted per seed rather than in one batch at the end, so the queue
      // grows while the rest is still in flight.
      added += dzAdopt(good.map(function (al) { return dzRecord(al, x.ar); }).slice(0, room));
    });
  }
  return added;
}

/* The bento swipes through the widened shelf, but the feed UNDER it was built
   before the deal landed and stayed on the persona's own ~30 albums: it memoises
   into `_FEED`, and FRIEND_ACTIVITY is generated once per switch. So without
   this the part of home you see WITHOUT swiping showed the same handful of rows
   every single load — which reads as the whole screen repeating even though the
   queue behind it is fresh.
   Called once when a deal finishes, not per batch, so the feed doesn't churn
   under the user while it fills. */
function dzRefreshHome() {
  window._FEED = null;
  const p = window.ACTIVE_PERSONA && personaById(window.ACTIVE_PERSONA);
  if (p && typeof personaFeed === 'function') setFriendActivity(personaFeed(p));
  homeShells().forEach(function (s) {
    if (s.classList.contains('s-home-v3--review')) return;   // don't repaint an open album
    renderFriendFeed(s);
  });
}
window.expandRecs = expandRecs;

/* ── Search fallback ──────────────────────────────────────────────────────
   Runs alongside the local index, not instead of it: the persona's own records
   stay on top and Deezer fills in underneath. */
let SDS_REMOTE_T = 0;
function sdsRemoteSearch(q, ov) {
  clearTimeout(SDS_REMOTE_T);
  if (!q || q.length < 2) return;
  SDS_REMOTE_T = setTimeout(function () {
    Promise.all([
      dz('search/artist?limit=4&q=' + encodeURIComponent(q)),
      dz('search/album?limit=8&q=' + encodeURIComponent(q))
    ]).then(function (res) {
      const ar = res[0], al = res[1];
      const inp = ov.querySelector('.sds-input');
      if (!inp || inp.value.trim().toLowerCase() !== q) return;   // typed on since
      const resEl = ov.querySelector('.sds-results');
      if (!resEl) return;

      const last = ov._last || (ov._last = { artists: [], albums: [], songs: [] });
      const known = new Set((last.albums || []).map(function (a) {
        return dzKey(a.artist || (a.ref || {}).artist, a.album || (a.ref || {}).album);
      }));
      const knownArtists = new Set((last.artists || []).map(function (a) {
        return String(a.name || '').toLowerCase();
      }));

      const artists = (((ar || {}).data) || [])
        .filter(function (a) { return a.name && !knownArtists.has(a.name.toLowerCase()); })
        .map(function (a) {
          return { name: a.name, image: a.picture_xl || a.picture_big || '',
                   count: a.nb_album || 0, _dzArtist: { id: a.id, name: a.name } };
        });
      const albums = (((al || {}).data) || [])
        .filter(function (a) { return a.title && a.artist && !known.has(dzKey(a.artist.name, a.title)); })
        .map(function (a) {
          const rec = dzRecord(a, a.artist);
          return { album: rec.album, artist: rec.artist, image: rec.image, year: rec.year, ref: rec };
        });
      if (!artists.length && !albums.length) return;

      const aOff = (last.artists || []).length, bOff = (last.albums || []).length;
      last.artists = (last.artists || []).concat(artists);
      last.albums  = (last.albums || []).concat(albums);

      const rows =
        artists.map(function (a, i) {
          return '<button class="sds-row" data-type="artist" data-i="' + (aOff + i) + '">' +
            '<span class="sds-thumb sds-thumb--round" style="background-image:url(\'' + a.image + '\')"></span>' +
            '<span class="sds-row-main"><span class="sds-row-t">' + _sdsEsc(a.name) + '</span>' +
            '<span class="sds-row-s">Artist' + (a.count ? ' · ' + a.count + ' albums' : '') + '</span></span></button>';
        }).join('') +
        albums.map(function (a, i) {
          return '<button class="sds-row" data-type="album" data-i="' + (bOff + i) + '">' +
            '<span class="sds-thumb" style="background-image:url(\'' + a.image + '\')"></span>' +
            '<span class="sds-row-main"><span class="sds-row-t">' + _sdsEsc(a.album) + '</span>' +
            '<span class="sds-row-s">Album · <b>' + _sdsEsc(a.artist) + '</b>' +
            (a.year ? ' · ' + a.year : '') + '</span></span></button>';
        }).join('');

      const old = resEl.querySelector('.sds-sec--remote');
      if (old) old.remove();
      const empty = resEl.querySelector('.sds-empty');
      if (empty) empty.remove();
      resEl.insertAdjacentHTML('beforeend',
        '<div class="sds-sec sds-sec--remote"><div class="sds-sec-hd">More on Deezer</div>' + rows + '</div>');
    });
  }, 280);
}

/* Wrap the two openers so a fetched record behaves like a built-in one: an
   album fills in its missing metadata, and an artist we have never seen has
   their albums pulled into ARCHIVE first — openArtistPageFor builds the page by
   filtering ARCHIVE, so without that it would open an empty shell. */
const _sdsOpenResult = sdsOpenResult;
sdsOpenResult = function (type, i) {
  const ov = document.getElementById('sd-search');
  const last = (ov && ov._last) || {};
  const a = type === 'artist' ? (last.artists || [])[i] : null;
  if (a && a._dzArtist) {
    closeSearch();
    dz('artist/' + a._dzArtist.id + '/albums?limit=40').then(function (r) {
      // Same junk filter as the rec pool — a legacy act's raw album list is
      // half live records and compilations ("A Decade Of Steely Dan", "Gold").
      const raw = (((r || {}).data) || []);
      const good = raw.filter(dzGoodAlbum)
        .sort(function (x, y) { return (y.fans || 0) - (x.fans || 0); });
      dzAdopt((good.length ? good : raw).slice(0, 12)
        .map(function (al) { return dzRecord(al, a._dzArtist); }));
      window.openArtistPageFor(a._dzArtist.name);
    });
    return;
  }
  return _sdsOpenResult.call(this, type, i);
};

const _openAlbumPage = window.openAlbumPage;
window.openAlbumPage = function (album, pinnedReview) {
  const out = _openAlbumPage.apply(this, arguments);
  if (album && album._lite) {
    dzHydrate(album).then(function () {
      if (window.activeAlbum !== album) return;
      homeShells().forEach(function (s) { if (s._album === album) populateReviewPanel(s); });
    });
  }
  return out;
};

/* ── Rec box: the recommendation knobs, live ──────────────────────────────
   A strip along the bottom of the desktop viewer. It lives inside #viewer, so
   it is desktop-only for free — the mobile prototype hides that whole element.
   Changing a knob re-deals immediately, which is the point: the numbers are a
   feel decision and reading them off a diff is useless. */
const RECBOX_FIELDS = [
  { k: 'seeds',    label: 'Seeds',        min: 1, max: 20, get: () => RECS_SEEDS,      set: v => RECS_SEEDS = v,
    hint: 'your own artists used as starting points' },
  { k: 'perSeed',  label: 'Related /seed', min: 1, max: 20, get: () => RECS_PER_SEED,   set: v => RECS_PER_SEED = v,
    hint: 'neighbours pulled per seed artist' },
  { k: 'perArt',   label: 'Albums /artist', min: 1, max: 6, get: () => RECS_PER_ARTIST, set: v => RECS_PER_ARTIST = v,
    hint: 'keep at 1 for one album per artist' },
  { k: 'target',   label: 'Max queue',    min: 40, max: 400, step: 10, get: () => RECS_TARGET, set: v => RECS_TARGET = v,
    hint: 'ceiling on the whole shelf' },
];

function recBoxCounts() {
  const A = window.ARCHIVE || [];
  const recs = A.filter(function (a) { return a._rec; });
  const artists = new Set(recs.map(function (a) { return a.artist; }));
  return A.length + ' albums · ' + recs.length + ' recommended · ' +
         artists.size + ' new artists · ~' +
         (RECS_SEEDS * (1 + RECS_PER_SEED)) + ' requests';
}

function recBoxSync() {
  const el = document.getElementById('recbox');
  if (!el) return;
  el.querySelector('.rb-count').textContent = recBoxCounts();
  RECBOX_FIELDS.forEach(function (f) {
    const inp = el.querySelector('[data-k="' + f.k + '"]');
    if (inp && document.activeElement !== inp) inp.value = f.get();
    const out = el.querySelector('[data-v="' + f.k + '"]');
    if (out) out.textContent = f.get();
  });
  const t = el.querySelector('.rb-toggle');
  if (t) t.classList.toggle('on', !!RECS_ENABLED);
}

/* Drop everything fetched and deal again from scratch. `RECS_GEN` is bumped by
   expandRecs, so any deal still in flight drops its results on the floor
   instead of racing this one. */
async function recBoxRedeal(btn) {
  RECS_GEN++;
  const A = window.ARCHIVE || [];
  window.ARCHIVE = A.filter(function (a) { return !a._rec; });
  window.trendingAlbums = (window.trendingAlbums || []).filter(function (a) { return !a._rec; });
  if (window.featuredAlbum && window.featuredAlbum._rec) {
    window.featuredAlbum = window.ARCHIVE[0];
    window.activeAlbum = window.featuredAlbum;
  }
  window.SEARCH_INDEX = null;
  if (btn) btn.classList.add('rb-busy');
  recBoxSync();
  await expandRecs();
  if (btn) btn.classList.remove('rb-busy');
  recBoxSync();
  renderViewer();
}

function initRecBox() {
  const viewer = document.getElementById('viewer');
  if (!viewer || document.getElementById('recbox')) return;
  const el = document.createElement('div');
  el.id = 'recbox';
  el.innerHTML =
    '<button class="rb-toggle" title="Turn the recommendation pool on or off">Recs</button>' +
    RECBOX_FIELDS.map(function (f) {
      return '<label class="rb-field" title="' + f.hint + '">' +
        '<span class="rb-lbl">' + f.label + '</span>' +
        '<input type="range" data-k="' + f.k + '" min="' + f.min + '" max="' + f.max +
        '" step="' + (f.step || 1) + '" value="' + f.get() + '">' +
        '<span class="rb-val" data-v="' + f.k + '">' + f.get() + '</span></label>';
    }).join('') +
    '<button class="rb-go">Re-deal</button>' +
    '<span class="rb-count"></span>';
  viewer.appendChild(el);

  el.querySelectorAll('input[type="range"]').forEach(function (inp) {
    inp.addEventListener('input', function () {
      const f = RECBOX_FIELDS.find(function (x) { return x.k === inp.dataset.k; });
      if (!f) return;
      f.set(+inp.value);
      recBoxSync();
    });
    // Re-deal on release rather than on every tick of the slider — dragging
    // Seeds from 2 to 14 would otherwise fire a dozen deals at the API.
    inp.addEventListener('change', function () { recBoxRedeal(el.querySelector('.rb-go')); });
  });
  el.querySelector('.rb-toggle').addEventListener('click', function () {
    RECS_ENABLED = !RECS_ENABLED;
    recBoxSync();
    recBoxRedeal(el.querySelector('.rb-go'));
  });
  el.querySelector('.rb-go').addEventListener('click', function (e) { recBoxRedeal(e.currentTarget); });
  recBoxSync();
  setInterval(recBoxSync, 1200);   // the first deal lands a few seconds in
}

document.addEventListener('DOMContentLoaded', init);
