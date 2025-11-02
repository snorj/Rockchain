# Rockchain ⛏️💎

A browser-based pixel-art mining game with **Privy Smart Wallets (ERC-4337)** and **gasless on-chain gameplay**.

## 🎯 Overview

Players mine ores across 5 mining levels, collect 26 different materials, upgrade pickaxes, and sell resources for **on-chain Gold Tokens (GLD)** — all without needing MetaMask, gas fees, or crypto knowledge.

**Built by:** Peter Lonergan (University of Sydney)  
**Purpose:** Explore account abstraction & gasless UX in web3 gaming  
**Status:** ✅ **Fully Integrated - Ready for Testing**

---

## 🎮 Core Gameplay

### Simple Click-to-Mine Mechanics
1. **Login** - Email/social login → automatic smart wallet creation (Privy)
2. **Mine** - Click on 10 ore nodes to mine them (no player character)
3. **Collect** - Watch materials fly to your inventory
4. **Sell** - Convert resources to on-chain GLD tokens (gas-free)
5. **Upgrade** - Buy better pickaxes (1x → 6x damage)
6. **Progress** - Unlock 5 mining levels with rarer materials

### 5-Level Progression System
- **Level 1** (Beginner Mine) - Free, unlimited - Stone, Copper, Tin, Coal
- **Level 2** (Iron Mine) - 50g, 2 min - Iron, Lead, Cobalt
- **Level 3** (Precious Mine) - 200g, 2 min - Silver, Gold, Platinum, Emerald
- **Level 4** (Gem Cavern) - 500g, 2 min - Palladium, Ruby, Sapphire
- **Level 5** (Mythic Depths) - 1500g, 2 min - Mythril, Adamantite, Diamond

### 26 Materials
- **18 Ores**: Stone → Copper → Iron → Silver → Gold → Platinum → Mythril → Adamantite
- **8 Gems**: Emerald → Topaz → Ruby → Sapphire → Diamond → Amethyst

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Sepolia testnet ETH (for initial contract interaction)

### 1. Install Dependencies

```bash
# Frontend
cd frontend
npm install

# Contracts (if deploying)
cd ../contracts
npm install
```

### 2. Run the Game

```bash
cd frontend
npm run dev
```

The game will start at `http://localhost:5173`

### 3. Play the Game

1. **Connect Wallet**
   - Click "Connect Wallet" 
   - Sign in with email/social (Privy)
   - Wallet is created automatically

2. **Start Mining**
   - Click on ore nodes to mine them
   - Watch your inventory fill up
   - Each ore has HP that decreases with clicks

3. **Sell Materials**
   - Press **S** to open shop
   - Click "Sell All" in the Sell tab
   - Confirm transaction (gas-free!)
   - Gold balance updates

4. **Upgrade Pickaxe**
   - Press **S** to open shop
   - Go to Buy tab
   - Purchase next pickaxe tier
   - Higher damage = faster mining

5. **Unlock New Levels**
   - Click level selector at top
   - Choose level 2-5 (requires pickaxe + gold)
   - Purchase 2-minute access
   - Mine rarer materials

6. **Timer Expires**
   - Modal appears when time runs out
   - Choose to renew or return to Level 1

### Keyboard Shortcuts
- **S** - Open/close shop
- **I** - Open/close material info
- **ESC** - Close modals
- **Click** - Mine ore

---

## 🛠️ Tech Stack

### Frontend
- **React** - UI framework
- **Vite** - Build tool
- **TypeScript** - Type safety
- **Phaser.js 3** - Game engine
- **Zustand** - State management

### Blockchain
- **Privy** - Smart Wallets (ERC-4337) with gas sponsorship
- **Viem** - Ethereum interactions
- **Solidity** - Smart contracts
- **Hardhat** - Contract development

### Smart Contracts (Sepolia)
- **GoldToken** (ERC-20) - `0xBc0E7e2E4FAf207993adF7f6A7c5E4606719f527`
- **PickaxeNFT** (ERC-721) - `0xDb2030F78d940F0057d2f6B877957BF68213D0D9`
- **GemNFT** (ERC-721) - `0x25FaD2bA87BdCD9E41fCa42b45c7a573506bFb73`
- **GameV2** - `0xCB76BE68716D220D812fDDdD3465057cA4a14D4F` ⭐ **NEW**

### Assets
- **Hana Caraka - Dungeon & Mining** by Otterisk

---

## 📂 Project Structure

```
rockchain/
├── frontend/               # React + Phaser game
│   ├── src/
│   │   ├── components/    # React UI components
│   │   │   ├── Game/      # GameCanvas, GameUI
│   │   │   ├── UI/        # Shop, Inventory, Level Selector
│   │   │   └── Web3/      # Wallet connection
│   │   ├── game/          # Phaser game code
│   │   │   ├── scenes/    # MiningScene, PreloadScene
│   │   │   ├── entities/  # OreNode
│   │   │   ├── managers/  # OreSpawner
│   │   │   └── config/    # Materials, Pickaxes, Levels
│   │   ├── blockchain/    # Web3 hooks & config
│   │   │   ├── hooks/     # useLevelAccess, useSellResources
│   │   │   ├── config/    # Contract addresses
│   │   │   └── abis/      # Contract ABIs
│   │   └── store/         # Zustand game state
│   └── public/
│       └── assets/        # Game sprites & tilesets
│
├── contracts/             # Solidity smart contracts
│   ├── contracts/
│   │   ├── GameV2.sol     # Main game logic with levels
│   │   ├── GoldToken.sol  # ERC-20 currency
│   │   ├── PickaxeNFT.sol # ERC-721 tools
│   │   └── GemNFT.sol     # ERC-721 collectibles
│   └── scripts/           # Deployment scripts
│
└── docs/                  # Documentation
    ├── GAME_REDESIGN_COMPLETE.md
    ├── INTEGRATION_COMPLETE.md
    └── QUICK_REFERENCE.md
```

---

## 📖 Documentation

### Game Design
- **[Game Redesign Complete](GAME_REDESIGN_COMPLETE.md)** - Full game mechanics breakdown
- **[Integration Complete](INTEGRATION_COMPLETE.md)** - Integration status & details
- **[Quick Reference](QUICK_REFERENCE.md)** - Commands, addresses, and tips

### Development
- **[Integration Steps](INTEGRATION_STEPS.md)** - Step-by-step integration guide
- **[Deployment Guide](DEPLOYMENT.md)** - Contract deployment instructions

### Original Design Docs
- [Design Document](context/Rockchain%20Design%20Document%20(MVP).md)
- [Product Requirements](context/Rockchain%20Product%20Requirements%20Document%20(MVP).md)
- [Asset Attribution](context/ATTRIBUTION.md)

---

## 🔧 Development

### Running Tests

```bash
# Contract tests
cd contracts
npm test

# Frontend dev server (with hot reload)
cd frontend
npm run dev
```

### Building for Production

```bash
cd frontend
npm run build
```

### Deploying Contracts

```bash
cd contracts

# Compile contracts
npx hardhat compile

# Deploy GameV2 (already deployed to Sepolia)
npx hardhat run scripts/deploy-game-v2.ts --network sepolia

# Verify on Etherscan
npx hardhat verify --network sepolia [CONTRACT_ADDRESS] [CONSTRUCTOR_ARGS]
```

---

## 🎯 Game Features

### ✅ Implemented
- [x] Click-to-mine mechanics (no player character)
- [x] 5 mining levels with unique spawn tables
- [x] 5 pickaxe tiers (Wooden → Adamantite)
- [x] 26 material types (18 ores + 8 gems)
- [x] Dynamic inventory (only shows owned materials)
- [x] Material selling (on-chain via GameV2)
- [x] Level access purchase (timed 2-minute sessions)
- [x] Pickaxe upgrades
- [x] Timer system with expiry modal
- [x] Gas-sponsored transactions (Privy)
- [x] Shop system (buy/sell tabs)
- [x] Material info database
- [x] Keyboard shortcuts
- [x] Progress bars on ore mining
- [x] Flying loot animations

### 🚧 TODO (Polish)
- [ ] Pickaxe NFT blockchain integration (currently local state)
- [ ] GLD balance sync from blockchain
- [ ] Sound effects (mining, breaking, level up)
- [ ] Background music per level
- [ ] Mobile responsive UI
- [ ] Achievement system
- [ ] Leaderboard
- [ ] Daily quests

---

## 🧪 Testing

### Test with Real Wallet

1. Get Sepolia ETH from faucet: https://sepoliafaucet.com
2. Connect wallet in game
3. Mine some ores
4. Sell materials (test blockchain transaction)
5. Buy pickaxe upgrade (test GLD spending)
6. Purchase level 2 access (test level system)
7. Let timer expire (test expiry modal)

### Test Accounts
You'll need Sepolia ETH for:
- ✅ Selling materials (gas-sponsored by Privy)
- ✅ Buying pickaxes (gas-sponsored by Privy)
- ✅ Level access (gas-sponsored by Privy)

---

## 🌐 Deployed Contracts (Sepolia Testnet)

| Contract | Address | Etherscan |
|----------|---------|-----------|
| GoldToken | `0xBc0E7e2E4FAf207993adF7f6A7c5E4606719f527` | [View](https://sepolia.etherscan.io/address/0xBc0E7e2E4FAf207993adF7f6A7c5E4606719f527) |
| PickaxeNFT | `0xDb2030F78d940F0057d2f6B877957BF68213D0D9` | [View](https://sepolia.etherscan.io/address/0xDb2030F78d940F0057d2f6B877957BF68213D0D9) |
| GemNFT | `0x25FaD2bA87BdCD9E41fCa42b45c7a573506bFb73` | [View](https://sepolia.etherscan.io/address/0x25FaD2bA87BdCD9E41fCa42b45c7a573506bFb73) |
| Game (V1) | `0x1916045204B3c9AA236c8f13918CdAbe1Ee61623` | [View](https://sepolia.etherscan.io/address/0x1916045204B3c9AA236c8f13918CdAbe1Ee61623) |
| **GameV2** ⭐ | `0xCB76BE68716D220D812fDDdD3465057cA4a14D4F` | [View](https://sepolia.etherscan.io/address/0xCB76BE68716D220D812fDDdD3465057cA4a14D4F) |

---

## 🎨 Game Economy

### Material Values (Sample)

| Tier | Material | Value | Where to Find |
|------|----------|-------|---------------|
| 1 | Stone | 1g | Level 1 |
| 1 | Copper | 3g | Level 1 |
| 2 | Iron | 10g | Level 2 |
| 3 | Silver | 25g | Level 3 |
| 3 | Gold | 50g | Level 3 |
| 3 | Emerald | 100g | Level 3 |
| 4 | Ruby | 150g | Level 4 |
| 5 | Mythril | 300g | Level 5 |
| 5 | Diamond | 500g | Level 5 |

### Pickaxe Upgrades

| Pickaxe | Damage | Price | Unlocks |
|---------|--------|-------|---------|
| Wooden | 1x | Free | Level 1 |
| Steel | 1.5x | 150g | Level 2 |
| Iron | 2x | 800g | Level 3 |
| Mythril | 4x | 3500g | Level 4 |
| Adamantite | 6x | 15000g | Level 5 |

### Level Access Costs

| Level | Cost | Duration | Best Material |
|-------|------|----------|---------------|
| 1 | Free | Unlimited | Coal (5g) |
| 2 | 50g | 2 min | Cobalt (12g) |
| 3 | 200g | 2 min | Emerald (100g) |
| 4 | 500g | 2 min | Ruby (150g) |
| 5 | 1500g | 2 min | Diamond (500g) |

---

## 🤝 Contributing

This is an educational project demonstrating web3 gaming concepts. Feel free to:
- Report bugs via GitHub issues
- Suggest improvements
- Fork and experiment
- Learn from the code

---

## 📜 License

**Code:** MIT License  
**Assets:** Hana Caraka by Otterisk (see [ATTRIBUTION.md](context/ATTRIBUTION.md))

---

## 🙏 Credits

- **Developer:** Peter Lonergan (University of Sydney)
- **Assets:** Hana Caraka - Dungeon & Mining by [Otterisk](https://otterisk.itch.io/)
- **Web3 Infrastructure:** [Privy](https://privy.io/)
- **Game Engine:** [Phaser.js](https://phaser.io/)

---

## 🔗 Links

- **Privy Dashboard:** https://dashboard.privy.io/
- **Sepolia Faucet:** https://sepoliafaucet.com
- **Etherscan (Sepolia):** https://sepolia.etherscan.io/

---

**Status:** ✅ Fully Integrated - Ready for Testing  
**Last Updated:** November 2, 2025

*Mine. Collect. Earn.* ⛏️💎
