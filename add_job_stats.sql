-- Run this script in Supabase SQL Editor

-- 1. Add save_count column if it doesn't exist
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS save_count INTEGER DEFAULT 0;

-- 2. Add share_count column if it doesn't exist
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS share_count INTEGER DEFAULT 0;

-- 3. Reload schema cache for PostgREST
NOTIFY pgrst, 'reload schema';
