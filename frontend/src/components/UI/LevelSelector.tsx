import React, { useState, useEffect } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useGameStore } from '../../store/gameStore';
import { useLevelAccess } from '../../blockchain/hooks/useLevelAccess';
import { LEVELS, canAccessLevel } from '../../game/config/levels';
import type { LevelId } from '../../game/config/levels';
import { PICKAXES } from '../../game/config/pickaxes';
import { LevelPurchaseModal } from './LevelPurchaseModal';
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
  
  const { approveMiningSession, startMiningSession, isPurchasing } = useLevelAccess(embeddedWallet?.address);
  
  const [, setTimeRemaining] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<LevelId | null>(null);
  
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
      // Check if player already has an active session (can't start a new one while one is active)
      if (levelExpiry && levelExpiry > Date.now()) {
        const remainingTime = Math.floor((levelExpiry - Date.now()) / 1000);
        const mins = Math.floor(remainingTime / 60);
        const secs = remainingTime % 60;
        const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
        
        if (currentLevel === levelId) {
          // Trying to extend the same level
          alert(`You already have an active session at ${level.name} (${timeStr} remaining). Please wait for it to expire before starting a new session.`);
        } else {
          // Trying to switch to a different level
          alert(`You already have an active session at ${LEVELS[currentLevel].name} (${timeStr} remaining). Please wait for it to expire first.`);
        }
        return;
      }
      
      // Paid level - show purchase modal
      setSelectedLevel(levelId);
      setShowPurchaseModal(true);
    }
  };
  
  const handleApprove = async (numSeconds: number) => {
    if (!selectedLevel) return;
    
    try {
      await approveMiningSession(selectedLevel, numSeconds);
      // Approval succeeded - modal will show "Start" button
    } catch (error: any) {
      // Error is handled by modal
      throw error;
    }
  };
  
  const handleStart = async (numSeconds: number) => {
    if (!selectedLevel) return;
    
    try {
      const result = await startMiningSession(selectedLevel, numSeconds);
      onPurchaseSuccess(selectedLevel, result.expiryTime);
      setShowPurchaseModal(false);
      setIsExpanded(false);
    } catch (error: any) {
      // Error is handled by modal
      throw error;
    }
  };
  
  const handlePurchaseCancel = () => {
    setShowPurchaseModal(false);
    setSelectedLevel(null);
  };
  
  return (
    <div className="level-selector">
      <div className="level-current" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="level-info">
          <span className="level-name">{currentLevelConfig.name}</span>
          <span className="level-tier">Level {currentLevel}</span>
        </div>
        
        <button className="expand-button" disabled={isPurchasing}>
          {isExpanded ? '▲' : '▼'}
        </button>
      </div>
      
      {isExpanded && (
        <div className="level-dropdown">
          {allLevels.map(level => {
            const hasPickaxe = canAccessLevel(level.id, currentPickaxe);
            const canAfford = gold >= level.accessCost;
            const isCurrent = level.id === currentLevel;
            const isLocked = !hasPickaxe;
            const hasActiveSession = levelExpiry && levelExpiry > Date.now();
            const isSessionBlocked = level.accessCost > 0 && hasActiveSession && !isCurrent;
            
            return (
              <div
                key={level.id}
                className={`level-option ${isCurrent ? 'current' : ''} ${isLocked ? 'locked' : ''} ${isSessionBlocked ? 'session-blocked' : ''}`}
                onClick={() => !isLocked && !isCurrent && !isSessionBlocked && handleLevelSelect(level.id)}
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
                    <span className="req-icon">
                      <img 
                        src={`/assets/sprites/pickaxes/${level.requiredPickaxe}/pickaxe-${level.requiredPickaxe}.png`} 
                        alt="pickaxe"
                        style={{ width: '16px', height: '16px' }}
                      />
                    </span>
                    <span className={hasPickaxe ? 'req-met' : 'req-unmet'}>
                      {PICKAXES[level.requiredPickaxe].name}
                      {!hasPickaxe && ' (Required)'}
                    </span>
                  </div>
                  
                  {level.accessCost > 0 && (
                    <div className="requirement">
                      <span className={canAfford ? 'req-met' : 'req-unmet'}>
                        {level.accessCost}g/sec
                      </span>
                    </div>
                  )}
                  
                  {level.accessCost === 0 && (
                    <div className="requirement">
                      <span className="req-met">Free Forever</span>
                    </div>
                  )}
                </div>
                
                {isLocked && (
                  <div className="locked-overlay">
                    <span>Upgrade pickaxe to unlock</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      {showPurchaseModal && selectedLevel && (
        <LevelPurchaseModal
          levelId={selectedLevel}
          currentGold={gold}
          onApprove={handleApprove}
          onStart={handleStart}
          onCancel={handlePurchaseCancel}
          isProcessing={isPurchasing}
        />
      )}
    </div>
  );
};

