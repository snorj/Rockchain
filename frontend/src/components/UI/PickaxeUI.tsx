import { useWallets } from '@privy-io/react-auth';
import { usePickaxe } from '../../blockchain/hooks/usePickaxe';
import { PICKAXE_CONFIG } from '../../utils/constants';
import type { PickaxeTier } from '../../utils/constants';
import { getPickaxeSpritePath } from '../../utils/pickaxeAssets';
import './PickaxeUI.css';

/**
 * PickaxeUI component displays current pickaxe status
 * Allows buying, upgrading, and repairing pickaxes
 */
export const PickaxeUI = () => {
  const { wallets } = useWallets();
  const address = wallets[0]?.address;
  
  const {
    pickaxe,
    hasPickaxe,
    isLoading,
    isMinting,
    isBuying,
    isRepairing,
    mintStarter,
    buyPickaxe,
    repairPickaxe,
    getTierName,
    getDurabilityPercent,
    needsRepair,
  } = usePickaxe(address);

  // Show loading state
  if (isLoading) {
    return (
      <div className="pickaxe-ui">
        <div className="pickaxe-loading">Loading pickaxe...</div>
      </div>
    );
  }

  // Show mint starter button if no pickaxe
  if (!hasPickaxe || !pickaxe) {
    return (
      <div className="pickaxe-ui">
        <h3 className="pickaxe-title">⛏️ Pickaxe</h3>
        <div className="no-pickaxe">
          <p>You need a pickaxe to mine!</p>
          <button 
            className="btn-primary"
            onClick={mintStarter}
            disabled={isMinting}
          >
            {isMinting ? 'Minting...' : '🆓 Get Free Starter Pickaxe'}
          </button>
        </div>
      </div>
    );
  }

  const tier = pickaxe.tier as PickaxeTier;
  const tierName = getTierName();
  const durabilityPercent = getDurabilityPercent();
  const speedMultiplier = PICKAXE_CONFIG.SPEED_MULTIPLIERS[tier];
  const canUpgrade = tier < 4; // Max tier is 4 (Adamantite)
  const nextTier = (tier + 1) as PickaxeTier;

  return (
    <div className="pickaxe-ui">
      <h3 className="pickaxe-title">⛏️ Pickaxe</h3>
      
      {/* Current Pickaxe Info */}
      <div className={`current-pickaxe tier-${tier}`}>
        <div className="pickaxe-header">
          <div className="pickaxe-icon">
            <img 
              src={getPickaxeSpritePath(tier)} 
              alt={`${tierName} Pickaxe`}
              className="pickaxe-sprite"
            />
          </div>
          <div className="pickaxe-title-section">
            <span className="pickaxe-name">{tierName}</span>
            <span className="pickaxe-tier">Tier {tier + 1}</span>
          </div>
        </div>
        
        <div className="pickaxe-stats">
          <div className="stat">
            <span className="stat-label">Speed</span>
            <span className="stat-value">{speedMultiplier}×</span>
          </div>
          <div className="stat">
            <span className="stat-label">Durability</span>
            <span className="stat-value">
              {pickaxe.durability.toString()}/{pickaxe.maxDurability.toString()}
            </span>
          </div>
        </div>
        
        {/* Durability Bar */}
        <div className="durability-bar-container">
          <div 
            className={`durability-bar ${durabilityPercent < 25 ? 'low' : ''}`}
            style={{ width: `${durabilityPercent}%` }}
          />
        </div>
        
        {/* Repair Button */}
        {needsRepair() && (
          <button 
            className="btn-repair"
            onClick={repairPickaxe}
            disabled={isRepairing}
          >
            {isRepairing ? 'Repairing...' : `🔧 Repair (${PICKAXE_CONFIG.COSTS[tier] * PICKAXE_CONFIG.REPAIR_COST_PERCENT} GLD)`}
          </button>
        )}
      </div>
      
      {/* Upgrade Section */}
      {canUpgrade && (
        <div className="upgrade-section">
          <h4 className="upgrade-title">Upgrade Available</h4>
          <div className="upgrade-option">
            <div className="upgrade-info">
              <span className="upgrade-name">{PICKAXE_CONFIG.TIERS[nextTier]}</span>
              <span className="upgrade-benefit">
                {PICKAXE_CONFIG.SPEED_MULTIPLIERS[nextTier]}× speed
              </span>
            </div>
            <button 
              className="btn-upgrade"
              onClick={() => buyPickaxe(nextTier)}
              disabled={isBuying}
            >
              {isBuying ? 'Buying...' : `Buy ${PICKAXE_CONFIG.COSTS[nextTier]} GLD`}
            </button>
          </div>
        </div>
      )}
      
      {/* Max Tier Message */}
      {!canUpgrade && (
        <div className="max-tier-message">
          <span className="max-tier-icon">👑</span>
          <span>Maximum Tier Reached!</span>
        </div>
      )}
    </div>
  );
};

