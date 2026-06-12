// High-detail battle sprites for the Phantom Legion.
// Every adversary's design tells you what identity attack it is.
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
// LAZARUS MASK 28x30 — too-perfect candidate: suit, cracked theater mask,
// briefcase stuffed with identical resumes.
const LAZARUS = [
  '.........kkkkkkkk...........',
  '........kkkkkkkkkk..........',
  '........kwwwwwwwwk..........',
  '........kwwkwwkwwk..........',
  '........kwwwwwwwwk.........',
  '........kwwwkkwwwk..........',
  '........kwwwwwwkwk..........',
  '.........kwwwwkwk...........',
  '..........kkkkkk............',
  '........kjjjjjjjjk..........',
  '......kjjjwwwwwwjjjk........',
  '.....kjjjjwwrrwwjjjjk.......',
  '.....kjJjjwwwwwwjjJjk.......',
  '.....ksjjjjjjjjjjjjsk.......',
  '.....ksjjjjjjjjjjjjsk.......',
  '......kjjjjjjjjjjjjk........',
  '......kjjjjjjjjjjjk.........',
  '......kjjjkkkkjjjjk..kkkkk..',
  '......kjjjjjjjjjjjk.kYwwwYk.',
  '......kjjjj..jjjjk..kYwwwYk.',
  '......kjjjk..kjjjk..kYYYYYk.',
  '......kkkk....kkkk..kkkkkkk.',
];
// VISHING IMP 32x26 — grinning imp tangled in its own phone cord,
// old handset pressed to its ear.
const VISHIMP = [
  '....kk............kk............',
  '...krrk..........krrk...........',
  '...krrrk........krrrk...........',
  '....krrrkkkkkkkkrrrk............',
  '....krrrrrrrrrrrrrk.............',
  '...krrrwwkrrrrwwkrrk....kkkk....',
  '...krrrwkkrrrrwkkrrk...kmmcmk...',
  '...krrrrrrrrrrrrrrrk...kmcmk....',
  '...krrkwwwwwwwwkrrrkkkkmmck.....',
  '....krrrwkkkkwrrrrk..NNkmk......',
  '.....krrrrrrrrrrrk..N..kk.......',
  '....krrrrrrrrrrrrk..N...........',
  '...krrrrkrrrrkrrrrk.N...........',
  '...ksrrrkrrrrkrrsk..N...........',
  '....kkrrrrrrrrrkk..N............',
  '.....krrrrrrrrrk..N.............',
  '.....krrkrrrkrrkNN..............',
  '....krrk.krrk.krrk..............',
  '....krk...krk..krk..............',
  '....kk....kk....kk..............',
];
// PUSH BOMBER 32x26 — imp juggling notification bombs, each one a red
// badge with a white exclamation. TAP TAP TAP.
const PUSHBOMBER = [
  '..kkk..........kkk......kkk.....',
  '.krrrk........krrrk....krrrk....',
  '.krwrk........krwrk....krwrk....',
  '.krrrk........krrrk....krrrk....',
  '..kkk..........kkk......kkk.....',
  '......kkkkkkkkkk................',
  '.....kvvvvvvvvvvk...............',
  '....kvvwwkvvwwkvvk..............',
  '....kvvwkkvvwkkvvk..............',
  '....kvvvvvvvvvvvvk..............',
  '....kvkwwwwwwkvvvk..............',
  '.....kvvkkkkvvvvk...............',
  '....kvvvvvvvvvvvvk..............',
  '...kvvvvkvvvvkvvvvk.............',
  '...ksvvvkvvvvkvvsk..............',
  '....kkvvvvvvvvvkk...............',
  '.....kvvvvvvvvvk................',
  '.....kvvkvvvkvvk................',
  '....kvvk.kvvk.kvvk..............',
  '....kvk...kvk..kvk..............',
  '....kk....kk....kk..............',
];
// KEYLOGGER SPIDER 36x26 — spider whose abdomen is a keyboard keycap,
// legs poised over a row of keys.
const KEYLOGGER = [
  '...k.....k........k.....k...........',
  '....k...kqk......kqk...k............',
  '.....k.kqqqk....kqqqk.k.............',
  '......kqqqqqkkkkqqqqqk..............',
  '.....kqqqqqqqqqqqqqqqk..............',
  '....kqqrrkqqqqqqkrrqqqk.............',
  '....kqqrkkqqqqqqkkrqqqk.............',
  '....kqqqqqqkkkkqqqqqqqk.............',
  '.....kqqqqkwwwwkqqqqqk..............',
  '...kkkqqqqqkkkkqqqqqkkk.............',
  '..k...kkkkkkkkkkkkkk...k............',
  '.k...kmcccccccccccccmk..k...........',
  '.....kmcwkkkkkkkkwccmk..............',
  '.....kmcwk.K.K.kkwccmk..............',
  '.....kmcwkkkkkkkkwccmk..............',
  '.....kmcccccccccccccmk..............',
  '.....kmmmmmmmmmmmmmmmk..............',
  '..kkkkkkkkkkkkkkkkkkkkkkk...........',
  '..kcckkcckkcckkcckkcckkck...........',
  '..kkkkkkkkkkkkkkkkkkkkkkk...........',
];
// SIM SHIFTER 34x24 — gooey shapeshifter mid-morph, two half-faces,
// triumphantly holding up a stolen SIM.
const SIMSHIFT = [
  '..........kkkkkkkk..............',
  '.......kkkffffffffkk............',
  '.....kkfffffffffffffkk..........',
  '....kfffffffffkffffffk....kkk...',
  '...kffwwkfffffkffwkffk...kyygk..',
  '...kffwkkfffffkfwkkffk...kygyk..',
  '...kffffffffffkffffffk...kyyyk..',
  '...kfffkkkffffkfkkfffk...kkkk...',
  '....kffffffffffffffffkkkkfk.....',
  '...kffffkkkkkffffffffffffk......',
  '..kfffffffffffkffffffffk........',
  '..kffffffffffffkffffffk.........',
  '..kffkfffffkffffffkfffk.........',
  '.kfff.kffffk.kffffk.fffk........',
  '.kff...kfffk..kffk...ffk........',
  '..kf....kfk....kk.....fk........',
  '...k.....k.............k........',
];
// CRED STUFFER ZOMBIE 30x30 — shambling reuse incarnate: huge keyring,
// keys dropping, tattered lanyard badge.
const STUFFERZOMBIE = [
  '.....gggggg...................',
  '....gggggggg..................',
  '...gggssssgg..................',
  '...sgsssssssg.................',
  '...sskksskkss.................',
  '...ssskssksss.................',
  '....ssssssss..................',
  '....sskkkkss..................',
  '...ccccccccc..................',
  '..ccccccccccc.....kk..........',
  '.scccwwcccccss...kyyk.........',
  '.sccwwwwccccss..kyykyk........',
  '..ccwrwwccccc...kyk.kyk.......',
  '..ccwwwwccccc..kyyk..k........',
  '..cccccccccccykyk.............',
  '..ccccccccccyyky..y...........',
  '...ccccccccc..ky..y...........',
  '...NNNNNNNNN...k..............',
  '...NNNkkNNNN..................',
  '...NNN..NNNN..................',
  '...sss...sss..................',
  '...kkk...kkk..................',
  '..kkkk...kkkk.................',
];
// SCATTERED SPIDER 56x30 — colossal call-center spider, front view filling
// the whole frame: bulbous abdomen marked with a coiled phone cord, eight
// thick jointed legs, eight burning eyes, white fangs, grey headset + mic.
const SCATTEREDSPIDER = [
  '..........c...........qqqqqqqqqqqq...........c..........',
  '...........c.......qqqqqqqqqqqqqqqqqq.......c...........',
  '............c....qqddddqqqqqqqqqqqqqqqq....c............',
  '.............c..qqdddqqqqccccccqqqqqqqqq..c.............',
  '.....kk........qqqqqqqqqcqqqqqqcqqqqqqqqq........kk.....',
  '...kk.kk.......qqqqqqqqqcqqccqqcqqqqqqqqq.......kk.kk...',
  '...kk..kk......qqqqqqqqqcqqqqqqcqqqqqqqqq......kk..kk...',
  '..kk....kk......qqqqqqqqqccccccqqqqqqqqq......kk....kk..',
  '..kk.....kk......qqqqqqqqqqqqqqqqqqqqqq......kk.....kk..',
  '..k......kk.kk....qqqqqqqqqqqqqqqqqqqq....kk.kk......k..',
  '..k....kk.kk..kk....qqqqqqqqqqqqqqqq....kk..kk.kk....k..',
  '..k....kk...kk..kk...mmmmmmmmmmmmmm...kk..kk...kk....k..',
  '.k....kk......kk..kMMqqqqqrqqrqqqqqMMk..kk......kk....k.',
  '.k....kk........kk.cMqkkkkqqqqkkkkqMc.kk........kk....k.',
  '......k...........kMMqqwrrqqqqrrwqqMMk...........k......',
  '......k....kk.kk....crqrrRqqqqRrrqrq....kk.kk....k......',
  '.....k.....kk...kk..cqqqqqqqqqqqqqqq..kk...kk.....k.....',
  '.....k....kk......kkqcqqqqqqqqqqqqqqkk......kk....k.....',
  '.....k....kk...kk...qcqqqqqqqqqqqqqq...kk...kk....k.....',
  '.....k....k..kk.kk..qqMMqqkkkkqqqqqq..kk.kk..k....k.....',
  '.....k....k..kk...kkqdqqqqqqqqqqqqdqkk...kk..k....k.....',
  '.........k...kk......qqqwwqqqqwwqqq......kk...k.........',
  '.........k...k........qqwqqqqqqwqq........k...k.........',
  '.........k...k..........qqqqqqqq..........k...k.........',
  '........k....k............qqqq............k....k........',
  '........k....k............................k....k........',
  '............kk............................kk............',
  '............k..............................k............',
  '............k..............................k............',
  '............k..............................k............',
];
// THE STUFFER 50x30 — a colossus mortared out of password bricks. Masked
// strings glow in its masonry; stolen keys leak from the cracks; two
// furnace-yellow eyes burn in a vaulted skull.
const STUFFER = [
  '..............kkkkkkkkkkkkkk......................',
  '............kkmccccccccccmkk......................',
  '...........kmccckkkkkkcccccmk.....................',
  '...........kmckeeeeeeeekccmk......................',
  '...........kmkeeyykkeyykekmk......................',
  '...........kmkeeyykkeyykekmk......................',
  '...........kmckeeeeeeeekccmk......................',
  '...........kmcckekekekekccmk......................',
  '......kkkkkkkmmccccccccmmkkkkkkkk.................',
  '....kkmccccmkkmmmmmmmmmmkkmccccmkk................',
  '...kmcwwwwcmkmccckkkkcccmkmcwwwwcmk...............',
  '...kmckkkkcmkmcwwwwwwwwcmkmckkkkcmk....y..........',
  '..kmccccccccmkmckkkkkkcmkmccccccccmk..ky..........',
  '..kmckwwwwkcmkmcwwwwwwcmkmckwwwwkcmk.kyk..........',
  '..kmccccccccmkmckkkkkkcmkmccccccccmk..ky..........',
  '..kmmkkkkkmmkkmccccccccmkkmmkkkkkmmk...y..........',
  '..kmcwwwwcmk.kmmkRRkkmmmk.kmcwwwwcmk..............',
  '..kmckkkkcmk.kmcckRkkccmk.kmckkkkcmk..............',
  '..kmccccccmk.kmcwwwwwwcmk.kmccccccmk..............',
  '..kkmmmmmmkk.kmckkkkkkcmk.kkmmmmmmkk..............',
  '...kmcccccmk.kmccccccccmk.kmcccccmk...............',
  '...kmcwwwcmk.kmmkkkkkkmmk.kmcwwwcmk...............',
  '...kmckkkcmkkkmccccccccmkkkmckkkcmk...............',
  '...kmcccccmkkmcckwwwwkccmkkmcccccmk...............',
  '...kkkkkkkkkkmcccccccccccmkkkkkkkkk...............',
  '............kmmkkkkkkkkmmk........................',
  '..........kkmccccmkkmccccmkk......................',
  '..........kmcccccmkkmcccccmk......................',
  '..........kkkkkkkkkkkkkkkkkk......................',
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
  lazarus: polish(compile(LAZARUS)),
  doppel: glitchify(shadowHiro(), 7),
  vishimp: polish(compile(VISHIMP)),
  pushbomber: polish(compile(PUSHBOMBER)),
  keylogger: polish(compile(KEYLOGGER)),
  tokenthief: scaleFrame(SHEETS.mouse.down[0], 2), // hoodie mouse, generated sheet
  simshift: polish(compile(SIMSHIFT)),
  stufferzombie: polish(compile(STUFFERZOMBIE)),
  rogueagent: scaleFrame(SHEETS.robot.down[0], 2), // ungoverned agent bot, generated sheet
  phisherking: FRAMES.phisherking, // generated boss frame: presenting the lure
  doppelprime: glitchify(shadowHiro(), 13),
  scatteredspider: polish(compile(SCATTEREDSPIDER)),
  stuffer: polish(compile(STUFFER, { c: 'm', m: 'M' })), // weathered stone
  kobold: polish(compile(KOBOLD)),
};
