
import React, { createContext, useContext, ReactNode } from 'react';
import { useAccount } from 'wagmi';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export type ActivityType = 'wallet_connect' | 'start_mining' | 'stop_mining' | 'join_crew' | 'leave_crew' | 'mint_nft' | 'claim_reward';

interface ActivityContextType {
  logActivity: (activity: ActivityType, metadata?: Record<string, any>) => Promise<void>;
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

  const logActivity = async (activity: ActivityType, metadata: Record<string, any> = {}) => {
    if (!isConnected || !address) {
      console.warn('Cannot log activity: wallet not connected');
      return;
    }

    try {
      // Get user id from wallet address
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('wallet_address', address.toLowerCase())
        .single();

      if (userError || !userData) {
        console.error('Error fetching user id:', userError);
        return;
      }

      const userId = userData.id;

      // Record activity
      const { error } = await supabase
        .from('user_activities')
        .insert({
          user_id: userId,
          activity,
          metadata,
        });

      if (error) {
        console.error('Error logging activity:', error);
        toast("Failed to log activity", {
          description: "There was an error recording your activity.",
        });
      }
    } catch (error) {
      console.error('Error in logActivity:', error);
    }
  };

  return (
    <ActivityContext.Provider value={{ logActivity }}>
      {children}
    </ActivityContext.Provider>
  );
};

export default ActivityProvider;
