import React from 'react';
import { LEVELS } from '../../game/config/levels';
import type { LevelId } from '../../game/config/levels';
import './LevelExpiryModal.css';

interface LevelExpiryModalProps {
  expiredLevel: LevelId;
  onClose: () => void;
  onReturnToLevel1: () => void;
  onRenew: () => void;
  canAffordRenewal: boolean;
}

/**
 * LevelExpiryModal - Shown when paid level access expires
 * Offers options to renew or return to Level 1
 */
export const LevelExpiryModal: React.FC<LevelExpiryModalProps> = ({
  expiredLevel,
  onClose,
  onReturnToLevel1,
  onRenew,
  canAffordRenewal
}) => {
  const levelConfig = LEVELS[expiredLevel];
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content level-expiry-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-icon">⏰</div>
        
        <h2 className="modal-title">Access Expired!</h2>
        
        <p className="modal-message">
          Your access to <strong>{levelConfig.name}</strong> has expired.
        </p>
        
        <div className="expiry-info">
          <p>
            You can renew your access for <strong>{levelConfig.accessCost}g</strong> 
            {' '}({levelConfig.accessDuration / 60} minutes)
          </p>
          <p className="info-note">
            Or return to the free Beginner Mine (Level 1)
          </p>
        </div>
        
        <div className="modal-actions">
          <button
            className="btn-primary"
            onClick={onRenew}
            disabled={!canAffordRenewal}
          >
            {canAffordRenewal ? (
              <>💰 Renew Access ({levelConfig.accessCost}g)</>
            ) : (
              <>🚫 Not Enough Gold</>
            )}
          </button>
          
          <button
            className="btn-secondary"
            onClick={onReturnToLevel1}
          >
            ⬅️ Return to Level 1 (Free)
          </button>
        </div>
        
        {!canAffordRenewal && (
          <div className="warning-message">
            You need {levelConfig.accessCost}g to renew. Mine in Level 1 to earn more gold!
          </div>
        )}
      </div>
    </div>
  );
};

