import React, { useState } from 'react';
import type { LevelId } from '../../game/config/levels';
import { LEVELS } from '../../game/config/levels';
import { PICKAXES } from '../../game/config/pickaxes';
import './LevelPurchaseModal.css';

interface LevelPurchaseModalProps {
  levelId: LevelId;
  currentGold: number;
  onConfirm: (numMinutes: number) => Promise<void>;
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
  const [minutes, setMinutes] = useState<number>(10); // Default to 10 minutes
  
  const level = LEVELS[levelId];
  // Per-minute pricing: accessCost is the cost per minute, accessDuration is 60 (1 minute blocks)
  const costPerMinute = level.accessCost;
  const totalCost = costPerMinute * minutes;
  const goldAfterPurchase = currentGold - totalCost;
  const canAfford = currentGold >= totalCost;
  
  // Calculate max affordable minutes
  const maxAffordableMinutes = Math.min(60, Math.floor(currentGold / costPerMinute));
  
  const handleConfirm = async () => {
    try {
      setPurchaseState('approving');
      await onConfirm(minutes);
      setPurchaseState('success');
      
      // Auto-close after success
      setTimeout(onCancel, 2000);
    } catch (error: any) {
      console.error('Purchase failed:', error);
      setPurchaseState('error');
      setErrorMessage(error.message || 'Transaction failed. Please try again.');
    }
  };
  
  const handleMinutesChange = (value: number) => {
    const clamped = Math.max(1, Math.min(60, value));
    setMinutes(clamped);
  };
  
  // Render different content based on state
  const renderContent = () => {
    switch (purchaseState) {
      case 'confirm':
        return (
          <>
            <div className="modal-header">
              <h2 className="modal-title">⏱️ Start Mining Session</h2>
              <p className="modal-subtitle">Pay per minute to mine at {level.name}</p>
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
                <h3 className="details-header">Session Details</h3>
                
                <div className="detail-row">
                  <span className="detail-label">📊 Price:</span>
                  <span className="detail-value highlight">{costPerMinute} GLD/minute</span>
                </div>
                
                <div className="minutes-selector">
                  <div className="detail-row">
                    <span className="detail-label">⏰ Duration:</span>
                    <span className="detail-value highlight">{minutes} minute{minutes > 1 ? 's' : ''}</span>
                  </div>
                  <div className="slider-container">
                    <input
                      type="range"
                      min="1"
                      max={Math.min(60, maxAffordableMinutes)}
                      value={minutes}
                      onChange={(e) => handleMinutesChange(parseInt(e.target.value))}
                      className="minutes-slider"
                      disabled={maxAffordableMinutes < 1}
                    />
                    <div className="slider-labels">
                      <span>1 min</span>
                      <span>{Math.min(60, maxAffordableMinutes)} min</span>
                    </div>
                  </div>
                  <div className="quick-select-buttons">
                    <button 
                      onClick={() => handleMinutesChange(1)} 
                      className={minutes === 1 ? 'active' : ''}
                      disabled={maxAffordableMinutes < 1}
                    >
                      1m
                    </button>
                    <button 
                      onClick={() => handleMinutesChange(5)} 
                      className={minutes === 5 ? 'active' : ''}
                      disabled={maxAffordableMinutes < 5}
                    >
                      5m
                    </button>
                    <button 
                      onClick={() => handleMinutesChange(10)} 
                      className={minutes === 10 ? 'active' : ''}
                      disabled={maxAffordableMinutes < 10}
                    >
                      10m
                    </button>
                    <button 
                      onClick={() => handleMinutesChange(30)} 
                      className={minutes === 30 ? 'active' : ''}
                      disabled={maxAffordableMinutes < 30}
                    >
                      30m
                    </button>
                    <button 
                      onClick={() => handleMinutesChange(60)} 
                      className={minutes === 60 ? 'active' : ''}
                      disabled={maxAffordableMinutes < 60}
                    >
                      60m
                    </button>
                  </div>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">💰 Total Cost:</span>
                  <span className="detail-value highlight">{totalCost} GLD</span>
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
                  <span>💰 {totalCost} GLD</span>
                </div>
              </div>
              
              {!canAfford && (
                <div className="warning-box">
                  ⚠️ Insufficient gold! You need {totalCost - currentGold} more GLD to start this session.
                </div>
              )}
              
              <div className="info-box">
                <p><strong>How it works:</strong></p>
                <ul>
                  <li>Pay {totalCost} GLD for {minutes} minute{minutes > 1 ? 's' : ''} of mining</li>
                  <li>Session timer starts immediately</li>
                  <li>Mine as much as you can within the time</li>
                  <li>Return to Level 1 when time expires</li>
                  <li>Select more minutes to maximize your profit potential</li>
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
                {canAfford ? `Start Session (${totalCost} GLD)` : 'Not Enough Gold'}
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
                Approving {totalCost} GLD for the Game contract
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
                  <div className="step-label">Start Session</div>
                </div>
              </div>
            </div>
          </>
        );
        
      case 'purchasing':
        return (
          <>
            <div className="modal-header">
              <h2 className="modal-title">⏱️ Starting Session...</h2>
              <p className="modal-subtitle">Step 2 of 2</p>
            </div>
            
            <div className="modal-body processing">
              <div className="spinner"></div>
              <p className="processing-message">
                Starting {minutes} minute session at {level.name}
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
                  <div className="step-label">Start Session</div>
                </div>
              </div>
            </div>
          </>
        );
        
      case 'success':
        return (
          <>
            <div className="modal-header success">
              <h2 className="modal-title">✅ Session Started!</h2>
              <p className="modal-subtitle">Timer started for {level.name}</p>
            </div>
            
            <div className="modal-body success">
              <div className="success-icon">⏱️</div>
              <p className="success-message">
                You have {minutes} minute to mine
              </p>
              <p className="success-hint">
                Watch the timer at the top of the screen!
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

