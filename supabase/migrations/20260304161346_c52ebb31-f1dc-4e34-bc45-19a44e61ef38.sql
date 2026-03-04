ALTER TABLE public.properties 
  ADD COLUMN title_deed_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN taxes_paid_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN physical_inspection_done boolean NOT NULL DEFAULT false;