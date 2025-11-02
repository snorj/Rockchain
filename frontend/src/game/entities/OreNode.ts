import Phaser from 'phaser';
import type { MaterialType } from '../config/materials';
import { MATERIALS, getMiningTime } from '../config/materials';

/**
 * OreNode represents a clickable ore/gem on screen
 * Uses continuous time-based mining progress
 */
export class OreNode extends Phaser.GameObjects.Container {
  private material: MaterialType;
  private sprite: Phaser.GameObjects.Image;
  private progressBarBg!: Phaser.GameObjects.Graphics;
  private progressBarFill!: Phaser.GameObjects.Graphics;
  private progressText!: Phaser.GameObjects.Text;
  
  private miningDuration: number = 0; // Total time to mine in ms
  private miningProgress: number = 0; // Current progress (0 to miningDuration)
  private isMining: boolean = false;
  
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    material: MaterialType,
    spriteKey: string
  ) {
    super(scene, x, y);
    
    this.material = material;
    
    // Create ore sprite
    this.sprite = scene.add.image(0, 0, spriteKey);
    this.sprite.setScale(3); // Scale up pixel art
    this.add(this.sprite);
    
    // Make interactive
    this.sprite.setInteractive({ useHandCursor: true });
    this.setSize(this.sprite.width * 3, this.sprite.height * 3);
    
    // Add hover effect
    this.sprite.on('pointerover', () => {
      this.sprite.setTint(0xcccccc);
    });
    
    this.sprite.on('pointerout', () => {
      this.sprite.clearTint();
    });
    
    // Create progress bar (hidden initially)
    this.createProgressBar();
    
    scene.add.existing(this);
  }
  
  /**
   * Create progress bar above ore
   */
  private createProgressBar() {
    const barWidth = 60;
    const barHeight = 8;
    const barY = -40;
    
    // Background
    this.progressBarBg = this.scene.add.graphics();
    this.progressBarBg.fillStyle(0x000000, 0.7);
    this.progressBarBg.fillRect(-barWidth / 2, barY, barWidth, barHeight);
    this.add(this.progressBarBg);
    
    // Fill
    this.progressBarFill = this.scene.add.graphics();
    this.add(this.progressBarFill);
    
    // Text showing percentage
    this.progressText = this.scene.add.text(0, barY - 2, '', {
      fontSize: '10px',
      color: '#ffffff',
      fontFamily: 'Pixelify Sans, Arial',
      stroke: '#000000',
      strokeThickness: 2
    });
    this.progressText.setOrigin(0.5);
    this.add(this.progressText);
    
    // Hide initially
    this.hideProgressBar();
  }
  
  /**
   * Show progress bar
   */
  private showProgressBar() {
    this.progressBarBg.setVisible(true);
    this.progressBarFill.setVisible(true);
    this.progressText.setVisible(true);
    this.updateProgressBar();
  }
  
  /**
   * Hide progress bar
   */
  private hideProgressBar() {
    this.progressBarBg.setVisible(false);
    this.progressBarFill.setVisible(false);
    this.progressText.setVisible(false);
  }
  
  /**
   * Update progress bar based on current progress
   */
  private updateProgressBar() {
    // Safety check - don't update if graphics are destroyed
    if (!this.progressBarFill || !this.progressText || !this.scene) {
      return;
    }
    
    const barWidth = 60;
    const barHeight = 8;
    const barY = -40;
    const progress = this.miningProgress / this.miningDuration;
    
    // Clear and redraw fill
    this.progressBarFill.clear();
    this.progressBarFill.fillStyle(MATERIALS[this.material].tier >= 4 ? 0xffaa00 : 0x00ff00, 1);
    this.progressBarFill.fillRect(-barWidth / 2, barY, barWidth * progress, barHeight);
    
    // Update text with percentage
    const percentage = Math.floor(progress * 100);
    this.progressText.setText(`${percentage}%`);
  }
  
  /**
   * Start mining this ore with given pickaxe speed
   */
  public startMining(pickaxeSpeed: number): void {
    if (this.isMining) return;
    
    this.isMining = true;
    this.miningDuration = getMiningTime(this.material, pickaxeSpeed);
    this.miningProgress = 0;
    
    this.showProgressBar();
    
    // Pulse effect when mining starts
    this.scene.tweens.add({
      targets: this.sprite,
      scale: { from: 3, to: 3.1 },
      duration: 150,
      yoyo: true
    });
  }
  
  /**
   * Update mining progress (called every frame)
   * Returns true if mining is complete
   */
  public updateMining(delta: number): boolean {
    if (!this.isMining) return false;
    
    this.miningProgress += delta;
    
    // Update progress bar
    this.updateProgressBar();
    
    // Continuous shake effect while mining
    const shakeIntensity = 0.5;
    this.sprite.x = (Math.random() - 0.5) * shakeIntensity;
    this.sprite.y = (Math.random() - 0.5) * shakeIntensity;
    
    // Check if complete
    if (this.miningProgress >= this.miningDuration) {
      this.onMiningComplete();
      return true;
    }
    
    return false;
  }
  
  /**
   * Called when mining is complete
   */
  private onMiningComplete() {
    // Reset shake
    this.sprite.x = 0;
    this.sprite.y = 0;
    
    // Hide progress bar
    this.hideProgressBar();
    
    // Get the collected material sprite (tile09)
    const materialSpriteKey = `${this.material}-object`;
    
    // Create flying material icon
    const icon = this.scene.add.image(this.x, this.y, materialSpriteKey);
    icon.setScale(2.5);
    
    // Animate to top-left (inventory area)
    this.scene.tweens.add({
      targets: icon,
      x: 100,
      y: 50,
      scale: 0.8,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => {
        icon.destroy();
      }
    });
    
    // Particles effect
    this.createBreakParticles();
    
    // Emit event
    this.scene.events.emit('ore-mined', {
      material: this.material,
      value: MATERIALS[this.material].goldValue,
      node: this
    });
    
    // Destroy this node
    this.destroy();
  }
  
  /**
   * Create particle effect when ore breaks
   */
  private createBreakParticles() {
    const color = parseInt(MATERIALS[this.material].color.replace('#', ''), 16);
    
    const particles = this.scene.add.particles(this.x, this.y, 'particle', {
      speed: { min: 50, max: 150 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 600,
      quantity: 15,
      tint: color
    });
    
    // Clean up after emission
    this.scene.time.delayedCall(700, () => {
      particles.destroy();
    });
  }
  
  /**
   * Stop mining (if player clicks elsewhere or switches levels)
   */
  public stopMining() {
    if (!this.isMining) return;
    
    this.isMining = false;
    this.miningProgress = 0;
    this.hideProgressBar();
    
    // Reset sprite position
    this.sprite.x = 0;
    this.sprite.y = 0;
  }
  
  /**
   * Get material type
   */
  public getMaterial(): MaterialType {
    return this.material;
  }
  
  /**
   * Check if currently being mined
   */
  public getIsMining(): boolean {
    return this.isMining;
  }
  
  /**
   * Get mining progress (0 to 1)
   */
  public getMiningProgress(): number {
    return this.miningDuration > 0 ? this.miningProgress / this.miningDuration : 0;
  }
  
  /**
   * Get sprite for click detection
   */
  public getSprite(): Phaser.GameObjects.Image {
    return this.sprite;
  }
}
