ALTER TABLE public.garages
ADD COLUMN IF NOT EXISTS user_id uuid;

CREATE UNIQUE INDEX IF NOT EXISTS garages_user_id_unique_idx
ON public.garages (user_id)
WHERE user_id IS NOT NULL;

DROP POLICY IF EXISTS "Authenticated users can insert garages" ON public.garages;
CREATE POLICY "Garage users can insert own garage"
ON public.garages
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'garage'::app_role)
  AND user_id = auth.uid()
);

DROP POLICY IF EXISTS "garage_insert_interventions" ON public.interventions;
DROP POLICY IF EXISTS "garage_update_interventions" ON public.interventions;
DROP POLICY IF EXISTS "Garage users can insert interventions" ON public.interventions;
DROP POLICY IF EXISTS "Garage users can update interventions" ON public.interventions;

CREATE POLICY "Garage owners can insert interventions"
ON public.interventions
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'garage'::app_role)
  AND garage_id IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM public.garages g
    WHERE g.id = interventions.garage_id
      AND g.user_id = auth.uid()
  )
);

CREATE POLICY "Garage owners can update interventions"
ON public.interventions
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'garage'::app_role)
  AND garage_id IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM public.garages g
    WHERE g.id = interventions.garage_id
      AND g.user_id = auth.uid()
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'garage'::app_role)
  AND garage_id IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM public.garages g
    WHERE g.id = interventions.garage_id
      AND g.user_id = auth.uid()
  )
);