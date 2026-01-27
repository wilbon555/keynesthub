import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  Clock, 
  Target,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  RefreshCw,
  ChevronRight
} from 'lucide-react';
import { usePropertyAI, ComprehensiveAnalysis, PropertyForAI } from '@/hooks/usePropertyAI';
import { PriceFairnessBadge } from './PriceFairnessBadge';
import { InvestmentScoreBadge } from './InvestmentScoreBadge';
import { MarketDemandBadge } from './MarketDemandBadge';
import { cn } from '@/lib/utils';

interface AIInsightsPanelProps {
  property: PropertyForAI;
  isOwner?: boolean;
  className?: string;
}

export function AIInsightsPanel({ property, isOwner = false, className }: AIInsightsPanelProps) {
  const [analysis, setAnalysis] = useState<ComprehensiveAnalysis | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const { isLoading, getComprehensiveAnalysis } = usePropertyAI();

  const loadAnalysis = async () => {
    const result = await getComprehensiveAnalysis(property);
    if (result) {
      setAnalysis(result);
      setHasLoaded(true);
    }
  };

  // Auto-load on mount
  useEffect(() => {
    if (!hasLoaded && !isLoading) {
      loadAnalysis();
    }
  }, [property.id]);

  if (!hasLoaded && !isLoading) {
    return (
      <Card className={cn("border-dashed border-2 border-primary/20", className)}>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Sparkles className="w-10 h-10 text-primary mb-3 animate-pulse" />
          <h3 className="font-semibold text-lg mb-2">AI Property Insights</h3>
          <p className="text-muted-foreground text-sm mb-4 max-w-sm">
            Get AI-powered analysis including price fairness, investment potential, and market predictions.
          </p>
          <Button onClick={loadAnalysis} disabled={isLoading}>
            <Sparkles className="w-4 h-4 mr-2" />
            Analyze Property
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            Analyzing Property...
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card className={cn("border-destructive/50", className)}>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <AlertTriangle className="w-10 h-10 text-destructive mb-3" />
          <h3 className="font-semibold text-lg mb-2">Analysis Unavailable</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Unable to analyze this property. Please try again later.
          </p>
          <Button variant="outline" onClick={loadAnalysis}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { priceAnalysis, investmentScore, marketPrediction, sellerAdvice, summary } = analysis;

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Insights
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={loadAnalysis} disabled={isLoading}>
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </Button>
        </div>
        {summary && (
          <p className="text-sm text-muted-foreground mt-2">{summary}</p>
        )}
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="price" className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-4">
            <TabsTrigger value="price" className="text-xs sm:text-sm">
              <DollarSign className="w-3.5 h-3.5 mr-1 hidden sm:inline" />
              Price
            </TabsTrigger>
            <TabsTrigger value="investment" className="text-xs sm:text-sm">
              <BarChart3 className="w-3.5 h-3.5 mr-1 hidden sm:inline" />
              Investment
            </TabsTrigger>
            <TabsTrigger value="market" className="text-xs sm:text-sm">
              <TrendingUp className="w-3.5 h-3.5 mr-1 hidden sm:inline" />
              Market
            </TabsTrigger>
            {isOwner && sellerAdvice && (
              <TabsTrigger value="seller" className="text-xs sm:text-sm">
                <Target className="w-3.5 h-3.5 mr-1 hidden sm:inline" />
                Seller
              </TabsTrigger>
            )}
          </TabsList>

          {/* Price Analysis Tab */}
          <TabsContent value="price" className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <PriceFairnessBadge 
                rating={priceAnalysis.fairnessRating} 
                score={priceAnalysis.fairnessScore}
                size="md"
              />
              {priceAnalysis.priceDifference && (
                <span className="text-sm font-medium">
                  {priceAnalysis.priceDifference} from market
                </span>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Fairness Score</span>
                <span className="font-medium">{priceAnalysis.fairnessScore}/100</span>
              </div>
              <Progress 
                value={priceAnalysis.fairnessScore} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                50 = Fair market value, &gt;50 = Undervalued, &lt;50 = Overpriced
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Estimated Market Value</span>
                <span className="font-semibold text-primary">{priceAnalysis.estimatedMarketValue}</span>
              </div>
              <p className="text-sm">{priceAnalysis.reasoning}</p>
            </div>

            {priceAnalysis.comparables && priceAnalysis.comparables.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  Similar Properties
                </h4>
                {priceAnalysis.comparables.map((comp, idx) => (
                  <div key={idx} className="text-sm flex justify-between items-center bg-muted/30 rounded p-2">
                    <span className="text-muted-foreground">{comp.description}</span>
                    <span className="font-medium">{comp.priceRange}</span>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Investment Tab */}
          <TabsContent value="investment" className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <InvestmentScoreBadge 
                score={investmentScore.overallScore} 
                grade={investmentScore.grade}
                size="md"
              />
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">{investmentScore.grade}</div>
                <div className="text-xs text-muted-foreground">Investment Grade</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-emerald-600">{investmentScore.estimatedROI}</div>
                <div className="text-xs text-muted-foreground">Est. ROI</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-blue-600">{investmentScore.rentalYield}</div>
                <div className="text-xs text-muted-foreground">Rental Yield</div>
              </div>
            </div>

            {investmentScore.estimatedMonthlyRent && (
              <div className="bg-primary/5 rounded-lg p-3 flex justify-between items-center">
                <span className="text-sm">Estimated Monthly Rent</span>
                <span className="font-semibold">{investmentScore.estimatedMonthlyRent}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Vacancy Risk</span>
                <Badge variant={investmentScore.vacancyRisk === 'low' ? 'default' : investmentScore.vacancyRisk === 'medium' ? 'secondary' : 'destructive'}>
                  {investmentScore.vacancyRisk.charAt(0).toUpperCase() + investmentScore.vacancyRisk.slice(1)}
                </Badge>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Appreciation</span>
                <Badge variant={investmentScore.appreciationPotential === 'high' ? 'default' : investmentScore.appreciationPotential === 'moderate' ? 'secondary' : 'outline'}>
                  {investmentScore.appreciationPotential.charAt(0).toUpperCase() + investmentScore.appreciationPotential.slice(1)}
                </Badge>
              </div>
            </div>

            {investmentScore.strengths && investmentScore.strengths.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-1 text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                  Strengths
                </h4>
                <ul className="space-y-1">
                  {investmentScore.strengths.map((s, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <ChevronRight className="w-3 h-3 mt-1 text-emerald-500" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {investmentScore.risks && investmentScore.risks.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-1 text-amber-600">
                  <AlertTriangle className="w-4 h-4" />
                  Risks
                </h4>
                <ul className="space-y-1">
                  {investmentScore.risks.map((r, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <ChevronRight className="w-3 h-3 mt-1 text-amber-500" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {investmentScore.recommendation && (
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm">{investmentScore.recommendation}</p>
              </div>
            )}
          </TabsContent>

          {/* Market Prediction Tab */}
          <TabsContent value="market" className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <MarketDemandBadge 
                demandLevel={marketPrediction.demandLevel}
                daysToOffer={marketPrediction.estimatedDaysToOffer}
                size="md"
              />
              <div className="text-right">
                <div className="text-sm font-medium">
                  {marketPrediction.priceMovementPrediction === 'increasing' && (
                    <span className="text-emerald-600 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" /> Prices Rising
                    </span>
                  )}
                  {marketPrediction.priceMovementPrediction === 'stable' && (
                    <span className="text-blue-600">Prices Stable</span>
                  )}
                  {marketPrediction.priceMovementPrediction === 'decreasing' && (
                    <span className="text-amber-600 flex items-center gap-1">
                      <TrendingDown className="w-4 h-4" /> Prices Declining
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">6-month outlook</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <Clock className="w-5 h-5 mx-auto mb-1 text-primary" />
                <div className="text-lg font-bold">{marketPrediction.estimatedDaysToOffer}</div>
                <div className="text-xs text-muted-foreground">Days to Offer</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <Target className="w-5 h-5 mx-auto mb-1 text-primary" />
                <div className="text-lg font-bold">{marketPrediction.offerLikelihood || 'N/A'}</div>
                <div className="text-xs text-muted-foreground">Offer in 30 Days</div>
              </div>
            </div>

            {marketPrediction.seasonalTrend && (
              <div className="bg-primary/5 rounded-lg p-3">
                <h4 className="text-sm font-medium mb-1">Seasonal Trend</h4>
                <p className="text-sm text-muted-foreground">{marketPrediction.seasonalTrend}</p>
              </div>
            )}

            {marketPrediction.urgencyAdvice && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                <h4 className="text-sm font-medium flex items-center gap-1 text-amber-700 dark:text-amber-400 mb-1">
                  <Lightbulb className="w-4 h-4" />
                  Timing Advice
                </h4>
                <p className="text-sm">{marketPrediction.urgencyAdvice}</p>
              </div>
            )}

            {marketPrediction.marketInsights && marketPrediction.marketInsights.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Market Insights</h4>
                <ul className="space-y-1">
                  {marketPrediction.marketInsights.map((insight, i) => (
                    <li key={i} className="text-sm flex items-start gap-2 bg-muted/30 rounded p-2">
                      <Sparkles className="w-3 h-3 mt-1 text-primary shrink-0" />
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </TabsContent>

          {/* Seller Tab */}
          {isOwner && sellerAdvice && (
            <TabsContent value="seller" className="mt-4 space-y-4">
              <div className="bg-primary/5 rounded-lg p-4">
                <div className="text-sm text-muted-foreground mb-1">Suggested Price</div>
                <div className="text-2xl font-bold text-primary">{sellerAdvice.suggestedPrice}</div>
                {sellerAdvice.priceRange && (
                  <div className="text-sm text-muted-foreground mt-1">
                    Range: {sellerAdvice.priceRange.low} - {sellerAdvice.priceRange.high}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Pricing Strategy</span>
                  <Badge variant="secondary" className="capitalize">
                    {sellerAdvice.pricingStrategy}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Timing Score</span>
                  <div className="flex items-center gap-2">
                    <Progress value={sellerAdvice.currentTimingScore} className="h-2 flex-1" />
                    <span className="text-sm font-medium">{sellerAdvice.currentTimingScore}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-3">
                <h4 className="text-sm font-medium flex items-center gap-1 mb-2">
                  <Clock className="w-4 h-4" />
                  Best Time to List
                </h4>
                <p className="text-sm">{sellerAdvice.bestTimeToList}</p>
              </div>

              {sellerAdvice.targetBuyerProfile && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <h4 className="text-sm font-medium flex items-center gap-1 mb-2">
                    <Target className="w-4 h-4" />
                    Target Buyer
                  </h4>
                  <p className="text-sm">{sellerAdvice.targetBuyerProfile}</p>
                </div>
              )}

              {sellerAdvice.improvementSuggestions && sellerAdvice.improvementSuggestions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-1">
                    <Lightbulb className="w-4 h-4" />
                    Improvement Suggestions
                  </h4>
                  <ul className="space-y-1">
                    {sellerAdvice.improvementSuggestions.map((s, i) => (
                      <li key={i} className="text-sm flex items-start gap-2 bg-muted/30 rounded p-2">
                        <ChevronRight className="w-3 h-3 mt-1 text-primary" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {sellerAdvice.sellerTips && sellerAdvice.sellerTips.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Seller Tips
                  </h4>
                  <ul className="space-y-1">
                    {sellerAdvice.sellerTips.map((tip, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <ChevronRight className="w-3 h-3 mt-1 text-emerald-500" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}
