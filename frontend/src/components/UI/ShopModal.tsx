import React, { useState } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useGameStore, getInventoryValue } from '../../store/gameStore';
import { useSellResourcesV2, calculateTotalValue } from '../../blockchain/hooks/useSellResourcesV2';
import { usePickaxe } from '../../blockchain/hooks/usePickaxe';
import { PICKAXES, getNextPickaxe } from '../../game/config/pickaxes';
import type { PickaxeTier } from '../../game/config/pickaxes';
import { MATERIALS } from '../../game/config/materials';
import type { MaterialType } from '../../game/config/materials';
import { SellingModal } from './SellingModal';
import { PurchasingModal } from './PurchasingModal';
import './ShopModal.css';

interface ShopModalProps {
  onClose: () => void;
  onPickaxePurchased: (pickaxe: PickaxeTier) => void;
  onMaterialsSold: (goldEarned: number) => void;
}

type ShopTab = 'sell' | 'buy';

/**
 * ShopModal - Buy pickaxes and sell materials
 */
export const ShopModal: React.FC<ShopModalProps> = ({
  onClose,
  onPickaxePurchased,
  onMaterialsSold
}) => {
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const embeddedWallet = wallets.find(w => w.walletClientType === 'privy');
  
  const gold = useGameStore(state => state.gold);
  const currentPickaxe = useGameStore(state => state.currentPickaxe);
  const inventory = useGameStore(state => state.inventory);
  
  const { sellResources, isLoading: isSelling } = useSellResourcesV2();
  const { buyPickaxe, isBuying } = usePickaxe(embeddedWallet?.address);
  
  const [activeTab, setActiveTab] = useState<ShopTab>('sell');
  const [sellingModalOpen, setSellingModalOpen] = useState(false);
  const [sellingSuccess, setSellingSuccess] = useState(false);
  const [sellingError, setSellingError] = useState<string | null>(null);
  const [goldEarned, setGoldEarned] = useState<number>(0);
  
  const [purchasingModalOpen, setPurchasingModalOpen] = useState(false);
  const [purchasingSuccess, setPurchasingSuccess] = useState(false);
  const [purchasingError, setPurchasingError] = useState<string | null>(null);
  const [purchasedPickaxe, setPurchasedPickaxe] = useState<{ name: string; price: number } | null>(null);
  
  const currentPickaxeConfig = PICKAXES[currentPickaxe];
  const nextPickaxe = getNextPickaxe(currentPickaxe);
  const inventoryValue = getInventoryValue(inventory);
  const hasInventory = Object.values(inventory).some(count => count && count > 0);
  
  /**
   * Convert game pickaxe tier to blockchain tier number
   * Game: 1-5 (wooden, iron, steel, mythril, adamantite)
   * Blockchain: 0-4 (Wooden, Iron, Steel, Mythril, Adamantite)
   */
  const getBlockchainTier = (pickaxeTier: PickaxeTier): 0 | 1 | 2 | 3 | 4 => {
    const config = PICKAXES[pickaxeTier];
    return (config.tier - 1) as 0 | 1 | 2 | 3 | 4;
  };
  
  const handlePurchasePickaxe = async (pickaxe: PickaxeTier) => {
    if (!authenticated) {
      alert('Please sign in first!');
      return;
    }
    
    if (!embeddedWallet?.address) {
      alert('Wallet not found!');
      return;
    }
    
    const pickaxeConfig = PICKAXES[pickaxe];
    
    if (gold < pickaxeConfig.price) {
      alert(`Not enough gold! You need ${pickaxeConfig.price}g.`);
      return;
    }
    
    // Open the purchasing modal
    setPurchasingModalOpen(true);
    setPurchasingSuccess(false);
    setPurchasingError(null);
    setPurchasedPickaxe({ name: pickaxeConfig.name, price: pickaxeConfig.price });
    
    try {
      console.log(`🔨 Purchasing ${pickaxeConfig.name} (tier ${pickaxeConfig.tier})...`);
      
      // Call blockchain to buy pickaxe
      const blockchainTier = getBlockchainTier(pickaxe);
      await buyPickaxe(blockchainTier);
      
      console.log(`✅ Successfully purchased ${pickaxeConfig.name} on blockchain`);
      
      // Update local game state
      onPickaxePurchased(pickaxe);
      useGameStore.getState().removeGold(pickaxeConfig.price);
      
      setPurchasingSuccess(true);
    } catch (error: any) {
      console.error('❌ Failed to purchase pickaxe:', error);
      
      // Extract a more user-friendly error message
      let errorMessage = 'Unknown error occurred';
      
      if (error.message) {
        if (error.message.includes('Insufficient GLD')) {
          errorMessage = 'Insufficient GLD balance in your wallet. You may need to sell materials first or your displayed balance may not be synced.';
        } else if (error.message.includes('user rejected')) {
          errorMessage = 'Transaction was rejected';
        } else if (error.message.includes('Already has pickaxe')) {
          errorMessage = 'You already own this pickaxe tier';
        } else if (error.message.includes('Must buy next tier')) {
          errorMessage = 'You must purchase pickaxes in order (one tier at a time)';
        } else {
          errorMessage = error.message;
        }
      }
      
      setPurchasingError(errorMessage);
    }
  };
  
  const handleClosePurchasingModal = () => {
    setPurchasingModalOpen(false);
    setPurchasingSuccess(false);
    setPurchasingError(null);
    if (purchasingSuccess) {
      onClose(); // Close the shop modal on success
    }
  };
  
  const handleSellAll = async () => {
    if (!authenticated) {
      alert('Please sign in first!');
      return;
    }
    
    if (!hasInventory) {
      alert('Your inventory is empty!');
      return;
    }
    
    // Open the selling modal
    setSellingModalOpen(true);
    setSellingSuccess(false);
    setSellingError(null);
    
    try {
      const result = await sellResources(inventory);
      setGoldEarned(result.goldEarned);
      setSellingSuccess(true);
      onMaterialsSold(result.goldEarned);
    } catch (error: any) {
      console.error('Failed to sell materials:', error);
      setSellingError(error.message || 'Unknown error occurred');
    }
  };
  
  const handleCloseSellingModal = () => {
    setSellingModalOpen(false);
    setSellingSuccess(false);
    setSellingError(null);
    if (sellingSuccess) {
      onClose(); // Close the shop modal on success
    }
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content shop-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        
        <h2 className="modal-title">Shop</h2>
        
        <div className="shop-balance">
          <span>Your Gold:</span>
          <strong>{gold}g</strong>
        </div>
        
        <div className="shop-tabs">
          <button
            className={`tab-button ${activeTab === 'sell' ? 'active' : ''}`}
            onClick={() => setActiveTab('sell')}
          >
            Sell Materials
          </button>
          <button
            className={`tab-button ${activeTab === 'buy' ? 'active' : ''}`}
            onClick={() => setActiveTab('buy')}
          >
            Buy Pickaxes
          </button>
        </div>
        
        {activeTab === 'sell' && (
          <div className="shop-content">
            <div className="shop-section">
              <h3>Sell Your Materials</h3>
              <p className="section-desc">Convert your mined materials into gold</p>
              
              {hasInventory ? (
                <>
                  <div className="inventory-summary">
                    {Object.entries(inventory)
                      .filter(([_, count]) => count && count > 0)
                      .map(([material, count]) => {
                        const config = MATERIALS[material as MaterialType];
                        const value = config.goldValue * count!;
                        
                        return (
                          <div key={material} className="summary-item">
                            <div className="summary-info">
                              <img
                                src={`/assets/sprites/${config.spriteFolder}/tile09.png`}
                                alt={config.name}
                                className="summary-icon"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                              <span className="summary-name">
                                {config.name} ×{count}
                              </span>
                            </div>
                            <span className="summary-value">{value}g</span>
                          </div>
                        );
                      })}
                  </div>
                  
                  <div className="total-box">
                    <span>Total Value:</span>
                    <strong className="total-value">{inventoryValue}g</strong>
                  </div>
                  
                  <button
                    className="btn-primary btn-large"
                    onClick={handleSellAll}
                    disabled={isSelling}
                  >
                    {isSelling ? 'Selling...' : `Sell All for ${inventoryValue}g`}
                  </button>
                </>
              ) : (
                <div className="empty-state">
                  <p>Your inventory is empty!</p>
                  <p className="empty-hint">Mine some ores to sell them here.</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'buy' && (
          <div className="shop-content">
            <div className="shop-section">
              <h3>Upgrade Your Pickaxe</h3>
              <p className="section-desc">Better pickaxes mine faster and unlock new levels</p>
              
              <div className="current-pickaxe">
                <span className="label">Current:</span>
                <div className="pickaxe-display">
                  <img
                    src={currentPickaxeConfig.spritePath}
                    alt={currentPickaxeConfig.name}
                    className="pickaxe-icon"
                  />
                  <div className="pickaxe-info">
                    <strong>{currentPickaxeConfig.name}</strong>
                    <span className="pickaxe-stat">
                      {currentPickaxeConfig.miningSpeed}x speed
                    </span>
                  </div>
                </div>
              </div>
              
              {nextPickaxe ? (
                <div className="available-pickaxe">
                  <span className="label">Upgrade Available:</span>
                  <div className="pickaxe-card">
                    <img
                      src={nextPickaxe.spritePath}
                      alt={nextPickaxe.name}
                      className="pickaxe-icon-large"
                    />
                    <div className="pickaxe-details">
                      <h4>{nextPickaxe.name}</h4>
                      <div className="pickaxe-stats">
                        <div className="stat-item">
                          <span>{nextPickaxe.miningSpeed}x speed</span>
                        </div>
                        <div className="stat-item">
                          <span>Unlocks Level {nextPickaxe.levelUnlocked}</span>
                        </div>
                      </div>
                      <div className="pickaxe-price">
                        <span className="price-label">Price:</span>
                        <span className="price-value">{nextPickaxe.price}g</span>
                      </div>
                      <button
                        className="btn-primary btn-large"
                        onClick={() => handlePurchasePickaxe(nextPickaxe.id)}
                        disabled={gold < nextPickaxe.price || isBuying}
                      >
                        {isBuying ? (
                          <>Purchasing...</>
                        ) : gold >= nextPickaxe.price ? (
                          <>Purchase for {nextPickaxe.price}g</>
                        ) : (
                          <>Not Enough Gold ({gold}/{nextPickaxe.price}g)</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <p>You have the best pickaxe!</p>
                  <p className="empty-hint">No more upgrades available.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Selling Modal */}
      <SellingModal
        isOpen={sellingModalOpen}
        isProcessing={isSelling}
        isSuccess={sellingSuccess}
        error={sellingError}
        goldEarned={goldEarned}
        onClose={handleCloseSellingModal}
      />
      
      {/* Purchasing Modal */}
      <PurchasingModal
        isOpen={purchasingModalOpen}
        isProcessing={isBuying}
        isSuccess={purchasingSuccess}
        error={purchasingError}
        pickaxeName={purchasedPickaxe?.name}
        pickaxePrice={purchasedPickaxe?.price}
        onClose={handleClosePurchasingModal}
      />
    </div>
  );
};

