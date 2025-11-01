import Phaser from 'phaser';
import type { OreType } from '../../utils/constants';
import { ORE_CONFIG } from '../../utils/constants';

/**
 * OreNode represents a mineable ore in the game
 * Handles click interaction, mining animation, and progress display
 */
export class OreNode extends Phaser.GameObjects.Sprite {
  private oreType: OreType;
  private isMining: boolean = false;
  private progressBar?: Phaser.GameObjects.Graphics;
  private progressTween?: Phaser.Tweens.Tween;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    oreType: OreType
  ) {
    // Randomly select a frame from the specified range for each ore type
    const frame = OreNode.getRandomFrame(oreType);
    super(scene, x, y, `ore-${oreType}-${frame}`);
    
    this.oreType = oreType;
    
    // Set scale for better visibility
    this.setScale(2);
    
    // Make interactive with hand cursor
    this.setInteractive({ useHandCursor: true });
    this.on('pointerdown', this.startMining, this);
    
    // Add hover effects
    this.on('pointerover', () => {
      if (!this.isMining) {
        this.setTint(0xcccccc);
      }
    });
    
    this.on('pointerout', () => {
      this.clearTint();
    });
    
    scene.add.existing(this);
  }

  /**
   * Gets a random frame number for the specified ore type
   */
  private static getRandomFrame(oreType: OreType): number {
    switch (oreType) {
      case 'coal':
        // Coal: randomly select from frames 5, 6, 7
        return Phaser.Math.Between(5, 7);
      case 'iron':
        // Iron: randomly select from frames 6, 7 (closest to 7-8 range)
        return Phaser.Math.Between(6, 7);
      case 'diamond':
        // Diamond: randomly select from frames 5, 6, 7
        return Phaser.Math.Between(5, 7);
      default:
        return 0;
    }
  }

  /**
   * Starts the mining process when ore is clicked
   */
  private startMining() {
    if (this.isMining) return;
    
    this.isMining = true;
    this.disableInteractive(); // Prevent double-clicking
    this.clearTint();
    
    // Create and show progress bar
    this.createProgressBar();
    
    // Wait for mining duration, then complete (no animation)
    const duration = ORE_CONFIG.MINING_TIMES[this.oreType];
    this.scene.time.delayedCall(duration, () => {
      this.onMiningComplete();
    });
  }

  /**
   * Creates a progress bar above the ore
   */
  private createProgressBar() {
    this.progressBar = this.scene.add.graphics();
    
    const duration = ORE_CONFIG.MINING_TIMES[this.oreType];
    let progress = 0;
    
    // Animate the progress bar
    this.progressTween = this.scene.tweens.add({
      targets: { value: 0 },
      value: 1,
      duration,
      onUpdate: (tween) => {
        progress = tween.getValue() ?? 0;
        this.updateProgressBar(progress);
      }
    });
  }

  /**
   * Updates the progress bar visual
   * @param progress - Progress value from 0 to 1
   */
  private updateProgressBar(progress: number) {
    if (!this.progressBar) return;
    
    this.progressBar.clear();
    
    const barWidth = 48;
    const barHeight = 6;
    const x = this.x - barWidth / 2;
    const y = this.y - 35;
    
    // Background (dark)
    this.progressBar.fillStyle(0x000000, 0.7);
    this.progressBar.fillRect(x, y, barWidth, barHeight);
    
    // Border
    this.progressBar.lineStyle(1, 0xffffff, 0.5);
    this.progressBar.strokeRect(x, y, barWidth, barHeight);
    
    // Progress fill (green to yellow to red based on progress)
    const color = progress < 0.5 ? 0x00ff00 : progress < 0.8 ? 0xffff00 : 0xff0000;
    this.progressBar.fillStyle(color);
    this.progressBar.fillRect(x + 1, y + 1, (barWidth - 2) * progress, barHeight - 2);
  }

  /**
   * Called when mining animation completes
   */
  private onMiningComplete() {
    // Emit event to game scene
    this.scene.events.emit('ore-mined', {
      oreType: this.oreType,
      value: ORE_CONFIG.GLD_VALUES[this.oreType]
    });
    
    // Play collection effect
    this.playCollectionEffect();
    
    // Clean up and destroy
    this.cleanup();
  }

  /**
   * Plays a visual effect when ore is collected
   */
  private playCollectionEffect() {
    // Fade out and scale up effect
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scale: this.scale * 1.5,
      duration: 300,
      ease: 'Power2'
    });
    
    // Particles or sparkle effect using the first frame texture
    const particles = this.scene.add.particles(this.x, this.y, `ore-${this.oreType}-0`, {
      speed: { min: 50, max: 100 },
      scale: { start: 0.3, end: 0 },
      lifespan: 500,
      quantity: 8,
      blendMode: 'ADD'
    });
    
    // Clean up particles after effect
    this.scene.time.delayedCall(600, () => {
      particles.destroy();
    });
  }

  /**
   * Cleans up resources before destroying the ore node
   */
  private cleanup() {
    this.progressBar?.destroy();
    this.progressTween?.stop();
    
    // Delay destroy to let the collection effect play
    this.scene.time.delayedCall(300, () => {
      this.destroy();
    });
  }

  /**
   * Override destroy to ensure clean cleanup
   */
  destroy(fromScene?: boolean) {
    if (this.progressBar) {
      this.progressBar.destroy();
    }
    if (this.progressTween) {
      this.progressTween.stop();
    }
    super.destroy(fromScene);
  }
}

