import Phaser from 'phaser';
import { MATERIALS } from '../config/materials';
import type { MaterialType } from '../config/materials';
import { PICKAXES } from '../config/pickaxes';

/**
 * PreloadScene handles loading all game assets
 * Loads individual tile sprites for each material (tiles 05-09)
 */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    // Create loading bar
    this.createLoadingBar();

    // Load all material sprites (ores and gems)
    this.loadMaterialSprites();
    
    // Load pickaxe sprites
    this.loadPickaxeSprites();
    
    // Load particle texture
    this.loadParticles();
    
    // Load level backgrounds
    this.loadLevelBackgrounds();
  }

  /**
   * Load all material sprites (ores and gems)
   * Loads tiles 05-08 (rocks with ore/gem) and tile 09 (pure material)
   * Stone uses tiles 10-18
   */
  private loadMaterialSprites() {
    const materials = Object.keys(MATERIALS) as MaterialType[];
    
    console.log(`📦 Loading ${materials.length} material types...`);
    
    materials.forEach(material => {
      const config = MATERIALS[material];
      const basePath = `/assets/sprites/${config.spriteFolder}`;
      
      // Stone uses specific tiles: 10, 11, 12, 13, 15, 16, 17, 18 (excluding 14)
      if (material === 'stone') {
        const stoneTiles = [10, 11, 12, 13, 15, 16, 17, 18];
        stoneTiles.forEach(i => {
          const tileNum = i.toString();
          const key = `stone-rock-${i}`;
          const path = `${basePath}/tile${tileNum}.png`;
          
          this.load.image(key, path);
        });
      } else {
        // Other materials use tiles 05-08
        for (let i = 5; i <= 8; i++) {
          // Gold uses 3-digit tile names (tile005, tile006, etc.)
          const tileNum = material === 'gold' 
            ? i.toString().padStart(3, '0') 
            : i.toString().padStart(2, '0');
          const key = `${material}-rock-${i}`;
          const path = `${basePath}/tile${tileNum}.png`;
          
          this.load.image(key, path);
        }
      }
      
      // Load tile 09 (pure material object - what gets collected)
      const objectKey = `${material}-object`;
      const objectPath = `${basePath}/tile09.png`;
      
      // Special case for gold which uses tile009 instead of tile09
      const goldPath = material === 'gold' ? `${basePath}/tile009.png` : objectPath;
      
      this.load.image(objectKey, material === 'gold' ? goldPath : objectPath);
    });
  }

  /**
   * Load pickaxe sprites
   */
  private loadPickaxeSprites() {
    const pickaxes = Object.values(PICKAXES);
    
    console.log(`⛏️  Loading ${pickaxes.length} pickaxe sprites...`);
    
    pickaxes.forEach(pickaxe => {
      this.load.image(`pickaxe-${pickaxe.id}`, pickaxe.spritePath);
    });
  }

  /**
   * Load particle texture for effects
   */
  private loadParticles() {
    // Create a simple white square for particles
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 0, 4, 4);
    graphics.generateTexture('particle', 4, 4);
    graphics.destroy();
  }

  /**
   * Load level background images
   */
  private loadLevelBackgrounds() {
    console.log(`🏔️  Loading level backgrounds...`);
    
    // Load backgrounds for levels 1-5
    for (let i = 1; i <= 5; i++) {
      const key = `bg-level-${i}`;
      const path = `/assets/backgrounds/lvl${i}.png`;
      this.load.image(key, path);
    }
  }

  create() {
    console.log('✅ All assets loaded');
    
    // Create fallback textures for any missing assets
    this.createFallbackTextures();
    
    // Create placeholder pickaxe sprite
    this.createPickaxePlaceholder();
    
    // All assets loaded, start the main game scene
    this.scene.start('MiningScene');
  }

  /**
   * Create fallback placeholder textures for missing material sprites
   */
  private createFallbackTextures() {
    const graphics = this.add.graphics();
    const materials = Object.keys(MATERIALS) as MaterialType[];
    
    materials.forEach(material => {
      const config = MATERIALS[material];
      const color = parseInt(config.color.replace('#', ''), 16);
      
      // Stone uses tiles 10-18
      if (material === 'stone') {
        for (let i = 10; i <= 18; i++) {
          const key = `stone-rock-${i}`;
          
          if (!this.textures.exists(key)) {
            graphics.clear();
            
            // Rock background
            graphics.fillStyle(0x555555, 1);
            graphics.fillRect(0, 0, 16, 16);
            
            // Material vein
            graphics.fillStyle(color, 1);
            graphics.fillCircle(8, 8, 4);
            
            graphics.generateTexture(key, 16, 16);
            console.log(`🎨 Created fallback for ${key}`);
          }
        }
      } else {
        // Other materials use tiles 05-08
        for (let i = 5; i <= 8; i++) {
          const key = `${material}-rock-${i}`;
          
          if (!this.textures.exists(key)) {
            graphics.clear();
            
            // Rock background
            graphics.fillStyle(0x555555, 1);
            graphics.fillRect(0, 0, 16, 16);
            
            // Material vein
            graphics.fillStyle(color, 1);
            graphics.fillCircle(8, 8, 4);
            
            graphics.generateTexture(key, 16, 16);
            console.log(`🎨 Created fallback for ${key}`);
          }
        }
      }
      
      // Create fallback for object tile (09)
      const objectKey = `${material}-object`;
      
      if (!this.textures.exists(objectKey)) {
        graphics.clear();
        
        // Pure material
        graphics.fillStyle(color, 1);
        if (config.type === 'gem') {
          // Gem shape
          graphics.fillCircle(8, 8, 6);
          graphics.fillStyle(0xffffff, 0.5);
          graphics.fillCircle(8, 6, 3);
        } else {
          // Ore shape
          graphics.fillRect(4, 4, 8, 8);
          graphics.fillStyle(0xffffff, 0.3);
          graphics.fillRect(5, 5, 3, 3);
        }
        
        graphics.generateTexture(objectKey, 16, 16);
        console.log(`🎨 Created fallback for ${objectKey}`);
      }
    });
    
    graphics.destroy();
  }

  /**
   * Create placeholder pickaxe sprite for animation
   */
  private createPickaxePlaceholder() {
    if (!this.textures.exists('pickaxe-sprite')) {
      const graphics = this.add.graphics();
      
      // Simple pickaxe shape
      // Handle
      graphics.fillStyle(0x8B4513, 1);
      graphics.fillRect(7, 4, 2, 10);
      
      // Head
      graphics.fillStyle(0xC0C0C0, 1);
      graphics.fillTriangle(6, 4, 10, 4, 8, 0);
      graphics.fillTriangle(6, 4, 10, 4, 8, 8);
      
      graphics.generateTexture('pickaxe-sprite', 16, 16);
      graphics.destroy();
    }
  }

  /**
   * Creates a visual loading bar
   */
  private createLoadingBar() {
    const width = 400;
    const height = 30;
    const x = this.cameras.main.centerX - width / 2;
    const y = this.cameras.main.centerY;

    // Background
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(x, y, width, height);

    // Progress bar
    const progressBar = this.add.graphics();

    // Loading text
    const loadingText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY - 50,
      'Loading Rockchain...',
      {
        fontSize: '20px',
        color: '#ffffff',
        fontFamily: 'Pixelify Sans, Arial'
      }
    );
    loadingText.setOrigin(0.5, 0.5);

    // Percentage text
    const percentText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      '0%',
      {
        fontSize: '18px',
        color: '#ffffff',
        fontFamily: 'Pixelify Sans, Arial'
      }
    );
    percentText.setOrigin(0.5, 0.5);

    // Update progress bar as assets load
    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0x00ff00, 1);
      progressBar.fillRect(x, y, width * value, height);
      
      percentText.setText(`${Math.floor(value * 100)}%`);
    });

    // Clean up when loading is complete
    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });
  }
}
