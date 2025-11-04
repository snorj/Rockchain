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
import { useGameStore } from '../../store/gameStore';

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
        const session = {
          levelId: Number(levelId) as LevelId,
          startTime: startTimeMs,
          endTime: endTimeMs,
          active: true,
        };
        setActiveSession(session);
        
        // Update game store
        useGameStore.getState().setActiveSession(session);
        useGameStore.getState().setLevel(Number(levelId) as LevelId, endTimeMs);
      } else {
        setActiveSession(null);
        
        // Clear session from game store
        if (useGameStore.getState().activeSession) {
          useGameStore.getState().clearSession();
        }
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
   * Approve GLD spending for a mining session
   * @param level Level ID (1-5, where level 1 is free)
   * @param numSeconds Number of seconds to purchase (15-3600)
   * @returns Cost information
   */
  const approveMiningSession = async (level: LevelId, numSeconds: number = 60): Promise<{ totalCost: number; costWei: bigint }> => {
    if (level === 1) {
      throw new Error('Level 1 is always free and does not require approval');
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
    
    // Ensure wallet is connected
    if (!embeddedWallet.address) {
      throw new Error('Wallet not connected. Please try again.');
    }
    
    if (numSeconds < 15 || numSeconds > 3600) {
      throw new Error('Seconds must be between 15 and 3600');
    }
    
    setIsPurchasing(true);
    setError(null);
    
    try {
      // Small delay to ensure wallet is fully ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const levelConfig = LEVELS[level];
      
      // Get cost per second from contract
      const costPerSecond = await publicClient.readContract({
        address: GAME_ADDRESS,
        abi: GAME_ABI,
        functionName: 'getLevelCostPerSecond',
        args: [level - 1], // Contract uses 0-indexed levels
      }) as bigint;
      
      const totalCost = Number(costPerSecond) * numSeconds;
      const costWei = BigInt(totalCost) * BigInt(1e18);
      
      const formatTime = (secs: number): string => {
        if (secs < 60) return `${secs}s`;
        const mins = Math.floor(secs / 60);
        const remainingSecs = secs % 60;
        if (remainingSecs === 0) return `${mins}m`;
        return `${mins}m ${remainingSecs}s`;
      };
      
      console.log(`🏔️ Approving mining session for Level ${level} (${levelConfig.name})...`);
      console.log(`💰 Cost: ${totalCost} GLD (${costPerSecond} GLD/sec × ${numSeconds} sec)`);
      console.log(`⏰ Duration: ${formatTime(numSeconds)}`);
      
      // Always check current allowance to avoid unnecessary approval transactions
      let needsApproval = true;
      try {
        const currentAllowance = await publicClient.readContract({
          address: GOLD_TOKEN_ADDRESS,
          abi: GOLD_TOKEN_ABI,
          functionName: 'allowance',
          args: [embeddedWallet.address, GAME_ADDRESS],
        }) as bigint;
        
        console.log(`🔍 Current allowance: ${currentAllowance.toString()} (need: ${costWei.toString()})`);
        
        // If current allowance is sufficient, skip approval
        if (currentAllowance >= costWei) {
          console.log(`✅ Sufficient allowance exists, skipping approval...`);
          needsApproval = false;
        }
      } catch (checkError) {
        console.warn('⚠️ Could not check allowance, will request approval:', checkError);
        needsApproval = true;
      }
      
      // Approve GLD spending (if needed)
      if (needsApproval) {
        console.log(`💰 Approving ${totalCost} GLD for mining session...`);
        
        const approveData = encodeFunctionData({
          abi: GOLD_TOKEN_ABI,
          functionName: 'approve',
          args: [GAME_ADDRESS, costWei],
        });
        
        let approvalSucceeded = false;
        
        try {
          console.log('📤 Sending approval transaction...');
          await sendTransaction(
            {
              to: GOLD_TOKEN_ADDRESS,
              data: approveData,
              value: 0,
            },
            {
              sponsor: true,
              uiOptions: {
                description: `Approve ${totalCost} GLD tokens for mining session`,
                buttonText: 'Approve Tokens'
              }
            }
          );
          
          console.log('✅ GLD approved');
          console.log('⏳ Waiting for blockchain confirmation...');
          approvalSucceeded = true;
        } catch (approveError: any) {
          console.error('❌ Approval failed:', approveError);
          console.error('Error type:', approveError.name);
          console.error('Error message:', approveError.message);
          
          // Handle specific error types
          if (approveError.name === 'AbortError' || approveError.message?.includes('aborted')) {
            // Check if approval actually succeeded despite the abort error
            console.log('⚠️  Approval may have succeeded despite abort error, checking allowance...');
            
            // Wait longer for the transaction to potentially complete
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Try multiple times to check allowance
            let attempts = 0;
            const maxAttempts = 3;
            
            while (attempts < maxAttempts) {
              try {
                const currentAllowance = await publicClient.readContract({
                  address: GOLD_TOKEN_ADDRESS,
                  abi: GOLD_TOKEN_ABI,
                  functionName: 'allowance',
                  args: [embeddedWallet.address, GAME_ADDRESS],
                }) as bigint;
                
                console.log(`🔍 Attempt ${attempts + 1}: Current allowance is ${currentAllowance.toString()}`);
                
                // If allowance is sufficient, continue with the session
                if (currentAllowance >= costWei) {
                  console.log('✅ Approval succeeded despite abort error, continuing...');
                  approvalSucceeded = true;
                  break;
                }
                
                // Wait before next attempt
                if (attempts < maxAttempts - 1) {
                  await new Promise(resolve => setTimeout(resolve, 1500));
                }
                attempts++;
              } catch (checkError) {
                console.warn(`⚠️  Attempt ${attempts + 1} to check allowance failed:`, checkError);
                attempts++;
                if (attempts < maxAttempts) {
                  await new Promise(resolve => setTimeout(resolve, 1500));
                }
              }
            }
            
            if (!approvalSucceeded) {
              throw new Error('Transaction was interrupted. The approval may not have completed. Please try again.');
            }
          } else if (approveError.message?.includes('user rejected') || approveError.message?.includes('User rejected')) {
            throw new Error('Transaction rejected. Please approve the transaction to start your mining session.');
          } else {
            throw new Error(`Token approval failed: ${approveError.message || 'Please try again.'}`);
          }
        }
        
        // Wait for approval to propagate on the blockchain
        if (approvalSucceeded) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } else {
        console.log('⏭️  Skipping approval (using existing approval)...');
      }
      
      return { totalCost, costWei };
    } catch (err: any) {
      console.error('❌ Failed to approve mining session:', err);
      const errorMessage = err.message || 'Approval failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsPurchasing(false);
    }
  };

  /**
   * Start a mining session for a level (must be called after approveMiningSession)
   * @param level Level ID (1-5, where level 1 is free)
   * @param numSeconds Number of seconds to purchase (15-3600)
   */
  const startMiningSession = async (level: LevelId, numSeconds: number = 60) => {
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
    
    setIsPurchasing(true);
    setError(null);
    
    try {
      const levelConfig = LEVELS[level];
      
      const formatTime = (secs: number): string => {
        if (secs < 60) return `${secs}s`;
        const mins = Math.floor(secs / 60);
        const remainingSecs = secs % 60;
        if (remainingSecs === 0) return `${mins}m`;
        return `${mins}m ${remainingSecs}s`;
      };
      
      console.log(`🔓 Starting mining session for Level ${level} (${levelConfig.name})...`);
      
      const sessionData = encodeFunctionData({
        abi: GAME_ABI,
        functionName: 'startMiningSession',
        args: [level - 1, numSeconds], // Contract uses 0-indexed levels, now accepts seconds
      });
      
      let txReceipt;
      try {
        console.log('📤 Sending session start transaction...');
        
        // Ensure we're still in a valid state before proceeding
        txReceipt = await sendTransaction(
          {
            to: GAME_ADDRESS,
            data: sessionData,
            value: 0,
          },
          {
            sponsor: true,
            uiOptions: {
              description: `Starting ${levelConfig.name} - ${formatTime(numSeconds)} mining session`,
              buttonText: 'Confirm',
            }
          }
        );
        
        console.log('✅ Mining session started:', txReceipt.hash);
        console.log(`🔗 View on Etherscan: https://sepolia.etherscan.io/tx/${txReceipt.hash}`);
      } catch (sessionError: any) {
        console.error('❌ Session start failed:', sessionError);
        console.error('Error details:', {
          name: sessionError.name,
          message: sessionError.message,
          stack: sessionError.stack
        });
        
        // Handle specific error types
        const errorMessage = sessionError.message || sessionError.toString();
        
        if (errorMessage.includes('Session already active')) {
          throw new Error('You already have an active mining session. Please wait for it to expire or end it first.');
        } else if (errorMessage.includes('ERC20InsufficientAllowance') || errorMessage.includes('insufficient allowance')) {
          throw new Error('Insufficient token allowance. Please retry - a fresh approval will be requested.');
        } else if (sessionError.name === 'AbortError' || errorMessage.includes('aborted')) {
          // Check if session actually started despite abort error
          console.log('⚠️  Session may have started despite abort error, checking...');
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          try {
            const sessionCheck = await publicClient.readContract({
              address: GAME_ADDRESS,
              abi: GAME_ABI,
              functionName: 'getActiveSession',
              args: [embeddedWallet.address],
            }) as [number, bigint, bigint, boolean];
            
            const [sessionLevelId, , sessionEndTime, sessionActive] = sessionCheck;
            const sessionEndTimeMs = Number(sessionEndTime) * 1000;
            
            // If session is active and matches our request, consider it successful
            if (sessionActive && sessionEndTimeMs > Date.now() && sessionLevelId === level - 1) {
              console.log('✅ Session started successfully despite abort error!');
              // Calculate expiry time and refresh session
              const expiryTime = sessionEndTimeMs;
              await fetchActiveSession();
              return {
                txHash: undefined,
                expiryTime,
              };
            }
          } catch (checkError) {
            console.warn('Could not verify session status:', checkError);
          }
          
          throw new Error('Transaction cancelled or connection lost. Please try again.');
        } else if (errorMessage.includes('user rejected') || errorMessage.includes('User rejected')) {
          throw new Error('Transaction rejected. Please try again when ready.');
        } else if (errorMessage.includes('Insufficient GLD')) {
          throw new Error('Insufficient GLD balance. Please check your balance and try again.');
        } else {
          throw new Error(`Session start failed: ${errorMessage}. Please try again.`);
        }
      }
      
      // Calculate expiry time (numSeconds is already in seconds)
      const expiryTime = Date.now() + (numSeconds * 1000);
      
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
            description: 'End Mining Session - Return to Level 1',
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
   * Purchase level access (combined approve + start for backward compatibility)
   * @deprecated Use approveMiningSession + startMiningSession for better UX control
   */
  const purchaseLevelAccess = async (level: LevelId, numSeconds: number = 60) => {
    // Step 1: Approve
    await approveMiningSession(level, numSeconds);
    
    // Step 2: Start session
    return await startMiningSession(level, numSeconds);
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
    approveMiningSession,
    startMiningSession,
    endMiningSession,
    hasAccess,
    getTimeRemaining,
    refetch: fetchActiveSession,
  };
};

