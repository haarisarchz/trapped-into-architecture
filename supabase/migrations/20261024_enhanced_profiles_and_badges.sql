-- 20261024_enhanced_profiles_and_badges.sql
-- Migration: Add enhanced profile fields, separate education, experiences, badges, and likes

-- 1. ADD NEW COLUMNS TO public.profiles SAFELY (Preserving all existing data)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS tagline TEXT,
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS coa_number TEXT,
  ADD COLUMN IF NOT EXISTS coa_registration_date DATE,
  ADD COLUMN IF NOT EXISTS coa_is_active BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS highest_qualification TEXT,
  ADD COLUMN IF NOT EXISTS user_track TEXT DEFAULT 'job_seeker', -- 'job_seeker' or 'recruiter'
  ADD COLUMN IF NOT EXISTS badge_tier TEXT DEFAULT 'bronze',     -- 'bronze', 'silver', 'gold', 'platinum', 'diamond'
  ADD COLUMN IF NOT EXISTS is_vip BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS completion_percentage INTEGER DEFAULT 20,
  ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;

-- 2. CREATE TABLE: profile_educations
-- Separates University Name vs. College Name for Higher Ed, and School Board vs. School Name for High School
CREATE TABLE IF NOT EXISTS public.profile_educations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  level TEXT NOT NULL, -- 'high_school', 'diploma', 'ug', 'pg', 'phd'
  degree_name TEXT,
  university_name TEXT,    -- Separate University Name
  college_name TEXT,       -- Separate College / Institution Name
  school_board TEXT,       -- Separate School Board (CBSE, ICSE, State Board, etc.)
  school_name TEXT,        -- Separate School Name
  city TEXT,
  country TEXT DEFAULT 'India',
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE,
  score_or_percentage TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast user queries
CREATE INDEX IF NOT EXISTS idx_profile_educations_user_id ON public.profile_educations(user_id);

-- 3. CREATE TABLE: profile_experiences
CREATE TABLE IF NOT EXISTS public.profile_experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  firm_name TEXT NOT NULL,
  organization_type TEXT, -- 'Architecture Firm', 'Academic Institution', 'Builder/Developer', 'Interior Design Studio', 'Urban Planning', 'Other'
  position TEXT NOT NULL,
  role_description TEXT,
  city TEXT,
  country TEXT DEFAULT 'India',
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profile_experiences_user_id ON public.profile_experiences(user_id);

-- 4. CREATE TABLE: profile_likes
-- Securely records who liked whom while keeping individual likers private from the front-end
CREATE TABLE IF NOT EXISTS public.profile_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(profile_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_profile_likes_profile_id ON public.profile_likes(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_likes_user_id ON public.profile_likes(user_id);

-- 5. TRIGGER: Sync likes_count automatically on profiles
CREATE OR REPLACE FUNCTION public.handle_profile_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles
    SET likes_count = COALESCE(likes_count, 0) + 1
    WHERE id = NEW.profile_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles
    SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0)
    WHERE id = OLD.profile_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_handle_profile_like_count ON public.profile_likes;
CREATE TRIGGER trigger_handle_profile_like_count
AFTER INSERT OR DELETE ON public.profile_likes
FOR EACH ROW EXECUTE FUNCTION public.handle_profile_like_count();

-- 6. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profile_educations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_likes ENABLE ROW LEVEL SECURITY;

-- Educations: Anyone can view on public profiles; owners can manage
CREATE POLICY "Public read profile_educations"
  ON public.profile_educations FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own education"
  ON public.profile_educations FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Experiences: Anyone can view on public profiles; owners can manage
CREATE POLICY "Public read profile_experiences"
  ON public.profile_experiences FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own experience"
  ON public.profile_experiences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Likes: Users can check if they themselves liked a profile, and insert/delete their own like
CREATE POLICY "Users can read own likes"
  ON public.profile_likes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own like"
  ON public.profile_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own like"
  ON public.profile_likes FOR DELETE
  USING (auth.uid() = user_id);
