-- Fix profile_likes RLS policy to match saved_jobs and favorite_companies
-- This ensures likes are permanently stored and readable without strict auth session mismatch

ALTER TABLE public.profile_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own likes" ON public.profile_likes;
DROP POLICY IF EXISTS "Users can insert own like" ON public.profile_likes;
DROP POLICY IF EXISTS "Users can delete own like" ON public.profile_likes;
DROP POLICY IF EXISTS "Allow full access to profile_likes for all" ON public.profile_likes;

CREATE POLICY "Allow full access to profile_likes for all"
ON public.profile_likes FOR ALL
USING (true)
WITH CHECK (true);
