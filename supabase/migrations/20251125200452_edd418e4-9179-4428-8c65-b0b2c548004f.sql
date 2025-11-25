-- Ensure storage buckets exist for analysis reports
INSERT INTO storage.buckets (id, name, public)
VALUES ('analysis-media', 'analysis-media', false)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Agronomists can view all media" ON storage.objects;
DROP POLICY IF EXISTS "Farmers can view own media" ON storage.objects;
DROP POLICY IF EXISTS "Farmers can upload own media" ON storage.objects;

-- Allow agronomists to view all media in the analysis-media bucket
CREATE POLICY "Agronomists can view all media"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'analysis-media' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'agronomist'
  )
);

-- Allow farmers to view their own media
CREATE POLICY "Farmers can view own media"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'analysis-media'
  AND EXISTS (
    SELECT 1 FROM public.farms
    WHERE farms.farmer_id = auth.uid()
  )
);

-- Allow farmers to upload media to their own farm folders
CREATE POLICY "Farmers can upload own media"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'analysis-media'
  AND EXISTS (
    SELECT 1 FROM public.farms
    WHERE farms.farmer_id = auth.uid()
  )
);