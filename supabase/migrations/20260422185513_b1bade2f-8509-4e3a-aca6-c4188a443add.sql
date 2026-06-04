DROP POLICY IF EXISTS garages_select_policy ON public.garages;
DROP POLICY IF EXISTS garages_public_read_restricted ON public.garages;
DROP POLICY IF EXISTS "Garage owners can view own garage" ON public.garages;
DROP POLICY IF EXISTS "Admins can view all garages" ON public.garages;

CREATE POLICY "Garage owners can view own garage"
ON public.garages
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all garages"
ON public.garages
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS profiles_update_policy ON public.profiles;
CREATE POLICY profiles_update_policy
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

DROP TRIGGER IF EXISTS prevent_profile_role_change_trigger ON public.profiles;
CREATE TRIGGER prevent_profile_role_change_trigger
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_profile_role_change();