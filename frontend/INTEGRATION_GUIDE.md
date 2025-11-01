# Blockchain Integration Guide

This guide explains how to integrate blockchain functionality (wallet, smart contracts) with the game layer.

## 🎯 Overview

The game is **fully functional** without blockchain and can be tested independently. All blockchain integration points are clearly marked with comments and mock implementations.

## 📦 What's Already Built

- ✅ Complete game loop (mine → collect → sell)
- ✅ Local state management (Zustand)
- ✅ Mock sell functionality
- ✅ Clear interfaces for blockchain layer
- ✅ UI components ready for wallet integration

## 🔌 Integration Points

### 1. Game State Access

The game exposes a Zustand store that you can access anywhere:

```typescript
import { useGameStore } from './store/gameStore';

// In a React component
const { inventory, onSellRequested, onSellComplete } = useGameStore();

// Outside React (e.g., in event handlers)
const sellData = useGameStore.getState().onSellRequested();
const addOre = useGameStore.getState().addOre;
```

### 2. Replace Mock Sell Function

**File**: `src/components/UI/SellButton.tsx`

**Current mock implementation (lines ~30-45)**:
```typescript
const handleSell = async () => {
  if (!hasOres || isSelling) return;
  
  setIsSelling(true);
  const data = onSellRequested();
  
  console.log('🔄 Sell requested:', data);
  
  try {
    // FOR MVP: Mock sell transaction
    // BLOCKCHAIN TEAM: Replace this with actual smart contract call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate successful transaction
    onSellComplete(true, 'mock-tx-hash-' + Date.now());
    
    console.log('✅ Sell completed successfully!');
  } catch (error) {
    console.error('❌ Sell failed:', error);
    onSellComplete(false);
  } finally {
    setIsSelling(false);
  }
};
```

**Replace with blockchain implementation**:
```typescript
import { usePrivy } from '@privy-io/react-auth';
import { useYourSmartContract } from '../hooks/useSmartContract'; // Your hook

const handleSell = async () => {
  if (!hasOres || isSelling) return;
  
  setIsSelling(true);
  const data = onSellRequested();
  
  console.log('🔄 Sell requested:', data);
  
  try {
    // Call your smart contract
    const txHash = await sellResources({
      coal: data.coal,
      iron: data.iron,
      diamond: data.diamond
    });
    
    // Wait for transaction confirmation
    await waitForTransaction(txHash);
    
    // Update game state
    onSellComplete(true, txHash);
    
    console.log('✅ Sell completed successfully!', txHash);
  } catch (error) {
    console.error('❌ Sell failed:', error);
    onSellComplete(false);
  } finally {
    setIsSelling(false);
  }
};
```

### 3. Add Wallet Connection UI

**Create a new component**: `src/components/UI/WalletButton.tsx`

```typescript
import { usePrivy } from '@privy-io/react-auth';

export const WalletButton = () => {
  const { login, logout, ready, authenticated, user } = usePrivy();

  if (!ready) {
    return <div>Loading...</div>;
  }

  return (
    <div className="wallet-button-container">
      {authenticated ? (
        <div>
          <p>Connected: {user?.wallet?.address?.slice(0, 6)}...{user?.wallet?.address?.slice(-4)}</p>
          <button onClick={logout}>Disconnect</button>
        </div>
      ) : (
        <button onClick={login}>Connect Wallet</button>
      )}
    </div>
  );
};
```

**Add to layout**: In `src/components/Layout/GameLayout.tsx`, add:
```typescript
import { WalletButton } from '../UI/WalletButton';

// In the header section
<header className="game-header">
  <h1 className="game-logo">⛏️ ROCKCHAIN</h1>
  <WalletButton /> {/* Add here */}
  <p className="game-subtitle">Mine. Collect. Earn.</p>
</header>
```

### 4. Blockchain Adapter Interface

**File**: `src/types/blockchain.types.ts`

Implement this interface in your blockchain layer:

```typescript
export interface BlockchainAdapter {
  sellResources: (coal: number, iron: number, diamond: number) => Promise<string>;
  getPlayerBalance: () => Promise<number>;
  isWalletConnected: () => boolean;
  connectWallet?: () => Promise<string>;
}
```

### 5. Smart Contract Integration

**Create hook**: `src/hooks/useRockchainContract.ts`

```typescript
import { useContract } from 'wagmi'; // or your preferred library
import { ROCKCHAIN_CONTRACT_ABI, ROCKCHAIN_CONTRACT_ADDRESS } from '../config/contracts';

export function useRockchainContract() {
  const contract = useContract({
    address: ROCKCHAIN_CONTRACT_ADDRESS,
    abi: ROCKCHAIN_CONTRACT_ABI
  });

  const sellResources = async ({ coal, iron, diamond }: SellData) => {
    // Call your smart contract's sell function
    const tx = await contract.write.sellResources([coal, iron, diamond]);
    return tx.hash;
  };

  const getBalance = async () => {
    const balance = await contract.read.balanceOf([userAddress]);
    return balance;
  };

  return { sellResources, getBalance };
}
```

### 6. Add Privy Provider

**File**: `src/main.tsx`

```typescript
import { PrivyProvider } from '@privy-io/react-auth';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PrivyProvider
      appId="your-privy-app-id"
      config={{
        loginMethods: ['wallet', 'email'],
        appearance: {
          theme: 'dark',
          accentColor: '#ffcc00',
        },
      }}
    >
      <App />
    </PrivyProvider>
  </React.StrictMode>
);
```

### 7. Gas Sponsorship (Optional)

If implementing gas-less transactions:

```typescript
import { usePrivy } from '@privy-io/react-auth';

const { signTransaction } = usePrivy();

// Use meta-transaction or gas relay
const sponsoredTx = await relayTransaction({
  from: userAddress,
  to: contractAddress,
  data: encodedFunction,
  gasless: true
});
```

## 🎮 Game Events You Can Hook Into

The game emits events that you might want to track on-chain or analytics:

```typescript
// Listen to Phaser scene events (in a React component)
useEffect(() => {
  const game = gameRef.current;
  if (!game) return;

  const miningScene = game.scene.getScene('MiningScene');
  
  miningScene.events.on('ore-mined', (data) => {
    console.log('Ore mined:', data);
    // Track on-chain or analytics
  });

  return () => {
    miningScene.events.off('ore-mined');
  };
}, []);
```

## 📊 Data Flow

```
User clicks ore
    ↓
Phaser animation plays
    ↓
Event emitted: 'ore-mined'
    ↓
Zustand store updated (addOre)
    ↓
React UI re-renders (inventory count)
    ↓
User clicks "Sell Resources"
    ↓
onSellRequested() → returns SellData
    ↓
[YOUR BLOCKCHAIN CODE HERE]
    ↓
Smart contract called
    ↓
Transaction confirmed
    ↓
onSellComplete(true, txHash)
    ↓
Inventory reset, UI updated
```

## 🧪 Testing Blockchain Integration

1. **Keep mock mode**: Add a toggle to switch between mock and real blockchain
2. **Test with testnet first**: Base Sepolia or your preferred testnet
3. **Handle errors gracefully**: Network issues, rejected transactions, insufficient gas
4. **Add loading states**: Transaction pending, confirming, etc.

```typescript
const [useRealBlockchain, setUseRealBlockchain] = useState(false);

const handleSell = async () => {
  if (useRealBlockchain) {
    // Real blockchain logic
  } else {
    // Mock logic (current implementation)
  }
};
```

## 📋 Checklist for Blockchain Team

- [ ] Install Privy SDK: `npm install @privy-io/react-auth`
- [ ] Install wagmi/viem: `npm install wagmi viem`
- [ ] Create `.env.local` with API keys
- [ ] Wrap app in PrivyProvider
- [ ] Create WalletButton component
- [ ] Implement smart contract hooks
- [ ] Replace mock sell in SellButton.tsx
- [ ] Add transaction confirmation UI
- [ ] Test on testnet
- [ ] Implement error handling
- [ ] Add gas sponsorship (if needed)
- [ ] Deploy to mainnet

## 🔗 Useful References

- **Privy Docs**: https://docs.privy.io/
- **Base Docs**: https://docs.base.org/
- **Viem Docs**: https://viem.sh/
- **Wagmi Docs**: https://wagmi.sh/

## 🆘 Support

If you need help with game-blockchain integration:
1. Check `src/store/gameStore.ts` for available state/actions
2. Look at `src/types/` for interfaces
3. Refer to `TESTING.md` for expected behavior
4. The game layer is completely isolated - you can't break it!

