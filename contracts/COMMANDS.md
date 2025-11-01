# Rockchain Contracts - Command Reference

Quick reference for all contract-related commands.

## 📦 Installation

```bash
cd contracts
npm install
```

## 🔨 Development

### Compile Contracts
```bash
npm run compile
```

### Run Tests
```bash
npm test
```

### Clean Build
```bash
npx hardhat clean
npm run compile
```

## 🚀 Deployment

### Deploy to Sepolia
```bash
npm run deploy:sepolia
```

### Verify on Etherscan
```bash
npm run verify:sepolia
```

### Run Local Node (for testing)
```bash
npm run node
```

## 🧪 Manual Testing with Cast

### Check Token Info
```bash
# Token name
cast call [GOLD_TOKEN_ADDRESS] "name()" --rpc-url https://rpc.sepolia.org

# Token symbol
cast call [GOLD_TOKEN_ADDRESS] "symbol()" --rpc-url https://rpc.sepolia.org

# Token decimals
cast call [GOLD_TOKEN_ADDRESS] "decimals()" --rpc-url https://rpc.sepolia.org
```

### Check Game Constants
```bash
# Coal value (should return 1)
cast call [GAME_ADDRESS] "COAL_VALUE()" --rpc-url https://rpc.sepolia.org

# Iron value (should return 3)
cast call [GAME_ADDRESS] "IRON_VALUE()" --rpc-url https://rpc.sepolia.org

# Diamond value (should return 10)
cast call [GAME_ADDRESS] "DIAMOND_VALUE()" --rpc-url https://rpc.sepolia.org
```

### Preview a Sale
```bash
# Preview: 5 coal, 2 iron, 1 diamond (should return 21)
cast call [GAME_ADDRESS] "previewSale(uint256,uint256,uint256)" 5 2 1 --rpc-url https://rpc.sepolia.org
```

### Check Player Balance
```bash
cast call [GOLD_TOKEN_ADDRESS] "balanceOf(address)" [PLAYER_ADDRESS] --rpc-url https://rpc.sepolia.org
```

### Check Player Earnings
```bash
cast call [GAME_ADDRESS] "getPlayerEarnings(address)" [PLAYER_ADDRESS] --rpc-url https://rpc.sepolia.org
```

### Check Total Sales
```bash
cast call [GAME_ADDRESS] "totalSales()" --rpc-url https://rpc.sepolia.org
```

## 📊 Event Queries

### Get All Sold Events
```bash
cast logs \
  --from-block 0 \
  --address [GAME_ADDRESS] \
  "Sold(address,uint256,uint256,uint256,uint256,uint256)" \
  --rpc-url https://rpc.sepolia.org
```

### Get TokensMinted Events
```bash
cast logs \
  --from-block 0 \
  --address [GOLD_TOKEN_ADDRESS] \
  "TokensMinted(address,uint256)" \
  --rpc-url https://rpc.sepolia.org
```

## 🔍 Etherscan Commands

### View Contract on Etherscan
```bash
# GoldToken
open "https://sepolia.etherscan.io/address/[GOLD_TOKEN_ADDRESS]#code"

# Game
open "https://sepolia.etherscan.io/address/[GAME_ADDRESS]#code"
```

### View Transaction
```bash
open "https://sepolia.etherscan.io/tx/[TX_HASH]"
```

## 🧹 Maintenance

### Clean Build Artifacts
```bash
npx hardhat clean
```

### Update Dependencies
```bash
npm update
```

### Check for Vulnerabilities
```bash
npm audit
```

## 🐛 Debugging

### Show Hardhat Accounts
```bash
npx hardhat accounts
```

### Get Network Info
```bash
npx hardhat node
```

### Run Specific Test
```bash
npx hardhat test test/GoldToken.test.ts
npx hardhat test test/Game.test.ts
```

### Run Tests with Gas Reporter
```bash
REPORT_GAS=true npm test
```

### Run Tests with Coverage
```bash
npx hardhat coverage
```

## 📝 Environment Variables

Required in `.env` (parent directory):

```bash
SEPOLIA_PRIVATE_KEY=0x...
ETHERSCAN_API_KEY=...
VITE_PRIVY_APP_ID=...
```

## 🔗 Useful Links

- Sepolia RPC: https://rpc.sepolia.org
- Sepolia Faucet: https://sepoliafaucet.com
- Sepolia Explorer: https://sepolia.etherscan.io
- Hardhat Docs: https://hardhat.org
- OpenZeppelin: https://docs.openzeppelin.com

## 💡 Tips

### Quick Deploy + Verify
```bash
npm run deploy:sepolia && npm run verify:sepolia
```

### Watch Test Mode
```bash
npx hardhat test --watch
```

### Get Contract Size
```bash
npx hardhat compile
npx hardhat size-contracts
```

---

**Note:** Replace `[GOLD_TOKEN_ADDRESS]`, `[GAME_ADDRESS]`, `[PLAYER_ADDRESS]`, and `[TX_HASH]` with actual values from your deployment.

