/**
 * Pickaxe configuration
 * Based on available assets in /public/assets/sprites/pickaxes
 */

export type PickaxeTier = 'wooden' | 'steel' | 'iron' | 'mythril' | 'adamantite';

export interface PickaxeConfig {
  id: PickaxeTier;
  name: string;
  tier: 1 | 2 | 3 | 4 | 5;
  miningSpeed: number;         // Mining speed multiplier (higher = faster)
  price: number;               // Cost in gold to purchase
  levelUnlocked: 1 | 2 | 3 | 4 | 5;  // Which level this pickaxe unlocks
  spritePath: string;          // Path to pickaxe sprite
  color: string;               // UI color theme
}

/**
 * Complete pickaxe database
 * Each pickaxe unlocks access to the corresponding level
 */
export const PICKAXES: Record<PickaxeTier, PickaxeConfig> = {
  wooden: {
    id: 'wooden',
    name: 'Wooden Pickaxe',
    tier: 1,
    miningSpeed: 1.0,      // 1x speed (baseline)
    price: 0,              // Starter pickaxe (free)
    levelUnlocked: 1,
    spritePath: '/assets/sprites/pickaxes/wooden/pickaxe-wooden.png',
    color: '#8B4513'
  },
  steel: {
    id: 'steel',
    name: 'Steel Pickaxe',
    tier: 2,
    miningSpeed: 1.5,      // 50% faster
    price: 150,
    levelUnlocked: 2,
    spritePath: '/assets/sprites/pickaxes/steel/pickaxe-steel.png',
    color: '#4682B4'
  },
  iron: {
    id: 'iron',
    name: 'Iron Pickaxe',
    tier: 3,
    miningSpeed: 2.0,      // 2x faster
    price: 800,
    levelUnlocked: 3,
    spritePath: '/assets/sprites/pickaxes/iron/pickaxe-iron.png',
    color: '#708090'
  },
  mythril: {
    id: 'mythril',
    name: 'Mythril Pickaxe',
    tier: 4,
    miningSpeed: 3.0,      // 3x faster
    price: 3500,
    levelUnlocked: 4,
    spritePath: '/assets/sprites/pickaxes/mythril/pickaxe-mythril.png',
    color: '#7FB3D5'
  },
  adamantite: {
    id: 'adamantite',
    name: 'Adamantite Pickaxe',
    tier: 5,
    miningSpeed: 4.5,      // 4.5x faster
    price: 15000,
    levelUnlocked: 5,
    spritePath: '/assets/sprites/pickaxes/adamantite/pickaxe-adamantite.png',
    color: '#FF1744'
  }
};

/**
 * Get pickaxe config by tier
 */
export function getPickaxeByTier(tier: 1 | 2 | 3 | 4 | 5): PickaxeConfig {
  const pickaxes = Object.values(PICKAXES);
  return pickaxes.find(p => p.tier === tier) || PICKAXES.wooden;
}

/**
 * Get all pickaxes in order
 */
export function getAllPickaxes(): PickaxeConfig[] {
  return Object.values(PICKAXES).sort((a, b) => a.tier - b.tier);
}

/**
 * Check if player can afford a pickaxe
 */
export function canAffordPickaxe(pickaxe: PickaxeTier, gold: number): boolean {
  return gold >= PICKAXES[pickaxe].price;
}

/**
 * Get next pickaxe tier
 */
export function getNextPickaxe(current: PickaxeTier): PickaxeConfig | null {
  const currentConfig = PICKAXES[current];
  const nextTier = (currentConfig.tier + 1) as 1 | 2 | 3 | 4 | 5;
  
  if (nextTier > 5) return null;
  
  return getPickaxeByTier(nextTier);
}

