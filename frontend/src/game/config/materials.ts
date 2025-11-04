/**
 * Complete material configuration for all ores and gems
 * Based on available assets in /public/assets/sprites/ores and /public/assets/sprites/gems
 */

export type MaterialType = OreType | GemType;

export type OreType =
  // Tier 1 - Common
  | 'stone' | 'copper' | 'tin' | 'coal'
  // Tier 2 - Uncommon  
  | 'iron' | 'lead' | 'cobalt'
  // Tier 3 - Rare
  | 'silver' | 'gold' | 'platinum' | 'titanium' | 'tungsten'
  // Tier 4 - Epic
  | 'palladium' | 'orichalcum'
  // Tier 5 - Legendary
  | 'mythril' | 'adamantite' | 'meteorite';

export type GemType =
  // Tier 3 - Rare
  | 'emerald'
  // Tier 4 - Epic
  | 'topaz' | 'aquamarine' | 'peridot' | 'ruby' | 'sapphire'
  // Tier 5 - Legendary
  | 'diamond' | 'amethyst';

export interface MaterialConfig {
  id: string;
  name: string;
  tier: 1 | 2 | 3 | 4 | 5;
  type: 'ore' | 'gem';
  hp: number;                    // Base HP
  goldValue: number;             // Sale value in gold
  spriteFolder: string;          // Path to sprite folder
  color: string;                 // UI color for this material
}

/**
 * Complete material database
 * Tiles 05-08 are ore/gem rocks (placed on screen)
 * Tile 09 is the pure material object (collected item)
 */
export const MATERIALS: Record<MaterialType, MaterialConfig> = {
  // === TIER 1: COMMON ORES ===
  stone: {
    id: 'stone',
    name: 'Stone',
    tier: 1,
    type: 'ore',
    hp: 3,
    goldValue: 2,
    spriteFolder: 'ores/stone',
    color: '#8B8680'
  },
  copper: {
    id: 'copper',
    name: 'Copper',
    tier: 1,
    type: 'ore',
    hp: 3,
    goldValue: 4,
    spriteFolder: 'ores/copper',
    color: '#B87333'
  },
  tin: {
    id: 'tin',
    name: 'Tin',
    tier: 1,
    type: 'ore',
    hp: 3,
    goldValue: 4,
    spriteFolder: 'ores/tin',
    color: '#C0C0C0'
  },
  coal: {
    id: 'coal',
    name: 'Coal',
    tier: 1,
    type: 'ore',
    hp: 3,
    goldValue: 7,
    spriteFolder: 'ores/coal',
    color: '#2C2C2C'
  },

  // === TIER 2: UNCOMMON ORES ===
  iron: {
    id: 'iron',
    name: 'Iron',
    tier: 2,
    type: 'ore',
    hp: 6,
    goldValue: 20,
    spriteFolder: 'ores/iron',
    color: '#666666'
  },
  lead: {
    id: 'lead',
    name: 'Lead',
    tier: 2,
    type: 'ore',
    hp: 6,
    goldValue: 18,
    spriteFolder: 'ores/lead',
    color: '#4A4A4A'
  },
  cobalt: {
    id: 'cobalt',
    name: 'Cobalt',
    tier: 2,
    type: 'ore',
    hp: 6,
    goldValue: 50,
    spriteFolder: 'ores/cobalt',
    color: '#0047AB'
  },

  // === TIER 3: RARE ORES & GEMS ===
  silver: {
    id: 'silver',
    name: 'Silver',
    tier: 3,
    type: 'ore',
    hp: 9,
    goldValue: 150,
    spriteFolder: 'ores/silver',
    color: '#C0C0C0'
  },
  gold: {
    id: 'gold',
    name: 'Gold',
    tier: 3,
    type: 'ore',
    hp: 9,
    goldValue: 130,
    spriteFolder: 'ores/gold',
    color: '#FFD700'
  },
  platinum: {
    id: 'platinum',
    name: 'Platinum',
    tier: 3,
    type: 'ore',
    hp: 9,
    goldValue: 220,
    spriteFolder: 'ores/platinum',
    color: '#E5E4E2'
  },
  titanium: {
    id: 'titanium',
    name: 'Titanium',
    tier: 3,
    type: 'ore',
    hp: 9,
    goldValue: 165,
    spriteFolder: 'ores/titanium',
    color: '#878681'
  },
  tungsten: {
    id: 'tungsten',
    name: 'Tungsten',
    tier: 3,
    type: 'ore',
    hp: 9,
    goldValue: 110,
    spriteFolder: 'ores/tungsten',
    color: '#5C5C5C'
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald',
    tier: 3,
    type: 'gem',
    hp: 9,
    goldValue: 2000,
    spriteFolder: 'gems/emerald',
    color: '#50C878'
  },

  // === TIER 4: EPIC ORES & GEMS ===
  palladium: {
    id: 'palladium',
    name: 'Palladium',
    tier: 4,
    type: 'ore',
    hp: 12,
    goldValue: 1100,
    spriteFolder: 'ores/palladium',
    color: '#CED0DD'
  },
  orichalcum: {
    id: 'orichalcum',
    name: 'Orichalcum',
    tier: 4,
    type: 'ore',
    hp: 12,
    goldValue: 1200,
    spriteFolder: 'ores/orichalcum',
    color: '#DA8A67'
  },
  topaz: {
    id: 'topaz',
    name: 'Topaz',
    tier: 4,
    type: 'gem',
    hp: 12,
    goldValue: 2200,
    spriteFolder: 'gems/topaz',
    color: '#FFCC00'
  },
  aquamarine: {
    id: 'aquamarine',
    name: 'Aquamarine',
    tier: 4,
    type: 'gem',
    hp: 12,
    goldValue: 2000,
    spriteFolder: 'gems/aquamarine',
    color: '#7FFFD4'
  },
  peridot: {
    id: 'peridot',
    name: 'Peridot',
    tier: 4,
    type: 'gem',
    hp: 12,
    goldValue: 1800,
    spriteFolder: 'gems/peridot',
    color: '#E6E200'
  },
  ruby: {
    id: 'ruby',
    name: 'Ruby',
    tier: 4,
    type: 'gem',
    hp: 12,
    goldValue: 3600,
    spriteFolder: 'gems/ruby',
    color: '#E0115F'
  },
  sapphire: {
    id: 'sapphire',
    name: 'Sapphire',
    tier: 4,
    type: 'gem',
    hp: 12,
    goldValue: 3800,
    spriteFolder: 'gems/sapphire',
    color: '#0F52BA'
  },

  // === TIER 5: LEGENDARY ORES & GEMS ===
  mythril: {
    id: 'mythril',
    name: 'Mythril',
    tier: 5,
    type: 'ore',
    hp: 15,
    goldValue: 9000,
    spriteFolder: 'ores/mythril',
    color: '#7FB3D5'
  },
  adamantite: {
    id: 'adamantite',
    name: 'Adamantite',
    tier: 5,
    type: 'ore',
    hp: 15,
    goldValue: 11000,
    spriteFolder: 'ores/adamantite',
    color: '#FF1744'
  },
  meteorite: {
    id: 'meteorite',
    name: 'Meteorite',
    tier: 5,
    type: 'ore',
    hp: 15,
    goldValue: 13000,
    spriteFolder: 'ores/meteorite',
    color: '#4A235A'
  },
  diamond: {
    id: 'diamond',
    name: 'Diamond',
    tier: 5,
    type: 'gem',
    hp: 15,
    goldValue: 38000,
    spriteFolder: 'gems/diamond',
    color: '#B9F2FF'
  },
  amethyst: {
    id: 'amethyst',
    name: 'Amethyst',
    tier: 5,
    type: 'gem',
    hp: 15,
    goldValue: 42000,
    spriteFolder: 'gems/amethyst',
    color: '#9966CC'
  }
};

/**
 * Get sprite path for a material rock (what appears on screen)
 * Uses tiles 05-08 which are the rocks with ore/gem inside
 */
export function getMaterialRockSprite(material: MaterialType): string {
  const config = MATERIALS[material];
  // Randomly select from tiles 05-08
  const tileNum = 5 + Math.floor(Math.random() * 4); // 5, 6, 7, or 8
  return `/assets/sprites/${config.spriteFolder}/tile0${tileNum}.png`;
}

/**
 * Get sprite path for collected material object (tile09)
 * This is the pure material that flies to inventory
 */
export function getMaterialObjectSprite(material: MaterialType): string {
  const config = MATERIALS[material];
  return `/assets/sprites/${config.spriteFolder}/tile09.png`;
}

/**
 * Get all materials of a specific tier
 */
export function getMaterialsByTier(tier: 1 | 2 | 3 | 4 | 5): MaterialType[] {
  return Object.keys(MATERIALS).filter(
    (key) => MATERIALS[key as MaterialType].tier === tier
  ) as MaterialType[];
}

/**
 * Get materials by type (ore or gem)
 */
export function getMaterialsByType(type: 'ore' | 'gem'): MaterialType[] {
  return Object.keys(MATERIALS).filter(
    (key) => MATERIALS[key as MaterialType].type === type
  ) as MaterialType[];
}

/**
 * Calculate mining time in milliseconds based on material HP and pickaxe speed
 * Base time is 1000ms per HP point
 */
export function getMiningTime(material: MaterialType, pickaxeSpeed: number): number {
  const hp = MATERIALS[material].hp;
  const baseTime = hp * 1000; // 1 second per HP
  return baseTime / pickaxeSpeed; // Faster pickaxes reduce time
}

