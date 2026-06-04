
-- Add user_id to sellers to link to auth users
ALTER TABLE public.sellers ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- RLS on sellers
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;

-- Anyone can read sellers
CREATE POLICY "Anyone can read sellers" ON public.sellers FOR SELECT USING (true);

-- Authenticated users can insert their own seller profile
CREATE POLICY "Users can insert own seller" ON public.sellers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Sellers can update their own profile
CREATE POLICY "Users can update own seller" ON public.sellers FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Sellers can delete their own profile
CREATE POLICY "Users can delete own seller" ON public.sellers FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- RLS on spare_parts
ALTER TABLE public.spare_parts ENABLE ROW LEVEL SECURITY;

-- Anyone can read spare parts
CREATE POLICY "Anyone can read spare_parts" ON public.spare_parts FOR SELECT USING (true);

-- Sellers can insert their own parts
CREATE POLICY "Sellers can insert parts" ON public.spare_parts FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.sellers WHERE sellers.id = spare_parts.seller_id AND sellers.user_id = auth.uid())
);

-- Sellers can update their own parts
CREATE POLICY "Sellers can update parts" ON public.spare_parts FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.sellers WHERE sellers.id = spare_parts.seller_id AND sellers.user_id = auth.uid())
);

-- Sellers can delete their own parts
CREATE POLICY "Sellers can delete parts" ON public.spare_parts FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.sellers WHERE sellers.id = spare_parts.seller_id AND sellers.user_id = auth.uid())
);
