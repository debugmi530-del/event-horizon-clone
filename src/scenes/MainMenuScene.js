import { SaveSystem } from '../systems/SaveSystem';

export class MainMenuScene extends Phaser.Scene {
  constructor() { super({ key: 'MainMenuScene' }); }

  create() {
    const W = this.scale.width, H = this.scale.height;
    this.save = SaveSystem.load();

    // ── Фоны ──
    if (this.textures.exists('bg_space')) {
      this.add.image(W/2, H/2, 'bg_space').setDisplaySize(W, H).setAlpha(0.55);
    }
    if (this.textures.exists('bg_stars')) {
      this.bg = this.add.tileSprite(W/2, H/2, W, H, 'bg_stars').setAlpha(0.8);
    }
    if (this.textures.exists('bg_nebula')) {
      this.add.image(W/2, H/2, 'bg_nebula').setDisplaySize(W, H).setAlpha(0.22)
        .setBlendMode(Phaser.BlendModes.ADD);
    }

    // Процедурный звёздный фон
    this._createStarfield();

    // Планета на фоне
    if (this.textures.exists('planet6')) {
      const planet = this.add.image(W * 0.8, H * 0.42, 'planet6').setScale(1.5).setAlpha(0.35);
      this.tweens.add({ targets: planet, rotation: Math.PI * 2, duration: 80000, repeat: -1 });
    }

    // ── Логотип ──
    this._drawLogo(W, H);

    // ── Кнопки меню ──
    const hasFleet = this.save.fleet?.length > 0;
    const btnStartY = H * 0.52;
    const gap = 62;

    this._makeBtn(W/2, btnStartY,        '▶  ПРОДОЛЖИТЬ', () => this.scene.start('StarMapScene'), !hasFleet);
    this._makeBtn(W/2, btnStartY + gap,  '✦  НОВАЯ ИГРА',  () => this._newGame());
    this._makeBtn(W/2, btnStartY + gap*2,'⚙  АНГАР',       () => this.scene.start('HangarScene'));
    this._makeBtn(W/2, btnStartY + gap*3,'🔬 ТЕХНОЛОГИИ',   () => this.scene.start('TechTreeScene'));

    // ── Статистика ──
    if (this.save.statistics) {
      const s = this.save.statistics;
      this.add.text(W/2, H * 0.88,
        `Уровень ${this.save.playerLevel}  •  ${s.battlesWon} побед  •  ${s.enemiesDefeated} врагов`,
        { fontSize: '11px', fontFamily: 'Arial', color: '#4455778' }
      ).setOrigin(0.5);
    }

    // Кредиты
    this.add.text(W/2, H - 14, `💰 ${this.save.credits}  ⛽ ${this.save.fuel}/${this.save.maxFuel}`, {
      fontSize: '12px', fontFamily: 'Arial', color: '#ffcc44'
    }).setOrigin(0.5, 1);

    this.add.text(W - 8, H - 8, 'v1.0 — Event Horizon Clone', {
      fontSize: '9px', fontFamily: 'Arial', color: '#333355'
    }).setOrigin(1, 1);
  }

  update() {
    if (this.bg) this.bg.tilePositionY -= 0.3;
  }

  _drawLogo(W, H) {
    // Фоновое свечение логотипа
    const glowGfx = this.add.graphics();
    glowGfx.fillStyle(0x4422aa, 0.15).fillEllipse(W/2, H * 0.2, 340, 100);

    // Основной заголовок
    const title = this.add.text(W/2, H * 0.14, 'EVENT', {
      fontSize: '48px', fontFamily: 'Arial Black, Arial',
      color: '#ffffff',
      stroke: '#5522cc', strokeThickness: 7,
      shadow: { offsetX: 0, offsetY: 0, color: '#8844ff', blur: 20, fill: true }
    }).setOrigin(0.5);

    const title2 = this.add.text(W/2, H * 0.22, 'HORIZON', {
      fontSize: '48px', fontFamily: 'Arial Black, Arial',
      color: '#ccaaff',
      stroke: '#220055', strokeThickness: 5,
      shadow: { offsetX: 0, offsetY: 0, color: '#6633aa', blur: 16, fill: true }
    }).setOrigin(0.5);

    const sub = this.add.text(W/2, H * 0.32, '— SPACE ARENA —', {
      fontSize: '13px', fontFamily: 'Arial', color: '#7755aa', letterSpacing: 6
    }).setOrigin(0.5);

    // Линия под логотипом
    const line = this.add.graphics();
    line.lineStyle(1, 0x6644aa, 0.5).beginPath()
      .moveTo(W/2 - 120, H * 0.37).lineTo(W/2 + 120, H * 0.37).strokePath();

    // Пульсация
    this.tweens.add({ targets: [title, title2], alpha: { from: 1, to: 0.82 }, duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  _makeBtn(x, y, label, cb, disabled = false) {
    const bW = 250, bH = 48;
    const bg = this.add.graphics();
    const col = disabled ? 0x111122 : 0x0e0e2a;
    const border = disabled ? 0x222244 : 0x5533aa;
    const textCol = disabled ? '#333355' : '#ccaaff';

    bg.fillStyle(col, 0.92).fillRect(x - bW/2, y - bH/2, bW, bH);
    bg.lineStyle(1.5, border).strokeRect(x - bW/2, y - bH/2, bW, bH);

    // Левый акцент
    if (!disabled) {
      bg.fillStyle(0x6644cc, 0.8).fillRect(x - bW/2, y - bH/2, 3, bH);
    }

    const txt = this.add.text(x + 4, y, label, {
      fontSize: '15px', fontFamily: 'Arial', color: textCol, fontStyle: 'bold'
    }).setOrigin(0.5);

    if (!disabled) {
      const zone = this.add.zone(x, y, bW, bH).setInteractive();
      zone.on('pointerover', () => {
        bg.clear();
        bg.fillStyle(0x2a1a55, 0.96).fillRect(x - bW/2, y - bH/2, bW, bH);
        bg.lineStyle(1.5, 0xaa88ff).strokeRect(x - bW/2, y - bH/2, bW, bH);
        bg.fillStyle(0xaa88ff, 1).fillRect(x - bW/2, y - bH/2, 3, bH);
        txt.setColor('#ffffff');
      });
      zone.on('pointerout', () => {
        bg.clear();
        bg.fillStyle(col, 0.92).fillRect(x - bW/2, y - bH/2, bW, bH);
        bg.lineStyle(1.5, border).strokeRect(x - bW/2, y - bH/2, bW, bH);
        bg.fillStyle(0x6644cc, 0.8).fillRect(x - bW/2, y - bH/2, 3, bH);
        txt.setColor(textCol);
      });
      zone.on('pointerdown', cb);
    }
  }

  _newGame() {
    SaveSystem.reset();
    const save = SaveSystem.load();
    save.fleet = [{ shipId: 'f0s1', weapons: ['laser_1'], modules: [], hp: 80 }];
    save.credits = 500;
    save.fuel = 100;
    SaveSystem.save(save);
    this.scene.start('StarMapScene');
  }

  _createStarfield() {
    const g = this.add.graphics();
    const W = this.scale.width, H = this.scale.height;
    for (let i = 0; i < 150; i++) {
      const x = Math.random() * W, y = Math.random() * H;
      const r = Math.random() * 1.4;
      const bright = Math.random();
      const col = bright > 0.85 ? 0xaabbff : bright > 0.7 ? 0xeeeeff : 0xffffff;
      g.fillStyle(col, 0.2 + Math.random() * 0.7).fillCircle(x, y, r);
    }
  }
}
