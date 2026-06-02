import { SHIPS, getShipById } from '../data/ships';
import { WEAPONS, getWeaponById } from '../data/weapons';
import { MODULES, getModuleById } from '../data/modules';
import { SaveSystem } from '../systems/SaveSystem';

export class HangarScene extends Phaser.Scene {
  constructor() { super({ key: 'HangarScene' }); }

  create() {
    const W = this.scale.width, H = this.scale.height;
    this.save = SaveSystem.load();
    this.selectedSlot = 0;
    this.tab = 'ship'; // ship | weapons | modules

    // Фон
    this.add.image(W/2, H/2, 'bg_stars').setDisplaySize(W, H).setAlpha(0.7);

    // Заголовок
    this.add.text(W/2, 24, 'АНГАР', { fontSize: '20px', fontFamily: 'Arial Black', color: '#ccaaff', stroke: '#220044', strokeThickness: 3 }).setOrigin(0.5);

    // Ресурсы
    this.credText = this.add.text(W - 10, 14, `💰 ${this.save.credits}`, { fontSize: '13px', fontFamily: 'Arial', color: '#ffdd44' }).setOrigin(1, 0);

    // Табы
    this._drawTabs();

    // Контент
    this.contentContainer = this.add.container(0, 0);
    this._drawContent();

    // Кнопка назад
    this.add.text(10, H - 10, '← КАРТА', {
      fontSize: '13px', fontFamily: 'Arial', color: '#8888aa',
      backgroundColor: '#0a0a1e', padding: { x: 8, y: 4 }
    }).setOrigin(0, 1).setInteractive()
      .on('pointerdown', () => { SaveSystem.save(this.save); this.scene.start('StarMapScene'); })
      .on('pointerover', function() { this.setColor('#ccaaff'); })
      .on('pointerout', function() { this.setColor('#8888aa'); });
  }

  _drawTabs() {
    const W = this.scale.width;
    const tabs = [['ship', 'КОРАБЛЬ'], ['weapons', 'ОРУЖИЕ'], ['modules', 'МОДУЛИ']];
    const tw = W / 3;

    tabs.forEach(([key, label], i) => {
      const x = i * tw, y = 44;
      const bg = this.add.graphics();
      const active = this.tab === key;
      bg.fillStyle(active ? 0x2a1a5a : 0x0a0a1a, 0.95).fillRect(x, y, tw, 30);
      bg.lineStyle(1, active ? 0x8866dd : 0x333355).strokeRect(x, y, tw, 30);

      const txt = this.add.text(x + tw/2, y + 15, label, {
        fontSize: '12px', fontFamily: 'Arial Black', color: active ? '#ccaaff' : '#555577'
      }).setOrigin(0.5);

      const zone = this.add.zone(x + tw/2, y + 15, tw, 30).setInteractive();
      zone.on('pointerdown', () => { this.tab = key; this.scene.restart(); });
    });
  }

  _drawContent() {
    this.contentContainer.removeAll(true);
    if (this.tab === 'ship') this._drawShipTab();
    else if (this.tab === 'weapons') this._drawWeaponsTab();
    else if (this.tab === 'modules') this._drawModulesTab();
  }

  _drawShipTab() {
    const W = this.scale.width, H = this.scale.height;
    const fleet = this.save.fleet;
    const currentShipId = fleet[0]?.shipId || 'f0s1';
    const currentShip = getShipById(currentShipId);

    // Текущий корабль
    const bg = this.add.graphics();
    bg.fillStyle(0x0a0a2a, 0.9).fillRect(10, 84, W - 20, 130);
    bg.lineStyle(1, 0x4433aa).strokeRect(10, 84, W - 20, 130);

    // Нарисуем корабль
    const shipGfx = this.add.graphics();
    const col = currentShip.color;
    const cx = W/2, cy = 150;
    shipGfx.fillStyle(col, 1).fillTriangle(cx, cy - 30, cx - 22, cy + 24, cx + 22, cy + 24);
    shipGfx.fillStyle(0xffffff, 0.4).fillTriangle(cx, cy - 18, cx - 10, cy + 8, cx + 10, cy + 8);
    shipGfx.fillStyle(0xff8800, 0.8).fillRect(cx - 10, cy + 18, 8, 6).fillRect(cx + 2, cy + 18, 8, 6);

    this.add.text(cx, cy + 42, currentShip.name, { fontSize: '15px', fontFamily: 'Arial Black', color: '#ffffff' }).setOrigin(0.5);
    this.add.text(cx, cy + 60, currentShip.description, { fontSize: '11px', fontFamily: 'Arial', color: '#9999bb', wordWrap: { width: W - 60 } }).setOrigin(0.5);

    // Статы
    const stats = [
      [`HP: ${currentShip.baseHp}`, '#ff6666'],
      [`Щит: ${currentShip.baseShield}`, '#4488ff'],
      [`Скор: ${currentShip.baseSpeed}`, '#44ff88'],
      [`Энергия: ${currentShip.baseEnergy}`, '#ffff44']
    ];
    stats.forEach(([txt, col], i) => {
      const x = 20 + (i % 2) * (W/2 - 10), y = 200 + Math.floor(i/2) * 18;
      this.add.text(x, y, txt, { fontSize: '12px', fontFamily: 'Arial', color: col });
    });

    // Список всех кораблей
    this.add.text(W/2, 235, '— ДОСТУПНЫЕ КОРАБЛИ —', { fontSize: '11px', fontFamily: 'Arial', color: '#555577' }).setOrigin(0.5);

    const scrollY = 250;
    SHIPS.forEach((ship, i) => {
      const y = scrollY + i * 58;
      if (y > H - 60) return;
      this._drawShipCard(10, y, W - 20, 52, ship, ship.id === currentShipId);
    });
  }

  _drawShipCard(x, y, w, h, ship, selected) {
    const bg = this.add.graphics();
    bg.fillStyle(selected ? 0x1a1a4a : 0x0a0a1a, 0.9).fillRect(x, y, w, h);
    bg.lineStyle(1, selected ? 0x8866dd : 0x222244).strokeRect(x, y, w, h);

    // Мини-корабль
    const mg = this.add.graphics();
    const cx = x + 28, cy = y + h/2;
    mg.fillStyle(ship.color, 1).fillTriangle(cx, cy - 12, cx - 10, cy + 10, cx + 10, cy + 10);

    this.add.text(x + 50, y + 8, ship.name, { fontSize: '13px', fontFamily: 'Arial Black', color: '#ccaaff' });
    this.add.text(x + 50, y + 24, `HP:${ship.baseHp} | Щит:${ship.baseShield} | Tier ${ship.tier}`, { fontSize: '10px', fontFamily: 'Arial', color: '#888899' });

    const owned = this.save.fleet.some(f => f.shipId === ship.id) || ship.unlockCost === 0;
    const affordable = this.save.credits >= ship.unlockCost;
    const btnLabel = selected ? '✓ АКТИВЕН' : (owned ? 'ВЫБРАТЬ' : `${ship.unlockCost}💰`);
    const btnColor = selected ? '#44ff44' : (owned ? '#ccaaff' : (affordable ? '#ffdd44' : '#553333'));

    this.add.text(x + w - 12, y + h/2, btnLabel, { fontSize: '11px', fontFamily: 'Arial', color: btnColor }).setOrigin(1, 0.5);

    if (!selected) {
      const zone = this.add.zone(x + w/2, y + h/2, w, h).setInteractive();
      zone.on('pointerdown', () => {
        if (owned) {
          this.save.fleet[0] = { shipId: ship.id, weapons: ['laser_1'], modules: [], hp: ship.baseHp };
          SaveSystem.save(this.save);
          this.scene.restart();
        } else if (affordable) {
          this.save.credits -= ship.unlockCost;
          this.save.fleet.push({ shipId: ship.id, weapons: ['laser_1'], modules: [], hp: ship.baseHp });
          SaveSystem.save(this.save);
          this.scene.restart();
        }
      });
    }
  }

  _drawWeaponsTab() {
    const W = this.scale.width, H = this.scale.height;
    const fleet = this.save.fleet[0];
    const equipped = fleet?.weapons || [];

    this.add.text(W/2, 90, 'Оснащено: ' + (equipped.map(id => getWeaponById(id)?.name || id).join(', ') || 'нет'), {
      fontSize: '11px', fontFamily: 'Arial', color: '#ccaaff', wordWrap: { width: W - 20 }
    }).setOrigin(0.5);

    WEAPONS.forEach((w, i) => {
      const y = 115 + i * 64;
      if (y > H - 60) return;
      this._drawItemCard(10, y, W - 20, 58, w, equipped.includes(w.id), () => {
        if (equipped.includes(w.id)) {
          fleet.weapons = equipped.filter(id => id !== w.id);
        } else if (this.save.credits >= w.unlockCost || w.unlockCost === 0) {
          if (w.unlockCost > 0) this.save.credits -= w.unlockCost;
          fleet.weapons = [...equipped, w.id];
        }
        SaveSystem.save(this.save);
        this.scene.restart();
      });
    });
  }

  _drawModulesTab() {
    const W = this.scale.width, H = this.scale.height;
    const fleet = this.save.fleet[0];
    const equipped = fleet?.modules || [];

    MODULES.forEach((m, i) => {
      const y = 90 + i * 60;
      if (y > H - 60) return;
      this._drawItemCard(10, y, W - 20, 54, m, equipped.includes(m.id), () => {
        if (equipped.includes(m.id)) {
          fleet.modules = equipped.filter(id => id !== m.id);
        } else if (this.save.credits >= m.unlockCost || m.unlockCost === 0) {
          if (m.unlockCost > 0) this.save.credits -= m.unlockCost;
          fleet.modules = [...equipped, m.id];
        }
        SaveSystem.save(this.save);
        this.scene.restart();
      });
    });
  }

  _drawItemCard(x, y, w, h, item, equipped, onToggle) {
    const bg = this.add.graphics();
    bg.fillStyle(equipped ? 0x1a2a1a : 0x0a0a1a, 0.9).fillRect(x, y, w, h);
    bg.lineStyle(1, equipped ? 0x44aa44 : 0x222244).strokeRect(x, y, w, h);

    const dot = this.add.graphics();
    dot.fillStyle(item.color || 0xffffff, 0.9).fillCircle(x + 14, y + h/2, 8);

    this.add.text(x + 28, y + 6, item.name, { fontSize: '13px', fontFamily: 'Arial Black', color: equipped ? '#44ff44' : '#ccaaff' });
    this.add.text(x + 28, y + 22, item.description, { fontSize: '9px', fontFamily: 'Arial', color: '#888899', wordWrap: { width: w - 100 } });

    const cost = item.unlockCost === 0 ? 'Бесплатно' : `${item.unlockCost}💰`;
    const canAfford = this.save.credits >= item.unlockCost || item.unlockCost === 0;
    const btnLabel = equipped ? '✓ Снять' : (canAfford ? `Взять` : cost);
    const btnColor = equipped ? '#ff4444' : (canAfford ? '#ffdd44' : '#553333');

    this.add.text(x + w - 10, y + h/2, btnLabel, { fontSize: '11px', fontFamily: 'Arial', color: btnColor }).setOrigin(1, 0.5);

    const zone = this.add.zone(x + w/2, y + h/2, w, h).setInteractive();
    zone.on('pointerdown', onToggle);
  }
}
