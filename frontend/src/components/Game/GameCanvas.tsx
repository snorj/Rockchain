import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { gameConfig } from '../../game/config/gameConfig';
import './GameCanvas.css';

/**
 * GameCanvas component
 * Mounts and manages the Phaser game instance
 * Handles proper lifecycle management (mount/unmount)
 */
export const GameCanvas = () => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Don't create game if it already exists
    if (gameRef.current) return;

    console.log('🎮 Initializing Phaser game...');

    // Create the game instance
    gameRef.current = new Phaser.Game(gameConfig);

    // Cleanup function
    return () => {
      console.log('🔄 Destroying Phaser game...');
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div className="game-canvas-wrapper">
      <div id="game-container" ref={containerRef} />
    </div>
  );
};

