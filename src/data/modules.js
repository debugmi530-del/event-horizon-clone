// Модули — щиты, двигатели, реакторы, спец
export const MODULES = [
  // ── Щиты ──
  {
    id: 'shield_1', name: 'Energy Shield I', type: 'shield',
    shieldHp: 50, rechargeRate: 5, rechargeDelay: 3,
    energyCost: 8, color: 0x4488ff,
    description: 'Базовый энергетический щит.',
    tier: 1, unlockCost: 500
  },
  {
    id: 'shield_2', name: 'Energy Shield II', type: 'shield',
    shieldHp: 100, rechargeRate: 8, rechargeDelay: 2.5,
    energyCost: 15, color: 0x66aaff,
    description: 'Улучшенный щит.',
    tier: 2, unlockCost: 1500
  },
  {
    id: 'shield_3', name: 'Frontal Shield', type: 'shield',
    shieldHp: 200, rechargeRate: 12, rechargeDelay: 4,
    energyCost: 20, color: 0x88ccff, frontal: true,
    description: 'Мощный лобовой щит.',
    tier: 3, unlockCost: 4000
  },

  // ── Двигатели ──
  {
    id: 'engine_1', name: 'Afterburner I', type: 'engine',
    speedBonus: 30, turnBonus: 20, energyCost: 5,
    color: 0xff8800,
    description: 'Форсажная камера. +30 скорость.',
    tier: 1, unlockCost: 400
  },
  {
    id: 'engine_2', name: 'Afterburner II', type: 'engine',
    speedBonus: 60, turnBonus: 40, energyCost: 10,
    color: 0xffaa00,
    description: 'Мощный форсаж. +60 скорость.',
    tier: 2, unlockCost: 1200
  },
  {
    id: 'engine_ghost', name: 'Ghost Drive', type: 'engine',
    speedBonus: 100, turnBonus: 80, energyCost: 25, dash: true,
    color: 0xaa44ff,
    description: 'Сверхдвигатель. Позволяет рывок.',
    tier: 3, unlockCost: 5000
  },

  // ── Реакторы ──
  {
    id: 'reactor_1', name: 'Reactor I', type: 'reactor',
    energyBonus: 30, regenBonus: 5,
    color: 0xffff44,
    description: '+30 к запасу энергии.',
    tier: 1, unlockCost: 300
  },
  {
    id: 'reactor_2', name: 'Reactor II', type: 'reactor',
    energyBonus: 80, regenBonus: 12,
    color: 0xffff66,
    description: 'Мощный реактор.',
    tier: 2, unlockCost: 1000
  },

  // ── Специальные ──
  {
    id: 'repair_1', name: 'Repair System I', type: 'special',
    repairRate: 3, energyCost: 10,
    color: 0x44ff44,
    description: 'Автоматический ремонт корпуса.',
    tier: 2, unlockCost: 1500
  },
  {
    id: 'selfdestruct', name: 'Self-Destruct', type: 'special',
    damage: 500, aoe: 150, energyCost: 0,
    color: 0xff2200,
    description: 'АКТИВНО: самоуничтожение с огромным уроном.',
    tier: 2, unlockCost: 800, active: true
  },
  {
    id: 'cloak_1', name: 'Cloaking Device', type: 'special',
    duration: 5, cooldown: 15, energyCost: 40,
    color: 0x8844ff,
    description: 'АКТИВНО: невидимость на 5 секунд.',
    tier: 3, unlockCost: 6000, active: true
  },
  {
    id: 'drone_launch', name: 'Drone Bay', type: 'special',
    droneId: 'drone1', maxDrones: 2, energyCost: 20,
    color: 0x88aaff,
    description: 'Запускает боевые дроны.',
    tier: 2, unlockCost: 2000, active: true
  }
];

export function getModuleById(id) {
  return MODULES.find(m => m.id === id);
}
