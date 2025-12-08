-- Enable REPLICA IDENTITY FULL for real-time updates
ALTER TABLE public.bot_settings REPLICA IDENTITY FULL;

-- Add the table to the supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.bot_settings;