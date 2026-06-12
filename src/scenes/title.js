import { Scenes } from '../engine/scenes.js';
import { Input } from '../engine/input.js';
import { Audio } from '../engine/audio.js';
import { Game } from '../engine/state.js';
import { drawText, drawTextCentered, drawTextScaled } from '../engine/font.js';
import { Menu, panel } from '../engine/ui.js';

const W = 240, H = 160;

const hiroImg = new Image();
hiroImg.src = 'assets/hiro/v2/pose2.png'; // flying punch

let menu = null;
let t = 0;
let confirmNew = null; // overwrite-save confirmation

function buildMenu() {
  const items = [];
  if (Game.hasSave()) items.push({ label: 'CONTINUE', value: 'continue' });
  items.push({ label: 'NEW GAME', value: 'new' });
  items.push({ label: 'THREAT CODEX', value: 'codex' });
  items.push({ label: Audio.muted ? 'SOUND: OFF' : 'SOUND: ON', value: 'mute' });
  menu = new Menu(items, { noCancel: true });
}

Scenes.register('title', {
  enter() {
    t = 0;
    confirmNew = null;
    buildMenu();
  },
  update(dt) {
    t += dt;
    if (Input.pressed('a') || Input.pressed('b')) Audio.play('title');
    if (confirmNew) {
      const r = confirmNew.update();
      if (r === 'cancel') confirmNew = null;
      else if (r && r.value === 'yes') { Game.newGame(); Scenes.go('cutscene', { id: 'ch1' }); }
      else if (r) confirmNew = null;
      return;
    }
    const r = menu.update();
    if (!r || r === 'cancel') return;
    if (r.value === 'continue') { Game.load(); Scenes.go('overworld'); }
    else if (r.value === 'new') {
      if (Game.hasSave()) {
        confirmNew = new Menu([
          { label: 'KEEP MY SAVE', value: 'no' },
          { label: 'ERASE + START OVER', value: 'yes' },
        ]);
      } else { Game.newGame(); Scenes.go('cutscene', { id: 'ch1' }); }
    } else if (r.value === 'codex') Scenes.go('codex', { from: 'title' });
    else if (r.value === 'mute') { Audio.toggleMute(); buildMenu(); }
  },
  draw(ctx) {
    // night-purple gradient sky
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#140a30');
    grad.addColorStop(0.55, '#3c2178');
    grad.addColorStop(1, '#7d52f5');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    // twinkling stars
    for (let i = 0; i < 34; i++) {
      const sx = (i * 53) % W, sy = (i * 37) % 84;
      const tw = Math.sin(t * 2 + i) > 0.4 ? 1 : 0.4;
      ctx.fillStyle = `rgba(255,255,255,${tw * 0.8})`;
      ctx.fillRect(sx, sy, 1, 1);
    }
    // moon
    ctx.fillStyle = '#efe8ff'; ctx.beginPath(); ctx.arc(26, 22, 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1d1144'; ctx.beginPath(); ctx.arc(30, 19, 8, 0, Math.PI * 2); ctx.fill();
    // drifting clouds
    ctx.fillStyle = 'rgba(183,139,255,0.3)';
    for (const [bx, by, bw] of [[40, 34, 40], [150, 16, 34], [90, 52, 46]]) {
      const ox = (bx + t * 3) % (W + 60) - 30;
      ctx.fillRect(ox, by, bw, 4);
      ctx.fillRect(ox + 6, by - 3, bw - 16, 3);
    }
    // distant village skyline with lit windows
    ctx.fillStyle = '#241456';
    for (let x = 0; x < W; x += 4) ctx.fillRect(x, 126 + Math.round(Math.sin(x / 23) * 5), 4, 36);
    ctx.fillStyle = '#1b0f42';
    for (const [hx, hw, hh] of [[14, 18, 22], [52, 14, 16], [96, 20, 26], [148, 16, 18], [196, 22, 24]]) {
      ctx.fillRect(hx, 160 - hh, hw, hh);
      ctx.fillRect(hx - 2, 160 - hh, hw + 4, 3);
    }
    ctx.fillStyle = '#ffd84d';
    for (const [wx, wy] of [[20, 146], [26, 146], [58, 150], [102, 142], [110, 142], [154, 148], [204, 144], [210, 144]]) {
      ctx.fillRect(wx, wy, 2, 3);
    }
    // Hiro art, bobbing (punch pose is tall: keep aspect)
    if (hiroImg.complete && hiroImg.naturalWidth) {
      const bob = Math.sin(t * 2) * 2;
      const hw = 76, hh = Math.round(hw * (hiroImg.naturalHeight / hiroImg.naturalWidth));
      ctx.drawImage(hiroImg, 158, 36 + bob, hw, hh);
    }
    drawTextScaled(ctx, 'HIRO', 80, 16, 3, '#ffffff', '#2c1f5e');
    drawTextCentered(ctx, '* IDENTITY UNDER SIEGE *', 80, 44, '#19d3c5');
    drawTextCentered(ctx, "HACKERS DON'T BREAK IN.", 80, 58, '#cbb9ff');
    drawTextCentered(ctx, 'THEY LOG IN.', 80, 67, '#cbb9ff');
    if (confirmNew) {
      panel(ctx, 50, 78, 140, 14);
      drawText(ctx, 'ERASE SAVED GAME?', 56, 82, '#ffd84d');
      confirmNew.draw(ctx, 50, 94, 140);
    } else {
      menu.draw(ctx, 14, 84, 120);
    }
    drawTextCentered(ctx, 'A HYPR ADVENTURE - HYPR.COM', 120, 150, '#cbb9ff');
  },
});
