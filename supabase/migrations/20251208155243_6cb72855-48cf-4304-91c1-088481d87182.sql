-- Add ai_summary column to leads table for AI-generated summaries
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS ai_summary text;

-- Enable realtime for leads table
ALTER TABLE public.leads REPLICA IDENTITY FULL;

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;