import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useGoldBalance } from '../../blockchain/hooks/useGoldBalance';
import './WalletButton.css';

/**
 * Wallet connection button with balance display
 */
export const WalletButton = () => {
  const { ready, authenticated, login, logout } = usePrivy();
  const { wallets } = useWallets();

  const embeddedWallet = wallets.find((w) => w.walletClientType === 'privy');
  const { balance, isLoading: balanceLoading } = useGoldBalance(
    embeddedWallet?.address
  );

  if (!ready) {
    return (
      <button className="wallet-button" disabled>
        Loading...
      </button>
    );
  }

  if (!authenticated) {
    return (
      <button className="wallet-button connect" onClick={login}>
        🔗 Connect Wallet
      </button>
    );
  }

  return (
    <div className="wallet-info">
      <div className="wallet-address">
        <span className="label">Wallet:</span>
        <span className="address">
          {embeddedWallet?.address
            ? `${embeddedWallet.address.slice(0, 6)}...${embeddedWallet.address.slice(-4)}`
            : 'Unknown'}
        </span>
      </div>
      <div className="wallet-balance">
        <span className="label">💰 GLD:</span>
        <span className="balance">
          {balanceLoading ? '...' : balance.toFixed(2)}
        </span>
      </div>
      <button className="wallet-button disconnect" onClick={logout}>
        Disconnect
      </button>
    </div>
  );
};

