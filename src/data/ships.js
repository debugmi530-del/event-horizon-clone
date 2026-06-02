// База данных кораблей — структура как в оригинале
export const SHIPS = [
  {
    id: 'f0s1', name: 'Starfighter I', faction: 0, tier: 1,
    baseHp: 80, baseShield: 0, baseSpeed: 220, baseTurnRate: 180,
    baseEnergy: 50, energyRegen: 5,
    slots: { weapon: 1, shield: 0, engine: 1, special: 0 },
    color: 0x4488ff,
    description: 'Базовый истребитель. Быстрый, но хрупкий.',
    unlockCost: 0, stars: 1
  },
  {
    id: 'f1s1', name: 'Corvette Mk1', faction: 1, tier: 1,
    baseHp: 120, baseShield: 20, baseSpeed: 180, baseTurnRate: 160,
    baseEnergy: 80, energyRegen: 8,
    slots: { weapon: 2, shield: 1, engine: 1, special: 0 },
    color: 0x44ff88,
    description: 'Лёгкий корвет с начальным щитом.',
    unlockCost: 500, stars: 1
  },
  {
    id: 'f1s2', name: 'Corvette Mk2', faction: 1, tier: 2,
    baseHp: 160, baseShield: 40, baseSpeed: 170, baseTurnRate: 150,
    baseEnergy: 100, energyRegen: 10,
    slots: { weapon: 2, shield: 1, engine: 1, special: 1 },
    color: 0x44ff88,
    description: 'Улучшенный корвет.',
    unlockCost: 1200, stars: 2
  },
  {
    id: 'f1s3', name: 'Destroyer', faction: 1, tier: 3,
    baseHp: 250, baseShield: 80, baseSpeed: 140, baseTurnRate: 120,
    baseEnergy: 150, energyRegen: 15,
    slots: { weapon: 3, shield: 2, engine: 1, special: 1 },
    color: 0xff8844,
    description: 'Тяжёлый разрушитель.',
    unlockCost: 3000, stars: 3
  },
  {
    id: 'f1s4', name: 'Cruiser', faction: 1, tier: 4,
    baseHp: 400, baseShield: 150, baseSpeed: 110, baseTurnRate: 90,
    baseEnergy: 220, energyRegen: 22,
    slots: { weapon: 4, shield: 2, engine: 2, special: 2 },
    color: 0xff4444,
    description: 'Тяжёлый крейсер с мощным вооружением.',
    unlockCost: 7000, stars: 4
  },
  {
    id: 'f13s1', name: 'Phantom', faction: 13, tier: 1,
    baseHp: 60, baseShield: 0, baseSpeed: 280, baseTurnRate: 220,
    baseEnergy: 60, energyRegen: 12,
    slots: { weapon: 1, shield: 0, engine: 2, special: 1 },
    color: 0xaa44ff,
    description: 'Ультрабыстрый разведчик.',
    unlockCost: 800, stars: 2
  },
  {
    id: 'f13s2', name: 'Ghost', faction: 13, tier: 2,
    baseHp: 100, baseShield: 30, baseSpeed: 240, baseTurnRate: 200,
    baseEnergy: 90, energyRegen: 15,
    slots: { weapon: 2, shield: 1, engine: 2, special: 1 },
    color: 0xcc66ff,
    description: 'Быстрый с хорошим манёвром.',
    unlockCost: 2000, stars: 3
  },
  {
    id: 'f12s1', name: 'Dreadnought', faction: 12, tier: 5,
    baseHp: 800, baseShield: 300, baseSpeed: 80, baseTurnRate: 60,
    baseEnergy: 400, energyRegen: 40,
    slots: { weapon: 6, shield: 3, engine: 2, special: 3 },
    color: 0xff2222,
    description: 'Боевой линкор. Почти непробиваем.',
    unlockCost: 20000, stars: 5
  },
  // ── Дроны ──
  {
    id: 'drone1', name: 'Scout Drone', faction: 0, tier: 1,
    baseHp: 30, baseShield: 0, baseSpeed: 300, baseTurnRate: 360,
    baseEnergy: 30, energyRegen: 5,
    slots: { weapon: 1, shield: 0, engine: 0, special: 0 },
    color: 0x88aaff,
    description: 'Маленький разведывательный дрон.',
    unlockCost: 300, stars: 1, isDrone: true
  },
  {
    id: 'drone2', name: 'Attack Drone', faction: 0, tier: 2,
    baseHp: 50, baseShield: 10, baseSpeed: 260, baseTurnRate: 300,
    baseEnergy: 50, energyRegen: 8,
    slots: { weapon: 2, shield: 0, engine: 0, special: 0 },
    color: 0xff8888,
    description: 'Атакующий дрон с двумя орудиями.',
    unlockCost: 1000, stars: 2, isDrone: true
  }
];

export function getShipById(id) {
  return SHIPS.find(s => s.id === id);
}

export function getShipsByTier(tier) {
  return SHIPS.filter(s => s.tier === tier);
}
