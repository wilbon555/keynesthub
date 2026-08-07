CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND approved = true
  )
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

DO $$
DECLARE
  p record;
  using_expr text;
  check_expr text;
  statement text;
BEGIN
  FOR p IN
    SELECT schemaname, tablename, policyname, cmd, roles, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public'
      AND (coalesce(qual, '') LIKE '%has_role(%' OR coalesce(with_check, '') LIKE '%has_role(%')
  LOOP
    using_expr := replace(p.qual, 'has_role(', 'private.has_role(');
    check_expr := replace(p.with_check, 'has_role(', 'private.has_role(');

    statement := format(
      'ALTER POLICY %I ON %I.%I TO authenticated',
      p.policyname, p.schemaname, p.tablename
    );

    IF using_expr IS NOT NULL THEN
      statement := statement || format(' USING (%s)', using_expr);
    END IF;

    IF check_expr IS NOT NULL THEN
      statement := statement || format(' WITH CHECK (%s)', check_expr);
    END IF;

    EXECUTE statement;
  END LOOP;
END
$$;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;