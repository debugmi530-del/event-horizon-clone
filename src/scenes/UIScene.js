// Оверлейная UI-сцена (всегда поверх других)
export class UIScene extends Phaser.Scene {
  constructor() { super({ key: 'UIScene', active: false }); }
  create() {}
}
