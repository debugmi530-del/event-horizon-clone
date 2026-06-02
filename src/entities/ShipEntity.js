import { getWeaponById } from '../data/weapons';
import { ShipRenderer } from '../utils/ShipRenderer';
import { EngineTrail } from '../systems/EngineTrail';

export class ShipEntity {
  constructor(scene, config) {
    this.scene = scene;
    this.isPlayer = config.isPlayer;
    this.bulletGroup = config.bulletGroup;

    const data = config.isPlayer ? config.shipData : null;
    const eData = config.enemyData;

    if (this.isPlayer && data) {
      this.hp = data.baseHp;
      this.maxHp = data.baseHp;
      this.shield = data.baseShield;
      this.maxShield = data.baseShield;
      this.speed = data.baseSpeed;
      this.energy = data.baseEnergy;
      this.maxEnergy = data.baseEnergy;
      this.energyRegen = data.energyRegen;
      this.color = data.color;
      this.faction = data.faction;
      this.tier = data.tier;
      this.weapons = config.weapons || [];
      this.shipData = data;
    } else if (eData) {
      this.hp = eData.hp;
      this.maxHp = eData.hp;
      this.shield = eData.shield || 0;
      this.maxShield = eData.shield || 0;
      this.speed = eData.speed;
      this.energy = 9999;
      this.maxEnergy = 9999;
      this.energyRegen = 0;
      this.color = eData.color || 0xff4444;
      this.enemyData = eData;
      this.weapons = eData.weapons?.map(id => getWeaponById(id)).filter(Boolean) || [];
    }

    this.fireCooldowns = {};
    this.shieldRechargeTimer = 0;
    this.isInvincible = false;
    this.damageFlashTimer = 0;
    this._currentSpeed = 0;

    this.sprite = this._createSprite(scene, config.x, config.y, eData);
    this.sprite.setData('entity', this);

    // Щит-пузырь
    this._createShieldBubble(scene);

    // Двигательный шлейф
    this._createEngineTrail(scene, eData);

    // HP-бар над врагом
    if (!this.isPlayer) {
      this._createEnemyBar(scene);
    }
  }

  _createSprite(scene, x, y, eData) {
    const faction = eData ? ShipRenderer.getEnemyFaction(eData.id) : this.faction;
    const key = this.isPlayer
      ? `ship_player_f${this.faction}_t${this.tier}`
      : `ship_enemy_${eData.id}`;

    ShipRenderer.createTexture(scene, key, {
      faction,
      tier: this.isPlayer ? this.tier : (eData?.tier || 1),
      isPlayer: this.isPlayer,
      color: this.color,
      scale: eData?.scale || 1.0
    });

    const spr = scene.physics.add.image(x, y, key);
    spr.setDragX(180).setDragY(180);
    spr.setMaxVelocity(this.speed * 1.2, this.speed * 1.2);
    spr.setDepth(10);
    return spr;
  }

  _createShieldBubble(scene) {
    if (this.maxShield <= 0) return;
    const sz = (this.sprite.width + this.sprite.height) * 0.62;
    this.shieldBubble = scene.add.graphics().setDepth(9);
    this.shieldAlpha = 0;
  }

  _createEngineTrail(scene, eData) {
    const scale = eData?.scale || 1.0;
    const h = this.sprite.height;
    const trailColor = this.isPlayer ? 0x4488ff : (eData?.color || 0xff4444);
    const offsets = this.isPlayer
      ? [{ x: -6, y: h * 0.45 }, { x: 6, y: h * 0.45 }]
      : [{ x: 0, y: h * 0.4 }];

    this.trail = new EngineTrail(scene, {
      color: trailColor,
      maxLen: this.isPlayer ? 22 : 14,
      offsets
    });
  }

  _createEnemyBar(scene) {
    this.hpBarGfx = scene.add.graphics().setDepth(20);
  }

  update(delta, targetX, targetY) {
    if (!this.sprite.active) return;

    // Регенерация энергии
    if (this.energyRegen > 0) {
      this.energy = Math.min(this.energy + this.energyRegen * delta / 1000, this.maxEnergy);
    }

    // Регенерация щита
    if (this.maxShield > 0 && this.shield < this.maxShield) {
      this.shieldRechargeTimer -= delta;
      if (this.shieldRechargeTimer <= 0) {
        this.shield = Math.min(this.shield + 8 * delta / 1000, this.maxShield);
      }
    }

    // Угол для трейла
    const vx = this.sprite.body?.velocity?.x || 0;
    const vy = this.sprite.body?.velocity?.y || 0;
    this._currentSpeed = Math.sqrt(vx * vx + vy * vy);
    const angle = this.sprite.rotation - Math.PI / 2;

    this.trail.update(this.sprite.x, this.sprite.y, angle, this._currentSpeed);

    // Щит-пузырь
    this._updateShieldBubble();

    // HP-бар врага
    if (this.hpBarGfx) this._drawEnemyBar();

    // Мигание при уроне
    if (this.damageFlashTimer > 0) {
      this.damageFlashTimer -= delta;
      if (this.damageFlashTimer <= 0) this.sprite.setTint(0xffffff);
    }
  }

  _updateShieldBubble() {
    if (!this.shieldBubble) return;
    if (this.shieldAlpha > 0) {
      this.shieldAlpha = Math.max(0, this.shieldAlpha - 0.04);
    }
    this.shieldBubble.clear();
    if (this.shieldAlpha < 0.01) return;

    const r = (this.sprite.width + this.sprite.height) * 0.34;
    const pct = this.shield / Math.max(this.maxShield, 1);
    const col = pct > 0.5 ? 0x4488ff : pct > 0.2 ? 0xaaff44 : 0xff4444;

    this.shieldBubble.setPosition(this.sprite.x - r, this.sprite.y - r);
    this.shieldBubble.lineStyle(2, col, this.shieldAlpha * 0.9);
    this.shieldBubble.strokeCircle(r, r, r);
    this.shieldBubble.lineStyle(4, col, this.shieldAlpha * 0.3);
    this.shieldBubble.strokeCircle(r, r, r * 1.06);
  }

  _drawEnemyBar() {
    if (!this.sprite.active) return;
    const x = this.sprite.x - 18, y = this.sprite.y - this.sprite.height * 0.6 - 8;
    const w = 36, h = 4;
    const pct = Math.max(0, this.hp / this.maxHp);
    const col = pct > 0.6 ? 0x44ff44 : pct > 0.3 ? 0xffff44 : 0xff4444;

    this.hpBarGfx.clear();
    this.hpBarGfx.fillStyle(0x000000, 0.6).fillRect(x, y, w, h);
    this.hpBarGfx.fillStyle(col, 1).fillRect(x, y, w * pct, h);

    if (this.maxShield > 0) {
      const sp = Math.max(0, this.shield / this.maxShield);
      this.hpBarGfx.fillStyle(0x000000, 0.5).fillRect(x, y - 5, w, 3);
      this.hpBarGfx.fillStyle(0x4488ff, 1).fillRect(x, y - 5, w * sp, 3);
    }
  }

  tryFire(time, target) {
    for (let i = 0; i < this.weapons.length; i++) {
      const w = this.weapons[i];
      if (!w) continue;
      const cd = this.fireCooldowns[w.id] || 0;
      if (time < cd) continue;
      if (this.energy < (w.energyCost || 0)) continue;

      this.energy -= w.energyCost || 0;
      this.fireCooldowns[w.id] = time + 1000 / w.fireRate;
      this._spawnBullets(w, target, i);
    }
  }

  _spawnBullets(weapon, target, weaponIndex) {
    const spr = this.sprite;
    const angle = Phaser.Math.Angle.Between(spr.x, spr.y, target.x, target.y);

    // Точки выхода снарядов — чередуем для нескольких орудий
    const count = weapon.spread ? weapon.spread : 1;
    const offsets = weaponIndex % 2 === 0
      ? [{ x: -6, y: -10 }, { x: 6, y: -10 }]
      : [{ x: 0, y: -12 }];

    for (let i = 0; i < count; i++) {
      const spreadAngle = angle + (weapon.spread ? Phaser.Math.FloatBetween(-0.28, 0.28) : 0);
      const off = offsets[i % offsets.length];

      // Вращаем смещение по повороту корабля
      const rot = spr.rotation;
      const cos = Math.cos(rot), sin = Math.sin(rot);
      const ox = off.x * cos - off.y * sin;
      const oy = off.x * sin + off.y * cos;

      const bx = spr.x + ox;
      const by = spr.y + oy;

      let bullet = this.bulletGroup.create(bx, by, this._getBulletKey(weapon));
      if (!bullet) continue;

      bullet.setScale(weapon.bulletScale || 0.5);
      bullet.setDepth(8);
      bullet.setData('weapon', weapon);
      bullet.setData('shooter', this);
      bullet.setData('angle', spreadAngle);
      bullet.setVelocity(
        Math.cos(spreadAngle) * weapon.bulletSpeed,
        Math.sin(spreadAngle) * weapon.bulletSpeed
      );
      bullet.setRotation(spreadAngle + Math.PI / 2);

      // Тинт пули под цвет оружия
      if (weapon.color) bullet.setTint(weapon.color);

      // Самонаведение
      if (weapon.homing && this.scene.player) {
        this.scene.time.addEvent({ delay: 80, repeat: 15, callback: () => {
          if (!bullet?.active) return;
          const tgt = this.isPlayer ? null : this.scene.player?.sprite;
          if (!tgt?.active) return;
          const a = Phaser.Math.Angle.Between(bullet.x, bullet.y, tgt.x, tgt.y);
          const cr = Math.atan2(bullet.body.velocity.y, bullet.body.velocity.x);
          const da = Phaser.Math.Angle.Wrap(a - cr);
          const turn = Phaser.Math.Clamp(da, -0.12, 0.12);
          const na = cr + turn;
          bullet.setVelocity(Math.cos(na) * weapon.bulletSpeed, Math.sin(na) * weapon.bulletSpeed);
          bullet.setRotation(na + Math.PI / 2);
        }});
      }

      // Уничтожаем по дальности
      const lifetime = (weapon.range / weapon.bulletSpeed) * 1000 + 150;
      this.scene.time.delayedCall(lifetime, () => { if (bullet?.active) bullet.destroy(); });
    }
  }

  _getBulletKey(weapon) {
    if (this.scene.textures.exists(weapon.bulletKey)) return weapon.bulletKey;
    const fbKey = `fb_${weapon.id}`;
    if (!this.scene.textures.exists(fbKey)) {
      const g = this.scene.make.graphics({ add: false });
      const col = weapon.color || 0xffffff;
      g.fillStyle(col, 1).fillCircle(4, 8, 3);
      g.fillStyle(0xffffff, 0.6).fillCircle(4, 4, 2);
      g.generateTexture(fbKey, 8, 14);
      g.destroy();
    }
    return fbKey;
  }

  takeDamage(dmg, hitX, hitY) {
    if (this.isInvincible) return;

    // Щит поглощает первым
    if (this.shield > 0) {
      const absorbed = Math.min(this.shield, dmg);
      this.shield -= absorbed;
      dmg -= absorbed;
      this.shieldRechargeTimer = 3500;
      this.shieldAlpha = 1.0;

      if (this.shieldBubble) {
        // Вспышка щита
        this.scene.tweens.add({
          targets: this, shieldAlpha: { from: 1, to: 0 },
          duration: 600, ease: 'Power2'
        });
      }
    }

    if (dmg > 0) {
      this.hp -= dmg;
      // Красная вспышка
      this.sprite.setTint(0xff4444);
      this.damageFlashTimer = 160;

      // Числа урона
      if (this.scene._showDamageNumber) {
        this.scene._showDamageNumber(hitX || this.sprite.x, hitY || this.sprite.y, Math.round(dmg));
      }
    }
  }

  destroy() {
    if (this.trail) this.trail.destroy();
    if (this.shieldBubble) this.shieldBubble.destroy();
    if (this.hpBarGfx) this.hpBarGfx.destroy();
    if (this.sprite?.active) this.sprite.destroy();
  }
}
