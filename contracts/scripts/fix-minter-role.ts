import { ethers } from "hardhat";

async function main() {
  console.log("🔧 Fixing MINTER_ROLE setup...\n");

  const GOLD_TOKEN_ADDRESS = "0xd25912Ab7898AA07820EdE883A2770f5374DEBfC";
  const GAME_ADDRESS = "0x2C8eAEaf2Df95c3a5f3b5792B0cbC19eD95D76d9";

  const [signer] = await ethers.getSigners();
  console.log("📝 Using account:", signer.address);
  
  const balance = await ethers.provider.getBalance(signer.address);
  console.log("💰 Balance:", ethers.formatEther(balance), "ETH\n");

  // Get GoldToken contract
  const goldToken = await ethers.getContractAt("GoldToken", GOLD_TOKEN_ADDRESS);

  // Check if already has role
  const MINTER_ROLE = await goldToken.MINTER_ROLE();
  const hasRole = await goldToken.hasRole(MINTER_ROLE, GAME_ADDRESS);

  if (hasRole) {
    console.log("✅ Game already has MINTER_ROLE. Nothing to do!");
    return;
  }

  console.log("⏳ Granting MINTER_ROLE to Game contract...");
  console.log("   Game address:", GAME_ADDRESS);
  
  try {
    const tx = await goldToken.setMinter(GAME_ADDRESS);
    console.log("📤 Transaction sent:", tx.hash);
    console.log("⏳ Waiting for confirmation...");
    
    await tx.wait();
    console.log("✅ Transaction confirmed!");

    // Verify
    const nowHasRole = await goldToken.hasRole(MINTER_ROLE, GAME_ADDRESS);
    console.log("\n🔍 Verification:");
    console.log("   Game has MINTER_ROLE:", nowHasRole);

    if (nowHasRole) {
      console.log("\n🎉 SUCCESS! Game contract can now mint tokens.");
      console.log("   Players should now be able to sell resources.");
    } else {
      console.log("\n❌ ERROR: Role was not granted successfully.");
    }
  } catch (error: any) {
    console.error("\n❌ Failed to grant role:", error.message);
    console.error("\nPossible reasons:");
    console.error("   1. You don't have DEFAULT_ADMIN_ROLE");
    console.error("   2. Wrong network or RPC issues");
    console.error("   3. Insufficient gas");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });

