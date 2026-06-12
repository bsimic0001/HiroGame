import { Scenes } from '../engine/scenes.js';
import { Input } from '../engine/input.js';
import { Audio } from '../engine/audio.js';
import { Game } from '../engine/state.js';
import { drawText, drawTextCentered, wrap, LINE_H } from '../engine/font.js';
import { panel } from '../engine/ui.js';
import { ENEMIES } from '../data/enemies.js';

const W = 240, H = 160;

const posterImg = new Image();
posterImg.src = 'assets/hiro/poster.jpg';
const cheerImg = new Image();
cheerImg.src = 'assets/hiro/v2/pose1.png'; // zen sit — the realm at peace
const runImg = new Image();
runImg.src = 'assets/hiro/v2/pose3.png'; // finish-line run

const VAULT_LINES = [
  'THE VAULT OF SHARED SECRETS SHUDDERS.',
  'EVERY PASSWORD EVER WHISPERED, SCRIBBLED ON A STICKY NOTE, OR REUSED ACROSS NINE KINGDOMS...',
  '...DISSOLVES INTO HARMLESS STARLIGHT.',
  'THE PHANTOM LEGION REACHES FOR ITS WEAPONS, AND FINDS... NOTHING TO STEAL.',
  'ELIMINATE THE TARGET: COMPLETE.',
];

const EPILOGUE = [
  'IDENTIA WENT PASSWORDLESS THAT SPRING.',
  'HELP DESK KEEP NOW SERVES COFFEE. JUST COFFEE. ZERO RESET CALLS.',
  'AT THE ONBOARDING GATE, EVERY NEW FACE IS VERIFIED, LIVE, AND WELCOME.',
  'THE GOVERNED SWARM TENDS THE ARCHIVES: EVERY ACTION SCOPED, SIGNED, AND SUPERVISED.',
  'AND EVERY EVENING, CITIZENS LOG IN WITH A SINGLE GESTURE...',
  '...AND SLEEP SOUNDLY, KNOWING NOBODY ELSE CAN.',
  'SAGE BOJAN|THE ELIMINATION OF SHARED SECRETS. I TOLD YOU IT WAS POSSIBLE.',
  'HIRO|IDENTITY IS NO LONGER UNDER SIEGE.',
];

let phase = 'vault'; // vault | epilogue | splash
let line = 0;
let t = 0;
let sparks = [];

Scenes.register('ending', {
  enter() {
    phase = 'vault';
    line = 0;
    t = 0;
    Game.s.flags.finished = true;
    Game.save();
    Audio.play('vault');
    sparks = Array.from({ length: 60 }, (_, i) => ({
      x: Math.random() * W, y: Math.random() * H,
      vy: 8 + Math.random() * 26, ph: Math.random() * 6,
    }));
  },

  update(dt) {
    t += dt;
    for (const s of sparks) {
      s.y -= s.vy * dt;
      if (s.y < -4) { s.y = H + 4; s.x = Math.random() * W; }
    }
    if (Input.pressed('a')) {
      Audio.sfx('select');
      line++;
      if (phase === 'vault' && line >= VAULT_LINES.length) {
        phase = 'epilogue'; line = 0; Audio.play('ending');
      } else if (phase === 'epilogue' && line >= EPILOGUE.length) {
        phase = 'splash'; line = 0;
      } else if (phase === 'splash') {
        Scenes.go('title');
      }
    }
  },

  draw(ctx) {
    if (phase === 'vault') {
      const sh = line < VAULT_LINES.length - 1 ? Math.sin(t * 30) * 2 : 0;
      ctx.fillStyle = '#0c0a14';
      ctx.fillRect(0, 0, W, H);
      ctx.save();
      ctx.translate(sh, 0);
      ctx.fillStyle = '#b78bff';
      for (const s of sparks) ctx.fillRect(s.x | 0, s.y | 0, 1, 2);
      ctx.restore();
      const text = VAULT_LINES[Math.min(line, VAULT_LINES.length - 1)];
      const lines = wrap(text, 34);
      lines.forEach((l, i) => drawTextCentered(ctx, l, W / 2, 64 + i * LINE_H, line === VAULT_LINES.length - 1 ? '#19d3c5' : '#ffffff'));
      drawTextCentered(ctx, 'PRESS A', W / 2, H - 12, '#554d70');
      return;
    }

    if (phase === 'epilogue') {
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#1a0f3c');
      grad.addColorStop(1, '#6a3df0');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      for (const s of sparks.slice(0, 25)) ctx.fillRect(s.x | 0, s.y | 0, 1, 1);
      if (cheerImg.complete && cheerImg.naturalWidth) {
        const cw = 64, chh = Math.round(cw * (cheerImg.naturalHeight / cheerImg.naturalWidth));
        ctx.drawImage(cheerImg, W / 2 - cw / 2, 16 + Math.sin(t * 2) * 2, cw, chh);
      }
      const raw = EPILOGUE[Math.min(line, EPILOGUE.length - 1)];
      const sep = raw.indexOf('|');
      const who = sep > 0 && sep < 24 ? raw.slice(0, sep) : null;
      const text = who ? raw.slice(sep + 1) : raw;
      panel(ctx, 8, 96, W - 16, 44);
      if (who) drawText(ctx, who, 14, 100, '#19d3c5');
      wrap(text, 35).forEach((l, i) => drawText(ctx, l, 14, (who ? 110 : 104) + i * LINE_H, '#ffffff'));
      drawTextCentered(ctx, 'PRESS A', W / 2, H - 12, '#cbb9ff');
      return;
    }

    // splash
    ctx.fillStyle = '#0c0a14';
    ctx.fillRect(0, 0, W, H);
    if (posterImg.complete && posterImg.naturalWidth) {
      const scale = Math.max(W / posterImg.width, 110 / posterImg.height);
      const pw = posterImg.width * scale, ph = posterImg.height * scale;
      ctx.globalAlpha = 0.85;
      ctx.drawImage(posterImg, (W - pw) / 2, 0, pw, ph);
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = 'rgba(12,10,20,0.55)';
    ctx.fillRect(0, 0, W, H);
    if (runImg.complete && runImg.naturalWidth) {
      const rw = 70, rh = Math.round(rw * (runImg.naturalHeight / runImg.naturalWidth));
      ctx.drawImage(runImg, W - rw - 6, H - rh - 8 + Math.sin(t * 2) * 2, rw, rh);
    }
    drawTextCentered(ctx, '* THE END *', W / 2, 22, '#ffffff');
    const total = Object.keys(ENEMIES).length;
    const unlocked = Object.keys(ENEMIES).filter((id) => Game.s.codex[id]).length;
    drawTextCentered(ctx, `THREAT CODEX: ${unlocked}/${total} UNDERSTOOD`, W / 2, 44, '#ffd84d');
    if (unlocked >= total) drawTextCentered(ctx, 'TRUE IDENTITY ASSURANCE ACHIEVED!', W / 2, 54, '#19d3c5');
    drawTextCentered(ctx, 'HIRO WILL RETURN', W / 2, 76, '#b78bff');
    drawTextCentered(ctx, 'WANT THE REAL PASSKEY BLADE?', W / 2, 104, '#ffffff');
    drawTextCentered(ctx, 'HYPR.COM', W / 2, 116, '#19d3c5');
    drawTextCentered(ctx, 'THE IDENTITY ASSURANCE COMPANY', W / 2, 126, '#cbb9ff');
    drawTextCentered(ctx, 'PRESS A FOR TITLE', W / 2, H - 12, '#8d86b8');
  },
});
