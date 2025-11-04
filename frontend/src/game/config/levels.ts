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
  accessCost: number;           // Cost per second in gold (0 = free)
  accessDuration: number;       // Not used anymore - purchasing by seconds
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
    name: 'Stone Mine',
    description: 'Deeper tunnels with iron veins and rare silver deposits.',
    requiredPickaxe: 'stone',
    accessCost: 8,        // Per second cost (480/min)
    accessDuration: 60,   // Not used - flexible purchasing
    backgroundColor: '#1a1a1a',
    spawns: [
      { material: 'stone', weight: 3 },
      { material: 'copper', weight: 3 },
      { material: 'tin', weight: 2 },
      { material: 'coal', weight: 2 },
      { material: 'iron', weight: 30 },
      { material: 'lead', weight: 25 },
      { material: 'cobalt', weight: 20 },
      { material: 'silver', weight: 15 }
    ]
  },

  3: {
    id: 3,
    name: 'Precious Mine',
    description: 'Ancient veins of gold, platinum, and rare emeralds.',
    requiredPickaxe: 'steel',
    accessCost: 50,       // Per second cost (3000/min)
    accessDuration: 60,   // Not used - flexible purchasing
    backgroundColor: '#1a1526',
    spawns: [
      { material: 'stone', weight: 1 },
      { material: 'copper', weight: 1 },
      { material: 'tin', weight: 1 },
      { material: 'coal', weight: 1 },
      { material: 'iron', weight: 2 },
      { material: 'lead', weight: 2 },
      { material: 'cobalt', weight: 2 },
      { material: 'silver', weight: 2 },
      { material: 'gold', weight: 30 },
      { material: 'platinum', weight: 24 },
      { material: 'titanium', weight: 18 },
      { material: 'tungsten', weight: 10 },
      { material: 'emerald', weight: 5 },
      { material: 'ruby', weight: 1 }
    ]
  },

  4: {
    id: 4,
    name: 'Gem Cavern',
    description: 'Crystalline caves filled with sapphires, rubies, and ultra-rare diamonds.',
    requiredPickaxe: 'mythril',
    accessCost: 420,      // Per second cost (25200/min)
    accessDuration: 60,   // Not used - flexible purchasing
    backgroundColor: '#1a0d26',
    spawns: [
      { material: 'stone', weight: 1 },
      { material: 'copper', weight: 1 },
      { material: 'tin', weight: 1 },
      { material: 'coal', weight: 1 },
      { material: 'iron', weight: 1 },
      { material: 'lead', weight: 1 },
      { material: 'cobalt', weight: 1 },
      { material: 'silver', weight: 1 },
      { material: 'gold', weight: 1 },
      { material: 'platinum', weight: 1 },
      { material: 'titanium', weight: 1 },
      { material: 'tungsten', weight: 1 },
      { material: 'emerald', weight: 3 },
      { material: 'palladium', weight: 22 },
      { material: 'orichalcum', weight: 20 },
      { material: 'topaz', weight: 7 },
      { material: 'aquamarine', weight: 6 },
      { material: 'peridot', weight: 4 },
      { material: 'ruby', weight: 12 },
      { material: 'sapphire', weight: 13 },
      { material: 'diamond', weight: 1 }
    ]
  },

  5: {
    id: 5,
    name: 'Mythic Depths',
    description: 'The deepest reaches with mythril, adamantite, and legendary diamonds worth fortunes.',
    requiredPickaxe: 'adamantite',
    accessCost: 3500,     // Per second cost (210000/min)
    accessDuration: 60,   // Not used - flexible purchasing
    backgroundColor: '#0d0d1a',
    spawns: [
      { material: 'stone', weight: 1 },
      { material: 'copper', weight: 1 },
      { material: 'tin', weight: 1 },
      { material: 'coal', weight: 1 },
      { material: 'iron', weight: 1 },
      { material: 'lead', weight: 1 },
      { material: 'cobalt', weight: 1 },
      { material: 'silver', weight: 1 },
      { material: 'gold', weight: 1 },
      { material: 'platinum', weight: 1 },
      { material: 'titanium', weight: 1 },
      { material: 'tungsten', weight: 1 },
      { material: 'palladium', weight: 2 },
      { material: 'orichalcum', weight: 2 },
      { material: 'topaz', weight: 1 },
      { material: 'aquamarine', weight: 1 },
      { material: 'mythril', weight: 24 },
      { material: 'adamantite', weight: 22 },
      { material: 'meteorite', weight: 18 },
      { material: 'ruby', weight: 1 },
      { material: 'sapphire', weight: 1 },
      { material: 'diamond', weight: 10 },
      { material: 'amethyst', weight: 6 }
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
 * Order matches smart contract: Wooden, Iron, Steel, Mythril, Adamantite
 * Note: "stone" in game = "Iron" tier in contract
 */
export function canAccessLevel(levelId: LevelId, currentPickaxe: PickaxeTier): boolean {
  const level = LEVELS[levelId];
  const pickaxeTiers: PickaxeTier[] = ['wooden', 'stone', 'steel', 'mythril', 'adamantite'];
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

