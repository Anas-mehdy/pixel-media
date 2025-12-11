
CREATE OR REPLACE FUNCTION public.get_my_client_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  -- Get the client_id for the currently authenticated user
  SELECT client_id
  FROM profiles
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;

-- Grant execution permission to the 'authenticated' role
GRANT EXECUTE ON FUNCTION public.get_my_client_id() TO authenticated;
