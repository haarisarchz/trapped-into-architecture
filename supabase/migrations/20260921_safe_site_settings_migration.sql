-- SAFE SCHEMA RECONCILIATION FOR SITE_SETTINGS

-- 1. ADD MISSING COLUMNS SAFELY
ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS contact_address TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_channel_url TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- 2. SECURE THE TABLE WITH ROW LEVEL SECURITY
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 3. RESET SECURITY POLICIES 
-- (Note: Supabase will warn about DROP POLICY. This is perfectly safe as we immediately recreate them below).
DROP POLICY IF EXISTS "Public read access" ON public.site_settings;
DROP POLICY IF EXISTS "Admin update access" ON public.site_settings;
DROP POLICY IF EXISTS "Admin insert access" ON public.site_settings;

-- 4. CREATE NEW STRICT POLICIES
-- Anyone can read the contact info for the public website
CREATE POLICY "Public read access" 
ON public.site_settings FOR SELECT 
TO public 
USING (true);

-- Only valid Admins/CEOs can update the contact info
CREATE POLICY "Admin update access" 
ON public.site_settings FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND lower(replace(profiles.role, ' ', '')) IN ('superadmin', 'ceo')
  )
);

-- Only valid Admins/CEOs can insert new contact info rows
CREATE POLICY "Admin insert access" 
ON public.site_settings FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND lower(replace(profiles.role, ' ', '')) IN ('superadmin', 'ceo')
  )
);

-- 5. RELOAD SUPABASE SCHEMA CACHE
-- This instantly fixes the "Could not find the '...' column in the schema cache" error!
NOTIFY pgrst, 'reload schema';
