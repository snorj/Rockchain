import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Deployment script for Phase 1 & 2 (Pickaxe NFTs + Expanded Ores + Gems)
 * Deploys: GoldToken, PickaxeNFT, GemNFT, and Game contracts
 */
async function main() {
  console.log("🚀 Starting Phase 1 & 2 deployment to Sepolia...\n");

  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH\n");

  // Step 1: Deploy GoldToken
  console.log("⏳ [1/5] Deploying GoldToken...");
  const GoldToken = await ethers.getContractFactory("GoldToken");
  const goldToken = await GoldToken.deploy();
  await goldToken.waitForDeployment();
  const goldTokenAddress = await goldToken.getAddress();
  console.log("✅ GoldToken deployed to:", goldTokenAddress);

  // Step 2: Deploy PickaxeNFT
  console.log("\n⏳ [2/5] Deploying PickaxeNFT...");
  const PickaxeNFT = await ethers.getContractFactory("PickaxeNFT");
  const pickaxeNFT = await PickaxeNFT.deploy(goldTokenAddress);
  await pickaxeNFT.waitForDeployment();
  const pickaxeNFTAddress = await pickaxeNFT.getAddress();
  console.log("✅ PickaxeNFT deployed to:", pickaxeNFTAddress);

  // Step 3: Deploy GemNFT
  console.log("\n⏳ [3/5] Deploying GemNFT...");
  const GemNFT = await ethers.getContractFactory("GemNFT");
  const gemNFT = await GemNFT.deploy();
  await gemNFT.waitForDeployment();
  const gemNFTAddress = await gemNFT.getAddress();
  console.log("✅ GemNFT deployed to:", gemNFTAddress);

  // Step 4: Deploy Game contract
  console.log("\n⏳ [4/5] Deploying Game contract...");
  const Game = await ethers.getContractFactory("Game");
  const game = await Game.deploy(goldTokenAddress, pickaxeNFTAddress, gemNFTAddress);
  await game.waitForDeployment();
  const gameAddress = await game.getAddress();
  console.log("✅ Game contract deployed to:", gameAddress);

  // Step 5: Configure contracts
  console.log("\n⏳ [5/5] Configuring contracts...");
  
  // Grant MINTER_ROLE to Game contract
  console.log("   → Granting MINTER_ROLE to Game contract...");
  const minterTx = await goldToken.setMinter(gameAddress);
  await minterTx.wait();
  console.log("   ✅ MINTER_ROLE granted");

  // Set Game contract in PickaxeNFT
  console.log("   → Setting Game contract in PickaxeNFT...");
  const pickaxeGameTx = await pickaxeNFT.setGameContract(gameAddress);
  await pickaxeGameTx.wait();
  console.log("   ✅ Game contract set in PickaxeNFT");

  // Set Game contract in GemNFT
  console.log("   → Setting Game contract in GemNFT...");
  const gemGameTx = await gemNFT.setGameContract(gameAddress);
  await gemGameTx.wait();
  console.log("   ✅ Game contract set in GemNFT");

  // Verify the setup
  console.log("\n🔍 Verifying deployment...");
  const minterRole = await goldToken.MINTER_ROLE();
  const hasRole = await goldToken.hasRole(minterRole, gameAddress);
  console.log("✅ Game contract has MINTER_ROLE:", hasRole);
  
  const pickaxeGameContract = await pickaxeNFT.gameContract();
  console.log("✅ PickaxeNFT game contract:", pickaxeGameContract === gameAddress);
  
  const gemGameContract = await gemNFT.gameContract();
  console.log("✅ GemNFT game contract:", gemGameContract === gameAddress);

  // Save contract addresses
  const addresses = {
    goldToken: goldTokenAddress,
    pickaxeNFT: pickaxeNFTAddress,
    gemNFT: gemNFTAddress,
    game: gameAddress,
    chainId: 11155111,
    network: "sepolia",
    phase: "1-2",
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
  };

  // Save to contracts directory
  const contractsOutputPath = path.join(__dirname, "../deployed-addresses-phase1-2.json");
  fs.writeFileSync(contractsOutputPath, JSON.stringify(addresses, null, 2));
  console.log("\n📄 Addresses saved to:", contractsOutputPath);

  // Update frontend contracts.ts
  const contractsTsPath = path.join(__dirname, "../../frontend/src/blockchain/config/contracts.ts");
  if (fs.existsSync(contractsTsPath)) {
    let contractsContent = fs.readFileSync(contractsTsPath, "utf-8");
    
    // Update contract addresses
    contractsContent = contractsContent.replace(
      /export const GOLD_TOKEN_ADDRESS = '0x[a-fA-F0-9]{40}'/,
      `export const GOLD_TOKEN_ADDRESS = '${goldTokenAddress}'`
    );
    
    contractsContent = contractsContent.replace(
      /export const GAME_ADDRESS = '0x[a-fA-F0-9]{40}'/,
      `export const GAME_ADDRESS = '${gameAddress}'`
    );
    
    contractsContent = contractsContent.replace(
      /export const PICKAXE_NFT_ADDRESS = '0x[a-fA-F0-9]{40}'/,
      `export const PICKAXE_NFT_ADDRESS = '${pickaxeNFTAddress}'`
    );
    
    contractsContent = contractsContent.replace(
      /export const GEM_NFT_ADDRESS = '0x[a-fA-F0-9]{40}'/,
      `export const GEM_NFT_ADDRESS = '${gemNFTAddress}'`
    );
    
    fs.writeFileSync(contractsTsPath, contractsContent);
    console.log("✅ Contract addresses updated in frontend/src/blockchain/config/contracts.ts");
  }

  // Print summary
  console.log("\n" + "=".repeat(70));
  console.log("🎉 PHASE 1 & 2 DEPLOYMENT COMPLETE!");
  console.log("=".repeat(70));
  console.log("\n📋 Contract Addresses:");
  console.log("   GoldToken:   ", goldTokenAddress);
  console.log("   PickaxeNFT:  ", pickaxeNFTAddress);
  console.log("   GemNFT:      ", gemNFTAddress);
  console.log("   Game:        ", gameAddress);
  console.log("\n🔗 View on Etherscan:");
  console.log("   GoldToken:   ", `https://sepolia.etherscan.io/address/${goldTokenAddress}`);
  console.log("   PickaxeNFT:  ", `https://sepolia.etherscan.io/address/${pickaxeNFTAddress}`);
  console.log("   GemNFT:      ", `https://sepolia.etherscan.io/address/${gemNFTAddress}`);
  console.log("   Game:        ", `https://sepolia.etherscan.io/address/${gameAddress}`);
  console.log("\n✨ New Features:");
  console.log("   ⛏️  Pickaxe NFT System (5 tiers)");
  console.log("   💎 17 ore types with rarity tiers");
  console.log("   💍 Gem NFT drops on legendary ores");
  console.log("   🎮 Player character movement");
  console.log("\n📝 Next Steps:");
  console.log("   1. Verify contracts: npx hardhat verify --network sepolia <address>");
  console.log("   2. Test minting starter pickaxe");
  console.log("   3. Test mining different ore tiers");
  console.log("   4. Test gem drops on legendary ores");
  console.log("\n" + "=".repeat(70) + "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

