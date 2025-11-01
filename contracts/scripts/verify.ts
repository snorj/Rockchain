import { run } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("🔍 Starting contract verification on Etherscan...\n");

  // Load deployed addresses
  const addressesPath = path.join(__dirname, "../deployed-addresses.json");
  
  if (!fs.existsSync(addressesPath)) {
    console.error("❌ deployed-addresses.json not found!");
    console.error("Please run deployment first: npm run deploy:sepolia");
    process.exit(1);
  }

  const addresses = JSON.parse(fs.readFileSync(addressesPath, "utf-8"));

  // Verify GoldToken
  console.log("⏳ Verifying GoldToken...");
  try {
    await run("verify:verify", {
      address: addresses.goldToken,
      constructorArguments: [],
    });
    console.log("✅ GoldToken verified successfully");
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ GoldToken already verified");
    } else {
      console.error("❌ GoldToken verification failed:", error.message);
    }
  }

  // Verify Game
  console.log("\n⏳ Verifying Game contract...");
  try {
    await run("verify:verify", {
      address: addresses.game,
      constructorArguments: [addresses.goldToken],
    });
    console.log("✅ Game contract verified successfully");
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ Game contract already verified");
    } else {
      console.error("❌ Game contract verification failed:", error.message);
    }
  }

  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log("🎉 VERIFICATION COMPLETE!");
  console.log("=".repeat(60));
  console.log("\n🔗 Verified Contracts:");
  console.log("   GoldToken:", `https://sepolia.etherscan.io/address/${addresses.goldToken}#code`);
  console.log("   Game:     ", `https://sepolia.etherscan.io/address/${addresses.game}#code`);
  console.log("\n" + "=".repeat(60) + "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Verification failed:", error);
    process.exit(1);
  });

