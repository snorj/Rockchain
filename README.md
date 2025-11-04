# Rockchain

A blockchain-integrated mining game demonstrating ERC-4337 account abstraction and gasless transaction flows on Ethereum.

## Overview

I used this project to explore Privy's smart wallet infrastructure and sponsored transaction mechanisms within a browser-based gaming context. Players interact with on-chain assets (ERC-20 tokens, ERC-721 NFTs) through a simple mining game without requiring wallet management or gas fee knowledge.

**Network:** Sepolia Testnet  

## Technical Architecture

### Blockchain Layer

**Smart Contracts (Sepolia):**
- **GoldToken (ERC-20):** [`0xD28C2fb4cb36Dad49E05B80E3E8acD856171E26C`](https://sepolia.etherscan.io/address/0xD28C2fb4cb36Dad49E05B80E3E8acD856171E26C)
- **PickaxeNFTV2 (ERC-721):** [`0xE6Fe1C3B6Ba737925938d18F7a3a38B8AC2da4a3`](https://sepolia.etherscan.io/address/0xE6Fe1C3B6Ba737925938d18F7a3a38B8AC2da4a3)
- **GemNFT (ERC-721):** [`0x3Ef5e009FdEf2438d991368CF056aF1f35fe55C0`](https://sepolia.etherscan.io/address/0x3Ef5e009FdEf2438d991368CF056aF1f35fe55C0)
- **GameV3 (Core Logic):** [`0x0D1bf8420216af77F9f8E665fEd7eF57c35a98cB`](https://sepolia.etherscan.io/address/0x0D1bf8420216af77F9f8E665fEd7eF57c35a98cB)

**Web3 Infrastructure:**
- **Account Abstraction:** ERC-4337 smart accounts via Privy
- **Gas Sponsorship:** All game transactions are gasless for end users
- **Transaction Library:** Viem for type-safe Ethereum interactions
- **Development Framework:** Hardhat with Solidity 0.8.x

### Frontend Stack

- **Game Engine:** Phaser.js 3 for 2D rendering and game loop management
- **UI Framework:** React 18 with TypeScript
- **State Management:** Zustand for global game state
- **Build Tool:** Vite for optimized development and production builds

## Key Features

### Account Abstraction Implementation

The project implements ERC-4337 smart accounts through Privy, enabling:
- Email and social authentication without seed phrases
- Automatic wallet creation on first login
- Sponsored transactions eliminating gas friction
- Standard Ethereum contract interactions through abstracted accounts

### Economic Model

The game implements a per-second pricing mechanism with exponential scaling across five mining levels. Level access costs range from free (Level 0) to 3,500 GLD per second (Level 4), with corresponding increases in reward potential. Players mine materials with varying rarities and values, selling them for GLD tokens that enable progression through pickaxe upgrades and higher-tier level access.

### Game Mechanics

Players interact with ore nodes through click-based mining, with each ore having HP values that decrease based on equipped pickaxe damage multipliers. Materials are dynamically spawned according to level-specific probability tables. All progression (pickaxe ownership, level access, token balances) is stored on-chain and verified through smart contract state.

## Quick Start

### Prerequisites
```bash
Node.js 18+
npm or yarn
```

### Installation

```bash
# Frontend
cd frontend
npm install

# Contracts (optional)
cd contracts
npm install
```

### Running the Game

```bash
cd frontend
npm run dev
```

Access at `http://localhost:5173`

### Development

```bash
# Run contract tests
cd contracts
npm test

# Build frontend for production
cd frontend
npm run build

# Deploy contracts
cd contracts
npx hardhat run scripts/deploy-game-v3.ts --network sepolia
```

## Project Structure

```
rockchain/
├── frontend/
│   ├── src/
│   │   ├── blockchain/      # Web3 hooks, contract ABIs, addresses
│   │   ├── components/      # React UI components
│   │   ├── game/            # Phaser scenes, entities, managers
│   │   └── store/           # Zustand state management
│   └── public/assets/       # Game sprites and tilesets
│
└── contracts/
    ├── contracts/           # Solidity smart contracts
    └── scripts/             # Deployment scripts
```