import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Verifying Rockchain contract setup...\n");

  const GOLD_TOKEN_ADDRESS = "0xd25912Ab7898AA07820EdE883A2770f5374DEBfC";
  const GAME_ADDRESS = "0x2C8eAEaf2Df95c3a5f3b5792B0cbC19eD95D76d9";

  // Get contract instances
  const goldToken = await ethers.getContractAt("GoldToken", GOLD_TOKEN_ADDRESS);
  const game = await ethers.getContractAt("Game", GAME_ADDRESS);

  console.log("📋 Contract Addresses:");
  console.log("   GoldToken:", GOLD_TOKEN_ADDRESS);
  console.log("   Game:     ", GAME_ADDRESS);
  console.log();

  // Check MINTER_ROLE
  console.log("🔐 Checking MINTER_ROLE...");
  const MINTER_ROLE = await goldToken.MINTER_ROLE();
  console.log("   MINTER_ROLE:", MINTER_ROLE);
  
  const hasRole = await goldToken.hasRole(MINTER_ROLE, GAME_ADDRESS);
  console.log("   Game has MINTER_ROLE:", hasRole);
  
  if (!hasRole) {
    console.log("   ❌ ERROR: Game contract does NOT have MINTER_ROLE!");
    console.log("   This is why transactions are failing.");
    console.log("\n   To fix, run: npm run fix-minter-role");
  } else {
    console.log("   ✅ MINTER_ROLE is correctly set");
  }
  console.log();

  // Check token configuration
  console.log("🎮 Game Configuration:");
  const goldTokenInGame = await game.goldToken();
  console.log("   GoldToken address in Game:", goldTokenInGame);
  console.log("   Matches actual GoldToken:", goldTokenInGame === GOLD_TOKEN_ADDRESS);
  console.log();

  // Check resource values
  console.log("💎 Resource Values:");
  const coalValue = await game.COAL_VALUE();
  const ironValue = await game.IRON_VALUE();
  const diamondValue = await game.DIAMOND_VALUE();
  console.log("   Coal:   ", coalValue.toString(), "GLD");
  console.log("   Iron:   ", ironValue.toString(), "GLD");
  console.log("   Diamond:", diamondValue.toString(), "GLD");
  console.log();

  // Test preview function
  console.log("🧪 Testing preview (1 coal, 1 iron, 1 diamond):");
  const previewResult = await game.previewSale(1, 1, 1);
  console.log("   Expected GLD:", previewResult.toString());
  console.log();

  console.log("✅ Verification complete!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Verification failed:", error);
    process.exit(1);
  });

