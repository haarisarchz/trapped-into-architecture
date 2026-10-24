-- 🏛️ Architecture Quizzes Schema Migration
-- Migration: 20261024_create_quizzes_tables.sql

-- 1. Quizzes Table
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'Architects',
  cover_image TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Quiz Questions Table
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 1,
  question_type TEXT NOT NULL DEFAULT 'choose', -- 'choose' or 'fill_up'
  question_text TEXT NOT NULL,
  media_type TEXT DEFAULT 'none',              -- 'image' or 'none'
  media_url TEXT,
  options JSONB DEFAULT '[]'::jsonb,           -- e.g. ["B.V. Doshi", "Charles Correa", ...]
  correct_answer TEXT NOT NULL,
  accepted_aliases JSONB DEFAULT '[]'::jsonb,  -- acceptable alternative spellings for fill-ups
  explanation_clue TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Quiz Scores & Leaderboards Table
CREATE TABLE IF NOT EXISTS quiz_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_session_id TEXT,
  display_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  difficulty TEXT NOT NULL DEFAULT 'medium',   -- 'easy', 'medium', 'hard'
  time_taken_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Add Gamified XP to Profiles (if profiles table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_quiz_xp INTEGER DEFAULT 0;
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS weekly_quiz_xp INTEGER DEFAULT 0;
  END IF;
END $$;

-- 5. Fast Query Indexes
CREATE INDEX IF NOT EXISTS idx_quizzes_slug ON quizzes(slug);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions(quiz_id, order_index);
CREATE INDEX IF NOT EXISTS idx_quiz_scores_quiz_points ON quiz_scores(quiz_id, points DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_scores_weekly ON quiz_scores(created_at DESC, points DESC);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_scores ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies
-- Quizzes: Everyone can read published quizzes; authenticated users can manage
DO $$
BEGIN
  DROP POLICY IF EXISTS "Public can view published quizzes" ON quizzes;
  CREATE POLICY "Public can view published quizzes" ON quizzes FOR SELECT USING (true);

  DROP POLICY IF EXISTS "Admins can manage quizzes" ON quizzes;
  CREATE POLICY "Admins can manage quizzes" ON quizzes FOR ALL USING (true);
END $$;

-- Questions: Everyone can read questions for published quizzes
DO $$
BEGIN
  DROP POLICY IF EXISTS "Public can view quiz questions" ON quiz_questions;
  CREATE POLICY "Public can view quiz questions" ON quiz_questions FOR SELECT USING (true);

  DROP POLICY IF EXISTS "Admins can manage quiz questions" ON quiz_questions;
  CREATE POLICY "Admins can manage quiz questions" ON quiz_questions FOR ALL USING (true);
END $$;

-- Scores: Everyone (including guests) can insert scores & view leaderboards
DO $$
BEGIN
  DROP POLICY IF EXISTS "Anyone can insert quiz scores" ON quiz_scores;
  CREATE POLICY "Anyone can insert quiz scores" ON quiz_scores FOR INSERT WITH CHECK (true);

  DROP POLICY IF EXISTS "Anyone can view quiz scores for leaderboards" ON quiz_scores;
  CREATE POLICY "Anyone can view quiz scores for leaderboards" ON quiz_scores FOR SELECT USING (true);
END $$;
