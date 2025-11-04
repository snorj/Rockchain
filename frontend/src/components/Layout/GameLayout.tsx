import { GameCanvas } from '../Game/GameCanvas';
import { GameUI } from '../Game/GameUI';
import { InventoryPanel } from '../UI/InventoryPanel';
import { WalletButton } from '../Web3/WalletButton';
import { InventoryControls } from '../UI/InventoryControls';
import { LevelSelectorWrapper } from '../UI/LevelSelectorWrapper';
import { PickaxeProgressBar } from '../UI/PickaxeProgressBar';
import { GOLD_TOKEN_ADDRESS, GAME_ADDRESS } from '../../blockchain/config/contracts';
import './GameLayout.css';

/**
 * GameLayout component
 * Main layout wrapper that organizes the game canvas and UI elements
 * Inventory is positioned to the right of the game window
 */
export const GameLayout = () => {
  return (
    <div className="game-layout">
      <header className="game-header">
        <div className="header-left">
          <h1 className="game-logo">ROCKCHAIN</h1>
          <p className="game-subtitle">Mine. Collect. Earn.</p>
        </div>
        <div className="header-right">
          <WalletButton />
        </div>
      </header>

      <main className="game-main">
        <div className="game-area">
          <GameCanvas />
          <GameUI />
        </div>
        
        <div className="sidebar sidebar-right">
          <LevelSelectorWrapper />
          <InventoryControls />
          <InventoryPanel />
          <PickaxeProgressBar />
        </div>
      </main>

      <footer className="game-footer">
        <p>Click ores to mine them • Press S for Shop, I for Info</p>
        <div className="contract-addresses">
          <div className="contract-address">
            <span className="contract-label">GLD Token:</span>
            <a 
              href={`https://sepolia.etherscan.io/token/${GOLD_TOKEN_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="contract-link"
            >
              {GOLD_TOKEN_ADDRESS}
            </a>
          </div>
          <div className="contract-address">
            <span className="contract-label">Game Contract:</span>
            <a 
              href={`https://sepolia.etherscan.io/address/${GAME_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="contract-link"
            >
              {GAME_ADDRESS}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

