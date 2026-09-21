-- Add telegram_channel_url to site_settings
ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS telegram_channel_url TEXT;

NOTIFY pgrst, 'reload schema';
