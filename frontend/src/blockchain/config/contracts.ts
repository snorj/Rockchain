import GoldTokenABI from '../abis/GoldToken.json';
import GameV3ABI from '../abis/GameV3.json';
import PickaxeNFTV2ABI from '../abis/PickaxeNFTV2.json';
import GemNFTABI from '../abis/GemNFT.json';

// Contract addresses from deployment (Sepolia testnet) - Using GameV3 with per-second pricing
// Deployed: 2025-11-04 (Fixed session expiry bug)
export const GOLD_TOKEN_ADDRESS = '0x7EE178faA4FeD1D716eBdeB423867cb84921Eb8e' as const;
export const PICKAXE_NFT_ADDRESS = '0x59fA2CBE753383c489C813d567085C8dbDa3cf66' as const; // PickaxeNFTV2
export const GEM_NFT_ADDRESS = '0x8fa0fA6692acbFD470Af9f05bE9AFE9EAaa91e0E' as const;

// Game contract address - GameV3 with per-second pricing system (15s minimum)
export const GAME_ADDRESS = '0xB840812A335843723D135dBf73949cA12ec67E36' as const;

// Contract ABIs
export const GOLD_TOKEN_ABI = GoldTokenABI.abi;
export const GAME_ABI = GameV3ABI.abi;
export const PICKAXE_NFT_V2_ABI = PickaxeNFTV2ABI.abi;
export const GEM_NFT_ABI = GemNFTABI.abi;

// Chain configuration
export const SEPOLIA_CHAIN_ID = 11155111;
