import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { PICKAXES, getNextPickaxe } from '../../game/config/pickaxes';
import type { PickaxeTier } from '../../game/config/pickaxes';
import { formatNumber } from '../../utils/numberFormat';
import './PickaxeProgressBar.css';

/**
 * PickaxeProgressBar - Shows progress towards next pickaxe upgrade
 * Positioned at the bottom of the game canvas
 */
export const PickaxeProgressBar: React.FC = () => {
  const gold = useGameStore(state => state.gold);
  const currentPickaxe = useGameStore(state => state.currentPickaxe);
  
  const currentConfig = PICKAXES[currentPickaxe];
  const nextPickaxeConfig = getNextPickaxe(currentPickaxe);
  
  // If at max tier, show max tier display
  if (!nextPickaxeConfig) {
    return (
      <div className="pickaxe-progress-bar-container">
        <div className="pickaxe-progress-max">
          <img
            src={currentConfig.spritePath}
            alt={currentConfig.name}
            className="pickaxe-progress-icon"
          />
          <span className="pickaxe-progress-max-text">
            MAX TIER: {currentConfig.name}
          </span>
        </div>
      </div>
    );
  }
  
  const progress = Math.min((gold / nextPickaxeConfig.price) * 100, 100);
  const isAffordable = gold >= nextPickaxeConfig.price;
  
  return (
    <div className="pickaxe-progress-bar-container">
      <div className="pickaxe-progress-content">
        {/* Progress Bar */}
        <div className="pickaxe-progress-bar-wrapper">
          <div className="pickaxe-progress-bar">
            <div 
              className={`pickaxe-progress-fill ${isAffordable ? 'affordable' : ''}`}
              style={{ 
                width: `${progress}%`,
                backgroundColor: nextPickaxeConfig.color,
                boxShadow: `0 0 10px ${nextPickaxeConfig.color}80`
              }}
            />
          </div>
          
          {/* Progress Text */}
          <div className="pickaxe-progress-text">
            <span className={isAffordable ? 'affordable' : ''}>
              {formatNumber(gold)} / {formatNumber(nextPickaxeConfig.price)} GLD
            </span>
            {isAffordable && <span className="affordable-badge">✓ READY</span>}
          </div>
        </div>
        
        {/* Next Pickaxe */}
        <div className="pickaxe-progress-next">
          <img
            src={nextPickaxeConfig.spritePath}
            alt={nextPickaxeConfig.name}
            className="pickaxe-progress-icon next"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="pickaxe-progress-name next">{nextPickaxeConfig.name}</div>
        </div>
      </div>
    </div>
  );
};

