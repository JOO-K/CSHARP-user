/* tools/quote_songs.js — step 1 of the Comments page's karaoke lyrics.

   Lists the songs the Comments feed deals (quotes.js: the shelf's most reviewed
   albums, each one's top Deezer song) by opening the app headless and asking
   window.sdQuoteSongList. The shelf includes Deezer recommendations, which are
   re-dealt at random on every load, so it takes a few loads and keeps the
   union. Merges into tools/quote-songs.json (never drops a song already there).

     node tools/quote_songs.js [url] [loads] [albumsPerLoad]
     defaults: http://localhost:5500/index.html  3  60

   Needs the site served (VS Code Live Server, or `python -m http.server 5500`
   in the csharpuser folder) and puppeteer-core (~/node_modules) + Chrome.
   Step 2 is tools/quote_lyrics.py. */
const fs = require('fs');
const path = require('path');
const pup = require(require.resolve('puppeteer-core', { paths: [process.cwd(), path.join(require('os').homedir(), 'node_modules')] }));

const URL = process.argv[2] || 'http://localhost:5500/index.html';
const LOADS = +process.argv[3] || 3;
const PER = +process.argv[4] || 60;
const OUT = path.join(__dirname, 'quote-songs.json');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

(async () => {
  let have = [];
  try { have = JSON.parse(fs.readFileSync(OUT, 'utf8')); } catch (e) {}
  const byId = new Map(have.map(s => [s.id, s]));
  const b = await pup.launch({ executablePath: CHROME, headless: 'new' });
  for (let n = 0; n < LOADS; n++) {
    const p = await b.newPage();
    await p.goto(URL + (URL.includes('?') ? '&' : '?') + 'screen=wall&norec', { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(r => setTimeout(r, 6000));             // let the Deezer rec deal land
    const list = await p.evaluate(k => window.sdQuoteSongList ? window.sdQuoteSongList(k) : [], PER);
    let added = 0;
    list.forEach(s => { if (!byId.has(s.id)) { byId.set(s.id, s); added++; } });
    console.log(`load ${n + 1}: ${list.length} songs, ${added} new`);
    await p.close();
  }
  await b.close();
  fs.writeFileSync(OUT, JSON.stringify([...byId.values()], null, 1));
  console.log(`${byId.size} songs in ${path.relative(process.cwd(), OUT)}`);
})();
