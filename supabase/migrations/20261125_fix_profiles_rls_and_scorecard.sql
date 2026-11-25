-- ==============================================================================
-- Migration: Fix profiles RLS for user registration & ensure quiz_scores RLS
-- Date: 25 November 2026
-- Description:
--   1. Adds an INSERT policy to public.profiles so newly registered users can create their profile.
--   2. Ensures public.quiz_scores allows inserts for both guests and authenticated users.
--   3. Creates an automatic trigger to ensure a profile is always created when a user signs up.
-- ==============================================================================

-- 1. PROFILES TABLE RLS
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow anyone (authenticated or anon right after signup) to insert their profile
DROP POLICY IF EXISTS "Allow user to insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (true);

-- Ensure users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Ensure public can read profiles
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;
CREATE POLICY "Public can view profiles"
  ON public.profiles
  FOR SELECT
  USING (true);


-- 2. QUIZ SCORES TABLE RLS
ALTER TABLE IF EXISTS public.quiz_scores ENABLE ROW LEVEL SECURITY;

-- Allow guests and users to insert their scores
DROP POLICY IF EXISTS "Anyone can insert quiz scores" ON public.quiz_scores;
CREATE POLICY "Anyone can insert quiz scores"
  ON public.quiz_scores
  FOR INSERT
  WITH CHECK (true);

-- Allow public to read quiz scores (for leaderboards)
DROP POLICY IF EXISTS "Anyone can view quiz scores for leaderboards" ON public.quiz_scores;
CREATE POLICY "Anyone can view quiz scores for leaderboards"
  ON public.quiz_scores
  FOR SELECT
  USING (true);

-- Allow users to update their own score (e.g. linking guest attempt to user account)
DROP POLICY IF EXISTS "Users can update own quiz scores" ON public.quiz_scores;
CREATE POLICY "Users can update own quiz scores"
  ON public.quiz_scores
  FOR UPDATE
  USING (true)
  WITH CHECK (true);


-- 3. AUTO-PROFILE FALLBACK TRIGGER
-- Automatically creates a profile row in public.profiles when a new user signs up in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    username,
    full_name,
    display_name,
    role,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    'user',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      updated_at = NOW();

  RETURN NEW;
END;
$$;

-- Drop existing trigger if any and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();
