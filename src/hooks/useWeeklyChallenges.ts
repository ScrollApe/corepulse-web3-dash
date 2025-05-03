
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAccount } from 'wagmi';

export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  goal: number;
  reward: number;
  challenge_type: string;
  end_date: string;
  progress: number;
  completed: boolean;
}

export const useWeeklyChallenges = () => {
  const [challenges, setChallenges] = useState<WeeklyChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const { address, isConnected } = useAccount();

  useEffect(() => {
    const fetchChallenges = async () => {
      if (!isConnected || !address) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Get user id
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('wallet_address', address.toLowerCase())
          .single();
          
        if (userError || !userData) {
          console.error('Error fetching user data:', userError);
          setLoading(false);
          return;
        }
        
        // Get active challenges with user progress
        const { data, error } = await supabase
          .from('weekly_challenges')
          .select(`
            *,
            user_progress:user_weekly_challenges!inner(
              progress,
              completed
            )
          `)
          .eq('user_progress.user_id', userData.id)
          .gte('end_date', new Date().toISOString());
          
        if (error) {
          console.error('Error fetching challenges:', error);
          setLoading(false);
          return;
        }
        
        // If no challenges found with user progress, get all active challenges
        if (!data?.length) {
          const { data: activeChallenges, error: activeError } = await supabase
            .from('weekly_challenges')
            .select('*')
            .gte('end_date', new Date().toISOString());
            
          if (activeError) {
            console.error('Error fetching active challenges:', activeError);
            setLoading(false);
            return;
          }
          
          // Transform the data to match expected format
          const transformedChallenges = activeChallenges?.map(challenge => ({
            ...challenge,
            progress: 0,
            completed: false
          })) || [];
          
          setChallenges(transformedChallenges);
        } else {
          // Transform the data to flatten the nested structure
          const transformedChallenges = data.map(item => {
            // Handle the case where user_progress might be an array
            const userProgress = Array.isArray(item.user_progress) 
              ? item.user_progress[0] 
              : item.user_progress;
              
            return {
              ...item,
              progress: userProgress?.progress || 0,
              completed: userProgress?.completed || false
            };
          });
          
          setChallenges(transformedChallenges);
        }
        
      } catch (error) {
        console.error('Error in useWeeklyChallenges:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchChallenges();
    
    // Set up real-time subscriptions
    if (isConnected && address) {
      const channel = supabase
        .channel('weekly-challenge-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'weekly_challenges' }, 
          fetchChallenges
        )
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'user_weekly_challenges' }, 
          fetchChallenges
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [address, isConnected]);
  
  return { challenges, loading };
};
