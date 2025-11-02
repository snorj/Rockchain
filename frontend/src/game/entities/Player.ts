import Phaser from 'phaser';
import type { PickaxeTier } from '../../utils/constants';
import { getPickaxeTextureKey } from '../../utils/pickaxeAssets';

/**
 * Player represents the character controlled by the player
 * Handles movement, animations, and mining state
 */
export class Player extends Phaser.GameObjects.Sprite {
  private speed: number = 120; // pixels per second
  private state: 'idle' | 'walking' | 'mining' = 'idle';
  private targetX?: number;
  private targetY?: number;
  private moveTween?: Phaser.Tweens.Tween;
  private currentOreTarget?: any; // Reference to ore being mined
  private pickaxeSprite?: Phaser.GameObjects.Sprite;
  private pickaxeTier: PickaxeTier = 0;
  
  constructor(scene: Phaser.Scene, x: number, y: number) {
    // Use a simple circle placeholder for now (can be replaced with character sprite)
    super(scene, x, y, 'player-placeholder');
    
    this.setScale(1.5);
    this.setDepth(10); // Always on top of ores
    this.setOrigin(0.5, 0.5);
    
    scene.add.existing(this);
    
    // Create placeholder visual if texture doesn't exist
    this.createPlaceholder();
    
    // Create pickaxe sprite
    this.createPickaxeSprite();
  }
  
  /**
   * Creates a simple placeholder visual
   */
  private createPlaceholder() {
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(0x4CAF50, 1);
    graphics.fillCircle(0, 0, 16);
    graphics.fillStyle(0x8B4513, 1);
    graphics.fillRect(-4, -8, 8, 12); // Pickaxe handle
    graphics.fillStyle(0x666666, 1);
    graphics.fillTriangle(-4, -8, 4, -8, 0, -16); // Pickaxe head
    
    // Generate texture from graphics
    graphics.generateTexture('player-placeholder', 32, 32);
    graphics.destroy();
    
    // Set the texture
    this.setTexture('player-placeholder');
  }
  
  /**
   * Create pickaxe sprite that follows the player
   */
  private createPickaxeSprite() {
    const textureKey = getPickaxeTextureKey(this.pickaxeTier);
    this.pickaxeSprite = this.scene.add.sprite(this.x + 12, this.y + 8, textureKey);
    this.pickaxeSprite.setScale(0.2);
    this.pickaxeSprite.setDepth(9); // Just below player
    this.pickaxeSprite.setOrigin(0.2, 0.8);
  }
  
  /**
   * Update pickaxe tier and visual
   */
  public setPickaxeTier(tier: PickaxeTier) {
    this.pickaxeTier = tier;
    
    if (this.pickaxeSprite) {
      const textureKey = getPickaxeTextureKey(tier);
      if (this.scene.textures.exists(textureKey)) {
        this.pickaxeSprite.setTexture(textureKey);
      }
    }
  }
  
  /**
   * Get current pickaxe tier
   */
  public getPickaxeTier(): PickaxeTier {
    return this.pickaxeTier;
  }
  
  /**
   * Move to target position
   * @param x Target x coordinate
   * @param y Target y coordinate
   * @param onComplete Callback when movement completes
   */
  public moveTo(x: number, y: number, onComplete?: () => void): boolean {
    if (this.state === 'mining') {
      console.log('Cannot move while mining');
      return false;
    }
    
    this.targetX = x;
    this.targetY = y;
    this.state = 'walking';
    
    const distance = Phaser.Math.Distance.Between(this.x, this.y, x, y);
    const duration = (distance / this.speed) * 1000;
    
    // Stop any existing movement
    this.moveTween?.stop();
    
    // Update rotation to face movement direction
    const angle = Phaser.Math.Angle.Between(this.x, this.y, x, y);
    this.setRotation(angle + Math.PI / 2); // +90 degrees to face forward
    
    // Update pickaxe rotation
    if (this.pickaxeSprite) {
      this.pickaxeSprite.setRotation(angle + Math.PI / 2);
    }
    
    // Create new movement tween
    this.moveTween = this.scene.tweens.add({
      targets: this,
      x: x,
      y: y,
      duration: duration,
      ease: 'Linear',
      onUpdate: () => {
        // Update pickaxe position to follow player
        if (this.pickaxeSprite) {
          const offsetX = Math.cos(angle) * 12;
          const offsetY = Math.sin(angle) * 12;
          this.pickaxeSprite.setPosition(this.x + offsetX, this.y + offsetY);
        }
      },
      onComplete: () => {
        this.state = 'idle';
        this.targetX = undefined;
        this.targetY = undefined;
        if (onComplete) onComplete();
      }
    });
    
    return true;
  }
  
  /**
   * Start mining animation
   * @param ore Reference to the ore being mined
   */
  public startMining(ore?: any) {
    if (this.state === 'mining') return;
    
    this.state = 'mining';
    this.currentOreTarget = ore;
    
    // Add mining animation (bounce effect)
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.6,
      scaleY: 1.4,
      duration: 150,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Animate pickaxe swinging
    if (this.pickaxeSprite) {
      this.scene.tweens.add({
        targets: this.pickaxeSprite,
        angle: '+=30',
        duration: 200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
    
    console.log('🔨 Player started mining');
  }
  
  /**
   * Stop mining animation
   */
  public stopMining() {
    if (this.state !== 'mining') return;
    
    this.state = 'idle';
    this.currentOreTarget = undefined;
    
    // Stop all mining tweens
    this.scene.tweens.killTweensOf(this);
    
    // Stop pickaxe animation
    if (this.pickaxeSprite) {
      this.scene.tweens.killTweensOf(this.pickaxeSprite);
      this.pickaxeSprite.setAngle(0);
    }
    
    // Reset scale
    this.setScale(1.5);
    
    console.log('✅ Player stopped mining');
  }
  
  /**
   * Check if player is at target position
   * @param x Target x coordinate
   * @param y Target y coordinate
   * @param threshold Distance threshold (pixels)
   * @returns True if player is within threshold of target
   */
  public isAtPosition(x: number, y: number, threshold: number = 5): boolean {
    return Phaser.Math.Distance.Between(this.x, this.y, x, y) < threshold;
  }
  
  /**
   * Get current player state
   */
  public getState(): 'idle' | 'walking' | 'mining' {
    return this.state;
  }
  
  /**
   * Check if player is currently mining
   */
  public isMining(): boolean {
    return this.state === 'mining';
  }
  
  /**
   * Check if player is currently walking
   */
  public isWalking(): boolean {
    return this.state === 'walking';
  }
  
  /**
   * Get current ore target being mined
   */
  public getOreTarget(): any {
    return this.currentOreTarget;
  }
  
  /**
   * Stop all current actions
   */
  public stopAllActions() {
    this.moveTween?.stop();
    this.scene.tweens.killTweensOf(this);
    this.state = 'idle';
    this.currentOreTarget = undefined;
    this.setScale(1.5);
  }
  
  /**
   * Override destroy to clean up
   */
  destroy(fromScene?: boolean) {
    this.stopAllActions();
    if (this.pickaxeSprite) {
      this.pickaxeSprite.destroy();
    }
    super.destroy(fromScene);
  }
}

