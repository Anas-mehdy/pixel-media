-- ============================================
-- FIX ERROR-LEVEL SECURITY ISSUES
-- ============================================

-- 1. Enable RLS on n8n_chat_histories table
-- This table is accessed by n8n backend only, so we'll restrict to service role
ALTER TABLE public.n8n_chat_histories ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can access (n8n uses service role)
-- No anon/authenticated access allowed
CREATE POLICY "Service role only access"
ON public.n8n_chat_histories
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 2. Enable RLS on documents table (knowledge base)
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read documents (public knowledge base)
CREATE POLICY "Authenticated users can read documents"
ON public.documents
FOR SELECT
TO authenticated
USING (true);

-- Policy: Service role can manage documents
CREATE POLICY "Service role can manage documents"
ON public.documents
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 3. Enable RLS on documents_pixelmedia table
ALTER TABLE public.documents_pixelmedia ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read
CREATE POLICY "Authenticated users can read documents_pixelmedia"
ON public.documents_pixelmedia
FOR SELECT
TO authenticated
USING (true);

-- Policy: Service role can manage
CREATE POLICY "Service role can manage documents_pixelmedia"
ON public.documents_pixelmedia
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 4. Enable RLS on system_errors table
ALTER TABLE public.system_errors ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can access (for n8n logging)
CREATE POLICY "Service role only for system_errors"
ON public.system_errors
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 5. Enable RLS on clients table
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own client
CREATE POLICY "Users can view own client"
ON public.clients
FOR SELECT
TO authenticated
USING (id = get_my_client_id());

-- Policy: Service role full access
CREATE POLICY "Service role can manage clients"
ON public.clients
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 6. Fix customer_360 view - recreate with SECURITY INVOKER
DROP VIEW IF EXISTS public.customer_360;

CREATE VIEW public.customer_360
WITH (security_invoker = true)
AS
SELECT 
    l.id,
    l.name,
    l.phone,
    l.status AS lead_status,
    l.last_contact_at,
    l.client_id,
    COUNT(o.id) AS total_orders,
    COALESCE(SUM(o.total_amount), 0) AS total_spent,
    MAX(o.created_at) AS last_order_date
FROM public.leads l
LEFT JOIN public.orders o ON l.phone = o.customer_phone
GROUP BY l.id, l.name, l.phone, l.status, l.last_contact_at, l.client_id;