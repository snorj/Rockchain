# 🎮 Rockchain - Mining Game Frontend

A browser-based mining game built with **Phaser.js** and **React**, designed for seamless blockchain integration.

![Rockchain Game](./docs/screenshot.png)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Open [http://localhost:5173](http://localhost:5173) to play!

## 🎯 Features

### Core Gameplay
- ✅ **Mining Mechanic**: Click ores to mine them (2-6 second animations)
- ✅ **Resource Types**: Coal (70%), Iron (25%), Diamond (5% rarity)
- ✅ **Dynamic Spawning**: 3-5 ores spawn and respawn continuously
- ✅ **Inventory System**: Real-time tracking of collected resources
- ✅ **Value Calculation**: Coal (1 GLD), Iron (3 GLD), Diamond (10 GLD)

### Visual Polish
- ✨ Animated cave background with tilesets
- 🔥 Flickering torches with glow effects
- ✨ Particle effects on ore collection
- 📊 Real-time debug info (dev mode)
- 🎨 Pixel-perfect rendering (no antialiasing)

### Technical
- ⚡ 60 FPS performance
- 🧱 Component-based architecture
- 📦 Type-safe TypeScript
- 🎨 CSS Modules + Tailwind CSS
- 🔄 Zustand state management
- 🎮 Phaser 3.90.0 game engine

## 📁 Project Structure

```
frontend/
├── public/
│   └── assets/              # Game assets
│       ├── sprites/
│       │   ├── ores/        # Ore sprite sheets (8 frames each)
│       │   └── props/       # Torch animations
│       └── tilesets/        # Cave backgrounds
├── src/
│   ├── components/
│   │   ├── Game/
│   │   │   └── GameCanvas.tsx       # Phaser mount point
│   │   ├── UI/
│   │   │   ├── InventoryHUD.tsx     # Ore counter display
│   │   │   └── SellButton.tsx       # Sell resources button
│   │   └── Layout/
│   │       └── GameLayout.tsx       # Main layout
│   ├── game/                 # Phaser game code
│   │   ├── scenes/
│   │   │   ├── PreloadScene.ts      # Asset loading
│   │   │   └── MiningScene.ts       # Main game scene
│   │   ├── entities/
│   │   │   └── OreNode.ts           # Clickable ore sprites
│   │   ├── managers/
│   │   │   └── OreSpawner.ts        # Ore spawning logic
│   │   └── config/
│   │       └── gameConfig.ts        # Phaser configuration
│   ├── store/
│   │   └── gameStore.ts             # Zustand game state
│   ├── types/
│   │   ├── game.types.ts            # Game interfaces
│   │   └── blockchain.types.ts      # Blockchain adapter interface
│   ├── utils/
│   │   └── constants.ts             # Game constants
│   ├── App.tsx
│   └── main.tsx
├── scripts/
│   └── createSpriteSheets.js        # Asset generation script
├── TESTING.md                        # Testing documentation
├── INTEGRATION_GUIDE.md              # Blockchain integration guide
└── README.md                         # This file
```

## 🎮 How to Play

1. **Mine Ores**: Click on ore nodes in the game canvas
2. **Watch Progress**: A progress bar shows mining duration
3. **Collect Resources**: Ores disappear and inventory increases
4. **Sell Resources**: Click "Sell Resources" when you have ores
5. **Repeat**: New ores spawn automatically

### Ore Values
| Ore     | Rarity | Mining Time | Value |
|---------|--------|-------------|-------|
| Coal    | 70%    | 2 seconds   | 1 GLD |
| Iron    | 25%    | 4 seconds   | 3 GLD |
| Diamond | 5%     | 6 seconds   | 10 GLD|

## 🔧 Development

### Tech Stack
- **Framework**: React 18+ with TypeScript
- **Bundler**: Vite 5+
- **Game Engine**: Phaser.js 3.90+
- **State**: Zustand
- **Styling**: CSS Modules + Tailwind CSS
- **Node**: 18.x or 20.x

### Key Dependencies
```json
{
  "react": "^18.3.1",
  "phaser": "^3.90.0",
  "zustand": "^5.0.3",
  "tailwindcss": "^4.x",
  "@tailwindcss/postcss": "^4.x"
}
```

### Scripts
```bash
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint (if configured)
```

### Environment Variables
Create `.env.local` for blockchain integration:
```env
VITE_PRIVY_APP_ID=your_privy_app_id
VITE_CONTRACT_ADDRESS=0x...
VITE_BASE_RPC_URL=https://mainnet.base.org
```

## 🔌 Blockchain Integration

This game is **blockchain-ready** but works standalone. See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) for:
- Adding Privy wallet connection
- Replacing mock sell with smart contract calls
- Implementing gas sponsorship
- Adding leaderboard functionality

**Key Integration Points**:
1. `src/components/UI/SellButton.tsx` - Replace mock sell
2. `src/store/gameStore.ts` - Access game state
3. `src/types/blockchain.types.ts` - Blockchain adapter interface

## 📊 Performance

- **FPS**: Stable 60 FPS
- **Bundle Size**: ~1.7 MB (Phaser is the largest dependency)
- **Load Time**: < 2 seconds on good connection
- **Memory**: < 150 MB (stable, no leaks)

## 🧪 Testing

See [TESTING.md](./TESTING.md) for:
- Automated test results
- Manual testing checklist
- Acceptance criteria
- Console output reference

**Quick Test**:
```bash
npm run dev
# Open http://localhost:5173
# Click ores, verify inventory updates
# Click sell button, verify reset
```

## 🎨 Asset Generation

Sprite sheets are generated from single PNG files:

```bash
npm run build:assets  # (if script added to package.json)
# or
node scripts/createSpriteSheets.js
```

This creates 8-frame mining animations from static ore images.

## 📝 Code Style

- **TypeScript**: Strict mode, no `any` types
- **Components**: Functional components with hooks
- **State**: Zustand for global state, local state for UI
- **Imports**: Organized (React → Libraries → Local)
- **Naming**: PascalCase for components, camelCase for functions

## 🐛 Known Issues

1. **Large Bundle**: Phaser adds ~1.5 MB (unavoidable)
2. **Canvas Automation**: Automated testing requires manual verification for canvas clicks
3. **Dev Mode Warnings**: React DevTools suggestions (non-breaking)

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
# Connect repo to Vercel
# Deploy automatically on push
```

### Manual
```bash
npm run build
# Upload dist/ folder to your hosting provider
```

## 📚 Resources

- [Phaser 3 Docs](https://photonstorm.github.io/phaser3-docs/)
- [Zustand Guide](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [Vite Documentation](https://vitejs.dev/)
- [Base Chain Docs](https://docs.base.org/)

## 🤝 Contributing

This is part of the Rockchain project. For blockchain integration:
1. Read [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
2. Don't modify game logic unless necessary
3. Add blockchain layer as separate module
4. Test on testnet first

## 📄 License

Part of Rockchain MVP - Built for Day 1 Sprint (November 1, 2025)

## 👨‍💻 Author

Built according to PRD-1-Game-Development.md specifications.

---

**Ready to integrate blockchain?** → See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)

**Need to test?** → See [TESTING.md](./TESTING.md)

**Questions?** → Check the source code - it's well-documented!
