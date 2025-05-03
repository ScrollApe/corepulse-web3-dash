
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useStreakData } from '@/hooks/useStreakData';

const StreakCard: React.FC = () => {
  const { streakData, loading } = useStreakData();
  
  // Example days of week
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  
  if (loading) {
    return (
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Daily Streak</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-4">
            {Array(7).fill(0).map((_, i) => (
              <Skeleton key={i} className="w-8 h-8 rounded-full" />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Daily Streak</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-4">
          {days.map((day, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                streakData.activityPattern[index] 
                  ? "bg-corepulse-orange text-white" 
                  : "bg-corepulse-gray-200 text-corepulse-gray-600"
              }`}>
                {day}
              </div>
              <div className={`w-1 h-1 rounded-full ${
                streakData.activityPattern[index] 
                  ? "bg-corepulse-orange" 
                  : "bg-corepulse-gray-300"
              }`}></div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-sm text-corepulse-gray-600">Current Streak</p>
            <p className="text-2xl font-bold">{streakData.currentStreak} days</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-corepulse-gray-600">Best Streak</p>
            <p className="text-2xl font-bold">{streakData.bestStreak} days</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StreakCard;
