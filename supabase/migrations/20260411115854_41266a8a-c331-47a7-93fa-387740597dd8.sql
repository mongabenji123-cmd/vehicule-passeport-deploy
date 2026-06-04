
-- Add A/B test columns to rapports_pdf
ALTER TABLE public.rapports_pdf
  ADD COLUMN IF NOT EXISTS price_group text,
  ADD COLUMN IF NOT EXISTS payment_method text,
  ADD COLUMN IF NOT EXISTS payment_reference text;

-- Update default prix_usd to null (will be assigned dynamically)
ALTER TABLE public.rapports_pdf ALTER COLUMN prix_usd DROP DEFAULT;
