
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useUserAchievements } from '@/hooks/useUserAchievements';

const AchievementsBadges = () => {
  const { achievements, loading } = useUserAchievements();
  
  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);
  
  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Achievements</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid grid-cols-3 gap-4">
            {Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-20 w-20 rounded-full mx-auto" />
            ))}
          </div>
        ) : (
          <>
            {unlockedAchievements.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {unlockedAchievements.map((achievement) => (
                  <TooltipProvider key={achievement.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 rounded-full bg-corepulse-orange flex items-center justify-center mb-2">
                            {achievement.image_url ? (
                              <img 
                                src={achievement.image_url} 
                                alt={achievement.name} 
                                className="w-12 h-12 object-contain"
                              />
                            ) : (
                              <span className="text-2xl">🏆</span>
                            )}
                          </div>
                          <span className="text-xs font-medium text-center">{achievement.name}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{achievement.description}</p>
                        <p className="text-xs mt-1">
                          Unlocked: {new Date(achievement.unlocked_at || '').toLocaleDateString()}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-corepulse-gray-500">No achievements unlocked yet.</p>
                <p className="text-sm mt-2">Keep mining and exploring to earn badges!</p>
              </div>
            )}
            
            {lockedAchievements.length > 0 && (
              <div className="mt-4 pt-4 border-t border-corepulse-gray-200">
                <h4 className="text-sm font-medium mb-3">Locked Achievements</h4>
                <div className="flex flex-wrap gap-2">
                  {lockedAchievements.map((achievement) => (
                    <TooltipProvider key={achievement.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" className="opacity-50">
                            {achievement.name}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{achievement.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AchievementsBadges;
