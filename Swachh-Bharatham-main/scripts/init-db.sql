-- Swachh Bharatham Database Schema
-- Run this in Supabase SQL Editor

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Waste Categories
CREATE TABLE IF NOT EXISTS waste_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO waste_categories (name, color, icon) VALUES
  ('Organic', '#8B4513', 'leaf'),
  ('Plastic', '#FF6B6B', 'recycle'),
  ('Metal', '#C0C0C0', 'wrench'),
  ('Glass', '#87CEEB', 'glass'),
  ('Paper', '#D2691E', 'file'),
  ('Electronics', '#FFD700', 'smartphone'),
  ('Hazardous', '#FF4500', 'warning')
ON CONFLICT (name) DO NOTHING;

-- 2. Bins
CREATE TABLE IF NOT EXISTS bins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  capacity INT DEFAULT 100,
  current_fill FLOAT DEFAULT 0,
  status TEXT DEFAULT 'active',
  location_address TEXT,
  bin_type TEXT DEFAULT 'general',
  qr_code TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. User Profiles
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  phone TEXT,
  city TEXT,
  country TEXT,
  total_waste_kg FLOAT DEFAULT 0,
  total_points INT DEFAULT 0,
  level INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Waste Logs
CREATE TABLE IF NOT EXISTS waste_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bin_id UUID REFERENCES bins(id),
  waste_category_id UUID NOT NULL REFERENCES waste_categories(id),
  weight_kg FLOAT NOT NULL,
  image_url TEXT,
  latitude FLOAT,
  longitude FLOAT,
  ai_classification TEXT,
  ai_confidence FLOAT,
  status TEXT DEFAULT 'verified',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Badges
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  criteria_kg FLOAT,
  criteria_count INT,
  color TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO badges (name, description, icon, criteria_kg, color) VALUES
  ('First Steps', 'Complete your first waste disposal', 'leaf', 0.5, '#90EE90'),
  ('Eco Warrior', 'Dispose 10kg of waste', 'sword', 10, '#4169E1'),
  ('Green Champion', 'Dispose 50kg of waste', 'trophy', 50, '#FFD700'),
  ('Waste Warrior Pro', 'Dispose 100kg of waste', 'crown', 100, '#FF69B4'),
  ('Community Hero', 'Earn 1000 points in a month', 'star', 0, '#FF6347')
ON CONFLICT (name) DO NOTHING;

-- 6. User Badges
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id),
  earned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- 7. Leaderboards
CREATE TABLE IF NOT EXISTS leaderboards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rank INT,
  total_waste_kg FLOAT DEFAULT 0,
  total_points INT DEFAULT 0,
  disposals_count INT DEFAULT 0,
  month TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 8. XP Logs
CREATE TABLE IF NOT EXISTS xp_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  waste_log_id UUID REFERENCES waste_logs(id),
  xp_earned INT NOT NULL,
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 9. Challenges
CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  target_kg FLOAT,
  reward_xp INT,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 10. Challenge Participants
CREATE TABLE IF NOT EXISTS challenge_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID NOT NULL REFERENCES challenges(id),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  progress_kg FLOAT DEFAULT 0,
  completed_at TIMESTAMP,
  UNIQUE(challenge_id, user_id)
);

-- Create indexes
CREATE INDEX idx_waste_logs_user_id ON waste_logs(user_id);
CREATE INDEX idx_waste_logs_created_at ON waste_logs(created_at);
CREATE INDEX idx_waste_logs_status ON waste_logs(status);
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_leaderboards_total_points ON leaderboards(total_points DESC);
CREATE INDEX idx_xp_logs_user_id ON xp_logs(user_id);
CREATE INDEX idx_bins_location ON bins(latitude, longitude);

-- Enable RLS
ALTER TABLE waste_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE bins ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Waste categories are viewable by everyone" ON waste_categories FOR SELECT USING (true);
CREATE POLICY "Bins are viewable by everyone" ON bins FOR SELECT USING (true);

CREATE POLICY "Users can view their own waste logs" ON waste_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own waste logs" ON waste_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own waste logs" ON waste_logs FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "User profiles are viewable by everyone" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Badges are viewable by everyone" ON badges FOR SELECT USING (true);
CREATE POLICY "User badges are viewable by everyone" ON user_badges FOR SELECT USING (true);
CREATE POLICY "Users can earn badges" ON user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Leaderboards are viewable by everyone" ON leaderboards FOR SELECT USING (true);
CREATE POLICY "Users can view their own XP logs" ON xp_logs FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Challenges are viewable by everyone" ON challenges FOR SELECT USING (true);
CREATE POLICY "Users can join challenges" ON challenge_participants FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample bins for testing
INSERT INTO bins (name, latitude, longitude, location_address, bin_type) VALUES
  ('Central Park Bin', 28.6139, 77.2090, 'Central Delhi', 'general'),
  ('Market Street Bin', 28.6328, 77.2197, 'South Delhi', 'recyclable'),
  ('Green Avenue Bin', 28.5355, 77.3910, 'East Delhi', 'organic'),
  ('Downtown Bin', 28.7041, 77.1025, 'North Delhi', 'general'),
  ('Riverside Bin', 28.6045, 77.2473, 'West Delhi', 'hazardous')
ON CONFLICT DO NOTHING;
