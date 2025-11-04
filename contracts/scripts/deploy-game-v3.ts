import { ethers } from "hardhat";
import * as fs from 'fs';
import * as path from 'path';

/**
 * Deploy GameV3 with per-second pricing
 * Deploys fresh contracts: GoldToken, PickaxeNFTV2, GemNFT, GameV3
 */
async function main() {
  console.log('🚀 Deploying GameV3 with Per-Second Pricing System...\n');

  // Get deployer info
  const [deployer] = await ethers.getSigners();
  console.log('👤 Deploying from account:', deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log('💰 Account balance:', ethers.formatEther(balance), 'ETH\n');

  // 1. Deploy GoldToken
  console.log('📦 Deploying GoldToken...');
  const GoldToken = await ethers.getContractFactory("GoldToken");
  const goldToken = await GoldToken.deploy();
  await goldToken.waitForDeployment();
  const goldTokenAddress = await goldToken.getAddress();
  console.log('✅ GoldToken deployed to:', goldTokenAddress, '\n');

  // 2. Deploy PickaxeNFTV2 (with updated pricing)
  console.log('📦 Deploying PickaxeNFTV2 (updated pricing)...');
  const PickaxeNFTV2 = await ethers.getContractFactory("PickaxeNFTV2");
  const pickaxeNFT = await PickaxeNFTV2.deploy(goldTokenAddress);
  await pickaxeNFT.waitForDeployment();
  const pickaxeNFTAddress = await pickaxeNFT.getAddress();
  console.log('✅ PickaxeNFTV2 deployed to:', pickaxeNFTAddress, '\n');

  // 3. Deploy GemNFT
  console.log('📦 Deploying GemNFT...');
  const GemNFT = await ethers.getContractFactory("GemNFT");
  const gemNFT = await GemNFT.deploy(); // No constructor parameters
  await gemNFT.waitForDeployment();
  const gemNFTAddress = await gemNFT.getAddress();
  console.log('✅ GemNFT deployed to:', gemNFTAddress, '\n');

  // 4. Deploy GameV3
  console.log('📦 Deploying GameV3 (per-second pricing)...');
  const GameV3 = await ethers.getContractFactory("GameV3");
  const gameV3 = await GameV3.deploy(
    goldTokenAddress,
    pickaxeNFTAddress,
    gemNFTAddress
  );
  await gameV3.waitForDeployment();
  const gameV3Address = await gameV3.getAddress();
  console.log('✅ GameV3 deployed to:', gameV3Address, '\n');

  // 5. Set up permissions
  console.log('🔐 Setting up permissions...\n');
  
  // Grant MINTER_ROLE to GameV3 on GoldToken
  console.log('  → Granting MINTER_ROLE to GameV3...');
  const MINTER_ROLE = await goldToken.MINTER_ROLE();
  const grantTx = await goldToken.grantRole(MINTER_ROLE, gameV3Address);
  await grantTx.wait();
  console.log('  ✅ MINTER_ROLE granted to GameV3\n');

  // Set GameV3 as game contract on PickaxeNFTV2
  console.log('  → Setting GameV3 as game contract on PickaxeNFTV2...');
  const setGameTx = await pickaxeNFT.setGameContract(gameV3Address);
  await setGameTx.wait();
  console.log('  ✅ Game contract set on PickaxeNFTV2\n');

  // Set GameV3 as game contract on GemNFT
  console.log('  → Setting GameV3 as game contract on GemNFT...');
  const setGameTx2 = await gemNFT.setGameContract(gameV3Address);
  await setGameTx2.wait();
  console.log('  ✅ Game contract set on GemNFT\n');

  // 6. Save addresses
  const deployedAddresses = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    goldToken: goldTokenAddress,
    pickaxeNFT: pickaxeNFTAddress,
    pickaxeNFTVersion: 'V2',
    gemNFT: gemNFTAddress,
    game: gameV3Address,
    gameVersion: 'V3',
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    pricingModel: 'per-second',
    levelCosts: {
      level0: '0 GLD/sec (FREE)',
      level1: '7 GLD/sec (420/min)',
      level2: '40 GLD/sec (2400/min)',
      level3: '115 GLD/sec (6900/min)',
      level4: '300 GLD/sec (18000/min)'
    },
    purchaseRange: {
      minSeconds: 15,
      maxSeconds: 3600
    },
    pickaxeCosts: {
      wooden: 0,
      iron: 500,
      steel: 1500,
      mythril: 6000,
      adamantite: 20000
    }
  };

  const outputPath = path.join(__dirname, '../deployed-addresses-game-v3.json');
  fs.writeFileSync(outputPath, JSON.stringify(deployedAddresses, null, 2));
  console.log('📄 Addresses saved to:', outputPath, '\n');

  // 7. Print summary
  console.log('═══════════════════════════════════════════════════════');
  console.log('📊 DEPLOYMENT SUMMARY - GameV3 (Per-Second Pricing)');
  console.log('═══════════════════════════════════════════════════════\n');
  
  console.log('Network:', deployedAddresses.network);
  console.log('Chain ID:', deployedAddresses.chainId);
  console.log('Deployer:', deployer.address);
  console.log('');
  
  console.log('📝 Contract Addresses:');
  console.log('  GoldToken:', goldTokenAddress);
  console.log('  PickaxeNFTV2:', pickaxeNFTAddress);
  console.log('  GemNFT:', gemNFTAddress);
  console.log('  GameV3:', gameV3Address);
  console.log('');
  
  console.log('💰 Level Costs (per second):');
  console.log('  Level 0: FREE (unlimited)');
  console.log('  Level 1: 7 GLD/sec (420 GLD/min)');
  console.log('  Level 2: 40 GLD/sec (2,400 GLD/min)');
  console.log('  Level 3: 115 GLD/sec (6,900 GLD/min)');
  console.log('  Level 4: 300 GLD/sec (18,000 GLD/min)');
  console.log('');
  
  console.log('⏱️  Purchase Range:');
  console.log('  Minimum: 15 seconds');
  console.log('  Maximum: 3,600 seconds (60 minutes)');
  console.log('');
  
  console.log('⛏️  Pickaxe Costs:');
  console.log('  Wooden: FREE');
  console.log('  Iron: 500 GLD');
  console.log('  Steel: 1,500 GLD');
  console.log('  Mythril: 6,000 GLD');
  console.log('  Adamantite: 20,000 GLD');
  console.log('');
  
  console.log('✅ All contracts deployed and configured!');
  console.log('');
  
  console.log('📝 Next Steps:');
  console.log('1. Verify contracts on Etherscan:');
  console.log(`   npx hardhat verify --network sepolia ${goldTokenAddress}`);
  console.log(`   npx hardhat verify --network sepolia ${pickaxeNFTAddress} ${goldTokenAddress}`);
  console.log(`   npx hardhat verify --network sepolia ${gemNFTAddress}`);
  console.log(`   npx hardhat verify --network sepolia ${gameV3Address} ${goldTokenAddress} ${pickaxeNFTAddress} ${gemNFTAddress}`);
  console.log('');
  console.log('2. Update frontend contract addresses:');
  console.log('   - Copy addresses to frontend/src/blockchain/config/contracts.ts');
  console.log('   - Update to use GameV3 ABI');
  console.log('');
  console.log('3. Test the new system:');
  console.log('   - Mint starter pickaxe');
  console.log('   - Purchase 15-second session on Level 1');
  console.log('   - Verify timer countdown');
  console.log('   - Test different time increments');
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

