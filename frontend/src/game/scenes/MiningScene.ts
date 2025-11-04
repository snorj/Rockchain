import Phaser from 'phaser';
import { OreSpawner } from '../managers/OreSpawner';
import { OreNode } from '../entities/OreNode';
import { useGameStore } from '../../store/gameStore';
import type { MaterialType } from '../config/materials';
import type { LevelId } from '../config/levels';
import type { PickaxeTier } from '../config/pickaxes';
import { PICKAXES } from '../config/pickaxes';
/**
 * MiningScene - Click to mine ores with continuous progress
 * Supports mining multiple ores simultaneously
 */
export class MiningScene extends Phaser.Scene {
  private oreSpawner!: OreSpawner;
  private background!: Phaser.GameObjects.Image;
  
  // Multiple mining targets
  private miningOres: Set<OreNode> = new Set();
  private pickaxeSprites: Map<OreNode, Phaser.GameObjects.Image> = new Map();
  
  // Level timer
  private levelTimer: Phaser.Time.TimerEvent | null = null;
  
  // Track mining start times for duration calculation
  private miningStartTimes: Map<OreNode, number> = new Map();
  
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
    
    // Store reference in window for React components
    (window as any).miningScene = this;
    
    // Emit scene ready
    this.events.emit('scene-ready');
  }

  /**
   * Create background image based on current level
   */
  private createBackground() {
    const gameState = useGameStore.getState();
    const backgroundKey = `bg-level-${gameState.currentLevel}`;
    
    // Create background image
    this.background = this.add.image(400, 300, backgroundKey);
    
    // Scale to fit the game canvas (800x600)
    this.background.setDisplaySize(800, 600);
    this.background.setDepth(-10);
    
    // Apply subtle blur effect to background
    this.background.preFX?.addBlur(0, 1, 1, 0.5, 0xffffff, 2);
  }

  /**
   * Setup level timer if current level has an active session
   */
  private setupLevelTimer() {
    const gameState = useGameStore.getState();
    
    // Check for active session (per-minute pricing)
    if (gameState.activeSession && gameState.activeSession.active) {
      const timeRemaining = gameState.activeSession.endTime - Date.now();
      
      if (timeRemaining > 0) {
        // Set up countdown
        this.levelTimer = this.time.addEvent({
          delay: timeRemaining,
          callback: this.onSessionExpired,
          callbackScope: this
        });
        
        console.log(`⏱️  Session expires in ${Math.floor(timeRemaining / 1000)}s`);
      } else {
        // Already expired
        this.onSessionExpired();
      }
    }
    // Fallback to legacy levelExpiry for compatibility
    else if (gameState.levelExpiry) {
      const timeRemaining = gameState.levelExpiry - Date.now();
      
      if (timeRemaining > 0) {
        this.levelTimer = this.time.addEvent({
          delay: timeRemaining,
          callback: this.onLevelExpired,
          callbackScope: this
        });
        
        console.log(`⏰ Level expires in ${Math.floor(timeRemaining / 1000)}s`);
      } else {
        this.onLevelExpired();
      }
    }
  }

  /**
   * Called when mining session expires (per-minute pricing)
   */
  private onSessionExpired() {
    console.log('⏱️  Mining session expired!');
    
    // Emit event for UI to show notification
    this.events.emit('session-expired');
    
    // Clear session and return to level 1
    useGameStore.getState().clearSession();
    
    // Switch scene to level 1
    this.switchToLevel(1);
  }

  /**
   * Called when level access expires (legacy)
   */
  private onLevelExpired() {
    console.log('⏰ Level access expired!');
    
    // Emit event for UI to show modal
    this.events.emit('level-expired');
    
    // Clear expiry and return to level 1
    useGameStore.getState().setLevel(1); // This clears expiry
    
    // Switch scene to level 1
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
    
    // Validate session access (for levels 2+)
    const gameState = useGameStore.getState();
    if (gameState.currentLevel > 1) {
      // Check if session is active and not expired
      if (!gameState.activeSession || !gameState.activeSession.active) {
        console.warn('⚠️  No active session - cannot mine');
        return;
      }
      
      if (Date.now() >= gameState.activeSession.endTime) {
        console.warn('⚠️  Session expired - cannot mine');
        this.onSessionExpired();
        return;
      }
    }
    
    // Check if clicked on an ore
    const clickedOre = this.oreSpawner.getOreAt(pointer.x, pointer.y);
    const hitOre = clickedOre && !clickedOre.getIsMining();
    
    if (hitOre) {
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
    
    // Track mining start time
    this.miningStartTimes.set(ore, Date.now());
    
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
    pickaxeSprite.setOrigin(0.5, 1.0); // Pivot point at bottom middle for swinging
    pickaxeSprite.setDepth(100);
    
    // Randomly flip pickaxe horizontally (50% chance)
    const isFlipped = Math.random() > 0.5;
    if (isFlipped) {
      pickaxeSprite.setFlipX(true);
    }
    
    // Offset pickaxe: half width right (or left if flipped), quarter height down
    const horizontalOffset = isFlipped ? -0.5 : 0.5;
    pickaxeSprite.x += pickaxeSprite.displayWidth * horizontalOffset;
    pickaxeSprite.y += pickaxeSprite.displayHeight * 0.25;
    
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
    
    // Clean up tracking
    this.miningStartTimes.delete(data.node);
    
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
   * Note: If levelExpiry is already set in store (e.g., from purchase), it will be preserved
   */
  public switchToLevel(levelId: LevelId) {
    console.log(`🏔️  Switching to level ${levelId}`);
    
    // Stop all current mining
    this.stopAllMining();
    
    // Only update level ID in store, preserving any existing expiry
    // (expiry is set by purchaseLevelAccess before switchToLevel is called)
    const currentState = useGameStore.getState();
    if (levelId !== currentState.currentLevel) {
      // Don't call setLevel here as it would clear the expiry that was just set
      // Instead, manually update only the currentLevel
      useGameStore.setState({ currentLevel: levelId });
    }
    
    // Update spawner
    this.oreSpawner.setLevel(levelId);
    
    // Respawn all ores
    this.oreSpawner.spawnInitialOres();
    
    // Update background image
    const backgroundKey = `bg-level-${levelId}`;
    this.background.setTexture(backgroundKey);
    this.background.setDisplaySize(800, 600);
    
    // Reapply subtle blur effect to new background
    this.background.preFX?.clear();
    this.background.preFX?.addBlur(0, 1, 1, 0.5, 0xffffff, 2);
    
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
    // Guard check: ensure oreSpawner is initialized
    if (!this.oreSpawner) {
      console.warn('⚠️  Cannot set pickaxe tier: scene not fully initialized yet');
      return;
    }
    
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
