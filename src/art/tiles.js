// 16x16 environment tiles. Procedural bases textured with a seeded PRNG,
// decorations drawn as ASCII pixel grids layered on top for crisp detail.
import { PAL } from './palette.js';

export const TILE = 16;

function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    return ((s >>> 0) % 1000) / 1000;
  };
}

function tile(fn, seed = 7) {
  const cv = document.createElement('canvas');
  cv.width = TILE; cv.height = TILE;
  const c = cv.getContext('2d');
  fn(c, rng(seed));
  return cv;
}

function speckle(c, r, color, count, size = 1) {
  c.fillStyle = color;
  for (let i = 0; i < count; i++) c.fillRect((r() * 16) | 0, (r() * 16) | 0, size, 1);
}

// overlay an ASCII grid (PAL codes, '.'/' ' transparent) onto the context
function overlay(c, rows, ox = 0, oy = 0) {
  for (let y = 0; y < rows.length; y++) {
    for (let x = 0; x < rows[y].length; x++) {
      const ch = rows[y][x];
      if (ch === '.' || ch === ' ') continue;
      c.fillStyle = PAL[ch] || '#ff00ff';
      c.fillRect(ox + x, oy + y, 1, 1);
    }
  }
}

// ----- base painters (reused by decorated tiles) -----------------------------
function paintGrass(c, r) {
  c.fillStyle = '#46a85c'; c.fillRect(0, 0, 16, 16);
  // mottled patches
  c.fillStyle = '#3f9e54';
  for (let i = 0; i < 6; i++) c.fillRect((r() * 14) | 0, (r() * 14) | 0, 2 + ((r() * 3) | 0), 2);
  // grass blades: dark base + light tip pairs
  for (let i = 0; i < 7; i++) {
    const x = (r() * 15) | 0, y = 2 + ((r() * 13) | 0);
    c.fillStyle = '#2e8743'; c.fillRect(x, y, 1, 2);
    c.fillStyle = '#63c47a'; c.fillRect(x + 1, y - 1, 1, 2);
  }
  speckle(c, r, '#2e8743', 5);
}
function paintPath(c, r) {
  c.fillStyle = '#cfa86a'; c.fillRect(0, 0, 16, 16);
  c.fillStyle = '#bd9355';
  for (let i = 0; i < 6; i++) c.fillRect((r() * 13) | 0, (r() * 13) | 0, 2 + ((r() * 3) | 0), 2);
  // pebbles with highlight
  for (let i = 0; i < 4; i++) {
    const x = (r() * 14) | 0, y = (r() * 14) | 0;
    c.fillStyle = '#9c7a44'; c.fillRect(x, y, 2, 2);
    c.fillStyle = '#e3c489'; c.fillRect(x, y, 1, 1);
  }
  speckle(c, r, '#e3c489', 6);
}
function paintSand(c, r) {
  c.fillStyle = '#ecd79f'; c.fillRect(0, 0, 16, 16);
  c.fillStyle = '#dcc385';
  for (let i = 0; i < 5; i++) c.fillRect((r() * 13) | 0, (r() * 13) | 0, 3, 1);
  speckle(c, r, '#c4a96b', 10);
  speckle(c, r, '#fff3cf', 6);
  // tiny shells
  c.fillStyle = '#d88aa4'; c.fillRect(12, 11, 2, 1); c.fillRect(3, 5, 1, 1);
}
function paintCaveFloor(c, r) {
  c.fillStyle = '#5e5570'; c.fillRect(0, 0, 16, 16);
  c.fillStyle = '#4c4460';
  for (let i = 0; i < 6; i++) c.fillRect((r() * 13) | 0, (r() * 13) | 0, 3, 2);
  speckle(c, r, '#3a3450', 10);
  speckle(c, r, '#766d8c', 8);
}
function paintWall(c, r) {
  c.fillStyle = '#9197a8'; c.fillRect(0, 0, 16, 16);
  for (let row = 0; row < 4; row++) {
    const y = row * 4;
    c.fillStyle = '#5c6170'; c.fillRect(0, y + 3, 16, 1);
    const off = row % 2 === 0 ? 0 : 4;
    c.fillStyle = '#5c6170';
    for (let x = off; x < 16; x += 8) c.fillRect(x, y, 1, 3);
    c.fillStyle = '#b3b9c9';
    for (let x = off + 1; x < 16; x += 8) c.fillRect(x, y, 5, 1);
  }
}

function paintTechFloor(c) {
  c.fillStyle = '#1e1838'; c.fillRect(0, 0, 16, 16);
  c.fillStyle = '#171230'; c.fillRect(0, 0, 16, 1); c.fillRect(0, 0, 1, 16);
  c.fillStyle = '#2c2350'; c.fillRect(15, 1, 1, 15); c.fillRect(1, 15, 15, 1);
  // corner rivets
  c.fillStyle = '#3c3168';
  c.fillRect(2, 2, 1, 1); c.fillRect(13, 2, 1, 1); c.fillRect(2, 13, 1, 1); c.fillRect(13, 13, 1, 1);
}

export const TILES = {
  grass: tile(paintGrass, 11),
  flowers: tile((c, r) => {
    paintGrass(c, r);
    overlay(c, ['.fkf', '.kyk', '.AfA'], 2, 3);
    overlay(c, ['.yky', '.kfk', '.AyA'], 10, 9);
  }, 23),
  tallgrass: tile((c, r) => {
    paintGrass(c, r);
    // dense, high-contrast tufts
    for (const [x, y] of [[1, 4], [6, 2], [11, 4], [3, 9], [8, 8], [13, 9], [5, 13], [10, 13]]) {
      c.fillStyle = '#1f6b30';
      c.fillRect(x, y, 1, 4); c.fillRect(x + 2, y, 1, 4); c.fillRect(x + 1, y + 1, 1, 3);
      c.fillStyle = '#7ee695';
      c.fillRect(x, y - 1, 1, 2); c.fillRect(x + 2, y - 1, 1, 2);
      c.fillStyle = '#46c468';
      c.fillRect(x + 1, y, 1, 1);
    }
  }, 29),
  path: tile(paintPath, 31),
  sand: tile(paintSand, 41),
  waterA: tile((c, r) => {
    c.fillStyle = '#2b58b8'; c.fillRect(0, 0, 16, 16);
    c.fillStyle = '#244aa0'; // depth patches
    for (let i = 0; i < 4; i++) c.fillRect((r() * 12) | 0, (r() * 12) | 0, 4, 2);
    c.fillStyle = '#3a76e8'; c.fillRect(0, 2, 16, 1); c.fillRect(0, 9, 16, 1);
    c.fillStyle = '#7fb1ff'; // wave crests
    c.fillRect(2, 2, 4, 1); c.fillRect(10, 9, 4, 1); c.fillRect(7, 13, 3, 1);
    c.fillStyle = '#d8ecff'; c.fillRect(3, 2, 2, 1); c.fillRect(11, 9, 2, 1);
  }, 13),
  waterB: tile((c, r) => {
    c.fillStyle = '#2b58b8'; c.fillRect(0, 0, 16, 16);
    c.fillStyle = '#244aa0';
    for (let i = 0; i < 4; i++) c.fillRect((r() * 12) | 0, (r() * 12) | 0, 4, 2);
    c.fillStyle = '#3a76e8'; c.fillRect(0, 5, 16, 1); c.fillRect(0, 12, 16, 1);
    c.fillStyle = '#7fb1ff';
    c.fillRect(6, 5, 4, 1); c.fillRect(1, 12, 4, 1); c.fillRect(11, 1, 3, 1);
    c.fillStyle = '#d8ecff'; c.fillRect(7, 5, 2, 1); c.fillRect(2, 12, 2, 1);
  }, 17),
  tree: tile((c, r) => {
    paintGrass(c, r);
    // soft ground shadow
    c.fillStyle = 'rgba(20,40,24,0.4)'; c.fillRect(2, 13, 12, 3);
    overlay(c, [
      '..kkkkkkkkkkkk..',
      '.kAggggggggggAk.',
      'kAggxxgggggxggAk',
      'kAgxxgggggxxggAk',
      'kAggggggggggggAk',
      'kAgggAAgggggxgAk',
      'kAxggAAggxggggAk',
      'kAxxggggxxgggAAk',
      'kAgggggggggggAAk',
      '.kAAgggggggAAk..',
      '..kkAAAAAAAkk...',
      '....kkNYNkk.....',
      '.....kNYDk......',
      '.....kNYDk......',
      '....kkDDDkk.....',
      '...kkkkkkkkk....',
    ]);
  }, 51),
  // tree variants — picked per map position so forests aren't uniform
  treePine: tile((c, r) => {
    paintGrass(c, r);
    c.fillStyle = 'rgba(20,40,24,0.4)'; c.fillRect(3, 13, 10, 3);
    overlay(c, [
      '.......kk.......',
      '......kAAk......',
      '.....kAxgAk.....',
      '....kAgggAAk....',
      '...kAxggggAAk...',
      '....kAgggAk.....',
      '...kAxgggggAk...',
      '..kAggggggAAAk..',
      '...kAgggggAk....',
      '..kAxggggggAAk..',
      '.kAgggggggggAAk.',
      'kAAAAAAAAAAAAAAk',
      '......kNYk......',
      '......kNDk......',
      '.....kkDDkk.....',
      '....kkkkkkkk....',
    ]);
  }, 151),
  treeBlossom: tile((c, r) => {
    paintGrass(c, r);
    c.fillStyle = 'rgba(20,40,24,0.4)'; c.fillRect(2, 13, 12, 3);
    overlay(c, [
      '..kkkkkkkkkkkk..',
      '.kAgfgggggggfAk.',
      'kAggggfggggggwAk',
      'kAwgggggfgggggAk',
      'kAggfgggggwggfAk',
      'kAgggggwggggggAk',
      'kAfggggggfgggwAk',
      'kAggwggggggfggAk',
      'kAAggggfgggggAAk',
      '.kAAfgggggwAAk..',
      '..kkAAAAAAAkk...',
      '....kkNYNkk.....',
      '.....kNYDk......',
      '.....kNYDk......',
      '....kkDDDkk.....',
      '...kkkkkkkkk....',
    ]);
  }, 153),
  caveMouth: tile((c, r) => {
    paintCaveFloor(c, r);
    overlay(c, [
      '.kkkkkkkkkkkkkk.',
      'kmMMMMMMMMMMMMmk',
      'kMMkkkkkkkkkkMMk',
      'kMkkeeeeeeeekkMk',
      'kMkeeeeeeeeeekMk',
      'kMkeeeeeeeeeekMk',
      'kMkeeeeeeeeeekMk',
      'kMkeeeeeeeeeekMk',
      'kMkeeeeeeeeeekMk',
      'kMkeeeeeeeeeekMk',
      'kMkeeeeeeeeeekMk',
    ]);
    // worn steps leading in
    c.fillStyle = '#766d8c'; c.fillRect(5, 12, 6, 1);
    c.fillStyle = '#3a3450'; c.fillRect(4, 14, 8, 1);
  }, 157),
  stairs: tile((c) => {
    c.fillStyle = '#37304a'; c.fillRect(0, 0, 16, 16);
    for (let i = 0; i < 5; i++) {
      const y = i * 3 + 1;
      c.fillStyle = '#766d8c'; c.fillRect(2, y, 12, 1);
      c.fillStyle = '#5e5570'; c.fillRect(2, y + 1, 12, 2);
      c.fillStyle = '#241d36'; c.fillRect(1, y, 1, 3); c.fillRect(14, y, 1, 3);
    }
  }),
  bush: tile((c, r) => {
    paintGrass(c, r);
    c.fillStyle = 'rgba(20,40,24,0.35)'; c.fillRect(2, 13, 12, 2);
    overlay(c, [
      '.....kkkkkk.....',
      '...kkxxxxxxkk...',
      '..kxxggxxggxxk..',
      '.kxgggggggggxk..',
      '.kggggAAggggggk.',
      'kgggAAAAgggAAggk',
      'kggAAgggggAAAAgk',
      'kAAAgggggggAAAk.',
      '.kAAAAAAAAAAAk..',
      '..kkkkkkkkkkk...',
    ], 0, 4);
  }, 53),
  fence: tile((c, r) => {
    paintGrass(c, r);
    overlay(c, [
      '.kYk........kYk.',
      '.kYnk......kYnk.',
      'kkYnkkkkkkkkYnkk',
      'knnnnnnnnnnnnnnk',
      'kkYnkkkkkkkkYnkk',
      '.kYnk......kYnk.',
      'kkYnkkkkkkkkYnkk',
      'knnnnnnnnnnnnnnk',
      'kkYnkkkkkkkkYnkk',
      '.kYnk......kYnk.',
      '.kDk........kDk.',
    ], 0, 3);
  }, 57),
  lamp: tile((c, r) => {
    paintPath(c, r);
    // halo
    c.fillStyle = 'rgba(255,216,77,0.22)'; c.fillRect(3, 1, 10, 6);
    overlay(c, [
      '......kk........',
      '....kkyykk......',
      '....kyIIyk......',
      '....kyIIyk......',
      '....kkyykk......',
      '.....kkkk.......',
      '......MM........',
      '......MM........',
      '......MM........',
      '......MM........',
      '.....kMMk.......',
      '....kMMMMk......',
      '...kkkkkkkk.....',
    ], 0, 1);
    // light pooling on the ground
    c.fillStyle = 'rgba(255,243,194,0.25)'; c.fillRect(2, 13, 12, 3);
  }, 59),
  wall: tile((c, r) => {
    paintWall(c, r);
    speckle(c, r, '#7a8093', 6);
    speckle(c, r, '#46a85c', 2); // moss
  }, 61),
  windowWall: tile((c, r) => {
    paintWall(c, r);
    overlay(c, [
      'kkkkkkkk',
      'kIIkkIIk',
      'kIykkyIk',
      'kkkkkkkk',
      'kIIkkIIk',
      'kIIkkIIk',
      'kkkkkkkk',
    ], 4, 4);
    c.fillStyle = 'rgba(255,243,194,0.2)'; c.fillRect(3, 12, 10, 3);
  }, 67),
  roof: tile((c) => {
    // scalloped purple shingles
    for (let row = 0; row < 4; row++) {
      const y = row * 4;
      c.fillStyle = row === 0 ? '#7d52f5' : '#5c33d6';
      c.fillRect(0, y, 16, 4);
      c.fillStyle = '#3b1f96';
      c.fillRect(0, y + 3, 16, 1);
      c.fillStyle = '#9d7bff';
      const off = row % 2 === 0 ? 0 : 4;
      for (let x = off; x < 16; x += 8) c.fillRect(x + 1, y, 5, 1);
      c.fillStyle = '#46249e';
      for (let x = off; x < 16; x += 8) c.fillRect(x, y, 1, 3);
    }
  }),
  floor: tile((c, r) => {
    c.fillStyle = '#b07f4d'; c.fillRect(0, 0, 16, 16);
    for (let row = 0; row < 4; row++) {
      const y = row * 4;
      c.fillStyle = '#8a6238'; c.fillRect(0, y + 3, 16, 1);
      c.fillStyle = '#c7965f'; // plank tops
      c.fillRect(0, y, 16, 1);
      const off = row % 2 === 0 ? 9 : 4;
      c.fillStyle = '#8a6238'; c.fillRect(off, y, 1, 3);
      c.fillStyle = '#6e4c28'; c.fillRect(off + (row % 2 ? 3 : -3), y + 1, 1, 1); // nails
    }
    speckle(c, r, '#9c6f3e', 6, 2);
  }, 71),
  caveFloor: tile(paintCaveFloor, 73),
  caveWall: tile((c, r) => {
    c.fillStyle = '#37304a'; c.fillRect(0, 0, 16, 16);
    // chunky rock facets
    for (let i = 0; i < 5; i++) {
      const x = (r() * 12) | 0, y = (r() * 12) | 0, w = 3 + ((r() * 4) | 0);
      c.fillStyle = '#453d5c'; c.fillRect(x, y, w, 3);
      c.fillStyle = '#574e72'; c.fillRect(x, y, w, 1);
      c.fillStyle = '#241d36'; c.fillRect(x, y + 3, w, 1);
    }
    speckle(c, r, '#241d36', 10);
    c.fillStyle = '#241d36'; c.fillRect(0, 15, 16, 1);
  }, 79),
  crystal: tile((c, r) => {
    paintCaveFloor(c, r);
    overlay(c, [
      '......kk........',
      '.....kVzk.......',
      '..k..kVzk..k....',
      '.kVkkVVzzkkVk...',
      '.kVvkVvzzkkvk...',
      '.kvvkvvzzkvvk...',
      '..kkkkkkkkkk....',
    ], 0, 7);
    c.fillStyle = 'rgba(138,99,255,0.18)'; c.fillRect(1, 11, 13, 4);
  }, 83),
  techFloor: tile(paintTechFloor),
  techTrace: tile((c) => {
    paintTechFloor(c);
    c.fillStyle = '#6a3df0';
    c.fillRect(4, 7, 8, 1); c.fillRect(11, 4, 1, 4); c.fillRect(4, 7, 1, 5);
    c.fillStyle = '#19d3c5'; c.fillRect(11, 3, 2, 2); c.fillRect(3, 11, 2, 2);
  }),
  techWall: tile((c) => {
    c.fillStyle = '#2a2148'; c.fillRect(0, 0, 16, 16);
    c.fillStyle = '#332960'; c.fillRect(0, 0, 16, 2);
    c.fillStyle = '#16102c'; c.fillRect(0, 12, 16, 4);
    c.fillStyle = '#0d0a1c'; c.fillRect(0, 15, 16, 1);
    // glowing strip + status leds
    c.fillStyle = '#6a3df0'; c.fillRect(1, 4, 14, 2);
    c.fillStyle = '#b78bff'; c.fillRect(1, 4, 14, 1);
    c.fillStyle = '#19d3c5'; c.fillRect(3, 9, 2, 1); c.fillRect(7, 9, 2, 1);
    c.fillStyle = '#e44b4b'; c.fillRect(11, 9, 2, 1);
    // vents
    c.fillStyle = '#241d3d'; c.fillRect(2, 13, 5, 1); c.fillRect(9, 13, 5, 1);
  }),
  console: tile((c) => {
    paintTechFloor(c);
    overlay(c, [
      '.kkkkkkkkkk.....',
      'kzztzztzzttk....',
      'kttzztzzttzk....',
      'kkkkkkkkkkkk....',
      '.kMmmmmmmmk.....',
      '.kMmykyymmk.....',
      '.kkkkkkkkkk.....',
    ], 1, 5);
  }),
  vaultRune: tile((c) => {
    paintTechFloor(c);
    c.fillStyle = '#2c2350'; c.fillRect(3, 3, 10, 10);
    c.fillStyle = '#b78bff';
    c.fillRect(7, 4, 2, 5); c.fillRect(5, 6, 6, 2); // key glyph
    c.fillRect(7, 10, 2, 2); c.fillRect(9, 11, 2, 1);
    c.fillStyle = 'rgba(183,139,255,0.25)'; c.fillRect(4, 4, 8, 1);
  }),
  door: tile((c) => {
    c.fillStyle = '#5c6170'; c.fillRect(0, 0, 16, 16); // stone frame
    c.fillStyle = '#b3b9c9'; c.fillRect(1, 1, 14, 1);
    overlay(c, [
      'kkkkkkkkkk',
      'kNYYYYYYNk',
      'kNYnnnnYNk',
      'kNnYYYYnNk',
      'kNnYnnYnNk',
      'kNnYnnYnNk',
      'kNnYYYYnNk',
      'kNnYnnYynk',
      'kNnYnnYyyk',
      'kNnYYYYnNk',
      'kNnYnnYnNk',
      'kNYnnnnYNk',
      'kNYYYYYYNk',
      'kkkkkkkkkk',
    ], 3, 2);
  }),
  doorTech: tile((c) => {
    c.fillStyle = '#2a2148'; c.fillRect(0, 0, 16, 16); // frame
    c.fillStyle = '#6a3df0'; c.fillRect(1, 0, 14, 1);
    overlay(c, [
      'kkkkkkkkkkkk',
      'kMmmmmmmmmMk',
      'kMmmmmmmmmMk',
      'kMmmkkkkmmMk',
      'kMmmkttkmmMk',
      'kMmmkkkkmmMk',
      'kMmmmmmmmmMk',
      'kMmmmmmmmmMk',
      'kMmmmmmtkmMk',
      'kMmmmmmkzkMk',
      'kMmmmmmtkmMk',
      'kMmmmmmmmmMk',
      'kMmmmmmmmmMk',
      'kkkkkkkkkkkk',
    ], 2, 2);
  }),
  sign: tile((c, r) => {
    paintGrass(c, r);
    overlay(c, [
      '.kkkkkkkkkkkk...',
      'kYYYYYYYYYYYYk..',
      'kYDDDkDDDDkYYk..',
      'kYYYYYYYYYYYYk..',
      'kYDDDDkDDDYYYk..',
      'kYYYYYYYYYYYYk..',
      '.kkkkkNNkkkkk...',
      '.....kNNk.......',
      '.....kDDk.......',
      '....kkkkkk......',
    ], 0, 3);
  }, 87),
  bridge: tile((c) => {
    c.fillStyle = '#9c6f3e'; c.fillRect(0, 0, 16, 16);
    for (let x = 0; x < 16; x += 4) {
      c.fillStyle = '#6e4c28'; c.fillRect(x + 3, 0, 1, 16);
      c.fillStyle = '#c7965f'; c.fillRect(x, 0, 1, 16);
    }
    c.fillStyle = '#54351b'; c.fillRect(0, 0, 16, 2); c.fillRect(0, 14, 16, 2);
    c.fillStyle = '#7a4f2a'; c.fillRect(0, 0, 16, 1); c.fillRect(0, 14, 16, 1);
  }),
  counter: tile((c) => {
    c.fillStyle = '#c7965f'; c.fillRect(0, 0, 16, 5);
    c.fillStyle = '#e0b57e'; c.fillRect(0, 0, 16, 1);
    c.fillStyle = '#8a6238'; c.fillRect(0, 4, 16, 1);
    c.fillStyle = '#7a4f2a'; c.fillRect(0, 5, 16, 11);
    c.fillStyle = '#54351b';
    c.fillRect(2, 7, 5, 6); c.fillRect(9, 7, 5, 6);
    c.fillStyle = '#94653a'; c.fillRect(2, 7, 5, 1); c.fillRect(9, 7, 5, 1);
  }),
  boulder: tile((c, r) => {
    paintCaveFloor(c, r);
    overlay(c, [
      '....kkkkkk......',
      '..kkmmmccmk.....',
      '.kmcccmmccmk....',
      '.kmccmmmmmmk....',
      'kmccmmmmmMMmk...',
      'kmcmmmmmMMMmk...',
      'kmmmmmMMMMMmk...',
      '.kmmMMMMMMmk....',
      '..kkmmmmmkk.....',
      '....kkkkk.......',
    ], 1, 3);
  }, 91),
  void: tile((c) => {
    c.fillStyle = '#0c0a14'; c.fillRect(0, 0, 16, 16);
    c.fillStyle = '#140f22'; c.fillRect(0, 0, 8, 8); c.fillRect(8, 8, 8, 8);
  }),

  // ------------------------------------------------ decor & light sources
  torchA: tile((c, r) => {
    paintWall(c, r);
    overlay(c, [
      '......yy........',
      '.....yyyy.......',
      '....yyooyy......',
      '....yoIIoy......',
      '.....kIIk.......',
      '.....kMMk.......',
      '......MM........',
      '......MM........',
      '.....kMMk.......',
      '....kMmmMk......',
    ], 0, 2);
  }, 201),
  torchB: tile((c, r) => {
    paintWall(c, r);
    overlay(c, [
      '.....yy.........',
      '....yyyy.y......',
      '....yooyyy......',
      '....yoIIoy......',
      '.....kIIk.......',
      '.....kMMk.......',
      '......MM........',
      '......MM........',
      '.....kMMk.......',
      '....kMmmMk......',
    ], 0, 2);
  }, 203),
  sconceA: tile((c) => {
    c.fillStyle = '#2a2148'; c.fillRect(0, 0, 16, 16);
    c.fillStyle = '#16102c'; c.fillRect(0, 12, 16, 4);
    overlay(c, [
      '......vv........',
      '.....vvzv.......',
      '....vVzzVv......',
      '....vVzzVv......',
      '.....kVVk.......',
      '.....kMMk.......',
      '......MM........',
      '.....kMMk.......',
      '....kMmmMk......',
    ], 0, 2);
  }),
  sconceB: tile((c) => {
    c.fillStyle = '#2a2148'; c.fillRect(0, 0, 16, 16);
    c.fillStyle = '#16102c'; c.fillRect(0, 12, 16, 4);
    overlay(c, [
      '.....vv.........',
      '....vzvv.v......',
      '....vVzzVv......',
      '....vVzzVv......',
      '.....kVVk.......',
      '.....kMMk.......',
      '......MM........',
      '.....kMMk.......',
      '....kMmmMk......',
    ], 0, 2);
  }),
  brazierA: tile((c) => {
    c.fillStyle = '#1c1626'; c.fillRect(0, 12, 16, 4); // plinth base, floor-agnostic
    overlay(c, [
      '......yy........',
      '.....yyyy.......',
      '....yyooyy......',
      '...yyoIIoyy.....',
      '....yoooyy......',
      '...kmmmmmmk.....',
      '..kmMMMMMMmk....',
      '...kkMMMMkk.....',
      '.....kMMk.......',
      '....kMMMMk......',
      '..kkMMMMMMkk....',
      '.kmmmmmmmmmmk...',
      '.kkkkkkkkkkkk...',
    ], 1, 2);
  }),
  brazierB: tile((c) => {
    c.fillStyle = '#1c1626'; c.fillRect(0, 12, 16, 4);
    overlay(c, [
      '.....yy..y......',
      '....yyyyyy......',
      '....yooyyy......',
      '...yyoIIoy......',
      '....yyoooy......',
      '...kmmmmmmk.....',
      '..kmMMMMMMmk....',
      '...kkMMMMkk.....',
      '.....kMMk.......',
      '....kMMMMk......',
      '..kkMMMMMMkk....',
      '.kmmmmmmmmmmk...',
      '.kkkkkkkkkkkk...',
    ], 1, 2);
  }),
  banner: tile((c, r) => {
    paintWall(c, r);
    overlay(c, [
      'kkkkkkkkkk',
      'kyPPPPPPyk',
      '.kPvPPvPk.',
      '.kPPppPPk.',
      '.kPptTpPk.',
      '.kPptTpPk.',
      '.kPPttPPk.',
      '.kPPppPPk.',
      '.kPvPPvPk.',
      '..kPPPPk..',
      '...kPPk...',
      '....kk....',
    ], 3, 1);
  }, 207),
  bookshelf: tile((c) => {
    overlay(c, [
      'kkkkkkkkkkkkkkkk',
      'kNYYYYYYYYYYYYNk',
      'kNrgbvyrtbgrvyNk',
      'kNrgbvyrtbgrvyNk',
      'kNkkkkkkkkkkkkNk',
      'kNYYYYYYYYYYYYNk',
      'kNbtrygvbrytgbNk',
      'kNbtrygvbrytgbNk',
      'kNkkkkkkkkkkkkNk',
      'kNYYYYYYYYYYYYNk',
      'kNvyrgtbyvrgbtNk',
      'kNvyrgtbyvrgbtNk',
      'kNkkkkkkkkkkkkNk',
      'kNNNNNNNNNNNNNNk',
      'kkkkkkkkkkkkkkkk',
      'kDDDDDDDDDDDDDDk',
    ]);
  }),
  carpetRed: tile((c, r) => {
    c.fillStyle = '#a8333f'; c.fillRect(0, 0, 16, 16);
    speckle(c, r, '#8f2a35', 10);
    speckle(c, r, '#bf4450', 6);
  }, 211),
  carpetPurple: tile((c, r) => {
    c.fillStyle = '#5c33d6'; c.fillRect(0, 0, 16, 16);
    speckle(c, r, '#4a28b0', 10);
    speckle(c, r, '#7d52f5', 6);
  }, 213),
  planter: tile((c, r) => {
    paintPath(c, r);
    overlay(c, [
      '..f.y..f..y.f...',
      '.fyfyffyfyfyff..',
      '.kgggggggggggk..',
      'kmcccccccccccmk.',
      'kmcccccccccccmk.',
      'kmmmmmmmmmmmmmk.',
      '.kkkkkkkkkkkkk..',
    ], 0, 6);
  }, 217),
  crate: tile((c) => {
    overlay(c, [
      'kkkkkkkkkkkkkkkk',
      'kYYYYYYYYYYYYYYk',
      'kYnnnnnnnnnnnnYk',
      'kYnYYYYYYYYYYnYk',
      'kYnYkYYYYYYkYnYk',
      'kYnYYkYYYYkYYnYk',
      'kYnYYYkYYkYYYnYk',
      'kYnYYYYkkYYYYnYk',
      'kYnYYYkYYkYYYnYk',
      'kYnYYkYYYYkYYnYk',
      'kYnYkYYYYYYkYnYk',
      'kYnnnnnnnnnnnnYk',
      'kYYYYYYYYYYYYYYk',
      'kkkkkkkkkkkkkkkk',
      'kDDDDDDDDDDDDDDk',
      'kkkkkkkkkkkkkkkk',
    ]);
  }),
  mushrooms: tile((c, r) => {
    paintCaveFloor(c, r);
    overlay(c, [
      '...kk...........',
      '..kzzk....kk....',
      '.kzzzzk..kzbk...',
      '.kzbzzk..kzzk...',
      '..kmmk....kmk...',
      '..kmmk...kmmk...',
      'kk....kk........',
      'kzzk.kzzbk......',
      'kzbk.kzzzk......',
      '.km...kmk.......',
    ], 1, 5);
  }, 219),
  serverRack: tile((c) => {
    paintTechFloor(c);
    overlay(c, [
      '.kkkkkkkkkkkk...',
      '.kMmmmmmmmmMk...',
      '.kMtkmmmmrkMk...',
      '.kMkkkkkkkkMk...',
      '.kMmmmmmmmmMk...',
      '.kMrkmmmmtkMk...',
      '.kMkkkkkkkkMk...',
      '.kMmmmmmmmmMk...',
      '.kMtkmmmmtkMk...',
      '.kMkkkkkkkkMk...',
      '.kMmmmmmmmmMk...',
      '.kMrkmmmmrkMk...',
      '.kkkkkkkkkkkk...',
      '.kDDDDDDDDDDk...',
    ], 1, 1);
  }),
  statue: tile((c) => {
    overlay(c, [
      '......mm........',
      '...m.mmmm.m.....',
      '..mmmmmmmmmm....',
      '..mMmmmmmmMm....',
      '..mmmmmmmmmm....',
      '...mmmMmmmm.....',
      '..mmmmmmmmm.....',
      '.kmmmmmmmmmk....',
      '.kmMMmmmMMmk....',
      '..kmmmmmmmk.....',
      '..kcccccccck....',
      '.kcccccccccck...',
      '.kMMMMMMMMMMk...',
      '.kcccccccccck...',
      'kkkkkkkkkkkkkk..',
      'kDDDDDDDDDDDDk..',
    ], 1, 0);
  }),
  well: tile((c, r) => {
    paintGrass(c, r);
    overlay(c, [
      '...kkkkkkkk.....',
      '..kRRRRRRRRk....',
      '.kRRRRRRRRRRk...',
      '..kNk....kNk....',
      '..kNk.kk.kNk....',
      '..kNk.kn.kNk....',
      '.kmmmmmmmmmmk...',
      'kmcMcMcMcMcmk...',
      'kmceeeeeeecmk...',
      'kmcMeeeeeMcmk...',
      '.kmmmmmmmmmk....',
      '..kkkkkkkkk.....',
    ], 1, 2);
  }, 221),
  shellSand: tile((c, r) => {
    paintSand(c, r);
    overlay(c, [
      '..kfk...........',
      '.kfwfk....kok...',
      '..kfk....kowok..',
      '..........kok...',
      '....kck.........',
      '...kcwck........',
      '....kck.........',
    ], 1, 5);
  }, 223),
};

// Context-aware decor: transparent overlays composited onto whatever ground
// tile actually surrounds them, so a sign in a tech city sits on tech floor.
function overlayOnly(rows, ox = 0, oy = 0) {
  const cv = document.createElement('canvas');
  cv.width = TILE; cv.height = TILE;
  overlay(cv.getContext('2d'), rows, ox, oy);
  return cv;
}

export const OVERLAYS = {
  sign: overlayOnly([
    '.kkkkkkkkkkkk...',
    'kYYYYYYYYYYYYk..',
    'kYDDDkDDDDkYYk..',
    'kYYYYYYYYYYYYk..',
    'kYDDDDkDDDYYYk..',
    'kYYYYYYYYYYYYk..',
    '.kkkkkNNkkkkk...',
    '.....kNNk.......',
    '.....kDDk.......',
    '....kkkkkk......',
  ], 0, 3),
  lamp: overlayOnly([
    '......kk........',
    '....kkyykk......',
    '....kyIIyk......',
    '....kyIIyk......',
    '....kkyykk......',
    '.....kkkk.......',
    '......MM........',
    '......MM........',
    '......MM........',
    '......MM........',
    '.....kMMk.......',
    '....kMMMMk......',
    '...kkkkkkkk.....',
  ], 0, 1),
  planter: overlayOnly([
    '..f.y..f..y.f...',
    '.fyfyffyfyfyff..',
    '.kgggggggggggk..',
    'kmcccccccccccmk.',
    'kmcccccccccccmk.',
    'kmmmmmmmmmmmmmk.',
    '.kkkkkkkkkkkkk..',
  ], 0, 6),
};
