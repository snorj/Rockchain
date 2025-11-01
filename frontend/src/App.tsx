import { PrivyProvider } from '@privy-io/react-auth';
import { GameLayout } from './components/Layout/GameLayout';
import { privyConfig } from './blockchain/config/privyConfig';
import './App.css';

// Get Privy App ID from environment variable
const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID || '';

if (!PRIVY_APP_ID) {
  console.error('⚠️ VITE_PRIVY_APP_ID is not set in environment variables');
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
      <GameLayout />
    </PrivyProvider>
  );
}

export default App;
