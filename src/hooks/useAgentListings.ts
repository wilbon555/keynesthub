import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useUserRoles } from './useUserRoles';

export interface AgentListing {
  id: string;
  title: string;
  type: string;
  location: string;
  price: string;
  area: string;
  user_id: string;
  verification_status: string;
  verified_at: string | null;
  verified_by: string | null;
  verification_notes: string | null;
  created_at: string;
  listing_type: string;
  image: string | null;
  images: string[] | null;
}

export const useAgentListings = () => {
  const [listings, setListings] = useState<AgentListing[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { isAgent, isAdmin } = useUserRoles();

  const fetchListings = async () => {
    if (!user || (!isAgent && !isAdmin)) {
      setListings([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setListings((data || []) as AgentListing[]);
    } catch (error) {
      console.error('Error fetching listings for verification:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAgent || isAdmin) {
      fetchListings();
    }
  }, [user, isAgent, isAdmin]);

  const verifyListing = async (
    propertyId: string, 
    status: 'verified' | 'rejected',
    notes?: string
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('properties')
        .update({
          verification_status: status,
          verified_at: new Date().toISOString(),
          verified_by: user.id,
          verification_notes: notes || null
        })
        .eq('id', propertyId);

      if (error) throw error;

      // Log action
      await supabase.from('agent_actions').insert({
        agent_id: user.id,
        action_type: `listing_${status}`,
        target_type: 'property',
        target_id: propertyId,
        details: { status, notes }
      });

      await fetchListings();
      return true;
    } catch (error) {
      console.error('Error verifying listing:', error);
      return false;
    }
  };

  const pendingListings = listings.filter(l => l.verification_status === 'pending');
  const verifiedListings = listings.filter(l => l.verification_status === 'verified');
  const rejectedListings = listings.filter(l => l.verification_status === 'rejected');

  return {
    listings,
    pendingListings,
    verifiedListings,
    rejectedListings,
    loading,
    verifyListing,
    refetch: fetchListings
  };
};
