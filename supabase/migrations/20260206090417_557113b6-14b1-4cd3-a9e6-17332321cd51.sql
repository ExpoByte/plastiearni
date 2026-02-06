-- Add photo_url column to collections table
ALTER TABLE public.collections ADD COLUMN photo_url TEXT;

-- Create storage bucket for collection photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('collection-photos', 'collection-photos', true);

-- Allow authenticated users to upload their own photos
CREATE POLICY "Users can upload collection photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'collection-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow anyone to view collection photos (public bucket)
CREATE POLICY "Anyone can view collection photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'collection-photos');

-- Allow users to update their own photos
CREATE POLICY "Users can update their collection photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'collection-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own photos
CREATE POLICY "Users can delete their collection photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'collection-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);