import { Scenes } from '../engine/scenes.js';
import { Input } from '../engine/input.js';
import { Audio } from '../engine/audio.js';
import { Game } from '../engine/state.js';
import { drawText, drawTextCentered } from '../engine/font.js';
import { Dialog, Menu, panel } from '../engine/ui.js';
import { MAPS, SOLID, TILE_FOR } from '../data/maps.js';
import { TILES, TILE, OVERLAYS } from '../art/tiles.js';
import { HIRO, NPCS } from '../art/sprites.js';
import { ENEMY_ART } from '../art/sprites.js';
import { getDialog } from '../data/script.js';
import { ITEMS } from '../data/items.js';
import { knownSkills } from '../data/skills.js';

const W = 240, H = 160;
const SPEED = 72; // px per second

let map = null;
let mode = 'walk';        // walk | dialog | pause | shop | status
let dialog = null;
let dialogThen = null;    // callback when dialog completes
let pauseMenu = null, itemMenu = null, shopMenu = null;
let px = 0, py = 0;       // pixel position
let moving = false, mx = 0, my = 0; // movement target px
let animT = 0, fade = 0;
let bannerT = 0; // map-name banner visibility timer
let graceSteps = 0; // steps remaining with no random encounters

function tileAt(x, y) {
  if (!map || y < 0 || y >= map.grid.length || x < 0 || x >= map.grid[0].length) return 'W';
  return map.grid[y][x];
}
function npcAt(x, y) {
  return map.npcs.find((n) => n.x === x && n.y === y && !(n.hideOnFlag && Game.s.flags[n.hideOnFlag]));
}
function portalAt(x, y) {
  return (map.portals || []).find((p) => p.x === x && p.y === y);
}
function walkable(x, y) {
  const ch = tileAt(x, y);
  const portal = portalAt(x, y);
  if (SOLID.has(ch) && !(portal && portal.carve)) return false;
  if (npcAt(x, y)) return false;
  return true;
}

function say(pages, then = null) {
  dialog = new Dialog(Array.isArray(pages) ? pages : getDialog(pages));
  dialogThen = then;
  mode = 'dialog';
}

function applyGear(gearId) {
  Game.s.gear[gearId] = true;
  Audio.sfx('levelup');
}

function loadMap(id) {
  map = MAPS[id];
  Game.s.map = id;
  // apply carves so portals are walkable
  for (const p of map.portals || []) {
    if (p.carve) map.grid[p.y][p.x] = p.carve;
  }
  Audio.play(map.music || 'overworld');
  bannerT = 3;
  graceSteps = 8; // breathing room when entering a map
  Game.save();
  const seenFlag = 'seen_' + id;
  if (map.onEnter && !Game.s.flags[seenFlag]) {
    Game.s.flags[seenFlag] = true;
    say(map.onEnter);
  }
}

function setPos(tx, ty) {
  Game.s.x = tx; Game.s.y = ty;
  px = tx * TILE; py = ty * TILE;
  moving = false;
}

function startBattle(npc) {
  const enemyId = npc.boss || npc.battle;
  Scenes.go('battle', {
    enemyId,
    npcId: npc.id,
    boss: !!npc.boss,
    music: npc.music || 'battle',
    biome: Game.s.map,
  });
}

function resolveNpc(npc) {
  if (npc.boss || npc.battle) {
    say(npc.pre, () => startBattle(npc));
    return;
  }
  if (npc.gear && !Game.s.flags[npc.flag]) {
    say(npc.dialog.default, () => {
      Game.s.flags[npc.flag] = true;
      applyGear(npc.gear);
      Game.save();
    });
    return;
  }
  if (npc.action === 'heal') {
    say(npc.dialog.default, () => {
      Game.s.hp = Game.s.maxHp; Game.s.tp = Game.s.maxTp;
      Audio.sfx('heal');
      Game.save();
    });
    return;
  }
  if (npc.action === 'shop') {
    say(npc.dialog.default, () => openShop());
    return;
  }
  // flag-aware dialog choice: pick the last matching flagged variant
  let id = npc.dialog.default;
  for (const [flag, did] of Object.entries(npc.dialog)) {
    if (flag !== 'default' && Game.s.flags[flag]) id = did;
  }
  say(id);
}

function openShop() {
  shopMenu = new Menu(
    ITEMS.map((it) => ({ label: it.name, value: it.id, note: `${it.price}G` }))
      .concat([{ label: 'LEAVE', value: 'leave' }]),
  );
  mode = 'shop';
}

function openPause() {
  pauseMenu = new Menu([
    { label: 'ITEMS', value: 'items' },
    { label: 'STATUS', value: 'status' },
    { label: 'THREAT CODEX', value: 'codex' },
    { label: Audio.muted ? 'SOUND: OFF' : 'SOUND: ON', value: 'mute' },
    { label: 'QUIT TO TITLE', value: 'quit' },
    { label: 'CLOSE', value: 'close' },
  ]);
  mode = 'pause';
  Audio.sfx('select');
}

function openItems() {
  const entries = ITEMS.filter((it) => Game.s[it.id] > 0)
    .map((it) => ({ label: it.name, value: it.id, note: `X${Game.s[it.id]}` }));
  if (!entries.length) entries.push({ label: '(EMPTY POCKETS)', value: 'none' });
  entries.push({ label: 'BACK', value: 'back' });
  itemMenu = new Menu(entries);
  mode = 'items';
}

function tryStep(dir) {
  Game.s.facing = dir;
  const d = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[dir];
  const tx = Game.s.x + d[0], ty = Game.s.y + d[1];
  const portal = portalAt(tx, ty);
  if (portal && portal.require && !Game.s.flags[portal.require]) {
    if (portal.blockMsg) say(portal.blockMsg);
    else Audio.sfx('bump');
    return;
  }
  if (!walkable(tx, ty)) { return; }
  moving = true;
  mx = tx * TILE; my = ty * TILE;
  Game.s.x = tx; Game.s.y = ty;
}

function arrive() {
  moving = false;
  px = mx; py = my;
  Game.s.steps++;
  const portal = portalAt(Game.s.x, Game.s.y);
  if (portal && (!portal.require || Game.s.flags[portal.require])) {
    fade = 0.35;
    loadMap(portal.to);
    setPos(portal.tx, portal.ty);
    return;
  }
  // random encounters (after a grace window so battles never chain instantly)
  if (graceSteps > 0) { graceSteps--; return; }
  if (map.encounters && Math.random() < map.encounters.rate) {
    graceSteps = 6;
    const g = map.encounters.groups;
    const enemyId = g[Math.floor(Math.random() * g.length)];
    Audio.sfx('encounter');
    Scenes.go('battle', { enemyId, boss: false, music: 'battle', biome: Game.s.map });
  }
}

Scenes.register('overworld', {
  enter(params) {
    mode = 'walk';
    dialog = null;
    dialogThen = null;
    const returning = params.fromBattle;
    if (!map || !returning) {
      map = null;
      loadMap(Game.s.map); // may open the map's intro dialog via say()
    } else {
      Audio.play(map.music || 'overworld');
    }
    setPos(Game.s.x, Game.s.y);

    if (params.fromBattle === 'win' && params.npcId) {
      const npc = map.npcs.find((n) => n.id === params.npcId);
      if (npc) {
        say(npc.win, () => {
          if (npc.flag) Game.s.flags[npc.flag] = true;
          if (npc.gear) applyGear(npc.gear);
          Game.save();
          if (npc.id === 'kobold') Scenes.go('ending');
        });
      }
    } else if (params.fromBattle === 'lose') {
      say(["HIRO'S SESSION EXPIRED... BUT IDENTITY CAN ALWAYS BE RE-VERIFIED. (RESTORED AT THE LAST SAFE SPOT.)"]);
      Game.s.hp = Math.max(8, Math.floor(Game.s.maxHp / 2));
      Game.save();
    } else if (params.fromBattle === 'win') {
      Game.save();
    }
  },

  update(dt) {
    animT += dt;
    if (fade > 0) fade = Math.max(0, fade - dt);
    if (bannerT > 0) bannerT -= dt;

    if (mode === 'dialog') {
      dialog.update(dt);
      if (dialog.done) {
        dialog = null;
        mode = 'walk';
        const then = dialogThen; dialogThen = null;
        if (then) then();
      }
      return;
    }

    if (mode === 'pause') {
      const r = pauseMenu.update();
      if (r === 'cancel' || (r && r.value === 'close')) mode = 'walk';
      else if (r && r.value === 'items') openItems();
      else if (r && r.value === 'status') mode = 'status';
      else if (r && r.value === 'codex') Scenes.go('codex', { from: 'overworld' });
      else if (r && r.value === 'mute') { Audio.toggleMute(); openPause(); }
      else if (r && r.value === 'quit') { Game.save(); Scenes.go('title'); }
      return;
    }

    if (mode === 'status') {
      if (Input.pressed('a') || Input.pressed('b')) mode = 'pause';
      return;
    }

    if (mode === 'items') {
      const r = itemMenu.update();
      if (r === 'cancel' || (r && (r.value === 'back' || r.value === 'none'))) { mode = 'pause'; return; }
      if (r) {
        const item = ITEMS.find((it) => it.id === r.value);
        const msg = item.use(Game);
        if (msg) {
          Game.s[item.id]--;
          Audio.sfx('item');
          say([msg]);
        } else {
          say(['NO NEED RIGHT NOW. HIRO IS AT FULL TRUST.']);
        }
      }
      return;
    }

    if (mode === 'shop') {
      const r = shopMenu.update();
      if (r === 'cancel' || (r && r.value === 'leave')) { mode = 'walk'; return; }
      if (r) {
        const item = ITEMS.find((it) => it.id === r.value);
        if (Game.s.gold >= item.price) {
          Game.s.gold -= item.price;
          Game.s[item.id]++;
          Audio.sfx('item');
          say([`PURCHASED ${item.name}! (${item.desc})`], () => openShop());
        } else {
          say(['SHOPKEEPER|NOT ENOUGH GOLD, FRIEND. DEFEAT MORE PHANTOMS. THE ROI IS EXCELLENT.'], () => openShop());
        }
      }
      return;
    }

    // ----- walk mode -----
    if (moving) {
      const dx = Math.sign(mx - px), dy = Math.sign(my - py);
      px += dx * SPEED * dt; py += dy * SPEED * dt;
      if ((dx !== 0 && (mx - px) * dx <= 0) || (dy !== 0 && (my - py) * dy <= 0)) arrive();
      return;
    }

    if (Input.pressed('b')) { openPause(); return; }
    if (Input.pressed('a')) {
      const d = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[Game.s.facing];
      const npc = npcAt(Game.s.x + d[0], Game.s.y + d[1]);
      if (npc) { resolveNpc(npc); return; }
      const ch = tileAt(Game.s.x + d[0], Game.s.y + d[1]);
      if (ch === 'S') { /* bare sign with no npc */ }
    }
    for (const dir of ['up', 'down', 'left', 'right']) {
      if (Input.held(dir)) { tryStep(dir); break; }
    }
  },

  draw(ctx) {
    const gw = map.grid[0].length * TILE, gh = map.grid.length * TILE;
    let camX = Math.round(px - W / 2 + TILE / 2);
    let camY = Math.round(py - H / 2 + TILE / 2);
    camX = Math.max(0, Math.min(gw - W, camX));
    camY = Math.max(0, Math.min(gh - H, camY));
    if (gw < W) camX = -(W - gw) / 2;
    if (gh < H) camY = -(H - gh) / 2;

    ctx.fillStyle = '#0c0a14';
    ctx.fillRect(0, 0, W, H);

    const gw2 = map.grid[0].length, gh2 = map.grid.length;
    const x0 = Math.max(0, Math.floor(camX / TILE)), x1 = Math.min(gw2 - 1, Math.ceil((camX + W) / TILE));
    const y0 = Math.max(0, Math.floor(camY / TILE)), y1 = Math.min(gh2 - 1, Math.ceil((camY + H) / TILE));
    const waterFrame = Math.floor(animT * 2) % 2 === 0 ? 'waterA' : 'waterB';
    const flameFrame = Math.floor(animT * 5) % 2 === 0 ? 'A' : 'B';
    const lights = []; // collected glow sources for the lighting pass
    // out-of-bounds reads return the same char, so map borders stay seamless
    const charAt = (x, y) => (x < 0 || y < 0 || x >= gw2 || y >= gh2) ? null : map.grid[y][x];
    const GRASSY = new Set(['g', 'f', 'i', 't', 'u', 'n']);
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const ch = map.grid[y][x];
        let tileName = TILE_FOR[ch] || 'void';
        if (ch === 'w') tileName = waterFrame;
        if (ch === 'j') tileName = 'torch' + flameFrame;
        if (ch === 'V') tileName = 'sconce' + flameFrame;
        if (ch === 'J') tileName = 'brazier' + flameFrame;
        if (ch === 'd' && map.border === 'X') tileName = 'doorTech'; // tech cities get tech doors
        if (ch === 't') {
          const v = (x * 7 + y * 13) % 5;
          if (v === 1) tileName = 'treePine';
          else if (v === 3) tileName = 'treeBlossom';
        }
        const dx = x * TILE - camX, dy = y * TILE - camY;
        // signs/lamps/planters sit on whatever ground surrounds them
        const DECOR_OVERLAY = { S: 'sign', l: 'lamp', Q: 'planter' };
        if (DECOR_OVERLAY[ch]) {
          const GROUNDS = new Set(['g', 'f', 'i', 'p', 'a', 'F', 'c', 'T', 'r', 'v', 'm', 'M', 'x', 'b']);
          const near = [charAt(x, y + 1), charAt(x - 1, y), charAt(x + 1, y), charAt(x, y - 1)]
            .find((n) => n && GROUNDS.has(n));
          let baseName = TILE_FOR[near || 'F'] || 'floor';
          ctx.drawImage(TILES[baseName], dx, dy);
          ctx.drawImage(OVERLAYS[DECOR_OVERLAY[ch]], dx, dy);
        } else {
          ctx.drawImage(TILES[tileName], dx, dy);
        }

        // collect light sources for the glow pass
        if (ch === 'j' || ch === 'J') lights.push({ x: dx + 7, y: dy + 6, r: 22, c: [255, 166, 70], p: x * 13 + y * 7 });
        else if (ch === 'V') lights.push({ x: dx + 7, y: dy + 6, r: 20, c: [150, 100, 255], p: x * 13 + y * 7 });
        else if (ch === 'l') lights.push({ x: dx + 7, y: dy + 4, r: 18, c: [255, 220, 130], p: x * 13 + y * 7 });
        else if (ch === 'L') lights.push({ x: dx + 6, y: dy + 10, r: 14, c: [120, 220, 255], p: x * 13 + y * 7 });
        else if (ch === 'y') lights.push({ x: dx + 7, y: dy + 9, r: 14, c: [165, 120, 255], p: x * 13 + y * 7 });
        else if (ch === 'o') lights.push({ x: dx + 8, y: dy + 8, r: 12, c: [255, 220, 130], p: x * 13 + y * 7 });

        // carpet edge trim (gold fringe wherever carpet meets other floor)
        if (ch === 'm' || ch === 'M') {
          const isCarpet = (xx, yy) => { const n = charAt(xx, yy); return n === 'm' || n === 'M'; };
          ctx.fillStyle = '#d8a437';
          if (!isCarpet(x, y - 1)) ctx.fillRect(dx, dy, 16, 1);
          if (!isCarpet(x, y + 1)) ctx.fillRect(dx, dy + 15, 16, 1);
          if (!isCarpet(x - 1, y)) ctx.fillRect(dx, dy, 1, 16);
          if (!isCarpet(x + 1, y)) ctx.fillRect(dx + 15, dy, 1, 16);
          ctx.fillStyle = '#f2c66a';
          if (!isCarpet(x, y - 1)) for (let f = 2; f < 15; f += 4) ctx.fillRect(dx + f, dy, 1, 1);
          if (!isCarpet(x, y + 1)) for (let f = 2; f < 15; f += 4) ctx.fillRect(dx + f, dy + 15, 1, 1);
        }

        // --- water shore borders (sand lip + foam facing any land) ---
        if (ch === 'w') {
          const land = (xx, yy) => { const n = charAt(xx, yy); return n !== null && n !== 'w' && n !== '.'; };
          ctx.fillStyle = '#ecd79f';
          if (land(x, y - 1)) ctx.fillRect(dx, dy, 16, 2);
          if (land(x, y + 1)) ctx.fillRect(dx, dy + 14, 16, 2);
          if (land(x - 1, y)) ctx.fillRect(dx, dy, 2, 16);
          if (land(x + 1, y)) ctx.fillRect(dx + 14, dy, 2, 16);
          ctx.fillStyle = '#d8ecff';
          const foamShift = Math.floor(animT * 3) % 2 ? 2 : 0;
          if (land(x, y - 1)) for (let f = 1 + foamShift; f < 15; f += 5) ctx.fillRect(dx + f, dy + 2, 2, 1);
          if (land(x, y + 1)) for (let f = 2 + foamShift; f < 15; f += 5) ctx.fillRect(dx + f, dy + 13, 2, 1);
          if (land(x - 1, y)) for (let f = 1 + foamShift; f < 15; f += 5) ctx.fillRect(dx + 2, dy + f, 1, 2);
          if (land(x + 1, y)) for (let f = 2 + foamShift; f < 15; f += 5) ctx.fillRect(dx + 13, dy + f, 1, 2);
        }
        // --- soft grass fringe creeping over path edges ---
        if (ch === 'p') {
          ctx.fillStyle = '#3f9e54';
          if (GRASSY.has(charAt(x, y - 1))) { ctx.fillRect(dx, dy, 16, 1); ctx.fillRect(dx + 2, dy + 1, 2, 1); ctx.fillRect(dx + 9, dy + 1, 3, 1); }
          if (GRASSY.has(charAt(x, y + 1))) { ctx.fillRect(dx, dy + 15, 16, 1); ctx.fillRect(dx + 4, dy + 14, 3, 1); ctx.fillRect(dx + 11, dy + 14, 2, 1); }
          if (GRASSY.has(charAt(x - 1, y))) { ctx.fillRect(dx, dy, 1, 16); ctx.fillRect(dx + 1, dy + 3, 1, 2); ctx.fillRect(dx + 1, dy + 10, 1, 3); }
          if (GRASSY.has(charAt(x + 1, y))) { ctx.fillRect(dx + 15, dy, 1, 16); ctx.fillRect(dx + 14, dy + 5, 1, 3); ctx.fillRect(dx + 14, dy + 12, 1, 2); }
        }
        // --- ambient shadow at the foot of anything solid above ---
        const north = charAt(x, y - 1);
        if (!SOLID.has(ch) && north !== null && SOLID.has(north) && north !== 't' && north !== 'w') {
          ctx.fillStyle = 'rgba(12,8,26,0.3)'; ctx.fillRect(dx, dy, 16, 2);
          ctx.fillStyle = 'rgba(12,8,26,0.15)'; ctx.fillRect(dx, dy + 2, 16, 2);
        }
      }
    }

    // NPCs (draw before/after player by y for overlap), each over a soft shadow
    const shadow = (cx2, cy2, w) => {
      ctx.fillStyle = 'rgba(10,8,20,0.3)';
      ctx.beginPath();
      ctx.ellipse(cx2, cy2, w / 2, 2, 0, 0, Math.PI * 2);
      ctx.fill();
    };
    const drawables = [];
    for (const npc of map.npcs) {
      if (npc.hideOnFlag && Game.s.flags[npc.hideOnFlag]) continue;
      if (!npc.sprite) continue;
      let img;
      if (npc.sprite.startsWith('enemy:')) img = ENEMY_ART[npc.sprite.slice(6)];
      else img = NPCS[npc.sprite] || NPCS.villager;
      drawables.push({
        y: npc.y * TILE,
        draw: () => {
          const dx = npc.x * TILE - camX + Math.floor((TILE - img.width) / 2);
          const dy = npc.y * TILE - camY + (TILE - img.height);
          shadow(npc.x * TILE - camX + TILE / 2, npc.y * TILE - camY + TILE - 1, Math.min(img.width, 18));
          ctx.drawImage(img, dx, dy);
        },
      });
    }
    // player
    const frames = HIRO[Game.s.facing];
    const frame = moving ? frames[Math.floor(animT * 7) % 2] : frames[0];
    drawables.push({
      y: py,
      draw: () => {
        shadow(Math.round(px) - camX + 7, Math.round(py) - camY + TILE - 1, 11);
        ctx.drawImage(frame, Math.round(px) - camX, Math.round(py) - camY + (TILE - frame.height));
      },
    });
    drawables.sort((a, b) => a.y - b.y).forEach((d) => d.draw());

    // --- lighting pass: warm pulsing pools around every flame/glow source ---
    if (lights.length) {
      ctx.globalCompositeOperation = 'lighter';
      for (const li of lights) {
        const flick = 0.5 + Math.sin(animT * 6 + li.p) * 0.08 + Math.sin(animT * 13 + li.p * 2) * 0.05;
        const rad = li.r * (1 + Math.sin(animT * 5 + li.p) * 0.06);
        const g = ctx.createRadialGradient(li.x, li.y, 1, li.x, li.y, rad);
        g.addColorStop(0, `rgba(${li.c[0]},${li.c[1]},${li.c[2]},${0.32 * flick})`);
        g.addColorStop(0.5, `rgba(${li.c[0]},${li.c[1]},${li.c[2]},${0.14 * flick})`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(li.x - rad, li.y - rad, rad * 2, rad * 2);
      }
      ctx.globalCompositeOperation = 'source-over';
    }
    // --- ambient color grade ---
    if (map.tint) {
      ctx.fillStyle = map.tint;
      ctx.fillRect(0, 0, W, H);
    }

    // --- portal markers: every exit gets a pulsing arrow (or a lock) ---
    for (const p of map.portals || []) {
      const sx = p.x * TILE - camX, sy = p.y * TILE - camY;
      if (sx < -20 || sx > W + 4 || sy < -20 || sy > H + 4) continue;
      const locked = p.require && !Game.s.flags[p.require];
      let dir = 'door';
      if (p.x === 0) dir = 'left';
      else if (p.x === gw2 - 1) dir = 'right';
      else if (p.y === 0) dir = 'up';
      else if (p.y === gh2 - 1) dir = 'down';
      const bob = Math.sin(animT * 4) * 2;
      if (!locked) {
        // pulsing ground glow
        const pulse = 0.22 + Math.sin(animT * 4) * 0.1;
        ctx.fillStyle = `rgba(255,216,77,${pulse})`;
        ctx.beginPath();
        ctx.ellipse(sx + 8, sy + 12, 7, 3, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      const col = locked ? '#9a93b8' : '#ffd84d';
      const edge = locked ? '#4a4366' : '#a06b14';
      const tri = (cx2, cy2, d) => {
        ctx.beginPath();
        if (d === 'left') { ctx.moveTo(cx2 - 4, cy2); ctx.lineTo(cx2 + 3, cy2 - 4); ctx.lineTo(cx2 + 3, cy2 + 4); }
        else if (d === 'right') { ctx.moveTo(cx2 + 4, cy2); ctx.lineTo(cx2 - 3, cy2 - 4); ctx.lineTo(cx2 - 3, cy2 + 4); }
        else if (d === 'up') { ctx.moveTo(cx2, cy2 - 4); ctx.lineTo(cx2 - 4, cy2 + 3); ctx.lineTo(cx2 + 4, cy2 + 3); }
        else { ctx.moveTo(cx2, cy2 + 4); ctx.lineTo(cx2 - 4, cy2 - 3); ctx.lineTo(cx2 + 4, cy2 - 3); }
        ctx.closePath();
        ctx.fillStyle = col; ctx.fill();
        ctx.strokeStyle = edge; ctx.lineWidth = 1; ctx.stroke();
      };
      if (locked) {
        // padlock floating over the gated exit
        const ly = sy - 7 + bob * 0.5;
        ctx.fillStyle = '#9a93b8';
        ctx.fillRect(sx + 5, ly + 3, 7, 5);
        ctx.fillRect(sx + 6, ly, 1, 3); ctx.fillRect(sx + 10, ly, 1, 3); ctx.fillRect(sx + 7, ly - 1, 3, 1);
        ctx.fillStyle = '#4a4366'; ctx.fillRect(sx + 8, ly + 5, 1, 2);
      } else if (dir === 'left') tri(sx + 5 + bob, sy + 8, 'left');
      else if (dir === 'right') tri(sx + 11 - bob, sy + 8, 'right');
      else if (dir === 'up') tri(sx + 8, sy + 5 + bob, 'up');
      else if (dir === 'down') tri(sx + 8, sy + 11 - bob, 'down');
      else tri(sx + 8, sy - 5 + bob, 'down'); // interior door: chevron floats above
    }

    // map name banner (first seconds on each map)
    if (bannerT > 0) {
      panel(ctx, 2, 2, map.name.length * 6 + 12, 13);
      drawText(ctx, map.name, 8, 5, '#b78bff');
    }

    if (mode === 'pause') pauseMenu.draw(ctx, 130, 14, 104);
    if (mode === 'items') {
      itemMenu.draw(ctx, 84, 14, 150);
      drawTextCentered(ctx, `GOLD: ${Game.s.gold}`, 159, 6, '#ffd84d');
    }
    if (mode === 'shop') {
      shopMenu.draw(ctx, 84, 14, 150);
      drawTextCentered(ctx, `GOLD: ${Game.s.gold}`, 159, 6, '#ffd84d');
    }
    if (mode === 'status') drawStatus(ctx);
    if (dialog) dialog.draw(ctx, W, H);

    if (fade > 0) {
      ctx.fillStyle = `rgba(5,3,12,${Math.min(1, fade * 4)})`;
      ctx.fillRect(0, 0, W, H);
    }
  },
});

function drawStatus(ctx) {
  panel(ctx, 30, 18, 180, 124);
  drawTextCentered(ctx, 'HIRO THE HEDGEHOG', 120, 26, '#19d3c5');
  const s = Game.s;
  const rows = [
    [`LEVEL ${s.level}`, `XP ${s.xp}/${Game.xpToNext()}`],
    [`HP ${s.hp}/${s.maxHp}`, `TP ${s.tp}/${s.maxTp}`],
    [`ATK ${Game.atk()}`, `DEF ${Game.def()}`],
    [`GOLD ${s.gold}`, `STEPS ${s.steps}`],
  ];
  rows.forEach((r, i) => {
    drawText(ctx, r[0], 42, 42 + i * 11, '#ffffff');
    drawText(ctx, r[1], 130, 42 + i * 11, '#ffffff');
  });
  drawText(ctx, 'ARTIFACTS:', 42, 90, '#b78bff');
  const gearNames = {
    blade: 'PASSKEY BLADE', mirror: 'MIRROR OF AFFIRM', sigil: 'HELP DESK SIGIL',
    visor: 'ADAPT VISOR', armor: 'PASSKEY ARMOR', crown: 'AGENTPASS CROWN',
  };
  let gy = 100;
  let any = false;
  for (const [k, name] of Object.entries(gearNames)) {
    if (Game.s.gear[k]) { drawText(ctx, '+ ' + name, 42, gy, '#cfd6e4'); gy += 9; any = true; }
  }
  if (!any) drawText(ctx, '(NONE YET)', 42, gy, '#8d86b8');
  drawText(ctx, `SKILLS KNOWN: ${knownSkills(Game).length}`, 130, 100, '#cfd6e4');
}
