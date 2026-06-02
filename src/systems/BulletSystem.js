export class BulletSystem {
  constructor(scene) {
    this.scene = scene;
    this.W = scene.scale.width;
    this.H = scene.scale.height;
  }

  update() {
    const pad = 20;
    const cleanup = (group) => {
      group.getChildren().forEach(b => {
        if (!b.active) return;
        if (b.x < -pad || b.x > this.W + pad || b.y < -pad || b.y > this.H + pad) {
          b.destroy();
        }
      });
    };
    cleanup(this.scene.playerBullets);
    cleanup(this.scene.enemyBullets);
  }
}
