
-- 1. contact_requests: add requester_user_id and replace email-based policy
ALTER TABLE public.contact_requests
  ADD COLUMN IF NOT EXISTS requester_user_id uuid;

CREATE INDEX IF NOT EXISTS idx_contact_requests_requester_user_id
  ON public.contact_requests(requester_user_id);

DROP POLICY IF EXISTS "Requesters can view their own contact requests" ON public.contact_requests;
CREATE POLICY "Requesters can view their own contact requests"
  ON public.contact_requests
  FOR SELECT
  TO authenticated
  USING (requester_user_id IS NOT NULL AND requester_user_id = auth.uid());

-- Tighten INSERT to set requester_user_id when signed-in
DROP POLICY IF EXISTS "Anyone can create contact requests" ON public.contact_requests;
CREATE POLICY "Anyone can create contact requests"
  ON public.contact_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    (auth.uid() IS NULL AND requester_user_id IS NULL)
    OR (auth.uid() IS NOT NULL AND requester_user_id = auth.uid())
  );

-- Restrict agent SELECT/UPDATE on contact_requests to authenticated role only
DROP POLICY IF EXISTS "Agents can view all contact requests" ON public.contact_requests;
CREATE POLICY "Agents can view all contact requests"
  ON public.contact_requests
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'agent'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Agents can update contact requests" ON public.contact_requests;
CREATE POLICY "Agents can update contact requests"
  ON public.contact_requests
  FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'agent'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Owners can view approved inquiries for their properties" ON public.contact_requests;
CREATE POLICY "Owners can view approved inquiries for their properties"
  ON public.contact_requests
  FOR SELECT
  TO authenticated
  USING (
    status = 'approved'
    AND property_id IN (SELECT id FROM public.properties WHERE user_id = auth.uid())
  );

-- 2. profiles: restrict agent visibility to profiles of users who interacted with them
DROP POLICY IF EXISTS "Agents and admins can view all profiles" ON public.profiles;

CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Agents can view profiles of users who interacted with them"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    has_role(auth.uid(), 'agent'::app_role)
    AND (
      id IN (
        SELECT requester_user_id FROM public.contact_requests
        WHERE assigned_agent_id = auth.uid() AND requester_user_id IS NOT NULL
      )
    )
  );

-- 3. user_roles: drop broad agent SELECT; restrict UPDATE/DELETE to authenticated
DROP POLICY IF EXISTS "Agents and admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can approve roles" ON public.user_roles;
CREATE POLICY "Admins can approve roles"
  ON public.user_roles
  FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;
CREATE POLICY "Admins can delete roles"
  ON public.user_roles
  FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 4. Remove broad listing policy on property-images storage bucket.
-- Public buckets still serve files directly via CDN URL without this policy.
DROP POLICY IF EXISTS "Property images are publicly viewable" ON storage.objects;
