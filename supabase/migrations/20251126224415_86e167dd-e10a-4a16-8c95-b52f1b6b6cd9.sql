-- Create storage bucket for chat attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-attachments', 'chat-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for chat attachments
CREATE POLICY "Allow authenticated users to upload chat attachments"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'chat-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow public read access to chat attachments"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'chat-attachments');