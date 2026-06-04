CREATE OR REPLACE FUNCTION public.spare_parts_order_identity_matches(
  _order_id integer,
  _buyer_id uuid,
  _seller_id integer,
  _part_id integer
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.spare_parts_orders spo
    WHERE spo.id = _order_id
      AND spo.buyer_id = _buyer_id
      AND spo.seller_id = _seller_id
      AND spo.part_id = _part_id
  );
$$;

DROP POLICY IF EXISTS "Acheteurs peuvent modifier leurs commandes avec restrictions" ON public.spare_parts_orders;
DROP POLICY IF EXISTS "Buyers can update own orders" ON public.spare_parts_orders;
DROP POLICY IF EXISTS "Sellers can update their orders" ON public.spare_parts_orders;

CREATE POLICY "Buyers can update own orders safely"
ON public.spare_parts_orders
FOR UPDATE
TO authenticated
USING (buyer_id = auth.uid())
WITH CHECK (
  buyer_id = auth.uid()
  AND public.spare_parts_order_identity_matches(id, buyer_id, seller_id, part_id)
);

CREATE POLICY "Sellers can update their orders safely"
ON public.spare_parts_orders
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.sellers s
    WHERE s.id = spare_parts_orders.seller_id
      AND s.user_id = auth.uid()
  )
)
WITH CHECK (
  public.spare_parts_order_identity_matches(id, buyer_id, seller_id, part_id)
  AND EXISTS (
    SELECT 1
    FROM public.sellers s
    WHERE s.id = spare_parts_orders.seller_id
      AND s.user_id = auth.uid()
  )
);