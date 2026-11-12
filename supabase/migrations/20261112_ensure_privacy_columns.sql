-- Migration: Add missing privacy columns to profiles table safely
ALTER TABLE IF EXISTS profiles
  ADD COLUMN IF NOT EXISTS hide_coa boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS hide_experience boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS hide_education boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS display_profile_publicly boolean DEFAULT false;

-- Notify postgrest to reload schema cache
NOTIFY pgrst, 'reload schema';
