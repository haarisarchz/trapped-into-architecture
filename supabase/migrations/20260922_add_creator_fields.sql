-- Add author tracking to jobs
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES profiles(id);

-- Add creator and visibility tracking to companies
ALTER TABLE companies ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT false;

-- Add earnings configuration
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS rupees_per_post NUMERIC DEFAULT 10;
