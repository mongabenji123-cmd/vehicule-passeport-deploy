CREATE POLICY "Authenticated users can insert garages"
ON public.garages
FOR INSERT
TO authenticated
WITH CHECK (true);