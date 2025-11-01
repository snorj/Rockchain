# Rockchain - Blockchain Integration PRD

**Version:** 1.0  
**Sprint:** Day 2 - Smart Contracts & Privy Integration  
**Author:** Peter Lonergan  
**Date:** November 1, 2025

---

## 🎯 Purpose

Integrate blockchain functionality into the Rockchain game using **Privy Smart Wallets (ERC-4337)** and **custom Solidity contracts**. This component handles all on-chain interactions including wallet creation, gasless transactions, token minting, and leaderboard queries. Designed to integrate seamlessly with the game layer developed in PRD-1.

---

## 📋 Scope & Objectives

### In Scope
- ✅ Smart contract development (GoldToken + Game.sol)
- ✅ Privy embedded wallet integration
- ✅ Gas sponsorship (Paymaster) configuration
- ✅ Transaction handling (sell resources → mint GLD)
- ✅ On-chain leaderboard queries
- ✅ Wallet UI components (login, balance, address)
- ✅ Integration with game store from PRD-1
- ✅ Sepolia testnet deployment

### Out of Scope (Handled by Game PRD)
- ❌ Game loop mechanics
- ❌ Ore spawning/mining
- ❌ Phaser.js implementation
- ❌ Visual assets
- ❌ Inventory UI components

---

## 🏗️ Technical Architecture

### Tech Stack

```json
{
  "walletSDK": "Privy (ERC-4337)",
  "smartContracts": "Solidity 0.8.20+",
  "development": "Hardhat",
  "network": "Ethereum Sepolia Testnet",
  "web3Library": "viem (preferred) or ethers.js v6",
  "rpcProvider": "Privy RPC (built-in) or Alchemy",
  "bundler": "Privy Account Abstraction",
  "paymaster": "Privy Gas Sponsorship"
}
```

### Project Structure

```
rockchain/
├── frontend/
│   └── src/
│       ├── blockchain/
│       │   ├── adapters/
│       │   │   └── BlockchainAdapter.ts      # Main integration class
│       │   ├── hooks/
│       │   │   ├── usePrivy.ts               # Privy auth hook
│       │   │   ├── useWallet.ts              # Wallet operations
│       │   │   ├── useSellResources.ts       # Transaction hook
│       │   │   └── useLeaderboard.ts         # Leaderboard queries
│       │   ├── config/
│       │   │   └── privyConfig.ts            # Privy setup
│       │   └── utils/
│       │       ├── contracts.ts              # Contract ABIs + addresses
│       │       └── formatters.ts             # Address/balance formatting
│       └── components/
│           └── Web3/
│               ├── PrivyProvider.tsx         # Privy context wrapper
│               ├── WalletButton.tsx          # Login/logout
│               ├── WalletInfo.tsx            # Address + balance
│               └── TransactionStatus.tsx     # TX feedback
│
└── contracts/
    ├── contracts/
    │   ├── GoldToken.sol                     # ERC-20 GLD token
    │   └── Game.sol                          # Mining logic + minting
    ├── scripts/
    │   ├── deploy.ts                         # Deployment script
    │   └── verify.ts                         # Etherscan verification
    ├── test/
    │   ├── GoldToken.test.ts
    │   └── Game.test.ts
    ├── hardhat.config.ts
    └── package.json
```

---

## 🔗 Smart Contracts

### Contract 1: GoldToken.sol

**Purpose:** ERC-20 token representing in-game gold earned from mining.

**Specifications:**
- Name: "Rockchain Gold"
- Symbol: "GLD"
- Decimals: 18 (standard)
- Max Supply: Unlimited (minted on-demand)
- Minting: Only `Game.sol` can mint
- Access Control: OpenZeppelin `AccessControl`

**Implementation:**

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title GoldToken
 * @notice ERC-20 token representing gold earned in Rockchain
 * @dev Only the Game contract can mint tokens
 */
contract GoldToken is ERC20, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    
    event TokensMinted(address indexed player, uint256 amount);
    
    constructor() ERC20("Rockchain Gold", "GLD") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    /**
     * @notice Grant minter role to Game contract
     * @param minter Address of Game.sol
     */
    function setMinter(address minter) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(MINTER_ROLE, minter);
    }
    
    /**
     * @notice Mint GLD tokens to player
     * @param to Player's wallet address
     * @param amount Amount of GLD to mint (in wei)
     */
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }
    
    /**
     * @notice Get human-readable balance (with 18 decimals)
     * @param account Address to check
     * @return Balance in GLD (not wei)
     */
    function balanceOfGLD(address account) external view returns (uint256) {
        return balanceOf(account) / 1e18;
    }
}
```

**Deployment:**
```typescript
// contracts/scripts/deploy.ts
const GoldToken = await ethers.getContractFactory("GoldToken");
const goldToken = await GoldToken.deploy();
await goldToken.waitForDeployment();

console.log("GoldToken deployed to:", await goldToken.getAddress());
```

**Test Coverage:**
```typescript
// contracts/test/GoldToken.test.ts
describe("GoldToken", () => {
  it("Should deploy with correct name and symbol");
  it("Should prevent minting without MINTER_ROLE");
  it("Should allow minting with MINTER_ROLE");
  it("Should track balances correctly");
  it("Should emit TokensMinted event");
});
```

**Acceptance Criteria:**
- [ ] Contract compiles without warnings
- [ ] All tests pass (5/5)
- [ ] Test coverage ≥ 90%
- [ ] Successfully deployed to Sepolia
- [ ] Verified on Etherscan

---

### Contract 2: Game.sol

**Purpose:** Core game logic contract that converts mined resources into GLD tokens.

**Specifications:**
- Accepts resource counts (coal, iron, diamond)
- Calculates GLD value: coal×1 + iron×3 + diamond×10
- Mints GLD via `GoldToken.mint()`
- Emits `Sold` event for leaderboard tracking
- No withdrawal/burn functions (tokens are permanent)

**Implementation:**

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./GoldToken.sol";

/**
 * @title Game
 * @notice Core Rockchain game logic - converts mined ores into GLD tokens
 */
contract Game {
    GoldToken public immutable goldToken;
    
    // Resource values in GLD
    uint256 public constant COAL_VALUE = 1;
    uint256 public constant IRON_VALUE = 3;
    uint256 public constant DIAMOND_VALUE = 10;
    
    // Statistics
    uint256 public totalSales;
    mapping(address => uint256) public playerSales;
    
    event Sold(
        address indexed player,
        uint256 coal,
        uint256 iron,
        uint256 diamond,
        uint256 goldEarned,
        uint256 timestamp
    );
    
    constructor(address _goldToken) {
        require(_goldToken != address(0), "Invalid token address");
        goldToken = GoldToken(_goldToken);
    }
    
    /**
     * @notice Sell mined resources for GLD tokens
     * @param coal Number of coal ores
     * @param iron Number of iron ores
     * @param diamond Number of diamond ores
     * @dev Mints GLD tokens to caller based on resource values
     */
    function sellResources(
        uint256 coal,
        uint256 iron,
        uint256 diamond
    ) external {
        require(
            coal > 0 || iron > 0 || diamond > 0,
            "Must sell at least one resource"
        );
        
        // Calculate total GLD value
        uint256 goldAmount = 
            (coal * COAL_VALUE) +
            (iron * IRON_VALUE) +
            (diamond * DIAMOND_VALUE);
        
        // Convert to wei (18 decimals)
        uint256 goldAmountWei = goldAmount * 1e18;
        
        // Mint GLD tokens to player
        goldToken.mint(msg.sender, goldAmountWei);
        
        // Update statistics
        totalSales += goldAmountWei;
        playerSales[msg.sender] += goldAmountWei;
        
        emit Sold(
            msg.sender,
            coal,
            iron,
            diamond,
            goldAmount,
            block.timestamp
        );
    }
    
    /**
     * @notice Get player's total GLD earned
     * @param player Player address
     * @return Total GLD earned (in GLD, not wei)
     */
    function getPlayerEarnings(address player) external view returns (uint256) {
        return playerSales[player] / 1e18;
    }
    
    /**
     * @notice Preview GLD value before selling
     * @param coal Number of coal ores
     * @param iron Number of iron ores
     * @param diamond Number of diamond ores
     * @return goldAmount GLD tokens that would be earned
     */
    function previewSale(
        uint256 coal,
        uint256 iron,
        uint256 diamond
    ) external pure returns (uint256 goldAmount) {
        goldAmount = 
            (coal * COAL_VALUE) +
            (iron * IRON_VALUE) +
            (diamond * DIAMOND_VALUE);
    }
}
```

**Deployment:**
```typescript
// contracts/scripts/deploy.ts
// 1. Deploy GoldToken
const GoldToken = await ethers.getContractFactory("GoldToken");
const goldToken = await GoldToken.deploy();
await goldToken.waitForDeployment();

// 2. Deploy Game with GoldToken address
const Game = await ethers.getContractFactory("Game");
const game = await Game.deploy(await goldToken.getAddress());
await game.waitForDeployment();

// 3. Grant minter role to Game contract
await goldToken.setMinter(await game.getAddress());

console.log("Deployment complete:");
console.log("- GoldToken:", await goldToken.getAddress());
console.log("- Game:", await game.getAddress());

// Save addresses to frontend config
const addresses = {
  goldToken: await goldToken.getAddress(),
  game: await game.getAddress(),
  chainId: 11155111 // Sepolia
};

fs.writeFileSync(
  "../frontend/src/blockchain/config/addresses.json",
  JSON.stringify(addresses, null, 2)
);
```

**Test Coverage:**
```typescript
// contracts/test/Game.test.ts
describe("Game", () => {
  it("Should sell resources and mint correct GLD");
  it("Should reject sale with 0 resources");
  it("Should emit Sold event with correct data");
  it("Should track player sales statistics");
  it("Should preview sale correctly");
  it("Should handle large resource amounts");
  it("Integration: Full flow GoldToken + Game");
});
```

**Acceptance Criteria:**
- [ ] Contract compiles without warnings
- [ ] All tests pass (7/7)
- [ ] Test coverage ≥ 95%
- [ ] Successfully deployed to Sepolia
- [ ] Verified on Etherscan
- [ ] Minter role granted correctly

---

## 🔐 Privy Integration

### Setup & Configuration

**Privy Dashboard:**
1. Create account at [privy.io](https://privy.io)
2. Create new app "Rockchain"
3. Configure settings:
   - **Login methods:** Email, Google, Twitter
   - **Networks:** Ethereum Sepolia (11155111)
   - **Account Abstraction:** Enable (ERC-4337)
   - **Gas sponsorship:** Enable Paymaster
   - **Spending limits:** $5/user/day (adjust as needed)

4. Get credentials:
   - App ID: `<PRIVY_APP_ID>`
   - API Key: `<PRIVY_API_KEY>`

**Environment Variables:**
```bash
# frontend/.env
VITE_PRIVY_APP_ID=your_app_id_here
VITE_GOLD_TOKEN_ADDRESS=0x...
VITE_GAME_CONTRACT_ADDRESS=0x...
VITE_CHAIN_ID=11155111
```

### Privy Provider Setup

```typescript
// src/blockchain/config/privyConfig.ts
import { PrivyClientConfig } from '@privy-io/react-auth';

export const privyConfig: PrivyClientConfig = {
  appId: import.meta.env.VITE_PRIVY_APP_ID,
  config: {
    loginMethods: ['email', 'google', 'twitter'],
    appearance: {
      theme: 'dark',
      accentColor: '#FFD700', // Gold color for Rockchain
      logo: '/logo.png'
    },
    embeddedWallets: {
      createOnLogin: 'users-without-wallets',
      requireUserPasswordOnCreate: false
    },
    defaultChain: {
      id: 11155111,
      name: 'Sepolia',
      network: 'sepolia',
      nativeCurrency: {
        name: 'Sepolia ETH',
        symbol: 'ETH',
        decimals: 18
      },
      rpcUrls: {
        default: { http: ['https://rpc.sepolia.org'] }
      }
    }
  }
};
```

```typescript
// src/components/Web3/PrivyProvider.tsx
import { PrivyProvider as PrivyAuthProvider } from '@privy-io/react-auth';
import { privyConfig } from '@/blockchain/config/privyConfig';

export const PrivyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <PrivyAuthProvider
      appId={privyConfig.appId}
      config={privyConfig.config}
      onSuccess={(user) => {
        console.log('✅ User authenticated:', user.id);
      }}
    >
      {children}
    </PrivyAuthProvider>
  );
};
```

**Wrap App:**
```typescript
// src/App.tsx
import { PrivyProvider } from '@/components/Web3/PrivyProvider';

function App() {
  return (
    <PrivyProvider>
      {/* Rest of app */}
    </PrivyProvider>
  );
}
```

**Acceptance Criteria:**
- [ ] Privy app created in dashboard
- [ ] App ID configured in frontend
- [ ] Gas sponsorship enabled
- [ ] Login modal displays correctly
- [ ] No console errors on init

---

### Wallet Components

#### Login/Logout Button

```typescript
// src/components/Web3/WalletButton.tsx
import { usePrivy, useWallets } from '@privy-io/react-auth';

export const WalletButton = () => {
  const { ready, authenticated, login, logout, user } = usePrivy();
  const { wallets } = useWallets();
  
  const embeddedWallet = wallets.find(w => w.walletClientType === 'privy');
  
  if (!ready) {
    return <button disabled>Loading...</button>;
  }
  
  if (!authenticated) {
    return (
      <button onClick={login} className="wallet-button connect">
        Connect Wallet
      </button>
    );
  }
  
  return (
    <div className="wallet-info">
      <span className="wallet-address">
        {embeddedWallet?.address.slice(0, 6)}...{embeddedWallet?.address.slice(-4)}
      </span>
      <button onClick={logout} className="wallet-button disconnect">
        Disconnect
      </button>
    </div>
  );
};
```

#### Balance Display

```typescript
// src/components/Web3/WalletInfo.tsx
import { useWallets } from '@privy-io/react-auth';
import { useGoldBalance } from '@/blockchain/hooks/useGoldBalance';

export const WalletInfo = () => {
  const { wallets } = useWallets();
  const embeddedWallet = wallets.find(w => w.walletClientType === 'privy');
  const { balance, isLoading } = useGoldBalance(embeddedWallet?.address);
  
  if (!embeddedWallet) return null;
  
  return (
    <div className="wallet-info-panel">
      <div className="balance">
        <span className="label">GLD Balance:</span>
        <span className="value">
          {isLoading ? '...' : balance.toFixed(2)}
        </span>
      </div>
    </div>
  );
};
```

**Acceptance Criteria:**
- [ ] Login button opens Privy modal
- [ ] Email/social login works
- [ ] Wallet created automatically
- [ ] Address displays in UI
- [ ] Logout clears session
- [ ] Balance fetches from contract

---

## 🔄 Transaction Handling

### Sell Resources Hook

```typescript
// src/blockchain/hooks/useSellResources.ts
import { useState } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { createWalletClient, custom } from 'viem';
import { sepolia } from 'viem/chains';
import { GAME_ABI, GAME_ADDRESS } from '@/blockchain/utils/contracts';

export const useSellResources = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { wallets } = useWallets();
  
  const sellResources = async (coal: number, iron: number, diamond: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const embeddedWallet = wallets.find(w => w.walletClientType === 'privy');
      if (!embeddedWallet) throw new Error('No wallet connected');
      
      // Get EIP-1193 provider from Privy wallet
      const provider = await embeddedWallet.getEthereumProvider();
      
      // Create viem wallet client
      const walletClient = createWalletClient({
        account: embeddedWallet.address as `0x${string}`,
        chain: sepolia,
        transport: custom(provider)
      });
      
      // Call sellResources on Game contract
      const txHash = await walletClient.writeContract({
        address: GAME_ADDRESS,
        abi: GAME_ABI,
        functionName: 'sellResources',
        args: [BigInt(coal), BigInt(iron), BigInt(diamond)]
      });
      
      console.log('✅ Transaction sent:', txHash);
      
      // Wait for confirmation (optional)
      // const receipt = await waitForTransaction({ hash: txHash });
      
      return txHash;
      
    } catch (err: any) {
      console.error('❌ Transaction failed:', err);
      setError(err.message || 'Transaction failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  return { sellResources, isLoading, error };
};
```

### Integration with Game Store

```typescript
// src/components/UI/SellButton.tsx (UPDATED)
import { useGameStore } from '@/store/gameStore';
import { useSellResources } from '@/blockchain/hooks/useSellResources';
import { usePrivy } from '@privy-io/react-auth';

export const SellButton = () => {
  const { authenticated } = usePrivy();
  const { inventory, onSellRequested, onSellComplete } = useGameStore();
  const { sellResources, isLoading, error } = useSellResources();
  
  const hasOres = inventory.coal > 0 || inventory.iron > 0 || inventory.diamond > 0;
  
  const handleSell = async () => {
    if (!authenticated) {
      alert('Please connect wallet first');
      return;
    }
    
    const sellData = onSellRequested();
    
    try {
      const txHash = await sellResources(
        sellData.coal,
        sellData.iron,
        sellData.diamond
      );
      
      // Success!
      onSellComplete(true, txHash);
      
    } catch (err) {
      // Failed
      onSellComplete(false);
    }
  };
  
  return (
    <div>
      <button
        className="sell-button"
        disabled={!hasOres || !authenticated || isLoading}
        onClick={handleSell}
      >
        {isLoading ? 'Selling...' : `Sell Resources (${onSellRequested().totalValue} GLD)`}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  );
};
```

**Acceptance Criteria:**
- [ ] Transaction sends successfully
- [ ] Gas is sponsored (user pays $0)
- [ ] TX hash returned
- [ ] Game inventory resets on success
- [ ] Error handling works
- [ ] Loading state displays
- [ ] Transaction appears on Sepolia Etherscan

---

## 📊 Leaderboard Implementation

### Event Tracking

```typescript
// src/blockchain/hooks/useLeaderboard.ts
import { useState, useEffect } from 'react';
import { createPublicClient, http, parseAbiItem } from 'viem';
import { sepolia } from 'viem/chains';
import { GAME_ADDRESS, GOLD_TOKEN_ABI, GOLD_TOKEN_ADDRESS } from '@/blockchain/utils/contracts';

interface LeaderboardEntry {
  address: string;
  balance: number;
  rank: number;
}

export const useLeaderboard = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http()
  });
  
  useEffect(() => {
    fetchLeaderboard();
    
    // Poll every 30 seconds
    const interval = setInterval(fetchLeaderboard, 30000);
    return () => clearInterval(interval);
  }, []);
  
  const fetchLeaderboard = async () => {
    try {
      // 1. Get all player addresses from Sold events
      const logs = await publicClient.getLogs({
        address: GAME_ADDRESS,
        event: parseAbiItem('event Sold(address indexed player, uint256 coal, uint256 iron, uint256 diamond, uint256 goldEarned, uint256 timestamp)'),
        fromBlock: 0n,
        toBlock: 'latest'
      });
      
      // Extract unique player addresses
      const playerAddresses = [...new Set(
        logs.map(log => log.args.player as string)
      )];
      
      // 2. Fetch GLD balance for each player
      const balancePromises = playerAddresses.map(async (address) => {
        const balance = await publicClient.readContract({
          address: GOLD_TOKEN_ADDRESS,
          abi: GOLD_TOKEN_ABI,
          functionName: 'balanceOf',
          args: [address]
        });
        
        return {
          address,
          balance: Number(balance) / 1e18 // Convert from wei
        };
      });
      
      const balances = await Promise.all(balancePromises);
      
      // 3. Sort by balance (descending) and take top 10
      const sorted = balances
        .sort((a, b) => b.balance - a.balance)
        .slice(0, 10)
        .map((entry, index) => ({
          ...entry,
          rank: index + 1
        }));
      
      setEntries(sorted);
      setIsLoading(false);
      
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
      setIsLoading(false);
    }
  };
  
  return { entries, isLoading, refresh: fetchLeaderboard };
};
```

### Leaderboard Component

```typescript
// src/components/UI/Leaderboard.tsx (UPDATED)
import { useLeaderboard } from '@/blockchain/hooks/useLeaderboard';
import { useWallets } from '@privy-io/react-auth';

export const Leaderboard = () => {
  const { entries, isLoading } = useLeaderboard();
  const { wallets } = useWallets();
  const myAddress = wallets.find(w => w.walletClientType === 'privy')?.address;
  
  if (isLoading) {
    return <div className="leaderboard loading">Loading...</div>;
  }
  
  return (
    <div className="leaderboard">
      <h2>🏆 Top Miners</h2>
      <div className="leaderboard-list">
        {entries.map((entry) => (
          <div
            key={entry.address}
            className={`leaderboard-entry ${
              entry.address.toLowerCase() === myAddress?.toLowerCase() ? 'current-user' : ''
            }`}
          >
            <span className="rank">#{entry.rank}</span>
            <span className="address">
              {entry.address.slice(0, 6)}...{entry.address.slice(-4)}
            </span>
            <span className="balance">{entry.balance.toFixed(2)} GLD</span>
          </div>
        ))}
      </div>
    </div>
  );
};
```

**Acceptance Criteria:**
- [ ] Fetches all Sold events
- [ ] Queries balances for all players
- [ ] Sorts by balance descending
- [ ] Displays top 10
- [ ] Highlights current user
- [ ] Updates every 30 seconds
- [ ] Handles no players gracefully

---

## 🔧 Contract Utilities

```typescript
// src/blockchain/utils/contracts.ts
import GoldTokenABI from '../../../contracts/artifacts/contracts/GoldToken.sol/GoldToken.json';
import GameABI from '../../../contracts/artifacts/contracts/Game.sol/Game.json';
import addresses from '../config/addresses.json';

export const GOLD_TOKEN_ADDRESS = addresses.goldToken as `0x${string}`;
export const GAME_ADDRESS = addresses.game as `0x${string}`;

export const GOLD_TOKEN_ABI = GoldTokenABI.abi;
export const GAME_ABI = GameABI.abi;

// Helper: Get balance
export async function getGoldBalance(client: any, address: string): Promise<number> {
  const balance = await client.readContract({
    address: GOLD_TOKEN_ADDRESS,
    abi: GOLD_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [address]
  });
  
  return Number(balance) / 1e18;
}
```

---

## ✅ Integration Checklist

### Before Integration
- [ ] Game layer complete (PRD-1)
- [ ] Smart contracts deployed to Sepolia
- [ ] Privy app configured
- [ ] Environment variables set
- [ ] Contract ABIs exported to frontend

### Integration Steps

**Step 1: Add Privy Provider**
```typescript
// Wrap <App> in src/main.tsx
import { PrivyProvider } from './components/Web3/PrivyProvider';

root.render(
  <PrivyProvider>
    <App />
  </PrivyProvider>
);
```

**Step 2: Update SellButton**
- Replace mock sell in `src/components/UI/SellButton.tsx`
- Use `useSellResources()` hook
- Handle loading/error states

**Step 3: Update Leaderboard**
- Replace mock data in `src/components/UI/Leaderboard.tsx`
- Use `useLeaderboard()` hook
- Test polling

**Step 4: Add Wallet UI**
- Add `<WalletButton />` to top-right corner
- Add `<WalletInfo />` to sidebar
- Style components

**Step 5: Test End-to-End**
- Login → Mine ores → Sell → Check balance → View leaderboard

### Post-Integration Testing
- [ ] User can log in with email
- [ ] User can log in with Google
- [ ] Wallet creates automatically
- [ ] Sell transaction succeeds
- [ ] Gas is sponsored ($0 cost to user)
- [ ] GLD balance updates in UI
- [ ] Leaderboard shows user
- [ ] Can sell multiple times
- [ ] No console errors

---

## 🚀 Deployment Checklist

### Smart Contracts
```bash
cd contracts
npm install
npx hardhat compile
npx hardhat test

# Deploy to Sepolia
npx hardhat run scripts/deploy.ts --network sepolia

# Verify contracts
npx hardhat verify --network sepolia <GOLD_TOKEN_ADDRESS>
npx hardhat verify --network sepolia <GAME_ADDRESS> <GOLD_TOKEN_ADDRESS>
```

### Frontend
```bash
cd frontend
npm install

# Add environment variables
echo "VITE_PRIVY_APP_ID=your_app_id" > .env
echo "VITE_GOLD_TOKEN_ADDRESS=0x..." >> .env
echo "VITE_GAME_CONTRACT_ADDRESS=0x..." >> .env

# Test locally
npm run dev

# Build for production
npm run build

# Deploy to Vercel
vercel
```

### Privy Configuration
- [ ] App created in dashboard
- [ ] Gas sponsorship enabled
- [ ] Spending limits configured
- [ ] Allowed domains added (localhost + vercel domain)

---

## 📦 Deliverables

1. **Smart Contracts**
   - GoldToken.sol (deployed + verified)
   - Game.sol (deployed + verified)
   - Contract addresses saved to frontend config

2. **Frontend Integration**
   - Privy provider configured
   - Wallet components built
   - Transaction hooks implemented
   - Leaderboard queries working

3. **Documentation**
   - Contract addresses documented
   - Privy setup guide
   - Integration instructions
   - Testing guide

---

## 🧪 Testing Guide

### Contract Testing
```bash
cd contracts
npx hardhat test

# Expected output:
# ✓ GoldToken: Should deploy correctly
# ✓ GoldToken: Should prevent unauthorized minting
# ✓ Game: Should sell resources correctly
# ✓ Game: Should emit Sold event
# ... (all tests passing)
```

### Manual Testing Flow
1. **Login:** Click "Connect Wallet" → Use email → Wallet created
2. **Mine:** Play game, collect 5 coal, 2 iron, 1 diamond
3. **Sell:** Click "Sell Resources" → Transaction sends → Success message
4. **Verify:** Check balance in UI (should show 21 GLD)
5. **Leaderboard:** Confirm address appears in leaderboard
6. **Repeat:** Sell again, verify balance increases

### Gas Sponsorship Verification
- Check Sepolia Etherscan
- Verify transaction sender is Paymaster
- Confirm user address in transaction logs
- Validate $0 cost to user

---

## 📚 Reference Links

- [Privy Documentation](https://docs.privy.io/)
- [Hardhat Guide](https://hardhat.org/getting-started/)
- [Viem Documentation](https://viem.sh/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Sepolia Etherscan](https://sepolia.etherscan.io/)

---

*End of Blockchain Integration PRD*

