# MineChain: Dungeon Rush

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
- `/frontend/` - React game (to be built)
- `/contracts/` - Solidity contracts (to be built)
- `/assets/` - Selected sprites from Hana Caraka pack
- `/Hana Caraka - Dungeon & Mining/` - Full asset pack

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

*(Coming soon - project in design phase)*

## 📜 License

Code: MIT  
Assets: Hana Caraka by Otterisk (see [ATTRIBUTION.md](context/ATTRIBUTION.md))