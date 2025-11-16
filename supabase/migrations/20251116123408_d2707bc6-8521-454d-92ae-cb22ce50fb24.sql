-- Add rate limiting to contact_requests table
-- Allow maximum 5 requests per email per hour

CREATE OR REPLACE FUNCTION check_contact_request_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  request_count INTEGER;
BEGIN
  -- Count requests from this email in the last hour
  SELECT COUNT(*)
  INTO request_count
  FROM contact_requests
  WHERE requester_email = NEW.requester_email
    AND created_at > NOW() - INTERVAL '1 hour';
  
  -- If more than 5 requests in the last hour, reject
  IF request_count >= 5 THEN
    RAISE EXCEPTION 'Rate limit exceeded. Maximum 5 contact requests per hour allowed.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to enforce rate limiting
CREATE TRIGGER enforce_contact_request_rate_limit
  BEFORE INSERT ON contact_requests
  FOR EACH ROW
  EXECUTE FUNCTION check_contact_request_rate_limit();