import { create } from 'zustand';
import type { GameState, SellData } from '../types/game.types';
import type { OreType } from '../utils/constants';
import { ORE_CONFIG } from '../utils/constants';

/**
 * Zustand store for managing game state
 * This is the single source of truth for inventory, game status, and player actions
 */
export const useGameStore = create<GameState>((set, get) => ({
  // Initial inventory state
  inventory: {
    coal: 0,
    iron: 0,
    diamond: 0
  },
  
  // Initial game state
  isPlaying: true,
  isPaused: false,
  
  /**
   * Add ore to inventory when mined
   */
  addOre: (oreType: OreType) => {
    set((state) => ({
      inventory: {
        ...state.inventory,
        [oreType]: state.inventory[oreType] + 1
      }
    }));
  },
  
  /**
   * Reset inventory (called after successful sell)
   */
  resetInventory: () => {
    set({ inventory: { coal: 0, iron: 0, diamond: 0 } });
  },
  
  /**
   * Pause the game
   */
  pauseGame: () => {
    set({ isPaused: true });
  },
  
  /**
   * Resume the game
   */
  resumeGame: () => {
    set({ isPaused: false });
  },
  
  /**
   * Called when player clicks the sell button
   * Returns current inventory and calculated total value
   */
  onSellRequested: (): SellData => {
    const { inventory } = get();
    const totalValue = 
      inventory.coal * ORE_CONFIG.GLD_VALUES.coal +
      inventory.iron * ORE_CONFIG.GLD_VALUES.iron +
      inventory.diamond * ORE_CONFIG.GLD_VALUES.diamond;
    
    return {
      ...inventory,
      totalValue
    };
  },
  
  /**
   * Called by blockchain layer after transaction completes
   * Resets inventory on success, logs error on failure
   */
  onSellComplete: (success: boolean, txHash?: string) => {
    if (success) {
      get().resetInventory();
      console.log('✅ Sell successful! TX:', txHash);
    } else {
      console.error('❌ Sell failed');
    }
  }
}));

