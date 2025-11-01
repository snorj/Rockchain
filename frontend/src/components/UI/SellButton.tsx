import { useGameStore } from '../../store/gameStore';
import { usePrivy } from '@privy-io/react-auth';
import { useSellResources } from '../../blockchain/hooks/useSellResources';
import './SellButton.css';

/**
 * SellButton component
 * Allows player to sell collected ores for GLD tokens on-chain
 */
export const SellButton = () => {
  const { inventory, onSellRequested, onSellComplete } = useGameStore();
  const { authenticated } = usePrivy();
  const { sellResources, isLoading, error } = useSellResources();
  
  // Check if player has any ores to sell
  const hasOres = inventory.coal > 0 || inventory.iron > 0 || inventory.diamond > 0;
  
  // Calculate total value
  const sellData = onSellRequested();
  const totalValue = sellData.totalValue;

  /**
   * Handles sell button click - sends real blockchain transaction
   */
  const handleSell = async () => {
    if (!hasOres || isLoading) return;
    
    if (!authenticated) {
      alert('Please connect your wallet first!');
      return;
    }
    
    const data = onSellRequested();
    
    console.log('🔄 Selling resources on-chain:', data);
    
    try {
      const txHash = await sellResources(data.coal, data.iron, data.diamond);
      
      // Success!
      onSellComplete(true, txHash);
      
      console.log('✅ Transaction successful!');
      alert(`🎉 Resources sold! View on Etherscan: https://sepolia.etherscan.io/tx/${txHash}`);
    } catch (err) {
      console.error('❌ Transaction failed:', err);
      onSellComplete(false);
      alert('Transaction failed. Please try again.');
    }
  };

  return (
    <div className="sell-button-container">
      <div className="total-value">
        <span className="value-label">Total Value:</span>
        <span className="value-amount">{totalValue} GLD</span>
      </div>
      
      <button
        className={`sell-button ${!hasOres || isLoading || !authenticated ? 'disabled' : ''}`}
        disabled={!hasOres || isLoading || !authenticated}
        onClick={handleSell}
      >
        {isLoading ? (
          <>
            <span className="spinner"></span>
            Sending Transaction...
          </>
        ) : (
          <>
            💰 Sell Resources
          </>
        )}
      </button>
      
      {!authenticated && (
        <p className="sell-hint">Connect wallet to sell!</p>
      )}
      
      {!hasOres && authenticated && (
        <p className="sell-hint">Mine some ores first!</p>
      )}
      
      {error && (
        <p className="sell-error">{error}</p>
      )}
    </div>
  );
};

