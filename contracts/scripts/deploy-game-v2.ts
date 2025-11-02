import { ethers } from "hardhat";
import * as fs from 'fs';
import * as path from 'path';

/**
 * Deploy GameV2 contract
 * Requires existing GoldToken, PickaxeNFT, and GemNFT deployments
 */
async function main() {
  console.log('🚀 Deploying GameV2 contract...\n');

  // Load existing contract addresses
  const addressesPath = path.join(__dirname, '../deployed-addresses-phase1-2.json');
  
  if (!fs.existsSync(addressesPath)) {
    throw new Error('deployed-addresses-phase1-2.json not found. Deploy phase 1-2 contracts first.');
  }

  const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
  
  console.log('📋 Using existing contract addresses:');
  console.log(`   GoldToken: ${addresses.goldToken}`);
  console.log(`   PickaxeNFT: ${addresses.pickaxeNFT}`);
  console.log(`   GemNFT: ${addresses.gemNFT}\n`);

  // Get deployer info
  const [deployer] = await ethers.getSigners();
  console.log('👤 Deploying from account:', deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log('💰 Account balance:', ethers.formatEther(balance), 'ETH\n');

  // Deploy GameV2
  console.log('📦 Deploying GameV2...');
  const GameV2 = await ethers.getContractFactory("GameV2");
  const gameV2 = await GameV2.deploy(
    addresses.goldToken,
    addresses.pickaxeNFT,
    addresses.gemNFT
  );

  await gameV2.waitForDeployment();
  const gameV2Address = await gameV2.getAddress();
  
  console.log('✅ GameV2 deployed to:', gameV2Address);
  console.log('');

  // Grant MINTER_ROLE to GameV2 on GoldToken
  console.log('🔐 Granting MINTER_ROLE to GameV2...');
  const GoldToken = await ethers.getContractAt("GoldToken", addresses.goldToken);
  const MINTER_ROLE = await GoldToken.MINTER_ROLE();
  
  const grantTx = await GoldToken.grantRole(MINTER_ROLE, gameV2Address);
  await grantTx.wait();
  console.log('✅ MINTER_ROLE granted to GameV2\n');

  // Also approve GameV2 to spend tokens on behalf of the contract (for level purchases)
  console.log('💰 Setting up GoldToken allowances...');
  // Note: Players will need to approve GameV2 to spend their GLD tokens
  console.log('⚠️  Players need to approve GameV2 to spend GLD tokens for level purchases\n');

  // Save updated addresses
  const updatedAddresses = {
    ...addresses,
    gameV2: gameV2Address,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
  };

  const outputPath = path.join(__dirname, '../deployed-addresses-game-v2.json');
  fs.writeFileSync(outputPath, JSON.stringify(updatedAddresses, null, 2));
  console.log('📄 Addresses saved to:', outputPath);

  // Print summary
  console.log('\n📊 Deployment Summary:');
  console.log('═══════════════════════════════════════');
  console.log('Network:', (await ethers.provider.getNetwork()).name);
  console.log('Chain ID:', (await ethers.provider.getNetwork()).chainId);
  console.log('');
  console.log('Contract Addresses:');
  console.log('  GoldToken:', addresses.goldToken);
  console.log('  PickaxeNFT:', addresses.pickaxeNFT);
  console.log('  GemNFT:', addresses.gemNFT);
  console.log('  Game (V1):', addresses.game);
  console.log('  GameV2:', gameV2Address);
  console.log('');
  console.log('✅ GameV2 deployment complete!');
  console.log('');
  console.log('📝 Next steps:');
  console.log('1. Update frontend/src/blockchain/config/contracts.ts with GameV2 address');
  console.log('2. Update frontend to use GameV2 ABI and hooks');
  console.log('3. Test level access purchase flow');
  console.log('4. Verify contract on Etherscan:');
  console.log(`   npx hardhat verify --network sepolia ${gameV2Address} ${addresses.goldToken} ${addresses.pickaxeNFT} ${addresses.gemNFT}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

