// Game configuration constants

// All 17 ore types + tungsten
export const ORE_TIERS = {
  COMMON: ['stone', 'coal', 'copper', 'tin'],
  UNCOMMON: ['iron', 'lead', 'silver'],
  RARE: ['gold', 'titanium', 'cobalt'],
  EPIC: ['mythril', 'orichalcum', 'platinum'],
  LEGENDARY: ['adamantite', 'palladium', 'meteorite'],
  EXTRA: ['tungsten']
} as const;

export const ORE_CONFIG = {
  SPAWN_COUNT: { min: 5, max: 8 }, // Increased for more variety
  SPAWN_AREA: { x: 50, y: 100, width: 700, height: 450 },
  
  // Rarity weights (must sum to ~1.0)
  RARITY_WEIGHTS: {
    COMMON: 0.65,      // 65%
    UNCOMMON: 0.25,    // 25%
    RARE: 0.08,        // 8%
    EPIC: 0.018,       // 1.8%
    LEGENDARY: 0.002   // 0.2%
  },
  
  // Individual ore spawn weights within each tier
  TIER_ORE_WEIGHTS: {
    stone: 0.4, coal: 0.3, copper: 0.2, tin: 0.1,          // Common
    iron: 0.5, lead: 0.3, silver: 0.2,                      // Uncommon
    gold: 0.5, titanium: 0.3, cobalt: 0.2,                  // Rare
    mythril: 0.4, orichalcum: 0.3, platinum: 0.3,          // Epic
    adamantite: 0.4, palladium: 0.3, meteorite: 0.3        // Legendary
  },
  
  // Mining times (base, in milliseconds, before pickaxe multiplier)
  MINING_TIMES: {
    stone: 1500, coal: 2000, copper: 2500, tin: 2500,
    iron: 4000, lead: 4000, silver: 5000,
    gold: 6000, titanium: 7000, cobalt: 6500,
    mythril: 10000, orichalcum: 11000, platinum: 10000,
    adamantite: 15000, palladium: 14000, meteorite: 16000,
    tungsten: 7500
  },
  
  // GLD values
  GLD_VALUES: {
    stone: 0.5, coal: 1, copper: 2, tin: 2,
    iron: 5, lead: 4, silver: 8,
    gold: 15, titanium: 20, cobalt: 18,
    mythril: 50, orichalcum: 60, platinum: 55,
    adamantite: 150, palladium: 140, meteorite: 200,
    tungsten: 25
  },
  
  // Pickaxe requirements (tier index: 0=Wooden, 1=Iron, 2=Steel, 3=Mythril, 4=Adamantite)
  PICKAXE_REQUIREMENTS: {
    stone: 0, coal: 0, copper: 0, tin: 0,
    iron: 1, lead: 1, silver: 1,
    gold: 2, titanium: 2, cobalt: 2, tungsten: 2,
    mythril: 3, orichalcum: 3, platinum: 3,
    adamantite: 4, palladium: 4, meteorite: 4
  }
} as const;

export const PICKAXE_CONFIG = {
  TIERS: ['Wooden', 'Iron', 'Steel', 'Mythril', 'Adamantite'],
  
  // Speed multipliers (lower = faster mining)
  SPEED_MULTIPLIERS: [1.0, 0.8, 0.65, 0.5, 0.35],
  
  // Costs in GLD
  COSTS: [0, 100, 300, 1000, 5000],
  
  // Durability (uses per pickaxe)
  DURABILITY: [100, 150, 200, 250, 300],
  
  // Repair cost percentage (10% of tier cost)
  REPAIR_COST_PERCENT: 0.1
} as const;

export const GEM_CONFIG = {
  TYPES: ['ruby', 'sapphire', 'emerald', 'diamond', 'topaz', 'amethyst', 'aquamarine', 'peridot'],
  
  // 0.5% drop chance on legendary ores
  DROP_CHANCE: 0.005,
  
  // Which ores can drop gems
  DROP_SOURCES: ['adamantite', 'palladium', 'meteorite'],
  
  // Gem colors for display
  COLORS: {
    ruby: '#E0115F',
    sapphire: '#0F52BA',
    emerald: '#50C878',
    diamond: '#B9F2FF',
    topaz: '#FFCC00',
    amethyst: '#9966CC',
    aquamarine: '#7FFFD4',
    peridot: '#E6E200'
  }
} as const;

export const GAME_CONFIG = {
  WIDTH: 800,
  HEIGHT: 600,
  PIXEL_ART: true,
  FPS: 60,
  PLAYER_SPEED: 120 // pixels per second
} as const;

export const ANIMATION_CONFIG = {
  TORCH_FLICKER_SPEED: 500, // milliseconds per frame
  ORE_FRAME_COUNT: 8,
  PLAYER_FRAME_RATE: 10 // frames per second for character animation
} as const;

// Type definitions
export type OreType = 
  | 'stone' | 'coal' | 'copper' | 'tin'
  | 'iron' | 'lead' | 'silver'
  | 'gold' | 'titanium' | 'cobalt' | 'tungsten'
  | 'mythril' | 'orichalcum' | 'platinum'
  | 'adamantite' | 'palladium' | 'meteorite';

export type GemType = 
  | 'ruby' | 'sapphire' | 'emerald' | 'diamond'
  | 'topaz' | 'amethyst' | 'aquamarine' | 'peridot';

export type PickaxeTier = 0 | 1 | 2 | 3 | 4;

export type OreTier = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

// Helper functions
export function getOreTier(oreType: OreType): OreTier {
  if (ORE_TIERS.COMMON.includes(oreType as any)) return 'COMMON';
  if (ORE_TIERS.UNCOMMON.includes(oreType as any)) return 'UNCOMMON';
  if (ORE_TIERS.RARE.includes(oreType as any)) return 'RARE';
  if (ORE_TIERS.EPIC.includes(oreType as any)) return 'EPIC';
  if (ORE_TIERS.LEGENDARY.includes(oreType as any)) return 'LEGENDARY';
  return 'COMMON';
}

export function canMineOre(oreType: OreType, pickaxeTier: PickaxeTier): boolean {
  return pickaxeTier >= ORE_CONFIG.PICKAXE_REQUIREMENTS[oreType];
}

export function getMiningTime(oreType: OreType, pickaxeTier: PickaxeTier): number {
  const baseTime = ORE_CONFIG.MINING_TIMES[oreType];
  const multiplier = PICKAXE_CONFIG.SPEED_MULTIPLIERS[pickaxeTier];
  return Math.floor(baseTime * multiplier);
}

export function getOreValue(oreType: OreType): number {
  return ORE_CONFIG.GLD_VALUES[oreType];
}

// Ore ID mappings (for smart contract compatibility)
export const ORE_IDS: Record<OreType, number> = {
  stone: 0, coal: 1, copper: 2, tin: 3,
  iron: 4, lead: 5, silver: 6,
  gold: 7, titanium: 8, cobalt: 9,
  mythril: 10, orichalcum: 11, platinum: 12,
  adamantite: 13, palladium: 14, meteorite: 15,
  tungsten: 16
};

export const ORE_NAMES: Record<number, OreType> = {
  0: 'stone', 1: 'coal', 2: 'copper', 3: 'tin',
  4: 'iron', 5: 'lead', 6: 'silver',
  7: 'gold', 8: 'titanium', 9: 'cobalt',
  10: 'mythril', 11: 'orichalcum', 12: 'platinum',
  13: 'adamantite', 14: 'palladium', 15: 'meteorite',
  16: 'tungsten'
};

// Gem ID mappings
export const GEM_IDS: Record<GemType, number> = {
  ruby: 0, sapphire: 1, emerald: 2, diamond: 3,
  topaz: 4, amethyst: 5, aquamarine: 6, peridot: 7
};

export const GEM_NAMES: Record<number, GemType> = {
  0: 'ruby', 1: 'sapphire', 2: 'emerald', 3: 'diamond',
  4: 'topaz', 5: 'amethyst', 6: 'aquamarine', 7: 'peridot'
};
