// Node-side validation: syntax-parses the whole module graph, then runs
// data-integrity checks on maps/dialogs/enemies (the DOM-free modules).
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
let failures = 0;
const fail = (msg) => { failures++; console.error('FAIL:', msg); };

// 1) Parse check: importing main.js parses every module in the graph.
//    DOM ReferenceErrors are expected (no browser); SyntaxErrors are bugs.
try {
  await import(join(root, 'src/main.js'));
  console.log('parse: main graph imported clean (unexpected but fine)');
} catch (e) {
  if (e instanceof SyntaxError) fail(`syntax error in module graph: ${e.message}`);
  else console.log(`parse: OK (graph parsed; runtime stopped at expected "${e.message.slice(0, 60)}")`);
}

// 2) Data integrity (DOM-free modules only)
const { MAPS, SOLID } = await import(join(root, 'src/data/maps.js'));
const { SCRIPT } = await import(join(root, 'src/data/script.js'));
const { ENEMIES } = await import(join(root, 'src/data/enemies.js'));

const NPC_SPRITES = new Set([
  'villager', 'villagerRed', 'villagerGreen', 'villagerOrange', 'villagerTeal',
  'villagerPink', 'elder', 'kid', 'clerk', 'sage', 'guard',
]);
const GEAR = new Set(['blade', 'mirror', 'sigil', 'visor', 'armor', 'crown']);

const dialogIds = new Set(Object.keys(SCRIPT));
const needDialog = (id, where) => {
  if (id && !dialogIds.has(id)) fail(`${where}: missing dialog '${id}'`);
};

for (const [mid, map] of Object.entries(MAPS)) {
  const g = map.grid;
  const wdt = g[0].length;
  for (const [y, row] of g.entries()) {
    if (row.length !== wdt) fail(`${mid}: row ${y} width ${row.length} != ${wdt}`);
  }
  const walkable = (x, y) => {
    if (y < 0 || y >= g.length || x < 0 || x >= wdt) return false;
    const ch = g[y][x];
    const carved = (map.portals || []).some((p) => p.x === x && p.y === y && p.carve);
    return !SOLID.has(ch) || carved;
  };
  needDialog(map.onEnter, `${mid}.onEnter`);
  for (const npc of map.npcs || []) {
    if (npc.x < 0 || npc.x >= wdt || npc.y < 0 || npc.y >= g.length) fail(`${mid}/${npc.id}: out of bounds`);
    const ch = g[npc.y][npc.x];
    const isSign = npc.id.startsWith('sign');
    if (!isSign && SOLID.has(ch)) fail(`${mid}/${npc.id}: standing on solid '${ch}' at ${npc.x},${npc.y}`);
    if (isSign && ch !== 'S') fail(`${mid}/${npc.id}: sign npc not on S tile (found '${ch}')`);
    if (npc.sprite && !npc.sprite.startsWith('enemy:') && !NPC_SPRITES.has(npc.sprite)) fail(`${mid}/${npc.id}: unknown sprite ${npc.sprite}`);
    if (npc.sprite && npc.sprite.startsWith('enemy:') && !ENEMIES[npc.sprite.slice(6)]) fail(`${mid}/${npc.id}: unknown enemy art ${npc.sprite}`);
    if (npc.boss && !ENEMIES[npc.boss]) fail(`${mid}/${npc.id}: unknown boss ${npc.boss}`);
    if (npc.battle && !ENEMIES[npc.battle]) fail(`${mid}/${npc.id}: unknown battle enemy ${npc.battle}`);
    if (npc.gear && !GEAR.has(npc.gear)) fail(`${mid}/${npc.id}: unknown gear ${npc.gear}`);
    needDialog(npc.pre, `${mid}/${npc.id}.pre`);
    needDialog(npc.win, `${mid}/${npc.id}.win`);
    for (const d of Object.values(npc.dialog || {})) needDialog(d, `${mid}/${npc.id}.dialog`);
    // interactable: at least one adjacent walkable tile
    const adj = [[0, 1], [0, -1], [1, 0], [-1, 0]].some(([dx, dy]) => walkable(npc.x + dx, npc.y + dy));
    if (!adj) fail(`${mid}/${npc.id}: unreachable (no adjacent walkable tile)`);
  }
  for (const p of map.portals || []) {
    if (!MAPS[p.to]) { fail(`${mid}: portal to unknown map ${p.to}`); continue; }
    const dest = MAPS[p.to].grid;
    const dch = dest[p.ty] && dest[p.ty][p.tx];
    const destCarved = (MAPS[p.to].portals || []).some((q) => q.x === p.tx && q.y === p.ty && q.carve);
    if (dch === undefined || (SOLID.has(dch) && !destCarved)) fail(`${mid}: portal lands on solid/void '${dch}' at ${p.to} ${p.tx},${p.ty}`);
    needDialog(p.blockMsg, `${mid}.portal.blockMsg`);
    // portal must be adjacent-reachable
    const adj = [[0, 1], [0, -1], [1, 0], [-1, 0]].some(([dx, dy]) => walkable(p.x + dx, p.y + dy));
    if (!adj) fail(`${mid}: portal at ${p.x},${p.y} unreachable`);
  }
  for (const eid of map.encounters?.groups || []) {
    if (!ENEMIES[eid]) fail(`${mid}: unknown encounter enemy ${eid}`);
  }
}

// 2b) Connectivity: from each map's first portal, every NPC and every other
//     portal must be reachable (treating NPCs as non-blocking for BFS).
for (const [mid, map] of Object.entries(MAPS)) {
  const g = map.grid;
  const wdt = g[0].length;
  const carved = new Set((map.portals || []).map((p) => `${p.x},${p.y}`));
  const open = (x, y) =>
    x >= 0 && y >= 0 && x < wdt && y < g.length && (!SOLID.has(g[y][x]) || carved.has(`${x},${y}`));
  const start = (map.portals || [])[0];
  if (!start) continue;
  const seen = new Set([`${start.x},${start.y}`]);
  const queue = [[start.x, start.y]];
  while (queue.length) {
    const [x, y] = queue.shift();
    for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
      const k = `${x + dx},${y + dy}`;
      if (!seen.has(k) && open(x + dx, y + dy)) { seen.add(k); queue.push([x + dx, y + dy]); }
    }
  }
  for (const p of map.portals || []) {
    if (!seen.has(`${p.x},${p.y}`)) fail(`${mid}: portal at ${p.x},${p.y} not reachable from first portal`);
  }
  for (const npc of map.npcs || []) {
    const adj = [[0, 1], [0, -1], [1, 0], [-1, 0]].some(([dx, dy]) => seen.has(`${npc.x + dx},${npc.y + dy}`));
    if (!adj && !npc.id.startsWith('sign')) fail(`${mid}/${npc.id}: not reachable from first portal`);
    if (!adj && npc.id.startsWith('sign') && !seen.has(`${npc.x},${npc.y - 1}`) && !seen.has(`${npc.x},${npc.y + 1}`)) {
      fail(`${mid}/${npc.id}: sign not readable from any reachable tile`);
    }
  }
}

// 3) Enemy sanity
for (const [id, e] of Object.entries(ENEMIES)) {
  if (!e.codex || !e.codex.title || !e.codex.threat || !e.codex.stat || !e.codex.answer) fail(`enemy ${id}: incomplete codex`);
  if (!e.attacks?.length) fail(`enemy ${id}: no attacks`);
}

// 3b) Song channel sync: channels loop independently, so every channel's total
//     sixteenths must divide the longest channel's, or they drift and clash.
const { SONGS } = await import(join(root, 'src/engine/audio.js'));
for (const [name, song] of Object.entries(SONGS)) {
  const lens = {};
  for (const ch of ['lead', 'bass', 'noise']) {
    if (!song[ch] || !song[ch].trim()) continue;
    lens[ch] = song[ch].trim().split(/\s+/).reduce((a, t) => a + parseInt(t.split(':')[1] || '1'), 0);
  }
  const max = Math.max(...Object.values(lens));
  for (const [ch, len] of Object.entries(lens)) {
    if (max % len !== 0) fail(`song ${name}: ${ch} length ${len} does not divide longest channel ${max} (channels will desync)`);
  }
}

// 4) Sprite grid sanity: read sprites.js as text, check ASCII grids are rectangles
import { readFileSync } from 'fs';
const spriteSrc = readFileSync(join(root, 'src/art/sprites.js'), 'utf8');
const gridRe = /const (\w+) = \[((?:\s*'[^']*',?)+)\s*\]/g;
let m;
while ((m = gridRe.exec(spriteSrc))) {
  const name = m[1];
  const rows = [...m[2].matchAll(/'([^']*)'/g)].map((r) => r[1]);
  const w = rows[0].length;
  rows.forEach((r, i) => {
    if (r.length !== w) console.warn(`warn: sprite ${name} row ${i} width ${r.length} != ${w} (compile() pads, cosmetic only)`);
  });
}

console.log(failures ? `\n${failures} FAILURES` : '\nALL DATA CHECKS PASSED');
process.exit(failures ? 1 : 0);
