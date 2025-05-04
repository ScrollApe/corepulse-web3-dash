
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface EpochCardProps {
  daysLeft: number;
  hoursLeft: number;
  progress: number;
}

const EpochCard: React.FC<EpochCardProps> = ({ daysLeft, hoursLeft, progress }) => {
  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Epoch Countdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <div className="w-28 h-28 rounded-full border-4 border-corepulse-orange flex items-center justify-center mb-4 relative">
            <div className="text-center">
              <p className="text-3xl font-bold">{daysLeft}</p>
              <p className="text-sm">days left</p>
            </div>
            <div className="absolute -bottom-2 bg-white px-2">
              <p className="text-sm font-medium">{hoursLeft} hours</p>
            </div>
          </div>
          
          <div className="w-full mt-2">
            <div className="flex justify-between text-sm text-corepulse-gray-600 mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          <p className="text-sm text-corepulse-gray-600 mt-4 text-center">
            The current mining epoch ends in {daysLeft} days and {hoursLeft} hours. Prepare for the difficulty adjustment.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EpochCard;
