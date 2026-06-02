import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { StarMapScene } from './scenes/StarMapScene';
import { CombatScene } from './scenes/CombatScene';
import { HangarScene } from './scenes/HangarScene';
import { ShopScene } from './scenes/ShopScene';
import { TechTreeScene } from './scenes/TechTreeScene';
import { UIScene } from './scenes/UIScene';

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 480,
  height: 854,
  backgroundColor: '#000011',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 480,
    height: 854
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [
    BootScene,
    PreloadScene,
    MainMenuScene,
    StarMapScene,
    CombatScene,
    HangarScene,
    ShopScene,
    TechTreeScene,
    UIScene
  ]
};

new Phaser.Game(config);
