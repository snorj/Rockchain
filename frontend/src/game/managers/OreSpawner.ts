import Phaser from 'phaser';
import { OreNode } from '../entities/OreNode';
import type { LevelId } from '../config/levels';
import { selectRandomMaterial } from '../config/levels';
import type { PickaxeTier } from '../config/pickaxes';

/**
 * OreSpawner manages ore node spawning and tracking
 * Keeps 10 ore nodes on screen at all times
 */
export class OreSpawner {
  private scene: Phaser.Scene;
  private oreNodes: OreNode[] = [];
  private currentLevel: LevelId = 1;
  
  // Spawn area configuration
  private readonly SPAWN_AREA = {
    x: 50,
    y: 80,
    width: 700,
    height: 440
  };
  
  private readonly TARGET_ORE_COUNT = 10;
  private readonly MIN_SPACING = 80; // Minimum distance between ores
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }
  
  /**
   * Set current level (changes spawn table)
   */
  public setLevel(level: LevelId) {
    this.currentLevel = level;
    console.log(`🏔️  OreSpawner: Set level to ${level}`);
  }
  
  /**
   * Set current pickaxe (affects mining speed)
   */
  public setPickaxe(_pickaxe: PickaxeTier) {
    // Pickaxe effects handled in game logic, not spawner
    console.log(`⛏️  OreSpawner: Set pickaxe to ${_pickaxe}`);
  }
  
  /**
   * Spawn initial ores to fill the screen
   */
  public spawnInitialOres() {
    // Clear existing ores
    this.clearAllOres();
    
    // Spawn TARGET_ORE_COUNT ores
    for (let i = 0; i < this.TARGET_ORE_COUNT; i++) {
      this.spawnOre();
    }
    
    console.log(`⚒️  Spawned ${this.TARGET_ORE_COUNT} initial ores`);
  }
  
  /**
   * Spawn a single ore at a random valid position
   */
  public spawnOre(): OreNode | null {
    // Select material based on current level's spawn table
    const material = selectRandomMaterial(this.currentLevel);
    
    // Find valid spawn position
    const position = this.findValidSpawnPosition();
    if (!position) {
      console.warn('⚠️  Could not find valid spawn position');
      return null;
    }
    
    // Get sprite for this material (random tile 05-08)
    const spriteKey = this.loadMaterialSprite(material);
    
    // Create ore node (pickaxe speed is applied when mining starts)
    const oreNode = new OreNode(
      this.scene,
      position.x,
      position.y,
      material,
      spriteKey
    );
    
    // Add to tracking
    this.oreNodes.push(oreNode);
    
    return oreNode;
  }
  
  /**
   * Find a valid random position that doesn't overlap with existing ores
   */
  private findValidSpawnPosition(maxAttempts: number = 50): { x: number; y: number } | null {
    for (let i = 0; i < maxAttempts; i++) {
      const x = this.SPAWN_AREA.x + Math.random() * this.SPAWN_AREA.width;
      const y = this.SPAWN_AREA.y + Math.random() * this.SPAWN_AREA.height;
      
      // Check if position is valid (not too close to other ores)
      if (this.isPositionValid(x, y)) {
        return { x, y };
      }
    }
    
    // If we couldn't find a valid position, return a random one anyway
    return {
      x: this.SPAWN_AREA.x + Math.random() * this.SPAWN_AREA.width,
      y: this.SPAWN_AREA.y + Math.random() * this.SPAWN_AREA.height
    };
  }
  
  /**
   * Check if position is valid (not too close to existing ores)
   */
  private isPositionValid(x: number, y: number): boolean {
    for (const ore of this.oreNodes) {
      const distance = Phaser.Math.Distance.Between(x, y, ore.x, ore.y);
      if (distance < this.MIN_SPACING) {
        return false;
      }
    }
    return true;
  }
  
  /**
   * Get random rock sprite key for a material
   * Returns one of tiles 05-08 randomly, or specific stone tiles
   */
  private loadMaterialSprite(material: string): string {
    // Stone uses specific tiles: 10, 11, 12, 13, 15, 16, 17, 18 (excluding 14)
    if (material === 'stone') {
      const stoneTiles = [10, 11, 12, 13, 15, 16, 17, 18];
      const randomIndex = Math.floor(Math.random() * stoneTiles.length);
      return `stone-rock-${stoneTiles[randomIndex]}`;
    }
    
    // Other materials use tiles 05-08
    const tileNum = 5 + Math.floor(Math.random() * 4); // 5, 6, 7, or 8
    return `${material}-rock-${tileNum}`;
  }
  
  /**
   * Remove an ore node from tracking
   */
  public removeOre(ore: OreNode) {
    const index = this.oreNodes.indexOf(ore);
    if (index > -1) {
      this.oreNodes.splice(index, 1);
    }
  }
  
  /**
   * Get ore at specific position (for click detection)
   */
  public getOreAt(x: number, y: number): OreNode | null {
    for (const ore of this.oreNodes) {
      const sprite = ore.getSprite();
      const bounds = sprite.getBounds();
      
      if (bounds.contains(x, y)) {
        return ore;
      }
    }
    return null;
  }
  
  /**
   * Maintain target ore count (spawn new ore if needed)
   */
  public maintainOreCount() {
    while (this.oreNodes.length < this.TARGET_ORE_COUNT) {
      this.spawnOre();
    }
  }
  
  /**
   * Clear all ores from screen
   */
  public clearAllOres() {
    this.oreNodes.forEach(ore => ore.destroy());
    this.oreNodes = [];
  }
  
  /**
   * Get current ore count
   */
  public getOreCount(): number {
    return this.oreNodes.length;
  }
  
  /**
   * Cleanup
   */
  public destroy() {
    this.clearAllOres();
  }
}
