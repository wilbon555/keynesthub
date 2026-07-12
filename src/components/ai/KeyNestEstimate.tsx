import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, TrendingDown, Minus, Info, Calculator } from "lucide-react";
import { Link } from "react-router-dom";
import { usePropertyAI, PriceAnalysis, PropertyForAI } from "@/hooks/usePropertyAI";

interface KeyNestEstimateProps {
  property: PropertyForAI;
  autoLoad?: boolean;
}

// Simple in-memory cache so revisiting the page doesn't re-hit the model.
const estimateCache = new Map<string, PriceAnalysis>();

const parseKsh = (str?: string): number | null => {
  if (!str) return null;
  const cleaned = str.replace(/,/g, "").toLowerCase();
  const num = parseFloat(cleaned.replace(/[^\d.]/g, ""));
  if (isNaN(num)) return null;
  if (cleaned.includes("m")) return num * 1_000_000;
  if (cleaned.includes("k")) return num * 1_000;
  return num;
};

const formatKsh = (n: number): string => {
  if (n >= 1_000_000) return `Ksh ${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `Ksh ${(n / 1_000).toFixed(0)}K`;
  return `Ksh ${Math.round(n).toLocaleString()}`;
};

export function KeyNestEstimate({ property, autoLoad = false }: KeyNestEstimateProps) {
  const [analysis, setAnalysis] = useState<PriceAnalysis | null>(
    estimateCache.get(property.id) ?? null
  );
  const [attempted, setAttempted] = useState<boolean>(estimateCache.has(property.id));
  const { isLoading, getPriceAnalysis } = usePropertyAI();

  const fetchEstimate = async () => {
    if (attempted && analysis) return;
    setAttempted(true);
    const result = await getPriceAnalysis(property);
    if (result) {
      estimateCache.set(property.id, result);
      setAnalysis(result);
    }
  };

  useEffect(() => {
    if (autoLoad && !estimateCache.has(property.id)) {
      fetchEstimate();
    }
     
  }, [autoLoad, property.id]);

  const listed = parseKsh(property.price);
  const estimated = parseKsh(analysis?.estimatedMarketValue);
  const lowRange = estimated ? estimated * 0.93 : null;
  const highRange = estimated ? estimated * 1.07 : null;

  const ratingConfig = {
    undervalued: {
      label: "Below estimate",
      icon: TrendingDown,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/30",
    },
    fair: {
      label: "Near estimate",
      icon: Minus,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/30",
    },
    overpriced: {
      label: "Above estimate",
      icon: TrendingUp,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/30",
    },
  } as const;

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="w-5 h-5 text-primary" />
          KeyNest Estimate
          <Badge variant="outline" className="ml-auto text-xs">AI</Badge>
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Our AI-powered valuation based on location, size, type and market conditions.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {!analysis && !isLoading && (
          <div className="text-center py-4">
            <Button onClick={fetchEstimate} size="sm" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Get KeyNest Estimate
            </Button>
          </div>
        )}

        {isLoading && !analysis && (
          <div className="space-y-3">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-16 w-full" />
          </div>
        )}

        {analysis && (
          <>
            <div>
              <p className="text-xs text-muted-foreground">Estimated market value</p>
              <p className="text-2xl md:text-3xl font-bold text-primary">
                {analysis.estimatedMarketValue}
              </p>
              {lowRange && highRange && (
                <p className="text-xs text-muted-foreground mt-1">
                  Range: {formatKsh(lowRange)} – {formatKsh(highRange)}
                </p>
              )}
            </div>

            {analysis.fairnessRating && (
              <div
                className={`flex items-center gap-2 p-3 rounded-lg border ${ratingConfig[analysis.fairnessRating].bg}`}
              >
                {(() => {
                  const Icon = ratingConfig[analysis.fairnessRating].icon;
                  return <Icon className={`w-4 h-4 ${ratingConfig[analysis.fairnessRating].color}`} />;
                })()}
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${ratingConfig[analysis.fairnessRating].color}`}>
                    Listed {ratingConfig[analysis.fairnessRating].label}
                  </p>
                  {analysis.priceDifference && (
                    <p className="text-xs text-muted-foreground">
                      Listed price is {analysis.priceDifference} vs estimate
                    </p>
                  )}
                </div>
                {analysis.confidence && (
                  <Badge variant="outline" className="text-xs capitalize">
                    {analysis.confidence} confidence
                  </Badge>
                )}
              </div>
            )}

            {analysis.reasoning && (
              <div className="flex gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{analysis.reasoning}</p>
              </div>
            )}

            {analysis.comparables && analysis.comparables.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-foreground mb-2">Comparable properties</p>
                <div className="space-y-1.5">
                  {analysis.comparables.slice(0, 3).map((c, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <span className="text-muted-foreground flex-1">{c.description}</span>
                      <span className="font-medium text-foreground shrink-0">{c.priceRange}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button asChild variant="outline" size="sm" className="w-full gap-2">
              <Link to="/mortgage-calculator">
                <Calculator className="w-4 h-4" />
                Check affordability
              </Link>
            </Button>

            <p className="text-[10px] text-muted-foreground italic leading-relaxed">
              Estimate is AI-generated and not a formal appraisal. Actual value depends on inspection,
              title verification and market conditions.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}