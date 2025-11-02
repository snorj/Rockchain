/**
 * Pickaxe asset mapping utility
 * Maps pickaxe tiers to their sprite paths
 */

import type { PickaxeTier } from './constants';

/**
 * Get pickaxe sprite path for a given tier
 * Place pickaxe sprites in /public/assets/sprites/pickaxes/
 * Expected files:
 * - pickaxe-wooden.png
 * - pickaxe-iron.png
 * - pickaxe-steel.png
 * - pickaxe-mythril.png
 * - pickaxe-adamantite.png
 */
export function getPickaxeSpritePath(tier: PickaxeTier): string {
  const pickaxeNames = ['wooden', 'iron', 'steel', 'mythril', 'adamantite'];
  return `/assets/sprites/pickaxes/pickaxe-${pickaxeNames[tier]}.png`;
}

/**
 * Get pickaxe texture key for Phaser
 */
export function getPickaxeTextureKey(tier: PickaxeTier): string {
  const pickaxeNames = ['wooden', 'iron', 'steel', 'mythril', 'adamantite'];
  return `pickaxe-${pickaxeNames[tier]}`;
}

/**
 * Get pickaxe tier name
 */
export function getPickaxeTierName(tier: PickaxeTier): string {
  const names = ['Wooden', 'Iron', 'Steel', 'Mythril', 'Adamantite'];
  return names[tier] || 'Unknown';
}

/**
 * Pickaxe colors for UI
 */
export const PICKAXE_COLORS: Record<PickaxeTier, string> = {
  0: '#8B4513', // Wooden - Brown
  1: '#C0C0C0', // Iron - Silver
  2: '#4682B4', // Steel - Steel Blue
  3: '#A020F0', // Mythril - Purple
  4: '#FF4500', // Adamantite - Orange Red
};

