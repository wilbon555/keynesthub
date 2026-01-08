import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ApprovedAgent {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  country: string;
  state: string | null;
  hometown: string | null;
  price_range: string | null;
  experience: string | null;
  approved_at: string | null;
}

export const useApprovedAgents = () => {
  const [agents, setAgents] = useState<ApprovedAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApprovedAgents = async () => {
    try {
      setLoading(true);
      setError(null);

      // First get all approved agent roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, approved_at')
        .eq('role', 'agent')
        .eq('approved', true);

      if (rolesError) throw rolesError;

      if (!rolesData || rolesData.length === 0) {
        setAgents([]);
        return;
      }

      // Get the user IDs of approved agents
      const approvedUserIds = rolesData.map(r => r.user_id);

      // Fetch their application details
      const { data: applicationsData, error: appsError } = await supabase
        .from('agent_applications')
        .select('*')
        .in('user_id', approvedUserIds);

      if (appsError) throw appsError;

      // Map approved_at from roles to applications
      const rolesMap = new Map(rolesData.map(r => [r.user_id, r.approved_at]));

      const approvedAgents: ApprovedAgent[] = (applicationsData || []).map(app => ({
        id: app.id,
        user_id: app.user_id,
        full_name: app.full_name,
        email: app.email,
        phone: app.phone,
        country: app.country,
        state: app.state,
        hometown: app.hometown,
        price_range: app.price_range,
        experience: app.experience,
        approved_at: rolesMap.get(app.user_id) || null
      }));

      setAgents(approvedAgents);
    } catch (err) {
      console.error('Error fetching approved agents:', err);
      setError('Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovedAgents();
  }, []);

  return {
    agents,
    loading,
    error,
    refetch: fetchApprovedAgents
  };
};
