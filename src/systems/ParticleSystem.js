export class ParticleSystem {
  constructor(scene) { this.scene = scene; }

  explode(x, y, color = 0xff4400) {
    const g = this.scene.add.graphics();
    const particles = [];
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const spd = Phaser.Math.Between(40, 120);
      particles.push({ x, y, vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd, r: Phaser.Math.Between(2, 5), life: 1 });
    }

    let elapsed = 0;
    this.scene.time.addEvent({ delay: 16, repeat: 30, callback: () => {
      elapsed += 16;
      g.clear();
      particles.forEach(p => {
        p.x += p.vx * 0.016; p.y += p.vy * 0.016;
        p.vx *= 0.92; p.vy *= 0.92;
        p.life = Math.max(0, p.life - 0.033);
        g.fillStyle(color, p.life).fillCircle(p.x, p.y, p.r * p.life);
      });
      if (elapsed >= 500) g.destroy();
    }});

    // Flash
    const flash = this.scene.add.graphics().fillStyle(0xffffff, 0.6).fillCircle(x, y, 20);
    this.scene.tweens.add({ targets: flash, alpha: 0, scaleX: 3, scaleY: 3, duration: 200, onComplete: () => flash.destroy() });
  }

  hitEffect(x, y, color = 0xffffff) {
    const g = this.scene.add.graphics().fillStyle(color, 0.8).fillCircle(x, y, 4);
    this.scene.tweens.add({ targets: g, alpha: 0, scaleX: 2, scaleY: 2, duration: 150, onComplete: () => g.destroy() });
  }

  healEffect(x, y) {
    const g = this.scene.add.graphics().fillStyle(0x44ff44, 0.7).fillCircle(x, y, 10);
    this.scene.tweens.add({ targets: g, alpha: 0, scaleX: 2.5, scaleY: 2.5, duration: 400, onComplete: () => g.destroy() });
    const txt = this.scene.add.text(x, y - 10, '+HP', { fontSize: '12px', color: '#44ff44', stroke: '#000', strokeThickness: 2 }).setOrigin(0.5);
    this.scene.tweens.add({ targets: txt, y: y - 40, alpha: 0, duration: 800, onComplete: () => txt.destroy() });
  }
}
