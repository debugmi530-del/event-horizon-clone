export class AISystem {
  constructor(scene) {
    this.scene = scene;
    this.enemies = [];
  }

  register(entity) { this.enemies.push(entity); }
  unregister(entity) { this.enemies = this.enemies.filter(e => e !== entity); }

  update(time, delta) {
    const player = this.scene.player;
    if (!player?.sprite?.active) return;

    const px = player.sprite.x, py = player.sprite.y;

    this.enemies.forEach(enemy => {
      if (!enemy.sprite?.active) return;
      const data = enemy.sprite.getData('enemyData');
      const ai = data?.ai || 'aggressive';

      switch (ai) {
        case 'aggressive': this._aggressive(enemy, px, py, time); break;
        case 'swarm':      this._swarm(enemy, px, py, time); break;
        case 'tactical':   this._tactical(enemy, px, py, time); break;
        case 'defensive':  this._defensive(enemy, px, py, time); break;
        case 'boss':       this._boss(enemy, px, py, time, delta); break;
        default:           this._aggressive(enemy, px, py, time);
      }

      // Держим врагов в пределах экрана
      this._clampEnemy(enemy);
    });
  }

  _moveTowards(enemy, tx, ty, speedMult = 1.0) {
    const ex = enemy.sprite.x, ey = enemy.sprite.y;
    const angle = Phaser.Math.Angle.Between(ex, ey, tx, ty);
    const spd = enemy.speed * speedMult;
    enemy.sprite.setVelocity(Math.cos(angle) * spd, Math.sin(angle) * spd);
    // Плавный поворот
    const targetRot = angle + Math.PI / 2;
    enemy.sprite.rotation = Phaser.Math.Angle.RotateTo(enemy.sprite.rotation, targetRot, 0.12);
  }

  _lookAt(enemy, tx, ty) {
    const angle = Phaser.Math.Angle.Between(enemy.sprite.x, enemy.sprite.y, tx, ty);
    const targetRot = angle + Math.PI / 2;
    enemy.sprite.rotation = Phaser.Math.Angle.RotateTo(enemy.sprite.rotation, targetRot, 0.1);
  }

  _aggressive(enemy, px, py, time) {
    const dist = Phaser.Math.Distance.Between(enemy.sprite.x, enemy.sprite.y, px, py);

    if (dist > 90) {
      this._moveTowards(enemy, px, py, 1.0);
    } else {
      // Рядом — немного отходит
      const angle = Phaser.Math.Angle.Between(px, py, enemy.sprite.x, enemy.sprite.y);
      enemy.sprite.setVelocity(Math.cos(angle) * enemy.speed * 0.4, Math.sin(angle) * enemy.speed * 0.4);
      this._lookAt(enemy, px, py);
    }

    if (dist < 420) enemy.tryFire(time, { x: px, y: py });
  }

  _swarm(enemy, px, py, time) {
    // Роение — кружим по орбите
    const ex = enemy.sprite.x, ey = enemy.sprite.y;
    const dist = Phaser.Math.Distance.Between(ex, ey, px, py);
    const orbitR = 100 + (enemy._orbitOffset || 0);
    if (!enemy._orbitOffset) enemy._orbitOffset = Phaser.Math.Between(-30, 30);

    const angleToPlayer = Phaser.Math.Angle.Between(px, py, ex, ey);
    const targetAngle = angleToPlayer + 0.04;
    const tx = px + Math.cos(targetAngle) * orbitR;
    const ty = py + Math.sin(targetAngle) * orbitR;

    this._moveTowards(enemy, tx, ty, 0.9);
    this._lookAt(enemy, px, py);

    if (dist < 320) enemy.tryFire(time, { x: px, y: py });
  }

  _tactical(enemy, px, py, time) {
    const ex = enemy.sprite.x, ey = enemy.sprite.y;
    const dist = Phaser.Math.Distance.Between(ex, ey, px, py);
    const pref = 200;

    if (dist > pref + 50) {
      this._moveTowards(enemy, px, py, 0.8);
    } else if (dist < pref - 50) {
      // Отступает
      const angle = Phaser.Math.Angle.Between(px, py, ex, ey);
      enemy.sprite.setVelocity(Math.cos(angle) * enemy.speed * 0.7, Math.sin(angle) * enemy.speed * 0.7);
    } else {
      // Стрейф
      const perpAngle = Phaser.Math.Angle.Between(ex, ey, px, py) + Math.PI / 2;
      enemy.sprite.setVelocity(Math.cos(perpAngle) * enemy.speed * 0.5, Math.sin(perpAngle) * enemy.speed * 0.5);
    }
    this._lookAt(enemy, px, py);
    if (dist < 400) enemy.tryFire(time, { x: px, y: py });
  }

  _defensive(enemy, px, py, time) {
    const ex = enemy.sprite.x, ey = enemy.sprite.y;
    const dist = Phaser.Math.Distance.Between(ex, ey, px, py);

    if (dist < 140) {
      this._moveTowards(enemy, px + 200, py, 0.7);
    } else {
      enemy.sprite.setVelocity(0, 30);
    }
    this._lookAt(enemy, px, py);
    if (dist < 380) enemy.tryFire(time, { x: px, y: py });
  }

  _boss(enemy, px, py, time, delta) {
    const ex = enemy.sprite.x, ey = enemy.sprite.y;
    const dist = Phaser.Math.Distance.Between(ex, ey, px, py);
    const W = this.scene.scale.width;

    // Плавный вход
    if (ey < 110) {
      enemy.sprite.setVelocity(0, enemy.speed * 0.6);
    } else if (dist > 280) {
      this._moveTowards(enemy, px, py, 0.45);
    } else {
      // Боевой паттерн — синусоидальное движение
      const t = time * 0.0008;
      const sweepX = px + Math.sin(t * 1.2) * 140;
      const sweepY = Math.min(Math.max(py - 180, 80), 300);
      this._moveTowards(enemy, sweepX, sweepY, 0.55);
    }

    this._lookAt(enemy, px, py);
    enemy.tryFire(time, { x: px, y: py });

    // Фаза 2 — ниже 50% HP атакует агрессивней
    if (enemy.hp < enemy.maxHp * 0.5 && dist > 100) {
      this._moveTowards(enemy, px, py, 0.75);
    }
  }

  _clampEnemy(enemy) {
    const W = this.scene.scale.width, H = this.scene.scale.height;
    const pad = 15;
    const spr = enemy.sprite;
    if (spr.x < -60 || spr.x > W + 60 || spr.y > H + 60) {
      spr.x = Phaser.Math.Clamp(spr.x, pad, W - pad);
      spr.y = Phaser.Math.Clamp(spr.y, -40, H - 100);
    }
  }
}
