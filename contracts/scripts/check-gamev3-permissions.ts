import { ethers } from "hardhat";

/**
 * Check if GameV3 has proper permissions to mint GLD tokens
 */
async function main() {
  console.log('🔍 Checking GameV3 permissions...\n');

  const GOLD_TOKEN_ADDRESS = "0x6c4D595713e272C4dE42bfBEbA4717896651D336";
  const GAME_V3_ADDRESS = "0x1B0aF9c6B419e4Fa9c3491865a79B082add6282c";

  const [signer] = await ethers.getSigners();
  console.log('👤 Using account:', signer.address);
  
  const balance = await ethers.provider.getBalance(signer.address);
  console.log('💰 Balance:', ethers.formatEther(balance), 'ETH\n');

  // Get GoldToken contract
  const goldToken = await ethers.getContractAt("GoldToken", GOLD_TOKEN_ADDRESS);

  // Check if GameV3 has MINTER_ROLE
  const MINTER_ROLE = await goldToken.MINTER_ROLE();
  const hasRole = await goldToken.hasRole(MINTER_ROLE, GAME_V3_ADDRESS);

  console.log('📋 Permission Status:');
  console.log('   GoldToken:', GOLD_TOKEN_ADDRESS);
  console.log('   GameV3:', GAME_V3_ADDRESS);
  console.log('   MINTER_ROLE hash:', MINTER_ROLE);
  console.log('   GameV3 has MINTER_ROLE:', hasRole ? '✅ YES' : '❌ NO');
  
  if (!hasRole) {
    console.log('\n❌ PROBLEM FOUND: GameV3 cannot mint tokens!');
    console.log('\n🔧 To fix this, run:');
    console.log('   npx hardhat run scripts/grant-gamev3-minter.ts --network sepolia');
  } else {
    console.log('\n✅ Permissions are correct!');
  }

  // Check if signer has admin role
  const DEFAULT_ADMIN_ROLE = await goldToken.DEFAULT_ADMIN_ROLE();
  const isAdmin = await goldToken.hasRole(DEFAULT_ADMIN_ROLE, signer.address);
  
  console.log('\n🔑 Your Admin Status:');
  console.log('   You have DEFAULT_ADMIN_ROLE:', isAdmin ? '✅ YES' : '❌ NO');
  
  if (!isAdmin && !hasRole) {
    console.log('\n⚠️  WARNING: You cannot grant roles without admin access!');
    console.log('   Contact the contract deployer to grant MINTER_ROLE.');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

