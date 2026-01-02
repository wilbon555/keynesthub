import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { PropertyCard } from "@/components/PropertyCard";
import { InquiriesSection } from "@/components/InquiriesSection";
import { useProperties } from "@/hooks/useProperties";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, MessageSquare, Plus, Building } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useInquiries } from "@/hooks/useInquiries";

const Dashboard = () => {
  const { user } = useAuth();
  const { properties, loading: propertiesLoading } = useProperties();
  const { inquiries, loading: inquiriesLoading } = useInquiries();
  const navigate = useNavigate();

  // Filter to only show user's own properties
  const myProperties = properties.filter(p => p.user_id === user?.id);

  useEffect(() => {
    document.title = "Dashboard | KeyNestHub";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage your properties and view inquiries from potential buyers and renters.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Properties</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myProperties.length}</div>
              <p className="text-xs text-muted-foreground">
                Active listings
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Inquiries</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inquiries.length}</div>
              <p className="text-xs text-muted-foreground">
                From interested buyers/renters
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quick Action</CardTitle>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full mt-2" 
                size="sm"
                onClick={() => navigate('/sell/list-property')}
              >
                <Plus className="h-4 w-4 mr-2" />
                List New Property
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Properties and Inquiries */}
        <Tabs defaultValue="inquiries" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="inquiries" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Inquiries
              {inquiries.length > 0 && (
                <span className="ml-1 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                  {inquiries.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="properties" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              My Properties
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inquiries">
            <InquiriesSection />
          </TabsContent>

          <TabsContent value="properties">
            {propertiesLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading properties...</p>
              </div>
            ) : myProperties.length === 0 ? (
              <div className="text-center py-12">
                <Home className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Properties Listed</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't listed any properties yet. Start by adding your first property!
                </p>
                <Button onClick={() => navigate('/sell/list-property')}>
                  <Plus className="h-4 w-4 mr-2" />
                  List Your First Property
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {myProperties.map((property) => (
                  <PropertyCard 
                    key={property.id} 
                    {...property}
                    listing_type={property.listing_type}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
