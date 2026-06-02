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

    this.enemies.forEach(enemy => {
      if (!enemy.sprite?.active) return;
      const data = enemy.sprite.getData('enemyData');
      const ai = data?.ai || 'aggressive';

      switch (ai) {
        case 'aggressive': this._aggressiveAI(enemy, player, time, delta); break;
        case 'swarm':      this._swarmAI(enemy, player, time, delta); break;
        case 'tactical':   this._tacticalAI(enemy, player, time, delta); break;
        case 'defensive':  this._defensiveAI(enemy, player, time, delta); break;
        case 'boss':       this._bossAI(enemy, player, time, delta); break;
        default:           this._aggressiveAI(enemy, player, time, delta);
      }
    });
  }

  _aggressiveAI(enemy, player, time, delta) {
    const px = player.sprite.x, py = player.sprite.y;
    const ex = enemy.sprite.x, ey = enemy.sprite.y;
    const dist = Phaser.Math.Distance.Between(ex, ey, px, py);
    const spd = enemy.speed;

    // Двигаемся к игроку
    if (dist > 80) {
      const angle = Phaser.Math.Angle.Between(ex, ey, px, py);
      enemy.sprite.setVelocity(Math.cos(angle) * spd, Math.sin(angle) * spd);
      enemy.sprite.rotation = angle + Math.PI / 2;
    } else {
      enemy.sprite.setVelocity(0, 0);
    }

    // Стреляем
    if (dist < 400) {
      enemy.tryFire(time, { x: px, y: py });
    }
  }

  _swarmAI(enemy, player, time, delta) {
    const px = player.sprite.x, py = player.sprite.y;
    const ex = enemy.sprite.x, ey = enemy.sprite.y;
    const dist = Phaser.Math.Distance.Between(ex, ey, px, py);
    const spd = enemy.speed;

    // Роение — кружим вокруг
    const orbitRadius = 120;
    const angle = Phaser.Math.Angle.Between(px, py, ex, ey);
    const targetAngle = angle + 0.03;
    const tx = px + Math.cos(targetAngle) * orbitRadius;
    const ty = py + Math.sin(targetAngle) * orbitRadius;

    const moveAngle = Phaser.Math.Angle.Between(ex, ey, tx, ty);
    enemy.sprite.setVelocity(Math.cos(moveAngle) * spd, Math.sin(moveAngle) * spd);
    enemy.sprite.rotation = Phaser.Math.Angle.Between(ex, ey, px, py) + Math.PI / 2;

    if (dist < 300) enemy.tryFire(time, { x: px, y: py });
  }

  _tacticalAI(enemy, player, time, delta) {
    const px = player.sprite.x, py = player.sprite.y;
    const ex = enemy.sprite.x, ey = enemy.sprite.y;
    const dist = Phaser.Math.Distance.Between(ex, ey, px, py);
    const spd = enemy.speed;

    const preferDist = 200;
    if (dist > preferDist + 40) {
      const a = Phaser.Math.Angle.Between(ex, ey, px, py);
      enemy.sprite.setVelocity(Math.cos(a) * spd, Math.sin(a) * spd);
    } else if (dist < preferDist - 40) {
      const a = Phaser.Math.Angle.Between(px, py, ex, ey);
      enemy.sprite.setVelocity(Math.cos(a) * spd * 0.7, Math.sin(a) * spd * 0.7);
    } else {
      // Стрейф
      const a = Phaser.Math.Angle.Between(ex, ey, px, py) + Math.PI / 2;
      enemy.sprite.setVelocity(Math.cos(a) * spd * 0.5, Math.sin(a) * spd * 0.5);
    }

    enemy.sprite.rotation = Phaser.Math.Angle.Between(ex, ey, px, py) + Math.PI / 2;
    if (dist < 380) enemy.tryFire(time, { x: px, y: py });
  }

  _defensiveAI(enemy, player, time, delta) {
    const px = player.sprite.x, py = player.sprite.y;
    const ex = enemy.sprite.x, ey = enemy.sprite.y;
    const dist = Phaser.Math.Distance.Between(ex, ey, px, py);
    const spd = enemy.speed;

    if (dist < 150) {
      const a = Phaser.Math.Angle.Between(px, py, ex, ey);
      enemy.sprite.setVelocity(Math.cos(a) * spd, Math.sin(a) * spd);
    } else {
      enemy.sprite.setVelocity(0, 20);
    }
    enemy.sprite.rotation = Phaser.Math.Angle.Between(ex, ey, px, py) + Math.PI / 2;
    if (dist < 350) enemy.tryFire(time, { x: px, y: py });
  }

  _bossAI(enemy, player, time, delta) {
    const px = player.sprite.x, py = player.sprite.y;
    const ex = enemy.sprite.x, ey = enemy.sprite.y;
    const dist = Phaser.Math.Distance.Between(ex, ey, px, py);
    const spd = enemy.speed;

    // Входной маневр
    if (ey < 100) {
      enemy.sprite.setVelocity(0, spd);
    } else if (dist > 260) {
      const a = Phaser.Math.Angle.Between(ex, ey, px, py);
      enemy.sprite.setVelocity(Math.cos(a) * spd * 0.5, Math.sin(a) * spd * 0.5);
    } else {
      // Медленно ходит из стороны в сторону
      const t = this.scene.time.now * 0.001;
      enemy.sprite.setVelocity(Math.cos(t) * spd * 0.7, Math.sin(t * 0.5) * spd * 0.3);
    }

    enemy.sprite.rotation = Phaser.Math.Angle.Between(ex, ey, px, py) + Math.PI / 2;

    // Все оружия стреляют
    enemy.tryFire(time, { x: px, y: py });

    // HP босса на экране
    if (this.scene.bossHPBar && this.scene.bossEntity === enemy) {
      const W = this.scene.scale.width;
      const pct = enemy.hp / enemy.maxHp;
      this.scene.bossHPBar.clear()
        .fillStyle(0x330000).fillRect(10, this.scene.scale.height - 18, W - 20, 10)
        .fillStyle(0xff2200).fillRect(10, this.scene.scale.height - 18, (W - 20) * pct, 10)
        .lineStyle(1, 0xff4444).strokeRect(10, this.scene.scale.height - 18, W - 20, 10);
    }
  }
}
