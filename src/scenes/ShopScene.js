import { WEAPONS } from '../data/weapons';
import { MODULES } from '../data/modules';
import { SaveSystem } from '../systems/SaveSystem';
import { getSystemById } from '../data/starmap';

export class ShopScene extends Phaser.Scene {
  constructor() { super({ key: 'ShopScene' }); }

  init(data) { this.systemId = data?.systemId ?? 4; }

  create() {
    const W = this.scale.width, H = this.scale.height;
    this.save = SaveSystem.load();
    this.tab = 'weapons';

    this.add.image(W/2, H/2, 'bg_stars').setDisplaySize(W, H).setAlpha(0.7);
    this.add.text(W/2, 24, '🛒 МАГАЗИН', { fontSize: '20px', fontFamily: 'Arial Black', color: '#ffdd44', stroke: '#332200', strokeThickness: 3 }).setOrigin(0.5);
    this.credText = this.add.text(W/2, 46, `Кредиты: ${this.save.credits} 💰`, { fontSize: '14px', fontFamily: 'Arial', color: '#ffcc44' }).setOrigin(0.5);

    // Ремонт
    const repairCost = Math.max(0, (100 - (this.save.fleet[0]?.hp || 80)) * 2);
    if (repairCost > 0) {
      const repBtn = this.add.text(W - 12, 46, `🔧 Ремонт (${repairCost}💰)`, {
        fontSize: '12px', fontFamily: 'Arial', color: '#44ff44', backgroundColor: '#001a00', padding: { x: 6, y: 3 }
      }).setOrigin(1, 0.5).setInteractive();
      repBtn.on('pointerdown', () => {
        if (this.save.credits >= repairCost) {
          this.save.credits -= repairCost;
          if (this.save.fleet[0]) this.save.fleet[0].hp = 100;
          SaveSystem.save(this.save);
          this.credText.setText(`Кредиты: ${this.save.credits} 💰`);
          repBtn.destroy();
        }
      });
    }

    // Топливо
    const fuelBtn = this.add.text(12, 46, `⛽ Топливо (50💰)`, {
      fontSize: '12px', fontFamily: 'Arial', color: '#ffaa44', backgroundColor: '#1a0a00', padding: { x: 6, y: 3 }
    }).setOrigin(0, 0.5).setInteractive();
    fuelBtn.on('pointerdown', () => {
      if (this.save.credits >= 50 && this.save.fuel < this.save.maxFuel) {
        this.save.credits -= 50;
        this.save.fuel = Math.min(this.save.fuel + 30, this.save.maxFuel);
        SaveSystem.save(this.save);
        this.credText.setText(`Кредиты: ${this.save.credits} 💰`);
      }
    });

    // Табы
    ['weapons', 'modules'].forEach((key, i) => {
      const label = key === 'weapons' ? 'ОРУЖИЕ' : 'МОДУЛИ';
      const x = 10 + i * (W/2 - 12), y = 62;
      const bg = this.add.graphics();
      const active = this.tab === key;
      bg.fillStyle(active ? 0x2a1a00 : 0x0a0a0a, 0.9).fillRect(x, y, W/2 - 18, 28);
      bg.lineStyle(1, active ? 0xddaa44 : 0x333333).strokeRect(x, y, W/2 - 18, 28);
      this.add.text(x + (W/2-18)/2, y + 14, label, { fontSize: '12px', fontFamily: 'Arial Black', color: active ? '#ffdd44' : '#555555' }).setOrigin(0.5);
      this.add.zone(x + (W/2-18)/2, y + 14, W/2-18, 28).setInteractive().on('pointerdown', () => { this.tab = key; this.scene.restart(); });
    });

    // Товары
    const items = this.tab === 'weapons' ? this._shopWeapons() : this._shopModules();
    items.forEach((item, i) => {
      const y = 98 + i * 68;
      if (y > H - 60) return;
      this._drawShopItem(10, y, W - 20, 62, item);
    });

    // Назад
    this.add.text(W/2, H - 16, '← КАРТА', {
      fontSize: '14px', fontFamily: 'Arial', color: '#8888aa', backgroundColor: '#0a0a1e', padding: { x: 10, y: 5 }
    }).setOrigin(0.5, 1).setInteractive()
      .on('pointerdown', () => { SaveSystem.save(this.save); this.scene.start('StarMapScene'); });
  }

  _shopWeapons() {
    return WEAPONS.filter(w => w.tier <= this.save.playerLevel + 1).slice(0, 8);
  }
  _shopModules() {
    return MODULES.filter(m => m.tier <= this.save.playerLevel + 1).slice(0, 8);
  }

  _drawShopItem(x, y, w, h, item) {
    const equipped = this.save.fleet[0]?.weapons?.includes(item.id) || this.save.fleet[0]?.modules?.includes(item.id);
    const bg = this.add.graphics();
    bg.fillStyle(equipped ? 0x0a1a0a : 0x0a0a1a, 0.9).fillRect(x, y, w, h);
    bg.lineStyle(1, equipped ? 0x44aa44 : 0x333355).strokeRect(x, y, w, h);

    const dot = this.add.graphics();
    dot.fillStyle(item.color || 0x888888, 0.9).fillCircle(x + 16, y + h/2, 10);

    this.add.text(x + 34, y + 8, item.name, { fontSize: '14px', fontFamily: 'Arial Black', color: '#ffffff' });
    this.add.text(x + 34, y + 26, item.description, { fontSize: '10px', fontFamily: 'Arial', color: '#888899', wordWrap: { width: w - 120 } });

    const affordable = this.save.credits >= item.unlockCost;
    const btnLabel = equipped ? '✓ ЕСТЬ' : (item.unlockCost === 0 ? 'БЕСПЛАТНО' : `${item.unlockCost} 💰`);
    const btnColor = equipped ? '#44ff44' : (affordable ? '#ffdd44' : '#553333');

    const btn = this.add.text(x + w - 12, y + h/2, btnLabel, {
      fontSize: '12px', fontFamily: 'Arial Black', color: btnColor
    }).setOrigin(1, 0.5);

    if (!equipped && affordable) {
      const zone = this.add.zone(x + w - 60, y + h/2, 120, h - 10).setInteractive();
      zone.on('pointerdown', () => {
        this.save.credits -= item.unlockCost;
        const fleet = this.save.fleet[0];
        if (item.type === undefined || ['Laser','Plasma','Missile','Torpedo','Special','Kinetic','Beam'].includes(item.type)) {
          fleet.weapons = [...(fleet.weapons || []), item.id];
        } else {
          fleet.modules = [...(fleet.modules || []), item.id];
        }
        SaveSystem.save(this.save);
        this.credText.setText(`Кредиты: ${this.save.credits} 💰`);
        this.scene.restart();
      });
    }
  }
}
