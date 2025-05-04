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
  const [loading, setLoading] = useState(false); // Added missing loading state
  const [rate, setRate] = useState(0.0012);
  const [earned, setEarned] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [dailyLimits, setDailyLimits] = useState({
    minutesUsed: 0,
    maxMinutes: 240, // 4 hours default
    remaining: 240,
  });
  const { isConnected, address } = useAccount();
  const { connect } = useWalletConnect();
  const { logActivity } = useActivity();
  
  // Fetch daily limits when component mounts or wallet connects
  useEffect(() => {
    const fetchDailyLimits = async () => {
      if (!isConnected || !address) return;
      
      try {
        setLoading(true);
        
        // Get user id from wallet address
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('wallet_address', address.toLowerCase())
          .single();
          
        if (userError) {
          console.error('Error fetching user:', userError);
          return;
        }
        
        const userId = userData.id;
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
      } finally {
        setLoading(false);
      }
    };
    
    fetchDailyLimits();
    
    // Set up realtime subscription
    if (isConnected && address) {
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
  }, [isConnected, address]);

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
    
    try {
      // Get user id from wallet address
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('wallet_address', address.toLowerCase())
        .single();
        
      if (userError) {
        console.error('Error fetching user:', userError);
        toast("Error Starting Mining", {
          description: "Could not retrieve your user profile. Please try reconnecting your wallet.",
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
      
      const userId = userData.id;
      
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
      
    } catch (error) {
      console.error('Error in startMiningSession:', error);
      toast("Error", {
        description: "Something went wrong. Please try again.",
      });
    }
  };

  const stopMiningSession = async () => {
    if (!isConnected || !address || !sessionStartTime) return;
    
    try {
      // Get user id from wallet address
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('wallet_address', address.toLowerCase())
        .single();
        
      if (userError) {
        console.error('Error fetching user:', userError);
        return;
      }
      
      const userId = userData.id;
      
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
      await supabase
        .from('mining_sessions')
        .update({
          end_time: now.toISOString(),
          earned_amount: earned,
        })
        .eq('id', sessionData.id);
        
      // Update user's total mined amount
      // Using a normal update with direct value addition instead of RPC calls
      const { data: userData2, error: userDataError } = await supabase
        .from('users')
        .select('total_mined, experience')
        .eq('id', userId)
        .single();

      if (userDataError) {
        console.error('Error fetching user data:', userDataError);
      } else {
        const { error: updateUserError } = await supabase
          .from('users')
          .update({
            total_mined: userData2.total_mined + earned,
            experience: userData2.experience + Math.floor(earned * 10)
          })
          .eq('id', userId);

        if (updateUserError) {
          console.error('Error updating user totals:', updateUserError);
        }
      }

      // Update daily limits
      const today = now.toISOString().split('T')[0];
      
      const { data: dailyLimitData, error: dailyLimitDataError } = await supabase
        .from('daily_mining_limits')
        .select('minutes_mined')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      if (dailyLimitDataError) {
        console.error('Error fetching daily limit data:', dailyLimitDataError);
      } else {
        const { error: updateLimitsError } = await supabase
          .from('daily_mining_limits')
          .update({
            minutes_mined: dailyLimitData.minutes_mined + durationMinutes,
            last_mining_session_id: sessionData.id,
          })
          .eq('user_id', userId)
          .eq('date', today);

        if (updateLimitsError) {
          console.error('Error updating daily limits:', updateLimitsError);
        }
      }
        
      // Log activity
      await logActivity('stop_mining', { 
        session_id: sessionData.id,
        duration: durationMinutes,
        earned: earned.toFixed(6)
      });
      
      // Check for weekly challenges progress
      const { data: challenges, error: challengesError } = await supabase
        .from('weekly_challenges')
        .select('id, goal')
        .eq('challenge_type', 'mining')
        .gte('end_date', now.toISOString());
        
      if (!challengesError && challenges && challenges.length > 0) {
        // For each mining-related challenge, update progress
        for (const challenge of challenges) {
          // Check if user has this challenge
          const { data: userChallenge, error: userChallengeError } = await supabase
            .from('user_weekly_challenges')
            .select('id, progress, completed')
            .eq('user_id', userId)
            .eq('challenge_id', challenge.id)
            .single();
            
          if (userChallengeError && userChallengeError.code === 'PGRST116') {
            // No record yet, create one
            await supabase
              .from('user_weekly_challenges')
              .insert({
                user_id: userId,
                challenge_id: challenge.id,
                progress: durationMinutes,
                completed: durationMinutes >= challenge.goal
              });
          } else if (!userChallengeError && userChallenge && !userChallenge.completed) {
            // Update existing challenge progress
            const newProgress = userChallenge.progress + durationMinutes;
            const completed = newProgress >= challenge.goal;
            
            await supabase
              .from('user_weekly_challenges')
              .update({
                progress: newProgress,
                completed,
                completed_at: completed ? now.toISOString() : null
              })
              .eq('id', userChallenge.id);
          }
        }
      }
      
      // Check for Mining Novice achievement
      try {
        // Get user's total mined amount
        const { data: userMined, error: userMinedError } = await supabase
          .from('users')
          .select('total_mined')
          .eq('id', userId)
          .single();
          
        if (!userMinedError && userMined && userMined.total_mined >= 100) {
          // Check if they already have the achievement
          const { data: achievementData, error: achievementError } = await supabase
            .from('achievements')
            .select('id')
            .eq('name', 'Mining Novice')
            .single();
            
          if (!achievementError && achievementData) {
            // Check if user already has this achievement
            const { data: userAchievement, error: userAchievementError } = await supabase
              .from('user_achievements')
              .select('id')
              .eq('user_id', userId)
              .eq('achievement_id', achievementData.id)
              .single();
              
            if (userAchievementError && userAchievementError.code === 'PGRST116') {
              // User doesn't have achievement yet, add it
              await supabase
                .from('user_achievements')
                .insert({
                  user_id: userId,
                  achievement_id: achievementData.id
                });
                
              toast.success("Achievement Unlocked: Mining Novice!");
            }
          }
        }
      } catch (error) {
        console.error('Error checking for achievements:', error);
      }
      
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
            >
              <span className="text-lg font-bold mb-1">Connect</span>
              <span>Wallet</span>
            </Button>
          ) : (
            <Button 
              onClick={toggleMining}
              disabled={!isConnected || (dailyLimits.remaining <= 0 && !isMining)}
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
            </Button>
          )}
          
          <div className="text-center">
            <p className="text-sm text-corepulse-gray-600">Earned this session</p>
            <p className="text-3xl font-bold">{earned.toFixed(6)} $CORE</p>
          </div>
          
          {isConnected && (
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
        </div>
      </CardContent>
    </Card>
  );
};

export default MiningPanel;
