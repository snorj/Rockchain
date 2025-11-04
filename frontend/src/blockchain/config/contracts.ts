import GoldTokenABI from '../abis/GoldToken.json';
import GameV3ABI from '../abis/GameV3.json';
import PickaxeNFTV2ABI from '../abis/PickaxeNFTV2.json';
import GemNFTABI from '../abis/GemNFT.json';

// Contract addresses from deployment (Sepolia testnet) - Using GameV3
export const GOLD_TOKEN_ADDRESS = '0x6c4D595713e272C4dE42bfBEbA4717896651D336' as const;
export const PICKAXE_NFT_ADDRESS = '0x6a2b4e521c0AFbd11DeF5858760C32231810220E' as const; // PickaxeNFTV2
export const GEM_NFT_ADDRESS = '0x66ed8a577C21fC186273114C5Ebe447990B053B3' as const;

// Game contract address - GameV3 with per-minute pricing system
export const GAME_ADDRESS = '0x1B0aF9c6B419e4Fa9c3491865a79B082add6282c' as const;

// Contract ABIs
export const GOLD_TOKEN_ABI = GoldTokenABI.abi;
export const GAME_ABI = GameV3ABI.abi;
export const PICKAXE_NFT_V2_ABI = PickaxeNFTV2ABI.abi;
export const GEM_NFT_ABI = GemNFTABI.abi;

// Chain configuration
export const SEPOLIA_CHAIN_ID = 11155111;
