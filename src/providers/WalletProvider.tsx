
import { createWeb3Modal } from '@web3modal/wagmi';
import { WagmiConfig, createConfig, configureChains } from 'wagmi';
import { CoreBlockchain } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { useState, useEffect } from 'react';

// Configure chains & providers
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [CoreBlockchain],
  [publicProvider()]
);

// Set up wagmi config
const config = createConfig({
  autoConnect: true,
  connectors: [
    new InjectedConnector({ chains }),
    new WalletConnectConnector({
      chains,
      options: {
        projectId: 'YOUR_PROJECT_ID', // Replace with your WalletConnect Project ID if needed
      },
    }),
  ],
  publicClient,
  webSocketPublicClient,
});

// Create Web3Modal
const modal = createWeb3Modal({ 
  wagmiConfig: config, 
  projectId: 'YOUR_PROJECT_ID',  // Replace with your WalletConnect Project ID
  chains,
  themeMode: 'light',
  themeVariables: {
    '--w3m-accent-color': '#FF6B00', // Use CorePulse orange
    '--w3m-background-color': '#FF6B00',
  }
});

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  
  // To avoid hydration mismatch, only render after first mount
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  
  return <WagmiConfig config={config}>{children}</WagmiConfig>;
}

// Utility hook to connect wallet
export function useWalletConnect() {
  return {
    connect: () => modal.open(),
  };
}
