import React, { useState, useEffect } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useGameStore } from '../../store/gameStore';
import { useLevelAccess } from '../../blockchain/hooks/useLevelAccess';
import { LEVELS, canAccessLevel, formatTimeRemaining } from '../../game/config/levels';
import type { LevelId } from '../../game/config/levels';
import { PICKAXES } from '../../game/config/pickaxes';
import './LevelSelector.css';

interface LevelSelectorProps {
  onLevelChange: (levelId: LevelId) => void;
  onPurchaseSuccess: (levelId: LevelId, expiryTime: number) => void;
}

/**
 * LevelSelector - Choose which mining level to access
 * Shows timer for current level and access requirements
 */
export const LevelSelector: React.FC<LevelSelectorProps> = ({
  onLevelChange,
  onPurchaseSuccess
}) => {
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const embeddedWallet = wallets.find(w => w.walletClientType === 'privy');
  
  const gold = useGameStore(state => state.gold);
  const currentPickaxe = useGameStore(state => state.currentPickaxe);
  const currentLevel = useGameStore(state => state.currentLevel);
  const levelExpiry = useGameStore(state => state.levelExpiry);
  
  const { purchaseLevelAccess, isPurchasing, getTimeRemaining } = useLevelAccess(embeddedWallet?.address);
  
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Update timer every second
  useEffect(() => {
    if (!levelExpiry) {
      setTimeRemaining(0);
      return;
    }
    
    const updateTimer = () => {
      const remaining = Math.max(0, Math.floor((levelExpiry - Date.now()) / 1000));
      setTimeRemaining(remaining);
      
      if (remaining <= 0) {
        // Timer expired - will be handled by game scene
        return;
      }
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [levelExpiry]);
  
  const allLevels = Object.values(LEVELS);
  const currentLevelConfig = LEVELS[currentLevel];
  
  const handleLevelSelect = async (levelId: LevelId) => {
    if (!authenticated) {
      alert('Please sign in first!');
      return;
    }
    
    const level = LEVELS[levelId];
    
    // Check if player has required pickaxe
    if (!canAccessLevel(levelId, currentPickaxe)) {
      alert(`You need a ${PICKAXES[level.requiredPickaxe].name} to access this level!`);
      return;
    }
    
    // Check if level is free or player needs to purchase
    if (level.accessCost === 0) {
      // Free level - switch immediately
      onLevelChange(levelId);
      setIsExpanded(false);
    } else {
      // Paid level - initiate purchase
      if (gold < level.accessCost) {
        alert(`Not enough gold! You need ${level.accessCost}g to access this level.`);
        return;
      }
      
      try {
        const result = await purchaseLevelAccess(levelId);
        onPurchaseSuccess(levelId, result.expiryTime);
        setIsExpanded(false);
      } catch (error: any) {
        console.error('Failed to purchase level access:', error);
        alert(`Failed to purchase level access: ${error.message || 'Unknown error'}`);
      }
    }
  };
  
  return (
    <div className="level-selector">
      <div className="level-current" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="level-info">
          <span className="level-name">{currentLevelConfig.name}</span>
          <span className="level-tier">Level {currentLevel}</span>
        </div>
        
        {levelExpiry && timeRemaining > 0 && (
          <div className={`level-timer ${timeRemaining < 30 ? 'warning' : ''}`}>
            ⏰ {formatTimeRemaining(timeRemaining)}
          </div>
        )}
        
        {!levelExpiry && (
          <div className="level-timer unlimited">
            ∞ Unlimited
          </div>
        )}
        
        <button className="expand-button" disabled={isPurchasing}>
          {isPurchasing ? '⏳' : isExpanded ? '▲' : '▼'}
        </button>
      </div>
      
      {isExpanded && (
        <div className="level-dropdown">
          {allLevels.map(level => {
            const hasPickaxe = canAccessLevel(level.id, currentPickaxe);
            const canAfford = gold >= level.accessCost;
            const isCurrent = level.id === currentLevel;
            const isLocked = !hasPickaxe;
            
            return (
              <div
                key={level.id}
                className={`level-option ${isCurrent ? 'current' : ''} ${isLocked ? 'locked' : ''}`}
                onClick={() => !isLocked && !isCurrent && handleLevelSelect(level.id)}
                style={{ borderLeftColor: level.backgroundColor }}
              >
                <div className="level-option-header">
                  <span className="level-option-name">
                    {level.name}
                    {isCurrent && <span className="current-badge">ACTIVE</span>}
                  </span>
                  <span className="level-number">Lv.{level.id}</span>
                </div>
                
                <div className="level-option-desc">
                  {level.description}
                </div>
                
                <div className="level-option-requirements">
                  <div className="requirement">
                    <span className="req-icon">⛏️</span>
                    <span className={hasPickaxe ? 'req-met' : 'req-unmet'}>
                      {PICKAXES[level.requiredPickaxe].name}
                      {!hasPickaxe && ' (Required)'}
                    </span>
                  </div>
                  
                  {level.accessCost > 0 && (
                    <div className="requirement">
                      <span className="req-icon">💰</span>
                      <span className={canAfford ? 'req-met' : 'req-unmet'}>
                        {level.accessCost}g ({level.accessDuration / 60} min)
                      </span>
                    </div>
                  )}
                  
                  {level.accessCost === 0 && (
                    <div className="requirement">
                      <span className="req-icon">✨</span>
                      <span className="req-met">Free Forever</span>
                    </div>
                  )}
                </div>
                
                {isLocked && (
                  <div className="locked-overlay">
                    <span className="lock-icon">🔒</span>
                    <span>Upgrade pickaxe to unlock</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

