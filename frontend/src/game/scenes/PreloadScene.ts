import Phaser from 'phaser';
import { ANIMATION_CONFIG } from '../../utils/constants';

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

    // Load individual ore frames (8 frames per ore type: 0-7)
    const oreTypes = ['coal', 'iron', 'diamond'];
    
    oreTypes.forEach(oreType => {
      for (let i = 0; i < ANIMATION_CONFIG.ORE_FRAME_COUNT; i++) {
        this.load.image(
          `ore-${oreType}-${i}`,
          `/assets/sprites/ores/${oreType}_${i}.png`
        );
      }
    });

    // Export inventory icon textures to window for React components to use
    this.load.on('complete', () => {
      const textures = {
        coal: `/assets/sprites/ores/coal_4.png`,
        iron: `/assets/sprites/ores/iron_7.png`,
        diamond: `/assets/sprites/ores/diamond_7.png`
      };
      (window as any).oreIconTextures = textures;
    });
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

