// Diversity check across several pages: did the agent default to the same font and colour every time?
//   node diversity.mjs page1.html page2.html [...]
// For each page it measures, in Chrome, the display font (largest text), the body font, the ground
// (light or dark) and the dominant hues (area-weighted backgrounds plus canvas/img pixels). It then
// flags pairs that share the display font AND the main hue. Needs Chrome and Node 22+.
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { resolve, basename, dirname } from 'node:path';
import { tmpdir } from 'node:os';

const files = process.argv.slice(2);
if (files.length < 2) { console.error('usage: node diversity.mjs <page.html> <page.html> [...]'); process.exit(1); }
const chrome = [process.env.CHROME, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].filter(Boolean).find(p => existsSync(p));
if (!chrome) { console.error('Chrome not found; set CHROME'); process.exit(1); }
const port = 9800 + Math.floor(Math.random() * 150);
const proc = spawn(chrome, ['--headless=new', `--remote-debugging-port=${port}`, '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--allow-file-access-from-files', `--user-data-dir=${mkdtempSync(tmpdir() + '/div-')}`, 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let ws, id = 0; const pending = new Map();
const send = (method, params = {}) => new Promise((res, rej) => { const m = ++id; pending.set(m, { res, rej }); ws.send(JSON.stringify({ id: m, method, params })); });

const MEASURE = `(() => {
  const W = innerWidth, H = Math.min(document.documentElement.scrollHeight, 4000);
  const fam = el => getComputedStyle(el).fontFamily.split(',')[0].replace(/["']/g,'').trim();
  // display font = family of the largest visible text
  let big = null, bigSize = 0;
  for (const el of document.querySelectorAll('h1,h2,h3,p,span,div,a')) {
    if (![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 2)) continue;
    const s = parseFloat(getComputedStyle(el).fontSize), r = el.getBoundingClientRect();
    if (r.width && r.height && r.top < 1200 && s > bigSize) { bigSize = s; big = el; }
  }
  const body = document.querySelector('p') || document.body;
  // colour mass: area-weighted backgrounds + sampled canvas/img pixels
  const bins = new Array(12).fill(0); let light = 0, dark = 0;
  const add = (r, g, b, w) => {
    const mx = Math.max(r, g, b) / 255, mn = Math.min(r, g, b) / 255, l = (mx + mn) / 2;
    if (l > 0.5) light += w; else dark += w;
    const c = mx - mn; if (c < 0.12) return;
    let h; const R = r / 255, G = g / 255, B = b / 255;
    if (mx === R) h = ((G - B) / c) % 6; else if (mx === G) h = (B - R) / c + 2; else h = (R - G) / c + 4;
    bins[Math.floor(((h * 60 + 360) % 360) / 30)] += w * c;
  };
  for (const el of document.querySelectorAll('body, body *')) {
    const r = el.getBoundingClientRect(); if (!r.width || !r.height || r.top > H) continue;
    const a = Math.min(r.width, W) * Math.min(r.height, H) / (W * H);
    const m = getComputedStyle(el).backgroundColor.match(/[\\d.]+/g);
    if (m && (m[3] === undefined || +m[3] > 0.5)) add(+m[0], +m[1], +m[2], a * 0.3);
    if (el.tagName === 'CANVAS' || el.tagName === 'IMG') {
      try { const c = document.createElement('canvas'); c.width = 40; c.height = 40; const x = c.getContext('2d'); x.drawImage(el, 0, 0, 40, 40);
        const d = x.getImageData(0, 0, 40, 40).data; for (let i = 0; i < d.length; i += 4) add(d[i], d[i+1], d[i+2], a / 1600); } catch (e) {}
    }
  }
  const names = ['red','orange','yellow','lime','green','teal','cyan','azure','blue','violet','magenta','rose'];
  const top = bins.map((v, i) => [names[i], v]).filter(x => x[1] > 0).sort((a, b) => b[1] - a[1]).slice(0, 3).map(x => x[0]);
  return { display: big ? fam(big) : '?', displaySize: bigSize, displayWeight: big ? getComputedStyle(big).fontWeight : '?', body: fam(body), ground: light >= dark ? 'light' : 'dark', hues: top };
})()`;

try {
  for (let i = 0; i < 50; i++) { try { const l = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); const p = l.find(t => t.type === 'page'); if (p) { ws = new WebSocket(p.webSocketDebuggerUrl); break; } } catch {} await sleep(200); }
  await new Promise(r => ws.addEventListener('open', r));
  ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); } });
  await send('Page.enable'); await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  const rows = [];
  for (const f of files) {
    await send('Page.navigate', { url: 'file://' + resolve(f) }); await sleep(3000);
    const r = await send('Runtime.evaluate', { expression: MEASURE, returnByValue: true });
    const v = r.result.value; v.name = basename(dirname(resolve(f))) + '/' + basename(f); rows.push(v);
    const src = readFileSync(resolve(f), 'utf8'); v.texture = (src.match(/treatment\s*:\s*['"](dither|halftone|ascii|pixel)['"]/) || [])[1] || (/source\s*:\s*['"](horizon|ribbon|curtain|slats|sky|aurora)['"]/.test(src) ? 'light' : '-');
    console.log(`${v.name.padEnd(28)} display: ${v.display} ${v.displayWeight} @${Math.round(v.displaySize)}px | body: ${v.body} | ${v.ground} | hues: ${v.hues.join(', ') || 'neutral'} | surface: ${v.texture}`);
  }
  let clashes = 0;
  for (let i = 0; i < rows.length; i++) for (let j = i + 1; j < rows.length; j++) {
    const a = rows[i], b = rows[j];
    if (a.display === b.display && (a.hues[0] || 'neutral') === (b.hues[0] || 'neutral')) { clashes++; console.log(`!! same display font (${a.display}) and main hue (${a.hues[0] || 'neutral'}): ${a.name} ~ ${b.name}`); }
  }
  const fonts = new Set(rows.map(r => r.display)).size, hues = new Set(rows.map(r => r.hues[0] || 'neutral')).size;
  const stylised = rows.filter(r => ['dither','halftone','ascii','pixel'].includes(r.texture)).length;
  if (stylised * 2 > rows.length) console.log(`!! ${stylised}/${rows.length} pages use a stylised treatment (dither/halftone/ascii/pixel): premium sites almost never do; switch some to light, photo or a flat ground`);
  console.log(`\ndistinct display fonts: ${fonts}/${rows.length} · distinct main hues: ${hues}/${rows.length} · clashing pairs: ${clashes}`);
} catch (e) { console.error(e.message); process.exitCode = 1; }
finally { ws?.close(); proc.kill(); }
