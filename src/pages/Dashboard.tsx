import { useState, useRef, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { PropertyCard } from "@/components/PropertyCard";
import { InquiriesSection } from "@/components/InquiriesSection";
import { WishlistSection } from "@/components/WishlistSection";
import { RecentlyViewedSection } from "@/components/RecentlyViewedSection";
import { PropertyAnalyticsCard } from "@/components/PropertyAnalyticsCard";
import { SellerAIInsights } from "@/components/ai/SellerAIInsights";
import { useProperties } from "@/hooks/useProperties";
import { useAuth } from "@/hooks/useAuth";
import { useFavorites } from "@/hooks/useFavorites";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { usePropertyViews } from "@/hooks/usePropertyViews";
import { useProfile } from "@/hooks/useProfile";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Home, MessageSquare, Plus, Building, Heart, Clock, Eye, Sparkles,
  Camera, Save, Loader2, User, Mail, Phone, FileText, Shield
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useInquiries } from "@/hooks/useInquiries";
import { PageTransition } from "@/components/PageTransition";

const Dashboard = () => {
  const { user } = useAuth();
  const { properties, loading: propertiesLoading } = useProperties();
  const { inquiries, loading: inquiriesLoading } = useInquiries();
  const { favorites } = useFavorites();
  const { recentPropertyIds } = useRecentlyViewed();
  const { totalStats, getPropertyStats } = usePropertyViews();
  const { profile, loading: profileLoading, updateProfile, uploadAvatar } = useProfile();
  const { roles } = useUserRoles();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({ full_name: "", phone: "", bio: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const [synced, setSynced] = useState(false);
  if (profile && !synced) {
    setFormData({
      full_name: profile.full_name || "",
      phone: profile.phone || "",
      bio: profile.bio || "",
    });
    setSynced(true);
  }

  const myProperties = properties.filter(p => p.user_id === user?.id);

  useEffect(() => {
    document.title = "Dashboard | KeyNestHub";
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    const success = await updateProfile({
      full_name: formData.full_name.trim() || null,
      phone: formData.phone.trim() || null,
      bio: formData.bio.trim() || null,
    });
    if (success) setIsEditing(false);
    setIsSaving(false);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.size > 2 * 1024 * 1024) return;
    setIsUploadingAvatar(true);
    await uploadAvatar(file);
    setIsUploadingAvatar(false);
  };

  const initials = (profile?.full_name || user?.email || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-14 md:pb-0">
        <Navigation />

        <main className="container mx-auto px-4 py-8">
          {/* Profile Header */}
          <div className="mb-8">
            <Card className="border-border">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Avatar */}
                  <div className="relative group">
                    {profileLoading ? (
                      <Skeleton className="w-20 h-20 rounded-full" />
                    ) : (
                      <>
                        <Avatar className="w-20 h-20 border-2 border-primary/20">
                          <AvatarImage src={profile?.avatar_url || undefined} />
                          <AvatarFallback className="text-xl bg-primary/10 text-primary">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <button
                          className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingAvatar}
                        >
                          {isUploadingAvatar ? (
                            <Loader2 className="w-5 h-5 text-white animate-spin" />
                          ) : (
                            <Camera className="w-5 h-5 text-white" />
                          )}
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarChange}
                        />
                      </>
                    )}
                  </div>

                  {/* Name, email, roles */}
                  <div className="text-center sm:text-left flex-1">
                    <h1 className="text-2xl font-bold text-foreground">
                      {profileLoading ? (
                        <Skeleton className="h-7 w-40 inline-block" />
                      ) : (
                        profile?.full_name || "Welcome!"
                      )}
                    </h1>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 justify-center sm:justify-start mt-1">
                      <Mail className="w-3.5 h-3.5" />
                      {user?.email}
                    </p>
                    {roles.length > 0 && (
                      <div className="flex gap-2 mt-2 justify-center sm:justify-start flex-wrap">
                        {roles.map((role) => (
                          <Badge key={role} variant="secondary" className="capitalize">
                            <Shield className="w-3 h-3 mr-1" />
                            {role}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quick stats */}
                  <div className="flex gap-6 text-center">
                    <div>
                      <div className="text-xl font-bold text-foreground">{myProperties.length}</div>
                      <div className="text-xs text-muted-foreground">Listings</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-foreground">{inquiries.length}</div>
                      <div className="text-xs text-muted-foreground">Inquiries</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-foreground">{totalStats.total_views}</div>
                      <div className="text-xs text-muted-foreground">Views</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-foreground">{favorites.length}</div>
                      <div className="text-xs text-muted-foreground">Saved</div>
                    </div>
                  </div>
                </div>
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

          {/* Tabs */}
          <Tabs defaultValue="inquiries" className="space-y-6">
            <TabsList className="grid w-full max-w-3xl grid-cols-5">
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
                <span className="hidden sm:inline">Properties</span>
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
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
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
                  {myProperties.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        AI Seller Insights
                      </h3>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {myProperties.slice(0, 3).map((property) => (
                          <SellerAIInsights
                            key={property.id}
                            property={{
                              id: property.id,
                              title: property.title,
                              price: property.price,
                              location: property.location,
                              type: property.type,
                              bedrooms: property.bedrooms ?? undefined,
                              bathrooms: property.bathrooms ?? undefined,
                              area: property.area,
                              listing_type: property.listing_type,
                              description: property.description ?? undefined
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

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

            <TabsContent value="profile">
              <div className="max-w-2xl space-y-6">
                {/* Profile Details Card */}
                <Card className="border-border">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Profile Details</CardTitle>
                    {!isEditing ? (
                      <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                        Edit
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setIsEditing(false);
                            setFormData({
                              full_name: profile?.full_name || "",
                              phone: profile?.phone || "",
                              bio: profile?.bio || "",
                            });
                          }}
                        >
                          Cancel
                        </Button>
                        <Button size="sm" onClick={handleSave} disabled={isSaving}>
                          {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
                          Save
                        </Button>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name" className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                        Full Name
                      </Label>
                      <Input
                        id="full_name"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        disabled={!isEditing}
                        placeholder="Your full name"
                        maxLength={100}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        disabled={!isEditing}
                        placeholder="+254 712 345 678"
                        maxLength={20}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio" className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                        Bio
                      </Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        disabled={!isEditing}
                        placeholder="Tell us about yourself..."
                        rows={3}
                        maxLength={500}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Account Info */}
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Account Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email</span>
                      <span className="text-foreground font-medium">{user?.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Member since</span>
                      <span className="text-foreground font-medium">
                        {user?.created_at
                          ? new Date(user.created_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "—"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default Dashboard;
