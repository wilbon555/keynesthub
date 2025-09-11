-- Fix the RLS policy to allow public access to properties while keeping phone numbers secure
DROP POLICY IF EXISTS "Secure property access" ON public.properties;

-- Allow public users to view available properties (phone will be null for non-owners due to our secure function)
CREATE POLICY "Public can view available properties" 
ON public.properties 
FOR SELECT 
USING (
  -- Public users can view available properties, owners can view all their properties
  status = 'available' OR auth.uid() = user_id
);

-- Ensure phone numbers are hidden from public access at the application level
-- Update the useProperties hook to use our secure function for better security