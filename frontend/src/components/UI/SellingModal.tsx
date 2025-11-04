import React from 'react';
import './SellingModal.css';

interface SellingModalProps {
  isOpen: boolean;
  isProcessing: boolean;
  isSuccess: boolean;
  error: string | null;
  goldEarned?: number;
  onClose: () => void;
}

/**
 * SellingModal - Shows the progress of selling materials
 */
export const SellingModal: React.FC<SellingModalProps> = ({
  isOpen,
  isProcessing,
  isSuccess,
  error,
  goldEarned,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay selling-modal-overlay">
      <div className="modal-content selling-modal" onClick={e => e.stopPropagation()}>
        {isProcessing && (
          <div className="selling-state processing">
            <div className="selling-spinner">
              <div className="spinner"></div>
            </div>
            <h3>Processing Sale...</h3>
            <p>Please wait while we process your transaction.</p>
            <p className="selling-hint">This may take a few moments.</p>
          </div>
        )}

        {isSuccess && (
          <div className="selling-state success">
            <div className="success-icon">✓</div>
            <h3>Sale Successful!</h3>
            <p className="gold-earned">You earned <strong>{goldEarned}g</strong></p>
            <p className="selling-hint" style={{ color: '#ff9800', marginTop: '10px' }}>
              ⏱️ Wait 5-10 seconds for your balance to sync before making purchases.
            </p>
            <button className="btn-primary" onClick={onClose}>
              Close
            </button>
          </div>
        )}

        {error && (
          <div className="selling-state error">
            <div className="error-icon">✕</div>
            <h3>Sale Failed</h3>
            <p className="error-message">{error}</p>
            <button className="btn-primary" onClick={onClose}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

