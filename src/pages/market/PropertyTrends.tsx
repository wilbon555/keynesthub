import { useState, useMemo, useEffect, useCallback } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, DollarSign, Home, MapPin, Calendar, Calculator, Percent, Banknote, Building, Save, Trash2, GitCompare, X, FileDown, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { MarketAIInsights } from "@/components/ai/MarketAIInsights";

interface SavedCalculation {
  id: string;
  name: string;
  timestamp: string; // Changed to string for JSON serialization
  noi: number | null;
  capRate: number | null;
  cashOnCash: number | null;
  grm: number | null;
  inputs: {
    grossRentalIncome: string;
    operatingExpenses: string;
    noiForCapRate: string;
    propertyValue: string;
    annualCashFlow: string;
    totalCashInvested: string;
    grmPropertyPrice: string;
    grossAnnualRent: string;
  };
}

const STORAGE_KEY = "keynesthub_saved_calculations";

const PropertyTrends = () => {
  // NOI Calculator State
  const [grossRentalIncome, setGrossRentalIncome] = useState<string>("");
  const [operatingExpenses, setOperatingExpenses] = useState<string>("");
  
  // Cap Rate Calculator State
  const [noiForCapRate, setNoiForCapRate] = useState<string>("");
  const [propertyValue, setPropertyValue] = useState<string>("");

  // Cash-on-Cash Return Calculator State
  const [annualCashFlow, setAnnualCashFlow] = useState<string>("");
  const [totalCashInvested, setTotalCashInvested] = useState<string>("");

  // GRM Calculator State
  const [grmPropertyPrice, setGrmPropertyPrice] = useState<string>("");
  const [grossAnnualRent, setGrossAnnualRent] = useState<string>("");

  // Saved Calculations for Comparison - Load from localStorage
  const [savedCalculations, setSavedCalculations] = useState<SavedCalculation[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [propertyName, setPropertyName] = useState<string>("");
  const [showComparison, setShowComparison] = useState(false);

  // Persist to localStorage whenever savedCalculations changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedCalculations));
    } catch (error) {
      console.error("Failed to save calculations to localStorage:", error);
    }
  }, [savedCalculations]);

  // Calculate NOI
  const calculatedNOI = useMemo(() => {
    const income = parseFloat(grossRentalIncome) || 0;
    const expenses = parseFloat(operatingExpenses) || 0;
    if (income === 0) return null;
    return income - expenses;
  }, [grossRentalIncome, operatingExpenses]);

  // Calculate Cap Rate
  const calculatedCapRate = useMemo(() => {
    const noi = parseFloat(noiForCapRate) || 0;
    const value = parseFloat(propertyValue) || 0;
    if (noi === 0 || value === 0) return null;
    return (noi / value) * 100;
  }, [noiForCapRate, propertyValue]);

  // Calculate Cash-on-Cash Return
  const calculatedCashOnCash = useMemo(() => {
    const cashFlow = parseFloat(annualCashFlow) || 0;
    const cashInvested = parseFloat(totalCashInvested) || 0;
    if (cashInvested === 0) return null;
    return (cashFlow / cashInvested) * 100;
  }, [annualCashFlow, totalCashInvested]);

  // Calculate GRM
  const calculatedGRM = useMemo(() => {
    const price = parseFloat(grmPropertyPrice) || 0;
    const rent = parseFloat(grossAnnualRent) || 0;
    if (price === 0 || rent === 0) return null;
    return price / rent;
  }, [grmPropertyPrice, grossAnnualRent]);

  // Get GRM category
  const getGRMCategory = (grm: number) => {
    if (grm < 4) return { label: "Excellent Value - High Cash Flow", color: "text-emerald-600" };
    if (grm < 8) return { label: "Good Value - Strong Returns", color: "text-green-600" };
    if (grm < 12) return { label: "Fair Value - Average Returns", color: "text-yellow-600" };
    if (grm < 16) return { label: "Below Average Value", color: "text-orange-600" };
    return { label: "Poor Value - Low Cash Flow", color: "text-red-600" };
  };

  // Get Cash-on-Cash Return category
  const getCashOnCashCategory = (rate: number) => {
    if (rate < 0) return { label: "Negative Return - Loss", color: "text-red-600" };
    if (rate < 4) return { label: "Below Average Return", color: "text-orange-600" };
    if (rate < 8) return { label: "Average Return", color: "text-yellow-600" };
    if (rate < 12) return { label: "Good Return", color: "text-green-600" };
    return { label: "Excellent Return", color: "text-emerald-600" };
  };

  // Get Cap Rate category
  const getCapRateCategory = (rate: number) => {
    if (rate < 4) return { label: "Very Low Risk", color: "text-blue-600" };
    if (rate < 6) return { label: "Low Risk, Prime Location", color: "text-green-600" };
    if (rate < 8) return { label: "Moderate Risk, Good Returns", color: "text-yellow-600" };
    if (rate < 10) return { label: "Higher Risk, Higher Returns", color: "text-orange-600" };
    return { label: "High Risk, Emerging Area", color: "text-red-600" };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-KE', { 
      style: 'currency', 
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0 
    }).format(value);
  };

  // Save current calculation
  const saveCalculation = () => {
    const name = propertyName.trim() || `Property ${savedCalculations.length + 1}`;
    const newCalculation: SavedCalculation = {
      id: Date.now().toString(),
      name,
      timestamp: new Date().toISOString(),
      noi: calculatedNOI,
      capRate: calculatedCapRate,
      cashOnCash: calculatedCashOnCash,
      grm: calculatedGRM,
      inputs: {
        grossRentalIncome,
        operatingExpenses,
        noiForCapRate,
        propertyValue,
        annualCashFlow,
        totalCashInvested,
        grmPropertyPrice,
        grossAnnualRent,
      },
    };
    setSavedCalculations((prev) => [...prev, newCalculation]);
    setPropertyName("");
    toast.success(`"${name}" saved successfully`);
  };

  // Export comparison to PDF
  const exportToPDF = useCallback(() => {
    if (savedCalculations.length === 0) {
      toast.error("No calculations to export");
      return;
    }

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow popups to export PDF");
      return;
    }

    const getCategoryLabel = (type: string, value: number | null) => {
      if (value === null) return "—";
      switch (type) {
        case "capRate":
          return getCapRateCategory(value).label;
        case "cashOnCash":
          return getCashOnCashCategory(value).label;
        case "grm":
          return getGRMCategory(value).label;
        default:
          return "";
      }
    };

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Property Comparison Report - KeynestHub</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1a1a1a; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #0f766e; padding-bottom: 20px; }
          .header h1 { color: #0f766e; font-size: 28px; margin-bottom: 8px; }
          .header p { color: #666; font-size: 14px; }
          .date { color: #888; font-size: 12px; margin-top: 8px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px 16px; text-align: center; }
          th { background: #0f766e; color: white; font-weight: 600; }
          th:first-child, td:first-child { text-align: left; }
          tr:nth-child(even) { background: #f9f9f9; }
          .metric-label { font-weight: 500; color: #444; }
          .value { font-weight: 600; font-size: 15px; }
          .category { font-size: 11px; color: #666; margin-top: 4px; }
          .positive { color: #16a34a; }
          .negative { color: #dc2626; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #ddd; padding-top: 20px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Property Investment Comparison</h1>
          <p>KeynestHub Investment Analysis Report</p>
          <p class="date">Generated on ${new Date().toLocaleDateString('en-KE', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Investment Metric</th>
              ${savedCalculations.map(calc => `<th>${calc.name}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="metric-label">Net Operating Income (NOI)</td>
              ${savedCalculations.map(calc => `
                <td>
                  <div class="value ${calc.noi !== null ? (calc.noi >= 0 ? 'positive' : 'negative') : ''}">
                    ${calc.noi !== null ? formatCurrency(calc.noi) : '—'}
                  </div>
                </td>
              `).join('')}
            </tr>
            <tr>
              <td class="metric-label">Capitalization Rate</td>
              ${savedCalculations.map(calc => `
                <td>
                  <div class="value">${calc.capRate !== null ? calc.capRate.toFixed(2) + '%' : '—'}</div>
                  <div class="category">${getCategoryLabel('capRate', calc.capRate)}</div>
                </td>
              `).join('')}
            </tr>
            <tr>
              <td class="metric-label">Cash-on-Cash Return</td>
              ${savedCalculations.map(calc => `
                <td>
                  <div class="value ${calc.cashOnCash !== null ? (calc.cashOnCash >= 0 ? '' : 'negative') : ''}">
                    ${calc.cashOnCash !== null ? calc.cashOnCash.toFixed(2) + '%' : '—'}
                  </div>
                  <div class="category">${getCategoryLabel('cashOnCash', calc.cashOnCash)}</div>
                </td>
              `).join('')}
            </tr>
            <tr>
              <td class="metric-label">Gross Rent Multiplier</td>
              ${savedCalculations.map(calc => `
                <td>
                  <div class="value">${calc.grm !== null ? calc.grm.toFixed(2) + 'x' : '—'}</div>
                  <div class="category">${getCategoryLabel('grm', calc.grm)}</div>
                </td>
              `).join('')}
            </tr>
          </tbody>
        </table>

        <div class="footer">
          <p>This report was generated by KeynestHub Investment Analysis Tools</p>
          <p>Visit keynesthub.com for more property investment resources</p>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 1000);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    toast.success("Opening PDF export...");
  }, [savedCalculations, formatCurrency, getCapRateCategory, getCashOnCashCategory, getGRMCategory]);

  // Delete a saved calculation
  const deleteCalculation = (id: string) => {
    const calc = savedCalculations.find(c => c.id === id);
    setSavedCalculations((prev) => prev.filter((c) => c.id !== id));
    if (calc) {
      toast.success(`"${calc.name}" deleted`);
    }
  };

  // Clear all inputs
  const clearInputs = () => {
    setGrossRentalIncome("");
    setOperatingExpenses("");
    setNoiForCapRate("");
    setPropertyValue("");
    setAnnualCashFlow("");
    setTotalCashInvested("");
    setGrmPropertyPrice("");
    setGrossAnnualRent("");
    setPropertyName("");
  };

  // Load a saved calculation into inputs
  const loadCalculation = (calc: SavedCalculation) => {
    setGrossRentalIncome(calc.inputs.grossRentalIncome);
    setOperatingExpenses(calc.inputs.operatingExpenses);
    setNoiForCapRate(calc.inputs.noiForCapRate);
    setPropertyValue(calc.inputs.propertyValue);
    setAnnualCashFlow(calc.inputs.annualCashFlow);
    setTotalCashInvested(calc.inputs.totalCashInvested);
    setGrmPropertyPrice(calc.inputs.grmPropertyPrice);
    setGrossAnnualRent(calc.inputs.grossAnnualRent);
  };

  // Check if any calculation has values
  const hasCalculations = calculatedNOI !== null || calculatedCapRate !== null || calculatedCashOnCash !== null || calculatedGRM !== null;

  // AI-powered market stats
  interface MarketStats {
    marketActivity: { value: string; subtitle: string; trend: string };
    averageSaleTime: { value: string; subtitle: string; trend: string };
    pricePerSqFt: { value: string; subtitle: string; trend: string };
    propertiesListed: { value: string; subtitle: string };
    regionalTrends: Array<{
      location: string;
      priceChange: string;
      averagePrice: string;
      trend: string;
      period: string;
    }>;
  }

  const [marketStats, setMarketStats] = useState<MarketStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [lastStatsUpdate, setLastStatsUpdate] = useState<Date | null>(null);

  const fetchMarketStats = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      const { data, error } = await supabase.functions.invoke('market-ai-insights', {
        body: { action: 'market_stats' }
      });

      if (error) {
        console.error('Market stats error:', error);
        toast.error('Failed to fetch market data. Showing defaults.');
        return;
      }

      if (data?.stats) {
        setMarketStats(data.stats);
        setLastStatsUpdate(new Date());
      }
    } catch (err) {
      console.error('Market stats fetch error:', err);
      toast.error('Failed to load AI market data.');
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    fetchMarketStats();
  }, [fetchMarketStats]);

  // Fallback data while loading or on error
  const trends = marketStats?.regionalTrends || [
    { location: "Nairobi CBD", priceChange: "+12.5%", averagePrice: "KSh 8,500,000", trend: "up", period: "Last 12 months" },
    { location: "Westlands", priceChange: "+8.2%", averagePrice: "KSh 15,200,000", trend: "up", period: "Last 12 months" },
    { location: "Karen", priceChange: "-2.1%", averagePrice: "KSh 22,800,000", trend: "down", period: "Last 12 months" },
    { location: "Kilimani", priceChange: "+6.7%", averagePrice: "KSh 12,400,000", trend: "up", period: "Last 12 months" }
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
            <p className="text-lg text-muted-foreground mb-6">
              Stay informed with the latest property market data, price movements, and investment opportunities
            </p>
            <MarketAIInsights context="property_trends" className="max-w-2xl mx-auto" />
            {lastStatsUpdate && (
              <div className="flex items-center justify-center gap-2 mt-3">
                <p className="text-xs text-muted-foreground">
                  AI data updated: {lastStatsUpdate.toLocaleTimeString()}
                </p>
                <Button variant="ghost" size="sm" onClick={fetchMarketStats} disabled={isLoadingStats} className="h-6 w-6 p-0">
                  <RefreshCw className={`w-3 h-3 ${isLoadingStats ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            )}
          </div>

          {/* Market Overview */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
            {[
              {
                label: "Market Activity",
                value: marketStats?.marketActivity.value || "+18%",
                subtitle: marketStats?.marketActivity.subtitle || "vs last quarter",
                subtitleColor: marketStats?.marketActivity.trend === "down" ? "text-red-600" : "text-green-600",
                icon: TrendingUp,
              },
              {
                label: "Average Sale Time",
                value: marketStats?.averageSaleTime.value || "45 days",
                subtitle: marketStats?.averageSaleTime.subtitle || "-8 days from last year",
                subtitleColor: "text-green-600",
                icon: Calendar,
              },
              {
                label: "Price per Sq Ft",
                value: marketStats?.pricePerSqFt.value || "KSh 8,500",
                subtitle: marketStats?.pricePerSqFt.subtitle || "+12% YoY",
                subtitleColor: marketStats?.pricePerSqFt.trend === "down" ? "text-red-600" : "text-green-600",
                icon: DollarSign,
              },
              {
                label: "Properties Listed",
                value: marketStats?.propertiesListed.value || "2,847",
                subtitle: marketStats?.propertiesListed.subtitle || "Active listings",
                subtitleColor: "text-blue-600",
                icon: Home,
              },
            ].map((stat, index) => (
              <Card key={index} className="border-border">
                <CardContent className="pt-6">
                  {isLoadingStats ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                        <p className={`text-xs ${stat.subtitleColor}`}>{stat.subtitle}</p>
                      </div>
                      <stat.icon className="w-8 h-8 text-primary" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
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

          {/* Interactive Calculators */}
          <div className="mt-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold text-foreground">Investment Calculators</h2>
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  placeholder="Property name (optional)"
                  value={propertyName}
                  onChange={(e) => setPropertyName(e.target.value)}
                  className="w-48 bg-background"
                />
                <Button
                  onClick={saveCalculation}
                  disabled={!hasCalculations}
                  variant="outline"
                  size="sm"
                  className="gap-1"
                >
                  <Save className="w-4 h-4" />
                  Save
                </Button>
                <Button
                  onClick={() => setShowComparison(!showComparison)}
                  variant={showComparison ? "default" : "outline"}
                  size="sm"
                  className="gap-1"
                  disabled={savedCalculations.length === 0}
                >
                  <GitCompare className="w-4 h-4" />
                  Compare ({savedCalculations.length})
                </Button>
                <Button
                  onClick={exportToPDF}
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  disabled={savedCalculations.length === 0}
                >
                  <FileDown className="w-4 h-4" />
                  PDF
                </Button>
                <Button
                  onClick={clearInputs}
                  variant="ghost"
                  size="sm"
                  className="gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear
                </Button>
              </div>
            </div>

            {/* Comparison Panel */}
            {showComparison && savedCalculations.length > 0 && (
              <Card className="border-border mb-6">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <GitCompare className="w-5 h-5 text-primary" />
                      Property Comparison
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setShowComparison(false)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-2 text-muted-foreground font-medium">Metric</th>
                          {savedCalculations.map((calc) => (
                            <th key={calc.id} className="text-center py-3 px-2 min-w-[140px]">
                              <div className="flex flex-col items-center gap-1">
                                <span className="font-semibold text-foreground">{calc.name}</span>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs"
                                    onClick={() => loadCalculation(calc)}
                                  >
                                    Load
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs text-destructive hover:text-destructive"
                                    onClick={() => deleteCalculation(calc.id)}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-border/50">
                          <td className="py-3 px-2 text-muted-foreground">Net Operating Income</td>
                          {savedCalculations.map((calc) => (
                            <td key={calc.id} className="text-center py-3 px-2">
                              <span className={calc.noi !== null ? (calc.noi >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium") : "text-muted-foreground"}>
                                {calc.noi !== null ? formatCurrency(calc.noi) : "—"}
                              </span>
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-3 px-2 text-muted-foreground">Cap Rate</td>
                          {savedCalculations.map((calc) => (
                            <td key={calc.id} className="text-center py-3 px-2">
                              {calc.capRate !== null ? (
                                <div className="flex flex-col items-center">
                                  <span className="font-medium text-foreground">{calc.capRate.toFixed(2)}%</span>
                                  <span className={`text-xs ${getCapRateCategory(calc.capRate).color}`}>
                                    {getCapRateCategory(calc.capRate).label.split(",")[0]}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b border-border/50">
                          <td className="py-3 px-2 text-muted-foreground">Cash-on-Cash Return</td>
                          {savedCalculations.map((calc) => (
                            <td key={calc.id} className="text-center py-3 px-2">
                              {calc.cashOnCash !== null ? (
                                <div className="flex flex-col items-center">
                                  <span className={`font-medium ${calc.cashOnCash >= 0 ? "text-foreground" : "text-red-600"}`}>
                                    {calc.cashOnCash.toFixed(2)}%
                                  </span>
                                  <span className={`text-xs ${getCashOnCashCategory(calc.cashOnCash).color}`}>
                                    {getCashOnCashCategory(calc.cashOnCash).label}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="py-3 px-2 text-muted-foreground">Gross Rent Multiplier</td>
                          {savedCalculations.map((calc) => (
                            <td key={calc.id} className="text-center py-3 px-2">
                              {calc.grm !== null ? (
                                <div className="flex flex-col items-center">
                                  <span className="font-medium text-foreground">{calc.grm.toFixed(2)}x</span>
                                  <span className={`text-xs ${getGRMCategory(calc.grm).color}`}>
                                    {getGRMCategory(calc.grm).label.split(" - ")[0]}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  {savedCalculations.length === 0 && (
                    <p className="text-center text-muted-foreground py-6">
                      No saved calculations yet. Fill in the calculators and click "Save" to compare properties.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {/* NOI Calculator */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-primary" />
                    NOI Calculator
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Calculate your property's Net Operating Income
                  </p>
                  
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="font-mono text-xs text-foreground">
                      NOI = Gross Rental Income - Operating Expenses
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="grossIncome">Annual Gross Rental Income (KSh)</Label>
                      <Input
                        id="grossIncome"
                        type="number"
                        placeholder="e.g., 1200000"
                        value={grossRentalIncome}
                        onChange={(e) => setGrossRentalIncome(e.target.value)}
                        className="bg-background"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="expenses">Annual Operating Expenses (KSh)</Label>
                      <Input
                        id="expenses"
                        type="number"
                        placeholder="e.g., 360000"
                        value={operatingExpenses}
                        onChange={(e) => setOperatingExpenses(e.target.value)}
                        className="bg-background"
                      />
                    </div>
                  </div>

                  {calculatedNOI !== null && (
                    <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                      <p className="text-sm text-muted-foreground mb-1">Net Operating Income:</p>
                      <p className={`text-2xl font-bold ${calculatedNOI >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(calculatedNOI)}
                      </p>
                      {calculatedNOI < 0 && (
                        <p className="text-xs text-red-500 mt-1">Warning: Negative NOI indicates a loss</p>
                      )}
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground space-y-1 border-t border-border pt-3">
                    <p className="font-medium">Operating expenses include:</p>
                    <p>Management fees, insurance, property taxes, maintenance, utilities</p>
                  </div>
                </CardContent>
              </Card>

              {/* Cap Rate Calculator */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Percent className="w-5 h-5 text-primary" />
                    Cap Rate Calculator
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Calculate your property's Capitalization Rate
                  </p>
                  
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="font-mono text-xs text-foreground">
                      Cap Rate = (NOI ÷ Property Value) × 100
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="noi">Annual Net Operating Income (KSh)</Label>
                      <Input
                        id="noi"
                        type="number"
                        placeholder="e.g., 840000"
                        value={noiForCapRate}
                        onChange={(e) => setNoiForCapRate(e.target.value)}
                        className="bg-background"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="propertyValue">Property Value / Purchase Price (KSh)</Label>
                      <Input
                        id="propertyValue"
                        type="number"
                        placeholder="e.g., 12000000"
                        value={propertyValue}
                        onChange={(e) => setPropertyValue(e.target.value)}
                        className="bg-background"
                      />
                    </div>
                  </div>

                  {calculatedCapRate !== null && (
                    <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                      <p className="text-sm text-muted-foreground mb-1">Capitalization Rate:</p>
                      <p className="text-2xl font-bold text-primary">
                        {calculatedCapRate.toFixed(2)}%
                      </p>
                      <p className={`text-sm mt-1 ${getCapRateCategory(calculatedCapRate).color}`}>
                        {getCapRateCategory(calculatedCapRate).label}
                      </p>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground space-y-1 border-t border-border pt-3">
                    <p className="font-medium">Cap Rate ranges:</p>
                    <p>4-6%: Prime • 6-8%: Moderate • 8-10%+: Higher risk</p>
                  </div>
                </CardContent>
              </Card>

              {/* Cash-on-Cash Return Calculator */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Banknote className="w-5 h-5 text-primary" />
                    Cash-on-Cash Return
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Measure actual cash return on your investment
                  </p>
                  
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="font-mono text-xs text-foreground">
                      CoC = (Annual Cash Flow ÷ Cash Invested) × 100
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="annualCashFlow">Annual Pre-Tax Cash Flow (KSh)</Label>
                      <Input
                        id="annualCashFlow"
                        type="number"
                        placeholder="e.g., 480000"
                        value={annualCashFlow}
                        onChange={(e) => setAnnualCashFlow(e.target.value)}
                        className="bg-background"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="totalCashInvested">Total Cash Invested (KSh)</Label>
                      <Input
                        id="totalCashInvested"
                        type="number"
                        placeholder="e.g., 4000000"
                        value={totalCashInvested}
                        onChange={(e) => setTotalCashInvested(e.target.value)}
                        className="bg-background"
                      />
                    </div>
                  </div>

                  {calculatedCashOnCash !== null && (
                    <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                      <p className="text-sm text-muted-foreground mb-1">Cash-on-Cash Return:</p>
                      <p className={`text-2xl font-bold ${calculatedCashOnCash >= 0 ? 'text-primary' : 'text-red-600'}`}>
                        {calculatedCashOnCash.toFixed(2)}%
                      </p>
                      <p className={`text-sm mt-1 ${getCashOnCashCategory(calculatedCashOnCash).color}`}>
                        {getCashOnCashCategory(calculatedCashOnCash).label}
                      </p>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground space-y-1 border-t border-border pt-3">
                    <p className="font-medium">Cash invested includes:</p>
                    <p>Down payment, closing costs, renovation costs</p>
                  </div>
                </CardContent>
              </Card>

              {/* GRM Calculator */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-primary" />
                    Gross Rent Multiplier
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Quick valuation metric for rental properties
                  </p>
                  
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="font-mono text-xs text-foreground">
                      GRM = Property Price ÷ Gross Annual Rent
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="grmPropertyPrice">Property Price (KSh)</Label>
                      <Input
                        id="grmPropertyPrice"
                        type="number"
                        placeholder="e.g., 12000000"
                        value={grmPropertyPrice}
                        onChange={(e) => setGrmPropertyPrice(e.target.value)}
                        className="bg-background"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="grossAnnualRent">Gross Annual Rent (KSh)</Label>
                      <Input
                        id="grossAnnualRent"
                        type="number"
                        placeholder="e.g., 1200000"
                        value={grossAnnualRent}
                        onChange={(e) => setGrossAnnualRent(e.target.value)}
                        className="bg-background"
                      />
                    </div>
                  </div>

                  {calculatedGRM !== null && (
                    <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                      <p className="text-sm text-muted-foreground mb-1">Gross Rent Multiplier:</p>
                      <p className="text-2xl font-bold text-primary">
                        {calculatedGRM.toFixed(2)}x
                      </p>
                      <p className={`text-sm mt-1 ${getGRMCategory(calculatedGRM).color}`}>
                        {getGRMCategory(calculatedGRM).label}
                      </p>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground space-y-1 border-t border-border pt-3">
                    <p className="font-medium">GRM ranges:</p>
                    <p>4-8: Strong • 8-12: Average • 12+: Below average</p>
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