-- Drop and recreate the policy for admins viewing all applications
-- The has_role function requires approved=true, so we need a different approach for admins

DROP POLICY IF EXISTS "Admins can view all applications" ON public.agent_applications;

-- Create a simpler policy that directly checks the user_roles table
-- Using a subquery that doesn't depend on the has_role function
CREATE POLICY "Admins can view all applications"
ON public.agent_applications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'::app_role
      AND user_roles.approved = true
  )
  OR
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'agent'::app_role
      AND user_roles.approved = true
  )
);