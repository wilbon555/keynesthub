import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface PropertyViewStats {
  property_id: string;
  total_views: number;
  views_today: number;
  views_this_week: number;
  views_this_month: number;
}

export const usePropertyViews = () => {
  const [viewStats, setViewStats] = useState<PropertyViewStats[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Generate or get session ID for anonymous tracking
  const getSessionId = useCallback(() => {
    let sessionId = sessionStorage.getItem('property_view_session');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('property_view_session', sessionId);
    }
    return sessionId;
  }, []);

  // Record a property view
  const recordView = useCallback(async (propertyId: string) => {
    const sessionId = getSessionId();
    
    // Debounce: Don't record if same property viewed in last 5 minutes
    const lastViewKey = `last_view_${propertyId}`;
    const lastView = sessionStorage.getItem(lastViewKey);
    const now = Date.now();
    
    if (lastView && now - parseInt(lastView) < 5 * 60 * 1000) {
      return; // Skip if viewed within 5 minutes
    }
    
    sessionStorage.setItem(lastViewKey, now.toString());

    try {
      await supabase.from('property_views').insert({
        property_id: propertyId,
        viewer_id: user?.id || null,
        session_id: sessionId
      });
    } catch (error) {
      console.error('Failed to record view:', error);
    }
  }, [user?.id, getSessionId]);

  // Fetch view stats for owner's properties
  const fetchViewStats = useCallback(async () => {
    if (!user?.id) {
      setViewStats([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('get_property_view_stats', {
        owner_user_id: user.id
      });

      if (error) throw error;
      
      setViewStats(data?.map((item: any) => ({
        property_id: item.property_id,
        total_views: Number(item.total_views),
        views_today: Number(item.views_today),
        views_this_week: Number(item.views_this_week),
        views_this_month: Number(item.views_this_month)
      })) || []);
    } catch (error) {
      console.error('Failed to fetch view stats:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchViewStats();
  }, [fetchViewStats]);

  // Get stats for a specific property
  const getPropertyStats = useCallback((propertyId: string): PropertyViewStats | undefined => {
    return viewStats.find(s => s.property_id === propertyId);
  }, [viewStats]);

  // Calculate totals across all properties
  const totalStats = viewStats.reduce(
    (acc, stat) => ({
      total_views: acc.total_views + stat.total_views,
      views_today: acc.views_today + stat.views_today,
      views_this_week: acc.views_this_week + stat.views_this_week,
      views_this_month: acc.views_this_month + stat.views_this_month
    }),
    { total_views: 0, views_today: 0, views_this_week: 0, views_this_month: 0 }
  );

  return {
    viewStats,
    totalStats,
    loading,
    recordView,
    getPropertyStats,
    refetch: fetchViewStats
  };
};
