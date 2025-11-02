import Phaser from 'phaser';
import { OreSpawner } from '../managers/OreSpawner';
import { useGameStore } from '../../store/gameStore';
import type { OreMined } from '../../types/game.types';
import type { OreType } from '../../utils/constants';

/**
 * MiningScene is the main gameplay scene
 * Handles background, ore spawning, and game loop
 */
export class MiningScene extends Phaser.Scene {
  private oreSpawner!: OreSpawner;
  private background!: Phaser.GameObjects.TileSprite;

  constructor() {
    super({ key: 'MiningScene' });
  }

  create() {
    console.log('🎮 MiningScene started');
    
    // Add tiled background
    this.createBackground();
    
    // Add title text
    this.createTitleText();
    
    // Initialize ore spawner
    this.oreSpawner = new OreSpawner(this);
    this.oreSpawner.spawnInitialOres();
    
    // Listen for ore mined events
    this.events.on('ore-mined', this.handleOreMined, this);
  }

  /**
   * Creates the cave background using stone texture
   */
  private createBackground() {
    // Stone texture background
    this.background = this.add.tileSprite(
      400, 300,
      800, 600,
      'stone-background'
    );
    this.background.setAlpha(0.95);
    
    // Subtle background animation for depth
    this.tweens.add({
      targets: this.background,
      tilePositionX: 5,
      tilePositionY: 5,
      duration: 30000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }


  /**
   * Creates title text
   */
  private createTitleText() {
    const title = this.add.text(400, 30, 'ROCKCHAIN MINING', {
      fontSize: '32px',
      color: '#ffcc00',
      fontFamily: 'Arial Black',
      stroke: '#000000',
      strokeThickness: 4
    });
    title.setOrigin(0.5);
    
    // Subtle pulse effect
    this.tweens.add({
      targets: title,
      scale: 1.05,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Instructions
    const instructions = this.add.text(400, 570, 'Click ores to mine them!', {
      fontSize: '16px',
      color: '#cccccc',
      fontFamily: 'Arial'
    });
    instructions.setOrigin(0.5);
  }

  /**
   * Handles ore mined event
   * Updates game store and spawns new ore
   */
  private handleOreMined(data: OreMined) {
    console.log(`✨ Mined ${data.oreType} (worth ${data.value} GLD)`);
    
    // Update game store
    useGameStore.getState().addOre(data.oreType as OreType);
    
    // Spawn a replacement ore after a short delay
    this.time.delayedCall(500, () => {
      this.oreSpawner.spawnRandomOre();
    });
  }

  /**
   * Update loop
   */
  update(_time: number, _delta: number) {
    // Game loop updates can go here if needed
  }

  /**
   * Clean up when scene is shut down
   */
  shutdown() {
    this.events.off('ore-mined', this.handleOreMined, this);
    if (this.oreSpawner) {
      this.oreSpawner.destroy();
    }
  }
}

