DROP POLICY IF EXISTS "Anyone can read sellers" ON public.sellers;

CREATE POLICY "Authenticated users can read sellers"
ON public.sellers
FOR SELECT
TO authenticated
USING (true);