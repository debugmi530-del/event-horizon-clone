// База данных оружия — реплика оригинала
export const WEAPONS = [
  // ── Лазеры ──
  {
    id: 'laser_1', name: 'Laser Cannon I', type: 'Laser',
    damage: 12, damageType: 'energy',
    fireRate: 3, range: 350, energyCost: 5,
    bulletKey: 'bullet_laser', bulletSpeed: 600, bulletScale: 0.5,
    color: 0xff4444,
    description: 'Базовый лазерный пушка. Нет перезарядки.',
    tier: 1, unlockCost: 0
  },
  {
    id: 'laser_2', name: 'Laser Cannon II', type: 'Laser',
    damage: 20, damageType: 'energy',
    fireRate: 4, range: 380, energyCost: 7,
    bulletKey: 'bullet_laser', bulletSpeed: 700, bulletScale: 0.7,
    color: 0xff6666,
    description: 'Улучшенный лазер.',
    tier: 2, unlockCost: 800
  },
  {
    id: 'laser_beam', name: 'Beam Laser', type: 'Beam',
    damage: 8, damageType: 'energy',
    fireRate: 20, range: 280, energyCost: 3,
    bulletKey: 'fx_beam', bulletSpeed: 800, bulletScale: 0.4,
    color: 0xff2200,
    description: 'Непрерывный луч. Высокий DPS.',
    tier: 3, unlockCost: 2500
  },

  // ── Плазма ──
  {
    id: 'plasma_1', name: 'Plasma Gun I', type: 'Plasma',
    damage: 25, damageType: 'kinetic',
    fireRate: 1.5, range: 300, energyCost: 12,
    bulletKey: 'bullet_plasma', bulletSpeed: 400, bulletScale: 0.6,
    color: 0x44ffaa,
    description: 'Медленный, но мощный плазменный заряд.',
    tier: 1, unlockCost: 600
  },
  {
    id: 'plasma_2', name: 'Plasma Cannon', type: 'Plasma',
    damage: 45, damageType: 'kinetic',
    fireRate: 1, range: 320, energyCost: 20,
    bulletKey: 'bullet_plasma', bulletSpeed: 450, bulletScale: 0.9,
    color: 0x66ffcc,
    description: 'Мощная плазменная пушка.',
    tier: 2, unlockCost: 2000
  },

  // ── Ракеты ──
  {
    id: 'missile_1', name: 'Missile Launcher I', type: 'Missile',
    damage: 60, damageType: 'explosive',
    fireRate: 0.5, range: 500, energyCost: 0,
    bulletKey: 'bullet_rocket', bulletSpeed: 300, bulletScale: 0.5,
    color: 0xffaa00, homing: true, homingStrength: 120,
    description: 'Самонаводящаяся ракета. Медленная перезарядка.',
    tier: 2, unlockCost: 1200
  },
  {
    id: 'missile_2', name: 'Heavy Missile', type: 'Missile',
    damage: 120, damageType: 'explosive',
    fireRate: 0.3, range: 550, energyCost: 0,
    bulletKey: 'bullet_rocket', bulletSpeed: 280, bulletScale: 0.8,
    color: 0xff8800, homing: true, homingStrength: 150,
    description: 'Тяжёлая ракета с огромным уроном.',
    tier: 3, unlockCost: 3500
  },

  // ── Специальное ──
  {
    id: 'torpedo_1', name: 'Torpedo', type: 'Torpedo',
    damage: 200, damageType: 'explosive',
    fireRate: 0.15, range: 600, energyCost: 0,
    bulletKey: 'bullet_bomb', bulletSpeed: 200, bulletScale: 1.0,
    color: 0xff4400, aoe: 80,
    description: 'Медленная торпеда с зоной поражения.',
    tier: 4, unlockCost: 6000
  },
  {
    id: 'vortex_1', name: 'Vortex Cannon', type: 'Special',
    damage: 15, damageType: 'energy',
    fireRate: 2, range: 260, energyCost: 25,
    bulletKey: 'bullet_vortex', bulletSpeed: 350, bulletScale: 0.7,
    color: 0xaa44ff, slow: 0.5,
    description: 'Замедляет врагов при попадании.',
    tier: 3, unlockCost: 4000
  },
  {
    id: 'fraggun_1', name: 'Fragment Gun', type: 'Kinetic',
    damage: 8, damageType: 'kinetic',
    fireRate: 5, range: 200, energyCost: 2,
    bulletKey: 'bullet_fragment', bulletSpeed: 500, bulletScale: 0.4,
    color: 0xaaaaaa, spread: 3,
    description: 'Дробовик — множество осколков в конусе.',
    tier: 1, unlockCost: 400
  }
];

export function getWeaponById(id) {
  return WEAPONS.find(w => w.id === id);
}
