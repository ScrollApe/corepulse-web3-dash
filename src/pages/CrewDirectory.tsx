
import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Search, Users, ChevronDown } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { useWalletConnect } from '@/providers/WalletProvider';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';

// Define types for crews and crew members
type Crew = {
  id: string;
  name: string;
  created_at: string;
  created_by: string;
  _count?: {
    members: number;
    total_mined: number;
  };
};

type CrewMember = {
  id: string;
  user_id: string;
  crew_id: string;
};

type SortOption = 'newest' | 'most_members' | 'most_mined';

const CrewDirectory = () => {
  const [crews, setCrews] = useState<Crew[]>([]);
  const [filteredCrews, setFilteredCrews] = useState<Crew[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [isLoading, setIsLoading] = useState(true);
  const [userCrewId, setUserCrewId] = useState<string | null>(null);
  const { isConnected, address } = useAccount();
  const { connect } = useWalletConnect();

  // Fetch all crews and user's crew membership
  useEffect(() => {
    const fetchCrews = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all crews with member count and total mined aggregation
        const { data: crewsData, error: crewsError } = await supabase
          .from('crews')
          .select('*');

        if (crewsError) throw crewsError;

        // For each crew, get member count and total mined
        const crewsWithStats = await Promise.all(
          crewsData.map(async (crew) => {
            // Get member count
            const { count: membersCount } = await supabase
              .from('crew_members')
              .select('id', { count: 'exact', head: true })
              .eq('crew_id', crew.id);
              
            // Get sum of total_mined from users who are crew members
            const { data: minerData } = await supabase
              .rpc('get_crew_total_mined', { crew_id: crew.id });
            
            const totalMined = minerData ? parseFloat(minerData) : 0;
              
            return { 
              ...crew, 
              _count: { 
                members: membersCount || 0,
                total_mined: totalMined || 0 
              } 
            };
          })
        );

        setCrews(crewsWithStats);
        setFilteredCrews(crewsWithStats);

        // If user is connected, check if they belong to a crew
        if (isConnected && address) {
          const { data: userData } = await supabase
            .from('users')
            .select('id')
            .eq('wallet_address', address.toLowerCase())
            .single();
            
          if (userData) {
            const { data: crewMemberData } = await supabase
              .from('crew_members')
              .select('crew_id')
              .eq('user_id', userData.id)
              .single();
              
            if (crewMemberData) {
              setUserCrewId(crewMemberData.crew_id);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching crews:', error);
        toast("Error loading crews", {
          description: "Please try again later.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCrews();
  }, [isConnected, address]);

  // Handle search and filtering
  useEffect(() => {
    if (!searchQuery) {
      setFilteredCrews(sortCrews(crews, sortBy));
      return;
    }
    
    const filtered = crews.filter((crew) => 
      crew.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setFilteredCrews(sortCrews(filtered, sortBy));
  }, [searchQuery, crews, sortBy]);
  
  // Sort crews based on selected option
  const sortCrews = (crewsToSort: Crew[], sortOption: SortOption) => {
    switch (sortOption) {
      case 'newest':
        return [...crewsToSort].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case 'most_members':
        return [...crewsToSort].sort((a, b) => 
          (b._count?.members || 0) - (a._count?.members || 0)
        );
      case 'most_mined':
        return [...crewsToSort].sort((a, b) => 
          (b._count?.total_mined || 0) - (a._count?.total_mined || 0)
        );
      default:
        return crewsToSort;
    }
  };

  const handleJoinCrew = async (crewId: string, crewName: string) => {
    try {
      if (!isConnected) {
        connect();
        return;
      }
      
      if (userCrewId) {
        toast("Already in a Crew", {
          description: "You must leave your current crew before joining a new one.",
        });
        return;
      }
      
      // First, get the user id from the wallet address
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('wallet_address', address!.toLowerCase())
        .single();
        
      if (userError || !userData) {
        // User doesn't exist yet, create one
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            wallet_address: address!.toLowerCase(),
          })
          .select('id')
          .single();
          
        if (createError || !newUser) {
          throw new Error('Failed to create user profile');
        }
        
        const { error: joinError } = await supabase
          .from('crew_members')
          .insert({
            user_id: newUser.id,
            crew_id: crewId,
          });
          
        if (joinError) throw joinError;
      } else {
        // User exists, add them to the crew
        const { error: joinError } = await supabase
          .from('crew_members')
          .insert({
            user_id: userData.id,
            crew_id: crewId,
          });
          
        if (joinError) throw joinError;
      }
      
      setUserCrewId(crewId);
      toast("Crew Joined!", {
        description: `You have successfully joined ${crewName}!`,
      });
    } catch (error) {
      console.error('Error joining crew:', error);
      toast("Join Failed", {
        description: "Failed to join crew. Please try again.",
      });
    }
  };

  // Generate avatar fallback text from crew name
  const getNameInitials = (name: string) => {
    return name.split(' ')
      .map((word) => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  // Format number with commas
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <Layout>
      <section className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col space-y-4">
          <h1 className="text-3xl font-bold text-center mb-4">Crew Directory</h1>
          <p className="text-center text-corepulse-gray-600 mb-8">
            Join a crew to collaborate with other miners and earn bonus rewards!
          </p>
          
          {/* Search and filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-corepulse-gray-500" />
              <Input
                type="text"
                placeholder="Search crews..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-corepulse-gray-600">Sort by:</span>
              <div className="relative">
                <select
                  className="appearance-none bg-white border border-corepulse-gray-300 rounded px-4 py-2 pr-8 text-corepulse-gray-700"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                >
                  <option value="newest">Newest</option>
                  <option value="most_members">Most Members</option>
                  <option value="most_mined">Most Mined</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-corepulse-gray-500 pointer-events-none" size={16} />
              </div>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-60">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-corepulse-orange"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCrews.length > 0 ? (
                filteredCrews.map((crew) => (
                  <Card key={crew.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 bg-corepulse-orange text-white">
                          <AvatarImage src={`https://api.dicebear.com/7.x/shapes/svg?seed=${crew.id}`} alt={crew.name} />
                          <AvatarFallback>{getNameInitials(crew.name)}</AvatarFallback>
                        </Avatar>
                        <CardTitle className="text-xl">{crew.name}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center text-sm text-corepulse-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <Users size={16} />
                          <span>{formatNumber(crew._count?.members || 0)} members</span>
                        </div>
                        <div>
                          <span className="font-medium">{formatNumber(crew._count?.total_mined || 0)} WAVES</span> mined
                        </div>
                      </div>
                      <div className="h-2 bg-corepulse-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-corepulse-orange transition-all duration-500"
                          style={{ width: `${Math.min(100, ((crew._count?.members || 1) / 10) * 100)}%` }}
                        ></div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      {userCrewId === crew.id ? (
                        <Button 
                          className="w-full bg-corepulse-gray-200 hover:bg-corepulse-gray-300 text-corepulse-gray-800"
                          disabled
                        >
                          Current Crew
                        </Button>
                      ) : (
                        <Button 
                          className="w-full bg-corepulse-orange hover:bg-corepulse-orange-hover text-white"
                          onClick={() => handleJoinCrew(crew.id, crew.name)}
                          disabled={!!userCrewId}
                        >
                          {!isConnected ? "Connect Wallet to Join" : 
                            userCrewId ? "Already in a Crew" : "Join Crew"}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center p-12 bg-corepulse-gray-100 rounded-lg">
                  <p className="text-corepulse-gray-600 mb-2">No crews found matching your search.</p>
                  <Button 
                    className="bg-corepulse-orange hover:bg-corepulse-orange-hover text-white"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear Search
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default CrewDirectory;
