import React from 'react';
import './InventoryControls.css';

interface InventoryControlsProps {
  onMaterialsClick?: () => void;
  onShopClick?: () => void;
}

/**
 * InventoryControls - Buttons displayed above the inventory panel
 */
export const InventoryControls: React.FC<InventoryControlsProps> = ({
  onMaterialsClick,
  onShopClick
}) => {
  const handleMaterialsClick = () => {
    if (onMaterialsClick) {
      onMaterialsClick();
    } else {
      // Dispatch custom event for GameUI to handle
      window.dispatchEvent(new CustomEvent('open-materials'));
    }
  };

  const handleShopClick = () => {
    if (onShopClick) {
      onShopClick();
    } else {
      // Dispatch custom event for GameUI to handle
      window.dispatchEvent(new CustomEvent('open-shop'));
    }
  };

  return (
    <div className="inventory-controls">
      <button 
        className="inventory-control-button materials-button"
        onClick={handleMaterialsClick}
        title="Material Database (I)"
      >
        Materials
      </button>
      <button 
        className="inventory-control-button shop-button"
        onClick={handleShopClick}
        title="Shop (S)"
      >
        Shop
      </button>
    </div>
  );
};

