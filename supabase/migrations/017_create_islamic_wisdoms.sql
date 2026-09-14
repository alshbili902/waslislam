-- 017_create_islamic_wisdoms.sql
-- Table for authentic Islamic wisdoms, reminders, and reflections

CREATE TABLE IF NOT EXISTS islamic_wisdoms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  content_type VARCHAR(50) NOT NULL, -- 'ayah', 'hadith', 'scholar_quote', 'sahaba_quote', 'sermon', 'wisdom', 'reminder', 'faith_benefit'
  author VARCHAR(255),
  source VARCHAR(255) NOT NULL,
  reference TEXT,
  hadith_grade VARCHAR(100),
  category VARCHAR(100) NOT NULL,
  verification_status VARCHAR(50) NOT NULL DEFAULT 'verified', -- 'draft', 'needs_review', 'verified', 'rejected'
  is_featured BOOLEAN DEFAULT FALSE,
  is_daily BOOLEAN DEFAULT FALSE,
  scheduled_date DATE,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Essential indexes for high-speed retrieval, filtering, and deterministic daily retrieval
CREATE INDEX IF NOT EXISTS idx_wisdoms_category ON islamic_wisdoms(category);
CREATE INDEX IF NOT EXISTS idx_wisdoms_verification ON islamic_wisdoms(verification_status);
CREATE INDEX IF NOT EXISTS idx_wisdoms_published_at ON islamic_wisdoms(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_wisdoms_daily_date ON islamic_wisdoms(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_wisdoms_featured ON islamic_wisdoms(is_featured);

-- Enable Row Level Security (RLS)
ALTER TABLE islamic_wisdoms ENABLE ROW LEVEL SECURITY;

-- Public read access for verified content only
CREATE POLICY "Public users can view verified wisdoms"
  ON islamic_wisdoms
  FOR SELECT
  USING (verification_status = 'verified');

-- Admin full access
CREATE POLICY "Service role and admins have full access to wisdoms"
  ON islamic_wisdoms
  FOR ALL
  USING (auth.role() = 'service_role' OR auth.jwt() ->> 'role' = 'super_admin');
