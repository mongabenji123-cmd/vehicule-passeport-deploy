CREATE POLICY "Sellers can update their orders"
ON public.spare_parts_orders
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM sellers
    WHERE sellers.id = spare_parts_orders.seller_id
    AND sellers.user_id = auth.uid()
  )
);