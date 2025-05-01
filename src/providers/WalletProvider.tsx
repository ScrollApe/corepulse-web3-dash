
import { useState, useEffect } from 'react';
import { createWeb3Modal } from '@web3modal/wagmi';
import { WagmiConfig, createConfig, configureChains } from 'wagmi';
import { mainnet, arbitrum } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { toast } from '@/components/ui/sonner';

// Configure chains & providers
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, arbitrum],
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
    '--w3m-accent': '#FF6B00', // CorePulse orange
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
    connect: () => {
      try {
        modal.open();
      } catch (error) {
        console.error("Failed to connect wallet:", error);
        toast("Connection Failed", {
          description: "Failed to connect wallet. Please try again.",
          variant: "destructive",
        });
      }
    },
    disconnect: () => {
      try {
        modal.close();
      } catch (error) {
        console.error("Failed to disconnect wallet:", error);
      }
    }
  };
}
