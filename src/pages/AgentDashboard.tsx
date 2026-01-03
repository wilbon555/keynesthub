import { useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { AgentInquiriesManager } from "@/components/AgentInquiriesManager";
import { AgentListingsManager } from "@/components/AgentListingsManager";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useAgentInquiries } from "@/hooks/useAgentInquiries";
import { useAgentListings } from "@/hooks/useAgentListings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  MessageSquare, 
  Building, 
  CalendarDays,
  AlertTriangle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useViewings } from "@/hooks/useViewings";

const AgentDashboard = () => {
  const { isAgent, isAdmin, loading: rolesLoading } = useUserRoles();
  const { inquiries } = useAgentInquiries();
  const { pendingListings } = useAgentListings();
  const { viewings } = useViewings();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Agent Dashboard | KeyNestHub";
  }, []);

  if (rolesLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!isAgent && !isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="py-12 text-center">
              <AlertTriangle className="h-16 w-16 mx-auto text-yellow-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground mb-4">
                You need to be an approved agent to access this dashboard.
              </p>
              <Button onClick={() => navigate('/become-agent')}>
                Apply to Become an Agent
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const pendingInquiries = inquiries.filter(i => i.status === 'pending');
  const upcomingViewings = viewings.filter(
    v => v.status === 'scheduled' && new Date(v.scheduled_at) > new Date()
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Agent Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Verify listings, manage inquiries, and protect buyers from fraud.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Inquiries</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingInquiries.length}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting review
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Listings</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingListings.length}</div>
              <p className="text-xs text-muted-foreground">
                Need verification
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Viewings</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingViewings.length}</div>
              <p className="text-xs text-muted-foreground">
                Scheduled visits
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Processed</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {inquiries.filter(i => i.status !== 'pending').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Inquiries handled
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="inquiries" className="space-y-6">
          <TabsList className="grid w-full max-w-lg grid-cols-2">
            <TabsTrigger value="inquiries" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Inquiries
              {pendingInquiries.length > 0 && (
                <span className="ml-1 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                  {pendingInquiries.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="listings" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Listings
              {pendingListings.length > 0 && (
                <span className="ml-1 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                  {pendingListings.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inquiries">
            <AgentInquiriesManager />
          </TabsContent>

          <TabsContent value="listings">
            <AgentListingsManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AgentDashboard;
