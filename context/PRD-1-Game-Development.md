# Rockchain - Game Development PRD

**Version:** 1.0  
**Sprint:** Day 1 - Core Game Loop  
**Author:** Peter Lonergan  
**Date:** November 1, 2025

---

## 🎯 Purpose

Build a fully functional browser-based mining game with complete game loop, UI, and visual assets. This component operates **independently** of blockchain functionality and can be developed/tested in isolation. The game exposes clear interfaces for later blockchain integration.

---

## 📋 Scope & Objectives

### In Scope
- ✅ Complete mining game loop (spawn → mine → collect)
- ✅ Phaser.js game engine integration with React
- ✅ Sprite animations (6-8 frame ore mining sequences)
- ✅ Local inventory management
- ✅ UI components (HUD, buttons, counters)
- ✅ Visual assets integration (Hana Caraka sprites)
- ✅ Game state management (Zustand/Context)
- ✅ Mock "Sell" functionality (logs data, no blockchain calls)

### Out of Scope (Handled by Blockchain PRD)
- ❌ Wallet integration (Privy)
- ❌ Smart contract interactions
- ❌ On-chain transactions
- ❌ Real leaderboard (blockchain-based)
- ❌ Gas sponsorship
- ❌ Network calls to Ethereum

---

## 🏗️ Technical Architecture

### Tech Stack

```json
{
  "framework": "React 18+",
  "bundler": "Vite",
  "gameEngine": "Phaser.js 3.60+",
  "stateManagement": "Zustand",
  "styling": "CSS Modules + Tailwind CSS",
  "typescript": "Yes (preferred)",
  "nodeVersion": "18.x or 20.x"
}
```

### Project Structure

```
frontend/
├── public/
│   └── assets/
│       ├── sprites/
│       │   ├── ores/
│       │   │   ├── coal.png       # 6-8 frames horizontal
│       │   │   ├── iron.png       # 6-8 frames horizontal
│       │   │   └── diamond.png    # 6-8 frames horizontal
│       │   └── props/
│       │       ├── torch-1.png
│       │       └── torch-2.png
│       └── tilesets/
│           ├── wall-cave.png
│           └── ground-normal.png
├── src/
│   ├── components/
│   │   ├── Game/
│   │   │   ├── GameCanvas.tsx          # Phaser mount point
│   │   │   └── GameCanvas.module.css
│   │   ├── UI/
│   │   │   ├── InventoryHUD.tsx        # Shows ore counts
│   │   │   ├── SellButton.tsx          # Triggers sell event
│   │   │   ├── Leaderboard.tsx         # Mock leaderboard
│   │   │   └── LoadingState.tsx        # Mining progress
│   │   └── Layout/
│   │       └── GameLayout.tsx          # Main layout wrapper
│   ├── game/
│   │   ├── scenes/
│   │   │   ├── MiningScene.ts          # Main game scene
│   │   │   └── PreloadScene.ts         # Asset loading
│   │   ├── entities/
│   │   │   ├── OreNode.ts              # Ore sprite + behavior
│   │   │   └── Background.ts           # Tileset rendering
│   │   ├── managers/
│   │   │   ├── OreSpawner.ts           # Spawn logic + rarity
│   │   │   └── AnimationManager.ts     # Frame animations
│   │   └── config/
│   │       └── gameConfig.ts           # Phaser config
│   ├── store/
│   │   └── gameStore.ts                # Zustand store
│   ├── types/
│   │   ├── game.types.ts               # Game interfaces
│   │   └── blockchain.types.ts         # Interface for blockchain layer
│   ├── utils/
│   │   └── constants.ts                # Game constants
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## 🎮 Core Features

### Feature 1: Phaser.js Integration

**Description:** Set up Phaser.js game engine inside React component, ensuring proper lifecycle management.

**Technical Requirements:**
- Phaser canvas mounts in React component via `useEffect`
- Canvas size: `800x600` pixels (configurable)
- Pixel art rendering: disable antialiasing (`pixelArt: true`)
- Cleanup on unmount to prevent memory leaks
- Parent-child communication via event emitters

**Implementation Details:**

```typescript
// src/components/Game/GameCanvas.tsx
import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { MiningScene } from '@/game/scenes/MiningScene';
import { PreloadScene } from '@/game/scenes/PreloadScene';

export const GameCanvas = () => {
  const gameRef = useRef<Phaser.Game | null>(null);
  
  useEffect(() => {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: 'game-container',
      width: 800,
      height: 600,
      pixelArt: true,
      physics: {
        default: 'arcade',
        arcade: { debug: false }
      },
      scene: [PreloadScene, MiningScene]
    };
    
    gameRef.current = new Phaser.Game(config);
    
    return () => {
      gameRef.current?.destroy(true);
    };
  }, []);
  
  return <div id="game-container" />;
};
```

**Acceptance Criteria:**
- [ ] Phaser canvas renders at correct dimensions
- [ ] No console errors on mount/unmount
- [ ] Canvas properly destroyed when component unmounts
- [ ] Pixel art rendering enabled (no blur on sprites)

---

### Feature 2: Asset Loading & Management

**Description:** Load all visual assets from Hana Caraka pack into Phaser, create sprite sheets for animations.

**Asset Specifications:**

| Asset | Source File | Type | Frames | Frame Size | Usage |
|-------|------------|------|--------|-----------|-------|
| Coal Ore | `coal.png` | Sprite Sheet | 8 | 32x32px | Mining animation |
| Iron Ore | `iron.png` | Sprite Sheet | 8 | 32x32px | Mining animation |
| Diamond Ore | `diamond.png` | Sprite Sheet | 8 | 32x32px | Mining animation |
| Cave Wall | `wall-cave.png` | Tileset | N/A | 16x16px tiles | Background |
| Ground | `ground-normal.png` | Tileset | N/A | 16x16px tiles | Floor |
| Torch | `torch-1.png`, `torch-2.png` | Sprite Sheet | 2 | 16x32px | Ambient animation |

**Sprite Sheet Configuration:**

```typescript
// src/game/scenes/PreloadScene.ts
export class PreloadScene extends Phaser.Scene {
  preload() {
    // Load ore sprite sheets
    this.load.spritesheet('ore-coal', 'assets/sprites/ores/coal.png', {
      frameWidth: 32,
      frameHeight: 32,
      endFrame: 7 // 0-7 = 8 frames
    });
    
    this.load.spritesheet('ore-iron', 'assets/sprites/ores/iron.png', {
      frameWidth: 32,
      frameHeight: 32,
      endFrame: 7
    });
    
    this.load.spritesheet('ore-diamond', 'assets/sprites/ores/diamond.png', {
      frameWidth: 32,
      frameHeight: 32,
      endFrame: 7
    });
    
    // Load background tiles
    this.load.image('wall-cave', 'assets/tilesets/wall-cave.png');
    this.load.image('ground', 'assets/tilesets/ground-normal.png');
    
    // Load torch animation
    this.load.spritesheet('torch', 'assets/sprites/props/torch.png', {
      frameWidth: 16,
      frameHeight: 32,
      endFrame: 1
    });
  }
  
  create() {
    // Create mining animations
    this.createMiningAnimation('coal', 8, 2000); // 2 second duration
    this.createMiningAnimation('iron', 8, 4000); // 4 seconds
    this.createMiningAnimation('diamond', 8, 6000); // 6 seconds
    
    this.scene.start('MiningScene');
  }
  
  createMiningAnimation(oreType: string, frameCount: number, duration: number) {
    this.anims.create({
      key: `mine-${oreType}`,
      frames: this.anims.generateFrameNumbers(`ore-${oreType}`, {
        start: 0,
        end: frameCount - 1
      }),
      duration,
      repeat: 0
    });
  }
}
```

**Acceptance Criteria:**
- [ ] All sprites load without errors
- [ ] Sprite sheets correctly split into frames
- [ ] Animations created for all 3 ore types
- [ ] Background tiles render properly
- [ ] No missing asset warnings in console

---

### Feature 3: Ore Spawning System

**Description:** Spawn 3-5 ore nodes randomly on screen with weighted rarity distribution.

**Spawn Configuration:**

```typescript
// src/utils/constants.ts
export const ORE_CONFIG = {
  SPAWN_COUNT: { min: 3, max: 5 },
  SPAWN_AREA: { x: 50, y: 50, width: 700, height: 500 },
  RARITY_WEIGHTS: {
    coal: 0.70,    // 70%
    iron: 0.25,    // 25%
    diamond: 0.05  // 5%
  },
  MINING_TIMES: {
    coal: 2000,    // 2 seconds
    iron: 4000,    // 4 seconds
    diamond: 6000  // 6 seconds
  },
  GLD_VALUES: {
    coal: 1,
    iron: 3,
    diamond: 10
  }
} as const;

export type OreType = keyof typeof ORE_CONFIG.RARITY_WEIGHTS;
```

**Implementation:**

```typescript
// src/game/managers/OreSpawner.ts
export class OreSpawner {
  private scene: Phaser.Scene;
  private activeOres: OreNode[] = [];
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }
  
  spawnInitialOres() {
    const count = Phaser.Math.Between(
      ORE_CONFIG.SPAWN_COUNT.min,
      ORE_CONFIG.SPAWN_COUNT.max
    );
    
    for (let i = 0; i < count; i++) {
      this.spawnRandomOre();
    }
  }
  
  spawnRandomOre() {
    const oreType = this.selectRandomOreType();
    const position = this.getRandomPosition();
    
    const ore = new OreNode(
      this.scene,
      position.x,
      position.y,
      oreType
    );
    
    this.activeOres.push(ore);
    return ore;
  }
  
  selectRandomOreType(): OreType {
    const rand = Math.random();
    
    if (rand < ORE_CONFIG.RARITY_WEIGHTS.diamond) {
      return 'diamond';
    } else if (rand < ORE_CONFIG.RARITY_WEIGHTS.diamond + ORE_CONFIG.RARITY_WEIGHTS.iron) {
      return 'iron';
    } else {
      return 'coal';
    }
  }
  
  getRandomPosition(): { x: number; y: number } {
    const { x, y, width, height } = ORE_CONFIG.SPAWN_AREA;
    
    return {
      x: Phaser.Math.Between(x, x + width),
      y: Phaser.Math.Between(y, y + height)
    };
  }
  
  removeOre(ore: OreNode) {
    this.activeOres = this.activeOres.filter(o => o !== ore);
    ore.destroy();
  }
}
```

**Acceptance Criteria:**
- [ ] 3-5 ores spawn on scene start
- [ ] Rarity distribution matches spec (70/25/5)
- [ ] Ores don't overlap (collision detection optional for MVP)
- [ ] Ores spawn within defined area
- [ ] When ore is mined, new one spawns immediately

---

### Feature 4: Mining Mechanic

**Description:** Click ore → play animation → update inventory.

**OreNode Entity:**

```typescript
// src/game/entities/OreNode.ts
export class OreNode extends Phaser.GameObjects.Sprite {
  private oreType: OreType;
  private isMining: boolean = false;
  private progressBar?: Phaser.GameObjects.Graphics;
  
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    oreType: OreType
  ) {
    super(scene, x, y, `ore-${oreType}`);
    
    this.oreType = oreType;
    this.setInteractive({ useHandCursor: true });
    this.on('pointerdown', this.startMining, this);
    
    scene.add.existing(this);
  }
  
  startMining() {
    if (this.isMining) return;
    
    this.isMining = true;
    this.createProgressBar();
    
    // Play mining animation
    this.play(`mine-${this.oreType}`);
    
    // Animation completes after defined duration
    this.on('animationcomplete', this.onMiningComplete, this);
  }
  
  createProgressBar() {
    this.progressBar = this.scene.add.graphics();
    this.progressBar.setPosition(this.x - 20, this.y - 30);
    
    const duration = ORE_CONFIG.MINING_TIMES[this.oreType];
    let progress = 0;
    
    const progressTween = this.scene.tweens.add({
      targets: { value: 0 },
      value: 1,
      duration,
      onUpdate: (tween) => {
        progress = tween.getValue();
        this.updateProgressBar(progress);
      }
    });
  }
  
  updateProgressBar(progress: number) {
    if (!this.progressBar) return;
    
    this.progressBar.clear();
    
    // Background
    this.progressBar.fillStyle(0x000000);
    this.progressBar.fillRect(0, 0, 40, 6);
    
    // Progress fill
    this.progressBar.fillStyle(0x00ff00);
    this.progressBar.fillRect(1, 1, 38 * progress, 4);
  }
  
  onMiningComplete() {
    // Emit event to game store
    this.scene.events.emit('ore-mined', {
      oreType: this.oreType,
      value: ORE_CONFIG.GLD_VALUES[this.oreType]
    });
    
    // Clean up
    this.progressBar?.destroy();
    this.destroy();
  }
}
```

**Acceptance Criteria:**
- [ ] Clicking ore starts mining animation
- [ ] Progress bar displays above ore
- [ ] Progress bar updates smoothly
- [ ] Can't click same ore twice
- [ ] Animation plays for correct duration
- [ ] Event emitted on completion
- [ ] Ore sprite and progress bar destroyed after mining

---

### Feature 5: Game State Management

**Description:** Zustand store to track inventory, game state, and expose interface for blockchain layer.

**State Interface:**

```typescript
// src/types/game.types.ts
export interface GameState {
  // Inventory
  inventory: {
    coal: number;
    iron: number;
    diamond: number;
  };
  
  // Game status
  isPlaying: boolean;
  isPaused: boolean;
  
  // Actions (for game logic)
  addOre: (oreType: OreType) => void;
  resetInventory: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  
  // Interface for blockchain layer (called by blockchain PRD)
  onSellRequested: () => SellData;
  onSellComplete: (success: boolean, txHash?: string) => void;
}

export interface SellData {
  coal: number;
  iron: number;
  diamond: number;
  totalValue: number;
}

// src/types/blockchain.types.ts
// Interface that blockchain layer must implement
export interface BlockchainAdapter {
  sellResources: (coal: number, iron: number, diamond: number) => Promise<string>;
  getPlayerBalance: () => Promise<number>;
  isWalletConnected: () => boolean;
}
```

**Store Implementation:**

```typescript
// src/store/gameStore.ts
import { create } from 'zustand';
import { GameState, SellData } from '@/types/game.types';
import { ORE_CONFIG } from '@/utils/constants';

export const useGameStore = create<GameState>((set, get) => ({
  inventory: {
    coal: 0,
    iron: 0,
    diamond: 0
  },
  
  isPlaying: true,
  isPaused: false,
  
  addOre: (oreType) => {
    set((state) => ({
      inventory: {
        ...state.inventory,
        [oreType]: state.inventory[oreType] + 1
      }
    }));
  },
  
  resetInventory: () => {
    set({ inventory: { coal: 0, iron: 0, diamond: 0 } });
  },
  
  pauseGame: () => {
    set({ isPaused: true });
  },
  
  resumeGame: () => {
    set({ isPaused: false });
  },
  
  // Called by SellButton component
  onSellRequested: (): SellData => {
    const { inventory } = get();
    const totalValue = 
      inventory.coal * ORE_CONFIG.GLD_VALUES.coal +
      inventory.iron * ORE_CONFIG.GLD_VALUES.iron +
      inventory.diamond * ORE_CONFIG.GLD_VALUES.diamond;
    
    return {
      ...inventory,
      totalValue
    };
  },
  
  // Called by blockchain layer after transaction
  onSellComplete: (success, txHash) => {
    if (success) {
      get().resetInventory();
      console.log('✅ Sell successful! TX:', txHash);
    } else {
      console.error('❌ Sell failed');
    }
  }
}));
```

**Acceptance Criteria:**
- [ ] Store initializes with empty inventory
- [ ] `addOre()` increments correct ore count
- [ ] `onSellRequested()` calculates total value correctly
- [ ] `onSellComplete()` resets inventory on success
- [ ] State updates trigger React re-renders
- [ ] No memory leaks from subscriptions

---

### Feature 6: UI Components

#### Inventory HUD

```typescript
// src/components/UI/InventoryHUD.tsx
import { useGameStore } from '@/store/gameStore';

export const InventoryHUD = () => {
  const inventory = useGameStore((state) => state.inventory);
  
  return (
    <div className="inventory-hud">
      <div className="ore-count">
        <span className="ore-icon coal">⚫</span>
        <span>{inventory.coal}</span>
      </div>
      <div className="ore-count">
        <span className="ore-icon iron">🟤</span>
        <span>{inventory.iron}</span>
      </div>
      <div className="ore-count">
        <span className="ore-icon diamond">💎</span>
        <span>{inventory.diamond}</span>
      </div>
    </div>
  );
};
```

#### Sell Button

```typescript
// src/components/UI/SellButton.tsx
import { useGameStore } from '@/store/gameStore';

export const SellButton = () => {
  const { inventory, onSellRequested, onSellComplete } = useGameStore();
  
  const hasOres = inventory.coal > 0 || inventory.iron > 0 || inventory.diamond > 0;
  
  const handleSell = async () => {
    const sellData = onSellRequested();
    
    console.log('🔄 Sell requested:', sellData);
    
    // FOR MVP: Mock sell (blockchain layer will replace this)
    await new Promise(resolve => setTimeout(resolve, 1000));
    onSellComplete(true, 'mock-tx-hash');
  };
  
  return (
    <button
      className="sell-button"
      disabled={!hasOres}
      onClick={handleSell}
    >
      Sell Resources ({onSellRequested().totalValue} GLD)
    </button>
  );
};
```

**Acceptance Criteria:**
- [ ] Inventory displays current ore counts
- [ ] Counts update immediately when ore mined
- [ ] Sell button disabled when inventory empty
- [ ] Sell button shows calculated GLD value
- [ ] Clicking sell triggers mock transaction
- [ ] Inventory resets after successful sell

---

### Feature 7: Main Game Scene

```typescript
// src/game/scenes/MiningScene.ts
export class MiningScene extends Phaser.Scene {
  private oreSpawner!: OreSpawner;
  
  constructor() {
    super({ key: 'MiningScene' });
  }
  
  create() {
    // Add background
    this.add.image(400, 300, 'wall-cave');
    this.add.image(400, 300, 'ground').setAlpha(0.7);
    
    // Add decorative torches
    const torch1 = this.add.sprite(50, 100, 'torch');
    torch1.play('torch-flicker');
    
    const torch2 = this.add.sprite(750, 100, 'torch');
    torch2.play('torch-flicker');
    
    // Initialize ore spawner
    this.oreSpawner = new OreSpawner(this);
    this.oreSpawner.spawnInitialOres();
    
    // Listen for ore mined events
    this.events.on('ore-mined', this.handleOreMined, this);
  }
  
  handleOreMined(data: { oreType: OreType; value: number }) {
    // Update game store
    useGameStore.getState().addOre(data.oreType);
    
    // Spawn replacement ore
    this.oreSpawner.spawnRandomOre();
  }
}
```

**Acceptance Criteria:**
- [ ] Background renders correctly
- [ ] Torches animate continuously
- [ ] Initial ores spawn on scene start
- [ ] Mined ores trigger inventory update
- [ ] New ore spawns when one is mined
- [ ] Scene runs at stable 60 FPS

---

## 🔌 Integration Interface

**For Blockchain Team:**

The game layer exposes these integration points:

### 1. Game Store Interface

```typescript
// Import game store
import { useGameStore } from '@/store/gameStore';

// Get sell data
const sellData = useGameStore.getState().onSellRequested();
// Returns: { coal: 5, iron: 2, diamond: 1, totalValue: 21 }

// After blockchain transaction completes
useGameStore.getState().onSellComplete(true, '0xabc123...');
```

### 2. Replace Mock Sell Function

```typescript
// Current mock in SellButton.tsx (lines 10-15)
const handleSell = async () => {
  const sellData = onSellRequested();
  
  // REPLACE THIS BLOCK with blockchain call:
  await new Promise(resolve => setTimeout(resolve, 1000));
  onSellComplete(true, 'mock-tx-hash');
};

// Replace with:
const handleSell = async () => {
  const sellData = onSellRequested();
  
  try {
    const txHash = await blockchainAdapter.sellResources(
      sellData.coal,
      sellData.iron,
      sellData.diamond
    );
    onSellComplete(true, txHash);
  } catch (error) {
    onSellComplete(false);
  }
};
```

### 3. Leaderboard Data Interface

```typescript
// Mock leaderboard component expects this interface
export interface LeaderboardEntry {
  address: string;
  balance: number;
  rank: number;
}

export interface LeaderboardData {
  entries: LeaderboardEntry[];
  currentPlayer?: LeaderboardEntry;
}
```

---

## ✅ Acceptance Criteria (Full Feature)

### Game Playability
- [ ] Ores spawn on game start (3-5 visible)
- [ ] Click ore → animation plays → inventory increases
- [ ] Progress bar shows mining progress accurately
- [ ] New ore spawns when previous one mined
- [ ] Rarity distribution matches 70/25/5
- [ ] Inventory counter updates in real-time

### Visual Quality
- [ ] All sprites render without blur (pixel art mode)
- [ ] Cave background tiles properly
- [ ] Torches animate smoothly (2 frames)
- [ ] Progress bar renders above ore
- [ ] UI elements styled with basic CSS

### Performance
- [ ] Game runs at 60 FPS
- [ ] No memory leaks on component unmount
- [ ] No console errors
- [ ] Smooth animations with no stuttering

### Code Quality
- [ ] TypeScript with no `any` types
- [ ] All components have proper types
- [ ] Game logic separated from UI components
- [ ] Clear integration interfaces documented

### Testing (Manual)
- [ ] Can mine 20+ ores without errors
- [ ] Can sell multiple times
- [ ] Inventory resets after sell
- [ ] Game still playable after 5+ minutes
- [ ] Browser refresh resets game state correctly

---

## 🚀 Development Milestones

### Milestone 1: Project Setup (1 hour)
- [ ] Create Vite + React + TypeScript project
- [ ] Install dependencies (Phaser, Zustand, Tailwind)
- [ ] Set up folder structure
- [ ] Extract assets from Hana Caraka pack
- [ ] Configure Vite for asset loading

### Milestone 2: Phaser Integration (2 hours)
- [ ] Create PreloadScene (asset loading)
- [ ] Create MiningScene (main game)
- [ ] Set up GameCanvas component
- [ ] Verify assets load correctly
- [ ] Test canvas mount/unmount

### Milestone 3: Core Game Loop (3 hours)
- [ ] Implement OreSpawner
- [ ] Implement OreNode with animations
- [ ] Add click interaction
- [ ] Add progress bars
- [ ] Connect to game store

### Milestone 4: UI Components (1.5 hours)
- [ ] Build InventoryHUD
- [ ] Build SellButton (mock)
- [ ] Style with Tailwind
- [ ] Test state updates

### Milestone 5: Polish & Testing (1.5 hours)
- [ ] Add background + torches
- [ ] Fine-tune spawn positions
- [ ] Test edge cases
- [ ] Document integration points

**Total: ~9 hours**

---

## 📦 Deliverables

1. **Working React App**
   - Runs on `localhost:5173`
   - No build errors
   - Clean console (no warnings)

2. **Game Features**
   - Playable mining loop
   - Animated sprites
   - Functional inventory
   - Mock sell button

3. **Code Documentation**
   - TypeScript interfaces for all entities
   - JSDoc comments on public methods
   - Integration guide for blockchain team

4. **Asset Files**
   - All sprites extracted to `public/assets/`
   - Proper folder organization
   - ATTRIBUTION.md updated

---

## 🧪 Testing Checklist

Run through these scenarios before handoff:

- [ ] **Fresh Start:** Open app → see 3-5 ores → click one → mines successfully
- [ ] **Full Cycle:** Mine 5 ores → inventory shows correct counts → click sell → inventory resets
- [ ] **Rapid Mining:** Click multiple ores quickly → all mine in parallel → inventory accurate
- [ ] **Empty Sell:** Try clicking sell with 0 ores → button disabled
- [ ] **Long Session:** Play for 5 minutes straight → no lag or errors
- [ ] **Refresh:** Reload page → game resets properly

---

## 🔗 Dependencies for Blockchain Integration

The blockchain team needs:

1. **Game Store Access**
   ```typescript
   import { useGameStore } from '@/store/gameStore';
   ```

2. **Replace Mock Sell**
   - File: `src/components/UI/SellButton.tsx`
   - Function: `handleSell` (line ~10)

3. **Add Wallet UI**
   - Privy login button (top-right corner)
   - Wallet address display

4. **Leaderboard Data**
   - Mock component ready at `src/components/UI/Leaderboard.tsx`
   - Replace mock data with blockchain queries

---

## 📚 Reference Links

- [Phaser 3 Documentation](https://photonstorm.github.io/phaser3-docs/)
- [Zustand Guide](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [Vite Config](https://vitejs.dev/config/)
- [Hana Caraka Asset Pack](../Hana%20Caraka%20-%20Dungeon%20%26%20Mining/Read%20Me.txt)

---

*End of Game Development PRD*

