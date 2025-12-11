-- Drop the existing, insecure policies
DROP POLICY IF EXISTS "Users can view products" ON public.products;
DROP POLICY IF EXISTS "Users can insert products" ON public.products;
DROP POLICY IF EXISTS "Users can update products" ON public.products;
DROP POLICY IF EXISTS "Users can delete products" ON public.products;

-- Create secure, multi-tenant RLS policies for the 'products' table

-- 1. SELECT policy: Users can only see products that belong to them.
CREATE POLICY "Users can view their own products"
  ON public.products
  FOR SELECT
  TO authenticated
  USING (public.get_my_client_id()::text = client_id);

-- 2. INSERT policy: Users can only create products for themselves.
CREATE POLICY "Users can insert their own products"
  ON public.products
  FOR INSERT
  TO authenticated
  WITH CHECK (public.get_my_client_id()::text = client_id);

-- 3. UPDATE policy: Users can only update their own products.
CREATE POLICY "Users can update their own products"
  ON public.products
  FOR UPDATE
  TO authenticated
  USING (public.get_my_client_id()::text = client_id)
  WITH CHECK (public.get_my_client_id()::text = client_id);

-- 4. DELETE policy: Users can only delete their own products.
CREATE POLICY "Users can delete their own products"
  ON public.products
  FOR DELETE
  TO authenticated
  USING (public.get_my_client_id()::text = client_id);
