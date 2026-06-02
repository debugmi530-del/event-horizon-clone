// Генерация детальных текстур кораблей — разные формы по фракции и классу
export class ShipRenderer {

  static createTexture(scene, key, options = {}) {
    if (scene.textures.exists(key)) return;

    const {
      faction = 0, tier = 1, isPlayer = false,
      color = 0x4488ff, scale = 1.0, isDamaged = false
    } = options;

    const baseSize = isPlayer ? 44 : Math.round(32 * Math.min(scale, 2.2));
    const W = baseSize, H = baseSize;

    const g = scene.make.graphics({ x: 0, y: 0, add: false });

    if (isPlayer) {
      ShipRenderer._drawPlayerShip(g, W, H, color, faction, tier);
    } else {
      ShipRenderer._drawEnemyShip(g, W, H, color, faction, tier, scale);
    }

    g.generateTexture(key, W, H);
    g.destroy();
  }

  static _drawPlayerShip(g, W, H, color, faction, tier) {
    const cx = W / 2, cy = H / 2;
    const r = g => Math.round(g);

    if (faction === 0 || faction === 1) {
      // Стандартный истребитель / корвет
      // Крылья
      g.fillStyle(ShipRenderer._darken(color, 0.6), 1);
      g.fillTriangle(r(cx), r(cy - H*0.35), r(cx - W*0.45), r(cy + H*0.3), r(cx - W*0.1), r(cy + H*0.1));
      g.fillTriangle(r(cx), r(cy - H*0.35), r(cx + W*0.45), r(cy + H*0.3), r(cx + W*0.1), r(cy + H*0.1));

      // Корпус
      g.fillStyle(color, 1);
      g.fillTriangle(r(cx), r(cy - H*0.42), r(cx - W*0.18), r(cy + H*0.38), r(cx + W*0.18), r(cy + H*0.38));

      // Кабина
      g.fillStyle(0x88ddff, 0.85);
      g.fillEllipse(r(cx), r(cy - H*0.08), r(W*0.22), r(H*0.28));

      // Двигатель
      g.fillStyle(0x223355, 1);
      g.fillRect(r(cx - W*0.08), r(cy + H*0.28), r(W*0.16), r(H*0.14));

      // Свечение двигателя
      g.fillStyle(0x4488ff, 0.9);
      g.fillRect(r(cx - W*0.06), r(cy + H*0.4), r(W*0.12), r(H*0.05));

      // Подсветка
      g.lineStyle(1, 0xaaccff, 0.5);
      g.strokeTriangle(r(cx), r(cy - H*0.42), r(cx - W*0.18), r(cy + H*0.38), r(cx + W*0.18), r(cy + H*0.38));

    } else if (faction === 13) {
      // Фракция призраков — острые линии
      g.fillStyle(ShipRenderer._darken(color, 0.5), 1);
      g.fillTriangle(r(cx), r(cy - H*0.42), r(cx - W*0.5), r(cy + H*0.42), r(cx - W*0.12), r(cy));
      g.fillTriangle(r(cx), r(cy - H*0.42), r(cx + W*0.5), r(cy + H*0.42), r(cx + W*0.12), r(cy));

      g.fillStyle(color, 1);
      g.fillTriangle(r(cx), r(cy - H*0.38), r(cx - W*0.1), r(cy + H*0.42), r(cx + W*0.1), r(cy + H*0.42));

      g.fillStyle(0xcc88ff, 0.7);
      g.fillEllipse(r(cx), r(cy - H*0.1), r(W*0.18), r(H*0.22));

      g.fillStyle(0xaa44ff, 0.9);
      g.fillEllipse(r(cx), r(cy + H*0.4), r(W*0.1), r(H*0.06));

    } else if (faction === 12) {
      // Дредноут — широкий, угловатый
      g.fillStyle(ShipRenderer._darken(color, 0.5), 1);
      g.fillRect(r(cx - W*0.42), r(cy - H*0.1), r(W*0.84), r(H*0.45));
      g.fillTriangle(r(cx - W*0.42), r(cy - H*0.1), r(cx + W*0.42), r(cy - H*0.1), r(cx), r(cy - H*0.42));

      g.fillStyle(color, 1);
      g.fillRect(r(cx - W*0.28), r(cy - H*0.25), r(W*0.56), r(H*0.6));
      g.fillTriangle(r(cx - W*0.28), r(cy - H*0.25), r(cx + W*0.28), r(cy - H*0.25), r(cx), r(cy - H*0.45));

      g.fillStyle(0x223355, 1);
      g.fillRect(r(cx - W*0.2), r(cy + H*0.28), r(W*0.18), r(H*0.1));
      g.fillRect(r(cx + W*0.02), r(cy + H*0.28), r(W*0.18), r(H*0.1));

      g.fillStyle(0xff2200, 0.9);
      g.fillRect(r(cx - W*0.18), r(cy + H*0.38), r(W*0.14), r(H*0.05));
      g.fillRect(r(cx + W*0.04), r(cy + H*0.38), r(W*0.14), r(H*0.05));
    }
  }

  static _drawEnemyShip(g, W, H, color, faction, tier, scale) {
    const cx = W / 2, cy = H / 2;
    const r = g => Math.round(g);

    if (faction === 'pirate') {
      // Угловатый пиратский корабль
      g.fillStyle(ShipRenderer._darken(color, 0.55), 1);
      g.fillTriangle(r(cx), r(cy + H*0.4), r(cx - W*0.42), r(cy - H*0.2), r(cx + W*0.42), r(cy - H*0.2));

      g.fillStyle(color, 1);
      g.fillTriangle(r(cx), r(cy + H*0.4), r(cx - W*0.16), r(cy - H*0.38), r(cx + W*0.16), r(cy - H*0.38));

      g.fillStyle(0xff6600, 0.8);
      g.fillEllipse(r(cx), r(cy - H*0.1), r(W*0.18), r(H*0.2));

      g.fillStyle(0xffaa00, 0.9);
      g.fillCircle(r(cx), r(cy + H*0.42), r(W*0.06));

    } else if (faction === 'alien') {
      // Органический инопланетный дизайн
      g.fillStyle(ShipRenderer._darken(color, 0.5), 1);
      g.fillEllipse(r(cx), r(cy + H*0.1), r(W*0.9), r(H*0.7));

      g.fillStyle(color, 1);
      g.fillEllipse(r(cx), r(cy), r(W*0.65), r(H*0.55));

      // Щупальца
      g.fillStyle(ShipRenderer._darken(color, 0.6), 0.8);
      for (let i = 0; i < 3; i++) {
        const ax = cx + (i - 1) * W * 0.28;
        g.fillTriangle(r(ax - W*0.06), r(cy - H*0.2), r(ax + W*0.06), r(cy - H*0.2), r(ax), r(cy - H*0.44));
      }

      g.fillStyle(0x00ffaa, 0.85);
      g.fillEllipse(r(cx), r(cy - H*0.05), r(W*0.28), r(H*0.22));

    } else if (faction === 'guard') {
      // Военный охранник — симметричный
      g.fillStyle(ShipRenderer._darken(color, 0.6), 1);
      g.fillRect(r(cx - W*0.38), r(cy - H*0.15), r(W*0.76), r(H*0.35));
      g.fillTriangle(r(cx - W*0.38), r(cy - H*0.15), r(cx + W*0.38), r(cy - H*0.15), r(cx), r(cy - H*0.42));

      g.fillStyle(color, 1);
      g.fillRect(r(cx - W*0.2), r(cy - H*0.3), r(W*0.4), r(H*0.58));
      g.fillTriangle(r(cx - W*0.2), r(cy - H*0.3), r(cx + W*0.2), r(cy - H*0.3), r(cx), r(cy - H*0.44));

      g.fillStyle(0x88aaff, 0.75);
      g.fillRect(r(cx - W*0.12), r(cy - H*0.28), r(W*0.24), r(H*0.18));

      // Двигатели
      for (let dx of [-0.2, 0, 0.2]) {
        g.fillStyle(0x4477ff, 0.9);
        g.fillRect(r(cx + dx*W - W*0.04), r(cy + H*0.25), r(W*0.08), r(H*0.05));
      }

    } else {
      // Дефолтный враг
      g.fillStyle(ShipRenderer._darken(color, 0.6), 1);
      g.fillTriangle(r(cx), r(cy + H*0.42), r(cx - W*0.38), r(cy - H*0.25), r(cx + W*0.38), r(cy - H*0.25));
      g.fillStyle(color, 1);
      g.fillTriangle(r(cx), r(cy + H*0.42), r(cx - W*0.14), r(cy - H*0.4), r(cx + W*0.14), r(cy - H*0.4));
      g.fillStyle(0xffffff, 0.4);
      g.fillEllipse(r(cx), r(cy + H*0.05), r(W*0.2), r(H*0.18));
    }
  }

  static _darken(color, factor) {
    const r = Math.floor(((color >> 16) & 0xff) * factor);
    const gv = Math.floor(((color >> 8) & 0xff) * factor);
    const b = Math.floor((color & 0xff) * factor);
    return (r << 16) | (gv << 8) | b;
  }

  static getEnemyFaction(enemyId) {
    if (!enemyId) return 'default';
    if (enemyId.startsWith('pirate')) return 'pirate';
    if (enemyId.startsWith('alien') || enemyId === 'boss_2') return 'alien';
    if (enemyId.startsWith('guard')) return 'guard';
    return 'pirate';
  }
}
