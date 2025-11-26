-- Create a table to track when users have contacted agronomists
CREATE TABLE IF NOT EXISTS public.agronomist_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  farm_id UUID NOT NULL,
  contacted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agronomist_contacts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own contacts" 
ON public.agronomist_contacts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own contacts" 
ON public.agronomist_contacts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);