import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";

const PricingPlans = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tier } = useSubscription();

  const handleGetStarted = () => {
    if (user) {
      navigate("/");
    } else {
      navigate("/auth");
    }
  };

  const handleChoosePremium = () => {
    if (!user) {
      navigate("/auth?redirect=%2Fsell%2Fpricing-plans");
      return;
    }
    // For now, show that this is coming soon
    navigate("/sell/list-property");
  };

  const handleContactSales = () => {
    navigate("/about");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">Pricing Plans</h1>
            <p className="text-lg text-muted-foreground">
              Choose the perfect plan to showcase your property and reach more potential buyers
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Basic Plan */}
            <Card className="border-border relative">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Check className="w-5 h-5 text-primary" />
                  <CardTitle>Basic Listing</CardTitle>
                </div>
                <div className="text-3xl font-bold text-foreground">Free</div>
                <p className="text-muted-foreground">Perfect for getting started</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-foreground">Up to 5 photos</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-foreground">Basic property details</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-foreground">30-day listing duration</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-foreground">Contact form inquiries</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full" onClick={handleGetStarted}>
                  {user && tier === "basic" ? "Current Plan" : "Get Started Free"}
                </Button>
              </CardContent>
            </Card>

            {/* Premium Plan */}
            <Card className="border-primary relative">
              <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                Most Popular
              </Badge>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-primary" />
                  <CardTitle>Premium Listing</CardTitle>
                </div>
                <div className="text-3xl font-bold text-foreground">$29<span className="text-lg text-muted-foreground">/month</span></div>
                <p className="text-muted-foreground">Enhanced visibility and features</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-foreground">Up to 20 photos</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-foreground">Featured in search results</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-foreground">Virtual tour support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-foreground">90-day listing duration</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-foreground">Priority customer support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-foreground">Performance analytics</span>
                  </li>
                </ul>
                <Button className="w-full" onClick={handleChoosePremium}>
                  {user && tier === "premium" ? "Current Plan" : "Choose Premium"}
                </Button>
              </CardContent>
            </Card>

            {/* Professional Plan */}
            <Card className="border-border relative">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-5 h-5 text-primary" />
                  <CardTitle>Professional</CardTitle>
                </div>
                <div className="text-3xl font-bold text-foreground">$59<span className="text-lg text-muted-foreground">/month</span></div>
                <p className="text-muted-foreground">For agents and developers</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-foreground">Unlimited photos</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-foreground">Top placement in results</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-foreground">Multiple virtual tours</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-foreground">Unlimited duration</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-foreground">Dedicated account manager</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-foreground">Advanced analytics dashboard</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-foreground">Marketing boost campaigns</span>
                  </li>
                </ul>
                <Button variant="outline" className="w-full" onClick={handleContactSales}>
                  {user && tier === "professional" ? "Current Plan" : "Contact Sales"}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <Card className="border-border bg-muted/50">
              <CardContent className="pt-6">
                <Zap className="w-8 h-8 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Need a Custom Solution?</h3>
                <p className="text-muted-foreground mb-4">
                  For large-scale developers, agencies, or unique requirements, we offer custom pricing and features.
                </p>
                <Button variant="outline" onClick={() => navigate("/about#contact")}>
                  Contact Our Team
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PricingPlans;