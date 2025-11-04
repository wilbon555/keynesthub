-- Add listing_type column to properties table
ALTER TABLE public.properties 
ADD COLUMN listing_type TEXT NOT NULL DEFAULT 'sale' CHECK (listing_type IN ('sale', 'rent'));