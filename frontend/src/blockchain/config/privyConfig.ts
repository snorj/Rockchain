import { sepolia } from 'viem/chains';
import type { PrivyClientConfig } from '@privy-io/react-auth';

export const privyConfig: PrivyClientConfig = {
  loginMethods: ['email', 'google', 'twitter'],
  appearance: {
    theme: 'dark',
    accentColor: '#FFD700',
    logo: 'https://em-content.zobj.net/thumbs/120/apple/354/pick_26cf-fe0f.png',
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

