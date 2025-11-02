import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useGoldBalance } from '../../blockchain/hooks/useGoldBalance';
import './WalletButton.css';

/**
 * User profile button - shows GLD balance and sign out option
 * Only visible after authentication
 */
export const WalletButton = () => {
  const { ready, authenticated, user, logout } = usePrivy();
  const { wallets } = useWallets();

  const embeddedWallet = wallets.find((w) => w.walletClientType === 'privy');
  const { balance, isLoading: balanceLoading } = useGoldBalance(
    embeddedWallet?.address
  );

  if (!ready || !authenticated) {
    return null; // Don't show anything if not authenticated
  }

  // Get user's display name (email or social username)
  const displayName = user?.email?.address || 
                      user?.google?.email || 
                      user?.twitter?.username ||
                      'Player';

  return (
    <div className="user-profile">
      <div className="user-info">
        <div className="user-name">
          <span className="name-text">{displayName}</span>
        </div>
      </div>
      <button className="signout-button" onClick={logout} title="Sign Out">
        Sign Out
      </button>
    </div>
  );
};

