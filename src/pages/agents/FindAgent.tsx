import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, MapPin, Phone, Mail, MessageSquare, Award, TrendingUp, Loader2 } from "lucide-react";
import { useApprovedAgents } from "@/hooks/useApprovedAgents";
import { useState } from "react";

const FindAgent = () => {
  const { agents, loading, error } = useApprovedAgents();
  const [searchLocation, setSearchLocation] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("");

  const filteredAgents = agents.filter((agent) => {
    const locationMatch = !searchLocation || 
      [agent.country, agent.state, agent.hometown].some(
        (loc) => loc?.toLowerCase().includes(searchLocation.toLowerCase())
      );
    const expMatch = !experienceFilter || (() => {
      const exp = agent.experience || "";
      const years = parseInt(exp);
      if (isNaN(years)) return true;
      switch (experienceFilter) {
        case "1-3": return years >= 1 && years <= 3;
        case "4-7": return years >= 4 && years <= 7;
        case "8-12": return years >= 8 && years <= 12;
        case "12+": return years > 12;
        default: return true;
      }
    })();
    return locationMatch && expMatch;
  });

  const getExperienceYears = (exp: string | null) => {
    if (!exp) return "N/A";
    return exp;
  };

  const getLocation = (agent: typeof agents[0]) => {
    const parts = [agent.hometown, agent.state, agent.country].filter(Boolean);
    return parts.join(", ") || "Not specified";
  };

  return (
    <div className="min-h-screen bg-background pb-14 md:pb-0">
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
                  <Input 
                    placeholder="Search by location..." 
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                  />
                </div>
                <div>
                  <Select value={specialization} onValueChange={setSpecialization}>
                    <SelectTrigger>
                      <SelectValue placeholder="Specialization" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="residential">Residential</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="investment">Investment</SelectItem>
                      <SelectItem value="rental">Rental</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="1-3">1-3 years</SelectItem>
                      <SelectItem value="4-7">4-7 years</SelectItem>
                      <SelectItem value="8-12">8-12 years</SelectItem>
                      <SelectItem value="12+">12+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Button className="w-full" onClick={() => { setSearchLocation(""); setSpecialization(""); setExperienceFilter(""); }}>
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Agent Listings */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading agents...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">{error}</div>
          ) : filteredAgents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg">No verified agents found.</p>
              <p className="text-sm mt-2">Check back later as new agents are being approved.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredAgents.map((agent) => (
                <Card key={agent.id} className="border-border">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                        <div className="text-xl font-bold text-primary">{agent.full_name.charAt(0)}</div>
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{agent.full_name}</CardTitle>
                        {agent.price_range && (
                          <Badge variant="secondary" className="mt-1">
                            {agent.price_range}
                          </Badge>
                        )}
                        <div className="flex items-center gap-1 mt-2">
                          <Star className="w-4 h-4 fill-primary text-primary" />
                          <span className="text-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors">
                            Reviews
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{getLocation(agent)}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">{getExperienceYears(agent.experience)}</div>
                        <div className="text-xs text-muted-foreground">Experience</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">{agent.country}</div>
                        <div className="text-xs text-muted-foreground">Country</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1" asChild>
                        <a href={`mailto:${agent.email}`}>
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Chat
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <a href={`tel:${agent.phone}`}>
                          <Phone className="w-4 h-4 mr-1" />
                          Call
                        </a>
                      </Button>
                    </div>

                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3 h-3" />
                        <a href={`tel:${agent.phone}`} className="hover:text-primary transition-colors">{agent.phone}</a>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-3 h-3" />
                        <a href={`mailto:${agent.email}`} className="hover:text-primary transition-colors">{agent.email}</a>
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
