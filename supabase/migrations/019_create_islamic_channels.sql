-- 019_create_islamic_channels.sql
-- Complete schema for Islamic Channels & Live Streaming

-- 1. Create channel_categories table
CREATE TABLE IF NOT EXISTS channel_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(50) DEFAULT 'Tv',
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create channels table
CREATE TABLE IF NOT EXISTS channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  stream_url TEXT NOT NULL,
  stream_type VARCHAR(50) NOT NULL DEFAULT 'hls', -- 'hls', 'm3u', 'unknown'
  playlist_url TEXT,
  category_id UUID REFERENCES channel_categories(id) ON DELETE SET NULL,
  country VARCHAR(100) DEFAULT 'SA',
  language VARCHAR(50) DEFAULT 'ar',
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  source_name VARCHAR(255),
  source_url TEXT,
  license_note TEXT,
  rights_status VARCHAR(100) DEFAULT 'public_broadcast',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create user_channel_favorites table
CREATE TABLE IF NOT EXISTS user_channel_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, channel_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_channels_category ON channels(category_id);
CREATE INDEX IF NOT EXISTS idx_channels_active ON channels(is_active);
CREATE INDEX IF NOT EXISTS idx_channels_featured ON channels(is_featured);
CREATE INDEX IF NOT EXISTS idx_channels_sort_order ON channels(sort_order ASC);
CREATE INDEX IF NOT EXISTS idx_channel_categories_sort ON channel_categories(sort_order ASC);
CREATE INDEX IF NOT EXISTS idx_user_channel_favorites_user ON user_channel_favorites(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE channel_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_channel_favorites ENABLE ROW LEVEL SECURITY;

-- Category Policies
DROP POLICY IF EXISTS "Public can view active channel categories" ON channel_categories;
CREATE POLICY "Public can view active channel categories"
  ON channel_categories FOR SELECT
  USING (is_active = TRUE);

DROP POLICY IF EXISTS "Admins full access to channel categories" ON channel_categories;
CREATE POLICY "Admins full access to channel categories"
  ON channel_categories FOR ALL
  USING (auth.role() = 'service_role' OR auth.jwt() ->> 'role' = 'super_admin');

-- Channels Policies
DROP POLICY IF EXISTS "Public can view active channels" ON channels;
CREATE POLICY "Public can view active channels"
  ON channels FOR SELECT
  USING (is_active = TRUE);

DROP POLICY IF EXISTS "Admins full access to channels" ON channels;
CREATE POLICY "Admins full access to channels"
  ON channels FOR ALL
  USING (auth.role() = 'service_role' OR auth.jwt() ->> 'role' = 'super_admin');

-- Favorites Policies
DROP POLICY IF EXISTS "Users can view own channel favorites" ON user_channel_favorites;
CREATE POLICY "Users can view own channel favorites"
  ON user_channel_favorites FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own channel favorites" ON user_channel_favorites;
CREATE POLICY "Users can insert own channel favorites"
  ON user_channel_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own channel favorites" ON user_channel_favorites;
CREATE POLICY "Users can delete own channel favorites"
  ON user_channel_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Insert Default Standard Categories if not existing
INSERT INTO channel_categories (name, slug, description, icon, sort_order)
VALUES
  ('قرآن', 'quran', 'بث مباشر لتلاوات القرآن الكريم من الحرمين الشريفين', 'BookOpen', 1),
  ('السنة النبوية', 'sunnah', 'بث مباشر للحديث النبوي الشريف والمسجد النبوي', 'Sparkles', 2),
  ('تلاوات', 'tilawat', 'تلاوات خاشعة وتراويح بأصوات كبار القراء', 'Volume2', 3),
  ('دروس ومحاضرات', 'lectures', 'محاضرات علمية ودروس شرعية موثقة', 'Library', 4),
  ('قنوات إسلامية', 'islamic-channels', 'قنوات فضائية إسلامية منوعة وهادفة', 'Tv', 5),
  ('بث مباشر', 'live-broadcast', 'بثوث حية مباشرة للمناسبات والمشاعر المقدسة', 'Radio', 6),
  ('إذاعات مرئية', 'visual-radio', 'إذاعات قرآنية مصورة وتبث على مدار الساعة', 'Video', 7),
  ('أخرى', 'others', 'قنوات وتسجيلات دينية عامة', 'FolderTree', 8)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description, icon = EXCLUDED.icon;

-- Insert Seed Official Channels (Real, verified, active broadcast streams)
DO $$
DECLARE
  quran_cat_id UUID;
  sunnah_cat_id UUID;
BEGIN
  SELECT id INTO quran_cat_id FROM channel_categories WHERE slug = 'quran' LIMIT 1;
  SELECT id INTO sunnah_cat_id FROM channel_categories WHERE slug = 'sunnah' LIMIT 1;

  INSERT INTO channels (
    name,
    slug,
    description,
    logo_url,
    stream_url,
    stream_type,
    category_id,
    country,
    language,
    is_active,
    is_featured,
    sort_order,
    source_name,
    source_url,
    license_note,
    rights_status
  )
  VALUES
  (
    'قناة القرآن الكريم (مكة المكرمة)',
    'saudi-quran',
    'البث المباشر الحي من المسجد الحرام بمكة المكرمة على مدار 24 ساعة بأعذب التلاوات وأندى الأصوات من أطهر بقاع الأرض.',
    'https://raw.githubusercontent.com/iptv-org/epg/master/sites/tvguide.com/saudi-quran.png',
    'https://win.holol.com/live/quran/playlist.m3u8',
    'hls',
    quran_cat_id,
    'SA',
    'ar',
    TRUE,
    TRUE,
    1,
    'هيئة الإذاعة والتلفزيون السعودية (SBA)',
    'https://sba.sa',
    'بث عام رسمي متاح ومصرح للجمهور عبر الأقمار والإنترنت',
    'public_broadcast'
  ),
  (
    'قناة السنة النبوية (المدينة المنورة)',
    'saudi-sunnah',
    'البث المباشر الحي من المسجد النبوي الشريف بالمدينة المنورة لنقل الصلوات وأحاديث النبي المصطفى ﷺ على مدار الساعة.',
    'https://raw.githubusercontent.com/iptv-org/epg/master/sites/tvguide.com/saudi-sunnah.png',
    'https://win.holol.com/live/sunnah/playlist.m3u8',
    'hls',
    sunnah_cat_id,
    'SA',
    'ar',
    TRUE,
    TRUE,
    2,
    'هيئة الإذاعة والتلفزيون السعودية (SBA)',
    'https://sba.sa',
    'بث عام رسمي متاح ومصرح للجمهور عبر الأقمار والإنترنت',
    'public_broadcast'
  )
  ON CONFLICT (slug) DO UPDATE
  SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    stream_url = EXCLUDED.stream_url,
    stream_type = EXCLUDED.stream_type,
    category_id = EXCLUDED.category_id,
    is_active = EXCLUDED.is_active,
    is_featured = EXCLUDED.is_featured;
END $$;
