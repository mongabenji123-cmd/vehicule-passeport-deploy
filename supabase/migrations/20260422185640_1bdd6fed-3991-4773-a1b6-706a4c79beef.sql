DROP POLICY IF EXISTS "Garage owners can update own garage" ON public.garages;
CREATE POLICY "Garage owners can update own garage"
ON public.garages
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'garage'::public.app_role)
  AND auth.uid() = user_id
)
WITH CHECK (
  public.has_role(auth.uid(), 'garage'::public.app_role)
  AND auth.uid() = user_id
);

DROP POLICY IF EXISTS profiles_update_policy ON public.profiles;
CREATE POLICY profiles_update_policy
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND public.is_profile_role_unchanged(id, role)
);