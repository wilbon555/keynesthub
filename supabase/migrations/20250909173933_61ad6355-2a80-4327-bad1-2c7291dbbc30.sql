-- Add images array column to properties table
ALTER TABLE public.properties 
ADD COLUMN images TEXT[] DEFAULT '{}';

-- Update existing properties to move single image to images array
UPDATE public.properties 
SET images = CASE 
  WHEN image IS NOT NULL AND image != '' THEN ARRAY[image]
  ELSE '{}'
END;

-- Create index for better performance on images array
CREATE INDEX idx_properties_images ON public.properties USING GIN(images);