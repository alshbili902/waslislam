-- ==============================================================================
-- Wasl Islamic (وصل الإسلامية) - Production Database Schema & RLS Policies
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  preferred_reciter TEXT DEFAULT 'Alafasy_128kbps',
  preferred_theme TEXT DEFAULT 'light',
  quran_font_size INTEGER DEFAULT 24,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Khatmah Plans Table (مخططات الختمة القرآنية)
CREATE TABLE IF NOT EXISTS public.khatmah_plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  target_days INTEGER NOT NULL DEFAULT 30,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  target_end_date DATE NOT NULL,
  current_page INTEGER DEFAULT 1,
  total_pages INTEGER DEFAULT 604,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Reading History & Last Read Marker
CREATE TABLE IF NOT EXISTS public.reading_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  surah_number INTEGER NOT NULL,
  ayah_number INTEGER NOT NULL,
  page_number INTEGER NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Favorites & Bookmarks (المفضلة والإشارات المرجعية)
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('ayah', 'hadith', 'dua', 'dhikr', 'radio', 'article')),
  item_id TEXT NOT NULL,
  item_title TEXT NOT NULL,
  item_payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, item_type, item_id)
);

-- 5. Quran Memorization & Tasmee' (سجل التحفيظ والمراجعة)
CREATE TABLE IF NOT EXISTS public.memorization_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  surah_number INTEGER NOT NULL,
  ayah_from INTEGER NOT NULL,
  ayah_to INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'studying' CHECK (status IN ('studying', 'memorized', 'needs_revision')),
  repetitions_count INTEGER DEFAULT 0,
  last_revised_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. User Personal Reflection Notes (خواطر وتدبرات)
CREATE TABLE IF NOT EXISTS public.user_notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  surah_number INTEGER NOT NULL,
  ayah_number INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.khatmah_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memorization_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notes ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Khatmah Plans Policies
CREATE POLICY "Users can manage their own khatmah plans"
  ON public.khatmah_plans FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Reading History Policies
CREATE POLICY "Users can manage their reading history"
  ON public.reading_history FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Favorites Policies
CREATE POLICY "Users can manage their favorites"
  ON public.favorites FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Memorization Policies
CREATE POLICY "Users can manage their memorization progress"
  ON public.memorization_progress FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- User Notes Policies
CREATE POLICY "Users can manage their notes"
  ON public.user_notes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 7. Daily Goals & Routines (يومي مع وصل)
CREATE TABLE IF NOT EXISTS public.user_daily_goals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  date_key DATE NOT NULL DEFAULT CURRENT_DATE,
  goals_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  completion_percentage INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, date_key)
);

ALTER TABLE public.user_daily_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their daily goals"
  ON public.user_daily_goals FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 8. Personal Library Items (مكتبتي الإسلامية)
CREATE TABLE IF NOT EXISTS public.user_library_items (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  item_type TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  subtitle_ar TEXT,
  body_ar TEXT NOT NULL,
  reference_ar TEXT NOT NULL,
  collection_id TEXT DEFAULT 'tadabbur',
  user_note TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.user_library_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their library items"
  ON public.user_library_items FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 9. Wasl Academy Progress (أكاديمية وصل)
CREATE TABLE IF NOT EXISTS public.user_academy_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  lesson_id TEXT NOT NULL,
  track_id TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT TRUE,
  quiz_score INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE public.user_academy_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their academy progress"
  ON public.user_academy_progress FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 10. User Reminders Preferences (التذكيرات الذكية)
CREATE TABLE IF NOT EXISTS public.user_reminders_settings (
  user_id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.user_reminders_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their reminders settings"
  ON public.user_reminders_settings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 11. Guided Learning Paths Progress (المسارات التعليمية الموجهة)
CREATE TABLE IF NOT EXISTS public.user_learning_paths_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  path_id TEXT NOT NULL,
  current_step_id TEXT,
  completed_step_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  reflection_notes JSONB NOT NULL DEFAULT '{}'::jsonb,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, path_id)
);

ALTER TABLE public.user_learning_paths_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their learning path progress"
  ON public.user_learning_paths_progress FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_learning_paths_user ON public.user_learning_paths_progress(user_id);

-- 12. Accessibility Preferences (إعدادات سهولة الاستخدام وكبار السن)
CREATE TABLE IF NOT EXISTS public.accessibility_preferences (
  user_id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  senior_mode BOOLEAN NOT NULL DEFAULT FALSE,
  font_scale NUMERIC(3,2) NOT NULL DEFAULT 1.0,
  high_contrast BOOLEAN NOT NULL DEFAULT FALSE,
  reduced_motion BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.accessibility_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their accessibility preferences"
  ON public.accessibility_preferences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 13. Thematic Topic Bookmarks (إشارات الفهرس الموضوعي)
CREATE TABLE IF NOT EXISTS public.thematic_topic_bookmarks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  topic_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, topic_id)
);

ALTER TABLE public.thematic_topic_bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their thematic bookmarks"
  ON public.thematic_topic_bookmarks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_thematic_bookmarks_user ON public.thematic_topic_bookmarks(user_id);

-- 14. Similar Ayahs Study Notes (ملاحظات تدبر المتشابهات اللفظية)
CREATE TABLE IF NOT EXISTS public.similar_ayah_notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  ayah_key TEXT NOT NULL,
  comparison_key TEXT NOT NULL,
  personal_note TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.similar_ayah_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their similar ayah notes"
  ON public.similar_ayah_notes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_similar_notes_user_key ON public.similar_ayah_notes(user_id, ayah_key);


