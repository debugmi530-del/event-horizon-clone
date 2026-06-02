import { STAR_SYSTEMS, getSystemById } from '../data/starmap';
import { SHIPS, getShipById } from '../data/ships';
import { WEAPONS, getWeaponById } from '../data/weapons';
import { ENEMIES, getEnemyById, getEnemiesByTier } from '../data/enemies';
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
  }

  create() {
    const W = this.scale.width, H = this.scale.height;
    this.save = SaveSystem.load();
    this.starSystem = getSystemById(this.systemId);

    // Фон
    this.bg = this.add.tileSprite(W/2, H/2, W, H, 'bg_stars').setAlpha(0.9);
    this.bg2 = this.add.tileSprite(W/2, H/2, W, H, 'bg_nebula').setAlpha(0.2);

    // Планета
    const planetKey = this.starSystem.planet || 'planet1';
    this.add.image(W * 0.85, H * 0.15, planetKey).setScale(this.starSystem.planetScale || 1).setAlpha(0.7);

    // Астероиды (случайные)
    this._spawnAsteroids();

    // Группы
    this.playerBullets = this.physics.add.group();
    this.enemyBullets = this.physics.add.group();
    this.enemyGroup = this.physics.add.group();
    this.pickupGroup = this.physics.add.group();

    // Системы
    this.bulletSystem = new BulletSystem(this);
    this.particleSystem = new ParticleSystem(this);
    this.aiSystem = new AISystem(this);

    // Игрок
    this._createPlayer();

    // HUD
    this._createHUD();

    // Коллизии
    this.physics.add.overlap(this.playerBullets, this.enemyGroup, (b, e) => this._onPlayerBulletHitEnemy(b, e));
    this.physics.add.overlap(this.enemyBullets, this.player.sprite, (b, _) => this._onEnemyBulletHitPlayer(b));
    this.physics.add.overlap(this.player.sprite, this.pickupGroup, (_, p) => this._onPickup(p));

    // Управление
    this._setupControls();

    // Первая волна
    this.time.delayedCall(1000, () => this._spawnWave());
  }

  _createPlayer() {
    const W = this.scale.width, H = this.scale.height;
    const fleetSlot = this.save.fleet[0];
    const shipData = getShipById(fleetSlot?.shipId || 'f0s1');
    const weaponData = fleetSlot?.weapons?.map(id => getWeaponById(id)).filter(Boolean) || [getWeaponById('laser_1')];

    this.player = new ShipEntity(this, {
      x: W/2, y: H * 0.8,
      shipData, weapons: weaponData,
      isPlayer: true,
      bulletGroup: this.playerBullets
    });
    this.playerMaxHp = this.player.hp;
    this.playerMaxShield = this.player.shield;
  }

  _createHUD() {
    const W = this.scale.width;
    this.hud = this.add.container(0, 0).setDepth(100);

    // Полоска HP
    this.hpBarBg = this.add.graphics().fillStyle(0x330000).fillRect(10, 10, 160, 10);
    this.hpBar = this.add.graphics();
    this.hpLabel = this.add.text(10, 8, 'HP', { fontSize: '9px', fontFamily: 'Arial', color: '#ff6666' });

    // Полоска щита
    this.shieldBarBg = this.add.graphics().fillStyle(0x001133).fillRect(10, 24, 160, 8);
    this.shieldBar = this.add.graphics();
    this.shieldLabel = this.add.text(10, 22, 'ЩТ', { fontSize: '9px', fontFamily: 'Arial', color: '#4488ff' });

    // Полоска энергии
    this.energyBarBg = this.add.graphics().fillStyle(0x1a1a00).fillRect(10, 36, 120, 6);
    this.energyBar = this.add.graphics();

    // Счёт/волна
    this.waveText = this.add.text(W/2, 14, 'Волна 1', { fontSize: '14px', fontFamily: 'Arial Black', color: '#ffffff', stroke: '#000000', strokeThickness: 3 }).setOrigin(0.5);
    this.scoreText = this.add.text(W - 10, 14, '0', { fontSize: '13px', fontFamily: 'Arial', color: '#ffdd44' }).setOrigin(1, 0.5);
    this.credText = this.add.text(W - 10, 30, `💰 ${this.save.credits}`, { fontSize: '12px', fontFamily: 'Arial', color: '#ffcc44' }).setOrigin(1, 0.5);

    this.score = 0;
    this._updateHUD();
  }

  _updateHUD() {
    const pct = Phaser.Math.Clamp(this.player.hp / this.playerMaxHp, 0, 1);
    const sPct = this.playerMaxShield > 0 ? Phaser.Math.Clamp(this.player.shield / this.playerMaxShield, 0, 1) : 0;
    const ePct = Phaser.Math.Clamp(this.player.energy / this.player.maxEnergy, 0, 1);

    this.hpBar.clear().fillStyle(0xff3333).fillRect(10 + 18, 10, 142 * pct, 10);
    this.shieldBar.clear().fillStyle(0x3388ff).fillRect(10 + 18, 24, 142 * sPct, 8);
    this.energyBar.clear().fillStyle(0xffff44).fillRect(10 + 18, 36, 102 * ePct, 6);
    this.scoreText.setText(this.score);
    this.credText.setText(`💰 ${this.save.credits}`);
  }

  _setupControls() {
    const W = this.scale.width, H = this.scale.height;
    this.moveTarget = { x: W/2, y: H * 0.8 };
    this.isShooting = false;

    // Тач-управление: левая половина — движение, правая — стрельба
    this.input.on('pointermove', (ptr) => {
      if (ptr.isDown) {
        if (ptr.x < W / 2) {
          this.moveTarget = { x: ptr.x, y: ptr.y };
        } else {
          this.isShooting = true;
          this.shootTarget = { x: ptr.x, y: ptr.y };
        }
      }
    });

    this.input.on('pointerup', () => { this.isShooting = false; });
    this.input.on('pointerdown', (ptr) => {
      if (ptr.x >= this.scale.width / 2) {
        this.isShooting = true;
        this.shootTarget = { x: ptr.x, y: ptr.y };
      } else {
        this.moveTarget = { x: ptr.x, y: ptr.y };
      }
    });

    // Клавиатура (для десктопа)
    this.cursors = this.input.keyboard?.createCursorKeys();
    this.wasd = this.input.keyboard?.addKeys({ up: 'W', down: 'S', left: 'A', right: 'D', fire: 'SPACE' });

    // Кнопка ретрит (выход из боя)
    this.add.text(this.scale.width - 10, this.scale.height - 10, '⛳ ОТСТУПИТЬ', {
      fontSize: '13px', fontFamily: 'Arial', color: '#885533',
      backgroundColor: '#0a0a0a', padding: { x: 6, y: 4 }
    }).setOrigin(1, 1).setInteractive().setDepth(101)
      .on('pointerdown', () => this._retreat());
  }

  update(time, delta) {
    if (this.gameOver || this.victory) return;
    this.bg.tilePositionY -= 0.5;
    this.bg2.tilePositionY -= 0.2;

    this._updatePlayerMovement(delta);
    this._updatePlayerShooting(time);
    this.aiSystem.update(time, delta);
    this.bulletSystem.update();
    this.player.update(delta);
    this._updateHUD();
    this._boundaryCheck(this.player.sprite);
  }

  _updatePlayerMovement(delta) {
    const spd = this.player.speed;
    const spr = this.player.sprite;
    let vx = 0, vy = 0;

    if (this.cursors?.left.isDown || this.wasd?.left.isDown) vx = -spd;
    else if (this.cursors?.right.isDown || this.wasd?.right.isDown) vx = spd;
    if (this.cursors?.up.isDown || this.wasd?.up.isDown) vy = -spd;
    else if (this.cursors?.down.isDown || this.wasd?.down.isDown) vy = spd;

    // Тач движение
    const dx = this.moveTarget.x - spr.x;
    const dy = this.moveTarget.y - spr.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist > 8 && !vx && !vy) {
      vx = (dx / dist) * spd;
      vy = (dy / dist) * spd;
    }

    spr.setVelocity(vx, vy);

    // Поворот к цели стрельбы или движению
    if (this.isShooting && this.shootTarget) {
      spr.rotation = Phaser.Math.Angle.Between(spr.x, spr.y, this.shootTarget.x, this.shootTarget.y) + Math.PI / 2;
    } else if (dist > 8) {
      spr.rotation = Phaser.Math.Angle.Between(spr.x, spr.y, this.moveTarget.x, this.moveTarget.y) + Math.PI / 2;
    }
  }

  _updatePlayerShooting(time) {
    const fireKey = this.wasd?.fire.isDown;
    if (this.isShooting || fireKey) {
      this.player.tryFire(time, this.shootTarget || this.moveTarget);
    }
  }

  _spawnWave() {
    this.waveNumber++;
    const maxWaves = this.starSystem.boss ? 3 : 4;
    this.waveText.setText(`Волна ${this.waveNumber}`);

    if (this.waveNumber > maxWaves && !this.starSystem.boss) {
      this._victory();
      return;
    }

    const tier = this.starSystem.enemyTier || 1;
    let count;
    if (this.waveNumber <= maxWaves) {
      const [min, max] = this.starSystem.enemyCount || [2, 4];
      count = Phaser.Math.Between(min, max);
      // Финальная волна — босс
      if (this.waveNumber === maxWaves && this.starSystem.boss) {
        this._spawnBoss();
        return;
      }
    }

    const availableEnemies = getEnemiesByTier(tier);
    this.enemiesLeft = count;

    for (let i = 0; i < count; i++) {
      const enemyData = Phaser.Utils.Array.GetRandom(availableEnemies);
      this.time.delayedCall(i * 600, () => this._spawnEnemy(enemyData));
    }
  }

  _spawnEnemy(enemyData) {
    const W = this.scale.width;
    const x = Phaser.Math.Between(40, W - 40);
    const y = Phaser.Math.Between(-80, -20);
    const enemy = new ShipEntity(this, {
      x, y, shipData: null, enemyData,
      isPlayer: false,
      bulletGroup: this.enemyBullets
    });
    this.enemyGroup.add(enemy.sprite);
    enemy.sprite.setData('entity', enemy);
    enemy.sprite.setData('enemyData', enemyData);
    this.aiSystem.register(enemy);
  }

  _spawnBoss() {
    const bossData = getEnemyById(this.starSystem.boss);
    if (!bossData) { this._victory(); return; }
    const boss = new ShipEntity(this, {
      x: this.scale.width/2, y: -100,
      shipData: null, enemyData: bossData,
      isPlayer: false,
      bulletGroup: this.enemyBullets
    });
    this.enemyGroup.add(boss.sprite);
    boss.sprite.setData('entity', boss);
    boss.sprite.setData('enemyData', bossData);
    this.aiSystem.register(boss);
    this.enemiesLeft = 1;

    // Полоска HP босса
    this.bossHPBar = this.add.graphics();
    this.bossEntity = boss;
    this.waveText.setText(`⚠ БОСС: ${bossData.name}`);
  }

  _onPlayerBulletHitEnemy(bullet, enemySprite) {
    const weapon = bullet.getData('weapon');
    const dmg = weapon ? weapon.damage : 10;
    bullet.destroy();
    this.particleSystem.hitEffect(bullet.x, bullet.y, weapon?.color || 0xffffff);

    const entity = enemySprite.getData('entity');
    if (!entity) return;

    entity.takeDamage(dmg);
    if (entity.hp <= 0) {
      this._onEnemyDead(entity);
    }
  }

  _onEnemyBulletHitPlayer(bullet) {
    const weapon = bullet.getData('weapon');
    const dmg = weapon ? weapon.damage : 8;
    bullet.destroy();
    this.particleSystem.hitEffect(bullet.x, bullet.y, 0xff4444);

    this.player.takeDamage(dmg);
    this.cameras.main.shake(150, 0.005);
    if (this.player.hp <= 0) this._gameOver();
  }

  _onEnemyDead(entity) {
    const data = entity.sprite.getData('enemyData');
    this.aiSystem.unregister(entity);
    this.particleSystem.explode(entity.sprite.x, entity.sprite.y, data?.color || 0xff4444);
    entity.sprite.destroy();

    if (data) {
      this.score += data.xp;
      this.save.credits += data.credits;
      this.save.statistics.enemiesDefeated++;
      // Дроп аптечки
      if (Math.random() < 0.2) this._spawnRepairKit(entity.sprite.x, entity.sprite.y);
    }

    this.enemiesLeft--;
    if (this.enemiesLeft <= 0) {
      this.time.delayedCall(1500, () => this._spawnWave());
    }
  }

  _spawnRepairKit(x, y) {
    const kit = this.physics.add.image(x, y, 'repair_kit').setScale(0.5);
    kit.setVelocity(Phaser.Math.Between(-30, 30), Phaser.Math.Between(20, 60));
    this.pickupGroup.add(kit);
    this.time.delayedCall(8000, () => kit.active && kit.destroy());
  }

  _onPickup(kit) {
    const heal = 30;
    this.player.hp = Math.min(this.player.hp + heal, this.playerMaxHp);
    this.particleSystem.healEffect(this.player.sprite.x, this.player.sprite.y);
    kit.destroy();
  }

  _spawnAsteroids() {
    const W = this.scale.width, H = this.scale.height;
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(30, W - 30);
      const y = Phaser.Math.Between(60, H - 200);
      const s = 0.3 + Math.random() * 0.5;
      this.add.image(x, y, 'asteroid').setScale(s).setAlpha(0.6).setRotation(Math.random() * Math.PI * 2);
    }
  }

  _boundaryCheck(sprite) {
    const W = this.scale.width, H = this.scale.height;
    const pad = 20;
    sprite.x = Phaser.Math.Clamp(sprite.x, pad, W - pad);
    sprite.y = Phaser.Math.Clamp(sprite.y, pad, H - pad);
  }

  _victory() {
    this.victory = true;
    const sys = this.starSystem;
    const [minC, maxC] = Array.isArray(sys.rewards?.credits) ? sys.rewards.credits : [100, 200];
    const [minX, maxX] = Array.isArray(sys.rewards?.xp) ? sys.rewards.xp : [50, 100];
    const credEarned = Phaser.Math.Between(minC, maxC);
    const xpEarned = Phaser.Math.Between(minX, maxX);

    this.save.credits += credEarned;
    this.save.experience = (this.save.experience || 0) + xpEarned;
    this.save.statistics.battlesWon++;

    // Проверка уровня
    const xpNeeded = this.save.playerLevel * 200;
    if (this.save.experience >= xpNeeded) {
      this.save.playerLevel++;
      this.save.experience -= xpNeeded;
    }

    SaveSystem.save(this.save);
    this._showEndScreen(true, credEarned, xpEarned);
  }

  _gameOver() {
    this.gameOver = true;
    this.save.statistics.battlesLost++;
    SaveSystem.save(this.save);
    this._showEndScreen(false, 0, 0);
  }

  _retreat() {
    SaveSystem.save(this.save);
    this.scene.start('StarMapScene');
  }

  _showEndScreen(win, credits, xp) {
    const W = this.scale.width, H = this.scale.height;
    const overlay = this.add.graphics().fillStyle(0x000000, 0.75).fillRect(0, 0, W, H).setDepth(200);

    const title = win ? '🏆 ПОБЕДА!' : '💀 ПОРАЖЕНИЕ';
    const color = win ? '#44ff44' : '#ff4444';

    this.add.text(W/2, H * 0.3, title, { fontSize: '32px', fontFamily: 'Arial Black', color, stroke: '#000000', strokeThickness: 5 }).setOrigin(0.5).setDepth(201);

    if (win) {
      this.add.text(W/2, H * 0.42, `+${credits} 💰   +${xp} XP   +${this.score} очков`, { fontSize: '16px', fontFamily: 'Arial', color: '#ffffff' }).setOrigin(0.5).setDepth(201);
    }

    // Кнопки
    const btnData = win
      ? [['ДАЛЕЕ', () => this.scene.start('StarMapScene')], ['СНОВА', () => this.scene.restart()]]
      : [['СНОВА', () => this.scene.restart()], ['КАРТА', () => this.scene.start('StarMapScene')]];

    btnData.forEach(([lbl, cb], i) => {
      const bx = W/2 + (i === 0 ? -80 : 80), by = H * 0.58;
      const bg = this.add.graphics().fillStyle(0x1a1a3a, 0.95).fillRect(bx - 65, by - 22, 130, 44).setDepth(201);
      bg.lineStyle(2, win ? 0x44aa44 : 0xaa4444).strokeRect(bx - 65, by - 22, 130, 44);
      this.add.text(bx, by, lbl, { fontSize: '15px', fontFamily: 'Arial', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(202);
      this.add.zone(bx, by, 130, 44).setInteractive().setDepth(203).on('pointerdown', cb);
    });
  }
}
