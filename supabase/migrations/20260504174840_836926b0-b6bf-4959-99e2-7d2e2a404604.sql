
-- 1) Properties: hide phone column from clients entirely; expose via secure RPC
REVOKE SELECT (phone) ON public.properties FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_property_contact_phone(_property_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_phone text;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;

  IF NOT (public.has_role(auth.uid(), 'agent'::app_role)
       OR public.has_role(auth.uid(), 'admin'::app_role)) THEN
    RETURN NULL;
  END IF;

  SELECT phone INTO v_phone FROM public.properties WHERE id = _property_id;
  RETURN v_phone;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_property_contact_phone(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_property_contact_phone(uuid) TO authenticated;

-- 2) user_subscriptions: prevent self-tier escalation
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.user_subscriptions;
-- (No replacement policy; tier mutations only via admin/edge functions using service role)

-- 3) agent_applications: restrict SELECT to admins only
DROP POLICY IF EXISTS "Admins can view all applications" ON public.agent_applications;
CREATE POLICY "Admins can view all applications"
ON public.agent_applications
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 4) contact_requests: let signed-in requesters see their own submissions
CREATE POLICY "Requesters can view their own contact requests"
ON public.contact_requests
FOR SELECT
TO authenticated
USING (lower(requester_email) = lower(coalesce((auth.jwt() ->> 'email'), '')));

-- 5) Storage policies for the private "Users uploads" bucket (owner-scoped)
CREATE POLICY "Users can read own files in Users uploads"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'Users uploads' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload to Users uploads"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'Users uploads' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own files in Users uploads"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'Users uploads' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own files in Users uploads"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'Users uploads' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- 6) Lock down internal SECURITY DEFINER helpers from public/anon execution
REVOKE EXECUTE ON FUNCTION public.get_photo_limit(subscription_tier) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_listing_duration_days(subscription_tier) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.decrement_vacant_units(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_vacant_units(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_property_view_stats(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_user_roles(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
-- has_role is still callable inline by RLS (runs as definer); keep for authenticated for app checks
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_roles(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_property_view_stats(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_photo_limit(subscription_tier) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_listing_duration_days(subscription_tier) TO authenticated;
