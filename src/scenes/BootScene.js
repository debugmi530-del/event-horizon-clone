export class BootScene extends Phaser.Scene {
  constructor() { super({ key: 'BootScene' }); }

  preload() {
    // Минимальные ассеты для экрана загрузки
    this.load.image('logo', 'assets/sprites/ui/logo.png');
  }

  create() {
    // Инициализируем сохранение
    if (!localStorage.getItem('eh_save')) {
      const defaultSave = {
        credits: 500,
        stars: 0,
        fuel: 100,
        maxFuel: 100,
        playerLevel: 1,
        experience: 0,
        fleet: [],
        inventory: [],
        unlockedTech: [],
        starMap: { currentSystem: 0, visited: [0] },
        statistics: { battlesWon: 0, battlesLost: 0, enemiesDefeated: 0 }
      };
      localStorage.setItem('eh_save', JSON.stringify(defaultSave));
    }
    this.scene.start('PreloadScene');
  }
}
