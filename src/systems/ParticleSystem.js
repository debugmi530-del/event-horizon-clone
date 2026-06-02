export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
  }

  // Взрыв — осколки + дым + вспышка
  explode(x, y, color = 0xff4400, size = 1.0) {
    const count = Math.round(12 * size);
    const g = this.scene.add.graphics().setDepth(15);
    const particles = [];

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Phaser.Math.FloatBetween(-0.3, 0.3);
      const spd = Phaser.Math.Between(50, 160) * size;
      const r = Phaser.Math.Between(2, 5) * size;
      particles.push({
        x, y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        r,
        life: 1.0,
        decay: 0.025 + Math.random() * 0.02,
        col: Math.random() > 0.4 ? color : 0xffaa44
      });
    }

    // Дым
    const smoke = [];
    for (let i = 0; i < Math.round(5 * size); i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = Phaser.Math.Between(15, 45) * size;
      smoke.push({
        x: x + Phaser.Math.Between(-8, 8),
        y: y + Phaser.Math.Between(-8, 8),
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - 20,
        r: 6 + Math.random() * 10 * size,
        life: 1.0,
        decay: 0.015 + Math.random() * 0.01
      });
    }

    let elapsed = 0;
    const maxTime = 1200;
    this.scene.time.addEvent({ delay: 16, repeat: Math.round(maxTime / 16), callback: () => {
      elapsed += 16;
      g.clear();

      // Дым
      smoke.forEach(p => {
        p.x += p.vx * 0.016; p.y += p.vy * 0.016;
        p.vx *= 0.96; p.vy *= 0.96;
        p.r *= 1.015;
        p.life = Math.max(0, p.life - p.decay);
        if (p.life > 0) {
          g.fillStyle(0x333333, p.life * 0.35).fillCircle(p.x, p.y, p.r);
        }
      });

      // Осколки
      particles.forEach(p => {
        p.x += p.vx * 0.016; p.y += p.vy * 0.016;
        p.vx *= 0.94; p.vy *= 0.94;
        p.life = Math.max(0, p.life - p.decay);
        if (p.life > 0) {
          g.fillStyle(p.col, p.life).fillCircle(p.x, p.y, p.r * p.life);
          if (p.life > 0.5) {
            g.fillStyle(0xffffff, (p.life - 0.5) * 0.6).fillCircle(p.x, p.y, p.r * 0.4);
          }
        }
      });

      if (elapsed >= maxTime) g.destroy();
    }});

    // Вспышка
    const flash = this.scene.add.graphics().setDepth(16);
    const flashR = 28 * size;
    flash.fillStyle(0xffffff, 0.85).fillCircle(x, y, flashR);
    this.scene.tweens.add({
      targets: flash, alpha: 0, scaleX: 2.5 * size, scaleY: 2.5 * size,
      duration: 250, ease: 'Power2',
      onComplete: () => flash.destroy()
    });

    // Огненное кольцо
    const ring = this.scene.add.graphics().setDepth(14);
    ring.lineStyle(3 * size, color, 0.9).strokeCircle(x, y, flashR * 0.5);
    this.scene.tweens.add({
      targets: ring, alpha: 0, scaleX: 3 * size, scaleY: 3 * size,
      duration: 400, ease: 'Power1',
      onComplete: () => ring.destroy()
    });
  }

  // Попадание снаряда — брызги
  hitEffect(x, y, color = 0xffffff, isShield = false) {
    const g = this.scene.add.graphics().setDepth(12);
    const col = isShield ? 0x4488ff : color;
    const count = isShield ? 4 : 6;

    const particles = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = Phaser.Math.Between(60, 160);
      particles.push({ x, y, vx: Math.cos(angle)*spd, vy: Math.sin(angle)*spd, life: 1, r: Phaser.Math.Between(1,3) });
    }

    let t = 0;
    this.scene.time.addEvent({ delay: 16, repeat: 12, callback: () => {
      t += 16;
      g.clear();
      particles.forEach(p => {
        p.x += p.vx * 0.016; p.y += p.vy * 0.016;
        p.life -= 0.08;
        if (p.life > 0) g.fillStyle(col, p.life).fillCircle(p.x, p.y, p.r);
      });
      if (t >= 200) g.destroy();
    }});

    // Мини-вспышка
    const flash = this.scene.add.graphics().setDepth(13);
    flash.fillStyle(col, isShield ? 0.5 : 0.7).fillCircle(x, y, isShield ? 10 : 7);
    this.scene.tweens.add({
      targets: flash, alpha: 0, scaleX: isShield ? 2.5 : 1.8, scaleY: isShield ? 2.5 : 1.8,
      duration: 180,
      onComplete: () => flash.destroy()
    });
  }

  // Аптечка / лечение
  healEffect(x, y) {
    const g = this.scene.add.graphics().setDepth(12);
    g.fillStyle(0x44ff44, 0.8).fillCircle(x, y, 12);
    this.scene.tweens.add({
      targets: g, alpha: 0, scaleX: 2.2, scaleY: 2.2,
      duration: 500, onComplete: () => g.destroy()
    });
    const txt = this.scene.add.text(x, y - 8, '+HP', {
      fontSize: '14px', fontFamily: 'Arial Black', color: '#44ff44',
      stroke: '#000000', strokeThickness: 3
    }).setOrigin(0.5).setDepth(20);
    this.scene.tweens.add({ targets: txt, y: y - 40, alpha: 0, duration: 900, onComplete: () => txt.destroy() });
  }

  // Трейл снаряда (ракеты)
  missileTrail(x, y, color = 0xffaa44) {
    const g = this.scene.add.graphics().setDepth(7);
    g.fillStyle(color, 0.6).fillCircle(x, y, 2);
    this.scene.tweens.add({
      targets: g, alpha: 0, scaleX: 1.5, scaleY: 1.5,
      duration: 200, onComplete: () => g.destroy()
    });
  }
}
