
import React, { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAccount } from 'wagmi';
import { supabase } from '@/integrations/supabase/client';
import { useWalletConnect } from '@/providers/WalletProvider';
import { useActivity } from '@/providers/ActivityProvider';
import { toast } from '@/components/ui/sonner';
import JoinCrewForm from '@/components/crews/JoinCrewForm';
import CreateCrewForm from '@/components/crews/CreateCrewForm';

interface CrewMember {
  user_id: string;
  joined_at: string;
  wallet_address: string;
  total_mined: number;
}

interface Crew {
  id: string;
  name: string;
  created_at: string;
  created_by: string;
  member_count: number;
  total_mined: number;
  members: CrewMember[];
  creator_wallet: string;
}

const CrewDirectory = () => {
  const [activeTab, setActiveTab] = useState('browse');
  const [crews, setCrews] = useState<Crew[]>([]);
  const [userCrew, setUserCrew] = useState<Crew | null>(null);
  const [loading, setLoading] = useState(true);
  const { address, isConnected } = useAccount();
  const { connect } = useWalletConnect();
  const { logActivity } = useActivity();
  
  useEffect(() => {
    const fetchCrews = async () => {
      if (!isConnected || !address) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Get user ID
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('wallet_address', address.toLowerCase())
          .single();
        
        if (userError) {
          console.error('Error fetching user:', userError);
          setLoading(false);
          return;
        }
        
        // Check if user is in a crew
        const { data: memberData, error: memberError } = await supabase
          .from('crew_members')
          .select('crew_id')
          .eq('user_id', userData.id)
          .single();
          
        let userCrewData = null;
        
        if (!memberError && memberData) {
          // User is in a crew, get crew details
          const { data: crewData, error: crewError } = await supabase
            .from('crews')
            .select(`
              *,
              creator:created_by(wallet_address),
              members:crew_members(
                user_id,
                joined_at,
                user:user_id(wallet_address, total_mined)
              )
            `)
            .eq('id', memberData.crew_id)
            .single();
            
          if (!crewError && crewData) {
            // Get total mined for crew
            const { data: totalMined } = await supabase.rpc('get_crew_total_mined', {
              crew_id: crewData.id
            });
            
            userCrewData = {
              id: crewData.id,
              name: crewData.name,
              created_at: crewData.created_at,
              created_by: crewData.created_by,
              creator_wallet: crewData.creator.wallet_address,
              member_count: crewData.members.length,
              total_mined: totalMined || 0,
              members: crewData.members.map((member: any) => ({
                user_id: member.user_id,
                joined_at: member.joined_at,
                wallet_address: member.user.wallet_address,
                total_mined: member.user.total_mined
              }))
            };
            
            setUserCrew(userCrewData);
            setActiveTab('my-crew');
          }
        }
        
        // Get all crews
        const { data: allCrews, error: crewsError } = await supabase
          .from('crews')
          .select(`
            *,
            creator:users!crews_created_by_fkey(wallet_address),
            members:crew_members(id)
          `)
          .order('created_at', { ascending: false });
        
        if (crewsError) {
          console.error('Error fetching crews:', crewsError);
          setLoading(false);
          return;
        }
        
        // Get mining stats for each crew
        const crewsWithStats = await Promise.all(
          allCrews.map(async (crew: any) => {
            const { data: totalMined } = await supabase.rpc('get_crew_total_mined', {
              crew_id: crew.id
            });
            
            return {
              id: crew.id,
              name: crew.name,
              created_at: crew.created_at,
              created_by: crew.created_by,
              creator_wallet: crew.creator?.wallet_address,
              member_count: crew.members.length,
              total_mined: totalMined || 0,
              members: []
            };
          })
        );
        
        setCrews(crewsWithStats);
      } catch (error) {
        console.error('Error in fetchCrews:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCrews();
    
    // Set up real-time subscriptions for crews and members
    if (isConnected) {
      const channel = supabase
        .channel('crew-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'crews' }, 
          fetchCrews
        )
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'crew_members' }, 
          fetchCrews
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [address, isConnected]);
  
  // Leave crew
  const handleLeaveCrew = async () => {
    if (!isConnected || !address || !userCrew) return;
    
    try {
      // Get user ID
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('wallet_address', address.toLowerCase())
        .single();
      
      if (userError) {
        console.error('Error fetching user:', userError);
        return;
      }
      
      // Check if user is the creator
      if (userCrew.creator_wallet === address.toLowerCase()) {
        toast.error("Crew creators cannot leave their crew");
        return;
      }
      
      // Remove from crew
      const { error: leaveError } = await supabase
        .from('crew_members')
        .delete()
        .eq('user_id', userData.id);
        
      if (leaveError) {
        console.error('Error leaving crew:', leaveError);
        toast.error("Failed to leave crew");
        return;
      }
      
      // Log activity
      await logActivity('leave_crew', { crew_id: userCrew.id });
      
      toast.success("Successfully left crew");
      setUserCrew(null);
      setActiveTab('browse');
      
    } catch (error) {
      console.error('Error in handleLeaveCrew:', error);
      toast.error("An error occurred");
    }
  };
  
  // Format wallet address
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Handle successful crew creation or join
  const handleCrewSuccess = () => {
    // Refresh crews data
    const fetchCrews = async () => {
      if (!isConnected || !address) return;
      
      try {
        // Get user ID
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('wallet_address', address.toLowerCase())
          .single();
        
        if (userError) {
          console.error('Error fetching user:', userError);
          return;
        }
        
        // Check if user is in a crew
        const { data: memberData, error: memberError } = await supabase
          .from('crew_members')
          .select('crew_id')
          .eq('user_id', userData.id)
          .single();
          
        if (!memberError && memberData) {
          // User is in a crew, get crew details
          const { data: crewData, error: crewError } = await supabase
            .from('crews')
            .select(`
              *,
              creator:created_by(wallet_address),
              members:crew_members(
                user_id,
                joined_at,
                user:user_id(wallet_address, total_mined)
              )
            `)
            .eq('id', memberData.crew_id)
            .single();
            
          if (!crewError && crewData) {
            // Get total mined for crew
            const { data: totalMined } = await supabase.rpc('get_crew_total_mined', {
              crew_id: crewData.id
            });
            
            const userCrewData = {
              id: crewData.id,
              name: crewData.name,
              created_at: crewData.created_at,
              created_by: crewData.created_by,
              creator_wallet: crewData.creator.wallet_address,
              member_count: crewData.members.length,
              total_mined: totalMined || 0,
              members: crewData.members.map((member: any) => ({
                user_id: member.user_id,
                joined_at: member.joined_at,
                wallet_address: member.user.wallet_address,
                total_mined: member.user.total_mined
              }))
            };
            
            setUserCrew(userCrewData);
            setActiveTab('my-crew');
          }
        }
      } catch (error) {
        console.error('Error in handleCrewSuccess:', error);
      }
    };
    
    fetchCrews();
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Crew Directory</h1>
        <p className="text-corepulse-gray-600 mb-8">Join or create a crew to boost your mining power and earn rewards together</p>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="browse" disabled={loading}>Browse Crews</TabsTrigger>
            <TabsTrigger value="my-crew" disabled={loading || !userCrew}>My Crew</TabsTrigger>
            <TabsTrigger value="join" disabled={loading || !!userCrew}>Join Crew</TabsTrigger>
            <TabsTrigger value="create" disabled={loading || !!userCrew}>Create Crew</TabsTrigger>
          </TabsList>
          
          <TabsContent value="browse" className="space-y-4">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(6).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-40" />
                ))}
              </div>
            ) : crews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {crews.map(crew => (
                  <Card key={crew.id} className="border-2 hover:border-corepulse-orange">
                    <CardHeader>
                      <CardTitle className="flex justify-between">
                        <span>{crew.name}</span>
                        <span className="text-sm text-corepulse-gray-600 font-normal">
                          {crew.member_count} members
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-corepulse-gray-600">Creator:</span>
                          <span>{formatAddress(crew.creator_wallet || '')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-corepulse-gray-600">Total Mined:</span>
                          <span className="font-medium">{crew.total_mined.toFixed(2)} $CORE</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-corepulse-gray-600">Created:</span>
                          <span>{new Date(crew.created_at).toLocaleDateString()}</span>
                        </div>
                        
                        {!userCrew && (
                          <Button
                            className="w-full mt-2 bg-corepulse-orange hover:bg-corepulse-orange-hover"
                            onClick={() => {
                              if (!isConnected) {
                                connect();
                              } else {
                                setActiveTab('join');
                              }
                            }}
                          >
                            Join Crew
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-corepulse-gray-600">No crews have been created yet.</p>
                  <Button
                    className="mt-4 bg-corepulse-orange hover:bg-corepulse-orange-hover"
                    onClick={() => setActiveTab('create')}
                  >
                    Create the First Crew
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="my-crew">
            {userCrew ? (
              <div className="space-y-6">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>{userCrew.name}</span>
                      <Button
                        variant="outline"
                        className="text-red-500 border-red-200 hover:bg-red-50"
                        onClick={handleLeaveCrew}
                        disabled={userCrew.creator_wallet === address?.toLowerCase()}
                      >
                        {userCrew.creator_wallet === address?.toLowerCase() ? 
                          "Creator Cannot Leave" : "Leave Crew"}
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-corepulse-gray-100 p-4 rounded text-center">
                        <p className="text-corepulse-gray-600 text-sm mb-1">Members</p>
                        <p className="text-2xl font-bold">{userCrew.member_count}</p>
                      </div>
                      <div className="bg-corepulse-gray-100 p-4 rounded text-center">
                        <p className="text-corepulse-gray-600 text-sm mb-1">Total Mined</p>
                        <p className="text-2xl font-bold">{userCrew.total_mined.toFixed(2)} $CORE</p>
                      </div>
                      <div className="bg-corepulse-gray-100 p-4 rounded text-center">
                        <p className="text-corepulse-gray-600 text-sm mb-1">Created</p>
                        <p className="text-2xl font-bold">{new Date(userCrew.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-3">Members</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-corepulse-gray-100">
                            <tr>
                              <th className="p-2 text-left">Wallet</th>
                              <th className="p-2 text-right">Mined</th>
                              <th className="p-2 text-right">Joined</th>
                              <th className="p-2 text-center">Role</th>
                            </tr>
                          </thead>
                          <tbody>
                            {userCrew.members.map(member => (
                              <tr key={member.user_id} className="border-b">
                                <td className="p-2">
                                  {formatAddress(member.wallet_address)}
                                  {member.wallet_address.toLowerCase() === address?.toLowerCase() && (
                                    <span className="ml-2 text-corepulse-orange">(You)</span>
                                  )}
                                </td>
                                <td className="p-2 text-right">{member.total_mined.toFixed(2)}</td>
                                <td className="p-2 text-right">
                                  {new Date(member.joined_at).toLocaleDateString()}
                                </td>
                                <td className="p-2 text-center">
                                  {member.wallet_address === userCrew.creator_wallet ? "Creator" : "Member"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    
                    <div className="mt-6 border-t pt-4">
                      <h3 className="text-lg font-semibold mb-3">Crew ID</h3>
                      <p className="text-corepulse-gray-600 mb-2">Share this ID with friends to invite them to your crew</p>
                      <Card>
                        <CardContent className="p-3 text-center">
                          <code className="bg-corepulse-gray-100 p-2 rounded font-mono">
                            {userCrew.id}
                          </code>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-corepulse-gray-600">You are not a member of any crew.</p>
                  <div className="flex justify-center mt-4 space-x-4">
                    <Button
                      className="bg-corepulse-orange hover:bg-corepulse-orange-hover"
                      onClick={() => setActiveTab('join')}
                    >
                      Join a Crew
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab('create')}
                    >
                      Create a Crew
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="join">
            {!isConnected ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-corepulse-gray-600 mb-4">Connect your wallet to join a crew</p>
                  <Button
                    className="bg-corepulse-orange hover:bg-corepulse-orange-hover"
                    onClick={connect}
                  >
                    Connect Wallet
                  </Button>
                </CardContent>
              </Card>
            ) : userCrew ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-corepulse-gray-600">You are already a member of a crew.</p>
                  <Button
                    className="mt-4 bg-corepulse-orange hover:bg-corepulse-orange-hover"
                    onClick={() => setActiveTab('my-crew')}
                  >
                    View My Crew
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Join a Crew</CardTitle>
                </CardHeader>
                <CardContent>
                  <JoinCrewForm onSuccess={handleCrewSuccess} />
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="create">
            {!isConnected ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-corepulse-gray-600 mb-4">Connect your wallet to create a crew</p>
                  <Button
                    className="bg-corepulse-orange hover:bg-corepulse-orange-hover"
                    onClick={connect}
                  >
                    Connect Wallet
                  </Button>
                </CardContent>
              </Card>
            ) : userCrew ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-corepulse-gray-600">You are already a member of a crew.</p>
                  <Button
                    className="mt-4 bg-corepulse-orange hover:bg-corepulse-orange-hover"
                    onClick={() => setActiveTab('my-crew')}
                  >
                    View My Crew
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Create a New Crew</CardTitle>
                </CardHeader>
                <CardContent>
                  <CreateCrewForm onSuccess={handleCrewSuccess} />
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default CrewDirectory;
