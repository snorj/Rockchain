import GoldTokenABI from '../abis/GoldToken.json';
import GameV3ABI from '../abis/GameV3.json';
import PickaxeNFTV2ABI from '../abis/PickaxeNFTV2.json';
import GemNFTABI from '../abis/GemNFT.json';

// Contract addresses from deployment (Sepolia testnet) - Balanced Progression
// Deployed: 2025-11-04 (Updated pickaxe prices: 750, 7000, 52000, 380000 GLD)
export const GOLD_TOKEN_ADDRESS = '0xD28C2fb4cb36Dad49E05B80E3E8acD856171E26C' as const;
export const PICKAXE_NFT_ADDRESS = '0xE6Fe1C3B6Ba737925938d18F7a3a38B8AC2da4a3' as const; // PickaxeNFTV2
export const GEM_NFT_ADDRESS = '0x3Ef5e009FdEf2438d991368CF056aF1f35fe55C0' as const;

// Game contract address - GameV3 with 8x exponential economy (costs: 0, 8, 50, 420, 3500 per second)
export const GAME_ADDRESS = '0x0D1bf8420216af77F9f8E665fEd7eF57c35a98cB' as const;

// Contract ABIs
export const GOLD_TOKEN_ABI = GoldTokenABI.abi;
export const GAME_ABI = GameV3ABI.abi;
export const PICKAXE_NFT_V2_ABI = PickaxeNFTV2ABI.abi;
export const GEM_NFT_ABI = GemNFTABI.abi;

// Chain configuration
export const SEPOLIA_CHAIN_ID = 11155111;
