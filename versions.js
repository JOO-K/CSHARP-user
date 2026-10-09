/* ============================================================
   VERSIONS — the "+" above the corner's sessions link (csharpuser,
   2026-09-28). Eric: "a different version but not put it up on the website
   for people to try, just me … above sessions can i get a + and if i press
   that i can go thru versions so 0.1 now 0.11 is next and id like to work
   on the 0.11 while preserving the 0.1".

   The site's own folder is ROOT_VERSION — what GitHub Pages serves and the
   testers use. Every other version is a folder under versions/ (a git
   worktree on its own branch; main ignores versions/, so it is never
   deployed). This file is identical in every version: it reads where it is
   from the URL.

   PRIVATE BY CONSTRUCTION: the "+" is only built on a local address
   (localhost, 127.*, a LAN address, file:), and only lists the versions
   that actually answer. On the public site it does nothing at all.

   ADDING A VERSION: `git worktree add versions/0.14 -b v0.14` from the
   site's folder, then add '0.14' to WIP_VERSIONS and ORDER in every copy of
   this file.

   LANDING ONE: when a version merges into main it becomes the root. Set
   ROOT_VERSION to its name, take it OUT of WIP_VERSIONS (it has no versions/
   folder any more) and leave it in ORDER — then give the version it REPLACES
   a worktree of its own (`git worktree add versions/0.13 v0.13`) and add that
   one to WIP_VERSIONS, or it drops out of the menu with nothing to point at.
   Forgetting the first half is how the root went on calling itself 0.1 for
   three versions; forgetting the second is how '0.13' sat in the menu for a
   day resolving to a 404.

   Desktop viewer only; loads last and touches nothing in app.js.
   ============================================================ */

(function () {
  /* ROOT_VERSION is the NAME OF WHATEVER IS IN THE ROOT FOLDER — i.e. of
     `main` — so it changes every time a version lands there. It read '0.1'
     until 2026-10-08, long after main had gone 0.11 → 0.12 → 0.13: the
     switcher called the root 0.1, and clicking "0.1" opened 0.13's code.
     Nothing named 0.1 is preserved anywhere — the root advanced IN PLACE —
     so '0.1' is gone from the lists rather than pointing at a lie.
     2026-10-09: 0.14 was folded into main, so the ROOT IS 0.14 and 0.13 is
     now a real frozen worktree at versions/0.13 — which is why 0.13 moved
     INTO WIP_VERSIONS and 0.14 moved out of it.
     ⚠ Whatever ROOT_VERSION names must NOT be in WIP_VERSIONS: that list
     means "there is a versions/<name>/ folder". '0.13' sat in it for a day
     while 0.13 was still the root and no such folder existed, so `exists`
     HEAD-ed a 404 and silently dropped it from the menu. */
  const ROOT_VERSION = '0.14';
  const WIP_VERSIONS = ['-1', '-0.1', '-0.11', '0.11', '0.12', '0.13'];
  // The order the list is shown in, oldest first. -0.1 is the ORIGINAL app
  // (c-sharp, before the review-only fork), brought in on 2026-09-28.
  // ⚠ ROOT_VERSION has to appear here too, in its chronological place, or it
  // sorts to the end: anything missing from ORDER gets index 99.
  const ORDER = ['-1', '-0.1', '-0.11', '0.11', '0.12', '0.13', '0.14'];   // -1 (2026-10-01): the original c-sharp app at 1c44670, untouched. -0.11 (2026-09-29): -0.1 with one For You card, no stack

  const isFile = location.protocol === 'file:';
  const isLocal = isFile ||
    /^(localhost$|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1\]?$)/.test(location.hostname);
  if (!isLocal) return;

  // Where are we? …/versions/<v>/index.html is that version; anything else is the root.
  const m = location.pathname.match(/^(.*\/)versions\/([^/]+)\//);
  const root = m ? m[1] : location.pathname.replace(/[^/]*$/, '');
  const here = m ? decodeURIComponent(m[2]) : ROOT_VERSION;
  const urlOf = v => root + (v === ROOT_VERSION ? '' : 'versions/' + encodeURIComponent(v) + '/') +
    'index.html' + location.search;

  // Only list what is really there. fetch cannot read file:, so there it lists everything.
  const exists = v => (isFile || v === here) ? Promise.resolve(true)
    : fetch(urlOf(v), { method: 'HEAD', cache: 'no-store' }).then(r => r.ok, () => false);

  function build(list) {
    if (list.length < 2) return;
    const link = document.querySelector('.sd-sessions-link');
    const host = (link && link.parentNode) || document.getElementById('viewer');
    if (!host) return;

    const wrap = document.createElement('div');
    wrap.className = 'sd-ver';
    wrap.innerHTML =
      '<div class="sd-ver-menu" hidden>' +
        list.map(v =>
          '<a class="sd-ver-it' + (v === here ? ' is-here' : '') + '" href="' + urlOf(v) + '">' + v + '</a>'
        ).join('') +
      '</div>' +
      '<span class="sd-ver-now">' + here + '</span>' +
      '<button class="sd-ver-btn" type="button" title="Versions" aria-label="Versions">+</button>';
    host.insertBefore(wrap, link || null);

    const menu = wrap.querySelector('.sd-ver-menu');
    const open = on => { menu.hidden = !on; wrap.classList.toggle('is-open', on); };
    wrap.querySelector('.sd-ver-btn').addEventListener('click', () => open(menu.hidden));
    menu.addEventListener('click', e => {
      const it = e.target.closest('.sd-ver-it');
      if (it && it.classList.contains('is-here')) { e.preventDefault(); open(false); }
    });
    document.addEventListener('click', e => { if (!wrap.contains(e.target)) open(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') open(false); });

    if (here !== ROOT_VERSION) document.title += ' · ' + here;
  }

  const all = [ROOT_VERSION].concat(WIP_VERSIONS)
    .sort((a, b) => (ORDER.indexOf(a) + 1 || 99) - (ORDER.indexOf(b) + 1 || 99));
  const go = () => Promise.all(all.map(exists)).then(ok => build(all.filter((v, i) => ok[i])));
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go);
  else go();
})();
