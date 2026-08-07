REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;

DROP POLICY IF EXISTS "Agents can view all properties for verification" ON public.properties;
CREATE POLICY "Agents can view all properties for verification"
ON public.properties
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'agent'::public.app_role)
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
);

DROP POLICY IF EXISTS "Agents can update verification status" ON public.properties;
CREATE POLICY "Agents can update verification status"
ON public.properties
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'agent'::public.app_role)
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
)
WITH CHECK (
  public.has_role(auth.uid(), 'agent'::public.app_role)
  OR public.has_role(auth.uid(), 'admin'::public.app_role)
);