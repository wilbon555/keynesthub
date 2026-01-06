import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from './useUserRoles';

export interface AgentApplication {
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
  created_at: string;
}

export interface UserRoleWithApplication extends UserRole {
  application?: AgentApplication | null;
}

export const useAdminRoles = () => {
  const [pendingApplications, setPendingApplications] = useState<UserRoleWithApplication[]>([]);
  const [approvedRoles, setApprovedRoles] = useState<UserRoleWithApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAllRoles = async () => {
    try {
      // Fetch all roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .order('applied_at', { ascending: false });

      if (rolesError) throw rolesError;

      // Fetch all agent applications
      const { data: applicationsData, error: appsError } = await supabase
        .from('agent_applications')
        .select('*');

      if (appsError) throw appsError;

      // Map applications by user_id for quick lookup
      const applicationsMap = new Map<string, AgentApplication>();
      (applicationsData || []).forEach((app: AgentApplication) => {
        applicationsMap.set(app.user_id, app);
      });

      // Combine roles with their applications
      const rolesWithApps: UserRoleWithApplication[] = (rolesData || []).map(role => ({
        ...role,
        application: applicationsMap.get(role.user_id) || null
      })) as UserRoleWithApplication[];

      const pending = rolesWithApps.filter(r => !r.approved);
      const approved = rolesWithApps.filter(r => r.approved);

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

  const sendNotificationEmail = async (email: string, fullName: string, status: "approved" | "rejected") => {
    try {
      const { error } = await supabase.functions.invoke('notify-agent-application', {
        body: { email, fullName, status }
      });
      if (error) {
        console.error('Failed to send notification email:', error);
      }
    } catch (error) {
      console.error('Error sending notification email:', error);
    }
  };

  const approveRole = async (roleId: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Get the application details before approving
      const application = pendingApplications.find(app => app.id === roleId);

      const { error } = await supabase
        .from('user_roles')
        .update({
          approved: true,
          approved_at: new Date().toISOString(),
          approved_by: user.id
        })
        .eq('id', roleId);

      if (error) throw error;

      // Send notification email
      if (application?.application) {
        sendNotificationEmail(
          application.application.email,
          application.application.full_name,
          "approved"
        );
      }

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
      // Get the application details before rejecting
      const application = pendingApplications.find(app => app.id === roleId);

      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;

      // Send notification email
      if (application?.application) {
        sendNotificationEmail(
          application.application.email,
          application.application.full_name,
          "rejected"
        );
      }

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
