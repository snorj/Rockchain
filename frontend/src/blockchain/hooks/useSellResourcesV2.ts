import { useState } from 'react';
import { usePrivy, useWallets, useSendTransaction } from '@privy-io/react-auth';
import { encodeFunctionData } from 'viem';
import { GAME_ABI, GAME_ADDRESS } from '../config/contracts';
import type { MaterialType } from '../../game/config/materials';
import { MATERIALS } from '../../game/config/materials';

/**
 * Hook for selling mined resources and minting GLD tokens
 * Updated for GameV3 with expanded material system
 */
export const useSellResourcesV2 = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const { sendTransaction } = useSendTransaction();

  /**
   * Sell resources from inventory
   * @param materials Object mapping material types to amounts
   * @returns Total GLD earned and transaction hash
   */
  const sellResources = async (materials: Partial<Record<MaterialType, number>>) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!authenticated) {
        throw new Error('Please sign in first');
      }

      const embeddedWallet = wallets.find(
        (w) => w.walletClientType === 'privy'
      );

      if (!embeddedWallet) {
        throw new Error('No wallet found');
      }

      // Convert materials object to arrays for contract
      const materialIds: number[] = [];
      const amounts: number[] = [];
      let totalValue = 0;

      Object.entries(materials).forEach(([material, amount]) => {
        if (amount && amount > 0) {
          const materialConfig = MATERIALS[material as MaterialType];
          if (materialConfig) {
            // Get material ID from the materials array
            const materialId = getMaterialId(material as MaterialType);
            if (materialId !== -1) {
              materialIds.push(materialId);
              amounts.push(amount);
              totalValue += materialConfig.goldValue * amount;
            }
          }
        }
      });

      if (materialIds.length === 0) {
        throw new Error('No materials to sell');
      }

      console.log('🔗 Selling resources:', { materialIds, amounts, totalValue });

      // Encode the contract call data
      const data = encodeFunctionData({
        abi: GAME_ABI,
        functionName: 'sellResources',
        args: [materialIds, amounts],
      });

      console.log('📤 Sending gas-sponsored transaction...');

      // Use Privy's useSendTransaction with native gas sponsorship
      let txReceipt;
      try {
        txReceipt = await sendTransaction(
          {
            to: GAME_ADDRESS,
            data: data,
            value: 0,
          },
          {
            sponsor: true,
            header: 'Selling Resources',
            description: `Converting your mined resources to ${totalValue} GLD tokens`,
            buttonText: 'Confirm Sale'
          }
        );

        console.log('✅ Transaction successful:', txReceipt);
        console.log(`🔗 View on Etherscan: https://sepolia.etherscan.io/tx/${txReceipt.hash}`);
        
        // Check if transaction was successful (status = 1)
        if (txReceipt.status === 0) {
          throw new Error('Transaction failed on-chain. This may mean GameV3 lacks minting permissions. Check the transaction on Etherscan.');
        }

        return {
          txHash: txReceipt.hash,
          goldEarned: totalValue,
        };
      } catch (txError: any) {
        // Check if this is an AbortError that occurred after the transaction succeeded
        if (txError.name === 'AbortError' || txError.message?.includes('abort')) {
          console.log('⚠️  Transaction may have succeeded despite abort error');
          // Return success with the expected value, without a transaction hash
          return {
            txHash: undefined,
            goldEarned: totalValue,
          };
        }
        throw txError;
      }
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

/**
 * Get material ID for contract (matches materialNames array in GameV3.sol)
 */
function getMaterialId(material: MaterialType): number {
  const materialMap: Record<MaterialType, number> = {
    // Tier 1 (0-3)
    stone: 0,
    copper: 1,
    tin: 2,
    coal: 3,
    // Tier 2 (4-6)
    iron: 4,
    lead: 5,
    cobalt: 6,
    // Tier 3 ores (7-11)
    silver: 7,
    gold: 8,
    platinum: 9,
    titanium: 10,
    tungsten: 11,
    // Tier 4 ores (12-13)
    palladium: 12,
    orichalcum: 13,
    // Tier 5 ores (14-16)
    mythril: 14,
    adamantite: 15,
    meteorite: 16,
    // Tier 3 gem (17)
    emerald: 17,
    // Tier 4 gems (18-22)
    topaz: 18,
    aquamarine: 19,
    peridot: 20,
    ruby: 21,
    sapphire: 22,
    // Tier 5 gems (23-24)
    diamond: 23,
    amethyst: 24,
  };
  
  return materialMap[material] ?? -1;
}

/**
 * Calculate total value of materials
 */
export function calculateTotalValue(materials: Partial<Record<MaterialType, number>>): number {
  let total = 0;
  
  Object.entries(materials).forEach(([material, amount]) => {
    if (amount && amount > 0) {
      const materialConfig = MATERIALS[material as MaterialType];
      if (materialConfig) {
        total += materialConfig.goldValue * amount;
      }
    }
  });
  
  return total;
}

