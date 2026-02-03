import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SearchFilters {
  propertyType?: string;
  listingType?: 'sale' | 'rent';
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  bedrooms?: number;
  bathrooms?: number;
  minArea?: number;
  maxArea?: number;
  features?: string[];
  investmentCriteria?: string;
}

export interface SmartSearchResult {
  filters: SearchFilters;
  reasoning: string;
  suggestions?: string[];
  matchedProperties?: any[];
  totalMatches?: number;
}

export function useSmartSearch() {
  const [isSearching, setIsSearching] = useState(false);
  const [lastResult, setLastResult] = useState<SmartSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (
    query: string,
    properties?: any[]
  ): Promise<SmartSearchResult | null> => {
    if (!query.trim()) {
      toast.error('Please enter a search query');
      return null;
    }

    setIsSearching(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('smart-property-search', {
        body: { query, properties },
      });

      if (fnError) {
        throw fnError;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      const result = data as SmartSearchResult;
      setLastResult(result);
      
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Search failed';
      setError(message);
      
      if (message.includes('Rate limit') || message.includes('429')) {
        toast.error('AI service is busy. Please wait a moment and try again.');
      } else {
        toast.error('Search failed. Please try again.');
      }
      
      console.error('Smart search error:', err);
      return null;
    } finally {
      setIsSearching(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setLastResult(null);
    setError(null);
  }, []);

  return {
    search,
    clearSearch,
    isSearching,
    lastResult,
    error,
  };
}
