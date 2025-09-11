-- Create a secure function to get properties with conditional phone access
CREATE OR REPLACE FUNCTION public.get_properties_secure()
RETURNS SETOF properties
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT 
    id,
    title,
    price,
    location,
    bedrooms,
    bathrooms,
    area,
    type,
    image,
    images,
    featured,
    region,
    country,
    -- Only show phone if user owns the property, otherwise null
    CASE 
      WHEN auth.uid() = user_id THEN phone
      ELSE NULL
    END as phone,
    description,
    status,
    user_id,
    created_at,
    updated_at
  FROM properties
  WHERE status = 'available' OR auth.uid() = user_id;
$$;

-- Drop the existing public view policy
DROP POLICY IF EXISTS "Anyone can view available properties" ON public.properties;

-- Create new secure policy that only allows access through the secure function
CREATE POLICY "Secure property access" 
ON public.properties 
FOR SELECT 
USING (
  -- Users can view their own properties with full access
  auth.uid() = user_id
);