
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAccount } from 'wagmi';
import { supabase } from '@/integrations/supabase/client';

interface UserProfileData {
  level: number;
  experience: number;
  next_level_exp: number;
  avatar_url?: string;
}

const AvatarCard: React.FC = () => {
  const [userData, setUserData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const { address, isConnected } = useAccount();
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (!isConnected || !address) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('users')
          .select('level, experience, next_level_exp')
          .eq('wallet_address', address.toLowerCase())
          .single();
          
        if (error) {
          console.error('Error fetching user data:', error);
          return;
        }
        
        // Generate avatar URL based on wallet address for consistency
        const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${address}`;
        
        setUserData({
          ...data,
          avatar_url: avatarUrl
        });
        
      } catch (error) {
        console.error('Error in fetchUserData:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
    
    // Set up real-time listener
    if (isConnected && address) {
      const channel = supabase
        .channel('user-profile-changes')
        .on('postgres_changes', 
          { event: 'UPDATE', schema: 'public', table: 'users', filter: `wallet_address=eq.${address.toLowerCase()}` }, 
          (payload) => {
            if (payload.new) {
              const newData = payload.new as any;
              setUserData({
                level: newData.level || 1,
                experience: newData.experience || 0,
                next_level_exp: newData.next_level_exp || 100,
                avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${address}`
              });
            }
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [address, isConnected]);
  
  if (loading) {
    return (
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Your Avatar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center">
            <Skeleton className="w-24 h-24 rounded-full mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-2 w-full mb-4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!userData) {
    return (
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Your Avatar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center">
            <p className="text-corepulse-gray-500">Connect your wallet to view your avatar</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const progress = Math.floor((userData.experience / userData.next_level_exp) * 100);
  
  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Your Avatar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-corepulse-gray-200 p-1 mb-4 relative">
            <img 
              src={userData.avatar_url} 
              alt="User Avatar" 
              className="w-full h-full object-cover rounded-full" 
            />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-corepulse-orange text-white flex items-center justify-center font-bold border-2 border-white">
              {userData.level}
            </div>
          </div>
          
          <div className="w-full">
            <div className="flex justify-between text-sm text-corepulse-gray-600 mb-1">
              <span>Level {userData.level}</span>
              <span>{userData.experience}/{userData.next_level_exp} XP</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-sm font-medium">Next Evolution at Level {userData.level + 5}</p>
            <p className="text-xs text-corepulse-gray-500 mt-1">Keep mining to level up your avatar!</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AvatarCard;
