// Двигательный шлейф — как в оригинале
export class EngineTrail {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.color = options.color || 0x4488ff;
    this.maxLen = options.maxLen || 18;
    this.points = [];
    this.graphics = scene.add.graphics().setDepth(2);
    this.offsets = options.offsets || [{ x: 0, y: 12 }]; // точки выхода двигателей
  }

  update(x, y, angle, speed) {
    // Добавляем новые точки для каждого двигателя
    for (const off of this.offsets) {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const ex = x + cos * off.y - sin * off.x;
      const ey = y + sin * off.y + cos * off.x;
      this.points.push({ x: ex, y: ey, age: 0, ex: off });
    }

    // Стареем точки
    this.points = this.points.filter(p => {
      p.age += 1;
      return p.age < this.maxLen;
    });

    this._draw(speed);
  }

  _draw(speed) {
    this.graphics.clear();
    const grouped = {};
    for (const p of this.points) {
      const key = `${p.ex.x}_${p.ex.y}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(p);
    }

    for (const pts of Object.values(grouped)) {
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i];
        const alpha = (1 - b.age / this.maxLen) * 0.8 * Math.min(1, speed / 100);
        const width = Math.max(1, (1 - b.age / this.maxLen) * 4);
        if (alpha < 0.02) continue;
        this.graphics.lineStyle(width, this.color, alpha);
        this.graphics.beginPath();
        this.graphics.moveTo(a.x, a.y);
        this.graphics.lineTo(b.x, b.y);
        this.graphics.strokePath();
      }
    }
  }

  destroy() {
    this.graphics.destroy();
  }
}
