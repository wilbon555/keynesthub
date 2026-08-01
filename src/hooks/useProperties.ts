import { useState, useEffect, useRef, useCallback } from 'react';
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
  image?: string;
  images?: string[];
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
  // Apartment-specific fields
  units?: number;
  floors?: number;
  building_age?: number;
  developer?: string;
  maintenance_quality?: string;
  uploadedFiles?: File[];
  // Verification fields
  verification_status?: string;
  verified_at?: string;
  verified_by?: string;
  verification_notes?: string;
  // Vacancy tracking (for rentals)
  total_units?: number;
  vacant_units?: number;
  // Stay type for rentals
  stay_type?: 'long-term' | 'short-term';
  // Verification details
  title_deed_verified?: boolean;
  taxes_paid_verified?: boolean;
  physical_inspection_done?: boolean;
}

const PAGE_SIZE = 10;

/**
 * Module-level shared store.
 * `useProperties` is mounted by many components at once (every PropertyCard, etc.).
 * Without this, each mount fired its own identical query, producing a request storm
 * that Supabase throttles — which is what made listings intermittently fail to load.
 */
type Snapshot = {
  properties: Property[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  fetchError: string | null;
};

let snapshot: Snapshot = {
  properties: [],
  loading: true,
  loadingMore: false,
  hasMore: false,
  fetchError: null,
};
let listeners = new Set<() => void>();
let inFlight: Promise<void> | null = null;
let hasLoadedOnce = false;

const setSnapshot = (patch: Partial<Snapshot>) => {
  snapshot = { ...snapshot, ...patch };
  listeners.forEach((l) => l());
};

export const useProperties = () => {
  const [, forceRender] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    const listener = () => forceRender((n) => n + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const { properties, loading, loadingMore, hasMore, fetchError } = snapshot;

  // Fetch a page of available properties (append or replace)
  const fetchProperties = useCallback(async (opts?: { append?: boolean; offset?: number }) => {
    const append = opts?.append ?? false;
    const offset = opts?.offset ?? 0;
    const MAX_ATTEMPTS = 3;
    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

    // Dedupe concurrent identical loads across all hook consumers
    if (inFlight) return inFlight;

    const run = async () => {
    try {
      setSnapshot(append ? { loadingMore: true, fetchError: null } : { loading: true, fetchError: null });

      let data: any[] | null = null;
      let lastError: any = null;

      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        const { data: rows, error } = await supabase
          .from('properties')
          .select('*')
          .eq('status', 'available')
          .eq('verification_status', 'verified')
          .order('created_at', { ascending: false })
          .range(offset, offset + PAGE_SIZE - 1);

        if (!error) {
          data = rows;
          lastError = null;
          break;
        }

        lastError = error;
        console.warn(`Properties fetch attempt ${attempt}/${MAX_ATTEMPTS} failed:`, error.message);
        if (attempt < MAX_ATTEMPTS) {
          // Exponential backoff: 500ms, 1000ms, 2000ms
          await sleep(500 * Math.pow(2, attempt - 1));
        }
      }

      if (lastError) throw lastError;
      const mapped = (data || []).map((property: any) => ({
        ...property,
        image: property.images?.[0] || property.image || '/placeholder.svg',
        images: property.images || [property.image || '/placeholder.svg'],
      })) as Property[];

      setSnapshot({
        hasMore: mapped.length === PAGE_SIZE,
        properties: append ? [...snapshot.properties, ...mapped] : mapped,
      });
      hasLoadedOnce = true;
    } catch (error: any) {
      console.error('Error fetching properties:', error);
      setSnapshot({
        fetchError: 'We couldn’t load properties after several attempts. Please check your connection and try again.',
        ...(append ? {} : { properties: [] }),
      });
    } finally {
      setSnapshot({ loading: false, loadingMore: false });
      inFlight = null;
    }
    };

    inFlight = run();
    return inFlight;
  }, []);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    return fetchProperties({ append: true, offset: properties.length });
  }, [fetchProperties, hasMore, loadingMore, properties.length]);

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

    console.log('Starting property upload for user:', user.id);

    try {
      let imageUrls: string[] = [];
      
      // Upload images to storage if provided
      if (propertyData.uploadedFiles && propertyData.uploadedFiles.length > 0) {
        console.log(`Uploading ${propertyData.uploadedFiles.length} files to storage...`);
        
        const uploadPromises = propertyData.uploadedFiles.map(async (file, index) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}/${Date.now()}-${index}.${fileExt}`;
          
          console.log(`Uploading file: ${fileName}`);
          const { data, error } = await supabase.storage
            .from('property-images')
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (error) {
            console.error(`Storage upload error for ${fileName}:`, error);
            throw error;
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('property-images')
            .getPublicUrl(fileName);

          console.log(`File uploaded successfully: ${publicUrl}`);
          return publicUrl;
        });

        imageUrls = await Promise.all(uploadPromises);
        console.log('All files uploaded successfully:', imageUrls);
      }

      // Remove uploadedFiles from data and use the uploaded URLs
      const { uploadedFiles, ...dataWithoutFiles } = propertyData;
      
      console.log('Inserting property into database...');
      const { data, error } = await supabase
        .from('properties')
        .insert([{
          ...dataWithoutFiles,
          image: imageUrls[0] || '/placeholder.svg',
          images: imageUrls.length > 0 ? imageUrls : ['/placeholder.svg'],
          user_id: user.id,
          status: 'available'
        }])
        .select()
        .single();

      if (error) {
        console.error('Database insertion error:', error);
        throw error;
      }
      
      console.log('Property added successfully:', data);
      
      // Refresh properties list
      await fetchProperties();
      toast.success('Property listed successfully!');
      return data;
    } catch (error: any) {
      console.error('Error adding property:', error);
      
      // Provide more detailed error messages
      if (error?.message?.includes('storage')) {
        toast.error('Failed to upload images. Please check file size and format.');
      } else if (error?.message?.includes('row-level security')) {
        toast.error('Authentication error. Please log out and log in again.');
      } else if (error?.message) {
        toast.error(`Failed to add property: ${error.message}`);
      } else {
        toast.error('Failed to add property. Please try again.');
      }
      
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

  // Update property
  const updateProperty = async (propertyId: string, propertyData: Partial<Omit<Property, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!user) {
      toast.error('You must be logged in to update properties');
      return false;
    }

    try {
      let imageUrls: string[] | undefined;
      
      // Upload new images to storage if provided
      if (propertyData.uploadedFiles && propertyData.uploadedFiles.length > 0) {
        const uploadPromises = propertyData.uploadedFiles.map(async (file, index) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}/${Date.now()}-${index}.${fileExt}`;
          
          const { data, error } = await supabase.storage
            .from('property-images')
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (error) throw error;

          const { data: { publicUrl } } = supabase.storage
            .from('property-images')
            .getPublicUrl(fileName);

          return publicUrl;
        });

        imageUrls = await Promise.all(uploadPromises);
      }

      const { uploadedFiles, images: existingImages, ...dataWithoutFiles } = propertyData;
      
      const updateData: any = { ...dataWithoutFiles };
      
      // Merge existing images (after removals) with newly uploaded ones
      const finalImages = [...(existingImages || []), ...(imageUrls || [])];
      if (finalImages.length > 0) {
        updateData.image = finalImages[0];
        updateData.images = finalImages;
      } else {
        updateData.image = '/placeholder.svg';
        updateData.images = ['/placeholder.svg'];
      }

      const { error } = await supabase
        .from('properties')
        .update(updateData)
        .eq('id', propertyId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      await fetchProperties();
      toast.success('Property updated successfully!');
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
    if (hasLoadedOnce || inFlight) return;
    fetchProperties();
  }, [fetchProperties]);

  return {
    properties,
    loading,
    loadingMore,
    hasMore,
    fetchError,
    loadMore,
    addProperty,
    updateProperty,
    updatePropertyStatus,
    deleteProperty,
    fetchProperties,
    fetchUserProperties
  };
};