import React, { useState } from 'react';
import type { LevelId } from '../../game/config/levels';
import { LEVELS } from '../../game/config/levels';
import { PICKAXES } from '../../game/config/pickaxes';
import './LevelPurchaseModal.css';

interface LevelPurchaseModalProps {
  levelId: LevelId;
  currentGold: number;
  onApprove: (numSeconds: number) => Promise<void>;
  onStart: (numSeconds: number) => Promise<void>;
  onCancel: () => void;
  isProcessing: boolean;
}

type PurchaseState = 'confirm' | 'approving' | 'approved' | 'purchasing' | 'success' | 'error';

// Time presets in seconds
const TIME_PRESETS = [15, 30, 60, 120, 300, 600]; // 15s, 30s, 1m, 2m, 5m, 10m

/**
 * LevelPurchaseModal - Detailed modal for purchasing level access
 * Shows clear breakdown of costs, benefits, and transaction progress
 */
export const LevelPurchaseModal: React.FC<LevelPurchaseModalProps> = ({
  levelId,
  currentGold,
  onApprove,
  onStart,
  onCancel,
  isProcessing
}) => {
  const [purchaseState, setPurchaseState] = useState<PurchaseState>('confirm');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [seconds, setSeconds] = useState<number>(60); // Default to 60 seconds (1 minute)
  
  const level = LEVELS[levelId];
  const costPerSecond = level.accessCost; // Now this is cost per second
  const totalCost = costPerSecond * seconds;
  const goldAfterPurchase = currentGold - totalCost;
  const canAfford = currentGold >= totalCost;
  
  const formatTime = (secs: number): string => {
    if (secs < 60) return `${secs}s`;
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    if (remainingSecs === 0) return `${mins}m`;
    return `${mins}m ${remainingSecs}s`;
  };
  
  const handleApprove = async () => {
    try {
      setPurchaseState('approving');
      await onApprove(seconds);
      // Automatically proceed to start the session after approval
      await handleStart();
    } catch (error: any) {
      console.error('Approval failed:', error);
      setPurchaseState('error');
      setErrorMessage(error.message || 'Approval failed. Please try again.');
    }
  };
  
  const handleStart = async () => {
    try {
      setPurchaseState('purchasing');
      await onStart(seconds);
      setPurchaseState('success');
      
      // Auto-close after success
      setTimeout(onCancel, 2000);
    } catch (error: any) {
      console.error('Session start failed:', error);
      setPurchaseState('error');
      setErrorMessage(error.message || 'Session start failed. Please try again.');
    }
  };
  
  // Render different content based on state
  const renderContent = () => {
    switch (purchaseState) {
      case 'confirm':
        return (
          <>
            <div className="modal-header">
              <h2 className="modal-title">Start Mining Session</h2>
              <p className="modal-subtitle">{level.name}</p>
            </div>
            
            <div className="modal-body">
              {/* Time Selection */}
              <div className="time-selection">
                <div className="time-header">
                  <span className="time-label">Select Duration:</span>
                  <span className="time-display">{formatTime(seconds)}</span>
                </div>
                
                {/* Slider with preset options */}
                <div className="time-slider-container">
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="1"
                    value={TIME_PRESETS.indexOf(seconds)}
                    onChange={(e) => setSeconds(TIME_PRESETS[parseInt(e.target.value)])}
                    className="time-slider"
                  />
                  <div className="slider-labels">
                    {TIME_PRESETS.map(preset => (
                      <span key={preset}>{formatTime(preset)}</span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="purchase-details">
                <div className="detail-row">
                  <span className="detail-label">Rate:</span>
                  <span className="detail-value">{costPerSecond} GLD/sec</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Duration:</span>
                  <span className="detail-value highlight">{formatTime(seconds)}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">Total Cost:</span>
                  <span className="detail-value highlight">{totalCost} GLD</span>
                </div>
                
                <div className="detail-row separator">
                  <span className="detail-label">Your Balance:</span>
                  <span className="detail-value">{currentGold} GLD</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">After Purchase:</span>
                  <span className={`detail-value ${goldAfterPurchase < 0 ? 'negative' : 'positive'}`}>
                    {goldAfterPurchase} GLD
                  </span>
                </div>
              </div>
              
              {!canAfford && (
                <div className="warning-box">
                  Insufficient gold! You need {totalCost - currentGold} more GLD.
                </div>
              )}
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
                onClick={handleApprove}
                disabled={!canAfford || isProcessing}
              >
                {canAfford ? `Approve (${totalCost} GLD)` : 'Not Enough Gold'}
              </button>
            </div>
          </>
        );
        
      case 'approving':
        return (
          <>
            <div className="modal-header">
              <h2 className="modal-title">Processing Transaction</h2>
              <p className="modal-subtitle">Approving and starting session</p>
            </div>
            
            <div className="modal-body processing">
              <div className="spinner"></div>
              <p className="processing-message">
                Approving {totalCost} GLD and starting your mining session...
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
              <h2 className="modal-title">Starting Session...</h2>
              <p className="modal-subtitle">Almost there!</p>
            </div>
            
            <div className="modal-body processing">
              <div className="spinner"></div>
              <p className="processing-message">
                Starting {formatTime(seconds)} session at {level.name}
              </p>
              
              <div className="transaction-steps">
                <div className="step completed">
                  <div className="step-number">✓</div>
                  <div className="step-label">Approved</div>
                </div>
                <div className="step-connector completed"></div>
                <div className="step active">
                  <div className="step-number">2</div>
                  <div className="step-label">Starting</div>
                </div>
              </div>
            </div>
          </>
        );
        
      case 'success':
        return (
          <>
            <div className="modal-header success">
              <h2 className="modal-title">Session Started!</h2>
              <p className="modal-subtitle">Timer started for {level.name}</p>
            </div>
            
            <div className="modal-body success">
              <p className="success-message">
                You have {formatTime(seconds)} to mine
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
              <h2 className="modal-title">Purchase Failed</h2>
              <p className="modal-subtitle">Transaction could not be completed</p>
            </div>
            
            <div className="modal-body error">
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
                  // Start over from the beginning
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
  
  const handleOverlayClick = (e: React.MouseEvent) => {
    // Don't allow closing while processing (approving or purchasing)
    // But allow closing in 'approved' state
    if (purchaseState !== 'approving' && purchaseState !== 'purchasing') {
      onCancel();
    } else {
      // Show visual feedback that modal can't be closed during transaction
      e.stopPropagation();
    }
  };
  
  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {renderContent()}
      </div>
    </div>
  );
};

