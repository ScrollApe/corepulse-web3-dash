
import { useState, useEffect } from 'react';
import { createWeb3Modal } from '@web3modal/wagmi';
import { WagmiConfig, createConfig, configureChains, useAccount } from 'wagmi';
import { mainnet, arbitrum } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';

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
        projectId: '535acf9f46f8f279f492a746b1ec219a', // Replace with your WalletConnect Project ID if needed
      },
    }),
  ],
  publicClient,
  webSocketPublicClient,
});

// Create Web3Modal
const modal = createWeb3Modal({ 
  wagmiConfig: config, 
  projectId: '535acf9f46f8f279f492a746b1ec219a',  // Replace with your WalletConnect Project ID
  chains,
  themeMode: 'light',
  themeVariables: {
    '--w3m-accent': '#FF6B00', // CorePulse orange
  }
});

// Function to track wallet connection in the database
const trackWalletConnection = async (address: string) => {
  try {
    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', address.toLowerCase())
      .maybeSingle();
      
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error checking for existing user:', fetchError);
      return;
    }
    
    // If user doesn't exist, create new user
    if (!existingUser) {
      // Create user with explicit fields to avoid RLS policy issues
      const { data, error: insertError } = await supabase
        .from('users')
        .insert({
          wallet_address: address.toLowerCase(),
          level: 1,
          experience: 0,
          next_level_exp: 100,
          total_mined: 0,
          avatar_stage: 1
        })
        .select()
        .single();
        
      if (insertError) {
        console.error('Error creating user:', insertError);
        toast("Error Creating Profile", {
          description: "Could not create your user profile. Please try again.",
        });
        return;
      }
      
      console.log("Created new user:", data);
      
      // Create initial streak record
      const { error: streakError } = await supabase
        .from('streaks')
        .insert({
          user_id: data.id,
          current_streak_days: 1,
          last_check_in: new Date().toISOString()
        });
        
      if (streakError) {
        console.error('Error creating streak record:', streakError);
      }
        
      // Create initial activity
      const { error: activityError } = await supabase
        .from('user_activities')
        .insert({
          user_id: data.id,
          activity: 'wallet_connect',
          metadata: {}
        });
        
      if (activityError) {
        console.error('Error creating activity record:', activityError);
      }
      
      // Try to unlock the Early Adopter achievement
      try {
        // Get current epoch
        const { data: epochId } = await supabase.rpc('get_current_epoch_id');
        
        if (epochId === 1) { // First epoch
          const { data: achievementData, error: achievementError } = await supabase
            .from('achievements')
            .select('id')
            .eq('name', 'Early Adopter')
            .single();
            
          if (!achievementError && achievementData) {
            await supabase
              .from('user_achievements')
              .insert({
                user_id: data.id,
                achievement_id: achievementData.id
              });
          }
        }
      } catch (error) {
        console.error('Error unlocking achievement:', error);
      }
      
      toast('Welcome to CorePulse!', {
        description: 'Your account has been created.',
      });
      
    } else {
      console.log("Found existing user:", existingUser);
      
      // User exists, log wallet connection
      const { error: activityError } = await supabase
        .from('user_activities')
        .insert({
          user_id: existingUser.id,
          activity: 'wallet_connect',
          metadata: {},
        });
        
      if (activityError) {
        console.error('Error logging activity:', activityError);
      }
      
      toast('Welcome back!', {
        description: 'Your wallet has been connected.',
      });
    }
  } catch (error) {
    console.error('Error tracking wallet connection:', error);
    toast("Connection Error", {
      description: "There was an issue with your wallet connection.",
    });
  }
};

const WalletConnectionTracker = () => {
  const { address, isConnected } = useAccount();
  
  useEffect(() => {
    if (isConnected && address) {
      trackWalletConnection(address);
    }
  }, [isConnected, address]);
  
  return null;
};

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  
  // To avoid hydration mismatch, only render after first mount
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  
  return (
    <WagmiConfig config={config}>
      <WalletConnectionTracker />
      {children}
    </WagmiConfig>
  );
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
          description: "Failed to connect wallet. Please try again."
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
