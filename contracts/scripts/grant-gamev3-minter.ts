import { ethers } from "hardhat";

/**
 * Grant MINTER_ROLE to GameV3 contract
 */
async function main() {
  console.log('🔧 Granting MINTER_ROLE to GameV3...\n');

  const GOLD_TOKEN_ADDRESS = "0x6c4D595713e272C4dE42bfBEbA4717896651D336";
  const GAME_V3_ADDRESS = "0x1B0aF9c6B419e4Fa9c3491865a79B082add6282c";

  const [signer] = await ethers.getSigners();
  console.log('👤 Using account:', signer.address);
  
  const balance = await ethers.provider.getBalance(signer.address);
  console.log('💰 Balance:', ethers.formatEther(balance), 'ETH\n');

  // Get GoldToken contract
  const goldToken = await ethers.getContractAt("GoldToken", GOLD_TOKEN_ADDRESS);

  // Check current status
  const MINTER_ROLE = await goldToken.MINTER_ROLE();
  const hasRole = await goldToken.hasRole(MINTER_ROLE, GAME_V3_ADDRESS);

  if (hasRole) {
    console.log('✅ GameV3 already has MINTER_ROLE. Nothing to do!');
    return;
  }

  console.log('⏳ Granting MINTER_ROLE to GameV3...');
  console.log('   GoldToken:', GOLD_TOKEN_ADDRESS);
  console.log('   GameV3:', GAME_V3_ADDRESS);
  
  try {
    const tx = await goldToken.grantRole(MINTER_ROLE, GAME_V3_ADDRESS);
    console.log('📤 Transaction sent:', tx.hash);
    console.log('⏳ Waiting for confirmation...');
    
    await tx.wait();
    console.log('✅ Transaction confirmed!');

    // Verify
    const nowHasRole = await goldToken.hasRole(MINTER_ROLE, GAME_V3_ADDRESS);
    console.log('\n🔍 Verification:');
    console.log('   GameV3 has MINTER_ROLE:', nowHasRole ? '✅ YES' : '❌ NO');

    if (nowHasRole) {
      console.log('\n🎉 SUCCESS! GameV3 can now mint GLD tokens.');
      console.log('   Players can now sell resources and earn gold!');
      console.log('\n🔗 View transaction on Etherscan:');
      console.log(`   https://sepolia.etherscan.io/tx/${tx.hash}`);
    } else {
      console.log('\n❌ ERROR: Role was not granted successfully.');
    }
  } catch (error: any) {
    console.error('\n❌ Failed to grant role:', error.message);
    console.error('\nPossible reasons:');
    console.error('   1. You don\'t have DEFAULT_ADMIN_ROLE');
    console.error('   2. Wrong network or RPC issues');
    console.error('   3. Insufficient gas');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

