-- Add apartment-specific columns for building details
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS units INTEGER,
ADD COLUMN IF NOT EXISTS floors INTEGER,
ADD COLUMN IF NOT EXISTS building_age INTEGER,
ADD COLUMN IF NOT EXISTS developer TEXT,
ADD COLUMN IF NOT EXISTS maintenance_quality TEXT;