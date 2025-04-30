
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface NFTCardProps {
  tier: 'Bronze' | 'Silver' | 'Gold';
  boost: string;
  price: string;
  image: string;
  minted: number;
  totalSupply: number;
}

const NFTCard: React.FC<NFTCardProps> = ({ tier, boost, price, image, minted, totalSupply }) => {
  
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
          <div className="w-full bg-corepulse-gray-200 rounded-full h-2.5">
            <div 
              className="bg-corepulse-orange h-2.5 rounded-full" 
              style={{ width: `${(minted / totalSupply) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-corepulse-gray-600 mt-2">{minted} / {totalSupply} minted</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full bg-corepulse-orange hover:bg-corepulse-orange-hover transition-colors relative button-pulse">
          Mint NFT
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NFTCard;
