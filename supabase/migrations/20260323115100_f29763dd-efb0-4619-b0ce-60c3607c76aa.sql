
-- Allow admins to update garages (for certification)
CREATE POLICY "Admins can update garages"
ON public.garages
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete garages (for rejection)
CREATE POLICY "Admins can delete garages"
ON public.garages
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
