/* FESTIVAL TAGS (csharpuserlive, 2026-10-20; brought into csharpuser 2026-10-23 —
   Eric: "update the tags in the profile to be like the tags in csharpuserlive so
   u can add festivals uve been to … edit tags not from just edit profile but also
   by pressing the tags". Same file; the one change is that your own tag row is a
   button now. There are no accounts here, so PROFILE.tags lives in memory like
   every other profile edit — `sdPushProfile` is the live copy's and is skipped.)
   Eric: "get rid of tags on the profile and have a tag+ button pill that u can
   press to add tags yourself, just add the latest festivals and let them pick
   the year — try to be accurate".

   On YOUR profile the tags are only the ones you added: festival + year, as
   `fest:<slug>:<year>` ids in PROFILE.tags (synced to the account like every
   other profile field). Friends' profiles keep the seeded tags from screens.js.

   ⚠ `years` lists only editions that actually HAPPENED — cancelled years
   (2020/21 for most, Glastonbury's fallow 2018 and 2026, Bonnaroo's flooded
   2021…) are left out, so nobody can claim one that never ran. Lists end at the
   last edition known to have run; extend them as new editions happen. */
(function () {
  const yrs = (from, to, skip = []) => {
    const out = [];
    for (let y = to; y >= from; y--) if (skip.indexOf(y) < 0) out.push(y);
    return out;                                  // newest first
  };
  const FESTS = [
    { slug: 'coachella',   name: 'Coachella',            tint: '232,168,60',  tex: 'flower',   years: yrs(2016, 2026, [2020, 2021]) },
    { slug: 'glastonbury', name: 'Glastonbury',          tint: '124,168,120', tex: 'rain',     years: yrs(2016, 2025, [2018, 2020, 2021]) },
    { slug: 'lollapalooza',name: 'Lollapalooza',         tint: '224,97,111',  tex: 'stripe',   years: yrs(2016, 2026, [2020]) },
    { slug: 'primavera',   name: 'Primavera Sound',      tint: '91,124,196',  tex: 'halftone', years: yrs(2016, 2026, [2020, 2021]) },
    { slug: 'govball',     name: 'Governors Ball',       tint: '79,168,160',  tex: 'stripe',   years: yrs(2016, 2026, [2020]) },
    { slug: 'bonnaroo',    name: 'Bonnaroo',             tint: '200,73,47',   tex: 'concrete', years: yrs(2016, 2026, [2020, 2021]) },
    { slug: 'outsidelands',name: 'Outside Lands',        tint: '124,168,120', tex: 'haze',     years: yrs(2016, 2026, [2020]) },
    { slug: 'acl',         name: 'Austin City Limits',   tint: '232,168,60',  tex: 'paper',    years: yrs(2016, 2026, [2020]) },
    { slug: 'edc',         name: 'EDC Las Vegas',        tint: '168,124,196', tex: 'stars',    years: yrs(2016, 2026, [2020]) },
    { slug: 'tomorrowland',name: 'Tomorrowland',         tint: '168,124,196', tex: 'stars',    years: yrs(2016, 2026, [2020, 2021]) },
    { slug: 'readingleeds',name: 'Reading & Leeds',      tint: '200,73,47',   tex: 'tape',     years: yrs(2016, 2026, [2020]) },
    { slug: 'roskilde',    name: 'Roskilde',             tint: '224,97,111',  tex: 'paper',    years: yrs(2016, 2026, [2020, 2021]) },
    { slug: 'sonar',       name: 'Sónar',                tint: '91,124,196',  tex: 'halftone', years: yrs(2016, 2026, [2020, 2021]) },
    { slug: 'fujirock',    name: 'Fuji Rock',            tint: '79,168,160',  tex: 'rain',     years: yrs(2016, 2026, [2020]) },
    { slug: 'pitchfork',   name: 'Pitchfork Music Fest', tint: '184,188,198', tex: 'metal',    years: yrs(2016, 2024, [2020]) },
    { slug: 'splendour',   name: 'Splendour in the Grass', tint: '124,168,120', tex: 'flower', years: yrs(2016, 2024, [2020, 2021]) },
  ];
  window.SD_FESTS = FESTS;
  const MAX = 5;
  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  // A tag id → a chip object (the shape tagChip draws), or null.
  function festTag(id) {
    const m = /^fest:([a-z]+):(\d{4})$/.exec(String(id));
    if (!m) return null;
    const f = FESTS.find(x => x.slug === m[1]);
    if (!f || f.years.indexOf(+m[2]) < 0) return null;
    return { id, label: f.name + ' ' + m[2], tint: f.tint, tex: f.tex, rare: true };
  }
  const own = () => !window.PROFILE_GUEST;
  // On the Edit profile page this is the draft (Save commits it); elsewhere PROFILE.
  const target = () => (typeof profFavTarget === 'function' ? profFavTarget() : window.PROFILE) || {};
  const myTags = () => ((target().tags) || []).filter(festTag);

  // Filled (collectible) look for festival chips too.
  window.tagChip = t =>
    `<span class="prof-tag${(t.price || t.rare) ? ' prof-tag--rare' : ''}${sdTagTex(t)}" style="--tint:${t.tint}">${esc(t.label)}</span>`;

  const _profTags = window.profTags;
  window.profTags = function (P) {
    if (own()) return ((P && P.tags) || []).map(festTag).filter(Boolean).slice(0, MAX);
    return _profTags(P);
  };

  const addPill = '<button class="prof-tag-add" onclick="event.stopPropagation(); openFestPicker()">+ Tag</button>';
  window.profTagsHtml = function (P) {
    const tags = profTags(P);
    if (!own()) return tags.length ? `<div class="prof-tags">${tags.map(tagChip).join('')}</div>` : '';
    // csharpuser: pressing your tags opens the picker too, not only + Tag / Edit profile.
    return `<div class="prof-tags prof-tags--mine" role="button" title="Edit tags" onclick="event.stopPropagation(); openFestPicker()">${tags.map(tagChip).join('')}${tags.length < MAX ? addPill : ''}</div>`;
  };
  // Edit profile's Tags row shows the same chips.
  window.pfeTagChips = function (P) {
    const tags = ((P && P.tags) || []).map(festTag).filter(Boolean);
    return (tags.length ? tags.map(tagChip).join('') : '<span class="pfe-tags-ph">Add a festival</span>') + '<span class="pfe-add-plus">+</span>';
  };
  // …and its button opens the festival sheet instead of the old tag sheet.
  const _openEd = window.openProfEditor;
  window.openProfEditor = function (kind) {
    if (kind === 'tag') return openFestPicker();
    return _openEd.apply(this, arguments);
  };

  /* ── The sheet ─────────────────────────────────────────────────────────── */
  let open = null;   // the festival whose years are showing
  function sheet() {
    let ov = document.getElementById('sd-fest');
    if (!ov) {
      ov = document.createElement('div');
      ov.id = 'sd-fest'; ov.className = 'sd-fest-ov';
      ov.addEventListener('click', e => { if (e.target === ov) closeFestPicker(); });
      document.body.appendChild(ov);
    }
    return ov;
  }
  function paint() {
    const ov = document.getElementById('sd-fest'); if (!ov) return;
    const mine = myTags();
    const full = mine.length >= MAX;
    const chips = mine.map(id => {
      const t = festTag(id);
      return `<button class="sd-fest-mine" style="--tint:${t.tint}" onclick="festRemove('${id}')">${esc(t.label)} <i>×</i></button>`;
    }).join('');
    const rows = FESTS.map(f => {
      const isOpen = open === f.slug;
      const years = isOpen ? `<div class="sd-fest-years">${f.years.map(y => {
        const id = `fest:${f.slug}:${y}`, on = mine.indexOf(id) >= 0;
        return `<button class="sd-fest-yr${on ? ' on' : ''}" ${!on && full ? 'disabled' : ''} onclick="festToggle('${id}')">${y}</button>`;
      }).join('')}</div>` : '';
      return `<div class="sd-fest-row${isOpen ? ' open' : ''}">
        <button class="sd-fest-name" onclick="festOpen('${f.slug}')"><span class="sd-fest-dot" style="background:rgb(${f.tint})"></span>${esc(f.name)}<span class="sd-fest-car">${isOpen ? '−' : '+'}</span></button>
        ${years}</div>`;
    }).join('');
    ov.innerHTML = `
      <div class="sd-fest-sheet">
        <div class="sd-fest-grab"></div>
        <div class="sd-fest-hd"><span>Festivals you went to</span><button class="sd-fest-done" onclick="closeFestPicker()">Done</button></div>
        <div class="sd-fest-sub">${mine.length ? '' : 'Pick a festival, then the year you went. '}Up to ${MAX}.</div>
        ${chips ? `<div class="sd-fest-mines">${chips}</div>` : ''}
        <div class="sd-fest-list">${rows}</div>
      </div>`;
  }
  // Repaint the tag row in place (no full re-render — the sheet stays up).
  function syncProfile() {
    document.querySelectorAll('.prof-head .prof-tags').forEach(el => { el.outerHTML = profTagsHtml(window.PROFILE); });
    document.querySelectorAll('.s-pfedit .pfe-tags').forEach(el => { el.innerHTML = pfeTagChips(target()); });
  }
  function save(tags) {
    const T = target();
    T.tags = tags;
    if (T === window.PROFILE && window.sdPushProfile) sdPushProfile();   // the draft waits for Save
    paint(); syncProfile();
  }
  window.openFestPicker = function () {
    open = null;
    const ov = sheet(); paint();
    requestAnimationFrame(() => ov.classList.add('on'));
  };
  window.closeFestPicker = function () {
    const ov = document.getElementById('sd-fest'); if (!ov) return;
    ov.classList.remove('on');
    setTimeout(() => { if (!ov.classList.contains('on')) ov.innerHTML = ''; }, 250);
  };
  window.festOpen = function (slug) { open = open === slug ? null : slug; paint(); };
  window.festToggle = function (id) {
    const t = myTags(), i = t.indexOf(id);
    if (i >= 0) t.splice(i, 1); else if (t.length < MAX) t.push(id); else return;
    save(t);
  };
  window.festRemove = function (id) { save(myTags().filter(x => x !== id)); };

  const css = document.createElement('style');
  css.textContent = `
  .prof-tag-add { display:inline-flex; align-items:center; height:24px; padding:0 11px; border-radius:99px;
    border:1px dashed rgba(232,226,214,.35); background:none; color:inherit; opacity:.8;
    font:600 11px var(--font-main, 'DM Sans'), sans-serif; cursor:pointer; }
  .s-home-v3--light .prof-tag-add { border-color: rgba(26,18,8,.3); }
  .prof-tags--mine, .prof-tags--mine .prof-tag { cursor:pointer; }
  .sd-fest-ov { position:fixed; inset:0; z-index:9999; background:rgba(0,0,0,0); pointer-events:none; transition:background .25s; }
  .sd-fest-ov.on { background:rgba(0,0,0,.5); pointer-events:auto; }
  .sd-fest-sheet { position:absolute; left:8px; right:8px; bottom:8px; max-height:82%; overflow-y:auto;
    background:#1c1c22; color:#e8e2d6; border-radius:22px; padding:10px 16px 20px;
    transform:translateY(110%); transition:transform .28s cubic-bezier(.2,0,0,1); font-family:'DM Sans', sans-serif; }
  .sd-fest-ov.on .sd-fest-sheet { transform:none; }
  .sd-fest-grab { width:38px; height:4px; border-radius:2px; background:rgba(232,226,214,.25); margin:0 auto 10px; }
  .sd-fest-hd { display:flex; align-items:center; justify-content:space-between; font-weight:800; font-size:17px; }
  .sd-fest-done { background:#e8a83c; color:#1a1208; border:0; border-radius:99px; padding:7px 14px; font:700 13px 'DM Sans', sans-serif; cursor:pointer; }
  .sd-fest-sub { font-size:12px; color:rgba(232,226,214,.55); margin:4px 0 10px; }
  .sd-fest-mines { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:12px; }
  .sd-fest-mine { border:0; border-radius:99px; padding:6px 11px; font:700 12px 'DM Sans', sans-serif; cursor:pointer;
    background:rgba(var(--tint),.9); color:#1a1208; }
  .sd-fest-mine i { font-style:normal; opacity:.6; margin-left:3px; }
  .sd-fest-row { border-top:1px solid rgba(232,226,214,.08); }
  .sd-fest-name { width:100%; display:flex; align-items:center; gap:10px; padding:13px 2px; background:none; border:0;
    color:inherit; font:600 14.5px 'DM Sans', sans-serif; text-align:left; cursor:pointer; }
  .sd-fest-dot { width:10px; height:10px; border-radius:50%; flex:0 0 auto; }
  .sd-fest-car { margin-left:auto; opacity:.5; font-size:18px; }
  .sd-fest-years { display:flex; flex-wrap:wrap; gap:6px; padding:0 0 14px 20px; }
  .sd-fest-yr { border:1px solid rgba(232,226,214,.18); background:none; color:inherit; border-radius:99px;
    padding:6px 12px; font:600 12.5px 'DM Sans', sans-serif; cursor:pointer; }
  .sd-fest-yr.on { background:#e8a83c; border-color:#e8a83c; color:#1a1208; }
  .sd-fest-yr:disabled { opacity:.3; cursor:default; }`;
  document.head.appendChild(css);
})();
