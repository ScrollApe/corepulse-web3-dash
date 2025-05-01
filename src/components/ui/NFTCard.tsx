
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAccount } from 'wagmi';
import { toast } from '@/components/ui/sonner';
import { Progress } from "@/components/ui/progress";
import { Loader } from "lucide-react";

interface NFTCardProps {
  tier: 'Bronze' | 'Silver' | 'Gold';
  boost: string;
  price: string;
  image: string;
  minted: number;
  totalSupply: number;
}

const NFTCard: React.FC<NFTCardProps> = ({ tier, boost, price, image, minted, totalSupply }) => {
  const { isConnected } = useAccount();
  const [isMinting, setIsMinting] = useState(false);
  
  const getBgColor = () => {
    switch (tier) {
      case 'Bronze':
        return 'bg-gradient-to-b from-amber-600 to-amber-800';
      case 'Silver':
        return 'bg-gradient-to-b from-gray-300 to-gray-500';
      case 'Gold':
        return 'bg-gradient-to-b from-yellow-300 to-yellow-500';
      default:
        return 'bg-gradient-to-b from-amber-600 to-amber-800';
    }
  };
  
  const handleMint = async () => {
    if (!isConnected) {
      toast("Wallet not connected", {
        description: "Please connect your wallet to mint NFTs",
        variant: "destructive",
      });
      return;
    }
    
    setIsMinting(true);
    
    try {
      // Simulate minting process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast("NFT Minted!", {
        description: `You have successfully minted a ${tier} NFT!`,
        variant: "default",
      });
      
      // In a real app, we would call the contract here
      // const tx = await contract.mint(tier);
      // await tx.wait();
    } catch (error) {
      console.error("Mint error:", error);
      toast("Mint Failed", {
        description: "Failed to mint NFT. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsMinting(false);
    }
  };
  
  const percentMinted = (minted / totalSupply) * 100;
  
  return (
    <Card className="overflow-hidden border-2 hover:shadow-lg transition-all duration-300">
      <div className={`h-3 w-full ${getBgColor()}`}></div>
      <CardHeader>
        <CardTitle className="text-xl font-bold">{tier} Booster</CardTitle>
        <CardDescription>Mining boost: {boost}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center mb-4">
          <div className={`w-32 h-32 rounded-full ${getBgColor()} flex items-center justify-center p-1`}>
            <div className="bg-white w-full h-full rounded-full flex items-center justify-center">
              <img 
                src={image} 
                alt={`${tier} NFT`} 
                className="w-24 h-24 object-contain" 
              />
            </div>
          </div>
        </div>
        <div className="text-center">
          <p className="font-semibold text-lg mb-2">{price}</p>
          <Progress value={percentMinted} className="h-2" />
          <p className="text-sm text-corepulse-gray-600 mt-2">{minted} / {totalSupply} minted</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full bg-corepulse-orange hover:bg-corepulse-orange-hover transition-colors relative button-pulse"
          onClick={handleMint}
          disabled={isMinting}
        >
          {isMinting ? (
            <>
              <Loader className="animate-spin mr-2" size={16} />
              Minting...
            </>
          ) : (
            "Mint NFT"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NFTCard;
