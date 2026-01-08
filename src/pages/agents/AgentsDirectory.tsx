import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Phone, Mail, Award, TrendingUp, Star, Users, Loader2, UserCheck } from "lucide-react";
import { useApprovedAgents } from "@/hooks/useApprovedAgents";
import { useState, useMemo } from "react";

const AgentsDirectory = () => {
  const { agents, loading, error } = useApprovedAgents();
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedExperience, setSelectedExperience] = useState<string>("all");

  // Get unique countries for filter
  const countries = useMemo(() => {
    const uniqueCountries = [...new Set(agents.map(a => a.country))];
    return uniqueCountries.sort();
  }, [agents]);

  // Filter agents
  const filteredAgents = useMemo(() => {
    return agents.filter(agent => {
      const matchesLocation = !searchLocation || 
        agent.hometown?.toLowerCase().includes(searchLocation.toLowerCase()) ||
        agent.state?.toLowerCase().includes(searchLocation.toLowerCase()) ||
        agent.country.toLowerCase().includes(searchLocation.toLowerCase());
      
      const matchesCountry = selectedCountry === "all" || agent.country === selectedCountry;
      
      const matchesExperience = selectedExperience === "all" || 
        agent.experience?.toLowerCase().includes(selectedExperience.toLowerCase());

      return matchesLocation && matchesCountry && matchesExperience;
    });
  }, [agents, searchLocation, selectedCountry, selectedExperience]);

  const getLocationString = (agent: typeof agents[0]) => {
    const parts = [agent.hometown, agent.state, agent.country].filter(Boolean);
    return parts.join(", ") || agent.country;
  };

  const getExperienceBadge = (experience: string | null) => {
    if (!experience) return "New Agent";
    return experience;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <UserCheck className="h-10 w-10 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">Verified Agents Directory</h1>
            </div>
            <p className="text-lg text-muted-foreground">
              Connect with our verified, licensed real estate professionals
            </p>
            <Badge variant="outline" className="mt-2">
              <Users className="w-3 h-3 mr-1" />
              {agents.length} Verified Agent{agents.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          {/* Search Filters */}
          <Card className="border-border mb-8">
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <Input 
                    placeholder="Search by location..." 
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                  />
                </div>
                <div>
                  <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Countries" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Countries</SelectItem>
                      {countries.map(country => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select value={selectedExperience} onValueChange={setSelectedExperience}>
                    <SelectTrigger>
                      <SelectValue placeholder="Experience Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Experience</SelectItem>
                      <SelectItem value="1-3">1-3 years</SelectItem>
                      <SelectItem value="4-7">4-7 years</SelectItem>
                      <SelectItem value="8+">8+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      setSearchLocation("");
                      setSelectedCountry("all");
                      setSelectedExperience("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading agents...</span>
            </div>
          )}

          {/* Error State */}
          {error && (
            <Card className="border-destructive">
              <CardContent className="py-8 text-center">
                <p className="text-destructive">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!loading && !error && filteredAgents.length === 0 && (
            <Card className="border-border">
              <CardContent className="py-16 text-center">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {agents.length === 0 ? "No Agents Yet" : "No Matching Agents"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {agents.length === 0 
                    ? "Be the first to join our network of verified agents."
                    : "Try adjusting your search filters to find agents."}
                </p>
                {agents.length === 0 && (
                  <Button asChild>
                    <a href="/become-agent">Become an Agent</a>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Agent Listings */}
          {!loading && !error && filteredAgents.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredAgents.map((agent) => (
                <Card key={agent.id} className="border-border hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xl font-bold text-primary">
                          {agent.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{agent.full_name}</CardTitle>
                        <Badge variant="secondary" className="mt-1">
                          {getExperienceBadge(agent.experience)}
                        </Badge>
                        {agent.price_range && (
                          <Badge variant="outline" className="mt-1 ml-1">
                            {agent.price_range}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm truncate">{getLocationString(agent)}</span>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1" asChild>
                        <a href={`tel:${agent.phone}`}>
                          <Phone className="w-4 h-4 mr-1" />
                          Call
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <a href={`mailto:${agent.email}`}>
                          <Mail className="w-4 h-4 mr-1" />
                          Email
                        </a>
                      </Button>
                    </div>

                    <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{agent.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{agent.email}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Why Choose Our Agents */}
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <Card className="border-border text-center">
              <CardContent className="pt-6">
                <Award className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Verified Professionals</h3>
                <p className="text-muted-foreground">
                  All agents are verified by our team and vetted for your peace of mind.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border text-center">
              <CardContent className="pt-6">
                <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Local Expertise</h3>
                <p className="text-muted-foreground">
                  Our agents have deep knowledge of their local markets and communities.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border text-center">
              <CardContent className="pt-6">
                <Star className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Direct Contact</h3>
                <p className="text-muted-foreground">
                  Connect directly with agents via phone or email for personalized service.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AgentsDirectory;
