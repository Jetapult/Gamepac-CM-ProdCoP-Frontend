import { Scene } from 'phaser';

export default class PreloaderScene extends Scene {
  constructor() {
    super({ key: 'Preload' });
    this.loadComplete = false;
  }

  preload() {
    // Create loading text
    this.loadingText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      'Loading...',
      { fontSize: '32px', fill: '#fff' }
    ).setOrigin(0.5);

    // Load spritesheet
    const img = new Image();
    img.onload = () => {
      this.textures.addImage('spritesheetname', img);
      this.loadComplete = true;
    };
    img.src = window.SPRITE_DATA;
  }

  create() {
    if (this.loadComplete) {
      this.scene.start('Main');
    } else {
      this.time.delayedCall(100, () => this.create());
    }
  }
}