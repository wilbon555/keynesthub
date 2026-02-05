import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Home, MapPin, Calculator, Shield } from "lucide-react";
import { MarketAIInsights } from "@/components/ai/MarketAIInsights";

const InvestmentTips = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">Property Investment Tips</h1>
            <p className="text-lg text-muted-foreground mb-6">
              Master the art of real estate investing with these proven strategies and insights
            </p>
            <MarketAIInsights context="investment_tips" className="max-w-2xl mx-auto" />
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Location Strategy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground">
                  The golden rule "location, location, location" remains paramount in property investment. Focus on areas with strong infrastructure development, proximity to employment hubs, schools, and transportation links. Research upcoming development projects and government initiatives that could boost property values. Consider neighborhoods with growing populations and limited housing supply, as these create natural appreciation pressure.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-primary" />
                  Financial Planning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground">
                  Successful property investment requires meticulous financial planning. Calculate your total investment including purchase price, renovation costs, legal fees, and ongoing expenses like property management and maintenance. Ensure you have adequate cash flow to cover mortgage payments even during vacancy periods. The 1% rule suggests monthly rent should equal at least 1% of the property's purchase price for positive cash flow.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Market Timing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground">
                  While timing the market perfectly is impossible, understanding market cycles helps optimize investment decisions. Buy during market downturns when prices are lower and competition is reduced. Monitor interest rates, as they significantly impact property affordability and rental yields. Look for emerging markets before they become mainstream, but ensure they have solid fundamentals like job growth and infrastructure development.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="w-5 h-5 text-primary" />
                  Property Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground">
                  Diversify your portfolio across different property types to minimize risk. Residential properties offer steady rental income and long-term appreciation, while commercial properties can provide higher yields but require more capital. Consider emerging sectors like student accommodation or senior living facilities. Each property type has different risk profiles, tenant requirements, and market dynamics that affect returns.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  Rental Yield Optimization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground">
                  Maximize rental yields through strategic improvements and efficient management. Focus on value-adding renovations like modernizing kitchens and bathrooms, improving energy efficiency, or adding extra bedrooms. Screen tenants thoroughly to reduce vacancy and maintenance costs. Consider furnished rentals for higher yields in suitable markets. Regular property maintenance prevents costly repairs and maintains tenant satisfaction.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Risk Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground">
                  Protect your investment through comprehensive insurance coverage including building, contents, and landlord liability insurance. Maintain emergency funds covering 3-6 months of expenses for unexpected repairs or vacancy periods. Diversify geographically to reduce exposure to local market downturns. Regularly review and update rental agreements to ensure compliance with changing regulations and protect your interests.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-8 border-border">
            <CardHeader>
              <CardTitle>Key Investment Principles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <p className="text-foreground">
                    <strong>Start Small:</strong> Begin with one property to learn the ropes before expanding your portfolio. Understanding tenant management, maintenance requirements, and local market dynamics through hands-on experience is invaluable.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <p className="text-foreground">
                    <strong>Build Relationships:</strong> Cultivate networks with real estate agents, property managers, contractors, and other investors. These relationships provide access to off-market deals, reliable service providers, and valuable market insights.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <p className="text-foreground">
                    <strong>Long-term Perspective:</strong> Real estate is typically a long-term investment strategy. Focus on properties that will appreciate over time rather than seeking quick profits. Patience and persistence are key to building substantial wealth through property investment.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <p className="text-foreground">
                    <strong>Continuous Education:</strong> Stay informed about market trends, tax implications, and regulatory changes. Attend property investment seminars, read industry publications, and consider joining investor groups to enhance your knowledge and decision-making capabilities.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default InvestmentTips;