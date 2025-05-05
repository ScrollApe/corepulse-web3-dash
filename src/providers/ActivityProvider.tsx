
import React, { createContext, useContext, ReactNode } from 'react';
import { useAccount } from 'wagmi';
import { toast } from '@/components/ui/sonner';

export type ActivityType = 'wallet_connect' | 'start_mining' | 'stop_mining' | 'join_crew' | 'leave_crew' | 'mint_nft' | 'claim_reward';

interface ActivityContextType {
  logActivity: (activity: ActivityType, metadata?: Record<string, any>) => void;
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

export const ActivityProvider = ({ children }: ActivityProviderProps) => {
  const { address, isConnected } = useAccount();

  const logActivity = (activity: ActivityType, metadata: Record<string, any> = {}) => {
    if (!isConnected || !address) {
      console.warn('Cannot log activity: wallet not connected');
      return;
    }

    // Just log to console instead of database
    console.log(`Activity logged: ${activity}`, metadata);
    
    // Show toast for important activities
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
  };

  return (
    <ActivityContext.Provider value={{ logActivity }}>
      {children}
    </ActivityContext.Provider>
  );
};

export default ActivityProvider;
