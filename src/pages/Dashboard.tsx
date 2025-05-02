
import React from 'react';
import Layout from '@/components/layout/Layout';
import MiningPanel from '@/components/dashboard/MiningPanel';
import NFTBoostCard from '@/components/dashboard/NFTBoostCard';
import StreakCard from '@/components/dashboard/StreakCard';
import EarningsCard from '@/components/dashboard/EarningsCard';
import ReferralCard from '@/components/dashboard/ReferralCard';
import EpochCard from '@/components/dashboard/EpochCard';
import LootBox from '@/components/dashboard/LootBox';
import AvatarCard from '@/components/dashboard/AvatarCard';
import ActivityFeed from '@/components/dashboard/ActivityFeed';

const Dashboard = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Mining Dashboard</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main mining panel - takes more space */}
          <div className="lg:col-span-2">
            <MiningPanel />
          </div>
          
          {/* NFT Boost panel */}
          <div>
            <NFTBoostCard activeBoost={15} nftCount={2} />
          </div>
          
          {/* Daily Streak */}
          <div>
            <StreakCard currentStreak={5} bestStreak={12} />
          </div>
          
          {/* Earnings Summary - takes more space */}
          <div className="lg:col-span-2">
            <EarningsCard />
          </div>
          
          {/* Avatar Evolution */}
          <div className="lg:row-span-2">
            <AvatarCard 
              level={7} 
              experience={350} 
              nextLevelExp={500} 
              avatarImage="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
            />
          </div>
          
          {/* Activity Feed */}
          <div className="lg:col-span-2">
            <ActivityFeed limit={5} />
          </div>
          
          {/* Referral Panel */}
          <div>
            <ReferralCard />
          </div>
          
          {/* Epoch Countdown */}
          <div>
            <EpochCard daysLeft={5} hoursLeft={12} progress={65} />
          </div>
          
          {/* Community Activity Feed */}
          <div className="lg:col-span-3">
            <ActivityFeed global={true} limit={10} />
          </div>
        </div>
      </div>
      
      {/* Animated loot box that appears occasionally */}
      <LootBox />
    </Layout>
  );
};

export default Dashboard;
