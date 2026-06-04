
-- Change buyer_id from integer to uuid to reference auth users
ALTER TABLE public.spare_parts_orders 
  ALTER COLUMN buyer_id TYPE uuid USING NULL,
  ALTER COLUMN buyer_id SET DEFAULT NULL;

-- Enable RLS on spare_parts_orders
ALTER TABLE public.spare_parts_orders ENABLE ROW LEVEL SECURITY;

-- Buyers can view their own orders
CREATE POLICY "Buyers can view own orders"
ON public.spare_parts_orders
FOR SELECT
TO authenticated
USING (buyer_id = auth.uid());

-- Sellers can view orders for their parts
CREATE POLICY "Sellers can view their orders"
ON public.spare_parts_orders
FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM sellers WHERE sellers.id = spare_parts_orders.seller_id AND sellers.user_id = auth.uid()
));

-- Authenticated users can create orders
CREATE POLICY "Users can create orders"
ON public.spare_parts_orders
FOR INSERT
TO authenticated
WITH CHECK (buyer_id = auth.uid());

-- Buyers can update their own orders (for confirm delivery)
CREATE POLICY "Buyers can update own orders"
ON public.spare_parts_orders
FOR UPDATE
TO authenticated
USING (buyer_id = auth.uid());

-- Admins can view all orders
CREATE POLICY "Admins can view all orders"
ON public.spare_parts_orders
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
