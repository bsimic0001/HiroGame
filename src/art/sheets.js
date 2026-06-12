// Baked walk-cycle sheets (assets/sprites/*.png, produced by
// scripts/bake-sheets.mjs): 4x4 grids, rows are down/left/right/up,
// 40x44 cells with feet anchored near the cell bottom.
// Top-level await: dependent modules wait until the art is sliced.
// Only drawImage is used (no pixel reads), so this works from file:// too.
export const CELL_W = 40, CELL_H = 44;

function load(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`failed to load ${src}`));
    img.src = src;
  });
}

function slice(img) {
  const actor = {};
  ['down', 'left', 'right', 'up'].forEach((dir, row) => {
    actor[dir] = [];
    for (let col = 0; col < 4; col++) {
      const cv = document.createElement('canvas');
      cv.width = CELL_W; cv.height = CELL_H;
      const c = cv.getContext('2d');
      c.imageSmoothingEnabled = false;
      c.drawImage(img, col * CELL_W, row * CELL_H, CELL_W, CELL_H, 0, 0, CELL_W, CELL_H);
      actor[dir].push(cv);
    }
  });
  return actor;
}

// Nearest-neighbor upscale without pixel reads.
export function scaleSheetFrame(frame, factor) {
  const cv = document.createElement('canvas');
  cv.width = Math.round(frame.width * factor);
  cv.height = Math.round(frame.height * factor);
  const c = cv.getContext('2d');
  c.imageSmoothingEnabled = false;
  c.drawImage(frame, 0, 0, cv.width, cv.height);
  return cv;
}

const NAMES = ['hiro', 'sage', 'villager-red', 'villager-teal', 'kid'];
const images = await Promise.all(NAMES.map((n) => load(`assets/sprites/${n}.png`)));
export const SHEETS = Object.fromEntries(NAMES.map((n, i) => [n, slice(images[i])]));
