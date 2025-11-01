import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import './SellButton.css';

/**
 * SellButton component
 * Allows player to sell collected ores for GLD tokens
 * Currently uses mock functionality - will be replaced with blockchain integration
 */
export const SellButton = () => {
  const { inventory, onSellRequested, onSellComplete } = useGameStore();
  const [isSelling, setIsSelling] = useState(false);
  
  // Check if player has any ores to sell
  const hasOres = inventory.coal > 0 || inventory.iron > 0 || inventory.diamond > 0;
  
  // Calculate total value
  const sellData = onSellRequested();
  const totalValue = sellData.totalValue;

  /**
   * Handles sell button click
   * TODO: Replace mock implementation with blockchain call (PRD-2)
   */
  const handleSell = async () => {
    if (!hasOres || isSelling) return;
    
    setIsSelling(true);
    const data = onSellRequested();
    
    console.log('🔄 Sell requested:', data);
    
    try {
      // FOR MVP: Mock sell transaction
      // BLOCKCHAIN TEAM: Replace this with actual smart contract call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful transaction
      onSellComplete(true, 'mock-tx-hash-' + Date.now());
      
      console.log('✅ Sell completed successfully!');
    } catch (error) {
      console.error('❌ Sell failed:', error);
      onSellComplete(false);
    } finally {
      setIsSelling(false);
    }
  };

  return (
    <div className="sell-button-container">
      <div className="total-value">
        <span className="value-label">Total Value:</span>
        <span className="value-amount">{totalValue} GLD</span>
      </div>
      
      <button
        className={`sell-button ${!hasOres || isSelling ? 'disabled' : ''}`}
        disabled={!hasOres || isSelling}
        onClick={handleSell}
      >
        {isSelling ? (
          <>
            <span className="spinner"></span>
            Selling...
          </>
        ) : (
          <>
            💰 Sell Resources
          </>
        )}
      </button>
      
      {!hasOres && (
        <p className="sell-hint">Mine some ores first!</p>
      )}
    </div>
  );
};

