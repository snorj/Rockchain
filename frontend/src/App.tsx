import { PrivyProvider, usePrivy } from '@privy-io/react-auth';
import { GameLayout } from './components/Layout/GameLayout';
import { LoginScreen } from './components/Auth/LoginScreen';
import { privyConfig } from './blockchain/config/privyConfig';
import './App.css';

// Get Privy App ID from environment variable
const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID || '';

if (!PRIVY_APP_ID) {
  console.error('⚠️ VITE_PRIVY_APP_ID is not set in environment variables');
}

/**
 * AuthGate - Shows login screen or game based on authentication status
 */
function AuthGate() {
  const { ready, authenticated } = usePrivy();

  // Show loading state while Privy initializes
  if (!ready) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        color: '#ffcc00',
        fontSize: '24px',
        fontWeight: 'bold'
      }}>
        Loading Rockchain...
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!authenticated) {
    return <LoginScreen />;
  }

  // Show game if authenticated
  return <GameLayout />;
}

/**
 * Main App component
 * Entry point for the Rockchain mining game
 */
function App() {
  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={privyConfig}
    >
      <AuthGate />
    </PrivyProvider>
  );
}

export default App;
