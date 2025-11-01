import { GameCanvas } from '../Game/GameCanvas';
import { InventoryHUD } from '../UI/InventoryHUD';
import { SellButton } from '../UI/SellButton';
import './GameLayout.css';

/**
 * GameLayout component
 * Main layout wrapper that organizes the game canvas and UI elements
 */
export const GameLayout = () => {
  return (
    <div className="game-layout">
      <header className="game-header">
        <h1 className="game-logo">⛏️ ROCKCHAIN</h1>
        <p className="game-subtitle">Mine. Collect. Earn.</p>
      </header>

      <main className="game-main">
        <aside className="sidebar sidebar-left">
          <InventoryHUD />
        </aside>

        <div className="game-area">
          <GameCanvas />
        </div>

        <aside className="sidebar sidebar-right">
          <SellButton />
        </aside>
      </main>

      <footer className="game-footer">
        <p>Built with Phaser.js & React • Click ores to mine them</p>
      </footer>
    </div>
  );
};

