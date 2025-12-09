-- Drop and recreate customer_360 view with security_invoker = true
-- This ensures the view respects RLS policies on underlying tables (leads, orders)

DROP VIEW IF EXISTS public.customer_360;

CREATE VIEW public.customer_360 WITH (security_invoker = true) AS
SELECT 
  l.id,
  l.name,
  l.phone,
  l.status AS lead_status,
  l.last_contact_at,
  l.client_id,
  count(o.id) AS total_orders,
  COALESCE(sum(o.total_amount), 0::numeric) AS total_spent,
  max(o.created_at) AS last_order_date
FROM leads l
LEFT JOIN orders o ON l.phone = o.customer_phone AND l.client_id = o.client_id
GROUP BY l.id, l.name, l.phone, l.status, l.last_contact_at, l.client_id;