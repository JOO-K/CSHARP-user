/* ============================================================
   MORPH — the shared-element transition (csharpuser, 2026-09-26).
   Eric: "a clean transition from screen to screen, but not the swipe —
   when you click on the album it grows larger, when you click on the
   profile it fills where it's supposed to go". So: the thing you tapped
   glides into the place it has on the next screen. A cover on the deck,
   a tile on the wall, the record on a feed card → the album page's cover.
   A face or a name → the profile card's picture. Back from the album page
   → the cover shrinks to where it came from.

   HOW: `sdMorph(src, findDest, go)` remembers the source's box and image,
   runs the navigation (`go`), waits for the destination element to exist
   with a size (polled for up to 700ms — a cross-screen navigate renders in
   a frame or two), hides it, glides a body-level fixed clone from box to
   box (left/top/width/height/border-radius, 380ms), then reveals the
   destination and drops the clone. Boxes are `getBoundingClientRect`s, so
   the viewer's zoom and the phone's scale are already in them, and the
   clone lives on <body>, outside both.
   ⚠ The album page's own cover transitions (`.s-home-v3--review .v3-album`
   slides left/top/width) would make the destination box a moving target:
   `enterAlbumPageState` puts `.sd-morphing` on the shell while a morph is
   in flight and app.css switches those transitions off under it.
   Loads after app.js; app.js only calls in through `typeof sdMorph`.
   Reduced motion, a missing source or a destination that never shows up:
   the navigation simply happens.
   ============================================================ */
(function () {
  const DUR = 380, EASE = 'cubic-bezier(.2, .8, .2, 1)';
  let live = null;
  const rect = el => { const r = el.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; };
  const bgOf = el => { if (!el) return ''; const b = getComputedStyle(el).backgroundImage; return b && b !== 'none' ? b : ''; };
  // The image on the element, or on the first child that carries one (the deck's face is a layer inside its circle).
  const imgOf = el => bgOf(el) || bgOf(el.querySelector && el.querySelector('[style*="background-image"]'));

  window.sdMorph = function (src, findDest, go, opts) {
    opts = opts || {};
    if (!src || !src.getBoundingClientRect || matchMedia('(prefers-reduced-motion: reduce)').matches) { go(); return; }
    const from = rect(src);
    if (!from.w || !from.h) { go(); return; }
    const img = imgOf(src), r0 = getComputedStyle(src).borderRadius;
    if (live) { live.remove(); live = null; }
    window._sdMorph = true;
    try { go(); } finally { setTimeout(() => { window._sdMorph = false; }, 800); }
    const t0 = performance.now();
    const tick = () => {
      const dest = findDest();
      if (!dest || !dest.getBoundingClientRect().width) { if (performance.now() - t0 < 700) requestAnimationFrame(tick); return; }
      const to = rect(dest);
      const image = (opts.destImage !== false && bgOf(dest)) || img;
      const ghost = document.createElement('div');
      ghost.className = 'sd-morph';
      ghost.style.cssText = `position:fixed;left:${from.x}px;top:${from.y}px;width:${from.w}px;height:${from.h}px;border-radius:${r0};`
        + `background:${image ? image + ' center / cover no-repeat' : '#222'};z-index:100000;pointer-events:none;`
        + `box-shadow:0 12px 40px rgba(0,0,0,.45);`
        + `transition:left ${DUR}ms ${EASE},top ${DUR}ms ${EASE},width ${DUR}ms ${EASE},height ${DUR}ms ${EASE},border-radius ${DUR}ms ${EASE}`;
      document.body.appendChild(ghost); live = ghost;
      const r1 = getComputedStyle(dest).borderRadius;
      dest.style.visibility = 'hidden';
      void ghost.offsetWidth;
      ghost.style.left = to.x + 'px'; ghost.style.top = to.y + 'px'; ghost.style.width = to.w + 'px'; ghost.style.height = to.h + 'px'; ghost.style.borderRadius = r1;
      setTimeout(() => { dest.style.visibility = ''; ghost.remove(); if (live === ghost) live = null; }, DUR + 30);
    };
    requestAnimationFrame(tick);
  };

  // The album page's cover, on whichever shell is showing it.
  window.sdFindAlbumCover = () => document.querySelector('#phone-container .s-home-v3--album .v3-album, #mobile-content .s-home-v3--album .v3-album');
  // The profile card's picture.
  window.sdFindProfilePic = () => document.querySelector('#phone-container .s-prof2 .prof-pic, #mobile-content .s-prof2 .prof-pic');
  // Where a cover came from, for Back: the deck's front card on a home shell, or the wall tile naming the album.
  window.sdFindCoverHome = album => {
    const home = document.querySelector('#phone-container .s-home-v3:not(.s-home-v3--review), #mobile-content .s-home-v3:not(.s-home-v3--review)');
    const card = home && home.querySelector(`.v3-fb-card[data-i="${home._fbCur || 0}"]`);
    if (card) return card;
    if (!album) return null;
    const tiles = [...document.querySelectorAll('#phone-container .wall2-cell, #mobile-content .wall2-cell')];
    const t = tiles.find(c => c.dataset.alb === album.album && (!c.dataset.art || c.dataset.art === album.artist));
    return t ? (t.querySelector('.wall2-art') || t) : null;
  };
})();
