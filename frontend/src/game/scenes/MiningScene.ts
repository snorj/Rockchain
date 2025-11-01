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

  constructor() {
    super({ key: 'MiningScene' });
  }

  create() {
    console.log('🎮 MiningScene started');
    
    // Simple dark background (no tiles)
    this.cameras.main.setBackgroundColor('#1a1a2e');
    
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

