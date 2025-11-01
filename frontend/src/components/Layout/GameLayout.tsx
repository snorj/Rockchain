import { GameCanvas } from '../Game/GameCanvas';
import { InventoryHUD } from '../UI/InventoryHUD';
import { SellButton } from '../UI/SellButton';
import { WalletButton } from '../Web3/WalletButton';
import './GameLayout.css';

/**
 * GameLayout component
 * Main layout wrapper that organizes the game canvas and UI elements
 */
export const GameLayout = () => {
  return (
    <div className="game-layout">
      <header className="game-header">
        <div className="header-left">
          <h1 className="game-logo">⛏️ ROCKCHAIN</h1>
          <p className="game-subtitle">Mine. Collect. Earn.</p>
        </div>
        <div className="header-right">
          <WalletButton />
        </div>
      </header>

      <main className="game-main">
        <div className="game-area">
          <GameCanvas />
        </div>

        <aside className="sidebar sidebar-right">
          <InventoryHUD />
          <SellButton />
        </aside>
      </main>

      <footer className="game-footer">
        <p>Built with Phaser.js & React • Click ores to mine them</p>
      </footer>
    </div>
  );
};

