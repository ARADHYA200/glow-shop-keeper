-- Remove phone column from orders table since it duplicates profile data and poses security risk
ALTER TABLE public.orders DROP COLUMN IF EXISTS phone;