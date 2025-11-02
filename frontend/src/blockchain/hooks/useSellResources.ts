import { useState } from 'react';
import { usePrivy, useWallets, useSendTransaction } from '@privy-io/react-auth';
import { encodeFunctionData } from 'viem';
import { GAME_ABI, GAME_ADDRESS } from '../config/contracts';

/**
 * Hook for selling mined resources and minting GLD tokens
 * Uses Privy's useSendTransaction hook for gas-sponsored transactions
 */
export const useSellResources = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const { sendTransaction } = useSendTransaction();

  const sellResources = async (coal: number, iron: number, diamond: number) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!authenticated) {
        throw new Error('Please sign in first');
      }

      // Get the embedded wallet
      const embeddedWallet = wallets.find(
        (w) => w.walletClientType === 'privy'
      );

      if (!embeddedWallet) {
        throw new Error('No wallet found');
      }

      console.log('🔗 Selling resources:', { coal, iron, diamond });

      // Encode the contract call data
      const data = encodeFunctionData({
        abi: GAME_ABI,
        functionName: 'sellResources',
        args: [BigInt(coal), BigInt(iron), BigInt(diamond)],
      });

      console.log('📤 Sending gas-sponsored transaction...');
      console.log('🔍 Selling:', { coal, iron, diamond });
      console.log('🔍 From wallet:', embeddedWallet.address);

      // Use Privy's useSendTransaction with native gas sponsorship (TEE execution)
      // IMPORTANT: Gas sponsorship must be enabled in Privy Dashboard first!
      // See: https://docs.privy.io/wallets/gas-and-asset-management/gas/setup
      const txReceipt = await sendTransaction(
        {
          to: GAME_ADDRESS,
          data: data,
          value: 0, // No ETH being sent (number, not string)
        },
        {
          sponsor: true, // ✅ Enable native gas sponsorship
          header: 'Selling Resources',
          description: 'Converting your mined resources to GLD tokens',
          buttonText: 'Confirm Sale'
        }
      );

      console.log('✅ Transaction successful:', txReceipt);
      console.log(`🔗 View on Etherscan: https://sepolia.etherscan.io/tx/${txReceipt.transactionHash}`);

      return txReceipt.transactionHash;
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

