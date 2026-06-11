// 5x7 uppercase pixel font. Glyphs are 7 rows of 5-bit masks.
// Rendered through per-color cached atlases so text costs one drawImage per char.
const G = {
  'A': [0b01110,0b10001,0b10001,0b11111,0b10001,0b10001,0b10001],
  'B': [0b11110,0b10001,0b10001,0b11110,0b10001,0b10001,0b11110],
  'C': [0b01110,0b10001,0b10000,0b10000,0b10000,0b10001,0b01110],
  'D': [0b11100,0b10010,0b10001,0b10001,0b10001,0b10010,0b11100],
  'E': [0b11111,0b10000,0b10000,0b11110,0b10000,0b10000,0b11111],
  'F': [0b11111,0b10000,0b10000,0b11110,0b10000,0b10000,0b10000],
  'G': [0b01110,0b10001,0b10000,0b10111,0b10001,0b10001,0b01111],
  'H': [0b10001,0b10001,0b10001,0b11111,0b10001,0b10001,0b10001],
  'I': [0b01110,0b00100,0b00100,0b00100,0b00100,0b00100,0b01110],
  'J': [0b00111,0b00010,0b00010,0b00010,0b00010,0b10010,0b01100],
  'K': [0b10001,0b10010,0b10100,0b11000,0b10100,0b10010,0b10001],
  'L': [0b10000,0b10000,0b10000,0b10000,0b10000,0b10000,0b11111],
  'M': [0b10001,0b11011,0b10101,0b10101,0b10001,0b10001,0b10001],
  'N': [0b10001,0b11001,0b10101,0b10011,0b10001,0b10001,0b10001],
  'O': [0b01110,0b10001,0b10001,0b10001,0b10001,0b10001,0b01110],
  'P': [0b11110,0b10001,0b10001,0b11110,0b10000,0b10000,0b10000],
  'Q': [0b01110,0b10001,0b10001,0b10001,0b10101,0b10010,0b01101],
  'R': [0b11110,0b10001,0b10001,0b11110,0b10100,0b10010,0b10001],
  'S': [0b01111,0b10000,0b10000,0b01110,0b00001,0b00001,0b11110],
  'T': [0b11111,0b00100,0b00100,0b00100,0b00100,0b00100,0b00100],
  'U': [0b10001,0b10001,0b10001,0b10001,0b10001,0b10001,0b01110],
  'V': [0b10001,0b10001,0b10001,0b10001,0b10001,0b01010,0b00100],
  'W': [0b10001,0b10001,0b10001,0b10101,0b10101,0b11011,0b10001],
  'X': [0b10001,0b10001,0b01010,0b00100,0b01010,0b10001,0b10001],
  'Y': [0b10001,0b10001,0b01010,0b00100,0b00100,0b00100,0b00100],
  'Z': [0b11111,0b00001,0b00010,0b00100,0b01000,0b10000,0b11111],
  '0': [0b01110,0b10001,0b10011,0b10101,0b11001,0b10001,0b01110],
  '1': [0b00100,0b01100,0b00100,0b00100,0b00100,0b00100,0b01110],
  '2': [0b01110,0b10001,0b00001,0b00110,0b01000,0b10000,0b11111],
  '3': [0b11111,0b00010,0b00100,0b00010,0b00001,0b10001,0b01110],
  '4': [0b00010,0b00110,0b01010,0b10010,0b11111,0b00010,0b00010],
  '5': [0b11111,0b10000,0b11110,0b00001,0b00001,0b10001,0b01110],
  '6': [0b00110,0b01000,0b10000,0b11110,0b10001,0b10001,0b01110],
  '7': [0b11111,0b00001,0b00010,0b00100,0b01000,0b01000,0b01000],
  '8': [0b01110,0b10001,0b10001,0b01110,0b10001,0b10001,0b01110],
  '9': [0b01110,0b10001,0b10001,0b01111,0b00001,0b00010,0b01100],
  ' ': [0,0,0,0,0,0,0],
  '.': [0,0,0,0,0,0b01100,0b01100],
  ',': [0,0,0,0,0,0b00100,0b01000],
  '!': [0b00100,0b00100,0b00100,0b00100,0b00100,0,0b00100],
  '?': [0b01110,0b10001,0b00001,0b00010,0b00100,0,0b00100],
  "'": [0b00100,0b00100,0b01000,0,0,0,0],
  '"': [0b01010,0b01010,0,0,0,0,0],
  '-': [0,0,0,0b01110,0,0,0],
  '+': [0,0,0b00100,0b01110,0b00100,0,0],
  ':': [0,0,0b00100,0,0,0b00100,0],
  ';': [0,0,0b00100,0,0,0b00100,0b01000],
  '(': [0b00010,0b00100,0b01000,0b01000,0b01000,0b00100,0b00010],
  ')': [0b01000,0b00100,0b00010,0b00010,0b00010,0b00100,0b01000],
  '/': [0b00001,0b00010,0b00010,0b00100,0b01000,0b01000,0b10000],
  '%': [0b11001,0b11010,0b00010,0b00100,0b01000,0b01011,0b10011],
  '&': [0b01000,0b10100,0b10100,0b01000,0b10101,0b10010,0b01101],
  '*': [0b00100,0b10101,0b01110,0b00100,0b01110,0b10101,0b00100],
  '<': [0b00010,0b00100,0b01000,0b10000,0b01000,0b00100,0b00010],
  '>': [0b01000,0b00100,0b00010,0b00001,0b00010,0b00100,0b01000],
  '=': [0,0,0b11111,0,0b11111,0,0],
  '_': [0,0,0,0,0,0,0b11111],
  '[': [0b01110,0b01000,0b01000,0b01000,0b01000,0b01000,0b01110],
  ']': [0b01110,0b00010,0b00010,0b00010,0b00010,0b00010,0b01110],
  '♥': [0b01010,0b11111,0b11111,0b01110,0b00100,0,0], // heart
  '→': [0,0b00100,0b00010,0b11111,0b00010,0b00100,0], // right arrow
  '▶': [0b01000,0b01100,0b01110,0b01111,0b01110,0b01100,0b01000], // cursor
};

export const CHAR_W = 6;   // 5px glyph + 1px gap
export const LINE_H = 9;

const ORDER = Object.keys(G);
const IDX = Object.fromEntries(ORDER.map((c, i) => [c, i]));
const atlases = {}; // color -> canvas strip of all glyphs

function atlasFor(color) {
  if (atlases[color]) return atlases[color];
  const cv = document.createElement('canvas');
  cv.width = ORDER.length * CHAR_W; cv.height = 7;
  const c = cv.getContext('2d');
  c.fillStyle = color;
  ORDER.forEach((ch, i) => {
    const rows = G[ch];
    for (let y = 0; y < 7; y++) {
      const row = rows[y];
      for (let x = 0; x < 5; x++) {
        if (row & (1 << (4 - x))) c.fillRect(i * CHAR_W + x, y, 1, 1);
      }
    }
  });
  atlases[color] = cv;
  return cv;
}

export function drawText(ctx, text, x, y, color = '#ffffff') {
  const atlas = atlasFor(color);
  const s = String(text).toUpperCase();
  let cx = x;
  for (const ch of s) {
    if (ch === '\n') { y += LINE_H; cx = x; continue; }
    const i = IDX[ch] !== undefined ? IDX[ch] : IDX['?'];
    if (ch !== ' ') ctx.drawImage(atlas, i * CHAR_W, 0, CHAR_W, 7, cx, y, CHAR_W, 7);
    cx += CHAR_W;
  }
  return cx;
}

export function textWidth(text) { return String(text).length * CHAR_W; }

export function drawTextCentered(ctx, text, cx, y, color) {
  drawText(ctx, text, Math.floor(cx - textWidth(text) / 2), y, color);
}

// Integer-scaled text with an offset shadow — for titles and big moments.
export function drawTextScaled(ctx, text, cx, y, scale, color, shadowColor = '#170f2e') {
  const s = String(text).toUpperCase();
  const w = s.length * CHAR_W, h = 8;
  const tmp = document.createElement('canvas');
  tmp.width = w; tmp.height = h;
  const tc = tmp.getContext('2d');
  drawText(tc, s, 0, 0, color);
  const dx = Math.floor(cx - (w * scale) / 2);
  ctx.imageSmoothingEnabled = false;
  // shadow pass
  const tmpS = document.createElement('canvas');
  tmpS.width = w; tmpS.height = h;
  drawText(tmpS.getContext('2d'), s, 0, 0, shadowColor);
  ctx.drawImage(tmpS, dx + scale, y + scale, w * scale, h * scale);
  ctx.drawImage(tmp, dx, y, w * scale, h * scale);
}

// Word-wrap into lines of at most maxChars.
export function wrap(text, maxChars) {
  const out = [];
  for (const para of String(text).split('\n')) {
    let line = '';
    for (const word of para.split(' ')) {
      if (line.length === 0) line = word;
      else if (line.length + 1 + word.length <= maxChars) line += ' ' + word;
      else { out.push(line); line = word; }
    }
    out.push(line);
  }
  return out;
}
