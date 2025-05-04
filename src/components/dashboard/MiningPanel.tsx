
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import PulseWave from '@/components/ui/PulseWave';
import { useAccount } from 'wagmi';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { useWalletConnect } from '@/providers/WalletProvider';
import { useActivity } from '@/providers/ActivityProvider';

const MiningPanel = () => {
  const [isMining, setIsMining] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rate, setRate] = useState(0.0012);
  const [earned, setEarned] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [dailyLimits, setDailyLimits] = useState({
    minutesUsed: 0,
    maxMinutes: 240, // 4 hours default
    remaining: 240,
  });
  const [userId, setUserId] = useState<string | null>(null);
  const [userVerified, setUserVerified] = useState(false);
  
  const { isConnected, address } = useAccount();
  const { connect } = useWalletConnect();
  const { logActivity } = useActivity();
  
  // Fetch user ID when wallet is connected
  useEffect(() => {
    const fetchUserId = async () => {
      if (!isConnected || !address) {
        setUserId(null);
        setUserVerified(false);
        return;
      }
      
      try {
        setIsLoading(true);
        console.log("Checking database for wallet address:", address.toLowerCase());
        
        const { data, error } = await supabase
          .from('users')
          .select('id')
          .eq('wallet_address', address.toLowerCase())
          .maybeSingle();
          
        if (error) {
          console.error('Error fetching user:', error);
          toast('Error', {
            description: 'Could not verify your wallet. Please try reconnecting.'
          });
          setUserVerified(false);
          return;
        }
        
        if (data) {
          console.log('User verified with ID:', data.id);
          setUserId(data.id);
          setUserVerified(true);
        } else {
          console.error('No user found for wallet address:', address);
          toast('Wallet Not Registered', {
            description: 'Please reconnect your wallet to register it.'
          });
          setUserVerified(false);
        }
      } catch (error) {
        console.error('Error in fetchUserId:', error);
        setUserVerified(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserId();
  }, [isConnected, address]);
  
  // Fetch daily limits when user ID is available
  useEffect(() => {
    const fetchDailyLimits = async () => {
      if (!userId) return;
      
      try {
        const today = new Date().toISOString().split('T')[0];
        
        // Check if entry exists for today
        const { data: limitData, error: limitError } = await supabase
          .from('daily_mining_limits')
          .select('*')
          .eq('user_id', userId)
          .eq('date', today)
          .single();
          
        if (limitError && limitError.code !== 'PGRST116') { // PGRST116 is "No rows returned" error
          console.error('Error fetching daily limits:', limitError);
          return;
        }
        
        if (limitData) {
          setDailyLimits({
            minutesUsed: limitData.minutes_mined,
            maxMinutes: limitData.max_minutes,
            remaining: limitData.max_minutes - limitData.minutes_mined,
          });
        } else {
          // Create a new entry for today
          const { error: insertError } = await supabase
            .from('daily_mining_limits')
            .insert({
              user_id: userId,
              date: today,
              minutes_mined: 0,
              max_minutes: 240, // 4 hours default
            });
            
          if (insertError) {
            console.error('Error creating daily limit:', insertError);
          }
        }
      } catch (error) {
        console.error('Error in fetchDailyLimits:', error);
      }
    };
    
    fetchDailyLimits();
    
    // Set up realtime subscription
    if (userId) {
      const channel = supabase
        .channel('daily-limits-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'daily_mining_limits',
          },
          (payload) => {
            if (payload.new) {
              const newData = payload.new as any;
              setDailyLimits({
                minutesUsed: newData.minutes_mined,
                maxMinutes: newData.max_minutes,
                remaining: newData.max_minutes - newData.minutes_mined,
              });
            }
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [userId]);

  // Handle mining calculation
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isMining) {
      interval = setInterval(() => {
        setEarned(prev => {
          const increase = rate / (60 * 10); // rate per 100ms
          return prev + increase;
        });
      }, 100);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isMining, rate]);

  // Record mining session
  const startMiningSession = async () => {
    if (!isConnected || !address) {
      connect();
      return;
    }
    
    if (!userVerified || !userId) {
      toast("Wallet Authentication Required", {
        description: "Please reconnect your wallet to verify your account.",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Double-check user exists
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();
        
      if (userError || !userData) {
        console.error('Error verifying user:', userError);
        toast("Authentication Error", {
          description: "Could not verify your account. Please reconnect your wallet.",
        });
        return;
      }
      
      // Check daily limits
      if (dailyLimits.remaining <= 0) {
        toast("Daily Limit Reached", {
          description: "You've reached your daily mining limit. Come back tomorrow!",
        });
        return;
      }
      
      // Create new mining session
      const { data: sessionData, error: sessionError } = await supabase
        .from('mining_sessions')
        .insert({
          user_id: userId,
          base_rate: rate,
          nft_boost_percent: 0, // Assuming this will be calculated separately
          referral_bonus_percent: 0, // Assuming this will be calculated separately
        })
        .select()
        .single();
        
      if (sessionError) {
        console.error('Error creating mining session:', sessionError);
        toast("Error Starting Mining", {
          description: "Failed to start mining session.",
        });
        return;
      }
      
      setSessionStartTime(new Date());
      setIsMining(true);
      
      // Log activity
      await logActivity('start_mining', { session_id: sessionData.id });
      
      toast("Mining Started", {
        description: "Your mining session has begun!",
      });
      
    } catch (error) {
      console.error('Error in startMiningSession:', error);
      toast("Error", {
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const stopMiningSession = async () => {
    if (!userId || !sessionStartTime) return;
    
    try {
      setIsLoading(true);
      
      // Get latest mining session
      const { data: sessionData, error: sessionError } = await supabase
        .from('mining_sessions')
        .select('*')
        .eq('user_id', userId)
        .is('end_time', null)
        .order('start_time', { ascending: false })
        .limit(1)
        .single();
        
      if (sessionError) {
        console.error('Error fetching mining session:', sessionError);
        return;
      }
      
      const now = new Date();
      const durationMs = now.getTime() - sessionStartTime.getTime();
      const durationMinutes = Math.max(1, Math.round(durationMs / 60000));
      
      // Update mining session
      const { error: updateError } = await supabase
        .from('mining_sessions')
        .update({
          end_time: now.toISOString(),
          earned_amount: earned,
        })
        .eq('id', sessionData.id);
        
      if (updateError) {
        console.error('Error updating mining session:', updateError);
        return;
      }
        
      // Update user's total mined amount - Using proper typing
      const updateUserResult = await supabase
        .from('users')
        .update({
          total_mined: supabase.rpc('increment', { x: earned }),
        })
        .eq('id', userId);
        
      if (updateUserResult.error) {
        console.error('Error updating user total mined:', updateUserResult.error);
      }
        
      // Update daily limits - Using proper typing
      const today = now.toISOString().split('T')[0];
      
      const updateLimitResult = await supabase
        .from('daily_mining_limits')
        .update({
          minutes_mined: supabase.rpc('increment', { x: durationMinutes }),
          last_mining_session_id: sessionData.id,
        })
        .eq('user_id', userId)
        .eq('date', today);
        
      if (updateLimitResult.error) {
        console.error('Error updating daily limits:', updateLimitResult.error);
      }
        
      // Log activity
      await logActivity('stop_mining', { 
        session_id: sessionData.id,
        duration: durationMinutes,
        earned: earned.toFixed(6)
      });
      
      // Reset state
      setIsMining(false);
      setSessionStartTime(null);
      
      // Show success toast
      toast("Mining Stopped", {
        description: `You earned ${earned.toFixed(6)} WAVES in ${durationMinutes} minutes!`,
      });
      
    } catch (error) {
      console.error('Error in stopMiningSession:', error);
      setIsMining(false);
      toast("Error", {
        description: "There was an issue stopping your mining session.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMining = () => {
    if (isMining) {
      stopMiningSession();
    } else {
      startMiningSession();
    }
  };

  // Calculate percentage of daily limit used
  const dailyLimitPercentage = Math.min(100, (dailyLimits.minutesUsed / dailyLimits.maxMinutes) * 100);

  return (
    <Card className="relative overflow-hidden border-2">
      {/* Mining animation */}
      {isMining && (
        <div className="absolute inset-0 flex items-center justify-center opacity-30">
          <PulseWave size={400} color="rgba(255, 165, 0, 0.15)" />
        </div>
      )}
      
      <CardHeader className="relative z-10">
        <CardTitle>Mining Control</CardTitle>
        <CardDescription>Start mining to earn $CORE tokens</CardDescription>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="flex flex-col items-center space-y-6">
          <div className="text-center">
            <p className="text-sm text-corepulse-gray-600">Current Mining Rate</p>
            <p className="text-3xl font-bold">{rate.toFixed(4)} $CORE/min</p>
          </div>
          
          {!isConnected ? (
            <Button 
              onClick={connect}
              className="w-40 h-40 rounded-full relative button-pulse flex flex-col items-center justify-center bg-corepulse-orange hover:bg-corepulse-orange-hover"
              disabled={isLoading}
            >
              <span className="text-lg font-bold mb-1">Connect</span>
              <span>Wallet</span>
            </Button>
          ) : !userVerified ? (
            <Button 
              onClick={connect}
              className="w-40 h-40 rounded-full relative button-pulse flex flex-col items-center justify-center bg-yellow-500 hover:bg-yellow-600"
              disabled={isLoading}
            >
              <span className="text-lg font-bold mb-1">Verify</span>
              <span>Wallet</span>
              {isLoading && <span className="text-sm mt-2">Loading...</span>}
            </Button>
          ) : (
            <Button 
              onClick={toggleMining}
              disabled={!isConnected || !userVerified || (dailyLimits.remaining <= 0 && !isMining) || isLoading}
              className={`w-40 h-40 rounded-full relative button-pulse flex flex-col items-center justify-center ${
                isMining 
                  ? "bg-red-500 hover:bg-red-600" 
                  : dailyLimits.remaining <= 0
                    ? "bg-corepulse-gray-400 cursor-not-allowed"
                    : "bg-corepulse-orange hover:bg-corepulse-orange-hover"
              }`}
            >
              <span className="text-lg font-bold mb-1">{isMining ? 'Stop' : 'Start'}</span>
              <span>Mining</span>
              {isLoading && <span className="text-sm mt-2">Loading...</span>}
            </Button>
          )}
          
          <div className="text-center">
            <p className="text-sm text-corepulse-gray-600">Earned this session</p>
            <p className="text-3xl font-bold">{earned.toFixed(6)} $CORE</p>
          </div>
          
          {isConnected && userVerified && (
            <div className="w-full space-y-2">
              <div className="flex justify-between text-sm">
                <span>Daily Mining Limit</span>
                <span>{dailyLimits.minutesUsed} / {dailyLimits.maxMinutes} minutes</span>
              </div>
              <Progress value={dailyLimitPercentage} className="h-2" />
              {dailyLimits.remaining <= 0 && !isMining && (
                <p className="text-center text-red-500 text-sm">Daily limit reached. Come back tomorrow!</p>
              )}
            </div>
          )}
          
          {isConnected && !userVerified && !isLoading && (
            <p className="text-center text-yellow-600 text-sm">
              Your wallet needs to be verified. Click the Verify button above to complete registration.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MiningPanel;
