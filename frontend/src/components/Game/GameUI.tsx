import React, { useState, useEffect } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useGameStore } from '../../store/gameStore';
import { useGoldBalance } from '../../blockchain/hooks/useGoldBalance';
import { MaterialInfoPanel } from '../UI/MaterialInfoPanel';
import { LevelSelector } from '../UI/LevelSelector';
import { LevelExpiryModal } from '../UI/LevelExpiryModal';
import { ShopModal } from '../UI/ShopModal';
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
  
  const gold = useGameStore(state => state.gold);
  const currentLevel = useGameStore(state => state.currentLevel);
  const currentPickaxe = useGameStore(state => state.currentPickaxe);
  
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
    // Add gold to balance
    useGameStore.getState().addGold(goldEarned);
    
    // Clear inventory
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
          <span className="gold-amount">{gold.toLocaleString()}</span>
          <span className="gold-label">GLD</span>
        </div>
        
        <LevelSelector 
          onPurchaseSuccess={handlePurchaseSuccess}
          onLevelChange={handleLevelChange}
        />
      </div>
      
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
        />
      )}
    </div>
  );
};

