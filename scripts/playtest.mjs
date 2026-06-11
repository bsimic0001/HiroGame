// Deep functional playtest: drives the real game in headless Chromium and
// asserts the signature mechanics, progression, ending, and save system.
// State-aware: waits on window.__bs (battle state) instead of blind key spam.
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const SHOTS = '/tmp/hyprgame-shots';
mkdirSync(SHOTS, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 960, height: 720 } });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));

let pass = 0, fail = 0;
const check = (name, ok) => {
  if (ok) { pass++; console.log(`  ok: ${name}`); }
  else { fail++; console.log(`  FAIL: ${name}`); }
};
const z = async (n = 1, ms = 120) => { for (let i = 0; i < n; i++) { await page.keyboard.press('z'); await page.waitForTimeout(ms); } };
const key = async (k, ms = 140) => { await page.keyboard.press(k); await page.waitForTimeout(ms); };
const log = () => page.evaluate(() => window.__hiroLog.join('\n'));
const clearLog = () => page.evaluate(() => { window.__hiroLog.length = 0; });
const sceneName = () => page.evaluate(() => import('/src/engine/scenes.js').then((m) => m.Scenes.name));
const game = () => page.evaluate(() => import('/src/engine/state.js').then((m) => JSON.parse(JSON.stringify(m.Game.s))));
const bstate = () => page.evaluate(() => window.__bs || '');

// press A through messages until battle reaches `target` state (or timeout)
async function untilState(target, max = 40) {
  for (let i = 0; i < max; i++) {
    const s = await bstate();
    const sc = await sceneName();
    if (sc !== 'battle') return sc;
    if (s === target) return s;
    await z(1);
  }
  return await bstate();
}

async function boot() {
  await page.goto('http://localhost:8741/');
  await page.evaluate(() => { window.__hiroLog = []; });
  await page.waitForTimeout(500);
  await page.evaluate(() => { Math.random = () => 0.3; }); // deterministic: enemies use attacks[0], player never misses
}

async function startBattle(enemyId, opts = '{}', npcId = null) {
  await page.evaluate(`
    import('/src/engine/scenes.js').then(async (m) => {
      const { Game } = await import('/src/engine/state.js');
      const o = ${opts};
      Object.assign(Game.s, o);
      if (o.gear) Game.s.gear = Object.assign({ blade: false, mirror: false, sigil: false, visor: false, armor: false, crown: false }, o.gear);
      m.Scenes.go('battle', { enemyId: '${enemyId}', boss: false, music: 'battle', biome: 'shoals', npcId: ${npcId ? `'${npcId}'` : 'undefined'} });
    })
  `);
  await page.waitForTimeout(400);
}

// ---------------------------------------------------------------- TEST 1
console.log('TEST 1: phishing IMMUNE with Passkey Blade');
await boot();
await startBattle('phishkoi', `{ gear: { blade: true }, level: 1, hp: 36, maxHp: 36, tp: 12, maxTp: 12, gold: 30 }`);
await untilState('menu');
await z(1); // FIGHT
await untilState('menu');
const log1 = await log();
check('enemy used HOOK CAST', log1.includes('HOOK CAST'));
check('attack was IMMUNE', log1.includes('IMMUNE'));
check('no password to steal line', log1.includes('NO PASSWORD TO STEAL'));
for (let i = 0; i < 6 && (await sceneName()) === 'battle'; i++) { await z(1); await untilState('menu', 15); }
const g1 = await game();
check('codex unlocked for phishkoi', g1.codex.phishkoi === true);
check('gold awarded', g1.gold > 30);
check('returned to overworld', (await sceneName()) === 'overworld');

// ---------------------------------------------------------------- TEST 2
console.log('TEST 2: deepfake must be revealed by Affirm Mirror');
await boot();
await startBattle('doppel', `{ gear: { blade: true, mirror: true }, level: 4, hp: 57, maxHp: 57, tp: 18, maxTp: 18 }`);
await untilState('menu');
await z(1); // FIGHT into the fake
const log2a = await log();
check('attack passes through unrevealed deepfake', log2a.includes('WHICH ONE IS REAL'));
await untilState('menu');
await clearLog();
await key('ArrowDown'); // SKILL
await z(1);
await page.waitForTimeout(200);
await key('ArrowDown'); // PASSKEY STRIKE -> AFFIRM MIRROR
await page.screenshot({ path: `${SHOTS}/t2-skillmenu.png` });
await z(1);
await page.waitForTimeout(300);
const log2b = await log();
check('mirror runs liveness check', log2b.includes('LIVENESS CHECK'));
check('deepfake revealed', log2b.includes('REVEALED'));
await page.screenshot({ path: `${SHOTS}/t2-reveal.png` });

// ---------------------------------------------------------------- TEST 3
console.log('TEST 3: push bomb prompt - DENY fizzles the barrage');
await boot();
await startBattle('pushbomber', `{ gear: { blade: true, mirror: true, sigil: true }, level: 6, hp: 71, maxHp: 71, tp: 22, maxTp: 22 }`);
await untilState('menu');
await z(1); // FIGHT; enemy responds with PUSH BOMB
await untilState('prompt');
await page.screenshot({ path: `${SHOTS}/t3-prompt.png` });
check('push bomb prompt reached', (await bstate()) === 'prompt');
await clearLog();
await key('ArrowDown'); // APPROVE -> DENY
await z(1);
await page.waitForTimeout(300);
const log3 = await log();
check('deny fizzles the barrage', log3.includes('FIZZLES'));

// ---------------------------------------------------------------- TEST 4
console.log('TEST 4: token theft blocked by Enterprise Passkey Armor');
await boot();
await startBattle('tokenthief', `{ gear: { blade: true, armor: true }, level: 8, hp: 85, maxHp: 85, tp: 26, maxTp: 26, potions: 3 }`);
await untilState('menu');
await z(1); // FIGHT; enemy responds with TOKEN SWIPE
await untilState('menu');
const log4 = await log();
check('steal attempted', log4.includes('TOKEN SWIPE'));
check('steal blocked by device-bound armor', log4.includes('CANNOT BE COPIED'));
const g4 = await game();
check('no items lost', g4.potions === 3);

// ---------------------------------------------------------------- TEST 5
console.log('TEST 5: K0BOLD supervision + ELIMINATE THE TARGET + full ending');
await boot();
await startBattle('kobold',
  `{ map: 'vault', x: 12, y: 14, facing: 'up', gear: { blade: true, mirror: true, sigil: true, visor: true, armor: true, crown: true }, level: 11, hp: 106, maxHp: 106, tp: 32, maxTp: 32 }`,
  'kobold');
// Plain A always picks the top menu item: FIGHT normally, the finisher once it
// unlocks. On agent prompts, Down+A picks DENY (deterministic request is the
// unsafe export, so DENY is always the correct call).
let sawAgent = false;
for (let round = 0; round < 120 && (await sceneName()) === 'battle'; round++) {
  if ((await bstate()) === 'agent') {
    sawAgent = true;
    await page.screenshot({ path: `${SHOTS}/t5-agentpass.png` });
    await key('ArrowDown');
  }
  await z(1);
}
const log5 = await log();
check('agent supervision request appeared', sawAgent);
check('swarm governed after 3 correct calls', log5.includes('THE SWARM TURNS'));
check('finisher unlocked after vault clamps K0BOLD', log5.includes('NEW COMMAND UNLOCKED'));
check('finisher executed', log5.includes('ELIMINATE THE TARGET!'));
check('back to overworld for b5_win', (await sceneName()) === 'overworld');
for (let i = 0; i < 10 && (await sceneName()) === 'overworld'; i++) await z(1, 200); // b5_win dialog -> ending
check('reached ending scene', (await sceneName()) === 'ending');
await page.screenshot({ path: `${SHOTS}/t5-ending.png` });
await z(5, 300);
await page.screenshot({ path: `${SHOTS}/t5-epilogue.png` });
await z(8, 300);
await page.screenshot({ path: `${SHOTS}/t5-splash.png` });
await z(1, 300);
check('splash returns to title', (await sceneName()) === 'title');

// ---------------------------------------------------------------- TEST 6
console.log('TEST 6: save persists across reload');
await page.evaluate(() => localStorage.removeItem('hiro.save.v1'));
await page.goto('http://localhost:8741/');
await page.evaluate(() => { window.__hiroLog = []; });
await page.waitForTimeout(500);
await z(1); // NEW GAME
await page.waitForTimeout(400);
await z(18, 110); // clear 8-page intro (2 presses per page w/ typewriter)
for (let i = 0; i < 3; i++) { await page.keyboard.down('ArrowRight'); await page.waitForTimeout(280); await page.keyboard.up('ArrowRight'); }
const gBefore = await game();
await page.evaluate(() => import('/src/engine/state.js').then((m) => m.Game.save()));
await page.goto('http://localhost:8741/');
await page.waitForTimeout(500);
await page.evaluate(() => { window.__hiroLog = []; });
await z(1); // CONTINUE
await page.waitForTimeout(400);
const gAfter = await game();
check('position persisted', gAfter.x === gBefore.x && gAfter.y === gBefore.y && gBefore.x !== 12);
check('back in overworld', (await sceneName()) === 'overworld');
await page.screenshot({ path: `${SHOTS}/t6-continued.png` });

// ---------------------------------------------------------------- TEST 7
console.log('TEST 7: boss NPC -> win -> gear+flag -> portal to next chapter');
await boot();
await page.evaluate(() => import('/src/engine/scenes.js').then(async (m) => {
  const { Game } = await import('/src/engine/state.js');
  Game.newGame();
  Object.assign(Game.s, { map: 'shoals', x: 25, y: 8, facing: 'right', level: 20, hp: 169, maxHp: 169, tp: 50, maxTp: 50 });
  Game.s.flags.seen_shoals = true;
  m.Scenes.go('overworld');
}));
await page.waitForTimeout(400);
await z(12, 160); // talk to Phisher King, advance b1_pre
for (let i = 0; i < 25 && (await sceneName()) === 'battle'; i++) {
  await untilState('menu', 10);
  if ((await sceneName()) !== 'battle') break;
  await z(1); // FIGHT
}
check('boss defeated, back in overworld', (await sceneName()) === 'overworld');
await z(14, 160); // b1_win dialog (blade awarded)
const g7 = await game();
check('Passkey Blade earned from boss', g7.gear.blade === true);
check('boss1 flag set', g7.flags.boss1 === true);
// boss tile vacated; walk right across the bridge into the portal
for (let i = 0; i < 5; i++) { await page.keyboard.down('ArrowRight'); await page.waitForTimeout(300); await page.keyboard.up('ArrowRight'); }
await page.waitForTimeout(400);
const g7b = await game();
check('portal led to Onboarding Gate', g7b.map === 'onboarding');
await page.screenshot({ path: `${SHOTS}/t7-onboarding.png` });

// ---------------------------------------------------------------- TEST 8
console.log('TEST 8: touch controls');
const touchCtx = await browser.newContext({ hasTouch: true, viewport: { width: 420, height: 760 } });
const tpage = await touchCtx.newPage();
tpage.on('pageerror', (e) => errors.push('touch: ' + e));
await tpage.goto('http://localhost:8741/');
await tpage.waitForTimeout(600);
await tpage.touchscreen.tap(210, 300); // anywhere: reveals touch UI
await tpage.waitForTimeout(200);
const touchVisible = await tpage.evaluate(() => document.body.classList.contains('touch'));
check('touch D-pad revealed on touch device', touchVisible);
await tpage.tap('#b-a'); // NEW GAME
await tpage.waitForTimeout(400);
const tscene = await tpage.evaluate(() => import('/src/engine/scenes.js').then((m) => m.Scenes.name));
check('A button starts the game', tscene === 'overworld');
await tpage.screenshot({ path: `${SHOTS}/t8-touch.png` });
await touchCtx.close();

console.log(errors.length ? `\nCONSOLE ERRORS:\n${errors.join('\n')}` : '\nno console errors');
console.log(`\n${pass} passed, ${fail} failed`);
await browser.close();
process.exit(fail || errors.length ? 1 : 0);
