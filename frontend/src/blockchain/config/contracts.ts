import GoldTokenABI from '../abis/GoldToken.json';
import GameABI from '../abis/Game.json';
import GameV2ABI from '../abis/GameV2.json';
import PickaxeNFTABI from '../abis/PickaxeNFT.json';
import GemNFTABI from '../abis/GemNFT.json';

// Contract addresses from deployment (Sepolia testnet)
export const GOLD_TOKEN_ADDRESS = '0xBc0E7e2E4FAf207993adF7f6A7c5E4606719f527' as const;
export const PICKAXE_NFT_ADDRESS = '0xDb2030F78d940F0057d2f6B877957BF68213D0D9' as const;
export const GEM_NFT_ADDRESS = '0x25FaD2bA87BdCD9E41fCa42b45c7a573506bFb73' as const;

// Game contract addresses (V1 and V2)
export const GAME_ADDRESS = '0x1916045204B3c9AA236c8f13918CdAbe1Ee61623' as const; // Legacy V1
export const GAME_V2_ADDRESS = '0xCB76BE68716D220D812fDDdD3465057cA4a14D4F' as const; // New V2 with level system

// Contract ABIs
export const GOLD_TOKEN_ABI = GoldTokenABI.abi;
export const GAME_ABI = GameABI.abi;
export const GAME_V2_ABI = GameV2ABI.abi;
export const PICKAXE_NFT_ABI = PickaxeNFTABI.abi;
export const GEM_NFT_ABI = GemNFTABI.abi;

// Chain configuration
export const SEPOLIA_CHAIN_ID = 11155111;
