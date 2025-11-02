import { useState, useEffect } from 'react';
import { createPublicClient, createWalletClient, custom, http, parseEther } from 'viem';
import { sepolia } from 'viem/chains';
import { 
  PICKAXE_NFT_ABI, 
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
    if (!address || !window.ethereum) {
      throw new Error('Wallet not connected');
    }

    setIsMinting(true);
    try {
      const walletClient = createWalletClient({
        chain: sepolia,
        transport: custom(window.ethereum),
      });

      const hash = await walletClient.writeContract({
        address: PICKAXE_NFT_ADDRESS,
        abi: PICKAXE_NFT_ABI,
        functionName: 'mintStarter',
        account: address as `0x${string}`,
      });

      console.log('✅ Minting starter pickaxe, tx hash:', hash);

      // Wait for transaction confirmation
      await publicClient.waitForTransactionReceipt({ hash });

      // Refresh pickaxe data
      await fetchPickaxe();

      return hash;
    } catch (error) {
      console.error('Failed to mint starter pickaxe:', error);
      throw error;
    } finally {
      setIsMinting(false);
    }
  };

  /**
   * Buy pickaxe of specific tier
   * @param tier Tier to purchase (1-4)
   */
  const buyPickaxe = async (tier: PickaxeTier) => {
    if (!address || !window.ethereum) {
      throw new Error('Wallet not connected');
    }

    if (tier === 0) {
      throw new Error('Use mintStarter for wooden pickaxe');
    }

    setIsBuying(true);
    try {
      const walletClient = createWalletClient({
        chain: sepolia,
        transport: custom(window.ethereum),
      });

      const cost = PICKAXE_CONFIG.COSTS[tier];
      const costWei = parseEther(cost.toString());

      // First, approve GLD spending
      console.log(`💰 Approving ${cost} GLD for pickaxe purchase...`);
      const approveHash = await walletClient.writeContract({
        address: GOLD_TOKEN_ADDRESS,
        abi: GOLD_TOKEN_ABI,
        functionName: 'approve',
        args: [PICKAXE_NFT_ADDRESS, costWei],
        account: address as `0x${string}`,
      });

      await publicClient.waitForTransactionReceipt({ hash: approveHash });
      console.log('✅ GLD approved');

      // Then, buy pickaxe
      console.log(`🔨 Buying ${PICKAXE_CONFIG.TIERS[tier]} pickaxe...`);
      const buyHash = await walletClient.writeContract({
        address: PICKAXE_NFT_ADDRESS,
        abi: PICKAXE_NFT_ABI,
        functionName: 'buyPickaxe',
        args: [tier],
        account: address as `0x${string}`,
      });

      console.log('✅ Buying pickaxe, tx hash:', buyHash);
      await publicClient.waitForTransactionReceipt({ hash: buyHash });

      // Refresh pickaxe data
      await fetchPickaxe();

      return buyHash;
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
    if (!address || !window.ethereum || !pickaxe) {
      throw new Error('No pickaxe to repair');
    }

    setIsRepairing(true);
    try {
      const walletClient = createWalletClient({
        chain: sepolia,
        transport: custom(window.ethereum),
      });

      const repairCost = PICKAXE_CONFIG.COSTS[pickaxe.tier] * PICKAXE_CONFIG.REPAIR_COST_PERCENT;
      const costWei = parseEther(repairCost.toString());

      // First, approve GLD spending
      console.log(`💰 Approving ${repairCost} GLD for repair...`);
      const approveHash = await walletClient.writeContract({
        address: GOLD_TOKEN_ADDRESS,
        abi: GOLD_TOKEN_ABI,
        functionName: 'approve',
        args: [PICKAXE_NFT_ADDRESS, costWei],
        account: address as `0x${string}`,
      });

      await publicClient.waitForTransactionReceipt({ hash: approveHash });
      console.log('✅ GLD approved');

      // Then, repair pickaxe
      console.log('🔧 Repairing pickaxe...');
      const repairHash = await walletClient.writeContract({
        address: PICKAXE_NFT_ADDRESS,
        abi: PICKAXE_NFT_ABI,
        functionName: 'repair',
        args: [pickaxe.tokenId],
        account: address as `0x${string}`,
      });

      console.log('✅ Repairing pickaxe, tx hash:', repairHash);
      await publicClient.waitForTransactionReceipt({ hash: repairHash });

      // Refresh pickaxe data
      await fetchPickaxe();

      return repairHash;
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

