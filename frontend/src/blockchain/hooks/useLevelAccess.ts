import { useState, useEffect } from 'react';
import { usePrivy, useWallets, useSendTransaction } from '@privy-io/react-auth';
import { createPublicClient, http, encodeFunctionData } from 'viem';
import { sepolia } from 'viem/chains';
import { 
  GAME_ABI, 
  GAME_ADDRESS,
  GOLD_TOKEN_ABI,
  GOLD_TOKEN_ADDRESS 
} from '../config/contracts';
import type { LevelId } from '../../game/config/levels';
import { LEVELS } from '../../game/config/levels';

/**
 * Hook for managing mining sessions
 * Handles starting/ending sessions and checking session status
 */
export const useLevelAccess = (address?: string) => {
  const [activeSession, setActiveSession] = useState<{
    levelId: number;
    startTime: number;
    endTime: number;
    active: boolean;
  } | null>(null);
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
   * Fetch active mining session
   */
  const fetchActiveSession = async () => {
    if (!address) {
      setActiveSession(null);
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      
      const result = await publicClient.readContract({
        address: GAME_ADDRESS,
        abi: GAME_ABI,
        functionName: 'getActiveSession',
        args: [address],
      }) as [number, bigint, bigint, boolean];
      
      const [levelId, startTime, endTime, active] = result;
      
      // Convert timestamps from seconds to milliseconds
      const startTimeMs = Number(startTime) * 1000;
      const endTimeMs = Number(endTime) * 1000;
      
      if (active && endTimeMs > Date.now()) {
        setActiveSession({
          levelId: Number(levelId),
          startTime: startTimeMs,
          endTime: endTimeMs,
          active: true,
        });
      } else {
        setActiveSession(null);
      }
    } catch (err) {
      console.error('Failed to fetch active session:', err);
      setActiveSession(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchActiveSession();
    
    // Poll every 10 seconds
    const interval = setInterval(fetchActiveSession, 10000);
    return () => clearInterval(interval);
  }, [address]);
  
  /**
   * Start a mining session for a level
   * @param level Level ID (1-5, where level 1 is free)
   * @param numMinutes Number of minutes to purchase (1-60)
   */
  const purchaseLevelAccess = async (level: LevelId, numMinutes: number = 10) => {
    if (level === 1) {
      throw new Error('Level 1 is always free and does not require a session');
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
    
    if (numMinutes < 1 || numMinutes > 60) {
      throw new Error('Minutes must be between 1 and 60');
    }
    
    setIsPurchasing(true);
    setError(null);
    
    try {
      const levelConfig = LEVELS[level];
      
      // Get cost per minute from contract
      const costPerMinute = await publicClient.readContract({
        address: GAME_ADDRESS,
        abi: GAME_ABI,
        functionName: 'getLevelCostPerMinute',
        args: [level - 1], // Contract uses 0-indexed levels
      }) as bigint;
      
      const totalCost = Number(costPerMinute) * numMinutes;
      const costWei = BigInt(totalCost) * BigInt(1e18);
      
      console.log(`🏔️ Starting mining session for Level ${level} (${levelConfig.name})...`);
      console.log(`💰 Cost: ${totalCost} GLD (${costPerMinute} GLD/min × ${numMinutes} min)`);
      console.log(`⏰ Duration: ${numMinutes} minute${numMinutes > 1 ? 's' : ''}`);
      
      // Step 1: Approve GLD spending
      console.log(`💰 Approving ${totalCost} GLD for mining session...`);
      
      const approveData = encodeFunctionData({
        abi: GOLD_TOKEN_ABI,
        functionName: 'approve',
        args: [GAME_ADDRESS, costWei],
      });
      
      let approveReceipt;
      try {
        approveReceipt = await sendTransaction(
          {
            to: GOLD_TOKEN_ADDRESS,
            data: approveData,
            value: 0,
          },
          {
            sponsor: true,
            uiOptions: {
              header: 'Step 1: Approve GLD',
              description: `Approve ${totalCost} GLD tokens for mining session`,
              buttonText: 'Approve Tokens'
            }
          }
        );
        
        console.log('✅ GLD approved:', approveReceipt.hash);
      } catch (approveError: any) {
        console.error('❌ Approval failed:', approveError);
        throw new Error('Token approval cancelled or failed. Please try again.');
      }
      
      // Wait a moment for approval to propagate
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 2: Start mining session
      console.log(`🔓 Starting mining session...`);
      
      const sessionData = encodeFunctionData({
        abi: GAME_ABI,
        functionName: 'startMiningSession',
        args: [level - 1, numMinutes], // Contract uses 0-indexed levels
      });
      
      let txReceipt;
      try {
        txReceipt = await sendTransaction(
          {
            to: GAME_ADDRESS,
            data: sessionData,
            value: 0,
          },
          {
            sponsor: true,
            uiOptions: {
              header: `Step 2: Start ${levelConfig.name} Session`,
              description: `Mine for ${numMinutes} minute${numMinutes > 1 ? 's' : ''}`,
              buttonText: 'Start Session',
            }
          }
        );
        
        console.log('✅ Mining session started:', txReceipt.hash);
        console.log(`🔗 View on Etherscan: https://sepolia.etherscan.io/tx/${txReceipt.hash}`);
      } catch (sessionError: any) {
        console.error('❌ Session start failed:', sessionError);
        throw new Error('Session start cancelled or failed. Your approval is still valid for future attempts.');
      }
      
      // Calculate expiry time
      const expiryTime = Date.now() + (numMinutes * 60 * 1000);
      
      // Refresh session status
      await fetchActiveSession();
      
      return {
        txHash: txReceipt.hash,
        expiryTime,
      };
    } catch (err: any) {
      console.error('❌ Failed to start mining session:', err);
      const errorMessage = err.message || 'Transaction failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsPurchasing(false);
    }
  };
  
  /**
   * End the current mining session
   */
  const endMiningSession = async () => {
    if (!authenticated) {
      throw new Error('Please sign in first');
    }
    
    const embeddedWallet = wallets.find(
      (w) => w.walletClientType === 'privy'
    );
    
    if (!embeddedWallet) {
      throw new Error('No wallet found');
    }
    
    if (!activeSession) {
      throw new Error('No active session to end');
    }
    
    try {
      console.log('🛑 Ending mining session...');
      
      const endData = encodeFunctionData({
        abi: GAME_ABI,
        functionName: 'endMiningSession',
        args: [],
      });
      
      const txReceipt = await sendTransaction(
        {
          to: GAME_ADDRESS,
          data: endData,
          value: 0,
        },
        {
          sponsor: true,
          uiOptions: {
            header: 'End Mining Session',
            description: 'Return to Level 1',
            buttonText: 'End Session',
          }
        }
      );
      
      console.log('✅ Mining session ended:', txReceipt.hash);
      
      // Refresh session status
      await fetchActiveSession();
      
      return txReceipt;
    } catch (err: any) {
      console.error('❌ Failed to end mining session:', err);
      throw err;
    }
  };
  
  /**
   * Check if player has access to a level
   */
  const hasAccess = (level: LevelId): boolean => {
    if (level === 1) return true; // Level 1 always free
    
    if (!activeSession || !activeSession.active) return false;
    
    // Check if session is for the requested level
    if (activeSession.levelId !== level - 1) return false; // Contract uses 0-indexed
    
    // Check if session has expired
    return Date.now() < activeSession.endTime;
  };
  
  /**
   * Get time remaining for current session (in seconds)
   */
  const getTimeRemaining = (level: LevelId): number => {
    if (level === 1) return Infinity;
    
    if (!activeSession || !activeSession.active) return 0;
    
    // Only return time if session is for the requested level
    if (activeSession.levelId !== level - 1) return 0; // Contract uses 0-indexed
    
    const remaining = Math.max(0, activeSession.endTime - Date.now());
    return Math.floor(remaining / 1000);
  };
  
  /**
   * Get level access status in the old format for backward compatibility
   */
  const levelAccess: Record<LevelId, number> = {
    1: 0, // Always free
    2: activeSession?.levelId === 1 ? activeSession.endTime : 0,
    3: activeSession?.levelId === 2 ? activeSession.endTime : 0,
    4: activeSession?.levelId === 3 ? activeSession.endTime : 0,
    5: activeSession?.levelId === 4 ? activeSession.endTime : 0,
  };
  
  return {
    activeSession,
    levelAccess,
    isLoading,
    isPurchasing,
    error,
    purchaseLevelAccess,
    endMiningSession,
    hasAccess,
    getTimeRemaining,
    refetch: fetchActiveSession,
  };
};

