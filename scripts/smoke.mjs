// Playwright smoke driver: boots the game, starts a new game, advances the
// intro, walks around, and screenshots each stage. Usage: node scripts/smoke.mjs
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const SHOTS = '/tmp/hyprgame-shots';
mkdirSync(SHOTS, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 960, height: 720 } });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));

await page.goto('http://localhost:8741/');
await page.waitForTimeout(1200);
await page.screenshot({ path: `${SHOTS}/01-title.png` });

// title menu: fresh profile -> NEW GAME is first item
await page.keyboard.press('z'); // select NEW GAME
await page.waitForTimeout(600);
await page.screenshot({ path: `${SHOTS}/02-intro.png` });

// advance all intro dialog pages
for (let i = 0; i < 10; i++) { await page.keyboard.press('z'); await page.waitForTimeout(250); }
await page.screenshot({ path: `${SHOTS}/03-overworld.png` });

// walk around the village
for (const [key, n] of [['ArrowDown', 3], ['ArrowRight', 4], ['ArrowUp', 2]]) {
  for (let i = 0; i < n; i++) { await page.keyboard.down(key); await page.waitForTimeout(260); await page.keyboard.up(key); }
}
await page.screenshot({ path: `${SHOTS}/04-walked.png` });

// open pause menu, status
await page.keyboard.press('x');
await page.waitForTimeout(300);
await page.keyboard.press('ArrowDown');
await page.keyboard.press('z');
await page.waitForTimeout(300);
await page.screenshot({ path: `${SHOTS}/05-status.png` });
await page.keyboard.press('x'); await page.waitForTimeout(200);
await page.keyboard.press('x'); await page.waitForTimeout(200);

// jump straight into a battle via the scene machine (test harness path)
await page.evaluate(() => {
  return import('/src/engine/scenes.js').then((m) => {
    m.Scenes.go('battle', { enemyId: 'phishkoi', boss: false, music: 'battle', biome: 'shoals' });
  });
});
await page.waitForTimeout(500);
await page.screenshot({ path: `${SHOTS}/06-battle.png` });
await page.keyboard.press('z'); // dismiss "A WILD..."
await page.waitForTimeout(300);
await page.screenshot({ path: `${SHOTS}/07-battle-menu.png` });
await page.keyboard.press('z'); // FIGHT
await page.waitForTimeout(400);
await page.screenshot({ path: `${SHOTS}/08-battle-fight.png` });

// codex from a deepfake + boss test
await page.evaluate(() => {
  return import('/src/engine/scenes.js').then(async (m) => {
    const { Game } = await import('/src/engine/state.js');
    Game.s.gear.blade = true; Game.s.gear.mirror = true; Game.s.gear.sigil = true;
    Game.s.gear.visor = true; Game.s.gear.crown = true; Game.s.level = 12;
    Game.s.maxHp = 113; Game.s.hp = 113; Game.s.maxTp = 34; Game.s.tp = 34;
    m.Scenes.go('battle', { enemyId: 'kobold', boss: true, music: 'boss', biome: 'vault' });
  });
});
await page.waitForTimeout(500);
await page.keyboard.press('z');
await page.waitForTimeout(300);
await page.screenshot({ path: `${SHOTS}/09-kobold.png` });

console.log(errors.length ? `CONSOLE ERRORS:\n${errors.join('\n')}` : 'NO CONSOLE ERRORS');
await browser.close();
