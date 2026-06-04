DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND public.is_profile_role_unchanged(id, role)
);

CREATE OR REPLACE FUNCTION public.prevent_profile_role_change()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'Role changes are not allowed';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_profile_role_change_on_profiles ON public.profiles;
CREATE TRIGGER prevent_profile_role_change_on_profiles
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_profile_role_change();

DROP POLICY IF EXISTS garages_public_read_restricted ON public.garages;
CREATE POLICY garages_public_read_restricted
ON public.garages
FOR SELECT
TO authenticated
USING (true);

DROP VIEW IF EXISTS public.garages_public_directory;
CREATE VIEW public.garages_public_directory
WITH (security_invoker = true) AS
SELECT
  id,
  nom_garage,
  commune,
  adresse_complete,
  est_certifie,
  specialites,
  nombre_avis,
  note_moyenne,
  latitude,
  longitude,
  created_at
FROM public.garages
WHERE est_certifie IS TRUE;