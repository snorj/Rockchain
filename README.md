# Rockchain

A browser-based pixel-art mining game demonstrating **Privy Smart Wallets (ERC-4337)** and **gasless on-chain gameplay**.

## 🎯 Overview

Players mine ores in a dungeon scene, sell them for **on-chain Gold Tokens (GLD)**, and compete on a global leaderboard — all without needing MetaMask, gas fees, or crypto setup.

**Built by:** Peter Lonergan (University of Sydney)  
**Purpose:** Explore account abstraction & gasless UX in web3 gaming  
**Timeline:** 3-day MVP build

## 🛠️ Tech Stack

- **Frontend:** React + Vite + Phaser.js 3
- **Web3 Integration:** Privy Smart Wallets (ERC-4337) with gas sponsorship
- **Smart Contracts:** Solidity (Game.sol + GoldToken ERC-20)
- **Network:** Ethereum Sepolia testnet
- **Visual Assets:** Hana Caraka - Dungeon & Mining by Otterisk

## 📂 Project Structure

- `/context/` - Design docs, PRD, and attribution
- `/frontend/` - React game (being built by frontend team)
- `/contracts/` - ✅ Solidity contracts (COMPLETE - ready to deploy)
- `/Hana Caraka - Dungeon & Mining/` - Full asset pack
- `DEPLOYMENT.md` - Complete deployment guide
- `FRONTEND_INTEGRATION.md` - Integration guide for frontend team

## 📖 Documentation

- [Design Document](context/Rockchain%20Design%20Document%20(MVP).md)
- [Product Requirements](context/Rockchain%20Product%20Requirements%20Document%20(MVP).md)
- [Asset Attribution](context/ATTRIBUTION.md)

## 🎮 Core Gameplay

1. **Login** - Email/social login → automatic smart wallet creation
2. **Mine** - Click randomly spawning ores (Coal, Iron, Diamond)
3. **Collect** - Watch ores crack with 6-8 frame animations
4. **Sell** - Convert resources to on-chain GLD tokens (gas-free)
5. **Compete** - Climb the global leaderboard

## 🚀 Quick Start

### Smart Contracts (Ready to Deploy!)

```bash
# 1. Set up environment
cd contracts
npm install

# 2. Configure .env file (see .env.example)
# Add your Sepolia private key, Etherscan API key, and Privy App ID

# 3. Compile contracts
npm run compile

# 4. Run tests
npm test

# 5. Deploy to Sepolia
npm run deploy:sepolia

# 6. Verify on Etherscan
npm run verify:sepolia
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

### Frontend Integration

Frontend team: See [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md) for integration guide.

## 📜 License

Code: MIT  
Assets: Hana Caraka by Otterisk (see [ATTRIBUTION.md](context/ATTRIBUTION.md))