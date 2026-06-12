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
];
const CELL_W = 40, CELL_H = 44;

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
    c.putImageData(id, 0, 0);

    // Slice 4x4, trim, scale, compose.
    const outCv = document.createElement('canvas');
    outCv.width = CELL_W * 4; outCv.height = CELL_H * 4;
    const oc = outCv.getContext('2d');
    oc.imageSmoothingEnabled = false;
    const cw = W / 4, ch = H / 4;
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const sx = Math.round(col * cw), sy = Math.round(row * ch);
        const CW = Math.floor(cw), CH = Math.floor(ch);
        const cid = c.getImageData(sx, sy, CW, CH);
        // Keep only the largest connected blob — drops leaked shadow
        // fragments and specks from neighboring cells.
        const label = new Int32Array(CW * CH).fill(-1);
        let best = -1, bestSize = 0, nLabels = 0;
        for (let p0 = 0; p0 < CW * CH; p0++) {
          if (label[p0] >= 0 || cid.data[p0 * 4 + 3] <= 60) continue;
          const q = [p0]; label[p0] = nLabels;
          let size = 0;
          while (q.length) {
            const p = q.pop(); size++;
            const x = p % CW, y = (p / CW) | 0;
            for (const n of [x > 0 && p - 1, x < CW - 1 && p + 1, y > 0 && p - CW, y < CH - 1 && p + CW]) {
              if (n !== false && label[n] < 0 && cid.data[n * 4 + 3] > 60) { label[n] = nLabels; q.push(n); }
            }
          }
          if (size > bestSize) { bestSize = size; best = nLabels; }
          nLabels++;
        }
        if (best < 0) continue;
        // Mask to the winning blob (1px dilated for anti-aliased fringe).
        const masked = new ImageData(CW, CH);
        let x0 = CW, x1 = -1, y0 = CH, y1 = -1;
        for (let p = 0; p < CW * CH; p++) {
          const x = p % CW, y = (p / CW) | 0;
          const hit = label[p] === best
            || (x > 0 && label[p - 1] === best) || (x < CW - 1 && label[p + 1] === best)
            || (y > 0 && label[p - CW] === best) || (y < CH - 1 && label[p + CW] === best);
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
        const dx = col * CELL_W + Math.round((CELL_W - dw) / 2);
        const dy = row * CELL_H + (CELL_H - dh) - 2; // feet 2px above cell bottom
        oc.drawImage(mcv, x0, y0, bw, bh, dx, dy, dw, dh);
      }
    }
    out[sheet.out] = outCv.toDataURL('image/png');
  }
  return out;
}, { sheets: SHEETS, CELL_W, CELL_H });

mkdirSync('assets/sprites', { recursive: true });
for (const [name, url] of Object.entries(results)) {
  writeFileSync(`assets/sprites/${name}.png`, Buffer.from(url.split(',')[1], 'base64'));
  console.log(`baked assets/sprites/${name}.png`);
}
await browser.close();
