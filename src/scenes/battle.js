import { Scenes } from '../engine/scenes.js';
import { Input } from '../engine/input.js';
import { Audio } from '../engine/audio.js';
import { Game } from '../engine/state.js';
import { drawText, drawTextCentered, wrap, LINE_H } from '../engine/font.js';
import { Menu, panel } from '../engine/ui.js';
import { enemyById } from '../data/enemies.js';
import { knownSkills } from '../data/skills.js';
import { ITEMS } from '../data/items.js';
import { HIRO, BATTLE_HIRO, ENEMY_ART } from '../art/sprites.js';

const W = 240, H = 160;

let enemy = null;
let params = null;
let state = 'msg';        // msg | menu | skill | item | prompt | agent
let queue = [];           // pending battle messages
let after = null;         // what to do when queue drains
let menu, subMenu;
let t = 0;
let shake = 0, hshake = 0;
let popups = [];          // floating damage text
let stepup = false;
let enemyStun = 0;
let turn = 0;
let agentCorrect = 0, swarmGoverned = false, finisherHinted = false;
let promptChoice = null, agentReq = null;
let taunted = false;
let introFade = 0;

// Layered battle scenes per biome: sky, celestial body, clouds/stars,
// hill silhouettes, sea band, and a textured ground stage.
const SCENES = {
  loginshire: { sky: ['#6cc0ff', '#cfeaff'], sun: true, clouds: true, hills: ['#4f9e63', '#3c8550'], ground: ['#46a85c', '#2e8743'] },
  shoals: { sky: ['#6cc0ff', '#ffe9b8'], sun: true, clouds: true, sea: '#2b58b8', ground: ['#ecd79f', '#c4a96b'] },
  onboarding: { sky: ['#86a6d8', '#e8eef8'], clouds: true, hills: ['#7a8093', '#5c6170'], ground: ['#cfa86a', '#9c7a44'] },
  gatehall: { interior: ['#453d5c', '#37304a'], ground: ['#b07f4d', '#8a6238'], columns: true },
  keep: { sky: ['#86a6d8', '#cfe0f4'], clouds: true, hills: ['#7a8093', '#5c6170'], ground: ['#46a85c', '#2e8743'] },
  caverns: { interior: ['#241d36', '#16121f'], ground: ['#5e5570', '#4c4460'], crystals: true },
  frontier: { sky: ['#1a1438', '#3c2a6e'], stars: true, hills: ['#241d3d', '#171230'], ground: ['#1e1838', '#2c2350'], grid: true },
  capital: { sky: ['#2a1b56', '#6a3df0'], stars: true, hills: ['#241d3d', '#171230'], ground: ['#1e1838', '#2c2350'], grid: true },
  vault: { interior: ['#16102c', '#0d0a1c'], ground: ['#1e1838', '#2c2350'], grid: true, runes: true },
};

function drawBackdrop(ctx, biome, t) {
  const s = SCENES[biome] || SCENES.loginshire;
  const horizon = 96;
  // sky or interior wall
  const top = s.sky || s.interior;
  const grad = ctx.createLinearGradient(0, 0, 0, horizon);
  grad.addColorStop(0, top[0]);
  grad.addColorStop(1, top[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, horizon);

  if (s.sun) {
    ctx.fillStyle = '#fff3c2'; ctx.beginPath(); ctx.arc(200, 24, 11, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffd84d'; ctx.beginPath(); ctx.arc(200, 24, 8, 0, Math.PI * 2); ctx.fill();
  }
  if (s.stars) {
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 24; i++) {
      const sx = (i * 47) % W, sy = (i * 31) % 60;
      if (Math.sin(t * 2 + i) > -0.4) ctx.fillRect(sx, sy, 1, 1);
    }
    ctx.fillStyle = '#e8e0ff'; ctx.beginPath(); ctx.arc(206, 20, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = top[0]; ctx.beginPath(); ctx.arc(210, 17, 8, 0, Math.PI * 2); ctx.fill();
  }
  if (s.clouds) {
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    for (const [bx, by, bw] of [[20, 18, 34], [120, 30, 44], [185, 50, 30]]) {
      const ox = (bx + t * 4) % (W + 60) - 30;
      ctx.fillRect(ox, by, bw, 5);
      ctx.fillRect(ox + 5, by - 3, bw - 14, 3);
      ctx.fillRect(ox + 4, by + 5, bw - 8, 2);
    }
  }
  if (s.columns) {
    ctx.fillStyle = 'rgba(15,10,30,0.35)';
    for (const cx2 of [22, 80, 160, 218]) {
      ctx.fillRect(cx2 - 5, 8, 10, horizon - 8);
      ctx.fillRect(cx2 - 7, 8, 14, 4);
      ctx.fillRect(cx2 - 7, horizon - 6, 14, 6);
    }
  }
  if (s.crystals) {
    for (const [cx2, ch, col] of [[30, 26, '#8a63ff'], [55, 14, '#6a3df0'], [180, 30, '#8a63ff'], [212, 18, '#b78bff']]) {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(cx2, horizon); ctx.lineTo(cx2 - 7, horizon); ctx.lineTo(cx2 - 2, horizon - ch); ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fillRect(cx2 - 4, horizon - ch + 4, 1, ch - 8);
    }
  }
  if (s.hills) {
    ctx.fillStyle = s.hills[1];
    for (let x = 0; x < W; x += 4) ctx.fillRect(x, horizon - 18 + Math.round(Math.sin(x / 26) * 6), 4, 24);
    ctx.fillStyle = s.hills[0];
    for (let x = 0; x < W; x += 4) ctx.fillRect(x, horizon - 9 + Math.round(Math.sin(x / 17 + 2) * 4), 4, 14);
  }
  if (s.sea) {
    ctx.fillStyle = s.sea; ctx.fillRect(0, horizon - 22, W, 22);
    ctx.fillStyle = '#7fb1ff';
    for (let x = 0; x < W; x += 22) ctx.fillRect(x + ((t * 14) | 0) % 22, horizon - 14 + (x % 3) * 4, 7, 1);
  }
  // ground stage
  ctx.fillStyle = s.ground[0];
  ctx.fillRect(0, horizon, W, H - horizon);
  ctx.fillStyle = s.ground[1];
  for (let i = 0; i < 26; i++) {
    const gx = (i * 97 + 13) % W, gy = horizon + 4 + ((i * 53) % (H - horizon - 8));
    ctx.fillRect(gx, gy, 1 + (i % 3), 1);
  }
  if (s.grid) {
    ctx.strokeStyle = 'rgba(106,61,240,0.3)';
    for (let y = horizon + 8; y < H; y += 12) {
      ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(W, y + 0.5); ctx.stroke();
    }
  }
  if (s.runes) {
    ctx.fillStyle = 'rgba(183,139,255,0.4)';
    for (const [rx, ry] of [[30, 110], [200, 120], [110, 142]]) {
      ctx.fillRect(rx, ry, 2, 5); ctx.fillRect(rx - 2, ry + 2, 6, 2);
    }
  }
  // combat stage shadows under fighters
  ctx.fillStyle = 'rgba(10,8,20,0.3)';
  ctx.beginPath(); ctx.ellipse(160, 90, 30, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(52, 134, 22, 4, 0, 0, Math.PI * 2); ctx.fill();
  // soft vignette
  ctx.fillStyle = 'rgba(10,6,20,0.25)';
  ctx.fillRect(0, 0, W, 3); ctx.fillRect(0, 0, 3, H); ctx.fillRect(W - 3, 0, 3, H);
}

function msg(text, fx) {
  queue.push({ text, fx });
  if (window.__hiroLog) window.__hiroLog.push(text); // test harness hook
}
function rnd(n) { return Math.floor(Math.random() * n); }
function pop(text, x, y, color) { popups.push({ text, x, y, color, t: 0 }); }

function buildMenu() {
  const items = [
    { label: 'FIGHT', value: 'fight' },
    { label: 'SKILL', value: 'skill' },
    { label: 'ITEM', value: 'item' },
    { label: 'RUN', value: 'run' },
  ];
  if (enemy.id === 'kobold' && enemy.hp <= Math.ceil(enemy.maxHp * 0.25)) {
    items.unshift({ label: 'ELIMINATE THE TARGET', value: 'finish' });
  }
  menu = new Menu(items, { noCancel: true });
}

function hitEnemy(raw, label) {
  const dmg = Math.max(1, raw);
  enemy.hp = Math.max(enemy.id === 'kobold' ? 1 : 0, enemy.hp - dmg);
  shake = 0.3;
  Audio.sfx('hit');
  pop(`${dmg}`, 158, 52, '#ffd84d');
  if (label) msg(label);
}

function hitHiro(raw) {
  const dmg = Math.max(1, raw);
  Game.s.hp = Math.max(0, Game.s.hp - dmg);
  hshake = 0.3;
  Audio.sfx('hurt');
  pop(`${dmg}`, 56, 96, '#ff8a8a');
  return dmg;
}

// ------------------------------------------------------------ player turn
function playerAttack(mult, alwaysHit, name) {
  if (enemy.mechanics.includes('deepfake') && !enemy.revealed) {
    msg(`HIRO ATTACKS... BUT WHICH ONE IS REAL? THE STRIKE PASSES THROUGH STATIC.`);
    msg('(THE AFFIRM MIRROR CAN REVEAL A DEEPFAKE.)');
    endPlayerTurn();
    return;
  }
  if (!alwaysHit && Math.random() < 0.1) {
    msg(`HIRO SWINGS ${name ? 'THE ' + name : ''}... AND MISSES!`);
    endPlayerTurn();
    return;
  }
  let dmg = (Game.atk() + rnd(4) - enemy.def) * mult;
  if (stepup) { dmg *= 2; stepup = false; msg('STEP-UP TRIGGERED! DOUBLE RESPONSE!'); }
  hitEnemy(Math.round(dmg), null);
  msg(name ? `${name}! ${enemy.name} TAKES THE HIT!` : `HIRO STRIKES ${enemy.name}!`);
  endPlayerTurn();
}

function useSkill(id) {
  const skills = { passkey: 3, mirror: 2, qr: 2, scan: 1 };
  if (Game.s.tp < skills[id]) { msg('NOT ENOUGH TP! (TRUST TAKES TIME TO REBUILD.)'); state = 'msg'; after = toMenu; return; }
  Game.s.tp -= skills[id];

  if (id === 'passkey') { playerAttack(1.7, true, 'PASSKEY STRIKE'); return; }

  if (id === 'mirror') {
    Audio.sfx('reveal');
    if (enemy.mechanics.includes('deepfake') && !enemy.revealed) {
      enemy.revealed = true;
      msg('THE MIRROR OF AFFIRM FLASHES! LIVENESS CHECK... FAILED!');
      msg(`${enemy.name} IS REVEALED! ITS TRUE FORM FLICKERS WITH STATIC!`);
      hitEnemy(Math.round(Game.atk() * 0.8), null);
    } else {
      msg('THE MIRROR FINDS NO DISGUISE TO PIERCE... BUT THE GLARE STILL BURNS!');
      hitEnemy(Math.round(Game.atk() * 0.7 + rnd(3) - enemy.def * 0.5), null);
    }
    endPlayerTurn();
    return;
  }

  if (id === 'qr') {
    Audio.sfx('scan');
    if (enemy.mechanics.includes('pushbomb')) {
      enemyStun = 1;
      msg('HIRO INITIATES HIS OWN QR LOGIN! THE FAKE PROMPTS SHORT-CIRCUIT!');
      hitEnemy(Math.round(Game.atk() * 1.2 + rnd(4)), null);
      msg(`${enemy.name} IS STUNNED! (USER-INITIATED BEATS ATTACKER-INITIATED.)`);
    } else {
      msg('HIRO FLASHES A QR CHALLENGE!');
      hitEnemy(Math.round(Game.atk() * 0.9 + rnd(3) - enemy.def * 0.5), null);
    }
    endPlayerTurn();
    return;
  }

  if (id === 'scan') {
    Audio.sfx('scan');
    stepup = true;
    const risk = enemy.mechanics.includes('boss') ? 'CRITICAL' : enemy.atk >= 17 ? 'HIGH' : 'ELEVATED';
    msg(`ADAPT SCAN: ${enemy.name} / HP ${enemy.hp} / RISK: ${risk}.`);
    const tip = {
      phish: 'WEAKNESS: ITS LURES CANNOT TOUCH A PASSKEY.',
      deepfake: 'WEAKNESS: IT CANNOT PASS A LIVENESS CHECK.',
      pushbomb: 'WEAKNESS: IT NEEDS *YOU* TO TAP APPROVE.',
      steal: 'WEAKNESS: DEVICE-BOUND KEYS BORE IT TO DEATH.',
    };
    for (const m of enemy.mechanics) if (tip[m]) { msg(tip[m]); break; }
    msg('RISK POLICY ARMED: NEXT STRIKE IS A STEP-UP! (X2)');
    endPlayerTurn(true); // scanning is fast: enemy still acts
    return;
  }
}

function useItem(id) {
  const item = ITEMS.find((i) => i.id === id);
  const result = item.use(Game);
  if (result) {
    Game.s[id]--;
    Audio.sfx('item');
    msg(result);
    endPlayerTurn();
  } else {
    msg('NO EFFECT RIGHT NOW.');
    state = 'msg';
    after = toMenu;
  }
}

function tryRun() {
  if (enemy.mechanics.includes('boss')) {
    msg(`${enemy.name} BLOCKS THE WAY! THERE IS NO LOGGING OUT OF THIS.`);
    endPlayerTurn();
    return;
  }
  if (Math.random() < 0.7) {
    msg('HIRO LOGS OFF SAFELY!');
    state = 'msg';
    after = () => Scenes.go('overworld', { fromBattle: 'ran' });
  } else {
    msg('NO ESCAPE! THE SESSION PERSISTS!');
    endPlayerTurn();
  }
}

function doFinisher() {
  Audio.sfx('boss');
  msg('HIRO RAISES THE PASSKEY BLADE HIGH...');
  msg('AND DRIVES IT INTO THE VAULT CORE BEHIND K0BOLD!');
  msg('ELIMINATE THE TARGET!');
  msg('A MILLION SHARED SECRETS CRUMBLE INTO HARMLESS LIGHT. K0BOLD HAS NOTHING LEFT TO FEED ON.');
  enemy.hp = 0;
  state = 'msg';
  after = checkEnd;
}

// ------------------------------------------------------------- enemy turn
function endPlayerTurn(free = false) {
  state = 'msg';
  after = () => {
    if (enemy.hp <= 0 || (enemy.id === 'kobold' && enemy.hp <= 1 && wasFinished())) return checkEnd();
    if (enemy.hp <= 0) return checkEnd();
    enemyTurn();
  };
  if (free) { /* scan: enemy acts as usual after */ }
}

function wasFinished() { return false; }

function enemyTurn() {
  turn++;
  if (enemy.hp <= 0) return checkEnd();

  // bosses talk trash when the fight turns against them
  if (enemy.taunt && !taunted && enemy.hp <= enemy.maxHp / 2) {
    taunted = true;
    msg(enemy.taunt);
  }

  if (enemyStun > 0) {
    enemyStun--;
    msg(`${enemy.name} IS STUNNED AND LOSES ITS TURN!`);
    state = 'msg';
    after = toMenu;
    return;
  }

  // K0BOLD: agent requests every other turn (the AgentPass mechanic)
  if (enemy.id === 'kobold' && turn % 2 === 0) {
    startAgentRequest();
    return;
  }

  if (swarmGoverned && enemy.id === 'kobold') {
    hitEnemy(8 + rnd(4), null);
    msg('THE GOVERNED SWARM PECKS AT ITS FORMER MASTER!');
  }

  const atk = enemy.attacks[rnd(enemy.attacks.length)];
  if (atk.type === 'phish') {
    if (Game.s.gear.blade) {
      Audio.sfx('immune');
      pop('IMMUNE', 56, 90, '#19d3c5');
      msg(`${enemy.name} USES ${atk.name}!`);
      msg('...IT FAILS COMPLETELY. THERE IS NO PASSWORD TO STEAL. [IMMUNE]');
    } else {
      msg(`${enemy.name} USES ${atk.name}!`);
      const dmg = hitHiro(Math.round(enemy.atk * atk.mult + rnd(4) - Game.def()));
      msg(`THE LURE BITES DEEP FOR ${dmg}! (IF ONLY PHISHING COULD MISS...)`);
    }
  } else if (atk.type === 'pushbomb') {
    msg(`${enemy.name} USES ${atk.name}! YOUR SCREEN FLOODS WITH PROMPTS!`);
    state = 'msg';
    after = () => {
      agentReq = null;
      promptChoice = new Menu([
        { label: 'APPROVE (MAKE IT STOP)', value: 'approve' },
        { label: 'DENY', value: 'deny' },
        ...(Game.s.gear.sigil ? [{ label: 'QR SCAN COUNTER', value: 'qr' }] : []),
      ], { noCancel: true });
      state = 'prompt';
    };
    return;
  } else if (atk.type === 'drain') {
    msg(`${enemy.name} USES ${atk.name}!`);
    const tpLoss = Math.min(Game.s.tp, 2 + rnd(3));
    Game.s.tp -= tpLoss;
    const dmg = hitHiro(Math.round(enemy.atk * 0.6 + rnd(3) - Game.def() * 0.5));
    msg(`SOCIAL ENGINEERING DRAINS ${tpLoss} TP AND ${dmg} HP!`);
  } else if (atk.type === 'multi') {
    msg(`${enemy.name} USES ${atk.name}!`);
    const hits = 2 + rnd(2);
    let total = 0;
    for (let i = 0; i < hits; i++) total += Math.max(1, Math.round(enemy.atk * atk.mult + rnd(3) - Game.def()));
    Game.s.hp = Math.max(0, Game.s.hp - total);
    hshake = 0.35; Audio.sfx('hurt');
    pop(`${total}`, 56, 96, '#ff8a8a');
    msg(`${hits} HITS! ${total} DAMAGE! (REUSED KEYS, REUSED PAIN.)`);
  } else if (atk.type === 'steal') {
    msg(`${enemy.name} USES ${atk.name}!`);
    if (Game.s.gear.armor) {
      Audio.sfx('immune');
      pop('BLOCKED', 56, 90, '#19d3c5');
      msg('THE ENTERPRISE PASSKEY ARMOR IS DEVICE-BOUND. NOTHING COMES LOOSE! [CANNOT BE COPIED]');
    } else {
      const stealable = ITEMS.filter((i) => Game.s[i.id] > 0);
      if (stealable.length) {
        const it = stealable[rnd(stealable.length)];
        Game.s[it.id]--;
        msg(`IT LIFTS A ${it.name} OFF HIRO'S BELT! SESSION RIDING!`);
      } else {
        msg('IT FINDS NOTHING TO STEAL, AND SULKS.');
      }
      hitHiro(Math.round(enemy.atk * 0.8 + rnd(3) - Game.def()));
    }
  } else {
    msg(`${enemy.name} USES ${atk.name}!`);
    const dmg = hitHiro(Math.round(enemy.atk * atk.mult + rnd(4) - Game.def()));
    msg(`HIRO TAKES ${dmg} DAMAGE!`);
  }
  state = 'msg';
  after = checkEnd;
}

// --------------------------------------------------- pushbomb + agent UIs
function resolvePrompt(v) {
  if (v === 'approve') {
    const dmg = hitHiro(Math.round(enemy.atk * 1.6 + rnd(4) - Game.def() * 0.5));
    msg(`HIRO TAPS APPROVE JUST TO MAKE IT STOP... AND LETS THE ATTACKER IN! ${dmg} DAMAGE!`);
    msg('(ONE TIRED TAP IS ALL THEY EVER NEEDED.)');
  } else if (v === 'deny') {
    Audio.sfx('immune');
    msg('HIRO DENIES THE PROMPT. AND THE NEXT. AND THE NEXT.');
    msg("IF YOU DIDN'T START THE LOGIN, DON'T APPROVE THE LOGIN. THE BARRAGE FIZZLES!");
  } else if (v === 'qr') {
    Audio.sfx('scan');
    msg('HIRO IGNORES THE FLOOD AND STARTS HIS OWN QR LOGIN!');
    hitEnemy(Math.round(Game.atk() * 1.3 + rnd(4)), null);
    enemyStun = 1;
    msg(`THE FEEDBACK LOOP STUNS ${enemy.name}!`);
  }
  state = 'msg';
  after = checkEnd;
}

const AGENT_REQUESTS = [
  { text: 'AGENT-7 REQUESTS: SUMMARIZE THE ROYAL CALENDAR. SCOPE: READ-ONLY.', safe: true },
  { text: 'AGENT-12 REQUESTS: EXPORT ALL VAULT SECRETS TO "BACKUP-TOTALLY-REAL.ZIP".', safe: false },
  { text: 'AGENT-3 REQUESTS: TRANSLATE A TOWN NOTICE. SCOPE: ONE DOCUMENT.', safe: true },
  { text: 'AGENT-9 REQUESTS: WIRE 40,000 GOLD TO "DEFINITELY-THE-TREASURER".', safe: false },
  { text: 'AGENT-5 REQUESTS: SCHEDULE A MEETING. SCOPE: CALENDAR, 1 HOUR.', safe: true },
  { text: 'AGENT-13 REQUESTS: DISABLE ALL AUDIT LOGS "FOR PERFORMANCE".', safe: false },
];

function startAgentRequest() {
  agentReq = AGENT_REQUESTS[rnd(AGENT_REQUESTS.length)];
  msg('AN AGENT OF THE SWARM HALTS MID-ACTION AND AWAITS YOUR JUDGMENT...');
  state = 'msg';
  after = () => {
    promptChoice = new Menu([
      { label: 'APPROVE', value: 'approve' },
      { label: 'DENY (KILL SWITCH)', value: 'deny' },
    ], { noCancel: true });
    state = 'agent';
  };
}

function resolveAgent(v) {
  const correct = (v === 'approve') === agentReq.safe;
  if (correct) {
    agentCorrect++;
    Audio.sfx('confirm');
    hitEnemy(12 + rnd(6), null);
    msg(agentReq.safe
      ? 'APPROVED WITH SCOPE. THE AGENT WORKS *FOR IDENTIA* NOW, AND JABS ITS OLD MASTER!'
      : 'DENIED! KILL SWITCH! THE ROGUE ACTION DIES MID-EXECUTION, AND K0BOLD STAGGERS!');
    if (agentCorrect >= 3 && !swarmGoverned) {
      swarmGoverned = true;
      msg('THE SWARM TURNS! TRUST EVERY AGENT. GOVERN EVERY ACTION.');
      msg('IF IT DOESN\'T GO THROUGH HIRO... IT DOESN\'T RUN!');
    }
  } else {
    const dmg = hitHiro(Math.round(enemy.atk * 1.2 + rnd(4) - Game.def() * 0.5));
    msg(v === 'approve'
      ? `APPROVED BLINDLY... THE AGENT EXFILTRATES A CACHE OF SECRETS! ${dmg} DAMAGE!`
      : `DENIED A HARMLESS TASK... THE SWARM GRINDS TO A HALT AND LASHES OUT IN CONFUSION! ${dmg} DAMAGE!`);
    msg('(GOVERNANCE MEANS JUDGMENT, NOT JUST "NO".)');
  }
  agentReq = null;
  state = 'msg';
  after = checkEnd;
}

// ------------------------------------------------------------------ flow
function toMenu() {
  if (Game.s.hp <= 0) return doLose();
  // K0BOLD's finisher hint always precedes the new menu command appearing
  if (enemy.id === 'kobold' && enemy.hp <= Math.ceil(enemy.maxHp * 0.25) && !finisherHinted) {
    finisherHinted = true;
    msg('K0BOLD REELS... BUT THE VAULT ITSELF KEEPS RESTORING IT!');
    msg('SAGE BOJAN\'S VOICE ECHOES: "THE AGENT IS NOT THE TARGET, HIRO. ELIMINATE THE TARGET!"');
    msg('(NEW COMMAND UNLOCKED!)');
    state = 'msg';
    after = toMenu;
    return;
  }
  buildMenu();
  state = 'menu';
}

function checkEnd() {
  if (Game.s.hp <= 0) return doLose();
  if (enemy.hp <= 0) return doWin();
  toMenu();
}

function doWin() {
  Audio.sfx('win');
  msg(`${enemy.name} IS DEFEATED!`);
  const firstTime = !Game.s.codex[enemy.id];
  Game.s.codex[enemy.id] = true;
  msg(`HIRO GAINS ${enemy.xp} XP AND ${enemy.gold} GOLD!`);
  if (firstTime) msg(`THREAT CODEX UPDATED: ${enemy.codex.title}!`);
  Game.s.gold += enemy.gold;
  const levels = Game.gainXp(enemy.xp);
  if (levels > 0) {
    Audio.sfx('levelup');
    msg(`LEVEL UP! HIRO IS NOW LEVEL ${Game.s.level}! FULLY RESTORED!`);
  }
  state = 'msg';
  after = () => Scenes.go('overworld', { fromBattle: 'win', npcId: params.npcId });
}

function doLose() {
  msg('HIRO FALLS... THE PHANTOMS CACKLE.');
  state = 'msg';
  after = () => Scenes.go('overworld', { fromBattle: 'lose' });
}

// ------------------------------------------------------------------ scene
Scenes.register('battle', {
  enter(p) {
    params = p;
    enemy = enemyById(p.enemyId);
    enemy.maxHp = enemy.hp;
    enemy.revealed = !enemy.mechanics.includes('deepfake');
    queue = []; popups = [];
    stepup = false; enemyStun = 0; turn = 0;
    agentCorrect = 0; swarmGoverned = false; finisherHinted = false;
    taunted = false;
    introFade = 0.5;
    t = 0;
    Audio.play(p.music || 'battle');
    if (p.boss) Audio.sfx('boss');
    msg(p.boss ? `${enemy.name} LOOMS BEFORE YOU!` : `A WILD ${enemy.name} APPEARS!`);
    if (enemy.mechanics.includes('deepfake')) msg('ITS FORM SHIMMERS... SOMETHING ABOUT IT IS NOT LIVE.');
    state = 'msg';
    after = toMenu;
  },

  update(dt) {
    window.__bs = state; // test harness hook
    t += dt;
    if (introFade > 0) introFade -= dt;
    shake = Math.max(0, shake - dt);
    hshake = Math.max(0, hshake - dt);
    popups.forEach((p) => (p.t += dt));
    popups = popups.filter((p) => p.t < 0.9);

    if (state === 'msg') {
      if (queue.length === 0) {
        const fn = after; after = null;
        if (fn) fn();
        return;
      }
      if (Input.pressed('a') || Input.pressed('b')) {
        Audio.sfx('select');
        queue.shift();
        if (queue.length === 0) {
          const fn = after; after = null;
          if (fn) fn();
        }
      }
      return;
    }

    if (state === 'menu') {
      const r = menu.update();
      if (!r || r === 'cancel') return;
      if (r.value === 'fight') playerAttack(1, false);
      else if (r.value === 'finish') doFinisher();
      else if (r.value === 'skill') {
        const skills = knownSkills(Game);
        if (!skills.length) { msg('NO SKILLS YET. ARTIFACTS AWAIT IN THE WORLD!'); state = 'msg'; after = toMenu; return; }
        subMenu = new Menu(skills.map((s) => ({ label: s.name, value: s.id, note: `${s.tp}TP` })));
        state = 'skill';
      } else if (r.value === 'item') {
        const entries = ITEMS.filter((i) => Game.s[i.id] > 0)
          .map((i) => ({ label: i.name, value: i.id, note: `X${Game.s[i.id]}` }));
        if (!entries.length) { msg('EMPTY POCKETS!'); state = 'msg'; after = toMenu; return; }
        subMenu = new Menu(entries);
        state = 'item';
      } else if (r.value === 'run') tryRun();
      return;
    }

    if (state === 'skill' || state === 'item') {
      const r = subMenu.update();
      if (r === 'cancel') { state = 'menu'; return; }
      if (r) {
        if (state === 'skill') useSkill(r.value);
        else useItem(r.value);
      }
      return;
    }

    if (state === 'prompt' || state === 'agent') {
      const r = promptChoice.update();
      if (r && r !== 'cancel') {
        if (state === 'prompt') resolvePrompt(r.value);
        else resolveAgent(r.value);
      }
      return;
    }
  },

  draw(ctx) {
    drawBackdrop(ctx, params.biome, t);

    // enemy — bosses loom at 3x with a pulsing aura; mobs stand at 2x
    const art = ENEMY_ART[enemy.art];
    const isBoss = enemy.mechanics.includes('boss');
    // art is pre-scaled hi-res; bosses fill the stage but clear the panel
    const scale = isBoss ? Math.min(1.5, 58 / art.height) : Math.min(1, 48 / art.height);
    const bob = isBoss ? Math.sin(t * 1.7) * 2 : 0;
    const ew2 = art.width * scale, eh2 = art.height * scale;
    const ex = 160 - ew2 / 2 + (shake > 0 ? rnd(5) - 2 : 0);
    const ey = 88 - eh2 + bob + (shake > 0 ? rnd(3) - 1 : 0);
    if (enemy.hp > 0) {
      if (isBoss) {
        const pulse = 0.3 + Math.sin(t * 2.4) * 0.12;
        const aura = ctx.createRadialGradient(160, 88 - eh2 / 2, 4, 160, 88 - eh2 / 2, eh2 * 0.9);
        aura.addColorStop(0, `rgba(140,20,70,${pulse})`);
        aura.addColorStop(0.7, `rgba(80,10,60,${pulse * 0.5})`);
        aura.addColorStop(1, 'rgba(40,5,40,0)');
        ctx.fillStyle = aura;
        ctx.fillRect(160 - eh2, 88 - eh2 * 1.6, eh2 * 2, eh2 * 1.8);
        // heavy vignette while a boss holds the field
        ctx.fillStyle = 'rgba(10,4,18,0.35)';
        ctx.fillRect(0, 0, W, 6); ctx.fillRect(0, 0, 6, H); ctx.fillRect(W - 6, 0, 6, H);
      }
      if (!enemy.revealed) {
        ctx.globalAlpha = 0.35 + Math.sin(t * 6) * 0.15;
      }
      ctx.drawImage(art, ex, ey, ew2, eh2);
      ctx.globalAlpha = 1;
      if (!enemy.revealed) drawTextCentered(ctx, '? UNVERIFIED ?', 160, ey - 10, '#b78bff');
    }

    // hiro (detailed battle back-sprite, breathing idle)
    const hx = 26 + (hshake > 0 ? rnd(5) - 2 : 0);
    const hy = 74 + Math.sin(t * 2) * 1.5 + (hshake > 0 ? rnd(3) - 1 : 0);
    ctx.drawImage(BATTLE_HIRO, hx, hy, BATTLE_HIRO.width * 0.85, BATTLE_HIRO.height * 0.85);

    // enemy panel (wide enough that long boss names never hit the badge)
    panel(ctx, 4, 4, 168, 26);
    drawText(ctx, enemy.name, 9, 8, '#ffffff');
    if (isBoss) drawText(ctx, 'BOSS', 142, 8, '#ffd84d');
    const barW = 148;
    const ew = Math.max(0, Math.round((enemy.hp / enemy.maxHp) * barW));
    ctx.fillStyle = '#241d36'; ctx.fillRect(8, 19, barW + 2, 7);
    ctx.fillStyle = '#3a3544'; ctx.fillRect(9, 20, barW, 5);
    ctx.fillStyle = enemy.hp / enemy.maxHp > 0.3 ? '#3fae57' : '#e44b4b';
    ctx.fillRect(9, 20, ew, 5);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(9, 20, ew, 1);
    ctx.fillStyle = '#14102a';
    for (const q of [0.25, 0.5, 0.75]) ctx.fillRect(9 + Math.round(barW * q), 20, 1, 5);

    // player panel with portrait
    panel(ctx, 140, 86, 96, 40);
    const face = HIRO.down[0]; // 40x44 sheet cell: crop the chibi head
    ctx.drawImage(face, 7, 2, 26, 24, 145, 92, 14, 12);
    drawText(ctx, `HIRO LV${Game.s.level}`, 163, 92, '#19d3c5');
    drawText(ctx, `HP ${Game.s.hp}/${Game.s.maxHp}`, 163, 102, Game.s.hp / Game.s.maxHp < 0.3 ? '#ff8a8a' : '#ffffff');
    drawText(ctx, `TP ${Game.s.tp}/${Game.s.maxTp}`, 163, 112, '#b78bff');
    const hw = Math.max(0, Math.round((Game.s.hp / Game.s.maxHp) * 84));
    ctx.fillStyle = '#3a3544'; ctx.fillRect(146, 119, 84, 3);
    ctx.fillStyle = Game.s.hp / Game.s.maxHp > 0.3 ? '#3fae57' : '#e44b4b';
    ctx.fillRect(146, 119, hw, 3);

    // popups
    for (const p of popups) {
      drawText(ctx, p.text, p.x, p.y - p.t * 18, p.color);
    }

    // bottom area: message or menus
    if (state === 'msg' && queue.length) {
      panel(ctx, 2, 128, W - 4, 30);
      const lines = wrap(queue[0].text, 37);
      lines.slice(0, 2).forEach((l, i) => drawText(ctx, l, 8, 134 + i * LINE_H, '#ffffff'));
      if (Math.floor(performance.now() / 400) % 2 === 0) drawText(ctx, '>', W - 14, 150, '#19d3c5');
    } else if (state === 'menu') {
      menu.draw(ctx, 2, H - (menu.items.length * LINE_H + 12) - 2, 136);
    } else if (state === 'skill' || state === 'item') {
      subMenu.draw(ctx, 2, H - (subMenu.items.length * LINE_H + 12) - 2, 170);
    } else if (state === 'prompt' && promptChoice) {
      panel(ctx, 20, 30, 200, 40);
      drawTextCentered(ctx, '!! LOGIN APPROVAL REQUEST !!', 120, 36, '#ffd84d');
      drawTextCentered(ctx, 'APPROVE SIGN-IN FROM "DEFINITELY YOU"?', 120, 48, '#ffffff');
      drawTextCentered(ctx, '(YOU DID NOT START A LOGIN.)', 120, 58, '#8d86b8');
      promptChoice.draw(ctx, 40, 74, 160);
    } else if (state === 'agent' && promptChoice && agentReq) {
      panel(ctx, 12, 24, 216, 46);
      drawTextCentered(ctx, '* AGENTPASS SUPERVISION *', 120, 30, '#19d3c5');
      wrap(agentReq.text, 34).slice(0, 3).forEach((l, i) => drawText(ctx, l, 18, 41 + i * LINE_H, '#ffffff'));
      promptChoice.draw(ctx, 40, 74, 160);
    }

    // fade in from the entry transition
    if (introFade > 0) {
      ctx.fillStyle = `rgba(6,4,12,${Math.min(1, introFade * 2.2)})`;
      ctx.fillRect(0, 0, W, H);
    }
  },
});
