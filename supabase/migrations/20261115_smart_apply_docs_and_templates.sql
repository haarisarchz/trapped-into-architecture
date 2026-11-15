-- Migration: Add TI2A Smart Apply documents, tiered validity, and custom auto-compose template

-- 1. Extend profiles with Portfolio, Resume, Document validity, and Custom Template
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS resume_url TEXT,
  ADD COLUMN IF NOT EXISTS resume_name TEXT,
  ADD COLUMN IF NOT EXISTS resume_size INTEGER, -- in bytes
  ADD COLUMN IF NOT EXISTS portfolio_file_url TEXT,
  ADD COLUMN IF NOT EXISTS portfolio_file_name TEXT,
  ADD COLUMN IF NOT EXISTS portfolio_file_size INTEGER, -- in bytes
  ADD COLUMN IF NOT EXISTS docs_uploaded_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS docs_expires_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS custom_mail_subject TEXT,
  ADD COLUMN IF NOT EXISTS custom_mail_body TEXT;

-- 2. Extend profile_experiences to support Experience Certificate uploads
ALTER TABLE public.profile_experiences
  ADD COLUMN IF NOT EXISTS certificate_url TEXT,
  ADD COLUMN IF NOT EXISTS certificate_name TEXT,
  ADD COLUMN IF NOT EXISTS certificate_size INTEGER,
  ADD COLUMN IF NOT EXISTS certificate_uploaded_at TIMESTAMP WITH TIME ZONE;
