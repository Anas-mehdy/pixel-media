-- Add currency column to orders table
ALTER TABLE public.orders ADD COLUMN currency text DEFAULT 'SAR';