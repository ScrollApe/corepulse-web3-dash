
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
    const formattedAddress = address.toLowerCase();
    
    // Check if user exists with explicit return type
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id, wallet_address, joined_at')
      .eq('wallet_address', formattedAddress)
      .maybeSingle();
      
    if (fetchError) {
      console.error('Error checking for existing user:', fetchError);
      return null;
    }
    
    // If user doesn't exist, create new user
    if (!existingUser) {
      console.log('Creating new user for address:', formattedAddress);
      
      // Try direct insert with service role client
      try {
        const { data, error: insertError } = await supabase
          .from('users')
          .insert([
            { 
              wallet_address: formattedAddress,
              level: 1,
              experience: 0,
              next_level_exp: 100,
              total_mined: 0,
              avatar_stage: 1
            }
          ])
          .select('id')
          .single();
          
        if (insertError) {
          console.error('Error creating user:', insertError);
          console.error('Insert error details:', insertError.message, insertError.details);
          
          // If there's an RLS error, try logging it more explicitly
          if (insertError.message.includes('row-level security')) {
            console.error('RLS policy preventing insert. Make sure your RLS policies allow insertion for this table.');
            
            toast('Failed to register wallet', {
              description: 'There was a security error creating your account. Please try again later.',
            });
          } else {
            toast('Failed to register wallet', {
              description: 'There was an error creating your account. Please try again.',
            });
          }
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
          .insert([
            { 
              user_id: data.id,
              current_streak_days: 1,
              last_check_in: new Date().toISOString()
            }
          ]);
        
        if (streakError) {
          console.error('Error creating initial streak:', streakError);
        }
          
        toast('Welcome to CorePulse!', {
          description: 'Your account has been created.',
        });
        
        return data.id;
      } catch (insertCatchError) {
        console.error('Caught exception during user insertion:', insertCatchError);
        toast('Registration Error', {
          description: 'There was an error creating your account. Please try again.',
        });
        return null;
      }
    } else {
      console.log('User exists for address:', formattedAddress, 'with ID:', existingUser.id);
      
      // User exists, log wallet connection
      const { error: activityError } = await supabase
        .from('user_activities')
        .insert([{
          user_id: existingUser.id,
          activity: 'wallet_connect',
          metadata: {},
        }]);
        
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
        // Ensure we have the last_check_in property before proceeding
        if (streakData.last_check_in) {
          const lastDate = new Date(streakData.last_check_in);
          const lastCheckInDate = lastDate.toISOString().split('T')[0];
          
          if (today !== lastCheckInDate) {
            // It's a new day, update streak
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            // Check if last check-in was yesterday (to maintain streak)
            const isConsecutiveDay = lastCheckInDate === yesterday.toISOString().split('T')[0];
            
            await supabase
              .from('streaks')
              .update({
                current_streak_days: isConsecutiveDay ? streakData.current_streak_days + 1 : 1,
                last_check_in: new Date().toISOString(),
              })
              .eq('user_id', existingUser.id);
          }
        } else {
          // No last check-in date, initialize it
          await supabase
            .from('streaks')
            .update({
              last_check_in: new Date().toISOString(),
            })
            .eq('user_id', existingUser.id);
        }
      } else if (streakFetchError) {
        console.error('Error fetching streak data:', streakFetchError);
        
        // If streak record doesn't exist, create it
        if (streakFetchError.code === 'PGRST116') {
          const { error: createStreakError } = await supabase
            .from('streaks')
            .insert([{
              user_id: existingUser.id,
              current_streak_days: 1,
              last_check_in: new Date().toISOString(),
            }]);
            
          if (createStreakError) {
            console.error('Error creating streak record:', createStreakError);
          }
        }
      }
      
      toast('Welcome back!', {
        description: 'Your wallet has been connected.',
      });
      
      return existingUser.id;
    }
  } catch (error) {
    console.error('Error tracking wallet connection:', error);
    toast('Connection Error', {
      description: 'There was an error tracking your wallet connection.',
    });
    return null;
  }
};

const WalletConnectionTracker = () => {
  const { address, isConnected } = useAccount();
  const [isTracked, setIsTracked] = useState(false);
  const [trackingAttempts, setTrackingAttempts] = useState(0);
  const maxAttempts = 3;

  useEffect(() => {
    let isMounted = true;
    
    if (isConnected && address && !isTracked) {
      console.log("WalletConnectionTracker: Wallet connected, tracking connection...");
      console.log("Current address:", address);
      
      // Add delay to ensure provider is ready
      setTimeout(async () => {
        if (!isMounted) return;
        
        try {
          const userId = await trackWalletConnection(address);
          if (userId) {
            console.log("Wallet connection tracked successfully, user ID:", userId);
            setIsTracked(true);
            setTrackingAttempts(0); // Reset attempts on success
          } else {
            console.error("Failed to track wallet connection");
            
            // If we've tried less than max times, try again
            if (trackingAttempts < maxAttempts - 1) {
              setTrackingAttempts(prev => prev + 1);
              setIsTracked(false); // Ensure we retry on next render
              
              // Show toast on repeated failures
              if (trackingAttempts > 0) {
                toast('Retrying connection...', {
                  description: `Attempt ${trackingAttempts + 1} of ${maxAttempts}`,
                });
              }
            } else {
              console.error("Maximum tracking attempts reached");
              toast('Connection Issue', {
                description: 'We had trouble connecting your wallet to our systems. Please try again later.',
              });
              // Reset for future attempts
              setTrackingAttempts(0);
            }
          }
        } catch (error) {
          console.error("Error in wallet tracking:", error);
          toast('Connection Error', {
            description: 'There was an unexpected error connecting your wallet.',
          });
        }
      }, 1500);  // Increased delay to ensure wallet is fully connected
    } else if (!isConnected) {
      setIsTracked(false);
      setTrackingAttempts(0); // Reset attempts when disconnected
    }
    
    return () => {
      isMounted = false;
    };
  }, [isConnected, address, isTracked, trackingAttempts]);
  
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
        console.log("Opening wallet connect modal...");
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
