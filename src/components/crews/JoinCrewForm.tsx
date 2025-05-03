
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAccount } from 'wagmi';
import { supabase } from '@/integrations/supabase/client';
import { useActivity } from '@/providers/ActivityProvider';
import { toast } from '@/components/ui/sonner';

interface JoinCrewFormProps {
  onSuccess?: () => void;
}

const JoinCrewForm = ({ onSuccess }: JoinCrewFormProps) => {
  const [crewCode, setCrewCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { address, isConnected } = useAccount();
  const { logActivity } = useActivity();

  const handleJoinCrew = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !address) {
      toast.error("Please connect your wallet first");
      return;
    }
    
    if (!crewCode) {
      toast.error("Please enter a crew code");
      return;
    }
    
    try {
      setLoading(true);
      
      // Get user id
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('wallet_address', address.toLowerCase())
        .single();
        
      if (userError || !userData) {
        toast.error("Error getting user data");
        return;
      }
      
      // Check if crew exists
      const { data: crewData, error: crewError } = await supabase
        .from('crews')
        .select('id')
        .eq('id', crewCode)
        .single();
        
      if (crewError || !crewData) {
        toast.error("Invalid crew code");
        return;
      }
      
      // Check if user is already in a crew
      const { data: existingMembership, error: membershipError } = await supabase
        .from('crew_members')
        .select('*')
        .eq('user_id', userData.id)
        .single();
        
      if (existingMembership) {
        toast.error("You are already in a crew");
        return;
      }
      
      // Join crew
      const { error: joinError } = await supabase
        .from('crew_members')
        .insert({
          user_id: userData.id,
          crew_id: crewData.id,
          joined_at: new Date().toISOString()
        });
        
      if (joinError) {
        toast.error("Error joining crew");
        return;
      }
      
      // Log activity
      await logActivity('join_crew', { crew_id: crewData.id });
      
      toast.success("Successfully joined crew!");
      setCrewCode('');
      
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error) {
      console.error('Error joining crew:', error);
      toast.error("Error joining crew");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleJoinCrew} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="crew-code">Crew Code</Label>
        <Input
          id="crew-code"
          placeholder="Enter crew code"
          value={crewCode}
          onChange={(e) => setCrewCode(e.target.value)}
          disabled={loading}
        />
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-corepulse-orange hover:bg-corepulse-orange-hover" 
        disabled={!isConnected || loading || !crewCode}
      >
        {loading ? "Joining..." : "Join Crew"}
      </Button>
    </form>
  );
};

export default JoinCrewForm;
