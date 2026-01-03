import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useUserRoles } from './useUserRoles';

export interface Viewing {
  id: string;
  inquiry_id: string;
  property_id: string;
  buyer_id: string | null;
  owner_id: string;
  scheduled_by: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useViewings = () => {
  const [viewings, setViewings] = useState<Viewing[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { isAgent, isAdmin } = useUserRoles();

  const fetchViewings = async () => {
    if (!user) {
      setViewings([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('viewings')
        .select('*')
        .order('scheduled_at', { ascending: true });

      if (error) throw error;

      setViewings((data || []) as Viewing[]);
    } catch (error) {
      console.error('Error fetching viewings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViewings();
  }, [user]);

  const scheduleViewing = async (
    inquiryId: string,
    propertyId: string,
    ownerId: string,
    buyerId: string | null,
    scheduledAt: Date,
    durationMinutes: number = 30,
    notes?: string
  ): Promise<boolean> => {
    if (!user || (!isAgent && !isAdmin)) return false;

    try {
      const { error } = await supabase
        .from('viewings')
        .insert({
          inquiry_id: inquiryId,
          property_id: propertyId,
          owner_id: ownerId,
          buyer_id: buyerId,
          scheduled_by: user.id,
          scheduled_at: scheduledAt.toISOString(),
          duration_minutes: durationMinutes,
          notes: notes || null,
          status: 'scheduled'
        });

      if (error) throw error;

      // Log action
      await supabase.from('agent_actions').insert({
        agent_id: user.id,
        action_type: 'viewing_scheduled',
        target_type: 'viewing',
        target_id: inquiryId,
        details: { property_id: propertyId, scheduled_at: scheduledAt.toISOString() }
      });

      await fetchViewings();
      return true;
    } catch (error) {
      console.error('Error scheduling viewing:', error);
      return false;
    }
  };

  const updateViewingStatus = async (
    viewingId: string,
    status: 'scheduled' | 'completed' | 'cancelled'
  ): Promise<boolean> => {
    if (!user || (!isAgent && !isAdmin)) return false;

    try {
      const { error } = await supabase
        .from('viewings')
        .update({ status })
        .eq('id', viewingId);

      if (error) throw error;

      await fetchViewings();
      return true;
    } catch (error) {
      console.error('Error updating viewing:', error);
      return false;
    }
  };

  return {
    viewings,
    loading,
    scheduleViewing,
    updateViewingStatus,
    refetch: fetchViewings
  };
};
