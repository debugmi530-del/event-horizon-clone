import { STAR_SYSTEMS, getSystemById } from '../data/starmap';
import { SaveSystem } from '../systems/SaveSystem';

export class StarMapScene extends Phaser.Scene {
  constructor() { super({ key: 'StarMapScene' }); }

  create() {
    const W = this.scale.width, H = this.scale.height;
    this.save = SaveSystem.load();
    this.selectedSystem = null;

    // Фон
    this.add.image(W/2, H/2, 'bg_stars').setDisplaySize(W, H).setAlpha(0.9);
    this.add.image(W/2, H/2, 'bg_nebula').setDisplaySize(W, H).setAlpha(0.25);

    // Заголовок
    this.add.text(W/2, 28, 'ЗВЁЗДНАЯ КАРТА', {
      fontSize: '17px', fontFamily: 'Arial Black', color: '#ccaaff', stroke: '#220044', strokeThickness: 3
    }).setOrigin(0.5);

    // Ресурсы
    this._drawHUD();

    // Соединения систем
    const lineGfx = this.add.graphics();
    for (const sys of STAR_SYSTEMS) {
      for (const connId of sys.connections) {
        if (connId > sys.id) {
          const conn = getSystemById(connId);
          const visited = this.save.starMap.visited.includes(sys.id) && this.save.starMap.visited.includes(connId);
          lineGfx.lineStyle(1, visited ? 0x4444aa : 0x222244, visited ? 0.6 : 0.3);
          lineGfx.beginPath().moveTo(sys.x, sys.y).lineTo(conn.x, conn.y).strokePath();
        }
      }
    }

    // Системы
    for (const sys of STAR_SYSTEMS) {
      this._drawSystem(sys);
    }

    // Панель инфо (снизу)
    this.infoPanel = this.add.container(0, H - 140);
    this._drawInfoPanel(null);

    // Кнопка Меню
    this._makeSmallBtn(40, H - 30, '← МЕНЮ', () => this.scene.start('MainMenuScene'));
  }

  _drawSystem(sys) {
    const visited = this.save.starMap.visited.includes(sys.id);
    const isCurrent = this.save.starMap.currentSystem === sys.id;
    const reachable = !isCurrent && getSystemById(this.save.starMap.currentSystem).connections.includes(sys.id);

    // Иконка
    let iconKey = 'sm_star';
    if (sys.type === 'home') iconKey = 'sm_home';
    else if (sys.type === 'boss') iconKey = 'sm_boss';
    else if (sys.type === 'shop') iconKey = 'sm_shop';
    else if (sys.type === 'ruins') iconKey = 'sm_ruins';
    else if (visited) iconKey = 'sm_base';
    else if (reachable) iconKey = 'sm_danger';

    const alpha = visited || isCurrent || reachable ? 1.0 : 0.35;
    const scale = isCurrent ? 0.7 : 0.45;

    const icon = this.add.image(sys.x, sys.y, iconKey).setScale(scale).setAlpha(alpha);

    // Пульсация текущей системы
    if (isCurrent) {
      this.tweens.add({ targets: icon, scaleX: scale * 1.15, scaleY: scale * 1.15, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }

    // Кружок опасности
    const dangerColors = [0x44ff44, 0xaaff44, 0xffff44, 0xffaa44, 0xff4444, 0xff0000];
    if (sys.danger > 0 && (visited || reachable)) {
      const dot = this.add.graphics();
      dot.fillStyle(dangerColors[sys.danger], 0.85).fillCircle(sys.x + 14, sys.y - 14, 5);
    }

    // Имя
    const nameColor = isCurrent ? '#ffffff' : (visited ? '#aaaacc' : (reachable ? '#888899' : '#444455'));
    this.add.text(sys.x, sys.y + 22, sys.name, {
      fontSize: '9px', fontFamily: 'Arial', color: nameColor
    }).setOrigin(0.5);

    // Интерактивность
    if (visited || isCurrent || reachable) {
      const zone = this.add.zone(sys.x, sys.y, 50, 50).setInteractive();
      zone.on('pointerdown', () => {
        this.selectedSystem = sys;
        this._drawInfoPanel(sys);
        if (reachable) this._showTravelBtn(sys);
      });
    }
  }

  _drawInfoPanel(sys) {
    this.infoPanel.removeAll(true);
    const W = this.scale.width;
    const bg = this.add.graphics();
    bg.fillStyle(0x0a0a1e, 0.92).fillRect(0, 0, W, 140);
    bg.lineStyle(1, 0x4433aa).strokeRect(0, 0, W, 140);
    this.infoPanel.add(bg);

    if (!sys) {
      this.infoPanel.add(this.add.text(W/2, 70, 'Выберите систему', {
        fontSize: '14px', fontFamily: 'Arial', color: '#666688'
      }).setOrigin(0.5));
      return;
    }

    // Название и описание
    this.infoPanel.add(this.add.text(16, 12, sys.name, {
      fontSize: '16px', fontFamily: 'Arial Black', color: '#ccaaff'
    }));
    this.infoPanel.add(this.add.text(16, 34, sys.description, {
      fontSize: '12px', fontFamily: 'Arial', color: '#888899', wordWrap: { width: W - 160 }
    }));

    // Опасность
    const dangerTxt = ['Безопасно', 'Легко', 'Средне', 'Опасно', 'Очень опасно', 'КРАЙНЕ ОПАСНО'];
    const dangerColors = ['#44ff44', '#aaff44', '#ffff44', '#ffaa44', '#ff4444', '#ff0000'];
    const d = sys.danger;
    this.infoPanel.add(this.add.text(16, 58, `Опасность: ${dangerTxt[d]}`, {
      fontSize: '12px', fontFamily: 'Arial', color: dangerColors[d]
    }));

    if (sys.fuel > 0) {
      this.infoPanel.add(this.add.text(16, 76, `Топливо: ${sys.fuel}`, {
        fontSize: '12px', fontFamily: 'Arial', color: '#ffaa44'
      }));
    }

    const isCurrent = this.save.starMap.currentSystem === sys.id;
    const reachable = !isCurrent && getSystemById(this.save.starMap.currentSystem).connections.includes(sys.id);

    if (isCurrent) {
      this.infoPanel.add(this.add.text(W/2, 105, '[ ВЫ ЗДЕСЬ ]', {
        fontSize: '13px', fontFamily: 'Arial', color: '#88ff88'
      }).setOrigin(0.5));
    } else if (reachable) {
      this._addTravelBtn(sys);
    }
  }

  _addTravelBtn(sys) {
    const W = this.scale.width;
    const btnW = 180, btnH = 36;
    const bx = W - btnW - 16, by = 52;

    const bg = this.add.graphics();
    bg.fillStyle(0x2a1a5a, 0.95).fillRect(bx, by, btnW, btnH);
    bg.lineStyle(2, 0x8866dd).strokeRect(bx, by, btnW, btnH);
    this.infoPanel.add(bg);

    const txt = this.add.text(bx + btnW/2, by + btnH/2, `✈ ЛЕТЕТЬ (${sys.fuel} топл.)`, {
      fontSize: '13px', fontFamily: 'Arial', color: '#ccaaff', fontStyle: 'bold'
    }).setOrigin(0.5);
    this.infoPanel.add(txt);

    const zone = this.add.zone(bx + btnW/2, by + btnH/2 + this.infoPanel.y, btnW, btnH).setInteractive();
    zone.on('pointerdown', () => this._travel(sys));
    this.infoPanel.add(zone);
  }

  _travel(sys) {
    if (this.save.fuel < sys.fuel) {
      this._showMessage('Недостаточно топлива!', '#ff4444');
      return;
    }
    this.save.fuel -= sys.fuel;
    this.save.starMap.currentSystem = sys.id;
    if (!this.save.starMap.visited.includes(sys.id)) {
      this.save.starMap.visited.push(sys.id);
    }
    SaveSystem.save(this.save);

    // Переходим в бой или магазин
    if (sys.type === 'shop') {
      this.scene.start('ShopScene', { systemId: sys.id });
    } else {
      this.scene.start('CombatScene', { systemId: sys.id });
    }
  }

  _drawHUD() {
    const W = this.scale.width;
    const hud = this.add.container(0, 50);
    hud.add(this.add.text(16, 0, `💰 ${this.save.credits}`, { fontSize: '13px', fontFamily: 'Arial', color: '#ffdd44' }));
    hud.add(this.add.text(16, 20, `⛽ ${this.save.fuel}/${this.save.maxFuel}`, { fontSize: '13px', fontFamily: 'Arial', color: '#ffaa44' }));
    hud.add(this.add.text(W - 16, 0, `Ур. ${this.save.playerLevel}`, { fontSize: '13px', fontFamily: 'Arial', color: '#aaaaff' }).setOrigin(1, 0));
    hud.add(this.add.text(W - 16, 20, `⭐ ${this.save.stars}`, { fontSize: '13px', fontFamily: 'Arial', color: '#ffdd44' }).setOrigin(1, 0));
  }

  _showMessage(msg, color = '#ffffff') {
    const txt = this.add.text(this.scale.width/2, this.scale.height/2, msg, {
      fontSize: '18px', fontFamily: 'Arial', color, stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5);
    this.tweens.add({ targets: txt, y: txt.y - 60, alpha: 0, duration: 1800, onComplete: () => txt.destroy() });
  }

  _makeSmallBtn(x, y, label, cb) {
    const txt = this.add.text(x, y, label, {
      fontSize: '13px', fontFamily: 'Arial', color: '#8888aa',
      backgroundColor: '#0a0a1e', padding: { x: 8, y: 4 }
    }).setOrigin(0, 1).setInteractive();
    txt.on('pointerover', () => txt.setColor('#ccaaff'));
    txt.on('pointerout', () => txt.setColor('#8888aa'));
    txt.on('pointerdown', cb);
  }
}
