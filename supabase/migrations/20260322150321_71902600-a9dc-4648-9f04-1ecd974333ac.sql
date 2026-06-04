
-- Create roles enum
CREATE TYPE public.app_role AS ENUM ('owner', 'garage', 'admin');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  role app_role NOT NULL DEFAULT 'owner',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Utilisateur'),
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'owner')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Vehicles table
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  marque TEXT NOT NULL,
  modele TEXT NOT NULL,
  annee SMALLINT CHECK (annee BETWEEN 1900 AND 2030),
  immatriculation TEXT NOT NULL,
  vin TEXT CHECK (length(vin) = 17),
  kilometrage_actuel INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view own vehicles" ON public.vehicles FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Owners can insert own vehicles" ON public.vehicles FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update own vehicles" ON public.vehicles FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Owners can delete own vehicles" ON public.vehicles FOR DELETE USING (auth.uid() = owner_id);
CREATE POLICY "Admins can view all vehicles" ON public.vehicles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON public.vehicles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Garages table
CREATE TABLE public.garages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  adresse TEXT,
  ville TEXT,
  telephone TEXT,
  lat NUMERIC(9,6),
  lng NUMERIC(9,6),
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.garages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Verified garages visible to all" ON public.garages FOR SELECT USING (verified = TRUE);
CREATE POLICY "Garage owners can view own" ON public.garages FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Garage owners can insert" ON public.garages FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Garage owners can update own" ON public.garages FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Admins can view all garages" ON public.garages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update garages" ON public.garages FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE TRIGGER update_garages_updated_at BEFORE UPDATE ON public.garages
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Interventions table
CREATE TABLE public.interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  garage_id UUID REFERENCES public.garages(id) ON DELETE SET NULL,
  type_intervention TEXT NOT NULL,
  description TEXT,
  kilometrage INTEGER,
  cout NUMERIC(10,2),
  date_intervention DATE NOT NULL DEFAULT CURRENT_DATE,
  photos_urls TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.interventions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vehicle owners can view interventions" ON public.interventions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.vehicles WHERE vehicles.id = vehicle_id AND vehicles.owner_id = auth.uid())
);
CREATE POLICY "Garage owners can view own interventions" ON public.interventions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.garages WHERE garages.id = garage_id AND garages.owner_id = auth.uid())
);
CREATE POLICY "Garage owners can insert interventions" ON public.interventions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.garages WHERE garages.id = garage_id AND garages.owner_id = auth.uid())
);
CREATE POLICY "Vehicle owners can insert interventions" ON public.interventions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.vehicles WHERE vehicles.id = vehicle_id AND vehicles.owner_id = auth.uid())
);
CREATE POLICY "Admins can view all interventions" ON public.interventions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE TRIGGER update_interventions_updated_at BEFORE UPDATE ON public.interventions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Alerts table
CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('vidange', 'controle_technique', 'assurance')),
  kilometrage_seuil INTEGER,
  date_seuil DATE,
  is_resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vehicle owners can view alerts" ON public.alerts FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.vehicles WHERE vehicles.id = vehicle_id AND vehicles.owner_id = auth.uid())
);
CREATE POLICY "Vehicle owners can insert alerts" ON public.alerts FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.vehicles WHERE vehicles.id = vehicle_id AND vehicles.owner_id = auth.uid())
);
CREATE POLICY "Vehicle owners can update alerts" ON public.alerts FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.vehicles WHERE vehicles.id = vehicle_id AND vehicles.owner_id = auth.uid())
);
CREATE POLICY "Admins can view all alerts" ON public.alerts FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON public.alerts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('vehicle-photos', 'vehicle-photos', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('intervention-docs', 'intervention-docs', false);

CREATE POLICY "Vehicle photos publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'vehicle-photos');
CREATE POLICY "Owners can upload vehicle photos" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'vehicle-photos' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Owners can view own intervention docs" ON storage.objects FOR SELECT USING (
  bucket_id = 'intervention-docs' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Owners can upload intervention docs" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'intervention-docs' AND auth.uid()::text = (storage.foldername(name))[1]
);
