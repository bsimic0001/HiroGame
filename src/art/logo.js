// Pixel-art HYPR wordmark for the page chrome ("A HYPR GAME" plaque on
// the frame around the canvas). Hand-set to match the official logo —
// including the notched diagonal crossbar on the H — and filled with the
// brand's purple gradient, dark-outlined like the in-game sprites.
import { drawText, textWidth } from '../engine/font.js';

// 46x12: four 10px letters, 2px gaps.
const ROWS = [
  '###....###..###....###..#########...#########.',
  '###....###..###....###..##########..##########',
  '###....###...###..###...###....###..###....###',
  '###....###...###..###...###....###..###....###',
  '###....###....######....###....###..###....###',
  '##########.....####.....###....###..##########',
  '###.######.....####.....##########..#########.',
  '###..#####.....####.....#########...###.###...',
  '###....###.....####.....###.........###..###..',
  '###....###.....####.....###.........###...###.',
  '###....###.....####.....###.........###....###',
  '###....###.....####.....###.........###....###',
];

function wordmark() {
  const gw = ROWS[0].length, gh = ROWS.length;
  const cv = document.createElement('canvas');
  cv.width = gw + 2; cv.height = gh + 2; // 1px margin for the outline
  const c = cv.getContext('2d');
  const on = (x, y) => y >= 0 && y < gh && x >= 0 && x < gw && ROWS[y][x] === '#';
  c.fillStyle = '#191030';
  for (let y = -1; y <= gh; y++) {
    for (let x = -1; x <= gw; x++) {
      if (on(x, y)) continue;
      let edge = false;
      for (let dy = -1; dy <= 1 && !edge; dy++) {
        for (let dx = -1; dx <= 1; dx++) if (on(x + dx, y + dy)) { edge = true; break; }
      }
      if (edge) c.fillRect(x + 1, y + 1, 1, 1);
    }
  }
  // Brand gradient: deep violet lower-left to lilac upper-right.
  const g = c.createLinearGradient(0, cv.height, cv.width, 0);
  g.addColorStop(0, '#4b2bd0');
  g.addColorStop(1, '#a190f4');
  c.fillStyle = g;
  for (let y = 0; y < gh; y++) {
    for (let x = 0; x < gw; x++) if (on(x, y)) c.fillRect(x + 1, y + 1, 1, 1);
  }
  return cv;
}

// Compose "A <HYPR> GAME" at 1x, then upscale into the target canvas.
// Displayed at 2 CSS px per art px (the game's own pixel size), drawn at
// 4x internally so it stays crisp on retina screens.
export function drawBrand(canvas) {
  const logo = wordmark();
  const gap = 5;
  const w = textWidth('A') + gap + logo.width + gap + textWidth('GAME');
  const h = logo.height;
  const art = document.createElement('canvas');
  art.width = w; art.height = h;
  const c = art.getContext('2d');
  const ty = Math.round((h - 7) / 2);
  let x = drawText(c, 'A', 0, ty, '#8d86b8') + gap;
  c.drawImage(logo, x, 0);
  x += logo.width + gap;
  drawText(c, 'GAME', x, ty, '#8d86b8');
  const S = 4;
  canvas.width = w * S; canvas.height = h * S;
  const cc = canvas.getContext('2d');
  cc.imageSmoothingEnabled = false;
  cc.drawImage(art, 0, 0, canvas.width, canvas.height);
  canvas.style.width = `${w * 2}px`;
  canvas.style.height = `${h * 2}px`;
}
