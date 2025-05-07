
import React, { createContext, useContext, ReactNode, useState } from 'react';
import { useAccount } from 'wagmi';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';

export type ActivityType = 'wallet_connect' | 'start_mining' | 'stop_mining' | 'join_crew' | 'leave_crew' | 'mint_nft' | 'claim_reward';

interface Activity {
  id: string;
  activity: ActivityType;
  created_at: string;
  metadata: Record<string, any>;
  user_id: string;
  is_on_chain: boolean;
  tx_hash?: string;
}

interface ActivityContextType {
  logActivity: (activity: ActivityType, metadata?: Record<string, any>, forceOnChain?: boolean) => Promise<void>;
  activities: Activity[];
  loading: boolean;
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export const useActivity = () => {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error('useActivity must be used within an ActivityProvider');
  }
  return context;
};

interface ActivityProviderProps {
  children: ReactNode;
}

// Helper to determine if an activity is critical and should be stored on-chain
const isCriticalActivity = (activity: ActivityType): boolean => {
  // Activities that would be stored on-chain in a real implementation
  return ['mint_nft', 'claim_reward'].includes(activity);
};

export const ActivityProvider = ({ children }: ActivityProviderProps) => {
  const { address, isConnected } = useAccount();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Simulated on-chain activity logging
  const logToBlockchain = async (activity: ActivityType, metadata: Record<string, any>): Promise<string> => {
    console.log('Simulating blockchain transaction for:', activity);
    
    // Simulate blockchain transaction delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate a fake transaction hash
    const txHash = `0x${Array.from({length: 64}, () => 
      '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('')}`;
    
    console.log('Transaction completed with hash:', txHash);
    return txHash;
  };

  // Log to off-chain database
  const logToDatabase = async (
    activity: ActivityType, 
    metadata: Record<string, any>,
    isOnChain: boolean,
    txHash?: string
  ): Promise<void> => {
    if (!isConnected || !address) return;

    try {
      // In a real implementation, this would insert into Supabase
      console.log(`Logging activity to database: ${activity}`, {
        user_id: address,
        activity,
        metadata,
        is_on_chain: isOnChain,
        tx_hash: txHash
      });
      
      // Simulate adding to local state for demo purposes
      const newActivity = {
        id: `local-${Date.now()}`,
        activity,
        created_at: new Date().toISOString(),
        metadata,
        user_id: address,
        is_on_chain: isOnChain,
        tx_hash: txHash
      };
      
      setActivities(prev => [newActivity, ...prev]);
    } catch (error) {
      console.error('Failed to log activity to database:', error);
    }
  };

  const logActivity = async (
    activity: ActivityType, 
    metadata: Record<string, any> = {},
    forceOnChain = false
  ): Promise<void> => {
    if (!isConnected || !address) {
      console.warn('Cannot log activity: wallet not connected');
      return;
    }
    
    setLoading(true);
    
    try {
      // Determine if activity should be stored on-chain
      const shouldStoreOnChain = forceOnChain || isCriticalActivity(activity);
      
      // For critical activities, log to both blockchain and database
      if (shouldStoreOnChain) {
        toast.loading("Recording activity on blockchain...", {
          id: `blockchain-${activity}`,
        });
        
        // Simulate blockchain transaction
        const txHash = await logToBlockchain(activity, metadata);
        
        // Log to database with blockchain reference
        await logToDatabase(activity, metadata, true, txHash);
        
        toast.success("Activity recorded on blockchain!", {
          id: `blockchain-${activity}`,
          description: `Transaction: ${txHash.slice(0, 10)}...`
        });
      } else {
        // For non-critical activities, just log to database
        await logToDatabase(activity, metadata, false);
        
        // Show appropriate toast for the activity
        if (activity === 'wallet_connect') {
          toast("Wallet Connected", {
            description: "Your wallet has been successfully connected.",
          });
        } else if (activity === 'start_mining') {
          toast("Mining Started", {
            description: "You've started mining.",
          });
        } else if (activity === 'stop_mining') {
          toast("Mining Stopped", {
            description: `Mining session ended.`,
          });
        }
      }
    } catch (error) {
      console.error(`Failed to log activity ${activity}:`, error);
      
      // If blockchain logging fails, log to database anyway
      if (isCriticalActivity(activity)) {
        toast.error("Failed to record on blockchain", {
          id: `blockchain-${activity}`,
          description: "Saved off-chain only"
        });
        
        await logToDatabase(activity, metadata, false);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ActivityContext.Provider value={{ logActivity, activities, loading }}>
      {children}
    </ActivityContext.Provider>
  );
};

export default ActivityProvider;
