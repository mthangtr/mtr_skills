// Render an HTML file (or URL) the way the rubric judges it, using only Chrome + Node 22+ (built-in WebSocket).
//   node shot.mjs <file.html|url> <out-prefix>
//   -> <prefix>-hero.png    1440x900 first viewport
//      <prefix>-full.png    1440 wide, true document height (capped at 6000px)
//      <prefix>-mobile.png  390 wide mobile emulation, true height (capped at 16000px)
// Env: CHROME=/path/to/chrome to override the browser.
import { spawn } from 'node:child_process';
import { existsSync, writeFileSync, mkdtempSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { mkdirSync } from 'node:fs';

const [input, prefix] = process.argv.slice(2);
if (!input || !prefix) { console.error('usage: node shot.mjs <file.html|url> <out-prefix>'); process.exit(1); }
const url = /^https?:|^file:/.test(input) ? input : 'file://' + resolve(input);
const candidates = [process.env.CHROME, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium', '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].filter(Boolean);
const chrome = candidates.find(p => existsSync(p));
if (!chrome) { console.error('Chrome not found; set CHROME=/path/to/chrome'); process.exit(1); }
mkdirSync(dirname(resolve(prefix)), { recursive: true });

const port = 9300 + Math.floor(Math.random() * 500);
const proc = spawn(chrome, ['--headless=new', `--remote-debugging-port=${port}`, '--hide-scrollbars', '--disable-gpu', '--allow-file-access-from-files',
  `--user-data-dir=${mkdtempSync(tmpdir() + '/shot-')}`, 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));

let ws, id = 0; const pending = new Map();
async function connect() {
  for (let i = 0; i < 50; i++) {
    try { const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json(); const page = list.find(t => t.type === 'page'); if (page) return page.webSocketDebuggerUrl; } catch {}
    await sleep(200);
  }
  throw new Error('could not connect to Chrome');
}
const send = (method, params = {}) => new Promise((res, rej) => { const m = ++id; pending.set(m, { res, rej }); ws.send(JSON.stringify({ id: m, method, params })); });

async function capture(width, height, mobile, out, full) {
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile });
  await send('Page.navigate', { url });
  await sleep(2500); // fonts, canvas surfaces, entrance motion
  // scroll through once so lazy/scroll-reveal content gets its chance, then return to top
  await send('Runtime.evaluate', { expression: 'new Promise(r=>{let y=0;const s=()=>{window.scrollTo(0,y+=innerHeight*0.8);if(y<document.documentElement.scrollHeight)setTimeout(s,120);else{window.scrollTo(0,0);setTimeout(r,600)}};s()})', awaitPromise: true });
  let h = height;
  if (full) {
    const r = await send('Runtime.evaluate', { expression: 'Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)', returnByValue: true });
    h = Math.min(16000, r.result.value);
    await send('Emulation.setDeviceMetricsOverride', { width, height: h, deviceScaleFactor: 1, mobile });
    await sleep(800);
  }
  const overflow = await send('Runtime.evaluate', { expression: 'document.documentElement.scrollWidth - innerWidth', returnByValue: true });
  const shot = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width, height: h, scale: 1 }, captureBeyondViewport: true });
  writeFileSync(out, Buffer.from(shot.data, 'base64'));
  const ov = overflow.result.value;
  console.log(`${out}  ${width}x${h}${ov > 0 ? `  !! horizontal overflow ${ov}px` : ''}`);
  // full-resolution tiles one viewport tall, so details are readable when viewed (downscaled whole-page images hide craft defects)
  if (full && h > height) {
    for (let y = 0, i = 1; y < h; y += height, i++) {
      const t = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y, width, height: Math.min(height, h - y), scale: 1 }, captureBeyondViewport: true });
      writeFileSync(out.replace(/\.png$/, `-${i}.png`), Buffer.from(t.data, 'base64'));
    }
    console.log(`   tiles: ${out.replace(/\.png$/, '-1..' + Math.ceil(h / height) + '.png')}`);
  }
  if (full) {
    const r = await send('Runtime.evaluate', { expression: `(${AUDIT})()`, returnByValue: true });
    const all = r.result.value || [], metrics = all.filter(s => s.startsWith('METRIC')), items = all.filter(s => !s.startsWith('METRIC'));
    console.log(`   craft audit @${width}: ${items.length ? items.length + ' issue(s)' : 'clean'}`);
    items.slice(0, 40).forEach(s => console.log('   - ' + s));
    if (items.length > 40) console.log(`   … ${items.length - 40} more`);
    metrics.forEach(s => console.log('   ' + s.replace('METRIC ', '· ')));
  }
}

// Deterministic craft checks run inside the page. Each finding names the element and its text.
const AUDIT = function () {
  const out = [], W = innerWidth;
  const label = el => { const t = (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' '); return `<${el.tagName.toLowerCase()}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/)[0] : ''}> "${t.slice(0, 40)}${t.length > 40 ? '…' : ''}"`; };
  // effectively visible: no hidden/transparent ancestor, not aria-hidden, and not clipped away by an overflow container
  const visible = el => {
    const r = el.getBoundingClientRect(); if (!(r.width > 2 && r.height > 2)) return false; // also drops 1px screen-reader-only text
    if (el.closest('[aria-hidden="true"],[hidden],[inert]')) return false;
    const d = el.closest('details:not([open])'); if (d && !el.closest('summary')) return false; // collapsed accordion content
    let op = 1;
    for (let e = el; e && e !== document.documentElement; e = e.parentElement) {
      const s = getComputedStyle(e);
      if (s.display === 'none' || s.visibility === 'hidden' || s.contentVisibility === 'hidden') return false;
      op *= +s.opacity; if (op < 0.05) return false;
      if (e !== el && /(hidden|clip|auto|scroll)/.test(s.overflowX + s.overflowY + s.overflow)) {
        const c = e.getBoundingClientRect();
        if (r.right <= c.left + 1 || r.left >= c.right - 1 || r.bottom <= c.top + 1 || r.top >= c.bottom - 1) return false; // fully clipped away
      }
    }
    return true;
  };
  // inside a horizontally scrolling/clipping container, "off-screen" is intended (carousel, marquee, scroll table)
  const inScroller = el => { for (let e = el.parentElement; e; e = e.parentElement) { const s = getComputedStyle(e); if (/(auto|scroll|hidden|clip)/.test(s.overflowX)) return true; } return false; };
  // text-bearing leaves: elements with a direct non-empty text node
  const texts = [...document.body.querySelectorAll('*')].filter(el => !['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(el.tagName) && [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && visible(el));
  const parseRGB = c => { const m = c.match(/[\d.]+/g); return m ? m.map(Number) : null; };
  const L = ([r, g, b]) => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  // contrast can't be computed from CSS when a canvas, image or video sits behind the text: skip (judge those by eye on the screenshot)
  const overMedia = el => { const r = el.getBoundingClientRect(); const x = r.left + r.width / 2, y = r.top + r.height / 2;
    if (y < 0 || y > innerHeight) { scrollTo(0, scrollY + y - innerHeight / 2); }
    const rr = el.getBoundingClientRect(); return document.elementsFromPoint(rr.left + rr.width / 2, rr.top + rr.height / 2).some(e => /^(CANVAS|IMG|VIDEO|PICTURE)$/.test(e.tagName) && !el.contains(e)); };
  const bgOf = el => { if (overMedia(el)) return null; for (let e = el; e; e = e.parentElement) { const s = getComputedStyle(e); if (s.backgroundImage !== 'none') return null; const c = parseRGB(s.backgroundColor); if (c && (c[3] === undefined || c[3] > 0.9)) return c; } return [255, 255, 255]; };
  for (const el of texts) {
    const s = getComputedStyle(el), fs = parseFloat(s.fontSize), r = el.getBoundingClientRect();
    if (fs < 11) out.push(`tiny text ${fs}px: ${label(el)}`);
    if ((r.right > W + 1 || r.left < -1) && !inScroller(el)) out.push(`off-screen horizontally (${Math.round(r.left)}→${Math.round(r.right)} of ${W}): ${label(el)}`);
    if ((s.overflow.includes('hidden') || s.textOverflow === 'ellipsis') && el.scrollWidth > el.clientWidth + 1) out.push(`clipped text: ${label(el)}`);
    // contrast against the nearest solid background (skipped when a canvas/image/gradient is behind it)
    const fg = parseRGB(s.color), bg = bgOf(el);
    if (fg && bg) { const a = L(fg.slice(0, 3)), b = L(bg.slice(0, 3)), cr = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05); const need = fs >= 24 || (fs >= 18.5 && +s.fontWeight >= 700) ? 3 : 4.5; const alpha = fg[3] === undefined ? 1 : fg[3]; if (alpha > 0.99 && cr < need) out.push(`low contrast ${cr.toFixed(2)}:1 (needs ${need}): ${label(el)}`); }
    // orphan: a heading-sized element whose last line holds a single word
    if (fs >= 20) {
      const node = [...el.childNodes].find(n => n.nodeType === 3 && n.textContent.trim().split(/\s+/).length > 2);
      if (node) {
        const words = []; const re = /\S+/g; let m; const rg = document.createRange();
        while ((m = re.exec(node.textContent))) { rg.setStart(node, m.index); rg.setEnd(node, m.index + m[0].length); const rr = rg.getClientRects()[0]; if (rr) words.push(Math.round(rr.top)); }
        const last = Math.max(...words); if (words.filter(t => Math.abs(t - last) < 4).length === 1 && new Set(words).size > 1) out.push(`orphan word on last line: ${label(el)}`);
      }
    }
  }
  // text colliding with other text (not nested)
  const rects = texts.map(el => [el, el.getBoundingClientRect()]);
  for (let i = 0; i < rects.length; i++) for (let j = i + 1; j < rects.length; j++) {
    const [a, ra] = rects[i], [b, rb] = rects[j];
    if (a.contains(b) || b.contains(a)) continue;
    const ox = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left), oy = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
    if (ox > 4 && oy > 4) out.push(`text overlaps text: ${label(a)} × ${label(b)}`);
  }
  // operate metrics (rubric O2/O4/O9/U12): measured, so they are not left to judgement
  const sizes = new Map(); for (const el of texts) { const fs = Math.round(parseFloat(getComputedStyle(el).fontSize)); sizes.set(fs, (sizes.get(fs) || 0) + 1); }
  const sig = [...sizes.keys()].sort((a, b) => b - a);
  const ctrls = [...document.querySelectorAll('button, a[role="button"], [class*="btn"], input:not([type="hidden"]), select')].filter(visible);
  const heights = [...new Set(ctrls.filter(e => e.tagName === 'BUTTON' || /btn/.test(e.className)).map(e => Math.round(e.getBoundingClientRect().height)))].sort((a, b) => a - b);
  const tapSmall = W <= 480 ? ctrls.concat([...document.querySelectorAll('a')].filter(visible)).filter(e => { const r = e.getBoundingClientRect(); if (!(r.height < 44 && r.width < 200 && r.top < innerHeight)) return false; const cx = r.left + r.width/2, cy = r.top + r.height/2; const hit = y => { const h = document.elementFromPoint(cx, y); return h && (h === e || e.contains(h)); }; return !(hit(cy - 21) && hit(cy + 21)); }).length : 0;
  out.push(`METRIC type sizes in use: ${sig.length} [${sig.join(', ')}] · largest ${sig[0] || 0}px`);
  out.push(`METRIC button heights: ${heights.length} distinct [${heights.join(', ')}]`);
  if (W <= 480) out.push(`METRIC tap targets under 44px tall at ${W}: ${tapSmall}`);
  if (W > 480) { // O11: table rows under 36px, and time/number cells that are left-aligned
    const rows = [...document.querySelectorAll('tbody tr, [role="row"]')].filter(visible);
    const shortRows = rows.filter(r => r.getBoundingClientRect().height < 35.5).length;
    const numLeft = [...document.querySelectorAll('td, [role="cell"]')].filter(visible).filter(c => /^[\s$€£−+-]*[\d][\d:.,%\s]*(min|h|am|pm)?\s*$/i.test(c.textContent) && getComputedStyle(c).textAlign !== 'right' && getComputedStyle(c).textAlign !== 'end').length;
    if (rows.length) out.push(`METRIC table rows under 36px: ${shortRows}/${rows.length} · numeric cells not right-aligned: ${numLeft}`);
  }
  return [...new Set(out)];
}.toString();

try {
  ws = new WebSocket(await connect());
  await new Promise(r => ws.addEventListener('open', r));
  ws.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); } });
  await send('Page.enable'); await send('Runtime.enable');
  await capture(1440, 900, false, `${prefix}-hero.png`, false);
  await capture(1440, 900, false, `${prefix}-full.png`, true);
  await capture(390, 844, true, `${prefix}-mobile-first.png`, false); // true first screen: shows fixed/sticky UI where a user sees it
  await capture(390, 844, true, `${prefix}-mobile.png`, true);
} catch (e) { console.error(e.message); process.exitCode = 1; }
finally { ws?.close(); proc.kill(); }
