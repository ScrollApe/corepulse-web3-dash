
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Clock, Users } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import PulseWave from '@/components/ui/PulseWave';

// Mock data for leaderboard
const currentEpochLeaderboard = [
  { rank: 1, address: "0xf3d...a91b", mined: 15420, isCurrent: false },
  { rank: 2, address: "0x72c...e43f", mined: 12850, isCurrent: true },
  { rank: 3, address: "0x9ae...b72d", mined: 10750, isCurrent: false },
  { rank: 4, address: "0x45b...c19a", mined: 9320, isCurrent: false },
  { rank: 5, address: "0xd21...f56e", mined: 8750, isCurrent: false },
  { rank: 6, address: "0x67a...e33d", mined: 7890, isCurrent: false },
  { rank: 7, address: "0xb44...a12c", mined: 7650, isCurrent: false },
  { rank: 8, address: "0x3f9...d88b", mined: 6930, isCurrent: false },
  { rank: 9, address: "0xc07...b45a", mined: 5820, isCurrent: false },
  { rank: 10, address: "0x81e...f22d", mined: 5340, isCurrent: false },
];

const pastEpochLeaderboard = [
  { rank: 1, address: "0xa21...f33e", mined: 22150, isCurrent: false },
  { rank: 2, address: "0xb98...c44d", mined: 19870, isCurrent: false },
  { rank: 3, address: "0x72c...e43f", mined: 18320, isCurrent: true },
  { rank: 4, address: "0x56d...a77b", mined: 16750, isCurrent: false },
  { rank: 5, address: "0xe12...b89c", mined: 15890, isCurrent: false },
  { rank: 6, address: "0xf3d...a91b", mined: 14750, isCurrent: false },
  { rank: 7, address: "0x34a...c22e", mined: 13280, isCurrent: false },
  { rank: 8, address: "0x91f...d55a", mined: 12950, isCurrent: false },
  { rank: 9, address: "0xc07...b45a", mined: 11870, isCurrent: false },
  { rank: 10, address: "0x29b...e11d", mined: 10550, isCurrent: false },
];

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState("current");
  const daysLeft = 5;
  const hoursLeft = 18;
  const minutesLeft = 43;

  const handleShareOnX = () => {
    const text = `Check out my mining position on CorePulse! Currently ranked ${currentEpochLeaderboard.find(user => user.isCurrent)?.rank} with ${currentEpochLeaderboard.find(user => user.isCurrent)?.mined} WAVES mined this epoch!`;
    const url = window.location.href;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
  };

  return (
    <Layout>
      <div className="relative min-h-screen overflow-hidden">
        <div className="absolute opacity-10 pointer-events-none">
          <PulseWave color="rgba(255, 165, 0, 0.15)" size={800} />
        </div>
        
        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-corepulse-gray-900">Leaderboard</h1>
              <p className="text-corepulse-gray-600 mt-1">Top miners in the CorePulse network</p>
            </div>
            
            <Card className="w-full md:w-auto mt-4 md:mt-0 bg-gradient-to-r from-corepulse-orange-light/20 to-corepulse-orange/10 border-corepulse-orange/20">
              <CardContent className="p-4 flex items-center">
                <Clock className="h-5 w-5 text-corepulse-orange mr-2" />
                <span className="text-corepulse-gray-800 font-medium">
                  Epoch ends in: <span className="text-corepulse-orange font-bold">{daysLeft}d {hoursLeft}h {minutesLeft}m</span>
                </span>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="current" className="w-full" onValueChange={setActiveTab}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <TabsList className="mb-4 sm:mb-0 bg-corepulse-gray-100">
                <TabsTrigger value="current" className="data-[state=active]:bg-white data-[state=active]:text-corepulse-orange">
                  Current Epoch
                </TabsTrigger>
                <TabsTrigger value="past" className="data-[state=active]:bg-white data-[state=active]:text-corepulse-orange">
                  Past Epoch
                </TabsTrigger>
              </TabsList>

              <Button 
                onClick={handleShareOnX} 
                variant="outline" 
                className="border-corepulse-orange text-corepulse-orange hover:bg-corepulse-orange hover:text-white"
              >
                <Users className="mr-2 h-4 w-4" />
                Share on X
              </Button>
            </div>

            <Card>
              <CardHeader className="pb-0">
                <CardTitle className="text-xl font-semibold">
                  {activeTab === "current" ? "Current Epoch Rankings" : "Previous Epoch Rankings"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TabsContent value="current" className="mt-0">
                  <LeaderboardTable data={currentEpochLeaderboard} />
                </TabsContent>
                
                <TabsContent value="past" className="mt-0">
                  <LeaderboardTable data={pastEpochLeaderboard} />
                </TabsContent>
              </CardContent>
            </Card>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

interface LeaderboardTableProps {
  data: {
    rank: number;
    address: string;
    mined: number;
    isCurrent: boolean;
  }[];
}

const LeaderboardTable = ({ data }: LeaderboardTableProps) => {
  return (
    <div>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-corepulse-gray-100">
              <TableHead className="w-16 text-center font-bold">Rank</TableHead>
              <TableHead className="font-bold">Address</TableHead>
              <TableHead className="text-right font-bold">Total Mined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((user) => (
              <TableRow key={user.address} className={user.isCurrent ? "bg-corepulse-orange/10" : ""}>
                <TableCell className="text-center font-medium">
                  <div className="flex justify-center">
                    {user.rank <= 3 ? (
                      <div className={`
                        flex items-center justify-center w-8 h-8 rounded-full
                        ${user.rank === 1 ? 'bg-yellow-100 text-yellow-800' : 
                          user.rank === 2 ? 'bg-gray-100 text-gray-800' : 
                          'bg-amber-100 text-amber-800'}
                      `}>
                        {user.rank}
                      </div>
                    ) : (
                      user.rank
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {user.address}
                    {user.isCurrent && (
                      <Badge className="ml-2 bg-corepulse-orange">You</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-mono font-medium">{user.mined.toLocaleString()}</span>
                  <span className="text-xs ml-1 text-corepulse-gray-500">WAVES</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default Leaderboard;
