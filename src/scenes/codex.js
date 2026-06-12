import { Scenes } from '../engine/scenes.js';
import { Input } from '../engine/input.js';
import { Audio } from '../engine/audio.js';
import { Game } from '../engine/state.js';
import { drawText, drawTextCentered, wrap, LINE_H } from '../engine/font.js';
import { panel } from '../engine/ui.js';
import { ENEMIES } from '../data/enemies.js';
import { ENEMY_ART } from '../art/sprites.js';

const W = 240, H = 160;
const ORDER = Object.keys(ENEMIES);

const detectiveImg = new Image();
detectiveImg.src = 'assets/hiro/v2/pose5.png'; // detective Hiro presents the files

let from = 'title';
let cursor = 0;
let detail = null; // enemy id when viewing detail
let scroll = 0;

Scenes.register('codex', {
  enter(p) {
    from = p.from || 'title';
    cursor = 0; detail = null; scroll = 0;
  },

  update() {
    if (detail) {
      if (Input.pressed('a') || Input.pressed('b')) { Audio.sfx('cancel'); detail = null; }
      return;
    }
    if (Input.pressed('up')) { cursor = (cursor + ORDER.length - 1) % ORDER.length; Audio.sfx('select'); }
    if (Input.pressed('down')) { cursor = (cursor + 1) % ORDER.length; Audio.sfx('select'); }
    if (Input.pressed('a')) {
      const id = ORDER[cursor];
      if (Game.s.codex[id]) { Audio.sfx('confirm'); detail = id; }
      else Audio.sfx('bump');
    }
    if (Input.pressed('b')) {
      Audio.sfx('cancel');
      Scenes.go(from === 'overworld' ? 'overworld' : 'title', from === 'overworld' ? { fromBattle: 'codex' } : {});
    }
    // keep cursor visible
    const visible = 9;
    if (cursor < scroll) scroll = cursor;
    if (cursor >= scroll + visible) scroll = cursor - visible + 1;
  },

  draw(ctx) {
    ctx.fillStyle = '#100a1e';
    ctx.fillRect(0, 0, W, H);

    if (detail) {
      const e = ENEMIES[detail];
      panel(ctx, 4, 4, W - 8, H - 8);
      const art = ENEMY_ART[e.art];
      const aw = Math.min(70, art.width), ah = Math.round(art.height * (aw / art.width));
      ctx.drawImage(art, W - aw - 12, 14, aw, ah);
      drawText(ctx, e.codex.title, 12, 12, '#19d3c5');
      drawText(ctx, `AKA "${e.name}"`, 12, 22, '#8d86b8');
      let y = 38;
      drawText(ctx, 'THE THREAT:', 12, y, '#ff8a8a'); y += LINE_H;
      for (const l of wrap(e.codex.threat, 36)) { drawText(ctx, l, 12, y, '#ffffff'); y += LINE_H; }
      y += 3;
      drawText(ctx, 'FIELD DATA:', 12, y, '#ffd84d'); y += LINE_H;
      for (const l of wrap(e.codex.stat, 36)) { drawText(ctx, l, 12, y, '#ffffff'); y += LINE_H; }
      y += 3;
      drawText(ctx, 'HOW HYPR STOPS IT:', 12, y, '#19d3c5'); y += LINE_H;
      for (const l of wrap(e.codex.answer, 36)) { drawText(ctx, l, 12, y, '#ffffff'); y += LINE_H; }
      drawTextCentered(ctx, 'A/B: BACK', W / 2, H - 14, '#8d86b8');
      return;
    }

    if (detectiveImg.complete && detectiveImg.naturalWidth) {
      ctx.globalAlpha = 0.5;
      const dw = 92, dh = Math.round(dw * (detectiveImg.naturalHeight / detectiveImg.naturalWidth));
      ctx.drawImage(detectiveImg, W - dw + 14, H - dh + 6, dw, dh);
      ctx.globalAlpha = 1;
    }
    const unlocked = ORDER.filter((id) => Game.s.codex[id]).length;
    drawTextCentered(ctx, '* THREAT CODEX *', W / 2, 8, '#19d3c5');
    drawTextCentered(ctx, `${unlocked}/${ORDER.length} THREATS UNDERSTOOD`, W / 2, 18, '#b78bff');
    panel(ctx, 10, 28, W - 20, 110);
    const visible = 9;
    ORDER.slice(scroll, scroll + visible).forEach((id, i) => {
      const idx = scroll + i;
      const known = Game.s.codex[id];
      const label = known ? ENEMIES[id].codex.title : '???????????';
      const y = 35 + i * 11;
      if (idx === cursor) drawText(ctx, '▶', 16, y, '#19d3c5');
      drawText(ctx, label, 26, y, idx === cursor ? '#ffffff' : known ? '#cfd6e4' : '#554d70');
      if (ENEMIES[id].mechanics.includes('boss')) drawText(ctx, 'BOSS', 188, y, '#ffd84d');
    });
    drawTextCentered(ctx, 'A: READ   B: BACK', W / 2, H - 14, '#8d86b8');
  },
});
