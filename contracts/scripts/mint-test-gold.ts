import { ethers } from "hardhat";
import * as fs from 'fs';
import * as path from 'path';

/**
 * Mint test GLD tokens to a specified address
 * Usage: npx hardhat run scripts/mint-test-gold.ts --network sepolia
 */
async function main() {
  // Load deployed addresses
  const addressesPath = path.join(__dirname, '../deployed-addresses-game-v3.json');
  const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf-8'));
  
  console.log('🪙 Minting Test GLD Tokens\n');
  
  const [deployer] = await ethers.getSigners();
  console.log('👤 Deployer:', deployer.address);
  
  // Get target address from command line or use deployer
  const targetAddress = process.argv[2] || deployer.address;
  console.log('🎯 Target address:', targetAddress);
  
  // Connect to GoldToken
  const GoldToken = await ethers.getContractFactory("GoldToken");
  const goldToken = GoldToken.attach(addresses.goldToken);
  
  // Check current balance
  const currentBalance = await goldToken.balanceOf(targetAddress);
  console.log('💰 Current balance:', ethers.formatEther(currentBalance), 'GLD\n');
  
  // Amount to mint (10,000 GLD for testing)
  const amountToMint = ethers.parseEther("10000");
  
  console.log('🔐 Checking permissions...');
  
  // Check if deployer has admin role
  const DEFAULT_ADMIN_ROLE = await goldToken.DEFAULT_ADMIN_ROLE();
  const hasAdminRole = await goldToken.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);
  
  if (!hasAdminRole) {
    console.error('❌ Deployer does not have admin role!');
    process.exit(1);
  }
  
  // Grant MINTER_ROLE to deployer temporarily
  const MINTER_ROLE = await goldToken.MINTER_ROLE();
  const hasMinterRole = await goldToken.hasRole(MINTER_ROLE, deployer.address);
  
  if (!hasMinterRole) {
    console.log('📝 Granting MINTER_ROLE to deployer...');
    const grantTx = await goldToken.grantRole(MINTER_ROLE, deployer.address);
    await grantTx.wait();
    console.log('✅ MINTER_ROLE granted\n');
  } else {
    console.log('✅ Deployer already has MINTER_ROLE\n');
  }
  
  // Mint tokens
  console.log(`⛏️  Minting ${ethers.formatEther(amountToMint)} GLD...`);
  const mintTx = await goldToken.mint(targetAddress, amountToMint);
  const receipt = await mintTx.wait();
  
  console.log('✅ Minted successfully!');
  console.log('🔗 Transaction:', receipt?.hash);
  console.log(`🔗 Etherscan: https://sepolia.etherscan.io/tx/${receipt?.hash}\n`);
  
  // Check new balance
  const newBalance = await goldToken.balanceOf(targetAddress);
  console.log('💰 New balance:', ethers.formatEther(newBalance), 'GLD');
  console.log('📈 Increase:', ethers.formatEther(newBalance - currentBalance), 'GLD\n');
  
  console.log('✨ Done! You can now purchase mining sessions.');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

