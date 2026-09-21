-- Create site_settings table
CREATE TABLE IF NOT EXISTS public.site_settings (
  id TEXT PRIMARY KEY DEFAULT 'global',
  whatsapp TEXT,
  facebook TEXT,
  instagram TEXT,
  linkedin TEXT,
  twitter TEXT,
  phone TEXT,
  email TEXT,
  about_history TEXT,
  about_mission TEXT,
  about_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access on site_settings"
ON public.site_settings
FOR SELECT
USING (true);

-- Allow authenticated/admin write access
-- Note: Replace with your actual admin role check if necessary
CREATE POLICY "Allow admin updates to site_settings"
ON public.site_settings
FOR ALL
USING (true)
WITH CHECK (true);
