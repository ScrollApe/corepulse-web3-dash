
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Check, Trophy, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useWeeklyChallenges } from '@/hooks/useWeeklyChallenges';

const WeeklyChallenges = () => {
  const { challenges, loading } = useWeeklyChallenges();
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Weekly Challenges</h1>
        <p className="text-corepulse-gray-600 mb-8">Complete challenges to earn rewards and boost your mining efficiency</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            // Loading skeletons
            Array(6).fill(0).map((_, i) => (
              <Card key={i} className="border">
                <CardHeader className="pb-2">
                  <Skeleton className="h-6 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-2 w-full mb-4" />
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-6 w-1/4" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : challenges.length > 0 ? (
            challenges.map(challenge => {
              const progressPercent = Math.min(100, (challenge.progress / challenge.goal) * 100);
              const daysLeft = Math.ceil((new Date(challenge.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              
              return (
                <Card key={challenge.id} className={`border-2 ${challenge.completed ? 'border-green-400' : 'hover:border-corepulse-orange'}`}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{challenge.title}</CardTitle>
                      <Badge variant={challenge.completed ? "default" : "outline"} className={challenge.completed ? "bg-green-500" : ""}>
                        {challenge.completed ? (
                          <span className="flex items-center">
                            <Check size={14} className="mr-1" /> Completed
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <Clock size={14} className="mr-1" /> {daysLeft}d left
                          </span>
                        )}
                      </Badge>
                    </div>
                    <p className="text-sm text-corepulse-gray-600">{challenge.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{challenge.progress} / {challenge.goal}</span>
                        </div>
                        <Progress value={progressPercent} className="h-2" />
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-corepulse-orange/10 flex items-center justify-center mr-2">
                            <Trophy size={16} className="text-corepulse-orange" />
                          </div>
                          <span className="font-medium">{challenge.reward} $CORE</span>
                        </div>
                        <span className="text-xs bg-corepulse-gray-100 px-2 py-1 rounded capitalize">
                          {challenge.challenge_type}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="col-span-3 text-center py-16">
              <h3 className="text-xl font-semibold text-corepulse-gray-700">No active challenges</h3>
              <p className="text-corepulse-gray-500 mt-2">Check back soon for new challenges to earn rewards!</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default WeeklyChallenges;
