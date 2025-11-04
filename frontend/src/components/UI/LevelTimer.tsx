import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { formatTimeRemaining } from '../../game/config/levels';
import './LevelTimer.css';

/**
 * LevelTimer - Displays countdown timer for current level access
 * Shown in the top right corner of the game window
 */
export const LevelTimer: React.FC = () => {
  const levelExpiry = useGameStore(state => state.levelExpiry);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  
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
  
  // Don't show anything if no expiry (free level)
  if (!levelExpiry) {
    return null;
  }
  
  // Don't show if expired
  if (timeRemaining <= 0) {
    return null;
  }
  
  return (
    <div className={`level-timer-display ${timeRemaining < 30 ? 'warning' : ''}`}>
      <span className="timer-icon">⏰</span>
      <span className="timer-text">{formatTimeRemaining(timeRemaining)}</span>
    </div>
  );
};

