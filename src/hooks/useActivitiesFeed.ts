
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

interface Activity {
  id: string;
  activity: 'wallet_connect' | 'start_mining' | 'stop_mining' | 'join_crew' | 'leave_crew' | 'mint_nft' | 'claim_reward';
  created_at: string;
  metadata: Record<string, any>;
  user_id: string;
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

  useEffect(() => {
    // Simulate loading
    setLoading(true);
    
    // Create mock activities since we're removing database implementation
    setTimeout(() => {
      const mockActivities: Activity[] = [
        {
          id: '1',
          activity: 'wallet_connect',
          created_at: new Date().toISOString(),
          metadata: {},
          user_id: '1'
        },
        {
          id: '2',
          activity: 'start_mining',
          created_at: new Date(Date.now() - 10 * 60000).toISOString(),
          metadata: { rate: 0.0012 },
          user_id: '1'
        },
        {
          id: '3',
          activity: 'stop_mining',
          created_at: new Date(Date.now() - 5 * 60000).toISOString(),
          metadata: { earned: '0.006', duration: 5 },
          user_id: '1'
        }
      ];

      setActivities(mockActivities);
      setLoading(false);
    }, 500);

    // No cleanup needed for mock data
  }, [global, limit, address]);
  
  return { activities, loading, error };
};
