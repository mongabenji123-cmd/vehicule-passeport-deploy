DROP POLICY IF EXISTS "Users can update their own intervention docs" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own intervention docs" ON storage.objects;
DROP POLICY IF EXISTS owner_manage_photos ON storage.objects;

CREATE POLICY owner_manage_photos
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'vehicle-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'vehicle-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Owners can delete own vehicle photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'vehicle-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);