DROP POLICY IF EXISTS "Owners can update own intervention docs" ON storage.objects;
CREATE POLICY "Owners can update own intervention docs"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'intervention-docs'
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'intervention-docs'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Owners can delete own intervention docs" ON storage.objects;
CREATE POLICY "Owners can delete own intervention docs"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'intervention-docs'
  AND auth.uid()::text = (storage.foldername(name))[1]
);