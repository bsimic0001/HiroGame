// World data. Grids are ASCII; rows are normalized (padded with the map's
// border char) so the outer edge is always solid. Portals may carve floor.
//
// Tile chars: g grass, f flowers, i tall grass, p path, a sand, w water,
// t tree, u bush, n fence, l lamp, W wall, o window wall, R roof, F floor,
// c cave floor, C cave wall, y crystal, T tech floor, r tech trace,
// X tech wall, z console, v vault rune, d door, S sign, b bridge,
// B boulder, K counter, . void

export const SOLID = new Set(['w', 't', 'u', 'n', 'l', 'W', 'o', 'R', 'C', 'y', 'X', 'z', 'B', 'K', 'S', '.']);

export const TILE_FOR = {
  g: 'grass', f: 'flowers', i: 'tallgrass', p: 'path', a: 'sand', w: 'water',
  t: 'tree', u: 'bush', n: 'fence', l: 'lamp',
  W: 'wall', o: 'windowWall', R: 'roof', F: 'floor',
  c: 'caveFloor', C: 'caveWall', y: 'crystal',
  T: 'techFloor', r: 'techTrace', X: 'techWall', z: 'console',
  v: 'vaultRune', d: 'door', S: 'sign', D: 'caveMouth', h: 'stairs',
  b: 'bridge', B: 'boulder', K: 'counter', '.': 'void',
};

function norm(rows, border) {
  const w = Math.max(...rows.map((r) => r.length));
  const out = rows.map((r) => r.padEnd(w, border).split(''));
  for (let x = 0; x < w; x++) { out[0][x] = border; out[out.length - 1][x] = border; }
  for (let y = 0; y < out.length; y++) { out[y][0] = border; out[y][w - 1] = border; }
  return out;
}

export const MAPS = {
  // ------------------------------------------------------ CH1: LOGINSHIRE
  loginshire: {
    name: 'LOGINSHIRE VILLAGE', border: 't', music: 'town', onEnter: 'intro',
    grid: norm([
      'tttttttttttttttttttttttttt',
      'ttgggggiggggggggggggigggtt',
      'tgRRRRRggfggggggggRRRRRggt',
      'tgRRRRRgggggiiggggRRRRRggt',
      'tgWoWoWgggggggggggWoWoWggt',
      'tggfggggguugggggggggggfgt',
      'tggggggggggggggggggggggggt',
      'tgggSgggggffggggggggKggggt',
      'tgguggggglggggggglgggguggt',
      'tppppppppppppppppppppppppt',
      'tggggggggggggggggnnnnnnggt',
      'tggwwwwggggggggggnffffnggt',
      'tggwwwwggggggggggnffffnggt',
      'tgggggggggggggggggnnnnnggt',
      'tgggiigggugggggggggggggggt',
      'tttttttttttttttttttttttttt',
    ], 't'),
    npcs: [
      { id: 'sage', x: 12, y: 6, sprite: 'sage', dialog: { default: 'sage1', boss1: 'sage1_after' } },
      { id: 'grump', x: 10, y: 11, sprite: 'villagerRed', dialog: { default: 'v_rotate' } },
      { id: 'kid', x: 13, y: 12, sprite: 'kid', dialog: { default: 'v_kid' } },
      { id: 'shopkeep', x: 20, y: 6, sprite: 'villagerOrange', action: 'shop', dialog: { default: 'shop_hello' } },
      { id: 'healer', x: 8, y: 6, sprite: 'clerk', action: 'heal', dialog: { default: 'healer' } },
      { id: 'sign1', x: 4, y: 7, sprite: null, dialog: { default: 'sign_loginshire' } },
    ],
    portals: [
      { x: 25, y: 9, carve: 'p', to: 'shoals', tx: 1, ty: 8 },
    ],
  },

  // ------------------------------------------------------ CH1: THE SHOALS
  shoals: {
    name: 'THE PHISHING SHOALS', border: 'w', music: 'overworld',
    encounters: { rate: 0.055, groups: ['phishkoi', 'phishkoi', 'spearphish', 'angler'] },
    grid: norm([
      'wwwwwwwwwwwwwwwwwwwwwwwwwwwwww',
      'wwaaaaaaawwwwwaaaaaaaaaawwwwww',
      'waaaaaaaaaawwaaaaaaaaaaaaawwww',
      'waaaaaaaaaaaaaaaaaawwaaaaaawww',
      'wwaaaawwaaaaaaaaaawwwwaaaaaaww',
      'wwaaawwwwaaaaaaaaaawwaaaaaaaww',
      'waaaaawwaaaaaaaaaaaaaaaawwaaaw',
      'waaaaaaaaaaawwaaaaaaaaawwaaaaw',
      'paaaaaaaaaawwwwaaaaaaaaaaabbbb',
      'waaaaaaaaaaawwaaaaaaaaaaaabbbb',
      'waaaaSaaaaaaaaaaaaaaawwaaaaaaw',
      'wwaaaaaaawwaaaaaaaaawwwwaaaaww',
      'wwwaaaaawwwwaaaaaaaawwaaaaawww',
      'wwwwaaaaawwaaaaaaaaaaaaaaawwww',
      'wwwwwaaaaaaaaaawwaaaaaawwwwwww',
      'wwwwwwwwwwwwwwwwwwwwwwwwwwwwww',
    ], 'w'),
    npcs: [
      { id: 'sign2', x: 5, y: 10, sprite: null, dialog: { default: 'sign_shoals' } },
      {
        id: 'phisherking', x: 26, y: 8, sprite: 'enemy:phisherking',
        boss: 'phisherking', pre: 'b1_pre', win: 'b1_win',
        flag: 'boss1', gear: 'blade', hideOnFlag: 'boss1', music: 'boss',
      },
    ],
    portals: [
      { x: 0, y: 8, carve: 'p', to: 'loginshire', tx: 24, ty: 9 },
      { x: 29, y: 8, carve: 'b', to: 'onboarding', tx: 1, ty: 12, require: 'boss1' },
      { x: 29, y: 9, carve: 'b', to: 'onboarding', tx: 1, ty: 12, require: 'boss1' },
    ],
  },

  // -------------------------------------------------- CH2: ONBOARDING GATE
  onboarding: {
    name: 'THE ONBOARDING GATE', border: 'W', music: 'town', onEnter: 'ch2_intro',
    grid: norm([
      'WWWWWWWWWWWWWWWWWWWWWWWWWW',
      'WppppppppppppppppppppppppW',
      'WpRRRRRppppppppppRRRRRpppW',
      'WpRRRRRppppppppppRRRRRpppW',
      'WpWoWoWppppppppppWoWoWpppW',
      'WppplpppppppppppppppplpppW',
      'WpppppppppWodWoppppppppppW',
      'WpppppppppWoWoWppppppppppW',
      'WppppppppppppppppppppKpppW',
      'WppppppppppppppppppppppppW',
      'WpppSpppppppppppppppppppppW',
      'WppppppppppppppppppppppppW',
      'pppppppppppppppppppppppppW',
      'WppppppppppppppppppppppppW',
      'WppppppppppppppppppppppppW',
      'WWWWWWWWWWWWWWWWWWWWWWWWWW',
    ], 'W'),
    npcs: [
      { id: 'registrar', x: 12, y: 9, sprite: 'clerk', gear: 'mirror', flag: 'got_mirror',
        dialog: { default: 'registrar', got_mirror: 'registrar2' } },
      { id: 'captain', x: 16, y: 6, sprite: 'guard', dialog: { default: 'captain', boss2: 'captain_after' } },
      { id: 'sus', x: 20, y: 12, sprite: 'villager', battle: 'lazarus',
        pre: 'sus_pre', win: 'sus_win', flag: 'susfight', hideOnFlag: 'susfight' },
      { id: 'shopkeep2', x: 22, y: 8, sprite: 'villagerOrange', action: 'shop', dialog: { default: 'shop_hello' } },
      { id: 'healer2', x: 5, y: 5, sprite: 'clerk', action: 'heal', dialog: { default: 'healer' } },
      { id: 'sign3', x: 4, y: 10, sprite: null, dialog: { default: 'sign_onboarding' } },
      { id: 'newhire', x: 8, y: 11, sprite: 'villagerGreen', dialog: { default: 'v_newhire' } },
    ],
    portals: [
      { x: 0, y: 12, carve: 'p', to: 'shoals', tx: 28, ty: 8 },
      { x: 12, y: 6, to: 'gatehall', tx: 11, ty: 12, require: 'got_mirror', blockMsg: 'gate_blocked' },
    ],
  },

  // ----------------------------------------------------- CH2: THE GATEHALL
  gatehall: {
    name: 'THE GATEHALL', border: 'W', music: 'overworld',
    encounters: { rate: 0.06, groups: ['doppel', 'lazarus', 'doppel'] },
    grid: norm([
      'WWWWWWWWWWWWWWWWWWWWWW',
      'WFFFFFFFFFWWFFFFFFFFFW',
      'WFFFFFFFFFFFFFFFFFFFFW',
      'WFFWWFFFFFFFFFFFWWFFFW',
      'WFFWWFFFFFFFFFFFWWFFFW',
      'WFFFFFFFFFWWFFFFFFFFFW',
      'WFFFFFFFFFWWFFFFFFFFFW',
      'WFFWWFFFFFFFFFFFWWFFFW',
      'WFFWWFFFFFFFFFFFWWFFFW',
      'WFFFFFFFFFFFFFFFFFFFFW',
      'WFFFFFFFFFWWFFFFFFFFFW',
      'WFFFFFFFFFWWFFFFFFFFFW',
      'WFFFFFFFFFFFFFFFFFFFFW',
      'WWWWWWWWWWWdWWWWWWWWWW',
    ], 'W'),
    npcs: [
      {
        id: 'doppelprime', x: 11, y: 2, sprite: 'enemy:doppelprime',
        boss: 'doppelprime', pre: 'b2_pre', win: 'b2_win',
        flag: 'boss2', hideOnFlag: 'boss2', music: 'boss',
      },
    ],
    portals: [
      { x: 11, y: 13, to: 'onboarding', tx: 12, ty: 5 },
      { x: 11, y: 1, carve: 'h', to: 'keep', tx: 12, ty: 13, require: 'boss2', blockMsg: 'hall_blocked' },
    ],
  },

  // ---------------------------------------------------- CH3: HELP DESK KEEP
  keep: {
    name: 'HELP DESK KEEP', border: 'W', music: 'town', onEnter: 'ch3_intro',
    grid: norm([
      'WWWWWWWWWWWWWWWWWWWWWWWWWW',
      'WFFFFFFFFFFFFFFFFFFFFFFFFW',
      'WFFKKKKKFFFFFFFFFKKKKKFFFW',
      'WFFFFFFFFFFFFFFFFFFFFFFFFW',
      'WFFFFFFFFFFFFFFFFFFFFFFFFW',
      'WFFFFFFFFFFFFFFFFFFFFFFFFW',
      'WWWWWWWWWWWFFFFWWWWWWWWWWW',
      'WggugggggggpppgggggguggggW',
      'WggggggggglppplggggggggggW',
      'WggffgggggppppppggggffgggW',
      'WgggiggggggpppggggggiggggW',
      'WgggggggggCCCCCCggggggggggW',
      'WgggggggggCccccCggggggggggW',
      'WgggggggggCcDDcCggggggggggW',
      'WggggggggggggggggggggggggW',
      'WWWWWWWWWWWWWWWWWWWWWWWWWW',
    ], 'W'),
    npcs: [
      { id: 'deskclerk', x: 5, y: 3, sprite: 'clerk', gear: 'sigil', flag: 'got_sigil',
        dialog: { default: 'deskclerk', got_sigil: 'deskclerk2' } },
      { id: 'deskclerk_b', x: 19, y: 3, sprite: 'clerk', action: 'heal', dialog: { default: 'healer_keep' } },
      { id: 'caller', x: 8, y: 9, sprite: 'villagerPink', dialog: { default: 'v_caller' } },
      { id: 'shopkeep3', x: 17, y: 9, sprite: 'villagerOrange', action: 'shop', dialog: { default: 'shop_hello' } },
      { id: 'guard_keep', x: 12, y: 10, sprite: 'guard', dialog: { default: 'guard_keep', boss3: 'guard_keep_after' } },
    ],
    portals: [
      { x: 12, y: 13, to: 'caverns', tx: 2, ty: 2, require: 'got_sigil', blockMsg: 'cavern_blocked' },
      { x: 13, y: 13, to: 'caverns', tx: 2, ty: 2, require: 'got_sigil', blockMsg: 'cavern_blocked' },
    ],
  },

  // ---------------------------------------------------- CH3: RESET CAVERNS
  caverns: {
    name: 'THE RESET CAVERNS', border: 'C', music: 'overworld',
    encounters: { rate: 0.06, groups: ['vishimp', 'pushbomber', 'vishimp', 'pushbomber'] },
    grid: norm([
      'CCCCCCCCCCCCCCCCCCCCCCCCCCCCCC',
      'CcyccCCCCCcccccccCCCCCccyccccC',
      'CccccccCCCcccccccccCCCcccccccC',
      'CCCccccccccccCCCcccccccCCCcccC',
      'CCCCCcccCCCccCCCCCcccccccccccC',
      'CccccccCCCCCccccCCCCCcccCCCccC',
      'CccCCCcycccccccccccCCCcccccccC',
      'CccCCCcccCCCCCcccccccccccCCCcC',
      'CcccccccCCCCCCCcccCCCcccccccC',
      'CCCcccccccCCCcccccCCCcccCCCccC',
      'CCCCCcccccccccccccccccccCCCCcC',
      'CcccccccCCCcccCCCCCccccccccccC',
      'CccCCCcccccccccCCCccyccCCCcccC',
      'CcccccccccCCCccccccccccccccccC',
      'CCCCCCCCCCCCCCCCCCCCCCCCCCCCCC',
    ], 'C'),
    npcs: [
      {
        id: 'scatteredspider', x: 26, y: 12, sprite: 'enemy:scatteredspider',
        boss: 'scatteredspider', pre: 'b3_pre', win: 'b3_win',
        flag: 'boss3', hideOnFlag: 'boss3', music: 'boss',
      },
    ],
    portals: [
      { x: 2, y: 1, carve: 'h', to: 'keep', tx: 12, ty: 12 },
      { x: 28, y: 13, carve: 'D', to: 'frontier', tx: 1, ty: 7, require: 'boss3', blockMsg: 'web_blocked' },
    ],
  },

  // ------------------------------------------------- CH4: ENDPOINT FRONTIER
  frontier: {
    name: 'THE ENDPOINT FRONTIER', border: 'X', music: 'overworld', onEnter: 'ch4_intro',
    encounters: { rate: 0.06, groups: ['keylogger', 'tokenthief', 'simshift', 'stufferzombie'] },
    grid: norm([
      'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      'XTTTTTTXXTTTTTTTTTXXTTTTTTTTTX',
      'XTTrTTTTTTTTTXXTTTTrTTTXXTTTTX',
      'XTTXXTTTzXXTTXXTTTXXTTTTTTTTTX',
      'XTTXXTTTTXXTTTTTTTXXTTXXXXTTTX',
      'XTTTrTTTTTTTTTTTTrTTTTXXTTTTTX',
      'XTTTTXXTTTTTXXXXTTTTTTTTTTXXTX',
      'pTTTTXXTTTTTXXXXTTTXXTTTTTTTTX',
      'XTTTTTrTTTTTTTTTTTTXXTTXXTTTTX',
      'XTTXXTTTTXXTTTTTTTTTTTTXXTTTTX',
      'XTTXXTTXXXXTTTXXTTTTXXTTTTTTTX',
      'XTTTTTTXXTTTTzXXTTTTXXTTXXTTTX',
      'XTTTTTTTTTTTTTTTTTTTTTTTXXTTTX',
      'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
    ], 'X'),
    npcs: [
      { id: 'engineer', x: 3, y: 6, sprite: 'villagerTeal', gear: 'visor', flag: 'got_visor',
        dialog: { default: 'engineer', got_visor: 'engineer2' } },
      { id: 'quartermaster', x: 14, y: 9, sprite: 'guard', gear: 'armor', flag: 'got_armor',
        dialog: { default: 'quartermaster', got_armor: 'quartermaster2' } },
      {
        id: 'stuffer', x: 27, y: 12, sprite: 'enemy:stuffer',
        boss: 'stuffer', pre: 'b4_pre', win: 'b4_win',
        flag: 'boss4', hideOnFlag: 'boss4', music: 'boss',
      },
    ],
    portals: [
      { x: 0, y: 7, carve: 'T', to: 'caverns', tx: 27, ty: 13 },
      { x: 29, y: 12, carve: 'T', to: 'capital', tx: 1, ty: 12, require: 'boss4', blockMsg: 'frontier_blocked' },
    ],
  },

  // ----------------------------------------------------- CH5: THE CAPITAL
  capital: {
    name: 'IDENTIA CAPITAL', border: 'X', music: 'town', onEnter: 'ch5_intro',
    grid: norm([
      'XXXXXXXXXXXXXXXXXXXXXXXXXX',
      'XTTTTTTTTTTTXXTTTTTTTTTTTX',
      'XTXXXXTTTTTTXXTTTTTXXXXTTX',
      'XTXXXXTTTTTTddTTTTTXXXXTTX',
      'XTTTTTTTTTTTrTTTTTTTTTTTTX',
      'XTTTTTTTTTTTTTTTTTTzTTKTTTX',
      'XTTTTlTTTTTTTTTTTTTTlTTTTX',
      'XTTSTTTTTTTTTTTTTTTTTTTTTX',
      'XTTTTTTTTTTTTTTTTTTTTTTTTX',
      'XTTTTTTTTrTTTTTTTrTTTTTTTX',
      'XTTTTTTTTTTTTTTTTTTTTTTTTX',
      'XTTlTTTTTTTTTTTTTTTTTlTTTX',
      'pTTTTTTTTTTTTTTTTTTTTTTTTX',
      'XTTTTTTTrTTTTTTTTTTTTTTTTX',
      'XXXXXXXXXXXXXXXXXXXXXXXXXX',
    ], 'X'),
    npcs: [
      { id: 'sage_c', x: 12, y: 8, sprite: 'sage', gear: 'crown', flag: 'got_crown',
        dialog: { default: 'sage_crown', got_crown: 'sage_crown2' } },
      { id: 'otis', x: 5, y: 5, sprite: 'villagerGreen', dialog: { default: 'v_otis' } },
      { id: 'banker', x: 19, y: 10, sprite: 'guard', dialog: { default: 'v_banker' } },
      { id: 'panicked', x: 8, y: 11, sprite: 'villagerPink', dialog: { default: 'v_panic' } },
      { id: 'shopkeep4', x: 20, y: 5, sprite: 'villagerOrange', action: 'shop', dialog: { default: 'shop_hello' } },
      { id: 'healer4', x: 16, y: 7, sprite: 'clerk', action: 'heal', dialog: { default: 'healer' } },
      { id: 'sign5', x: 3, y: 7, sprite: null, dialog: { default: 'sign_capital' } },
    ],
    portals: [
      { x: 0, y: 12, carve: 'T', to: 'frontier', tx: 28, ty: 12 },
      { x: 12, y: 3, to: 'vault', tx: 12, ty: 15, require: 'got_crown', blockMsg: 'vault_blocked' },
      { x: 13, y: 3, to: 'vault', tx: 12, ty: 15, require: 'got_crown', blockMsg: 'vault_blocked' },
    ],
  },

  // ----------------------------------------------------- FINALE: THE VAULT
  vault: {
    name: 'VAULT OF SHARED SECRETS', border: 'X', music: 'vault', onEnter: 'vault_intro',
    encounters: { rate: 0.07, groups: ['rogueagent', 'rogueagent'] },
    grid: norm([
      'XXXXXXXXXXXXXXXXXXXXXXXXXX',
      'XvvvvvvvvvvvvvvvvvvvvvvvvX',
      'XvTTTTTTTTTTTTTTTTTTTTTTvX',
      'XvTTXXXXTTTTTTTTTTXXXXTTvX',
      'XvTTXXXXTTvvvvvvTTXXXXTTvX',
      'XvTTTTTTTTvTTTTvTTTTTTTTvX',
      'XvTTTTTTTTvTTTTvTTTTTTTTvX',
      'XvTTXXTTTTvvTTvvTTTTXXTTvX',
      'XvTTXXTTTTrTTTTTTTTTXXTTvX',
      'XvTTTTTTXXTTTTTTXXTTTTTTvX',
      'XvTTTTTTXXTTrTTTXXTTTTTTvX',
      'XvTTTTrTTTTTTTTTTTTrTTTTvX',
      'XvTTTTTTTTTTTTTTTTTTTTTTvX',
      'XvvvvvvvvvTTTTTTvvvvvvvvvX',
      'XTTTTTTTTTTTTTTTTTTTTTTTTX',
      'XTTTTTTTTTTTdTTTTTTTTTTTTX',
      'XXXXXXXXXXXXXXXXXXXXXXXXXX',
    ], 'X'),
    npcs: [
      {
        id: 'kobold', x: 12, y: 5, sprite: 'enemy:kobold',
        boss: 'kobold', pre: 'b5_pre', win: 'b5_win',
        flag: 'boss5', hideOnFlag: 'boss5', music: 'boss',
      },
    ],
    portals: [
      { x: 12, y: 16, carve: 'T', to: 'capital', tx: 12, ty: 4 },
    ],
  },
};
