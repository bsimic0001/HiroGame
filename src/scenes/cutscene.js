// Letterboxed, comic-style chapter cutscenes: animated actors, speed lines,
// flashes, shakes, title cards, and typewriter narration.
import { Scenes } from '../engine/scenes.js';
import { Input } from '../engine/input.js';
import { Audio } from '../engine/audio.js';
import { drawText, drawTextCentered, drawTextScaled, wrap, LINE_H } from '../engine/font.js';
import { CUTSCENES } from '../data/cutscenes.js';
import { ENEMY_ART } from '../art/sprites.js';

const W = 240, H = 160;
const BAR = 14; // letterbox height

const POSES = {};
for (const n of ['pose1', 'pose2', 'pose3', 'pose4', 'pose5', 'pose6']) {
  POSES[n] = new Image();
  POSES[n].src = `assets/hiro/v2/${n}.png`;
}

let cs = null, csId = '';
let shotIdx = 0, shotT = 0, chars = 0;
let after = null;

const ease = (u) => 1 - Math.pow(1 - Math.min(1, u), 3);

function shot() { return cs.shots[shotIdx]; }

function next() {
  shotIdx++;
  shotT = 0;
  chars = 0;
  if (shotIdx >= cs.shots.length) {
    const fn = after;
    cs = null;
    fn();
    return;
  }
  if (shot().fx?.includes('flash')) Audio.sfx('boss');
  else Audio.sfx('select');
}

Scenes.register('cutscene', {
  enter(params) {
    cs = CUTSCENES[params.id];
    csId = params.id;
    shotIdx = 0; shotT = 0; chars = 0;
    after = params.id === 'ch1'
      ? () => Scenes.go('overworld')
      : () => Scenes.go('overworld', { fromBattle: 'cutscene' });
    Audio.play('vault');
    if (shot().fx?.includes('flash')) Audio.sfx('boss');
  },

  update(dt) {
    if (!cs) return;
    shotT += dt;
    const cap = shot().caption || '';
    if (chars < cap.length) chars += dt * 80;
    if (Input.pressed('a') || Input.pressed('b')) {
      if (chars < cap.length) chars = cap.length;
      else next();
    }
  },

  draw(ctx) {
    if (!cs) return;
    const s = shot();
    const u = ease(shotT / 1.1);

    // shake offset
    let ox = 0, oy = 0;
    if (s.fx?.includes('shake') && shotT < 0.8) {
      ox = (Math.random() - 0.5) * 4; oy = (Math.random() - 0.5) * 3;
    }
    ctx.save();
    ctx.translate(ox, oy);

    // backdrop
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, s.bg[0]);
    grad.addColorStop(1, s.bg[1]);
    ctx.fillStyle = grad;
    ctx.fillRect(-4, -4, W + 8, H + 8);

    // ambient stars
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    for (let i = 0; i < 16; i++) {
      if (Math.sin(shotT * 2 + i * 1.7) > 0) ctx.fillRect((i * 53) % W, (i * 37) % 70, 1, 1);
    }

    // silhouette band
    ctx.fillStyle = 'rgba(8,5,18,0.75)';
    if (s.sil === 'city') {
      for (const [hx, hw, hh] of [[0, 30, 26], [40, 22, 38], [74, 30, 20], [116, 26, 44], [152, 30, 24], [192, 26, 34], [226, 20, 28]]) {
        ctx.fillRect(hx, 130 - hh, hw, hh + 30);
      }
    } else if (s.sil === 'waves') {
      for (let x = 0; x < W; x += 8) ctx.fillRect(x, 122 + Math.round(Math.sin(x / 14 + shotT * 2) * 4), 8, 40);
    } else if (s.sil === 'cave') {
      for (let x = 0; x < W; x += 10) ctx.fillRect(x, 0, 10, 24 + Math.round(Math.sin(x / 9) * 10));
      ctx.fillRect(0, 124, W, 36);
    } else if (s.sil === 'tech' || s.sil === 'vault') {
      for (const [hx, hw, hh] of [[6, 18, 40], [50, 14, 56], [90, 20, 34], [130, 16, 60], [170, 20, 42], [208, 16, 52]]) {
        ctx.fillRect(hx, 130 - hh, hw, hh + 30);
        ctx.fillStyle = s.sil === 'vault' ? 'rgba(138,92,255,0.5)' : 'rgba(25,211,197,0.45)';
        for (let wy = 134 - hh; wy < 124; wy += 7) ctx.fillRect(hx + 3, wy, 2, 2);
        ctx.fillStyle = 'rgba(8,5,18,0.75)';
      }
    }

    // speed lines (comic energy radiating from the right)
    if (s.fx?.includes('speedlines')) {
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 14; i++) {
        const y = (i * 23 + shotT * 160) % (H + 40) - 20;
        const len = 30 + (i % 4) * 18;
        ctx.beginPath();
        ctx.moveTo(W, y);
        ctx.lineTo(W - len, y + 2);
        ctx.stroke();
      }
    }

    // actors
    for (const a of s.actors || []) {
      let img = a.img.startsWith('enemy:') ? ENEMY_ART[a.img.slice(6)] : POSES[a.img];
      if (!img || (img instanceof Image && !img.complete)) continue;
      const iw = img.width || img.naturalWidth, ih = img.height || img.naturalHeight;
      const w = a.w, h = Math.round(w * (ih / iw));
      const x = a.from[0] + (a.to[0] - a.from[0]) * u;
      const y = a.from[1] + (a.to[1] - a.from[1]) * u + Math.sin(shotT * 2.2) * 2;
      ctx.save();
      ctx.translate(x, y);
      if (a.spin) ctx.rotate(Math.min(1, shotT / 1.1) * 0.5);
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
      ctx.restore();
    }

    // flash
    if (s.fx?.includes('flash') && shotT < 0.45) {
      ctx.fillStyle = `rgba(255,255,255,${0.8 * (1 - shotT / 0.45)})`;
      ctx.fillRect(-4, -4, W + 8, H + 8);
    }

    // title card
    if (s.title) {
      const ty = 30;
      ctx.fillStyle = 'rgba(8,5,18,0.6)';
      ctx.fillRect(0, ty - 8, W, 40);
      drawTextScaled(ctx, s.title, W / 2, ty, 2, '#ffd84d', '#3a2a08');
      drawTextCentered(ctx, s.subtitle, W / 2, ty + 20, '#ffffff');
      ctx.fillStyle = '#19d3c5';
      ctx.fillRect(W / 2 - 50, ty + 29, 100, 1);
    }

    ctx.restore();

    // letterbox + caption strip
    ctx.fillStyle = '#06040c';
    ctx.fillRect(0, 0, W, BAR);
    ctx.fillRect(0, H - BAR, W, BAR);
    const cap = s.caption || '';
    if (cap) {
      const lines = wrap(cap, 37);
      const stripH = Math.min(3, lines.length) * LINE_H + 6;
      ctx.fillStyle = 'rgba(6,4,12,0.78)';
      ctx.fillRect(0, H - BAR - stripH, W, stripH);
      let shown = Math.floor(chars), count = 0;
      lines.slice(0, 3).forEach((l, i) => {
        const take = Math.max(0, Math.min(l.length, shown - count));
        drawText(ctx, l.slice(0, take), 8, H - BAR - stripH + 4 + i * LINE_H, '#ffffff');
        count += l.length;
      });
    }
    if (Math.floor(chars) >= cap.length && Math.floor(performance.now() / 400) % 2 === 0) {
      drawText(ctx, '>', W - 12, H - BAR + 3, '#19d3c5');
    }
    drawText(ctx, `${shotIdx + 1}/${cs.shots.length}`, 6, 3, '#554d70');
  },
});
