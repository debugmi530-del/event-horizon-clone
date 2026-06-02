// База данных врагов
export const ENEMIES = [
  {
    id: 'pirate_1', name: 'Pirate Scout', tier: 1,
    hp: 60, shield: 0, speed: 200, turnRate: 160,
    weapons: ['laser_1'],
    ai: 'aggressive', xp: 10, credits: 20,
    color: 0xff4444, scale: 0.7,
    spawnWeight: 30
  },
  {
    id: 'pirate_2', name: 'Pirate Fighter', tier: 1,
    hp: 100, shield: 20, speed: 180, turnRate: 140,
    weapons: ['laser_1', 'fraggun_1'],
    ai: 'aggressive', xp: 20, credits: 45,
    color: 0xff6644, scale: 0.85,
    spawnWeight: 25
  },
  {
    id: 'alien_1', name: 'Alien Drone', tier: 2,
    hp: 80, shield: 30, speed: 240, turnRate: 200,
    weapons: ['plasma_1'],
    ai: 'swarm', xp: 30, credits: 60,
    color: 0x44ffaa, scale: 0.7,
    spawnWeight: 20
  },
  {
    id: 'alien_2', name: 'Alien Hunter', tier: 2,
    hp: 150, shield: 60, speed: 200, turnRate: 160,
    weapons: ['plasma_1', 'missile_1'],
    ai: 'tactical', xp: 55, credits: 110,
    color: 0x66ffcc, scale: 1.0,
    spawnWeight: 15
  },
  {
    id: 'guard_1', name: 'Security Corvette', tier: 2,
    hp: 200, shield: 80, speed: 160, turnRate: 130,
    weapons: ['laser_2', 'missile_1'],
    ai: 'defensive', xp: 70, credits: 150,
    color: 0x4488ff, scale: 1.0,
    spawnWeight: 10
  },
  {
    id: 'boss_1', name: 'Warlord Cruiser', tier: 3,
    hp: 800, shield: 300, speed: 100, turnRate: 80,
    weapons: ['laser_2', 'plasma_2', 'missile_2'],
    ai: 'boss', xp: 400, credits: 800,
    color: 0xff2200, scale: 1.8,
    spawnWeight: 0, isBoss: true
  },
  {
    id: 'boss_2', name: 'Alien Mothership', tier: 4,
    hp: 2000, shield: 800, speed: 60, turnRate: 40,
    weapons: ['plasma_2', 'torpedo_1', 'vortex_1'],
    ai: 'boss', xp: 1500, credits: 3000,
    color: 0x44ff44, scale: 2.5,
    spawnWeight: 0, isBoss: true,
    drones: ['alien_1', 'alien_1', 'alien_1']
  }
];

export function getEnemyById(id) {
  return ENEMIES.find(e => e.id === id);
}

export function getEnemiesByTier(tier) {
  return ENEMIES.filter(e => e.tier === tier && !e.isBoss);
}
