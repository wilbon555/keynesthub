-- Create property_views table to track analytics
CREATE TABLE public.property_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  viewer_id UUID,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_id TEXT
);

-- Enable RLS
ALTER TABLE public.property_views ENABLE ROW LEVEL SECURITY;

-- Anyone can insert views (for anonymous tracking)
CREATE POLICY "Anyone can record views"
ON public.property_views
FOR INSERT
WITH CHECK (true);

-- Owners can view analytics for their own properties
CREATE POLICY "Owners can view their property analytics"
ON public.property_views
FOR SELECT
USING (
  property_id IN (
    SELECT id FROM public.properties WHERE user_id = auth.uid()
  )
);

-- Agents and admins can view all analytics
CREATE POLICY "Agents can view all analytics"
ON public.property_views
FOR SELECT
USING (has_role(auth.uid(), 'agent') OR has_role(auth.uid(), 'admin'));

-- Create indexes for performance
CREATE INDEX idx_property_views_property_id ON public.property_views(property_id);
CREATE INDEX idx_property_views_viewed_at ON public.property_views(viewed_at);

-- Create a function to get view counts per property
CREATE OR REPLACE FUNCTION public.get_property_view_stats(owner_user_id UUID)
RETURNS TABLE (
  property_id UUID,
  total_views BIGINT,
  views_today BIGINT,
  views_this_week BIGINT,
  views_this_month BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    pv.property_id,
    COUNT(*) as total_views,
    COUNT(*) FILTER (WHERE pv.viewed_at >= CURRENT_DATE) as views_today,
    COUNT(*) FILTER (WHERE pv.viewed_at >= CURRENT_DATE - INTERVAL '7 days') as views_this_week,
    COUNT(*) FILTER (WHERE pv.viewed_at >= CURRENT_DATE - INTERVAL '30 days') as views_this_month
  FROM property_views pv
  INNER JOIN properties p ON pv.property_id = p.id
  WHERE p.user_id = owner_user_id
  GROUP BY pv.property_id;
$$;