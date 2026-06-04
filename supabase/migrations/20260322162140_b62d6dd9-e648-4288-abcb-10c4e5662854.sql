
-- Create a security definer function to check roles without recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _user_id
      AND role = _role
  )
$$;

-- Fix profiles: replace recursive admin policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Fix garages: replace recursive admin policy
DROP POLICY IF EXISTS "Admins can view all garages" ON public.garages;
CREATE POLICY "Admins can view all garages"
  ON public.garages FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update garages" ON public.garages;
CREATE POLICY "Admins can update garages"
  ON public.garages FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Fix interventions: replace recursive admin policy
DROP POLICY IF EXISTS "Admins can view all interventions" ON public.interventions;
CREATE POLICY "Admins can view all interventions"
  ON public.interventions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Fix alerts: replace recursive admin policy
DROP POLICY IF EXISTS "Admins can view all alerts" ON public.alerts;
CREATE POLICY "Admins can view all alerts"
  ON public.alerts FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Fix vehicles: replace recursive admin policy
DROP POLICY IF EXISTS "Admins can view all vehicles" ON public.vehicles;
CREATE POLICY "Admins can view all vehicles"
  ON public.vehicles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
