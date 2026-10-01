-- 020_create_khatmah_and_hifz.sql
-- Complete Supabase tables for Al-Khatmah & Hifz Recitation System

-- 1. Khatmah Plans Table
CREATE TABLE IF NOT EXISTS khatmah_plans (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  preset_type TEXT NOT NULL DEFAULT '30_days',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  target_date DATE NOT NULL,
  duration_days INTEGER NOT NULL DEFAULT 30,
  current_page INTEGER NOT NULL DEFAULT 1,
  completed_pages INTEGER NOT NULL DEFAULT 0,
  daily_pages_target INTEGER NOT NULL DEFAULT 20,
  status TEXT NOT NULL DEFAULT 'active', -- active, completed, paused
  reading_streak_days INTEGER NOT NULL DEFAULT 1,
  last_read_date DATE,
  last_surah_number INTEGER DEFAULT 1,
  last_surah_name_ar TEXT DEFAULT 'الفاتحة',
  last_ayah_number INTEGER DEFAULT 1,
  completed_page_numbers INTEGER[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Hifz Progress Table (per surah)
CREATE TABLE IF NOT EXISTS hifz_progress (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  surah_number INTEGER NOT NULL,
  surah_name_ar TEXT NOT NULL,
  start_ayah INTEGER NOT NULL DEFAULT 1,
  end_ayah INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_progress', -- memorized, in_progress, needs_review
  progress_percentage INTEGER NOT NULL DEFAULT 0,
  total_sessions INTEGER NOT NULL DEFAULT 0,
  average_accuracy INTEGER NOT NULL DEFAULT 0,
  weak_ayahs INTEGER[] DEFAULT '{}',
  last_reviewed_at DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, surah_number)
);

-- 3. Hifz Recitation Sessions Table
CREATE TABLE IF NOT EXISTS hifz_sessions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  surah_number INTEGER NOT NULL,
  surah_name_ar TEXT NOT NULL,
  start_ayah INTEGER NOT NULL DEFAULT 1,
  end_ayah INTEGER NOT NULL,
  mode TEXT NOT NULL DEFAULT 'recite_text_visible', -- read_with_text, recite_text_visible, recite_text_hidden
  accuracy INTEGER NOT NULL DEFAULT 100,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  total_ayahs INTEGER NOT NULL DEFAULT 1,
  total_words INTEGER NOT NULL DEFAULT 0,
  correct_words_count INTEGER NOT NULL DEFAULT 0,
  incorrect_words_count INTEGER NOT NULL DEFAULT 0,
  missing_words_count INTEGER NOT NULL DEFAULT 0,
  extra_words_count INTEGER NOT NULL DEFAULT 0,
  weak_ayahs INTEGER[] DEFAULT '{}',
  ayah_results JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Hifz Errors Log Table
CREATE TABLE IF NOT EXISTS hifz_errors (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT REFERENCES hifz_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  surah_number INTEGER NOT NULL,
  ayah_number INTEGER NOT NULL,
  word_index INTEGER NOT NULL,
  expected_word TEXT NOT NULL,
  recognized_word TEXT,
  error_type TEXT NOT NULL, -- deletion, insertion, substitution, repetition, unclear, long_pause
  confidence NUMERIC(4,2) DEFAULT 0.85,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create Indexes for High Performance
CREATE INDEX IF NOT EXISTS idx_khatmah_plans_user_status ON khatmah_plans(user_id, status);
CREATE INDEX IF NOT EXISTS idx_hifz_progress_user ON hifz_progress(user_id, surah_number);
CREATE INDEX IF NOT EXISTS idx_hifz_sessions_user_date ON hifz_sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hifz_errors_session ON hifz_errors(session_id);

-- Enable Row Level Security (RLS)
ALTER TABLE khatmah_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE hifz_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE hifz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE hifz_errors ENABLE ROW LEVEL SECURITY;

-- RLS Policies: khatmah_plans
DROP POLICY IF EXISTS "Users can view own khatmah_plans" ON khatmah_plans;
DROP POLICY IF EXISTS "Users can insert own khatmah_plans" ON khatmah_plans;
DROP POLICY IF EXISTS "Users can update own khatmah_plans" ON khatmah_plans;
DROP POLICY IF EXISTS "Users can delete own khatmah_plans" ON khatmah_plans;
CREATE POLICY "Users can view own khatmah_plans" ON khatmah_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own khatmah_plans" ON khatmah_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own khatmah_plans" ON khatmah_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own khatmah_plans" ON khatmah_plans FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies: hifz_progress
DROP POLICY IF EXISTS "Users can view own hifz_progress" ON hifz_progress;
DROP POLICY IF EXISTS "Users can insert own hifz_progress" ON hifz_progress;
DROP POLICY IF EXISTS "Users can update own hifz_progress" ON hifz_progress;
DROP POLICY IF EXISTS "Users can delete own hifz_progress" ON hifz_progress;
CREATE POLICY "Users can view own hifz_progress" ON hifz_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own hifz_progress" ON hifz_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own hifz_progress" ON hifz_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own hifz_progress" ON hifz_progress FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies: hifz_sessions
DROP POLICY IF EXISTS "Users can view own hifz_sessions" ON hifz_sessions;
DROP POLICY IF EXISTS "Users can insert own hifz_sessions" ON hifz_sessions;
DROP POLICY IF EXISTS "Users can delete own hifz_sessions" ON hifz_sessions;
CREATE POLICY "Users can view own hifz_sessions" ON hifz_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own hifz_sessions" ON hifz_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own hifz_sessions" ON hifz_sessions FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies: hifz_errors
DROP POLICY IF EXISTS "Users can view own hifz_errors" ON hifz_errors;
DROP POLICY IF EXISTS "Users can insert own hifz_errors" ON hifz_errors;
CREATE POLICY "Users can view own hifz_errors" ON hifz_errors FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own hifz_errors" ON hifz_errors FOR INSERT WITH CHECK (auth.uid() = user_id);
