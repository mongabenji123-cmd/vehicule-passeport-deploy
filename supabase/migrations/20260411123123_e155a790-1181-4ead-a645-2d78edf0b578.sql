CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, onboarding_completed)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Utilisateur'),
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'owner'),
    CASE WHEN COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'owner') = 'owner' THEN false ELSE true END
  );
  RETURN NEW;
END;
$function$;