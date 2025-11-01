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
    
    // Add decorative torches
    this.createTorches();
    
    // Add title text
    this.createTitleText();
    
    // Initialize ore spawner
    this.oreSpawner = new OreSpawner(this);
    this.oreSpawner.spawnInitialOres();
    
    // Listen for ore mined events
    this.events.on('ore-mined', this.handleOreMined, this);
    
    // Debug info
    if (import.meta.env.DEV) {
      this.createDebugInfo();
    }
  }

  /**
   * Creates the cave background using tiled sprites
   */
  private createBackground() {
    // Cave wall background
    this.background = this.add.tileSprite(
      400, 300,
      800, 600,
      'wall-cave'
    );
    this.background.setAlpha(0.8);
    
    // Add ground overlay
    const ground = this.add.tileSprite(
      400, 300,
      800, 600,
      'ground'
    );
    ground.setAlpha(0.3);
    
    // Subtle background animation
    this.tweens.add({
      targets: this.background,
      tilePositionX: 10,
      duration: 20000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  /**
   * Creates decorative animated torches
   */
  private createTorches() {
    // Left torches
    const torch1 = this.add.sprite(60, 80, 'torch-1');
    torch1.setScale(2);
    torch1.play('torch-flicker');
    
    const torch2 = this.add.sprite(60, 520, 'torch-1');
    torch2.setScale(2);
    torch2.play('torch-flicker');
    
    // Right torches
    const torch3 = this.add.sprite(740, 80, 'torch-1');
    torch3.setScale(2);
    torch3.play('torch-flicker');
    
    const torch4 = this.add.sprite(740, 520, 'torch-1');
    torch4.setScale(2);
    torch4.play('torch-flicker');
    
    // Add glow effect to torches
    [torch1, torch2, torch3, torch4].forEach(torch => {
      const glow = this.add.circle(torch.x, torch.y + 5, 30, 0xff6600, 0.1);
      
      // Pulsing glow
      this.tweens.add({
        targets: glow,
        alpha: 0.2,
        scale: 1.2,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
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
   * Creates debug information overlay (dev mode only)
   */
  private createDebugInfo() {
    const debugText = this.add.text(10, 10, '', {
      fontSize: '14px',
      color: '#00ff00',
      fontFamily: 'monospace',
      backgroundColor: '#000000',
      padding: { x: 5, y: 5 }
    });
    
    // Update debug info every frame
    this.events.on('update', () => {
      const fps = Math.round(this.game.loop.actualFps);
      const oreCount = this.oreSpawner.getActiveOreCount();
      const inventory = useGameStore.getState().inventory;
      
      debugText.setText([
        `FPS: ${fps}`,
        `Active Ores: ${oreCount}`,
        `Inventory: C:${inventory.coal} I:${inventory.iron} D:${inventory.diamond}`
      ]);
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

