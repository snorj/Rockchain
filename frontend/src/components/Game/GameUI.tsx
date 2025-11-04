import React, { useState, useEffect } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useGameStore } from '../../store/gameStore';
import { useGoldBalance } from '../../blockchain/hooks/useGoldBalance';
import { usePickaxe } from '../../blockchain/hooks/usePickaxe';
import { MaterialInfoPanel } from '../UI/MaterialInfoPanel';
import { LevelTimer } from '../UI/LevelTimer';
import { LevelExpiryModal } from '../UI/LevelExpiryModal';
import { ShopModal } from '../UI/ShopModal';
import { formatNumber, getDynamicFontSize } from '../../utils/numberFormat';
import { LEVELS } from '../../game/config/levels';
import type { LevelId } from '../../game/config/levels';
import type { PickaxeTier } from '../../game/config/pickaxes';
import type { MiningScene } from '../../game/scenes/MiningScene';
import './GameUI.css';

/**
 * GameUI - Main UI overlay for the game
 * Connects React components to Phaser scene
 */
export const GameUI: React.FC = () => {
  const [showInfo, setShowInfo] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showExpiry, setShowExpiry] = useState(false);
  const [expiredLevel, setExpiredLevel] = useState<LevelId>(2);
  
  const { wallets } = useWallets();
  const embeddedWallet = wallets.find((w) => w.walletClientType === 'privy');
  
  // Fetch blockchain GLD balance
  const { balance: blockchainBalance, isLoading: balanceLoading } = useGoldBalance(embeddedWallet?.address);
  
  // Fetch blockchain pickaxe
  const { pickaxe: blockchainPickaxe, hasPickaxe, isLoading: pickaxeLoading } = usePickaxe(embeddedWallet?.address);
  
  const gold = useGameStore(state => state.gold);
  const currentLevel = useGameStore(state => state.currentLevel);
  const currentPickaxe = useGameStore(state => state.currentPickaxe);
  
  /**
   * Convert blockchain tier (0-4) to game pickaxe tier name
   */
  const getGamePickaxeTier = (contractTier: number): PickaxeTier => {
    const tierMap: Record<number, PickaxeTier> = {
      0: 'wooden',
      1: 'stone',  // Iron in contract
      2: 'steel',
      3: 'mythril',
      4: 'adamantite'
    };
    return tierMap[contractTier] || 'wooden';
  };
  
  /**
   * Sync blockchain balance with game store on load and when it changes
   */
  useEffect(() => {
    if (!balanceLoading && blockchainBalance !== undefined) {
      useGameStore.getState().setGold(blockchainBalance);
      console.log(`💰 Synced blockchain balance: ${blockchainBalance} GLD`);
    }
  }, [blockchainBalance, balanceLoading]);
  
  /**
   * Sync blockchain pickaxe with game store on load and when it changes
   */
  useEffect(() => {
    if (!pickaxeLoading && blockchainPickaxe) {
      const gameTier = getGamePickaxeTier(blockchainPickaxe.tier);
      const currentGamePickaxe = useGameStore.getState().currentPickaxe;
      
      // Only update if different to avoid unnecessary updates
      if (gameTier !== currentGamePickaxe) {
        useGameStore.getState().setPickaxe(gameTier);
        
        // Update the Phaser scene as well (wait for scene-ready if needed)
        const scene = getMiningScene();
        if (scene) {
          scene.setPickaxeTier(gameTier);
        } else {
          // If scene not ready yet, wait for scene-ready event
          const waitForScene = () => {
            const readyScene = getMiningScene();
            if (readyScene) {
              readyScene.setPickaxeTier(gameTier);
              readyScene.events.off('scene-ready', waitForScene);
            }
          };
          
          // Try to attach listener if scene exists but not ready
          const tempScene = (window as any).phaserGame?.scene?.getScene('MiningScene');
          if (tempScene) {
            tempScene.events.once('scene-ready', waitForScene);
          }
        }
        
        console.log(`⛏️  Synced blockchain pickaxe: ${gameTier} (contract tier ${blockchainPickaxe.tier})`);
      }
    }
  }, [blockchainPickaxe, pickaxeLoading]);
  
  /**
   * Get MiningScene reference from Phaser
   */
  const getMiningScene = (): MiningScene | null => {
    return (window as any).miningScene || null;
  };
  
  /**
   * Listen for level expiry events from Phaser
   */
  useEffect(() => {
    const scene = getMiningScene();
    if (scene) {
      const handleLevelExpired = () => {
        setExpiredLevel(useGameStore.getState().currentLevel);
        setShowExpiry(true);
      };
      
      scene.events.on('level-expired', handleLevelExpired);
      
      return () => {
        scene.events.off('level-expired', handleLevelExpired);
      };
    }
  }, []);
  
  /**
   * Handle level change request from UI
   */
  const handleLevelChange = (levelId: LevelId) => {
    const scene = getMiningScene();
    if (scene) {
      scene.switchToLevel(levelId);
    }
    
    // Update store (no expiry for free level 1)
    if (levelId === 1) {
      useGameStore.getState().setLevel(levelId);
    }
  };
  
  /**
   * Handle level access purchase (called by hooks)
   */
  const handlePurchaseSuccess = (levelId: LevelId, expiryTime: number) => {
    // Update store with expiry time
    useGameStore.getState().setLevel(levelId, expiryTime);
    
    // Switch scene to new level
    const scene = getMiningScene();
    if (scene) {
      scene.switchToLevel(levelId);
    }
  };
  
  /**
   * Handle pickaxe purchase (called by hooks)
   */
  const handlePickaxePurchased = (pickaxe: PickaxeTier) => {
    // Update store
    useGameStore.getState().setPickaxe(pickaxe);
    
    // Update scene
    const scene = getMiningScene();
    if (scene) {
      scene.setPickaxeTier(pickaxe);
    }
  };
  
  /**
   * Handle materials sold (called by hooks)
   */
  const handleMaterialsSold = (goldEarned: number) => {
    // Clear inventory
    // Note: Balance will sync automatically from blockchain via useGoldBalance hook
    useGameStore.getState().clearInventory();
  };
  
  /**
   * Handle return to Level 1 from expiry modal
   */
  const handleReturnToLevel1 = () => {
    handleLevelChange(1);
    setShowExpiry(false);
  };
  
  /**
   * Handle renew level from expiry modal
   */
  const handleRenewLevel = () => {
    // This should trigger the purchase flow
    // For now, just close modal - the purchase will be handled by LevelSelector
    setShowExpiry(false);
  };
  
  /**
   * Expose level change handlers to window for LevelSelector in sidebar
   */
  useEffect(() => {
    (window as any).gameLevelHandlers = {
      onLevelChange: handleLevelChange,
      onPurchaseSuccess: handlePurchaseSuccess
    };
    
    return () => {
      (window as any).gameLevelHandlers = null;
    };
  }, []);
  
  /**
   * Keyboard shortcuts and custom events from InventoryControls
   */
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // ESC to close modals
      if (e.key === 'Escape') {
        setShowInfo(false);
        setShowShop(false);
      }
      
      // S to open shop
      if (e.key === 's' || e.key === 'S') {
        if (!showShop && !showExpiry) {
          setShowShop(true);
        }
      }
      
      // I to open info
      if (e.key === 'i' || e.key === 'I') {
        if (!showInfo && !showShop && !showExpiry) {
          setShowInfo(true);
        }
      }
    };
    
    const handleOpenMaterials = () => {
      if (!showInfo && !showShop && !showExpiry) {
        setShowInfo(true);
      }
    };
    
    const handleOpenShop = () => {
      if (!showShop && !showExpiry) {
        setShowShop(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('open-materials', handleOpenMaterials);
    window.addEventListener('open-shop', handleOpenShop);
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('open-materials', handleOpenMaterials);
      window.removeEventListener('open-shop', handleOpenShop);
    };
  }, [showShop, showInfo, showExpiry]);
  
  return (
    <div className="game-ui-overlay">
      {/* Top Bar */}
      <div className="ui-top-bar">
        <div className="gold-display">
          <img 
            src="/assets/sprites/ores/gold/tile04.png" 
            alt="Gold" 
            className="gold-icon-img"
          />
          <span 
            className="gold-amount" 
            style={{ fontSize: `${getDynamicFontSize(gold)}px` }}
          >
            {formatNumber(gold)}
          </span>
          <span className="gold-label">GLD</span>
        </div>
      </div>
      
      {/* Level Timer - Top Right */}
      <LevelTimer />
      
      {/* Material Info Modal */}
      {showInfo && (
        <div className="modal-overlay" onClick={() => setShowInfo(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button 
              className="modal-close"
              onClick={() => setShowInfo(false)}
            >
              ×
            </button>
            <MaterialInfoPanel />
          </div>
        </div>
      )}
      
      {/* Shop Modal */}
      {showShop && (
        <ShopModal
          onClose={() => setShowShop(false)}
          onPickaxePurchased={handlePickaxePurchased}
          onMaterialsSold={handleMaterialsSold}
        />
      )}
      
      {/* Level Expiry Modal */}
      {showExpiry && (
        <LevelExpiryModal
          expiredLevel={expiredLevel}
          onClose={handleReturnToLevel1}
          onReturnToLevel1={handleReturnToLevel1}
          onRenew={handleRenewLevel}
          canAffordRenewal={gold >= LEVELS[expiredLevel].accessCost}
        />
      )}
    </div>
  );
};

