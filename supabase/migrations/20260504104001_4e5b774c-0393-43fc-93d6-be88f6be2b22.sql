
-- 1) Fix privilege escalation: restrict role applications to non-privileged roles only.
-- Users may only self-apply for the 'agent' role; admin must be granted directly by another admin.
DROP POLICY IF EXISTS "Anyone can apply for roles" ON public.user_roles;

CREATE POLICY "Users can apply for agent role only"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND approved = false
  AND role = 'agent'::app_role
);

-- Allow admins to insert any role (e.g. granting admin) directly.
CREATE POLICY "Admins can insert any role"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 2) Fix public phone exposure on properties: revoke phone column SELECT from anon.
-- Authenticated users (and existing RLS) still control row visibility; anon users
-- can still read all other listing columns but never the phone number.
REVOKE SELECT ON public.properties FROM anon;
GRANT SELECT (
  id, user_id, title, price, location, bedrooms, bathrooms, area, type, image,
  featured, region, country, description, status, created_at, updated_at, images,
  listing_type, units, floors, building_age, developer, maintenance_quality,
  verification_status, verified_at, verified_by, verification_notes,
  virtual_tour_url, virtual_tour_type, total_units, vacant_units,
  title_deed_verified, taxes_paid_verified, physical_inspection_done, stay_type
) ON public.properties TO anon;
