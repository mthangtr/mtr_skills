/* surface.js — procedural "signature surfaces" + palette extraction. No dependencies.
 *
 *   <canvas id="bg"></canvas>
 *   <script src="surface.js"></script>
 *   <script>
 *     Surface.render(document.getElementById('bg'), {
 *       source: 'sky',                      // sky | aurora | dunes | mesh | image
 *       colors: ['#1d3fd8', '#7fa6ff', '#ffffff'],
 *       treatment: 'halftone',              // none | dither | halftone | ascii | pixel
 *       cell: 6, grain: 0.06, seed: 7,
 *     }).then(s => Surface.applyPalette(s.palette));   // writes --surface-1..n, --surface-accent
 *   </script>
 *
 * Canvas is sized to its CSS box (devicePixelRatio aware) and re-renders on resize.
 */
(function (global) {
  'use strict';

  // ---------- math ----------
  function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
  function hex(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; }
  function toHex(c) { return '#' + c.map(v => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, '0')).join(''); }
  const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const lum = c => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const smooth = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); };

  function makeNoise(seed) {
    const r = rng(seed), p = new Uint8Array(512), g = [];
    for (let i = 0; i < 256; i++) { p[i] = i; const a = r() * Math.PI * 2; g.push([Math.cos(a), Math.sin(a)]); }
    for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
    for (let i = 0; i < 256; i++) p[i + 256] = p[i];
    const f = t => t * t * t * (t * (t * 6 - 15) + 10);
    function n2(x, y) {
      const X = Math.floor(x) & 255, Y = Math.floor(y) & 255; x -= Math.floor(x); y -= Math.floor(y);
      const d = (h, dx, dy) => { const v = g[p[h]]; return v[0] * dx + v[1] * dy; };
      const u = f(x), v = f(y);
      const a = d(X + p[Y], x, y), b = d(X + 1 + p[Y], x - 1, y), c = d(X + p[Y + 1], x, y - 1), e = d(X + 1 + p[Y + 1], x - 1, y - 1);
      return (a + u * (b - a)) + v * ((c + u * (e - c)) - (a + u * (b - a)));
    }
    return function fbm(x, y, oct = 5) { let s = 0, amp = 0.5, fr = 1; for (let i = 0; i < oct; i++) { s += amp * n2(x * fr, y * fr); fr *= 2; amp *= 0.5; } return s; };
  }

  // ---------- sources: (u,v in 0..1, aspect) -> [r,g,b] ----------
  const SOURCES = {
    // colors: [skyTop, horizon, cloud]
    sky(c, fbm, asp) {
      const top = c[0], hor = c[1] || c[0], cloud = c[2] || [1, 1, 1];
      return (u, v) => {
        let col = mix(top, hor, smooth(0, 1, v));
        const n = fbm(u * 2.2 * asp, v * 3.2 + 10, 6) * 0.5 + 0.5;
        const density = smooth(0.15, 1.0, v) * 0.55 + 0.25;           // clouds gather low
        const k = smooth(1 - density, 1 - density + 0.18, n);
        const shade = 0.82 + 0.18 * smooth(0.3, 0.9, fbm(u * 6 * asp, v * 6, 3) * 0.5 + 0.5);
        return mix(col, cloud.map(x => x * shade), k);
      };
    },
    // colors: [base, band1, band2, band3?]  — a soft diagonal light band on a dark/neutral base
    aurora(c, fbm, asp) {
      const base = c[0], bands = c.slice(1).length ? c.slice(1) : [[0.5, 0.4, 1]];
      return (u, v) => {
        const w = fbm(u * 1.5 * asp, v * 1.5, 4) * 0.35;
        const d = (u * 0.8 + (1 - v) * 0.6) - 0.85 + w;                 // distance to diagonal
        const k = Math.exp(-d * d * 18);
        const t = clamp(u + w);
        const i = t * (bands.length - 1), lo = Math.floor(i), hi = Math.min(bands.length - 1, lo + 1);
        return mix(base, mix(bands[lo], bands[hi], i - lo), k * 0.95);
      };
    },
    // colors: [sky, far ridge, ..., near ridge]
    dunes(c, fbm, asp) {
      const sky = c[0], ridges = c.slice(1);
      return (u, v) => {
        let col = mix(sky, mix(sky, ridges[0] || sky, 0.35), smooth(0, 0.6, v));
        for (let i = 0; i < ridges.length; i++) {
          const t = (i + 1) / (ridges.length + 1);
          const y = 0.35 + t * 0.5 + fbm(u * (1.2 + i * 0.6) * asp + i * 7, i * 3.1, 4) * 0.18;
          const edge = smooth(y - 0.004, y + 0.004, v);
          const light = 0.85 + 0.25 * smooth(-0.3, 0.3, fbm(u * 3 * asp + i, v * 8, 3));
          col = mix(col, ridges[i].map(x => x * light), edge);
        }
        return col;
      };
    },
    // colors: [paper, line, accentLine?] — topographic isolines (survey maps, terrain, sites, energy)
    contour(c, fbm, asp) {
      const paper = c[0], line = c[1] || [0, 0, 0], acc = c[2];
      const levels = 26;
      return (u, v) => {
        const n = fbm(u * 1.1 * asp, v * 1.1, 3) * 1.6 + 0.5;   // smooth terrain, wide range
        const f = n * levels, d = Math.abs(f - Math.round(f));
        const major = Math.round(f) % 5 === 0;
        const k = 1 - smooth(0.0, major ? 0.09 : 0.06, d);
        return mix(paper, (major && acc) ? acc : line, k * (major ? 1 : 0.7));
      };
    },
    // colors: [base, blob1, blob2, ...] — soft colour fields (use with grain or a treatment, never bare)
    mesh(c, fbm, asp, r) {
      const base = c[0], blobs = c.slice(1).map(col => ({ col, x: 0.15 + r() * 0.7, y: 0.15 + r() * 0.7, s: 0.18 + r() * 0.22 }));
      return (u, v) => {
        let col = base; const wu = u + fbm(u * 2, v * 2, 3) * 0.12, wv = v + fbm(u * 2 + 5, v * 2, 3) * 0.12;
        for (const b of blobs) { const dx = (wu - b.x) * asp, dy = wv - b.y; col = mix(col, b.col, Math.exp(-(dx * dx + dy * dy) / (b.s * b.s))); }
        return col;
      };
    },
  };

  // ---------- treatments ----------
  const BAYER8 = [0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21].map(v => v / 64 - 0.5);
  const GLYPHS = ' .`:-=+*%#@';

  function draw(ctx, W, H, field, o, colors) {
    const cell = Math.max(2, Math.round((o.cell || 6) * (o.dpr || 1)));
    const ramp = colors.slice().sort((a, b) => lum(a) - lum(b));
    const T = o.treatment || 'none';
    // auto-levels: stretch the field's luminance range (2nd–98th percentile) across the ramp, so dull photos print with full contrast
    const ls = []; for (let i = 0; i < 1600; i++) ls.push(lum(field((i % 40) / 40 + 0.0125, Math.floor(i / 40) / 40 + 0.0125)));
    ls.sort((a, b) => a - b); const lo = ls[32], hi = ls[1567], span = Math.max(0.05, hi - lo);
    const level = c => clamp((lum(c) - lo) / span);
    if (T === 'none' || T === 'dither') {
      const step = T === 'dither' ? Math.max(1, Math.round(cell / 3)) : 1;
      const w = Math.ceil(W / step), h = Math.ceil(H / step);
      const img = ctx.createImageData(w, h), d = img.data;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        let c = field(x / w, y / h);
        if (T === 'dither') {
          const t = clamp((lum(c) - lo) / span + BAYER8[(y & 7) * 8 + (x & 7)] * (o.spread || 0.35));
          c = ramp[Math.min(ramp.length - 1, Math.floor(t * ramp.length))];
        }
        const i = (y * w + x) * 4; d[i] = c[0] * 255; d[i + 1] = c[1] * 255; d[i + 2] = c[2] * 255; d[i + 3] = 255;
      }
      if (step === 1) ctx.putImageData(img, 0, 0);
      else { const off = document.createElement('canvas'); off.width = w; off.height = h; off.getContext('2d').putImageData(img, 0, 0); ctx.imageSmoothingEnabled = false; ctx.drawImage(off, 0, 0, W, H); }
      return;
    }
    // cell-based treatments
    const paper = o.paper ? hex(o.paper) : ramp[0], ink = o.ink ? hex(o.ink) : ramp[ramp.length - 1];
    ctx.fillStyle = toHex(paper); ctx.fillRect(0, 0, W, H);
    if (T === 'ascii') { ctx.font = `${Math.round(cell * 1.15)}px ui-monospace, "JetBrains Mono", Menlo, monospace`; ctx.textBaseline = 'top'; }
    for (let y = 0; y < H; y += cell) for (let x = 0; x < W; x += cell) {
      const c = field((x + cell / 2) / W, (y + cell / 2) / H);
      // levelled brightness; marks grow with distance from the paper (works light-on-dark and dark-on-light)
      const t = level(c), k = lum(paper) <= lum(ink) ? t : 1 - t;
      const rampCol = ramp[Math.min(ramp.length - 1, Math.floor(t * ramp.length))];
      if (T === 'halftone') {
        const r = (cell / 2) * Math.sqrt(k) * 1.05; if (r < 0.35) continue;
        ctx.fillStyle = o.keepColor ? toHex(c) : toHex(ink); ctx.beginPath(); ctx.arc(x + cell / 2, y + cell / 2, r, 0, 6.2832); ctx.fill();
      } else if (T === 'ascii') {
        const g = GLYPHS[Math.min(GLYPHS.length - 1, Math.floor(k * GLYPHS.length))]; if (g === ' ') continue;
        ctx.fillStyle = o.keepColor ? toHex(c) : toHex(ramp.length > 2 ? rampCol : ink); ctx.fillText(g, x, y);
      } else if (T === 'pixel') {
        ctx.fillStyle = toHex(c); ctx.fillRect(x, y, cell, cell);
      }
    }
  }

  function grain(ctx, W, H, amt, seed) {
    if (!amt) return; const r = rng(seed + 99), img = ctx.getImageData(0, 0, W, H), d = img.data;
    for (let i = 0; i < d.length; i += 4) { const n = (r() - 0.5) * 255 * amt * 2; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
    ctx.putImageData(img, 0, 0);
  }

  // ---------- palette (k-means on samples) ----------
  function palette(canvas, k = 5) {
    const ctx = canvas.getContext('2d'), W = canvas.width, H = canvas.height, d = ctx.getImageData(0, 0, W, H).data, pts = [];
    const r = rng(3); for (let i = 0; i < 3000; i++) { const p = (Math.floor(r() * W * H)) * 4; pts.push([d[p] / 255, d[p + 1] / 255, d[p + 2] / 255]); }
    let cs = pts.slice(0, k).map((_, i) => pts[Math.floor(i * pts.length / k)]);
    let lab = new Array(pts.length).fill(0);
    for (let it = 0; it < 10; it++) {
      lab = pts.map(p => { let b = 0, bd = 9; cs.forEach((c, j) => { const dd = (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 + (p[2] - c[2]) ** 2; if (dd < bd) { bd = dd; b = j; } }); return b; });
      cs = cs.map((c, j) => { const m = pts.filter((_, i) => lab[i] === j); return m.length ? [0, 1, 2].map(ch => m.reduce((s, p) => s + p[ch], 0) / m.length) : c; });
    }
    const out = cs.map((c, j) => ({ hex: toHex(c), share: lab.filter(l => l === j).length / pts.length, lum: lum(c), chroma: Math.max(...c) - Math.min(...c) }));
    out.sort((a, b) => b.share - a.share);
    // accent = most chromatic cluster that is neither a sliver nor near-black/near-white
    const pool = out.filter(c => c.share > 0.03 && c.lum > 0.12 && c.lum < 0.92);
    const accent = (pool.length ? pool : out).slice().sort((a, b) => b.chroma * Math.sqrt(b.share) - a.chroma * Math.sqrt(a.share))[0];
    return { colors: out, accent: accent && accent.hex, darkest: out.slice().sort((a, b) => a.lum - b.lum)[0].hex, lightest: out.slice().sort((a, b) => b.lum - a.lum)[0].hex };
  }

  function applyPalette(p, el = document.documentElement) {
    p.colors.forEach((c, i) => el.style.setProperty(`--surface-${i + 1}`, c.hex));
    if (p.accent) el.style.setProperty('--surface-accent', p.accent);
    el.style.setProperty('--surface-dark', p.darkest); el.style.setProperty('--surface-light', p.lightest);
  }

  // ---------- render ----------
  function loadImg(src) { return new Promise((res, rej) => { const i = new Image(); i.crossOrigin = 'anonymous'; i.onload = () => res(i); i.onerror = rej; i.src = src; }); }

  async function render(canvas, opts = {}) {
    const o = Object.assign({ source: 'sky', treatment: 'none', cell: 6, grain: 0, seed: 1, colors: ['#1d3fd8', '#8fb0ff', '#ffffff'] }, opts);
    const dpr = Math.min(2, global.devicePixelRatio || 1); o.dpr = dpr;
    const rect = canvas.getBoundingClientRect();
    const W = canvas.width = Math.max(2, Math.round(rect.width * dpr)), H = canvas.height = Math.max(2, Math.round(rect.height * dpr));
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const colors = o.colors.map(hex), asp = W / H, fbm = makeNoise(o.seed);
    let field;
    if (o.source === 'image') {
      const img = typeof o.image === 'string' ? await loadImg(o.image) : o.image;
      const off = document.createElement('canvas'); off.width = Math.min(W, 900); off.height = Math.round(off.width / asp);
      const oc = off.getContext('2d'); const s = Math.max(off.width / img.width, off.height / img.height);
      oc.drawImage(img, (off.width - img.width * s) / 2, (off.height - img.height * s) / 2, img.width * s, img.height * s);
      const px = oc.getImageData(0, 0, off.width, off.height).data;
      field = (u, v) => { const i = (Math.min(off.height - 1, Math.floor(v * off.height)) * off.width + Math.min(off.width - 1, Math.floor(u * off.width))) * 4; return [px[i] / 255, px[i + 1] / 255, px[i + 2] / 255]; };
    } else {
      field = SOURCES[o.source](colors, fbm, asp, rng(o.seed));
    }
    draw(ctx, W, H, field, o, colors);
    grain(ctx, W, H, o.grain, o.seed);
    const pal = palette(canvas, o.k || 5);
    if (!canvas.__surfaceBound) {
      canvas.__surfaceBound = true; let t;
      new ResizeObserver(() => { clearTimeout(t); t = setTimeout(() => render(canvas, opts), 200); }).observe(canvas);
    }
    canvas.dataset.surfaceReady = '1';
    return { palette: pal, canvas };
  }

  global.Surface = { render, palette, applyPalette, sources: Object.keys(SOURCES) };
})(window);
