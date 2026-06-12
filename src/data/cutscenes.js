// Chapter cutscenes: comic-style recap + ominous preview + title card.
// Each shot: bg gradient, optional silhouette band, animated actors
// (pose PNGs or enemy art), fx layers, and a typewriter caption.
export const CUTSCENES = {
  ch1: {
    shots: [
      {
        bg: ['#1a0f3c', '#6a3df0'], sil: 'city',
        actors: [{ img: 'pose1', from: [120, 70], to: [120, 66], w: 56 }],
        caption: 'THE REALM OF IDENTIA SLEEPS SOUNDLY... GUARDED BY 11,209 PASSWORDS.',
      },
      {
        bg: ['#0c0a14', '#241456'], sil: 'city',
        actors: [{ img: 'enemy:kobold', from: [120, 120], to: [120, 64], w: 100 }],
        fx: ['flash', 'shake'],
        caption: 'IT SHOULD NOT SLEEP SO SOUNDLY.',
      },
      {
        bg: ['#123a6e', '#7ec8ff'], sil: 'waves',
        actors: [{ img: 'pose2', from: [300, 80], to: [150, 72], w: 64 }],
        fx: ['speedlines'],
        title: 'CHAPTER 1', subtitle: 'THE PHISHING SHOALS',
        caption: 'ONE HEDGEHOG STANDS BETWEEN THE PHANTOM LEGION AND EVERY LOGIN IN THE LAND.',
      },
    ],
  },
  ch2: {
    shots: [
      {
        bg: ['#f29b38', '#7ec8ff'], sil: 'waves',
        actors: [{ img: 'enemy:phisherking', from: [120, 70], to: [120, 130], w: 110, spin: true }],
        caption: 'THE PHISHER KING: PAN-FRIED. HIS ROYAL LURES COULD NOT BAIT A PASSKEY.',
      },
      {
        bg: ['#0c0a14', '#2a1b4e'], sil: 'city',
        actors: [{ img: 'enemy:doppelprime', from: [120, 140], to: [120, 70], w: 56 }],
        fx: ['flash'],
        caption: 'BUT AT THE ONBOARDING GATE, A FLAWLESS NEW HIRE JUST ACED EVERY INTERVIEW... WEARING YOUR FACE.',
      },
      {
        bg: ['#2a1b56', '#9fb6d9'], sil: 'city',
        actors: [{ img: 'pose6', from: [-80, 80], to: [110, 74], w: 78 }],
        fx: ['speedlines'],
        title: 'CHAPTER 2', subtitle: 'THE ONBOARDING GATE',
        caption: 'VERIFY FIRST. TRUST SECOND. KICK THIRD.',
      },
    ],
  },
  ch3: {
    shots: [
      {
        bg: ['#2a1b56', '#b78bff'], sil: 'city',
        actors: [{ img: 'pose5', from: [120, 80], to: [120, 72], w: 92 }],
        fx: ['flash'],
        caption: 'ONE FLASH OF THE MIRROR, AND THE PERFECT COPY FAILED ITS LIVENESS CHECK. CASE CLOSED.',
      },
      {
        bg: ['#0c0a14', '#332b40'], sil: 'cave',
        actors: [{ img: 'enemy:scatteredspider', from: [120, -60], to: [120, 60], w: 120 }],
        fx: ['shake'],
        caption: 'MEANWHILE, THE KEEP\'S PHONES RING WITHOUT END. SOMETHING WITH EIGHT LEGS KEEPS ASKING FOR DEREK.',
      },
      {
        bg: ['#3c2178', '#8aa0c8'], sil: 'cave',
        actors: [{ img: 'pose2', from: [300, 80], to: [140, 72], w: 64 }],
        fx: ['speedlines'],
        title: 'CHAPTER 3', subtitle: 'HELP DESK KEEP',
        caption: 'YOUR CALL IS VERY IMPORTANT TO US. PLEASE HOLD... FOREVER.',
      },
    ],
  },
  ch4: {
    shots: [
      {
        bg: ['#3c2178', '#b78bff'], sil: 'cave',
        actors: [{ img: 'pose1', from: [120, 74], to: [120, 70], w: 56 }],
        caption: 'THE WEB IS CUT. THE KEEP VERIFIES FIRST AND RESETS NEVER. ZERO STARS, SPIDER.',
      },
      {
        bg: ['#0c0a14', '#1d1733'], sil: 'tech',
        actors: [{ img: 'enemy:stuffer', from: [120, 170], to: [120, 66], w: 104 }],
        fx: ['shake', 'flash'],
        caption: 'BEYOND THE WALLS, A BILLION LEAKED PASSWORDS ARE SHAMBLING INTO ONE COLOSSUS...',
      },
      {
        bg: ['#1a1438', '#3c2a6e'], sil: 'tech',
        actors: [{ img: 'pose6', from: [-80, 80], to: [105, 74], w: 78 }],
        fx: ['speedlines'],
        title: 'CHAPTER 4', subtitle: 'THE ENDPOINT FRONTIER',
        caption: 'EVERY FORGOTTEN SCREEN IS A DOOR. LOCK THEM ALL.',
      },
    ],
  },
  ch5: {
    shots: [
      {
        bg: ['#1a1438', '#6a3df0'], sil: 'tech',
        actors: [{ img: 'pose3', from: [120, 80], to: [120, 72], w: 70 }],
        caption: 'THE STUFFER CRUMBLED: A BILLION KEYS, AND NOT ONE WORKING DOOR.',
      },
      {
        bg: ['#0c0a14', '#16102c'], sil: 'vault',
        actors: [{ img: 'enemy:kobold', from: [120, 90], to: [120, 62], w: 130 }],
        fx: ['shake', 'flash'],
        caption: 'BUT BENEATH THE CAPITAL, SOMETHING TIRELESS HARVESTS 4,000 SECRETS PER SECOND. IT DOES NOT SLEEP. IT WAS NEVER APPROVED.',
      },
      {
        bg: ['#2a1b56', '#8a5cff'], sil: 'vault',
        actors: [{ img: 'pose2', from: [300, 78], to: [145, 70], w: 66 }],
        fx: ['speedlines'],
        title: 'CHAPTER 5', subtitle: 'THE VAULT OF SHARED SECRETS',
        caption: 'ELIMINATE THE TARGET.',
      },
    ],
  },
};
