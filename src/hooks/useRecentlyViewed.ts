import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'keynesthub_recently_viewed';
const MAX_ITEMS = 10;

export interface RecentlyViewedItem {
  propertyId: string;
  viewedAt: number;
}

export const useRecentlyViewed = () => {
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as RecentlyViewedItem[];
        setRecentlyViewed(parsed);
      } catch (e) {
        console.error('Failed to parse recently viewed:', e);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Add a property to recently viewed
  const addToRecentlyViewed = useCallback((propertyId: string) => {
    setRecentlyViewed(prev => {
      // Remove if already exists
      const filtered = prev.filter(item => item.propertyId !== propertyId);
      
      // Add to front
      const newItem: RecentlyViewedItem = {
        propertyId,
        viewedAt: Date.now()
      };
      
      // Keep only last MAX_ITEMS
      const updated = [newItem, ...filtered].slice(0, MAX_ITEMS);
      
      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      
      return updated;
    });
  }, []);

  // Clear all recently viewed
  const clearRecentlyViewed = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setRecentlyViewed([]);
  }, []);

  // Get property IDs only
  const recentPropertyIds = recentlyViewed.map(item => item.propertyId);

  return {
    recentlyViewed,
    recentPropertyIds,
    addToRecentlyViewed,
    clearRecentlyViewed
  };
};

