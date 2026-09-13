-- 009_create_radio_history.sql
CREATE TABLE IF NOT EXISTS user_radio_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  station_id VARCHAR(100) NOT NULL REFERENCES radio_stations(id) ON DELETE CASCADE,
  played_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_radio_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  station_id VARCHAR(100) NOT NULL REFERENCES radio_stations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, station_id)
);

CREATE INDEX IF NOT EXISTS idx_radio_history_user_played ON user_radio_history(user_id, played_at DESC);
CREATE INDEX IF NOT EXISTS idx_radio_favorites_user ON user_radio_favorites(user_id);
