import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Smartphone, ArrowLeft, Star, Crown } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

const plans = {
  premium: { name: "Premium Listing", price: "$29", period: "/month", icon: Star },
  professional: { name: "Professional", price: "$59", period: "/month", icon: Crown },
};

const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const plan = searchParams.get("plan") as keyof typeof plans;
  const selectedPlan = plans[plan] || plans.premium;
  const PlanIcon = selectedPlan.icon;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto">
          <Button variant="ghost" className="mb-6" onClick={() => navigate("/sell/pricing-plans")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Plans
          </Button>

          <Card className="border-primary mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PlanIcon className="w-5 h-5 text-primary" />
                  <CardTitle>{selectedPlan.name}</CardTitle>
                </div>
                <Badge className="bg-primary text-primary-foreground text-lg px-3 py-1">
                  {selectedPlan.price}{selectedPlan.period}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-xl">Choose Payment Method</CardTitle>
              <p className="text-muted-foreground text-sm">Payment integration coming soon</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full h-14 justify-start gap-3" disabled>
                <CreditCard className="w-5 h-5 text-muted-foreground" />
                <div className="text-left">
                  <div className="font-medium text-foreground">Credit / Debit Card</div>
                  <div className="text-xs text-muted-foreground">Visa, Mastercard via Stripe</div>
                </div>
                <Badge variant="secondary" className="ml-auto">Coming Soon</Badge>
              </Button>

              <Button variant="outline" className="w-full h-14 justify-start gap-3" disabled>
                <Smartphone className="w-5 h-5 text-muted-foreground" />
                <div className="text-left">
                  <div className="font-medium text-foreground">M-Pesa</div>
                  <div className="text-xs text-muted-foreground">Mobile money payment</div>
                </div>
                <Badge variant="secondary" className="ml-auto">Coming Soon</Badge>
              </Button>

              <p className="text-center text-sm text-muted-foreground pt-4">
                Payment methods will be available once our payment providers are configured.
                <br />
                <span className="text-primary cursor-pointer" onClick={() => navigate("/about#contact")}>
                  Contact us
                </span>{" "}
                for more information.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
