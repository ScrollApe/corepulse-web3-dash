
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAccount } from 'wagmi';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  unlocked: boolean;
  unlocked_at: string | null;
}

export const useUserAchievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const { address, isConnected } = useAccount();

  useEffect(() => {
    const fetchAchievements = async () => {
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
        
        // Get all achievements
        const { data: allAchievements, error: achievementsError } = await supabase
          .from('achievements')
          .select('*');
          
        if (achievementsError) {
          console.error('Error fetching achievements:', achievementsError);
          setLoading(false);
          return;
        }
        
        // Get user's unlocked achievements
        const { data: userAchievements, error: userAchievementsError } = await supabase
          .from('user_achievements')
          .select('achievement_id, unlocked_at')
          .eq('user_id', userData.id);
          
        if (userAchievementsError) {
          console.error('Error fetching user achievements:', userAchievementsError);
        }
        
        // Map unlocked status to achievements
        const userAchievementMap = new Map();
        userAchievements?.forEach(item => {
          userAchievementMap.set(item.achievement_id, item.unlocked_at);
        });
        
        // Combine data
        const combinedAchievements = allAchievements.map(achievement => ({
          ...achievement,
          unlocked: userAchievementMap.has(achievement.id),
          unlocked_at: userAchievementMap.get(achievement.id) || null
        }));
        
        setAchievements(combinedAchievements);
        
      } catch (error) {
        console.error('Error in useUserAchievements:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAchievements();
    
    // Set up real-time subscriptions
    if (isConnected && address) {
      const channel = supabase
        .channel('achievement-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'user_achievements' }, 
          fetchAchievements
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [address, isConnected]);
  
  return { achievements, loading };
};
