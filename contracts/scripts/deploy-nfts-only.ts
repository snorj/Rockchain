import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Deploy only PickaxeNFT and GemNFT contracts
 * Use this if GoldToken and Game are already deployed
 */
async function main() {
  console.log("🚀 Deploying NFT contracts to Sepolia...\n");

  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH\n");

  // Load existing addresses
  const deployedPath = path.join(__dirname, "../deployed-addresses.json");
  if (!fs.existsSync(deployedPath)) {
    throw new Error("deployed-addresses.json not found. Deploy base contracts first.");
  }

  const existingAddresses = JSON.parse(fs.readFileSync(deployedPath, "utf-8"));
  const goldTokenAddress = existingAddresses.goldToken;
  const gameAddress = existingAddresses.game;

  console.log("📍 Using existing contracts:");
  console.log("   GoldToken:", goldTokenAddress);
  console.log("   Game:     ", gameAddress);
  console.log();

  // Deploy PickaxeNFT
  console.log("⏳ [1/2] Deploying PickaxeNFT...");
  const PickaxeNFT = await ethers.getContractFactory("PickaxeNFT");
  const pickaxeNFT = await PickaxeNFT.deploy(goldTokenAddress);
  await pickaxeNFT.waitForDeployment();
  const pickaxeNFTAddress = await pickaxeNFT.getAddress();
  console.log("✅ PickaxeNFT deployed to:", pickaxeNFTAddress);

  // Deploy GemNFT
  console.log("\n⏳ [2/2] Deploying GemNFT...");
  const GemNFT = await ethers.getContractFactory("GemNFT");
  const gemNFT = await GemNFT.deploy();
  await gemNFT.waitForDeployment();
  const gemNFTAddress = await gemNFT.getAddress();
  console.log("✅ GemNFT deployed to:", gemNFTAddress);

  // Configure contracts
  console.log("\n⏳ Configuring NFT contracts...");
  
  console.log("   → Setting Game contract in PickaxeNFT...");
  const pickaxeGameTx = await pickaxeNFT.setGameContract(gameAddress);
  await pickaxeGameTx.wait();
  console.log("   ✅ Done");

  console.log("   → Setting Game contract in GemNFT...");
  const gemGameTx = await gemNFT.setGameContract(gameAddress);
  await gemGameTx.wait();
  console.log("   ✅ Done");

  // Save addresses
  const addresses = {
    ...existingAddresses,
    pickaxeNFT: pickaxeNFTAddress,
    gemNFT: gemNFTAddress,
    nftsDeployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(deployedPath, JSON.stringify(addresses, null, 2));
  console.log("\n📄 Addresses updated in:", deployedPath);

  // Update frontend contracts.ts
  const contractsTsPath = path.join(__dirname, "../../frontend/src/blockchain/config/contracts.ts");
  if (fs.existsSync(contractsTsPath)) {
    let contractsContent = fs.readFileSync(contractsTsPath, "utf-8");
    
    contractsContent = contractsContent.replace(
      /export const PICKAXE_NFT_ADDRESS = '0x[a-fA-F0-9]{40}'/,
      `export const PICKAXE_NFT_ADDRESS = '${pickaxeNFTAddress}'`
    );
    
    contractsContent = contractsContent.replace(
      /export const GEM_NFT_ADDRESS = '0x[a-fA-F0-9]{40}'/,
      `export const GEM_NFT_ADDRESS = '${gemNFTAddress}'`
    );
    
    fs.writeFileSync(contractsTsPath, contractsContent);
    console.log("✅ Frontend config updated");
  }

  console.log("\n" + "=".repeat(60));
  console.log("🎉 NFT CONTRACTS DEPLOYED!");
  console.log("=".repeat(60));
  console.log("\n📋 New Addresses:");
  console.log("   PickaxeNFT:", pickaxeNFTAddress);
  console.log("   GemNFT:    ", gemNFTAddress);
  console.log("\n⚠️  IMPORTANT: Update Game.sol constructor!");
  console.log("   You need to redeploy Game.sol with these NFT addresses.");
  console.log("\n" + "=".repeat(60) + "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

