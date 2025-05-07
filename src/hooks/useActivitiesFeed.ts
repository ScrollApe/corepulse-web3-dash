
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useActivity } from '@/providers/ActivityProvider';

interface Activity {
  id: string;
  activity: 'wallet_connect' | 'start_mining' | 'stop_mining' | 'join_crew' | 'leave_crew' | 'mint_nft' | 'claim_reward';
  created_at: string;
  metadata: Record<string, any>;
  user_id: string;
  is_on_chain: boolean;
  tx_hash?: string;
}

interface UseActivitiesFeedOptions {
  limit?: number;
  global?: boolean;
}

export const useActivitiesFeed = ({ limit = 20, global = false }: UseActivitiesFeedOptions = {}) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { address } = useAccount();
  const { activities: contextActivities } = useActivity();

  useEffect(() => {
    // Simulate loading
    setLoading(true);
    
    // Create mock activities + use any from context
    setTimeout(() => {
      try {
        const mockActivities: Activity[] = [
          {
            id: '1',
            activity: 'wallet_connect',
            created_at: new Date().toISOString(),
            metadata: {},
            user_id: '0x1234567890abcdef1234567890abcdef12345678',
            is_on_chain: false
          },
          {
            id: '2',
            activity: 'start_mining',
            created_at: new Date(Date.now() - 10 * 60000).toISOString(),
            metadata: { rate: 0.0012 },
            user_id: '0x1234567890abcdef1234567890abcdef12345678',
            is_on_chain: false
          },
          {
            id: '3',
            activity: 'stop_mining',
            created_at: new Date(Date.now() - 5 * 60000).toISOString(),
            metadata: { earned: '0.006', duration: 5 },
            user_id: '0x1234567890abcdef1234567890abcdef12345678',
            is_on_chain: false
          },
          {
            id: '4',
            activity: 'mint_nft',
            created_at: new Date(Date.now() - 60 * 60000).toISOString(),
            metadata: { tier: 'Gold' },
            user_id: '0x9876543210fedcba9876543210fedcba98765432',
            is_on_chain: true,
            tx_hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
          }
        ];

        // Combine mock activities with any real ones from context
        const combinedActivities = [...contextActivities, ...mockActivities];
        
        // Filter activities based on global flag
        const filteredActivities = global 
          ? combinedActivities 
          : combinedActivities.filter(a => a.user_id === address);
          
        // Sort by creation date (newest first)
        const sortedActivities = filteredActivities.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        setActivities(sortedActivities.slice(0, limit));
        setLoading(false);
      } catch (err) {
        console.error('Error processing activities:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setLoading(false);
      }
    }, 500);
  }, [global, limit, address, contextActivities]);
  
  return { activities, loading, error };
};
