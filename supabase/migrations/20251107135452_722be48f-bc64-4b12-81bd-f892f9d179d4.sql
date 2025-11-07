-- Create a storage bucket for property images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-images',
  'property-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

-- Allow authenticated users to upload their property images
CREATE POLICY "Users can upload their own property images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'property-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to update their own property images
CREATE POLICY "Users can update their own property images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'property-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to delete their own property images
CREATE POLICY "Users can delete their own property images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'property-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow everyone to view property images (public bucket)
CREATE POLICY "Property images are publicly viewable"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'property-images');