
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Lock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { useUserAchievements } from '@/hooks/useUserAchievements';

const Achievements = () => {
  const { achievements, loading } = useUserAchievements();
  
  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Achievements</h1>
            <p className="text-corepulse-gray-600">Collect badges by reaching milestones and completing challenges</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Badge variant="outline" className="text-base px-4 py-2">
              {loading ? (
                <Skeleton className="h-4 w-8" />
              ) : (
                <span>{unlockedAchievements.length} / {achievements.length} Unlocked</span>
              )}
            </Badge>
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Unlocked Achievements</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <Card key={i} className="border">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center">
                      <Skeleton className="w-24 h-24 rounded-full mb-4" />
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : unlockedAchievements.length > 0 ? (
              unlockedAchievements.map(achievement => (
                <Card key={achievement.id} className="border hover:border-corepulse-orange border-2">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center">
                      <div className="w-24 h-24 rounded-full bg-corepulse-orange flex items-center justify-center mb-4 p-1">
                        <div className="w-full h-full rounded-full bg-white flex items-center justify-center p-2">
                          {achievement.image_url ? (
                            <img 
                              src={achievement.image_url} 
                              alt={achievement.name} 
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <span className="text-4xl">🏆</span>
                          )}
                        </div>
                      </div>
                      <h3 className="font-bold text-lg mb-1 text-center">{achievement.name}</h3>
                      <p className="text-sm text-center text-corepulse-gray-600">{achievement.description}</p>
                      <p className="text-xs text-corepulse-gray-500 mt-3">
                        Unlocked on {new Date(achievement.unlocked_at || '').toLocaleDateString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-corepulse-gray-500">You haven't unlocked any achievements yet.</p>
                <p className="text-sm mt-2">Keep mining and exploring to earn your first badge!</p>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-bold mb-4">Locked Achievements</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <Card key={i} className="border">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center">
                      <Skeleton className="w-24 h-24 rounded-full mb-4" />
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : lockedAchievements.length > 0 ? (
              lockedAchievements.map(achievement => (
                <TooltipProvider key={achievement.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Card className="border border-dashed opacity-60 hover:opacity-80 transition-opacity">
                        <CardContent className="p-6">
                          <div className="flex flex-col items-center relative">
                            <div className="w-24 h-24 rounded-full bg-corepulse-gray-200 flex items-center justify-center mb-4">
                              <Lock size={32} className="text-corepulse-gray-400" />
                            </div>
                            <h3 className="font-bold text-lg mb-1 text-center">{achievement.name}</h3>
                            <p className="text-sm text-center text-corepulse-gray-500">{achievement.description}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Complete the required actions to unlock this achievement</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-corepulse-gray-500">You've unlocked all available achievements!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Achievements;
