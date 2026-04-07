import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminAgentApprovals } from "@/components/AdminAgentApprovals";
import { AgentListingsManager } from "@/components/AgentListingsManager";
import { AdminContactMessages } from "@/components/AdminContactMessages";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useAuth } from "@/hooks/useAuth";
import { Shield, Users, Building, MessageSquare, Loader2 } from "lucide-react";

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: rolesLoading } = useUserRoles();

  // Combined loading state - wait for both auth and roles to finish
  const isLoading = authLoading || rolesLoading;

  useEffect(() => {
    // Only redirect after all loading is complete
    if (!isLoading) {
      if (!user) {
        navigate('/auth?redirect=/admin');
      } else if (!isAdmin) {
        navigate('/');
      }
    }
  }, [user, isAdmin, isLoading, navigate]);

  // Show loading state while auth or roles are loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // After loading, if user is not admin, don't render (redirect will happen)
  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
              <p className="text-muted-foreground mt-1">
                Manage agent applications and verify property listings
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="agents" className="space-y-6">
          <TabsList className="grid w-full max-w-lg grid-cols-3">
            <TabsTrigger value="agents" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Agent Applications
            </TabsTrigger>
            <TabsTrigger value="properties" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Property Verification
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Contact Messages
            </TabsTrigger>
          </TabsList>

          <TabsContent value="agents">
            <AdminAgentApprovals />
          </TabsContent>

          <TabsContent value="properties">
            <AgentListingsManager />
          </TabsContent>

          <TabsContent value="messages">
            <AdminContactMessages />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminPanel;
