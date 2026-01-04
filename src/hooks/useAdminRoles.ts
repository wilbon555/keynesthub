import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from './useUserRoles';

export const useAdminRoles = () => {
  const [pendingApplications, setPendingApplications] = useState<UserRole[]>([]);
  const [approvedRoles, setApprovedRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAllRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('applied_at', { ascending: false });

      if (error) throw error;

      const pending = (data || []).filter(r => !r.approved) as UserRole[];
      const approved = (data || []).filter(r => r.approved) as UserRole[];

      setPendingApplications(pending);
      setApprovedRoles(approved);
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllRoles();
  }, []);

  const approveRole = async (roleId: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('user_roles')
        .update({
          approved: true,
          approved_at: new Date().toISOString(),
          approved_by: user.id
        })
        .eq('id', roleId);

      if (error) throw error;

      toast({
        title: "Application Approved",
        description: "The user has been granted the requested role."
      });

      await fetchAllRoles();
      return true;
    } catch (error) {
      console.error('Error approving role:', error);
      toast({
        title: "Error",
        description: "Failed to approve the application.",
        variant: "destructive"
      });
      return false;
    }
  };

  const rejectRole = async (roleId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;

      toast({
        title: "Application Rejected",
        description: "The application has been rejected and removed."
      });

      await fetchAllRoles();
      return true;
    } catch (error) {
      console.error('Error rejecting role:', error);
      toast({
        title: "Error",
        description: "Failed to reject the application.",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    pendingApplications,
    approvedRoles,
    loading,
    approveRole,
    rejectRole,
    refetch: fetchAllRoles
  };
};
