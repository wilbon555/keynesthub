import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PriceAnalysis {
  fairnessRating: 'undervalued' | 'fair' | 'overpriced';
  fairnessScore: number;
  estimatedMarketValue: string;
  priceDifference?: string;
  confidence?: 'high' | 'medium' | 'low';
  reasoning: string;
  comparables?: Array<{ description: string; priceRange: string }>;
}

export interface InvestmentScore {
  overallScore: number;
  grade: string;
  estimatedROI: string;
  rentalYield: string;
  estimatedMonthlyRent?: string;
  vacancyRisk: 'low' | 'medium' | 'high';
  appreciationPotential: 'high' | 'moderate' | 'low' | 'declining';
  strengths?: string[];
  risks?: string[];
  recommendation?: string;
}

export interface MarketPrediction {
  demandLevel: 'very_high' | 'high' | 'moderate' | 'low' | 'very_low';
  estimatedDaysToOffer: number;
  offerLikelihood?: string;
  buyerCompetition?: 'high' | 'moderate' | 'low';
  seasonalTrend?: string;
  priceMovementPrediction: 'increasing' | 'stable' | 'decreasing';
  urgencyAdvice?: string;
  marketInsights?: string[];
}

export interface SellerAdvice {
  suggestedPrice: string;
  priceRange?: { low: string; high: string };
  pricingStrategy: 'aggressive' | 'competitive' | 'premium';
  bestTimeToList: string;
  currentTimingScore: number;
  improvementSuggestions?: string[];
  targetBuyerProfile?: string;
  sellerTips?: string[];
}

export interface ComprehensiveAnalysis {
  priceAnalysis: PriceAnalysis;
  investmentScore: InvestmentScore;
  marketPrediction: MarketPrediction;
  sellerAdvice?: SellerAdvice;
  summary: string;
}

export interface PropertyForAI {
  id: string;
  title: string;
  price: string;
  location: string;
  type: string;
  bedrooms?: number;
  bathrooms?: number;
  area: string;
  listing_type: string;
  description?: string;
}

type AIAction = 'price_analysis' | 'investment_score' | 'market_prediction' | 'seller_advice' | 'comprehensive';

export function usePropertyAI() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeProperty = useCallback(async <T>(
    action: AIAction,
    property: PropertyForAI,
    userPreferences?: {
      budget?: number;
      investmentGoals?: string;
      timeline?: string;
    }
  ): Promise<T | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('property-ai-insights', {
        body: {
          action,
          property,
          userPreferences,
        },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data.error) {
        if (data.error.includes('Rate limit')) {
          toast.error('AI service is busy. Please try again in a moment.');
        } else if (data.error.includes('credits')) {
          toast.error('AI service temporarily unavailable.');
        } else {
          toast.error('Failed to get AI insights. Please try again.');
        }
        throw new Error(data.error);
      }

      return data as T;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to analyze property';
      setError(message);
      console.error('Property AI error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getPriceAnalysis = useCallback(
    (property: PropertyForAI) => analyzeProperty<PriceAnalysis>('price_analysis', property),
    [analyzeProperty]
  );

  const getInvestmentScore = useCallback(
    (property: PropertyForAI, investmentGoals?: string) => 
      analyzeProperty<InvestmentScore>('investment_score', property, { investmentGoals }),
    [analyzeProperty]
  );

  const getMarketPrediction = useCallback(
    (property: PropertyForAI) => analyzeProperty<MarketPrediction>('market_prediction', property),
    [analyzeProperty]
  );

  const getSellerAdvice = useCallback(
    (property: PropertyForAI) => analyzeProperty<SellerAdvice>('seller_advice', property),
    [analyzeProperty]
  );

  const getComprehensiveAnalysis = useCallback(
    (property: PropertyForAI) => analyzeProperty<ComprehensiveAnalysis>('comprehensive', property),
    [analyzeProperty]
  );

  return {
    isLoading,
    error,
    getPriceAnalysis,
    getInvestmentScore,
    getMarketPrediction,
    getSellerAdvice,
    getComprehensiveAnalysis,
  };
}
