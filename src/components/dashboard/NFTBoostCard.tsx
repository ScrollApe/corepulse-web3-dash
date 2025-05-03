
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { useAccount } from 'wagmi';
import { supabase } from '@/integrations/supabase/client';

interface NFTBoostCardProps {}

const NFTBoostCard: React.FC<NFTBoostCardProps> = () => {
  const [loading, setLoading] = useState(true);
  const [nftCount, setNftCount] = useState(0);
  const [activeBoost, setActiveBoost] = useState(0);
  const { isConnected, address } = useAccount();
  
  useEffect(() => {
    const fetchNftData = async () => {
      if (!isConnected || !address) {
        setLoading(false);
        return;
      }

      try {
        // Get user id
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
        
        // Get NFT boosts
        const { data: nfts, error: nftError } = await supabase
          .from('nft_boosts')
          .select('*')
          .eq('user_id', userData.id);
          
        if (nftError) {
          console.error('Error fetching NFT boosts:', nftError);
          setLoading(false);
          return;
        }
        
        if (nfts) {
          // Calculate total boost
          const totalBoost = nfts.reduce((sum, nft) => sum + nft.boost_percent, 0);
          setNftCount(nfts.length);
          setActiveBoost(totalBoost);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error in fetchNftData:', error);
        setLoading(false);
      }
    };
    
    fetchNftData();
    
    // Set up real-time subscription
    if (isConnected && address) {
      const channel = supabase
        .channel('nft-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'nft_boosts' }, 
          fetchNftData
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isConnected, address]);

  if (loading) {
    return (
      <Card className="border-2">
        <CardHeader>
          <CardTitle>NFT Boost</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            <Skeleton className="w-28 h-28 rounded-full" />
            <div className="space-y-2 w-full">
              <Skeleton className="h-6 w-1/2 mx-auto" />
              <Skeleton className="h-4 w-2/3 mx-auto" />
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>NFT Boost</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <div className="relative w-28 h-28">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-corepulse-orange to-corepulse-orange-light opacity-20 animate-pulse"></div>
            <div className="absolute inset-2 rounded-full border-4 border-dashed border-corepulse-orange opacity-50 animate-spin-slow"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-4xl font-bold text-corepulse-orange">{activeBoost}%</p>
                <p className="text-xs text-corepulse-gray-600">Boost</p>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-4">
            <p className="font-medium">You own {nftCount} NFT{nftCount !== 1 ? 's' : ''}</p>
            <p className="text-sm text-corepulse-gray-600">Your mining rate is boosted by {activeBoost}%</p>
          </div>
          
          <Button 
            asChild 
            className="mt-4 w-full bg-corepulse-orange hover:bg-corepulse-orange-hover"
          >
            <Link to="/mint">
              Mint More NFTs
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NFTBoostCard;
