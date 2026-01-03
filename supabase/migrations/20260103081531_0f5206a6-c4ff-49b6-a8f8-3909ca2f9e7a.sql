-- Create user role enum
CREATE TYPE public.app_role AS ENUM ('buyer', 'owner', 'agent', 'admin');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  approved BOOLEAN NOT NULL DEFAULT false,
  applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users(id),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND approved = true
  )
$$;

-- Create function to get user roles
CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id UUID)
RETURNS SETOF app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
    AND approved = true
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Agents and admins can view all roles"
ON public.user_roles
FOR SELECT
USING (
  public.has_role(auth.uid(), 'agent') OR 
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Anyone can apply for roles"
ON public.user_roles
FOR INSERT
WITH CHECK (auth.uid() = user_id AND approved = false);

CREATE POLICY "Admins can approve roles"
ON public.user_roles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Add verification_status to properties
ALTER TABLE public.properties 
ADD COLUMN verification_status TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN verified_by UUID REFERENCES auth.users(id),
ADD COLUMN verification_notes TEXT;

-- Update properties RLS to only show verified listings publicly
DROP POLICY IF EXISTS "Anyone can view available properties" ON public.properties;
DROP POLICY IF EXISTS "Public can view available properties" ON public.properties;

CREATE POLICY "Public can view verified available properties"
ON public.properties
FOR SELECT
USING (
  (status = 'available' AND verification_status = 'verified') 
  OR auth.uid() = user_id
);

CREATE POLICY "Agents can view all properties for verification"
ON public.properties
FOR SELECT
USING (
  public.has_role(auth.uid(), 'agent') OR 
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Agents can update verification status"
ON public.properties
FOR UPDATE
USING (
  public.has_role(auth.uid(), 'agent') OR 
  public.has_role(auth.uid(), 'admin')
);

-- Update contact_requests to route through agents
ALTER TABLE public.contact_requests
ADD COLUMN status TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN assigned_agent_id UUID REFERENCES auth.users(id),
ADD COLUMN agent_notes TEXT,
ADD COLUMN processed_at TIMESTAMP WITH TIME ZONE;

-- Update contact_requests RLS for agents
DROP POLICY IF EXISTS "Property owners can view their contact requests" ON public.contact_requests;

CREATE POLICY "Agents can view all contact requests"
ON public.contact_requests
FOR SELECT
USING (
  public.has_role(auth.uid(), 'agent') OR 
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Agents can update contact requests"
ON public.contact_requests
FOR UPDATE
USING (
  public.has_role(auth.uid(), 'agent') OR 
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Owners can view approved inquiries for their properties"
ON public.contact_requests
FOR SELECT
USING (
  status = 'approved' AND
  property_id IN (
    SELECT id FROM public.properties WHERE user_id = auth.uid()
  )
);

-- Create viewings table for scheduled property viewings
CREATE TABLE public.viewings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id UUID NOT NULL REFERENCES public.contact_requests(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES auth.users(id),
  owner_id UUID NOT NULL,
  scheduled_by UUID NOT NULL REFERENCES auth.users(id),
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.viewings ENABLE ROW LEVEL SECURITY;

-- Viewings RLS
CREATE POLICY "Agents can manage all viewings"
ON public.viewings
FOR ALL
USING (
  public.has_role(auth.uid(), 'agent') OR 
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Buyers can view their own viewings"
ON public.viewings
FOR SELECT
USING (buyer_id = auth.uid());

CREATE POLICY "Owners can view viewings for their properties"
ON public.viewings
FOR SELECT
USING (owner_id = auth.uid());

-- Create agent_actions audit table
CREATE TABLE public.agent_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES auth.users(id),
  action_type TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agents can view their own actions"
ON public.agent_actions
FOR SELECT
USING (agent_id = auth.uid());

CREATE POLICY "Admins can view all actions"
ON public.agent_actions
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Agents can create actions"
ON public.agent_actions
FOR INSERT
WITH CHECK (
  agent_id = auth.uid() AND
  (public.has_role(auth.uid(), 'agent') OR public.has_role(auth.uid(), 'admin'))
);

-- Trigger for viewings updated_at
CREATE TRIGGER update_viewings_updated_at
BEFORE UPDATE ON public.viewings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();