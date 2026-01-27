import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, 
  DollarSign, 
  Clock, 
  TrendingUp,
  TrendingDown,
  ChevronRight,
  RefreshCw,
  Target,
  Lightbulb,
  AlertTriangle
} from 'lucide-react';
import { usePropertyAI, SellerAdvice, PropertyForAI } from '@/hooks/usePropertyAI';
import { cn } from '@/lib/utils';

interface SellerAIInsightsProps {
  property: PropertyForAI;
  className?: string;
}

export function SellerAIInsights({ property, className }: SellerAIInsightsProps) {
  const [advice, setAdvice] = useState<SellerAdvice | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const { isLoading, getSellerAdvice } = usePropertyAI();

  const loadAdvice = async () => {
    const result = await getSellerAdvice(property);
    if (result) {
      setAdvice(result);
      setHasLoaded(true);
    }
  };

  if (!hasLoaded && !isLoading) {
    return (
      <Card className={cn("border-dashed border-2 border-primary/20", className)}>
        <CardContent className="flex flex-col items-center justify-center py-6 text-center">
          <Sparkles className="w-8 h-8 text-primary mb-2" />
          <h4 className="font-medium text-sm mb-1">AI Seller Insights</h4>
          <p className="text-xs text-muted-foreground mb-3">
            Get pricing suggestions and timing recommendations
          </p>
          <Button size="sm" onClick={loadAdvice} disabled={isLoading}>
            <Sparkles className="w-3 h-3 mr-1" />
            Get AI Advice
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            Analyzing...
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-8 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  if (!advice) {
    return (
      <Card className={cn("border-destructive/30", className)}>
        <CardContent className="flex items-center justify-center py-4 text-center">
          <AlertTriangle className="w-4 h-4 text-destructive mr-2" />
          <span className="text-sm text-muted-foreground">Analysis unavailable</span>
          <Button variant="ghost" size="sm" className="ml-2" onClick={loadAdvice}>
            <RefreshCw className="w-3 h-3" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            AI Seller Insights
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={loadAdvice}>
            <RefreshCw className={cn("w-3 h-3", isLoading && "animate-spin")} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Suggested Price */}
        <div className="bg-primary/5 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Suggested Price</span>
          </div>
          <div className="text-lg font-bold text-primary">{advice.suggestedPrice}</div>
          {advice.priceRange && (
            <div className="text-xs text-muted-foreground mt-1">
              Range: {advice.priceRange.low} - {advice.priceRange.high}
            </div>
          )}
        </div>

        {/* Strategy & Timing */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Strategy</span>
            <Badge variant="secondary" className="capitalize text-xs">
              {advice.pricingStrategy}
            </Badge>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Timing Score</span>
            <div className="flex items-center gap-1">
              <Progress value={advice.currentTimingScore} className="h-1.5 flex-1" />
              <span className="text-xs font-medium">{advice.currentTimingScore}%</span>
            </div>
          </div>
        </div>

        {/* Best Time to List */}
        <div className="flex items-start gap-2 text-sm bg-muted/50 rounded p-2">
          <Clock className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <span className="font-medium">Best time: </span>
            <span className="text-muted-foreground">{advice.bestTimeToList}</span>
          </div>
        </div>

        {/* Top Improvement Suggestion */}
        {advice.improvementSuggestions && advice.improvementSuggestions.length > 0 && (
          <div className="flex items-start gap-2 text-sm">
            <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span className="text-muted-foreground">{advice.improvementSuggestions[0]}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
