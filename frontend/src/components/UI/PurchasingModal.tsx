import React from 'react';
import './SellingModal.css';

interface PurchasingModalProps {
  isOpen: boolean;
  isProcessing: boolean;
  isSuccess: boolean;
  error: string | null;
  pickaxeName?: string;
  pickaxePrice?: number;
  onClose: () => void;
}

/**
 * PurchasingModal - Shows the progress of purchasing a pickaxe
 */
export const PurchasingModal: React.FC<PurchasingModalProps> = ({
  isOpen,
  isProcessing,
  isSuccess,
  error,
  pickaxeName,
  pickaxePrice,
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
            <h3>Purchasing {pickaxeName}...</h3>
            <p>Please wait while we process your transaction.</p>
            <p className="selling-hint">This may take a few moments.</p>
          </div>
        )}

        {isSuccess && (
          <div className="selling-state success">
            <div className="success-icon">✓</div>
            <h3>Purchase Successful!</h3>
            <p className="gold-earned">You bought <strong>{pickaxeName}</strong> for <strong>{pickaxePrice}g</strong></p>
            <button className="btn-primary" onClick={onClose}>
              Close
            </button>
          </div>
        )}

        {error && (
          <div className="selling-state error">
            <div className="error-icon">✕</div>
            <h3>Purchase Failed</h3>
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

