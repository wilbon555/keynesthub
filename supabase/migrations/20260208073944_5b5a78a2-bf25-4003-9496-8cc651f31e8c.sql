-- Add vacancy tracking columns to properties table
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS total_units integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS vacant_units integer DEFAULT 1;

-- Add constraint to ensure vacant_units doesn't exceed total_units
ALTER TABLE public.properties
ADD CONSTRAINT check_vacant_units CHECK (vacant_units >= 0 AND vacant_units <= total_units);

-- Create function to decrement vacant units when booking is confirmed
CREATE OR REPLACE FUNCTION public.decrement_vacant_units(property_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_vacant integer;
BEGIN
  -- Get current vacant units and lock the row
  SELECT vacant_units INTO current_vacant
  FROM properties
  WHERE id = property_id
  FOR UPDATE;
  
  -- Check if there are vacant units available
  IF current_vacant IS NULL OR current_vacant <= 0 THEN
    RETURN 0;
  END IF;
  
  -- Decrement vacant units
  UPDATE properties
  SET vacant_units = vacant_units - 1,
      updated_at = now()
  WHERE id = property_id;
  
  RETURN current_vacant - 1;
END;
$$;

-- Create function to increment vacant units (for cancellations)
CREATE OR REPLACE FUNCTION public.increment_vacant_units(property_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_vacant integer;
  max_units integer;
BEGIN
  SELECT vacant_units, total_units INTO current_vacant, max_units
  FROM properties
  WHERE id = property_id
  FOR UPDATE;
  
  IF current_vacant >= max_units THEN
    RETURN current_vacant;
  END IF;
  
  UPDATE properties
  SET vacant_units = vacant_units + 1,
      updated_at = now()
  WHERE id = property_id;
  
  RETURN current_vacant + 1;
END;
$$;