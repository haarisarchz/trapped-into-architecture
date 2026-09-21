-- Complete schema reconciliation and RLS setup for site_settings

-- 1. Ensure all missing columns exist
ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS contact_address TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_channel_url TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "Public read access" ON public.site_settings;
DROP POLICY IF EXISTS "Admin update access" ON public.site_settings;
DROP POLICY IF EXISTS "Admin insert access" ON public.site_settings;

-- 4. Create RLS Policies
-- Public can read
CREATE POLICY "Public read access" 
ON public.site_settings FOR SELECT 
TO public 
USING (true);

-- Only authorized roles (ceo, superadmin) can update
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

-- Only authorized roles (ceo, superadmin) can insert
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

-- 5. Invalidate Supabase's internal schema cache so the PostgREST API immediately recognizes the new columns.
-- This strictly prevents the "Could not find the '...' column in the schema cache" error!
NOTIFY pgrst, 'reload schema';
