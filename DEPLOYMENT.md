# Rockchain Deployment Guide

Complete step-by-step guide for deploying Rockchain smart contracts to Sepolia testnet.

## ✅ Prerequisites Checklist

Before deploying, ensure you have:

- [ ] Node.js 18.x or 20.x installed
- [ ] Funded Sepolia wallet (get ETH from [Sepolia Faucet](https://sepoliafaucet.com/))
- [ ] Privy account created with App ID
- [ ] Etherscan account with API key
- [ ] `.env` file configured (see below)

## 🔐 Environment Setup

### 1. Configure .env File

Your `.env` file should contain:

```bash
# Blockchain Deployment
SEPOLIA_PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_KEY

# Frontend Configuration
VITE_PRIVY_APP_ID=YOUR_PRIVY_APP_ID
VITE_CHAIN_ID=11155111
VITE_GOLD_TOKEN_ADDRESS=    # Will be filled after deployment
VITE_GAME_CONTRACT_ADDRESS= # Will be filled after deployment
```

### 2. Get Sepolia Private Key

**From MetaMask:**
1. Click account menu → Account details
2. Click "Show private key"
3. Enter password
4. Copy private key
5. Add `0x` prefix if not present

**Security:** NEVER commit this to git! The `.gitignore` protects `.env` files.

### 3. Get Etherscan API Key

1. Go to [etherscan.io](https://etherscan.io)
2. Sign up / Log in
3. Navigate to: My Profile → API Keys
4. Click "Add" to create new key
5. Copy the API key

### 4. Get Sepolia ETH

You need ~0.02 ETH for deployment. Get from:
- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
- [QuickNode Faucet](https://faucet.quicknode.com/ethereum/sepolia)

## 📦 Installation

```bash
cd contracts
npm install
```

This installs:
- Hardhat
- OpenZeppelin contracts
- Ethers.js v6
- TypeScript tooling
- Testing libraries

## 🔨 Compilation

Before deploying, compile contracts to check for errors:

```bash
npm run compile
```

**Expected output:**
```
Compiled 2 Solidity files successfully
```

If you see warnings or errors, review the contract code.

## 🧪 Testing (Optional but Recommended)

Run the full test suite:

```bash
npm test
```

**Expected output:**
```
  GoldToken
    ✓ Should deploy with correct name and symbol
    ✓ Should prevent minting without MINTER_ROLE
    ... (14 tests)

  Game
    ✓ Should sell resources and mint correct GLD
    ✓ Should reject sale with 0 resources
    ... (18 tests)

  32 passing (2s)
```

All tests should pass before deployment.

## 🚀 Deployment

### Step 1: Deploy Contracts

```bash
npm run deploy:sepolia
```

**This script will:**
1. ✅ Deploy GoldToken contract
2. ✅ Deploy Game contract
3. ✅ Grant MINTER_ROLE to Game
4. ✅ Verify the role was granted
5. ✅ Save addresses to `deployed-addresses.json`
6. ✅ Update `.env` with contract addresses

**Expected output:**
```
🚀 Starting Rockchain deployment to Sepolia...

📝 Deploying contracts with account: 0x...
💰 Account balance: 0.05 ETH

⏳ Deploying GoldToken...
✅ GoldToken deployed to: 0x...

⏳ Deploying Game contract...
✅ Game contract deployed to: 0x...

⏳ Granting MINTER_ROLE to Game contract...
✅ MINTER_ROLE granted successfully

🔍 Verifying deployment...
✅ Game contract has MINTER_ROLE: true

📄 Addresses saved to: /path/to/deployed-addresses.json
✅ Contract addresses updated in .env

============================================================
🎉 DEPLOYMENT COMPLETE!
============================================================

📋 Contract Addresses:
   GoldToken: 0x...
   Game:      0x...

🔗 View on Etherscan:
   GoldToken: https://sepolia.etherscan.io/address/0x...
   Game:      https://sepolia.etherscan.io/address/0x...

📝 Next Steps:
   1. Verify contracts: npm run verify:sepolia
   2. Share addresses with frontend team
   3. Test selling: Try mining and selling resources

============================================================
```

### Step 2: Verify Contracts on Etherscan

```bash
npm run verify:sepolia
```

**This script will:**
1. ✅ Read addresses from `deployed-addresses.json`
2. ✅ Verify GoldToken on Etherscan
3. ✅ Verify Game contract on Etherscan

**Expected output:**
```
🔍 Starting contract verification on Etherscan...

⏳ Verifying GoldToken...
✅ GoldToken verified successfully

⏳ Verifying Game contract...
✅ Game contract verified successfully

============================================================
🎉 VERIFICATION COMPLETE!
============================================================

🔗 Verified Contracts:
   GoldToken: https://sepolia.etherscan.io/address/0x...#code
   Game:      https://sepolia.etherscan.io/address/0x...#code

============================================================
```

## ✅ Post-Deployment Checklist

After successful deployment:

### 1. Verify on Etherscan

Visit the Etherscan links and confirm:
- [ ] Source code is visible
- [ ] Contract is marked as verified (green checkmark)
- [ ] Read/Write contract functions are available
- [ ] Constructor arguments match (for Game contract)

### 2. Check Deployed Files

Verify these files were created/updated:

**contracts/deployed-addresses.json**
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

**Updated .env**
```bash
VITE_GOLD_TOKEN_ADDRESS=0x...
VITE_GAME_CONTRACT_ADDRESS=0x...
```

### 3. Test Smart Contracts

#### Test 1: Check GoldToken Name

```bash
cast call [GOLD_TOKEN_ADDRESS] "name()" --rpc-url https://rpc.sepolia.org
```

Expected: `Rockchain Gold`

#### Test 2: Check Game Has Minter Role

```bash
cast call [GOLD_TOKEN_ADDRESS] "hasRole(bytes32,address)" $(cast keccak "MINTER_ROLE") [GAME_ADDRESS] --rpc-url https://rpc.sepolia.org
```

Expected: `true`

#### Test 3: Preview a Sale

```bash
cast call [GAME_ADDRESS] "previewSale(uint256,uint256,uint256)" 5 2 1 --rpc-url https://rpc.sepolia.org
```

Expected: `21` (5 coal + 6 iron + 10 diamond)

### 4. Share with Frontend Team

Send the frontend team:

**Option A: Send deployed-addresses.json**
```bash
# File location
contracts/deployed-addresses.json
```

**Option B: Send environment variables**
```bash
VITE_GOLD_TOKEN_ADDRESS=0x...
VITE_GAME_CONTRACT_ADDRESS=0x...
VITE_CHAIN_ID=11155111
```

**Option C: Send ABIs**
```bash
# ABIs are located at:
contracts/artifacts/contracts/GoldToken.sol/GoldToken.json
contracts/artifacts/contracts/Game.sol/Game.json
```

## 🔧 Troubleshooting

### Issue: "insufficient funds for gas"

**Cause:** Not enough Sepolia ETH in wallet

**Solution:**
1. Visit [Sepolia Faucet](https://sepoliafaucet.com/)
2. Request 0.5 ETH
3. Wait for transaction to confirm
4. Retry deployment

### Issue: "invalid private key"

**Cause:** Private key format incorrect in `.env`

**Solution:**
1. Ensure private key starts with `0x`
2. Check for extra spaces or quotes
3. Format: `SEPOLIA_PRIVATE_KEY=0xabc123...`

### Issue: "network does not support ENS"

**Cause:** RPC endpoint issue

**Solution:**
- Hardhat config uses `https://rpc.sepolia.org`
- This is correct, error can be ignored
- Deployment should still succeed

### Issue: Verification fails with "Already Verified"

**Cause:** Contract was already verified in a previous attempt

**Solution:**
- This is fine! No action needed.
- Contract is already verified on Etherscan

### Issue: "Missing constructor arguments"

**Cause:** Verification script couldn't find deployed addresses

**Solution:**
1. Check `deployed-addresses.json` exists
2. Ensure you ran deployment first
3. Re-run deployment if file is missing

### Issue: Gas estimation failed

**Cause:** Transaction would fail (likely logic error)

**Solution:**
1. Run tests: `npm test`
2. Check all tests pass
3. Review error message for specific issue

## 🔄 Redeploying

If you need to redeploy (e.g., contract changes):

### 1. Save Old Addresses (Optional)

```bash
cp contracts/deployed-addresses.json contracts/deployed-addresses.backup.json
```

### 2. Deploy New Contracts

```bash
npm run deploy:sepolia
```

This creates new contract instances with new addresses.

### 3. Update Frontend

Notify frontend team of new addresses.

### 4. Verify New Contracts

```bash
npm run verify:sepolia
```

## 📊 Monitoring Deployment

### Check Recent Transactions

Visit your deployer wallet on Etherscan:
```
https://sepolia.etherscan.io/address/[YOUR_WALLET_ADDRESS]
```

You should see:
1. Contract creation (GoldToken)
2. Contract creation (Game)
3. Transaction (setMinter call)

### Check Contract State

**GoldToken:**
- Total supply should be 0 (no tokens minted yet)
- Name: "Rockchain Gold"
- Symbol: "GLD"
- Decimals: 18

**Game:**
- Total sales: 0
- Has MINTER_ROLE on GoldToken: true
- COAL_VALUE: 1
- IRON_VALUE: 3
- DIAMOND_VALUE: 10

## 🎉 Success Criteria

Your deployment is successful when:

- [x] Both contracts deployed without errors
- [x] Transaction hashes received for both
- [x] MINTER_ROLE granted successfully
- [x] Contracts verified on Etherscan (green checkmark)
- [x] `deployed-addresses.json` created
- [x] `.env` updated with contract addresses
- [x] All Etherscan links work
- [x] Source code visible on Etherscan
- [x] Test preview sale returns correct value

## 📚 Next Steps

After deployment is complete:

1. **Test End-to-End**
   - Wait for frontend integration
   - Test: Login → Mine → Sell → Check balance

2. **Monitor Transactions**
   - Watch for `Sold` events on Etherscan
   - Track total GLD minted
   - Monitor gas sponsorship costs in Privy dashboard

3. **Prepare for Mainnet** (Future)
   - Audit contracts (if needed)
   - Test on Sepolia extensively
   - Update deployment scripts for mainnet
   - Configure mainnet RPC and keys

## 🆘 Need Help?

If you encounter issues:

1. Check this guide's troubleshooting section
2. Review Hardhat documentation: https://hardhat.org/
3. Check Privy docs: https://docs.privy.io/
4. Verify Sepolia RPC is working: https://sepolia.dev/

---

**Deployment Guide Complete!** 🚀

Your smart contracts are now live on Sepolia and ready for frontend integration.

