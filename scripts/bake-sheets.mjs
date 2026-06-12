// Bake AI-generated 4x4 walk-cycle sheets (resources/sprite-sheets/*.png)
// into small game-ready sheets (assets/sprites/*.png).
//
// The sources are big RGB images with a baked-in transparency checkerboard
// and soft drop shadows. For each: key out the background (edge flood fill
// over checker/shadow greys), slice the 4x4 grid, trim each frame to its
// content, scale to a target height (nearest neighbor), and bottom-center
// every frame into a uniform CELL_W x CELL_H cell so feet stay planted.
//
// Usage: node scripts/bake-sheets.mjs   (needs the static server on :8741)
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';

const SHEETS = [
  { src: 'hiro', out: 'hiro', targetH: 40 },
  { src: 'sage', out: 'sage', targetH: 40 },
  { src: 'villager-red', out: 'villager-red', targetH: 38 },
  { src: 'villager-teal', out: 'villager-teal', targetH: 38 },
  { src: 'kid', out: 'kid', targetH: 32 },
  { src: 'suit-woman', out: 'suit-woman', targetH: 38 },
  { src: 'hoodie-boy', out: 'hoodie-boy', targetH: 38 },
  { src: 'doctor', out: 'doctor', targetH: 36 },
  { src: 'robot', out: 'robot', targetH: 34 },
  { src: 'mouse', out: 'mouse', targetH: 38 },
  // Single battle frames: [row, col] picks the best pose off a 4x4
  // expression sheet. Heights match the old ASCII sprites they replace.
  { src: 'phisherking', out: 'phisherking', targetH: 56, frame: [2, 2] },
  { src: 'lazarus', out: 'lazarus', targetH: 44, frame: [0, 0] },
  { src: 'vishimp', out: 'vishimp', targetH: 40, frame: [0, 0] },
  { src: 'pushbomber', out: 'pushbomber', targetH: 42, frame: [0, 0] },
  { src: 'keylogger', out: 'keylogger', targetH: 40, frame: [0, 0] },
  { src: 'simshift', out: 'simshift', targetH: 36, frame: [0, 0] },
  { src: 'stufferzombie', out: 'stufferzombie', targetH: 46, frame: [2, 2] },
  { src: 'scatteredspider', out: 'scatteredspider', targetH: 58, frame: [1, 1] },
  { src: 'stuffer', out: 'stuffer', targetH: 58, frame: [2, 2] },
  // Palette-swap castings: recolor saturated pixels in [hueMin,hueMax]
  // (degrees, wrapping) to hueTo, preserving shading. Quality of the
  // generated art carries over exactly.
  { src: 'villager-red', out: 'villager-green', targetH: 38, recolor: { hueMin: 330, hueMax: 16, satMin: 0.45, hueTo: 115 } },
  { src: 'villager-red', out: 'clerk-m', targetH: 38, recolor: { hueMin: 330, hueMax: 16, satMin: 0.45, hueTo: 175 } },
  { src: 'villager-teal', out: 'villager-pink', targetH: 38, recolor: { hueMin: 150, hueMax: 200, satMin: 0.25, hueTo: 320 } },
];
const CELL_W = 40, CELL_H = 44;

// Optional args: bake only the named outputs (node scripts/bake-sheets.mjs stuffer ...)
const only = process.argv.slice(2);
const selected = only.length ? SHEETS.filter((s) => only.includes(s.out)) : SHEETS;

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('http://localhost:8741/');

const results = await page.evaluate(async ({ sheets, CELL_W, CELL_H }) => {
  const out = {};
  for (const sheet of sheets) {
    const img = await new Promise((res, rej) => {
      const i = new Image();
      i.onload = () => res(i); i.onerror = rej;
      i.src = `resources/sprite-sheets/${sheet.src}.png`;
    });
    const W = img.width, H = img.height;
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const c = cv.getContext('2d');
    c.drawImage(img, 0, 0);
    const id = c.getImageData(0, 0, W, H);
    const d = id.data;

    // Background = anything reachable from the image edge through
    // light/low-saturation pixels (checker whites + soft shadow greys).
    const bg = (i) => {
      const r = d[i], g = d[i + 1], b = d[i + 2];
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
      return mx > 150 && (mx - mn) < 28;
    };
    const seen = new Uint8Array(W * H);
    const stack = [];
    for (let x = 0; x < W; x++) { stack.push(x, x + (H - 1) * W); }
    for (let y = 0; y < H; y++) { stack.push(y * W, y * W + W - 1); }
    while (stack.length) {
      const p = stack.pop();
      if (seen[p] || !bg(p * 4)) continue;
      seen[p] = 1;
      const x = p % W, y = (p / W) | 0;
      if (x > 0) stack.push(p - 1);
      if (x < W - 1) stack.push(p + 1);
      if (y > 0) stack.push(p - W);
      if (y < H - 1) stack.push(p + W);
    }
    for (let p = 0; p < W * H; p++) if (seen[p]) d[p * 4 + 3] = 0;

    // Optional hue-shift recolor (palette-swap castings).
    if (sheet.recolor) {
      const { hueMin, hueMax, satMin, hueTo } = sheet.recolor;
      const inRange = (h) => (hueMin <= hueMax ? h >= hueMin && h <= hueMax : h >= hueMin || h <= hueMax);
      for (let p = 0; p < W * H; p++) {
        if (!d[p * 4 + 3]) continue;
        const r = d[p * 4] / 255, g = d[p * 4 + 1] / 255, b = d[p * 4 + 2] / 255;
        const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, df = mx - mn;
        if (!df) continue;
        const s = df / (1 - Math.abs(2 * l - 1));
        let h;
        if (mx === r) h = 60 * (((g - b) / df) % 6);
        else if (mx === g) h = 60 * ((b - r) / df + 2);
        else h = 60 * ((r - g) / df + 4);
        if (h < 0) h += 360;
        if (s < satMin || !inRange(h)) continue;
        const C = (1 - Math.abs(2 * l - 1)) * s, X = C * (1 - Math.abs(((hueTo / 60) % 2) - 1)), m = l - C / 2;
        const seg = Math.floor(hueTo / 60) % 6;
        const [nr, ng, nb] = [[C, X, 0], [X, C, 0], [0, C, X], [0, X, C], [X, 0, C], [C, 0, X]][seg];
        d[p * 4] = Math.round((nr + m) * 255);
        d[p * 4 + 1] = Math.round((ng + m) * 255);
        d[p * 4 + 2] = Math.round((nb + m) * 255);
      }
    }
    c.putImageData(id, 0, 0);

    // Slice 4x4, trim, scale, compose. `frame: [row,col]` bakes a single
    // standalone frame at natural width instead of a uniform-cell sheet.
    const single = sheet.frame || null;
    const outCv = document.createElement('canvas');
    if (!single) { outCv.width = CELL_W * 4; outCv.height = CELL_H * 4; }
    const oc = outCv.getContext('2d');
    oc.imageSmoothingEnabled = false;
    const cw = W / 4, ch = H / 4;
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (single && (row !== single[0] || col !== single[1])) continue;
        const sx = Math.round(col * cw), sy = Math.round(row * ch);
        const CW = Math.floor(cw), CH = Math.floor(ch);
        const cid = c.getImageData(sx, sy, CW, CH);
        // Keep only the largest connected blob — drops leaked shadow
        // fragments and specks from neighboring cells.
        const label = new Int32Array(CW * CH).fill(-1);
        const blobs = [];
        let best = -1, bestSize = 0, nLabels = 0;
        for (let p0 = 0; p0 < CW * CH; p0++) {
          if (label[p0] >= 0 || cid.data[p0 * 4 + 3] <= 60) continue;
          const q = [p0]; label[p0] = nLabels;
          let size = 0, colorSum = 0, bx0 = CW, bx1 = -1, by0 = CH, by1 = -1;
          while (q.length) {
            const p = q.pop(); size++;
            const x = p % CW, y = (p / CW) | 0;
            colorSum += Math.max(cid.data[p * 4], cid.data[p * 4 + 1], cid.data[p * 4 + 2])
              - Math.min(cid.data[p * 4], cid.data[p * 4 + 1], cid.data[p * 4 + 2]);
            if (x < bx0) bx0 = x; if (x > bx1) bx1 = x;
            if (y < by0) by0 = y; if (y > by1) by1 = y;
            for (const n of [x > 0 && p - 1, x < CW - 1 && p + 1, y > 0 && p - CW, y < CH - 1 && p + CW]) {
              if (n !== false && label[n] < 0 && cid.data[n * 4 + 3] > 60) { label[n] = nLabels; q.push(n); }
            }
          }
          blobs.push({ size, colorSum, bx0, bx1, by0, by1 });
          if (size > bestSize) { bestSize = size; best = nLabels; }
          nLabels++;
        }
        if (best < 0) continue;
        const keep = new Uint8Array(nLabels);
        keep[best] = 1;
        // Single frames also keep detached saturated blobs (floating
        // notification badges, aura wisps) that sit fully inside the cell.
        // Grey shadow remnants and edge leaks from neighbor cells still drop.
        if (single) {
          blobs.forEach((b, i) => {
            if (i === best || b.size < 15 || b.colorSum / b.size < 30) return;
            if (b.bx0 < 2 || b.by0 < 2 || b.bx1 > CW - 3 || b.by1 > CH - 3) return;
            keep[i] = 1;
          });
        }
        // Mask to the kept blobs (1px dilated for anti-aliased fringe).
        const masked = new ImageData(CW, CH);
        let x0 = CW, x1 = -1, y0 = CH, y1 = -1;
        const on = (p) => label[p] >= 0 && keep[label[p]];
        for (let p = 0; p < CW * CH; p++) {
          const x = p % CW, y = (p / CW) | 0;
          const hit = on(p)
            || (x > 0 && on(p - 1)) || (x < CW - 1 && on(p + 1))
            || (y > 0 && on(p - CW)) || (y < CH - 1 && on(p + CW));
          if (!hit) continue;
          for (let k = 0; k < 4; k++) masked.data[p * 4 + k] = cid.data[p * 4 + k];
          if (x < x0) x0 = x; if (x > x1) x1 = x;
          if (y < y0) y0 = y; if (y > y1) y1 = y;
        }
        const mcv = document.createElement('canvas');
        mcv.width = CW; mcv.height = CH;
        mcv.getContext('2d').putImageData(masked, 0, 0);
        const bw = x1 - x0 + 1, bh = y1 - y0 + 1;
        const scale = sheet.targetH / bh;
        const dw = Math.max(1, Math.round(bw * scale)), dh = sheet.targetH;
        if (single) {
          outCv.width = dw; outCv.height = dh;
          const sc = outCv.getContext('2d');
          sc.imageSmoothingEnabled = false;
          sc.drawImage(mcv, x0, y0, bw, bh, 0, 0, dw, dh);
          continue;
        }
        const dx = col * CELL_W + Math.round((CELL_W - dw) / 2);
        const dy = row * CELL_H + (CELL_H - dh) - 2; // feet 2px above cell bottom
        oc.drawImage(mcv, x0, y0, bw, bh, dx, dy, dw, dh);
      }
    }
    out[sheet.out] = outCv.toDataURL('image/png');
  }
  return out;
}, { sheets: selected, CELL_W, CELL_H });

mkdirSync('assets/sprites', { recursive: true });
for (const [name, url] of Object.entries(results)) {
  writeFileSync(`assets/sprites/${name}.png`, Buffer.from(url.split(',')[1], 'base64'));
  console.log(`baked assets/sprites/${name}.png`);
}
await browser.close();
