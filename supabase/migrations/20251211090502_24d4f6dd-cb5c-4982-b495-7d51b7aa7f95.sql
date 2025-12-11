-- Create trigger function for lead status change notifications
CREATE OR REPLACE FUNCTION public.notify_lead_status_change()
RETURNS TRIGGER AS $$
DECLARE
  status_label TEXT;
BEGIN
  -- Map status values to Arabic labels
  CASE NEW.status
    WHEN 'new' THEN status_label := 'جديد';
    WHEN 'inquiry' THEN status_label := 'استفسار';
    WHEN 'potential' THEN status_label := 'مهتم/محتمل';
    WHEN 'order_placed' THEN status_label := 'طلب نشط';
    WHEN 'complaint' THEN status_label := 'شكوى';
    WHEN 'closed' THEN status_label := 'مكتمل';
    ELSE status_label := NEW.status;
  END CASE;

  -- Only create notification if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.notifications (client_id, title, message, type, link)
    VALUES (
      NEW.client_id,
      'تغيير حالة عميل',
      'تم تغيير حالة العميل ' || COALESCE(NEW.name, NEW.phone) || ' إلى: ' || status_label,
      'info',
      '/leads'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for lead status changes
DROP TRIGGER IF EXISTS on_lead_status_change ON public.leads;
CREATE TRIGGER on_lead_status_change
  AFTER UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_lead_status_change();

-- Create trigger function for new order notifications
CREATE OR REPLACE FUNCTION public.notify_new_order()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (client_id, title, message, type, link)
  VALUES (
    NEW.client_id,
    'طلب جديد',
    'تم استلام طلب جديد من العميل ' || COALESCE(NEW.customer_name, NEW.customer_phone) || ' بمبلغ ' || COALESCE(NEW.total_amount::text, '0') || ' ' || COALESCE(NEW.currency, 'SAR'),
    'success',
    '/orders'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new orders
DROP TRIGGER IF EXISTS on_new_order ON public.orders;
CREATE TRIGGER on_new_order
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_order();