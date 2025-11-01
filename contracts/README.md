# Rockchain Smart Contracts

Smart contracts for the Rockchain mining game - converts mined resources into on-chain GLD tokens.

## 📋 Overview

- **GoldToken.sol** - ERC-20 token representing in-game gold
- **Game.sol** - Core game logic for selling resources and minting GLD

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd contracts
npm install
```

### 2. Configure Environment

Ensure your `.env` file (in parent directory) has:

```bash
SEPOLIA_PRIVATE_KEY=0xYOUR_PRIVATE_KEY
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_KEY
VITE_PRIVY_APP_ID=YOUR_PRIVY_APP_ID
```

### 3. Compile Contracts

```bash
npm run compile
```

### 4. Run Tests

```bash
npm test
```

### 5. Deploy to Sepolia

```bash
npm run deploy:sepolia
```

This will:
- Deploy GoldToken
- Deploy Game contract
- Grant MINTER_ROLE to Game
- Save addresses to `deployed-addresses.json`
- Update parent `.env` file with contract addresses

### 6. Verify on Etherscan

```bash
npm run verify:sepolia
```

## 📁 Project Structure

```
contracts/
├── contracts/
│   ├── GoldToken.sol         # ERC-20 GLD token
│   └── Game.sol              # Mining game logic
├── scripts/
│   ├── deploy.ts             # Deployment script
│   └── verify.ts             # Etherscan verification
├── test/
│   ├── GoldToken.test.ts     # GoldToken tests
│   └── Game.test.ts          # Game contract tests
├── hardhat.config.ts         # Hardhat configuration
└── package.json              # Dependencies & scripts
```

## 🎮 Game Mechanics

### Resource Values

| Resource | GLD Value |
|----------|-----------|
| Coal     | 1 GLD     |
| Iron     | 3 GLD     |
| Diamond  | 10 GLD    |

### Example Transaction

Player mines:
- 5 coal
- 2 iron
- 1 diamond

Calculation: `(5 × 1) + (2 × 3) + (1 × 10) = 21 GLD`

Player calls: `Game.sellResources(5, 2, 1)`

Result: 21 GLD tokens minted to player's wallet

## 🔐 Smart Contract Details

### GoldToken.sol

**ERC-20 Token**
- Name: "Rockchain Gold"
- Symbol: "GLD"
- Decimals: 18
- Max Supply: Unlimited (minted on-demand)

**Key Functions:**
- `mint(address to, uint256 amount)` - Mint GLD (MINTER_ROLE only)
- `balanceOfGLD(address account)` - Get balance in GLD (not wei)
- `setMinter(address minter)` - Grant MINTER_ROLE (admin only)

### Game.sol

**Core Game Logic**

**Key Functions:**
- `sellResources(uint256 coal, uint256 iron, uint256 diamond)` - Sell resources for GLD
- `previewSale(uint256 coal, uint256 iron, uint256 diamond)` - Calculate GLD value
- `getPlayerEarnings(address player)` - Get total GLD earned by player

**Events:**
```solidity
event Sold(
    address indexed player,
    uint256 coal,
    uint256 iron,
    uint256 diamond,
    uint256 goldEarned,
    uint256 timestamp
);
```

## 🧪 Testing

### Run All Tests

```bash
npm test
```

### Test Coverage

- ✅ GoldToken: Deployment, access control, minting, helper functions
- ✅ Game: Deployment, selling resources, statistics, edge cases
- ✅ Integration: Full mining → selling → leaderboard flow

### Expected Output

```
  GoldToken
    ✓ Should deploy with correct name and symbol
    ✓ Should grant DEFAULT_ADMIN_ROLE to deployer
    ✓ Should allow admin to set minter
    ✓ Should allow minting with MINTER_ROLE
    ✓ Should emit TokensMinted event
    ... (14 tests)

  Game
    ✓ Should sell resources and mint correct GLD
    ✓ Should reject sale with 0 resources
    ✓ Should emit Sold event with correct data
    ✓ Should track player sales statistics
    ... (18 tests)

  32 passing
```

## 🌐 Deployment Information

After deploying, you'll find:

### deployed-addresses.json

```json
{
  "goldToken": "0x...",
  "game": "0x...",
  "chainId": 11155111,
  "network": "sepolia",
  "deployedAt": "2025-11-01T...",
  "deployer": "0x..."
}
```

### Updated .env

Contract addresses are automatically added:
```bash
VITE_GOLD_TOKEN_ADDRESS=0x...
VITE_GAME_CONTRACT_ADDRESS=0x...
```

## 🔗 Integration with Frontend

### 1. Share Contract Addresses

Provide the frontend team with:
- `deployed-addresses.json`
- Or the `VITE_*` values from `.env`

### 2. Export ABIs

ABIs are automatically generated in `artifacts/contracts/`:

```
artifacts/contracts/GoldToken.sol/GoldToken.json
artifacts/contracts/Game.sol/Game.json
```

### 3. Frontend Integration Example

```typescript
import { createPublicClient, createWalletClient } from 'viem';
import { sepolia } from 'viem/chains';
import GameABI from './artifacts/contracts/Game.sol/Game.json';

const GAME_ADDRESS = '0x...'; // From deployed-addresses.json

// Sell resources
await walletClient.writeContract({
  address: GAME_ADDRESS,
  abi: GameABI.abi,
  functionName: 'sellResources',
  args: [5n, 2n, 1n] // coal, iron, diamond
});
```

## 🎯 Gas Sponsorship

Users don't pay gas fees thanks to:
- **Privy Smart Wallets** (ERC-4337)
- **Paymaster** (Pimlico)
- **Kernel Account Abstraction**

Transactions are sponsored automatically via Privy's gas sponsorship feature.

## 🔍 Verification on Etherscan

After verification, your contracts will be:
- ✅ Source code visible
- ✅ Read/Write functions available
- ✅ Events and transactions trackable

View at:
- GoldToken: `https://sepolia.etherscan.io/address/[GOLD_TOKEN_ADDRESS]#code`
- Game: `https://sepolia.etherscan.io/address/[GAME_ADDRESS]#code`

## 📊 Monitoring

### Check Player Balance

```bash
cast call [GOLD_TOKEN_ADDRESS] "balanceOfGLD(address)" [PLAYER_ADDRESS] --rpc-url https://rpc.sepolia.org
```

### Check Total Sales

```bash
cast call [GAME_ADDRESS] "totalSales()" --rpc-url https://rpc.sepolia.org
```

### Query Recent Sales

```bash
cast logs --from-block 0 --address [GAME_ADDRESS] "Sold(address,uint256,uint256,uint256,uint256,uint256)" --rpc-url https://rpc.sepolia.org
```

## 🐛 Troubleshooting

### Deployment Fails

**Error: Insufficient funds**
```
Solution: Add more Sepolia ETH to your wallet
Get from: https://sepoliafaucet.com/
```

**Error: Invalid private key**
```
Solution: Check .env file has correct format:
SEPOLIA_PRIVATE_KEY=0xYOUR_KEY
```

### Verification Fails

**Error: Missing API key**
```
Solution: Add Etherscan API key to .env:
ETHERSCAN_API_KEY=YOUR_KEY
```

**Error: Already verified**
```
Solution: This is fine! Contract is already verified.
```

### Tests Fail

**Error: Cannot find module 'hardhat'**
```
Solution: Run npm install
```

## 🚀 Next Steps

After successful deployment:

1. ✅ Contracts deployed to Sepolia
2. ✅ Contracts verified on Etherscan
3. ✅ Addresses saved to `.env`
4. 📤 Share addresses with frontend team
5. 🎮 Frontend team integrates with Privy SDK
6. 🧪 Test end-to-end: mine → sell → check balance
7. 📊 Monitor leaderboard via `Sold` events

## 📚 Additional Resources

- [Privy Documentation](https://docs.privy.io/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Sepolia Testnet](https://sepolia.dev/)
- [Etherscan Sepolia](https://sepolia.etherscan.io/)

## 📝 License

MIT License - See LICENSE file for details

---

**Built by Peter Lonergan** | University of Sydney | Rockchain MVP

