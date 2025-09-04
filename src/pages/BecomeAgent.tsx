import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navigation } from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { UserCheck, MapPin, Phone, DollarSign } from "lucide-react";

const BecomeAgent = () => {
  const { toast } = useToast();
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.fullName || !formData.email || !formData.phone || !formData.country) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Application Submitted",
      description: "Thank you for your interest! We'll review your application and get back to you soon."
    });

    // Reset form
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      country: "",
      state: "",
      hometown: "",
      priceRange: "",
      experience: ""
    });
  };

  const selectedCountry = countries.find(c => c.value === formData.country);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <UserCheck className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h1 className="text-4xl font-bold text-foreground mb-2">Become an Agent</h1>
            <p className="text-muted-foreground text-lg">
              Join our network of professional real estate agents and grow your business with us.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Agent Registration</CardTitle>
              <CardDescription>
                Fill out the form below to apply as an agent with Acres and Beyond
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

                <Button type="submit" className="w-full" size="lg">
                  Submit Application
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