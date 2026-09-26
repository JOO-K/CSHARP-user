/* ============================================================
   FEEDBACK — the user-testing chrome (csharpuser, 2026-09-25; cut down
   2026-09-26: the Patch notes panel and the tester's page rail are gone —
   "lets just make it so the feedback box that pops up has no text, just a
   textbox and post"). PATCH_NOTES stays as data: its top date is the build
   tag on every recording and every note.
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

  function closeAll() {
    const p = $('fb-pop'); if (p) p.hidden = true;
    const b = $('btn-feedback'); if (b) b.classList.remove('on');
  }

  window.toggleFeedback = function () {
    const pop = $('fb-pop');
    if (!pop) return;
    const open = pop.hidden;
    closeAll();
    if (open) {
      pop.hidden = false;
      const b = $('btn-feedback'); if (b) b.classList.add('on');
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

  /* POST (Eric, 2026-09-26): the note goes into the tester's session — a
     `feedback` line in the transcript, uploaded at once (recorder.js exposes
     sdRecPost while it records). Not recording (?tools, ?norec, blocked) →
     the old ways: a prefilled mail if FEEDBACK_TO is set, else the clipboard. */
  window.sendFeedback = function (btn) {
    const ta = $('fb-text'), st = $('fb-status');
    const text = (ta && ta.value || '').trim();
    if (!text) { if (st) st.textContent = 'Write something first.'; if (ta) ta.focus(); return; }
    if (window.sdRecPost && window.sdRecPost(text)) {
      if (st) st.textContent = 'Posted.';
      if (ta) ta.value = '';
      setTimeout(closeAll, 700);
      return;
    }
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

  // A click anywhere outside the open popover (or Esc) shuts it.
  document.addEventListener('click', e => {
    if (e.target.closest('#fb-pop, #btn-feedback')) return;
    closeAll();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });
})();
