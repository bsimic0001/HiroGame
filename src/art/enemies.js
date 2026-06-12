// High-detail battle sprites for the Phantom Legion.
// Every adversary's design tells you what identity attack it is.
// Most are single battle frames baked from generated expression sheets
// (assets/sprites/*.png); the three fish and K0BOLD remain hand-set ASCII.
import { compile, glitchify, scale2x, shade } from './palette.js';
import { SHEETS, FRAMES, scaleSheetFrame as scaleFrame } from './sheets.js';

// Pixel-art finishing pipeline: double resolution with rounded contours,
// then bake in top-lit volumetric shading. GBA polish for hand-set pixels.
const polish = (cv) => shade(scale2x(cv));

// PHISH KOI 38x24 — fat koi, white belly, orange patches, a hook in its lip
// trailing line, blowing a bubble. The entry-level lure.
const PHISHKOI = [
  '............y.........................',
  '............y.............kk..........',
  '............y............kzzk.........',
  '............y.............kk..........',
  '.............kkkkkkkkkk...............',
  '..........kkkooooooooookk.............',
  '........kkoooowwooooooooOkk....kkk....',
  '.......koooooowwkoooooooOOOk..kooOk...',
  '......koowoooooooooOOoooooOOkkoooOk...',
  '.....koowwoooooooooOOooooooookooOOk...',
  '....kowwooookwkoooooooOOoooookoOOk....',
  '....kowoooookkooooooooOOooooookOOk....',
  '...kwwooooooooooooooooooooooookOOk....',
  '...kwykwwwwwwwwwooooOOooooookooOk.....',
  '...kyykwwwwwwwwwwoooooooooookoOOk.....',
  '....ky.kwwwwwwwwwwooooooookkooOk......',
  '....k...kkwwwwwwwwwwoookkkoooOk.......',
  '..........kkkwwwwwkkkk..koooOk........',
  '.....kOok....kkkkk........koOk........',
  '....koooOk.................kk.........',
  '.....kOOk.............................',
  '......kk..............................',
];
// SPEAR-PHISH 42x18 — barracuda with a steel spear snout: dorsal fin rays,
// gill slit, lateral scale specks, pale belly, glinting eye.
const SPEARPHISH = [
  '.....................kkkkkk............',
  '....................kbBkbBkk...........',
  '..................kkbbbbbbbbkk.........',
  '..............kkkkbbbbbbbbbbbbk..kkk...',
  '...........kkbbbbbbbbbbbbbbbbbbkkbbBk..',
  '..........kbbbbwkkbbbbbbBbbbbbbkbbbBk..',
  '...........kkbbwkwbbbbbbbbBbbbbbkbbbk..',
  'kkkkkkkkkkkmkbbbbbbbkbbbbbbbbbbkbbbBk..',
  'cmmmmmmmmmmcmkbbbbbbkbbbBbbBbbbkkbbbk..',
  'kkkkkkkkkkkmkwwbbbbbkbbbbbbbbbkbkbBk...',
  '..........kwwwwwwbbbbbbbBbbbbbkbbbk....',
  '...........kkwwwwwwbbbbbbbbbkkkbBk.....',
  '..............kkwwwwbbbbbbbbk..kk......',
  '..................kkkkbBkbBkk..........',
  '......................kkkkkk...........',
  '..w..w..................................',
  'ww..ww..................................',
];
// LURE ANGLER 38x28 — deep-sea horror dangling a glowing FAKE LOGIN WINDOW.
const ANGLER = [
  '....................kk................',
  '...................kqk.................',
  '..................kqk..................',
  '.................kqk...................',
  '......kkkkkkk....kqk...................',
  '.....kIIIIIIIk..kqk....................',
  '.....kIwwwwwIk..kqk....................',
  '.....kIwttwwIkkkqk.....................',
  '.....kIwwwwwIk.........................',
  '.....kIIyyIIIk.........................',
  '......kkkkkkk..kkkkkk..................',
  '.............kkqqqqqqkkk...............',
  '..........kkqqqqqqqqqqqqkk......kkk....',
  '........kqqqqwwkqqqqqqqqqqk....kqqdk...',
  '.......kqqqqqwwkqqqqdqqqqqqk..kqqdk....',
  '......kqwkwkwkqqqqqqqqdqqqqkkqqqdk.....',
  '......kqkwkwkwkqqqqqqqqqqqqkqqqdk......',
  '......kqwkwkwkqqqqdqqqqqqqkqqqqdk......',
  '.......kqqqqqqqqqqqqdqqqqqkkqqdk.......',
  '........kqqqqqqqqqqqqqqqkk..kqdk.......',
  '..........kkqqqqqqqqqkkk.....kk........',
  '.............kkkkkkkk..................',
];
// K0BOLD 56x28 — the shadow agent: an angular AI dragon laced with
// glowing circuit veins, a grin of terminal-cursor teeth, data wisps.
const KOBOLD = [
  '.....k...........................k.....................',
  '......kk.......................kk......................',
  '.......kqk...................kqk.......................',
  '....kkkqqqkkkkkkkkkkkkkkkkkkqqqkkkk....................',
  '...kqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqk....................',
  '..kqqqzzkqqqqqdqqqqqqqdqqqqqkzzqqqqk...................',
  '..kqqqzkkqqqqqqqqqqqqqqqqqqqkkzqqqqk...................',
  '..kqqqqqqqdkkkkkkkkkkkkkkdqqqqqqqqqk...................',
  '...kqqqqqkzzzzzzzzzzzzzzzzzzkqqqqqk....................',
  '...kqqqqkzkzkzkzkzkzkzkzkzkzzkqqqqk....................',
  '....kqqqkzzzzzzzzzzzzzzzzzzzzkqqqk.....................',
  '....kqqqqkkkkkkkkkkkkkkkkkkkkqqqqk.....................',
  '...kqqdqqqqqqqqqqqqqqqqqqqqqqqdqqqk....................',
  '..kqqqqqzqqqzqqqqqzqqqqqzqqqqqqqqqk....................',
  '..kqdqqqzqqqzqqqqqzqqqqqzqqqqqdqqqqk...................',
  '.kqqqqkqzqkqzqqkqqzqkqqqzqkqqqqqqqqk...................',
  '.kqqqk.kqk.kqqk..kqk..kqqk.kqqqqqdqk...................',
  '.kqqk...kzk.kqk...kzk..kqk..kqqqqqqk...................',
  '.kqk.....k...kzk...k....kzk..kdqqqqk...................',
  '.kk...........k..........k....kqqqk....................',
  '..k.z.....................z....kkk.....................',
  '...z.z..................z.z............................',
  '....z....................z.............................',
];

// Glitched mirror-Hiro for the deepfake fights: Hiro's own front frame
// from the baked walk-cycle sheet, washed in night purple, then glitched.
// drawImage/fill only — no pixel reads, so it stays file:// safe.
function shadowHiro() {
  const src = SHEETS.hiro.down[0];
  const cv = document.createElement('canvas');
  cv.width = src.width * 2; cv.height = src.height * 2;
  const c = cv.getContext('2d');
  c.imageSmoothingEnabled = false;
  c.drawImage(src, 0, 0, cv.width, cv.height);
  c.globalCompositeOperation = 'source-atop';
  c.fillStyle = 'rgba(42,27,78,0.62)'; // deep night purple wash
  c.fillRect(0, 0, cv.width, cv.height);
  return cv;
}

export const ENEMY_ART = {
  phishkoi: polish(compile(PHISHKOI)),
  spearphish: polish(compile(SPEARPHISH)),
  angler: polish(compile(ANGLER)),
  lazarus: FRAMES.lazarus, // masked impostor, generated frame
  doppel: glitchify(shadowHiro(), 7),
  vishimp: FRAMES.vishimp, // red imp with its hook, generated frame
  pushbomber: FRAMES.pushbomber, // juggling notification badges, generated frame
  keylogger: FRAMES.keylogger, // cat lurking on a laptop, generated frame
  tokenthief: scaleFrame(SHEETS.mouse.down[0], 2), // hoodie mouse, generated sheet
  simshift: FRAMES.simshift, // shapeshifter brandishing a SIM, generated frame
  stufferzombie: FRAMES.stufferzombie, // shambler with a golden key-crook, generated frame
  rogueagent: scaleFrame(SHEETS.robot.down[0], 2), // ungoverned agent bot, generated sheet
  phisherking: FRAMES.phisherking, // generated boss frame: presenting the lure
  doppelprime: glitchify(shadowHiro(), 13),
  scatteredspider: FRAMES.scatteredspider, // headset spider mid-roar, generated boss frame
  stuffer: FRAMES.stuffer, // crackling password golem, generated boss frame
  kobold: polish(compile(KOBOLD)),
};
