import Phaser from 'phaser';
import { OreSpawner } from '../managers/OreSpawner';
import { OreNode } from '../entities/OreNode';
import { useGameStore } from '../../store/gameStore';
import type { MaterialType } from '../config/materials';
import type { LevelId } from '../config/levels';
import { LEVELS } from '../config/levels';
import type { PickaxeTier } from '../config/pickaxes';
import { PICKAXES } from '../config/pickaxes';

/**
 * MiningScene - Click to mine ores with continuous progress
 * Supports mining multiple ores simultaneously
 */
export class MiningScene extends Phaser.Scene {
  private oreSpawner!: OreSpawner;
  private background!: Phaser.GameObjects.Graphics;
  
  // Multiple mining targets
  private miningOres: Set<OreNode> = new Set();
  private pickaxeSprites: Map<OreNode, Phaser.GameObjects.Image> = new Map();
  
  // Level timer
  private levelTimer: Phaser.Time.TimerEvent | null = null;
  
  constructor() {
    super({ key: 'MiningScene' });
  }

  create() {
    console.log('🎮 MiningScene started (no player mode)');
    
    // Create simple gradient background
    this.createBackground();
    
    // Initialize ore spawner
    this.oreSpawner = new OreSpawner(this);
    
    // Get initial state from store
    const gameState = useGameStore.getState();
    this.oreSpawner.setLevel(gameState.currentLevel);
    this.oreSpawner.setPickaxe(gameState.currentPickaxe);
    
    // Spawn initial ores
    this.oreSpawner.spawnInitialOres();
    
    // Handle click events for mining
    this.input.on('pointerdown', this.handleClick, this);
    
    // Listen for ore mined events
    this.events.on('ore-mined', this.handleOreMined, this);
    
    // Setup level timer if applicable
    this.setupLevelTimer();
    
    // Emit scene ready
    this.events.emit('scene-ready');
  }

  /**
   * Create simple gradient background based on current level
   */
  private createBackground() {
    const gameState = useGameStore.getState();
    const level = LEVELS[gameState.currentLevel];
    
    this.background = this.add.graphics();
    
    // Create gradient from dark to slightly lighter
    const colorTop = parseInt(level.backgroundColor.replace('#', ''), 16);
    const colorBottom = this.lightenColor(colorTop, 20);
    
    this.background.fillGradientStyle(colorTop, colorTop, colorBottom, colorBottom, 1);
    this.background.fillRect(0, 0, 800, 600);
    this.background.setDepth(-10);
  }

  /**
   * Lighten a color by a percentage
   */
  private lightenColor(color: number, percent: number): number {
    const r = Math.min(255, ((color >> 16) & 0xff) + percent);
    const g = Math.min(255, ((color >> 8) & 0xff) + percent);
    const b = Math.min(255, (color & 0xff) + percent);
    return (r << 16) | (g << 8) | b;
  }

  /**
   * Setup level timer if current level has expiry
   */
  private setupLevelTimer() {
    const gameState = useGameStore.getState();
    
    if (gameState.levelExpiry) {
      const timeRemaining = gameState.levelExpiry - Date.now();
      
      if (timeRemaining > 0) {
        // Set up countdown
        this.levelTimer = this.time.addEvent({
          delay: timeRemaining,
          callback: this.onLevelExpired,
          callbackScope: this
        });
        
        console.log(`⏰ Level expires in ${Math.floor(timeRemaining / 1000)}s`);
      } else {
        // Already expired
        this.onLevelExpired();
      }
    }
  }

  /**
   * Called when level access expires
   */
  private onLevelExpired() {
    console.log('⏰ Level access expired!');
    
    // Emit event for UI to show modal
    this.events.emit('level-expired');
    
    // Return to level 1
    this.switchToLevel(1);
  }

  /**
   * Handle click on screen
   */
  private handleClick(pointer: Phaser.Input.Pointer) {
    // Ignore clicks on UI areas (top 70px and bottom 50px)
    if (pointer.y < 70 || pointer.y > 550) {
      return;
    }
    
    // Check if clicked on an ore
    const clickedOre = this.oreSpawner.getOreAt(pointer.x, pointer.y);
    
    if (clickedOre && !clickedOre.getIsMining()) {
      this.startMiningOre(clickedOre, pointer.x, pointer.y);
    }
  }

  /**
   * Start mining an ore
   */
  private startMiningOre(ore: OreNode, clickX: number, clickY: number) {
    // Get current pickaxe speed
    const gameState = useGameStore.getState();
    const pickaxeConfig = PICKAXES[gameState.currentPickaxe];
    
    // Start mining the ore
    ore.startMining(pickaxeConfig.miningSpeed);
    
    // Add to mining set
    this.miningOres.add(ore);
    
    // Show pickaxe animation
    this.showPickaxeSwing(ore, clickX, clickY);
    
    console.log(`⛏️  Started mining ${ore.getMaterial()} (${this.miningOres.size} ores mining)`);
  }

  /**
   * Show pickaxe swing animation at ore position
   */
  private showPickaxeSwing(ore: OreNode, x: number, y: number) {
    const gameState = useGameStore.getState();
    const pickaxeConfig = PICKAXES[gameState.currentPickaxe];
    
    // Use actual pickaxe sprite based on current tier
    const pickaxeTextureKey = `pickaxe-${pickaxeConfig.id}`;
    
    // Create pickaxe sprite for this ore
    const pickaxeSprite = this.add.image(x, y + 30, pickaxeTextureKey);
    pickaxeSprite.setScale(0.2); // Much smaller pickaxe
    pickaxeSprite.setOrigin(0.3, 0.3); // Pivot point for rotation
    pickaxeSprite.setDepth(100);
    
    // Store reference
    this.pickaxeSprites.set(ore, pickaxeSprite);
    
    // Continuous swing animation while mining
    this.tweens.add({
      targets: pickaxeSprite,
      rotation: { from: -0.5, to: 0.3 },
      duration: 400,
      ease: 'Power2',
      yoyo: true,
      repeat: -1 // Infinite loop
    });
  }

  /**
   * Handle ore mined event
   */
  private handleOreMined(data: { material: MaterialType; value: number; node: OreNode }) {
    console.log(`✨ Mined ${data.material} (worth ${data.value} gold)`);
    
    // Add to inventory
    useGameStore.getState().addMaterial(data.material);
    
    // Remove from mining set
    this.miningOres.delete(data.node);
    
    // Clean up pickaxe sprite
    const pickaxeSprite = this.pickaxeSprites.get(data.node);
    if (pickaxeSprite) {
      pickaxeSprite.destroy();
      this.pickaxeSprites.delete(data.node);
    }
    
    // Remove ore from spawner
    this.oreSpawner.removeOre(data.node);
    
    // Spawn replacement ore after short delay
    this.time.delayedCall(300, () => {
      this.oreSpawner.maintainOreCount();
    });
  }

  /**
   * Switch to a different level (called externally)
   */
  public switchToLevel(levelId: LevelId) {
    console.log(`🏔️  Switching to level ${levelId}`);
    
    // Stop all current mining
    this.stopAllMining();
    
    // Update spawner
    this.oreSpawner.setLevel(levelId);
    
    // Respawn all ores
    this.oreSpawner.spawnInitialOres();
    
    // Update background
    this.background.clear();
    const level = LEVELS[levelId];
    const colorTop = parseInt(level.backgroundColor.replace('#', ''), 16);
    const colorBottom = this.lightenColor(colorTop, 20);
    this.background.fillGradientStyle(colorTop, colorTop, colorBottom, colorBottom, 1);
    this.background.fillRect(0, 0, 800, 600);
    
    // Setup new timer if needed
    if (this.levelTimer) {
      this.levelTimer.destroy();
      this.levelTimer = null;
    }
    this.setupLevelTimer();
  }

  /**
   * Update pickaxe tier (called externally when player upgrades)
   */
  public setPickaxeTier(pickaxe: PickaxeTier) {
    this.oreSpawner.setPickaxe(pickaxe);
    console.log(`⛏️  Updated pickaxe to ${pickaxe}`);
    
    // Stop all current mining since speed has changed
    this.stopAllMining();
  }

  /**
   * Stop all mining operations
   */
  private stopAllMining() {
    // Stop each ore
    this.miningOres.forEach(ore => {
      ore.stopMining();
    });
    
    // Destroy all pickaxe sprites
    this.pickaxeSprites.forEach(sprite => {
      sprite.destroy();
    });
    
    // Clear sets
    this.miningOres.clear();
    this.pickaxeSprites.clear();
  }

  /**
   * Get reference to ore spawner (for external access)
   */
  public getOreSpawner(): OreSpawner {
    return this.oreSpawner;
  }

  /**
   * Update loop - updates all mining ores
   */
  update(_time: number, delta: number) {
    // Update all ores being mined
    const completedOres: OreNode[] = [];
    
    this.miningOres.forEach(ore => {
      const isComplete = ore.updateMining(delta);
      if (isComplete) {
        completedOres.push(ore);
      }
    });
    
    // The ore-mined event will handle cleanup
    // (we just track which ones completed)
  }

  /**
   * Clean up when scene shuts down
   */
  shutdown() {
    this.events.off('ore-mined', this.handleOreMined, this);
    this.input.off('pointerdown', this.handleClick, this);
    
    this.stopAllMining();
    
    if (this.levelTimer) {
      this.levelTimer.destroy();
    }
    
    if (this.oreSpawner) {
      this.oreSpawner.destroy();
    }
  }
}
