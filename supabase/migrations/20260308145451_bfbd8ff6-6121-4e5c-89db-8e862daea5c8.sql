
-- Create subscription tier enum
CREATE TYPE public.subscription_tier AS ENUM ('basic', 'premium', 'professional');

-- Create user_subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier subscription_tier NOT NULL DEFAULT 'basic',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscription
CREATE POLICY "Users can view their own subscription"
  ON public.user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own subscription
CREATE POLICY "Users can insert their own subscription"
  ON public.user_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own subscription
CREATE POLICY "Users can update their own subscription"
  ON public.user_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can view all subscriptions
CREATE POLICY "Admins can view all subscriptions"
  ON public.user_subscriptions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Function to get photo limit based on tier
CREATE OR REPLACE FUNCTION public.get_photo_limit(p_tier subscription_tier)
RETURNS INTEGER
LANGUAGE sql
STABLE
AS $$
  SELECT CASE p_tier
    WHEN 'basic' THEN 5
    WHEN 'premium' THEN 20
    WHEN 'professional' THEN 100
    ELSE 5
  END;
$$;

-- Function to get listing duration days based on tier
CREATE OR REPLACE FUNCTION public.get_listing_duration_days(p_tier subscription_tier)
RETURNS INTEGER
LANGUAGE sql
STABLE
AS $$
  SELECT CASE p_tier
    WHEN 'basic' THEN 30
    WHEN 'premium' THEN 90
    WHEN 'professional' THEN 365
    ELSE 30
  END;
$$;
