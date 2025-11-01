# Frontend Integration Guide

This guide helps the frontend team integrate Rockchain smart contracts with Privy and the game UI.

## 📦 What You Need

After smart contracts are deployed, you'll receive:

1. **Contract Addresses** (from `deployed-addresses.json` or `.env`):
   ```
   VITE_GOLD_TOKEN_ADDRESS=0x...
   VITE_GAME_CONTRACT_ADDRESS=0x...
   VITE_PRIVY_APP_ID=clp7x...
   VITE_CHAIN_ID=11155111
   ```

2. **Contract ABIs** (from `contracts/artifacts/`):
   - `GoldToken.json`
   - `Game.json`

## 🔧 Frontend Setup

### 1. Install Dependencies

```bash
npm install @privy-io/react-auth viem
```

### 2. Create Config Files

**src/blockchain/config/privyConfig.ts**
```typescript
import { PrivyClientConfig } from '@privy-io/react-auth';

export const privyConfig: PrivyClientConfig = {
  appId: import.meta.env.VITE_PRIVY_APP_ID,
  config: {
    loginMethods: ['email', 'google', 'twitter'],
    appearance: {
      theme: 'dark',
      accentColor: '#FFD700',
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

**src/blockchain/config/contracts.ts**
```typescript
import GoldTokenABI from './abis/GoldToken.json';
import GameABI from './abis/Game.json';

export const GOLD_TOKEN_ADDRESS = import.meta.env.VITE_GOLD_TOKEN_ADDRESS as `0x${string}`;
export const GAME_ADDRESS = import.meta.env.VITE_GAME_CONTRACT_ADDRESS as `0x${string}`;

export const GOLD_TOKEN_ABI = GoldTokenABI.abi;
export const GAME_ABI = GameABI.abi;
```

### 3. Wrap App with PrivyProvider

**src/App.tsx**
```typescript
import { PrivyProvider } from '@privy-io/react-auth';
import { privyConfig } from './blockchain/config/privyConfig';

function App() {
  return (
    <PrivyProvider appId={privyConfig.appId} config={privyConfig.config}>
      {/* Your game components */}
    </PrivyProvider>
  );
}
```

## 🎮 Core Integration Points

### 1. Wallet Login Button

**src/components/Web3/WalletButton.tsx**
```typescript
import { usePrivy, useWallets } from '@privy-io/react-auth';

export const WalletButton = () => {
  const { ready, authenticated, login, logout } = usePrivy();
  const { wallets } = useWallets();
  
  const embeddedWallet = wallets.find(w => w.walletClientType === 'privy');
  
  if (!ready) {
    return <button disabled>Loading...</button>;
  }
  
  if (!authenticated) {
    return (
      <button onClick={login} className="wallet-button">
        Connect Wallet
      </button>
    );
  }
  
  return (
    <div className="wallet-info">
      <span>{embeddedWallet?.address.slice(0, 6)}...{embeddedWallet?.address.slice(-4)}</span>
      <button onClick={logout}>Disconnect</button>
    </div>
  );
};
```

### 2. Sell Resources Hook

**src/blockchain/hooks/useSellResources.ts**
```typescript
import { useState } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { createWalletClient, custom } from 'viem';
import { sepolia } from 'viem/chains';
import { GAME_ABI, GAME_ADDRESS } from '../config/contracts';

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

### 3. Update SellButton Component

**src/components/UI/SellButton.tsx**
```typescript
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

### 4. GLD Balance Display

**src/blockchain/hooks/useGoldBalance.ts**
```typescript
import { useState, useEffect } from 'react';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { GOLD_TOKEN_ABI, GOLD_TOKEN_ADDRESS } from '../config/contracts';

export const useGoldBalance = (address?: string) => {
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http()
  });
  
  useEffect(() => {
    if (!address) {
      setBalance(0);
      setIsLoading(false);
      return;
    }
    
    const fetchBalance = async () => {
      try {
        const balance = await publicClient.readContract({
          address: GOLD_TOKEN_ADDRESS,
          abi: GOLD_TOKEN_ABI,
          functionName: 'balanceOf',
          args: [address]
        });
        
        setBalance(Number(balance) / 1e18);
      } catch (error) {
        console.error('Failed to fetch balance:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBalance();
    const interval = setInterval(fetchBalance, 10000); // Poll every 10s
    
    return () => clearInterval(interval);
  }, [address]);
  
  return { balance, isLoading };
};
```

**src/components/Web3/WalletInfo.tsx**
```typescript
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

### 5. Leaderboard Integration

**src/blockchain/hooks/useLeaderboard.ts**
```typescript
import { useState, useEffect } from 'react';
import { createPublicClient, http, parseAbiItem } from 'viem';
import { sepolia } from 'viem/chains';
import { GAME_ADDRESS, GOLD_TOKEN_ABI, GOLD_TOKEN_ADDRESS } from '../config/contracts';

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
          balance: Number(balance) / 1e18
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

**src/components/UI/Leaderboard.tsx**
```typescript
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

## 🧪 Testing Integration

### 1. Local Testing Checklist

- [ ] Privy login modal opens
- [ ] User can log in with email/Google
- [ ] Wallet address displays correctly
- [ ] GLD balance fetches and displays
- [ ] Sell button is enabled when inventory > 0
- [ ] Sell button is disabled when inventory = 0
- [ ] Clicking sell triggers transaction
- [ ] Loading state shows during transaction
- [ ] Success message appears after transaction
- [ ] Inventory resets to 0 after successful sale
- [ ] GLD balance increases after sale
- [ ] Leaderboard updates with new balance

### 2. End-to-End Test Flow

1. **Open app** → See login button
2. **Click login** → Privy modal opens
3. **Log in** → Wallet created automatically
4. **Mine ores** → Collect 5 coal, 2 iron, 1 diamond
5. **Click sell** → Transaction sends (gas sponsored)
6. **Wait** → Transaction confirms (~10-20 seconds on Sepolia)
7. **Check balance** → Shows 21 GLD
8. **Check leaderboard** → Your address appears with 21 GLD

### 3. Debugging Tips

**Problem: "No wallet connected"**
```
Solution: Ensure user is logged in via Privy
Check: usePrivy().authenticated === true
```

**Problem: "Transaction failed"**
```
Solution: Check browser console for error
Common causes:
- Privy gas sponsorship not enabled
- Contract address incorrect
- Network mismatch (not Sepolia)
```

**Problem: Balance doesn't update**
```
Solution: Wait 10-20 seconds for Sepolia confirmation
Check transaction on Etherscan
Verify polling interval is working
```

**Problem: Leaderboard empty**
```
Solution: Check that Sold events exist
Visit Game contract on Etherscan → Events tab
Ensure at least one sale has occurred
```

## 📦 Required Files Checklist

Before frontend can integrate, ensure you have:

- [ ] Contract addresses (GoldToken + Game)
- [ ] Privy App ID
- [ ] GoldToken.json (ABI)
- [ ] Game.json (ABI)
- [ ] This integration guide

## 🔗 Additional Resources

- [Privy React Auth Docs](https://docs.privy.io/guide/react/users/authentication)
- [Privy Embedded Wallets](https://docs.privy.io/guide/react/wallets/embedded)
- [Viem Documentation](https://viem.sh/)
- [Sepolia Testnet Explorer](https://sepolia.etherscan.io/)

## 🎉 Success Criteria

Frontend integration is complete when:

- ✅ Users can log in without MetaMask
- ✅ Wallets created automatically
- ✅ Sell transactions work end-to-end
- ✅ Gas is sponsored (users pay $0)
- ✅ GLD balance displays correctly
- ✅ Leaderboard shows top players
- ✅ All transactions visible on Sepolia Etherscan

---

**Questions?** Contact the blockchain team with your `deployed-addresses.json` file and any error messages.

