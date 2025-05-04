
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
    if (!address) {
      console.error('Cannot track wallet connection: No address provided');
      return null;
    }
    
    console.log('Tracking wallet connection for address:', address);
    
    // Check if user exists with explicit return type
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id, wallet_address, joined_at')
      .eq('wallet_address', address.toLowerCase())
      .maybeSingle();
      
    if (fetchError) {
      console.error('Error checking for existing user:', fetchError);
      return null;
    }
    
    // If user doesn't exist, create new user
    if (!existingUser) {
      console.log('Creating new user for address:', address);
      
      // Try with RLS disabled first
      const { data, error: insertError } = await supabase
        .from('users')
        .insert({
          wallet_address: address.toLowerCase(),
        })
        .select('id')
        .single();
        
      if (insertError) {
        console.error('Error creating user:', insertError);
        console.log('Insert error details:', insertError.message, insertError.details);
        
        toast('Failed to register wallet', {
          description: 'There was an error creating your account. Please try again.',
        });
        return null;
      }
      
      if (!data || !data.id) {
        console.error('No data returned from user insertion');
        return null;
      }
      
      console.log('New user created with ID:', data.id);
      
      // Create initial streak record
      const { error: streakError } = await supabase
        .from('streaks')
        .insert({
          user_id: data.id,
        });
      
      if (streakError) {
        console.error('Error creating initial streak:', streakError);
      }
        
      toast('Welcome to CorePulse!', {
        description: 'Your account has been created.',
      });
      
      return data.id;
    } else {
      console.log('User exists for address:', address, 'with ID:', existingUser.id);
      
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
      
      // Update streak if needed
      const today = new Date().toISOString().split('T')[0];
      
      // Get the streak record for the user
      const { data: streakData, error: streakFetchError } = await supabase
        .from('streaks')
        .select('current_streak_days, last_check_in')
        .eq('user_id', existingUser.id)
        .single();
        
      if (!streakFetchError && streakData) {
        const lastDate = streakData.last_check_in ? new Date(streakData.last_check_in) : null;
        const lastCheckInDate = lastDate ? lastDate.toISOString().split('T')[0] : null;
        
        if (today !== lastCheckInDate) {
          // It's a new day, update streak
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          
          // Check if last check-in was yesterday (to maintain streak)
          const isConsecutiveDay = lastDate && 
            lastDate.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0];
          
          await supabase
            .from('streaks')
            .update({
              current_streak_days: isConsecutiveDay ? streakData.current_streak_days + 1 : 1,
              last_check_in: new Date().toISOString(),
            })
            .eq('user_id', existingUser.id);
        }
      } else if (streakFetchError) {
        console.error('Error fetching streak data:', streakFetchError);
      }
      
      toast('Welcome back!', {
        description: 'Your wallet has been connected.',
      });
      
      return existingUser.id;
    }
  } catch (error) {
    console.error('Error tracking wallet connection:', error);
    return null;
  }
};

const WalletConnectionTracker = () => {
  const { address, isConnected } = useAccount();
  const [isTracked, setIsTracked] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    if (isConnected && address && !isTracked) {
      console.log("WalletConnectionTracker: Wallet connected, tracking connection...");
      console.log("Current address:", address);
      
      // Add small delay to ensure provider is ready
      setTimeout(async () => {
        if (isMounted) {
          try {
            const userId = await trackWalletConnection(address);
            if (userId) {
              console.log("Wallet connection tracked successfully, user ID:", userId);
              setIsTracked(true);
            } else {
              console.error("Failed to track wallet connection");
            }
          } catch (error) {
            console.error("Error in wallet tracking:", error);
          }
        }
      }, 500);  // Increased delay to ensure wallet is fully connected
    } else if (!isConnected) {
      setIsTracked(false);
    }
    
    return () => {
      isMounted = false;
    };
  }, [isConnected, address, isTracked]);
  
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
