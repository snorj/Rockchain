import type { OreType } from '../utils/constants';

/**
 * Main game state interface
 */
export interface GameState {
  // Inventory tracking
  inventory: {
    coal: number;
    iron: number;
    diamond: number;
  };
  
  // Game status
  isPlaying: boolean;
  isPaused: boolean;
  
  // Actions (for game logic)
  addOre: (oreType: OreType) => void;
  resetInventory: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  
  // Interface for blockchain layer (called by blockchain PRD)
  onSellRequested: () => SellData;
  onSellComplete: (success: boolean, txHash?: string) => void;
}

/**
 * Data structure returned when player requests to sell resources
 */
export interface SellData {
  coal: number;
  iron: number;
  diamond: number;
  totalValue: number;
}

/**
 * Event data emitted when ore is mined
 */
export interface OreMined {
  oreType: OreType;
  value: number;
}

/**
 * Leaderboard entry structure (for mock/future blockchain integration)
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

