
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PulseWave from '@/components/ui/PulseWave';

const MiningPanel = () => {
  const [isMining, setIsMining] = useState(false);
  const [rate, setRate] = useState(0.0012);
  const [earned, setEarned] = useState(0);

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

  const toggleMining = () => {
    setIsMining(!isMining);
  };

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
          
          <Button 
            onClick={toggleMining}
            className={`w-40 h-40 rounded-full relative button-pulse flex flex-col items-center justify-center ${
              isMining 
                ? "bg-red-500 hover:bg-red-600" 
                : "bg-corepulse-orange hover:bg-corepulse-orange-hover"
            }`}
          >
            <span className="text-lg font-bold mb-1">{isMining ? 'Stop' : 'Start'}</span>
            <span>Mining</span>
          </Button>
          
          <div className="text-center">
            <p className="text-sm text-corepulse-gray-600">Earned this session</p>
            <p className="text-3xl font-bold">{earned.toFixed(6)} $CORE</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MiningPanel;
