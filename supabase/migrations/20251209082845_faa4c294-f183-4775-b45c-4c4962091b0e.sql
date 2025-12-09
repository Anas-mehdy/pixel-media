-- Add hunter scheduling columns to bot_settings
ALTER TABLE public.bot_settings 
ADD COLUMN IF NOT EXISTS hunter_days text[] DEFAULT ARRAY['sunday', 'monday', 'tuesday', 'wednesday', 'thursday']::text[],
ADD COLUMN IF NOT EXISTS hunter_start_time time without time zone DEFAULT '09:00'::time,
ADD COLUMN IF NOT EXISTS hunter_end_time time without time zone DEFAULT '21:00'::time;

-- Create campaign_history table
CREATE TABLE public.campaign_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  recipient_count INTEGER NOT NULL DEFAULT 0,
  message_text TEXT NOT NULL,
  client_id TEXT,
  phones TEXT[] NOT NULL DEFAULT '{}'::text[]
);

-- Enable Row Level Security
ALTER TABLE public.campaign_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for campaign_history
CREATE POLICY "Users can manage their own campaign history" 
ON public.campaign_history 
FOR ALL 
USING (client_id = get_my_client_id());

-- Add table to realtime
ALTER PUBLICATION supabase_realtime ADD TABLE campaign_history;