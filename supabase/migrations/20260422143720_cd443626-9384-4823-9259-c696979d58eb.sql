BEGIN;

DROP POLICY IF EXISTS "Authenticated users can read sellers" ON public.sellers;

CREATE OR REPLACE VIEW public.marketplace_sellers_public AS
SELECT
  id,
  store_name,
  commune,
  is_verified
FROM public.sellers;

GRANT SELECT ON public.marketplace_sellers_public TO authenticated;

DROP POLICY IF EXISTS "Marketplace users can view seller directory" ON public.sellers;
CREATE POLICY "Marketplace users can view seller directory"
ON public.sellers
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
TO public
WITH CHECK (
  auth.uid() = id
  AND role = 'owner'::public.app_role
);

UPDATE storage.buckets
SET public = false
WHERE id = 'vehicle-photos';

DROP POLICY IF EXISTS "Vehicle photos publicly accessible" ON storage.objects;

DROP POLICY IF EXISTS "Owners can view own vehicle photos" ON storage.objects;
CREATE POLICY "Owners can view own vehicle photos"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'vehicle-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

COMMIT;