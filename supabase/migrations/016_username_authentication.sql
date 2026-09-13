-- ==========================================================
-- 016_username_authentication.sql
-- Wasl Islamic Platform - Username Authentication Migration
-- ==========================================================

-- 1. Add normalized username and password credentials columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username_normalized VARCHAR(100);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password_salt TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- 2. Populate username_normalized for any existing records
UPDATE public.profiles
SET username_normalized = LOWER(TRIM(username))
WHERE username IS NOT NULL AND (username_normalized IS NULL OR username_normalized = '');

-- 3. Make email nullable in profiles so user accounts do not require email
ALTER TABLE public.profiles ALTER COLUMN email DROP NOT NULL;

-- 4. Create unique indexes for username and username_normalized
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username_normalized ON public.profiles(username_normalized);
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);

-- 5. Update trigger function to support username and username_normalized
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_full_name TEXT;
  v_username TEXT;
  v_username_norm TEXT;
BEGIN
  v_full_name := NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), '');
  v_username := NULLIF(TRIM(NEW.raw_user_meta_data->>'username'), '');
  IF v_username IS NOT NULL THEN
    v_username_norm := LOWER(v_username);
  END IF;

  INSERT INTO public.profiles (
    id,
    full_name,
    username,
    username_normalized,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    v_full_name,
    v_username,
    v_username_norm,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    username = COALESCE(EXCLUDED.username, profiles.username),
    username_normalized = COALESCE(EXCLUDED.username_normalized, profiles.username_normalized),
    updated_at = NOW();

  -- Streaks
  INSERT INTO public.streaks (user_id, current_streak, longest_streak, last_activity_date)
  VALUES (NEW.id, 0, 0, NULL)
  ON CONFLICT (user_id) DO NOTHING;

  -- Settings
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Notification Preferences
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;
