
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAccount } from 'wagmi';

export interface EarningsData {
  daily: { name: string; value: number }[];
  weekly: { name: string; value: number }[];
  monthly: { name: string; value: number }[];
  totalMined: number;
}

export const useEarningsData = () => {
  const [earningsData, setEarningsData] = useState<EarningsData>({
    daily: [],
    weekly: [],
    monthly: [],
    totalMined: 0
  });
  const [loading, setLoading] = useState(true);
  const { address, isConnected } = useAccount();

  useEffect(() => {
    const fetchEarningsData = async () => {
      if (!isConnected || !address) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Get user id
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, total_mined')
          .eq('wallet_address', address.toLowerCase())
          .single();
          
        if (userError || !userData) {
          console.error('Error fetching user data:', userError);
          setLoading(false);
          return;
        }
        
        // Get daily mining sessions for the last 24 hours
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        
        const { data: dailySessions, error: dailyError } = await supabase
          .from('mining_sessions')
          .select('earned_amount, start_time')
          .eq('user_id', userData.id)
          .gte('start_time', oneDayAgo.toISOString())
          .order('start_time', { ascending: true });
          
        if (dailyError) {
          console.error('Error fetching daily sessions:', dailyError);
        }
        
        // Group sessions by hour
        const dailyData: { name: string; value: number }[] = Array(6).fill(0).map((_, i) => {
          const hour = i * 4; // 0, 4, 8, 12, 16, 20
          return { 
            name: `${hour.toString().padStart(2, '0')}:00`, 
            value: 0 
          };
        });
        
        dailySessions?.forEach(session => {
          const date = new Date(session.start_time);
          const hour = date.getHours();
          const index = Math.floor(hour / 4);
          
          if (index >= 0 && index < dailyData.length) {
            dailyData[index].value += session.earned_amount || 0;
          }
        });
        
        // Get weekly data (last 7 days)
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const { data: weeklySessions, error: weeklyError } = await supabase
          .from('mining_sessions')
          .select('earned_amount, start_time')
          .eq('user_id', userData.id)
          .gte('start_time', oneWeekAgo.toISOString())
          .order('start_time', { ascending: true });
          
        if (weeklyError) {
          console.error('Error fetching weekly sessions:', weeklyError);
        }
        
        // Group sessions by day
        const weeklyData: { name: string; value: number }[] = Array(7).fill(0).map((_, i) => {
          const day = new Date();
          day.setDate(day.getDate() - (6 - i));
          const dayName = day.toLocaleDateString('en-US', { weekday: 'short' });
          
          return { name: dayName, value: 0 };
        });
        
        weeklySessions?.forEach(session => {
          const date = new Date(session.start_time);
          const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
          const index = dayOfWeek;
          
          if (index >= 0 && index < weeklyData.length) {
            weeklyData[index].value += session.earned_amount || 0;
          }
        });
        
        // Get monthly data (last 4 weeks)
        const fourWeeksAgo = new Date();
        fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);
        
        const { data: monthlySessions, error: monthlyError } = await supabase
          .from('mining_sessions')
          .select('earned_amount, start_time')
          .eq('user_id', userData.id)
          .gte('start_time', fourWeeksAgo.toISOString())
          .order('start_time', { ascending: true });
          
        if (monthlyError) {
          console.error('Error fetching monthly sessions:', monthlyError);
        }
        
        // Group sessions by week
        const monthlyData: { name: string; value: number }[] = Array(4).fill(0).map((_, i) => {
          return { name: `Week ${i + 1}`, value: 0 };
        });
        
        monthlySessions?.forEach(session => {
          const date = new Date(session.start_time);
          const daysAgo = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
          const weekIndex = Math.floor(daysAgo / 7);
          
          if (weekIndex >= 0 && weekIndex < monthlyData.length) {
            monthlyData[monthlyData.length - 1 - weekIndex].value += session.earned_amount || 0;
          }
        });
        
        setEarningsData({
          daily: dailyData,
          weekly: weeklyData,
          monthly: monthlyData,
          totalMined: userData.total_mined || 0
        });
        
      } catch (error) {
        console.error('Error in useEarningsData:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEarningsData();
    
    // Set up real-time subscription
    if (isConnected && address) {
      const channel = supabase
        .channel('earnings-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'mining_sessions' }, 
          fetchEarningsData
        )
        .on('postgres_changes', 
          { event: 'UPDATE', schema: 'public', table: 'users', filter: `wallet_address=eq.${address.toLowerCase()}` }, 
          fetchEarningsData
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [address, isConnected]);
  
  return { earningsData, loading };
};
