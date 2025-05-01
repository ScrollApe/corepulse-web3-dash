
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import NFTCard from '@/components/ui/NFTCard';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAccount } from 'wagmi';
import { useWalletConnect } from '@/providers/WalletProvider';
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";

const Mint = () => {
  const [tab, setTab] = useState("available");
  const { address, isConnected } = useAccount();
  const { connect } = useWalletConnect();
  
  const nftTiers = [
    {
      tier: 'Bronze',
      boost: '5%',
      price: '100 $CORE',
      image: 'https://api.dicebear.com/7.x/identicon/svg?seed=bronze',
      minted: 387,
      totalSupply: 1000
    },
    {
      tier: 'Silver',
      boost: '10%',
      price: '250 $CORE',
      image: 'https://api.dicebear.com/7.x/identicon/svg?seed=silver',
      minted: 162,
      totalSupply: 500
    },
    {
      tier: 'Gold',
      boost: '20%',
      price: '500 $CORE',
      image: 'https://api.dicebear.com/7.x/identicon/svg?seed=gold',
      minted: 58,
      totalSupply: 100
    }
  ];
  
  // Sample user NFTs
  const [ownedNFTs, setOwnedNFTs] = useState([
    {
      id: 'nft123',
      tier: 'Bronze',
      boost: '5%',
      image: 'https://api.dicebear.com/7.x/identicon/svg?seed=123',
      mintDate: '2023-11-12'
    },
    {
      id: 'nft456',
      tier: 'Silver',
      boost: '10%',
      image: 'https://api.dicebear.com/7.x/identicon/svg?seed=456',
      mintDate: '2023-12-05'
    }
  ]);

  // Format wallet address for display
  const formatAddress = (address?: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  // Calculate total boost
  const calculateTotalBoost = () => {
    return ownedNFTs.reduce((total, nft) => {
      const boostValue = parseInt(nft.boost, 10);
      return total + boostValue;
    }, 0);
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">NFT Mint</h1>
            <p className="text-corepulse-gray-600 mt-1">
              Mint CorePulse NFTs to boost your mining power
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-col md:flex-row gap-3">
            {!isConnected && (
              <Button 
                className="bg-corepulse-orange hover:bg-corepulse-orange-hover w-full md:w-auto"
                onClick={connect}
              >
                <Wallet className="mr-2" size={16} />
                Connect Wallet
              </Button>
            )}
            <Badge className="bg-corepulse-orange hover:bg-corepulse-orange-hover text-white">
              {isConnected 
                ? `Wallet: ${formatAddress(address)} | Balance: 1,245 $CORE` 
                : "Wallet Balance: 0 $CORE"}
            </Badge>
          </div>
        </div>
        
        <Tabs defaultValue="available" value={tab} onValueChange={setTab} className="mb-8">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="available">Available NFTs</TabsTrigger>
            <TabsTrigger value="owned">Your Collection</TabsTrigger>
          </TabsList>
          
          <TabsContent value="available" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nftTiers.map((nft, index) => (
                <NFTCard
                  key={index}
                  tier={nft.tier as 'Bronze' | 'Silver' | 'Gold'}
                  boost={nft.boost}
                  price={nft.price}
                  image={nft.image}
                  minted={nft.minted}
                  totalSupply={nft.totalSupply}
                />
              ))}
            </div>
            
            <Card className="mt-8 border-2">
              <CardHeader>
                <CardTitle>NFT Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-corepulse-gray-700">
                    CorePulse NFTs provide permanent mining boosts to your account. The higher the tier, the greater the boost.
                  </p>
                  
                  <div className="bg-corepulse-gray-100 p-4 rounded-md">
                    <h3 className="font-semibold text-lg mb-2">Boost Stacking</h3>
                    <p className="text-corepulse-gray-700">
                      You can stack multiple NFT boosts! Each NFT you own adds its boost percentage to your total mining rate.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="p-4 border border-corepulse-gray-200 rounded-md text-center">
                      <div className="w-10 h-10 rounded-full bg-amber-600 mx-auto mb-2"></div>
                      <h4 className="font-semibold">Bronze</h4>
                      <p className="text-corepulse-orange font-bold">+5% Mining Rate</p>
                    </div>
                    
                    <div className="p-4 border border-corepulse-gray-200 rounded-md text-center">
                      <div className="w-10 h-10 rounded-full bg-gray-400 mx-auto mb-2"></div>
                      <h4 className="font-semibold">Silver</h4>
                      <p className="text-corepulse-orange font-bold">+10% Mining Rate</p>
                    </div>
                    
                    <div className="p-4 border border-corepulse-gray-200 rounded-md text-center">
                      <div className="w-10 h-10 rounded-full bg-yellow-400 mx-auto mb-2"></div>
                      <h4 className="font-semibold">Gold</h4>
                      <p className="text-corepulse-orange font-bold">+20% Mining Rate</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="owned" className="mt-0">
            <div className="bg-corepulse-gray-100 p-4 rounded-lg mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="font-semibold text-lg">Your NFT Collection</h3>
                  <p className="text-corepulse-gray-600">You own {ownedNFTs.length} CorePulse NFTs</p>
                </div>
                <div className="mt-2 md:mt-0">
                  <Badge className="bg-corepulse-orange hover:bg-corepulse-orange-hover text-white">
                    Total Boost: +{calculateTotalBoost()}%
                  </Badge>
                </div>
              </div>
            </div>
            
            {isConnected ? (
              ownedNFTs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ownedNFTs.map((nft, index) => (
                    <Card key={index} className="overflow-hidden border-2">
                      <div className={`h-3 w-full ${
                        nft.tier === 'Bronze' 
                          ? 'bg-gradient-to-b from-amber-600 to-amber-800'
                          : nft.tier === 'Silver'
                            ? 'bg-gradient-to-b from-gray-300 to-gray-500'
                            : 'bg-gradient-to-b from-yellow-300 to-yellow-500'
                      }`}></div>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{nft.tier} Booster</CardTitle>
                            <p className="text-sm text-corepulse-gray-500">ID: {nft.id}</p>
                          </div>
                          <Badge className="bg-corepulse-orange hover:bg-corepulse-orange-hover text-white">
                            +{nft.boost} Boost
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-center mb-4">
                          <div className={`w-24 h-24 rounded-full ${
                            nft.tier === 'Bronze' 
                              ? 'bg-gradient-to-b from-amber-600 to-amber-800'
                              : nft.tier === 'Silver'
                                ? 'bg-gradient-to-b from-gray-300 to-gray-500'
                                : 'bg-gradient-to-b from-yellow-300 to-yellow-500'
                          } flex items-center justify-center p-1`}>
                            <div className="bg-white w-full h-full rounded-full flex items-center justify-center">
                              <img 
                                src={nft.image} 
                                alt={`${nft.tier} NFT`} 
                                className="w-20 h-20 object-contain" 
                              />
                            </div>
                          </div>
                        </div>
                        <p className="text-center text-sm text-corepulse-gray-600">
                          Minted on {new Date(nft.mintDate).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-lg text-corepulse-gray-600">
                    You don't own any NFTs yet. Mint one to boost your mining rate!
                  </p>
                  <Button 
                    className="mt-4 bg-corepulse-orange hover:bg-corepulse-orange-hover"
                    onClick={() => setTab("available")}
                  >
                    Browse Available NFTs
                  </Button>
                </div>
              )
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-corepulse-gray-600">
                  Connect your wallet to view your NFTs
                </p>
                <Button 
                  className="mt-4 bg-corepulse-orange hover:bg-corepulse-orange-hover"
                  onClick={connect}
                >
                  <Wallet className="mr-2" size={16} />
                  Connect Wallet
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Mint;
