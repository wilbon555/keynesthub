import { useState, useCallback, useRef } from 'react';
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

// Global request queue to prevent concurrent requests
let requestQueue: Array<() => Promise<void>> = [];
let isProcessing = false;
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000; // Minimum 2 seconds between requests

async function processQueue() {
  if (isProcessing || requestQueue.length === 0) return;
  
  isProcessing = true;
  
  while (requestQueue.length > 0) {
    const request = requestQueue.shift();
    if (request) {
      // Ensure minimum interval between requests
      const now = Date.now();
      const timeSinceLastRequest = now - lastRequestTime;
      if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
        await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
      }
      
      lastRequestTime = Date.now();
      await request();
    }
  }
  
  isProcessing = false;
}

function enqueueRequest<T>(fn: () => Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    requestQueue.push(async () => {
      try {
        const result = await fn();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
    processQueue();
  });
}

async function fetchWithRetry<T>(
  fn: () => Promise<{ data: T | null; error: Error | null }>,
  maxRetries = 3
): Promise<T | null> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const { data, error } = await fn();
    
    if (!error && data) {
      return data;
    }
    
    lastError = error;
    
    // Check if it's a rate limit error
    const errorMessage = error?.message || '';
    if (errorMessage.includes('429') || errorMessage.includes('Rate limit')) {
      // Exponential backoff: 2s, 4s, 8s
      const delay = Math.pow(2, attempt + 1) * 1000;
      console.log(`Rate limited, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
      continue;
    }
    
    // For non-rate-limit errors, don't retry
    break;
  }
  
  throw lastError || new Error('Request failed');
}

export function usePropertyAI() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toastShownRef = useRef(false);

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
      const result = await enqueueRequest(async () => {
        return fetchWithRetry<T>(async () => {
          const { data, error: fnError } = await supabase.functions.invoke('property-ai-insights', {
            body: {
              action,
              property,
              userPreferences,
            },
          });

          if (fnError) {
            return { data: null, error: fnError };
          }

          if (data?.error) {
            return { data: null, error: new Error(data.error) };
          }

          return { data: data as T, error: null };
        });
      });

      toastShownRef.current = false;
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to analyze property';
      setError(message);
      
      // Only show toast once per session to avoid spam
      if (!toastShownRef.current) {
        if (message.includes('Rate limit') || message.includes('429')) {
          toast.error('AI service is busy. Please wait a moment and try again.');
        } else if (message.includes('402') || message.includes('credits')) {
          toast.error('AI service temporarily unavailable.');
        } else {
          toast.error('Failed to get AI insights. Please try again.');
        }
        toastShownRef.current = true;
      }
      
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
