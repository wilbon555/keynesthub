-- Create contact_requests table to log all contact attempts
CREATE TABLE public.contact_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  requester_name TEXT NOT NULL,
  requester_email TEXT NOT NULL,
  requester_phone TEXT,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

-- Property owners can view contact requests for their properties
CREATE POLICY "Property owners can view their contact requests"
ON public.contact_requests
FOR SELECT
USING (
  property_id IN (
    SELECT id FROM public.properties WHERE user_id = auth.uid()
  )
);

-- Anyone can create contact requests
CREATE POLICY "Anyone can create contact requests"
ON public.contact_requests
FOR INSERT
WITH CHECK (true);

-- Add index for faster queries
CREATE INDEX idx_contact_requests_property_id ON public.contact_requests(property_id);
CREATE INDEX idx_contact_requests_created_at ON public.contact_requests(created_at DESC);