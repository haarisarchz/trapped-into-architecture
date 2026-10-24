-- Migration: Prevent users from liking their own profiles and purge self-likes

-- 1. Purge any historical self-likes
DELETE FROM public.profile_likes WHERE profile_id = user_id;

-- 2. Recalculate accurate likes_count for all profiles
UPDATE public.profiles p
SET likes_count = (
  SELECT COUNT(*)
  FROM public.profile_likes pl
  WHERE pl.profile_id = p.id
);

-- 3. Enforce constraint to reject self-likes permanently at the database level
ALTER TABLE public.profile_likes
DROP CONSTRAINT IF EXISTS no_self_like;

ALTER TABLE public.profile_likes
ADD CONSTRAINT no_self_like CHECK (profile_id <> user_id);
