import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, MapPin, Phone, Mail, MessageSquare, Award, TrendingUp } from "lucide-react";

const FindAgent = () => {
  const agents = [
    {
      id: 1,
      name: "Sarah Johnson",
      specialization: "Residential Sales",
      experience: "8 years",
      rating: 4.9,
      reviews: 127,
      location: "Nairobi, Kenya",
      phone: "+254 712 345 678",
      email: "sarah@example.com",
      properties: 89,
      image: "/placeholder.svg"
    },
    {
      id: 2,
      name: "David Kimani",
      specialization: "Commercial Properties",
      experience: "12 years",
      rating: 4.8,
      reviews: 94,
      location: "Mombasa, Kenya",
      phone: "+254 723 456 789",
      email: "david@example.com",
      properties: 156,
      image: "/placeholder.svg"
    },
    {
      id: 3,
      name: "Grace Wanjiku",
      specialization: "Investment Properties",
      experience: "6 years",
      rating: 4.9,
      reviews: 73,
      location: "Kisumu, Kenya",
      phone: "+254 734 567 890",
      email: "grace@example.com",
      properties: 42,
      image: "/placeholder.svg"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">Find a Real Estate Agent</h1>
            <p className="text-lg text-muted-foreground">
              Connect with experienced, licensed real estate professionals in your area
            </p>
          </div>

          {/* Search Filters */}
          <Card className="border-border mb-8">
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <Input placeholder="Search by location..." />
                </div>
                <div>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Specialization" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residential">Residential</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="investment">Investment</SelectItem>
                      <SelectItem value="rental">Rental</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-3">1-3 years</SelectItem>
                      <SelectItem value="4-7">4-7 years</SelectItem>
                      <SelectItem value="8-12">8-12 years</SelectItem>
                      <SelectItem value="12+">12+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Button className="w-full">Search Agents</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Agent Listings */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <Card key={agent.id} className="border-border">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                      <div className="text-xl font-bold text-primary">{agent.name.charAt(0)}</div>
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{agent.name}</CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        {agent.specialization}
                      </Badge>
                      <div className="flex items-center gap-1 mt-2">
                        <Star className="w-4 h-4 fill-primary text-primary" />
                        <span className="text-sm font-semibold">{agent.rating}</span>
                        <span className="text-sm text-muted-foreground">({agent.reviews} reviews)</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{agent.location}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground">{agent.properties}</div>
                      <div className="text-xs text-muted-foreground">Properties Sold</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground">{agent.experience}</div>
                      <div className="text-xs text-muted-foreground">Experience</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Chat
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Phone className="w-4 h-4 mr-1" />
                      Call
                    </Button>
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3" />
                      {agent.phone}
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3 h-3" />
                      {agent.email}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Why Choose Our Agents */}
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <Card className="border-border text-center">
              <CardContent className="pt-6">
                <Award className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Licensed Professionals</h3>
                <p className="text-muted-foreground">
                  All agents are licensed, insured, and thoroughly vetted for your peace of mind.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border text-center">
              <CardContent className="pt-6">
                <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Proven Track Record</h3>
                <p className="text-muted-foreground">
                  Our agents have demonstrated success in their local markets with satisfied clients.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border text-center">
              <CardContent className="pt-6">
                <Star className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Customer Rated</h3>
                <p className="text-muted-foreground">
                  Read real reviews and ratings from previous clients to make informed decisions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FindAgent;