
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from 'react-router-dom';

interface NFTBoostCardProps {
  activeBoost: number;
  nftCount: number;
}

const NFTBoostCard: React.FC<NFTBoostCardProps> = ({ activeBoost, nftCount }) => {
  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>NFT Boost</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mb-4 animate-float">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center">
              <span className="text-2xl font-bold text-corepulse-orange">+{activeBoost}%</span>
            </div>
          </div>
          
          <p className="text-sm text-center text-corepulse-gray-600 mb-2">
            Active Boost: <span className="font-semibold">{activeBoost}%</span>
          </p>
          
          <p className="text-sm text-center text-corepulse-gray-600 mb-4">
            NFTs Owned: <span className="font-semibold">{nftCount}</span>
          </p>
          
          <Link to="/mint" className="text-corepulse-orange hover:text-corepulse-orange-hover text-sm font-medium">
            Get more NFTs →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default NFTBoostCard;
