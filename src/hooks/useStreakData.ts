
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAccount } from 'wagmi';

export interface StreakData {
  currentStreak: number;
  bestStreak: number;
  lastCheckIn: string | null;
  activityPattern: boolean[];
}

export const useStreakData = () => {
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    bestStreak: 0,
    lastCheckIn: null,
    activityPattern: Array(7).fill(false)
  });
  const [loading, setLoading] = useState(true);
  const { address } = useAccount();

  useEffect(() => {
    const fetchStreakData = async () => {
      if (!address) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Get user id from wallet address
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
        
        // Get streak data
        const { data: streakData, error: streakError } = await supabase
          .from('streaks')
          .select('current_streak_days, best_streak_days, last_check_in')
          .eq('user_id', userData.id)
          .single();
          
        if (streakError && streakError.code !== 'PGRST116') {
          console.error('Error fetching streak data:', streakError);
          setLoading(false);
          return;
        }
        
        // Get recent activity (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const { data: activities, error: activityError } = await supabase
          .from('user_activities')
          .select('created_at')
          .eq('user_id', userData.id)
          .gte('created_at', sevenDaysAgo.toISOString())
          .order('created_at', { ascending: false });
          
        if (activityError) {
          console.error('Error fetching activity data:', activityError);
        }
        
        // Calculate activity pattern for the last 7 days
        const activityPattern = Array(7).fill(false);
        
        if (activities) {
          // Group activities by day
          const activityDays = new Set();
          
          activities.forEach(activity => {
            const date = new Date(activity.created_at);
            activityDays.add(date.toDateString());
          });
          
          // Fill activity pattern
          for (let i = 0; i < 7; i++) {
            const day = new Date();
            day.setDate(day.getDate() - i);
            activityPattern[6 - i] = activityDays.has(day.toDateString());
          }
        }
        
        setStreakData({
          currentStreak: streakData?.current_streak_days || 0,
          bestStreak: streakData?.best_streak_days || 0,
          lastCheckIn: streakData?.last_check_in || null,
          activityPattern
        });
        
      } catch (error) {
        console.error('Error in fetchStreakData:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStreakData();
    
    // Set up real-time listener
    if (address) {
      const channel = supabase
        .channel('streak-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'streaks' }, 
          fetchStreakData
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [address]);
  
  return { streakData, loading };
};
