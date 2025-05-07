
import React from 'react';
import { useActivitiesFeed } from '@/hooks/useActivitiesFeed';
import { formatDistance } from 'date-fns';
import { Activity, CircleAlert, Users, Pickaxe, Gift, PlusCircle, Link as ChainLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ActivityFeedProps {
  global?: boolean;
  limit?: number;
}

const ActivityFeed = ({ global = false, limit = 10 }: ActivityFeedProps) => {
  const { activities, loading, error } = useActivitiesFeed({ global, limit });

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'wallet_connect':
        return <Activity className="h-4 w-4" />;
      case 'start_mining':
      case 'stop_mining':
        return <Pickaxe className="h-4 w-4" />;
      case 'join_crew':
      case 'leave_crew':
        return <Users className="h-4 w-4" />;
      case 'mint_nft':
        return <PlusCircle className="h-4 w-4" />;
      case 'claim_reward':
        return <Gift className="h-4 w-4" />;
      default:
        return <CircleAlert className="h-4 w-4" />;
    }
  };

  const getActivityText = (activity: any) => {
    const truncatedAddress = activity.user_id 
      ? `${activity.user_id.slice(0, 6)}...${activity.user_id.slice(-4)}`
      : 'Unknown';
    
    switch (activity.activity) {
      case 'wallet_connect':
        return `${truncatedAddress} connected their wallet`;
      case 'start_mining':
        return `${truncatedAddress} started mining`;
      case 'stop_mining':
        return `${truncatedAddress} stopped mining after ${activity.metadata?.duration || '?'} minutes`;
      case 'join_crew':
        return `${truncatedAddress} joined ${activity.metadata?.crew_name || 'a crew'}`;
      case 'leave_crew':
        return `${truncatedAddress} left ${activity.metadata?.crew_name || 'a crew'}`;
      case 'mint_nft':
        return `${truncatedAddress} minted a ${activity.metadata?.tier || ''} NFT`;
      case 'claim_reward':
        return `${truncatedAddress} claimed a reward of ${activity.metadata?.amount || '?'} WAVES`;
      default:
        return `${truncatedAddress} performed an action`;
    }
  };

  if (error) {
    return <div className="text-red-500">Error loading activities</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">{global ? 'Community Activity' : 'Your Activity'}</h3>
      
      <div className="space-y-2">
        {loading ? (
          Array(limit).fill(0).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-corepulse-gray-200">
              <Skeleton className="h-6 w-6 rounded-full" />
              <div className="space-y-1 flex-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))
        ) : activities.length > 0 ? (
          activities.map((activity) => (
            <div 
              key={activity.id} 
              className="flex items-start gap-3 p-3 bg-white rounded-lg border border-corepulse-gray-200 hover:border-corepulse-orange transition-colors"
            >
              <div className="bg-corepulse-orange bg-opacity-10 rounded-full p-2 mt-1 text-corepulse-orange">
                {getActivityIcon(activity.activity)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-corepulse-gray-700">{getActivityText(activity)}</p>
                  {activity.is_on_chain && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className="bg-corepulse-orange bg-opacity-10 rounded-full p-1 text-corepulse-orange">
                            <ChainLink className="h-3 w-3" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>On-chain activity</p>
                          {activity.tx_hash && (
                            <p className="text-xs">TX: {activity.tx_hash.slice(0, 10)}...</p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                <p className="text-xs text-corepulse-gray-500">
                  {formatDistance(new Date(activity.created_at), new Date(), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-corepulse-gray-500">
            <p>No activities yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;
