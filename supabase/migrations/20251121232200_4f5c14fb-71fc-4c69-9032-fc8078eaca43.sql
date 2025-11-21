-- Create market_price_submissions table for crowdsourced price data
CREATE TABLE public.market_price_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  submitted_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  crop_name TEXT NOT NULL,
  price_per_kg NUMERIC(10, 2) NOT NULL CHECK (price_per_kg > 0),
  CONSTRAINT valid_crop_name CHECK (crop_name IN ('Maize', 'Rice (Local)', 'Cassava', 'Yam', 'Sorghum', 'Millet', 'Cowpea (Beans)', 'Groundnut'))
);

-- Enable Row Level Security
ALTER TABLE public.market_price_submissions ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can insert their own submissions
CREATE POLICY "Users can submit their own prices"
ON public.market_price_submissions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = submitted_by);

-- Policy: All authenticated users can view all submissions
CREATE POLICY "Users can view all price submissions"
ON public.market_price_submissions
FOR SELECT
TO authenticated
USING (true);

-- Policy: Deny anonymous access
CREATE POLICY "Deny anonymous access to market_price_submissions"
ON public.market_price_submissions
FOR SELECT
USING (false);

-- Create index for faster queries by crop and date
CREATE INDEX idx_market_prices_crop_date ON public.market_price_submissions(crop_name, created_at DESC);