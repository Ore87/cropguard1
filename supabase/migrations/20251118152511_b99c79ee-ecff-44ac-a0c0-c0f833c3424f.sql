-- Create storage bucket for crop scan images
INSERT INTO storage.buckets (id, name, public)
VALUES ('crop-scans', 'crop-scans', true);

-- Create policies for crop-scans bucket
CREATE POLICY "Users can upload their own scan images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'crop-scans' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Scan images are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'crop-scans');

CREATE POLICY "Users can update their own scan images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'crop-scans' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete their own scan images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'crop-scans' AND
  auth.uid() IS NOT NULL
);