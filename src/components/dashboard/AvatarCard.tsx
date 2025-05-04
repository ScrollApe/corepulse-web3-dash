
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface AvatarCardProps {
  level: number;
  experience: number;
  nextLevelExp: number;
  avatarImage: string;
}

const AvatarCard: React.FC<AvatarCardProps> = ({ level, experience, nextLevelExp, avatarImage }) => {
  const progress = Math.floor((experience / nextLevelExp) * 100);
  
  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Your Avatar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-corepulse-gray-200 p-1 mb-4 relative">
            <img 
              src={avatarImage} 
              alt="User Avatar" 
              className="w-full h-full object-cover rounded-full" 
            />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-corepulse-orange text-white flex items-center justify-center font-bold border-2 border-white">
              {level}
            </div>
          </div>
          
          <div className="w-full">
            <div className="flex justify-between text-sm text-corepulse-gray-600 mb-1">
              <span>Level {level}</span>
              <span>{experience}/{nextLevelExp} XP</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-sm font-medium">Next Evolution at Level {level + 5}</p>
            <p className="text-xs text-corepulse-gray-500 mt-1">Keep mining to level up your avatar!</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AvatarCard;
