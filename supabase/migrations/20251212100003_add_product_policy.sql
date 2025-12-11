
CREATE POLICY "Enable insert for authenticated users only"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (true);
