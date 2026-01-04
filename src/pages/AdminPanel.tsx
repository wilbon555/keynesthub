import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminAgentApprovals } from "@/components/AdminAgentApprovals";
import { AgentListingsManager } from "@/components/AgentListingsManager";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useAuth } from "@/hooks/useAuth";
import { Shield, Users, Building, Loader2 } from "lucide-react";

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: rolesLoading } = useUserRoles();

  useEffect(() => {
    if (!authLoading && !rolesLoading) {
      if (!user) {
        navigate('/auth');
      } else if (!isAdmin) {
        navigate('/');
      }
    }
  }, [user, isAdmin, authLoading, rolesLoading, navigate]);

  if (authLoading || rolesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="agents" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Agent Applications
            </TabsTrigger>
            <TabsTrigger value="properties" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Property Verification
            </TabsTrigger>
          </TabsList>

          <TabsContent value="agents">
            <AdminAgentApprovals />
          </TabsContent>

          <TabsContent value="properties">
            <AgentListingsManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminPanel;
