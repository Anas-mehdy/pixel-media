-- Fix mutable search_path in database functions (excluding vector-dependent functions)

-- Fix get_weekly_stats function
CREATE OR REPLACE FUNCTION public.get_weekly_stats()
 RETURNS TABLE(date text, count bigint)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path = public
AS $function$
  select
    to_char(created_at, 'Day') as date,
    count(*) as count
  from
    messages
  where
    client_id = get_my_client_id()
    and created_at > (now() - interval '7 days')
  group by
    1, created_at::date
  order by
    created_at::date;
$function$;

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
begin
  insert into public.profiles (id, email, client_id)
  values (new.id, new.email, 'pending_assignment');
  return new;
end;
$function$;

-- Fix get_my_client_id function
CREATE OR REPLACE FUNCTION public.get_my_client_id()
 RETURNS text
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path = public
AS $function$
  select client_id from profiles where id = auth.uid() limit 1;
$function$;

-- Fix get_client_orders function
CREATE OR REPLACE FUNCTION public.get_client_orders(search_phone text)
 RETURNS json
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path = public
AS $function$
  select json_agg(t) from (
    select 
      id, 
      status, 
      product_details, 
      total_amount, 
      to_char(created_at, 'YYYY-MM-DD') as date
    from orders
    where customer_phone = search_phone
    order by created_at desc
    limit 5
  ) t;
$function$;