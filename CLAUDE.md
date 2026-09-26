# Spindeck — Music Review App Mockup

> ## ⚠️ THIS IS `csharpuser/` — THE REVIEW-ONLY FORK (2026-09-22)
> A full copy of `c-sharp/` made after user testing said the app was **too
> complicated**. The original is untouched next door; this copy strips the
> mockup down to reviews. What changed (grep `csharpuser` in the sources):
> - **Home is the review feed.** The bento hero is hidden on home (CSS,
>   `.s-home-v3:not(.s-home-v3--review) .v3-bento`) — NOT deleted, because it
>   IS the album page (see *Fullscreen is the album page*). `FEED_RHYTHM` deals
>   reviews and ratings only.
> - **No Shop, no Playlists** (`playlists` / `playlist-new` / `playlist` /
>   `shop` are out of `SCREENS` and `NAV_PAGES`; their builders still exist in
>   `screens.js`, unused). The bottom nav is Home · Search · Trending · Profile (Search added 09-23).
> - **No "listening now"**: `nowBar()` emits nothing and the friends panel is
>   gone from `bottomNav()`. The hump now only holds the CD console.
> - **Profile = card · stats · pinned reviews · review history.** Favourite
>   albums, playlists and favourite songs are gone from the profile and the
>   Edit Profile form. Notifications and Settings lost their playlist / shop /
>   listening-activity rows. **2026-09-25 — THE PICKS came back, between the
>   stats and the pins:** one section, a three-cell segmented picker (Favourite songs ·
>   Listened · Listen later) over a `.prof-song` row list (`profPicksHtml` +
>   `profPicksLists` in screens.js, `profPicksTab` / `profPickOpen` in app.js,
>   `.prof-picks-*` in app.css). All three lists are in the markup; a tab only
>   swaps `hidden`. DERIVED, not stored: songs = `P.favSongs`; Listened = your
>   own `listened` log drafts (own profile only) then the review history's
>   albums; Listen later = your own `later` drafts topped up with a seeded
>   handful the person has not reviewed. A row opens the album page.
> - **Album Wall stays** as is.
> - **2026-09-23 — the friends deck.** Eric wanted the bento back on home
>   "for a different purpose", then the frame gone: home is now a **FRIENDS
>   DECK** (`friendsBentoHtml` in screens.js, `renderFriendsBento` + `fbLayout`
>   in app.js, the `.v3-fb` block at the end of app.css) — your friends'
>   recent reviews as drop-shadow cards where the bento was. The front card is
>   235px, CENTRED — COVER FLOW as the iPod classic drew it: the cards to come
>   on the right and the dealt ones on the left, all turned the same hard
>   62° toward the centre, a sliver further out each, the third faded out
>   before the edge, each with a reflection (`-webkit-box-reflect`). ORDER
>   on screen: the deck, THEN the album's title and artist, THEN the friend's
>   review — both variants carry `s-home-v3--fb-up`, the CSS `order` flip;
>   the markup's own order (review first, covers lower and easier to reach)
>   is an idea Eric wants kept, one flag away in `homeShellHtml`. The deck
>   is a RING (`fbDist`): both sides are always dealt, and every friend review
>   is in it. No CD for now — Eric will say when. Under it, centred, the album
>   page's info (title 22px + year, artist below), then the friend's review
>   in its own shape (`.v3-fbr`): the CENTRED stack in BOTH themes (face over
>   name, like and comment flanking the score, the text under) — Eric picked
>   it over the dark-only left-aligned grid on 2026-09-24. That grid (a
>   smaller face with the name under it on the left, the belt scaled with it
>   via `--belt-scale`, score · comment · like · when to its right, the text
>   across) is kept in app.css behind an opt-in `s-home-v3--fb-left` shell
>   class. Same markup; CSS lays each out. **2026-09-25: both kept ideas are
>   phones in the viewer** — home has FOUR: Float·Dark, Float·Light, then
>   Compact·Dark (`fb-left`) and Review first·Dark (`coversUp` false) to the
>   right, for comparison only; the first two are the app. The two are
>   `alt: true` and show only while the toolbar's **⧉ Alts** switch (beside
>   Free | Pro; `SD_ALT` / `stageVariants` in app.js, kept in localStorage)
>   is on. The toolbar was reorganised the same day to fit it: the five
>   tools are icon buttons, Dots · Belt · Page Map sit in a Labs menu.
>   The pills are the feed's, keyed by `feedRevKey` so likes are shared. No
>   album score line — one rating on screen. The review clamps at five
>   lines with a fade and a View more (`fbMore`); under a persona the quotes
>   come from each album's generated review list (`personaFeed`), which tops
>   out ~250 chars, so `FB_LONG_REVIEWS` (app.js) is dealt into every fourth
>   card and pushed into that album's list so the album page agrees. Two
>   POPULAR reviews a deal (`FB_POPULAR_PER_DEAL`, cards 4 and 11): not a
>   friend's — a community name, a record in one of the shelf's top genres
>   that the friends didn't deal, a viral write-up, big counts, and a
>   BELT — a blue ribbon reading POPULAR REVIEW, tilted, wavy and turning,
>   round the face 5px off it (`.v3-fbr-belt`, `fbBeltHtml`; no genre, no
>   chip — Eric). Since 2026-09-24 it is ONE SVG PATH, not forty 3D
>   segments: the band is a stroke, the legend a textPath, the motion SMIL;
>   two clipped copies (back half before the face in the DOM, front half
>   after) do the over/under. Geometry is the `FB_BELT_*` block in app.js;
>   the face is 64px (`.v3-fbr-av`), and `FB_BELT_FACE` must match it.
>   The feed card below still gets its plain `chip`. The
>   deck's geometry is `FB_TUNE` (app.js); the dev box's **Deck** tab drives
>   it live and prints it back as JS to paste over that block. It is a
>   SIBLING of
>   `.v3-bento`, which stays hidden on home and is still the album page; the
>   two swap on `--review` / `--rvp`. `homeShellHtml(light)` builds both home
>   variants. Card positions are inline transforms solved in `fbLayout` from
>   the perspective (P = 1000, origin at the centre) — keep `FB_CARD` and
>   `.v3-fb-card` / `.v3-fb-flow` in step. The front card's album
>   becomes the shell's main album (tint).
> - **2026-09-24 — THE REVIEW SHEET.** Every review on home opens ONE popup,
>   not a page: tap the deck's review (or its comment pill) or a feed card
>   (or its pill) and `openReviewSheet` (app.js) mounts `.v3-rsh-ov` /
>   `.v3-rsh` inside that phone screen — a bottom sheet that slides up and
>   drops back down (backdrop tap, Escape, or pull it down by the handle or
>   the head past `RSH_CLOSE_PX`). Its top part is the deck's review block
>   VERBATIM (`.v3-fbr` markup from `rshHtml`, so face, belt, name, score row
>   and pills share the deck's CSS; only the clamp comes off), then a record
>   line (tap → album page; its CD raises the NAV CONSOLE for that album, same
>   as the album page's CD — `rshCdTap`; no preview, and the nav is lifted over
>   the sheet's overlay while the console is up), then the comments (composer first, the thread
>   paging via `cmtAutoMore`, which knows `.v3-rsh-body`). Same feed key, so
>   likes and comments are shared; `toggleRevUp` now syncs every like pill on
>   a key. `REV_INDEX` entries from the feed and the deck carry `face` and
>   `popular` for it. The album page's in-place review and the profile's
>   standalone review page are UNTOUCHED — Eric wants to rethink that system.
>   Also: a deck review of two lines or fewer is centred (`.is-short`,
>   `fbMarkShort`).
> - **2026-09-24 — THE DISCOVERY DECK on the Trending wall.** The wall
>   (`wallHtml`) now opens with the home deck's cover flow at the top, where
>   the bento used to be: `discoveryDeckHtml` (screens.js) is the deck's
>   markup with the album's title · year and artist under it and, in the
>   review's place, the ACTUAL REVIEW row (`.v3-dd-score`: the aggregate
>   score, discs and count — no user review). `renderDiscoveryDeck` (app.js)
>   deals the wall's own ranking (`wallItems`, first `DD_N`), re-dealt by the
>   sort chips. The deck code reads its list per screen (`fbListOf`:
>   `_fbList` or the friends' reviews), and `fbGo` branches on `_dd`. Cover,
>   strip and score all open the album (`ddOpenFront`). The tiled wall sits
>   below, unchanged.
> - **2026-09-24 — YOUR REVIEW · COMMUNITY REVIEW.** The album page's rate
>   ring and its wings (`rateGroupHtml`, parked; `.v3-rate-group` CSS dormant)
>   are replaced by `.v3-rev-yours`: a full-width band labelled "Your review"
>   with your number over your discs in the headline score's shape (tap → the
>   log sheet; `syncRevCta` paints it from the draft), and "Community review"
>   labelled over the album's own headline score below. Listened / Later /
>   Favourite live in the log sheet; Share left the album page with the wings.
> - **2026-09-25 — the REVIEW PAGE wears the sheet.** `reviewPanelHtml`
>   (screens.js) — the standalone review page AND the album page's in-place
>   review — now renders `rshBodyHtml` (app.js): the sheet's content (the
>   deck's review block, the record line with its CD, the comments) in a
>   `.v3-rsh-body--page` under the back pill. The hero card is gone from it;
>   the sheet's inner CSS keys off `.v3-rsh-body`, so both surfaces share it.
> - **2026-09-25 — the LOG SHEET.** One button at the top, `.sd-log-post`
>   (still `.sd-log-save`, `paintLogSave` drives it): Post while there is
>   something unposted, Revise once posted (tap → cursor back in the text).
>   Share is gone from the sheet. The rating is one row: `.sd-log-num` (the
>   score, disc-height, "_._" until rated, written by `paintLogRating`) left
>   of the five discs, which are 46px with a 4px gap now. The songs box is
>   headed "Optional". The review page / in-place review are the screen's own
>   bg in both themes now (no album flood, no re-ink), 18px sides like the sheet.
> - **The bottom nav is a plain PILL** — no hump, no contour SVGs, no masks.
>   `.v3-nav-glass` is a border-radius + 1px border; `--nav-ar` / `--nav-r` /
>   `--nav-items-top` on `.s-home-v3` and `--console` are the whole geometry.
>   The CD console still grows the bar upward (553/82 → 553/205). Scrolled
>   (`.is-scrolled`, `sdScrollWatch`): the wordmark fades, the bubbles stay,
>   and a "back 2 top" tab rises out of the pill's top edge (`.v3-nav-top`).
> - **2026-09-25 (later) — SIMPLER: basic icons, no ribbons, minimal motion.**
>   Eric: "change out the icons to basic ones", "reduce the interactions like
>   the animations to a minimum", "get rid of the 3d ribbons". (1) `SD_ICONS`
>   is built from `SD_LINE_ICONS` (screens.js): plain 24×24 stroke glyphs under
>   the same keys and the same `sd-dot-ico` class; the dot grids stay in the
>   file unused. The log CTA's breathing box is the plain pencil; `RVP_HEART`
>   and `CMT_SVG` are a plain heart and bubble (no hole, no beat, no dots).
>   (2) The POPULAR REVIEW belt (`fbBeltHtml`, `FB_BELT_*`, `logBeltWord`) is
>   deleted (git: commit 54e24ad still has it); a popular review is NOT
>   marked at all (a flat tag replaced the belt for an hour — Eric: "no more
>   popular tag"); an ON log toggle is just icon + word in colour. (3) **MINIMAL MOTION**, the LAST block in app.css:
>   every at-rest loop (CD spin, quote scroll, live dot, ring pulse, caret,
>   hint marquee, disc pulse, number flip) is off for everyone, entry
>   animations are gone, and transitions of .3s+ are capped at .2s. Bring
>   anything back by deleting its line there, not the original rule. The
>   friends deck's cover-flow geometry and reflections were NOT touched.
> - **2026-09-25 (later still) — THE VIEWER IS FOR USER TESTING.** Eric: "get
>   rid of that stuff at the top and left of the website, not the mockup, and
>   replace it with patchnotes in the upper left with a feedback button next
>   to it" — then "we don't need a full bar at the top, just the two buttons,
>   and we don't need that bar at the bottom". So: NO toolbar and NO thumb
>   tray in testing mode — `#toolbar` is absolute, no surface, no height, and
>   just **Patch notes · Feedback** float in the top-left corner over the
>   stage (`patchnotes.js`, new; `.tb-test*` / `.tn-*` / `.fb-*` at the end
>   of style.css); the wordmark, the version over each phone and the variant
>   name under it only show with the tools, and only ONE phone is on stage
>   (`stageVariants` returns just the active variant). Down the left, centred,
>   floats THE TESTER RAIL (`#test-nav`; `renderTestNav` + `RAIL` in
>   patchnotes.js, `.tnav-*` in style.css): Onboarding · Home · Search ·
>   Trending · Profile, the page on screen lit (`railActive` reads the
>   current SCREENS entry, or the open search overlay); in Onboarding the
>   steps unfold under it (`obActiveSteps`, current `OB.step` lit; a tap sets
>   the step and obSync's). It polls every 400ms because the phone changes
>   screen without telling the viewer. EVERY dev control is
>   still in index.html, marked `.tb-dev`, and with the left page rail and
>   the recs bar only paints with **`?tools`** on the URL (`SD_TOOLS` →
>   `body.sd-tools`, app.js — the switch the mobile side already had). The
>   Alts phones are off without it. Patch notes are the `PATCH_NOTES` array
>   at the top of patchnotes.js — add the newest entry at the TOP, in tester
>   language. Feedback: `FEEDBACK_TO` there is EMPTY — Send copies the note
>   (plus the screen · persona · build line) to the clipboard until Eric puts
>   an address in, at which point it opens a prefilled mail instead. The
>   mobile bar was left as it was.
> - **2026-09-25 (later still) — ONBOARDING, SIMPLER.** Eric: "no more emboss,
>   left align, take out 'this is how friends find you on Spindeck'". The
>   **ONBOARDING, SIMPLER** block in app.css (just above MINIMAL MOTION)
>   flattens every neu-emboss surface on the wizard — the handle well, the
>   service rows, the Wheel|List switch, the dial's Back, the genre bubbles
>   and their sub-wells, the card art and the profile avatar — to a flat
>   `--surface` fill with a 1px `--border`; ON is an accent border on a
>   `--surface2` fill. The meter, hint, note, wall-card captions, the
>   profile-step hero and stats are left-aligned. Step 0's sub-line is gone
>   from screens.js. The original rules are untouched above the block.
> - **2026-09-25 (later still) — THE SESSION RECORDER.** Eric: "copy the
>   exact movement through the app as they use it … asks 'what's your name'
>   … saves as use case #X so we can look at it later". `recorder.js`
>   (loads last from index.html; testing mode only, `?tools` / `?norec` off)
>   asks the tester's name once (`.rec-*` card, style.css; name kept in
>   localStorage), then records with **rrweb** (DOM snapshot + every change,
>   tap, scroll, input, with timing — replayable, not video) plus a small
>   SEMANTIC LOG (`screen` from SCREENS[currentIdx] + shell state classes +
>   open overlays, polled; `tap` with the target's label; `input` with the
>   value) and uploads gzipped chunks `<sid>/0001.json.gz…` every 8s / 150KB
>   raw / on pagehide (keepalive). **Storage is a Supabase bucket**, chosen
>   over Dropbox so nothing private of Eric's is involved: the site carries
>   only the project's PUBLIC anon key and the bucket's one policy lets it
>   INSERT and nothing else (`tools/supabase-setup.sql`). `REC_CFG` at the
>   top of recorder.js holds url + anonKey; empty = the recorder does
>   nothing. **`sessions.html`** is the viewer, reached by a faint
>   "sessions" link in the viewer's bottom-right corner (`.sd-sessions-link`,
>   index.html / style.css; it shows nothing without the key, so it can be
>   public). The project URL and public key are baked in; you type ONE
>   PASSWORD (2026-09-26, Eric: "just add a password to the website … like
>   123abc") — the page signs in to Supabase Auth as the fixed account
>   `sessions@spindeck.app` (`SB_LOGIN`; a name, not a mailbox), made once
>   in the dashboard with that password, and `tools/supabase-login.sql`
>   gives that one account SELECT on the bucket;
>   the token sits in that browser's localStorage and refreshes itself.
>   (The service_role-key path is gone: the new sb_secret_ keys are blocked
>   in browsers anyway.) Files can be dropped from disk too. It lists
>   sessions as use
>   case #N (name · date · device · taps · screens · length), replays one in
>   rrweb-player with the log as a seekable timeline. Libraries come from
>   jsdelivr at runtime (rrweb 1.1.3, rrweb-player 0.7.14 — the 0.7.x line is
>   the player for rrweb 1.x; 1.0.0 does not exist on the CDN — and fflate 0.8.2).
> Everything below this box is the ORIGINAL's documentation and still describes
> the code that is here — read it with the list above in mind.


**What it is:** A Letterboxd-for-music app (working name **Spindeck**; the repo/URL still say CSHARP). Plain HTML/CSS/JS — no build tools, no npm, no framework. Designed as a phone UI prototype viewed in a desktop viewer.

**Cache-busting:** assets are loaded with `?v=N` in `index.html` — bump N on every CSS/JS/data change so the browser reloads.

**Live URL:** https://joo-k.github.io/CSHARP-user/ (this fork, from 2026-09-24; the original is at …/CSHARP-eric/)
**Repo:** https://github.com/JOO-K/CSHARP-user.git (the original's is JOO-K/CSHARP-eric — never push there from this folder)

---

## File Structure

| File | Role |
|------|------|
| `index.html` | Shell: desktop viewer + mobile prototype wrapper |
| `data.js` | Album archive, global state, `openAlbum()` helper |
| `screens.js` | All screen HTML (the `SCREENS` array) + helpers |
| `app.js` | Viewer logic, navigation, color extraction, fillet processing, mobile engine |
| `app.css` | App UI styles (screens, components, palette) |
| `style.css` | Desktop viewer chrome (toolbar, phone frame, variant tray) |
| `roadmap.js` | Roadmap board — state, render, export (desktop viewer only) |
| `roadmap.css` | Roadmap board styles |
| `guides.js` | **Guides** — draggable alignment hairlines over the stage (toolbar → ┼ Guides; H/V add, arrows nudge, dbl-click removes, Clear). Self-contained, loads last; styles in `style.css` |
| `flowchart.html` | Page map / user flow diagram |
| `archive.csv` | Source of truth for artist/album metadata |
| `images/` | Album art (~146 albums, `album-artistslug-albumslug.ext`), playlist covers (`playlist-*.jpg`), and `profile-skin-01.png` (profile theme 01 skin) |
| `share.js` | **Quick share** — renders your rating + review as a 1080×1350 Instagram card on a canvas, and the sheet that offers it. Loads AFTER app.js |
| `dots.js` | **SD_DOTS** — the brand dot-matrix asset generator. Loads FIRST (before `screens.js`) |
| `belt.js` | **SD_BELT** — belt geometry over a set of pulleys. The ONE solver; `beltPath` in app.js is now `SD_BELT.hull` with the dial's clearance |
| `belt-lab.html` | Design tool for belt rigs — drop pulleys, the belt wraps them. Toolbar → **⌾ Belt**. Not part of the mockup |
| `dot-lab.html` | Design tool for dot assets — paint grid, gooey links, sliders, save library, copy SVG/call. Toolbar → **◌ Dots**; leave via the back link or **Esc**. Not part of the mockup |
| `images/BOTTOM_NAV_FULL_INDENT.svg` | Silhouette of the **docked** bottom nav (2026-08-20 → 09-03), as drawn. Reference only — nothing reads it now that the nav is the floating bubble again (its 553×126 path is inlined in `bottomNav()` and the `.v3-nav-glass` mask) |
| `images/topbox.png` | Fillet PNG — black arc at bottom-left, white bg. Used for `v3-fillet-bl` |
| `images/bottombox.png` | Fillet PNG — black arc at top-left, white bg. Used for `v3-fillet-tl` |

**Script load order (important):** `belt.js` → `dots.js` → `data.js` → `personas.js` → `screens.js` → `app.js`
⚠️ `dots.js` must be first: the home screen's static markup calls `sdScene()` as `screens.js` parses.

---

## Screens (in order)

The `SCREENS` array holds only the **current** designs — every retired mockup
(the v1/v2 home variants, and the old standalone `search`/`album`/`artist`/`review`
screens) has been deleted. Album / Artist / Search are **no longer standalone
screens**; they're live sub-states of the home shell (see below). "Review" is
not a state at all any more — see *Fullscreen is the album page*.

| ID | Name | Variants |
|----|------|----------|
| `auth` | Auth / Login | Float·Dark, Float·Light |
| `onboarding` | Onboarding | Float·Dark, Float·Light |
| `home` | Home | v3.0 Float·Dark, v3.1 Float·Light |
| `wall` | Album Wall | Float·Dark, Float·Light |
| `song` | Song / Track | Float·Dark, Float·Light |
| `profile` | Profile | Funky·Dark, Funky·Light (theme 01) |
| `profile-edit` | Edit Profile (customising) | Funky·Dark, Funky·Light |
| `playlists` | Playlists | Float·Dark, Float·Light |
| `playlist-new` | New Playlist (creation) | Float·Dark, Float·Light |
| `playlist` | Playlist Page (detail) | Float·Dark, Float·Light |
| `review-page` | Review Page — one review in full, with its comments | Float·Dark, Float·Light |
| `notifications` | Notifications (activity inbox) | Float·Dark, Float·Light |
| `settings` | Settings | Float·Dark, Float·Light |
| `shop` | Shop — four aisles: General, Events, Themes, Badges | Float·Dark, Float·Light |

`auth`/`onboarding`/`song` use the older `.app-screen` component CSS re-skinned to
the current palette via the **`sd-theme-dark` / `sd-theme-light`** scope classes
(defined in `app.css`, built by `sdTheme(light)` in `screens.js`). They render via
`authHtml(light)` / `onboardingHtml(light)` / `songHtml(light)`.

Navigate between screens with `navigate('screen-id')` — called from `onclick`
handlers in screen HTML. `navigate('search'|'album'|'artist'|'review')` is
intercepted and routed to the live in-app flow (`openSearch` / `openAlbumPage` /
`openArtistPageFor`) rather than a standalone screen. `navigate('review')` is a
**legacy id** — the fullscreen review state it named is gone (see *Fullscreen is
the album page*) and it now routes to the album page like `'album'` does.

### Left page nav (desktop viewer)
`NAV_PAGES` (in `app.js`) drives the floating left rail — **decoupled from
`SCREENS`**. Real screens open via `goToScreen`; `flow:true` entries (Search,
Album Page, Artist Page, Review) launch the live in-app interaction through
`navPage(id)` and are flagged with a `↗` in the rail. `activeNavId` tracks the
highlighted entry. The rail is `position:absolute` over `#stage` so the phone
centers in the true middle of the viewport (`#phone-container` fills full width).

---

## Dev Box — TABBED (`DEVBOX_TABS` in app.js, `#devbox` in index.html)

The panel is **tabbed**: one tab per thing you can tune, each owning its own
`fields` and the `css(d)` block it emits. **Adding a tab is adding a row to
`DEVBOX_TABS`** — the strip, the sliders, Reset and Copy CSS all derive from it.
Today: **Bento info** (the compact stats strip) and **Album score** (the album
page's headline number + its vinyls).

- ⚠️ **Field keys share ONE namespace** — `DEVBOX` is flat across tabs. Prefix
  new ones (the album-score tab uses `s*`) or two sliders will silently drive
  one value.
- **Injected: every tab. Shown and copied: the active tab.** All blocks have to
  be in force at once (you can't tune the album score with the bento's block
  switched off), but the textarea and Copy CSS give you just the block you're
  pasting, so "what you see is what you paste" still holds per tab.
- **Reset clears the ACTIVE tab only** — it sits under that tab's sliders, and
  wiping a tune you can't see would be a nasty surprise.
- Switching tabs re-renders the rows from `DEVBOX`, so a tune is never lost by
  looking at something else. The `input` listener is delegated for the same
  reason the roadmap's is: the rows are rebuilt on every switch.
- ⚠️ **The album score's vinyls are sized in CSS, not inline.** `halfStars` grew
  a third argument, `cssSized`, that omits the inline `width`/`height` — an
  inline style beats any rule short of `!important`, which is exactly what stops
  a vinyl row from being tunable. Only `populateBigScore` passes it; every other
  caller keeps inline sizing, which is also what keeps the disc size a whole
  pixel (see the `.hstar` rasterisation note).

## Dev Box — the original notes (`initDevBox` in app.js)

A tuning panel floating on the right of `#stage`, behind the toolbar's **⚙ Dev**
button. Desktop viewer only. It live-tunes the **compact bento's info box** —
the block's column gap + padding, plus X · Y · Size · Row gap for each of the
two columns — and prints the CSS. ("Line 1" and "Line 2" are the left and right
COLUMNS since the two-column rebuild; the labels kept their old names.)

- The sliders write a `<style id="devbox-live">` appended to `<head>`, and
  **`devBoxCss()` produces both that and the Copy CSS output**, so what's on
  screen is exactly what gets pasted. No second code path to drift.
- Rules are scoped `.s-home-v3:not(.s-home-v3--review)` — (0,2,0), enough to
  beat the base `.v3-blue-info-row` / `.v3-blue-stars-row` declarations without
  touching the review/album/artist state.
- **The defaults are the live values in app.css**, so an untouched panel emits
  the current layout rather than resetting it. If you change those declarations
  in app.css, update `DEVBOX_FIELDS[].def` to match or the panel will silently
  disagree with the stylesheet.
- ⚠️ **`<style id="devbox-live">` is injected AT LOAD, not when the panel
  opens**, and it's appended to `<head>` — so at equal specificity it beats
  app.css for every selector it names. **If an edit to the bento info box
  appears to do nothing, look at `devBoxCss()` first.** The two-column rebuild
  spent a full round looking "ignored" because this style was quietly
  re-applying the old `scale()` on top of it.
- ⚠️ **Size is a font-size in px, NOT a `scale()`.** It used to be a scale,
  which worked while the box was two stacked full-width lines. It cannot be one
  now: a transform on a **grid item** is paint-only, so the track is sized from
  the untransformed box and the scaled result spills out of `.v3-blue`
  (`overflow: hidden`) — measured at 11.6px of album title hanging past the
  right edge. Line 1's size rides on `.v3-blue-info-row` with the album/artist
  inheriting it as `1em`; line 2's rides on `.v3-blue-score`.
- **The dev box's output goes into app.css verbatim.** That's the panel's whole
  point — the tune is settled by eye against the live screen, so retyping it as
  "equivalent" numbers changes the thing that was approved. If the output can't
  be shipped as-is, the panel is what needs fixing.

**The sample-review quote is gone from the bento** (`.v3-blue-quote { display:
none }`). It was already hidden in review mode, so this retires it everywhere;
the markup and the typewriter in app.js remain and just paint into a hidden
node, so deleting that one rule brings it back. With two lines instead of three,
`.v3-blue` moved off `space-between` (which would shove them to the far top and
bottom of the box) onto a centred stack.

## Pet Box (`initPetBox` in app.js, `#petbox` in index.html)

The nav pet's whole vocabulary, behind the toolbar's **☺ Pet** button. Desktop
viewer only. One cell per entry in `SCENE_REACTIONS`, each **looping its real
sequence** with the reaction's name and the action that fires it
(`PET_TRIGGERS`). Click a cell to play it on the phone.

- **Sequences, not stills.** These reactions only read as themselves in motion —
  a single frame of `music` is six bars at arbitrary heights and says nothing.
- ⚠️ **Preview cells must NOT carry `.sd-scene`.** `sceneTick` repaints
  everything with that class, so a preview wearing it gets stamped with the live
  frame and the whole grid collapses to one pose. `.pet-stage` exists to be the
  box the face scales into without being picked up by the clock.
- Reuses the dev box's `.db-*` chrome and sits one column to its left, so both
  can be open at once — you can watch the pet while tuning the bento.
- The preview clock only runs while the panel is open.

## Roadmap (`roadmap.js` + `roadmap.css`, `#roadmap` in index.html)

The planning board behind the toolbar's **🗺 Roadmap** button — an editable
project-year plan meant to be opened live in a meeting. **Left column:** a
block calendar (**two months on screen, stepping by one**, Aug 2026 → Apr 2027)
over a **37-week** vertical timeline (Aug 21 2026 → May 6 2027, month rules
between). **Right column:** short / medium / long term goals over meeting
notes.

**The range is two constants** — `RM_START` and `RM_WEEK_COUNT`. The calendar's
month blocks, the year labels, the header line and the export range all derive
from them, so extending the board is one number and nothing to keep in sync.

**Three levels of thing, deliberately kept apart:** a **week** is the
workstream ("Design pass"), a **day event** is a fixed point inside it
("hand-in, 4pm"), a **session** is the record of one meeting. Clicking a day
edits its events; clicking the W-number jumps to the week.

The split is deliberate: the left is what you READ off, the right is what gets
WRITTEN during the meeting — so the right column takes the larger share of the
width (`0.92fr / 1.08fr`) and both its cards grow with it rather than the notes
being pinned to a fixed 34%.

**The board ships near-empty on purpose** — every week but W1 is blank and all
three goal lists start at zero, because it's filled in live during the meeting.
**W1 carries the how-to** (`RM_HOWTO`) instead of a task, so the instructions are
the first thing on screen and get typed over once the plan starts landing.

### Import — a downloaded .md back into a board (`rmParseMarkdown` · `rmUpload`)

The round trip for **Download .md**. Everything the board holds is already in
that document, so **the file IS the save format** — this parses it back rather
than adding a second one. `Upload .md` sits beside Download in the header and
drives a hidden `#rm-file` input.

- ⚠️ **The export now carries the ISO date** as well as the human label:
  ``- **Tue Sep 8** (W3) `2026-09-08` — …``. The label alone is **lossy** — no
  year — so a re-imported board could not tell 2026 from 2027 and every event
  would land on the wrong day. The label stays because it is what a person reads;
  the parser reads the backticked ISO beside it.
- ⚠️ **The writer and the parser have to move together.** Section headings
  (`## Goals` / `## Timeline` / `## Events` / `## Meeting notes`) are the
  parser'''s state machine; change a heading in `rmMarkdown` and change it here.
  Track and status come back through the **same** `RM_TRACK_LBL` /
  `RM_STATUS_LBL` / `RM_TERMS` tables the writer used, so a renamed label cannot
  silently import as the wrong track.
- ⚠️ **It REPLACES the board; it does not merge.** Anything the document does not
  mention comes back empty. Same contract as an incoming share link: it confirms
  first and stashes the old board in `RM_PREV_KEY`.
- ⚠️ **Unparseable input returns `null`** and the button says *✗ Not a board* —
  a half-read board is worse than none, and the existing one is left untouched.
- ⚠️ **The file input is cleared on every open.** Without that, picking the SAME
  file twice fires no `change` event at all and the second import looks like it
  silently failed.
- Cell pipes are escaped on the way out and unescaped on the way back, and the
  table is split on unescaped pipes only — verified with a subject containing
  a literal `|`.
- Verified round trip on a fully populated board: **37/37 weeks identical**,
  goals, events (with dates) and every note body byte-for-byte, blank lines
  inside notes included.

### A week is a SUBJECT plus a detail
Each week holds `{tag, t, track, st}` — `tag` is a couple of words (the subject),
`t` is the full line. The timeline stacks them, subject over detail; **the
calendar prints the subject only**, as a bar spanning that week's seven days.
That split is the reason the calendar is useful at all: a day cell is ~38px and
a full detail line was never going to fit in one.

- ⚠️ **The subject bar is ALWAYS in the DOM, collapsed by
  `.rm-cal-tag:empty { display: none }`.** Typing a subject has to reveal it on
  the calendar *without a re-render* (the caret rule), so `rmCalMark(i)` only
  sets `textContent` and CSS does the rest. Rendering the bar conditionally
  would mean a structural change per keystroke.
- ⚠️ `rmCalMark` writes with **`textContent`, not `innerHTML`** — this is raw
  user input going into the DOM on every keystroke.
- **`rmHasItem` / `rmIsMilestone` / `rmMarkOf` read BOTH fields.** A subject with
  no detail is a legitimate entry (it's the one the calendar can show), so the
  marker dot and the Markdown export must not test `t` alone. `MILESTONE` is
  matched on the subject first, then the text, so older boards keep their flags.
- ⚠️ **`tag` arrived after boards were already saved**, so `rmNormalize` fills it
  in rather than assuming the key exists — a stored board or a share link from
  before it existed would otherwise put `undefined` where a string belongs.
- The subject is faint until its row is hovered (`.rm-week-tag:empty`), or 19
  blank weeks read as 19 unfilled form fields. **Enter in a subject moves to
  that week's detail** instead of blurring — one entry, typed top to bottom —
  and clicking a blank week in the calendar lands on the subject, not the detail.
- Both the subject (timeline and calendar) take the **track's colour**, which is
  what makes a month scannable by workstream at a glance.

### The block calendar (`rmCalHTML` / `rmHi` / `rmCalMark`)
**Two months on screen, stepping by ONE**, as a horizontal filmstrip: all five
are rendered into `.rm-cal-track` and the track is translated, which is what
makes a drag continuous instead of a cut between two renders. Each month is an
8-column grid: a W-number gutter, then seven days.

- ⚠️ **`RM_CAL_SPAN = 2` is how many months are VISIBLE, not how far a step
  moves.** Consecutive pages overlap by `SPAN - 1`, so the month you were
  reading stays on screen beside the one you moved to — that overlap is the
  point of the feature, not a rounding artefact. Everything derives from it:
  `.rm-cal-m` is `flex: 0 0 50%`, the last valid index is `rmCalMax()` =
  `months - SPAN`, and there is one pip per PAGE (4), not per month (5). A pip
  per month would leave the trailing ones permanently unreachable.

- **Paged four ways** — the header's `‹ ›`, the pips, a pointer drag, and a
  trackpad horizontal swipe. `rmCalGo(i)` is the single entry point; the arrows
  disable at the ends and a drag past either end rubber-bands at 0.3×.
- ⚠️ **`rmCalSlide` translates in PIXELS off one SLIDE's width**, not in `%` and
  not off the viewport, because a live drag offset has to be added to it and a
  step is one slide. `rmCalStepPx` **measures a real `.rm-cal-m`** rather than
  computing `clientWidth / SPAN`, so the width lives only in the CSS and a media
  query can change it without the JS sliding to the wrong offset. That is also
  why a **resize listener re-snaps it** — otherwise the strip sits parked
  between two months — and why `rmRender` calls it after rebuilding the slides.
- ⚠️ **A drag that ends on a day must not count as a tap** — the click handler
  bails on `view._rmDragged`, set once a pointer moves more than 6px. Without it
  every swipe also jumped the timeline to whatever day was under the finger.
- **The header names the visible RANGE ("Aug – Sep 2026"); each block names
  ITSELF** (`.rm-cal-mname`). The name used to live only in the header, which was
  right when one month was on screen — with two, a single label cannot say which
  block is which, so it moved back into the slide and the header widened to a
  range. `rmCalLabel()` owns the range, the pips and the arrows' disabled state;
  it must be called from every path that moves `RM_CAL_I`.
- The board opens on the month containing today (`rmCalMonthOfToday`, falling
  back to **index 1 = Sep** when today is outside the range — index 0 is the
  August stub and makes a poor first screen off-season).

- ⚠️ **Weeks run Friday → Thursday and the day columns read `F S S M T W T`.**
  That is not a quirk to "fix": W1 starts Fri Aug 21, and holding every week
  Fri→Thu makes one calendar ROW exactly one roadmap WEEK. That 1:1 alignment is
  what lets a hover in either view light the other, and what makes the block
  read as "which week am I in" at a glance. Move `RM_START` off a Friday and
  `RM_DOW` has to rotate with it.
- **The link is two-way**: hovering a day (or its W-number) lights the matching
  row in the linear list and prints `W6 · Sep 25 – Oct 1 · Design · Planned — item`
  into `.rm-cal-read` in the card header; hovering the list lights the calendar.
- ⚠️ **A day and its W-number HOVER alike but CLICK differently.** A day opens
  its event popover; the W-number gutter (and the subject bar) jumps to the week
  in the timeline, which is what the whole cell used to do. Both still light the
  same week on hover, so the two-way link is unchanged.
- **A week that straddles a month boundary is drawn in BOTH blocks**, with the
  out-of-month days dimmed — the alternative is a week that exists in the list
  but nowhere in the calendar.
- **`RM_CAL_MONTHS` is DERIVED from the week list**, not hand-listed — the two
  were separate constants once and drifted, which is why W1 spent a while with
  no calendar cell at all. It runs from the month of the FIRST week's start to
  the month of the LAST week's start, which gives two useful edges for free:
  **August is a stub block** (W1 Aug 21 is the first start, so nothing before
  the 21st is drawn — the timeline doesn't begin until then), and the final
  week, which starts Apr 30 2027 and runs into May, appears in the **April**
  block with its May days dimmed rather than earning May a block of its own.
  Don't "fix" August's short height: the filmstrip takes its height from the
  tallest slide, so a two-row block costs no layout.
- **The board crosses into 2027**, so blocks are stamped `APR '27` and the
  header spells both years when a page straddles the boundary
  (`Dec 2026 – Jan 2027`, but `Sep – Oct 2026` inside one year). `RM_SPANS_YEARS`
  gates the suffix — on a single-year board it would be noise on every block.
  ⚠️ The timeline's month rules group on **year+month**, not month alone, or two
  different Augusts would fold under one heading.
- ⚠️ **Typing in a week calls `rmCalMark(i)`, not `rmRender()`** — the caret rule
  below applies to the calendar too. `rmCalMark` only re-stamps `data-mark` on
  that week's cells (the dot under the date; gold and larger for a line starting
  `MILESTONE`).
- **Today** gets an accent ring in the calendar and an accent spine + W-number in
  the list, and opening the board scrolls to the current week (`rmScrollToNow`)
  rather than to W1.

### Tracks are workstreams (`RM_TRACKS`)
**Development · Design · Admin · Research.** They replaced `mockup / web / both
/ admin`, which mapped the two Spindeck projects onto a board that only ever
plans one effort — the answer was almost always "Both", so the chip carried no
information.

- ⚠️ **Renaming a track orphans every board already saved under the old value.**
  `RM_TRACK_OLD` maps the retired names forward (`mockup → design`, `web → dev`,
  `both → dev`) and `rmNormalize` runs it **before** the fallback that resets an
  unknown track to `dev` — reverse those two and every old board goes uniformly
  `dev` instead of migrating.
- ⚠️ Colours live in three CSS rules (`.rm-chip`, `.rm-week-tag`, `.rm-cal-tag`)
  and must stay in step with `RM_TRACKS`. **Research took the gold the retired
  "Both" used to**, not a green, because a green subject bar sits directly over
  day cells tinted green for the `done` status.

### Day events (`rmDayOpen` / `rmEvAdd` / `rmEvMark`, `RM.events`)
Clicking a day opens a small editor for **that day's** events. A week says what
the work is; an event is a fixed point inside it — a call, a hand-in, a
deadline.

- **Keyed by ISO date (`{'2026-09-15': ['Hand-in 4pm', …]}`)**, not by week
  index, so moving `RM_START` re-labels the weeks without dragging every event
  to a different date with them.
- ⚠️ **The popover is appended to `#roadmap`, not into the calendar card.**
  `.rm-cal-body` sets `overflow: hidden` to clip the filmstrip and would cut the
  popover in half. It is positioned `absolute` against `#roadmap` (which is
  `position: absolute; inset: 0` and carries no transform) rather than `fixed` —
  `fixed` would silently re-anchor itself if any ancestor ever gained a
  transform. It flips above the day when there is no room below.
- ⚠️ **Opening a day creates a blank row eagerly**, so a day with nothing on it
  is one click from typing. `rmDayClose` therefore **sweeps rows nobody typed
  into**, and `rmEvDel` deletes the key outright when the last event goes —
  otherwise every day anyone merely opened would keep an empty event forever and
  ride along in every share link. `rmNormalize` prunes them again on the way in.
- ⚠️ **Typing calls `rmEvMark(iso)`, not `rmRender()`** — the caret rule again.
  It re-stamps `data-ev` and the title on **every** cell for that day, because a
  week straddling a month boundary is drawn in two blocks at once.
- The marker is `::before` (a corner square), since `::after` is already the
  WEEK's dot and a day can legitimately carry both.
- Events land in `rmMarkdown()` under their own `## Events` heading. They were
  invisible in the export before v3, which meant a board copied out lost every
  date-specific thing on it.

### Meeting notes are per SESSION (`RM.sessions` / `RM.si`)
One tab per meeting, so last week's decisions stay readable while this week's
are being typed. Tabs are named for the day they were opened and are renamable
in place.

- ⚠️ **One textarea, rebound on switch** — not one textarea per tab. `rmTabGo`
  swaps `value`; the single `input` listener writes to `rmSession()`, whichever
  that currently is. Per-tab nodes would leak a listener each.
- ⚠️ **A tab is a `<div>`, not a `<button>`** — the active tab's name is
  contenteditable, and a caret inside a button is unreliable across browsers.
  The `×` calls `event.stopPropagation()` or deleting would also register as
  "switch to this tab".
- ⚠️ **Renaming must not call `rmTabsRender()`** (caret rule), and the last
  session cannot be deleted — the textarea would bind to nothing.
- `rmMarkdown()` emits one `###` per session.

### ⚠️ NEVER ERASE A READER'S BOARD — the standing rule for this file
Every visitor's notes live **only in their own browser**, under `RM_KEY`. We
cannot see them, cannot restore them, and they are overwritten the first time a
new build saves. The user has asked explicitly that updates to this board never
cost their collaborator the notes they have already taken. Treat that as a
constraint on every future change here, not a nice-to-have.

What that means in practice:

- **`RM_KEY` is still `spindeck-roadmap-v2` — the DATES have not moved.** The
  key is bumped only when the week list re-dates, because state is keyed by
  index and reconciling would pin old notes to different dates. Shape changes
  are **migrated** instead: the `v` field (`RM_SHAPE_V`) went to **3** for
  events + sessions, and `rmNormalize` upgrades a v2 board in place — old tracks
  mapped forward, the single `notes` string carried into session 1, `events`
  defaulted. Bumping the key would have thrown away every board and share link
  in circulation for no benefit.
- ⚠️ **Extending the board FORWARD is safe; moving the start is not.** Raising
  `RM_WEEK_COUNT` leaves every existing index on the date it already had and
  pads the new weeks blank — that is exactly how the range went from 19 weeks to
  37 without anyone losing a line. Changing `RM_START`, or shortening the count
  past filled weeks, silently re-dates or drops what people wrote. **Add weeks
  to the end.**
- **`RM_PREV_KEY` (`spindeck-roadmap-prev`) is the safety net.** `rmBackup`
  stashes the stored board's RAW string before anything reshapes it, and
  `rmFromHash` does the same before a share link replaces a local board. It only
  writes when the shape is actually about to change, so ordinary loads don't
  churn the one copy worth keeping. Recover with:
  `JSON.parse(localStorage['spindeck-roadmap-prev'])`.
- Before shipping a change to the state model, ask what happens to a board
  already saved under the old one — and if the answer is "it gets replaced",
  that is a bug, not a migration.

- **Self-contained.** Two new files, loaded last in `index.html`; it imports
  nothing from app.js and app.js knows nothing about it. `rmInit()` runs on the
  **first open**, not at load, so it costs nothing until pressed.
- Lives inside **`#stage`** (already `position: relative`) at `z-index: 90` —
  above the dev box's 60 — so it covers the phones but leaves the toolbar
  reachable. `toggleRoadmap` also sets `.rm-open` on `#viewer`, which hides
  `#thumb-tray` and `#recbox`; without it both sit visible *below* the overlay.
- ⚠️ **The right column is weighted to NOTES, not split evenly** — goals `34%`,
  notes `66%`. Goals are a short standing list that gets read; notes are written
  continuously and are the thing that actually runs out of room.
- ⚠️ **Under 1080px the layout is `display: block`, not a one-column grid.**
  Every `.rm-card` carries `min-height: 0` so it can shrink in the two-column
  flex layout, which makes its content contribution to a grid row effectively
  zero — Chrome split the height evenly between the two rows and both columns
  overflowed theirs, painting the goals card straight over the timeline. Block
  flow has no height to distribute, so cards are content-height and `.rm-grid`
  takes the scrollbar; the per-card caps (`#rm-timeline`, `#rm-goals`,
  `.rm-notes`) are what keep it from running to 19 weeks of full height.
- **Editing is contenteditable + one delegated `input` listener** on `#roadmap`,
  because `rmRender()` rebuilds the rows and per-node listeners would leak on
  every structural change. Fields are `plaintext-only` and Enter blurs rather
  than inserting a `<br>` — a `<br>` would defeat the `:empty::before`
  placeholder.
- ⚠️ **Same rendering discipline as `PLNEW`:** input handlers write state and
  **must not re-render** (it destroys the caret mid-keystroke). Only structural
  changes — `rmCycle` / `rmAddGoal` / `rmDelGoal` — call `rmRender()`, and those
  restore both card bodies' `scrollTop` so the reader isn't thrown to the top.
- **State** is one object in `localStorage` under `spindeck-roadmap-v2`, saved
  debounced at 250ms. `RM_WEEKS` is **derived from `RM_START` + `RM_WEEK_COUNT`**
  (all date maths in UTC — this is a fixed calendar, not a clock) and is separate
  from the stored state, which holds only `{t, track, st}` per index — so editing
  the week list re-labels the board instead of orphaning someone's notes
  (`rmLoad` pads/truncates to match). ⚠️ **Bump the key when the DATES move**, as
  v1→v2 did: reconciling by index would otherwise pin last week's notes to a
  different date. `rmLoad` also resets a `track`/`st` that's fallen out of its
  list, which would break the chip's cycle index.
- ⚠️ **localStorage is per-browser, so a reader's notes never come back on their
  own.** On the live Pages site every visitor gets their own board, saved on
  their own machine — it persists for them across reloads, and it is invisible
  to everyone else. Nothing is shared and nothing syncs between devices.
  `rmMarkdown()` emits goals + a timeline table (Week · Starting · Subject ·
  Track · Status · Detail; blank weeks omitted, typed `|` escaped) + events +
  one section per note session, for **Copy Markdown** / **Download .md**.

### Share links (`rmEncode` / `rmDecode` / `rmCopyLink` / `rmFromHash`)
**Copy link** packs the entire board into the URL hash (`#rm=<url-safe base64
of the JSON>`), so a link is the transport between people. There is no server —
that is the only reason this works on GitHub Pages at all. An empty board is
~1.8k of URL; a meeting's worth of notes stays well inside what a browser takes.

- **Base64 is URL-SAFE** (`+/` → `-_`, padding stripped) — a raw `+` or `/` gets
  mangled passing through chat apps and mail clients.
- ⚠️ **An incoming `#rm=` asks before replacing a board that already exists in
  that browser.** Silently overwriting someone's own notes is the worst possible
  outcome of clicking a link.
- ⚠️ **The hash is stripped via `replaceState` on arrival, decoded or not** — on
  a reload it would otherwise re-import and wipe out everything typed since.
- ⚠️ **`rmNormalize` runs on BOTH paths**, storage and link, so a link from an
  older build can't arrive half-shaped and put a `null` where a string belongs.
  `rmDecode` returns `null` on anything it can't parse (a truncated paste is the
  common case), and the import falls through to the local board.
- Chips cycle on click: track (Mockup · Website · Both · **Admin**) and status
  (`–` planned · `▸` doing · `✓` done · `!` at risk, which also colours the spine
  node **and tints the day cells** in the calendar).
- `rmSeed()` is the single place to change what a blank board contains;
  **Reset** restores it and drops the reader's edits (behind a `confirm`).

## Album Wall — the popular grid (`wallHtml` / `wallGridHtml` / `wallItems`)

Four controls on one row: **Popular · Controversial · Genres ▾ · Week ▾**.
Popular and Controversial are sort modes (`WALL_SORT`, stamped on the chips so
the choice survives the viewer's re-render); Genres and Week are dropdowns.

- ⚠️ **"Controversial" is a STAND-IN and should be replaced when real ratings
  exist.** The mock data contains no disagreement to rank by, and two obvious
  sources are dead ends: `ratingSpreadFor()` floors every bucket at 0.05 and
  suppresses low ratings, so the bottom tail is pinned at exactly 0.20 for all
  100 albums (variance over it ranks the highest-rated records first;
  min-of-tails collapses to `0.4 / total` and rewards the narrowest bell —
  both read as a broken filter), and `album.reviews[]` is `[4.5, 4, 4]` for
  nearly everything, two distinct spreads across the catalogue. It currently
  ranks by proximity to the middle of the scale × `log10(reviewCount)`. Real
  data replaces it with the variance of actual user ratings, at which point the
  wall and the album page's histogram agree by construction.
- `pickWallSort` repaints `.wall2-grid` **in place** on both shells rather than
  calling `renderViewer()`, which would rebuild everything and lose the
  dropdowns' state and the scroll position. That's why `wallGridHtml()` exists
  separately from `wallHtml()`.
- ⚠️ The four chips are sized to FIT (10.5px type, 6px gap, 10px padding);
  "Controversial" sets that budget. Week is no longer pinned right with
  `margin-left: auto`, and `.wall2-menu--time` had to flip from `right: 0` to
  `left: 0` — right-anchoring threw the popup across the screen once its button
  stopped being the last thing on the row.
- ⚠️ **`.wall2-art` is 3px and is NOT a persona knob.** It was in
  `personaSkinCss`'s radius rule; eric's 15px made every cell float as a
  separate card, and no edit to app.css could show otherwise because that rule
  is (0,3,0) and wins. The wall is a dense 3-up grid meant to read as one
  surface, so its corner is a layout decision. Same family of mistake as
  `.v3-album`. `.pl2-card` keeps the token.

## Personas (`personas/` → `personas.js` → `applyPersona` in app.js)

The mockup can be shown as **four different people**, each with their own
catalogue and their own look. The switcher lives in the desktop toolbar and the
mobile bar (`renderPersonaBar()` fills both from one markup string).

| id | who | look |
|----|-----|------|
| `eric` | **Eric** — **the default; the app boots into this one.** Seeded from his real Spotify artist capture (`NEWSPOTIFYARTISTS.png`, the same one behind `tools/artists.txt`), then edited by hand | warm amber |
| `kpop` | **Kpopper** | glossy pink |
| `oldies` | **Hank** — classic rock + oldies | warm paper |
| `hyperpop` | **16yearold** — new-age electronic pop | neon mint |
| `thomas` | **Thomas** — Eric's friend, from his real Apple Music library export | electric blue |

**There is no "Demo" button any more** — `eric` is the demo. `applyPersona('')`
still works and still restores data.js's own catalogue + the random persona; it
just has no entry in the switcher, and `initPersonas` boots into `eric` when
nothing is saved (booting into the unpersona'd data would leave every button
unlit, with no way back).

Each list mixes **hits with deep cuts**, at ~25–30 albums. The home bento
cycles the entire catalogue (`albumSeq()` = featured + all of
`trendingAlbums`), so a short list makes the app look empty — that is what a
9-album persona looked like.

### Where the data comes from
`personas/personas.csv` (identity + skin tokens, one row per persona) and
`personas/taste/<id>.csv` (`artist,album,track,rank`) are **the hand-maintained
source**. `tools/build_personas.py` resolves each row against the **Deezer
public API** and writes `personas.js`. See `personas/README.md`.

A persona can be **seeded from a real Apple Music library export** with
`tools/apple_library_to_taste.py` (that's where `thomas` came from). ⚠️ **Ask for
`Library Tracks.json`, not `Library Albums.json`** — only the tracks file
carries artist names and **play counts**, so it ranks by what someone actually
listened to and needs no network at all. The albums file has neither (just
titles + Apple catalog ids), and the script's fallback path — resolve the ids
via iTunes, rank by date added — produced a visibly *wrong* persona for Thomas:
a recency list of things he'd saved, versus the hip-hop/neo-soul/Seoul-R&B
catalogue his play counts actually describe. `Library Activity.json` is the
library edit log; there's nothing to rank by in it.

The CSV it writes is still meant to be read and cut by hand. **Korean acts are
the usual Deezer miss** — 검정치마 is listed under its Korean name, not "The
Black Skirts"; look the artist up in `search/artist` and use the name Deezer
returns.

- **Only `artist` is required.** Blank `album` → the build picks their
  most-played real album. For K-pop that lands on whatever single is charting,
  so those are pinned by name — same for legacy acts, where the top-tracks tally
  favours compilations.
- **Two traps the matcher exists to dodge:** short group names collide (Deezer
  lists several acts called *Ive*, *BTS*, *f(x)*), so `find_artist` keeps the
  **most-followed exact name match** — search order does not put the famous one
  first. And a global album search returns cover bands ("The Beatles Complete On
  Ukulele" outranked The Beatles), so albums are looked up **within the resolved
  artist's own catalogue**, with a name check on the way out.
- Ratings/reviews are generated in the script, **seeded off the album title**,
  so a rebuild produces identical numbers — no git churn.
- **Artwork is a Deezer CDN URL, never a downloaded file** (`ARTWORK_AT_SCALE.md`).
  77 albums add ~0 bytes to the repo. This is also what makes the planned move
  to Dropbox a re-run of the script rather than a rewrite.

### Personas deal a fresh home every time
A persona's identity is authored and fixed, so it can't get its variety the way
the demo does (`randomizeProfile` re-rolls an entire new person each visit). It
comes from the home page instead: `reshuffleHome()` re-deals the featured album,
the bento's swipe queue and the activity feed on every
switch — and on every page load, since `initPersonas` re-applies the saved one.
The toolbar's **Shuffle** runs the same function.

`personaFeed()` generates the feed rather than remapping data.js's 1:1 (which
produced an identical feed every load): people from the demo's cast, albums
drawn at random from the persona's own shelf, and the **quote taken from that
album's own generated reviews**, so a feed card and its album page agree.

⚠️ `trendingAlbums` takes the **whole** remaining catalogue. The name says five
and data.js's comment says five, but `albumSeq()` is `featured + trendingAlbums`
— slicing it to five silently shrinks the bento's swipe queue to six albums.
`shuffleAlbums` used to do exactly that.

### Switching (`applyPersona(id)`)
Swaps `ARCHIVE` wholesale, then re-derives everything from it —
`featuredAlbum` / `trendingAlbums` / `activeAlbum`, the profile, and the home
feed. ⚠️ **Anything cached off `ARCHIVE` must be cleared here or it serves the
previous persona:** `window._FEED` (the activity feed's deal) and
`_pinnedReview` are, and `FRIEND_ACTIVITY` is rebuilt by `personaFeed()` —
data.js's feed names demo albums by title, so under a persona every card would
point at a record that no longer exists. Add to that list when you add a cache.

⚠️ **The toolbar's persona row overflows its section.** `.tb-section.left` is
`flex: 1` (a quarter of the bar) but the wordmark + mockup chip + persona
buttons are wider than that, and `.tb-section.center` — a later static sibling —
painted over the overflow, so the **last persona button was unclickable** while
looking perfectly normal (found by hit-testing `elementFromPoint`, not by
reading the CSS). The centre section's empty gutter is now `pointer-events:
none` with its own controls back to `auto`. That buys room for a few more
personas; past ~7 the buttons will reach the `‹ Home ›` controls themselves and
the row needs to shrink or scroll instead.

`applyPersonaClass()` re-stamps `.persona-<id>` on every `.app-screen` inside
`renderViewer`, because renderSingle/renderMulti rebuild the screens from
scratch. The skin itself is one injected `<style id="persona-skins">`.

### Skins carry TWO colour sets
`personaSkinCss` emits a dark block on `.persona-<id>` and a light block on
`.persona-<id>.s-home-v3--light, .persona-<id>.sd-theme-light`. **A persona
with one colour set painted both viewer variants the same** and the Dark|Light
pair stopped being a comparison — hence `accentD/bgD/inkD/…` **and**
`accentL/bgL/inkL/…` in the CSV. `radius` is shared; `font` is no longer
applied (see *Design Language*).

⚠️ Build the descendant selectors per base, not by joining bases with a comma:
`"a, b .x"` scopes `.x` under `b` only, silently dropping every light screen but
the last. That's what the `each(bases, kids)` cross-product in
`personaSkinCss` is for.

> **The skin is still a broad first pass.** The screens were built on hard-coded
> hex, so a persona overrides the big surfaces rather than re-declaring a token
> set. Per-persona detail work is open — starting with the header wordmark and
> icons washing out on the light backgrounds.

⚠️ **`s.radius` must never touch `.v3-album`.** It did, and `eric`'s `15px`
rendered the cover's corner at ~27 units against the shell's 20 — a visible
crescent of shell colour at all three corners, and the reason the album "didn't
match the bento". Two things make it wrong: the album's corner is
**structural** (it sits flush inside the silhouette, whose corner is a fixed 20
units of the viewBox and so scales with the phone), and `radius` is a **px**
value, which is the exact trap the comment on `.v3-album` in app.css warns
about — correct at one width, wrong everywhere else. The token still skins
`.wall2-art` and `.pl2-card`, which are free-floating cards.
⚠️ **The lesson generalises: nothing that lines up with a path is a persona
knob.** Before adding a selector to a skin rule, check whether the element
butts against the bento silhouette or the nav.

## Recommendations + search fallback — Deezer at runtime (`app.js`)

A persona ships ~30 albums and the bento cycles the **whole** catalogue, so home
started repeating within a few swipes. `expandRecs()` widens the shelf to `RECS_TARGET` (100)
on every load **without shipping a single extra byte**: it takes
`RECS_SEEDS` (10) of the persona's own artists at random, asks Deezer for each
one's **related artists**, and takes the best few albums from each. Both draws
are random, so a reload deals a genuinely different shelf — measured at **88%
new albums between two consecutive loads**.

- **`artist/<id>/radio` is the wrong endpoint** and was the first cut. Seeded
  off a K-ballad singer it returns forty *"Crash Landing on You (Original
  Television Soundtrack), Pt. 3"* singles. Related-artist **albums** are the
  right source.
- ⚠️ **That endpoint has no `nb_tracks`, and `record_type` says "album" for
  live records and compilations too.** The title is the only usable signal
  (`DZ_JUNK`), plus Deezer's own **`fans`** count — `dzPickAlbums` ranks by fans
  and draws randomly from the head, which is what keeps *Aja* above *A Decade
  Of Steely Dan*.
- **Records arrive `_lite`** — title/artist/cover but no year, genre or track
  count. That is exactly what the compact bento needs (it hides the year), and
  `dzHydrate` fills the rest in one call when the album is opened. Ratings and
  reviews come from `dzSeed`/`dzReviews`, a **port of the generator in
  tools/build_personas.py** — same pool, same seeding, so a fetched album is
  indistinguishable from a built one and never changes its numbers.
- `dzAdopt` re-deals the queue round-robin by artist so recs interleave with
  your own records instead of stacking behind all ~30 of them — but **only from
  `dzQueueFloor()` onward**, and that boundary is load-bearing. ⚠️ This
  function runs **once per artist per seed — several dozen times** while a deal
  streams in, and it used to re-spread the WHOLE of `trendingAlbums` on every
  call. `_albumIdx` is a *position*, so two bugs fell out of that, both the same
  bug: the **For-You panel lied** (it painted `seq[idx+1]`, the array was
  re-dealt underneath, and the swipe landed on a different record), and the
  queue seemed to **repeat** — swiping never made progress, because each
  re-deal re-randomised the positions just ahead. Simulated over 400 runs of a
  streaming deal: 1.17 repeats and 13.8/15 broken previews before, 0 and 0
  after. The floor is `maxIdx + 3` — the album on screen, the For-You promise,
  and one spare for `albumSeq()` prepending `featuredAlbum`.
  `dzAdopt` also nulls `window.SEARCH_INDEX`, which is memoised and would
  otherwise never see the new albums.
- Personas carry **`artistId`** (added to `build_personas.py` for this) so the
  seeds need no name lookup.

**Search** used to only know the persona's own ~30 albums, so "steely dan" found
nothing. `sdsRemoteSearch` queries Deezer alongside the local index (debounced
280ms) and appends a **"More on Deezer"** section; local results stay on top.
Tapping an album opens it like any other; tapping an **artist** first pulls
their albums into ARCHIVE, because `openArtistPageFor` builds the page by
filtering ARCHIVE and would otherwise open an empty shell.

**One album per artist** (`RECS_PER_ARTIST = 1`). Four albums by one act in a
row read as the shelf repeating — the exact complaint this feature exists to
answer — so breadth comes from more ARTISTS instead, and `dzSpread` deals the
pool out round-robin by artist so two records by the same act are never
adjacent. (They arrive grouped, one artist's batch at a time; appended raw they
land in consecutive swipes.)

⚠️ **The feed has to be refreshed when a deal lands** (`dzRefreshHome`). It is
built from ARCHIVE at render time — *before* the recs arrive — and `feedEvents`
memoises into `_FEED` while `FRIEND_ACTIVITY` is generated once per persona
switch. Without the refresh the bento swiped through a fresh 100 albums while
everything under it showed the same handful of rows on every single load, which
reads as the whole screen repeating.
`expandRecs` therefore calls it from **one exit point**: the deal loop has
several early returns and hitting `RECS_TARGET` takes one of them, which is
exactly how this broke the first time.

### Rec box (`initRecBox` in app.js, `#recbox` in style.css)
The knobs are live, on a strip along the **bottom of the desktop viewer** — the
numbers are a feel decision and reading them off a diff is useless. Seeds ·
Related/seed · Albums/artist · Max queue, plus an on/off toggle, **Re-deal**,
and a live readout (`97 albums · 64 recommended · 64 new artists · ~88
requests`). It's appended to `#viewer`, which the mobile prototype hides
wholesale, so it never reaches a phone. Sliders re-deal on **release**, not on
input — dragging Seeds 2→14 would otherwise fire a dozen deals at the API.

⚠️ **Deezer allows ~50 requests / 5s and a rec deal is ~45 of them.** `dz()`
paces every call `DZ_GAP` (115ms) apart and retries a failure once. **It caches
only successful responses** — an earlier cut cached the `null` from a throttled
call, which pinned the failure for the whole session: search silently returned
nothing until reload, long after the quota recovered.

## Data Layer (`data.js`)

`data.js` runs first and sets up the global data layer:

```js
window.ARCHIVE        // Array of 54 album objects
window.activeAlbum    // Currently viewed album (set by openAlbum)
window.featuredAlbum  // Today's featured album (daily rotation)
window.trendingAlbums // Array of 5 trending albums (excludes featured)
window.fmtRc(n)       // Formats review counts: 31000 → "31k"
window.openAlbum(a)   // Sets activeAlbum + navigates to 'album' screen
```

Each album object:
```js
{
  artist, album, year, genre, tracks,
  image,           // 'images/album-slug.ext'
  artistDesc, artistBio,
  rating,          // 3.8–4.9 (fictional)
  reviewCount,     // 6000–156000 (fictional)
  reviews: [{ name, init, grad, rating, text }]
}
```

**`featuredAlbum` / `trendingAlbums`** rotate daily (`Math.floor(Date.now() / 86400000) % ARCHIVE.length`).

### Dynamic screens (getter pattern)
Wall, Feed (Albums), and Album Page use `get html()` so content is evaluated fresh each render.

Home screen data is injected post-render by `populateHomeData(el)` in `app.js` (called inside `requestAnimationFrame` after every `renderViewer()`).

### ⚠️ NEVER put a bare backtick inside a screen's template literal

Every screen in `screens.js` is one big `` ` ``-quoted template, and the comments
**inside** the markup are inside that template too. A backtick in one of them —
the `` `.shop-model` `` style this file uses everywhere else — **closes the
template early**. What follows parses as property access and arithmetic on the
string, so the file still loads clean and nothing looks wrong until the screen is
actually rendered:

```
product — see `.shop-model` in app.css. -->      →  ReferenceError: model is not defined
                                                    ("…").shop - model
```

The throw happens inside `navigate()` → `renderViewer()`, so **the whole render
dies and the tap looks like a dead button.** This shipped once and cost the shop
screen entirely. Escape it (`` \` ``) or, better, write the comment without
backticks. Backticks are fine in ordinary `/* */` code comments — only the ones
sitting inside a template literal bite.

---

## Design Language & Aesthetics

**NO SERIF unless Eric says so (2026-09-16).** DM Sans for reviews, comments,
previews, composers — everything. Crimson Text was the "review voice" for a
while and came off every review surface today. It survives only on the shop
wheel's count (a deliberate annotation). **Personas no longer carry a
typeface** (2026-09-17): Hank's skin set the whole app in Crimson and
16yearold's in SUSE Mono, and every screen that hadn't pinned its own face
inherited it — Eric hit it on the review bylines, then the playlist page.
`personaSkinCss` skips `s.font` now; the CSV column is dead. Eric will name
the niche places serif can come back; don't reach for it.
Comment and preview rules pin `font-family: var(--font-main)` explicitly so
nothing can inherit a serif in.

### Philosophy
**Editorial-dark meets floating bento** — a music zine digitized. Between Letterboxd, a vinyl record store, and a Tumblr that cares about typography.

Key principles:
- **Floating cards with drop shadow** — cards lift off the background
- **Album art is the hero** — everything orbits the cover
- **Compact, dense information** — stars + rating + count in one row
- **Procedural color** — accent color extracted from album art via canvas

### Dark Theme (Float·Dark / v3.0)
- Screen bg: `#111116`
- Text primary: `#e8e2d6` (warm off-white)
- Empty stars: `rgba(232,226,214,0.14)` — grey, NOT black
- Shadows: dark-on-dark — barely visible; rely on inset top-edge highlight `inset 0 1px 0 rgba(255,255,255,0.06)` for separation
- Accent: procedurally extracted via `applyAlbumColors()`

### Light Theme (Float·Light / v3.1)
- Screen bg: `#f0ece3` (warm cream)
- Text primary: `#1a1208`
- Empty stars: `rgba(26,18,8,0.15)`
- Box backgrounds: currently `#999` placeholder — to be refined
- Shadows: warm-tinted dark shadows, visible on cream bg
- Album shadow: `0 8px 16px rgba(30,20,10,0.18), 0 20px 48px rgba(30,20,10,0.28)`

### Album / Artist / Song typography convention
Wherever these names appear together, order them **song → album → artist** (top to bottom / left to right), with **album name always before artist**. To distinguish the two: **album = regular weight (400), artist = bold (700)**. Song title stays the most prominent element when present. Applied in: album detail (`.album-title`/`.album-artist`), song detail (`.song-*`), home info row (`.v3-blue-album`/`.v3-blue-artist`), friend cards (`.v3-friend-*`), trending/search (`.trending-*`). Exception: `.lfeed-artist` stays a small uppercase mono kicker (editorial eyebrow, not a peer pair).

⚠️ **The home screen now runs the weights the other way: album 700 / artist 400.**
It reads better where the pair is small and dense, so it applies to the **compact
bento info row** (`.s-home-v3:not(.s-home-v3--review)` — the review / album /
artist pages keep the convention above) and to the **friend-feed cards**, which
also moved onto `Roboto Flex` to match the bento. If the flip spreads to the rest
of the app, this section is what changes.

### Global CSS Variables (defined in `:root`)
```css
--star:      #e8a83c
--font-main: 'DM Sans'
--font-mono: 'SUSE Mono'
```

`.s-home-v3` overrides `--text3` to `rgba(232,226,214,0.14)`. `.s-home-v3--light` overrides it to `rgba(26,18,8,0.15)`.

---

## ⚠️ The bento viewBox is 689 × 730 (was 689 × 638)

`LeftBento_larger.svg` replaced the shell: the bottom edge moved **637.5 →
729.147** and **nothing else changed** — the album region, the For-You column,
the CD notch and the search corner are byte-identical between the two paths. The
whole gain lands in the stats strip, which went from ~103 units tall to **194.6**.

- ⚠️ **Every Y percentage in the bento is a fraction of 730 now.** X percentages
  are untouched (the width never moved). The cells were re-derived from the
  SVG's own numbers rather than rescaled: album `0.5 → 534.02`, strip
  `534.5 → 729.147`, For-You `105 → 520`, CD `559.074 → 669.074`, pill
  `3.19 → 68.19`. Verified in-page against those units.
- The **strip no longer overshoots**. At 638 it was deliberately 17.5% —
  past the shell's bottom edge, "dipping into the CD-gap below". The new shell
  ends where the strip ends, so it's an exact 26.664%.
- Four copies of the silhouette move together: `bg-left` / `bg-right` in
  `.v3-bg-fill` **and** the same two outlines inside `.v3-master-frame` (painted
  transparent, but they must stay coincident). The right-hand path is a pure
  `x → 689 - x` mirror of the left, same command sequence — that is how the
  original pair was built, so derive it mechanically rather than by eye.
- `.v3-blue` uses `align-content: start`, so the title/rating row stays at the
  top and the new room is one contiguous block underneath.
- ⚠️ **`share.js` still draws the 638 shell.** `BENTO_SHELL` and the cell
  constants it derives from app.css percentages are now wrong on both counts.

## Credits in the bento (`creditsFor` / `populateCredits` in app.js)

"Produced by / Mixed by" in the room the taller shell opened up.

- ⚠️ **Deezer has NO credits.** Verified against the live album endpoint: the
  only people in it are `contributors`, whose `role` is "Main" or "Featured" —
  performers. What it does carry that's credit-adjacent is `label`,
  `release_date` and **`upc`**.
- **MusicBrainz has them, free and keyless**, and Deezer's `upc` matches its
  `barcode` query EXACTLY — no fuzzy title guessing. Chain:
  `dz('album/<deezerId>')` → upc → `release/?query=barcode:` → mbid →
  `release/<mbid>?inc=recordings+artist-rels+recording-level-rels`.
- ⚠️ **All three `inc` values are required.** `recording-level-rels` says WHERE
  to apply relationship includes; `artist-rels` says WHICH kind. Drop the latter
  and the request still returns **200** with every recording missing its
  `relations` key — indistinguishable from "no credits" unless you read the
  payload. Cost an hour.
- ⚠️ **Producers live at RECORDING level, not release level.** Every release's
  own `relations` array tested empty, so the heavy `recordings` include (~100KB)
  is unavoidable — which is why this fetches only for the album on screen,
  debounced 520ms, and re-checks the album before painting.
- ⚠️ **Browser requests get load-shed.** Three identical fetches at 1.5s spacing
  measured **200 / 503 / 200**, while the same URL from curl was 200 every time:
  MusicBrainz squeezes anonymous cross-origin traffic and a browser cannot send
  the descriptive User-Agent their policy asks for. `mb()` retries a 503 up to
  three times (1.5s / 3s / 6s).
- ⚠️ **Never cache a failed lookup.** `creditsFor` caches only definitive
  answers — a 503 that outlived its retries is not "this record has no credits",
  and caching it pins the album blank for the session. Exactly the trap `dz()`
  already documents.
- **Coverage is real but partial: 8 of 10 sampled albums** had producer credits
  (the misses were indie releases — MusicBrainz is volunteer-entered). The row
  stays `hidden` when there's nothing rather than printing an empty label.
### Credits are BAKED — `tools/fetch_credits.py`

```
python tools/fetch_credits.py            # every album missing credits
python tools/fetch_credits.py eric       # one persona
python tools/fetch_credits.py --force    # refetch, including the empties
python tools/fetch_credits.py --limit 20 # smoke test
```

Writes a `credits` array onto each album in `personas.js`; responses cache in
`tools/.credits_cache.json` so a re-run is instant. Same shape as
`build_personas.py` — public APIs, no keys, no scraping.

- **This exists because the browser can't do it reliably** (the 503 measurement
  above). A script sends the descriptive User-Agent MusicBrainz asks for and
  paces at 1.1s, so the credits ship at zero runtime cost.
- ⚠️ **`"credits": []` means "looked, found nothing" and is a real answer.**
  `creditsFor` tests `Array.isArray`, not truthiness — otherwise every
  credit-less album falls through and re-asks the network on every swipe, for a
  question already settled at build time. It's also what makes a re-run skip
  them instead of asking forever; `--force` retries those.
- ⚠️ **A failed request is never recorded as `[]`** — `credits_for` returns
  `None` on network failure and the album is left without the key, so a re-run
  picks it up. Confusing the two bakes "no credits" into the repo permanently.
- The runtime path in app.js now only serves albums the build never saw — the
  recommendation pool Deezer hands us at load.
- ⚠️ **Bump `personas.js?v=N` in index.html after every bake.** It's generated,
  so it's easy to forget it obeys the same cache-busting rule as the hand-edited
  files — the page will happily keep serving the pre-bake copy and every album
  reads as having no credits.
### Three standing rows — Produced by · Mixed by · Label

⚠️ **All three are ALWAYS drawn**, and a missing value leaves its label in place
(faded via `.v3-cred-row.is-empty`) rather than dropping the row. This reverses
the earlier "hide it when empty" rule on purpose: coverage is patchy, so hiding
produced a block that changed height on every swipe, and a strip that changes
shape album to album reads worse than a blank in a standing form. The labels
also double as a statement of what the app thinks is worth crediting.
`Engineered by` is still collected by the bake but not shown — room for three.

⚠️ **Baked albums paint synchronously, skipping the 520ms debounce.** Both
lookups resolve off the record itself for anything the build saw, and routing
those through the timer made the block visibly pop in on every swipe. The
debounce is there to keep the NETWORK quiet, so it should only apply when
there is a request — i.e. the runtime rec pool, which paints its labels
immediately and fills the values in when they land.

The label is one field of the SAME Deezer album call `creditsFor` already makes
for the upc, so it costs nothing extra — and it is a real credit: for a small
act "Independent" is itself the answer.

- **Baked at 100%** — all 159 persona albums have a label, against 52% for
  credits. Runtime recs resolve theirs from one cached `dz()` call (12/12 in a
  sample). Net effect: the row is **never empty**, which is what it needs to be,
  since an empty row in a fixed-height strip reads as a bug rather than as
  absent data.
- ⚠️ `album.label === ''` means "asked, Deezer had none" — `labelFor` tests
  `typeof === 'string'`, not truthiness, for the same reason `credits: []` is a
  real answer. Getting this wrong re-asks the network forever.
- `fetch_credits.py` fills labels and credits **independently** (an album can
  have one and not the other), so a label-only pass doesn't re-hit MusicBrainz
  for credits already settled.

- ⚠️ **In the bento the credits row is rare, and the bake is only half the
  reason.** The swipe queue is the whole of ARCHIVE — 100 albums, of which only
  **33 come from personas.js**. The other **67 are the runtime recommendation
  pool** `expandRecs()` pulls from Deezer at load, which the bake has never seen
  and can't (it's a fresh random deal every session). Measured on one load: 14
  with credits, 19 baked-empty, 67 unbaked. So ~14% of what you swipe past shows
  a credit line, and an album with none looks identical to a bug. The unbaked 67
  fall through to the live lookup, which does work but takes ~5s and is
  503-flaky — fine as a trickle, invisible as a feature.
- **Measured coverage: 83 / 159 albums (52%)**, and it tracks how well
  documented the music is rather than anything about the code — `oldies` 71%,
  `kpop` 55%, `hyperpop` 48%, `thomas` 43%, `eric` 42%. ⚠️ Worth knowing before
  leaning on this feature: MusicBrainz is volunteer-entered, so the credits are
  thinnest for exactly the small and new artists a credits feature is most
  meant to serve. Discogs (needs a token) is the database to add if that
  matters — it also carries the artwork/design credits MusicBrainz mostly lacks.

## Home Screen v3 — Bento Hero Layout

```
┌──────────────────────────┬──────────┐
│                          │ [🔍] [👤]│  ← search corner (46px tall)
│      ALBUM ART           ├──────────┤
│      (square, 78% wide)  │  [□] [□] │  ← 2 small album thumbs
│                          │ ┌──────┐ │
│                          │ │      │ │  ← main featured album image
├──────────────────────────┤ └──────┘ │
│ 4.4 ★★★★½  19,284 reviews│    ●CD   │  ← spinning CD (absolute)
└──────────────────────────┴──────────┘
         ▼ scroll area (friend feed)
         ▼ bottom nav (Home · Reviews · Playlists · Popular · Profile)
```

### Height constraint — critical
`.screen-content` (the phone frame's content wrapper) is **not a flex container** — it's a block with `overflow-y: auto`. This means `flex: 1` on `.s-home-v3` has no effect. To pin the bottom nav:

```css
.s-home-v3 {
  height: 100%;    /* fills screen-content exactly */
  min-height: 0;   /* overrides .app-screen's min-height: 100% */
  overflow: hidden;
}
```

Without `height: 100%`, the entire screen scrolls inside `screen-content` and the bottom nav floats off the bottom.

### Grid structure
> ⚠️ The markup lives in **`bentoHtml()`** (`screens.js`, above `SCREENS`) —
> one copy, three callers: Float·Dark, Float·Light and the shop's Pro
> showcase. It used to be inlined in both home variants, which were
> byte-identical apart from three comments. Edit it in one place.

```css
.v3-bento {
  display: grid;
  grid-template-columns: 78% 22%;
  grid-template-rows: auto auto;
  gap: 0;
  margin: 10px 10px 0;
}
```

Grid children (in order): `.v3-album`, `.v3-right-col` (spans row 1 only), `.v3-blue`, `.v3-corner`.

### Cell: Album Art (top-left)
- `aspect-ratio: 1` — always square
- ⚠️ **Corner radii are PERCENTAGES, never px.** Everything else about these
  cells is a % of the 689×638 viewBox, so the boxes rescale with the phone while
  a px radius stays put — correct at exactly one width and wrong everywhere else.
  That is what the **corner gaps** were: `.v3-album` sat at `10px` where the
  frame's 20-unit corner wants **10.60px** (a 0.6px crescent of the box1 fill at
  three corners), and `.v3-for-single` sat at `11px` where its panels' 15-unit
  corner wants **7.95px** — 3px too round on all four. At the 365px bento
  (393 phone − 8 frame − 20 margin) **1 SVG unit = 0.5298px**; divide the frame's
  unit radius by the box's own unit width and height to get the two figures.
  ⚠️ Use the **`a% / b%` two-axis form**. A single percentage resolves against
  *width* horizontally and *height* vertically, so on a non-square box it draws
  an **ellipse** — which is why `.v3-for-single` (tall and narrow) needs
  `13.2748% / 3.6143%` to describe one circular 15-unit corner.
- `.v3-album` — `3.71747% … / 3.74499% …` (20 units), **bottom-left** square (the
  step junction; the `--left` hand mirror flips that to bottom-right)
  ⚠️ **Its box is derived, not eyeballed**, and every number is now exact: the
  shell's album region is x 0.5→538.5, y 0.5→534.52 (bg-right; the bottom is
  where `.v3-blue` starts), so `left/top/width/height` are `0.5/689`, `0.5/638`,
  `538/689`, `534.02/638` — and `--left`'s `left` is `150.5/689`. The old
  round numbers (78.01%, 21.92%) left the cover half a unit short of the shell,
  which showed as a hairline down one edge. **Change any of these four and the
  two radius percentages have to be recomputed with them** (20 ÷ the box's own
  unit width and height), since a % radius resolves against the box, not the
  viewBox. ⚠️ See also the persona note: `s.radius` must not restyle this.
- **The optical nudge** (`--album-dx` / `--album-dy`, applied as a `transform`
  on `.v3-album`). The derived box lands on the shell's edges to the unit, but
  the two shapes are antialiased curves drawn by different rasterisers — an SVG
  path fill vs. a CSS border-radius — so where they *look* flush isn't where
  they *are* flush. The correction was settled by eye at **-0.5px / -0.2px** on
  the 385px mockup and then **converted to percentages**, so it's a proportion
  of the cover and holds at every phone width. ⚠️ Don't put px back: same trap
  as the radii — right at one size, wrong everywhere else. ⚠️ `translate()`
  percentages resolve against the **element**, not the parent, so these are % of
  the cover's own 538.0 × 534.02, which is why the two axes differ. To turn it
  by eye, 1 phone px = **0.35087%** horizontal / **0.35348%** vertical. It stays
  a transform rather than being folded into `left`/`top` so the box above
  remains a clean derivation and this remains the one thing to turn. Zeroed in
  the `--review` state, where the cover butts against nothing.
- `position: relative; z-index: 1`
- Light theme: `box-shadow: 0 8px 16px rgba(30,20,10,0.18), 0 20px 48px rgba(30,20,10,0.28)`

### Cell: Right Column (top-right)
`.v3-right-col` is a flex column containing:

**Search corner** (`.v3-search-corner`, 46px tall):
- Two icon buttons: search (→ `navigate('search')`) and profile (→ `navigate('profile')`)
- Background matches screen bg (`#111116` dark / `#f0ece3` light)
- Has `v3-fillet-bl` (arc fillet) at bottom-left

**Red box / Trending** (`.v3-red`, `flex: 1`):
- `border-radius: 0 15px 15px 0`
- Contains: 2 small square album thumbnails (`.v3-red-thumbs` / `.v3-red-thumb`) at top with 9px margin + 5px gap, then one full-width featured album image (`.v3-red-next-img`) filling the rest with 9px margin and 11px border-radius

### The log control — THE RATE GROUP (`rateGroupHtml()` · `.v3-rate-group`, 2026-09-18)

**Eric's `RateGroupnew2.svg` (the rounder wings, second pass — the lower lobes
are near-circles and the drawing grew to 1633×1321 round the same disc), replacing the CTA + quick-log
strip below.** One big circle — **"RATE · REVIEW · LOG"** on an arc inside its
top, its fill a gradient whose white band a SMIL `animateTransform` sweeps
left→right every 6s (~1.8s of sweep; SMIL because CSS can't move a gradient),
and **"_._"** in the middle until you rate; your number over your discs once
rated, the disc filling with the album gold and the arc going dark ink (a CSS
`fill`, which beats the gradient attribute); "Reviewed" if you only wrote — with two wings
hugging its lower half, each holding two lobes: **Listened** beside the circle
and **Later** under it on the left, **Favorite** beside and **Share** under on
the right. The SVG (his two wing paths verbatim + the circle) is the surfaces,
pointer-events off; the five controls are transparent HTML buttons placed in
% of the 1633×1321 viewBox (`.v3-rg-rate`, `.v3-rg-btn--tl/bl/tr/br`), so
they scale with the phone and carry real labels. 83% of the column, centred,
`aspect-ratio: 1633 / 1321` (83%, not the old 80%, so the disc stays the size it
was when the drawing was 1575 wide — the arc type and the 34px number are
sized against it). `syncRevCta` paints the circle; `toggleRevAction`
/ `syncQuickLog` drive the lobes' `.on` (they match `.v3-rg-btn` as well as the
artist page's surviving `.v3-rev-q` corner pill). Share is a bare button with
`data-kind="review"` → `sdShare`. **The lobes' labels sit outside the
bubbles** (2026-09-18): above the two upper lobes, below the two lower ones
(`.v3-rg-lbl`, absolute off the button; the group's `margin-bottom` is the
lower pair's room), so each bubble holds its glyph alone. Hidden on the artist page. Edit the drawing,
not the numbers — the lobe boxes were read off the paths.

### (Retired) CTA + three quick squares (`.v3-rev-cta-row`) — the notes below describe what the rate group replaced; the CSS is still in app.css

- ⚠️ **It spans the ALBUM's width.** `.v3-rev-mine` used `align-items: center`
  in the `--album` state, which left the control floating: 268.2px of button
  inside 321.2px of album, 26.5px of air each side, while the cover, the
  histogram and the tracklist all sat flush. It's `stretch` now, with
  `.v3-rev-cta` on `flex: 1` and `width: auto` (it was `fit-content`, which is
  what kept it text-sized) so the button absorbs whatever the three fixed 50px
  squares don't. The base `margin-left: -2px` is zeroed here — an optical nudge
  for a floating button just overhangs an aligned one.
- **The three quick buttons are SQUARE**, and `--sd-q` on `.v3-rev-cta-row` is
  one number doing two jobs: their width and the row's `min-height`.
  `align-items: stretch` hands every child the row's height, so they're square
  only while those two agree — two literals would drift apart.
- **All four share one type treatment**: `--font-main` 600, differing only in
  size (13px / 8px) and case. The captions were mono 400, which made the row
  read as one bold button with three tag-alongs in a different voice.
- **Icons are `SD_ICONS`, built from `SD_DOT_ICONS` through SD_DOTS** — the same
  rounded squares as the pet and the ticker, filling with `currentColor` so they
  inherit hover and `.on` state like a glyph. Don't add `stroke` rules; there's
  nothing to stroke, and a stroke on the rects would fatten the dot off-grid.
- **The CTA's icon is `sdBoxIcon()`** — a frame with an ellipsis of dots inside,
  the three of them breathing on a staggered 2.8s loop. It says "there are words
  to write here" where a pencil said "edit", and it is the only thing on the
  page that moves at rest, which is what marks it as the button to press. Slow
  and shallow on purpose: faster reads as a spinner, i.e. "busy".
  - ⚠️ **Hand-built, not `SD_DOTS.svg()`** — the generator can't mark individual
    cells and the inner dots need their own class. It re-derives the same
    geometry (cell 8, dot 56%, corner 14%); if `dots.js` changes those, this
    follows. `'o'` in its grid means an animated dot.
  - ⚠️ **`transform-box: fill-box` is required** on `.sd-ico-live`. Without it an
    SVG child transforms about the VIEWBOX origin, so `scale()` throws the dot
    across the icon instead of growing it in place.
  - It's 7×5 cells, so it takes an explicit 21×15px rather than the square rule
    the other icons use — a square would squash it.
- ⚠️ **The grids are 5×5.** They render at ~15px, so a 7-wide grid puts each dot
  near 2px and the icon reads as grit — the same budget that governs the pet.
  Shapes are chosen for what survives, not fidelity: **"Listened" is headphones,
  not an ear** (an ear is a curve inside a curve; at 5×5 that's two smudges),
  and the pencil is a plain 45° stroke because a dot matrix only does right
  angles and 45° steps. Redraw them in `dot-lab.html` and paste the rows back.

### Album page — the headline score (`.v3-rev-score`, `populateBigScore`)

Below the "Review, rate, log" row, above the histogram: the album's rating as a
big left-aligned number in **DM Sans 800 / 40px**, with the vinyls on its
baseline.

- ⚠️ **It is deliberately the SAME number as `.v3-blue-score` under the artist,
  printed twice.** They aren't redundant: the one-liner is a label on the record
  (album · year · artist · score), this one is the heading for the ratings
  section beneath it. Keep both — the one-liner was explicitly kept when this
  was added.
- ⚠️ **The one-liner is GONE from the album page entirely** —
  `.s-home-v3--review:not(.s-home-v3--artist) .v3-blue-stars-row { display: none }`.
  The headline score says all of it, and printing the number twice made the page
  read as having two different ratings. The info box here is just album · year
  over the artist, which is why that pair stepped up to **22px / 14.5px** (year
  14px) — it takes the room the row used to hold.
  - ⚠️ **`:not(--artist)` is load-bearing.** The artist page has no score, so
    this row is where its review COUNT lives — "the one stat". Drop the `:not()`
    and the artist page loses it.
  - The compact bento is untouched and keeps number, discs and count.
- It shares its left edge with the **histogram and the tracklist** (the panel's
  content column), not with the CTA button, which is inset inside
  `.v3-rev-mine`. That's what makes the ratings section read as one block.
- ⚠️ `font-family` is declared outright rather than inherited. In this box the
  number under the artist is DM Sans by inheritance and the count beside it is
  mono, so "which family is this?" is a live question — say it.
- Hidden on the artist page, same reason `.v3-blue-score` is: an artist isn't a
  thing you score.
- Light ink in **both** themes, because the album page floods with the album's
  procedural colour (dark in both) — see `applyColorVars`.

### Cell: Blue Box / Reviews (bottom-left)
**The compact bento runs this cell as TWO COLUMNS** (`.s-home-v3:not(--review)`):
album · year over the artist on one side, the score at 27px with the vinyls
under it on the other. **The rating always takes the side away from the CD** —
so it is on the RIGHT in left-hand mode and on the LEFT in right-hand mode,
which is why the mirrored arrangement rides `:not(--left)` and the base block is
the left-hand one. Parking the big number beside the CD read as crowded. In the
mirrored arrangement the text is right-aligned and **the year leads the album**,
a deliberate exception to the app's album-before-year convention so the ragged
edge faces the rating.

The **review count shares row 2 with the vinyls**, on their far side — outward
in the left-hand layout, inward in the right-hand one — in the same faint mono
as before. It is a **bare "12.5k"** in the bento (beside a row of discs the
number reads as a count on its own) and **"12.5k reviews"** on the album page.
⚠️ The word is a `.v3-rc-long` span the state hides, with its leading space
*inside* it so nothing trails when it goes. Branching on `.s-home-v3--review`
in `setMainAlbum` looks equivalent and is **not**: the stars row is painted once
per album while that class is added and removed underneath it, so the text keeps
whichever state it was written in — reproducibly "81k revs" on the album page.

The rating column is therefore a 2×2 grid, not a flex column: DOM order is
score → vinyls → count, and the count has to land *beside* the discs.
- ⚠️ **Done entirely in CSS, on purpose.** These children are shared with the
  fullscreen review state, which stacks the same elements in one column, and
  the artist page sits on top of that — re-nesting them in screens.js means
  re-deriving both. Everything is scoped `:not(--review)`.
- ⚠️ **`grid-row: 1` on both items is load-bearing.** With only a column named,
  sparse auto-placement puts the DOM-first item (the info row, column 2 in the
  mirrored layout) ahead of the cursor, so the stars row — asking for column 1 —
  gets pushed to a *second row*. That is the "rating stacked under the title"
  bug.
- (If the two columns ever need their baselines matched across — album on the
  number, artist on the discs — the way to do it is `grid-template-rows:
  subgrid` on both with `align-items: baseline` on `.v3-blue`; verified exact
  in Chrome on 2026-09-17 and then backed out, because it was built on a
  misreading of a request about the FEED card. The feed card is where it
  shipped — see *Review cards*.)
- ⚠️ **The title overhangs the rating column, and the artist gives the room
  back.** The rating column's track is sized by its *widest* row — the count
  plus the vinyls — but the title's only neighbour is the compact score above
  them, so a strip beside the title was permanently dead (measured: a 71px
  column against a 28px score). `--sd-title-extra`, set per album by
  `sizeTitleExtra()`, becomes a negative margin on the info row and an equal
  padding on `.v3-blue-artist`. Worth ~34px, a 25% longer title before the
  ellipsis. It has to be measured, not hardcoded: the score is always "N.N" but
  the count is what sets the column's width and it moves ("6k" vs "156k").
  - ⚠️ **The compact row must be `width: auto`.** The base rule says
    `width: 100%`, which resolves against the GRID AREA and pins the row to its
    column — the negative margin then changes nothing and the title gains
    exactly 0px. That was the first version of this fix, and it measured as
    working (the var was set, the margin computed) while doing nothing at all.
  - ⚠️ `sizeTitleExtra` measures **synchronously**, not in a `requestAnimationFrame`.
    rAF doesn't fire in a background tab (same trap as `paintAfterRender`), so
    the callback silently never ran and the title kept its old width. Reading a
    rect forces layout on demand, so the frame bought nothing.
- ⚠️ **Line 1 is three tracks: album, year, and an empty `1fr`.** Two
  content-sized tracks across a `width: 100%` row both stretch, which parks the
  year at the far edge with a hole between it and the title. The flexible track
  also absorbs the artist's span contribution, which would otherwise widen the
  first two tracks and reopen the same hole.
- ⚠️ In the mirrored layout `.v3-blue-title` needs `justify-self: stretch` to
  beat the row's `justify-items: end`. An `end`-aligned grid item is sized to
  its content, so a long album ran left out of its track and over the year
  ("2009 · Man On The Moon…" rendered as "2Man On The Moon…"); stretched, the
  ellipsis in `.v3-blue-album` finally has a box to bite on.
- `.v3-blue-date:empty` is hidden — the year's `·` lives in a `::before`, and
  albums fetched from Deezer arrive `_lite` with no year, which left the dot
  dangling.

Historic geometry, still true of the review state:
- `padding: 17px 12px`
- `border-radius: 0 0 15px 15px`
- Background: `--v3-box2-bg`
- Contains: `.v3-blue-stars-row` with `align-items: baseline` — score number + `halfStars(rating, …)` + review count. Base sizes are score 13px · discs 10px · count 9.5px, with the compact bento scaling the whole row 1.12 (see *Dev Box*). ⚠️ **The two numbers on this line use different families on purpose**: the score is `--font-main` 800 (the headline) and the count is `--font-mono` (metadata). Making them match was tried and flattened the row into one undifferentiated string of digits. `.v3-blue-score` now says `font-family` explicitly rather than inheriting it, so it doesn't read as an oversight.
- `::before` pseudo-element fills the negative space behind the album's bottom-right rounded corner — extends `top: -17px; height: 17px; right: -2px` to close sub-pixel gaps

### Cell: Corner Gap (bottom-right)
- Background matches screen bg
- Contains `v3-fillet-tl` (arc fillet) at top-left
- Contains spinning CD (`.v3-cd`) — **absolutely positioned**, does not affect row height:
  ```css
  .v3-cd {
    position: absolute;
    top: 6px; right: 15px;
    width: 54px; height: 54px;
  }
  ```
- CD click → `onCdTap()`: opens the nav console (the hump grows to show the album + services — see **The nav console**); tapping again closes it. The speaker button (`.v3-preview-btn`) is the master arm/disarm for previews.
- Scroll area gets `padding-top: 30px` to give clearance for the CD which overflows below the bento

### Fillet System
Fillets fill the negative space at the two "step" junctions in the bento.

**Dark theme** — PNG mask approach:
- PNG images have a black arc on white background
- `app.js → initFillets()` uses canvas to strip white pixels → transparent alpha
- Result applied as `mask-image` on `::after` via JS-injected `<style id="v3-fillet-mask-style">`
- The `::after` `background` uses the adjacent box's CSS color var
- **Never put `filter: drop-shadow` on fillet elements** — even with mask on `::after`, the browser composites shadows on the full rect before masking, causing GPU black-line artifacts on scroll

**Light theme** — CSS radial-gradient (no PNG mask):
```css
.s-home-v3--light .v3-fillet-bl::after {
  -webkit-mask-image: none; mask-image: none;
  background: radial-gradient(circle at top right, transparent 19px, #999 20px);
}
.s-home-v3--light .v3-fillet-tl::after {
  -webkit-mask-image: none; mask-image: none;
  background: radial-gradient(circle at bottom right, transparent 19px, #999 20px);
}
```
Because there's no mask-image conflict in the light theme, `filter: drop-shadow` CAN be applied to the outer fillet div here.

Fillet positions:
- `.v3-fillet-bl` — `bottom: -1px; left: -0.5px` of `.v3-search-corner` (top junction)
- `.v3-fillet-tl` — `top: -1px; left: -1px` of `.v3-corner` (bottom junction)

### Scroll Area — the activity feed
`.v3-scroll-area` — `flex: 1; overflow-y: auto; padding: 10px 12px 96px` (matched to `.ntf-scroll`). It holds one thing: `.v3-feed-items`, filled by `renderFriendFeed`.

**Review and rating rows are the ALBUM PAGE'S REVIEW CARD (2026-09-14).** Eric: the album page's review list is what the app is meant to look like, so the feed's reviews wear it — `renderFriendFeed` → `revCardHtml` with `.v3-rev-card--feed` (one builder, see *Review cards*), photo · name over `@handle · when` · the big score column with records, square like and comment pill. Same key as the album page's pinned card (`feedRevKey`), so a like or a comment count is one act on both surfaces. Two things the album page's card doesn't have and the feed's does:
- **The record line** (`o.record` → `.v3-rev-record`: a square cover under the round photo, with the album (13px regular) over artist (11px bold) beside it, all DM Sans since 2026-09-16 — built by `recordWhoHtml`, which the activity cards use too (a follow row passes `tag: 'Artist'`, an 11px/500 lead on the album's line). **No year on the feed** (Eric, 2026-09-16: it was tried left of the album name and came off the same day as too much; it belongs on the album page); a long album name **fades at its right edge** (`.v3-rev-record-album.is-long`, measured sideways by `markLongReviews`) rather than ellipsing; taps `feedOpenArt`). ⚠️ **The score sits on the RECORD's row, not the person's** (Eric, 2026-09-14): with the score column beside the photo the card read "drumkid 4.5" and what was rated was a row further down. The feed card overrides the grid to `"top top" / "rec big" / "text big" / "foot foot"`, so the byline (photo · name · @handle · when) runs the card's full width and the whole score column — number, discs, like, comment — starts on the record row: "Hyperdrama … 4.5" on one line, the cover (53px) and the like (53×53 in px, `aspect-ratio: auto`) still twins beneath. Cover and number share a row top, so nothing is summed to align them; `--rev-obj-gap` (11px) is the air between byline and record row, on both the record line and the score column. ⚠️ A `subgrid` version of the old alignment **ballooned the like button** — a stretched grid item with `aspect-ratio: 1` feeds its row's height back into its width; don't go back to it. The album page's card keeps its own areas and flex column. The album page *is* the record, so no card there passes it. It has its own grid row (`"rec big"`), 0 tall when empty, so the album page's cards lay out exactly as before. `year` comes from `FRIEND_ACTIVITY` or, for persona rows, the archive (`friendAlbumFor`).
- **BASELINES (Eric, 2026-09-17):** the album name sits on the 26px number's baseline and the artist on the discs' bottom — exact, not tuned. The record row is TWO grid rows (`"score rec"` twice, so each area spans both) and `.v3-rev-big` and `.v3-rev-record` are `grid-template-rows: subgrid` with `align-items: baseline`, so number/album share track 1 and discs/artist share track 2 across the columns (`.v3-rev-record-who` is `display: contents`). The 53px cover would have grown the rows, so it carries `margin: -60px 0` (contributes nothing) and `align-self: center`; the ~4.5px it overhangs is given back in `--rev-obj-gap` (15.5) and the text margin (17.5). Verified in Chrome: 0.00px on both pairs, both themes; activity rows unaffected (their verb spans the two rows, centred). Then two **optical lifts** on top (Eric, same day — it read a touch low): the album line `top: -1.5px` (up, deliberately NOT on the number's baseline) and the artist `top: -1px` (up to meet the discs, which overshoot like a round letter). Paint-only; the grid underneath stays exact.
- **FLIPPED (Eric, 2026-09-16)** — after the album page's card landed with its score on the left (see *Review cards*) and he liked it, the feed's record row is now `"score rec"`: the 26px number with the discs **stacked under** it on the LEFT, under the photo, and the record on the RIGHT, mirrored — the cover flush with the card's right edge (`row-reverse`), album / artist / year to the left of it, right-aligned and ellipsing (`max-width: 100%`) so a long title never pushes the cover off the card. The album page's card is the same skeleton with the row's right half empty. ⚠️ The activity cards' verb (`.v3-rev-act`) moved with it into the `score` area — it used to be a hard-coded row/column that now lands on the cover. The grid-override paragraph above describes the layout this replaced; its ⚠️ about `subgrid` still stands.
- **`o.feed`** (the `_FEED` index) lands on the card as `data-feed`. **Two taps, two places (Eric, 2026-09-18):** the CARD (`cmtCardTap`) → `feedOpen` → the album page with the review pinned; the COMMENT PILL (`cmtCompose`) → `feedOpenReview` → the review page itself. The feed never fills `REV_INDEX` (the album page does as it renders), so `feedOpenReview` writes the entry from the feed event under the same `feedRevKey` the album page's card uses — one thread, one like, whichever way in. The pill is a live button now, shown even at zero (it was `pointer-events: none` and hidden at 0 while it merely restated the card tap).
- ⚠️ **`.v3-rev-card--feed` re-inks the card off the `--sd-*` tokens** (a `(0,3,0)` block after the `--light .v3-rev-*` overrides in app.css). Every `.v3-rev-*` colour is hard-coded for the album page's surface, the album's procedural colour, dark in both themes; the feed sits on the screen bg, cream in light. Same trap as `--vinyl-empty` and `.v3-up--feed`: the value follows the surface, not the theme. Its 11px side padding matches `.ntf-row`'s so photos share a left edge with the rows between.
- A rating row is the same card with no text. Cards are flat divider rows like the album page's list — no `--new` fill; the sticky *Today* header says what's new. Their five-line fade runs through `markLongReviews(container)` on the same now / 80ms / 600ms rhythm as the album page.

**The other verbs are still the Notifications component** — favourited · logged · saved for later · added to a playlist · followed are one-line facts, not reviews, and stay `.ntf-group` / `.ntf-row` / `.ntf-ava` / `.ntf-badge` — not a parallel set of classes — and the `--sd-*` token block is scoped to `.s-home-v3` so the home shell inherits the inbox's look whole, in both themes. `--sd-bg` is already exactly the home shell's own background (`#111116` / `#f0ece3`), which is what makes the badge's punch-through ring cut cleanly on all three screens. `.ntf-quote` and the `.ntf-acts` pills below are now only reached if a review row falls back to `.ntf-row`, which none does.

**One photo size below the bento** (Eric, 2026-09-14): `.v3-feed-items .ntf-ava` is 36px with a 9px row gap — the card's photo and gap — so every post's portrait is the same size on the same left edge; the badge steps down to 17px with it. The inbox keeps its 44px. This is the one home-only `.ntf-row` rule that is sanctioned.

⚠️ **Otherwise, do not add home-only row rules to `.ntf-row`.** The feed first shipped with a star line, an upvote pill and its own row spacing, and the result no longer looked like the screen it was copying — which was the whole point. If a row needs to change, change `.ntf-row` and let both screens move together.

**The one sanctioned divergence: engagement pills on review rows.** A feed row for a `review`/`rating` now carries a like pill and a comment pill, because the feed's job is other people's reviews and you should be able to see that one has traction — and add to it — without leaving home. It is built from the **shared** vocabulary and changes nothing about the row's anatomy: `.ntf-foot` holds the timestamp and the pills on one line, and with no pills it is a flex row of one child, so an inbox row that adopts it looks exactly as it does now. That's the difference from the attempt this warning was written about, which also added a star line and its own spacing. **The inbox's own like/comment rows can take `.ntf-acts` as-is** when they want the same affordance.
- The like pill uses **`feedRevKey(e)`**, the same key the album page's pinned card uses — so liking in the feed and liking on the album page are one act, not two counters. ⚠️ Change one and the other has to follow.
- The comment pill calls `feedOpen(n)` like the row does; it exists for the **count** and the affordance. `openFriendReview` opens that review's thread on the way in, so you land on the album page with the comments already cascading.
- **The timestamp sits UNDER the avatar** (`.ntf-who` wraps portrait + time),
  not in the copy column. The body is the row's only elastic part and the time
  was the one thing in it that never needed to be. ⚠️ Changed in **both** the
  feed and the inbox — they are one component, and a time in a different place
  on each is exactly the divergence this section warns about.
- **The score is part of the SENTENCE** — "reviewed X by Y **a 4.5**"
  (`.ntf-line-score`). Said out loud that is how the verb ends, so the row reads
  in one pass instead of the eye jumping to the thumbnail to find out what they
  gave it. It keeps the row's own `--sd-ink`, not `--star`, for the reason
  below. `.ntf-obj` is a single child again and `.ntf-score` is retired.
- ⚠️ **The feed's pills run bigger than `.v3-up--sm` elsewhere**
  (`.v3-up--sm.v3-up--feed`). They're the only tap target on a row you're meant
  to scan past, and at the shared size they were the smallest thing on screen.
  Scoped to `--feed` so the review cards' pills, in a denser column, keep theirs.
- **The score used to go UNDER the cover** (retired, see above) — `.ntf-obj` stacks `.ntf-art` over `.ntf-score`, so the row's object is one unit. Parking the number *beside* the thumb was tried first and cost the copy column ~35px on a row that already wraps; below it costs nothing and reads quieter. ⚠️ Only review/rating rows get a number: `FRIEND_ACTIVITY` hands every row a `rating` whether its verb earned one or not, so printing it on all of them would claim a friend rated something they only bookmarked. ⚠️ It takes **`--sd-ink`, not `--star`** — the gold read as an alert on a row whose job is to be scanned past, and collided with the upvote pill's `is-on` gold in the same row. There is **no vinyl** beside it; the avatar's badge already says the act was a review.
- ⚠️ **`.v3-up--feed` re-declares the pill's colours off the `--sd-*` tokens.** Plain `.v3-up` is hard-coded for a dark surface, which is right everywhere else it appears (review cards sit on the album's procedural colour, dark in both themes) and wrong here — the feed sits on the screen bg, which is cream in the light theme. Same trap as `--vinyl-empty`: the value follows the **surface**, not the theme.

The two **"you may know" rails** (`renderKnowRails`, `.v3-rail` / `.v3-kcard`, memoised into `_KNOW`) used to sit above the feed. They're deleted — markup, CSS and JS.

**Content** (`feedEvents`, memoised into `window._FEED`). ⚠️ **This is the line between the two surfaces:** the **inbox is YOUR interactions** — someone liked or replied to your review, followed you, touched your playlist, one of your things hit a milestone — and the **feed is what other people DID**. Nothing systemic belongs in either: `release` ("X is out now") and `trending` ("this is climbing") were about nobody, sat in both, and read as noise between real activity; they're gone from both. The feed's verbs deliberately mirror the log sheet's own toggles — reviewed · rated · favourited · logged · saved for later · added to a playlist · followed an artist — so it shows friends doing exactly the things you can do. Every feed row therefore has a person, which is why the feed has no `isSys` (cover-as-avatar, no trailing thumb) — the inbox still does, for its milestone rows. Events are generated from `FRIEND_ACTIVITY` on a **fixed rhythm** (`FEED_RHYTHM`), not a roll, so it can't deal four follows in a row — reviews are the backbone (a quote is what the app is for) and `release` / `playlist` / `follow` / `trending` punctuate. Rows are sorted newest-first and bucketed into the inbox's sticky Today / This week / Earlier headers off their `ago` string (`agoMins`); the inbox authors its `bucket` by hand, the feed's rows are generated. A feed has no read state, so **"today" stands in for unread** — the newest group gets the filled `.ntf-row--new` treatment, and that contrast against the flat older rows is most of why the screen reads well.

- ⚠️ `trending` is deliberately **not** the inbox's `milestone`. Reusing the name meant reusing the badge (`--star`), and review rows already took the accent — the two golds were indistinguishable in a scroll.
- `feedFace(user)` gives each handle one `rp-*` photo so a person looks like themselves everywhere: `ntfPeople()` pins the community accounts by hand, the generated feed cast hashes into the same pool.
- `_FEED` is memoised for two reasons: the dark and light shells render separately and would otherwise each deal their own feed, and re-rendering home shouldn't reshuffle it under the user.

**Feed row taps** (rows carry an index into `_FEED`, no attribute escaping — the same idiom the old cards used): tapping the **row** → `feedOpen(n)`, which routes by kind (review/rating → the pinned-review flow, playlist → `openPlaylistPage`, follow → `openArtistPageFor`, release/trending → the album). Tapping the **trailing thumb** → `feedOpenArt(n)` → whatever it's a picture *of*: the album, or the artist on a follow row, where the thumb is their photo and rendered round. The pinned-review flow is unchanged: `openFriendReview(i)` → `openAlbumPage(album, pinnedReview)`, the album page opens, `.v3-body` smooth-scrolls to the review list (rect math divided by the phone-wrap scale), and the tapped review renders **pinned first** in `populateReviewList` (`.v3-rev-card--pinned`, star-outlined with a "from your feed" chip; survives filter switches, cleared whenever an album page opens without a pin).

### The cover's two vertical gestures don't fire into each other (2026-09-14)

Pull-to-refresh (`sdPtr*`, delegated at the document) and Pro's hold-to-open
the shelf wheel (`proWheelInit`) both live on the cover's vertical axis, and
they used to trigger each other both ways: a finger pulling down that was
still on the cover 240ms later armed the wheel (the hold timer ignored
movement), and once the wheel was open, dragging the list was also a pull, so
picking a shelf re-dealt the feed. Two rules keep them apart:
- **Movement before the timer fires cancels the hold** (`HOLD_SLOP`, 8px, a
  pre-arm `pointermove` on the cover). A moving finger is scrolling, swiping or
  pulling, never holding. A pull already `active` also refuses to start a hold.
- **An armed wheel owns the axis**: `window._sdHold` is true from arm to
  disarm; `sdPtrStart` refuses to begin, `sdPtrMove` drops a pull in flight,
  and the document `touchmove` guard `preventDefault`s so nothing scrolls
  under the wheel. Arming also nulls `_ptr` outright.

### Bottom Nav — the floating glass console (`bottomNav(active)` in screens.js)

**The floating bubble is back (2026-09-03).** A wide rounded bar with a raised
centre **hump** holding the now-playing ticker and **five** buttons in the lower
bar: Home · Trending → `wall` · **Shop** · Playlists · Profile. `position:
absolute`, 72% wide, centred, **24px off the bottom**, `aspect-ratio: 553/126`
(~63px tall at the 385px mockup), frosted glass (`.v3-nav-glass`, masked to the
silhouette) under a hairline outline (`.v3-nav-shape`).

- **The Shop is a nav item** (`.v3-nav-item--shop`), glyph `SD_ICONS.bag` — the
  dot-language bag — in the same 21px box as the stroked icons, filled with
  `currentColor` so it lights and dims with them.
- **`.v3-nowbar` rides the hump**: `left/right: 23%`, `bottom: 65px`,
  `height: 22px`. Derived, not tuned — the hump's interior is x 67→485 of 553
  on a bar that is 72% of the screen from 14%, and its floor (the shoulder,
  y=44.79/126) sits ~64.6px up. Change the bar's width and these move with it.
- Scroll areas clear the bar with **96px** of bottom padding (`.v3-body`'s
  callers, `.prof2-scroll`, `.set-scroll`, `.shop-scroll`, `.pfe-scroll`): the
  bar's top stands 87px up (63 + the 24px gap).
- Pinned to the bottom because `.s-home-v3` is `height: 100%; overflow: hidden`
  (constrains the flex column).

⚠️ **It was DOCKED from 2026-08-20 to 2026-09-03**, and everything that came
with docking left with it: full-bleed silhouette `images/BOTTOM_NAV_FULL_INDENT.svg`
(still on disk, reference only), the **scoop** cut from the bottom edge that
cradled the pet and then the shop button (`sdScene` / `sdShopBtn` are no longer
emitted by anything; the pet engine behind `SD_PET_ENABLED` is intact but
homeless), `.v3-nav-gap` and the nth-child nudges, the `.v3-nav-emboss` /
`.v3-nav-nest` / `.v3-nav-blur` / `.v3-bottom-fade` helper boxes and the
`--nav-mask-neg` / `--nav-mask-scoop` masks they shared. **The CD console
STAYED** — the bubble has a hump, so it grows the same way (see *The nav
console*). Eric asked for the bubble and the shop as a plain icon; don't
reintroduce a docked bar's furniture onto it.

### Someone else's profile (`openFriendProfile()` · `restoreOwnProfile()`, `app.js`)

**There is no second profile screen.** `profileHtml` reads ONE global object
(`window.PROFILE`), so opening a friend is a temporary overwrite of it: stash
yours, deal theirs into the same object, navigate. Leaving hands yours back.

- ⚠ **The stash is what makes it safe.** Without it your own profile would
  quietly stay whoever you looked at last — the screen has no idea it is showing
  a guest.
- ⚠ **Dealt from the NAME.** `randomizeProfile(seedName)` runs every draw
  through `seedRng(name)` (FNV-1a → mulberry32) instead of `Math.random`, so a
  friend is **the same person every time you open them**. Re-rolling per visit
  reads as the app forgetting who they were. One stray `Math.random()` left in
  that function breaks the guarantee.
- ⚠ **`navigate(id, 'guest')` is a third direction**, beside `'back'`. It is
  what stops `navigate` re-rolling the profile we just dealt *and* restoring the
  one we just stashed. Every other navigation — including a tap on Profile in
  the nav, which means YOURS — calls `restoreOwnProfile()`.
- The edit pencil is hidden while `PROFILE_GUEST` is set.

**The now bar is the way in.** Tapping `.v3-nowbar` opens whoever is currently on
it (`renderNowBar`).

- ⚠ The handler reads **`bar._nowItem`**, not a captured `list[i]`. The ticker
  swaps on a timer, so a closed-over value would open the person who was on the
  bar when the screen was built rather than the one actually tapped.
- `NOW_SWAP_MS` is **10s** (was 4.2). It is a *reading* window now, not just a
  ticker interval — the bar has to sit still long enough to notice a name,
  decide, and reach it.
- The press is the only affordance it gets, and it is a `scale` rather than a
  colour or opacity change: the bar holds a live waveform, and a fade on tap
  reads as the audio doing something.

### Plan — Free vs Pro (`isPro()` · `setPlan()` · `renderPlanBar()`, `app.js`)

**One global: which account is looking at the mockup.** The toolbar's `Free | Pro`
switch sits next to the persona switcher, and is deliberately the same segmented
control — both answer *who is looking at this screen*. Pro lights **gold**, the
app's reserved-for-paid accent, so the viewer chrome agrees with the storefront.

- **The gate is `body.sd-pro`, not a class per screen.** Dark and Light are two
  live phones on stage at once and the mobile prototype has no toolbar at all;
  one write on `body` covers every shell and survives every screen rebuild.
  CSS gates with `body.sd-pro .x`, JS gates with `isPro()`.
- **A phone is always Pro** (Eric, 2026-09-18): at `≤767px` `SD_PRO` is forced
  true at load, not persisted (the desktop viewer keeps its own choice); `?free`
  on the URL opts out. The mobile prototype has no switch, so it used to be
  stuck on Free — the cover's hold did nothing and the drag fell through to
  pull-to-refresh, which read as "the refresh is eating the hold".
  `.v3-album--wheel` also turns off the OS long-press (`-webkit-touch-callout`,
  `user-select`) and the cover swallows `contextmenu`, both of which cancel the
  pointer mid-hold on a real phone.
- **`setPlan()` re-renders**, it does not patch. Pro changes what screens are
  *made of* — same reason `applyPersona` rebuilds. Persisted to
  `localStorage['spindeck-pro']`; `initPlan()` runs in `init()` **before** the
  first render.
- ⚠ **Buying Pro in the shop routes through `setPlan(true)`.** `sdBuy` special-
  cases `.shop-pro-btn` and returns early — everything else in the shop swaps one
  button, Pro changes the whole app. The row comes back reading "Active" from
  `shopHtml`, so the storefront and the toolbar can never disagree.

**What Pro currently changes**

| Where | Free | Pro |
|-------|------|-----|
| Home bento cover | tap opens the album | tap opens the album, **hold opens the shelf wheel** |
| Profile — Favourite songs | section absent | section shown |
| Edit Profile — Favourite songs | a "Get Pro" row → the shop | the five slots |
| Shop — Pro row | `$3/mo` button | `Active` pill |

⚠️ **Favourite songs is hidden on a Free profile, not locked.** A padlocked,
greyed-out shelf on someone's profile advertises to every visitor what its owner
didn't buy. The upsell goes on **Edit Profile**, the one screen only the owner
sees, where the offer is addressed to the person who can act on it.

#### The shelf wheel has two hosts now (`proWheelInit`)

`shopProInit` (was the only entry point) is now a thin caller:

- **`shopProInit`** — the storefront demo, inside `#shopPro`. Anyone can hold it,
  Free included; that is what a showcase is for.
- **`homeProInit`** — the real feature, on `.v3-bento` on the home screen.
  Returns early unless `isPro()`.

**Committing a shelf means different things per host** (`commit()` → `commitShelf`):

- **Shop** — *cosmetic*. `setMainAlbum` swaps the cover, tint and text on that
  one bento. A storefront demo must not re-deal the real home screen behind it.
- **Home** — *real*. The shelf becomes the **queue**. `albumSeq()` is built from
  `featuredAlbum` + `trendingAlbums` and the For You box shows `seq[i+1]`, so
  `commitShelf` writes those two globals and then runs `applyAlbumIndex(el, 0,
  …)` on **every** `.s-home-v3:not(.s-shop)`. Writing only the main cover left
  For You and the whole swipe queue on the shelf you had just left.
  ⚠ It is `reshuffleHome` scoped to one shelf — same globals, same `shuffled`
  deal. Change the deal there and it changes here.
- ⚠ **Releasing on the shelf you are already on does nothing.** `commit()`
  compares against `liveIdx`; a hold that ends where it started is a *cancelled*
  gesture, and re-dealing would throw away the album on screen for no reason the
  user can see.

**The shelves** (`shelfPool()` — the one place that knows what a shelf means)

Ordered broad → narrow: the three ways of cutting the whole catalogue, then
genres under them.

| Shelf | Pool |
|-------|------|
| For You | the unfiltered catalogue |
| Friends | albums a friend logged — via `friendRecFor`, the same lookup the feed and the cover's friend tag use, so they cannot disagree |
| Popular USA | top 20 by `reviewCount`, already in the catalogue — no new data |
| **Genre** | not a shelf — the door to the mix dial (`kind: 'mix-open'`), real home only |

⚠️ **THE FLAT GENRE ROWS ARE GONE FROM THE WHEEL.** It listed the archive's
first eight genres, which was the only way to pick one before the mix dial
existed. With the dial there, a second flat list meant two controls for one job
that could not agree — the wheel offered eight bare labels read off the
catalogue, the dial offers sixteen families and 236 subgenres and can combine
them. The one that cannot express a mix is the one that went. ⚠️ `shelfPool`'s
`genre` branch (the `default:` case) is deliberately left in place: the shop's
cosmetic commit still resolves shelves by label, and it is the fallback for any
kind with no branch of its own.

⚠️ **The row is called "Genre", not "Custom mix".** It is now the only genre
control there is, so it is named for what it gives you rather than for the
shape of the thing behind it — "Custom mix" described the dial, which you have
not seen at the moment you are reading the row. ⚠️ The shop's showcase wheel
has no such row (`realShelf`) and is therefore three rows now; that is still
enough to demonstrate the hold, the lens and the drag, which is its whole job.

⚠ Any shelf that cannot field **two** albums is dropped when the wheel is
built, not caught at commit — so an unusable shelf never appears rather than
appearing and doing nothing. Friends is the one that needs this most: it depends
on who the persona follows. `shelfPool` is called at build time *and* at commit,
so a shelf reflects an `ARCHIVE` that `expandRecs` has since widened.

Two ⚠ that only matter on the home host:

- **`touch-action` is CSS and a class, not an inline write** (`.v3-album` /
  `.v3-album--wheel` in `app.css`; `proWheelInit` only adds the class). The
  wheel drags vertically, so it needs `none` where the swipe leaves `pan-y` —
  without it the browser claims the drag for panning and the wheel never moves.
  ⚠ It **used** to be two inline writes racing: `setupAlbumSwipe` wrote `pan-y`,
  `proWheelInit` wrote `none` after it (`populateHomeData` calls the swipe
  first), and inline beat every rule in `app.css` — which is why the old
  `.shop-showcase .v3-album { touch-action: none }` never applied. The browser
  latches `touch-action` at touch-start, before any JS runs, so it has to be
  state rather than a flag left by whoever wired last. As classes it is ordinary
  specificity, and the album page can out-specify both to take the drag back.
- ⚠ **The wheel is tinted by the ALBUM, not by gold.** The lens and the selected
  row read `--v3-accent`, extracted from the cover by `applyAlbumColors` and set
  on the screen element, so it inherits down and the wheel re-tints with every
  album — the bento's "album art drives colour" rule applied to the thing
  sitting on top of the art. Gold is the fallback only. `color-mix()` is what
  gets one variable to two alphas for the lens; a fixed `rgba()` cannot follow a
  var. (`color-mix` is already used elsewhere in `app.css`.)
- ⚠ **A row is a fixed box.** The selected row is set at **24px** against the
  others' 13px — the size step is what makes a list read as a wheel — but
  `height: var(--pick-h)` and `line-height: 1` do not move. Only the glyphs
  scale. Let the row grow with its font and every row below it shifts, so the
  drag arithmetic (whole units of `--pick-h`) walks out of step with what is
  under the lens. Flex + `align-items: center` is what lets 24px type sit in a
  34px box without re-tuning a line-height each time.
- ⚠ **The finger and the list are measured in DIFFERENT units.** `paint()`
  moves the list from inside the box, so it counts in CSS px (`SHOP_PICK_H`);
  the drag happens outside it and counts in **rendered** px (`rowPx()`, the row's
  own `getBoundingClientRect().height`). They are the same number on the home
  screen and are not in the shop, where the model is `transform: scale()`d — nor
  anywhere when the desktop viewer is zoomed. Using the constant for both is
  what made the wheel need a 1.3× longer drag per row inside the shop.
- ⚠ **`--pick-h` (app.css) and `SHOP_PICK_H` (app.js) are ONE number in two
  files** — 34. The CSS var sizes the rows and the lens and centres both via
  `calc(50% - var(--pick-h) / 2)`; the JS constant is what the drag counts in.
  If they disagree, the row under the lens stops being the row you get.
- **Each row carries its album count**, set in **Crimson Text italic** against
  the labels' DM Sans. A different voice reads as an annotation on the list
  rather than as part of a label. The number is the "how much of me is this"
  figure: For You is the whole catalogue, a genre is your slice of it, so
  reading down the wheel shows where your listening actually sits.
- ⚠ **The wheel does NOT use `backdrop-filter`, and must not go back to it.**
  It did, and the blur could not be made to cover the cover: `backdrop-filter`
  samples its backdrop in the coordinate space of its **backdrop root**, and
  `.v3-album` sits under both a `transform` (the sub-pixel optical nudge,
  `--album-dx`) and the viewer's `zoom` on `#phone-container`. Neither is
  accounted for, so the sampled rect landed offset and a strip of cover stayed
  sharp. Growing the box only moved which edge the strip showed on (left, then
  bottom) — the offset is in the *sampling*, not the geometry.
  The blur is a painted layer instead: `.shop-pick-bg`, a copy of the cover with
  `filter: blur()`, filled by `syncBg()` **on every arm** (the cover changes with
  every swipe and commit). `transform: scale(1.14)` overscans so the blur's own
  soft edge is pushed outside the wheel's `overflow: hidden` rather than showing
  as a pale rim. Ancestors clip ordinary content reliably, so it cannot fall short.
- ⚠ **The wash is a layer (`.shop-pick-tint`), not a background on `.shop-pick`.**
  A parent's own background paints *beneath* its children, which would put the
  tint under the very thing it is there to darken.
- `.shop-pick` keeps a symmetric `inset: -4px` as belt and braces for the
  sub-pixel nudge; the parent's `overflow: hidden` trims it. ⚠ Keep it
  **symmetric** — `top: calc(50% - 13px)` centres the wheel on this box, and a
  box grown equally on both sides has the same centre.
- **An armed release has to eat the following click** (`eatNextClick`). On home
  the cover keeps its tap-to-open-album handler, so a shelf change would also
  navigate away from the screen it just changed. The listener goes on
  **`document`**, not the cover: at the *target* phase the DOM fires capture and
  bubble listeners in **registration order**, so a capture listener added to
  `.v3-album` still runs after the `onclick` `setMainAlbum` put there first.
  Only an ancestor's capture listener is guaranteed to go first. Self-removing,
  with a 400ms fallback timer for the release that never produces a click.

⚠ **`.shop-owned` is visible by default now.** It used to be `opacity: 0` until
`sdBuy` added `.is-in` — which meant the tiles you *start* owning (Funky 01,
Hairline, Devotee) rendered blank, because they come straight from `shopHtml`
with no JS to light them. The fade is opt-in via `.shop-owned--new`, which only
the pill `sdBuy` creates carries.

### Shop — the nav's Shop item + the `shop` screen (`shopHtml()`)

**The shop is the middle item of the floating nav** (`.v3-nav-item--shop`,
`SD_ICONS.bag`) since 2026-09-03. Before that it was the docked bar's scoop
button (`sdShopBtn()`, still defined, no longer emitted); the notes below on
`.sd-shop-btn` describe that retired placement.

- **The button** — `.sd-shop-btn` copies `.sd-scene`'s geometry exactly: 63×30,
  `left: 49.1%`, `bottom: 2px`, `z-index: 7`. ⚠️ **Keep the two in step** — if
  the pet ever comes back they have to land on the same spot. The one real
  difference is `pointer-events`: the pet was decorative, this is pressable, so
  it takes the whole scoop as its hit area. The glyph is `SD_ICONS.bag`, a new
  5×5 entry in `SD_DOT_ICONS` (handles over a box), sized **22px against the
  scoop's 63px FLAT TOP, not its 123px opening** — the same narrow-end
  constraint the face was fitted to. `bottomNav(active)` passes `active`
  through `sdScene` so it can light up on the shop screen.
- ⚠️ **`sceneReact` bails when nothing carries `.sd-scene`.** Without that guard
  the first reaction pushes onto `_sceneQ` and starts `sceneFlush`'s 400ms
  interval, which then has no pet to flush to and ticks forever.

#### The four aisles (`SHOP_CATS` · `shopCat` · `data-cat`)

**General is not a category, it is the FRONT of the store** — a little of each of
the other three. Events, Themes and Badges are the full shelf.

| Tab | Shows |
|-----|-------|
| General | Pro showcase · Pro pitch · 2 featured events · 5 themes (Furry among them) · 4 badges |
| Events | the Pro pitch + all 6 events |
| Themes | all 7 themes (Furry is one) + the 4 frames |
| Badges | all 8 badges |

- **A thing can be in two aisles at once** — `data-cat="general events"`. That's
  how the storefront shows the *same tile* the Events tab does, instead of a
  second copy that drifts. **No `data-cat` at all = never filtered** (the back
  pill, the title, the bar, the footnote).
- ⚠️ **The filter is CSS, not a re-render.** `shopCat` writes one attribute on
  every `.s-shop` and the `.s-shop[data-cat=…]` block does the hiding. A rebuild
  would tear down the Pro showcase — a **live bento with the shelf wheel bound
  to it** — four times a browse, and reset every tile you'd already bought.
- ⚠️ **Every shell, not just the one you clicked.** Float·Dark and Float·Light
  are the same screen in two themes; a filter that moved on one would read as
  two different storefronts side by side. Same reason the plan writes to `body`.
- ⚠️ **The tabs carry `data-go`, not `data-cat`** — they live inside
  `.shop-scroll`, and a tab that could filter itself away is a one-way door.
- ⚠️ **`window.SHOP_CAT`, not a local.** Buying Pro calls `renderViewer()`; a
  tab that snapped back to General every purchase would be its own bug.
- ⚠️ **The bar is `--sd-bg`, never `--bg`.** `--bg` stays dark on both shells
  (`.s-home-v3` hard-codes `#111116`), so it painted a black band across
  Float·Light and swallowed three of the four tabs. `--sd-bg` tracks the shell.
- ⚠️ **Adding a fifth category means a fifth line in that CSS block** — CSS
  can't compare an ancestor's attribute against a descendant's, so each aisle
  has to name itself.
- **Frames live under Themes**, not an aisle of their own: four categories was
  the brief, and a ring around your favourites is the look of your page the same
  way a theme is.

#### The top of the shop (Eric, 2026-09-17)

- **`.shop-top` is ONE ROW**: the back pill on the left and the dot-language SHOP mark in the upper right at the pill's level, 18px tall (it was a 34px heading on a line of its own). A label, not a heading — it must not push the store down.
- ⚠️ **The aisle bar is NOT sticky any more** — `.shop-cats` scrolls away with the page and paints no background. The `--sd-bg` warning above only matters again if it is ever pinned back.

#### Skins — the FURRY THEME (`SKIN_IDS` · `bentoSkin` · `bentoSkinOwned` in app.js)

**Furry is sold as a THEME now (Eric, 2026-09-17)** — a `.shop-tile--theme` in the Themes shelf (`furryTheme` in `shopHtml`, second after Funky 01), not a "Skins" row of its own; that section is gone. It is the one theme that is real state: the machinery below is unchanged, only where it is sold moved. Worn, it also puts **dog ears on your profile card** — `profEarsHtml()` draws the skin's two ears INSIDE `.prof-base`, standing on the name banner's flat top above the picture pane (x 48→328 of 690; the banner's flat top is 35→340 at its narrowest, so they always have ground), so the card's own emboss shadow shapes them and they take `--pf-base`. Always emitted, shown by `body.sd-skin-furry .prof-ears`. Settings › Appearance calls the switch `Furry theme`.

A skin dresses the **home bento** — Furry (Eric, 2026-09-04) is ears above the
top edge and a tail curl below, drawn as `bentoSkinBackHtml` /
`bentoSkinFrontHtml` in screens.js and coloured from the same
`--v3-box1-color` the fill uses. It shows via a body class (`sd-skin-furry`)
so every shell on stage wears it at once.

- ⚠️ **Owned and worn are two facts** (2026-09-11): `SD_SKIN` is the one being
  worn (`localStorage['spindeck-skin']`, or null for a bare bento) and
  `SD_SKIN_OWNED` is everything bought (`'spindeck-skin-owned'`). They used to
  be one key, so buying Furry put it on with no way off short of clearing
  storage. Anyone wearing it from the old key is migrated into the wardrobe.
- **The shop tile is the toggle once owned.** Unowned → the `$2` buy button;
  `sdBuy` routes `data-skin` through `buyBentoSkin` (own + wear) and then
  **re-renders like Pro does**, because the tile's owned state is a
  `Wear / Wearing` pill (`.shop-wear`, filled in the star when on) that
  `shopHtml` owns — an "Owned" pill swapped in by hand could never take it off.
- **Settings › Appearance** carries the same switch (`Furry bento`), or a
  chevron to the shop when it isn't owned yet. It is real state, so it does
  **not** go through the presentational `sdToggle`.
- Every control is stamped `data-skin-wear="<id>"` and `syncSkinControls`
  patches all of them in place (Dark + Light shells, shop tile + settings
  switch) — no re-render, so flipping it keeps your scroll position.
  `setBentoSkin` refuses an id that isn't owned.

#### Events — tickets, and what Pro actually unlocks (`SHOP_EVENTS`)

The one thing in the shop that **is not a cosmetic**. Everything else dresses up
your page; a ticket gets you into a room — which is why it gets `--list`.

- **`pro: true` renders BOTH states** — the locked `.shop-lock` pill *and* the
  real price button — and **`body.sd-pro` picks one** in CSS. ⚠️ This is the
  point: flipping the toolbar's Free/Pro switch unlocks the whole list in front
  of you, art coming up out of its wash, with **nothing rebuilt**. Gating in JS
  would need a re-render, and a re-render loses the shelf wheel.
- ⚠️ **`.shop-owned` is gated with the button.** Buy as Pro, drop to Free, and
  an ungated "Going" pill would sit on a row you're no longer allowed into.
- **`feat: true` is what General shows — two of them, one of each kind.** The
  storefront gets two rows to say both *there are tickets here* and *some are
  Pro's*, so it can't spend them on two of the same thing.
- **The art is album art already in `images/`** — artists whose records are in
  the archive, so the storefront never bills a record the app has never heard of.
- The Pro pitch row rides along to the Events tab (`data-cat="general events"`):
  that's the one tab where half the list is locked, so it's where the offer
  answers a question the user is already asking.

#### The sheet system — the bento crossed with an app store

The brief was "our bento mixed with the Apple Store". Those pull opposite ways:
the bento is **dense and interlocking**, a store front is **airy and browsable**.
The screen resolves it by scale — **density inside a section, air between them**.

Below the Pro showcase, a section is a **sheet** (`.shop-sheet`): tiles that butt
together over a **3px seam of screen bg**, one outer radius, `overflow: hidden`.

| Sheet | Shape | Holds |
|-------|-------|-------|
| `--shelf` | horizontal rail, bleeds and peeks | Themes |
| `--row` | N equal tiles across | Frames, Badges |
| `--list` | full-width rows, stacked | Events |
| `--pro` | a single row | the Pro pitch + price |

- ⚠️ **`--list` is the only sheet that is not a tray of swatches, and that is
  the bar a fifth type has to clear.** The other three hold things you judge at
  a glance; an event is four facts read **in order** — who, what,
  where-and-when, how much — which is a row, not a square. If a new product can
  be understood by looking at it, it belongs in one of the existing three.

- **`--shelf` is `.v3-aa-row` unchanged** — `margin: 0 -12px` + `padding: 0 12px`
  + `scroll-padding-left: 12px` so a snap doesn't scroll the padding away. The
  last tile peeking off the frame is the point.
- ⚠️ **The sheet casts nothing.** Tiles are what sit proud, via `--sd-card-hi`
  (inset highlight, no cast shadow) like every other card in the app. There is
  no shared tile base class — the two tile kinds have nothing in common past
  that fill.

### Pro · the mix dial (`mixInlineBuild` · `openMixDial` · `beltPath` in `app.js`)

**The logo is a belt drive, so this builds one.** Genres are the holes of a dial;
picking one turns it into a **pulley** and the belt re-wraps to take it in. Pick
one and the shape on screen is the Spindeck logo exactly — big wheel, small
wheel, belt. Pick six and it's a machine you built.

**Where it sits — IN THE BENTO, not in a window.** Pro's cover-hold opens the
shelf wheel: a vertical scroll over the album art that picks **one** shelf. Its
last row is **Genre**, which opens the dial instead of committing. The dial
takes the **same square** (`.v3-album`) and its commit sits in **`.v3-blue`**
directly beneath it, so choosing a mix happens on the object it changes.
Confirming calls `commitShelf({kind:'mix', genres:[…]})`.

- ⚠️ **It was a bottom sheet, and must not go back to being one.** A window
  sliding up in front of the bento covered the very thing you were deciding
  about, and added a surface you then had to get out of. `.mix-overlay` /
  `.mix-sheet` are gone; `.mix-inline` + `.v3-blue-mix` replace them.
- ⚠️ **The gesture is a TAP (`mixDialTap`), not a rotary turn.** It *was* a
  turn — press a hole, drag it clockwise to a finger stop, release there to
  commit. That was a lovely gesture in a sheet 340px wide and it does not
  survive the move into a 291px square, where the same travel is a few degrees
  of a much smaller circle. Tapping is also the only thing that lets you add a
  second genre without undoing the first, which is the whole point of a mix.
  Gone with it: `mixDialDrag`, `mixDialFocus`, `dialCW`, `DIAL.stop`,
  `DIAL.commit`, `.ob-dial-stop`, `.ob-dial-plate` (a plate is what a dial turns
  *against*) and the ring's `transform-origin` / spring transition.
- ⚠️ **The belt is untouched by any of that.** It was never the gesture — it is
  the picture of what you built — and it still redraws on every toggle.
- ⚠️ **It is ALSO onboarding's step 3 — again, by decision (2026-09-03).** It
  left once because a new user's first thirty seconds is a bad place to teach
  a gesture and a wall of chips is instantly legible where a dial is not. It
  came back with that objection *answered*, not overruled: step 3 offers the
  wheel **and a list of the same tree**, one switch apart, so nobody has to
  learn the dial to get through the door. Same code, through a **dial
  context** — see *Dial contexts* below and *Step 3* under the Onboarding
  Wizard. Don't fork the dial to put it somewhere; give it a context.
- ⚠️ **Only on the real home** (`opts.realShelf`). The shop's showcase commits
  cosmetically to one bento; the demo must not reach out of its case.
- `MIX` lives outside the DOM, so closing and reopening returns you to the mix
  you were building.

#### The info box while mixing: pills on top, count + New deck on the floor (2026-09-18)

`.v3-blue-mix` is a column: **`.v3-blue-mix-picks`** (the pills, full width, wrapping,
`flex: 1; min-height: 0`) over **`.v3-blue-mix-row`** (`.v3-blue-mix-n` — "41 albums
· related" — on the left, `.v3-blue-mix-go` on the right). It was the other way up,
with the pills in a sideways scroller beside the button.

- **The pills shrink the more you add (`mixFitChips`)**. Every measure on
  `.v3-mix-chip` is in `em` off one property, `--chip` (the font size, set inline on
  the picks row): 9px, stepped down by .5 until the wrapped rows fit the picks
  area, to a floor of 5.5px; past that the tail is folded into a **"+N"** chip
  (`.v3-mix-more`, no `data-g`, so the delegated remove-on-tap ignores it).
  Nothing scrolls and nothing can reach the bottom row — `overflow: hidden` is
  only a safety net.
- Measured at 393px with 1 → 64 picks: 9px up to ~6 pills, 6.5px to ~16, 5.5px
  +N beyond ~20; chips always end above the row and inside the box.
- ⚠️ `mixFitChips` skips a bar that is not laid out (0 tall) and
  `mixHomeReadout` runs it again in a rAF for that reason.

#### Dial contexts (`MIX` · `OB_MIX` · the `d` argument)

The dial has **two hosts** — the bento and onboarding's step 3 — and one set of
code. Every function that draws or reads a dial takes a **context** as its last
argument, `d`, defaulting to `MIX` so the home's call sites read as they always
did. A context is:

| field | what |
|---|---|
| `genres` / `at` / `from` | the state, as above |
| `ring` | the ring as drawn — `items`, and `seat[hole] = item index` |
| `wraps()` | every `.mix-inline` this dial is drawn in **right now** |
| `onSync()` | what to repaint besides the dial: the home's info box, onboarding's chips + list + footer |

- `MIX.wraps()` is the one wrap on `mixHost`; `OB_MIX.wraps()` is one per
  rendered `.s-onboarding` — the viewer shows dark and light side by side, and
  `mixDialRender` / `mixHubSync` / `mixDialSync` walk **all** of them, so a step
  into a main happens on every instance at once.
- ⚠️ **`OB_MIX.genres` IS `OB.genres`** — the same Set by reference, never
  reassigned — so the wheel, the list, the chip row and Continue's count cannot
  disagree, and `obStart`'s `.clear()` empties the dial with the rest.
- `mixWrapSync(wrap, d)` paints state onto one wrap (lit holes, belt, record);
  `mixDialSync(d)` does every wrap then `d.onSync()`. `mixHomeReadout` is the
  home's `onSync`, and is where the info-box count / chips / New deck live.
- ⚠️ Don't add a third global. If the dial is ever wanted somewhere else, it is
  one more context object and a wrap built the way `obMixBuild` builds one.

#### ⚠️ TWO LEVELS: mains, then subgenres (`SD_GENRE_TREE` · `mixRing`)

The dial used to be one ring of twenty flat genres. It is now **eight main
genres**; tapping one takes you **into** a ring of its subgenres, which is where
picking happens. `SD_GENRES` in screens.js is no longer the dial's list — it is
only the onboarding chips.

| you tap | what happens |
|---|---|
| a **main** (top ring) | you go *into* it. It does not toggle — a main is a door. |
| **the main itself**, lit, in the hole it had on the ring above | picks the whole main |
| a **subgenre** | picks just that |
| **Back** (the corner pill) | up one level; from the top ring, out of the dial |

- **Multi-select, and across mains.** Picks accumulate in `MIX.genres` no matter
  which ring they came from: Ambient + Techno + K-Pop is a normal mix. One pick
  is also a mix — there is still no minimum.
- ⚠️ **Back steps ONE level.** From inside a main it returns to the mains; only
  from the top does it close the dial. Closing from two levels deep would throw
  away the step you took as well as the one you meant to undo, and there is no
  other way back up — the mains are not on screen while you are inside one.
- ⚠️ **A lit MAIN means "something in here is picked", not "this is picked"**,
  so it draws as a *ring* (`.ob-hole--main.is-on`) where a real pick draws as a
  solid fill. A door and a switch must not look alike. The belt still wraps the
  lit mains, so the top ring shows you where your mix is even though the picks
  are a level down.
- ⚠️ **`at` resets on every open, `genres` never does.** The ring you happened to
  be standing in is not work; the picks are.

##### ⚠️ 16 holes a ring, and that cap is what buys the big dots

**16 mains × up to 15 subs**, on rings of **13-16 holes**. ⚠️ Seven sub rings
are short of 16 because a main that names itself among its subs has that sub
dropped — see *The main you chose is IN the ring it opens*. Nothing is ever
OVER 16, which is the number that matters here. The cap is not arbitrary and it is not editorial:

| ring / holeOn | at | apart | clear | label budget (axis / corner) |
|---|---|---|---|---|
| 80 / 12 | 20 holes | 25.0 | 1.0 | 61 / 127 |
| 62 / 9 | 20 holes | 19.4 | 1.4 | 82 / 148 |
| **59 / 10.5** | **16 holes** | 23.0 | **2.0** | **84 / 150** |

Neighbours sit `2·ring·sin(π/n)` apart and that must clear `2·holeOn`, so
**bigger dots and a tighter ring are only compatible with fewer holes.** At
twenty the dots have to shrink to stay apart — the opposite of what was wanted.
Sixteen buys larger pulleys, a ring closer to the record, more daylight between
neighbours *and* a slightly better label budget, all at once.

⚠️ **Add a 17th sub to any main and the picked holes start touching.** If a main
needs more than fifteen, split it into two mains rather than growing its ring.

Measured at this geometry across all 17 rings / 272 holes: **0 labels overflow,
0 trimmed, 0 size-reduced** — every name fits at full width and full size, so
the three-step fit is pure safety net again.

##### Stepping between rings turns — right going in, left coming out (2026-09-18)

The ring swap (`mixDialRender('in' | 'out')`) still shrinks the old ring into the
record and grows the new one out of it, but both now **rotate 50° as they go**:
clockwise on the way INTO a main's subgenres, anticlockwise on the way back OUT
(`.ob-dial--leave-in/enter-in/leave-out/enter-out` in app.css — pure CSS, the
JS is unchanged). Both rings of one step turn the same way, so it reads as one
motion handed from ring to ring. The record does not turn and the held hole
(`mixStayHole`) still stands still. ⚠️ An earlier note said directional variants
"only ever read as inconsistency" — those had the two rings turning *against*
each other. Keep the angle small; past ~50° the arriving labels smear.

##### Opening: the dial spins into place (`.is-opening` / `mixSpinIn`)

The ring and the record turn up out of the middle of the cover together, .5s,
anticlockwise into place with a long decelerating tail.

⚠️ **It is the ONE time the two move as a single object.** Stepping between
rings deliberately holds the record still — it is the fixed thing the rings are
read against — but on arrival there is nothing to be fixed against yet, so the
whole dial is free to move, and a record is a thing that spins.

⚠️ **A KEYFRAME, not a transition.** Both svgs are fresh elements at this point
and a transition needs a previous value to run from, so it would never fire —
the same trap `.ob-hub-t` documents.

⚠️ **The class goes on the WRAP, not the dial.** `mixDialRender` replaces the ring
on every step, so a class on it would be lost — and the record is a sibling
that has to spin with it. It is removed and re-added around a reflow so a
reopen actually replays it; an animation does not restart just because its
element was re-marked.

⚠️ **Keep the turn under one full rotation.** Past that the labels smear into an
unreadable band and it stops reading as a dial arriving and starts reading as a
loading spinner.

##### The main you chose is IN the ring it opens, in the same hole

Step into Electronic and "Electronic" is on the sub ring too — lit, and **in
the hole it already occupied**. The one thing that does not move between the
two rings is the name you pressed, which is the whole of how you know what you
opened and where it went.

⚠️ **GOING IN PICKS IT.** Tapping a main is a statement that you want that
genre — the ring of subgenres is there to REFINE it, not to make you say it
twice — so the main lands in `MIX.genres` on the way through and the hole you
arrive on is already **filled** rather than merely outlined. One tap on that
same hole (or on its chip) takes it back out. This is most of what makes a
single tap enough to build a deck. ⚠️ It is re-added on every entry, including
after you removed it and stepped out and back in; that is the price of "the
genre you opened is in your mix" holding without exception.

- **`MIX.from`** records `{hole, n}` on the way through, read off the context's `ring` —
  the ring as actually drawn, seating included.
- **`dialSeating(labels, pin)`** nails that one item to that one hole and seats
  everything else around it. ⚠️ Without a pin it is byte-for-byte the old
  function — same sort keys, same tie-break on the original index — so an
  unpinned ring is seated exactly as it was.
- **`mixHerePin`** is where the two rings disagree in size. Both are normally 16
  (16 mains; 15 subs plus the main itself), so it is the same index at the same
  angle. When they differ it matches the **angle**, not the index, because
  `dialAngleOf` folds in a per-count rotation (`dialOffset`) and the index alone
  would point somewhere else entirely.

⚠️ **AN OUTLINE, NOT A FILL, because it is not necessarily picked.** The ring
means "this is where you are"; the solid fill means "this is in your mix".
Tapping it does pick the whole main, and `.ob-hole.is-on` is (0,3,0) against
`.ob-hole--all`'s (0,2,0), so the fill lands on top and the two states read as
one control. ⚠️ Do **not** reuse `.ob-hole--main.is-on`'s ring for it: that ring
already means "something in here is picked" on the ring above, and the same
mark cannot mean two things one step apart.

⚠️ **THE HEAD HOLE IS NO LONGER LABELLED "All X".** It is the genre you tapped,
so it is spelled the way it was spelled on the ring you tapped it from — a hole
that "did not move" but changed its name has not really stayed put. Its
**value** is untouched, so `MIX.genres`, `mixHoleOn` and `mixShelf` all speak
exactly what they spoke before. The **chip** in the info box still says "All
Electronic", deliberately: in a row that mixes families with subgenres it is
the only thing marking which is which.

⚠️⚠️ **A MAIN THAT LISTS ITS OWN NAME AMONG ITS SUBS IS DROPPED FROM THE SUBS,**
and that only became a bug when the head stopped saying "All X". **Seven of the
sixteen do it** — Jazz, Punk, Folk, Country, Classical, Soundtrack,
Experimental — because straight-ahead jazz is a genre as well as a family. With
the head reading "All Jazz" the pair was merely redundant; reading "Jazz" they
are the same word twice on one ring **and the same value**, so `mixHoleOn` lights
both and either one toggles the same pick. Verified across all 16 mains: **0
duplicate labels**.

⚠️ **Those seven rings are therefore 13-15 holes, not 16**, and their main lands
at the nearest angle rather than the identical one — measured, 9 of 16 keep
their exact hole and the other 7 shift by a hole's worth or less (Country, at
13 holes, moves furthest). That is what the angle fallback is for, and it is
the price of not printing a genre twice.

⚠️ **THERE WAS A FLIGHT HERE AND IT IS GONE.** The chosen hole was held lit for
190ms and its label then travelled into the middle of the disc to become the
record's label (`MIX_PICK_MS`, `MIX_FLY_MS`, `mixFlying`, `mixPicking`,
`mixPickIn`, `mixFlyLabel`, `.ob-fly-*`, `.is-handoff`). It answered the same
question and was rejected for how it read — a name crawling out of the ring and
into the centre is unsettling to watch — and it charged **490ms on every step**
for an answer that costs nothing when it simply waits for you at the other end.
⚠️ The step is instant again. Don't put a beat back in front of it.

##### Stepping between rings: IN, THEN OUT. Never both.

The genres shrink into the record and vanish; only once they are gone do the new
ones come back out of it. **One ring on screen at a time, always.**

| | transform | opacity | delay |
|---|---|---|---|
| leaving | `scale(.18)`, .2s accelerating in | 1 -> 0 over .1s | 0, fade held to **.1s** |
| arriving | from `scale(.18)`, .26s decelerating out | 0 -> 1 over .12s | **.22s** |

The old ring is fully transparent at .16s and the new one does not begin until
.22s, so there is a real gap with nothing on the dial but the record.

**FIVE versions, and the first four all failed the same way.**

1. **Outward zoom** — flickered; the rings line up.
2. **One tick of rotation** — a ring of identical dots turning one notch is
   ambiguous.
3. **Collapse into the record, grow back out**, .2s head start — the head start
   was not a gap.
4. **The NYOOM** — `scale(2.8) rotate(-26deg)` leaving, `scale(.25)
   rotate(34deg)` arriving, .14s handover, split easing. Xbox-dashboard depth,
   and the most elaborate of the four.
5. **This.**

⚠️ **THE OVERLAP WAS THE WHOLE PROBLEM, and version 4's note claimed it was
fine.** It argued the outgoing ring is "enormous and nearly transparent by the
time the incoming one is legible, so they never compete as text". They compete
the entire time. Sixteen names over another sixteen reads as a **stacking bug**,
not as motion, however they are eased — and that is what every version above was
reported as. **There is no timing that makes two rings of text legible at once.**
If a future version overlaps them again, it is this bug again.

⚠️ **ONE state for all four cases** (`--leave-in` / `--enter-in` / `--leave-out`
/ `--enter-out` share a declaration). In and out are the same movement because
the record is the same place either way; directional variants — opposite spins,
opposite Z — only ever read as inconsistency. `.18` is about the hub's own
radius, so the ring disappears at the size of the record.

⚠️ **No perspective, no `translateZ`, no rotation.** Depth is scale, and the
record is a fixed anchor the eye is already on, which is what makes plain scale
legible here where it failed in version 1 — there the rings dissolved into each
other with nothing to shrink *towards*.

⚠️ **THE FADE IS HELD, THEN QUICK — do not fade across the whole shrink.** The
first cut ran opacity .16s against a .2s move, so the ring was half transparent
before it had visibly gone anywhere and the trip into the record was invisible:
it read as a plain dissolve, and was reported as the animation simply not
happening. The exit stays solid for its first half and winks out at the small
end; the arrival fades in over the first .12s of its growth.

⚠️⚠️ **THE START STATE MUST NOT TRANSITION, and it must be SCOPED to beat the
rule it overrides.** `mixDialRender` sets the small state, forces a reflow, then
clears it. Once the arrival took a .22s delay that stopped working: adding the
class starts a transition that is still inside its own delay when the class
comes off, and the reversal resolves to a **zero-duration** transform — so the
new ring simply appeared at full size. The fix is `transition: none` on the two
enter states, and the first attempt at it did nothing at all, because
`.ob-dial--enter-in` is (0,1,0) against `.mix-inline .ob-dial` at (0,2,0) and
lost the cascade outright. It is written `.mix-inline .ob-dial--enter-in`.

⚠️ **Diagnose this with `getAnimations()`, not by watching it.** It lists the live
CSSTransition objects synchronously, so it reports real durations and delays in
a backgrounded tab where nothing paints and every timer is clamped to a second.
Both failures above were invisible to a computed-style read — the property said
.26s throughout — and obvious the moment the transitions were listed:
"transform 0ms +220ms". ⚠️ A ghost reading "NONE" in a throttled tab is usually
not a bug: the previous move had not finished, so the element was already near
scale(.18) and marking it a ghost changed nothing. Settle the ring, then step.

⚠️ **`mixDialRender` deletes any ghost still in flight before starting a new
one.** ⚠️ That sweep runs BEFORE the live ring is picked — a ghost sits ahead of
its replacement in the DOM, so querySelector hands back the ghost and the sweep
then detaches the very node about to be inserted next to. `MIX_ANIM_MS` (**240**, matched to .22 + .26 minus the fade) removes the
outgoing dial on a timer, and tapping faster than that timer left two, three,
four rings stacked in the box — the *other* half of the reported bug, and one no
easing could have fixed. Both dials share the box for the length of the exit, so
the outgoing one is out of flow.

##### The record is its own layer, and it lights up (`mixHubSvg`)

⚠️ **The hub had to come OUT of the dial's svg.** The transition flies the whole
ring, and the one thing that must not move is the record it flies out of and
back into — anything sharing the animated element goes with it. It is a second
svg on the same viewBox, so hub and ring stay in one coordinate system and
`DIAL` still describes both.

- **It lights when the mix is non-empty** (`.is-lit`) — accent stroke on the
  groove plus a soft glow. The record is the only part of the dial that is
  always on screen and never scrolls past, so it is where "you have something"
  belongs. Album accent, like the rest of the dial.
- **It carries the genre you are inside.** Nothing else on a sub ring names the
  main; you had to remember what you tapped. The spindle hole steps aside while
  a name is there.
- ⚠️ The label fades in via a **keyframe, not a transition**. `mixHubSync`
  rebuilds the record on every step, so the label is a brand-new element each
  time with no previous value to transition *from* — a transition simply never
  fires.

⚠️ **Measuring any of this from a detached node will lie to you.** The viewer
re-renders the shells on its own (the rec deal), and `getComputedStyle` on a
node that has been swapped out returns empty strings or stale values — which
looked exactly like "the lit rule is not applying" for several rounds. Re-query
`mixHost` and assert `document.contains(el)` in the same call as the read.
##### ⚠️ Three steps, and nothing leaves the box

The `wdth` axis alone buys about 5%, so condensing cannot save a genuinely long
name in a tight slice — and a label running off the crop is the one failure that
reads as a broken app rather than a full one. `mixDialFitLabels` now:

1. **binary-searches `wdth`** down to `DIAL_WDTH_MIN`;
2. gives up **size** (`--lsize`, floor 82% — the ring reads as one row of type,
   so this is the last thing worth spending);
3. gives up **characters**, trimming to an ellipsis.

⚠️ **Every pass resets from `data-full` first.** The fit mutates `textContent`,
and it runs a second time when the webfont lands — measuring an already-trimmed
label against the same budget would trim it again, and again.

Verified across all 17 rings / 272 holes: **0 overflow, 0 needed trimming.**
Steps 2 and 3 are the guarantee, not the routine.

##### ⚠️ Every hole is the same colour. Don't fade the empty ones.

Tried and removed: mains with no albums anywhere under them were drawn faded, so
you could see there was nothing behind Metal or Punk before walking in. It reads
as inconsistent — a ring of identical dots with some of them greyed looks like a
rendering fault, not like information — and it is the wrong trade for a number
the info box already gives you the instant you pick.

⚠️ **The blank-genre problem this note used to describe is FIXED** — see
*Genres are real now* below. Every album in the archive carries a genre, so a
hole being empty is now a fact about the LIBRARY rather than about the data
layer, and fading those holes would be fading nine of sixteen mains on a
catalogue that simply leans electronic.


##### Genres are real now — `genre_id` -> a name (`DZ_GID` / `dzGenreOf`)

⚠️ **`dzRecord` used to set `genre: ''` on every album the rec deal dealt —
two thirds of the live archive** (measured: 67 of 100). The other third carried
eight labels between them, so most of the mix dial matched nothing and a single
pick almost never filled a deck. **Measured after: 0 blank.**

⚠️ **IT COSTS NO EXTRA REQUESTS.** `genre_id` is already in the payload
`artist/<id>/albums` returns — the same response the deal is reading for the
title and the cover — so this is a lookup, not a fetch. That is why it belongs
in `dzRecord` and not in `dzHydrate`, which needs a call per album and only runs
when one is opened.

⚠️ **`genre_id` 0 is "All", which means Deezer does not know.** It must stay
blank rather than becoming a label, or a chunk of the archive joins one bogus
shelf. Same for any id not in the table.

⚠️ **The 28 ids are written out, not pulled from `/genre` at boot.** They are
stable, it is one fewer request, and one fewer thing that can fail and leave
the whole archive genre-less again. `DZ_GEN` then translates Deezer's vocabulary
to ours, and **the eight regional genres all fold into World** — the dial has
one hole for them and eight separate labels would each match nothing.

⚠️ **This does not make every genre work, and it should not.** Measured on the
default persona afterwards: eight labels across 72 albums, led by Electronic
20 / Alternative 16 / Hip-Hop 14. **Nine of the sixteen mains still field
nothing** — Indie, Jazz, Metal, Punk, Folk, Country, World, Classical,
Experimental — because this library genuinely has none of them. That is real
coverage, not a bug, and the button says `None yet` rather than pretending.

##### ⚠️ One pick must be able to make a deck — so a thin one WIDENS

A subgenre whose own pool cannot fill a deck falls back to the family it
belongs to (`mixShelf` / `mixParentsOf`). Picking one genre has never had a
minimum, but "enough" was being decided by the archive rather than by the
design: **233 of the 236 subgenres matched fewer than two albums**, so almost
every single pick left New deck disabled and the dial read as broken.

| | |
|---|---|
| exact pool >= `MIX_MIN` (2) | that pool, untouched |
| under it, family can fill | the family, and the readout says **"· related"** |
| under it, family cannot either | the exact pool, and the button says `None yet` |

⚠️ **EXACT FIRST, ALWAYS.** A subgenre that can stand on its own is never
quietly broadened, and with real genre data behind it this branch stops running
altogether — it is a graceful degradation, not the normal path.

⚠️ **It is not silent.** A shelf that is not what you asked for has to say so,
which is what `· related` on the count is for. Don't remove it to tidy the line.

⚠️ **Only SUBGENRES widen.** A main already reaches its whole family through the
expansion below, so a main with nothing under it genuinely has nothing to show.

⚠️ **ONE shelf, read twice.** `mixHomeReadout` (the home's `onSync`) builds the
shelf once and reads both the count and the button state off it. Letting the button build its own is
exactly how the number in the box and the deck you get come to disagree —
and with the widening in play they would disagree often.

Measured after both changes: a single "Ambient" pick gives **28 albums ·
related**, commits, and deals a 28-album queue that is all Electronic.

##### ⚠️ "All X" EXPANDS at commit — containment alone is not enough

`mixShelf` turns a picked main into `[main, ...subs]`. Containment on the main's
name only catches labels that contain it, so "Electronic" would reach Electronic
and Electronic soul but **not** Ambient, Techno or UK Garage — "All Electronic"
would quietly be *narrower* than the subs offered under it. Expanding here keeps
`shelfPool` a dumb matcher and puts the meaning of "all" in one place. It is
also what lets a thin main work: `Jazz` matches 1 album on its own and reaches
Classical, Folk and Soundtrack through its subs.

##### ⚠️ Every label is checked against the real archive

`shelfPool` matches by lowercased **containment** against an album's primary
genre, so a label nothing contains is a hole that silently returns zero — which
is what the flat dial shipped with (ten of its twenty genres matched nothing).
Counted before being written down. Across personas.js + data.js only a minority
of the 236 subs match an album, and Metal, Punk and Country match none at all — the
taxonomy is a real one and the mock archive cannot fill it. That is survivable
because the dial no longer hides it (see the fading and the data note below),
but **re-run the count if you edit the tree**: a dead label looks identical to a
live one until someone picks it.

⚠️ **A label must stay a SUBSTRING of the genre it means.** That is the only
rule for shortening one to fit the dial: `Experimental hip-hop` → `Experimental`
works, `Psychedelic rock` → `Psych rock` matches nothing at all. Three are
shortened for exactly this reason, and they read fine because inside the Hip-Hop
ring "Korean" does not need to say hip-hop again. The one cost: `Psychedelic`
under Rock also catches Psychedelic pop.

⚠️ Subs deliberately belong to more than one main — Indie rock is under Rock and
Indie, Trip-hop under Electronic and Hip-Hop. Picking is a **filter, not a
partition**, so overlap costs nothing and matches how people look for music.

#### The info box lists the mix (`.v3-blue-mix-picks`) and commits it

⚠️ **The empty-state hint is MONO, not the serif italic.** It borrowed the shelf
wheel's annotation voice, and that voice is for a COUNT sitting beside the
thing it describes. This line is a direction telling you what to do next, and
in italic serif it read as a caption on the dial rather than as the dial
talking to you — the chips that replace it are mono, so the row no longer
changes typeface the moment you pick something. The line above it opens on
**"Build your genre mix"** rather than "Build a mix": it is the first thing the
box says and it is the only place the dial names what it is for.

The second line was a count ("3 genres") and is now **the picks themselves**, as
chips, and **each chip removes its own pick** — the thing you can see is the
thing you can undo. With picks gathered across several rings this row is the
only place the whole mix is visible; the ring in front of you can only ever show
one main's worth. The button says **New deck**.

- ⚠️ The row **scrolls sideways and never wraps**: `.v3-blue` is a fixed strip
  and a second line of chips pushes the button out of the box.
- ⚠️ `obEsc` on the label *and* the `data-g` attribute — "R&B" is a genre, and a
  bare `&` in either place is malformed markup.

#### ⚠️ The ring size is a parameter now, and three things depended on it

`dialAngleOf` / `dialReach` / `dialSeating` all read `SD_GENRES.length` — twenty,
for ever. The dial now draws 8 mains or 4–7 subs, so they take the count, and
`DIAL_SEAT` / `DIAL_HOLE` stopped being module constants: the seating is
recomputed per ring into the context's `ring` (`d.ring`; it was a module-global
`MIX_RING` until the dial gained a second host), which `dialWheels` and
`mixWrapSync` read.

Two things that were invisible at twenty holes and broke immediately at seven:

1. ⚠️ **Seat by `dialRoom`, not `dialReach`.** `dialReach` is the wedge's
   narrowest *edge*; the label is drawn along its *centre line*. At ±9° those
   nearly agree. At ±26° they diverge hard — straight up, `dialReach` reports
   175.6 because the wedge's edges point at the corners, while a label going
   straight up only has 160. That put "Psychedelic pop" in the tightest slot on
   the dial believing it was the roomiest, and it drew off the top of the
   viewBox. The wedge still uses `dialReach` for its own geometry.
2. ⚠️ **Each ring is ROTATED to its roomiest orientation** (`dialOffset`, cached
   by count). A corner has 41% more room than an axis, and a ring of **four**
   lands every hole exactly on an axis — the four tightest directions on the
   dial. R&B's "Electronic soul" needed 92 units in the 61 it was given. The
   offset that maximises the worst budget is found by a degree-by-degree sweep
   over one step: for n=4 that is 45°, which takes the tightest budget from 61
   to 127.

#### ⚠️ The label fit is a BINARY SEARCH, not a proportional walk

`mixDialFitLabels` guessed `wdth × budget / measured` and iterated three times,
which assumes width responds roughly in proportion to the axis. It does not:
measured on Roboto Flex, "Psychedelic pop" is 106.8 units at `wdth` 100 and
101.4 at `wdth` 60 — **the whole axis buys 5%**. So the guess moved the axis
about two points a pass, the loop ran out of passes still overflowing, and the
label read as clipped with the safety net looking broken. Five halvings find the
widest axis that fits whatever the response curve is.

Verified across all nine rings: one label (Indie's "Dream pop") sits 2 units over
its budget, which already carries a 2-unit safety margin.
#### The geometry is sized to the album cell (`DIAL`)

`.v3-album` is ~**291×289** at the 393px frame, so the 320-unit viewBox renders
at about **0.91px per unit** and everything must fit inside it — labels
included, and they radiate *outward*. The budget from the middle out is
`ring + holeOn + 5 + longest label < 158`:

| | was (sheet) | is (bento) |
|---|---|---|
| `ring` | 120 | **80** |
| `hub` | 44 | **30** |
| `hole` / `holeOn` | 12 / 15 | **10 / 12** |
| `gap` | 7 | **5** |

⚠️ **These five are ONE set.** `ring + holeOn` is what the label budget is left
over from — a corner slice reaches 177.6, a label starts at `ring + holeOn + 5`,
and "Alternative" needs ~77 of what remains. At 80/12 that leaves **80.6**,
about three units of slack; push `ring` past 84 or `holeOn` past 12 and the long
names start condensing again. The other limit is that neighbours must not merge:
holes sit `2·ring·sin(9°)` = **25.0** apart, so a *picked* pair clears by 1.0.
The circles were grown once the corner seating freed the room — the unpicked
hole went 8 → 10 (**+25%**, and it is the state you see most of the time).

##### ⚠️ The box is a SQUARE and the dial is a CIRCLE — so use the corners

How far the middle can reach before it hits the viewBox depends on which way it
points: `vb/2` straight up, and **41% further** (`vb/2 × √2`) into a corner. A
ring that budgets every label for the worst direction throws that away.

`dialRoom(deg)` is that distance; `dialReach(deg)` is what a **slice** may use —
the room at its *narrowest edge*, not along its centre line, because a wedge
drawn to its middle's room would poke out of the square along whichever edge sits
nearer an axis, and take the label with it. Labels start at `ring + holeOn + 5` = **97**, so:

| Holes | Reach | Label budget |
|---|---|---|
| the 8 flanking the diagonals (36°, 54°, 126°, 144°, …) | 178 | **80.6** |
| the other 12 | 160 | **63** |

##### ⚠️ Seating: the longest names get the roomiest slots (`dialSeating`)

⚠️ **Read the two-level section above first** — the seating is computed per
ring now, is sorted by `dialRoom` rather than `dialReach`, and the ring itself
is rotated by `dialOffset`. The reasoning below still holds; the numbers in it
are the old twenty-hole ring.

The dial walks **holes**, not genres — `DIAL_SEAT[hole] = genreIndex` decides
which name sits where, longest into the roomiest. Verified: all eight of the
longest (*Alternative, Electronic, Dream Pop, Trip-hop, Shoegaze, Ambient,
Country, Hip-Hop*) land in the eight roomy corner slots, and *Pop* / *R&B*
take the axes. Every label then fits at **full width** — condensing becomes the
safety net it should be rather than the thing holding the ring together, and the
room went into **size for everybody**: 10 units → **14** (~9.0px → ~12.6px).

- ⚠️ **This is the one place the dial stops following `SD_GENRES` order**, and it
  is a real trade: that list is editorial (related genres adjacent) and seating
  by length scrambles it around the ring. It became worth it once the dial
  stopped **turning** — adjacency used to mean "a related pick is a short turn",
  and there is no turn any more. `return SD_GENRES.map((_, i) => i)` in
  `dialSeating` puts the editorial order back; nothing else needs to change.
- ⚠️ **Both sorts fall back to the original index on a tie**, so the seating is
  deterministic. The ring must not reshuffle between renders.
- ⚠️ **`data-i` stays the GENRE index**, not the hole — that is what `MIX`,
  `mixToggle` and `mixDialSync` speak in. `dialAngleOfGenre` (via `DIAL_HOLE`,
  the inverse map) is what `dialWheels` uses to put a pulley where its genre
  actually sits; without it the belt wraps the *unseated* positions.
- ⚠️ **There is no `DIAL.hit` any more and don't add one back.** How far a slice
  reaches is not one number.
- ⚠️ **Each label's budget is STAMPED on it** as `data-w` by `mixDialSvg`, where
  the angle is known. A corner has ~81 and an axis ~63, so one shared budget would
  either condense the corners for nothing or let the axes overflow.

##### The labels are a VARIABLE face, condensed per label (`mixDialFitLabels`)

Half the genres are short (Pop, Jazz, R&B, Folk) and a couple are not
(Alternative, Electronic). A fixed face has to be small enough for the **longest**
name, which throws away the space the short ones aren't using — that is why the
labels sat at 10 units on SUSE Mono, rendering about **9px**.

They are now **Roboto Flex** — the same variable face the album title uses
(`.v3-blue-info-row`), already loaded in `index.html` with all three axes at full
range (`opsz 8..144, wdth 25..151, wght 100..900`). Set at **14 units (~12.6px, 40% bigger)** — a size the seating above is what
makes safe — and anything that still overflows gives up **width** rather than
size. With the current twenty genres nothing has to: all projected at `wdth` 100.

- ⚠️ **Measured, not estimated.** `mixDialFitLabels` asks the engine via
  `getComputedTextLength()`, which reports in **user units** — the same units as
  the budget — and the rotate/translate a label sits under preserve length. How
  much a name overflows depends on the face that actually loaded, the axis
  position and the letter-spacing; none of that is safe to guess.
- ⚠️ **Iterated, because width is not linear in `wdth`.** The first guess is
  proportional and two corrections land it. It bails the moment a pass stops
  making the label narrower, so a name that cannot fit even fully condensed
  settles instead of looping.
- ⚠️ **It runs again on `document.fonts.ready`.** Roboto Flex arrives over the
  network; until it does, the first pass measures the **fallback** face, which
  has no `wdth` axis and reports somebody else's widths.
- ⚠️ **Measurable at build time only because `.mix-inline` is `opacity: 0`, never
  `display: none`** — the same reason the shelf wheel's `rowPx()` can measure a
  row before the wheel is armed.
- ⚠️ **`DIAL_WDTH_MIN` is 60, not the axis floor of 25.** Roboto Flex will go to
  a hairline at 25 and the label stops being *readable* long before it stops
  fitting. A genre that needs more than this should be shortened in `SD_GENRES`.
- ⚠️ **`opsz` is pinned to 9, not left on `auto`.** The SVG is scaled by its
  viewBox (~0.9px per unit), so the used font-size `auto` would read is the
  unscaled 13 — an optical size for text half again as big as what lands.
- ⚠️ **The axes arrive as custom properties** (`--lwdth`, `--lwght`), because
  `font-variation-settings` replaces the whole tuple: a plain `font-weight` on
  the picked state is ignored while that property is set, and the JS fit pass
  would wipe the weight if it wrote the tuple itself. One variable each.
- **`.ob-hole-t`'s `font-size` is the one dial to turn** if the labels read too
  small or too tight — raise it and more names get condensed, lower it and fewer
  do. `DIAL.hit` is matched to the same 158, so the far end of a long name is
  inside its own tap wedge rather than a few pixels past it.

#### ⚠️ A genre's tap target is its WEDGE, not its hole (`dialWedge`)

Twenty holes on a 74-unit ring sit **23 units apart**, so a hole grown into a
decent target would touch its neighbours — and the hole itself is ~15px on a
phone, which is not a target at all. Each genre already **owns 18°** of the
dial, so the hit area is that whole slice, from the hub out to `DIAL.hit`, with
its hole *and its label* inside it: a **26×115px** slab instead of a dot.

- ⚠️ **The wedge is painted FIRST** in the `<g>`, so it sits under its own hole
  and label, and it is the **only** thing in the group that takes a pointer —
  `.ob-hole-c` and `.ob-hole-t` are `pointer-events: none`, so every tap in the
  slice reports the same target and there are no dead gaps between them.
- ⚠️ **`mixDialTap` swallows the click whether or not it hit a genre.** The dial
  covers `.v3-album`, which carries `onAlbumArt` — a tap on the empty middle
  would otherwise fall through and navigate to the album page out from under the
  dial. `.mix-inline` stops the bubble too.
- ⚠️ **`bentoGesturesOn` returns false while `--mixing`.** The swipe underneath
  would otherwise change the album out from under the dial, and the cover-hold
  would arm the shelf wheel on top of it — both reading the same drag the taps
  are landing in.

#### The readout moved to the info box (`.v3-blue-mix`)

The hub used to carry the count; a 52-unit record has no room for it, and the
box below already exists to say what you are looking at. So the box that
normally tells you what this **album** is tells you what the **mix** is — album
count in DM Sans, genre count in the same Crimson italic the shelf wheel uses
for its counts, and `New deck` on the right.

- ⚠️ **It covers `.v3-blue` completely and stops the bubble**, which is also
  what takes that box's tap-to-open-album off the table while you are choosing.
  Otherwise committing a mix could navigate away from the screen it was
  committed for.
- The box's normal children go `visibility: hidden`, **not** `display: none`, so
  the box keeps the height its own content gives it and nothing below shifts.
- ⚠️ **The dial carries its own dark tokens** (`.mix-inline`), exactly as the
  sheet did. It draws in `var(--text)`, and on a *light* home it would otherwise
  come out as near-black ink on a dark, tinted cover.
- ⚠️ **Tinted by the ALBUM, not by gold** — `--accent: var(--v3-accent, …)`, the
  same rule the shelf wheel follows, so the belt re-tints with the art.
- ⚠️ **The blur is a painted layer** (`.mix-inline-bg`, refilled on every open),
  never `backdrop-filter` — see `.shop-pick` for why that cannot work under the
  bento's transform and the viewer's zoom.

##### ⚠️ The dial's labels are editorial, so `shelfPool` matches them LOOSELY

`SD_GENRES` (screens.js) is a **hand-written list of 20**, unlike the wheel's
rows, which are read back out of `ARCHIVE` and therefore always match. The mix
case used to do an exact, case-sensitive compare — and the archive writes
`Hip-hop` where the dial says `Hip-Hop`, so **the single biggest genre in the
catalogue (44 albums) scored zero**, the hub read "0 albums", and the button sat
dead on the app's most obvious pick.

It now lowercases both sides and asks whether the label is *contained* in the
genre, which fixes the casing and folds the compound names in with it — that is
what a broad genre shelf is supposed to mean:

| Label | Takes | Was → is |
|-------|-------|----------|
| `Hip-Hop` | Hip-hop, Experimental hip-hop, Korean hip-hop | 0 → 44 |
| `Rock` | Alternative rock, Art rock, Noise rock, J-rock… | 3 → 13 |
| `Pop` | Art pop, Indie pop, K-Pop, Hyperpop… (deliberately) | 3 → 11 |
| `Indie` | Indie rock, Indie pop, Indie Folk | 0 → 6 |
| `Soul` | Neo-soul, Electronic soul | 0 → 3 |

- ⚠️ **An album can now match several picked genres**, so the old note that "an
  album has ONE primary genre, so it can match at most one member of the mix" no
  longer holds. `filter` visits each album exactly once so the pool still cannot
  contain a duplicate (verified: Rock+Alternative+Indie = 29, all unique) — but
  **don't** rewrite it as a pass per genre that concatenates. That one can.
- **10 of the 20 holes still can't stand alone**, because those albums are not
  in the catalogue at all: Punk, Metal, Latin, Country, Blues and Funk have
  **zero**; Ambient, Dream Pop, Shoegaze and Jazz have one. They combine fine —
  they just can't be a shelf by themselves, and the button now says so.
- ⚠️ **`dzRecord` sets `genre: ''`** (`expandRecs`'s Deezer records), so the
  hundreds of albums that widen `ARCHIVE` at runtime join **no** genre shelf.
  That is why these counts stay in the tens while the archive grows. Fixing it
  means mapping Deezer's `genre_id`, and it would lift every genre at once.

- `MIX` lives outside the DOM, so closing and reopening returns you to the mix
  you were building.

#### Getting out — the corner pill, not a ✕ (`s-home-v3--mixing`)

**The dial has no close button of its own.** The cover-hold opens it and the
gesture does not resolve until you commit a mix or leave, so you are *held* in
this state and need a way back — and the app already has one dedicated back
affordance: `.v3-live-pill`, the bento's corner notch, which is the hand-layout
switch on the home bento and **Back** in review. The dial borrows it rather than
inventing a second exit.

- `openMixDial` puts `s-home-v3--mixing` on its host and `closeMixDial` takes it
  off; `mixHost` is both "which screen" and "is it open at all", and
  `MIX.wraps()` / `mixHomeReadout` resolve through it. Reopening from the other home variant
  clears the old host first — a screen left marked keeps a dial over its cover
  and a pill saying Back with nothing to go back from.
- `onLivePill` checks `--mixing` **before** `--review`: while the dial is up,
  this pill means back ahead of whatever the screen underneath would make it.
- ⚠️ **No z-index lift, and don't add one back.** It was `z-index: 201`, because
  the dial used to be a bottom sheet whose scrim (`.sd-log-overlay`,
  `inset: 0; z-index: 200`) lay over the whole bento and swallowed the tap while
  the pill still looked perfectly clickable. The dial now lives inside
  `.v3-album` — `z-index: 1`, `overflow: hidden` — so it cannot reach the pill
  at 6, let alone cover it.

#### `beltPath()` → `SD_BELT.hull` (belt.js)

**The solver moved out of app.js.** `beltPath(circles)` is now one line —
`SD_BELT.hull(circles, DIAL.gap)` — so the dial and **belt-lab.html** run the
same code. Verified identical over 252 dial configurations (every pick count,
twelve rotations each) before the swap; if you touch `hull`, re-run that check.

`SD_BELT.hull` is **the convex hull of a set of CIRCLES**, which is what a belt
physically is. Gift-wrapping, one wheel to the next, always the least left turn.
⚠️ Not an outline offset from the hull of the CENTRES — a belt drive is circles
of very different radii (a hub is three times a pulley), so a centre-hull offset
cuts through the hub and floats off the small ones.

`SD_BELT.taut(wheels, gap)` is the third solver and the one the **belt lab**
runs on: **a rubber band**. It encircles the wheels marked `side: 1` and treats
every wheel as something it cannot pass through, so a wheel marked `side: -1`
just *leans* on it. It works out the loop order, which way round each wheel the
belt goes, and who it is touching at all — see *Belt lab* below.

`SD_BELT.route(wheels, gap)` is the ordered primitive, and **nothing uses it any
more**. Each wheel carries a side and is joined by whatever tangent that side
implies; for an outside wheel that is the **crossed** tangent, which is a belt
with a real **twist** in it. A crossed V-belt is a real machine, so the function
stays — but a backside idler is *not* one, and the note on it says so. It can
also be asked for the impossible and returns `{ d: '', bad: [runIndex, …] }`.

- Radii arrive already grown by `gap`, so the belt is drawn where a belt sits.
- ⚠️ **Screen coordinates: y is DOWN, so "clockwise" means the atan2 angle
  INCREASES.** Every sign in `route` depends on it. The one piece of maths is
  `a = phi - asin(delta / d)` where `delta = s_b·r_b - s_a·r_a`; same-side
  wheels give a small delta (an external tangent), opposite sides give
  `±(ra + rb)` — the crossed tangent, and the reason `|delta| > d` is a real
  failure rather than a rounding issue.

### Belt lab (`belt-lab.html`)

Toolbar → **⌾ Belt**. Click to drop a pulley, drag its middle to move; **four
ways to size one** — drag the rim, scroll over it, the Radius slider, or `[` /
`]`. The belt re-wraps live. **Hull** works out the order for you and always
closes; **Route** follows the list and lets any wheel become an idler. Exports
Copy SVG / Copy call / Copy path d; named rigs save to `localStorage`, WIP
autosaves.

#### ⚠️ The stage is 1:1 with the phone

One stage unit is one CSS pixel in the mockup, so **what you draw is the size
you type into screens.js** — that is the whole reason the tool is worth having
over sketching. The **Context** switch draws the real device around your work:

| | |
|---|---|
| `Phone` | the 393×852 device, its 4px bezel, the 59px status bar, and the 8px margin the progress belt sits on |

⚠️ **The phone is no longer black behind the app.** `.phone-screen` used to be
`#000`, so the status bar and the home indicator — transparent strips above and
below `.screen-content` — read as two black bars, which a real iPhone does not
show. `paintPhoneChrome` (app.js, run from `paintAfterRender` and the mobile
preview's paint) sets `--pscreen-bg` on every `.phone-screen` from the computed
background of the screen it holds, so the time, the island and the indicator
float on the app's own colour. ⚠️ The icons follow that **colour**, not
`statusTheme`: the flag is per screen but a screen has a dark and a light
variant, and white icons on the light variant's cream vanish — so
`paintPhoneChrome` toggles `dark-icons` on the status bar *and* the indicator
from the background's luminance. Black is only the fallback.
| `Panel` | all of that plus step 0's plate box (369×464, in place) and its x=44 / x=325 rules |

The constants (`PHONE` / `SCREEN` / `APP_Y` / `PANEL`) are traced from
`style.css`'s `--pw`/`--ph`/`--pr`/`--sr` and the onboarding chrome heights.
⚠️ **Resize the stage and they must move with it**, or the guide quietly lies.

- **The grid, the snap and the coordinate readout all run off the frame's
  origin**, so an 8 you count in the lab is an 8 the app counts. With a frame
  on, **Copy call** emits frame-relative coordinates with the origin in a
  comment — paste-ready.
- The **`field` preset is the real handle bubble**: two r26 pulleys on the
  plate's x=44 / x=325 rules at y=248. It is the actual thing shipping in step
  0, so it is the honest place to start pushing.

- **Every setting is on one screen** — two balanced columns, the body doesn't
  scroll, and every number is a slider **and** a typeable field driven through
  one `bindNum` so the two can't disagree.

##### ⚠️ Typing in a number field: two rules, and both were broken

1. ⚠️ **`draw` is the STAGE and only the stage.** `tick` calls it on every frame
   the belt is turning (default speed 70, so always), and the panel rebuild used
   to be on the end of it — so `renderSelected` wrote `radN.value` **sixty times
   a second, straight over whatever was being typed**, throwing the caret to the
   end after every keystroke. Anything that changes state calls **`paint`**
   (= `draw` + `renderList` + `renderSelected`); the animation calls `draw`.
   This also stops the wheel list being rebuilt 60×/sec for nothing.
2. ⚠️ **`put(el, v)` never writes to the focused element**, and every field
   write goes through it. A field written back on each commit cannot be typed
   in, because assigning `.value` resets the caret — and the focused field is
   already showing exactly what was typed, so there is nothing to say to it.
3. ⚠️ **`input` applies only an ALREADY-LEGAL value; `change` clamps.** Clamping
   a half-typed `1` on its way to `12` up to the minimum was the other half of
   it: the wheel jumped to a size nobody asked for and that size was written
   back over the `1`. Out of range now simply waits for the rest of the number,
   and blur/Enter settles it. (A `type="number"` field reports `""` mid-decimal
   — "1." on the way to "1.5" — which `parseFloat` makes `NaN` and the handler
   skips, so the previous value holds instead of dropping to zero.)
- **One dot rides the belt.** It was a dashed "teeth" hatch along the whole
  path; a single travelling dot says the same thing about direction and speed
  with a fraction of the noise. Its size is the Dot slider (0 turns it off).

#### The belt is a rubber band (`SD_BELT.taut`)

**The lab draws the belt that would actually be there**: the shortest closed
curve that goes round the wheels marked inside, in a plane where **every** wheel
is solid and it cannot pass through any of them. `side` still means the one
thing position cannot tell you — `+1` the belt goes ROUND this wheel, `-1` it
only presses against it — and everything else is derived. The Hull/Route switch
is gone; so is any dependence on the list order.

⚠️ **This replaced `route`, and the reason is the whole point.** `route` draws
whatever tangent your side flag implies, and for an outside wheel that is the
**crossed** tangent — a belt with a real **twist** in it. It happens to look
right while the idler sits square across the run between its two list
neighbours, and draws a figure-eight the moment it doesn't, because nothing in
it knows where the belt would really go. Measured over 40k random rigs: **63%
came out self-crossing and 41% ran the belt straight through a wheel.** A
backside idler does not flip the belt over. It leans on it.

**Method** — relaxation, which is what a band settling actually is: start from
the hull of the wheels to be enclosed; anything standing in a straight run gets
wrapped into the ring there, the way that pushes the belt aside; any idler the
belt has let go of is dropped; repeat.

- ⚠️ **Insert and drop are opposite tests on the same distance**, so they need
  the `EPS` dead band between them or a wheel sitting exactly on a run is added
  and removed for ever.
- ⚠️ **An idler's reach is SIGNED, not a distance** (`reach(c, run, greedy)`).
  Plain distance lets go of an idler the instant it crosses to the far side of
  the run it was pressing — so pushing one deeper made the belt **fall off it**
  and stop responding, and a big one grew to touch both runs and got wrapped
  instead. Signed, the belt keeps hold and is **dragged along**, so the notch
  just keeps deepening. That is the belt of unlimited length. Measured, r38
  idler between runs at y=452/548: it used to die in a dead band at y=500 and
  now presses continuously from 420 to 580, the belt following its underside
  from y=462 down to y=582.
  - ⚠️ Only **alongside** the run (0 ≤ t ≤ 1). Off either end there is nothing
    to drag, and holding on there would reach across the whole rig.
  - ⚠️ **Greedy is tried FIRST, the plain reach second.** Push an idler far
    enough and the dragged run would cross the far side of the loop, which is
    not a belt at any length — so the ordinary reach is the fallback, and only
    if that fails too does a wheel get wrapped from the inside. That order is
    what keeps the idler you asked for.
- ⚠️ **When the belt cannot honour an OUT, the lab SAYS SO** — the Side control
  goes red and the note names the reason (overlapping a neighbour, or wider than
  the loop it sits in, which holds both runs apart instead of pressing on one).
  Silently reinterpreting a side someone set by hand is worse than not managing
  it: the first version just flipped the wheel and left the control lit gold,
  which reads as the control being broken.
- ⚠️ **Only IDLERS may be dropped.** The drop test asks "would the run between
  its neighbours still touch it?", which is right for something leaning on the
  belt and wrong for something the belt goes *round*: the shortcut across a hull
  contact never touches it — that is what being a hull contact means. Applying
  it to an inside wheel deleted it and the band stopped enclosing it; a plain
  trio came out as a two-pulley belt with a wheel floating beside it. Nothing
  else is needed, because pushing the band inward can only make it hug the
  enclosing contacts harder.
- ⚠️ **A wheel may appear TWICE in the ring and must not be deduped.** Three
  near-collinear wheels make a long thin hull whose middle circle carries an arc
  on the top edge *and* one on the bottom — the belt really does touch it twice.
- ⚠️ **A wheel wholly inside another is INTERIOR** and cannot be a contact.
  `wrapOrder` cannot use one either (its swallow guard skips it and the wrap
  ping-pongs), and the seed used to fall through to "just take the first two
  circles", which is not a hull at all. Every wheel that got cut in a 120k sweep
  came from that one fallback.

**The acceptance tests**, in the order they turned out to be needed:

1. **Total turning is 2π.** A simple closed curve traversed once turns through
   exactly 2π; a loop that has folded over does not. Local tangents can always
   be made to look plausible one run at a time — only a global invariant catches
   a fold.
2. ⚠️ **Turning alone is NOT enough** — a curve can cross itself and still turn
   through 2π (measured: 88 rigs in 40k got past the sum). So also check the
   picture: **no run may cross another**, and **no run may pass through a
   wheel.** Both are a handful of segments, so it costs nothing.
3. ⚠️ **A wheel that fails is wrapped from the INSIDE, never banned.** If the
   band cannot fold around it, the wheel is simply in the way and the belt goes
   round it — which is what would really happen. An earlier draft banned it from
   the solve and the belt sailed straight through it, which looks far more
   broken than a notch that turned into a bulge. Those wheels come back in
   `bad`, and the lab says so.
4. **The floor**: with every wheel wrapped from the inside this is the plain
   hull, which cannot cross itself or cut a wheel. There is always an answer.

**Verified over 200,000 random rigs** (scattered · idlers placed on the runs ·
idler-heavy · all-inside), including overlapping and swallowed wheels: **0
self-crossings, 0 belts through a wheel, turning exactly 2π every time**, and
one rig with no path at all (two wheels overlapping).

⚠️ **`hull` was refactored onto the shared `wrapOrder` for this**, and it is
what the mix dial draws — so it was checked byte-for-byte against the previous
implementation over **200k configs including the dial's own 252**: 0
differences. Re-run that check if you touch either.

#### ⚠️ YOU set the side. NOTHING guesses. (`pin` → `lock`)

**SIDE — `In | Out`**, a two-state segment in the Pulleys card. `o` flips the
selection; the list's per-wheel button does the same. That control is the only
thing that decides which side a pulley takes, and no code anywhere overrides it.

⚠️ **There was a `classify` and it is gone** — about eighty lines: contact
acquisition, stickiness in both directions, a `cameFrom` WeakMap holding which
side of the belt each wheel last came from, and a frozen contact band to tell
"pushing in" from "pulling out". Every piece was added to fix a real complaint
and every piece made the tool *less* predictable, because the same drag meant
different things depending on history you could not see. The reference for this
lab is the **Aphex string-and-pulley logo system**
(<https://aphex.makisoftware.com/>), whose entire instruction on the subject is
*"It is up to you to flip between IN and OUT to resolve tangles or create
concave contours!"* It never guesses, and it is right: **a guess that is correct
nine times out of ten is worse than no guess, because you have to check it every
time.**

⚠️ **DO NOT BRING IT BACK.** If a rig is tedious to set up, the answer is a
better control, not a cleverer inference. Three separate rounds of "make the
guess smarter" each fixed the reported case and made the tool worse overall.

##### ⚠️ The autosave is the whole of `S`, so a default change reaches nobody

Turning the guess off in the defaults did **nothing** for anyone who had ever
opened the lab: boot does `Object.assign(S, saved, …)`, so a session saved while
the classifier existed restored `auto: true` and a set of unpinned wheels. The
change was real, invisible, and cost a round of "it's still buggy". Boot now
**migrates** — `delete S.auto`, and every wheel gets `pin: true`, keeping the
side it was saved with. Any future change to what `S` *means* needs the same
treatment; the WIP autosave is a save format whether or not it was designed as
one.

##### Placement

- ⚠️ **Dropping a pulley hands straight over to the drag**, so one gesture
  places *and* positions it. It used to return after creating the wheel, which
  meant every new pulley landed where you clicked and then had to be found and
  grabbed again — and if the mouse moved at all during the click, it stayed put
  and you were dragging nothing.
- ⚠️ **A new pulley is APPENDED**, not inserted beside the nearest wheel. That
  insertion existed to seat one correctly in `route`'s ordered loop; `taut`
  works the order out for itself, so all it did was renumber the list under you
  every time you dropped something.

##### What the solver may and may not do

- **A side is BINDING** (`lock` in `taut`, set from `pin`, which every wheel now
  carries). A locked idler is always on the belt, is never let go of, and is
  never re-wrapped — **even when the result crosses itself.** If the relaxation
  does not pick it up, the belt goes and gets it, seated on the run it is
  nearest. That is the belt of unlimited length.
- ⚠️ **A tangle is a RESULT, not an error** — returned in `tangle`, reported in
  gold, naming the pulley and how to resolve it. `bad` is the different answer:
  could not be honoured at all (the wheels overlap).
- ⚠️ **The floor is the one place a lock may be overruled**, and only when no
  belt fits the rig at all — in practice the wheels physically overlap
  (measured: 13,674 of 13,674 such rigs). A blank stage answers nothing, so it
  draws the hull and names the wheels. Without that escape 23% of locked rigs
  rendered nothing.

**Measured.** 160,000 rigs with the solver free to decide: **0 twists, 0 belts
through a wheel, 0 no-path.** 60,000 rigs with every side locked: no-path 1,091,
and of every belt that twists or clips a wheel, **none is silent** — all 19,064
twists and all 9,168 clips are declared. An idler swept over **986 positions
across the whole stage: the side changed 0 times.**
#### The geometry worth knowing

- ⚠️ **An idler STRADDLES the run it deflects, and which side its CENTRE falls
  on is the whole thing.** Centre above the run → it presses down and you get a
  dip; centre below it → set it to In and the loop bulges *up* to swallow it
  instead. `dip = (y + r + gap) − run`, whose ceiling on the outward side is
  `r + gap` — so **a deeper notch needs a bigger idler, not a higher one.** The
  `serp` preset has been wrong twice for exactly this; check both sums after a
  rescale.
- **The tightest notch is PAST the run, not stopped at it.** Measured on two r44
  pulleys at gap 4 (top run at y=452), an r38 idler: it bites at y=420 and the
  geometry keeps giving to y=490 and beyond — dip 10 → 80 → 170. The centre
  crosses the belt line at 452, which is *half way through* the useful range,
  not the end of it.
- ⚠️ **THE LIST ORDER DOES NOT AFFECT THE BELT**, and a pile of machinery went
  away when that became true: `seat` (moving an idler to the list slot beside
  the run it presses), `updateSlack`, and the stand-down fallback in `solve`.
  `route` needed all of it because it drew whatever tangent your side flag
  implied and had no idea where the belt would really go; `taut` works the loop
  out for itself. **Don't reintroduce any of it.** `solve` is one call now.
- **Order ↻** sorts the list by bearing so the numbers on the stage run round
  the rig rather than in the order you dropped them — numbering only. It used to
  be the way out of a tangled route; there is nothing left to untangle.
- **Clear** empties the stage and leaves the settings alone; **Reset** puts
  every knob back — clearance, weight, dot, speed, snap, face, rim, detail,
  frame, the checkboxes — and reloads the `field` rig. ⚠️ It restores from a
  `DEFAULTS` snapshot taken **before** the WIP autosave is merged in at boot, so
  it can never inherit a bad session. Saved rigs are untouched.
- ⚠️ **Presets load PINNED.** They used to load unpinned as a live check that
  the classifier derived their authored sides — a good test while a classifier
  existed, and meaningless now that one does not.
- **Seven pulley faces** — ring, disc, record, motor, spoke, sprocket, open —
  set globally in the picker or overridden per wheel with **Face**. Rim sets
  their stroke, Detail how much optional furniture they carry.
  - ⚠️ **A face is `(r, ink, det) → [nodes]` drawn about the ORIGIN**, and the
    picker's swatches call the very same functions. That is the only reason a
    swatch cannot drift from what it selects — don't give the thumbnails their
    own drawing code.
  - ⚠️ **Every face needs a mark that breaks rotational symmetry** or it looks
    dead while it turns. `record` carries a lead-in groove for exactly this:
    real record furniture is all concentric and would sit perfectly still.
  - ⚠️ **Detail must not interpolate a COUNT that reads as a set.** `motor`
    showed two of its three holes at mid-detail, which doesn't read as less
    detail, it reads as a bug. Detail drives their size; three or none.
- **Each wheel turns at `ω = v / r`** off one belt speed, so a small pulley
  visibly spins faster. That ratio is the logo's own motion. It is the belt
  radius (`r + clearance`) that sets ω, not `r`.
- ⚠️ **An idler only bites if it actually REACHES the run it is deflecting.**
  Park it clear of the straight run and the belt just takes the long way round
  it — you get a loop, not a dip. The `serp` preset's comment carries the sum.
- **Copy SVG serialises the very nodes on the stage** (with the selection
  colour forced off and ink swapped for `currentColor`), so the export cannot
  drift from what you are looking at.

#### Pro showcase — the real compact bento (`shopProInit` in `app.js`)

The top of the shop is **the actual compact-state bento**, not a drawing of one:
the same `bentoHtml()` the home screen renders, found and filled by the same
`populateHomeData`. Showing the object beats picturing it, and it means the
showcase can never drift from the thing it sells.

- ⚠️ **`bentoHtml()` is new, and it deduplicated the home screen.** The bento
  markup was inlined **twice** — Float·Dark and Float·Light were byte-identical
  apart from three comments. One copy now, three callers. Declared above
  `SCREENS` for the same reason as `sdScene()`: the home `html:` is a static
  template literal evaluated while `screens.js` parses.
- ⚠️ **Style the CASE, never the bento.** `.shop-showcase` only zeroes the
  bento's home-screen margin, and the scale lives on a `.shop-model` wrapper.
  Anything that reaches in and restyles a `.v3-*` will drift from home the first
  time home changes — if the showcase needs the bento to look different, that
  means the bento should change, not that the shop should override it.

##### The bento is shown as a SCALE MODEL (`.shop-model`, 76%)

At full size the showcase reads as the home screen with a shop bolted above it
— you are looking at your phone, not at a product. Shrunk and centred, with air
on every side, the same object reads as the thing on the shelf.

- ⚠️ **A transform, never a width.** Everything inside the bento is px (type,
  radii, the CD) positioned against a `%` frame, so narrowing the box would
  shrink the frame and leave the type at full size — the layout breaks instead
  of scaling. `transform: scale()` is the only thing that takes the whole object
  down uniformly, which is what a scale model *is*.
- ⚠️ **A transform doesn't change the LAYOUT box**, so the model's full-size
  height would leave a hole under it. `.shop-model`'s negative `margin-bottom`
  takes back exactly what the scale removed: a % margin resolves against the
  parent's **width**, and the bento's height is its width × `--v3-bento-hw`.
- ⚠️ **`--v3-bento-hw` (1.0595, on `.s-home-v3`) is `.v3-bento`'s `aspect-ratio`
  written a second time as a number** — `calc()` cannot divide a ratio type.
  Both carry a note; change one and change the other.
- ⚠️ **The Pro tag does not scale.** It is a label on the display, not part of
  the product, so it stays full size and is positioned off the *model's* left
  edge — `calc((1 - var(--shop-model)) / 2 * 100% - 2px)`, half the width the
  model gave up.
- The scale is one number: `--shop-model` on `.shop-showcase`.
- ⚠️ **The showcase's cover must not tap through.** `setMainAlbum` skips its
  `onclick` when the art is inside `.shop-showcase` — there the cover owns a
  HOLD, and a tap-through would navigate the shop screen itself to an album
  page. Re-checked on every album change, because that handler is reassigned
  each time.

**What Pro adds — the shelf wheel.** Hold the cover, a vertical wheel comes up
over the art, drag to pick For You or a genre, release and the bento **moves to
that shelf for real**: `setMainAlbum` re-tints the box, re-runs the typewriter
and swaps the art, exactly as on the home screen.

- ⚠️ **The wheel is built in `shopProInit`, not in `bentoHtml()`.** That
  component is shared with home and stays pristine; the shop is what wants an
  overlay, so the shop is what adds it. It is appended *into* `.v3-album` so it
  inherits the art's rounded corners and covers exactly what you're holding.
- ⚠️ **Hold, not tap.** `SHOP_HOLD_MS` is 240. On the home screen the delay is
  what separates "open this album" from "change shelf", so the demo has to
  teach the delay too.
- ⚠️ **`top: calc(50% - 13px)` on BOTH `.shop-pick-list` and `.shop-pick-lens`**
  centres selection 0 under the lens without either knowing the art's size —
  the art is square and sized by the bento's percentage grid, so there is no
  height to hard-code. 13 is half of `SHOP_PICK_H` (26); change one, change both.
- **Drag down moves down the list** — the row you pull toward the lens is the
  one you get.
- **Shelves are real**, read from `ARCHIVE`: primary genre only (the part before
  the `/`), first album per genre stands for it, `For You` pinned first. No new
  data.

#### The album page's CTA row — clearing the credits

⚠ **`.v3-blue` is absolutely positioned**, and on the album page it is
`height: auto; overflow: visible` — so the three credit rows (Produced by /
Mixed by / Label) grow it **downward out of its own box**, and nothing in normal
flow below knows they are there. The CTA row landed on top of them.

- `--rev-cred-h` (40px) is that overhang, added to `.v3-rev-mine`'s base 26px.
  3 rows × 10px names at line-height 1.28 ≈ 38px. Turn it if the rows are restyled.
- ⚠ **Declared on the SCREEN, not on `.v3-rev-mine`.** Custom properties inherit
  *down*, and `.v3-blue-credits` is a **sibling** of that column — a var set on
  the column is invisible to the block it is measuring.
- Credits coverage is patchy (MusicBrainz is volunteer-entered) and the block is
  `hidden` when nothing came back, so
  `:has(.v3-blue-credits[hidden])` drops the var to `0px` — otherwise the
  reserved space is just a hole. (The one `:has()` in `app.css`.)
- ⚠ **The CTA row is 80% wide, not 100%.** Full width put it on the album's own
  grid, which read as correct beside the histogram and the tracklist — but it
  also made the page's one ACTION the widest element on it, so it stopped
  reading as a button and became another band of layout. The 20% it gives up is
  what makes it look pressable. ⚠ It is CENTRED with `margin-inline: auto` —
  `.v3-rev-mine` is a flex *column*, so `align-items: stretch` is what was
  positioning it, and once the row has an explicit width stretch has nothing to
  stretch and drops it on the left edge.

#### Colour, type, copy

- ⚠️ **Colour comes from the tile, not the sheet.** Frames and badges pass a
  `--tint` as an `"r,g,b"` triple and `.shop-field--tint` washes with
  `rgba(var(--tint), .13)`. This is the **bento's procedural colour moved onto
  products** — the home bento takes its colour from the cover; a shop tile takes
  its colour from what it sells. Themes skip the token and fill the field with
  their own palette inline, because there the swatch **is** the preview.
- **Gold is reserved for what you can act on** — buy buttons, prices, and the
  armed state of the Pro picker. It is not used as decoration anywhere on this
  screen.
- ⚠️ **The title is DRAWN, not set** (`SHOP_WORD` in `screens.js`,
  `.shop-title-mark` in `app.css`). It used to be DM Sans 800 at 34px. There is
  **no wordmark font in this project** — the SPINDECK lockup is
  `images/spindeck-wordmark.png`, a drawn mark with no typeface behind it — so
  the only way for a heading to sound like the brand is to be *built from the
  brand's module*. `SD_DOTS.svg` spells `SHOP` on a 19×5 grid in the same
  rounded square, same 14% corner, same `currentColor` tint as the bag in the
  nav scoop. Size it by **height**; the width follows the viewBox.
  ⚠️ `SD_DOTS` ships its `<svg>` `aria-hidden`, so the word rides beside it in
  a `.shop-sr` span. **Change the pattern, change that text.**
- ⚠️ **There is no lede.** "Make Spindeck yours." is gone and should not come
  back — it told you nothing the shelves say better, and the aisle bar needs the
  room. A store's tagline is the one line a shopper never reads.
- **The price is the button** (`.shop-buy`) — there's no second word to read,
  and no cart to put anything in. `sdBuy` swaps it for an **"Owned" pill of the
  same footprint** so the row doesn't reflow. Nothing is charged or persisted.
- ⚠️ **Tags are the one purchase that is RECORDED, not just acknowledged.** The
  buy button carries `data-tag`, and `sdBuy` pushes the id into `SD_TAG_OWNED`
  before doing its usual label swap — a tag you bought has to turn up in the
  picker on Edit Profile, or the purchase did nothing. (Still session-only; see
  *Tags* under the profile.)
- **The Tags section is a LIST, not the 4-up grid** frames and badges use. A
  tag's label is a word of a length it chose — `DaisyChainsFestival2026` is long
  *because* it is specific — and equal cells would truncate the ones worth
  selling. Each row is the chip itself: there is nothing to picture beyond the
  thing you would wear. Only priced tags are listed; the free ones are already
  yours, which the section's sub-line says.
  and no cart to put anything in. `sdBuy` swaps it for a pill of the **same
  footprint** so the row doesn't reflow. The word on that pill is the tile's to
  choose via **`data-owned`**: cosmetics become `Owned`, a ticket becomes
  `Going`, because a night out is not a thing you own. Nothing is charged or
  persisted.
- Everything is placeholder: invented names and prices, art is CSS. Themes reuse
  the `Funky 01` name the Settings row already shows.

### The pet — the face in the notch (`sdScene()` · `paintScene()` · `sceneReact()`) — **PARKED**
> The scoop holds the **shop button** now (see Shop above). Disabled via
> `SD_PET_ENABLED = false` in `screens.js`; the whole engine below — `paintScene`
> / `sceneTick` / `sceneReact` / `SCENE_REACTIONS`, every `.sd-face` rule, the ☺
> Pet box — is intact and untouched. Flip the flag to bring it back. ⚠️ The two
> **cannot share the notch**: it is 63×30 and the face was already sized against
> its worst formation (see `--sd-face-k` below).


**Six dots**, the same six the live pill's arrow is made of, at the same offsets
the retired `.v3-ring--smile` used (they still live in the website proto's
`bento.css` — that is the reference copy). Two eyes over a four-dot mouth arc.
It **reacts to what you do**: favourite, rate, listen, save for later, like,
follow, add to a playlist.

- ⚠️ **Formations, not sprites.** This replaced an SD_DOTS pixel grid that
  swapped a whole 21×10 SVG per frame. A sprite swap is a CUT; these dots
  inherit `.v3-ring-dot`'s 0.4s spring, so a reaction MORPHS out of the smile
  and settles back. A new reaction is six numbers in app.css plus one row in
  `SCENE_REACTIONS` — no engine change.
- ⚠️ **The dots are ROUNDED SQUARES, not circles** — `border-radius: 14%`,
  which is SD_DOTS' `cornerFrac` (dot = 56% of the cell, corner = 14% of the
  dot). They shipped as `50%` because they were copied from `.v3-ring-dot`,
  which was itself circular; **both are now 14%**, so the pill / back-pill /
  follow rings and the pet are the same dot as every generated asset. If the
  rings should go back to circles, it's one declaration.
- ⚠️ **`--sd-face-k` (1.85) is sized against the WORST formation, not the
  resting face.** At 2.1 the smile was a comfortable 25.9 × 20.3 in a 55.4 ×
  26.4 box while the equaliser hit **34.3 tall and broke 7.9px out of the
  scoop**. Shrinking far enough to contain that alone would have left the face
  tiny, so the bars were re-cut too. Measure every formation's ink against the
  box after changing either — the resting face fitting proves nothing.
- ⚠️ **The equaliser grows from a floor** (`transform-origin: center bottom`,
  the one formation that overrides the default centre). Scaled about their
  centres the bars grew in both directions at once — that's what pushed them out
  of the notch, and it read as a bar chart rather than a meter. Every bar shares
  one y and differs only in `scaleY`, so the ceiling is a single number: floor
  4.5 + half-dot 1.5 − 3 × scaleY. **Cap is 4.0**; past that it leaves the notch.
- ⚠️ **The dot must scale WITH the face.** The ring's look is a PROPORTION, not
  a size: 3px of ink across an 11px mouth span, ~27%. Holding the dot at 4.2px
  while scaling the offsets 2.4× dropped it to 16% and the face came out
  spindly and visibly wrong *even though every coordinate was byte-identical to
  the original*. `--sd-face-k` (2.1) scales the whole thing uniformly.
- ⚠️ **Six dots can say EXPRESSIONS and BARS. Nothing else.** The first cut had
  a heart for favourite and a six-point star for rated; on a contact sheet at
  real size both are just a ring of dots — the identical mistake that killed the
  cat mascot and the landscape. Every reaction is now the face emoting, and the
  equaliser is the one object formation that survives. **Build a contact sheet
  at 63×30 before wiring a new formation up**; on paper a heart is obviously fine.
- ⚠️ **The log sheet covers the scoop completely** (hit-tested:
  `elementFromPoint` at its centre returns `.sd-log-song`). Favourite, listen,
  listen-later and the rating all live in there, so a reaction fired from the
  sheet would animate behind it unseen. `sceneReact` therefore **queues when
  covered and replays on close** — which is the better behaviour anyway: you log
  a record, dismiss the sheet, and the pet is waiting to react. Visibility is
  decided by STACKING, not a list of overlay classes: walk to the `.app-screen`
  and compare the highest z-index against the scene's 7 (bare home tops out at
  5, the log sheet at 200). Don't test `el.contains(elementFromPoint(...))` —
  `.sd-scene` is `pointer-events: none`, so that is false even on an open home.
- ⚠️ Anything with class `.sd-scene` gets repainted by the shared clock. A
  static preview of several formations must use a different wrapper class or
  the tick sets them all to the same frame.
- ⚠️ `setLogRating` is called by `openLogSheet` to repaint a saved draft, so the
  reaction there is guarded by `_sdlogRestoring` — otherwise the pet threw a
  rating reaction every time you opened an album you'd already scored.

### The retired sprite scene (`SCENE_FRAMES`)
The scoop holds **two characters in one 21×10 dot grid**, drawn at 63×30px with
SD_DOTS so they are the same rounded-square pixel as every other brand asset:

- **the smile** — the app's face, back from the retired `.v3-ring--smile` dot
  formation. This is the resting state and what the scoop reads as at a glance.
- **the kid** — headphones on, notes drifting off, nodding. A lofi-radio nod. He
  is the **payoff, not the default**: a few seconds at a time in the idle loop,
  and on demand whenever something musical happens.

⚠️ **Two mascots died here, both the same way — too much detail for a 63×30px
box.** First a whole landscape (sun, listener, spectrum bars): a scene made of
small elements reads as *small*. Then a cat with a patch and whiskers: a face
that needs an eye, a nose and a mouth to be legible has nothing left over at a
3px dot. The smile survives because it is **three shapes**. The kid survives
because his eyes and mouth are **unlit holes in a filled head**, not drawn
features — the same trick the original listener sprite used for its headphones.

- **Every frame must be 10 rows of 21.** `paintScene()` swaps the whole SVG per
  frame and nothing re-measures.
- `SCENE_OPTS.dotFrac` is **0.74, above the brand default of 0.56** — at ~3px a
  cell, 0.56 gives sub-2px dots and the face reads as a smudge.
- **Frames:** `smile` · `blink` · `wink` · `kid` · `kidbob`. `SCENE_LOOP` keeps the
  still frames long and the moving ones short — a face that moves constantly
  reads as broken rather than alive — and `wink` exists so the idle isn't a
  two-state flicker between smile and blink.
- `sceneCheer()` **cuts to the kid** for 1.6s and alternates `kid`/`kidbob` to nod
  him, ignoring the loop's place. It's fired from `reactRing`, so the scoop
  reacts to exactly the same events as the live pill (swipe / CD / For You). The
  window is a **timestamp** `sceneTick` checks, so nothing has to clean it up;
  the first call also restarts the tick so he appears immediately instead of
  waiting out a 3-second `smile` hold.
- **One shared clock** (`sceneTick`) paints every scene on screen — the dark and
  light shells sit side by side and two timers would visibly drift. Reduced
  motion gets a single static frame.
- ⚠️ Painting is kicked off from **`paintAfterRender`**, which runs on a
  `requestAnimationFrame`. rAF doesn't fire in a background tab, so an unfocused
  tab shows an empty box (along with unpainted album art) — that's the harness,
  not a bug.
- ⚠️ **The host's width is bounded by the scoop's FLAT TOP (68px), not its
  opening (123px)** — the notch narrows as it rises. Wide and short is the shape
  available, which is why the smile's mouth runs nearly the full width.
- The frames are mirrored as `scene · *` presets in `dot-lab.html`. Redraw one
  there, paste the rows back into `SCENE_FRAMES`.

## Quick share — the bento as an Instagram post (`share.js`)
`buildShareCard(album, review)` draws **1080×1350** (Instagram 4:5): the
**compact bento** — home's resting state — floating on the album's own artwork
blurred into a wallpaper, then your review and a typographic breakdown of the
tracks you scored.

⚠️ **The bento is a FILLED SILHOUETTE, not a stroked frame.** `.v3-master-frame`
still carries the outlines in screens.js but app.css paints them `transparent`;
what you see is **`.v3-bg-fill`'s `bg-right` path** filled with the procedural
`--v3-box1-color`. So the card copies that ONE path (`BENTO_SHELL`) and
re-derives every cell — `BENTO_ALBUM` / `BENTO_FOR` / `BENTO_STRIP` /
`BENTO_CD` / `BENTO_PILL` — from its **app.css percentage** of the 689×638
viewBox. Change a cell's `left/top/width/height` in app.css and the matching
constant has to follow.
⚠️ **One For-You panel, not two.** The two angled panels the master frame draws
are a retired layout (`.v3-for-single` replaced them); drawing them made the
card disagree with the app at a glance. Stroking the frame likewise drew a
hairline the app hasn't shown in months.
⚠️ Approximating it with rounded rects produces a big cover with text under it,
which reads as the **fullscreen album page** — that mistake was made twice.
Shrinking the cover doesn't fix it; the stepped shell is what says "bento".

- **Two coordinate systems, two constants.** Everything structural is a % of
  the viewBox (`K` = card px per unit); the strip's type and the pill's dots are
  sized in **phone px** in app.css, so `U` (= 689/365) converts those to units
  and `PH` converts them to card px. ⚠️ `shadowBlur`/`shadowOffset` are **not**
  transformed — they're device px — so shadows use `PH`, never `K`.
- ⚠️ **`cols.box1` is a `linear-gradient(…)` string** (it feeds `--v3-box1-bg`).
  Canvas silently ignores an unparseable `fillStyle` and keeps the last one, so
  fills using it did nothing at all. The solid colour is **`box1color`**, which
  is what the shell wants anyway.
- ⚠️ **Never punch a hole with `destination-out`** — it erases the card, and the
  vinyls' label holes exported as five transparent dots through the bento. Paint
  the hole in the surface colour behind it instead.
- ⚠️ **The wallpaper blurs by downscaling through a 48px canvas**, not with
  `ctx.filter = 'blur()'`. The filter property is the obvious way and the one
  iOS Safari shipped last — and a card that silently renders the cover SHARP and
  full-bleed is worse than one with no wallpaper. The filter is still applied
  where it exists, but only to smooth what is already soft.
- **The bento is sized last.** The review + breakdown are measured first and the
  bento takes the room that's left (clamped 700–940px wide), so a long review
  can't run the tracklist off the bottom and a short one leaves no void. The type
  column (`TW`) is fixed and independent of it, so the wrap doesn't move.
- The compact bento runs **album 700 / artist 400** — the opposite of the rest of
  the app (see *Album / Artist / Song typography convention*), and the card
  follows the compact rule. Empty vinyls are near-white (`--vinyl-empty` on
  `.s-home-v3`), not a faint grey.

- ⚠️ **Canvas, not html2canvas.** The real bento leans on CSS masks,
  `backdrop-filter`, `aspect-ratio` and SVG masks — all things html2canvas drops
  or mangles — so screenshotting the DOM would export a broken postcard. Canvas
  also gives exact pixel dimensions, which a social export needs.
- ⚠️ **There is no web API that posts to Instagram.** Sharing goes through
  `navigator.share({files})`, which on a phone opens the OS sheet with Instagram
  in it. Desktop and anything without file sharing falls back to saving the PNG;
  the sheet says which you're getting.
- ⚠️ **The PNG blob is built when the sheet OPENS, not on the Share click.**
  Safari drops the user-gesture `navigator.share` requires if you `await`
  anything first, so the handler has to find the file already waiting.
- Covers are loaded with `crossOrigin` for the same reason `computeAlbumColors`
  does: the personas' art is on Deezer's CDN, and without it the canvas is
  tainted and `toBlob()` throws. The sheet degrades to a message if that happens.

### The universal share button + sheet (2026-09-11)

**`shareBtnHtml(kind, arg, cls?)` is THE share control** — a compact 28px round
icon (`.sd-share-btn`, neutral greys, `currentColor` glyph, so it sits on any
surface; `--lg` 34px, `--cta` for the album page's rated CTA). `sdShare(btn)`
turns its kind into a **job** — `{ title, sub, build(), text, url, file }` —
that one sheet renders. **Adding a place to share from is one `shareBtnHtml`
call; adding a KIND is one branch in `shareJob` and one card builder.**

| kind | where it sits | card | text |
|---|---|---|---|
| `review` | the log sheet's Share · your own card's foot · the rated CTA (`syncRevCta`) | `buildShareCard` — the bento **plus a big score row** under it (the strip's score was a footnote) | “quote” — 4.5/5 ●●●●◐ for *album* by artist · @you |
| `rev` | the review page's hero, under the heart (arg: the `REV_INDEX` key) | **`buildReviewCard`** — the page's hero as a picture: photo · name/@handle, the score big with the records, the words at reading size, the record named at the foot; the reviewer's handle in the footer | “quote” — 4.5/5 for *album* by artist · @them |
| `playlist` | the playlist page, beside the back pill (`.plp-toprow`) | `buildPlaylistCard` — cover big, name, first six tracks (an mp4 cover falls back to the first track's art) | name — N songs by … |
| `favs` | the profile's *Favourite albums* heading (`.prof-sec-hd--row`) | `buildFavsCard` — the five records as **CDs on a ring** around the handle (clockwise from the top, numbered), the same five named beneath in that order | @you's favourite albums: … |

- **The sheet is 95% tall** (it rides `.sd-log-sheet`, grab nub wired via
  `wireSheetGrab`) and holds **the card and the buttons, nothing else**
  (2026-09-11): a flex column, the card (`.sd-share-preview`) takes every
  pixel the buttons leave and the canvas grows to whichever edge it meets, and
  a row of three `.sd-share-app` — Instagram · X · Copy text — with **Save
  image full width and largest beneath them** (`.sd-share-app--save`, the
  accent; 2026-09-11 — Messages and Copy link came out) on the bottom edge. No title, no labels, no text
  block (the words are still what Copy text and Messages send). The status
  note is a toast OVER the card (`.sd-share-note.is-on`; sticky while building
  or on a failure), so it costs no height. ⚠️ **Every button is a real gesture**:
  `navigator.share` where the browser has it (Instagram lives in the OS sheet;
  Messages too), an intent URL for X, the clipboard for links and text, `sms:`
  as the no-share fallback. Nothing pretends to post. The PNG blob is still
  built when the sheet OPENS (Safari drops the gesture after an await).
- **`openShareSheet(el, job)`** — or the old `(el, album, review)`, which
  becomes a review job, so the log sheet's Share and `shareMyReview` still
  work. `ov._job` guards a card that finishes after another share opened.
- Links are the live URL with a `#kind=slug` fragment — a placeholder until
  there is routing. Everything inside the sheet reads the `--sd-*` tokens, so
  it re-inks with the light shell like the log sheet does.

## SD_DOTS — the brand dot language (`dots.js`)
**THE Spindeck asset primitive**: a grid of **rounded-square dots** — dot = 56%
of the cell, corner radius = 14% of the dot. Same family as the live-pill
dot-face. `SD_DOTS.svg(pattern, opts)` turns a text pattern (`'x'`/`'#'` = dot,
`'.'`/`' '` = empty, one string per row) into an SVG string; dots fill with
`currentColor`, so CSS `color` tints the asset like a glyph.

Opts: `cell` (viewBox units/cell, default 8) · `dotFrac` · `cornerFrac` ·
`spacing` (pitch multiplier — adds air *without* resizing the dots) · `links`
(`[[x1,y1,x2,y2],…]` — chosen neighbouring pairs melt together through a pinched
surface-tension bridge) · `color` · `cls`.

- **Design patterns in `dot-lab.html`** (toolbar → **◌ Dots**): paint grid, link
  mode for picking which pairs melt, dotFrac/cornerFrac/spacing sliders, a
  localStorage save library, and Copy SVG / Copy call. Its preset dropdown is
  built from `PRESETS` at boot — **don't hardcode `<option>`s**, that's how the
  pet poses went missing from it once already.
- The lab **loads `dots.js`** rather than inlining a copy, so there is one
  generator. (The marketing site's copy of the lab does inline it — that page
  has to run standalone.)
- ⚠️ **Rotate dot assets in RIGHT ANGLES ONLY.** A dot matrix at an off-axis
  angle smears its dots off the pixel grid and reads as mush — let the artwork's
  own 45° steps supply any diagonal.
- Shared with the marketing site (`../spindeck_website_proto`), where the same
  generator is `main.js` §0. Keep them in step if either changes.
- **New icons and assets should use this language** rather than stroked paths.
- **`.v3-nowbar`** sits in the bump, inset to the plateau (x 98.5→480.7 of 576
  = 17.1%→83.5%) — see *Now-playing ticker*. It is a **sibling** of the nav, not
  a child, so its `bottom` is a px offset tuned to the floating bar's hump (65px).

Pinned to the bottom because `.s-home-v3` is `height: 100%; overflow: hidden`
(constrains the flex column).

### The scoop plug, the blur and the bottom fade
- **`.v3-nav-blur`** (z-3) — an **unmasked** `backdrop-filter` across the nav's
  whole box. ⚠️ The glass's own blur is masked to the BAR shape, so it stops at
  the scoop and at the corners beside the bump: content passing behind those
  regions was never blurred, only covered — so any coverage gap showed as *sharp
  text*. This makes the worst case soft instead of legible. Belt and braces
  under the plug, not a replacement for it.

The scoop is a real hole — `.v3-nav-glass` is masked to the bar shape, so the
scoop falls outside it and content scrolling behind the nav showed through it
sharp and unblurred. Two sibling layers fix that, both at `z-index: 4` (over
content, under the nav at 5 and the pet):

- **`.v3-nav-nest`** — the **negative of the bar**: an enclosing rect MINUS the
  bar path via `fill-rule='evenodd'`. So it plugs the scoop *and* the two corner
  gaps either side of the bump, and **by construction every pixel inside the
  nav's box is covered by either the glass or the plug**.
  ⚠️ **This is the fix for the "artifacts" — feed text leaking through
  sub-pixel seams** wherever the bar's fill ended and nothing else began. It
  showed as a mottled, dashed-looking hairline along the scoop's flat top and
  along the fillets. Two things were needed and neither alone was enough:
  masking the *whole* negative (patching just the scoop left the corners), and
  **stroking the mask path** (`stroke-width='2'`) so the plug dilates 1 unit into
  the bar and the two overlap instead of butting edge-to-edge.
  ⚠️ Curved edges hide this class of bug — their mask edge crosses pixels
  diagonally. Flat runs expose it. So a seam can look fine on the fillets and
  still be obvious on the scoop's flat top.
- **`.v3-bottom-fade`** — content runs out of road instead of being chopped off
  by the bar. ⚠️ Its opaque band must reach the nav's **top edge** (46% of its
  height ≈ 63px, just past the 62px bar). Stop it short and content steps from
  part-faded straight to the plug's flat colour, drawing a visible line along the
  top of the bar in the corners beside the bump.

⚠️ **Both fill with `background-color: inherit`, and that is deliberate.** The
screen background comes from SIX places — the dark base, the light variant, the
review flood, the artist override, and the persona skins — so mirroring it into
a variable would rot the first time a seventh appears. Inheriting tracks
whatever is actually painted, the album flood's transition included. Verified
matching on the bento, the album page and a persona.

- This only works because they are **direct children of `.s-home-v3`**. Move
  them inside `.v3-bottom-nav` and they inherit its transparent background.
- The fade is a solid block revealed by a **mask** gradient, not a colour-stop
  gradient — a gradient can't say "whatever the background happens to be".

### Silhouette geometry — how to rescale it
At the 385px mockup: bar **62px**, plateau **17.1%→83.5%** (255px), scoop
**33.1%→65.1%** (123px at its opening, 68px at its flat top), **33px deep** with
softly rounded lips where it meets the bottom edge.

⚠️ **The scoop no longer reaches the shoulder.** Its flat top is y=43.12 while
the shoulder — the level the bar's flat runs sit at — is y=34.12, so it stops
9 units (6px) short. The first two indent drafts had them on the same line;
anything that assumed that is wrong for this one.

⚠️ **The scoop is drawn 2 units LOWER than the .svg**, in both the outline path
and the plug mask. The bar's bottom edge is bled to y=101 (below the clip), so
the path has to jog up to the scoop's drawn mouth at y=92.01 — and the last
~1 unit of that jog lands *inside* the viewBox, painting a **1px vertical tick
at each bottom corner of the scoop**. Tiny, but very visible against the plug.
Dropping the scoop's mouth to y=94 clips the jog away with everything else.
Verify with `path.isPointInStroke()` at x=190.777 and x=375.209 — both should
return nothing between y=86 and the viewBox bottom.

Each side transition is a **concave fillet (r=14.22) into a convex corner
(r=17.78)** — together a 32-unit 45° S-curve, since r1+r2 equals the rise and
also the horizontal run. ⚠️ **Keep the r1:r2 ratio (0.444 : 0.556) if you
rescale**, or the swoop changes character. Control points are at `0.5523 × r`
from each end along the tangent (the circular-arc constant) — eyeballing them
gives a visibly non-circular curve. The two independent dials are the **viewBox
height** (bar thickness) and the **plateau x-bounds** (bump width vs. flat run);
regenerate rather than hand-editing coordinates.

⚠️ **The left, right and bottom edges are drawn 8 units OUTSIDE the viewBox**
(x −8→542, bottom y 87). The `<svg>` and the mask both clip to the viewBox, so
those three strokes are cut away and only the top contour — shoulders and bump —
is outlined. Pull them back inside and a hairline reappears down both screen
edges.

**History:** it first floated — 72% wide, centred, 24px off the bottom, every
corner rounded (`BOTTOM_NAV.svg`, viewBox 553×126). Docking it full-bleed
(534×117) overshot at 84px; 534×90, then 534×79, shrank it with longer flats;
534×94 took it back to 68px. The current 576×93 is a **hand redraw** that adds
the scoop — so the earlier "keep the r1:r2 ratio" arithmetic describes how the
generated versions were built, not this one. Edit the drawing, not the numbers.

- ⚠️ **`aspect-ratio: 576 / 93` is load-bearing.** The SVG is
  `preserveAspectRatio="none"` and the mask is sized `100% 100%`, so both *will*
  stretch — the aspect-ratio is the only thing keeping the fillet curves true.
  Don't swap it for a fixed height.
- The glass shadow casts **upward** (`0 -8px 28px`); there's nothing below the
  bar to catch a downward one any more.
- Every screen's scroller clears it with `padding-bottom: 75px` (62px bar + 13).
  A new screen on this shell needs the same.

### Progressive cover load (`sdCover` in app.js, `.sd-pix` in app.css)

Covers resolve from big blocks into small ones while they're still on the wire —
the brand's dot-matrix language applied to loading. Used by `setMainAlbum` (the
hero and the CD), the For-You panel, and `slideIn`'s incoming swipe layer.

- ⚠️ **It only runs when the image is actually slow.** Under `PIX_GRACE`
  (190ms) — cache, wifi, a local file — the cover just appears. An effect on
  every load is a gimmick, and on a fast connection it's *added latency*: half a
  second watching pixels resolve over a picture that had already arrived.
  `PIX_SEEN` makes a cover resolve at most once per session, so swiping back and
  forth doesn't re-run it.
- ⚠️ **The placeholder is a real low-resolution FETCH, not a blur of something
  we already have.** Deezer serves every cover at any size off one path
  (`…/<md5>/1000x1000-000000-80-0-0.jpg`), so `pixTinyUrl` rewrites that segment
  for a 56px thumbnail — **1,190 bytes against 46,744**, measured. That is what
  makes it *progressive* rather than decorative: there is genuinely more picture
  on screen sooner, which is the entire point on 5G. All 158 remote covers
  rewrite; the 145 local `images/album-*` files have no variant and never trip
  the grace timer anyway.
- ⚠️ **No `crossOrigin`, unlike `computeAlbumColors`.** That one needs it to
  read pixels back; this one only ever *draws*, and a tainted canvas draws fine.
  Setting it would make covers fail outright on any host without CORS headers.
- ⚠️ **The backing store takes the ELEMENT's aspect, not the artwork's.**
  `.v3-for-single` is 113×415 — stretching a square thumbnail across it smears
  the blocks into tall rectangles — so the thumbnail is cover-cropped into a
  canvas of the box's ratio, exactly like `background-size: cover`.
- ⚠️ `image-rendering: pixelated` **is** the effect (a 5×5 store blown up to the
  box), and `border-radius: inherit` is required: the canvas rides three
  elements with three different corners, one of them the album's derived
  two-axis radius, so any literal value would be wrong on at least two.
- Steps are `PIX_STEPS` on an ease-in-out over `PIX_MS` — it holds the coarse
  blocks a beat, then resolves in a rush — then cross-fades to the sharp image.
  Reduced motion skips the whole thing.

### Procedural Color System
`applyAlbumColors(screenEl)` in `app.js` runs after every render:
1. Reads album art URL from `.v3-album`'s `background-image`
2. Draws to 48×48 canvas, finds most vibrant pixel
3. Sets on `.s-home-v3`: `--v3-accent`, `--v3-box1-bg`, `--v3-box2-bg`

Light theme overrides these with hardcoded values (`background: #999`) — still WIP.

### Music Preview System
30-second Apple Music previews, played via a single reused `<audio>` element. All in `app.js`.
**Previews are OFF** (`PREVIEWS_ENABLED = false`) — see *No autoplay* below.

**Fetching (`fetchPreviewUrl`)** — iTunes Search API over JSONP (no CORS). Two hops: `fetchItunesAlbum` → track lookup. Cached by `"artist – album"` (lowercased):
- `PREVIEW_CACHE` — resolved results (a URL, or `null` for a known miss).
- `PREVIEW_PENDING` — in-flight promises, so concurrent lookups for the same album share one request.
- **`fetchItunesAlbum` / `ITUNES_CACHE`** hold the first hop on its own, because *Listen on* wants the same record's `collectionViewUrl` while the preview wants its `collectionId`. One request, one cache, `null` included.

**State (`PREVIEW`)** — intent is the single source of truth; the UI **never** reads `audio.paused` (it lags while buffering, which made the icon "invert" on 5G):
- `on` — preview mode armed (speaker). `paused` — CD-paused within the mode. Playing ⟺ `on && !paused`.
- `gen` — token bumped on every tap and every album change; a late fetch bails if `gen` (or the album `key`) changed while it was in flight, so a slow result can't hijack the audio.
- `unlocked` — the element is unlocked once, synchronously, inside the first tap gesture (a runtime-built silent WAV). iOS only permits programmatic `play()` after that — this is why previews wouldn't start before.

**No autoplay — a product decision, not a limitation.** Previews were briefly armed by the first touch of the phone and it worked; it was removed because music that starts on its own is a thing users switch off, not a feature. **Don't wire it back up.** The row in the CD's menu is the whole of the preview feature: you ask for one, you get one. (For the record on the constraint itself: no page may start audio before a gesture — `play()` before one is rejected, and iOS additionally requires the `<audio>` **element** to have been played once *inside* a real gesture, which is the job of `unlockAudio` and its runtime-built silent WAV.)

**Warming (`preloadPreviews`)** — **forward-only and staggered**, and neither is arbitrary:
- Forward-only for the same reason as `preloadForYou`: a swipe goes forward, For You shows what's next, and the album behind you is already cached — warming backwards spends a budget you can't get back.
- Staggered (`PREVIEW_WARM_GAP` = 400ms) because iTunes refuses outright when several requests land in the same instant. Measured: a ~120ms gap errors, 400ms+ is clean — and the empty result sets in between are **real catalogue gaps, not throttling** (Blonde and Loveless genuinely aren't in the Search index).
- ⚠️ The album actually making sound is **never in this queue**; `playPreviewFor` fetches it directly, so nothing warm is ever ahead of it.

**Actuation (`playPreviewFor(album, gen)`)** — plays the preview for a **specific album passed in**, resolved through the cache. It must NOT re-query the DOM for "the current album": there are multiple `.s-home-v3` instances (variants + mobile clones) and `querySelector` returns the first, which often isn't the one you swiped — that was the "swipe plays the wrong/stale track" bug. `loadPreview(album)` (called from `setMainAlbum` on every album change) passes the swiped album straight through. Only the tap handlers use `currentBentoAlbum()`, which prefers a **visible** screen.

### Listen on — Spotify / Apple Music / Deezer (`openOnService` in `app.js`, `SD_SERVICES` in `screens.js`)

The three rows under the preview in a CD's menu. Tapping one opens that service
on the album — on a phone these are **universal links**, so the OS hands off to
the installed app; on desktop the same URL opens the web player. Nothing is
mocked. Wired on the **bento's CD** (home *and* the album page) and on the
**profile card's five CDs**; the playlist page's identical-looking menu is left
alone, because a Spindeck playlist is not an album and has nothing to link to.

**Where a link comes from**

| Service | Link | Why |
|---------|------|-----|
| Deezer | the real album page | public API, no key, and `deezerId` is already on anything the rec pool dealt — often no request at all |
| Apple Music | the real album page **when the match is confident**, else a search | iTunes Search indexes the *store*, not all of Apple Music — Blonde and Loveless simply aren't in it |
| Spotify | always a search | its API needs an OAuth token and a static page has nowhere to keep one |

- ⚠️ **The tab is opened INSIDE the gesture.** `window.open` after an `await`
  is a popup and gets blocked — the first tap on every album would silently do
  nothing, which looks exactly like a dead button. A warm link opens directly; a
  cold one opens a **blank tab now** and gets steered when the lookup lands.
  Opening the menu calls `warmServiceLinks`, so by the time a finger travels
  from the CD to a row the tap is nearly always the direct path.
- ⚠️ **`SERVICE_URL_CACHE` caches `null` too.** "Deezer hasn't got this record"
  is worth remembering — otherwise every tap re-asks and the row goes on feeling
  broken in a new way each time. A miss dips the row (`.none`), the same
  language the preview button already speaks.
- **Which album a menu belongs to** (`menuAlbum`): the bento's reads `_album`
  off the **shell it sits in**, never a global — several `.s-home-v3` are in the
  DOM at once and the first is usually not the visible one (the same trap behind
  the old "preview plays the wrong track" bug). The profile's five CDs share one
  screen, so each names its favourite's `slot` instead — which is also why
  `toggleProfCd` now takes a slot.
- ⚠️ **`SD_SERVICES` + `platRowsHtml(slot)` in `screens.js` are the ONE copy of
  those rows**, declared above `SCREENS` (the bento's markup is a template
  literal evaluated as the file parses, so the table cannot be declared after
  it). They used to be two hand-written copies of the same wall of inline SVG.
- **SoundCloud is gone** from these two menus, replaced by Deezer. There is no
  keyless way to resolve an album on it, and a row that opens nothing is worse
  than a row that isn't there.

### Matching a record to a service (`pickItunesAlbum`)

Shared by the preview and the Apple link, and the reason the old one had to go:
searching *"Phoebe Bridgers Punisher"* returns a **cover of Punisher by someone
else** above anything of hers, and the old picker took it — the title contained
the album, so it stopped looking. **The artist has to agree before the title
counts at all.**

Tiers, best first: `0` exact title · `1` same record reissued · `2` right artist,
wrong record · `3` nothing. Within a tier the **shortest** title wins, which is
what keeps a plain album ahead of its own deluxe (SOS over "SOS Deluxe: LANA").

- Two title normalisers, each catching what the other can't. `normFull` keeps
  everything — "Crystal Castles (II)" and "(III)" are different records and
  stripping the numeral would merge them. `normBase` drops parentheses and
  edition suffixes — "In Utero" has to match "In Utero (20th Anniversary
  Edition)", the only one Apple has.
- ⚠️ **`wantB` is guarded against empty.** The archive stores Crystal Castles'
  albums as `"(II)"` / `"(III)"`, which strip to nothing — and an empty string
  would then match every other title that also strips to nothing. Those records
  are caught by comparing **artist + title** as well, which is how `"(II)"`
  meets the service's "Crystal Castles (II)".
- ⚠️ **Tier 2 is returned, not dropped.** The preview wants *something* by this
  artist and has always settled for that; the Apple link refuses it and falls
  back to a search. **The caller decides how much certainty it needs** — don't
  make the picker stricter to fix a link, or previews go quiet.

### Album Swipe & Text Animation
`setMainAlbum(screenEl, album, animate, animateText = animate)` splits two concerns:
- `animate` → **art** motion (cover `slideIn`, CD reload).
- `animateText` → **type** motion (artist/album typewriter, stars fade, quote typewriter).

They're decoupled because a **swipe** already filmstrips the cover art itself, so it passes `animate:false, animateText:true` (via `applyAlbumIndex(..., animateText)`) — the art slides through the swipe layers while the title/quote still typewrite in. A **"For You" tap** passes both `true`.

---

## Playlists / Library v2 (`playlistsHtml(light)` in screens.js)

Adapted to the home shell like the wall: `.s-home-v3 .s-pl2` + `appHeader()` + `.v3-body > .pl2-scroll` + `nowBar()` + `bottomNav('playlists')`, rendered as a Float·Dark/Float·Light getter pair. **Playlists only** — no page title (the pills ARE the header; the old "Library / yours, catalogued" heading and the Artists/Albums/Songs/Genres tabs are gone). The top bar (`.pl2-topbar`) is two sort pills, then on the right an embossed **Discover** button and an embossed **"+" (new playlist) button** (both share the `.v3-search-pill` neu-emboss; "+" is prototype-only, no handler). Pills reuse the wall's `.wall2-bar`/`.wall2-cat`, switched client-side by `plTab(btn, tab)` in app.js (toggles `hidden` on `.pl2-sec[data-tab]` sections; no re-navigation — `plTab` also clears/sets `.active` on `.pl2-discover`, which acts as a third tab and fills `var(--star)` when active); the pill row scrolls horizontally and **fades out at the right edge** (CSS mask) when it overflows:
> ⚠️ **2026-09-18 (Eric): Popularity and Discover are OUT "for now"**, and the
> pill row is your LIBRARY: **All Playlists · Favorite albums · Listened ·
> Listen later · Favorite songs**, with only the "+" on the right. The bullets
> below describe the two retired tabs; `.pl2-discover`'s CSS is still in
> app.css for the day Discover returns.
>
> - **`plLibrary()` (screens.js) reads the log drafts — there is no second
>   store.** Favorite / Listened / Later are the flags the album page's rate
>   group and the log sheet already write, and a favourite song is a
>   `song::title::album` draft with `fav`. Newest touch first. ⚠️ A **rated**
>   album counts as Listened whether or not the lobe was pressed.
> - Albums render as the trending wall's `.wall2-grid` cell — rated, the discs and number are YOUR
>   score with a "Your rating" caption under them (`.pl2-lib-mine`); unrated,
>   the crowd's as on the wall; songs as the playlist page's `.plp-song` row with a
>   cover where the number was (`.pl2-lib-song`), tapping through to the log
>   sheet via `plSongTap`.
> - ⚠️ **Drafts now carry `image` and a `snap`** (`libSnapFor`, app.js). Two
>   thirds of what you swipe past is the runtime rec pool, gone from ARCHIVE
>   after a reload; `plLibOpen` rebuilds the record from the snap with
>   `dzRecord`'s own seeded numbers and adopts it back into ARCHIVE. Drafts
>   written before this date have no snap, so a rec logged earlier only shows
>   while it happens to be in the deal.
> - `plTab` stamps `window.PL_TAB` (the `WALL_SORT` idiom) so Back from an
>   album lands on the tab you left, and scrolls the picked pill into the row
>   by hand — `scrollIntoView` would also move `.v3-body`.
> - The tabs are EMPTY on a fresh browser — they are real state, not seeded —
>   and each says how to fill it.

- **All Playlists** — chronological (the `plLists()` order)
- **Popularity** — favs desc
- **Discover** — community playlists (`creator !== 'you'`), most-loved first (`plays` still lives in `plLists()` data, currently unused)

Ten sample lists (data in `plLists()`, shared with the playlist page) carry memey user-typed titles (mixed case, stray symbols — they're personal, not editorial), **custom cover art** (`images/playlist-*.jpg`, sourced from Eric's own images — deliberately NOT album covers), an `edited` stamp, and `plays`. Card click → `openPlaylistPage(name)`.

### The card

Two things were tried and dropped on the way here, and both matter before changing this:

1. **A wall of 80px split rows** (geometry from `PlaylistBox_NEW.svg`, gone along with every `.pl2-list-*` rule). Too small to be anything — a playlist is the one object in the app the user actually *made*, and a row gave it nothing.
2. **Five user-pickable themes** (poster / polaroid / tape / index / classic). ⚠️ Killed deliberately: a wall where every card is a different shape reads as a mess, and most people never open a picker — so the wall gets judged on the default anyway. **Do not reintroduce per-card shapes.**

What is left is **one card**, 3:2, art full-bleed under a scrim with the title set at 24px over it. The variety comes from where it should: the **artwork**, which differs for every playlist because the user chose it, and the badges. The frame stays constant so ten of them stack into a wall instead of a pile.

- ⚠️ **`aspect-ratio`, not a fixed height.** The phone frame is not one width (the viewer zooms; the mobile prototype is the real device), and a card locked to 230px goes squat on a wide frame and cramped on a narrow one.
- ⚠️ **The scrim is a gradient layer, never a `filter` on the art.** Darkening the whole image to make type readable throws away the picture the card exists to show. It has **two** mid stops — a single linear ramp leaves a visible band across the middle at this height.
- ⚠️ **The art is scaled 1.04 and grows on press**, not the card alone. The card is mostly picture, so the press has to happen to the *picture* or it reads as the text moving.
- ⚠️ **No light-theme overrides, on purpose.** Every piece of type sits on a photograph, not on the page, so it stays white in both themes — exactly as album art does everywhere else. The light theme only touches the empty state behind an unloaded image.
- The `·` separators in the meta row come from CSS (`span + span::before`), not the markup — a leading dot before an empty first item is the classic version of that bug.

### Moving covers — GIF and video (`plIsVideo` · `plArtHtml` · `plVideoWatch`)

A cover can be a still, a **GIF** or a **video**. A GIF needs nothing special — it animates as a `background-image` like any other file — so video is the only case worth detecting, and `plArtHtml` returns either a `<div>` with a background or a real `<video>`. The same helper backs the card, the playlist page hero and the upload well, so all three agree.

- ⚠️ **Detect on the `data:` MIME as well as the extension.** An uploaded cover arrives from `FileReader` as a `data:` URL with no filename at all, so an extension test alone renders every uploaded video as a blank box.
- ⚠️ **The markup ships NO `autoplay`, and `preload="none"`.** A wall of ten cards can hold ten videos, and ten decoders at once is what turns a scroll into a slideshow — on a real phone over 5G, the exact case this prototype exists to test. `plVideoWatch` plays them by visibility instead.
- ⚠️ **The observer's root is `.v3-body`, the element that actually scrolls — not the viewport.** In the desktop viewer the phone is a box on a page that never scrolls itself, so a viewport-rooted observer reports every card as permanently visible and plays all ten.
- ⚠️ `muted` + `playsinline` are not optional: without `muted` the browser refuses to play without a gesture, and without `playsinline` iOS takes the video fullscreen the moment it starts.
- ⚠️ `object-fit: cover` on `.pl2-art-vid` is the video equivalent of `background-size: cover`. Without it the frame is letterboxed and the crop stops matching every other cover on the wall.
- **Two sample covers move**: `playlist-car-dash.mp4` (93KB) and `playlist-wildflowers.gif` (283KB), so both paths are exercised by the sample data rather than only by an upload. Both were generated from the stills beside them with ffmpeg — a slow zoom, **mirrored so the loop is seamless** — which is why they are kilobytes rather than megabytes. The upload input accepts `image/*,video/mp4,video/webm`.

### Badges (`PL_BADGES`, up to `PL_BADGE_MAX` = 3)

Emblems the owner pins on a card, drawn in the **dot system** (new 5×5 entries in `SD_DOT_ICONS`: `gem` `flame` `moon` `bolt` `drop` `sun`), so a badge is the same material as the nav and the log buttons rather than a sticker from somewhere else. Each has its own colour: now that the card is fixed, badges and artwork are the *only* things that vary, so a card wearing three should read as three things and not a row of identical chips.

- ⚠️ **Badges survived the theme cull because they cannot break the wall** — they are small, they sit in a slot the design reserves for them, and no arrangement of them makes the page look wrong. That is the test for anything else added here.
- ⚠️ **The cap is the design.** A card wearing six badges says nothing.
- ⚠️ **The editorial tag is a different object from a badge.** Crown = community favourite (favs > 25), candle = staff pick, staff wins. Square not round, top-*left* not top-right — a badge is self-expression, the tag is a verdict from outside, and the two must not be mistaken for each other.

### Customising a card

⚠️ **Nothing here is sold, and nothing is locked.** Themes and badges were briefly products in the shop and it was the wrong call: a playlist is the one place in the app where the user is the *author*, and charging for how they dress their own work turns self-expression into a tier list. The line that came out of it: **cosmetics that dress up YOU** — profile themes, frames, the badge by your name — **are fair game; cosmetics that dress up what you MADE are not.** Don't add a `price` field to `PL_BADGES`, an ownership check to the sheet, or a playlist section back to `shopHtml` — all three were removed on purpose.

- **`plCustom()` / `plSetCustom(name, patch)`** — per-playlist overrides in `localStorage['spindeck-pl-custom']`, merged over the authored defaults at the end of `plLists()`. The authored `badges` exist so the wall is not a column of bare cards on first load.
**Two controls, two scopes** — and deliberately two different glyphs:

| Where | Glyph | Opens |
|-------|-------|-------|
| in the badge row, top-right | `+` | `openPlCustomize(key, triggerEl)` — the badges sheet |
| lower-right corner | pencil | `openEditPlaylist(key)` — the playlist itself |

- ⚠️ Two pencils in two corners would be a coin flip. The `+` sits next to the badges it adds to; the pencil is the whole playlist.
- ⚠️ The badge row **still renders on your own card when there are no badges yet** — otherwise the only way to get a first badge would be a control that appears once you already have one.
- ⚠️ **The pencil is always visible** (2026-09-11). It used to fade in on hover with a `(hover: none)` escape hatch for touch, and on the desktop viewer nobody found it — Eric asked for "an edit button on each playlist" while it was already there. Hover now only deepens its background.
- **`openEditPlaylist`** re-uses the New Playlist page rather than adding an edit screen — every field is already there, and a second form would drift out of sync with the first. `PLNEW.editing` holds the stable key and is the only thing that tells the two apart; `plnewCreateLabel` swaps the button to *Save changes*. ⚠️ `openNewPlaylist` must clear it, or "+" silently overwrites whatever was edited last.
- **Delete lives inside the editor, edit mode only** — a red square trash `.plnew-delete` on the same line as *Save changes* (`.plnew-actions`: Save fills the line, the trash sits at its right end; 2026-09-11) (`playlistNewHtml` renders it only when `S.editing` is set; a new playlist has nothing to delete). It never acts on its own: `plnewAskDelete(btn)` mounts a confirm sheet (`#pldel`, `.pldel-sheet` on the `.sd-log-overlay` scrim, same material as the badges sheet) **into the `.s-plnew` the tap came from**, asking *Delete "name"? Are you sure you want to delete it?* with Cancel / Delete. `plnewDelete` then has the same two homes as saving: a created playlist is spliced out of `PLNEW_CREATED`; an authored sample gets `{ deleted: true }` in `plCustom` under its stable key and `plLists()` filters it out (`.filter(l => !l.deleted)`). ⚠️ That flag persists with the badges in `localStorage['spindeck-pl-custom']`, so a deleted sample stays gone across reloads — clear that key to get the sample wall back. After deleting it clears the back stack and lands on the wall rather than `goBack()`, because the recorded location may be the page of the playlist that no longer exists.
- Saving branches on where the playlist lives: one you created is a real object in `PLNEW_CREATED` and gets mutated; an authored sample is regenerated on every `plLists()` call, so the change goes to `plCustom` under the **stable key** and is merged back over the literal.
- ⚠️ **`key` is stamped last in `plLists()`, from the literal's own name**, so it cannot be overridden. Everything customisable is stored under it rather than under the displayed name — which is what lets the editor rename a playlist without orphaning its badges.
- ⚠️ **The sheet writes through immediately** — no Save, same as the log sheet and the dev box. Every tap re-renders the wall behind it, so you choose against the real card rather than a preview.
- ⚠️ `PLC.light` remembers which shell the sheet was opened from. Dark and Light are separate screen elements and every change re-renders both, so without it the sheet could jump variants mid-edit.

## New Playlist (`playlistNewHtml(light)` + `PLNEW` in `app.js`)

The creation page behind the Playlists **"+"** (`.pl2-add`, which was a dead
`event.stopPropagation()` stub) — `openNewPlaylist()` resets state, pushes the
back stack and navigates to `playlist-new`.

**The concept:** it's built on the *same geometry as the playlist detail page* —
Eric's `PlaylistPageBox.svg` panel path, the image panel, the CD in its swoop —
so the form reads as the page you're filling in. Pick a cover and the panel + CD
both take it; type a name and it lands in the title; add songs and the count
ticks up. By the time you press Create you've already seen the result.

- **Fields:** cover · name (inline input styled as an editable `.plp-name`) ·
  **Public / Private** pills in the slot the detail page gives the heart ·
  add-songs (search **or** library) + a removable chosen list. No description
  field — the data model and the detail page have nowhere to show one.
- **Layout order** (deliberate, don't shuffle it): hero → **Create** → search +
  Library → **chosen songs** → results. Create sits at the top so it stays
  reachable no matter how many songs get added, and the chosen list sits directly
  under the search so picks stack up beneath it as you go. There's no "Songs"
  heading, and `plnewChosenHtml()` returns **nothing** when the list is empty
  (`.plnew-chosen:empty` collapses) — the results hint already says what to do,
  so a placeholder there would only push the results down.
- **Cover is a real upload.** The well is a `<label>` wrapping a hidden
  `<input type="file">`, so the whole panel opens the native picker;
  `plnewUpload()` reads it to a `data:` URL into `PLNEW.cover` (which survives
  re-renders — the file input's own value does not). There is deliberately **no
  cover suggestion strip**; covers are custom art, per the sample data.
- **Two ways to add songs**, side by side under the chosen list:
  - **Search** (`plnew-searchbar`) over `plnewPool()` — every `songsFor()` track
    across `ARCHIVE`, flattened once. Keyed `album::trackNo::title`; **the track
    number matters**, because `songsFor` picks titles from a word list and one
    album can end up with two tracks of the same name, which keying on
    album+title alone would merge into one row.
  - **Library** (`plnew-libbtn` → `PLNEW.mode = 'library'`) — pulls from the
    playlists you already have, since the Playlists screen *is* the library in
    this app. Lists `plLists()`, tap one to open its tracks, add individually or
    **Add all** (`plnewAddAll`, deduped by key). Typing in search switches the
    mode back.
- **Nothing is listed until you act** — no query and no library selection shows a
  one-line hint, not a suggestion list. (An earlier cut pre-filled suggestions
  from `featuredAlbum` + `trendingAlbums`; note if you ever reinstate that,
  **`trendingAlbums` is the whole archive minus the feature — ~145, not five,
  despite the name** — unsliced it renders hundreds of rows and janks the page.)
- **Create** (`plnewCreate`) builds a real playlist object, `unshift`es it onto
  `window.PLNEW_CREATED`, and navigates to its detail page. `plLists()` spreads
  `PLNEW_CREATED` in at the **front** of the library, and `playlistPageHtml`
  renders `pl.songs` when present instead of its seeded stand-in tracklist — so a
  playlist you build shows the actual songs you picked. Disabled until it has a
  name; 0 songs is allowed and the detail page shows a `.plp-empty` state.
  No upload? the cover falls back to the **first track's album art**, and only to
  `images/spindeck-appicon.png` if the playlist is empty too, so a library card
  is never a broken image.
- **`plTracksFor(pl)`** (screens.js) is the single source of a playlist's
  tracklist — real `pl.songs` if it has them, else the seeded stand-in. Both the
  detail page and the library browser call it, so they can't drift; its keys
  match `plnewPool()`'s so the picker knows what's already added.

⚠️ **`window.PLNEW = PLNEW` is not optional.** `PLNEW` is a top-level `const` in
app.js, which is a global *binding* but NOT a window property — and
`playlistNewHtml` reads `window.PLNEW` to paint a fresh render. Until 2026-09-11
that line was missing, so the getter silently used its empty fallback: the edit
page opened with a blank name, no cover and Public selected whatever the
playlist actually was, and only the `call('plnew…')` helpers (which close over
the real `PLNEW`) painted correctly.

**Rendering discipline — read this before touching it.** State lives in `PLNEW`;
the screen paints it two ways:
1. `playlistNewHtml()` renders the current state **directly** (the getter pattern
   the other dynamic screens use), so a fresh render is always correct on its own.
2. `plnewSync()` patches the **live** instances after an edit, rather than
   re-rendering — a full re-render would blow away the caret of the field being
   typed in. It also keeps the viewer's side-by-side dark/light variants agreeing
   (the same problem the onboarding wizard solves with `obSync`). Inputs are only
   written when the value actually differs, so the instance being typed in is
   never touched. The markup builders (`plnewCoversHtml` / `plnewChosenHtml` /
   `plnewResultsHtml` / `plnewCountLabel` / `plnewCreateLabel`) are shared by both
   paths.

An earlier cut relied on a post-render `plnewInit` hook alongside the `obInit`
calls in `renderViewer`'s rAF; it silently never fired when arriving via the "+"
(the screen rendered as a bare shell with empty containers) and was removed.
**Don't reintroduce a render hook here** — the getter is what makes it reliable.

## Playlist Page (`playlistPageHtml(light)` in screens.js)

The detail page for one song playlist. Geometry from Eric's `PlaylistPageBox.svg` (688×303): the hero is an `aspect-ratio: 688/303` box — image panel + CD are positioned divs (percent coords straight from the SVG); the info panel and Popular dog-ear are **his exact SVG paths inlined** (`.plp-shape-panel`/`.plp-shape-tag`, filled via CSS per theme). The info panel has a concave swoop carved from its bottom-right; the spinning CD (reuses `v3spin` + `.v3-cd-hole`) seats in it and overflows below the panel.

- Rendered from `window.activePlaylist` (set by `openPlaylistPage(name)` in app.js; falls back to `plLists()[0]`).
- Info panel text: title / `by creator` / `N songs · edited Xd ago` / **majority genres** (`.plp-genres`, top 3 genres counted across the tracklist's albums, faint light letters).
- Tracklist: seeded (`seedRand(name + '::pl')`) pick of archive albums, one `songsFor()` track each — deterministic per playlist. Rows are **one line** (song title boldest → album mid → artist lightest — deliberate exception to the artist-bold convention) that **fades out via mask** when too long, plus a numeric rating and duration. Ratings cluster near 4.0 (±0.35) with 1–2 seeded outliers (dud or banger). Row click → log sheet via `plSongTap`.
- **Top row** (`.plp-toprow`): the back pill on the left; on the right (`.plp-topbtns`) a **pencil** → `openEditPlaylist` on your own playlists (2026-09-11) and the share button.
- **Back pill** (`.plp-back-pill`, above the hero): styled like the home live pill (same `.v3-search-pill` neu-emboss — solid bg, dual shadow, no border) and reuses its 6-dot ring — arrow points **left** (back) regardless of hand mode; the formation rules sit before the reaction formations in app.css so those still win.

**⚠️ The dot FACE is retired.** The 6-dot ring used to double as a mascot: a
`.v3-ring--smile` formation (2 eyes + a 4-dot mouth) and a `.v3-ring--wink`
keyframe, flashed from four places — `plRingSmile()` on the back pill (playlist
favourite + an 11s timer), `greetRing()` on the first home render, and
`homeRingPeek()` every ~10s on the bento, plus a half-broken wink on the
profile's Follow button that added `--wink` *without* `--smile`, so it animated
dots still in the ARROW formation. All gone, along with the formations and
keyframes: **the nav's pet carries the app's personality now**, and these are
controls. The dots keep the arrow plus the swipe / For-You / CD reactions.
- **CD click** → `togglePlPlat`: streaming-platform menu (Spotify / Apple Music / SoundCloud, same icons as the review page's stream sheet), reusing `.wall2-menu` styling.
- **Favorite**: `.plp-fav` heart pill → `togglePlFav` — toggles, adjusts the count, and persists `favs`/`faved` onto `activePlaylist` so re-renders keep the state.
- `‹ Library` back button → `navigate('playlists')`; bottom nav stays on the playlists tab.

---

## Profile — "Funky" theme 01 (`profileHtml` + `PROFILE` in `app.js`)

744×889 layout traced from `Profile_Theme_01.svg`, with Eric's **textured skin
PNG** (`images/profile-skin-01.png`, 800×800) laid **over the base part** for the
old-school/Winamp look. Layers (low→high z):
1. **Emboss base panel** (`.prof-base`, z1) — main outline + info blob + social
   tab, filled `--pf-base` and embossed OUT (dual `drop-shadow`).
2. **Profile picture + 5 favourite-album wells** (z2) — embossed IN (inset
   shadows), positioned in the 744×889 coords.
3. **The skin** (`.prof-skin`, z3, `pointer-events:none`) — scaled/offset
   (`left:-3.79%; top:-4.65%; width:107.74%`) so the PNG's holes register exactly
   on the pic + CD circles. Its edges frame them; clicks pass through to the
   wells. **If the skin art changes, re-derive that transform** (align the big
   pic-hole to the base pic circle; every CD then lines up).
4. **Labels/controls on top** (z4-6) — `.prof-fav-tag`, `.prof-social` (+
   `.prof-soc-menu`), `.prof-info` bio. Elements over the brown skin use fixed
   light ink; the bio sits below the skin's lobe on the emboss panel.

Wrapped in the **home shell**: `.s-home-v3 .s-prof2` + `appHeader()` +
`.v3-body > .prof2-scroll` + `nowBar()` + `bottomNav('profile')`. **Username in the
top gap** (`.prof2-userbar`). Rendered **Funky·Dark / Funky·Light**; tokens
(`--pf-base/-lt/-dk/-ink/-well-*/-fg/-surface/...`) scoped to `.s-prof2` and
`.s-prof2.s-home-v3--light`. (An angular theme 02 is planned.)

- **State** in `window.PROFILE` (`name`, `handle`, `bio`, `pic`, `favs` = 5 album
  names, `socials`). Pic currently borrows `images/playlist-statue-night.jpg`.
- **Favourite albums:** each `.prof-fav` disc in the rail → `openProfPicker(slot,
  btn)` opens a bottom-sheet album picker (`#prof-picker`); `profPick(name)`
  writes `PROFILE.favs[slot]` and `renderViewer()`s.
- **Social:** `.prof-social` tab → `toggleProfSocial` opens `.prof-soc-menu`;
  `openSocial(id)` deep-links to instagram/x/soundcloud + the stored handle.
- The card's action button (`.prof-act`, Edit on your own page) opens **Edit
  Profile** — see below.
- Being an `.s-home-v3`, `populateHomeData` runs on it (now-playing bar) — the
  bento-only calls no-op just like on wall/playlists.
- **Deploy note:** `images/profile-skin-01.png` is a new asset — `git add` it.

---

### The header's three bubbles (`.v3-bubble`)

Notifications · settings · search — the only always-present controls on the
shell. **34px with 17px glyphs**, up from 30/15: at the old size they were the
smallest tap targets in the app. ⚠️ Kept modest rather than pushed to the 44px
guideline floor — the header is a 60px strip and the brand block sits between
the two groups, so growing them much further crowds the wordmark. ⚠️
`.v3-bubble--notif.has-notif`'s `min-width` tracks this number: the expanded
pill can be narrower than the circle it grew from with a small count, and that
`min-width` is what stops it shrinking as it lights up.

---

## The nav console — where a CD tap goes (`openConsole` in `app.js`)

**Same principle on the floating bubble as on the docked bar it was built for.**
Tapping a CD does not raise a popup: the nav's **hump grows** (`.s-home-v3--console`
on the shell), the friends ticker gives way to the album you tapped — art, album,
year, artist on one line — and the room that opens up holds the four services.
It closes on the next thing you do (a scroll, a touch on the bento, the CD
again); `closeConsole` is idempotent. The profile's favourite discs open it too
(`profFavTap`), with the album taken from the SLOT.

- **Geometry lives in three variables on `.s-home-v3`, overridden by
  `.s-home-v3--console`:** `--nav-ar` (553/126 → 553/236), `--nav-items-top`
  (40% → 68%) and `--nav-mask` (short → tall contour). The nav's box, the
  glass mask and the items' band all read them.
- **Two contours, both in `bottomNav()`:** the short one and `.v3-nav-shape--tall`,
  which is the short one with every point below the hump pushed down **110
  units** (88 at first; raised so the panel comes out higher — it was already
  at the hump's ceiling, so the ceiling went up) and straight walls inserted at x=67 and x=485.5 — where the hump's
  fillets already end vertical, so nothing bends. A second `<svg>`, because
  viewBox cannot be set from CSS. ⚠️ Change one contour and change the other,
  plus the two masks in app.css.
- **`.v3-console` is a CHILD of the nav**, placed as % of the nav's box
  (`left/right: 15.5%`, `top: 5%`, `bottom: 46%`) so it stays in the hump at
  every frame size — the nav is aspect-ratio driven and a px offset from the
  screen bottom drifts the moment the viewer scales the phone. The row sits
  high in the hump on purpose; centred, the service marks drifted onto the
  shoulder.
- **What animates is `aspect-ratio`** on `.v3-bottom-nav` (a custom property
  can't transition, the property reading it can). The bar is anchored at
  `bottom: 24px`, so it grows upward out of its own hump. The mask and outline
  swap discretely; the ~260ms squash of the tall contour into the short box
  reads as the hump unfolding. The content fades and rises one beat behind.
- `.s-home-v3--console .v3-nowbar` is `visibility: hidden`, not `display` —
  `renderNowBar`'s swap timer keeps writing to it and needs a box to measure.
- ⚠️ **Not carried over from the docked version:** `.v3-nav-blur`, `.v3-nav-nest`
  and the growing `.v3-bottom-fade`. They existed for a full-bleed bar with a
  scoop cut out of it; the bubble is a self-contained pill with nothing to plug.
- ⚠️ History: this was briefly removed (same day) on a misreading of "get rid
  of that" — Eric meant the pet's scoop, not the console. The console is wanted.

## Profile — "Regular" theme card (`profCanvasHtml` in `screens.js`)

The other profile theme: a neumorphic card traced from **`ProfileTheme_Regular4
(1).svg`**, shared by the profile page and the Edit Profile screen (which shows
the same card live above its form — building it twice would let the preview
drift from the real thing).

### ⚠️⚠️ The `viewBox` height and the canvas `aspect-ratio` are ONE number

`.prof-base` is `viewBox="0 0 690 556"` and `.prof-canvas` is
`aspect-ratio: 690 / 556`. **Change one without the other and the card breaks in
a way that is very hard to read.** `preserveAspectRatio="xMidYMid meet"` scales
the drawing to fit the *shorter* axis, so a 556-tall viewBox inside a 460-tall
box renders the whole card at **82.7%** and centres it — while every
percentage-positioned element on top stays exactly where it was. Nothing looks
broken on its own; the card is simply wrong everywhere at once.

### The canvas is 690×556 — the card GREW a bottom compartment

⚠️ **It was 690×460 and the card floor was y=449.** The tag strip moved *into*
the card (see *Tags* below), so the silhouette was extended by **96 trace units**:
the floor is now **y=545** and the viewBox 556, keeping the same 11 units of air
under the card. Nothing above y=94.7 moved, which is why the banner and the
username pill are untouched in the path data.

- The **picture pane still stops at y=449.5.** The card grew underneath it; the
  photo did not. ⚠️ Its bottom-left arc went with the move — that was the
  *card's* corner, and the card's corner is 96 units lower now, so both the
  `.prof-divide` path and `.prof-pic`'s `border-radius` are square there.
- A second `.prof-divide` path draws `M374.5 449.5 L688.9 449.5`. Together with
  the pane's bottom edge that is **one hairline across the whole card**, which is
  what makes the strip read as a compartment rather than as empty card.

⚠️ **EVERY vertical percentage in app.css's `.prof-*` block was rescaled by
460/556 = 0.82734** so that what it points at stayed in the same physical place:
`.prof-name-pill` (2.93→2.43 / 10.33→8.54), `.prof-name-tab-lbl` (2.9→2.4 /
10.3→8.52), `.prof-pic` (16.5→13.65 / 81.2→67.18), `.prof-act` (0.2→0.17 /
11.7→9.68). `.prof-right` is the exception and did **not** simply rescale: its
`bottom` went 6% → **22.2%** because the pane has to stop at the compartment's
seam, and its `top` was left at **18%**, which against the taller box is now 100
trace units — the deliberate extra head-room the bio was asking for.

Every percentage in app.css's `.prof-*` block resolves against **690×556**:
horizontals are `x / 690`, verticals are `y / 556`. **A value copied from an
older revision lands in the wrong place without looking obviously wrong**, which
is the trap every time this changes — it has been 466, then 608, then 460, now
556. What the artwork revision itself changed:

| | old (690×466) | new (690×608) |
|---|---|---|
| card body | y 65.7→328 | y 74.7→**449** |
| picture pane | x 0→262.3 (37.9%) | x 0→**374.5 (54.3%)** |
| right pane | 61.8% of width | **45.6%** |
| name banner | to x 409.9, y→69 | to x **467.5**, y→**74.9** |
| CD row | in the card, 5 wells | **out of the card** — see below |
| action button | bottom-right notch | free-standing, lower right |

- ⚠️ **The stats became a 2×2 grid.** The picture took the width the old row of
  four needed: the right pane is ~153px at the 393px frame, and four columns at
  7.4px do not fit. The pane is tall enough to spend a second row.
- ⚠️ **The bottom-right notch is gone from the silhouette**, so nothing seats in
  it any more — the right edge runs straight from 429 up to 94.7. The action
  button is a free-standing pill resting inside the corner instead.
- ⚠️ **The right pane is ONE flex column (`.prof-right`), not three positioned
  boxes.** Stats / bio / location each carried a hand-computed `top`, and any
  restyle inside one of them silently pushed it into the next — giving the stats
  their inset wells grew that block by ~20px and dropped the bio on top of it. A
  column cannot overlap itself, and `.prof-meta` takes `margin-top: auto` so a
  short bio leaves the gap above the location rather than below it. Only the
  action button stays absolute: it is anchored to the card's corner, not to the
  end of this stack.
- ⚠️ `.prof-info` / `.prof-meta` need `position: relative` now — they are flow
  children, where before they were absolutely positioned from the SVG trace.

#### ⚠️ ONE action button, not two (`.prof-act`)

**Edit** on your own profile, **Follow** on someone else's — the same element,
with `PROFILE_GUEST` deciding what it says. They were separate elements once, so
*both* rendered on your own page; giving them a shared box then made the later
one in the DOM hide the other, and **the pencil vanished**. A page offers one
action here, so there is one element.

#### ⚠️ NO BACKTICKS in an HTML comment inside a template literal

A backtick in the *plain text* of a template literal **ends the template**. This
bit `shopHtml`: a comment reading ``see `.shop-model` in app.css`` parsed as
`"…see " . shop - model`, which threw *"model is not defined"* and took the whole
**Shop screen** down with it — while `node --check` passed, because the wreckage
is valid syntax. Every file here is one big template literal per screen, so the
rule is absolute: **quote a class or function name in a rendered comment with
quotes, or not at all.** Found and fixed 2026-08-31.

#### Top margins
`.prof2-scroll` opens with **14px** of top padding, not 6, and `.prof-canvas`
takes 4px of its own. The card is the first thing under the app header and at 6
it was tucked against it — this page opens on one large object and it has to look
placed rather than jammed. The bio's own head-room is `.prof-right`'s `top: 18%`
against the taller canvas; see the viewBox note above.

#### The right pane is the BIO; the stats are a row UNDER the card

⚠️ **They swapped.** The pane held **Following · Followers · Review score**
stacked down its right edge, and the bio was out of the card entirely. Now the
pane holds only `.prof-desc` (the bio, 11px, clamped to six lines) and the three
figures are a flat row below the card (`profStatsHtml` → `.prof-statbar`).

- **Why the figures left.** A number is a number wherever it sits, and inside the
  pane its size was capped by the pane's width — that is the whole reason they
  had to be stacked in the first place. Out in a full-width row all three read at
  once instead of being scanned down a column, which is how a follower count is
  actually read and how every other profile prints it.
- **Why the bio took the pane.** It is the only text on the page written to be
  *read* rather than scanned, and reading wants line length. A pane to itself is
  the one place on this screen that can give it.
- **Set at 12.5px / weight 600**, `--pf-ink` at 82%, clamped to five lines. At a
  caption's size and weight (11px / 400) it read as a footnote *about* the
  person instead of as the person. ⚠️ `.prof-right` carries the inset as
  `padding` plus a local `box-sizing: border-box` — this sheet has no global
  reset, so without it the padding grows the pane past the card's right edge
  instead of insetting the text.
- ⚠️ **The location is BACK, at the foot of the pane** (`.prof-meta`,
  `margin-top: auto`). Country or city and no finer: the line has ~116px, never
  wraps, and a street is not a thing a profile should print. `.prof-right` is
  `justify-content: flex-start`, not `center` — an auto margin eats the free
  space before `justify-content` ever sees it, so `center` there would be a rule
  that reads as if it does something and doesn't.
- ⚠️ **`.prof-statbar` is a SIBLING of `.prof-canvas`, never a child.** The
  canvas is a traced SVG whose every child is positioned in percentages of the
  trace; anything inside it has to be drawn to fit the artwork.
- The hairlines are `border-left` on the cells, so the row can never end on a
  stray divider. Numbers **23px** against 8.5px mono labels.
- ⚠️ **The dead in-card rules are GONE** — `.prof-stats` / `.prof-stat` /
  `.prof-stat-n` / `.prof-stat-l` in app.css, and `profCanvasHtml`'s `stat()`
  and `nf()` helpers. Don't resurrect them to put figures back in the pane; the
  bio is in there.
#### Tags — the compartment at the FOOT OF THE CARD (`SD_TAGS` · `profTags` · `profTagsHtml`)

⚠️ **These replaced `occupation`**, a free-text line saying what you do for
money. A tag says what you are *about*, it is **chosen from a set** rather than
typed, and — the point — it is **a thing you collect**. The plain ones
(`cat lover`, `metal head`, `no skips`) are free and everyone has them; the
specific ones are bought in the shop or handed out at something you actually
went to. `DaisyChainsFestival2026` is only worth wearing because not everyone
can.

- **`SD_TAGS` (screens.js) is the catalogue.** Anything with a `price` has to be
  earned; everything else is owned by definition. `note` is the storefront's
  sub-line and only collectibles carry one.
- ⚠️ **`tint` is an `"r,g,b"` TRIPLE, not a hex colour** — that is the shop's own
  convention (`.shop-field--tint`), and a tag has to be the same object on a
  profile and on a storefront row. One `tagChip(t)` builds the chip for the
  profile row, the edit form and the shop, so it cannot look like three things.
- **Free = outlined, collectible = filled with a ring** (`.prof-tag--rare`). The
  difference has to read at a glance or the collectible ones are worth nothing.

##### Textures (`tex:` on a tag → `.sd-tex--*` in app.css)
Every tag names a **surface**: brushed steel for `metal head`, daisies for
`DaisyChainsFestival2026`, grooves for `vinyl only`, halftone for `BlueNote85`.
A flat coloured pill does not read as something you *collected*, and at ~26px
the texture does more of that work than the label can.

- ⚠️ **CSS gradients, not image files.** A chip is ~26px tall, where a
  photographic texture is mush; the good free tiling sets (Transparent Textures,
  Subtle Patterns) are **CC-BY** and carry a real attribution obligation on a
  shipped app; and gradients cost zero requests and re-tint themselves from the
  tag's own `--tint`, because the fill underneath shows through.
- **FILLER by intent.** Swapping one for a real image is a single `--tex` value
  (`url(images/tex-metal.png)`) plus its `--tex-size`. Nothing else in the system
  knows the difference.
- ⚠️ **Every texture carries a white AND a black layer.** The chips sit on a dark
  card in one theme and a beige one in the other; a white-only overlay is
  invisible on light, a black-only one invisible on dark.
- ⚠️ **`background-color` and `background-image`, never the `background`
  shorthand.** The colour is the tag's tint and the image is its texture — the
  shorthand wipes whichever is set second. This is why `.pp-tag--on` and
  `.pp-tag--locked` set `background-color` specifically.
- ⚠️ **The classes only declare the `--tex*` variables; the consumer paints
  them.** That is what lets one class serve `.prof-tag` (profile, form, shop)
  *and* the picker's `.pp-tag`. `sdTagTex(t)` is the single helper that stamps
  it, so a tag cannot be brushed steel on your profile and flat grey in the
  sheet you picked it from.
- `.prof-tag--rare` and `.pp-tag--on` add a 1px **light** text halo: the label
  now rides on the texture, and the fill is a saturated tint under near-black
  ink.
- ⚠️ **`profTags(P)` falls back to a seeded pair when `P.tags` is unset.** Every
  profile the mockup deals — personas, a random visitor, a friend's page —
  arrives without the field, and a row empty on every page but your own reads as
  broken rather than unused. Seeded off the handle through `profMix(dzSeed(…))`,
  same as `profFavReview`; ⚠️ the mix step is not optional (see `profReviewLog`).
- `SD_TAG_MAX` = **3** worn at once. ⚠️ **`profTagsHtml` renders INSIDE
  `.prof-canvas`**, in the 96-unit compartment the card grew for it — a strip
  floating *under* the card read as a caption about it rather than as part of
  who you are. Being in the canvas means being positioned in percentages of the
  trace: `.prof-canvas .prof-tags` is the compartment (y 449.5→545), inset, over
  556.
- ⚠️ **The strip SCROLLS sideways; it does not wrap.** The compartment is one row
  tall by construction, and three long collectibles wrapping to a second line
  inside a fixed-aspect box would fall straight out of the card.
- ⚠️ **Collectibles LEAD** (`profTags` sorts priced-first, stably). An event tag
  is the one thing in the row nobody else can say; third behind two "cat lover"s
  it may as well not be there.
- ⚠️ **Roughly one profile in three wears an event** — the seeded fallback rolls
  `profMix(dzSeed(seed,'ev')) % 3`. Not everyone, because a tag everyone has is
  the opposite of a collectible; not nobody, because a feature you never see in
  the mockup isn't in the mockup. The signed-in `PROFILE` carries an explicit
  `tags: ['daisychains2026', …]` so the default view always shows one.
- ⚠️ **`initTags()` (app.js, called from `init()` beside `initPlan`) seeds
  `SD_TAG_OWNED` from what the signed-in profile is WEARING.** You cannot own
  less than you have on — without it the shop would offer to sell you a tag
  that is visible on your own page.
- ⚠️ **Ownership (`SD_TAG_OWNED`, app.js) lasts ONE SESSION and is not
  persisted.** The storefront's own note says nothing is charged and nothing is
  kept; a prototype that quietly remembers purchases across reloads is lying
  about that. Free tags are not listed in it — they have no `price`, so
  `sdOwnsTag` returns true without asking.

#### ⚠️ The action button is UPPER RIGHT

It sat in the card's lower-right corner and moved. Down there it was *inside* the
card, level with the stats, and read as part of that block rather than as the
page's one action; up here it is on the strip above the card, opposite the name
banner — where the trace puts a pill (x 600→688, y 1→55) and where a profile's
follow control is expected.

- ⚠️ **Wider than the traced pill on purpose.** 12.75% is ~46px at the 393 frame
  and the dots plus "FOLLOW" want ~58. 17% gives ~61px and still starts at 81.5%,
  clear of the name banner, which ends at 67.8% (measured clearance: 43.7px).

#### Favourite albums — an endless wheel (`profFavsHtml` · `profFavPaint`)

Five small wells traced into the bottom of the card became **three big discs on
an arc, one centred and two swung down either side**, on a rail that loops with
no end in either direction, with a panel underneath. At the old size **the cover
was all you got** — no title, no artist, no year — and a cover is not enough to
know an album by. The panel says album, artist, stars, review count, and the
line they wrote about it.

- ⚠️ **The discs are 46% of the rail, not 62%.** Three big circles in a row left
  no room to read the arc they sit on, and the curve is the point. `profFavArc`
  needs no change for it — it measures `spacing` off the DOM and derives the hub
  from that, so the drop scales with the disc on its own. ⚠️ The one number that
  does **not** follow automatically is `.prof-fav-rail`'s `padding-bottom`,
  which came down 16% → **13%** with it (the drop is ~40px at 46% against ~53px
  at 62%), and `.prof-fav-info`'s negative margin followed to **-20px**. Those
  three are one measurement: change the width, measure the drop, move both.
- ⚠️ **CSS scroll-snap, not a hand-rolled gesture.** This has to feel native
  under a thumb, and the browser's own momentum, rubber-band and snap beat
  anything written here. The swipe engines elsewhere in this app exist because
  they animate a bento cell; this does not.
- ⚠️⚠️ **The rail must never get horizontal padding.** It was `padding-inline:
  19%` once and **nothing lined up**: percentage `flex-basis` resolves against
  the flex container's **content box**, so side padding of 19% made each disc
  62% of the *remaining* 62% — 38.4% of the rail — while the centring arithmetic
  is written in percentages *of the rail*. Padding silently redefines what a
  percentage means in here.
- **The end spacers (`.prof-fav-pad`) are gone**, along with the ends. They
  existed so the first and last disc could reach the centre; a looping rail has
  neither, and a spacer sitting at a seam would open a hole in the wheel.
- ⚠️ **`.prof-fav-rail` must stay `position: relative`.** That makes it each
  button's `offsetParent`, which is what puts `offsetLeft` in the same
  coordinate space as `scrollLeft` for `profFavPaint`.
- ⚠️ **The menus live AFTER the rail, not beside their disc.** The rail is
  `overflow-x: auto` and would clip a popup. `toggleProfCd` and `profCdPreview`
  therefore find them by `data-slot` rather than by `nextElementSibling` /
  `previousElementSibling` — both lookups were adjacency-based and both broke.
- ⚠️ **A tap on a disc that isn't centred scrolls it to the middle** instead of
  acting on it (`profFavTap`). Opening a menu for an album that is half off the
  screen is the only other option, and it isn't one.
- ⚠️ **The rail opens on the second disc OF THE MIDDLE COPY** (`profFavStart` →
  `profFavHome`). There has to be runway on both sides from the first frame, or
  the first flick left runs straight off the end before the loop can wrap.

##### It LOOPS — there is no end to reach (`profFavLoop` · `profFavSettle`)

`profFavsHtml` emits the five discs **`PROF_FAV_LOOPS` = 5 times over** (25
buttons, `data-n="5"` on the rail), and the scroll is teleported back to the
middle copy by **exactly one set width**. The jump cannot be seen: either side
of a seam is the same five records in the same order, so the pixels are
identical and the disc under your thumb does not move.

- ⚠️⚠️ **The wrap runs when the scroll SETTLES, not the moment you leave the
  middle copy.** Writing `scrollLeft` during a fling **cancels the momentum** in
  Chrome — wrapping eagerly would stop the rail dead in your hand every few
  discs. `profFavSettle` uses `scrollend` where it exists and a 180ms timer
  where it doesn't (the timer also covers a fling that decays without an event).
- ⚠️ **The emergency wrap in `profFavPaint` is a backstop, not the mechanism.**
  If the centred disc has reached the *outermost* copy it jumps immediately — a
  stalled fling beats running out of rail. With five copies it should never fire.
- ⚠️ **Five copies, and the number is set by fling distance.** From the middle
  copy that is ten discs of runway each way, ~2500px. Three copies leaves five,
  and a hard flick would hit the emergency wrap and stop dead. Verified by
  walking 14 discs in each direction: never ran out, wrapped three times going
  forward.
- ⚠️ **`scroll-snap-type` does not fight it** — the jump is a whole number of
  disc pitches, so it lands on an equivalent snap position with nothing to
  correct.
- ⚠️ **`data-i` is the real slot** and repeats across copies (`0123401234…`), so
  `profFavTap` and the edit-mode picker address the right one of five whichever
  copy you tapped.
- ⚠️ **`profFavBoot` retries instead of assuming one frame is enough.** Both
  steps need a laid-out rail, and `profFavStart` sets its once-only flag when it
  runs — so an attempt against a zero-width rail must NOT count as having run,
  or the next paint (triggered by the user's own scroll) yanks the rail back to
  disc 2 under their finger.
- The info panel carries **album + year on one line**, then artist — **and
  nothing else** (2026-09-11: the stars, the review count and the line they
  wrote came out; `profFavReview` went with them). ⚠️ Genre was dropped
  earlier: it said little at this size, and the archive's genre strings are
  inconsistent enough ("Hip-hop" / "Experimental hip-hop" / "Korean hip-hop")
  that it read as noise.

#### Pinned reviews (`profPins` · `profPinsHtml` · picker kind `review`)

Directly under the favourites rail: up to `PROF_PIN_MAX` (3) of their own
reviews, rendered as the **album page's review card** (`revCardHtml`, app.js —
a pin is the review as writing, not an event; the history below keeps the
feed row via `profReviewRowHtml`). Same `prof::handle::album` key as the
history row so a like is shared, and each pin is registered in `REV_INDEX` so
a tap opens the review page (which honours a passed `handle` — a persona's
name is not its handle). `.prof-pins .v3-rev-*` re-points the card's
hard-coded warm ink at the profile's `--pf-*` tokens for the cream light mode.
- `P.pins` is a list of album names in slot order (`''` = empty slot),
  resolved against `profReviewLog`. **A persona with no `pins` shows its two
  most recent reviews** so a random profile is never blank; clearing them all
  is a real state and shows the `.prof-pins-empty` hint.
- **Edit Profile** has a matching "Pinned reviews" row of three tiles (the
  `.prof-pl` tile: cover, album, "4.5 · what you wrote") under the favourite
  discs. A tile opens `openProfEditor('review', slot)` — the same popup, kind
  `review`, listing `profReviewLog(T)`; `profPickReview` sets the slot,
  **clears it if you pick what is already there**, and moves a review pinned in
  another slot rather than duplicating it. The draft seeds `pins` through
  `profPins` (like tags) and `pfeditSave` whitelists it.

##### The discs sit on a WHEEL, not a line (`profFavArc`)

The hub is a long way **below** the screen, so a disc leaving the centre swings
**down and away** instead of sliding flat — the side discs end up lower than the
middle one and tilted by however far round they have gone.

- **The radius is derived, not chosen.** `PROF_ARC_DEG` (**24°**) says how far
  a disc has turned by the time it reaches its *neighbour's* slot; `R = spacing
  / θ` falls out of that, re-measured every paint. There is no magic px to go
  stale when the frame width changes.
- ⚠️ **It was 12° and that was too polite** — arithmetically real, visually
  deniable. Halving the radius doubles the tilt but **near-quadruples the drop**
  (26px → 52px), because the fall goes with `1−cos θ`, not with `θ`. That second
  number is the one with a cost, and it is why the padding below moved with it.
- ⚠️ **X is left alone.** A true wheel would also pull the discs horizontally
  in (`x = R·sinθ`, not `R·θ`), but x belongs to scroll-snap, and fighting the
  scroller for it is how a carousel starts feeling slippery under a thumb. At
  12° the two differ by well under a pixel.
- ⚠️ **`u` is clamped to one neighbour.** Past that the drop grows fast and it
  buys nothing: a disc two slots out is entirely outside the rail (near edge at
  383px in a 192px half-width). The clamp is also what bounds the rail's bottom
  padding.
- ⚠️⚠️ **`.prof-fav-rail`'s `padding-bottom: 16%` is the room the arc falls
  into, not spacing.** The rail is `overflow-y: hidden` — it has to be, because
  `overflow-x: auto` forces the other axis to clip — so a dropped disc is cut
  off at the padding edge. It is a **percentage of width** because the drop is:
  `R(1−cos θ)` as a share of the disc spacing, and the spacing is 65% of the
  rail, so the two scale together. **It is PAIRED with `PROF_ARC_DEG` — move
  one, measure, move the other.** Going 12°→24° at the old 8% clipped the bottom
  off both side discs. Measured clearance at 24°/16%: 5.3px.
- ⚠️ **`.prof-fav-info` carries a `-30px` margin, and the arc is why.** That
  ~58px of rail padding is only *used* at the two edges where the side discs
  fall into it; under the middle it is a hole, and it left the album title
  floating a long way from the record it names. The text is centred and the side
  discs are slivers at the extreme left and right, so the two share the band
  without meeting — and the panel is after the rail in the DOM, so it wins the
  overlap on a very long title anyway.
- ⚠️ **`.prof-fav-rail.is-arc .prof-fav { transition: none }`.** The transform
  is written inline every scroll frame; .28s of easing on a value recomputed
  from `scrollLeft` 60×/sec is just smear. The discrete `.prof-fav` /
  `.is-mid` pair stays as the no-JS base, which is why this is a class the arc
  *adds* rather than a blanket `transition: none`.

##### Their own review, under the album (`.prof-fav-rv` · `profFavReview`)

If they wrote something about the centred record, it sits under the stars in the
app's **review voice** — Crimson Text italic, the same face as the composer and
`.ntf-quote` — so a line of someone's writing looks like writing rather than
like one more field of the record's metadata. It is the only thing in that panel
that is theirs and not the album's.

- ⚠️ **Read from `profReviewLog(P)`, the same log the review history below is
  built from.** One source of truth, so the line under the disc and the row
  further down the page can never quote the same person differently.
- ⚠️ **Cached per handle on the section** (`sec._rvKey` / `_rvMap`) — the log
  walks the archive to build itself and this runs on every scroll frame.
- ⚠️ **The line `hidden`s, it does not empty.** An empty box still holds its
  line-height. Paired with `.prof-fav-info`'s `min-height: 96px` (a panel *with*
  a two-line review in it), the block does not grow and shrink as you scroll
  between a record they wrote about and one they didn't. Verified: 84px across
  all five discs.
- **Two lines then ellipsis.** The full text is in the review history; under a
  disc this is a taste, and an unclamped paragraph would shove the rail and the
  next section around as you scroll.
- ⚠️ **`.prof-fav-hole` is 13%, where the small wells were 21%.** A spindle hole
  is a fixed size on a real record — it does not grow with the disc — so a
  percentage that read correctly at 60px is a doughnut at 200px.
- `profFavSync` is **rAF-throttled**: `scroll` fires faster than paint and the
  paint measures every item. The first paint is deferred a frame from
  `applyProfColors`, because a fresh render has no `clientWidth` yet.
- The panel's markup carries **no album**, so it cannot go stale against the
  rail's scroll position — `profFavPaint` is the only writer.
- ⚠️ **The edit screen renders the rail too.** The favourites left the card, so
  without it there is no way to change them any more.

### Pins + review history are THE HOME FEED'S CARD (Eric, 2026-09-18)

`profReviewCardHtml(P, e)` (screens.js) renders both — `revCardHtml` with
`v3-rev-card--feed v3-rev-card--prof`, `timeRight`/`actsTop` and the record
line — so the profile reads like home. `.prof-pins, .prof-feed` re-point the
`--sd-*` tokens the feed card inks itself with at the profile's `--pf-*` set
(one rule, both themes and skins), and pull the divider's full-width bleed
back to the card. `applyProfColors` runs `tintFeedRecords` + `markLongReviews`
on the profile after render, as the feed does. The cover on a card with no
`feed` index opens the album via `revCardArt` (REV_INDEX). The `.ntf-row`
notes below describe the row this replaced; `profReviewRowHtml` survives only
as the fallback if app.js is missing.

### Review history — the last section (`profReviewLog` in `screens.js`)

Replaces the old **"Recently rated"** strip, which was four covers with four
hardcoded star values and four hardcoded ages. A history has to carry what the
person actually **said** — that is the difference between a list of albums they
touched and a record of their taste, which is what a profile is for.

⚠️ **The rows ARE the home feed's `.ntf-row`, and there is no `.prof-rv-*`
component any more.** Same anatomy (avatar + badge · sentence · quote ·
engagement · trailing thumb), same SUBJECT · VERB · OBJECT order, the same
`upvoteHtml` pill and comment button — because a review is a review, and a
profile that renders one its own way is a second component that will drift from
the first. The only thing that changes is the subject: every row here has the
same author, so the avatar is theirs and the name is the profile's.

- ⚠️ **The pool is `recent` → `favs` (seeded coin flip) → topped up from the
  archive.** The favourites were added because you are far more likely to have
  written about the five records you pinned to your own profile than a random
  one off the shelf — and because the favourites rail reads this same log for
  the line under each disc. Without them the panel had almost nothing to show:
  measured across the five personas it was **1, 2, 0, 1, 1** of five, so one
  persona could never demonstrate the feature at all. It is now 4, 2, 3, 2, 4.
  ⚠️ **A coin flip, not all five** — "no review yet" has to stay a state you
  actually meet while scrolling, or the conditional under the disc is a branch
  that never runs.
- `--sd-*` reaches these rows because the profile screen is itself an
  `.s-home-v3`, which is where those tokens are scoped.
- `upvoteHtml` (a window global) and `CMT_SVG` (a top-level `const`, so global
  *lexical* scope rather than a window property) both live in `app.js`, which
  loads after `screens.js` — fine, because this runs at render time.
- Each entry carries seeded `likes` (0–239) and `comments` (0–8). ⚠️ The floor
  is **0** and the curve is skewed low on purpose: a feed where every row has
  hundreds of likes reads as fake.
- The only thing the profile adds is a bigger tap target, `.v3-up--prof` —
  12.5px type and 17px glyphs against the feed's 11.5/14.5. On home these pills
  sit in a scrolling feed of many verbs; here they are the point of the page.

- ⚠️ **DERIVED, not stored on `PROFILE`.** That object is written from three
  places — the literal in `app.js`, `randomizeProfile` for a random or seeded
  visitor, and a persona — so a field added to one of them is missing from the
  other two. Seeded off the handle instead, which gives the same guarantee
  `randomizeProfile`'s seeded stream gives a friend's page: open a profile twice
  and it says the same things.
- `dzSeed` lives in `app.js`, which loads **after** `screens.js` — fine, because
  this runs at render time, not while the file parses.
- Their own `P.recent` picks come first, then the list tops up from the archive
  to nine, skipping duplicates. Ages are strictly increasing, so it reads
  newest-first without needing real dates.

#### ⚠️ `dzSeed(...) % smallN` is BROKEN, and this is where it showed

`dzSeed` is a rolling hash, `h = h*131 + c`. **131² ≡ 1 (mod 20)** and ≡ 1
(mod 8), so `dzSeed(seed, 'x', i) % 20` collapses to `(C(seed) + i) % 20` —
**linear in the index**. Every profile drew the same review lines in the same
cyclic order, merely rotated by a per-name offset:

```
ericd          17 18 19 0 1 2
moonlit_echo   18 19  0 1 2 3
```

`profMix()` is an avalanche step applied **before** the remainder, and it fixes
it (verified: one profile's sequence is no longer any rotation of another's).
⚠️ **Anywhere else that wants `dzSeed(...) % smallN` needs the same treatment** —
the hash is fine for large moduli and for equality, not for a short pool.

### The name banner grows with the username (`sizeProfName` · `profNameTabPath`)

The banner is a **parametric path**: `profNameTabPath(dx)` slides every point on
its right half out by `dx`, leaving the left edge, the corner radius and the
slant's shape alone, so the tab stretches without deforming. `sizeProfName`
measures the rendered label, converts px → SVG units, and moves the tab path and
the white pill's width by the **same** `dx` so they grow as one shape.

- ⚠️ **Four numbers move together on a retrace** and all four came out of the
  new file: the banner's slant anchor (295.443 → **339.995**), the pill's left
  edge (16.04 → **16**) and its right cap (314.351 → **360**), plus the clamp.
  The pill sits 20 units inside the anchor here exactly as it sat 18.9 inside the
  old one — if that relationship breaks, the pill and the banner drift apart as
  the name gets longer.
- The clamp is **200**: the banner's right edge is 467.5 and `467.5 + 200` is
  still inside the 690 box.

---

## Edit Profile (`profileEditHtml` + `PFEDIT` in `app.js`)

The customising page behind the profile card's action button (`.prof-act`).
`openProfileEdit()` seeds the draft, pushes the back stack and navigates to
`profile-edit`.

**It is a form** — an Instagram-style one: your picture at the top, then one
labelled row per field, typed into directly.

```
back pill · "Editing profile" · Save changes
        ( photo )  ·  Change photo
Name        [ ................. ]
Username  @ [ ................. ]
Bio         [ ................. ]  n/240
Location    [ ................. ]
Occupation  [ ................. ]
Favourite albums   ○ ○ ○ ○ ○
Playlists          [tile][tile][tile]
Favourite songs    [row] …
```

⚠ **It used to be the profile card itself.** Every editable region of the traced
SVG carried a `.pfe-slot` class, a gold "+" badge and an `openProfEditor()`
handler, and there was deliberately no form at all. That was replaced because:

- filling in your details meant hunting for the card region that owned each
  field, and the hit targets were whatever the SVG trace happened to leave;
- the popup it opened for text **hid the field you were filling** behind a sheet;
- **bio and location had no entry point at all** once the card dropped
  `.prof-info` / `.prof-meta` — the fields existed, saved fine, and were
  unreachable.

The things that are *chosen* rather than typed stay slots, because a list is the
right control for them: the photo, the five favourite albums, the three
playlists, the five favourite songs. They all still open the same popup.

Every one of those slots is marked with a **gold "+"**, sized as a target rather
than a glyph (24px badge, 28-30px on the empty tiles, a 132px avatar with a 36px
badge). ⚠ **A song row is the exception: it carries ONE "+", on the right, where
the play triangle used to be** (`.pfe-song-plus`) — nothing plays on this page,
and the row previously had both a play glyph *and* a badge on its artwork, which
is two plus signs arguing about which one you press. `.prof-song.pfe-slot::before`
is explicitly `content: none` for that reason.

The top bar is a `1fr auto 1fr` grid, not `space-between`: the title has to sit
on the page's centre line, and space-between centres it between two buttons of
different widths, which is a visibly different place. Save changes is sized off
`.plp-back-pill` (34px tall) so the two ends of the bar match.

### The text fields (`pfeditField` in app.js)
⚠ **A keystroke writes the draft and re-renders NOTHING.** Rebuilding the screen
mid-word drops the caret. A *pick* from the popup does still re-render, and that
stays safe because the inputs are rebuilt **from the draft**, which already holds
every keystroke typed so far — the two halves of the page disagree about
re-rendering on purpose.

⚠ **The viewer draws Dark and Light side by side, so every field exists twice.**
`pfeditField` mirrors the keystroke into the twin through `data-k`; without that
the shell you aren't typing in sits on a stale value until something else
re-renders, and switching variant then looks like the edit was lost. The `id`s
carry a `-d` / `-l` suffix for the same reason (a `<label for>` has to point at
one input, not two).

The handle input strips anything that isn't `A-Za-z0-9._` as you type — a handle
is printed straight onto the profile card's pill.

### The skin — the card's colour and the page behind it (`profSkinCss`)
Two colour rows on the form (`skinRow`), and each is **two controls: an RGB
picker and a lightness slider**. Separate on purpose — "what colour" and "how
dark" are different decisions, and one combined picker throws the depth away
every time you move the hue. The slider mixes the picked colour toward black or
white (`sdMix`), so the hue survives both ends of it.

- ⚠️ **Only two values are PICKED — `--pf-base` (the card) and `--sd-bg` (the
  page). Everything else is DERIVED.** A colour system where the user sets ten
  tokens by hand is one where nine end up unreadable. Ink is chosen by luminance
  against whatever the surface turned out to be (`sdInk`, flipping around 0.56),
  which is what lets you pick a near-white card in dark mode and still read your
  own bio.
- ⚠️ **`--pf-lt` / `--pf-dk` are deliberately NOT derived.** They are rgba white
  and black, so they already work over any base — the card keeps its embossed
  edge whatever colour it becomes.
- ⚠️ **The username pill follows the PAGE, not the card** (`--pf-slot` = the
  background). That is what seats it in the banner; ink included.
- ⚠️ **`.s-home-v3`'s `background` became `var(--sd-bg, #111116)`.** `--sd-bg`
  was already declared on that selector and already held exactly that colour in
  both themes, so this unified two numbers that could never legally disagree.
  The skin is written **inline on `.s-prof2` / `.s-pfedit` only**, so no other
  screen moves.
- ⚠️ **`profSkinSet` patches the variables by hand and does NOT re-render.** A
  colour input dragged through its gradient fires `input` every frame; a
  re-render per frame would stutter *and* hand the user a fresh element mid-drag.
  Same rule as `pfeditField` and `profTagSync`. **Reset is a click, not a drag**,
  so `profSkinClear` may re-render.
- ⚠️ **`profSkinApply` writes to `.s-prof2`, not `.s-pfedit`.** The viewer can
  have the profile and the edit page on stage at once (multi view, both variants
  of each), and a skin that only reached the form left the card you were
  colouring sitting in the old colour while you dragged.
- ⚠️ **`profSkinApply` uses `setAttribute('style', …)`, not per-property
  writes.** Clearing half the skin has to *remove* the variables it set, and
  assigning `style.foo = ''` one at a time leaves whatever the new string no
  longer mentions. The screen carries no other inline style, which is what makes
  that safe.
- ⚠️⚠️ **THE PREVIEW IS DRIVEN BY NOTHING.** `.pfe-prev` paints itself from
  `var(--sd-bg)` and `var(--pf-base)` — the same variables `profSkinCss` has
  already written inline on that very screen — so it follows the sliders with no
  JS behind it and *cannot* disagree with the card it previews. An earlier pass
  had a per-row swatch that JS repainted by hand; it was more code and one more
  thing to leave stale. If you find yourself writing a `skinSwatch()` again,
  this is the note saying don't.
- The preview shows the **derived** tokens too — the inner pane is `--pf-face`,
  the text ticks are `--pf-ink` — so a colour that makes your own bio unreadable
  says so on the form rather than on your profile.
- The background you are picking **is the page you are standing on**, so it also
  changes under your thumb for real.
- `skin` is copied (not referenced) into `PROFILE` on Save, and `null` when
  cleared — which is what puts the theme's own colours back.

### Tags, where Occupation was (`openProfEditor('tag')`)
The Occupation row is gone; in its place is a **Tags** row that is a button, not
a field — you wear what you own. It opens the picker's `tag` kind: a wrapping
list of chips rather than the square grid the album/photo kinds use, because a
tag is a word of a length it chose and equal cells would truncate exactly the
collectible ones worth showing.

- ⚠️ **The tag sheet is MULTI-SELECT and does NOT close on a pick** — you are
  assembling a set of three, not answering one question. It therefore repaints
  itself *and* the row behind it by hand (`profTagGrid` + `profTagSync`) instead
  of going through `profAfterPick`, which calls `renderViewer()` and would tear
  the open sheet out of the DOM mid-selection. Same move `pfeditField` makes for
  the bio counter.
- ⚠️ **A locked tag is a link to the shop, not a disabled control.** A tag you
  can't wear yet *is* the advertisement for the ones for sale; greying it out
  would say "not for you" where the truth is "not yet".
- ⚠️ **`pfeditDraft` seeds `tags` THROUGH `profTags`**, not by copying `P.tags`.
  A profile with no tags still *shows* two, so a form that opened blank would
  look like the edit page had lost them.
- ⚠️ `occupation` left `pfeditSave`'s whitelist with the row. The personas still
  carry the field and nothing displays it.

### Favourite songs is Pro (`isPro()`)
The five song slots are replaced by a gold **"Get Pro" row** (`.pfe-pro` →
`navigate('shop')`) on a Free account. ⚠️ It is styled gold-edged rather than
dashed on purpose: a dashed box everywhere else on this page means "empty, tap
to fill", and this is the one block tapping does NOT fill. The profile itself
**hides** the section instead of locking it — see *Plan — Free vs Pro*.

### The content editor (`openProfEditor(kind, slot)`)
One bottom sheet, reskinned by the **kind** it's opened with — that's what makes
"search depending on the category" work. Every kind is now a **choice from a
list**, which is what a sheet is actually good at:

| kind | opened from | popup |
|------|-------------|-------|
| `album` | the five discs | searches `ARCHIVE` |
| `song` | Favourite songs rows | searches `plnewPool()` (every archive track) |
| `playlist` | Playlists tiles | searches `plLists()` |
| `photo` | the avatar / "Change photo" | grid of `PROFILE_PHOTOS` + a real upload tile |

⚠ The `name` and `text` kinds (and `PFE_TEXT`, `profTextDone`, and the
`.pp-form` / `.pp-text` / `.pp-done` CSS) **were removed** — the form types those
inline now, and keeping the sheet would have been a second, worse way to do the
same thing.

`openProfPicker(slot)` is kept as a thin wrapper (`→ openProfEditor('album')`)
because the *non-edit* profile's **empty** favourite discs still fill themselves
through `profFavTap(..., 1)`.

### State
`PFEDIT` is a **draft** copied from `PROFILE` on open, so **Cancel genuinely
discards** and Save is the only thing that commits. Every edit — typed or picked
— writes through `profFavTarget()` / `pfeditDraft()`: the draft when the edit
page is open, `PROFILE` otherwise. `pfeditDraft()` seeds it lazily so the screen
also works opened straight from the viewer's left rail.

### Three traps
⚠ **`pfeditSave` must NOT call `goBack()`.** `captureScreenSnap()` stores
`{...window.PROFILE}` for the `profile` screen and `goBack` does
`Object.assign(window.PROFILE, snap.profile)` — going back after a save would
restore the pre-edit copy and **silently revert it**. Save drops that snapshot
(`backStack.pop()`) and calls `navigate('profile', 'back')`; the `back` direction
is also what stops `navigate` re-rolling the random persona (`randomizeProfile`).
Cancel *does* use `goBack`, where restoring the snapshot is exactly right.

⚠ **`pfeditSave`'s `Object.assign` is a whitelist** — a field the page edits but
the list omits is silently dropped on save even though the UI looked like it
worked. It currently covers name/handle/bio/location/occupation/pic/favs/socials
**plus `favSongs`, `playlistNames`, `playlistCovers`**. Add to it when you add a
field.

⚠ **Don't make `pfeditField` re-render** — see above. If a field ever needs the
rest of the page to react to it, patch that one element by hand the way the bio
counter does.

### Shared card
**`profCanvasHtml(P)`** (screens.js) is the profile CARD. It takes the record to
draw and does nothing else — ⚠ its `opts.edit` mode is **gone** along with
`profFavsHtml`'s, since the edit page no longer draws the card. Nothing in there
should learn to edit itself a second time.

**Not editable here:** the stats (generated persona data), the review history
(that's activity, not customisation), and socials (`PROFILE.socials` is carried
through Save but nothing on the page writes it). **Not built:** a theme picker;
"theme 02 (angular)" doesn't exist yet and a control for it would just be another
dead affordance.

## Notifications (`notificationsHtml` + `ntfItems` in `screens.js`)

The activity inbox behind the header's **bell** bubble. Standard `.s-home-v3`
shell (`appHeader` · `v3-body` · `nowBar` · `bottomNav('home')`), back pill →
Home. Shares its scoped colour tokens with Settings (see below).

- **Data** — `ntfItems()` is a hand-authored array, not generated: the copy
  carries the app's voice and each row names a real `ARCHIVE` album so the art
  resolves. `ntfPeople()` maps each community handle (the same accounts that
  author the sample playlists in `plLists`) to ONE `rp-*` photo, so a person
  looks like themselves everywhere they appear.
- **Row anatomy** — avatar + kind badge · copy · time · trailing slot. The
  trailing slot is an album thumb, or a **Follow** button on a follow row
  (`ntfFollowBack`). **System rows** (`release` / `milestone`) have no person,
  so the album cover becomes the avatar — and they get *no* trailing thumb,
  which would just be the same cover twice (`isSys` guards both).
- ⚠️ **A row is a sentence, and its shapes are its grammar.** Round avatar =
  the **subject**, and it is a **person**; rounded-square = a **record**. Read
  left to right: round subject · verb in the copy · square object. The two
  apparent exceptions both obey it — a follow row's trailing art is the
  **artist's photo**, so it goes round (`.ntf-art--round`), and a milestone has
  no person, so the cover stands in as the subject and stays square
  (`.ntf-ava--art`). ⚠️ `.ntf-badge` moved from `-5px` to `-2px` with the
  circle: a corner offset tuned for a square leaves the badge floating off a
  round avatar.
- ⚠️ **Copy is SUBJECT · VERB · OBJECT everywhere**, in the inbox and in the
  home feed, so the screens read as sentences instead of as a log. Keep new
  verbs in that shape — an object-first line says the same thing and destroys
  the scan. `milestone` was the one row that broke it (it rendered "Your review
  of" unstyled and let the album take the emphasis, so it read object-first);
  it now carries an explicit **`subj`** + optional **`link`** + object + `tail`.
  The object (album / playlist) is still optional — a follow row has none, so
  `line()` must not interpolate it blindly. Album names render regular weight,
  people/artists bold, per the app-wide convention.
- **The home feed names the object in full — "*album* by **artist**"**
  (`rec(e)` in `renderFriendFeed`), album first and in the two weights
  `.ntf-text i` / `.ntf-text b` already carry. ⚠️ Guarded twice: a row can
  arrive with no artist ("by undefined"), and a self-titled record would
  otherwise read "Weezer by Weezer" — which nobody says out loud either.
  ⚠️ **Playlist rows are exempt**: they already name two things (the record and
  the playlist) and a third proper noun makes the line unreadable.
- **No page title and no filter pills** — both were removed; the rows start
  straight under the top row (back pill · unread chip · Mark all read), which is
  what the screen looked best as. `ntfTab` (the pill handler) and the rows'
  `data-tab` attributes survive unused, so a `.ntf-bar` of `.wall2-cat` pills
  brings filtering straight back.
- **Unread** — `.ntf-row--new` fills the row and draws an accent **left rail**
  (`::after`). It is deliberately not a top-right dot: the right edge is
  occupied by the trailing thumb / Follow button. `ntfMarkAll` strips the class,
  removes the `.ntf-count` chip (now in the top row, beside its own button) and
  disables the button.
- Group headers are `position: sticky` against `.v3-body` (the scroller) and
  need the opaque `--sd-bg` fill so rows don't ghost through them.

## Settings (`settingsHtml` in `screens.js`)

Behind the header's **gear** bubble; back pill → Profile. A grouped list built
from small local helpers inside `settingsHtml`: `setRow(label, sub, control,
onclick)` · `section(title, rows)` · `service(...)`, with four control types —
switch (`sdToggle`), segmented picker (`sdSeg`), status pill (`sdConnect`), and
a chevron link. Sections: Appearance · Connected services · Playback ·
Notifications · Privacy · About.

- The account card up top reads `window.PROFILE` (so it follows the random
  persona) and taps through to Edit Profile. **Sign out** (`navigate('auth')`)
  sits directly beneath it — account actions together at the top, not buried
  under six sections of preferences — so the card's `margin-bottom` is tight
  (9px) and `.set-signout` carries the 20px gap down to Appearance.
- **Show listening activity** heads the *Connected services* card rather than
  living in Privacy: it governs what those services broadcast, so it reads as
  the master switch above them.
- The Theme segment's initial active option follows the variant being rendered
  (Dark variant → "Dark"), so the two mockups don't contradict their own chrome.
  It's presentational — it does not re-theme the screen.
- On a service row the **pill alone** carries connect state; the sub-label stays
  the description of what the service gives you either way.

### Shared tokens
`.s-home-v3, .s-ntf, .s-set` define `--sd-bg / --sd-ink / --sd-ink2 / --sd-ink3
/ --sd-card / --sd-card-hi / --sd-line / --sd-well / --sd-hover`, and
`.s-home-v3--light, .s-ntf.s-home-v3--light, .s-set.s-home-v3--light` redefine
just those nine. That's the `--pf-*` pattern from the profile screens — **light
theme is one variable block, not a parallel rule tree.** Prefer it for new
screens.

Scoped to the whole `.s-home-v3` shell rather than just these two screens
because **the home activity feed reuses the `.ntf-*` row** (see *Scroll Area*).
`.s-ntf` / `.s-set` are themselves `.s-home-v3`, so they survive in the selector
lists only to carry the more specific light block. `--sd-bg` is already exactly
the home shell's own background in both themes, which is what lets the badge's
punch-through ring read as a clean cut-out on all three screens.

⚠️ Because the rows are shared, **anything you change in `.ntf-row` and friends
changes the homepage too** — which is the point; resist adding a home-only
override.

### Both screens render twice
The viewer shows Dark and Light side by side, so every handler
(`ntfTab`/`ntfMarkAll`/`sdToggle`/`sdSeg`/`sdConnect`) scopes to
`btn.closest('.app-screen')`. A document-wide query would drive both copies at
once — same rule as `plTab`.

## Onboarding Wizard (`onboardingHtml` + `OB` state in `app.js`)

An 8-step signup flow, entered from the Auth screen's buttons (`obStart()` resets
state then `navigate('onboarding')`). All panels live in one `.s-onboarding` DOM;
JS shows one at a time.

**Steps:** `0` username · `1` connect service (Spotify/Apple/SoundCloud) · `2`
allow listening-tracking (**only shown if a service was connected** —
`obActiveSteps()` drops it otherwise) · `3` genres (**Pro's mix dial, or a
list of the same tree** — see *Step 3* below) · `4` artists · `5` albums · `6` people you may know · `7` minimal
profile (the payoff → `Start exploring` → `navigate('home')`).

- **State** lives in the module-global `OB` object (username, service, tracking,
  and `Set`s for genres/artists/albums/following, plus per-wall search query).
  It persists across re-renders; `obStart()` resets it.
- **Multi-instance:** the viewer shows the dark + light variant side by side, so
  every action mutates `OB` then `obSync()` re-applies state to **all**
  `.s-onboarding` instances. `obInit(root)` is called per instance after each
  render (wired into `renderViewer`'s rAF + the mobile paths).
- **Artists/Albums walls** (`obRenderWall`): data derived from `ARCHIVE`
  (`obArtistList()` = unique artists w/ album-art avatar; albums = the archive).
  Search filters the wall; tapping a card toggles selection — selected items get
  a checkmark overlay **and** appear as chips in **the dock** (below).
  Skippable, but 3+ is encouraged (copy only; no hard gate).
- **The dock** (`obSyncDock` → `.ob-picks-dock`): one strip between the stage
  and the footer, **outside the scroll**, carrying this step's picks against
  Continue — genre chips (3), the walls' image chips (4/5), people (6) — each
  removing its own pick. ⚠️ It replaced the walls' `.ob-pinned` rows above the
  wall, and it exists so nothing a user picks can push the wheel or the wall
  around: it is capped at two rows (56px for genre chips, 70px for image
  chips, keyed on `data-ob-step`), scrolls inside the cap, and fades only once
  it overflows (`is-over`, measured). ⚠️ **Empty, it is `display: none`** — it
  carried a mono hint line for a day, which cost the wall a row before the
  first pick, exactly when the wall wants the room. Shown on steps 3-6 only
  (`.ob-has-dock`).
- ⚠️ **On the scrolling steps the wall runs UNDER the buttons.** `.ob-foot`
  (dock + footer, one block) becomes an overlay at the bottom of the screen
  (`.ob-stage-fade`, set by `obSyncDock` on 4, 5, 6 and 3-in-list-view), the
  stage reaches the bottom edge, and its mask fades the wall across exactly
  the foot's height (`--ob-foot`, measured per sync because the dock is 0-2
  rows) — opaque just above the foot, gone at the bottom edge. Cards dissolve
  into the picks and the buttons and reach obscurity at the very bottom. ⚠️ A
  stage that *stopped* above a stacked dock and footer, with a fade above
  that, cut the wall off a quarter of the way up the phone; that is what this
  replaced. The panel takes `--ob-foot + 16px` of bottom padding so the last
  row can scroll clear. The other steps keep the stacked layout (step 7's
  note sits on the footer by `margin-top: auto`; the wheel is sized to fit).
- **Skip and Continue wear a 5px rim of `--bg`** (a box-shadow ring), and Skip
  is a `--surface` pill rather than bare text: with the wall running under
  them, the ring is the page showing through around each button, so they sit
  on the screen instead of on whatever scrolled beneath.
- ⚠️ **The footer never leaves the frame and has no rule above it.**
  `.s-onboarding` is `height: 100%` — it inherited `min-height` from
  `.app-screen`, which let a tall step grow the screen and carry Continue off
  the bottom of the phone — and its `border-top` is gone so the dock and the
  button read as one strip. This is the rule for every step, not just 3.
- **People you may know** (`obPeopleList`): `FRIEND_ACTIVITY` handles + a few
  extras, each with a fake mutual count and a Follow toggle.
- **Footer** is contextual (`obSyncFooter`): Continue is disabled until a valid
  username (step 0); Skip shows only on the optional steps (1,2,4,5,6); Continue
  shows a live selection count on the pick steps.
- Onclick args are escaped with `obOc()` (HTML-attr + JS-quote safe) / `obEsc()`.

### Step 3 · the wheel and the list (`OB_MIX` · `obMixBuild` · `obRenderGenreList`)

Genres are picked on **the same mix dial Pro uses in the bento** — not a copy,
the same functions through the `OB_MIX` dial context (see *Dial contexts* under
the mix dial) — or on a **list** of the same `SD_GENRE_TREE`, one switch apart.
Both write `OB.genres`; the chip row above them and Continue's count read it.

⚠️ **The dial was here, left, and is back by decision (2026-09-03).** It left
because a first-timer should not have to learn a gesture to get in. The list is
what answers that: it is the instantly-legible route through, and the wheel is
an offer, not a toll. Don't remove either view to "simplify" the step.

**Layout, top to bottom:** head · `.ob-view-row` — the **dial's own Back** on
the left (`.ob-mix-back`, one ring up, visible only inside a main, keeps its
space when hidden) and **`.ob-view` (Wheel | List)** on the right, level with
each other · one `.ob-genres` at a time · then, **outside the stage**,
`.ob-picks-dock` — the chip row — sitting directly on the footer, which lost
its hairline so dock and Continue read as one strip.
- ⚠️ **THE WHEEL DOES NOT MOVE, and Continue never leaves the frame.**
  `.s-onboarding` is `height: 100%` (it inherited `min-height` from
  `.app-screen`, which let the wheel's height grow the screen and carry the
  footer off the bottom of the phone). The stage scrolls; the rail, the dock
  and the footer are fixed. The chip row was once above the views inside the
  stage, and every pick that wrapped it shoved the wheel down — docked, it
  cannot. It is **capped at two rows** (56px, scrolls inside the cap) and
  **fades past that** — a mask applied only once there is overflow (`is-over`,
  measured), so a two-row mix that fits is never dimmed. Each chip removes its
  own pick — the same row the home's info box carries. Empty, it collapses —
  the instruction hints it once showed went with the other steps'; the head
  says what to do.
- ⚠️ **Two Backs, on purpose.** The rail's Back is the *step's*. The dial's is
  its own button (`obMixBack` → `mixGoto(null, OB_MIX)`), on the switch row.
  Folding the two into the rail's was tried and rejected: a Back that sometimes
  means "up a ring" and sometimes "previous step" is two buttons in one coat.
  Don't merge them again.
- **The wheel** (`.ob-mix`, a square bled **16px past the column each side** —
  out to the progress belt's 8px margin, 369px in the 385px frame, ~1.15px a
  viewBox unit against the bento's ~0.91): `obMixBuild` drops a
  `.mix-inline.mix-inline--ob` into it once per instance, on first `obSyncOne`,
  and **spins it in on build** as well as on arrival, so a page loaded straight
  onto this step gets the entrance. The head above it is tightened to 10px.
  `--ob` undoes only what a cover-less host has to — in flow, always visible,
  and **the screen's own palette** (`--bg: inherit` etc.) instead of the dark
  tokens the bento wrap pins for sitting on album art. No blur, no tint.
  `.ob-mix-back` is the home's corner pill, shown only inside a main
  (`.ob-mix.is-in`); the rail's Back stays the step's.
- **The list** (`obRenderGenreList` → `.ob-glist`) is **bubbles** — the chips
  step 3 had before the dial, in the wheel's margins (bled 16px to the belt)
  and the step's emboss: the sixteen mains as raised pills (`.ob-gbub`).
  ⚠️ **Tapping a main PICKS it** and unfolds its subs in a pressed-in well
  (`.ob-gsubs`, a full-width flex item, so it lands under its main's *row*) —
  the dial's own rule, kept so both views mean the same thing by the same
  tap. (An earlier cut had accordion rows that unfolded *without* picking, and
  the views disagreed about what a tap on "Rock" was — don't go back.) Tapping
  it again unpicks and folds; subs picked inside stay picked, and the main
  stays **lit** (accent rim on a raised bubble — the dial's "something in
  here" ring) where a picked one is **pressed in** (`.ob-svc--on`'s shadows).
  Unfolded mains live in `OB.genreOpen`; `obListMain` is the tap.
- **Two roads, one DOM.** A wheel tap goes `mixGoto`/`mixToggle` →
  `mixDialSync(OB_MIX)` → `OB_MIX.onSync` → `obSyncGenres` + `obSyncFooter` on
  every instance. A list/chip tap goes `obToggleGenre` → `obSync` →
  `obSyncOne` → `mixWrapSync` + `obSyncGenres`. Both end with every wheel,
  list, chip row and footer agreeing.
- **Arriving** (`obMixArrive`, after `obNext`/`obBack` land on 3) resets to the
  top ring — the picks survive, the ring you were standing in does not, the
  rule `openMixDial` keeps — and replays the spin-in. Switching back to the
  wheel replays it too.
- ⚠️ **Labels can only be MEASURED while the wheel is on screen.** The panel is
  `display: none` on other steps and the wheel hides behind the list, and
  `getComputedTextLength` returns 0 for anything unrendered — so a dial built
  on step 0 was never fitted. `obSyncGenres` refits whenever the wheel is
  showing; the fit resets first, so it is idempotent. (At this width every
  label fits unfitted anyway; the refit is the safety net.)
- `SD_GENRES` — the flat twenty — now has **no readers**. It is kept as the
  editorial order it was, in case a flat picker is ever wanted again.

### The chrome is a belt (`.ob-top` + `.ob-rail`)

The progress bar is the **drive belt at its smallest scale**: a 12px stadium
inset **23px from the top** (8px until 2026-09-03; lowered 15px once the phone
chrome stopped being a black strip above it) and **8px** from both sides,
filling `--ob-fill` over an
`--ob-track` slack. It runs the full width on its own — the back button and the
step counter moved down into `.ob-rail` (the 24px content column) so it could.
⚠️ It was a 4px hairline sharing a flex row with those two; don't fold them back
in. The counter is zero-padded (`01/08`) mono — an instrument reading, not a
sentence.

- `--ob-fill` / `--ob-track` are declared on `.s-onboarding`. Fill is **white**
  in dark. ⚠️ **`sd-theme-light` swaps the fill to ink** and keeps the same grey
  track — white on cream reads as the *empty* half, which inverts the whole bar.

### ⚠️ Step 0 is plain flow now — the drawing is gone

It was a technical drawing: a machined plate, six construction circles, two x
rules and a belt rig, with the head, the field and the readout laid over it as
**absolute percentages of a 369×464 box**. All of that is switched off. What is
left is an ordinary panel on the shared `.ob-h` head — which is also what lets
it share a surface language with every other step.

⚠️ **The percentages were pure cost once the drawing went.** Every change meant
re-deriving six `top`s against a box nothing was aligned to any more. If you
bring the drawing back, they have to come back with it — see the table below.

#### The slot (`.ob-user-well`)

The bento's neu-emboss (`.v3-search-pill`) **pressed IN rather than raised** —
same offsets, same colours, sign flipped — so the field reads as a hole to put
something in rather than a button to press. Solid `--bg`, so it is the surface
itself deformed, which is the whole trick. It takes a 1px `--ob-fill` rim on a
valid handle.

⚠️ **It is a `<label>`.** The whole slot focuses the field for free. It was a
`div` with the input stretched over it and `pointer-events` juggling to stop the
`@` swallowing clicks; the element that means *this labels that control* does
the job without any of it.

#### The readout — budget, rule, reassurance

⚠️ **The note sits AFTER the constraint, not with the heading.** "4–18 chars ·
a–z 0–9 _" is the line that makes someone think *but I want a real name*, so
"Don't worry — you'll be able to pick a nickname too." answers it in place
rather than pre-empting a worry they have not had yet. Sans and sentence case
against the hint's mono uppercase: it is talking to the person, not annotating a
drawing.

⚠️ **The meter keeps its 141px width and is centred with `margin: auto`**, not
by going full-width with `justify-content: center`. Its `::before` rule is
`inset 0`, so a full-width element draws that underline right across the panel
instead of under the dots.

#### Step 1 wears the same surface (`.ob-svc`)

The service rows dropped `border: 1.5px solid` for the **same emboss, raised** —
the shadow pair is the edge. Selecting one presses it **in**, using the slot's
own inset shadow plus an accent ring, so the two states are one object seen from
either side. `.ob-note` matches `.ob-user-note` exactly. That is what makes the
two pages read as one surface language rather than "a drawing" and then "a
form".

#### ⚠️ Bringing the machine back

`sdPlate`, `sdPlateHubs`, `OB_PLATE`, `OB_RIG` and `obPlateSvg` are all still
here and still correct — **nothing calls `obPlateSvg` any more.** `OB_RIG` is
Eric's `Onboarding_Name`, drawn in belt-lab.html and exported from the **panel**
frame, so its numbers already are plate coordinates: two r26 decks on the x=44 /
x=325 rules and a r50 wheel centred at (184, 324), clearance 9 → belt top run at
y=213, bottom at y=383. Its path is **solved, not pasted** — `belt.js` loads
before `screens.js` (index.html 240 vs 246), so `obPlateSvg` asks `SD_BELT.taut`
for the shape exactly as the lab does and the two cannot drift.

To restore it: put `${obPlateSvg()}` back inside a `.ob-plate` wrapper in step 0,
flip `OB_PLATE_ON` if you want the plate as well as the rig, and move the
overlays back to absolute percentages of the 369×464 box:

| | now (plain flow) | rig only | rig + plate |
|---|---|---|---|
| head | `.ob-h`, 24/13.5 | y 45, 26/13.5 | y 88 — the top corner circles (r44 about 44,44) own y 0→88 — and 22/12.5 to fit |
| slot | flow, 52px tall | y 142, h 48 | y 156, h 34 |
| budget + rule + note | centred block under the slot | centred under the rig, y 396 / 420 / 440 | impossible — the bottom-left corner circle (r44 about 44,420) and the E bolt (r28 about 144,436) cross all three; they become ONE line above the rig at y 198, and the note has nowhere to go |

### Step 0 · the plate (`.ob-plate`)

Step 0's layout **is construction geometry**. One machined plate — a polygon
whose every vertex is a circle — drawn hairline at 1:1 in a `369×464` viewBox
(369 = the 385px screen less an 8px margin each side, the same margin the
progress belt uses). The title, the field and the readout are HTML laid over it
in the SVG's own percentages, sitting on the rules the circles set.

Two primitives in `screens.js`, above `onboardingHtml`:

| | |
|---|---|
| `sdPlate(pts)` | the outline `d` from `[{x,y,r}, …]` clockwise |
| `sdPlateHubs(pts)` | each corner's **arc centre**, outward direction, and convexity |

Everything on screen derives from the one vertex list `OB_PLATE`, so the drawing
and the shape can't drift apart. `OB_FIELD` does the same for the input.

- ⚠️ **The runs stay orthogonal because consecutive vertices SHARE an x or a y.**
  That is the whole trick, and it's why this model beat the belt-hull one
  (`beltPath`): in a rounded polygon the straight runs lie on the polygon's own
  edges, so a corner radius *cuts* the corner but never *tilts* the run. Radii
  are then free to vary — big at the outer corners, small at the bosses — while
  the shape stays on the grid. A tangent hull ties the run angle to the radii
  and every mismatched pair slants.
- The single diagonal (**D→E**) is 45° on purpose: the diagonal of the grid
  square, so it is still on the grid. It is also the one **concave** corner
  (at D); `sdPlate` needs no special case for that, the sweep flag just flips.
- ⚠️ **A bolt hole must not sit at a concave corner.** There the fillet is cut
  *from the void* and the hub lands outside the material, so `.obp-bolt` filters
  on `hub.convex`. Drawing the construction circle there is still right — that's
  the cutter.
- **Three layers, faintest first:** `.obp-rule` (the grid — the two verticals
  through the top corner hubs; x=44 is the text column *and* the deck pulley's
  axis) · `.obp-cons` (the construction circles whole, not just the arcs they
  lent) · `.obp-edge` (the cut edge, the only line at full weight), plus
  `.obp-bolt` for the holes. ⚠️ Stroked from `--text2`, not `--text3`: `--text3`
  is already 22% alpha and multiplying it by another opacity renders as nothing.
- ⚠️ **ONE circle per corner. There is no second pass, and there was.** An
  offset "ghost" layer drew every circle again 8px outward. It is the single
  thing that made the screen look busy — it doubled every line, and the ghosts
  collided with the neighbours their originals cleared. With one layer **no two
  circles on this screen overlap**; that is the property to re-check if you move
  a vertex.
- ⚠️ **Nothing is filled — not the plate, not the belt, not the wheels.**
  Filling the belt made the input an opaque slab that cut the construction
  circles and the x=325 rule in half; the drawing stopped passing behind the UI
  and the whole thing collapsed into a rounded card sitting on a diagram.
- ⚠️ **The field's pulleys sit on x=44 and x=325** — the same two rules the top
  corner hubs set — so each pulley lands directly under a corner circle. That
  vertical alignment is the payoff; move the corner radii and these move too.
- ⚠️ **`.ob-plate` must not have `width: 100%`.** As a flex item that resolves
  against the padded 337px column and the `margin: 0 -16px` merely overflows it;
  auto width plus the default stretch is what actually makes the box 369.
- **Validation is the belt tensioning:** on a good handle the belt goes to full
  weight in `--ob-fill` and the idler's bolt seats. `obUserHint` sets
  `.ob-plate--ok`. ⚠️ The idler was briefly a three-hole motor that spun — it
  read as a second, louder logo inside the field and fought the plate it sits
  on. Two matching pulleys is the calmer and more correct machine.
- **The character budget is 18 more circles on one rule** (`.ob-user-meter`):
  5px dots on an 8px pitch = 141px, sitting in the solid corner the notch leaves
  free. The tick under the **4th** is the minimum `obUserValid` puts on Continue.
- **Handles are 4–18 characters**, in three places that must agree: the regex in
  `obUserValid`, the `.slice()` in `obSetUsername`, and the input's `maxlength`.

---

## How Screens Work

`screens.js` exports a `SCREENS` array. Two helper functions:
```js
topNav(active)           // 'playlists' | 'feed' | 'home'
halfStars(rating, size)  // halfStars(4.4, 16) → star span HTML
```

### Three traps in the vinyls (all found the hard way)

1. **Draw the disc with a gradient mask, never an SVG `mask-image`.** An SVG mask is rasterised once and then *sampled*. At ~10px, with a fractional size and gap, every disc in a row lands on a different sub-pixel offset and samples that bitmap differently — so they render at visibly different weights and **the first one looks bigger than the other four**. `.hstar` now uses `radial-gradient(circle closest-side, transparent 0 20%, #000 21% 91%, transparent 92%)`, resolved at paint time at device resolution. Stops map 1:1 onto the old artwork (hole radius 10% of the box, outer edge 45.5%). `halfStars` also **rounds** its size and `.hstars` uses a whole-pixel `gap`; the old `×0.72` gave `10.08px` and the gap was `1.5px`.
2. **`--vinyl-empty` follows the SURFACE, not the theme.** Light mode is mostly cream, so the default flips to dark ink — but the bento stats block and the review panel sit on the album's **procedural colour, which is dark in both themes**. Theming those by variant put dark ink on a dark album and the empty vinyls vanished. `.s-home-v3--light .v3-blue-stars-row, .v3-rev-card, .v3-rev-hist` override back to the light value. (`--text3` remains the fallback for everything else that uses it.)
3. **`vertical-align` does nothing on `.hstars`** — it's a flex item of `.v3-blue-stars-row`, and flex items ignore it. Alignment there comes from the row's `align-items: baseline`, which already puts the disc **boxes** exactly on the number's text baseline (measured: 0.00px off). A disc is still taller than the digits' cap height, so it looms; `.hstars` carries `position: relative; top: 1px` as an *optical* correction. ⚠️ It was `transform: translateY(10%)` until 2026-09-18 and **must not go back to a transform**: a transform on a masked element makes it its own compositing layer, which the scaled phone wrap (and WebKit on the real phone) resamples — the discs read blurry. The same goes for every small nudge on the feed card (`.v3-rev-big`, the cover, the verb, the bento's count): all `top`, none `translateY`. Same family as the `animation-fill-mode: both` blur under *Review cards*.

`halfStars(rating, size)` now renders **vinyl records, not stars** — every rating across the app routes through it. Each unit is a `.hstar` span masked by `--vinyl-mask` (a disc-with-center-hole SVG); `full`/`empty`/`half` just set the background (half = a 50/50 `--star`/`--text3` gradient under the mask). Sizes are scaled ×0.72 so a vinyl matches the old ★ glyph's footprint (its top lines up with an adjacent number's cap height). `--text3` still controls the empty color per screen.

> Note: ~38 inline plain `★` glyphs in text bits (e.g. "4.4 ★" labels, `.star-pick`, `.dorf-act-rating`) do **not** go through `halfStars` and are still literal stars.

---

## Pull to refresh — home feed + album wall (`sdPtr*` in `app.js`)

Pull down from the top of the **home** scroller or the **album wall** and the
body follows the finger (at ~55%, resistance), a vinyl fades in and turns with
the pull, and at `PTR_THRESH` (64px) it **lands**: accent colour, a bump, and
a buzz. Release past it and the disc spins while the content re-deals; short
of it, everything eases back. Home re-deals the friend feed (`_FEED = null` →
`renderFriendFeed`); the wall repaints `wallGridHtml()` (its order is
deterministic, so the wall refresh is the gesture more than new data).
- **Delegated at the document**, so it survives every `renderViewer()` rebuild.
  `sdPtrTarget` only arms on a `.v3-body` at `scrollTop 0` inside a shell that
  has `.v3-feed-items` or `.wall2-grid`, and **never in `--review` state**
  (same body, album page).
- **The body itself is translated**; the indicator (`.sd-ptr`) is inserted as a
  sibling before it, parked at `body.offsetTop`, `z-index: 1` so it paints over
  the transformed body. `--p` = pull / threshold. **The disc never scales**: it
  is the album accent in both themes, rises in opacity with the pull, and
  **fills like a clock** — two copies of the record, a faint ghost under an
  accent fill whose conic mask sweeps `--p × 360°`; at the threshold the ghost
  drops and it is one whole record, and on release the mask goes and it spins.
  `done()` must reset `--p` to 0 or the disc stays after the refresh.
- **Touch and mouse are separate paths**: touch needs a non-passive `touchmove`
  to stop the scroller, and `.v3-body { overscroll-behavior-y: contain }` keeps
  Chrome's own pull-to-refresh out of it; mouse is for the desktop viewer.
  ⚠️ A mouse pull ends with a click on whatever is under the cursor — on the
  wall that opens an album — so `_ptrSwallow` eats the one click after a pull.
- **Haptics (`sdHaptic`)**: `navigator.vibrate` (Android). iOS Safari has no
  vibration API; toggling a native `switch` checkbox is the one thing that
  clicks the Taptic engine from a page (17.4+) and only inside a user gesture,
  so it is tried and not promised. ⚠️ Unverified on device — Eric tests on
  the phone.

## Log Sheet — Letterboxd-style logging (`app.js`)

`openLogSheet(triggerEl, subject?)` builds a **singleton** bottom sheet (`#sd-log`) lazily and mounts it into the triggering `.app-screen` so it stays inside the phone frame. Reusable from anywhere.
- **Subject:** defaults to the current bento album (`currentBentoAlbum()`); pass a `{ image, title, subtitle }` to log something else (a song does this via `openSongLog`).
- **Contents:** cover + title/subtitle header · large centered **vinyl rate** control (drag/tap for half-record ratings, `setLogRating`) · one-line **Listened (ear) · Listen later · Favorite** toggles (`toggleLogOpt`) · a review textarea · a footer status line. The sheet floats with 10px margins (matches the bento).
- **The five records are 54px with a 7px gap** (2026-09-11, up from 32/8, then 50/12): a 298px row, ~76% of the 393px frame, so it stops about 12% short of each screen edge. Sized on `.sd-log-rate .sd-rec`, not `.sd-rec`, because the per-song rows reuse the glyph at 14px.
- **The rate control follows five-star interaction guidance, translated to records** (2026-09-11; WCAG 44px targets, Letterboxd's half rule, MUI's tap-to-clear, NN/g's live feedback). Pointer events on `.sd-log-stars-track` (`role="slider"`): the track is divided into **five equal cells** (`valueAt`), each a ~60px square (`::before` pads it vertically; `touch-action: none`), and the **left half of a record is the half, the right half the whole**. A **press sets, a slide adjusts** with the fill following live; **sliding left off the track clears**. A tap always sets what it lands on — re-tapping the current value does NOT clear it (tried, rejected). There is **no number** under the discs; the fill is the readout. ⚠️ **The fill is measured in records and gaps** (`recFillWidth`, reading `--rec` / `--gap` from the track's container), not as a percentage of the row — the row is 5 discs + 4 gaps, so a percentage put the half at 55% of the first disc and 45% of the last. Both the big control and the per-song rows use it. Steps buzz via `navigator.vibrate` where it exists (Android only). Keyboard: ←/→ by a half, Home/End, Delete to clear. ⚠️ **Only the release commits** — `paintLogRating` (fill + number + ARIA) runs live, `setLogRating` (which also saves the draft and pokes the pet) runs once on pointerup, so a drag is not sixty writes and sixty reactions.
- **A song's sheet sizes to its content** (`.sd-log-sheet--song`, toggled in
  `openLogSheet`): no review box and no song list, so it ends under the three
  buttons with the page showing above it, instead of 95% of empty sheet.
- **The sheet is almost fullscreen** (2026-09-11, was 75%): `height: calc(95% - 10px)` — the 10px bottom float is taken out of the 95% so a true 5% of the screen stays clear at the top.
- **The header restates the album page's info box** (2026-09-11). Sheet padding is **12px all round** — 12 is the album page's gutter (review panel 10px + row padding 12px = song text 22px from the screen edge; the sheet is 10px in + 12px = the same 22px), and top = left so the cover sits an even distance from the corner; the nub is absolutely positioned over the header's top edge so it takes no row. The head is a **centred column**: the cover, **two option buttons wide** (`calc((200% - 8px) / 3)`, square, 12px radius — the width two `.sd-log-opt` cells plus their gap resolve to), then the text under it at full width and centred, **never clamped or ellipsised** — the album page wraps its title, so does this. Save + Share are the head's first row, centred under the nub (see *Save is a button* below); there is no ✕. Type is the review-state `.v3-blue` rules verbatim: Roboto Flex, title 22px/400 at 92% condensed to `wdth 85`, the **year** inline after it (`.sd-log-year`, 14px/300 at 50%; the subject carries `year`, and `:empty` hides it for artists), artist 14.5px/700 at 88%. Move these with the album page's rules if those change.
- **The grab nub closes the sheet** — tap, or drag it down past 70px (`wireSheetGrab` in app.js, pointer events with capture, finger travel divided by the viewer zoom). It is wired on all three bottom sheets (log, badges, delete-confirm) so they behave alike. The `::before` on `.sd-log-grab` is the hit area.
- **The per-song rows are the album page's tracklist rows** — `.sd-log-song` restates `.v3-song-row` (9px rhythm, 10px gap, 12px type, hairline between rows, mono track number in a 14px cell at the head). A negative side margin keeps the title flush with the sheet's left margin while the hover / logged tint bleeds 12px past it. The logged rail is an inset box-shadow in the gutter, not a border, so it never shifts the text. Retune both lists together.
- **The review box grows on tap** — `min-height` 88 → 132px (~50%) on `:focus`, with a short ease, and it stays grown via `.has-text` while there is anything in it (toggled on input and on draft restore) so a saved review comes back readable rather than folded.

### Save is a button — and unsaved work is still never lost (2026-09-18)
Eric: "instead of having it auto update we're gonna have a dedicated save
button at the top centered above the album image and the share next to it …
no close button, people will just swipe down from the top or click outside."
It autosaved (and re-rendered your review card on every keystroke) before.

- **`.sd-log-actions`** is the head's first row, in flow: **Save + Share**, two
  matching pills centred over the cover. Save (`.sd-log-save`) is filled with
  `--star` while there is something unsaved; otherwise it is disabled and reads
  "Saved" (`paintLogSave`, off `SDLOG.dirty`). Share hides for songs / artists,
  leaving Save centred alone.
- **There is no ✕ on this sheet.** Dismiss = the nub (tap / drag down past 70px)
  or a tap on the overlay. `#sd-log .sd-log-grab::before` stretches the nub's
  hit area across the sheet's whole top edge, since the swipe is now the way
  out; it stops just above the buttons. (`.sd-log-x` CSS stays — share.js's
  sheet still uses it.) The "Updated 5 min ago" stamp, `logAgo` and the 30s
  tick are gone with the autosave.
- **Two stores.** `spindeck-logs` is what is SAVED — everything else in the app
  reads only this (review card, quick-log squares, CTA face, library tabs).
  `spindeck-logs-wip` is the sheet's unsaved work. `saveLog()` (every edit;
  typing debounced ~400ms, taps immediate) writes the WIP and lights Save — it
  publishes nothing. **`commitLog()`** (the Save button) `putDraft`s the
  snapshot, drops the WIP, runs `flashLogSaved()` (re-renders your review card,
  `syncQuickLog`, `refreshSongFavs`) and closes the sheet.
- `openLogSheet` loads **WIP first, else saved**, and sets `dirty = !!wip`, so a
  dismissed half-typed review comes back with Save lit. `fillLogSongs` merges
  per-song ratings from the same source. `closeLogSheet` flushes a pending
  debounce **into the WIP** (only if one is pending — an unconditional
  `saveLog(true)` there would mark an untouched sheet dirty).
- ⚠️ **`_sdlogRestoring` guards the restore.** `openLogSheet` repaints through
  the same helpers the user's taps go through (`setLogRating` / `setSongRating`),
  so without the flag, loading a draft would immediately mark it dirty.
- `putDraft` **drops a draft that has nothing left in it**.
- `logKey(subj)` is `kind::title::subtitle` — the title alone collides.
- Per-song ratings are merged back **by title, not index**.
- The quick-log squares still write straight to the saved store
  (`writeDraftFlag`) — and patch the same flag into a WIP for that record if one
  exists, so the sheet doesn't reopen with the old value.
- There is no "discard changes" yet: to drop unsaved work you undo it by hand.
- **Light theme**: the sheet is a child of the shell that opened it, so
  `.s-home-v3--light .sd-log-*` overrides re-ink it (#f7f4ee, a shade lighter
  than the #f0ece3 page, the same relationship as the dark pair). The badges
  and delete sheets are still dark in both themes.
- ⚠️ **Debugging note:** CSS transitions don't advance on a closed sheet (it
  isn't rendered), so `getComputedStyle` there returns frozen values from the
  previous state. Verify the status line with the sheet actually open, or you'll
  chase a cascade bug that isn't there.

The album page's **quick-log squares read and write these same drafts**
(`syncQuickLog` / `writeDraftFlag`), so the square and the sheet can't disagree
about whether you favourited a record — and a favourite survives a reload.
- The old inline compose block (`.v3-rev-mine` stars + textarea + Post) was replaced by a single `.v3-rev-cta` "Review, rate, log" button that opens this sheet.

### Quick log — the strip under the CTA
The album page carries the **same three toggles** as a joined strip **under**
the CTA (`.v3-rev-cta-row` › `.v3-rev-quick` › `.v3-rev-q`; since 2026-09-11 —
they were squares beside it, and the album-state rules in app.css turn the row
into a column, the CTA full width with all corners rounded, the three cells
sharing the row at 42px tall), so marking something listened / later /
favourite costs one tap instead of opening the sheet. The base rules below
still describe the cascade (shared borders, outer corners only), which the
strip keeps.

**The CTA changes face once you have rated** (`syncRevCta`, called from
`syncQuickLog`, 2026-09-11): untouched → "Review, rate, log"; rated → your
discs (`halfStars`) + "Your rating **4.5**" with an "Edit" pill on the
right (it said "Edit rating?" until the share icon joined the row) (`.v3-rev-cta--rated`); written but unrated → "You reviewed this ·
Edit review?". Same button and handler — only the face changes. It is stamped
in `data-state` and only rebuilt on change, because `flashLogSaved` now runs
`syncQuickLog` on every autosave so the button (and the squares) follow the
sheet live. ⚠️ Call it as `homeShells().forEach(s => syncQuickLog(s))`, never
`forEach(syncQuickLog)` — the latter hands the array index in as the album,
which read `albumDraft(1)` → `{}` and wiped the second shell on every close. They butt directly onto the button and each other — a `-1px` left margin
collapses the shared border, and only the outer corners are rounded, so the four
read as one cascading control. `align-items: stretch` gives them their height
from the CTA rather than hard-coding one.

Each is an **icon over a tiny label** (`.v3-rev-q-lbl`, 7.5px mono uppercase) —
the same stack as `.sd-log-opt` in the sheet. The glyphs alone were unreadable
at this size. ⚠️ **The label sets the button width**, not the icon: "LISTENED"
and "FAVORITE" are 8 mono characters, which is what 50px is for. All three share
that width so the cascade stays even. The whole row is ~260px of the ~310px
available, so there is room to grow the type before anything clips.

- **The glyphs are shared, not copied.** `SD_ICONS` (ear · clock · heart) is
  defined at the top of **screens.js**, and app.js's `SDLOG_ICONS` is an alias
  of it. It has to live there: the home screen's `html:` is a static template
  literal evaluated while screens.js parses, so anything app.js defines doesn't
  exist yet.
- ⚠️ **The toggles are your state on THIS record**, so `populateReviewPanel`
  re-reads them from the new album's saved draft (`syncQuickLog`) whenever the
  album changes — without that they'd persist across a bento swipe and claim you
  favourited the next record. They're re-read rather than merely cleared, which
  is what makes a favourite survive a reload.
- ⚠️ **Resolve the shell's album through `shellAlbum(scr)`, never `scr._album`.**
  `_album` is set by `setMainAlbum`, which only runs on the swipe and
  `openAlbumPage` paths — tapping the bento into the album page never calls it,
  so on that route `_album` is undefined and the fallback is what finds the
  record. Reading it raw silently gets nothing.
- Toggling one **syncs the twin shell** (dark ↔ light): they show the same album
  and this is state about the record, not the screen. Deliberate exception to
  the usual "scope handlers to the clicked shell" rule.
- They also render on the **artist page**, which inherits the CTA. Favouriting an
  artist reads fine; "listened" is looser. Split them if that ever grates.

## Tracklist (`populateSongList` / `songsFor`)

`.v3-rev-songs` sits below the CTA in review mode: a full-width table of **# · title · duration · rating (number + vinyls)**. Clicking a row → `openSongLog(this)` → the log sheet for that song. Song titles/durations/ratings are **deterministic placeholders** (`songsFor` seeds a PRNG from the album name; there's no real per-song data — `album.tracks` is only a count).

**Every track is listed, in flow.** It used to cap at ~8.5 rows and scroll inside itself (`.v3-rev-songs--scroll` → `max-height` + mask fade); that nested scroller hid the back half of a long album inside a page that already scrolls. Don't reinstate it.

**Column labels** (`.v3-song-head` — SONG · LENGTH · RATING, small mono uppercase) sit above the rows. The header is the *same flex row* as `.v3-song-row` and reuses its three cell classes, so labels track their columns instead of being positioned twice. ⚠️ The two right-hand columns are therefore a **fixed width** (`--song-dur-w` / `--song-rate-w` on `.v3-rev-songs`) sized to the *labels*, which are wider than the values they head — let them size to content and "LENGTH"/"RATING" each overflow the column and the header slides off its own list.

**2-line title handling:** a long album name wraps to two lines on the album page; `enterAlbumPage`/`setMainAlbum` measure it synchronously (full text → `offsetHeight`) and toggle `.v3-rev-title-2line`, which drops the CTA down a line.

## Review panel order

Top to bottom: CTA (`.v3-rev-mine`) · histogram · **tracklist** · artist albums
(artist page only) · **friend-rec pill** · filter tabs · review list.

- **The friend-rec pill (`.v3-rev-rec`, "X listened to this") sits with the
  reviews**, directly above the filter tabs — it's social proof, so it belongs to
  that section, not up beside the CTA where it used to push the whole panel down.
  Its old neighbours (`.v3-rev-rec:not([hidden]) + .v3-rev-top` and the hand-mode
  `margin-left: 90px`) are gone; it now aligns to the review list's 12px gutter.
- **The CTA is centred** (`.s-home-v3--review.s-home-v3--album .v3-rev-mine {
  align-items: center }`) — the art is full-width on the album and artist pages
  and there's no CD column to align against. The `:not(--album)` half of that
  rule pair styled the retired plain review state and is dead.

## Review cards (`revCardHtml` / `revCardInner` · `populateReviewList` in app.js)

**The list is padded and varied** (`revsFor(a)`, 2026-09-11): the archive
authors three one-liners per record, which ended the page after three cards.
`revsFor` pads to `REV_TARGET` (8 — about one screen; 14 was too many) with seeded extras (DZ_NAMES × DZ_QUOTES,
no repeats per album) and lengthens about a third with 1–3 sentences from
`REV_MORE`, so quick takes sit beside paragraphs. **Every rating is re-dealt
too** (the archive authors [4.5, 4, 4] for nearly every record, so the list
read as a wall of 4.5s): seeded per album + reviewer through `seedRand` from
a pool skewed by the album's own score, so a loved record still collects a 3
and the odd 2.5. Deterministic and cached on the album (`_revsFull`) so keys,
likes and threads stay put. ⚠️ `order` in `populateReviewList` is that padded
list — keying the extras against `a.reviews` would put them all at index 0.

**One builder** (2026-09-11 — it was four copies: pinned, list, and two
"mine" cards, forever drifting). The card is the **review page's hero at list
scale**: `.v3-rev-card-top` = 36px photo (`feedFace`) · `.v3-rev-who` (name,
with the pinned chip beside it, then `@handle · when` **on the same line** —
one baseline since 2026-09-14, Eric; the name ellipses, the handle and time
never wrap; only the hero still stacks them) · **`.v3-rev-big`** on
the right (the score at 21px/800 with the small records under it) — then
`.v3-rev-text` (3 lines, clamped) — then `.v3-rev-foot` › `.v3-rev-acts`
(Share on your own card only — the **upvote pill AND the comment pill sit
under the records** in `.v3-rev-big`, stacked and stretched to the column's
width — the like a true SQUARE (`aspect-ratio: 1`, heart over count), the
comment pill squarish beneath it; the foot row is only emitted for Share). ⚠️ **The card
is a two-column GRID** (`"top big" / "text big" / "foot foot"`): `.v3-rev-big`
is a direct child spanning both left rows, which is what keeps the text up
against the name — inside the top row its three-item height pushed the text
down. The text stops at five lines and **fades out** (`.is-long`, set by
`markLongReviews` only on cards that really overflow — a mask on every card
would dim short reviews too; ⚠️ it runs synchronously AND on 80ms/600ms
timers, because a panel still `display:none` measures every card as 0×0 and
the fade shipped invisible the first time); the page runs it full width. About half
the reviews run long (2–5 extra sentences from `REV_MORE`, enough to cross the clamp). ⚠️ **No "rated" row any
more** (`.v3-rev-meta` / `.v3-rev-verb` / `.v3-rev-score` are not emitted; the
CSS is kept for the moment). The handle is derived from the name unless
given; your own card passes `PROFILE.handle` and your photo, and `likes:
null` (no upvote pill on yourself).
- **The album page's cards wear the FEED'S card now (Eric, 2026-09-16):**
  `populateReviewList` gives every card (list, pinned, mine) `cls:
  'v3-rev-card--page'` plus the feed's `timeRight` + `actsTop` flags, so the
  paragraph above describes the DEFAULT card (the shape the profile's pins and
  anything else calling `revCardHtml` bare still get) — on the album and
  artist pages the card is: byline (photo · name · @handle) with the bare
  comment-count · heart · time on the same top row, then a **score row**
  (26px number with the discs STACKED under it, on the LEFT under the photo — the
  feed puts its score on the right of the record row, but with no record the
  left was empty and a right-hung number read as stray), then the text
  **full width** at the feed's 12.5px / four lines / left-ragged, then the
  foot. Padding 17px top / 18px bottom like the feed; sides untouched so the
  pinned card's edge-to-edge bleed still works (the rule sets only top and
  bottom — see the ⚠️ on it in app.css). Ink stays the album surface's
  hard-coded warm white, with `--light.--artist` re-inks for the artist
  page's cream panel. Unlike the feed's, the comment pill on the top row is
  LIVE (it's `cmtCompose` — this is the page with the thread).
- **The first two comments ride the card (Eric, 2026-09-16):** `populateReviewList` passes `preview` (two roots from `cmtRoots`, which seeds and caches the same thread the review page shows) and `previewTotal`; `revCardInner` renders them as `.v3-rev-cmts` under the text — face · **name** · text, wrapped to TWO lines that fade out at the BOTTOM when there's more (`.is-long`, set by `markLongReviews` the way the review text's is; it was one line fading off the right edge until 2026-09-17, Eric) — with "View all n comments" when there are more. The page grid has a `cmts` row for it (0 tall when empty). The rows aren't tappable on their own; the card is.
- **The review page's hero is this card too (rebuilt 2026-09-16):** `reviewPanelHtml` passes `cls: 'v3-rev-card--page v3-rev-card--hero', big, timeRight, actsTop`, so the hero is the album page's card at reading scale — heart then share on the top row (`revCardInner` orders them heart-first when `big`), time hard right, 40px number with 22px discs stacked under it, text full width and unclamped. The hero's CSS sits AFTER the page block so its measures win at equal specificity. **Trimmed 2026-09-17 (Eric):** the number is 32px and the discs 17px, and the HEART left the top row for the score row's right end — `revCardInner` emits it as `.v3-rev-top-acts.v3-rev-score-like` (so the bare-heart styling carries), a second child of the `score` grid area hung `justify-self: end` and exactly the number's height (32px) so the two centre on one line. Share and the time keep the top row. ⚠️ Change the number's size and change `.v3-rev-score-like`'s height with it.
- ⚠️ **The review page read BLURRY on the phone (2026-09-16).** Not a stylesheet mistake — the desktop viewer rendered it sharp. The body's `rvpIn` fade had `animation-fill-mode: both`; a fill-forwards animation on a masked scroller keeps it on a compositing layer, and WebKit rasterises that layer's text unscaled inside the scaled phone wrap. It's `backwards` now (both `rvpIn` rules): the end state is opacity 1 anyway, so nothing is lost and the layer is released when the fade ends. If any other fade-in ships `both` on a scrolling body and reads soft on device, this is why. **It has now bitten three times** (2026-09-18: the in-place `.v3-rvp-panel`, and the album page's own `v3revin` on `.v3-review-panel` — that one animates a transform, and ending on `transform: none` still keeps the layer). Rule: **no `animation-fill-mode: both`/`forwards` on anything that holds text — `backwards` only.** The only `both` left are the mix dial's spin-in and onboarding's hub label.
- ⚠️ **The pinned card is a HIGHLIGHTED ROW, not a card in a box.** It first
  shipped outlined in `--star`, inset 10px and rounded, and read as stifled — a
  panel sitting *on top of* the list rather than the first item *in* it. Now
  the tint bleeds past `.v3-rev-list`'s 12px gutter (negative margin) while the
  padding puts its text back on the same left edge as every other review, so
  the list reads as continuous with one row lit. Its `.v3-rev-pin-chip` says
  why it's lit; it needs no border to explain itself. ⚠️ The negative margin
  has to match the list's gutter — change one and change the other.

### The review page (`review-page` · `reviewPageHtml` · `openReviewPage`)

**A card is a summary; tapping it opens the review as a page** (2026-09-11 —
the Reddit-style thread that unfolded inside every card is gone from the
album page: the list is for reviews, the page is for the conversation).
`openReviewPage(key, compose?)` reads the card's entry from **`REV_INDEX`**
(every builder writes one: pinned, list, both "mine"), pushes the back stack,
sets `window.activeReview`, forces `CMT_OPEN[key]` and navigates. The page
**hero is the album page's CARD, larger** (2026-09-11 — a Letterboxd-shaped
hero with a "name rated it" line was built and then dropped; Eric preferred
the card): `revCardHtml` with `big: true` and `.v3-rev-card--hero`, so
photo · name/@handle · the score column (number, records, like, comments)
step up in size (the like a HEART, 60% of the column and square — the card
keeps its thumb — with the review's **share button under it** at the same
size; no comment pill — the count is in the Comments heading) and the text runs full width at
13.5px in DM Sans, unclamped. Your own review gets Share in the foot and no
like. Card text has no widows: `revNoWidow` joins the last two words with a
non-breaking space, and `text-wrap: pretty` helps where the browser has it. `cmtCardTap`
ignores the hero (it is already the page). One builder, so the page cannot
drift from the card that opened it. Then the thread under a *Comments*
heading. ⚠️ The light shell's background fallback is **dark** (#1c1c22): the ink is hard-coded light, and the palette lands after the page does — a cream fallback was white-on-cream. The cards on the album page wear the same
`feedFace` photo in `.v3-rev-av` (18px) instead of initials on a gradient. **Same key on both
surfaces**, so a like or a comment on the page is the one on the card.
The shell wears the album palette like the album page (inline from
`COLOR_CACHE` in the getter, `applyAlbumColorsUrl` again after navigate for
a cold cover); the light shell floods with the album colour the way the light
album page does. `cmtCardTap` → `openReviewPage`; `cmtCompose` on a card →
the page with the composer focused, on the page → focus. **From the album page it opens IN PLACE** (2026-09-11 — a separate screen
re-rendered the header, the nav and the colour, which read as a reload; a
flying-card version was jarring too). Like the bento→album transition, it is
the SAME shell changing state: `rvpOpenInPlace` fades the bento + review
panel out (`--rvp-out`, 200ms), fills `.v3-rvp-panel` (a slot at the end of
both home variants' `.v3-body`) with **`reviewPanelHtml(R)`** — the panel the
standalone `reviewPageHtml` also wraps — and adds `--rvp`, which hides the
bento/panel and fades the review panel in. `rvpBack` is the mirror; the
record line is Back in place (`rvpRecordTap`) and opens the album on the
standalone page. Both shells switch together. Every `.s-rvp` rule is written
`:is(.s-rvp, .s-home-v3--rvp)` so the two hosts share one stylesheet, and
`cmtCompose` / `cmtAutoMore` / `cmtFill` look for either. The standalone
screen remains for the profile's pins and the rail, with a body cross-fade
(`sdFadeOut` / `rvpIn` / `body.sd-return`).

### Comments (`revThread` / `cmtThreadHtml` in app.js)

A review's comment section lives on its page (`cmtWrapHtml` under the
*Comments N* heading, always open). ⚠️ **FLAT since 2026-09-11 — no comments
on comments** (`CMT_FLAT = true`): everyone answers the review, nothing
indents, the Reply button is not emitted and the generator deals every node
as a root. The nesting machinery described below is intact behind that flag
for the day threads come back. **The composer is FIRST** in the thread
(2026-09-11) — commenting must not cost a scroll to the bottom.
**`CMT_DEFAULT` (3)** comments show, then the page **loads more as you
scroll**: `cmtAutoMore` (a capture-phase scroll listener on the page's
`.v3-body`) reveals `CMT_PAGE` (5) more each time the bottom nears, via
`CMT_SHOWN[key]`; the "View n more" button stays as the fallback, and the
thread pads 60px so it runs out through the body's own bottom fade. Counts
were raised to feed it — `revMeta` deals 6–43 comments and `revThread` caps
at 48. On the page the comment like is a 22px heart over its count, a real
target. **A comment is the REVIEW CARD's shape, minus the score and the
share** (Eric, 2026-09-17 — the small face beside a column with "♥ n" under
the text read as Reddit): `cmtNodeHtml` emits `.v3-cmt-top` (30px photo ·
name over @handle · bare heart + count · time hard right) and then the text
FULL WIDTH underneath, with a hairline between rows. The handle is derived
from the name like the card's (`c.handle` wins; yours is `PROFILE.handle`).
The like is `RVP_HEART`, pink when on like the card's. `.v3-cmt-acts` is only
emitted for Reply (i.e. never, while `CMT_FLAT`). No record line.
There's a like on every comment and one composer per
thread — **Reply aims that composer at a comment** (`CMT_REPLY_TO`) so the post
nests under it; posting with nothing aimed lands at the **base** of the thread.
The gold *"replying to @handle ✕"* chip is the only thing that says which, so
it doubles as the way out of reply mode.

- ⚠️ **`CMT_MAX_DEPTH` (3).** Past it a reply attaches to its target's
  **parent** instead of the target — each level costs 17px of a ~360px column,
  so a fifth indent leaves the text too narrow to read. Generated comments cap
  at depth 2; this is the ceiling for the ones you write.
- ⚠️ **`cmtReply` holds the WRAP, not the thread.** `cmtRender` replaces the
  thread's markup, so a reference into it is stale by the time the input wants
  focus; the wrap element survives the repaint.
- ⚠️ **Your comment ids come from `CMT_SEQ`, not `CMT_MINE.length`.** A nested
  reply lives in its parent's `kids` and never joins that list, so two replies
  in a row would both be `me0` and `cmtFind` / `CMT_LIKED` would confuse them.
  For the same reason the badge counts through `cmtRoots`/`cmtSize` rather than
  `CMT_MINE.length`, which would miss every nested reply.
- ⚠️ **The thread's type runs a step LARGER than the card above it.** It first
  shipped at the card's own scale (10px body, 8.5px actions) and that is too
  small once you're reading a conversation rather than scanning a list — the
  card is a summary, the thread is the thing you came for. The `.v3-up` pills
  were bumped with it; at 9px with a 10px glyph they read as decoration rather
  than as controls. ⚠️ That growth is also why `.v3-rev-name` now ellipses:
  it's the only elastic thing in the card's top row, which on the pinned card
  also carries the "from your feed" chip and the timestamp.

- ⚠️ **The `💬 n` count is the INPUT to the generator, not a second seeded
  number.** Every card already advertised a count (`revMeta`, or the feed
  event's own `comments`), and a thread dealt independently of it would
  disagree with the button that opened it — five replies under a badge saying
  nine reads as broken.
- ⚠️ **One KEY per review, shared with the upvote pill.** The same review
  appears in three places — the feed row, the pinned card, the list card — and
  they only reach the same thread *and the same like state* if they compute the
  same string. `feedRevKey(e)` and `populateReviewList`'s `pinKey` are
  deliberately identical; **change one and change the other.**
- ⚠️ **The indent is REAL NESTING, not a depth class.** `.v3-cmt-kids` wraps a
  node's children and carries the offset and the rail, so a child of a child
  indents twice because it sits inside two wrappers. Nothing computes a depth,
  and adding a level needs no new rule.
- ⚠️ **`cmtRender(key)` repaints EVERY wrap with that key, not the clicked
  one.** The dark and light shells render side by side and both hold a copy of
  the review; updating one leaves the other stale. Same reason
  `setArtistAlbumView` repaints every shell.
- ⚠️ **A comment's `ago` comes from its position, never a roll.** A node is
  always created after its parent, so walking `CMT_AGOS` oldest→newest is what
  stops a reply predating the comment it answers.
- **Two line pools.** A top-level comment answers the *review*, a nested one
  answers a *comment*. One pool for both gave replies that agreed with nothing
  and openers that read as non-sequiturs.
- `cmtLike` updates **in place** rather than through `cmtRender` — a re-render
  would wipe whatever was half-typed in the composer below. `cmtAdd` does
  re-render, which is how the composer clears.
- ⚠️ The thread sits on the review panel, dark in **both** themes — so its ink
  is hard-coded like every `.v3-rev-*` around it, and **every `.v3-cmt-*` rule
  needs a `--light.--artist` counterpart** for the artist page's cream panel.
  They're grouped together below the `.v3-rev-*` ones.

## Fullscreen is the album page

**There is one fullscreen state, not two.** Tapping the bento — the album art or
the `.v3-blue` info/stats box — goes straight to the **album page**
(`enterAlbumPage`, `--review` + `--album`), and Back returns to the bento in one
step.

There used to be a plain fullscreen **review** state in between: the bento
opened it, and tapping the album title *inside* it stepped up to the album page.
That middle layer is gone: the review state was an extra level of navigation
showing nearly the same thing — the one visible difference being that the review
state still had the **For You box** (`.v3-for-single`, which `--album` hides).

### No gestures on the cover here (`bentoGesturesOn`, `app.js`)

**The album page's cover is a header, not a deck.** Swipe-for-next-album and
hold-for-the-shelf-wheel are **bento** gestures and stay there — the bento is
the thing we want people handling, and on this page there is exactly one album,
it is the one you just chose, and swiping it away undoes the tap that got you
here.

- ⚠️ **The test is at gesture START, not at wire time.** Both gestures are wired
  **once per element** (`album._swipeInit` in `setupAlbumSwipe`, `box._wired` in
  `proWheelInit`) and the album page is *the same `.v3-album`* in a different
  state — so there is no wiring moment at which the answer is known. `onDown`
  and the wheel's `pointerdown` each ask `bentoGesturesOn(screenEl)` and bail.
- ⚠️ It tests **`s-home-v3--review`**, which is never set without `--album` and
  which `--artist` layers on top of — so one class covers the album page and the
  artist page both. The artist banner is not a deck either.
- **The drag goes back to the page.** `.s-home-v3--review .v3-album` re-declares
  `touch-action: pan-y` (out-specifying `.v3-album--wheel`, which Pro adds for
  the wheel) so a scroll started on the cover scrolls the review panel — the
  cover is the biggest target on the page to start one on. `cursor` drops to
  `default` with it: `enterAlbumPage` early-returns when the shell is already
  fullscreen, so the tap does nothing and shouldn't advertise otherwise.
- The **bento is untouched** — swipe and hold there work exactly as before.

- ⚠️ **`--review` is never set without `--album`.** The class pair survives
  because the CSS is tuned for the combination, but nothing can reach `--review`
  alone, so `.s-home-v3--review:not(.s-home-v3--album)` styles nothing — treat
  any such rule as dead.
- `onAlbumTitle` is **gone**; `.v3-blue-album` carries no handler and lets its
  tap bubble to `.v3-blue`.
- The left rail's **Review** entry is gone too — it would just be a second
  button for Album Page. `navigate('review')` / `navPage('review')` survive as
  legacy ids that route to the album page.
- `enterAlbumPage` early-returns when the shell is already fullscreen, so a tap
  on the stats box in the artist state doesn't re-run the entry animation.

## Artist Page (`populateArtistPage` / `artistAlbumsHtml` in app.js)

Not a screen — an `--artist` sub-state of the home shell layered on the album
page (`s-home-v3--review` + `--album` + `--artist`), entered via
`openArtistPageFor(name)`. `.v3-album` becomes the banner and `.v3-blue-album`
the artist name. `populateArtistPage` still writes the genre into
`.v3-blue-artist`, but **it and `.v3-blue-sep` are hidden** — the name stands
alone under the banner.

- **Banner:** full-bleed (`left:-10px; width:calc(100% + 20px)`), **top flush
  with the bento's top edge** — exactly where the album cover starts — and
  masked so only the *bottom* fades into the page. It used to be lifted `-20px`
  with a fade at both ends; the top fade read as a harsh cut-off floating under
  the header.
- **No artist rating.** `.v3-blue-score` and the stars-row vinyls are hidden, as
  is the `.v3-rev-hist` histogram — an artist isn't a thing you score. The
  review count survives as the one stat; the ratings live on the albums below.
- **Albums** (`.v3-artist-albums`) replace the histogram: a `.v3-aa-hd` head
  with a **row/grid toggle**, then either a `.v3-aa-row` rail or the trending
  `.wall2-grid`. `ARTIST_ALBUM_VIEW` is module-global and `setArtistAlbumView`
  repaints **every** home shell, so the dark/light pair can't disagree.
  ⚠️ The rail's `scroll-snap-align: start` snaps to the scrollport edge and
  would scroll its own left padding away — `scroll-padding-left` matches it.
- The **Popular reviews** heading is emitted as the last block of
  `artistAlbumsHtml`, so it hides with the container when the page leaves the
  artist state (there's no artist-only markup in either home variant to
  maintain).
- ⚠️ **Light theme:** the album page keeps the album's dark procedural colour
  behind the review panel in *both* themes, so every `.s-home-v3--light
  .v3-rev-*` rule is light ink. The artist page forces the cream bg instead, so
  it needs its own `--light.--artist` block re-inking the panel dark — without
  it the whole lower half is invisible. **Any new `--light .v3-rev-*` rule needs
  an artist counterpart.**

---

## Variant System

Desktop viewer shows a screen's variants side by side (single view is a Dark+Light 2-up, centered — see the floating left nav note). The retired v1/v2 home mockups and the old standalone search/album/artist/review screens were **deleted** from `SCREENS`; the `init()` v3-filter is now a harmless no-op. `variantState` defaults to `{ home: 0 }` (Float·Dark).

---

## Mobile Prototype Modes

On mobile (`≤767px`) the page opens **straight into Live, full height, with no bar** (Eric, 2026-09-18): `initMobile` sets `body.mb-bare` (style.css hides `#mobile-bar`) and calls `setMobileView('live')`, which starts on Home (`currentIdx = 2`). **Page-to-page in Live is a crossfade** (2026-09-18; it was a horizontal slide, which read badly on a real phone): `navigate()` marks the old screen `.fade-exit` and the new one `.fade-enter` (absolute over it, opacity only, style.css), same forwards and back, cleared after `MOBILE_FADE_MS`. The album / review pages, sheets and bento swipe have their own transitions and don't go through it. Add **`?tools`** to the URL to get the old header back — Single / Multi / Flow / Live segmented control, the persona switcher and the fullscreen button — starting in Single as before.

---

## Key Design Decisions

- **The handle sits under the wordmark** — `.v3-header-brand` stacks `.v3-header-logo` + `.v3-header-handle`. It's filled by `populateHomeData`, **not interpolated into the markup**: two of the three headers live in static `html:` templates that are evaluated once at load, so an inline `${PROFILE.handle}` would freeze at page-load and never follow a persona switch. (Also: no backticks inside those templates, even in comments — they terminate the literal.)
- **The header bubbles are real entry points** — `appHeader()`'s bell → `navigate('notifications')` and gear → `navigate('settings')`. The bell used to just toggle its own unread dot. Note the header exists in **three** places: `appHeader()` plus an inline copy in each of the two home v3 variants — change all three together.
- **The trending wall keeps its margins** — `.wall2-scroll` is inset `12px` and the grid keeps its gutters, rounded tiles, shadows and hung-off rank badges (the generic `.wall2-grid`, shared with the artist page). An edge-to-edge flush mosaic (no side inset, `column-gap: 0`, square tiles, badge moved inside) was tried in `c4c77a5` and reverted — the artwork ran into the frame and read as one ugly slab. Don't reintroduce it.
- **No top nav bar on home** — search and profile icons live in the 46px search corner of the bento
- **The page is the phone's width, always** — `.v3-body` is `overflow-x: hidden` (`overflow-y: auto` alone makes x scrollable). ⚠️ A `position: relative; left: N` nudge on a full-width block still counts as scrollable overflow: `.v3-rev-score`'s 15.5px did exactly that and slid the whole album page sideways on a phone, so it is `width: fit-content` now. To find the next one: load the page at 393px and list elements whose `getBoundingClientRect().right` exceeds `documentElement.clientWidth`.
- **Bottom nav is pinned** — requires `height: 100%` on `.s-home-v3`, not just `flex: 1`
- **CD is absolutely positioned** — decoupled from row height so it can be any size without pushing the blue box taller
- **The rating gold follows the album** — `--star` resolves `var(--v3-star, var(--persona-accent, #e8a83c))`, so the vinyls and the review histogram re-tint on every album switch. ⚠️ **Nothing may set `--star` directly** — a persona doing so pinned the vinyls to one colour and stopped them tracking the album. **One sanctioned exception (2026-09-18): the home feed's cards.** `tintFeedRecords` sets `--star` inline on each `.v3-rev-card--feed` from its own cover (same `computeAlbumColors` + cache), so a card's discs match the record it's about rather than the bento's. It has to be `--star`, not `--v3-star`: `--star` resolves on `.s-home-v3` and inherits down as a plain colour.
- **Ratings read `--v3-star`, not `--v3-accent`.** A greyscale or black-dominant cover deliberately extracts to a neutral (the `darkFrac` branch hard-codes `#b9b9c1`) — correct for the bento box, dreadful for the vinyls, which just went grey. `computeAlbumColors` therefore also emits `star`: the accent unless its saturation is under 0.22, in which case the house gold. `accent` itself is untouched — the boxes still want the neutral.
- **`renderSingle()` alone is never enough.** It rebuilds the phones from their static templates, so every screen comes back with the placeholder cover baked into the markup and no data. Anything that rebuilds must follow with `paintAfterRender()` — which is why the resize handler calls `renderViewer()`, not `renderSingle()`.
- **Colour extraction needs CORS** — `computeAlbumColors` sets `img.crossOrigin = 'anonymous'` for absolute URLs. Without it, `getImageData` throws a tainted-canvas error on the personas' Deezer CDN covers, the `catch` swallows it, and every album silently falls back to the hard-coded flood colour.
- **Stars are never plain black when empty** — always `rgba` grey
- **Album art drives color** — don't hardcode accent on home screen
- **Fillet shadows**: dark theme cannot use `filter: drop-shadow` on fillets (GPU artifact); light theme CAN since it uses CSS gradient, not mask-image
- **Previews follow the album, not the DOM** — `playPreviewFor(album)` plays the album it's handed; never re-query `querySelector('.s-home-v3')` for "the current album" (multiple instances → wrong track). Intent (`PREVIEW.on/paused`) drives the UI, never `audio.paused`
- **Art vs text animation are separate** — `setMainAlbum`'s `animate` (cover/CD) is independent of `animateText` (typewriter); swipes animate text only, since the filmstrip already moves the art
- **Fullscreen** — the `.v3-blue` stats block (album/date · artist · stars) is nudged down 3px via `transform`. The compose UI is a `.v3-rev-cta` button → **Log Sheet** (see above) with three **quick-log squares** attached to its right (`.v3-rev-cta-row` › `.v3-rev-quick` › `.v3-rev-q` — listened · listen later · favourite), followed by the **Tracklist**. The streaming action grid (`.v3-rev-actions`) reserves a fixed **58px** column so the review box never shifts as icons change; fav/later/shop moved into the log sheet, leaving Spotify/Apple/YouTube.
- **Previews are OFF** — `PREVIEWS_ENABLED = false` in `app.js` no-ops `togglePreview`/`togglePreviewMode`/`loadPreview`/`playPreviewFor`. The one preview that still plays is the explicit **Listen to preview** row in a CD's menu (`playPreview`, which doesn't read the flag). Autoplay is deliberately gone — see the Music Preview System section.

---

## Deployment

GitHub Pages from `main` branch root:
```
git add app.css app.js screens.js style.css index.html data.js flowchart.html CLAUDE.md roadmap.js roadmap.css
git commit -m "description"
git push
```
When a change adds an asset (e.g. `images/profile-skin-01.png`), `git add` it too.
`flowchart.html` and `data.js` are easy to forget — a screen added to the page
map or the archive ships broken without them.

> **Shipped 2026-08-13 (commit `3b12ae5`):** Notifications + Settings
> (dark & light each), the header bell/gear wired to them, both added to
> `NAV_PAGES` and the page map. Then a styling pass: Notifications lost its page
> title and filter pills (the unread chip moved up beside "Mark all read"),
> Settings moved **Sign out** up under the account card (and "Show listening
> activity" up to head Connected services), and the trending wall's
> edge-to-edge mosaic was reverted to the inset grid. Then the **artist page**
> rework: flush-top full-bleed banner, no artist rating, histogram replaced by
> the albums row/grid toggle, a Popular-reviews heading, a legible light theme,
> and review cards with the upvote/comment moved to the card's top-right.
> Finally, across the album + artist pages: the friend-rec pill moved down to
> the reviews, the tracklist un-capped to every track, and the CTA centred.
> Then the **persona system**: `personas/` (CSVs) · `tools/build_personas.py` ·
> the generated `personas.js` · `applyPersona` + the toolbar/mobile switcher.
> Touches `screens.js · app.js · app.css · style.css · index.html ·
> flowchart.html · CLAUDE.md` and adds `personas/ · personas.js ·
> tools/build_personas.py · .gitignore`. Verified in-browser (all four personas
> swap catalogue + feed + profile; both variants), then committed and
> deployed.
> Plus the **dev box**, the album-tracking `--star`, the cross-origin colour
> fix, the bento quote retired, the handle under the wordmark, and the vinyl
> rendering rebuilt (see the three traps above).
> Assets bumped to `app.css?v=228 · screens.js?v=200 · app.js?v=200 ·
> style.css?v=145 · personas.js?v=3`.
>
> Open on the personas: (G)I-DLE, Leessang, J. Rawls and Jan Panenka find no
> usable Deezer match · the skins are a first pass (header wordmark/icons wash
> out on the light persona backgrounds) · `eric` is built from the old
> `NEWSPOTIFYARTISTS.png` capture and should be re-cut when the Top Songs
> screenshots arrive.

> **Last deploy (2026-07-21):** the left-nav relink + centered mockups, dark/light
> for auth/onboarding/song, the 8-step onboarding wizard, and the Funky profile
> (theme 01 + skin PNG) are live. Assets at `app.css?v=165 · screens.js?v=158 ·
> app.js?v=158 · style.css?v=141 · data.js?v=143`.
>
> Open threads: **Social (08) and Live Stream (09) are on the page map but have
> no screen** — the remaining gap · light-theme bento boxes are still `#999`
> placeholders · profile theme 02 (angular) not started · ~38 inline `★` glyphs still bypass the vinyl `halfStars` treatment.
