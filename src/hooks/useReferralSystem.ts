
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAccount } from 'wagmi';
import { useActivity } from '@/providers/ActivityProvider';
import { toast } from '@/components/ui/sonner';

export interface ReferralData {
  referralCode: string;
  referralLink: string;
  referralCount: number;
  bonusEarned: number;
}

export const useReferralSystem = () => {
  const [referralData, setReferralData] = useState<ReferralData>({
    referralCode: '',
    referralLink: '',
    referralCount: 0,
    bonusEarned: 0
  });
  const [loading, setLoading] = useState(true);
  const { address, isConnected } = useAccount();
  const { logActivity } = useActivity();

  // Generate a referral code based on the wallet address
  const generateReferralCode = (address: string) => {
    return address.substring(2, 8).toUpperCase();
  };

  useEffect(() => {
    const fetchReferralData = async () => {
      if (!isConnected || !address) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Get user ID
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
        
        const userId = userData.id;
        const referralCode = generateReferralCode(address);
        
        // Get referral count
        const { count, error: countError } = await supabase
          .from('referrals')
          .select('*', { count: 'exact', head: true })
          .eq('referrer_id', userId);
          
        if (countError) {
          console.error('Error fetching referral count:', countError);
        }
        
        // Calculate bonus earned
        const { data: referrals, error: referralsError } = await supabase
          .from('referrals')
          .select('bonus_percent')
          .eq('referrer_id', userId);
          
        if (referralsError) {
          console.error('Error fetching referrals:', referralsError);
        }
        
        const bonusEarned = referrals?.reduce((sum, referral) => sum + (referral.bonus_percent || 0), 0) || 0;
        
        setReferralData({
          referralCode,
          referralLink: `${window.location.origin}/ref/${referralCode}`,
          referralCount: count || 0,
          bonusEarned
        });
        
      } catch (error) {
        console.error('Error in fetchReferralData:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReferralData();
    
    // Set up real-time subscription
    if (isConnected && address) {
      const channel = supabase
        .channel('referral-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'referrals' }, 
          fetchReferralData
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [address, isConnected]);
  
  // Function to apply a referral code
  const applyReferralCode = async (code: string) => {
    if (!isConnected || !address) {
      toast.error("You need to connect your wallet first");
      return false;
    }
    
    if (code === generateReferralCode(address)) {
      toast.error("You cannot refer yourself");
      return false;
    }
    
    try {
      // Get referrer by code
      const referrerAddress = '0x' + code.toLowerCase();
      const { data: referrerData, error: referrerError } = await supabase
        .from('users')
        .select('id')
        .ilike('wallet_address', `%${referrerAddress}%`)
        .single();
        
      if (referrerError || !referrerData) {
        toast.error("Invalid referral code");
        return false;
      }
      
      // Check if user already has a referrer
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('wallet_address', address.toLowerCase())
        .single();
        
      if (userError || !userData) {
        toast.error("Error getting user data");
        return false;
      }
      
      const { data: existingReferral, error: existingError } = await supabase
        .from('referrals')
        .select('*')
        .eq('referred_wallet', address.toLowerCase())
        .single();
        
      if (existingReferral) {
        toast.error("You already have a referrer");
        return false;
      }
      
      // Create referral
      const { error: insertError } = await supabase
        .from('referrals')
        .insert({
          referrer_id: referrerData.id,
          referred_wallet: address.toLowerCase(),
          bonus_percent: 5, // 5% bonus
        });
        
      if (insertError) {
        toast.error("Error applying referral code");
        return false;
      }
      
      await logActivity('join_crew', { referral_code: code });
      
      toast.success("Referral code applied successfully");
      return true;
      
    } catch (error) {
      console.error('Error in applyReferralCode:', error);
      toast.error("Error applying referral code");
      return false;
    }
  };
  
  return { referralData, loading, applyReferralCode };
};
