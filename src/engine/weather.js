// Ambient weather particle layer. Types: rain, leaves, spray, drips, data, dust.
// Wind gusts modulate drift so nothing moves in lockstep.
const W = 240, H = 160;

let type = null;
let parts = [];
let splashes = [];
let t = 0;

function rnd(n) { return Math.random() * n; }

const SPAWN = {
  rain: (p) => ({ x: rnd(W + 40) - 20, y: rnd(H) - H * (p ? 0 : 1), vy: 150 + rnd(60), len: 5 + rnd(3) }),
  leaves: () => ({
    x: rnd(W), y: rnd(H), vy: 9 + rnd8(), sway: rnd(6.28), size: 1 + (Math.random() < 0.4 ? 1 : 0),
    color: ['#ff7ab8', '#ffd84d', '#7ee695', '#f29b38'][Math.floor(rnd(4))],
  }),
  spray: () => ({ x: rnd(W), y: rnd(H), vx: 30 + rnd(40), len: 6 + rnd(8), a: 0.10 + rnd(0.12) }),
  drips: () => ({ x: rnd(W), y: -rnd(H * 2), vy: 90 + rnd(40), state: 'fall' }),
  data: () => ({
    x: Math.floor(rnd(30)) * 8, y: rnd(H) - H, vy: 26 + rnd(30),
    color: Math.random() < 0.5 ? '#19d3c5' : '#8a5cff', tail: 6 + rnd(8),
  }),
  dust: () => ({ x: rnd(W), y: rnd(H), sway: rnd(6.28), vy: 2 + rnd(3), a: 0.12 + rnd(0.15) }),
};
function rnd8() { return rnd(8); }

const COUNT = { rain: 46, leaves: 14, spray: 12, drips: 7, data: 22, dust: 16 };

export const Weather = {
  set(newType) {
    type = newType || null;
    parts = [];
    splashes = [];
    if (!type || !SPAWN[type]) { type = null; return; }
    for (let i = 0; i < COUNT[type]; i++) parts.push(SPAWN[type](true));
  },

  update(dt) {
    if (!type) return;
    t += dt;
    const wind = Math.sin(t * 0.5) * 14 + Math.sin(t * 0.17) * 10; // gusting
    for (const p of parts) {
      if (type === 'rain') {
        p.x += (wind - 26) * dt; p.y += p.vy * dt;
        if (p.y > H) {
          if (Math.random() < 0.3) splashes.push({ x: p.x, y: H - rnd(30), t: 0 });
          Object.assign(p, SPAWN.rain());
          p.y = -8;
        }
      } else if (type === 'leaves') {
        p.sway += dt * 2;
        p.x += (wind * 0.7 + Math.sin(p.sway) * 12) * dt;
        p.y += p.vy * dt;
        if (p.y > H + 4) { Object.assign(p, SPAWN.leaves()); p.y = -4; }
        if (p.x > W + 4) p.x = -4;
        if (p.x < -4) p.x = W + 4;
      } else if (type === 'spray') {
        p.x += (p.vx + wind) * dt;
        if (p.x > W + 12) { Object.assign(p, SPAWN.spray()); p.x = -12; }
      } else if (type === 'drips') {
        p.y += p.vy * dt;
        if (p.y > H) {
          splashes.push({ x: p.x, y: H - rnd(40), t: 0 });
          Object.assign(p, SPAWN.drips());
          p.y = -4;
        }
      } else if (type === 'data') {
        p.y += p.vy * dt;
        if (p.y - p.tail > H) { Object.assign(p, SPAWN.data()); p.y = -4; }
      } else if (type === 'dust') {
        p.sway += dt;
        p.x += Math.sin(p.sway) * 4 * dt + wind * 0.08 * dt;
        p.y -= p.vy * dt;
        if (p.y < -2) { Object.assign(p, SPAWN.dust()); p.y = H + 2; }
      }
    }
    for (const s of splashes) s.t += dt;
    splashes = splashes.filter((s) => s.t < 0.35);
  },

  draw(ctx) {
    if (!type) return;
    if (type === 'rain') {
      ctx.strokeStyle = 'rgba(170,200,255,0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (const p of parts) { ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - 1.4, p.y - p.len); }
      ctx.stroke();
      ctx.strokeStyle = 'rgba(200,225,255,0.45)';
      for (const s of splashes) {
        const r = s.t * 10;
        ctx.beginPath(); ctx.ellipse(s.x, s.y, r, r * 0.35, 0, 0, Math.PI * 2); ctx.stroke();
      }
    } else if (type === 'leaves') {
      for (const p of parts) {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x | 0, p.y | 0, p.size, p.size);
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect((p.x | 0) + p.size, (p.y | 0) + 1, 1, 1);
      }
    } else if (type === 'spray') {
      for (const p of parts) {
        ctx.fillStyle = `rgba(255,255,255,${p.a})`;
        ctx.fillRect(p.x | 0, p.y | 0, p.len, 1);
      }
    } else if (type === 'drips') {
      ctx.fillStyle = 'rgba(150,190,255,0.55)';
      for (const p of parts) ctx.fillRect(p.x | 0, p.y | 0, 1, 4);
      ctx.strokeStyle = 'rgba(170,200,255,0.4)';
      for (const s of splashes) {
        const r = s.t * 12;
        ctx.beginPath(); ctx.ellipse(s.x, s.y, r, r * 0.3, 0, 0, Math.PI * 2); ctx.stroke();
      }
    } else if (type === 'data') {
      for (const p of parts) {
        for (let i = 0; i < p.tail; i += 3) {
          const a = 0.35 * (1 - i / p.tail);
          ctx.fillStyle = p.color + Math.round(a * 255).toString(16).padStart(2, '0');
          ctx.fillRect(p.x, (p.y - i) | 0, 1, 2);
        }
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillRect(p.x, p.y | 0, 1, 2);
      }
    } else if (type === 'dust') {
      for (const p of parts) {
        ctx.fillStyle = `rgba(255,226,160,${p.a * (0.6 + Math.sin(p.sway * 3) * 0.4)})`;
        ctx.fillRect(p.x | 0, p.y | 0, 1, 1);
      }
    }
  },
};
