-- ==========================================================
-- WASL ISLAMIC PLATFORM (منصة وصل الإسلامية)
-- Complete PostgreSQL Database Schema with RLS & Audit Logs
-- ==========================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ROLES & PERMISSIONS
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- 2. USERS & PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  username VARCHAR(100) UNIQUE,
  username_normalized VARCHAR(100) UNIQUE,
  full_name VARCHAR(150),
  email VARCHAR(255),
  password_hash TEXT,
  password_salt TEXT,
  avatar_url TEXT,
  role_id UUID REFERENCES roles(id),
  country VARCHAR(100) DEFAULT 'Saudi Arabia',
  city VARCHAR(100) DEFAULT 'Makkah',
  preferred_reciter VARCHAR(100) DEFAULT 'ar.alafasy',
  prayer_calculation_method VARCHAR(50) DEFAULT 'UmmAlQura',
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. QURAN BOOKMARKS & READING PROGRESS
CREATE TABLE IF NOT EXISTS quran_bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  surah_number INT NOT NULL,
  surah_name_ar VARCHAR(100) NOT NULL,
  ayah_number INT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quran_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  last_surah_number INT NOT NULL DEFAULT 1,
  last_ayah_number INT NOT NULL DEFAULT 1,
  total_verses_read INT DEFAULT 0,
  completed_khatmahs INT DEFAULT 0,
  last_read_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. USER FAVORITES
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  item_type VARCHAR(50) NOT NULL, -- 'quran_ayah', 'hadith', 'azkar', 'dua', 'fatwa', 'article'
  item_id VARCHAR(100) NOT NULL,
  title TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, item_type, item_id)
);

-- 5. AZKAR & CATEGORIES
CREATE TABLE IF NOT EXISTS azkar_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  name_ar VARCHAR(150) NOT NULL,
  description_ar TEXT,
  icon VARCHAR(50),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS azkar (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES azkar_categories(id) ON DELETE CASCADE,
  text_ar TEXT NOT NULL,
  benefit_ar TEXT,
  source_ar VARCHAR(200) NOT NULL,
  repeat_count INT DEFAULT 1,
  audio_url TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. HADITH & CATEGORIES
CREATE TABLE IF NOT EXISTS hadith_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  name_ar VARCHAR(150) NOT NULL,
  description_ar TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hadith (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES hadith_categories(id) ON DELETE SET NULL,
  collection_ar VARCHAR(150) NOT NULL, -- e.g. صحيح البخاري
  book_ar VARCHAR(150),
  hadith_number VARCHAR(50),
  narrator_ar VARCHAR(150),
  text_ar TEXT NOT NULL,
  explanation_ar TEXT,
  grading_ar VARCHAR(50) DEFAULT 'صحيح',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. DUA & CATEGORIES
CREATE TABLE IF NOT EXISTS dua_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  name_ar VARCHAR(150) NOT NULL,
  description_ar TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dua (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES dua_categories(id) ON DELETE CASCADE,
  title_ar VARCHAR(200) NOT NULL,
  text_ar TEXT NOT NULL,
  source_ar VARCHAR(200) NOT NULL,
  benefit_ar TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TAFSIR
CREATE TABLE IF NOT EXISTS tafsir (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  surah_number INT NOT NULL,
  ayah_number INT NOT NULL,
  source_name_ar VARCHAR(150) NOT NULL, -- e.g. التفسير الميسر
  scholar_name_ar VARCHAR(150),
  tafsir_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (surah_number, ayah_number, source_name_ar)
);

-- 9. FATWAS
CREATE TABLE IF NOT EXISTS fatwas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_ar VARCHAR(300) NOT NULL,
  question_ar TEXT NOT NULL,
  answer_ar TEXT NOT NULL,
  scholar_or_body_ar VARCHAR(200) NOT NULL,
  source_reference VARCHAR(300) NOT NULL,
  category_ar VARCHAR(100) NOT NULL,
  views_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. ARTICLES & KNOWLEDGE
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(200) UNIQUE NOT NULL,
  title_ar VARCHAR(300) NOT NULL,
  excerpt_ar TEXT,
  content_ar TEXT NOT NULL,
  author_ar VARCHAR(150) NOT NULL,
  category_ar VARCHAR(100) NOT NULL,
  read_time_minutes INT DEFAULT 5,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. ISLAMIC OCCASIONS / EVENTS
CREATE TABLE IF NOT EXISTS islamic_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_ar VARCHAR(150) NOT NULL,
  hijri_day INT NOT NULL,
  hijri_month INT NOT NULL,
  description_ar TEXT,
  significance_ar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. TASBEEH SESSIONS
CREATE TABLE IF NOT EXISTS tasbeeh_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  dhikr_text_ar VARCHAR(200) NOT NULL,
  count INT NOT NULL DEFAULT 0,
  target_count INT NOT NULL DEFAULT 33,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. NOTIFICATIONS & PREFERENCES
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title_ar VARCHAR(200) NOT NULL,
  message_ar TEXT NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'prayer', 'azkar', 'daily_ayah', 'event'
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  fajr_prayer BOOLEAN DEFAULT TRUE,
  dhuhr_prayer BOOLEAN DEFAULT TRUE,
  asr_prayer BOOLEAN DEFAULT TRUE,
  maghrib_prayer BOOLEAN DEFAULT TRUE,
  isha_prayer BOOLEAN DEFAULT TRUE,
  morning_azkar BOOLEAN DEFAULT TRUE,
  evening_azkar BOOLEAN DEFAULT TRUE,
  daily_hadith BOOLEAN DEFAULT TRUE,
  daily_verse BOOLEAN DEFAULT TRUE,
  islamic_occasions BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. APP SETTINGS & ADMIN AUDIT LOGS
CREATE TABLE IF NOT EXISTS app_settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES profiles(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(100),
  details JSONB DEFAULT '{}'::jsonb,
  ip_address VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ==========================================================
CREATE INDEX IF NOT EXISTS idx_azkar_category ON azkar(category_id);
CREATE INDEX IF NOT EXISTS idx_hadith_category ON hadith(category_id);
CREATE INDEX IF NOT EXISTS idx_dua_category ON dua(category_id);
CREATE INDEX IF NOT EXISTS idx_quran_bookmarks_user ON quran_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id, item_type);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_tasbeeh_user ON tasbeeh_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_tafsir_lookup ON tafsir(surah_number, ayah_number);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE quran_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE quran_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasbeeh_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Public read for educational content
ALTER TABLE azkar_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE azkar ENABLE ROW LEVEL SECURITY;
ALTER TABLE hadith_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE hadith ENABLE ROW LEVEL SECURITY;
ALTER TABLE dua_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE dua ENABLE ROW LEVEL SECURITY;
ALTER TABLE tafsir ENABLE ROW LEVEL SECURITY;
ALTER TABLE fatwas ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE islamic_events ENABLE ROW LEVEL SECURITY;

-- Profiles: users read their own, insert their own
CREATE POLICY "Public content viewable by everyone" ON azkar FOR SELECT USING (true);
CREATE POLICY "Public categories viewable by everyone" ON azkar_categories FOR SELECT USING (true);
CREATE POLICY "Public hadith viewable by everyone" ON hadith FOR SELECT USING (true);
CREATE POLICY "Public dua viewable by everyone" ON dua FOR SELECT USING (true);
CREATE POLICY "Public tafsir viewable by everyone" ON tafsir FOR SELECT USING (true);
CREATE POLICY "Public fatwas viewable by everyone" ON fatwas FOR SELECT USING (true);
CREATE POLICY "Public articles viewable by everyone" ON articles FOR SELECT USING (true);
CREATE POLICY "Public events viewable by everyone" ON islamic_events FOR SELECT USING (true);

-- 15. QURAN RADIO (إذاعة القرآن الكريم)
CREATE TABLE IF NOT EXISTS radio_categories (
  id VARCHAR(100) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  name_ar VARCHAR(150) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description_ar TEXT,
  icon VARCHAR(50),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reciters (
  id VARCHAR(100) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  name_ar VARCHAR(150) NOT NULL,
  name_en VARCHAR(150),
  bio_ar TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS radio_stations (
  id VARCHAR(100) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  stream_url TEXT NOT NULL,
  logo_url TEXT,
  category_id VARCHAR(100) REFERENCES radio_categories(id) ON DELETE SET NULL,
  reciter_id VARCHAR(100) REFERENCES reciters(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  status VARCHAR(30) DEFAULT 'working', -- 'working' (يعمل) | 'stopped' (متوقف) | 'unavailable' (غير متاح)
  bitrate VARCHAR(20) DEFAULT '128kbps',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_radio_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  station_id VARCHAR(100) REFERENCES radio_stations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, station_id)
);

CREATE TABLE IF NOT EXISTS user_radio_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  station_id VARCHAR(100) REFERENCES radio_stations(id) ON DELETE CASCADE,
  played_at TIMESTAMPTZ DEFAULT NOW()
);

-- Radio indexes
CREATE INDEX IF NOT EXISTS idx_radio_stations_category ON radio_stations(category_id);
CREATE INDEX IF NOT EXISTS idx_radio_stations_reciter ON radio_stations(reciter_id);
CREATE INDEX IF NOT EXISTS idx_radio_stations_status ON radio_stations(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_radio_favorites_user ON user_radio_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_radio_history_user ON user_radio_history(user_id, played_at);

-- Radio RLS
ALTER TABLE radio_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE reciters ENABLE ROW LEVEL SECURITY;
ALTER TABLE radio_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_radio_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_radio_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public radio categories viewable by everyone" ON radio_categories;
DROP POLICY IF EXISTS "Public reciters viewable by everyone" ON reciters;
DROP POLICY IF EXISTS "Public radio stations viewable by everyone" ON radio_stations;
DROP POLICY IF EXISTS "Allow all on radio_categories" ON radio_categories;
DROP POLICY IF EXISTS "Allow all on reciters" ON reciters;
DROP POLICY IF EXISTS "Allow all on radio_stations" ON radio_stations;

CREATE POLICY "Allow all on radio_categories" ON radio_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on reciters" ON reciters FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on radio_stations" ON radio_stations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Users can manage own radio favorites" ON user_radio_favorites FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own radio history" ON user_radio_history FOR ALL USING (auth.uid() = user_id);


