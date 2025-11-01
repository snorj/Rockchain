# Rockchain - Integration Guide

**Version:** 1.0  
**Date:** November 1, 2025  
**Purpose:** Guide for integrating Game Layer (PRD-1) with Blockchain Layer (PRD-2)

---

## 📋 Overview

This guide explains how the two development tracks (Game and Blockchain) integrate seamlessly into a complete application.

### Development Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    PARALLEL DEVELOPMENT                      │
├──────────────────────────────┬──────────────────────────────┤
│                              │                              │
│      GAME LAYER (Day 1)      │   BLOCKCHAIN LAYER (Day 2)  │
│                              │                              │
│  - Phaser.js setup           │  - Smart contracts          │
│  - Ore spawning/mining       │  - Privy integration        │
│  - Animations                │  - Transaction handling     │
│  - UI components             │  - Leaderboard queries      │
│  - Game state (Zustand)      │  - Wallet components        │
│  - MOCK sell function        │                              │
│                              │                              │
└──────────────────────────────┴──────────────────────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   INTEGRATION (1hr)  │
                    │                      │
                    │  - Replace mock sell │
                    │  - Add wallet UI     │
                    │  - Connect store     │
                    │  - Test end-to-end   │
                    └──────────────────────┘
```

---

## 🔌 Integration Points

### 1. Game Store Interface

The game layer exposes a Zustand store with methods for the blockchain layer to call:

**Location:** `frontend/src/store/gameStore.ts`

**Interface:**
```typescript
interface GameState {
  inventory: { coal: number; iron: number; diamond: number };
  
  // Game calls this when user clicks "Sell"
  onSellRequested: () => SellData;
  
  // Blockchain calls this after transaction completes
  onSellComplete: (success: boolean, txHash?: string) => void;
}

interface SellData {
  coal: number;
  iron: number;
  diamond: number;
  totalValue: number;
}
```

**How Game Layer Uses It:**
```typescript
// Game layer provides this
const sellData = useGameStore.getState().onSellRequested();
// Returns: { coal: 5, iron: 2, diamond: 1, totalValue: 21 }
```

**How Blockchain Layer Uses It:**
```typescript
// After successful transaction
useGameStore.getState().onSellComplete(true, '0xabc123...');

// After failed transaction
useGameStore.getState().onSellComplete(false);
```

---

### 2. Sell Button Component

**Location:** `frontend/src/components/UI/SellButton.tsx`

**Game Layer Implementation (Day 1):**
```typescript
const handleSell = async () => {
  const sellData = onSellRequested();
  
  // MOCK IMPLEMENTATION
  console.log('🔄 Mock sell:', sellData);
  await new Promise(resolve => setTimeout(resolve, 1000));
  onSellComplete(true, 'mock-tx-hash');
};
```

**Blockchain Layer Integration (Day 2):**
```typescript
import { useSellResources } from '@/blockchain/hooks/useSellResources';

const { sellResources, isLoading, error } = useSellResources();

const handleSell = async () => {
  const sellData = onSellRequested();
  
  try {
    // REAL BLOCKCHAIN CALL
    const txHash = await sellResources(
      sellData.coal,
      sellData.iron,
      sellData.diamond
    );
    onSellComplete(true, txHash);
  } catch (err) {
    onSellComplete(false);
  }
};
```

**Changes Required:**
1. Import `useSellResources` hook
2. Replace 3 lines in `handleSell` function
3. Add loading/error UI states

---

### 3. Leaderboard Component

**Location:** `frontend/src/components/UI/Leaderboard.tsx`

**Game Layer Implementation (Day 1):**
```typescript
// Mock data
const mockLeaderboard = [
  { rank: 1, address: '0x1234...5678', balance: 1250 },
  { rank: 2, address: '0xabcd...efgh', balance: 890 },
  // ...
];
```

**Blockchain Layer Integration (Day 2):**
```typescript
import { useLeaderboard } from '@/blockchain/hooks/useLeaderboard';

const { entries, isLoading } = useLeaderboard();

// Entries automatically populated from blockchain
// Format: [{ rank: 1, address: '0x...', balance: 1250 }, ...]
```

**Changes Required:**
1. Import `useLeaderboard` hook
2. Replace mock data with `entries` from hook
3. Add loading state UI

---

### 4. Wallet UI Components

**Game Layer:** Not implemented (out of scope)

**Blockchain Layer:** Implements these new components

**Components to Add:**
```
frontend/src/components/Web3/
├── PrivyProvider.tsx        # Wrap entire app
├── WalletButton.tsx         # Login/logout button (top-right)
└── WalletInfo.tsx           # Balance display (sidebar)
```

**Integration in Layout:**
```typescript
// frontend/src/components/Layout/GameLayout.tsx

import { WalletButton } from '@/components/Web3/WalletButton';
import { WalletInfo } from '@/components/Web3/WalletInfo';

export const GameLayout = ({ children }) => (
  <div className="game-layout">
    <header>
      <h1>Rockchain</h1>
      <WalletButton />  {/* ADD THIS */}
    </header>
    
    <main>
      <div className="game-area">{children}</div>
      
      <aside className="sidebar">
        <WalletInfo />  {/* ADD THIS */}
        <Leaderboard />
      </aside>
    </main>
  </div>
);
```

---

## 🔄 Integration Workflow

### Step-by-Step Integration

#### Step 1: Verify Game Layer Complete ✅

**Checklist:**
- [ ] Game runs on `localhost:5173`
- [ ] Can mine ores (click → animation → inventory update)
- [ ] Sell button works (mock)
- [ ] Inventory resets after sell
- [ ] No console errors

#### Step 2: Prepare Blockchain Layer ✅

**Checklist:**
- [ ] Smart contracts deployed to Sepolia
- [ ] Contract addresses saved to `frontend/src/blockchain/config/addresses.json`
- [ ] Privy app created and configured
- [ ] Environment variables set in `frontend/.env`

#### Step 3: Install Blockchain Dependencies

```bash
cd frontend
npm install @privy-io/react-auth viem
```

#### Step 4: Add Privy Provider

**File:** `frontend/src/main.tsx`

```typescript
import { PrivyProvider } from './components/Web3/PrivyProvider';

root.render(
  <PrivyProvider>
    <App />
  </PrivyProvider>
);
```

**Test:** Refresh app, no errors, Privy initializes.

#### Step 5: Update Sell Button

**File:** `frontend/src/components/UI/SellButton.tsx`

**Before:**
```typescript
const handleSell = async () => {
  const sellData = onSellRequested();
  await new Promise(resolve => setTimeout(resolve, 1000));
  onSellComplete(true, 'mock-tx-hash');
};
```

**After:**
```typescript
import { useSellResources } from '@/blockchain/hooks/useSellResources';
import { usePrivy } from '@privy-io/react-auth';

const { authenticated } = usePrivy();
const { sellResources, isLoading, error } = useSellResources();

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
    onSellComplete(true, txHash);
  } catch (err) {
    onSellComplete(false);
  }
};

// Update button
<button
  disabled={!hasOres || !authenticated || isLoading}
  onClick={handleSell}
>
  {isLoading ? 'Selling...' : `Sell Resources (${totalValue} GLD)`}
</button>
```

**Test:** Click sell without wallet → alert. Login → sell → transaction sends.

#### Step 6: Update Leaderboard

**File:** `frontend/src/components/UI/Leaderboard.tsx`

**Replace mock data:**
```typescript
import { useLeaderboard } from '@/blockchain/hooks/useLeaderboard';

const { entries, isLoading } = useLeaderboard();

if (isLoading) return <div>Loading...</div>;

return (
  <div className="leaderboard">
    {entries.map(entry => (
      <div key={entry.address}>
        #{entry.rank} {entry.address} - {entry.balance} GLD
      </div>
    ))}
  </div>
);
```

**Test:** Leaderboard populates with real on-chain data.

#### Step 7: Add Wallet UI

**File:** `frontend/src/components/Layout/GameLayout.tsx`

```typescript
import { WalletButton } from '@/components/Web3/WalletButton';
import { WalletInfo } from '@/components/Web3/WalletInfo';

// Add to header
<header>
  <h1>Rockchain</h1>
  <WalletButton />
</header>

// Add to sidebar
<aside>
  <WalletInfo />
  <Leaderboard />
</aside>
```

**Test:** Login button appears, click → Privy modal opens.

#### Step 8: End-to-End Testing

**Full Flow:**
1. Open app → see "Connect Wallet" button
2. Click → Privy modal opens
3. Login with email/Google
4. Wallet address displays in UI
5. Mine 5 ores (watch inventory increase)
6. Click "Sell Resources"
7. Transaction sends (check console for TX hash)
8. Wait 5-10 seconds
9. Inventory resets to 0
10. Balance in sidebar updates (+21 GLD)
11. Leaderboard refreshes, user appears in list

**Expected Result:** ✅ All steps work without errors

---

## 🐛 Troubleshooting

### Common Issues

#### Issue 1: "Privy is not configured"
**Cause:** Missing `VITE_PRIVY_APP_ID` in `.env`  
**Fix:** Add environment variable and restart dev server

#### Issue 2: "Contract call reverted"
**Cause:** Wrong contract address or ABI  
**Fix:** Verify `addresses.json` has correct Sepolia addresses

#### Issue 3: "Transaction failed: insufficient funds"
**Cause:** Gas sponsorship not enabled  
**Fix:** Enable Paymaster in Privy dashboard

#### Issue 4: Leaderboard empty
**Cause:** No players have sold resources yet  
**Fix:** Make a test sale, wait 30s for poll

#### Issue 5: Inventory doesn't reset after sell
**Cause:** `onSellComplete()` not called  
**Fix:** Ensure try/catch calls `onSellComplete` in both branches

---

## ✅ Integration Acceptance Criteria

### Functional
- [ ] User can login with Privy (email/social)
- [ ] Wallet creates automatically
- [ ] User can mine ores
- [ ] User can sell ores (transaction succeeds)
- [ ] Gas is sponsored ($0 cost to user)
- [ ] Inventory resets after successful sell
- [ ] Balance updates in UI
- [ ] Leaderboard shows real on-chain data
- [ ] User appears in leaderboard after selling

### Technical
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Game runs at 60 FPS
- [ ] Transactions confirm on Sepolia Etherscan
- [ ] Smart contracts verified on Etherscan

### UX
- [ ] Loading states display during transactions
- [ ] Error messages show when transactions fail
- [ ] Wallet address formatted nicely (0x1234...5678)
- [ ] Buttons disabled when appropriate
- [ ] Smooth transitions (no jarring UI changes)

---

## 📊 Testing Matrix

| Scenario | Expected Result | Actual Result |
|----------|----------------|---------------|
| Login with email | Wallet created, address displayed | ✅ |
| Login with Google | Wallet created, address displayed | ✅ |
| Sell with 0 ores | Button disabled | ✅ |
| Sell without wallet | Alert shown | ✅ |
| Sell with valid ores | Transaction succeeds, inventory resets | ✅ |
| Check balance after sell | Balance increased by correct amount | ✅ |
| Check leaderboard | User appears in list | ✅ |
| Logout and re-login | Same wallet restored | ✅ |
| Sell multiple times | Each transaction works | ✅ |
| Network error | Error message displayed | ✅ |

---

## 🎯 Final Verification

Before considering integration complete, verify:

1. **Both teams can work independently:**
   - Game team can develop without blockchain
   - Blockchain team can develop without game

2. **Integration is clean:**
   - Only 3 files changed (SellButton, Leaderboard, Layout)
   - No game logic modified
   - No breaking changes to game store

3. **Code quality:**
   - TypeScript with no `any` types
   - Proper error handling
   - Clean separation of concerns

4. **Documentation:**
   - All integration points documented
   - Contract addresses saved
   - Environment setup guide complete

---

## 📦 Post-Integration Checklist

After integration is complete:

- [ ] Update README.md with setup instructions
- [ ] Document contract addresses
- [ ] Add screenshots to docs
- [ ] Create demo video
- [ ] Deploy to Vercel
- [ ] Test on multiple browsers
- [ ] Share with friends for feedback
- [ ] Celebrate! 🎉

---

## 📞 Support

If integration issues arise:

1. Check both PRDs for interface specifications
2. Verify environment variables are set
3. Check console for error messages
4. Verify contracts deployed correctly
5. Test each layer independently

---

*This guide ensures smooth integration between Game Layer (PRD-1) and Blockchain Layer (PRD-2) for Rockchain.*

