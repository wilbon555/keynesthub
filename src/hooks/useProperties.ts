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
  image?: string; // Make optional
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
  uploadedFiles?: File[]; // For file uploads
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

      const { uploadedFiles, ...dataWithoutFiles } = propertyData;
      
      const updateData: any = { ...dataWithoutFiles };
      
      // Only update images if new ones were uploaded
      if (imageUrls && imageUrls.length > 0) {
        updateData.image = imageUrls[0];
        updateData.images = imageUrls;
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
    fetchProperties();
  }, []);

  return {
    properties,
    loading,
    addProperty,
    updateProperty,
    updatePropertyStatus,
    deleteProperty,
    fetchProperties,
    fetchUserProperties
  };
};