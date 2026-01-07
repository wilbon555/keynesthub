-- Drop the restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Agents and admins can view all roles" ON public.user_roles;

-- Create permissive SELECT policies (default is PERMISSIVE - any one passing allows access)
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Agents and admins can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (has_role(auth.uid(), 'agent'::app_role) OR has_role(auth.uid(), 'admin'::app_role));