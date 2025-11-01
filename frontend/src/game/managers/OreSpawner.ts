import Phaser from 'phaser';
import { OreNode } from '../entities/OreNode';
import type { OreType } from '../../utils/constants';
import { ORE_CONFIG } from '../../utils/constants';

/**
 * OreSpawner manages spawning and tracking of ore nodes
 * Handles initial spawning, rarity distribution, and respawning
 */
export class OreSpawner {
  private scene: Phaser.Scene;
  private activeOres: OreNode[] = [];
  private spawnedPositions: { x: number; y: number }[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Spawns initial batch of ores when game starts
   */
  spawnInitialOres() {
    const count = Phaser.Math.Between(
      ORE_CONFIG.SPAWN_COUNT.min,
      ORE_CONFIG.SPAWN_COUNT.max
    );
    
    console.log(`🎲 Spawning ${count} initial ores...`);
    
    for (let i = 0; i < count; i++) {
      this.spawnRandomOre();
    }
  }

  /**
   * Spawns a single ore at a random location with weighted rarity
   * @returns The spawned OreNode
   */
  spawnRandomOre(): OreNode {
    const oreType = this.selectRandomOreType();
    const position = this.getRandomPosition();
    
    const ore = new OreNode(
      this.scene,
      position.x,
      position.y,
      oreType
    );
    
    this.activeOres.push(ore);
    this.spawnedPositions.push(position);
    
    console.log(`⛏️  Spawned ${oreType} at (${position.x}, ${position.y})`);
    
    return ore;
  }

  /**
   * Selects a random ore type based on rarity weights
   * Uses weighted random selection (70% coal, 25% iron, 5% diamond)
   * @returns Selected ore type
   */
  private selectRandomOreType(): OreType {
    const rand = Math.random();
    const weights = ORE_CONFIG.RARITY_WEIGHTS;
    
    // Calculate cumulative weights
    // Diamond: 0 - 0.05
    // Iron: 0.05 - 0.30
    // Coal: 0.30 - 1.0
    
    if (rand < weights.diamond) {
      return 'diamond';
    } else if (rand < weights.diamond + weights.iron) {
      return 'iron';
    } else {
      return 'coal';
    }
  }

  /**
   * Gets a random position within the spawn area
   * Attempts to avoid overlapping with existing ores
   * @returns Random position {x, y}
   */
  private getRandomPosition(): { x: number; y: number } {
    const { x, y, width, height } = ORE_CONFIG.SPAWN_AREA;
    const minDistance = 80; // Minimum distance between ores
    const maxAttempts = 20;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const newPos = {
        x: Phaser.Math.Between(x, x + width),
        y: Phaser.Math.Between(y, y + height)
      };
      
      // Check if position is far enough from existing ores
      const isFarEnough = this.spawnedPositions.every(pos => {
        const distance = Phaser.Math.Distance.Between(
          newPos.x, newPos.y,
          pos.x, pos.y
        );
        return distance >= minDistance;
      });
      
      if (isFarEnough) {
        return newPos;
      }
    }
    
    // If we couldn't find a good position, return a random one anyway
    return {
      x: Phaser.Math.Between(x, x + width),
      y: Phaser.Math.Between(y, y + height)
    };
  }

  /**
   * Removes an ore from tracking when it's mined
   * @param ore - The ore to remove
   */
  removeOre(ore: OreNode) {
    const index = this.activeOres.indexOf(ore);
    if (index > -1) {
      this.activeOres.splice(index, 1);
      
      // Also remove from spawned positions (find closest position)
      if (this.spawnedPositions.length > 0) {
        const orePos = { x: ore.x, y: ore.y };
        let closestIndex = 0;
        let closestDist = Phaser.Math.Distance.Between(
          orePos.x, orePos.y,
          this.spawnedPositions[0].x, this.spawnedPositions[0].y
        );
        
        for (let i = 1; i < this.spawnedPositions.length; i++) {
          const dist = Phaser.Math.Distance.Between(
            orePos.x, orePos.y,
            this.spawnedPositions[i].x, this.spawnedPositions[i].y
          );
          if (dist < closestDist) {
            closestDist = dist;
            closestIndex = i;
          }
        }
        
        this.spawnedPositions.splice(closestIndex, 1);
      }
    }
    
    ore.destroy();
  }

  /**
   * Gets count of currently active ores
   */
  getActiveOreCount(): number {
    return this.activeOres.length;
  }

  /**
   * Cleans up all ores
   */
  destroy() {
    this.activeOres.forEach(ore => ore.destroy());
    this.activeOres = [];
    this.spawnedPositions = [];
  }
}

