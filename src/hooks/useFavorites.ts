import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Favorite {
  id: string;
  user_id: string;
  property_id: string;
  created_at: string;
}

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchFavorites = async () => {
    if (!user) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('property_id')
        .eq('user_id', user.id);

      if (error) throw error;

      setFavorites(data?.map(f => f.property_id) || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  const addFavorite = async (propertyId: string): Promise<boolean> => {
    if (!user) {
      toast.error('Please login to save favorites');
      return false;
    }

    try {
      const { error } = await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          property_id: propertyId
        });

      if (error) {
        if (error.code === '23505') {
          toast.info('Property already in your wishlist');
          return false;
        }
        throw error;
      }

      setFavorites(prev => [...prev, propertyId]);
      toast.success('Added to wishlist');
      return true;
    } catch (error) {
      console.error('Error adding favorite:', error);
      toast.error('Failed to add to wishlist');
      return false;
    }
  };

  const removeFavorite = async (propertyId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('property_id', propertyId);

      if (error) throw error;

      setFavorites(prev => prev.filter(id => id !== propertyId));
      toast.success('Removed from wishlist');
      return true;
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Failed to remove from wishlist');
      return false;
    }
  };

  const toggleFavorite = async (propertyId: string): Promise<boolean> => {
    if (isFavorite(propertyId)) {
      return removeFavorite(propertyId);
    }
    return addFavorite(propertyId);
  };

  const isFavorite = (propertyId: string): boolean => {
    return favorites.includes(propertyId);
  };

  return {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    refetch: fetchFavorites
  };
};
