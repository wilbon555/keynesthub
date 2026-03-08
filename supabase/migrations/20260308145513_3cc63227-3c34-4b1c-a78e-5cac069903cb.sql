
-- Fix search_path on functions
CREATE OR REPLACE FUNCTION public.get_photo_limit(p_tier subscription_tier)
RETURNS INTEGER
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT CASE p_tier
    WHEN 'basic' THEN 5
    WHEN 'premium' THEN 20
    WHEN 'professional' THEN 100
    ELSE 5
  END;
$$;

CREATE OR REPLACE FUNCTION public.get_listing_duration_days(p_tier subscription_tier)
RETURNS INTEGER
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT CASE p_tier
    WHEN 'basic' THEN 30
    WHEN 'premium' THEN 90
    WHEN 'professional' THEN 365
    ELSE 30
  END;
$$;
