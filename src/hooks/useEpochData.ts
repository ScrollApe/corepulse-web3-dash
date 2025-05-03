
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface EpochData {
  id: number;
  start_date: string;
  end_date: string;
  status: string | null;
  daysLeft: number;
  hoursLeft: number;
  minutesLeft: number;
  progress: number;
}

export const useEpochData = () => {
  const [epochData, setEpochData] = useState<EpochData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentEpoch = async () => {
      try {
        setLoading(true);
        
        // Get current epoch using the SQL function
        const { data: epochId } = await supabase.rpc('get_current_epoch_id');
        
        if (epochId) {
          // Get details of the current epoch
          const { data: epoch, error } = await supabase
            .from('epochs')
            .select('*')
            .eq('id', epochId)
            .single();
            
          if (error) throw error;
          
          if (epoch) {
            const endDate = new Date(epoch.end_date);
            const now = new Date();
            const diff = endDate.getTime() - now.getTime();
            
            const daysLeft = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hoursLeft = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            
            const startDate = new Date(epoch.start_date);
            const totalDuration = endDate.getTime() - startDate.getTime();
            const elapsed = now.getTime() - startDate.getTime();
            const progress = Math.floor((elapsed / totalDuration) * 100);
            
            setEpochData({
              ...epoch,
              daysLeft,
              hoursLeft,
              minutesLeft,
              progress
            });
          }
        }
      } catch (error) {
        console.error('Error fetching epoch data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCurrentEpoch();
    
    // Set up real-time listener for epochs table
    const channel = supabase
      .channel('epoch-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'epochs' }, 
        fetchCurrentEpoch
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  return { epochData, loading };
};
