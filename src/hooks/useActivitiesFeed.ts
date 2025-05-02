
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
    const fetchActivities = async () => {
      try {
        setLoading(true);
        
        let query = supabase
          .from('user_activities')
          .select('*, users:user_id(wallet_address)')
          .order('created_at', { ascending: false })
          .limit(limit);
        
        if (!global && address) {
          // Filter for user's own activities if not global feed
          const { data: userData } = await supabase
            .from('users')
            .select('id')
            .eq('wallet_address', address.toLowerCase())
            .single();
            
          if (userData) {
            query = query.eq('user_id', userData.id);
          }
        }
        
        const { data, error: activitiesError } = await query;
        
        if (activitiesError) {
          throw activitiesError;
        }
        
        setActivities(data as Activity[]);
      } catch (err) {
        console.error('Error fetching activities:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchActivities();
    
    // Set up real-time listener
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_activities',
        },
        (payload) => {
          setActivities((prev) => [payload.new as Activity, ...prev].slice(0, limit));
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [global, limit, address]);
  
  return { activities, loading, error };
};
