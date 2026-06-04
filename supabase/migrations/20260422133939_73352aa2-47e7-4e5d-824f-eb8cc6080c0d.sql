DROP POLICY IF EXISTS "garage_insert_interventions" ON public.interventions;
DROP POLICY IF EXISTS "garage_update_interventions" ON public.interventions;

CREATE POLICY "Garage users can insert interventions"
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
  )
);

CREATE POLICY "Garage users can update interventions"
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
  )
)
WITH CHECK (
  public.has_role(auth.uid(), 'garage'::app_role)
  AND garage_id IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM public.garages g
    WHERE g.id = interventions.garage_id
  )
);