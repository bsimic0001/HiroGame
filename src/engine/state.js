// Global game state + localStorage persistence.
const KEY = 'hiro.save.v1';

export function freshState() {
  return {
    // player
    level: 1, xp: 0, hp: 36, tp: 12,
    maxHp: 36, maxTp: 12,
    potions: 2, ethers: 1, elixirs: 0,
    gold: 30,
    // gear flags unlock chapter by chapter
    gear: { blade: false, mirror: false, sigil: false, visor: false, armor: false, crown: false },
    // story
    chapter: 1,
    flags: {},          // arbitrary story flags
    codex: {},          // enemy id -> true once defeated
    map: 'loginshire',
    x: 12, y: 14, facing: 'down',
    steps: 0,
  };
}

export const Game = {
  s: freshState(),

  newGame() { this.s = freshState(); this.save(); },

  save() {
    try { localStorage.setItem(KEY, JSON.stringify(this.s)); } catch { /* private mode */ }
  },

  load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      this.s = Object.assign(freshState(), data);
      this.s.gear = Object.assign(freshState().gear, data.gear || {});
      return true;
    } catch { return false; }
  },

  hasSave() {
    try { return !!localStorage.getItem(KEY); } catch { return false; }
  },

  clearSave() {
    try { localStorage.removeItem(KEY); } catch { /* ignore */ }
  },

  // --- derived stats -----------------------------------------------------
  atk() { return 5 + this.s.level * 2 + (this.s.gear.blade ? 3 : 0); },
  def() { return 3 + this.s.level + (this.s.gear.armor ? 4 : 0); },
  xpToNext() { return 18 + (this.s.level - 1) * 14; },

  gainXp(amount) {
    const s = this.s;
    s.xp += amount;
    let levels = 0;
    while (s.xp >= this.xpToNext()) {
      s.xp -= this.xpToNext();
      s.level++;
      levels++;
      s.maxHp = 36 + (s.level - 1) * 7;
      s.maxTp = 12 + (s.level - 1) * 2;
      s.hp = s.maxHp; s.tp = s.maxTp; // level up = full restore, kindness first
    }
    return levels;
  },
};
