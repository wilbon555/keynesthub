import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Home, MapPin, Calendar, Calculator, Percent } from "lucide-react";

const PropertyTrends = () => {
  const trends = [
    {
      location: "Nairobi CBD",
      priceChange: "+12.5%",
      averagePrice: "KSh 8,500,000",
      trend: "up",
      period: "Last 12 months"
    },
    {
      location: "Westlands",
      priceChange: "+8.2%",
      averagePrice: "KSh 15,200,000",
      trend: "up",
      period: "Last 12 months"
    },
    {
      location: "Karen",
      priceChange: "-2.1%",
      averagePrice: "KSh 22,800,000",
      trend: "down",
      period: "Last 12 months"
    },
    {
      location: "Kilimani",
      priceChange: "+6.7%",
      averagePrice: "KSh 12,400,000",
      trend: "up",
      period: "Last 12 months"
    }
  ];

  const insights = [
    {
      title: "Rising Demand for Affordable Housing",
      description: "Government initiatives and housing programs are driving increased demand in the affordable housing sector.",
      impact: "Positive for first-time buyers and investors",
      icon: Home
    },
    {
      title: "Commercial Real Estate Growth",
      description: "Business expansion and foreign investment are boosting commercial property values in major cities.",
      impact: "Strong rental yields expected",
      icon: TrendingUp
    },
    {
      title: "Infrastructure Development Impact",
      description: "New roads, railways, and airports are significantly affecting property values in surrounding areas.",
      impact: "Long-term appreciation potential",
      icon: MapPin
    },
    {
      title: "Interest Rate Considerations",
      description: "Current mortgage rates are affecting buying power and investment decisions across all segments.",
      impact: "Mixed impact on market activity",
      icon: DollarSign
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">Property Market Trends</h1>
            <p className="text-lg text-muted-foreground">
              Stay informed with the latest property market data, price movements, and investment opportunities
            </p>
          </div>

          {/* Market Overview */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
            <Card className="border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Market Activity</p>
                    <p className="text-2xl font-bold text-foreground">+18%</p>
                    <p className="text-xs text-green-600">vs last quarter</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Average Sale Time</p>
                    <p className="text-2xl font-bold text-foreground">45 days</p>
                    <p className="text-xs text-green-600">-8 days from last year</p>
                  </div>
                  <Calendar className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Price per Sq Ft</p>
                    <p className="text-2xl font-bold text-foreground">KSh 8,500</p>
                    <p className="text-xs text-green-600">+12% YoY</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Properties Listed</p>
                    <p className="text-2xl font-bold text-foreground">2,847</p>
                    <p className="text-xs text-blue-600">Active listings</p>
                  </div>
                  <Home className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Regional Trends */}
          <Card className="border-border mb-12">
            <CardHeader>
              <CardTitle>Regional Price Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trends.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-primary" />
                      <div>
                        <h4 className="font-semibold text-foreground">{trend.location}</h4>
                        <p className="text-sm text-muted-foreground">{trend.period}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        {trend.trend === "up" ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                        <span className={`font-semibold ${trend.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                          {trend.priceChange}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{trend.averagePrice}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Market Insights */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Market Insights & Analysis</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {insights.map((insight, index) => {
                const IconComponent = insight.icon;
                return (
                  <Card key={index} className="border-border">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <IconComponent className="w-5 h-5 text-primary" />
                        {insight.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-foreground mb-3">{insight.description}</p>
                      <div className="bg-muted/50 p-3 rounded-md">
                        <p className="text-sm font-medium text-primary">{insight.impact}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* NOI & Cap Rate Calculators */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Investment Calculation Guides</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {/* NOI Calculator Guide */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-primary" />
                    Net Operating Income (NOI)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    NOI measures a property's profitability before financing costs and taxes.
                  </p>
                  
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="font-mono text-sm text-foreground font-semibold mb-2">
                      NOI = Gross Rental Income - Operating Expenses
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-foreground text-sm mb-1">Gross Rental Income includes:</h4>
                      <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                        <li>Monthly/annual rent collected</li>
                        <li>Parking fees</li>
                        <li>Laundry income</li>
                        <li>Other tenant charges</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-foreground text-sm mb-1">Operating Expenses include:</h4>
                      <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                        <li>Property management fees</li>
                        <li>Insurance premiums</li>
                        <li>Property taxes</li>
                        <li>Maintenance & repairs</li>
                        <li>Utilities (if landlord-paid)</li>
                        <li>Vacancy allowance</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                    <h4 className="font-semibold text-foreground text-sm mb-2">Example Calculation:</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Annual Rent: KSh 1,200,000</p>
                      <p>Operating Expenses: KSh 360,000</p>
                      <p className="font-semibold text-foreground pt-2">NOI = KSh 1,200,000 - KSh 360,000 = <span className="text-primary">KSh 840,000</span></p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cap Rate Calculator Guide */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Percent className="w-5 h-5 text-primary" />
                    Capitalization Rate (Cap Rate)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Cap Rate measures the rate of return on a real estate investment property.
                  </p>
                  
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="font-mono text-sm text-foreground font-semibold mb-2">
                      Cap Rate = (NOI ÷ Property Value) × 100
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-foreground text-sm mb-1">What Cap Rate tells you:</h4>
                      <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                        <li>Expected annual return on investment</li>
                        <li>Comparison tool between properties</li>
                        <li>Risk indicator (higher = more risk/reward)</li>
                        <li>Market condition snapshot</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-foreground text-sm mb-1">Cap Rate Ranges:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li><span className="font-medium text-foreground">4-6%:</span> Lower risk, prime locations</li>
                        <li><span className="font-medium text-foreground">6-8%:</span> Moderate risk, good returns</li>
                        <li><span className="font-medium text-foreground">8-10%+:</span> Higher risk, emerging areas</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                    <h4 className="font-semibold text-foreground text-sm mb-2">Example Calculation:</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>NOI: KSh 840,000</p>
                      <p>Property Value: KSh 12,000,000</p>
                      <p className="font-semibold text-foreground pt-2">Cap Rate = (840,000 ÷ 12,000,000) × 100 = <span className="text-primary">7%</span></p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Investment Recommendations */}
          <Card className="border-border mt-12">
            <CardHeader>
              <CardTitle>Investment Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-foreground">Buy Signal: Affordable Housing Sector</h4>
                    <p className="text-muted-foreground">Strong government support and rising demand make this an attractive investment opportunity.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-foreground">Hold: Prime Commercial Areas</h4>
                    <p className="text-muted-foreground">Current valuations are high, but long-term prospects remain positive with infrastructure development.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-foreground">Watch: Suburban Development Areas</h4>
                    <p className="text-muted-foreground">Monitor for infrastructure announcements that could significantly impact property values.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PropertyTrends;