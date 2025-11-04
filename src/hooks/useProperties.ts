import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Property {
  id: string;
  title: string;
  price: string;
  location: string;
  bedrooms?: number;
  bathrooms?: number;
  area: string;
  type: string;
  image: string; // Keep for backward compatibility
  images?: string[]; // Make optional for backward compatibility
  featured: boolean;
  region?: string;
  country?: string;
  phone?: string;
  description?: string;
  status: 'available' | 'sold' | 'rented';
  listing_type: 'sale' | 'rent';
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const useProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Fetch all available properties
  const fetchProperties = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'available')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const propertiesWithImages = (data || []).map(property => ({
        ...property,
        image: property.images?.[0] || property.image || "/placeholder.svg",
        images: property.images || [property.image || "/placeholder.svg"]
      }));
      setProperties(propertiesWithImages as Property[]);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's properties
  const fetchUserProperties = async () => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user properties:', error);
      toast.error('Failed to load your properties');
      return [];
    }
  };

  // Add new property
  const addProperty = async (propertyData: Omit<Property, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) {
      toast.error('You must be logged in to add properties');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('properties')
        .insert([{
          ...propertyData,
          user_id: user.id,
          status: 'available'
        }])
        .select()
        .single();

      if (error) throw error;
      
      // Refresh properties list
      await fetchProperties();
      toast.success('Property listed successfully!');
      return data;
    } catch (error) {
      console.error('Error adding property:', error);
      toast.error('Failed to add property');
      return null;
    }
  };

  // Update property status
  const updatePropertyStatus = async (propertyId: string, status: 'available' | 'sold' | 'rented') => {
    if (!user) {
      toast.error('You must be logged in to update properties');
      return false;
    }

    try {
      const { error } = await supabase
        .from('properties')
        .update({ status })
        .eq('id', propertyId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Refresh properties list
      await fetchProperties();
      toast.success(`Property marked as ${status}`);
      return true;
    } catch (error) {
      console.error('Error updating property:', error);
      toast.error('Failed to update property');
      return false;
    }
  };

  // Delete property
  const deleteProperty = async (propertyId: string) => {
    if (!user) {
      toast.error('You must be logged in to delete properties');
      return false;
    }

    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Refresh properties list
      await fetchProperties();
      toast.success('Property deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting property:', error);
      toast.error('Failed to delete property');
      return false;
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  return {
    properties,
    loading,
    addProperty,
    updatePropertyStatus,
    deleteProperty,
    fetchProperties,
    fetchUserProperties
  };
};