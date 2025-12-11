
CREATE POLICY "Enable insert for authenticated users only"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (client_id = get_my_client_id() OR get_my_client_id() = 'pending_assignment');
