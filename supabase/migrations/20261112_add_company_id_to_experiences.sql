-- Add company_id and institution_id to profile_experiences
ALTER TABLE IF EXISTS profile_experiences
  ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES companies(id),
  ADD COLUMN IF NOT EXISTS institution_id uuid REFERENCES institutions(id);

-- Notify postgrest
NOTIFY pgrst, 'reload schema';
