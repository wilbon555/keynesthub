import { useState, useEffect } from 'react';
import { usePropertyAI, PriceAnalysis, PropertyForAI } from '@/hooks/usePropertyAI';
import { PriceFairnessBadge } from './PriceFairnessBadge';
import { Skeleton } from '@/components/ui/skeleton';

interface QuickAIBadgesProps {
  property: PropertyForAI;
  showOnHover?: boolean;
  className?: string;
}

// Cache for price analysis results
const priceAnalysisCache = new Map<string, PriceAnalysis>();

export function QuickAIBadges({ property, showOnHover = false, className }: QuickAIBadgesProps) {
  const [priceAnalysis, setPriceAnalysis] = useState<PriceAnalysis | null>(null);
  const [hasAttempted, setHasAttempted] = useState(false);
  const { isLoading, getPriceAnalysis } = usePropertyAI();

  useEffect(() => {
    // Check cache first
    const cached = priceAnalysisCache.get(property.id);
    if (cached) {
      setPriceAnalysis(cached);
      setHasAttempted(true);
      return;
    }

    // Auto-fetch price analysis
    const fetchAnalysis = async () => {
      const result = await getPriceAnalysis(property);
      if (result) {
        setPriceAnalysis(result);
        priceAnalysisCache.set(property.id, result);
      }
      setHasAttempted(true);
    };

    // Small delay to prevent overwhelming the API on page load
    const timeoutId = setTimeout(fetchAnalysis, Math.random() * 2000 + 500);
    
    return () => clearTimeout(timeoutId);
  }, [property.id]);

  if (isLoading && !hasAttempted) {
    return <Skeleton className="h-5 w-20" />;
  }

  if (!priceAnalysis) {
    return null;
  }

  return (
    <div className={className}>
      <PriceFairnessBadge 
        rating={priceAnalysis.fairnessRating}
        score={priceAnalysis.fairnessScore}
        size="sm"
      />
    </div>
  );
}
