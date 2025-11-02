import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { gameConfig } from '../../game/config/gameConfig';
import type { MiningScene } from '../../game/scenes/MiningScene';
import './GameCanvas.css';

/**
 * GameCanvas component
 * Mounts and manages the Phaser game instance
 * Handles proper lifecycle management (mount/unmount)
 * Exposes MiningScene to window for React UI integration
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

    // Wait for scene to be ready, then expose it
    const checkScene = () => {
      if (gameRef.current) {
        const miningScene = gameRef.current.scene.getScene('MiningScene') as MiningScene;
        
        if (miningScene) {
          // Expose scene to window for React components
          (window as any).miningScene = miningScene;
          console.log('✅ MiningScene exposed to window');
          
          // Listen for scene ready event
          miningScene.events.once('scene-ready', () => {
            console.log('✅ MiningScene is ready');
          });
        } else {
          // Scene not ready yet, try again
          setTimeout(checkScene, 100);
        }
      }
    };
    
    // Start checking for scene
    setTimeout(checkScene, 100);

    // Cleanup function
    return () => {
      console.log('🔄 Destroying Phaser game...');
      
      // Remove scene reference from window
      (window as any).miningScene = null;
      
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

