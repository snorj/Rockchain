/**
 * Interface that the blockchain layer must implement
 * This provides a clear contract for the blockchain team to follow
 * when integrating wallet functionality and smart contract interactions
 */
export interface BlockchainAdapter {
  /**
   * Sell resources and receive GLD tokens
   * @param coal - Amount of coal to sell
   * @param iron - Amount of iron to sell
   * @param diamond - Amount of diamond to sell
   * @returns Promise resolving to transaction hash
   */
  sellResources: (coal: number, iron: number, diamond: number) => Promise<string>;
  
  /**
   * Get the current player's GLD token balance
   * @returns Promise resolving to balance
   */
  getPlayerBalance: () => Promise<number>;
  
  /**
   * Check if wallet is connected
   * @returns true if wallet is connected
   */
  isWalletConnected: () => boolean;
  
  /**
   * Connect wallet (e.g., via Privy)
   * @returns Promise resolving to wallet address
   */
  connectWallet?: () => Promise<string>;
}

