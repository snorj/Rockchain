import { useState, useEffect } from 'react';
import { usePrivy, useWallets, useSendTransaction } from '@privy-io/react-auth';
import { createPublicClient, http, encodeFunctionData } from 'viem';
import { sepolia } from 'viem/chains';
import { GAME_V2_ABI, GAME_V2_ADDRESS } from '../config/contracts';
import type { LevelId } from '../../game/config/levels';
import { LEVELS } from '../../game/config/levels';

/**
 * Hook for managing level access system
 * Handles purchasing level access and checking access status
 */
export const useLevelAccess = (address?: string) => {
  const [levelAccess, setLevelAccess] = useState<Record<LevelId, number>>({
    1: 0, // Level 1 always free
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const { sendTransaction } = useSendTransaction();
  
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(),
  });
  
  /**
   * Fetch level access status for all levels
   */
  const fetchLevelAccess = async () => {
    if (!address) {
      setLevelAccess({
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      });
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Check access for levels 2-5 (level 1 is always free)
      const accessChecks = await Promise.all(
        [2, 3, 4, 5].map(async (level) => {
          try {
            const result = await publicClient.readContract({
              address: GAME_V2_ADDRESS,
              abi: GAME_V2_ABI,
              functionName: 'checkLevelAccess',
              args: [address, level - 1], // Contract uses 0-indexed levels
            }) as [boolean, bigint];
            
            const [hasAccess, expiresAt] = result;
            
            // Convert expiry timestamp from seconds to milliseconds
            const expiryMs = Number(expiresAt) * 1000;
            
            return {
              level: level as LevelId,
              expiry: hasAccess && expiryMs > 0 ? expiryMs : 0,
            };
          } catch (err) {
            console.error(`Failed to check level ${level} access:`, err);
            return { level: level as LevelId, expiry: 0 };
          }
        })
      );
      
      const newAccess: Record<LevelId, number> = {
        1: 0, // Always free
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      };
      
      accessChecks.forEach(({ level, expiry }) => {
        newAccess[level] = expiry;
      });
      
      setLevelAccess(newAccess);
    } catch (err) {
      console.error('Failed to fetch level access:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchLevelAccess();
    
    // Poll every 30 seconds
    const interval = setInterval(fetchLevelAccess, 30000);
    return () => clearInterval(interval);
  }, [address]);
  
  /**
   * Purchase access to a level
   */
  const purchaseLevelAccess = async (level: LevelId) => {
    if (level === 1) {
      throw new Error('Level 1 is always free');
    }
    
    if (!authenticated) {
      throw new Error('Please sign in first');
    }
    
    const embeddedWallet = wallets.find(
      (w) => w.walletClientType === 'privy'
    );
    
    if (!embeddedWallet) {
      throw new Error('No wallet found');
    }
    
    setIsPurchasing(true);
    setError(null);
    
    try {
      const levelConfig = LEVELS[level];
      console.log(`🏔️ Purchasing access to Level ${level} (${levelConfig.name})...`);
      console.log(`💰 Cost: ${levelConfig.accessCost} GLD`);
      console.log(`⏰ Duration: ${levelConfig.duration / 60} minutes`);
      
      // Encode the contract call
      const data = encodeFunctionData({
        abi: GAME_V2_ABI,
        functionName: 'purchaseLevelAccess',
        args: [level - 1], // Contract uses 0-indexed levels
      });
      
      // Send transaction with gas sponsorship
      const txReceipt = await sendTransaction(
        {
          to: GAME_V2_ADDRESS,
          data: data,
          value: 0,
        },
        {
          sponsor: true,
          header: `Unlock ${levelConfig.name}`,
          description: `Get ${levelConfig.duration / 60} minutes of access for ${levelConfig.accessCost} GLD`,
          buttonText: 'Purchase Access',
        }
      );
      
      console.log('✅ Level access purchased:', txReceipt);
      console.log(`🔗 View on Etherscan: https://sepolia.etherscan.io/tx/${txReceipt.hash}`);
      
      // Calculate expiry time
      const expiryTime = Date.now() + (levelConfig.duration * 1000);
      
      // Refresh level access
      await fetchLevelAccess();
      
      return {
        txHash: txReceipt.hash,
        expiryTime,
      };
    } catch (err: any) {
      console.error('❌ Failed to purchase level access:', err);
      const errorMessage = err.message || 'Transaction failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsPurchasing(false);
    }
  };
  
  /**
   * Check if player has access to a level
   */
  const hasAccess = (level: LevelId): boolean => {
    if (level === 1) return true; // Level 1 always free
    
    const expiry = levelAccess[level];
    if (!expiry) return false;
    
    return Date.now() < expiry;
  };
  
  /**
   * Get time remaining for a level (in seconds)
   */
  const getTimeRemaining = (level: LevelId): number => {
    if (level === 1) return Infinity;
    
    const expiry = levelAccess[level];
    if (!expiry || expiry === 0) return 0;
    
    const remaining = Math.max(0, expiry - Date.now());
    return Math.floor(remaining / 1000);
  };
  
  return {
    levelAccess,
    isLoading,
    isPurchasing,
    error,
    purchaseLevelAccess,
    hasAccess,
    getTimeRemaining,
    refetch: fetchLevelAccess,
  };
};

