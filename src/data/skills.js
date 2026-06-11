// Hiro's skills — each one is a HYPR capability in costume.
// Availability is driven by gear flags earned per chapter.
export const SKILLS = [
  {
    id: 'passkey', name: 'PASSKEY STRIKE', tp: 3, gear: 'blade',
    desc: 'FIDO2 BLADE. NEVER MISSES. CANNOT BE PHISHED.',
  },
  {
    id: 'mirror', name: 'AFFIRM MIRROR', tp: 2, gear: 'mirror',
    desc: 'LIVENESS CHECK. REVEALS DEEPFAKES + IMPOSTORS.',
  },
  {
    id: 'qr', name: 'QR SCAN', tp: 2, gear: 'sigil',
    desc: 'USER-INITIATED AUTH. COUNTERS PUSH BOMBS, STUNS.',
  },
  {
    id: 'scan', name: 'ADAPT SCAN', tp: 1, gear: 'visor',
    desc: 'RISK ENGINE. READS THE THREAT, ARMS A STEP-UP.',
  },
];

export function knownSkills(game) {
  return SKILLS.filter((s) => game.s.gear[s.gear]);
}
