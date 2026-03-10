import Phaser from 'phaser';

export default class DemoScene extends Phaser.Scene {
  constructor() {
    super({ key: 'DemoScene' });
  }

  create() {
    this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      '🎮 Mini-jogo pronto!',
      { fontSize: '32px', color: '#00ff88', fontFamily: 'monospace' }
    ).setOrigin(0.5);
  }
}
