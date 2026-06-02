import { getWeaponById } from '../data/weapons';

export class ShipEntity {
  constructor(scene, config) {
    this.scene = scene;
    this.isPlayer = config.isPlayer;
    this.bulletGroup = config.bulletGroup;

    const data = config.isPlayer ? config.shipData : null;
    const eData = config.enemyData;

    // Параметры корабля
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
      this.weapons = config.weapons || [];
    } else if (eData) {
      this.hp = eData.hp;
      this.maxHp = eData.hp;
      this.shield = eData.shield || 0;
      this.maxShield = eData.shield || 0;
      this.speed = eData.speed;
      this.energy = 999;
      this.maxEnergy = 999;
      this.energyRegen = 0;
      this.color = eData.color || 0xff4444;
      this.weapons = eData.weapons?.map(id => getWeaponById(id)).filter(Boolean) || [];
    }

    this.fireCooldowns = {};
    this.shieldRechargeTimer = 0;

    // Создаём спрайт как геометрию
    this.sprite = this._createShapeSprite(scene, config.x, config.y, config.isPlayer, config.enemyData);
    this.sprite.setData('entity', this);
  }

  _createShapeSprite(scene, x, y, isPlayer, eData) {
    // Рисуем корабль на текстуре
    const key = isPlayer ? 'player_ship' : `enemy_${eData?.id || 'default'}`;

    if (!scene.textures.exists(key)) {
      const g = scene.make.graphics({ x: 0, y: 0, add: false });
      const col = isPlayer ? 0x4488ff : (eData?.color || 0xff4444);
      const scale = eData?.scale || 1.0;
      const s = Math.round(28 * scale);

      // Корпус
      g.fillStyle(col, 1.0);
      g.fillTriangle(s/2, 0, 0, s, s, s);
      // Кабина
      g.fillStyle(0xffffff, 0.5);
      g.fillTriangle(s/2, s*0.1, s*0.3, s*0.5, s*0.7, s*0.5);
      // Двигатель
      g.fillStyle(0xff8800, 0.8);
      g.fillRect(s*0.3, s*0.85, s*0.15, s*0.15);
      g.fillRect(s*0.55, s*0.85, s*0.15, s*0.15);

      g.generateTexture(key, s, s);
      g.destroy();
    }

    const spr = scene.physics.add.image(x, y, key);
    spr.setDragX(200).setDragY(200);

    // Щит-эффект
    if (this.maxShield > 0) {
      this.shieldSprite = scene.add.image(x, y, 'fx_shield').setScale(0.6).setAlpha(0);
    }

    // Двигательный след
    this.trailGraphics = scene.add.graphics();

    return spr;
  }

  update(delta) {
    // Регенерация энергии
    if (this.energyRegen > 0) {
      this.energy = Math.min(this.energy + this.energyRegen * delta / 1000, this.maxEnergy);
    }

    // Регенерация щита
    if (this.maxShield > 0 && this.shield < this.maxShield) {
      this.shieldRechargeTimer -= delta;
      if (this.shieldRechargeTimer <= 0) {
        this.shield = Math.min(this.shield + 5 * delta / 1000, this.maxShield);
      }
    }

    // Обновляем позицию щита и следа
    if (this.shieldSprite) {
      this.shieldSprite.setPosition(this.sprite.x, this.sprite.y);
      this.shieldSprite.setAlpha(this.shield > 0 ? 0.4 : 0);
    }

    // Движение
    if (!this.sprite.active) return;
  }

  tryFire(time, target) {
    for (let i = 0; i < this.weapons.length; i++) {
      const w = this.weapons[i];
      if (!w) continue;
      const cd = this.fireCooldowns[w.id] || 0;
      if (time < cd) continue;
      if (this.energy < w.energyCost) continue;

      this.energy -= w.energyCost;
      this.fireCooldowns[w.id] = time + 1000 / w.fireRate;

      this._spawnBullet(w, target, i);
    }
  }

  _spawnBullet(weapon, target, weaponIndex) {
    const spr = this.sprite;
    const angle = Phaser.Math.Angle.Between(spr.x, spr.y, target.x, target.y);
    const offsetX = Math.cos(angle) * 20;
    const offsetY = Math.sin(angle) * 20;

    const spread = weapon.spread ? Phaser.Math.FloatBetween(-0.15, 0.15) : 0;
    const finalAngle = angle + spread;

    // Спред для дробовика
    const count = weapon.spread ? weapon.spread : 1;
    for (let i = 0; i < count; i++) {
      const spreadAngle = weapon.spread ? finalAngle + Phaser.Math.FloatBetween(-0.3, 0.3) : finalAngle;
      const bx = spr.x + offsetX, by = spr.y + offsetY;

      let bullet;
      if (this.scene.textures.exists(weapon.bulletKey)) {
        bullet = this.bulletGroup.create(bx, by, weapon.bulletKey);
        bullet.setScale(weapon.bulletScale || 0.5);
      } else {
        // Fallback: цветной кружок
        const bKey = `bullet_fallback_${weapon.id}`;
        if (!this.scene.textures.exists(bKey)) {
          const bg = this.scene.make.graphics({ add: false });
          bg.fillStyle(weapon.color || 0xffffff).fillCircle(4, 4, 4);
          bg.generateTexture(bKey, 8, 8); bg.destroy();
        }
        bullet = this.bulletGroup.create(bx, by, bKey);
      }

      if (!bullet) continue;
      bullet.setData('weapon', weapon);
      bullet.setData('shooter', this);
      bullet.setVelocity(Math.cos(spreadAngle) * weapon.bulletSpeed, Math.sin(spreadAngle) * weapon.bulletSpeed);
      bullet.setRotation(spreadAngle + Math.PI / 2);

      // Самонаведение
      if (weapon.homing && !this.isPlayer) {
        this.scene.time.addEvent({ delay: 100, repeat: 10, callback: () => {
          if (!bullet.active) return;
          const px = this.scene.player?.sprite?.x, py = this.scene.player?.sprite?.y;
          if (px == null) return;
          const a = Phaser.Math.Angle.Between(bullet.x, bullet.y, px, py);
          const spd = weapon.bulletSpeed;
          bullet.setVelocity(Math.cos(a) * spd, Math.sin(a) * spd);
        }});
      }

      // Уничтожаем снаряд через время
      this.scene.time.delayedCall(weapon.range / weapon.bulletSpeed * 1000 + 200, () => {
        if (bullet.active) bullet.destroy();
      });
    }
  }

  takeDamage(dmg) {
    // Сначала щит принимает урон
    if (this.shield > 0) {
      const absorbed = Math.min(this.shield, dmg);
      this.shield -= absorbed;
      dmg -= absorbed;
      this.shieldRechargeTimer = 3000; // 3 секунды до перезарядки
      if (this.shieldSprite) {
        this.scene.tweens.add({ targets: this.shieldSprite, alpha: { from: 0.8, to: 0 }, duration: 300 });
      }
    }
    if (dmg > 0) {
      this.hp -= dmg;
      // Мигание при уроне
      this.scene.tweens.add({ targets: this.sprite, alpha: { from: 0.3, to: 1 }, duration: 200 });
    }
  }

  destroy() {
    if (this.shieldSprite) this.shieldSprite.destroy();
    if (this.trailGraphics) this.trailGraphics.destroy();
    if (this.sprite?.active) this.sprite.destroy();
  }
}
