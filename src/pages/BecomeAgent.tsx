import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navigation } from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { UserCheck, MapPin, Phone, DollarSign, Shield, Clock, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useNavigate } from "react-router-dom";

const BecomeAgent = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { isAgent, pendingRoles, applyForRole, loading: rolesLoading } = useUserRoles();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    country: "",
    state: "",
    hometown: "",
    priceRange: "",
    experience: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const countries = [
    { value: "US", label: "United States", currency: "$" },
    { value: "KE", label: "Kenya", currency: "Ksh" },
    { value: "UK", label: "United Kingdom", currency: "£" },
    { value: "CA", label: "Canada", currency: "CAD$" },
    { value: "AU", label: "Australia", currency: "AUD$" }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const hasPendingAgentApplication = pendingRoles.some(r => r.role === 'agent');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to apply as an agent.",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    // Basic validation
    if (!formData.fullName || !formData.email || !formData.phone || !formData.country) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const success = await applyForRole('agent');
      
      if (success) {
        toast({
          title: "Application Submitted",
          description: "Thank you for your interest! An admin will review your application and get back to you soon."
        });
      } else {
        toast({
          title: "Application Failed",
          description: "You may have already applied. Please try again later.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCountry = countries.find(c => c.value === formData.country);

  // Already an agent
  if (isAgent) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <Card>
              <CardContent className="py-12">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                <h2 className="text-2xl font-bold mb-2">You're Already an Agent!</h2>
                <p className="text-muted-foreground mb-6">
                  You have been approved as a KeyNestHub agent. Access your dashboard to manage inquiries and verify listings.
                </p>
                <Button onClick={() => navigate('/agent-dashboard')}>
                  <Shield className="w-4 h-4 mr-2" />
                  Go to Agent Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Has pending application
  if (hasPendingAgentApplication) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <Card>
              <CardContent className="py-12">
                <Clock className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
                <h2 className="text-2xl font-bold mb-2">Application Pending</h2>
                <p className="text-muted-foreground mb-6">
                  Your agent application is being reviewed by our admin team. We'll notify you once it's approved.
                </p>
                <Button variant="outline" onClick={() => navigate('/dashboard')}>
                  Back to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <UserCheck className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h1 className="text-4xl font-bold text-foreground mb-2">Become an Agent</h1>
            <p className="text-muted-foreground text-lg">
              Join our network of verified agents and help protect buyers from fraud.
            </p>
          </div>

          {/* Benefits Card */}
          <Card className="mb-6 bg-primary/5 border-primary/20">
            <CardContent className="py-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Agent Responsibilities
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Verify property ownership documents before listings go live</li>
                <li>• Review and approve buyer inquiries to prevent fraud</li>
                <li>• Schedule and coordinate property viewings</li>
                <li>• Act as a trusted intermediary between buyers and sellers</li>
                <li>• Ensure all transactions follow platform guidelines</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Agent Application</CardTitle>
              <CardDescription>
                Fill out the form below to apply as an agent with KeyNestHub
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="country">Country of Residence *</Label>
                    <Select value={formData.country} onValueChange={(value) => handleInputChange("country", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.value} value={country.value}>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              {country.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="state">County/State</Label>
                    <Input
                      id="state"
                      type="text"
                      value={formData.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      placeholder="e.g., California, Nairobi County"
                    />
                  </div>
                  <div>
                    <Label htmlFor="hometown">Home Town</Label>
                    <Input
                      id="hometown"
                      type="text"
                      value={formData.hometown}
                      onChange={(e) => handleInputChange("hometown", e.target.value)}
                      placeholder="e.g., Los Angeles, Nairobi"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="priceRange">Typical Buy/Rent Price Range</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="priceRange"
                      type="text"
                      value={formData.priceRange}
                      onChange={(e) => handleInputChange("priceRange", e.target.value)}
                      placeholder={`e.g., ${selectedCountry?.currency || '$'}100,000 - ${selectedCountry?.currency || '$'}500,000`}
                      className="pl-10"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    The typical price range of properties you work with
                  </p>
                </div>

                <div>
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Select value={formData.experience} onValueChange={(value) => handleInputChange("experience", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-1">0-1 years</SelectItem>
                      <SelectItem value="2-5">2-5 years</SelectItem>
                      <SelectItem value="6-10">6-10 years</SelectItem>
                      <SelectItem value="10+">10+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {!user && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-sm text-yellow-700 dark:text-yellow-300">
                    You need to sign in before applying. Click submit to be redirected to the login page.
                  </div>
                )}

                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting || rolesLoading}>
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default BecomeAgent;