-- Add coa_valid_until column to profiles
ALTER TABLE IF EXISTS profiles
  ADD COLUMN IF NOT EXISTS coa_valid_until date;

-- Notify postgrest
NOTIFY pgrst, 'reload schema';
