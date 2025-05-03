
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { useWeeklyChallenges } from '@/hooks/useWeeklyChallenges';
import { Skeleton } from "@/components/ui/skeleton";

const WeeklyChallenges = () => {
  const { challenges, loading } = useWeeklyChallenges();
  
  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Weekly Challenges</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {Array(2).fill(0).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        ) : challenges.length > 0 ? (
          <div className="space-y-4">
            {challenges.map((challenge) => {
              const progressPercent = Math.min(100, (challenge.progress / challenge.goal) * 100);
              const daysLeft = Math.ceil((new Date(challenge.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              
              return (
                <div key={challenge.id} className="border border-corepulse-gray-200 rounded-md p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{challenge.title}</h4>
                      <p className="text-sm text-corepulse-gray-600">{challenge.description}</p>
                    </div>
                    <Badge variant={challenge.completed ? "default" : "outline"} className={challenge.completed ? "bg-green-500" : ""}>
                      {challenge.completed ? (
                        <span className="flex items-center">
                          <Check size={14} className="mr-1" /> Complete
                        </span>
                      ) : (
                        `${daysLeft} days left`
                      )}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Progress: {challenge.progress} / {challenge.goal}</span>
                      <span className="text-corepulse-orange">Reward: {challenge.reward} $CORE</span>
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-corepulse-gray-500">No active challenges</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeeklyChallenges;
