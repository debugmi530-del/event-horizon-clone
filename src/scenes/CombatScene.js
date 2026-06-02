import { getSystemById } from '../data/starmap';
import { getShipById } from '../data/ships';
import { getWeaponById } from '../data/weapons';
import { getEnemyById, getEnemiesByTier } from '../data/enemies';
import { SaveSystem } from '../systems/SaveSystem';
import { ShipEntity } from '../entities/ShipEntity';
import { BulletSystem } from '../systems/BulletSystem';
import { ParticleSystem } from '../systems/ParticleSystem';
import { AISystem } from '../systems/AISystem';

export class CombatScene extends Phaser.Scene {
  constructor() { super({ key: 'CombatScene' }); }

  init(data) {
    this.systemId = data.systemId ?? 1;
    this.waveNumber = 0;
    this.enemiesLeft = 0;
    this.gameOver = false;
    this.victory = false;
    this._enemies = [];
  }

  create() {
    const W = this.scale.width, H = this.scale.height;
    this.save = SaveSystem.load();
    this.starSystem = getSystemById(this.systemId);

    // ── Параллакс-фон (3 слоя) ──
    this._createStarfield();

    // Туманность
    if (this.textures.exists('bg_nebula')) {
      this.nebulaLayer = this.add.tileSprite(W/2, H/2, W, H, 'bg_nebula')
        .setAlpha(0.18).setDepth(0).setBlendMode(Phaser.BlendModes.ADD);
    }

    // Планета
    const pKey = this.starSystem.planet || 'planet1';
    if (this.textures.exists(pKey)) {
      this.add.image(W * 0.82, H * 0.16, pKey)
        .setScale((this.starSystem.planetScale || 1) * 0.9)
        .setAlpha(0.65).setDepth(1);
    }

    // ── Группы физики ──
    this.playerBullets = this.physics.add.group();
    this.enemyBullets = this.physics.add.group();
    this.enemyGroup = this.physics.add.group();
    this.pickupGroup = this.physics.add.group();

    // ── Системы ──
    this.bulletSystem = new BulletSystem(this);
    this.particleSystem = new ParticleSystem(this);
    this.aiSystem = new AISystem(this);

    // ── Игрок ──
    this._createPlayer();

    // ── HUD ──
    this._createHUD();

    // ── Коллизии ──
    this.physics.add.overlap(
      this.playerBullets, this.enemyGroup,
      (b, e) => this._onBulletHitEnemy(b, e)
    );
    this.physics.add.overlap(
      this.enemyBullets, this.player.sprite,
      (b) => this._onBulletHitPlayer(b)
    );
    this.physics.add.overlap(
      this.player.sprite, this.pickupGroup,
      (_, p) => this._onPickup(p)
    );

    // ── Управление ──
    this._setupControls();

    // ── Волна ──
    this.time.delayedCall(1200, () => this._spawnWave());
  }

  // ═══════════════════════════════════════════════════
  // ЗВЁЗДНОЕ ПОЛЕ
  // ═══════════════════════════════════════════════════
  _createStarfield() {
    const W = this.scale.width, H = this.scale.height;

    // Слой 1 — статичные мелкие звёзды
    const starGfx = this.add.graphics().setDepth(0);
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * W, y = Math.random() * H;
      const r = Math.random() * 1.2;
      const a = 0.2 + Math.random() * 0.6;
      starGfx.fillStyle(0xffffff, a).fillCircle(x, y, r);
    }

    // Слой 2 — прокручиваемые звёзды средние
    this.starMid = this.add.tileSprite(W/2, H/2, W, H, 'bg_stars')
      .setAlpha(0.7).setDepth(0);

    // Слой 3 — дальний фон
    if (this.textures.exists('bg_space')) {
      this.starFar = this.add.tileSprite(W/2, H/2, W, H, 'bg_space')
        .setAlpha(0.4).setDepth(0);
    }
  }

  // ═══════════════════════════════════════════════════
  // ИГРОК
  // ═══════════════════════════════════════════════════
  _createPlayer() {
    const W = this.scale.width, H = this.scale.height;
    const fleetSlot = this.save.fleet[0];
    const shipData = getShipById(fleetSlot?.shipId || 'f0s1');
    const weapons = (fleetSlot?.weapons || ['laser_1'])
      .map(id => getWeaponById(id)).filter(Boolean);
    if (!weapons.length) weapons.push(getWeaponById('laser_1'));

    this.player = new ShipEntity(this, {
      x: W / 2, y: H * 0.8,
      shipData, weapons,
      isPlayer: true,
      bulletGroup: this.playerBullets
    });
    this.playerMaxHp = this.player.hp;
    this.playerMaxShield = this.player.shield;
  }

  // ═══════════════════════════════════════════════════
  // HUD — как в оригинале
  // ═══════════════════════════════════════════════════
  _createHUD() {
    const W = this.scale.width, H = this.scale.height;
    this.score = 0;

    // Нижняя панель
    const panelH = 64;
    this.hudGfx = this.add.graphics().setDepth(100);
    this.hudGfx.fillStyle(0x000011, 0.88).fillRect(0, H - panelH, W, panelH);
    this.hudGfx.lineStyle(1, 0x334466, 0.8).strokeRect(0, H - panelH, W, panelH);

    // HP-бар
    this.hpBarBg = this.add.graphics().setDepth(101);
    this.hpBarFg = this.add.graphics().setDepth(101);
    const barY = H - panelH + 10;
    // Метка
    this.add.text(12, barY, 'HP', { fontSize: '10px', fontFamily: 'Arial Black', color: '#ff6666' }).setDepth(102);
    this.add.text(12, barY + 16, 'ЩТ', { fontSize: '10px', fontFamily: 'Arial Black', color: '#4488ff' }).setDepth(102);
    this.add.text(12, barY + 32, 'ЭН', { fontSize: '10px', fontFamily: 'Arial Black', color: '#ffff44' }).setDepth(102);

    // Справа — волна и счёт
    this.waveText = this.add.text(W/2, H - panelH + 12, 'ВОЛНА 1', {
      fontSize: '15px', fontFamily: 'Arial Black', color: '#ccaaff',
      stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5, 0).setDepth(102);

    this.scoreText = this.add.text(W/2, H - panelH + 30, '0 очков', {
      fontSize: '11px', fontFamily: 'Arial', color: '#888899'
    }).setOrigin(0.5, 0).setDepth(102);

    this.credText = this.add.text(W - 10, H - panelH + 10, `💰 ${this.save.credits}`, {
      fontSize: '13px', fontFamily: 'Arial', color: '#ffdd44'
    }).setOrigin(1, 0).setDepth(102);

    // Иконки оружий
    this._drawWeaponSlots();

    // Кнопка отступления
    this.add.text(W - 10, H - 10, '⚠ ОТСТУПИТЬ', {
      fontSize: '11px', fontFamily: 'Arial', color: '#775533',
      backgroundColor: '#0a0a0a', padding: { x: 5, y: 3 }
    }).setOrigin(1, 1).setInteractive().setDepth(103)
      .on('pointerdown', () => this._retreat())
      .on('pointerover', function() { this.setColor('#ffaa44'); })
      .on('pointerout', function() { this.setColor('#775533'); });

    this._updateHUD();
  }

  _drawWeaponSlots() {
    const W = this.scale.width, H = this.scale.height;
    const weapons = (this.save.fleet[0]?.weapons || []).map(id => getWeaponById(id)).filter(Boolean);
    const slotW = 36, slotH = 36, startX = W/2 - (weapons.length * (slotW + 4)) / 2;

    weapons.forEach((w, i) => {
      const sx = startX + i * (slotW + 4);
      const sy = H - 44;
      const bg = this.add.graphics().setDepth(101);
      bg.lineStyle(1, 0x334466).strokeRect(sx, sy, slotW, slotH);
      bg.fillStyle(0x0a0a22, 0.8).fillRect(sx, sy, slotW, slotH);
      if (w.color) bg.fillStyle(w.color, 0.25).fillRect(sx + 1, sy + 1, slotW - 2, slotH - 2);
      this.add.text(sx + slotW/2, sy + 10, w.type?.[0] || '?', {
        fontSize: '13px', fontFamily: 'Arial Black', color: '#' + (w.color || 0xffffff).toString(16).padStart(6, '0')
      }).setOrigin(0.5).setDepth(102);
      this.add.text(sx + slotW/2, sy + 24, w.name.split(' ')[0], {
        fontSize: '8px', fontFamily: 'Arial', color: '#888899'
      }).setOrigin(0.5).setDepth(102);
    });
  }

  _updateHUD() {
    const W = this.scale.width, H = this.scale.height;
    const barX = 32, barY = H - 54;
    const barW = 130, barH = 10;
    const gap = 16;

    const hpPct = Phaser.Math.Clamp(this.player.hp / this.playerMaxHp, 0, 1);
    const sPct = this.playerMaxShield > 0
      ? Phaser.Math.Clamp(this.player.shield / this.playerMaxShield, 0, 1) : 0;
    const ePct = Phaser.Math.Clamp(this.player.energy / this.player.maxEnergy, 0, 1);

    this.hpBarBg.clear()
      .fillStyle(0x1a0000, 0.9).fillRect(barX, barY, barW, barH)
      .fillStyle(0x001033, 0.9).fillRect(barX, barY + gap, barW, barH - 2)
      .fillStyle(0x1a1a00, 0.9).fillRect(barX, barY + gap * 2, barW, barH - 4);

    const hpCol = hpPct > 0.5 ? 0x44ff44 : hpPct > 0.25 ? 0xffff44 : 0xff2222;
    this.hpBarFg.clear()
      .fillStyle(hpCol, 1).fillRect(barX, barY, barW * hpPct, barH)
      .fillStyle(0x4488ff, 1).fillRect(barX, barY + gap, barW * sPct, barH - 2)
      .fillStyle(0xffff44, 1).fillRect(barX, barY + gap * 2, barW * ePct, barH - 4);

    // Обводка
    this.hpBarBg.lineStyle(1, 0x334455).strokeRect(barX, barY, barW, barH);
    this.hpBarBg.lineStyle(1, 0x223366).strokeRect(barX, barY + gap, barW, barH - 2);
    this.hpBarBg.lineStyle(1, 0x333300).strokeRect(barX, barY + gap * 2, barW, barH - 4);

    this.scoreText.setText(`${this.score} очков`);
    this.credText.setText(`💰 ${this.save.credits}`);

    // HP-бар босса
    if (this.bossEntity?.sprite?.active && this.bossBarGfx) {
      const bp = Math.max(0, this.bossEntity.hp / this.bossEntity.maxHp);
      this.bossBarGfx.clear()
        .fillStyle(0x110000, 0.9).fillRect(10, H - 72, W - 20, 8)
        .fillStyle(0xff2200, 1).fillRect(10, H - 72, (W - 20) * bp, 8)
        .lineStyle(1, 0xff4444).strokeRect(10, H - 72, W - 20, 8);
    }
  }

  // ═══════════════════════════════════════════════════
  // УПРАВЛЕНИЕ
  // ═══════════════════════════════════════════════════
  _setupControls() {
    const W = this.scale.width, H = this.scale.height;
    this.moveTarget = { x: W / 2, y: H * 0.75 };
    this.shootTarget = null;
    this.isShooting = false;

    // Тач
    this.input.on('pointerdown', ptr => {
      if (ptr.x < W / 2) {
        this.moveTarget = { x: ptr.x, y: ptr.y };
      } else {
        this.isShooting = true;
        this.shootTarget = { x: ptr.x, y: ptr.y };
      }
    });
    this.input.on('pointermove', ptr => {
      if (!ptr.isDown) return;
      if (ptr.x < W / 2) this.moveTarget = { x: ptr.x, y: ptr.y };
      else { this.isShooting = true; this.shootTarget = { x: ptr.x, y: ptr.y }; }
    });
    this.input.on('pointerup', () => { this.isShooting = false; });

    // Клавиатура
    this.cursors = this.input.keyboard?.createCursorKeys();
    this.wasd = this.input.keyboard?.addKeys({ w: 'W', s: 'S', a: 'A', d: 'D', space: 'SPACE' });
  }

  // ═══════════════════════════════════════════════════
  // ВОЛНЫ ВРАГОВ
  // ═══════════════════════════════════════════════════
  _spawnWave() {
    if (this.gameOver || this.victory) return;
    this.waveNumber++;
    const maxWaves = this.starSystem.boss ? 3 : 4;
    this.waveText.setText(`ВОЛНА ${this.waveNumber}`);

    // Финальная волна — босс
    if (this.waveNumber === maxWaves && this.starSystem.boss) {
      this._spawnBoss();
      return;
    }
    if (this.waveNumber > maxWaves) {
      this._victory();
      return;
    }

    const tier = this.starSystem.enemyTier || 1;
    const [min, max] = this.starSystem.enemyCount || [2, 4];
    const count = Phaser.Math.Between(min, max);
    const pool = getEnemiesByTier(tier);
    if (!pool.length) { this._victory(); return; }

    this.enemiesLeft = count;
    this._enemies = [];

    // Предупреждение о волне
    this._showWaveBanner(`ВОЛНА ${this.waveNumber}`);

    for (let i = 0; i < count; i++) {
      const eData = Phaser.Utils.Array.GetRandom(pool);
      this.time.delayedCall(i * 500 + 800, () => {
        if (!this.gameOver) this._spawnEnemy(eData);
      });
    }
  }

  _spawnEnemy(eData) {
    const W = this.scale.width;
    const side = Phaser.Math.Between(0, 2);
    let x, y;
    if (side === 0) { x = Phaser.Math.Between(30, W - 30); y = -40; }
    else if (side === 1) { x = -40; y = Phaser.Math.Between(50, 250); }
    else { x = W + 40; y = Phaser.Math.Between(50, 250); }

    const enemy = new ShipEntity(this, {
      x, y, enemyData: eData,
      isPlayer: false,
      bulletGroup: this.enemyBullets
    });

    this.enemyGroup.add(enemy.sprite);
    enemy.sprite.setData('entity', enemy);
    enemy.sprite.setData('enemyData', eData);
    this._enemies.push(enemy);
    this.aiSystem.register(enemy);

    // Анимация появления
    enemy.sprite.setAlpha(0);
    this.tweens.add({ targets: enemy.sprite, alpha: 1, duration: 400 });
  }

  _spawnBoss() {
    const bossData = getEnemyById(this.starSystem.boss);
    if (!bossData) { this._victory(); return; }

    this._showWaveBanner('⚠ ВНИМАНИЕ: БОСС', '#ff4444');

    const boss = new ShipEntity(this, {
      x: this.scale.width / 2, y: -80,
      enemyData: bossData, isPlayer: false,
      bulletGroup: this.enemyBullets
    });
    this.enemyGroup.add(boss.sprite);
    boss.sprite.setData('entity', boss);
    boss.sprite.setData('enemyData', bossData);
    this._enemies.push(boss);
    this.aiSystem.register(boss);
    this.bossEntity = boss;
    this.enemiesLeft = 1;

    // HP-бар босса
    this.bossBarGfx = this.add.graphics().setDepth(101);
    this.bossNameText = this.add.text(this.scale.width / 2, this.scale.height - 80,
      bossData.name.toUpperCase(),
      { fontSize: '12px', fontFamily: 'Arial Black', color: '#ff4444', stroke: '#000', strokeThickness: 3 }
    ).setOrigin(0.5, 1).setDepth(102);

    this.waveText.setText(`☠ ${bossData.name}`).setColor('#ff4444');
  }

  // ═══════════════════════════════════════════════════
  // ОБНОВЛЕНИЕ
  // ═══════════════════════════════════════════════════
  update(time, delta) {
    if (this.gameOver || this.victory) return;

    // Параллакс
    if (this.starMid) this.starMid.tilePositionY -= 0.8;
    if (this.starFar) this.starFar.tilePositionY -= 0.25;
    if (this.nebulaLayer) this.nebulaLayer.tilePositionY -= 0.15;

    this._movePlayer(delta);
    this._firePlayer(time);

    this.player.update(delta);
    this.aiSystem.update(time, delta);
    this._enemies.forEach(e => e.sprite?.active && e.update(delta));

    this.bulletSystem.update();
    this._updateHUD();
    this._clampPlayer();

    // Ракетные трейлы
    this._updateMissileTrails(time);
  }

  _movePlayer(delta) {
    const spr = this.player.sprite;
    const spd = this.player.speed;
    let vx = 0, vy = 0;

    // Клавиатура
    if (this.cursors?.left.isDown || this.wasd?.a.isDown) vx = -spd;
    else if (this.cursors?.right.isDown || this.wasd?.d.isDown) vx = spd;
    if (this.cursors?.up.isDown || this.wasd?.w.isDown) vy = -spd;
    else if (this.cursors?.down.isDown || this.wasd?.s.isDown) vy = spd;

    // Тач движение
    if (!vx && !vy) {
      const dx = this.moveTarget.x - spr.x;
      const dy = this.moveTarget.y - spr.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 10) {
        const t = Math.min(1, dist / 80);
        vx = (dx / dist) * spd * t;
        vy = (dy / dist) * spd * t;
      }
    }

    spr.setVelocity(vx, vy);

    // Поворот к цели стрельбы или движения
    const tgt = (this.isShooting && this.shootTarget) ? this.shootTarget : this.moveTarget;
    const dist2 = Phaser.Math.Distance.Between(spr.x, spr.y, tgt.x, tgt.y);
    if (dist2 > 15) {
      const targetAngle = Phaser.Math.Angle.Between(spr.x, spr.y, tgt.x, tgt.y) + Math.PI / 2;
      spr.rotation = Phaser.Math.Angle.RotateTo(spr.rotation, targetAngle, 0.18);
    }
  }

  _firePlayer(time) {
    const shooting = this.isShooting || this.wasd?.space.isDown;
    if (!shooting) return;
    const tgt = this.shootTarget || this.moveTarget;
    this.player.tryFire(time, tgt);
  }

  _clampPlayer() {
    const spr = this.player.sprite;
    const W = this.scale.width, H = this.scale.height;
    const pad = 22;
    spr.x = Phaser.Math.Clamp(spr.x, pad, W - pad);
    spr.y = Phaser.Math.Clamp(spr.y, H * 0.1, H - 80);
  }

  _updateMissileTrails(time) {
    [this.playerBullets, this.enemyBullets].forEach(grp => {
      grp.getChildren().forEach(b => {
        if (!b.active) return;
        const w = b.getData('weapon');
        if (w?.type === 'Missile' || w?.type === 'Torpedo') {
          if (!b._lastTrail || time - b._lastTrail > 40) {
            b._lastTrail = time;
            this.particleSystem.missileTrail(b.x, b.y, w.color || 0xffaa44);
          }
        }
      });
    });
  }

  // ═══════════════════════════════════════════════════
  // КОЛЛИЗИИ
  // ═══════════════════════════════════════════════════
  _onBulletHitEnemy(bullet, enemySprite) {
    const w = bullet.getData('weapon');
    const dmg = w?.damage || 10;
    const hitX = bullet.x, hitY = bullet.y;
    bullet.destroy();

    const entity = enemySprite.getData('entity');
    if (!entity || !entity.sprite?.active) return;

    const wasShielded = entity.shield > 0;
    entity.takeDamage(dmg, hitX, hitY);
    this.particleSystem.hitEffect(hitX, hitY, w?.color || 0xffffff, wasShielded);

    if (entity.hp <= 0) this._killEnemy(entity);
  }

  _onBulletHitPlayer(bullet) {
    const w = bullet.getData('weapon');
    const dmg = w?.damage || 8;
    const hitX = bullet.x, hitY = bullet.y;
    bullet.destroy();

    const wasShielded = this.player.shield > 0;
    this.player.takeDamage(dmg, hitX, hitY);
    this.particleSystem.hitEffect(hitX, hitY, 0xff6644, wasShielded);
    this.cameras.main.shake(120, 0.004);

    if (this.player.hp <= 0) this._gameOver();
  }

  _onPickup(kit) {
    const heal = 35;
    this.player.hp = Math.min(this.player.hp + heal, this.playerMaxHp);
    this.particleSystem.healEffect(this.player.sprite.x, this.player.sprite.y);
    kit.destroy();
  }

  _killEnemy(entity) {
    const data = entity.sprite.getData('enemyData');
    this.aiSystem.unregister(entity);
    this._enemies = this._enemies.filter(e => e !== entity);

    const size = data?.isBoss ? 2.5 : (data?.scale || 1.0);
    this.particleSystem.explode(entity.sprite.x, entity.sprite.y, data?.color || 0xff4400, size);
    this.cameras.main.shake(data?.isBoss ? 300 : 80, data?.isBoss ? 0.012 : 0.003);

    if (data) {
      this.score += data.xp;
      this.save.credits += data.credits;
      this.save.statistics.enemiesDefeated++;
      if (Math.random() < 0.22) this._dropRepairKit(entity.sprite.x, entity.sprite.y);
    }
    entity.destroy();

    this.enemiesLeft = Math.max(0, this.enemiesLeft - 1);
    if (this.enemiesLeft <= 0) {
      this.time.delayedCall(1800, () => this._spawnWave());
    }
  }

  _dropRepairKit(x, y) {
    const kit = this.physics.add.image(x, y, 'repair_kit').setScale(0.55).setDepth(5);
    kit.setVelocity(Phaser.Math.Between(-25, 25), Phaser.Math.Between(15, 50));
    this.pickupGroup.add(kit);
    this.tweens.add({ targets: kit, y: y + 6, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.time.delayedCall(9000, () => kit?.active && kit.destroy());
  }

  // ═══════════════════════════════════════════════════
  // ЧИСЛА УРОНА
  // ═══════════════════════════════════════════════════
  _showDamageNumber(x, y, dmg) {
    const col = dmg >= 50 ? '#ff4444' : dmg >= 20 ? '#ffaa44' : '#ffffff';
    const txt = this.add.text(x, y, `-${dmg}`, {
      fontSize: dmg >= 50 ? '16px' : '13px',
      fontFamily: 'Arial Black', color: col,
      stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(25);
    this.tweens.add({
      targets: txt,
      y: y - 45, alpha: 0,
      duration: 900,
      ease: 'Power2',
      onComplete: () => txt.destroy()
    });
  }

  // ═══════════════════════════════════════════════════
  // ПОБЕДА / ПОРАЖЕНИЕ
  // ═══════════════════════════════════════════════════
  _victory() {
    if (this.victory) return;
    this.victory = true;

    const sys = this.starSystem;
    const [minC, maxC] = Array.isArray(sys.rewards?.credits) ? sys.rewards.credits : [100, 200];
    const [minX, maxX] = Array.isArray(sys.rewards?.xp) ? sys.rewards.xp : [50, 100];
    const cr = Phaser.Math.Between(minC, maxC);
    const xp = Phaser.Math.Between(minX, maxX);

    this.save.credits += cr;
    this.save.experience = (this.save.experience || 0) + xp;
    this.save.statistics.battlesWon++;

    const xpNeeded = this.save.playerLevel * 200;
    if (this.save.experience >= xpNeeded) {
      this.save.playerLevel++;
      this.save.experience -= xpNeeded;
    }
    SaveSystem.save(this.save);
    this._showEndScreen(true, cr, xp);
  }

  _gameOver() {
    if (this.gameOver) return;
    this.gameOver = true;
    this.save.statistics.battlesLost++;
    SaveSystem.save(this.save);

    // Взрыв игрока
    this.particleSystem.explode(this.player.sprite.x, this.player.sprite.y, 0x4488ff, 1.8);
    this.cameras.main.shake(400, 0.018);
    this.player.destroy();

    this.time.delayedCall(800, () => this._showEndScreen(false, 0, 0));
  }

  _retreat() {
    SaveSystem.save(this.save);
    this.scene.start('StarMapScene');
  }

  _showWaveBanner(text, color = '#ccaaff') {
    const W = this.scale.width;
    const banner = this.add.text(W / 2, 80, text, {
      fontSize: '22px', fontFamily: 'Arial Black', color,
      stroke: '#000000', strokeThickness: 5
    }).setOrigin(0.5).setAlpha(0).setDepth(50);

    this.tweens.add({
      targets: banner,
      alpha: { from: 0, to: 1 }, duration: 300,
      yoyo: true, hold: 1400,
      onComplete: () => banner.destroy()
    });
  }

  _showEndScreen(win, credits, xp) {
    const W = this.scale.width, H = this.scale.height;
    this.add.graphics().fillStyle(0x000000, 0.72).fillRect(0, 0, W, H).setDepth(200);

    const titleColor = win ? '#44ff88' : '#ff4444';
    const titleText = win ? '★ ПОБЕДА ★' : '✕ ПОРАЖЕНИЕ';
    this.add.text(W/2, H * 0.25, titleText, {
      fontSize: '34px', fontFamily: 'Arial Black', color: titleColor,
      stroke: '#000000', strokeThickness: 6
    }).setOrigin(0.5).setDepth(201);

    if (win) {
      this.add.text(W/2, H * 0.38, `+ ${credits} 💰   + ${xp} XP   + ${this.score} очков`, {
        fontSize: '16px', fontFamily: 'Arial', color: '#ffffff',
        stroke: '#000000', strokeThickness: 3
      }).setOrigin(0.5).setDepth(201);
    }

    // Кнопки
    const buttons = win
      ? [['КАРТА', () => this.scene.start('StarMapScene')], ['ЕЩЁ РАЗ', () => this.scene.restart()]]
      : [['ЕЩЁ РАЗ', () => this.scene.restart()], ['КАРТА', () => this.scene.start('StarMapScene')]];

    buttons.forEach(([lbl, cb], i) => {
      const bx = W/2 + (i === 0 ? -80 : 80), by = H * 0.55;
      const bW = 130, bH = 44;
      const bg = this.add.graphics().setDepth(201);
      const bCol = win ? 0x1a3a1a : 0x3a1a1a;
      const lCol = win ? 0x44aa44 : 0xaa4444;
      bg.fillStyle(bCol, 0.95).fillRect(bx - bW/2, by - bH/2, bW, bH);
      bg.lineStyle(2, lCol).strokeRect(bx - bW/2, by - bH/2, bW, bH);

      this.add.text(bx, by, lbl, {
        fontSize: '16px', fontFamily: 'Arial Black', color: '#ffffff'
      }).setOrigin(0.5).setDepth(202);
      this.add.zone(bx, by, bW, bH).setInteractive().setDepth(203)
        .on('pointerdown', cb);
    });
  }
}
