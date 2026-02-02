import { useState } from 'react';
import { usePropertyAI, PriceAnalysis, PropertyForAI } from '@/hooks/usePropertyAI';
import { PriceFairnessBadge } from './PriceFairnessBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const [isHovered, setIsHovered] = useState(false);
  const { isLoading, getPriceAnalysis } = usePropertyAI();

  const fetchAnalysis = async () => {
    if (hasAttempted) return;
    
    // Check cache first
    const cached = priceAnalysisCache.get(property.id);
    if (cached) {
      setPriceAnalysis(cached);
      setHasAttempted(true);
      return;
    }

    setHasAttempted(true);
    const result = await getPriceAnalysis(property);
    if (result) {
      setPriceAnalysis(result);
      priceAnalysisCache.set(property.id, result);
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (showOnHover && !hasAttempted) {
      fetchAnalysis();
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasAttempted) {
      fetchAnalysis();
    }
  };

  // If we have analysis, show the badge
  if (priceAnalysis) {
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

  // If loading, show skeleton
  if (isLoading && hasAttempted) {
    return <Skeleton className="h-5 w-20" />;
  }

  // Show a button to trigger analysis on demand
  return (
    <div 
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Button
        variant="ghost"
        size="sm"
        className="h-5 px-2 py-0 text-xs gap-1 text-muted-foreground hover:text-primary"
        onClick={handleClick}
      >
        <Sparkles className="w-3 h-3" />
        {isHovered || showOnHover ? 'Get AI Price' : 'AI'}
      </Button>
    </div>
  );
}
