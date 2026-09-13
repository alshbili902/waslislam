-- 001_create_profiles.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(100) UNIQUE,
  full_name VARCHAR(150),
  email VARCHAR(255),
  avatar_url TEXT,
  role VARCHAR(50) DEFAULT 'user',
  country VARCHAR(100) DEFAULT 'المملكة العربية السعودية',
  city VARCHAR(100) DEFAULT 'مكة المكرمة',
  preferred_reciter VARCHAR(100) DEFAULT 'ar.alafasy',
  prayer_calculation_method VARCHAR(50) DEFAULT 'UmmAlQura',
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure columns exist if table was already created
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username VARCHAR(100);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name VARCHAR(150);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'المملكة العربية السعودية';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city VARCHAR(100) DEFAULT 'مكة المكرمة';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_reciter VARCHAR(100) DEFAULT 'ar.alafasy';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS prayer_calculation_method VARCHAR(50) DEFAULT 'UmmAlQura';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
