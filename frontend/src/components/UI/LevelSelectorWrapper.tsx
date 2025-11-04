import React, { useEffect, useState } from 'react';
import { LevelSelector } from './LevelSelector';
import type { LevelId } from '../../game/config/levels';

/**
 * LevelSelectorWrapper - Wrapper for LevelSelector in sidebar
 * Gets handlers from window object exposed by GameUI
 */
export const LevelSelectorWrapper: React.FC = () => {
  const [handlers, setHandlers] = useState<{
    onLevelChange: (levelId: LevelId) => void;
    onPurchaseSuccess: (levelId: LevelId, expiryTime: number) => void;
  } | null>(null);
  
  useEffect(() => {
    // Wait for handlers to be available
    const checkHandlers = () => {
      if ((window as any).gameLevelHandlers) {
        setHandlers((window as any).gameLevelHandlers);
      } else {
        // Keep checking until handlers are available
        setTimeout(checkHandlers, 100);
      }
    };
    
    checkHandlers();
  }, []);
  
  if (!handlers) {
    // Show placeholder while waiting for handlers
    return (
      <div className="level-selector">
        <div className="level-current">
          <div className="level-info">
            <span className="level-name">Loading...</span>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <LevelSelector
      onLevelChange={handlers.onLevelChange}
      onPurchaseSuccess={handlers.onPurchaseSuccess}
    />
  );
};

