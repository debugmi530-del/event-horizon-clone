// Структура звёздной карты — как в оригинале
export const STAR_SYSTEMS = [
  {
    id: 0, name: 'Sol System', x: 240, y: 720,
    type: 'home', danger: 0, fuel: 0,
    planet: 'planet1', planetScale: 1.2,
    description: 'Ваша база. Здесь безопасно.',
    connections: [1, 2],
    rewards: { credits: 0, xp: 0 },
    shop: true, repair: true
  },
  {
    id: 1, name: 'Alpha Centauri', x: 140, y: 600,
    type: 'normal', danger: 1, fuel: 10,
    planet: 'planet2', planetScale: 1.0,
    description: 'Лёгкие пираты. Хорошее место для старта.',
    connections: [0, 3, 4],
    enemyTier: 1, enemyCount: [2, 4],
    rewards: { credits: [80, 150], xp: [30, 60] }
  },
  {
    id: 2, name: 'Barnard\'s Star', x: 340, y: 600,
    type: 'normal', danger: 1, fuel: 10,
    planet: 'planet3', planetScale: 0.9,
    description: 'Патрули пиратов.',
    connections: [0, 4, 5],
    enemyTier: 1, enemyCount: [2, 3],
    rewards: { credits: [60, 120], xp: [20, 50] }
  },
  {
    id: 3, name: 'Wolf 359', x: 80, y: 480,
    type: 'normal', danger: 2, fuel: 15,
    planet: 'planet4', planetScale: 1.1,
    description: 'Средняя угроза. Смешанные враги.',
    connections: [1, 6],
    enemyTier: 2, enemyCount: [3, 5],
    rewards: { credits: [150, 300], xp: [60, 120] }
  },
  {
    id: 4, name: 'Lalande', x: 240, y: 480,
    type: 'shop', danger: 0, fuel: 20,
    planet: 'planet5', planetScale: 0.8,
    description: 'Торговая станция. Магазин и ремонт.',
    connections: [1, 2, 3, 5, 7],
    rewards: { credits: 0, xp: 0 },
    shop: true, repair: true
  },
  {
    id: 5, name: 'Sirius', x: 380, y: 480,
    type: 'normal', danger: 2, fuel: 15,
    planet: 'planet6', planetScale: 1.3,
    description: 'Тяжёлые пираты.',
    connections: [2, 4, 8],
    enemyTier: 2, enemyCount: [3, 4],
    rewards: { credits: [200, 350], xp: [80, 140] }
  },
  {
    id: 6, name: 'Vega', x: 80, y: 340,
    type: 'ruins', danger: 3, fuel: 20,
    planet: 'planet1', planetScale: 0.7,
    description: 'Руины древней цивилизации. Охраняются.',
    connections: [3, 9],
    enemyTier: 2, enemyCount: [4, 6],
    rewards: { credits: [250, 500], xp: [100, 200] },
    artifact: true
  },
  {
    id: 7, name: 'Procyon', x: 240, y: 340,
    type: 'normal', danger: 3, fuel: 25,
    planet: 'planet2', planetScale: 1.0,
    description: 'Территория пришельцев.',
    connections: [4, 9, 10],
    enemyTier: 2, enemyCount: [3, 5],
    rewards: { credits: [300, 550], xp: [120, 220] }
  },
  {
    id: 8, name: 'Altair', x: 400, y: 340,
    type: 'normal', danger: 3, fuel: 20,
    planet: 'planet3', planetScale: 0.9,
    description: 'Передовой пост пиратов.',
    connections: [5, 10],
    enemyTier: 2, enemyCount: [4, 5],
    rewards: { credits: [280, 480], xp: [110, 200] }
  },
  {
    id: 9, name: 'Arcturus', x: 140, y: 200,
    type: 'normal', danger: 4, fuel: 30,
    planet: 'planet4', planetScale: 1.4,
    description: 'Опасный сектор. Сильные пришельцы.',
    connections: [6, 7, 11],
    enemyTier: 3, enemyCount: [4, 6],
    rewards: { credits: [400, 700], xp: [200, 350] }
  },
  {
    id: 10, name: 'Capella', x: 340, y: 200,
    type: 'boss', danger: 4, fuel: 30,
    planet: 'planet5', planetScale: 0.8,
    description: 'Штаб пиратов. Логово Военного Лорда.',
    connections: [7, 8, 11],
    enemyTier: 3, enemyCount: [2, 3],
    boss: 'boss_1',
    rewards: { credits: [600, 1000], xp: [300, 500] }
  },
  {
    id: 11, name: 'Rigel', x: 240, y: 80,
    type: 'boss', danger: 5, fuel: 40,
    planet: 'planet6', planetScale: 1.6,
    description: 'Гнездо Материнского Корабля пришельцев.',
    connections: [9, 10],
    enemyTier: 3, enemyCount: [3, 5],
    boss: 'boss_2',
    rewards: { credits: [2000, 5000], xp: [1000, 2000] }
  }
];

export function getSystemById(id) {
  return STAR_SYSTEMS.find(s => s.id === id);
}
