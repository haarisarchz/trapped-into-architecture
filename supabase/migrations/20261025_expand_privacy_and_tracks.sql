-- Migration: Add COA, Education, and Experience privacy columns to public.profiles

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS hide_coa BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS hide_education BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS hide_experience BOOLEAN DEFAULT FALSE;
