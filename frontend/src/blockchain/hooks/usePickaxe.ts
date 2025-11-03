import { useState, useEffect } from 'react';
import { createPublicClient, http, parseEther, encodeFunctionData } from 'viem';
import { sepolia } from 'viem/chains';
import { useSendTransaction } from '@privy-io/react-auth';
import { 
  PICKAXE_NFT_V2_ABI as PICKAXE_NFT_ABI, 
  PICKAXE_NFT_ADDRESS, 
  GOLD_TOKEN_ABI,
  GOLD_TOKEN_ADDRESS 
} from '../config/contracts';
import type { PickaxeTier } from '../../utils/constants';
import { PICKAXE_CONFIG } from '../../utils/constants';

export interface PickaxeData {
  tokenId: bigint;
  tier: number;
  durability: bigint;
  maxDurability: bigint;
}

/**
 * Hook for managing Pickaxe NFTs
 * Handles minting, buying, repairing, and querying pickaxe state
 */
export const usePickaxe = (address?: string) => {
  const [pickaxe, setPickaxe] = useState<PickaxeData | null>(null);
  const [hasPickaxe, setHasPickaxe] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMinting, setIsMinting] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [isRepairing, setIsRepairing] = useState(false);

  const { sendTransaction } = useSendTransaction();

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(),
  });

  /**
   * Fetch pickaxe data for the connected address
   */
  const fetchPickaxe = async () => {
    if (!address) {
      setPickaxe(null);
      setHasPickaxe(false);
      setIsLoading(false);
      return;
    }

    try {
      // Check if player has pickaxe
      const hasPickaxeResult = await publicClient.readContract({
        address: PICKAXE_NFT_ADDRESS,
        abi: PICKAXE_NFT_ABI,
        functionName: 'hasPickaxe',
        args: [address],
      });

      setHasPickaxe(hasPickaxeResult as boolean);

      if (hasPickaxeResult) {
        // Fetch pickaxe details
        const result = await publicClient.readContract({
          address: PICKAXE_NFT_ADDRESS,
          abi: PICKAXE_NFT_ABI,
          functionName: 'getPlayerPickaxe',
          args: [address],
        }) as [bigint, number, bigint, bigint];

        setPickaxe({
          tokenId: result[0],
          tier: result[1],
          durability: result[2],
          maxDurability: result[3],
        });
      } else {
        setPickaxe(null);
      }
    } catch (error) {
      console.error('Failed to fetch pickaxe:', error);
      setPickaxe(null);
      setHasPickaxe(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPickaxe();

    // Poll every 10 seconds
    const interval = setInterval(fetchPickaxe, 10000);
    return () => clearInterval(interval);
  }, [address]);

  /**
   * Mint starter pickaxe (free, Wooden tier)
   */
  const mintStarter = async () => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    setIsMinting(true);
    try {
      console.log('🔨 Minting free starter pickaxe...');
      
      const mintData = encodeFunctionData({
        abi: PICKAXE_NFT_ABI,
        functionName: 'mintStarter',
        args: [],
      });

      const receipt = await sendTransaction(
        {
          to: PICKAXE_NFT_ADDRESS,
          data: mintData,
          value: 0,
        },
        {
          sponsor: true,
          header: 'Mint Starter Pickaxe',
          description: 'Get your free Wooden pickaxe to start mining!',
          buttonText: 'Mint Pickaxe'
        }
      );

      console.log('✅ Starter pickaxe minted, tx hash:', receipt.hash);
      console.log(`🔗 View on Etherscan: https://sepolia.etherscan.io/tx/${receipt.hash}`);

      // Refresh pickaxe data
      await fetchPickaxe();

      return receipt.hash;
    } catch (error) {
      console.error('Failed to mint starter pickaxe:', error);
      throw error;
    } finally {
      setIsMinting(false);
    }
  };

  /**
   * Buy pickaxe of specific tier
   * @param tier Tier to purchase (0-4)
   */
  const buyPickaxe = async (tier: PickaxeTier) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    if (tier === 0) {
      throw new Error('Use mintStarter for wooden pickaxe');
    }

    setIsBuying(true);
    try {
      const cost = PICKAXE_CONFIG.COSTS[tier];
      const costWei = parseEther(cost.toString());

      // First, approve GLD spending
      console.log(`💰 Approving ${cost} GLD for pickaxe purchase...`);
      
      const approveData = encodeFunctionData({
        abi: GOLD_TOKEN_ABI,
        functionName: 'approve',
        args: [PICKAXE_NFT_ADDRESS, costWei],
      });

      const approveReceipt = await sendTransaction(
        {
          to: GOLD_TOKEN_ADDRESS,
          data: approveData,
          value: 0,
        },
        {
          sponsor: true,
          header: 'Approve GLD',
          description: `Approve ${cost} GLD for pickaxe purchase`,
          buttonText: 'Approve'
        }
      );

      console.log('✅ GLD approved:', approveReceipt.hash);

      // Then, buy pickaxe
      console.log(`🔨 Buying ${PICKAXE_CONFIG.TIERS[tier]} pickaxe...`);
      
      const buyData = encodeFunctionData({
        abi: PICKAXE_NFT_ABI,
        functionName: 'buyPickaxe',
        args: [tier],
      });

      const buyReceipt = await sendTransaction(
        {
          to: PICKAXE_NFT_ADDRESS,
          data: buyData,
          value: 0,
        },
        {
          sponsor: true,
          header: 'Buy Pickaxe',
          description: `Purchase ${PICKAXE_CONFIG.TIERS[tier]} pickaxe for ${cost} GLD`,
          buttonText: 'Buy Pickaxe'
        }
      );

      console.log('✅ Pickaxe purchased, tx hash:', buyReceipt.hash);
      console.log(`🔗 View on Etherscan: https://sepolia.etherscan.io/tx/${buyReceipt.hash}`);

      // Refresh pickaxe data
      await fetchPickaxe();

      return buyReceipt.hash;
    } catch (error) {
      console.error('Failed to buy pickaxe:', error);
      throw error;
    } finally {
      setIsBuying(false);
    }
  };

  /**
   * Repair current pickaxe
   */
  const repairPickaxe = async () => {
    if (!address || !pickaxe) {
      throw new Error('No pickaxe to repair');
    }

    setIsRepairing(true);
    try {
      const repairCost = PICKAXE_CONFIG.COSTS[pickaxe.tier] * PICKAXE_CONFIG.REPAIR_COST_PERCENT;
      const costWei = parseEther(repairCost.toString());

      // First, approve GLD spending
      console.log(`💰 Approving ${repairCost} GLD for repair...`);
      
      const approveData = encodeFunctionData({
        abi: GOLD_TOKEN_ABI,
        functionName: 'approve',
        args: [PICKAXE_NFT_ADDRESS, costWei],
      });

      const approveReceipt = await sendTransaction(
        {
          to: GOLD_TOKEN_ADDRESS,
          data: approveData,
          value: 0,
        },
        {
          sponsor: true,
          header: 'Approve GLD',
          description: `Approve ${repairCost} GLD for pickaxe repair`,
          buttonText: 'Approve'
        }
      );

      console.log('✅ GLD approved:', approveReceipt.hash);

      // Then, repair pickaxe
      console.log('🔧 Repairing pickaxe...');
      
      const repairData = encodeFunctionData({
        abi: PICKAXE_NFT_ABI,
        functionName: 'repair',
        args: [pickaxe.tokenId],
      });

      const repairReceipt = await sendTransaction(
        {
          to: PICKAXE_NFT_ADDRESS,
          data: repairData,
          value: 0,
        },
        {
          sponsor: true,
          header: 'Repair Pickaxe',
          description: `Repair your pickaxe for ${repairCost} GLD`,
          buttonText: 'Repair'
        }
      );

      console.log('✅ Pickaxe repaired, tx hash:', repairReceipt.hash);
      console.log(`🔗 View on Etherscan: https://sepolia.etherscan.io/tx/${repairReceipt.hash}`);

      // Refresh pickaxe data
      await fetchPickaxe();

      return repairReceipt.hash;
    } catch (error) {
      console.error('Failed to repair pickaxe:', error);
      throw error;
    } finally {
      setIsRepairing(false);
    }
  };

  /**
   * Get pickaxe tier name
   */
  const getTierName = (): string => {
    if (!pickaxe) return 'None';
    return PICKAXE_CONFIG.TIERS[pickaxe.tier] || 'Unknown';
  };

  /**
   * Get durability percentage
   */
  const getDurabilityPercent = (): number => {
    if (!pickaxe || pickaxe.maxDurability === 0n) return 0;
    return Number((pickaxe.durability * 100n) / pickaxe.maxDurability);
  };

  /**
   * Check if pickaxe needs repair
   */
  const needsRepair = (): boolean => {
    if (!pickaxe) return false;
    return pickaxe.durability < pickaxe.maxDurability;
  };

  return {
    pickaxe,
    hasPickaxe,
    isLoading,
    isMinting,
    isBuying,
    isRepairing,
    mintStarter,
    buyPickaxe,
    repairPickaxe,
    getTierName,
    getDurabilityPercent,
    needsRepair,
    refetch: fetchPickaxe,
  };
};

