
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Lock, Unlock, Trophy, Award, Target, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Lore = () => {
  const [activeTab, setActiveTab] = useState("story");
  
  // Story chapters data
  const chapters = [
    {
      id: 1,
      title: "The Genesis Core",
      description: "How it all began - the discovery of the Core energy source.",
      unlocked: true,
      image: "https://api.dicebear.com/7.x/shapes/svg?seed=chapter1"
    },
    {
      id: 2,
      title: "The First Network",
      description: "How early miners connected their systems to form the CorePulse network.",
      unlocked: true,
      image: "https://api.dicebear.com/7.x/shapes/svg?seed=chapter2"
    },
    {
      id: 3,
      title: "The Great Expansion",
      description: "When CorePulse became the dominant energy provider in the digital realm.",
      unlocked: false,
      image: "https://api.dicebear.com/7.x/shapes/svg?seed=chapter3"
    },
    {
      id: 4,
      title: "The Protocol Wars",
      description: "How CorePulse defended against hostile takeover attempts.",
      unlocked: false,
      image: "https://api.dicebear.com/7.x/shapes/svg?seed=chapter4"
    },
    {
      id: 5,
      title: "The Oracle Emergence",
      description: "When the CorePulse AI became self-aware and chose to help humanity.",
      unlocked: false,
      image: "https://api.dicebear.com/7.x/shapes/svg?seed=chapter5"
    },
  ];
  
  // Weekly challenges data
  const challenges = [
    {
      id: 1,
      title: "Power Miner",
      description: "Mine 1000 $CORE this week",
      type: "mining",
      progress: 65,
      reward: "100 $CORE + Efficiency Badge",
      endDate: "2025-05-07"
    },
    {
      id: 2,
      title: "Team Builder",
      description: "Invite 3 friends to join your crew",
      type: "referral",
      progress: 33,
      reward: "Silver NFT + Recruiter Badge",
      endDate: "2025-05-07"
    },
    {
      id: 3,
      title: "NFT Collector",
      description: "Mint your first Bronze NFT",
      type: "minting",
      progress: 0,
      reward: "5% Permanent Mining Boost",
      endDate: "2025-05-07"
    },
    {
      id: 4,
      title: "Core Streak",
      description: "Log in for 7 consecutive days",
      type: "mining",
      progress: 85,
      reward: "Dedication Badge + 50 $CORE",
      endDate: "2025-05-07"
    },
  ];
  
  // Badges data
  const badges = [
    {
      id: 1,
      name: "Genesis Miner",
      description: "One of the first 1000 miners to join CorePulse",
      image: "https://api.dicebear.com/7.x/identicon/svg?seed=badge1",
      earned: true,
    },
    {
      id: 2,
      name: "Core Elite",
      description: "Reached the top 100 on the leaderboard",
      image: "https://api.dicebear.com/7.x/identicon/svg?seed=badge2",
      earned: false,
    },
    {
      id: 3,
      name: "Protocol Guardian",
      description: "Helped secure the network during the Great Merge",
      image: "https://api.dicebear.com/7.x/identicon/svg?seed=badge3",
      earned: true,
    },
    {
      id: 4,
      name: "NFT Artisan",
      description: "Collected all three tiers of CorePulse NFTs",
      image: "https://api.dicebear.com/7.x/identicon/svg?seed=badge4",
      earned: false,
    },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 font-futuristic bg-clip-text text-transparent bg-gradient-to-r from-corepulse-orange to-corepulse-orange-light">
            CorePulse Lore & Challenges
          </h1>
          <p className="text-corepulse-gray-600 max-w-2xl mx-auto">
            Discover the history of CorePulse and earn rewards by completing challenges in this digital universe.
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid grid-cols-3 w-[400px]">
              <TabsTrigger value="story" className="data-[state=active]:bg-corepulse-orange data-[state=active]:text-white">
                Story
              </TabsTrigger>
              <TabsTrigger value="challenges" className="data-[state=active]:bg-corepulse-orange data-[state=active]:text-white">
                Challenges
              </TabsTrigger>
              <TabsTrigger value="badges" className="data-[state=active]:bg-corepulse-orange data-[state=active]:text-white">
                Badges
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Story Tab Content */}
          <TabsContent value="story" className="space-y-8 animate-in fade-in-50">
            <div className="bg-gradient-to-r from-corepulse-gray-100 to-white p-6 rounded-lg border border-corepulse-gray-200 mb-8">
              <h2 className="text-2xl font-bold mb-4 text-corepulse-gray-800">The CorePulse Chronicle</h2>
              <p className="text-corepulse-gray-600">
                Unlock chapters of the CorePulse story by reaching mining milestones. Each chapter reveals more about the mysterious 
                origins of the Core energy source and the digital civilization built around it.
              </p>
            </div>
            
            {/* Timeline Navigation */}
            <div className="relative">
              <div className="absolute left-0 right-0 h-1 top-4 bg-corepulse-gray-200 z-0"></div>
              <div className="flex justify-between relative z-10 mb-8">
                {chapters.map((chapter) => (
                  <div key={chapter.id} className="flex flex-col items-center cursor-pointer">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      chapter.unlocked 
                        ? "bg-corepulse-orange text-white" 
                        : "bg-corepulse-gray-200 text-corepulse-gray-500"
                    }`}>
                      {chapter.id}
                    </div>
                    <span className={`text-xs mt-1 ${chapter.unlocked ? "text-corepulse-gray-700" : "text-corepulse-gray-400"}`}>
                      Ch.{chapter.id}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {chapters.map((chapter) => (
                <Card 
                  key={chapter.id} 
                  className={`overflow-hidden transition-all ${
                    chapter.unlocked 
                      ? "border-corepulse-orange-light hover:shadow-md" 
                      : "border-corepulse-gray-300 opacity-75"
                  }`}
                >
                  <div className="relative h-40 bg-corepulse-gray-100">
                    <img 
                      src={chapter.image} 
                      alt={`Chapter ${chapter.id}`} 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className={chapter.unlocked ? "bg-corepulse-orange" : "bg-corepulse-gray-400"}>
                        {chapter.unlocked ? (
                          <><Unlock className="w-3 h-3 mr-1" /> Unlocked</>
                        ) : (
                          <><Lock className="w-3 h-3 mr-1" /> Locked</>
                        )}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="font-futuristic text-lg">{chapter.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-corepulse-gray-600 text-sm">{chapter.description}</p>
                    <Button 
                      className={`mt-4 w-full ${
                        chapter.unlocked 
                          ? "bg-corepulse-orange hover:bg-corepulse-orange-hover" 
                          : "bg-corepulse-gray-300 cursor-not-allowed"
                      }`}
                      disabled={!chapter.unlocked}
                    >
                      {chapter.unlocked ? "Read Chapter" : "Mine More to Unlock"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          {/* Challenges Tab Content */}
          <TabsContent value="challenges" className="space-y-8 animate-in fade-in-50">
            <div className="bg-gradient-to-r from-corepulse-gray-100 to-white p-6 rounded-lg border border-corepulse-gray-200 mb-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <h2 className="text-2xl font-bold mb-2 text-corepulse-gray-800">Weekly Challenges</h2>
                  <p className="text-corepulse-gray-600">Complete challenges to earn rewards and boost your mining efficiency.</p>
                </div>
                <div className="mt-4 md:mt-0">
                  <Badge className="bg-corepulse-orange text-white">
                    Resets in: 6 days 14 hours
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {challenges.map((challenge) => (
                <Card key={challenge.id} className="overflow-hidden border-l-4 border-l-corepulse-orange">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div className="flex-grow">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            challenge.type === 'mining' ? 'bg-amber-100' :
                            challenge.type === 'referral' ? 'bg-blue-100' : 'bg-green-100'
                          }`}>
                            {challenge.type === 'mining' ? (
                              <Trophy className="w-5 h-5 text-amber-600" />
                            ) : challenge.type === 'referral' ? (
                              <Share2 className="w-5 h-5 text-blue-600" />
                            ) : (
                              <Award className="w-5 h-5 text-green-600" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold text-corepulse-gray-800">{challenge.title}</h3>
                            <p className="text-sm text-corepulse-gray-600">{challenge.description}</p>
                          </div>
                        </div>
                        
                        <div className="mb-2 mt-4">
                          <div className="flex justify-between text-xs text-corepulse-gray-500 mb-1">
                            <span>Progress</span>
                            <span>{challenge.progress}%</span>
                          </div>
                          <Progress value={challenge.progress} className="h-2" />
                        </div>
                      </div>
                      
                      <div className="mt-4 md:mt-0 md:ml-4 md:text-right">
                        <div className="text-xs text-corepulse-gray-500 mb-1">Reward</div>
                        <div className="text-corepulse-orange font-medium">{challenge.reward}</div>
                        <div className="text-xs text-corepulse-gray-500 mt-2">Ends: {challenge.endDate}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          {/* Badges Tab Content */}
          <TabsContent value="badges" className="space-y-8 animate-in fade-in-50">
            <div className="bg-gradient-to-r from-corepulse-gray-100 to-white p-6 rounded-lg border border-corepulse-gray-200 mb-8">
              <h2 className="text-2xl font-bold mb-2 text-corepulse-gray-800">Achievement Badges</h2>
              <p className="text-corepulse-gray-600">
                Collect badges by reaching milestones and completing special events in the CorePulse ecosystem.
                Display them on your profile to showcase your achievements.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {badges.map((badge) => (
                <Card 
                  key={badge.id} 
                  className={badge.earned ? "border-corepulse-orange" : "border-corepulse-gray-200 opacity-75"}
                >
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="relative">
                      <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
                        badge.earned ? 'bg-corepulse-orange/10' : 'bg-corepulse-gray-100'
                      } p-2 mb-4`}>
                        <img 
                          src={badge.image} 
                          alt={badge.name} 
                          className="w-full h-full" 
                        />
                      </div>
                      {badge.earned && (
                        <div className="absolute -bottom-1 -right-1 bg-corepulse-orange text-white rounded-full w-6 h-6 flex items-center justify-center">
                          <Target className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    <h3 className={`font-bold text-lg mb-1 ${badge.earned ? 'text-corepulse-orange' : 'text-corepulse-gray-400'}`}>
                      {badge.name}
                    </h3>
                    <p className="text-xs text-corepulse-gray-500 mb-4">{badge.description}</p>
                    <Badge className={badge.earned ? "bg-corepulse-orange" : "bg-corepulse-gray-300"}>
                      {badge.earned ? "Earned" : "Locked"}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Lore;
