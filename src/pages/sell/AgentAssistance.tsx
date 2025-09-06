import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Camera, Calculator, FileText, Phone, Star } from "lucide-react";

const AgentAssistance = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">Agent Assistance</h1>
            <p className="text-lg text-muted-foreground">
              Let our professional real estate agents handle the details while you focus on what matters most
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 mb-12">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Professional Agent Network
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground mb-4">
                  Connect with licensed, experienced real estate professionals who understand your local market. 
                  Our agents are thoroughly vetted and have proven track records of successful sales.
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Comprehensive market analysis</li>
                  <li>• Strategic pricing recommendations</li>
                  <li>• Professional marketing campaigns</li>
                  <li>• Negotiation expertise</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-primary" />
                  Professional Photography
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground mb-4">
                  High-quality photography and virtual tours that showcase your property in the best light. 
                  Professional visuals increase views and accelerate sales.
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• High-resolution photography</li>
                  <li>• Drone aerial shots</li>
                  <li>• Virtual tour creation</li>
                  <li>• Professional editing</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-primary" />
                  Property Valuation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground mb-4">
                  Get accurate property valuations based on recent sales, market trends, and property features. 
                  Price your property competitively to attract serious buyers.
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Comparative market analysis</li>
                  <li>• Price optimization strategies</li>
                  <li>• Market trend insights</li>
                  <li>• Investment potential assessment</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Documentation Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground mb-4">
                  Complete assistance with all legal paperwork and documentation required for property sales. 
                  Ensure compliance and protect your interests throughout the process.
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Legal document preparation</li>
                  <li>• Contract negotiations</li>
                  <li>• Compliance verification</li>
                  <li>• Closing coordination</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border bg-muted/50 mb-8">
            <CardContent className="pt-6">
              <div className="text-center">
                <Star className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-foreground mb-4">Why Choose Our Agent Network?</h3>
                <div className="grid gap-6 md:grid-cols-3 text-left">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Proven Results</h4>
                    <p className="text-muted-foreground">Average sale time 40% faster than market average</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Market Expertise</h4>
                    <p className="text-muted-foreground">Deep local knowledge and pricing strategies</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Full Service</h4>
                    <p className="text-muted-foreground">End-to-end support from listing to closing</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Card className="border-border inline-block">
              <CardContent className="pt-6">
                <Phone className="w-8 h-8 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Ready to Get Started?</h3>
                <p className="text-muted-foreground mb-4 max-w-md">
                  Schedule a free consultation with one of our experienced agents today
                </p>
                <div className="flex gap-3 justify-center">
                  <Button>
                    Schedule Consultation
                  </Button>
                  <Button variant="outline">
                    Call Now: (555) 123-4567
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AgentAssistance;