import type { OreType, GemType, PickaxeTier } from '../utils/constants';

/**
 * Expanded inventory for all 17 ore types
 */
export interface GameInventory {
  // Common ores
  stone: number;
  coal: number;
  copper: number;
  tin: number;
  
  // Uncommon ores
  iron: number;
  lead: number;
  silver: number;
  
  // Rare ores
  gold: number;
  titanium: number;
  cobalt: number;
  tungsten: number;
  
  // Epic ores
  mythril: number;
  orichalcum: number;
  platinum: number;
  
  // Legendary ores
  adamantite: number;
  palladium: number;
  meteorite: number;
}

/**
 * Main game state interface
 */
export interface GameState {
  // Expanded inventory tracking
  inventory: GameInventory;
  
  // Pickaxe state
  pickaxeTier: PickaxeTier;
  
  // Gem collection
  gems: GemType[];
  
  // Game status
  isPlaying: boolean;
  isPaused: boolean;
  
  // Actions (for game logic)
  addOre: (oreType: OreType) => void;
  addGem: (gemType: GemType) => void;
  setPickaxeTier: (tier: PickaxeTier) => void;
  resetInventory: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  
  // Interface for blockchain layer
  onSellRequested: () => SellData;
  onSellComplete: (success: boolean, txHash?: string) => void;
}

/**
 * Data structure returned when player requests to sell resources
 */
export interface SellData {
  oreIds: number[];
  amounts: number[];
  totalValue: number;
}

/**
 * Event data emitted when ore is mined
 */
export interface OreMined {
  oreType: OreType;
  value: number;
  ore?: any; // Reference to the ore node
}

/**
 * Leaderboard entry structure
 */
export interface LeaderboardEntry {
  address: string;
  balance: number;
  rank: number;
}

export interface LeaderboardData {
  entries: LeaderboardEntry[];
  currentPlayer?: LeaderboardEntry;
}

/**
 * Blockchain types
 */
export interface PickaxeData {
  tokenId: bigint;
  tier: PickaxeTier;
  durability: bigint;
  maxDurability: bigint;
}

export interface GemData {
  tokenId: bigint;
  gemType: GemType;
  oreSource: string;
  mintedAt: bigint;
}
