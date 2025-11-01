import { sepolia } from 'viem/chains';
import type { PrivyClientConfig } from '@privy-io/react-auth';

export const privyConfig: PrivyClientConfig = {
  loginMethods: ['email', 'google', 'twitter'],
  appearance: {
    theme: 'dark',
    accentColor: '#FFD700',
  },
  embeddedWallets: {
    ethereum: {
      createOnLogin: 'users-without-wallets',
    },
    showWalletUIs: true,
  },
  defaultChain: sepolia,
};

