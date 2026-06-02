const SAVE_KEY = 'eh_save';

export const SaveSystem = {
  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return this._default();
  },

  save(data) {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch (e) {}
  },

  reset() {
    localStorage.setItem(SAVE_KEY, JSON.stringify(this._default()));
  },

  _default() {
    return {
      credits: 500,
      stars: 0,
      fuel: 100,
      maxFuel: 100,
      playerLevel: 1,
      experience: 0,
      fleet: [{ shipId: 'f0s1', weapons: ['laser_1'], modules: [], hp: 80 }],
      inventory: [],
      unlockedTech: [],
      starMap: { currentSystem: 0, visited: [0] },
      statistics: { battlesWon: 0, battlesLost: 0, enemiesDefeated: 0 }
    };
  }
};
