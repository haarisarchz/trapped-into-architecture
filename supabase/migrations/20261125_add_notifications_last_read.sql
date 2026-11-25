-- Migration: Add notifications_last_read to profiles for cross-device notification sync
-- Allows read notifications on mobile to immediately sync with desktop and vice versa

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS notifications_last_read TIMESTAMP WITH TIME ZONE;
