import { useGameStore } from '../../store/gameStore';
import './InventoryHUD.css';

/**
 * InventoryHUD displays current ore counts
 * Updates in real-time as player mines ores
 */
export const InventoryHUD = () => {
  const inventory = useGameStore((state) => state.inventory);

  return (
    <div className="inventory-hud">
      <h3 className="inventory-title">Inventory</h3>
      <div className="inventory-grid">
        <div className="ore-count coal">
          <div className="ore-icon">⚫</div>
          <div className="ore-info">
            <span className="ore-name">Coal</span>
            <span className="ore-amount">{inventory.coal}</span>
          </div>
        </div>
        
        <div className="ore-count iron">
          <div className="ore-icon">🟤</div>
          <div className="ore-info">
            <span className="ore-name">Iron</span>
            <span className="ore-amount">{inventory.iron}</span>
          </div>
        </div>
        
        <div className="ore-count diamond">
          <div className="ore-icon">💎</div>
          <div className="ore-info">
            <span className="ore-name">Diamond</span>
            <span className="ore-amount">{inventory.diamond}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

