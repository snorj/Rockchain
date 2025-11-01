import Phaser from 'phaser';
import { ORE_CONFIG, ANIMATION_CONFIG } from '../../utils/constants';

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

    // Load ore sprite sheets (8 frames each, horizontal layout)
    this.load.spritesheet('ore-coal', '/assets/sprites/ores/coal-sheet.png', {
      frameWidth: 32,
      frameHeight: 32,
      endFrame: ANIMATION_CONFIG.ORE_FRAME_COUNT - 1
    });
    
    this.load.spritesheet('ore-iron', '/assets/sprites/ores/iron-sheet.png', {
      frameWidth: 32,
      frameHeight: 32,
      endFrame: ANIMATION_CONFIG.ORE_FRAME_COUNT - 1
    });
    
    this.load.spritesheet('ore-diamond', '/assets/sprites/ores/diamond-sheet.png', {
      frameWidth: 32,
      frameHeight: 32,
      endFrame: ANIMATION_CONFIG.ORE_FRAME_COUNT - 1
    });
    
    // Load background tiles
    this.load.image('wall-cave', '/assets/tilesets/Wall - cave.png');
    this.load.image('ground', '/assets/tilesets/Ground - normal.png');
    
    // Load torch sprites
    this.load.image('torch-1', '/assets/sprites/props/torch 1.png');
    this.load.image('torch-2', '/assets/sprites/props/torch 2.png');
  }

  create() {
    // Create mining animations for each ore type
    this.createMiningAnimation('coal', ORE_CONFIG.MINING_TIMES.coal);
    this.createMiningAnimation('iron', ORE_CONFIG.MINING_TIMES.iron);
    this.createMiningAnimation('diamond', ORE_CONFIG.MINING_TIMES.diamond);
    
    // Create torch flicker animation
    this.anims.create({
      key: 'torch-flicker',
      frames: [
        { key: 'torch-1' },
        { key: 'torch-2' }
      ],
      frameRate: 1000 / ANIMATION_CONFIG.TORCH_FLICKER_SPEED,
      repeat: -1
    });
    
    // All assets loaded, start the main game scene
    this.scene.start('MiningScene');
  }

  /**
   * Creates a mining animation for a specific ore type
   * @param oreType - Type of ore (coal, iron, diamond)
   * @param duration - Animation duration in milliseconds
   */
  private createMiningAnimation(oreType: string, duration: number) {
    this.anims.create({
      key: `mine-${oreType}`,
      frames: this.anims.generateFrameNumbers(`ore-${oreType}`, {
        start: 0,
        end: ANIMATION_CONFIG.ORE_FRAME_COUNT - 1
      }),
      duration,
      repeat: 0
    });
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

