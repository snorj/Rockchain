import { useState, useEffect } from 'react';
import { createPublicClient, http, formatEther } from 'viem';
import { sepolia } from 'viem/chains';
import { GOLD_TOKEN_ABI, GOLD_TOKEN_ADDRESS } from '../config/contracts';

/**
 * Hook for fetching GLD token balance for a wallet address
 */
export const useGoldBalance = (address?: string) => {
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(),
  });

  useEffect(() => {
    if (!address) {
      setBalance(0);
      setIsLoading(false);
      return;
    }

    const fetchBalance = async () => {
      try {
        const result = await publicClient.readContract({
          address: GOLD_TOKEN_ADDRESS,
          abi: GOLD_TOKEN_ABI,
          functionName: 'balanceOf',
          args: [address],
        });

        // Convert from wei to GLD (divide by 10^18)
        const balanceInGLD = Number(formatEther(result as bigint));
        setBalance(balanceInGLD);
      } catch (error) {
        console.error('Failed to fetch balance:', error);
        setBalance(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();

    // Poll every 10 seconds
    const interval = setInterval(fetchBalance, 10000);

    return () => clearInterval(interval);
  }, [address]);

  return { balance, isLoading };
};

