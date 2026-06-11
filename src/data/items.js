// Consumables. The shop is a thinly veiled value-props aisle.
export const ITEMS = [
  {
    id: 'potions', name: 'HELP DESK COFFEE', price: 12,
    desc: 'RESTORES 25 HP. BREWED AT THE KEEP.',
    use(game) {
      if (game.s.hp >= game.s.maxHp) return null;
      game.s.hp = Math.min(game.s.maxHp, game.s.hp + 25);
      return 'HIRO DRINKS THE COFFEE. +25 HP!';
    },
  },
  {
    id: 'ethers', name: "FORRESTER'S TONIC", price: 16,
    desc: 'RESTORES 8 TP. INDEPENDENTLY VERIFIED.',
    use(game) {
      if (game.s.tp >= game.s.maxTp) return null;
      game.s.tp = Math.min(game.s.maxTp, game.s.tp + 8);
      return "FORRESTER'S TONIC! +8 TP. 324% ROI!";
    },
  },
  {
    id: 'elixirs', name: '324% ROI ELIXIR', price: 45,
    desc: 'FULL HP + TP. PAYS FOR ITSELF IN 6 MONTHS.',
    use(game) {
      if (game.s.hp >= game.s.maxHp && game.s.tp >= game.s.maxTp) return null;
      game.s.hp = game.s.maxHp; game.s.tp = game.s.maxTp;
      return 'THE ROI ELIXIR! FULLY RESTORED!';
    },
  },
];

export function itemById(id) { return ITEMS.find((i) => i.id === id); }
