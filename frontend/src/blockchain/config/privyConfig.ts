import { sepolia } from 'viem/chains';
import type { PrivyClientConfig } from '@privy-io/react-auth';

export const privyConfig: PrivyClientConfig = {
  loginMethods: ['email'],
  appearance: {
    theme: 'dark',
    accentColor: '#FFD700',
    logo: '/assets/sprites/pickaxes/steel/pickaxe-steel.png',
  },
  embeddedWallets: {
    ethereum: {
      createOnLogin: 'users-without-wallets',
    },
    // Hide wallet UI - users don't need to see crypto details
    showWalletUIs: false,
  },
  defaultChain: sepolia,
  // Support for multiple chains (future-proofing)
  supportedChains: [sepolia],
};

