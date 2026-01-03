import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type AppRole = 'buyer' | 'owner' | 'agent' | 'admin';

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  approved: boolean;
  applied_at: string;
  approved_at: string | null;
  approved_by: string | null;
}

export const useUserRoles = () => {
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [pendingRoles, setPendingRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchRoles = async () => {
    if (!user) {
      setRoles([]);
      setPendingRoles([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const approvedRoles = (data || [])
        .filter(r => r.approved)
        .map(r => r.role as AppRole);
      
      const pending = (data || []).filter(r => !r.approved) as UserRole[];

      setRoles(approvedRoles);
      setPendingRoles(pending);
    } catch (error) {
      console.error('Error fetching user roles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [user]);

  const hasRole = (role: AppRole): boolean => {
    return roles.includes(role);
  };

  const isAgent = hasRole('agent');
  const isAdmin = hasRole('admin');
  const isOwner = hasRole('owner');

  const applyForRole = async (role: AppRole): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role,
          approved: false
        });

      if (error) throw error;
      
      await fetchRoles();
      return true;
    } catch (error) {
      console.error('Error applying for role:', error);
      return false;
    }
  };

  return {
    roles,
    pendingRoles,
    loading,
    hasRole,
    isAgent,
    isAdmin,
    isOwner,
    applyForRole,
    refetch: fetchRoles
  };
};
