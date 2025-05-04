
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StreakCardProps {
  currentStreak: number;
  bestStreak: number;
}

const StreakCard: React.FC<StreakCardProps> = ({ currentStreak, bestStreak }) => {
  // Example days of week
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  
  // Simulate a pattern of activity for the last 7 days
  const activityPattern = [true, true, true, false, true, false, true];
  
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
                activityPattern[index] 
                  ? "bg-corepulse-orange text-white" 
                  : "bg-corepulse-gray-200 text-corepulse-gray-600"
              }`}>
                {day}
              </div>
              <div className={`w-1 h-1 rounded-full ${
                activityPattern[index] 
                  ? "bg-corepulse-orange" 
                  : "bg-corepulse-gray-300"
              }`}></div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-sm text-corepulse-gray-600">Current Streak</p>
            <p className="text-2xl font-bold">{currentStreak} days</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-corepulse-gray-600">Best Streak</p>
            <p className="text-2xl font-bold">{bestStreak} days</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StreakCard;
