// All character art as ASCII pixel grids, compiled to canvases at module load.
import { compile, outline, scale2x, shade } from './palette.js';
import { SHEETS, scaleSheetFrame } from './sheets.js';

// ------------------------------------------------- HIRO (baked sheet)
// Overworld Hiro comes from the baked walk-cycle sheet (assets/sprites/
// hiro.png): 4 directions x 4 frames, chibi proportions.
export const HIRO = SHEETS.hiro;

// Battle back-sprite: the sheet's up-facing idle frame, upscaled.
export const BATTLE_HIRO = scaleSheetFrame(SHEETS.hiro.up[0], 1.3);

// hd: hi-res finishing for ASCII art — rounded contours + top-lit shading
const hd = (cv) => shade(scale2x(cv));

const GUARD = [
  '................................',
  '................................',
  '................................',
  '................................',
  '.............rrrr..........N....',
  '............rrrrrr.........NN...',
  '..........mmmmmmmmmm.......NN...',
  '........mmmmmmmmmmmmmm.....NN...',
  '.......mmmmmmmmmmmmmmmm....NN...',
  '.......mMMmmmmmmmmmmMMm....NN...',
  '.......mmssssssssssssmm....NN...',
  '.......mssssssssssssssm....NN...',
  '.......msskkksssskkkssm....NN...',
  '.......msskwksssskwkssm....NN...',
  '.......msskkksssskkkssm....NN...',
  '........ssssssssssssss.....NN...',
  '........ssssskkkssssss.....NN...',
  '.........ssssssssssss......NN...',
  '.......MMMMMMMMMMMMMMM.....NN...',
  '......MMmmmmmmmmmmmmmMM....NN...',
  '.....MMmmmmmmmmmmmmmmmMM...NN...',
  '....sMMmmmmmmpppmmmmmmMMs..NN...',
  '....sMMmmmmmmpppmmmmmmMMs..NN...',
  '....ssMmmmmmpppmmmmmMMsssssNN...',
  '.....sMMmmmmmmmmmmmmmMMs...NN...',
  '......MmmmmmmmmmmmmmmmM....NN...',
  '......MMMMMMMMMMMMMMMMM....NN...',
  '......MMMMMMMMMMMMMMMMM....NN...',
  '......MMMMMM.....MMMMMM....NN...',
  '......MMMMMM.....MMMMMM....NN...',
  '......MMMMM.......MMMMM....NN...',
  '......MMMMM.......MMMMM....NN...',
  '.....kkkkkk.......kkkkkk...NN...',
  '.....kkkkk.........kkkkk...N....',
  '....kkkkkk.........kkkkkk.......',
  '................................',
  '................................',
  '................................',
  '................................',
  '................................',
];
export const NPCS = {
  villager: SHEETS['hoodie-boy'].down[0],
  villagerRed: SHEETS['villager-red'].down[0],
  villagerGreen: SHEETS['villager-green'].down[0],
  villagerOrange: SHEETS['hoodie-boy'].down[0],
  villagerTeal: SHEETS['villager-teal'].down[0],
  villagerPink: SHEETS['villager-pink'].down[0],
  elder: SHEETS.doctor.down[0],
  kid: SHEETS.kid.down[0],
  clerk: SHEETS['clerk-m'].down[0],
  clerkF: SHEETS.doctor.down[0],
  clerkF2: SHEETS['suit-woman'].down[0],
  sage: SHEETS.sage.down[0],
  guard: shade(outline(compile(GUARD))),
};

// Detailed battle sprites live in enemies.js
export { ENEMY_ART } from './enemies.js';


// --------------------------------------------------- AMBIENT CRITTERS
const HD_CRITTER = (rows, swap) => hd(compile(rows, swap));
export const CRITTERS = {
  bunny: HD_CRITTER([
    '.k..k.....',
    'knkknk....',
    'knnnnk....',
    'knknknk...',
    '.knnnnnkk.',
    '.knnnnnnwk',
    '..knn.nnk.',
    '...k...k..',
  ]),
  bird: HD_CRITTER([
    '..kk....',
    '.kttbk..',
    'kytkttk.',
    '.kttttbk',
    '..kbttk.',
    '...ktk..',
    '...k.k..',
  ]),
  crab: HD_CRITTER([
    'k.k....k.k',
    '.kk.kk.kk.',
    '.koooooik.',
    'kowoooowok',
    '.koooooik.',
    '.k.k..k.k.',
  ]),
};

