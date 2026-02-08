import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface VacancyUpdate {
  propertyId: string;
  totalUnits: number;
  vacantUnits: number;
}

/**
 * Hook to subscribe to real-time vacancy updates for rental properties
 */
export const useVacancyRealtime = (propertyIds?: string[]) => {
  const [vacancyUpdates, setVacancyUpdates] = useState<Map<string, VacancyUpdate>>(new Map());

  useEffect(() => {
    // Subscribe to property updates for vacancy changes
    const channel = supabase
      .channel('vacancy-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'properties',
          filter: propertyIds?.length 
            ? `id=in.(${propertyIds.join(',')})` 
            : undefined
        },
        (payload) => {
          const newData = payload.new as {
            id: string;
            total_units: number;
            vacant_units: number;
            listing_type: string;
          };
          
          // Only track rental properties
          if (newData.listing_type === 'rent') {
            setVacancyUpdates(prev => {
              const updated = new Map(prev);
              updated.set(newData.id, {
                propertyId: newData.id,
                totalUnits: newData.total_units,
                vacantUnits: newData.vacant_units
              });
              return updated;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [propertyIds]);

  const getVacancy = (propertyId: string) => vacancyUpdates.get(propertyId);

  return {
    vacancyUpdates,
    getVacancy
  };
};
