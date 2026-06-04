CREATE OR REPLACE FUNCTION public.spare_part_belongs_to_seller(
  _part_id integer,
  _seller_id integer
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.spare_parts sp
    WHERE sp.id = _part_id
      AND sp.seller_id = _seller_id
  );
$$;

DROP POLICY IF EXISTS "Users can create orders" ON public.spare_parts_orders;
DROP POLICY IF EXISTS "Les acheteurs peuvent supprimer leurs commandes" ON public.spare_parts_orders;

CREATE POLICY "Users can create orders safely"
ON public.spare_parts_orders
FOR INSERT
TO authenticated
WITH CHECK (
  buyer_id = auth.uid()
  AND public.spare_part_belongs_to_seller(part_id, seller_id)
);

CREATE POLICY "Buyers can delete pending own orders"
ON public.spare_parts_orders
FOR DELETE
TO authenticated
USING (
  buyer_id = auth.uid()
  AND COALESCE(status, 'pending') = 'pending'
);