-- 1. Add missing direct contact fields
ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS contact_address TEXT;

-- 2. Add missing social/page fields
ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS whatsapp_channel_url TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT;

-- 3. Add logo field
ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Note: 
-- The following existing columns are standardized in the application:
-- contact_email uses existing 'email'
-- contact_phone uses existing 'phone'
-- contact_whatsapp uses existing 'whatsapp'
-- facebook_url uses existing 'facebook'
-- instagram_url uses existing 'instagram'
-- x_twitter_url uses existing 'twitter'
-- linkedin_url uses existing 'linkedin'
-- about_us uses existing 'about_us'
-- history uses existing 'about_history'
-- mission uses existing 'about_mission'
