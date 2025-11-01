# Rockchain Quick Start Guide

**Status:** Smart contracts complete ✅ | Frontend in development by separate team

## 🎯 What's Been Built

### ✅ Smart Contracts (Complete)
- **GoldToken.sol** - ERC-20 token for in-game gold
- **Game.sol** - Mining logic and resource conversion
- Comprehensive test suite (32 tests passing)
- Deployment scripts for Sepolia
- Verification scripts for Etherscan
- Full documentation

### 🚧 Frontend (Separate Branch)
- Being developed by another team
- Will integrate with contracts after deployment

## 🚀 Deploy Smart Contracts

### Prerequisites
- [ ] Node.js 18+ installed
- [ ] Funded Sepolia wallet (0.02+ ETH)
- [ ] Privy account with App ID ([privy.io](https://privy.io))
- [ ] Etherscan API key ([etherscan.io](https://etherscan.io))

### 1. Environment Setup

Copy `.env.example` to `.env` and fill in:

```bash
SEPOLIA_PRIVATE_KEY=0xYOUR_PRIVATE_KEY
ETHERSCAN_API_KEY=YOUR_KEY
VITE_PRIVY_APP_ID=YOUR_PRIVY_APP_ID
```

### 2. Install & Test

```bash
cd contracts
npm install
npm run compile
npm test
```

Expected: 32 tests passing ✅

### 3. Deploy

```bash
npm run deploy:sepolia
```

This will:
- Deploy GoldToken contract
- Deploy Game contract
- Grant minting permissions
- Save addresses to `.env` and `deployed-addresses.json`

### 4. Verify

```bash
npm run verify:sepolia
```

This makes your contracts visible on Etherscan with source code.

## 📋 After Deployment

You'll have:

1. **deployed-addresses.json** - Contract addresses and deployment info
2. **Updated .env** - Contract addresses added automatically
3. **Etherscan links** - View verified contracts

## 📤 Share with Frontend Team

Send them:
- `contracts/deployed-addresses.json`
- `contracts/artifacts/contracts/GoldToken.sol/GoldToken.json` (ABI)
- `contracts/artifacts/contracts/Game.sol/Game.json` (ABI)
- Link to `FRONTEND_INTEGRATION.md`

## 🎮 Game Flow

1. **Player logs in** → Privy creates smart wallet (no MetaMask needed)
2. **Player mines** → Collects coal, iron, diamond in-game
3. **Player sells** → Calls `Game.sellResources(coal, iron, diamond)`
4. **Contract mints GLD** → Player receives tokens (gas-free via Paymaster)
5. **Leaderboard updates** → Rankings based on GLD balance

## 💎 Resource Values

| Resource | GLD Value |
|----------|-----------|
| Coal     | 1 GLD     |
| Iron     | 3 GLD     |
| Diamond  | 10 GLD    |

**Example:** 5 coal + 2 iron + 1 diamond = 21 GLD

## 📚 Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Detailed deployment guide
- **[FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md)** - Frontend team guide
- **[contracts/README.md](contracts/README.md)** - Contract documentation
- **[context/PRD-2-Blockchain-Integration.md](context/PRD-2-Blockchain-Integration.md)** - Full PRD

## 🧪 Testing

### Smart Contract Tests
```bash
cd contracts
npm test
```

### Manual Testing (After Deployment)

Test contract calls using cast:

```bash
# Check token name
cast call [GOLD_TOKEN_ADDRESS] "name()" --rpc-url https://rpc.sepolia.org

# Preview a sale
cast call [GAME_ADDRESS] "previewSale(uint256,uint256,uint256)" 5 2 1 --rpc-url https://rpc.sepolia.org
```

## ⚠️ Important Notes

1. **Gas Sponsorship:** Enabled via Privy Paymaster - users pay $0 for transactions
2. **Network:** Deploy to Sepolia testnet only (for now)
3. **ABIs:** Auto-generated in `contracts/artifacts/` after compilation
4. **Security:** Never commit `.env` file (already gitignored)

## 🆘 Troubleshooting

**"Insufficient funds"**
→ Get more Sepolia ETH from [sepoliafaucet.com](https://sepoliafaucet.com/)

**"Invalid private key"**
→ Ensure format: `SEPOLIA_PRIVATE_KEY=0xYOUR_KEY` (with 0x prefix)

**"Verification failed"**
→ Check `ETHERSCAN_API_KEY` in `.env`

See [DEPLOYMENT.md](DEPLOYMENT.md) for more troubleshooting.

## 📊 Project Status

| Component | Status | Notes |
|-----------|--------|-------|
| Smart Contracts | ✅ Complete | Ready to deploy |
| Deployment Scripts | ✅ Complete | Automated deployment |
| Contract Tests | ✅ Complete | 32 tests passing |
| Documentation | ✅ Complete | Guides for all teams |
| Frontend | 🚧 In Progress | Separate team/branch |
| Integration | ⏳ Pending | After both complete |

## 🎉 Success Criteria

Deployment successful when:
- [ ] Both contracts deployed to Sepolia
- [ ] Contracts verified on Etherscan (green checkmark)
- [ ] `deployed-addresses.json` created
- [ ] `.env` updated with addresses
- [ ] Can view contracts on Etherscan with source code
- [ ] Test calls return expected values

## 🚀 Next Steps

1. ✅ Deploy contracts to Sepolia (you are here)
2. ⏳ Frontend team integrates with contracts
3. ⏳ End-to-end testing
4. ⏳ Deploy frontend to Vercel
5. ⏳ Launch MVP!

---

**Ready to deploy?** Run `npm test` in contracts folder, then `npm run deploy:sepolia`! 🎮

