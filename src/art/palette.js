// Shared pixel palette. Single-character codes used by ASCII sprite grids.
export const PAL = {
  k: '#1a1226', // outline / near-black
  w: '#ffffff',
  c: '#cfd6e4', // light gray
  m: '#8a8f9e', // metal
  M: '#555a66', // metal dark
  e: '#0c0a14', // void black
  s: '#f6d7b8', // skin
  S: '#dba87f', // skin shadow
  h: '#8a5a33', // hair brown
  H: '#5e3a1e', // hair dark
  j: '#23202b', // HYPR jacket
  J: '#3a3544', // jacket highlight
  t: '#19d3c5', // HYPR teal
  T: '#0f9e94', // teal dark
  p: '#6a3df0', // HYPR purple
  P: '#4a28b0', // purple dark
  v: '#b78bff', // light purple
  d: '#6e4f86', // dim purple
  r: '#e44b4b', // red
  R: '#a32626', // red dark
  o: '#f29b38', // orange
  O: '#c96f16', // orange dark
  y: '#ffd84d', // yellow
  g: '#3fae57', // green
  G: '#2b7c3e', // green dark
  b: '#3a76e8', // blue
  B: '#24509e', // blue dark
  n: '#7a4f2a', // wood
  N: '#54351b', // wood dark
  f: '#ff7ab8', // pink
  z: '#86f1ff', // glow cyan
  q: '#2a1b4e', // deep night purple
  A: '#1f6b30', // leaf deep
  x: '#57c970', // leaf light
  D: '#3a2614', // wood deep
  Y: '#a86f2e', // wood warm
  I: '#fff3c2', // lamplight
  V: '#8a63ff', // crystal violet
};

// Compile an ASCII grid into an offscreen canvas. '.' and ' ' are transparent.
// `swap` optionally remaps palette codes (e.g. { s: 'd' } for shadow clones).
export function compile(rows, swap = null) {
  const h = rows.length;
  const w = Math.max(...rows.map((r) => r.length));
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const c = cv.getContext('2d');
  for (let y = 0; y < h; y++) {
    const row = rows[y];
    for (let x = 0; x < row.length; x++) {
      let ch = row[x];
      if (ch === '.' || ch === ' ') continue;
      if (swap && swap[ch]) ch = swap[ch];
      c.fillStyle = PAL[ch] || '#ff00ff';
      c.fillRect(x, y, 1, 1);
    }
  }
  return cv;
}

export function mirror(cv) {
  const out = document.createElement('canvas');
  out.width = cv.width; out.height = cv.height;
  const c = out.getContext('2d');
  c.translate(cv.width, 0);
  c.scale(-1, 1);
  c.drawImage(cv, 0, 0);
  return out;
}

// Digital-corruption effect: shifts horizontal slices and sprinkles static.
// Used for deepfake doppelgangers.
export function glitchify(cv, seed = 5) {
  const out = document.createElement('canvas');
  out.width = cv.width + 4; out.height = cv.height;
  const c = out.getContext('2d');
  let s = seed;
  const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
  let y = 0;
  while (y < cv.height) {
    const band = 2 + Math.floor(rnd() * 4);
    const off = Math.floor(rnd() * 5) - 2;
    c.drawImage(cv, 0, y, cv.width, band, 2 + off, y, cv.width, band);
    y += band;
  }
  for (let i = 0; i < 14; i++) {
    c.fillStyle = rnd() < 0.5 ? 'rgba(134,241,255,0.8)' : 'rgba(228,75,75,0.8)';
    c.fillRect(Math.floor(rnd() * out.width), Math.floor(rnd() * out.height), 1 + Math.floor(rnd() * 2), 1);
  }
  return out;
}

// Add a crisp 1px outline around every opaque pixel — the classic 32-bit
// "pop" that separates characters from the ground.
export function outline(cv, color = '#180f28') {
  const out = document.createElement('canvas');
  out.width = cv.width; out.height = cv.height;
  const c = out.getContext('2d');
  const src = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
  const solid = (x, y) =>
    x >= 0 && y >= 0 && x < cv.width && y < cv.height && src[(y * cv.width + x) * 4 + 3] > 40;
  c.fillStyle = color;
  for (let y = 0; y < cv.height; y++) {
    for (let x = 0; x < cv.width; x++) {
      if (!solid(x, y) && (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1))) {
        c.fillRect(x, y, 1, 1);
      }
    }
  }
  c.drawImage(cv, 0, 0);
  return out;
}
