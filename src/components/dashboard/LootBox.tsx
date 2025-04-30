
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const LootBox = () => {
  const [isShowing, setIsShowing] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [reward, setReward] = useState<{ type: string; amount: number } | null>(null);

  // Define possible rewards
  const possibleRewards = [
    { type: '$CORE Tokens', amount: 25 },
    { type: '$CORE Tokens', amount: 50 },
    { type: '$CORE Tokens', amount: 100 },
    { type: 'Boost', amount: 5 },
    { type: 'Boost', amount: 10 }
  ];

  // Simulate random loot box appearance
  useEffect(() => {
    const randomAppearance = () => {
      // 20% chance to show loot box
      if (Math.random() < 0.2) {
        setIsShowing(true);
        
        // Hide after 30 seconds if not opened
        const timeout = setTimeout(() => {
          setIsShowing(false);
          setReward(null);
        }, 30000);
        
        return () => clearTimeout(timeout);
      }
    };
    
    // Check for loot box every 60-120 seconds
    const checkInterval = setInterval(() => {
      randomAppearance();
    }, 60000 + Math.random() * 60000);
    
    // Show loot box after 5 seconds for demo purposes
    const initialTimeout = setTimeout(() => {
      setIsShowing(true);
    }, 5000);
    
    return () => {
      clearInterval(checkInterval);
      clearTimeout(initialTimeout);
    };
  }, []);

  const openLootBox = () => {
    setIsOpening(true);
    
    // Animation time
    setTimeout(() => {
      // Select random reward
      const randomReward = possibleRewards[Math.floor(Math.random() * possibleRewards.length)];
      setReward(randomReward);
      
      // Show toast notification
      toast.success(
        `You received ${randomReward.amount} ${randomReward.type}!`, 
        { duration: 5000 }
      );
      
      setIsOpening(false);
      
      // Hide loot box after reward is shown
      setTimeout(() => {
        setIsShowing(false);
        setReward(null);
      }, 5000);
    }, 2000);
  };

  if (!isShowing) {
    return null;
  }

  return (
    <div className="fixed bottom-10 right-10 z-50 animate-fade-in">
      <Card className="border-2 border-corepulse-orange w-64 overflow-hidden">
        <CardContent className="p-4">
          <div className="flex flex-col items-center">
            {!reward ? (
              <>
                <div 
                  className={`w-24 h-24 mb-3 ${
                    isOpening 
                      ? "animate-spin" 
                      : "animate-float"
                  }`}
                >
                  <div className="w-full h-full bg-gradient-to-br from-corepulse-orange to-corepulse-orange-light rounded-lg flex items-center justify-center">
                    <span className="text-4xl">🎁</span>
                  </div>
                </div>
                <p className="text-center font-medium mb-3">
                  {isOpening ? "Opening..." : "Mystery Loot Box Appeared!"}
                </p>
                <Button 
                  onClick={openLootBox} 
                  className="w-full bg-corepulse-orange hover:bg-corepulse-orange-hover"
                  disabled={isOpening}
                >
                  {isOpening ? "Opening..." : "Open Now"}
                </Button>
              </>
            ) : (
              <div className="py-2 text-center">
                <div className="w-20 h-20 mx-auto mb-2 animate-glow">
                  <div className="w-full h-full bg-gradient-to-br from-yellow-300 to-amber-500 rounded-full flex items-center justify-center">
                    <span className="text-3xl">
                      {reward.type === "Boost" ? "⚡" : "💰"}
                    </span>
                  </div>
                </div>
                <p className="font-bold text-lg">
                  +{reward.amount} {reward.type}
                </p>
                <p className="text-sm text-corepulse-gray-600 mt-1">Added to your account!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LootBox;
