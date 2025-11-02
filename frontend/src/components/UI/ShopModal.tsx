import React, { useState } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useGameStore, getInventoryValue } from '../../store/gameStore';
import { useSellResourcesV2, calculateTotalValue } from '../../blockchain/hooks/useSellResourcesV2';
import { PICKAXES, getNextPickaxe } from '../../game/config/pickaxes';
import type { PickaxeTier } from '../../game/config/pickaxes';
import { MATERIALS } from '../../game/config/materials';
import type { MaterialType } from '../../game/config/materials';
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
  
  const [activeTab, setActiveTab] = useState<ShopTab>('sell');
  
  const currentPickaxeConfig = PICKAXES[currentPickaxe];
  const nextPickaxe = getNextPickaxe(currentPickaxe);
  const inventoryValue = getInventoryValue(inventory);
  const hasInventory = Object.values(inventory).some(count => count && count > 0);
  
  const handlePurchasePickaxe = async (pickaxe: PickaxeTier) => {
    if (!authenticated) {
      alert('Please sign in first!');
      return;
    }
    
    const pickaxeConfig = PICKAXES[pickaxe];
    
    if (gold < pickaxeConfig.price) {
      alert(`Not enough gold! You need ${pickaxeConfig.price}g.`);
      return;
    }
    
    if (window.confirm(`Purchase ${pickaxeConfig.name} for ${pickaxeConfig.price}g?`)) {
      try {
        // TODO: Call PickaxeNFT.buyPickaxe(tier) via usePickaxe hook
        // For now, just update local state
        onPickaxePurchased(pickaxe);
        useGameStore.getState().removeGold(pickaxeConfig.price);
        alert(`Successfully purchased ${pickaxeConfig.name}!`);
        onClose();
      } catch (error: any) {
        console.error('Failed to purchase pickaxe:', error);
        alert(`Failed to purchase pickaxe: ${error.message || 'Unknown error'}`);
      }
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
    
    if (window.confirm(`Sell all materials for ${inventoryValue}g?`)) {
      try {
        const result = await sellResources(inventory);
        onMaterialsSold(result.goldEarned);
        alert(`Successfully sold materials for ${result.goldEarned}g!`);
        onClose();
      } catch (error: any) {
        console.error('Failed to sell materials:', error);
        alert(`Failed to sell materials: ${error.message || 'Unknown error'}`);
      }
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
                        disabled={gold < nextPickaxe.price}
                      >
                        {gold >= nextPickaxe.price ? (
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
    </div>
  );
};

