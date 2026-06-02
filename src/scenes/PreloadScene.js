export class PreloadScene extends Phaser.Scene {
  constructor() { super({ key: 'PreloadScene' }); }

  preload() {
    const W = this.scale.width, H = this.scale.height;

    // Progress bar
    const bar = this.add.graphics();
    const border = this.add.graphics();
    border.lineStyle(2, 0x6644aa).strokeRect(W/2 - 150, H/2 - 15, 300, 30);

    this.load.on('progress', v => {
      bar.clear().fillStyle(0x6644aa).fillRect(W/2 - 148, H/2 - 13, 296 * v, 26);
    });

    const title = this.add.text(W/2, H/2 - 60, 'EVENT HORIZON', {
      fontSize: '28px', fontFamily: 'Arial', color: '#aa88ff',
      stroke: '#330066', strokeThickness: 4
    }).setOrigin(0.5);

    const loadText = this.add.text(W/2, H/2 + 50, 'Загрузка...', {
      fontSize: '14px', fontFamily: 'Arial', color: '#888888'
    }).setOrigin(0.5);

    this.load.on('complete', () => loadText.setText('Готово!'));

    // ── Фоны ──
    this.load.image('bg_stars', 'assets/sprites/backgrounds/Stars.png');
    this.load.image('bg_stars_detail', 'assets/sprites/backgrounds/StarsDetail.png');
    this.load.image('bg_nebula', 'assets/sprites/backgrounds/Nebula.png');
    this.load.image('bg_space', 'assets/sprites/backgrounds/background.jpg');

    // ── Снаряды ──
    this.load.image('bullet_laser', 'assets/sprites/bullets/laser.png');
    this.load.image('bullet_plasma', 'assets/sprites/bullets/plasma.png');
    this.load.image('bullet_rocket', 'assets/sprites/bullets/rocket2.png');
    this.load.image('bullet_ball', 'assets/sprites/bullets/ball.png');
    this.load.image('bullet_bomb', 'assets/sprites/bullets/bomb.png');
    this.load.image('bullet_energy', 'assets/sprites/bullets/energy1.png');
    this.load.image('bullet_fragment', 'assets/sprites/bullets/fragment.png');
    this.load.image('bullet_vortex', 'assets/sprites/bullets/vortex.png');
    this.load.image('bullet_wave', 'assets/sprites/bullets/wave.png');

    // ── Эффекты ──
    this.load.image('fx_shield', 'assets/sprites/effects/shield.png');
    this.load.image('fx_engine', 'assets/sprites/effects/engine_light.png');
    this.load.image('fx_trail', 'assets/sprites/effects/EngineTrail.png');
    this.load.image('fx_smoke', 'assets/sprites/effects/smoke.png');
    this.load.image('fx_beam', 'assets/sprites/effects/beam.png');
    this.load.image('fx_cloud', 'assets/sprites/effects/cloud.png');
    this.load.image('fx_star', 'assets/sprites/effects/star.png');
    this.load.image('fx_laser', 'assets/sprites/effects/laser.png');

    // ── Планеты и объекты ──
    this.load.image('planet1', 'assets/sprites/planets/planet1.png');
    this.load.image('planet2', 'assets/sprites/planets/planet2.png');
    this.load.image('planet3', 'assets/sprites/planets/planet3.png');
    this.load.image('planet4', 'assets/sprites/planets/planet4.png');
    this.load.image('planet5', 'assets/sprites/planets/planet5.png');
    this.load.image('planet6', 'assets/sprites/planets/planet6.png');
    this.load.image('starbase', 'assets/sprites/planets/starbase.png');
    this.load.image('asteroid', 'assets/sprites/objects/asteroid.png');
    this.load.image('repair_kit', 'assets/sprites/objects/repair_kit.png');

    // ── Звёздная карта ──
    this.load.image('sm_base', 'assets/sprites/starmap/base.png');
    this.load.image('sm_boss', 'assets/sprites/starmap/boss.png');
    this.load.image('sm_wormhole', 'assets/sprites/starmap/wormhole.png');
    this.load.image('sm_shop', 'assets/sprites/starmap/shop_mini.png');
    this.load.image('sm_home', 'assets/sprites/starmap/home.png');
    this.load.image('sm_danger', 'assets/sprites/starmap/danger.png');
    this.load.image('sm_lab', 'assets/sprites/starmap/lab.png');
    this.load.image('sm_ruins', 'assets/sprites/starmap/ruins.png');
    this.load.image('sm_star', 'assets/sprites/starmap/star_mini.png');
  }

  create() {
    this.time.delayedCall(500, () => this.scene.start('MainMenuScene'));
  }
}
