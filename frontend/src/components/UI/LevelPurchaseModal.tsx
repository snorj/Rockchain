import React, { useState } from 'react';
import type { LevelId } from '../../game/config/levels';
import { LEVELS } from '../../game/config/levels';
import { PICKAXES } from '../../game/config/pickaxes';
import './LevelPurchaseModal.css';

interface LevelPurchaseModalProps {
  levelId: LevelId;
  currentGold: number;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  isProcessing: boolean;
}

type PurchaseState = 'confirm' | 'approving' | 'purchasing' | 'success' | 'error';

/**
 * LevelPurchaseModal - Detailed modal for purchasing level access
 * Shows clear breakdown of costs, benefits, and transaction progress
 */
export const LevelPurchaseModal: React.FC<LevelPurchaseModalProps> = ({
  levelId,
  currentGold,
  onConfirm,
  onCancel,
  isProcessing
}) => {
  const [purchaseState, setPurchaseState] = useState<PurchaseState>('confirm');
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  const level = LEVELS[levelId];
  const durationMinutes = Math.floor(level.accessDuration / 60);
  const costPerMinute = (level.accessCost / durationMinutes).toFixed(1);
  const goldAfterPurchase = currentGold - level.accessCost;
  const canAfford = currentGold >= level.accessCost;
  
  const handleConfirm = async () => {
    try {
      setPurchaseState('approving');
      await onConfirm();
      setPurchaseState('success');
      
      // Auto-close after success
      setTimeout(onCancel, 2000);
    } catch (error: any) {
      console.error('Purchase failed:', error);
      setPurchaseState('error');
      setErrorMessage(error.message || 'Transaction failed. Please try again.');
    }
  };
  
  // Render different content based on state
  const renderContent = () => {
    switch (purchaseState) {
      case 'confirm':
        return (
          <>
            <div className="modal-header">
              <h2 className="modal-title">🔓 Unlock {level.name}?</h2>
              <p className="modal-subtitle">Purchase temporary access to mine premium ores</p>
            </div>
            
            <div className="modal-body">
              <div className="level-preview">
                <div 
                  className="level-preview-banner" 
                  style={{ backgroundColor: level.backgroundColor }}
                >
                  <span className="level-number">Level {levelId}</span>
                </div>
                <div className="level-description">
                  <p>{level.description}</p>
                </div>
              </div>
              
              <div className="purchase-details">
                <h3 className="details-header">Purchase Details</h3>
                
                <div className="detail-row">
                  <span className="detail-label">⏰ Access Duration:</span>
                  <span className="detail-value highlight">{durationMinutes} minutes</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">💰 Total Cost:</span>
                  <span className="detail-value highlight">{level.accessCost} GLD</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">📊 Cost Per Minute:</span>
                  <span className="detail-value">{costPerMinute} GLD/min</span>
                </div>
                
                <div className="detail-row separator">
                  <span className="detail-label">💳 Your Balance:</span>
                  <span className="detail-value">{currentGold} GLD</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">💵 After Purchase:</span>
                  <span className={`detail-value ${goldAfterPurchase < 0 ? 'negative' : 'positive'}`}>
                    {goldAfterPurchase} GLD
                  </span>
                </div>
              </div>
              
              <div className="requirements-box">
                <h3 className="requirements-header">Requirements</h3>
                <div className="requirement-item met">
                  <span className="req-check">✓</span>
                  <span>⛏️ {PICKAXES[level.requiredPickaxe].name} Pickaxe</span>
                </div>
                <div className={`requirement-item ${canAfford ? 'met' : 'unmet'}`}>
                  <span className="req-check">{canAfford ? '✓' : '✗'}</span>
                  <span>💰 {level.accessCost} GLD</span>
                </div>
              </div>
              
              {!canAfford && (
                <div className="warning-box">
                  ⚠️ Insufficient gold! You need {level.accessCost - currentGold} more GLD to purchase this level.
                </div>
              )}
              
              <div className="info-box">
                <p><strong>How it works:</strong></p>
                <ul>
                  <li>You'll pay {level.accessCost} GLD upfront</li>
                  <li>Get {durationMinutes} minutes of unlimited mining access</li>
                  <li>Timer starts immediately after purchase</li>
                  <li>Access expires when timer runs out</li>
                </ul>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-cancel" 
                onClick={onCancel}
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button 
                className="btn-confirm" 
                onClick={handleConfirm}
                disabled={!canAfford || isProcessing}
              >
                {canAfford ? `Purchase for ${level.accessCost} GLD` : 'Not Enough Gold'}
              </button>
            </div>
          </>
        );
        
      case 'approving':
        return (
          <>
            <div className="modal-header">
              <h2 className="modal-title">🔄 Approving GLD...</h2>
              <p className="modal-subtitle">Step 1 of 2</p>
            </div>
            
            <div className="modal-body processing">
              <div className="spinner"></div>
              <p className="processing-message">
                Approving {level.accessCost} GLD for the Game contract
              </p>
              <p className="processing-hint">
                Please approve the transaction in your wallet popup
              </p>
              
              <div className="transaction-steps">
                <div className="step active">
                  <div className="step-number">1</div>
                  <div className="step-label">Approve GLD</div>
                </div>
                <div className="step-connector"></div>
                <div className="step">
                  <div className="step-number">2</div>
                  <div className="step-label">Purchase Access</div>
                </div>
              </div>
            </div>
          </>
        );
        
      case 'purchasing':
        return (
          <>
            <div className="modal-header">
              <h2 className="modal-title">🔓 Purchasing Access...</h2>
              <p className="modal-subtitle">Step 2 of 2</p>
            </div>
            
            <div className="modal-body processing">
              <div className="spinner"></div>
              <p className="processing-message">
                Unlocking {level.name}
              </p>
              <p className="processing-hint">
                Please confirm the transaction in your wallet popup
              </p>
              
              <div className="transaction-steps">
                <div className="step completed">
                  <div className="step-number">✓</div>
                  <div className="step-label">Approve GLD</div>
                </div>
                <div className="step-connector completed"></div>
                <div className="step active">
                  <div className="step-number">2</div>
                  <div className="step-label">Purchase Access</div>
                </div>
              </div>
            </div>
          </>
        );
        
      case 'success':
        return (
          <>
            <div className="modal-header success">
              <h2 className="modal-title">✅ Access Granted!</h2>
              <p className="modal-subtitle">You can now mine in {level.name}</p>
            </div>
            
            <div className="modal-body success">
              <div className="success-icon">🎉</div>
              <p className="success-message">
                You have {durationMinutes} minutes of access
              </p>
              <p className="success-hint">
                Start mining now to make the most of your time!
              </p>
            </div>
          </>
        );
        
      case 'error':
        return (
          <>
            <div className="modal-header error">
              <h2 className="modal-title">❌ Purchase Failed</h2>
              <p className="modal-subtitle">Transaction could not be completed</p>
            </div>
            
            <div className="modal-body error">
              <div className="error-icon">⚠️</div>
              <p className="error-message">{errorMessage}</p>
              <p className="error-hint">
                This could happen if:
              </p>
              <ul className="error-reasons">
                <li>Transaction was cancelled</li>
                <li>Insufficient GLD balance</li>
                <li>Network connection issue</li>
                <li>Gas estimation failed</li>
              </ul>
            </div>
            
            <div className="modal-footer">
              <button className="btn-cancel" onClick={onCancel}>
                Close
              </button>
              <button 
                className="btn-confirm" 
                onClick={() => {
                  setPurchaseState('confirm');
                  setErrorMessage('');
                }}
              >
                Try Again
              </button>
            </div>
          </>
        );
    }
  };
  
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {renderContent()}
      </div>
    </div>
  );
};

