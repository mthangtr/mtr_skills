// Find openly licensed photographs on Wikimedia Commons and download candidates into the project.
//   node photo.mjs "<search words>" <out-dir> [count=6] [width=1920]
// Writes <out-dir>/<n>-<slug>.jpg plus <out-dir>/credits.json (title, author, licence, source page).
// Look at every candidate (Read tool), keep one, credit it on the page (small caption or footer line).
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [query, outDir, count = '6', width = '1920'] = process.argv.slice(2);
if (!query || !outDir) { console.error('usage: node photo.mjs "<search words>" <out-dir> [count] [width]'); process.exit(1); }
mkdirSync(outDir, { recursive: true });
const UA = { 'User-Agent': 'premium-saas-taste/1.0 (design skill; photo search)' };
const api = 'https://commons.wikimedia.org/w/api.php?' + new URLSearchParams({
  action: 'query', generator: 'search', gsrnamespace: '6', gsrsearch: `${query} filetype:bitmap`, gsrlimit: String(Math.max(+count * 3, 12)),
  prop: 'imageinfo', iiprop: 'url|extmetadata|size|mime', iiurlwidth: width, format: 'json',
});
const strip = s => (s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const res = await (await fetch(api, { headers: UA })).json();
const pages = Object.values(res.query?.pages || {}).sort((a, b) => a.index - b.index);
const credits = []; let n = 0;
for (const p of pages) {
  const i = p.imageinfo?.[0]; if (!i || !/jpeg|png/.test(i.mime)) continue;
  const lic = strip(i.extmetadata?.LicenseShortName?.value);
  if (!/^(CC0|CC BY|Public domain|PD)/i.test(lic)) continue;            // reusable licences only
  if (i.width < 1600 || i.width / i.height < 0.6) continue;              // big enough, not a tall sliver
  const slug = p.title.replace(/^File:/, '').replace(/\.[a-z]+$/i, '').replace(/[^a-z0-9]+/gi, '-').slice(0, 40).toLowerCase();
  const file = join(outDir, `${++n}-${slug}.jpg`);
  const img = await fetch(i.thumburl || i.url, { headers: UA });
  writeFileSync(file, Buffer.from(await img.arrayBuffer()));
  credits.push({ file, title: p.title.replace(/^File:/, ''), author: strip(i.extmetadata?.Artist?.value), licence: lic, source: i.descriptionurl, size: `${i.width}x${i.height}` });
  console.log(`${file}  ${lic}  ${i.width}x${i.height}`);
  if (n >= +count) break;
}
writeFileSync(join(outDir, 'credits.json'), JSON.stringify(credits, null, 2));
if (!n) console.log('no reusable results; try broader or more visual words (e.g. "dusk sky", "construction site aerial", "marble statue")');
