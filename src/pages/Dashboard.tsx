import { useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { PropertyCard } from "@/components/PropertyCard";
import { InquiriesSection } from "@/components/InquiriesSection";
import { WishlistSection } from "@/components/WishlistSection";
import { RecentlyViewedSection } from "@/components/RecentlyViewedSection";
import { PropertyAnalyticsCard } from "@/components/PropertyAnalyticsCard";
import { useProperties } from "@/hooks/useProperties";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { usePropertyViews } from "@/hooks/usePropertyViews";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, MessageSquare, Plus, Building, Heart, Clock, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useInquiries } from "@/hooks/useInquiries";

const Dashboard = () => {
  const { user } = useAuth();
  const { properties, loading: propertiesLoading } = useProperties();
  const { inquiries, loading: inquiriesLoading } = useInquiries();
  const { favorites } = useFavorites();
  const { recentPropertyIds } = useRecentlyViewed();
  const { totalStats, getPropertyStats } = usePropertyViews();
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
        <div className="grid gap-4 md:grid-cols-4 mb-8">
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
              <CardTitle className="text-sm font-medium">Saved Properties</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{favorites.length}</div>
              <p className="text-xs text-muted-foreground">
                In your wishlist
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStats.total_views}</div>
              <p className="text-xs text-muted-foreground">
                On your properties
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Card for Owners */}
        {myProperties.length > 0 && (
          <div className="mb-8">
            <PropertyAnalyticsCard
              totalViews={totalStats.total_views}
              viewsToday={totalStats.views_today}
              viewsThisWeek={totalStats.views_this_week}
              viewsThisMonth={totalStats.views_this_month}
            />
          </div>
        )}

        {/* Tabs for Properties, Inquiries, Wishlist and Recently Viewed */}
        <Tabs defaultValue="inquiries" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="inquiries" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Inquiries</span>
              {inquiries.length > 0 && (
                <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                  {inquiries.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="properties" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">My Properties</span>
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Wishlist</span>
              {favorites.length > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {favorites.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Recent</span>
              {recentPropertyIds.length > 0 && (
                <span className="bg-muted-foreground text-background text-xs px-2 py-0.5 rounded-full">
                  {recentPropertyIds.length}
                </span>
              )}
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
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {myProperties.map((property) => {
                    const stats = getPropertyStats(property.id);
                    return (
                      <div key={property.id} className="relative">
                        <PropertyCard 
                          {...property}
                          listing_type={property.listing_type}
                        />
                        {stats && stats.total_views > 0 && (
                          <div className="absolute top-3 left-3 z-10 bg-background/90 backdrop-blur-sm rounded-md px-2 py-1 flex items-center gap-1 text-xs font-medium shadow-sm">
                            <Eye className="h-3 w-3 text-primary" />
                            {stats.total_views} views
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="wishlist">
            <WishlistSection />
          </TabsContent>

          <TabsContent value="recent">
            <RecentlyViewedSection />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
