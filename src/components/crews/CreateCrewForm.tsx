
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAccount } from 'wagmi';
import { supabase } from '@/integrations/supabase/client';
import { useActivity } from '@/providers/ActivityProvider';
import { toast } from '@/components/ui/sonner';

interface CreateCrewFormProps {
  onSuccess?: (crewId: string) => void;
}

const CreateCrewForm = ({ onSuccess }: CreateCrewFormProps) => {
  const [crewName, setCrewName] = useState('');
  const [loading, setLoading] = useState(false);
  const { address, isConnected } = useAccount();
  const { logActivity } = useActivity();

  const handleCreateCrew = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !address) {
      toast.error("Please connect your wallet first");
      return;
    }
    
    if (!crewName || crewName.length < 3) {
      toast.error("Please enter a valid crew name (min 3 characters)");
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
      
      // Create crew
      const { data: crewData, error: crewError } = await supabase
        .from('crews')
        .insert({
          name: crewName,
          created_by: userData.id
        })
        .select()
        .single();
        
      if (crewError || !crewData) {
        toast.error("Error creating crew");
        return;
      }
      
      // Join as first member
      const { error: joinError } = await supabase
        .from('crew_members')
        .insert({
          user_id: userData.id,
          crew_id: crewData.id,
          joined_at: new Date().toISOString()
        });
        
      if (joinError) {
        toast.error("Error joining your own crew");
        return;
      }
      
      // Log activity
      await logActivity('join_crew', { crew_id: crewData.id, is_creator: true });
      
      toast.success("Successfully created crew! Your crew ID is: " + crewData.id);
      setCrewName('');
      
      // Try to unlock the Crew Founder achievement
      try {
        const { data: achievementData, error: achievementError } = await supabase
          .from('achievements')
          .select('id')
          .eq('name', 'Crew Founder')
          .single();
          
        if (!achievementError && achievementData) {
          await supabase
            .from('user_achievements')
            .insert({
              user_id: userData.id,
              achievement_id: achievementData.id
            })
            .select();
        }
      } catch (error) {
        console.error('Error unlocking achievement:', error);
      }
      
      if (onSuccess) {
        onSuccess(crewData.id);
      }
      
    } catch (error) {
      console.error('Error creating crew:', error);
      toast.error("Error creating crew");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleCreateCrew} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="crew-name">Crew Name</Label>
        <Input
          id="crew-name"
          placeholder="Enter a name for your crew"
          value={crewName}
          onChange={(e) => setCrewName(e.target.value)}
          disabled={loading}
        />
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-corepulse-orange hover:bg-corepulse-orange-hover" 
        disabled={!isConnected || loading || crewName.length < 3}
      >
        {loading ? "Creating..." : "Create Crew"}
      </Button>
    </form>
  );
};

export default CreateCrewForm;
