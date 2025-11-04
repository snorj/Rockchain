import { create } from 'zustand';
import type { MaterialType } from '../game/config/materials';
import type { PickaxeTier } from '../game/config/pickaxes';
import type { LevelId } from '../game/config/levels';
import { MATERIALS } from '../game/config/materials';

/**
 * Game inventory - dynamic based on what player has collected
 */
export type GameInventory = Partial<Record<MaterialType, number>>;

/**
 * Mining session state (for per-minute pricing)
 */
export interface MiningSession {
  levelId: LevelId;
  startTime: number;
  endTime: number;
  active: boolean;
}

/**
 * Main game state interface
 */
export interface GameState {
  // Player stats
  gold: number;
  currentPickaxe: PickaxeTier;
  currentLevel: LevelId;
  
  // Level access tracking (legacy - kept for compatibility)
  levelExpiry: number | null;  // Timestamp when current level access expires (null = unlimited)
  
  // Mining session (per-minute pricing)
  activeSession: MiningSession | null;
  
  // Inventory (only materials with count > 0)
  inventory: GameInventory;
  
  // Game status
  isPlaying: boolean;
  isPaused: boolean;
  
  // Actions
  addMaterial: (material: MaterialType, amount?: number) => void;
  removeMaterial: (material: MaterialType, amount: number) => void;
  clearInventory: () => void;
  
  setGold: (amount: number) => void;
  
  setPickaxe: (pickaxe: PickaxeTier) => void;
  setLevel: (level: LevelId, expiryTimestamp?: number) => void;
  
  // Session actions
  setActiveSession: (session: MiningSession) => void;
  clearSession: () => void;
  
  pauseGame: () => void;
  resumeGame: () => void;
}

/**
 * Zustand store for managing game state
 */
export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  gold: 0,
  currentPickaxe: 'wooden',
  currentLevel: 1,
  levelExpiry: null,
  activeSession: null,
  inventory: {},
  isPlaying: true,
  isPaused: false,
  
  /**
   * Add material to inventory
   */
  addMaterial: (material: MaterialType, amount: number = 1) => {
    set((state) => ({
      inventory: {
        ...state.inventory,
        [material]: (state.inventory[material] || 0) + amount
      }
    }));
    console.log(`📦 Added ${amount}x ${material} to inventory`);
  },
  
  /**
   * Remove material from inventory
   */
  removeMaterial: (material: MaterialType, amount: number) => {
    set((state) => {
      const currentAmount = state.inventory[material] || 0;
      const newAmount = Math.max(0, currentAmount - amount);
      
      // Remove from inventory if 0
      if (newAmount === 0) {
        const { [material]: _, ...rest } = state.inventory;
        return { inventory: rest };
      }
      
      return {
        inventory: {
          ...state.inventory,
          [material]: newAmount
        }
      };
    });
  },
  
  /**
   * Clear entire inventory
   */
  clearInventory: () => {
    set({ inventory: {} });
    console.log('🗑️  Inventory cleared');
  },
  
  /**
   * Set gold amount (absolute) - Only used for syncing from blockchain
   */
  setGold: (amount: number) => {
    set({ gold: Math.max(0, amount) });
  },
  
  /**
   * Set current pickaxe
   */
  setPickaxe: (pickaxe: PickaxeTier) => {
    set({ currentPickaxe: pickaxe });
    console.log(`⛏️  Equipped ${pickaxe} pickaxe`);
  },
  
  /**
   * Set current level
   */
  setLevel: (level: LevelId, expiryTimestamp?: number) => {
    set({ 
      currentLevel: level,
      levelExpiry: expiryTimestamp || null
    });
    console.log(`🏔️  Entered Level ${level}${expiryTimestamp ? ` (expires at ${new Date(expiryTimestamp).toLocaleTimeString()})` : ''}`);
  },
  
  /**
   * Set active mining session
   */
  setActiveSession: (session: MiningSession) => {
    set({ activeSession: session });
    console.log(`⏱️  Mining session started for Level ${session.levelId} until ${new Date(session.endTime).toLocaleTimeString()}`);
  },
  
  /**
   * Clear mining session (return to Level 1)
   */
  clearSession: () => {
    set({ 
      activeSession: null,
      currentLevel: 1,
      levelExpiry: null
    });
    console.log('⏱️  Mining session ended, returned to Level 1');
  },
  
  /**
   * Pause game
   */
  pauseGame: () => {
    set({ isPaused: true });
  },
  
  /**
   * Resume game
   */
  resumeGame: () => {
    set({ isPaused: false });
  }
}));

/**
 * Helper: Get total inventory value in gold
 */
export function getInventoryValue(inventory: GameInventory): number {
  return Object.entries(inventory).reduce((total, [material, count]) => {
    const value = MATERIALS[material as MaterialType]?.goldValue || 0;
    return total + (value * (count || 0));
  }, 0);
}

/**
 * Helper: Get inventory as arrays for contract calls
 */
export function getInventoryArrays(inventory: GameInventory): {
  materials: MaterialType[];
  amounts: number[];
} {
  const materials: MaterialType[] = [];
  const amounts: number[] = [];
  
  Object.entries(inventory).forEach(([material, count]) => {
    if (count && count > 0) {
      materials.push(material as MaterialType);
      amounts.push(count);
    }
  });
  
  return { materials, amounts };
}
