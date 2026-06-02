import { SaveSystem } from '../systems/SaveSystem';

const TECH_TREE = [
  { id: 'engine_boost', name: 'Форсаж', desc: '+15% скорость всех кораблей', cost: 300, requires: [], icon: '🚀', color: 0xff8800 },
  { id: 'shield_regen', name: 'Быстрый щит', desc: 'Щит восстанавливается в 2x быстрее', cost: 500, requires: [], icon: '🛡', color: 0x4488ff },
  { id: 'weapon_dmg', name: 'Усиленные орудия', desc: '+20% урон всего оружия', cost: 400, requires: [], icon: '⚔', color: 0xff4444 },
  { id: 'energy_cap', name: 'Мощный реактор', desc: '+30 к максимуму энергии', cost: 350, requires: [], icon: '⚡', color: 0xffff44 },
  { id: 'hull_armor', name: 'Бронекорпус', desc: '+25% к максимальному HP', cost: 600, requires: ['shield_regen'], icon: '🔩', color: 0x888888 },
  { id: 'missile_homing', name: 'Умное наведение', desc: 'Ракеты наводятся в 1.5x лучше', cost: 700, requires: ['weapon_dmg'], icon: '🎯', color: 0xff6600 },
  { id: 'multi_shot', name: 'Множественный выстрел', desc: '20% шанс двойного выстрела', cost: 800, requires: ['weapon_dmg'], icon: '💥', color: 0xff2200 },
  { id: 'energy_regen', name: 'Регенерация энергии', desc: '+5 ед/с регенерации энергии', cost: 450, requires: ['energy_cap'], icon: '🔋', color: 0xaaff44 },
  { id: 'drone_capacity', name: 'Доп. дроны', desc: '+1 слот для дронов', cost: 600, requires: ['engine_boost'], icon: '🤖', color: 0x88aaff },
  { id: 'crit_shot', name: 'Критический удар', desc: '15% шанс крита (x2 урон)', cost: 900, requires: ['multi_shot'], icon: '💫', color: 0xffaa00 },
  { id: 'emp_shot', name: 'ЭМИ боеприпасы', desc: '10% шанс отключить щит врага', cost: 750, requires: ['hull_armor'], icon: '⚡', color: 0x44ffff },
  { id: 'cloak_tech', name: 'Технология маскировки', desc: 'Открывает модуль маскировки', cost: 1200, requires: ['drone_capacity', 'energy_regen'], icon: '👁', color: 0xaa44ff }
];

export class TechTreeScene extends Phaser.Scene {
  constructor() { super({ key: 'TechTreeScene' }); }

  create() {
    const W = this.scale.width, H = this.scale.height;
    this.save = SaveSystem.load();

    this.add.image(W/2, H/2, 'bg_stars').setDisplaySize(W, H).setAlpha(0.7);
    this.add.text(W/2, 24, '🔬 ТЕХНОЛОГИИ', { fontSize: '19px', fontFamily: 'Arial Black', color: '#44ffcc', stroke: '#004433', strokeThickness: 3 }).setOrigin(0.5);
    this.credText = this.add.text(W/2, 46, `Кредиты: ${this.save.credits} 💰`, { fontSize: '13px', fontFamily: 'Arial', color: '#ffcc44' }).setOrigin(0.5);

    TECH_TREE.forEach((tech, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const x = col === 0 ? 10 : W/2 + 4;
      const y = 68 + row * 82;
      if (y > H - 60) return;
      this._drawTechCard(x, y, W/2 - 14, 76, tech);
    });

    this.add.text(W/2, H - 16, '← КАРТА', {
      fontSize: '14px', fontFamily: 'Arial', color: '#8888aa', backgroundColor: '#0a0a1e', padding: { x: 10, y: 5 }
    }).setOrigin(0.5, 1).setInteractive()
      .on('pointerdown', () => { SaveSystem.save(this.save); this.scene.start('MainMenuScene'); });
  }

  _drawTechCard(x, y, w, h, tech) {
    const unlocked = this.save.unlockedTech.includes(tech.id);
    const reqsMet = tech.requires.every(r => this.save.unlockedTech.includes(r));
    const affordable = this.save.credits >= tech.cost;

    const bg = this.add.graphics();
    const bgCol = unlocked ? 0x0a1a0a : (reqsMet ? 0x0a0a1a : 0x050508);
    bg.fillStyle(bgCol, 0.9).fillRect(x, y, w, h);
    bg.lineStyle(1, unlocked ? 0x44aa44 : (reqsMet ? 0x4433aa : 0x222233)).strokeRect(x, y, w, h);

    // Иконка
    this.add.text(x + 14, y + h/2, tech.icon, { fontSize: '22px' }).setOrigin(0.5);

    // Текст
    const nameCol = unlocked ? '#44ff44' : (reqsMet ? '#ccaaff' : '#444455');
    this.add.text(x + 30, y + 8, tech.name, { fontSize: '12px', fontFamily: 'Arial Black', color: nameCol });
    this.add.text(x + 30, y + 24, tech.desc, { fontSize: '9px', fontFamily: 'Arial', color: '#777788', wordWrap: { width: w - 80 } });

    // Требования
    if (tech.requires.length > 0 && !unlocked) {
      const reqNames = tech.requires.map(r => TECH_TREE.find(t => t.id === r)?.name || r);
      this.add.text(x + 30, y + 46, `Требует: ${reqNames.join(', ')}`, { fontSize: '8px', fontFamily: 'Arial', color: '#555566' });
    }

    // Кнопка
    if (!unlocked) {
      const canBuy = reqsMet && affordable;
      const btnCol = canBuy ? '#ffdd44' : '#443333';
      const btn = this.add.text(x + w - 6, y + h - 10, canBuy ? `${tech.cost}💰` : `🔒`, {
        fontSize: '11px', fontFamily: 'Arial Black', color: btnCol
      }).setOrigin(1, 1);

      if (canBuy) {
        this.add.zone(x + w/2, y + h/2, w, h).setInteractive().on('pointerdown', () => {
          this.save.credits -= tech.cost;
          this.save.unlockedTech.push(tech.id);
          SaveSystem.save(this.save);
          this.scene.restart();
        });
      }
    } else {
      this.add.text(x + w - 6, y + h - 10, '✓ ИЗУЧЕНО', { fontSize: '9px', fontFamily: 'Arial', color: '#44ff44' }).setOrigin(1, 1);
    }
  }
}
