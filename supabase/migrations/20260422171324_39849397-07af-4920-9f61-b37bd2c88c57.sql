DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK ((auth.uid() = id) AND (role = 'owner'::app_role));

DROP POLICY IF EXISTS proprio_rapports ON public.rapports_pdf;
CREATE POLICY proprio_rapports
ON public.rapports_pdf
FOR ALL
TO authenticated
USING (auth.uid() = proprietaire_id)
WITH CHECK (auth.uid() = proprietaire_id);