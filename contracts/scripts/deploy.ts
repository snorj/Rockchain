import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("🚀 Starting Rockchain deployment to Sepolia...\n");

  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH\n");

  // Deploy GoldToken
  console.log("⏳ Deploying GoldToken...");
  const GoldToken = await ethers.getContractFactory("GoldToken");
  const goldToken = await GoldToken.deploy();
  await goldToken.waitForDeployment();
  const goldTokenAddress = await goldToken.getAddress();
  console.log("✅ GoldToken deployed to:", goldTokenAddress);

  // Deploy Game
  console.log("\n⏳ Deploying Game contract...");
  const Game = await ethers.getContractFactory("Game");
  const game = await Game.deploy(goldTokenAddress);
  await game.waitForDeployment();
  const gameAddress = await game.getAddress();
  console.log("✅ Game contract deployed to:", gameAddress);

  // Grant minter role to Game contract
  console.log("\n⏳ Granting MINTER_ROLE to Game contract...");
  const tx = await goldToken.setMinter(gameAddress);
  await tx.wait();
  console.log("✅ MINTER_ROLE granted successfully");

  // Verify the setup
  console.log("\n🔍 Verifying deployment...");
  const minterRole = await goldToken.MINTER_ROLE();
  const hasRole = await goldToken.hasRole(minterRole, gameAddress);
  console.log("✅ Game contract has MINTER_ROLE:", hasRole);

  // Save contract addresses
  const addresses = {
    goldToken: goldTokenAddress,
    game: gameAddress,
    chainId: 11155111,
    network: "sepolia",
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
  };

  // Save to contracts directory
  const contractsOutputPath = path.join(__dirname, "../deployed-addresses.json");
  fs.writeFileSync(contractsOutputPath, JSON.stringify(addresses, null, 2));
  console.log("\n📄 Addresses saved to:", contractsOutputPath);

  // Save to parent .env file
  const envPath = path.join(__dirname, "../../.env");
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, "utf-8");
    
    // Update or add contract addresses
    if (envContent.includes("VITE_GOLD_TOKEN_ADDRESS=")) {
      envContent = envContent.replace(
        /VITE_GOLD_TOKEN_ADDRESS=.*/,
        `VITE_GOLD_TOKEN_ADDRESS=${goldTokenAddress}`
      );
    } else {
      envContent += `\nVITE_GOLD_TOKEN_ADDRESS=${goldTokenAddress}`;
    }
    
    if (envContent.includes("VITE_GAME_CONTRACT_ADDRESS=")) {
      envContent = envContent.replace(
        /VITE_GAME_CONTRACT_ADDRESS=.*/,
        `VITE_GAME_CONTRACT_ADDRESS=${gameAddress}`
      );
    } else {
      envContent += `\nVITE_GAME_CONTRACT_ADDRESS=${gameAddress}`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log("✅ Contract addresses updated in .env");
  }

  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("=".repeat(60));
  console.log("\n📋 Contract Addresses:");
  console.log("   GoldToken:", goldTokenAddress);
  console.log("   Game:     ", gameAddress);
  console.log("\n🔗 View on Etherscan:");
  console.log("   GoldToken:", `https://sepolia.etherscan.io/address/${goldTokenAddress}`);
  console.log("   Game:     ", `https://sepolia.etherscan.io/address/${gameAddress}`);
  console.log("\n📝 Next Steps:");
  console.log("   1. Verify contracts: npm run verify:sepolia");
  console.log("   2. Share addresses with frontend team");
  console.log("   3. Test selling: Try mining and selling resources");
  console.log("\n" + "=".repeat(60) + "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

