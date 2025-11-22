-- Add type field to alerts table for better categorization
ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS type text DEFAULT 'system';

-- Add an index on is_read for faster queries
CREATE INDEX IF NOT EXISTS idx_alerts_is_read ON public.alerts(is_read);

-- Add an index on created_at for ordering
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON public.alerts(created_at DESC);