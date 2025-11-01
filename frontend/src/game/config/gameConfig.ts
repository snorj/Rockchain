import Phaser from 'phaser';
import { PreloadScene } from '../scenes/PreloadScene';
import { MiningScene } from '../scenes/MiningScene';
import { GAME_CONFIG } from '../../utils/constants';

/**
 * Phaser game configuration
 * This sets up the game engine with all necessary settings
 */
export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: GAME_CONFIG.WIDTH,
  height: GAME_CONFIG.HEIGHT,
  pixelArt: GAME_CONFIG.PIXEL_ART, // Disable antialiasing for crisp pixel art
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { x: 0, y: 0 } // No gravity for this game
    }
  },
  scene: [PreloadScene, MiningScene],
  backgroundColor: '#1a1a2e',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

