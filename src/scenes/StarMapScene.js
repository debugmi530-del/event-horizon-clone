import { STAR_SYSTEMS, getSystemById } from '../data/starmap';
import { SaveSystem } from '../systems/SaveSystem';

const DANGER_COLORS = [0x44ff44, 0xaaff44, 0xffff44, 0xffaa44, 0xff5533, 0xff0000];
const DANGER_NAMES  = ['Безопасно', 'Легко', 'Средне', 'Опасно', 'Крайне опасно', 'СМЕРТЕЛЬНО'];
const TYPE_ICONS    = { home: '🏠', boss: '☠', shop: '🛒', ruins: '🏚', normal: '★' };

export class StarMapScene extends Phaser.Scene {
  constructor() { super({ key: 'StarMapScene' }); }

  create() {
    const W = this.scale.width, H = this.scale.height;
    this.save = SaveSystem.load();
    this.selectedId = null;

    // ── Фон ──
    if (this.textures.exists('bg_space')) {
      this.add.image(W/2, H/2, 'bg_space').setDisplaySize(W, H).setAlpha(0.5);
    }
    if (this.textures.exists('bg_stars')) {
      this.bg = this.add.tileSprite(W/2, H/2, W, H, 'bg_stars').setAlpha(0.7);
    }
    if (this.textures.exists('bg_nebula')) {
      this.add.image(W/2, H/2, 'bg_nebula').setDisplaySize(W, H).setAlpha(0.2)
        .setBlendMode(Phaser.BlendModes.ADD);
    }
    this._drawStaticStars();

    // ── Заголовок ──
    this.add.graphics().fillStyle(0x000011, 0.8).fillRect(0, 0, W, 48);
    this.add.text(W/2, 24, 'ЗВЁЗДНАЯ КАРТА', {
      fontSize: '17px', fontFamily: 'Arial Black', color: '#ccaaff',
      stroke: '#220044', strokeThickness: 3
    }).setOrigin(0.5);

    // HUD ресурсы
    this._drawResourceBar();

    // ── Линии связи ──
    this._drawConnections();

    // ── Системы ──
    this.systemNodes = {};
    STAR_SYSTEMS.forEach(sys => this._drawSystem(sys));

    // ── Инфо-панель ──
    this.infoPanel = this.add.container(0, H - 150);
    this._drawInfoPanel(null);

    // ── Кнопки ──
    this._smallBtn(30, H - 14, '← МЕНЮ', () => this.scene.start('MainMenuScene'));
    this._smallBtn(W - 30, H - 14, 'АНГАР ⚙', () => this.scene.start('HangarScene'), true);
  }

  update() {
    if (this.bg) this.bg.tilePositionY -= 0.2;
  }

  _drawStaticStars() {
    const W = this.scale.width, H = this.scale.height;
    const g = this.add.graphics();
    for (let i = 0; i < 100; i++) {
      const a = 0.15 + Math.random() * 0.5;
      g.fillStyle(0xffffff, a).fillCircle(Math.random()*W, Math.random()*H, Math.random()*1.2);
    }
  }

  _drawResourceBar() {
    const W = this.scale.width;
    const g = this.add.graphics().fillStyle(0x000011, 0.75).fillRect(0, 48, W, 28);
    g.lineStyle(1, 0x334466, 0.6).strokeRect(0, 48, W, 28);

    // Кредиты
    this.add.text(10, 62, `💰 ${this.save.credits}`, {
      fontSize: '12px', fontFamily: 'Arial', color: '#ffdd44'
    }).setOrigin(0, 0.5);

    // Топливо — полоска
    const fuelPct = this.save.fuel / this.save.maxFuel;
    const fuelCol = fuelPct > 0.5 ? '#44ff88' : fuelPct > 0.25 ? '#ffff44' : '#ff4444';
    this.add.text(W/2, 62, `⛽ ${this.save.fuel}/${this.save.maxFuel}`, {
      fontSize: '12px', fontFamily: 'Arial', color: fuelCol
    }).setOrigin(0.5, 0.5);

    // Уровень и XP
    this.add.text(W - 10, 62, `Ур.${this.save.playerLevel}  ⭐${this.save.stars}`, {
      fontSize: '12px', fontFamily: 'Arial', color: '#aaaaff'
    }).setOrigin(1, 0.5);
  }

  _drawConnections() {
    const line = this.add.graphics().setDepth(1);
    const curr = getSystemById(this.save.starMap.currentSystem);
    const visited = this.save.starMap.visited;

    STAR_SYSTEMS.forEach(sys => {
      sys.connections.forEach(cid => {
        if (cid <= sys.id) return;
        const conn = getSystemById(cid);
        const bothVisited = visited.includes(sys.id) && visited.includes(cid);
        const isReachable = sys.id === this.save.starMap.currentSystem
          || cid === this.save.starMap.currentSystem;

        let col, alpha, w;
        if (bothVisited)       { col = 0x6644bb; alpha = 0.5; w = 1.5; }
        else if (isReachable)  { col = 0x4488ff; alpha = 0.35; w = 1; }
        else                   { col = 0x223344; alpha = 0.2; w = 1; }

        line.lineStyle(w, col, alpha);
        line.beginPath().moveTo(sys.x, sys.y + 76).lineTo(conn.x, conn.y + 76).strokePath();
      });
    });
  }

  _drawSystem(sys) {
    const W = this.scale.width;
    const offsetY = 76;
    const sx = sys.x, sy = sys.y + offsetY;
    const visited = this.save.starMap.visited.includes(sys.id);
    const isCurrent = this.save.starMap.currentSystem === sys.id;
    const isReachable = !isCurrent
      && getSystemById(this.save.starMap.currentSystem).connections.includes(sys.id);

    const visible = visited || isCurrent || isReachable;
    if (!visible) {
      // Неизведанная — тёмная точка
      this.add.graphics().fillStyle(0x223344, 0.3).fillCircle(sx, sy, 5).setDepth(2);
      return;
    }

    // Иконка системы
    const iconKey = this._getSystemIcon(sys);
    const iconAlpha = isCurrent ? 1.0 : isReachable ? 0.85 : 0.6;
    const iconScale = isCurrent ? 0.65 : isReachable ? 0.52 : 0.44;

    let icon;
    if (this.textures.exists(iconKey)) {
      icon = this.add.image(sx, sy, iconKey).setScale(iconScale).setAlpha(iconAlpha).setDepth(3);
    } else {
      // Fallback — геометрический символ
      const glyph = this.add.graphics().setDepth(3);
      const col = isCurrent ? DANGER_COLORS[sys.danger] : 0x6655aa;
      glyph.fillStyle(col, iconAlpha).fillCircle(sx, sy, isCurrent ? 10 : 7);
      glyph.lineStyle(1.5, 0xaaaaff, iconAlpha * 0.8).strokeCircle(sx, sy, isCurrent ? 12 : 9);
    }

    // Пульсация текущей системы
    if (isCurrent && icon) {
      this.tweens.add({ targets: icon, scaleX: iconScale*1.18, scaleY: iconScale*1.18, duration: 1000, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }

    // Значок опасности
    if (sys.danger > 0 && visible) {
      const dotG = this.add.graphics().setDepth(5);
      dotG.fillStyle(DANGER_COLORS[sys.danger], 0.9).fillCircle(sx + 14, sy - 12, 4.5);
      dotG.lineStyle(1, 0xffffff, 0.3).strokeCircle(sx + 14, sy - 12, 4.5);
    }

    // Название
    const nameAlpha = isCurrent ? 1 : isReachable ? 0.85 : 0.55;
    const nameCol = isCurrent ? '#ffffff' : isReachable ? '#ccaaff' : '#778899';
    this.add.text(sx, sy + 20, sys.name, {
      fontSize: '9px', fontFamily: 'Arial', color: nameCol
    }).setOrigin(0.5).setAlpha(nameAlpha).setDepth(4);

    // Тип-иконка эмодзи
    if (sys.type !== 'normal') {
      this.add.text(sx - 14, sy - 14, TYPE_ICONS[sys.type] || '', {
        fontSize: '10px'
      }).setDepth(5).setAlpha(iconAlpha);
    }

    // Кнопка перехода
    const zone = this.add.zone(sx, sy, 56, 56).setInteractive().setDepth(6);
    zone.on('pointerover', () => {
      this._drawInfoPanel(sys);
      if (icon) icon.setScale(iconScale * 1.15);
    });
    zone.on('pointerout', () => {
      if (icon && !isCurrent) icon.setScale(iconScale);
    });
    zone.on('pointerdown', () => {
      this.selectedId = sys.id;
      this._drawInfoPanel(sys);
      if (isReachable) this._tryTravel(sys);
    });

    this.systemNodes[sys.id] = { icon, zone, sx, sy };
  }

  _getSystemIcon(sys) {
    switch (sys.type) {
      case 'home':  return 'sm_home';
      case 'boss':  return 'sm_boss';
      case 'shop':  return 'sm_shop';
      case 'ruins': return 'sm_ruins';
      default:      return this.save.starMap.visited.includes(sys.id) ? 'sm_base' : 'sm_star';
    }
  }

  _drawInfoPanel(sys) {
    this.infoPanel.removeAll(true);
    const W = this.scale.width;
    const panelH = 150;

    const bg = this.add.graphics();
    bg.fillStyle(0x05050f, 0.92).fillRect(0, 0, W, panelH);
    bg.lineStyle(1, 0x334466, 0.7).strokeRect(0, 0, W, panelH);
    bg.lineStyle(1, 0x5533aa, 0.5).strokeRect(1, 1, W - 2, panelH - 2);
    this.infoPanel.add(bg);

    if (!sys) {
      this.infoPanel.add(this.add.text(W/2, panelH/2, 'Выберите звёздную систему', {
        fontSize: '13px', fontFamily: 'Arial', color: '#445566'
      }).setOrigin(0.5));
      return;
    }

    const isCurrent = this.save.starMap.currentSystem === sys.id;
    const isReachable = !isCurrent
      && getSystemById(this.save.starMap.currentSystem).connections.includes(sys.id);
    const d = sys.danger;

    // Название
    this.infoPanel.add(this.add.text(14, 12, sys.name, {
      fontSize: '17px', fontFamily: 'Arial Black', color: '#ccaaff'
    }));

    // Тип и опасность
    const typeStr = { home: 'База', boss: 'БОСС', shop: 'Станция', ruins: 'Руины', normal: 'Система' }[sys.type] || '';
    this.infoPanel.add(this.add.text(14, 34, `${typeStr}  •  Опасность: ${DANGER_NAMES[d]}`, {
      fontSize: '11px', fontFamily: 'Arial',
      color: '#' + DANGER_COLORS[d].toString(16).padStart(6, '0')
    }));

    // Описание
    this.infoPanel.add(this.add.text(14, 52, sys.description, {
      fontSize: '11px', fontFamily: 'Arial', color: '#8899aa',
      wordWrap: { width: W - 180 }
    }));

    // Топливо
    if (sys.fuel > 0) {
      const hasFuel = this.save.fuel >= sys.fuel;
      this.infoPanel.add(this.add.text(14, 78, `⛽ Топливо: ${sys.fuel}`, {
        fontSize: '11px', fontFamily: 'Arial', color: hasFuel ? '#ffaa44' : '#ff4444'
      }));
    }

    // Возможные награды
    if (sys.rewards?.credits && Array.isArray(sys.rewards.credits)) {
      const [min, max] = sys.rewards.credits;
      this.infoPanel.add(this.add.text(14, 94, `💰 Награда: ${min}–${max}`, {
        fontSize: '10px', fontFamily: 'Arial', color: '#ffdd44'
      }));
    }

    if (isCurrent) {
      this.infoPanel.add(this.add.text(W/2, panelH - 22, '▶ ВЫ ЗДЕСЬ', {
        fontSize: '13px', fontFamily: 'Arial Black', color: '#44ff88'
      }).setOrigin(0.5));
    } else if (isReachable) {
      this._addTravelBtn(sys, panelH);
    } else {
      this.infoPanel.add(this.add.text(W - 14, panelH - 18, '🔒 Недоступно', {
        fontSize: '11px', fontFamily: 'Arial', color: '#445566'
      }).setOrigin(1, 0.5));
    }
  }

  _addTravelBtn(sys, panelH) {
    const W = this.scale.width;
    const bW = 170, bH = 40;
    const bx = W - bW - 12, by = panelH - bH - 10;
    const hasFuel = this.save.fuel >= sys.fuel;
    const col = hasFuel ? 0x1a2a5a : 0x2a0a0a;
    const border = hasFuel ? 0x5588dd : 0x882222;

    const bg = this.add.graphics();
    bg.fillStyle(col, 0.95).fillRect(bx, by, bW, bH);
    bg.lineStyle(2, border).strokeRect(bx, by, bW, bH);
    this.infoPanel.add(bg);

    const label = hasFuel ? `✈ ЛЕТЕТЬ  [${sys.fuel}⛽]` : `✗ Мало топлива`;
    const btnTxt = this.add.text(bx + bW/2, by + bH/2, label, {
      fontSize: '13px', fontFamily: 'Arial Black',
      color: hasFuel ? '#88bbff' : '#884444'
    }).setOrigin(0.5);
    this.infoPanel.add(btnTxt);

    if (hasFuel) {
      const zone = this.add.zone(bx + bW/2, by + bH/2 + this.infoPanel.y, bW, bH).setInteractive();
      zone.on('pointerover', () => { bg.clear(); bg.fillStyle(0x2a3a7a, 0.97).fillRect(bx, by, bW, bH); bg.lineStyle(2, 0xaaccff).strokeRect(bx, by, bW, bH); btnTxt.setColor('#ffffff'); });
      zone.on('pointerout', () => { bg.clear(); bg.fillStyle(col, 0.95).fillRect(bx, by, bW, bH); bg.lineStyle(2, border).strokeRect(bx, by, bW, bH); btnTxt.setColor('#88bbff'); });
      zone.on('pointerdown', () => this._tryTravel(sys));
      this.infoPanel.add(zone);
    }
  }

  _tryTravel(sys) {
    if (this.save.fuel < sys.fuel) {
      this._toast('Недостаточно топлива!', '#ff4444');
      return;
    }
    this.save.fuel -= sys.fuel;
    this.save.starMap.currentSystem = sys.id;
    if (!this.save.starMap.visited.includes(sys.id)) {
      this.save.starMap.visited.push(sys.id);
    }
    SaveSystem.save(this.save);

    if (sys.type === 'shop') {
      this.scene.start('ShopScene', { systemId: sys.id });
    } else {
      this.cameras.main.fade(400, 0, 0, 0, false, (cam, t) => {
        if (t === 1) this.scene.start('CombatScene', { systemId: sys.id });
      });
    }
  }

  _toast(msg, color = '#ffffff') {
    const txt = this.add.text(this.scale.width/2, this.scale.height/2 - 40, msg, {
      fontSize: '18px', fontFamily: 'Arial Black', color,
      stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5).setDepth(50);
    this.tweens.add({ targets: txt, y: txt.y - 50, alpha: 0, duration: 2000, onComplete: () => txt.destroy() });
  }

  _smallBtn(x, y, label, cb, alignRight = false) {
    const txt = this.add.text(x, y, label, {
      fontSize: '12px', fontFamily: 'Arial', color: '#7788aa',
      backgroundColor: '#06060f', padding: { x: 8, y: 4 }
    }).setOrigin(alignRight ? 1 : 0, 1).setInteractive().setDepth(10);
    txt.on('pointerover', () => txt.setColor('#ccaaff'));
    txt.on('pointerout', () => txt.setColor('#7788aa'));
    txt.on('pointerdown', cb);
  }
}
