import Phaser from 'phaser';

/**
 * PreloadScene handles loading all game assets
 * This scene loads sprites, tilesets, and creates animations
 */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    // Create loading bar
    this.createLoadingBar();

    // Load specific ore frames from the new file structure
    // Coal: frames 05-08
    for (let i = 5; i <= 8; i++) {
      this.load.image(
        `ore-coal-${i}`,
        `/assets/sprites/ores/coal/coal0${i}.png`
      );
    }
    
    // Iron: frames 07-08
    for (let i = 7; i <= 8; i++) {
      this.load.image(
        `ore-iron-${i}`,
        `/assets/sprites/ores/iron/iron0${i}.png`
      );
    }
    
    // Diamond: frames 05-08
    for (let i = 5; i <= 8; i++) {
      this.load.image(
        `ore-diamond-${i}`,
        `/assets/sprites/ores/diamond/diamond0${i}.png`
      );
    }
    
    // Load inventory icons
    this.load.image('inventory-coal', '/assets/sprites/ores/coal/coal04.png');
    this.load.image('inventory-iron', '/assets/sprites/ores/iron/iron09.png');
    this.load.image('inventory-diamond', '/assets/sprites/ores/diamond/diamond09.png');
  }

  create() {
    // All assets loaded, start the main game scene
    // Note: We're using individual frame images instead of sprite sheet animations
    this.scene.start('MiningScene');
  }

  /**
   * Creates a visual loading bar
   */
  private createLoadingBar() {
    const width = 400;
    const height = 30;
    const x = this.cameras.main.centerX - width / 2;
    const y = this.cameras.main.centerY;

    // Background
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(x, y, width, height);

    // Progress bar
    const progressBar = this.add.graphics();

    // Loading text
    const loadingText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY - 50,
      'Loading Rockchain...',
      {
        fontSize: '20px',
        color: '#ffffff',
        fontFamily: 'Arial'
      }
    );
    loadingText.setOrigin(0.5, 0.5);

    // Update progress bar as assets load
    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0x00ff00, 1);
      progressBar.fillRect(x, y, width * value, height);
    });

    // Clean up when loading is complete
    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });
  }
}

