import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import PulseWave from '@/components/ui/PulseWave';
import { useAccount } from 'wagmi';
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
  const [userVerified, setUserVerified] = useState(false);
  
  const { isConnected, address } = useAccount();
  const { connect } = useWalletConnect();
  const { logActivity } = useActivity();
  
  useEffect(() => {
    if (isConnected && address) {
      console.log("Wallet connected:", address);
      // Simply verify the user is connected, no database check
      setUserVerified(true);
    } else {
      setUserVerified(false);
    }
  }, [isConnected, address]);

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

  // Start mining session with hybrid activity logging
  const startMiningSession = async () => {
    if (!isConnected || !address) {
      connect();
      return;
    }
    
    if (!userVerified) {
      toast("Wallet Authentication Required", {
        description: "Please connect your wallet to start mining.",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Check local daily limits
      if (dailyLimits.remaining <= 0) {
        toast("Daily Limit Reached", {
          description: "You've reached your daily mining limit. Come back tomorrow!",
        });
        return;
      }
      
      setSessionStartTime(new Date());
      setIsMining(true);
      
      // Log activity using the hybrid approach
      await logActivity('start_mining', { 
        timestamp: new Date().toISOString(),
        rate: rate
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

  // Stop mining session with hybrid activity logging
  const stopMiningSession = async () => {
    if (!sessionStartTime) return;
    
    try {
      setIsLoading(true);
      
      const now = new Date();
      const durationMs = now.getTime() - sessionStartTime.getTime();
      const durationMinutes = Math.max(1, Math.round(durationMs / 60000));
      
      // Update local limits (no database)
      setDailyLimits(prev => {
        const newMinutesUsed = prev.minutesUsed + durationMinutes;
        return {
          ...prev,
          minutesUsed: newMinutesUsed,
          remaining: Math.max(0, prev.maxMinutes - newMinutesUsed)
        };
      });
      
      // Log activity using the hybrid approach
      await logActivity('stop_mining', { 
        duration: durationMinutes,
        earned: earned.toFixed(6)
      });
      
      // Reset state
      setIsMining(false);
      setSessionStartTime(null);
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
        <CardDescription>Start mining to earn $WAVES tokens</CardDescription>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="flex flex-col items-center space-y-6">
          <div className="text-center">
            <p className="text-sm text-corepulse-gray-600">Current Mining Rate</p>
            <p className="text-3xl font-bold">{rate.toFixed(4)} $WAVES/min</p>
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
            <p className="text-3xl font-bold">{earned.toFixed(6)} $WAVES</p>
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
