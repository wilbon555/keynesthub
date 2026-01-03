import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useUserRoles } from './useUserRoles';

export interface AgentInquiry {
  id: string;
  property_id: string;
  requester_name: string;
  requester_email: string;
  requester_phone: string | null;
  message: string | null;
  created_at: string;
  status: string;
  assigned_agent_id: string | null;
  agent_notes: string | null;
  processed_at: string | null;
  property?: {
    id: string;
    title: string;
    type: string;
    location: string;
    price: string;
    user_id: string;
    verification_status: string;
  };
}

export const useAgentInquiries = () => {
  const [inquiries, setInquiries] = useState<AgentInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { isAgent, isAdmin } = useUserRoles();

  const fetchInquiries = async () => {
    if (!user || (!isAgent && !isAdmin)) {
      setInquiries([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contact_requests')
        .select(`
          *,
          property:properties(id, title, type, location, price, user_id, verification_status)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setInquiries((data || []) as AgentInquiry[]);
    } catch (error) {
      console.error('Error fetching agent inquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAgent || isAdmin) {
      fetchInquiries();
    }
  }, [user, isAgent, isAdmin]);

  const updateInquiryStatus = async (
    inquiryId: string, 
    status: string, 
    notes?: string
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const updateData: Record<string, unknown> = {
        status,
        assigned_agent_id: user.id,
        processed_at: new Date().toISOString()
      };

      if (notes) {
        updateData.agent_notes = notes;
      }

      const { error } = await supabase
        .from('contact_requests')
        .update(updateData)
        .eq('id', inquiryId);

      if (error) throw error;

      // Log action
      await supabase.from('agent_actions').insert({
        agent_id: user.id,
        action_type: `inquiry_${status}`,
        target_type: 'contact_request',
        target_id: inquiryId,
        details: { status, notes }
      });

      await fetchInquiries();
      return true;
    } catch (error) {
      console.error('Error updating inquiry:', error);
      return false;
    }
  };

  return {
    inquiries,
    loading,
    updateInquiryStatus,
    refetch: fetchInquiries
  };
};
