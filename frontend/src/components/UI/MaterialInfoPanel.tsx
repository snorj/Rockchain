import React, { useState } from 'react';
import { MATERIALS } from '../../game/config/materials';
import './MaterialInfoPanel.css';

/**
 * MaterialInfoPanel - Shows all materials, their values, and stats
 * Serves as a reference guide for players
 */
export const MaterialInfoPanel: React.FC = () => {
  const [selectedTier, setSelectedTier] = useState<number | 'all'>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'ore' | 'gem'>('all');
  
  // Get all materials and group by tier
  const allMaterials = Object.values(MATERIALS);
  
  // Filter materials
  const filteredMaterials = allMaterials.filter(material => {
    const tierMatch = selectedTier === 'all' || material.tier === selectedTier;
    const typeMatch = selectedType === 'all' || material.type === selectedType;
    return tierMatch && typeMatch;
  });
  
  // Sort by tier and value
  const sortedMaterials = filteredMaterials.sort((a, b) => {
    if (a.tier !== b.tier) return a.tier - b.tier;
    return a.goldValue - b.goldValue;
  });
  
  return (
    <div className="material-info-panel">
      <div className="info-header">
        <h3>Material Guide</h3>
        <p className="info-subtitle">Value reference for all materials</p>
      </div>
      
      <div className="info-filters">
        <div className="filter-group">
          <label>Tier:</label>
          <div className="filter-buttons">
            <button
              className={selectedTier === 'all' ? 'active' : ''}
              onClick={() => setSelectedTier('all')}
            >
              All
            </button>
            {[1, 2, 3, 4, 5].map(tier => (
              <button
                key={tier}
                className={selectedTier === tier ? 'active' : ''}
                onClick={() => setSelectedTier(tier)}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>
        
        <div className="filter-group">
          <label>Type:</label>
          <div className="filter-buttons">
            <button
              className={selectedType === 'all' ? 'active' : ''}
              onClick={() => setSelectedType('all')}
            >
              All
            </button>
            <button
              className={selectedType === 'ore' ? 'active' : ''}
              onClick={() => setSelectedType('ore')}
            >
              Ores
            </button>
            <button
              className={selectedType === 'gem' ? 'active' : ''}
              onClick={() => setSelectedType('gem')}
            >
              Gems
            </button>
          </div>
        </div>
      </div>
      
      <div className="materials-list">
        {sortedMaterials.map(material => (
          <div 
            key={material.id} 
            className={`material-card tier-${material.tier}`}
            style={{ borderLeftColor: material.color }}
          >
            <div className="material-icon-container">
              <img
                src={`/assets/sprites/${material.spriteFolder}/tile09.png`}
                alt={material.name}
                className="material-icon"
                style={{
                  filter: `drop-shadow(0 0 3px ${material.color})`
                }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div 
                className="material-icon-fallback"
                style={{ backgroundColor: material.color }}
              />
            </div>
            
            <div className="material-details">
              <div className="material-header">
                <span className="material-name">{material.name}</span>
                <span className={`material-type ${material.type}`}>
                  {material.type === 'ore' ? 'Ore' : 'Gem'}
                </span>
              </div>
              
              <div className="material-stats">
                <div className="stat">
                  <span className="stat-label">Tier:</span>
                  <span className="stat-value tier-badge">{material.tier}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">HP:</span>
                  <span className="stat-value">{material.hp}</span>
                </div>
                <div className="stat highlight">
                  <span className="stat-label">Value:</span>
                  <span className="stat-value gold">{material.goldValue}g</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="info-footer">
        <p>Showing {sortedMaterials.length} of {allMaterials.length} materials</p>
      </div>
    </div>
  );
};

