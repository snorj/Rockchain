import { usePrivy } from '@privy-io/react-auth';
import './LoginScreen.css';

/**
 * LoginScreen - Initial landing page that requires authentication
 * Users must sign in before accessing the game
 */
export const LoginScreen = () => {
  const { ready, login } = usePrivy();

  return (
    <div className="login-screen">
      <div className="login-container">
        <div className="login-header">
          <h1 className="login-title">ROCKCHAIN</h1>
          <p className="login-subtitle">Mine resources. Earn rewards. Play to earn.</p>
        </div>

        <div className="login-content">
          <div className="feature-list">
            <div className="feature-item">
              <img src="/assets/sprites/ores/iron/tile07.png" alt="Iron" className="feature-icon" />
              <span className="feature-text">Mine Coal, Iron & Diamond</span>
            </div>
            <div className="feature-item">
              <img src="/assets/sprites/ores/gold/tile09.png" alt="Gold" className="feature-icon" />
              <span className="feature-text">Earn GLD tokens on blockchain</span>
            </div>
            <div className="feature-item">
              <img src="/assets/sprites/gems/diamond/tile09.png" alt="Diamond" className="feature-icon" />
              <span className="feature-text">Play for free, no wallet needed</span>
            </div>
          </div>

          <button 
            className="login-button" 
            onClick={login}
            disabled={!ready}
          >
            {ready ? (
              <span className="button-text">Start Playing</span>
            ) : (
              'Loading...'
            )}
          </button>

          <p className="login-disclaimer">
            Sign in with email to get started
          </p>
        </div>

        <footer className="login-footer">
          <p>Built with Phaser.js & React • Powered by blockchain</p>
        </footer>
      </div>

      {/* Animated background */}
      <div className="login-background">
      </div>
    </div>
  );
};

