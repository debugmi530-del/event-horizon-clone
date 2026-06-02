import { SaveSystem } from '../systems/SaveSystem';

export class MainMenuScene extends Phaser.Scene {
  constructor() { super({ key: 'MainMenuScene' }); }

  create() {
    const W = this.scale.width, H = this.scale.height;
    const save = SaveSystem.load();

    // Фон — звёзды
    this.add.image(W/2, H/2, 'bg_stars').setDisplaySize(W, H).setAlpha(0.8);
    this.add.image(W/2, H/2, 'bg_nebula').setDisplaySize(W, H).setAlpha(0.3);

    // Звёздное поле (частицы)
    this._createStarfield();

    // Логотип
    const title = this.add.text(W/2, H * 0.22, 'EVENT\nHORIZON', {
      fontSize: '46px', fontFamily: 'Arial Black, Arial',
      color: '#ffffff', stroke: '#4422aa', strokeThickness: 6,
      align: 'center', lineSpacing: 4
    }).setOrigin(0.5);

    const subtitle = this.add.text(W/2, H * 0.36, 'SPACE ARENA', {
      fontSize: '16px', fontFamily: 'Arial', color: '#aa88ff',
      letterSpacing: 8
    }).setOrigin(0.5);

    // Мерцание заголовка
    this.tweens.add({ targets: title, alpha: { from: 1, to: 0.7 }, duration: 2000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

    // Планета на фоне
    const planet = this.add.image(W * 0.75, H * 0.5, 'planet1').setScale(1.2).setAlpha(0.4);
    this.tweens.add({ targets: planet, rotation: Math.PI * 2, duration: 60000, repeat: -1 });

    // Кнопки меню
    const btnY = H * 0.54;
    const gap = 62;
    this._makeButton(W/2, btnY, 'ПРОДОЛЖИТЬ', () => this.scene.start('StarMapScene'), !save.fleet.length);
    this._makeButton(W/2, btnY + gap, 'НОВАЯ ИГРА', () => this._newGame());
    this._makeButton(W/2, btnY + gap*2, 'АНГАР', () => this.scene.start('HangarScene'));
    this._makeButton(W/2, btnY + gap*3, 'ТЕХНОЛОГИИ', () => this.scene.start('TechTreeScene'));

    // Статистика
    if (save.statistics) {
      this.add.text(W/2, H * 0.88, `Побед: ${save.statistics.battlesWon}  |  Врагов: ${save.statistics.enemiesDefeated}`, {
        fontSize: '12px', fontFamily: 'Arial', color: '#666688'
      }).setOrigin(0.5);
    }

    // Версия
    this.add.text(W - 10, H - 10, 'v1.0', {
      fontSize: '11px', fontFamily: 'Arial', color: '#444466'
    }).setOrigin(1, 1);
  }

  _makeButton(x, y, label, cb, disabled = false) {
    const W = 240, H = 46;
    const bg = this.add.graphics();
    const color = disabled ? 0x222233 : 0x1a1a3a;
    const borderColor = disabled ? 0x333355 : 0x6644bb;
    bg.lineStyle(2, borderColor).strokeRect(x - W/2, y - H/2, W, H);
    bg.fillStyle(color, 0.9).fillRect(x - W/2 + 1, y - H/2 + 1, W - 2, H - 2);

    const txt = this.add.text(x, y, label, {
      fontSize: '16px', fontFamily: 'Arial', color: disabled ? '#444466' : '#ccaaff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    if (!disabled) {
      const zone = this.add.zone(x, y, W, H).setInteractive();
      zone.on('pointerover', () => { bg.clear(); bg.lineStyle(2, 0xaa88ff).strokeRect(x - W/2, y - H/2, W, H); bg.fillStyle(0x3a2a6a, 0.95).fillRect(x - W/2 + 1, y - H/2 + 1, W - 2, H - 2); txt.setColor('#ffffff'); });
      zone.on('pointerout', () => { bg.clear(); bg.lineStyle(2, borderColor).strokeRect(x - W/2, y - H/2, W, H); bg.fillStyle(color, 0.9).fillRect(x - W/2 + 1, y - H/2 + 1, W - 2, H - 2); txt.setColor('#ccaaff'); });
      zone.on('pointerdown', cb);
    }
    return { bg, txt };
  }

  _newGame() {
    SaveSystem.reset();
    // Выдаём стартовый корабль
    const save = SaveSystem.load();
    save.fleet = [{ shipId: 'f0s1', weapons: ['laser_1'], modules: [], hp: 80 }];
    save.credits = 500;
    SaveSystem.save(save);
    this.scene.start('StarMapScene');
  }

  _createStarfield() {
    const g = this.add.graphics();
    for (let i = 0; i < 120; i++) {
      const x = Math.random() * this.scale.width;
      const y = Math.random() * this.scale.height;
      const r = Math.random() * 1.5;
      const a = 0.3 + Math.random() * 0.7;
      g.fillStyle(0xffffff, a).fillCircle(x, y, r);
    }
  }
}
