import GoldTokenABI from '../abis/GoldToken.json';
import GameABI from '../abis/Game.json';

// Contract addresses from deployment
export const GOLD_TOKEN_ADDRESS = '0xd25912Ab7898AA07820EdE883A2770f5374DEBfC' as const;
export const GAME_ADDRESS = '0x2C8eAEaf2Df95c3a5f3b5792B0cbC19eD95D76d9' as const;

// Contract ABIs
export const GOLD_TOKEN_ABI = GoldTokenABI.abi;
export const GAME_ABI = GameABI.abi;

// Chain configuration
export const SEPOLIA_CHAIN_ID = 11155111;

