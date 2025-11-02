/**
 * Level configuration with spawn tables
 * Defines 5 mining levels with different material spawn rates
 */

import type { MaterialType } from './materials';
import type { PickaxeTier } from './pickaxes';

export type LevelId = 1 | 2 | 3 | 4 | 5;

export interface MaterialSpawn {
  material: MaterialType;
  weight: number;  // Spawn weight (doesn't need to sum to 100)
}

export interface LevelConfig {
  id: LevelId;
  name: string;
  description: string;
  requiredPickaxe: PickaxeTier;
  accessCost: number;           // Cost in gold to access (0 = free)
  accessDuration: number;       // Duration in seconds (0 = unlimited)
  spawns: MaterialSpawn[];      // What materials can spawn
  backgroundColor: string;      // Gradient color for this level
}

/**
 * Complete level database with weighted spawn tables
 */
export const LEVELS: Record<LevelId, LevelConfig> = {
  1: {
    id: 1,
    name: 'Beginner Mine',
    description: 'A shallow mine with basic materials. Free for all miners.',
    requiredPickaxe: 'wooden',
    accessCost: 0,
    accessDuration: 0,  // Unlimited
    backgroundColor: '#2c2416',
    spawns: [
      { material: 'stone', weight: 35 },
      { material: 'copper', weight: 30 },
      { material: 'tin', weight: 20 },
      { material: 'coal', weight: 15 }
    ]
  },

  2: {
    id: 2,
    name: 'Iron Mine',
    description: 'Deeper tunnels rich with common metals.',
    requiredPickaxe: 'steel',
    accessCost: 50,
    accessDuration: 120,  // 2 minutes
    backgroundColor: '#1a1a1a',
    spawns: [
      { material: 'stone', weight: 10 },
      { material: 'copper', weight: 10 },
      { material: 'tin', weight: 10 },
      { material: 'coal', weight: 15 },
      { material: 'iron', weight: 25 },
      { material: 'lead', weight: 15 },
      { material: 'cobalt', weight: 15 }
    ]
  },

  3: {
    id: 3,
    name: 'Precious Mine',
    description: 'Ancient veins of valuable metals and the first gems.',
    requiredPickaxe: 'iron',
    accessCost: 200,
    accessDuration: 120,
    backgroundColor: '#1a1526',
    spawns: [
      { material: 'iron', weight: 10 },
      { material: 'lead', weight: 10 },
      { material: 'silver', weight: 20 },
      { material: 'gold', weight: 20 },
      { material: 'platinum', weight: 15 },
      { material: 'titanium', weight: 15 },
      { material: 'tungsten', weight: 10 }
    ]
  },

  4: {
    id: 4,
    name: 'Gem Cavern',
    description: 'Crystalline caves filled with precious gems and rare metals.',
    requiredPickaxe: 'mythril',
    accessCost: 500,
    accessDuration: 120,
    backgroundColor: '#1a0d26',
    spawns: [
      { material: 'silver', weight: 5 },
      { material: 'gold', weight: 5 },
      { material: 'palladium', weight: 10 },
      { material: 'orichalcum', weight: 10 },
      { material: 'emerald', weight: 15 },
      { material: 'ruby', weight: 15 },
      { material: 'sapphire', weight: 15 },
      { material: 'topaz', weight: 10 },
      { material: 'aquamarine', weight: 10 },
      { material: 'peridot', weight: 5 }
    ]
  },

  5: {
    id: 5,
    name: 'Mythic Depths',
    description: 'The deepest reaches where legendary materials form.',
    requiredPickaxe: 'adamantite',
    accessCost: 1500,
    accessDuration: 120,
    backgroundColor: '#0d0d1a',
    spawns: [
      { material: 'platinum', weight: 5 },
      { material: 'orichalcum', weight: 10 },
      { material: 'mythril', weight: 15 },
      { material: 'adamantite', weight: 15 },
      { material: 'meteorite', weight: 10 },
      { material: 'diamond', weight: 15 },
      { material: 'amethyst', weight: 15 },
      { material: 'ruby', weight: 8 },
      { material: 'sapphire', weight: 7 }
    ]
  }
};

/**
 * Get level config by ID
 */
export function getLevelById(id: LevelId): LevelConfig {
  return LEVELS[id];
}

/**
 * Get all levels in order
 */
export function getAllLevels(): LevelConfig[] {
  return Object.values(LEVELS).sort((a, b) => a.id - b.id);
}

/**
 * Check if player has required pickaxe for level
 */
export function canAccessLevel(levelId: LevelId, currentPickaxe: PickaxeTier): boolean {
  const level = LEVELS[levelId];
  const pickaxeTiers: PickaxeTier[] = ['wooden', 'steel', 'iron', 'mythril', 'adamantite'];
  const requiredIndex = pickaxeTiers.indexOf(level.requiredPickaxe);
  const currentIndex = pickaxeTiers.indexOf(currentPickaxe);
  
  return currentIndex >= requiredIndex;
}

/**
 * Select a random material from a level's spawn table
 */
export function selectRandomMaterial(levelId: LevelId): MaterialType {
  const level = LEVELS[levelId];
  
  // Calculate total weight
  const totalWeight = level.spawns.reduce((sum, spawn) => sum + spawn.weight, 0);
  
  // Random selection based on weights
  let random = Math.random() * totalWeight;
  
  for (const spawn of level.spawns) {
    random -= spawn.weight;
    if (random <= 0) {
      return spawn.material;
    }
  }
  
  // Fallback (shouldn't happen)
  return level.spawns[0].material;
}

/**
 * Get formatted time remaining string
 */
export function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return '0:00';
  
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Check if level is free (Level 1)
 */
export function isFreeLevel(levelId: LevelId): boolean {
  return LEVELS[levelId].accessCost === 0;
}

