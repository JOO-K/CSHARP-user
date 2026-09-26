/* ============================================================
   PATCH NOTES + FEEDBACK — the user-testing chrome (csharpuser, 2026-09-25).
   Eric: "we are reappropriating this website to be more about user testing
   … replace [the dev stuff] with patchnotes in the upper left with a
   feedback button next to it". Two buttons in the toolbar's left section
   (index.html) open two popovers built here. Desktop viewer only; loads
   last and touches nothing in app.js.

   The dev toolbar, the left page rail and the recs bar are still in the
   page — `?tools` on the URL brings them back (body.sd-tools, app.js), the
   same switch the mobile side already had.

   ADDING A NOTE: put a new entry at the TOP of PATCH_NOTES. `date` is shown
   as written; `items` are one line each, in tester language (what changed
   for the person holding the phone, not how). The newest entry is marked.
   ============================================================ */

const PATCH_NOTES = [
  {
    date: '25 Sep 2026',
    title: 'Simpler, calmer',
    items: [
      'Plain line icons everywhere — the dot-matrix icons, the belt heart and the pulley bubble are gone.',
      'The blue POPULAR REVIEW ribbon is gone; nothing wraps round a face any more.',
      'Almost nothing moves on its own now: no spinning records, scrolling quotes, pulsing dots or blinking cursors.',
      'Profile has a Picks section — Favourite songs · Listened · Listen later — between the stats and the pinned reviews.',
      'Dev tools are out of the viewer. This panel and the Feedback button replace them.',
    ],
  },
  {
    date: '24 Sep 2026',
    title: 'The review sheet',
    items: [
      'Tap a friend’s review under the deck to open it as a sheet with its comments and a place to reply.',
      'Short reviews (two lines or fewer) sit centred; longer ones keep their left edge, with View more.',
      'Popular community reviews are dealt into the friends deck now and then.',
    ],
  },
  {
    date: '23 Sep 2026',
    title: 'Home is your friends',
    items: [
      'Home shows a deck of your friends’ recent reviews — swipe the covers to move through them.',
      'Search has its own button in the bottom bar: Home · Search · Trending · Profile.',
      'The bottom bar is a plain pill; the CD console still opens up out of it.',
    ],
  },
  {
    date: '22 Sep 2026',
    title: 'Reviews only',
    items: [
      'This build is about reviews. The Shop, Playlists and the "friends listening now" ticker are gone.',
      'Profile is your card, your stats, your pinned reviews and your review history.',
      'The Album Wall (Trending) stays.',
    ],
  },
];

/* Where feedback goes. Set FEEDBACK_TO to an email address and Send opens a
   prefilled mail; leave it empty and Send copies the note to the clipboard
   for the tester to paste wherever they talk to you. */
const FEEDBACK_TO = '';

(function () {
  const $ = id => document.getElementById(id);

  function closeAll(except) {
    ['tn-pop', 'fb-pop'].forEach(id => { if (id !== except) { const p = $(id); if (p) p.hidden = true; } });
    ['btn-patchnotes', 'btn-feedback'].forEach(id => { const b = $(id); if (b) b.classList.toggle('on', !!except && b.dataset.pop === except); });
  }

  function renderNotes() {
    const body = $('tn-body');
    if (!body || body.dataset.done) return;
    body.innerHTML = PATCH_NOTES.map((n, i) => `
      <section class="tn-entry${i === 0 ? ' tn-entry--new' : ''}">
        <header class="tn-entry-hd">
          <span class="tn-date">${n.date}</span>
          <span class="tn-title">${n.title}</span>
          ${i === 0 ? '<span class="tn-new">new</span>' : ''}
        </header>
        <ul class="tn-list">${n.items.map(t => `<li>${t}</li>`).join('')}</ul>
      </section>`).join('');
    body.dataset.done = '1';
  }

  window.togglePatchNotes = function () {
    const pop = $('tn-pop');
    if (!pop) return;
    const open = pop.hidden;
    closeAll(open ? 'tn-pop' : null);
    if (open) { renderNotes(); pop.hidden = false; }
  };

  window.toggleFeedback = function () {
    const pop = $('fb-pop');
    if (!pop) return;
    const open = pop.hidden;
    closeAll(open ? 'fb-pop' : null);
    if (open) {
      pop.hidden = false;
      const ta = $('fb-text');
      if (ta) setTimeout(() => ta.focus(), 30);
      const st = $('fb-status');
      if (st) st.textContent = '';
    }
  };

  // What the tester was looking at, so a note like "the button does nothing"
  // arrives with the screen it was about.
  function context() {
    const scr = (typeof SCREENS !== 'undefined' && typeof currentIdx !== 'undefined' && SCREENS[currentIdx]) ? SCREENS[currentIdx].name : '';
    const who = window.ACTIVE_PERSONA || '';
    const bits = [];
    if (scr) bits.push('Screen: ' + scr);
    if (who) bits.push('Persona: ' + who);
    bits.push('Build: ' + (PATCH_NOTES[0] ? PATCH_NOTES[0].date : ''));
    return bits.join(' · ');
  }

  window.sendFeedback = function (btn) {
    const ta = $('fb-text'), st = $('fb-status');
    const text = (ta && ta.value || '').trim();
    if (!text) { if (st) st.textContent = 'Write something first.'; if (ta) ta.focus(); return; }
    const body = text + '\n\n— ' + context();
    if (FEEDBACK_TO) {
      location.href = 'mailto:' + FEEDBACK_TO + '?subject=' + encodeURIComponent('Spindeck feedback') + '&body=' + encodeURIComponent(body);
      if (st) st.textContent = 'Opening your mail app…';
      return;
    }
    const done = () => { if (st) st.textContent = 'Copied — paste it to Eric.'; };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(body).then(done, () => fallbackCopy(body, done));
    else fallbackCopy(body, done);
  };
  function fallbackCopy(s, done) {
    const t = document.createElement('textarea');
    t.value = s; t.style.position = 'fixed'; t.style.opacity = '0';
    document.body.appendChild(t); t.select();
    try { document.execCommand('copy'); } catch (e) {}
    t.remove(); done();
  }

  /* ── THE TESTER RAIL ──────────────────────────────────────────
     Five pages down the left, centred. The one on screen is lit. Onboarding
     unfolds its steps under itself while you are in it, the current step lit,
     and a tap on a step jumps straight to it. Re-rendered on every viewer
     render (app.js's renderPageNav calls in) and polled lightly, because the
     phone changes screen — search opens, a step advances — without telling
     the viewer. */
  const RAIL = [
    { id: 'onboarding', label: 'Onboarding', go: () => window.navPage('onboarding') },
    { id: 'home',       label: 'Home',       go: () => window.navPage('home') },
    { id: 'search',     label: 'Search',     go: () => window.navPage('search') },
    { id: 'trending',   label: 'Trending',   go: () => window.navPage('wall') },
    { id: 'profile',    label: 'Profile',    go: () => window.navPage('profile') },
  ];
  const OB_LABELS = ['Handle', 'Bring your music', 'Share listening', 'Genres', 'Artists', 'Albums', 'People', 'Profile'];

  function railActive() {
    const ov = document.getElementById('sd-search');
    if (ov && ov.classList.contains('open')) return 'search';
    const s = (typeof SCREENS !== 'undefined' && typeof currentIdx !== 'undefined') ? SCREENS[currentIdx] : null;
    const id = s ? s.id : '';
    if (id === 'wall') return 'trending';
    if (id === 'profile' || id === 'profile-edit') return 'profile';
    if (id === 'onboarding' || id === 'home' || id === 'search') return id;
    return '';
  }
  let railKey = '';
  window.renderTestNav = function () {
    const nav = $('test-nav');
    if (!nav) return;
    const active = railActive();
    const steps = (active === 'onboarding' && typeof obActiveSteps === 'function') ? obActiveSteps() : [];
    const step = (typeof OB !== 'undefined') ? OB.step : -1;
    const key = active + '|' + steps.join(',') + '|' + step;
    if (key === railKey) return;
    railKey = key;
    nav.innerHTML = RAIL.map(r => `
      <button class="tnav-btn${r.id === active ? ' active' : ''}" type="button" data-id="${r.id}">${r.label}</button>` +
      (r.id === 'onboarding' && steps.length ? `<div class="tnav-steps">${steps.map((k, i) =>
        `<button class="tnav-step${k === step ? ' active' : ''}" type="button" data-step="${k}"><span class="n">${i + 1}</span>${OB_LABELS[k] || 'Step'}</button>`).join('')}</div>` : '')
    ).join('');
  };
  document.addEventListener('click', e => {
    const b = e.target.closest('#test-nav .tnav-btn, #test-nav .tnav-step');
    if (!b) return;
    if (b.dataset.id) { const r = RAIL.find(x => x.id === b.dataset.id); if (r) r.go(); }
    else if (b.dataset.step != null) {
      const k = +b.dataset.step;
      if (railActive() !== 'onboarding') window.navPage('onboarding');
      if (typeof OB !== 'undefined') OB.step = k;
      if (typeof obSync === 'function') obSync();
      if (typeof obScrollTop === 'function') obScrollTop();
      if (typeof obMixArrive === 'function') obMixArrive();
    }
    window.renderTestNav();
  });
  setInterval(() => { if (document.body.classList.contains('sd-tools')) return; window.renderTestNav(); }, 400);

  // A click anywhere outside the open popover (or Esc) shuts it.
  document.addEventListener('click', e => {
    if (e.target.closest('#tn-pop, #fb-pop, #btn-patchnotes, #btn-feedback')) return;
    closeAll(null);
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(null); });
})();
