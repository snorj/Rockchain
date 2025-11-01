import { useState } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { createWalletClient, custom } from 'viem';
import { sepolia } from 'viem/chains';
import { GAME_ABI, GAME_ADDRESS } from '../config/contracts';

/**
 * Hook for selling mined resources and minting GLD tokens
 */
export const useSellResources = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();

  const sellResources = async (coal: number, iron: number, diamond: number) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!authenticated) {
        throw new Error('Please connect your wallet first');
      }

      // Get the embedded wallet
      const embeddedWallet = wallets.find(
        (w) => w.walletClientType === 'privy'
      );

      if (!embeddedWallet) {
        throw new Error('No wallet found');
      }

      console.log('🔗 Selling resources:', { coal, iron, diamond });

      // Get EIP-1193 provider from Privy wallet
      const provider = await embeddedWallet.getEthereumProvider();

      // Create viem wallet client
      const walletClient = createWalletClient({
        account: embeddedWallet.address as `0x${string}`,
        chain: sepolia,
        transport: custom(provider),
      });

      // Call sellResources on Game contract
      const txHash = await walletClient.writeContract({
        address: GAME_ADDRESS,
        abi: GAME_ABI,
        functionName: 'sellResources',
        args: [BigInt(coal), BigInt(iron), BigInt(diamond)],
      });

      console.log('✅ Transaction sent:', txHash);
      console.log(`🔗 View on Etherscan: https://sepolia.etherscan.io/tx/${txHash}`);

      return txHash;
    } catch (err: any) {
      console.error('❌ Transaction failed:', err);
      const errorMessage = err.message || 'Transaction failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { sellResources, isLoading, error };
};

