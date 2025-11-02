import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { MATERIALS } from '../../game/config/materials';
import type { MaterialType } from '../../game/config/materials';
import './InventoryPanel.css';

/**
 * InventoryPanel - Minecraft-style minimal inventory
 * Shows item icons with quantity, detailed info on hover
 */
export const InventoryPanel: React.FC = () => {
  const inventory = useGameStore(state => state.inventory);
  const [hoveredItem, setHoveredItem] = useState<MaterialType | null>(null);
  
  // Get only non-zero inventory items, sorted by tier and value
  const inventoryItems = Object.entries(inventory)
    .filter(([_, count]) => count && count > 0)
    .map(([material, count]) => ({
      material: material as MaterialType,
      count: count!,
      config: MATERIALS[material as MaterialType]
    }))
    .sort((a, b) => {
      // Sort by tier first, then by value
      if (a.config.tier !== b.config.tier) {
        return a.config.tier - b.config.tier;
      }
      return a.config.goldValue - b.config.goldValue;
    });
  
  if (inventoryItems.length === 0) {
    return (
      <div className="inventory-panel-minimal">
        <div className="inventory-empty-minimal">
          <p>Empty</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="inventory-panel-minimal">
      <div className="inventory-grid-minimal">
        {inventoryItems.map(({ material, count, config }) => (
          <div 
            key={material} 
            className="inventory-slot"
            onMouseEnter={() => setHoveredItem(material)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            {/* Item Icon */}
            <div className="slot-icon-container">
              <img
                src={`/assets/sprites/${config.spriteFolder}/tile09.png`}
                alt={config.name}
                className="slot-icon"
                style={{
                  filter: `drop-shadow(0 0 3px ${config.color}40)`
                }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div 
                className="slot-icon-fallback"
                style={{ backgroundColor: config.color }}
              />
            </div>
            
            {/* Quantity Badge */}
            <div className="slot-quantity">{count}</div>
            
            {/* Hover Tooltip */}
            {hoveredItem === material && (
              <div className="slot-tooltip">
                <div className="tooltip-header">
                  <span className="tooltip-name">{config.name}</span>
                  <span className="tooltip-tier" style={{ color: config.color }}>
                    Tier {config.tier}
                  </span>
                </div>
                <div className="tooltip-stats">
                  <div className="tooltip-stat">
                    <span className="tooltip-label">Amount:</span>
                    <span className="tooltip-value">×{count}</span>
                  </div>
                  <div className="tooltip-stat">
                    <span className="tooltip-label">Value:</span>
                    <span className="tooltip-value">{config.goldValue}g each</span>
                  </div>
                  <div className="tooltip-total">
                    Total: <strong>{count * config.goldValue}g</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
