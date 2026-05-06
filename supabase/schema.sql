-- =============================================
-- StyleSense AI — Full Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  firebase_uid TEXT UNIQUE NOT NULL,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- User Preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  style_personality TEXT,
  favorite_colors TEXT[],
  fit_preference TEXT,
  budget_preference TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE user_preferences DISABLE ROW LEVEL SECURITY;

-- Wardrobe items
CREATE TABLE IF NOT EXISTS wardrobe_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  image_url TEXT,
  cloudinary_public_id TEXT,
  category TEXT,
  color TEXT,
  season TEXT,
  occasion_tags TEXT[],
  times_worn INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE wardrobe_items DISABLE ROW LEVEL SECURITY;

-- AI outfit suggestions
CREATE TABLE IF NOT EXISTS outfit_suggestions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  weather_snapshot JSONB,
  occasion TEXT,
  suggested_outfit JSONB,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE outfit_suggestions DISABLE ROW LEVEL SECURITY;

-- Outfit plans (planner)
CREATE TABLE IF NOT EXISTS outfit_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  planned_date DATE,
  occasion TEXT,
  weather_snapshot JSONB,
  outfit_items JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE outfit_plans DISABLE ROW LEVEL SECURITY;

-- Chat history
CREATE TABLE IF NOT EXISTS chat_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE chat_history DISABLE ROW LEVEL SECURITY;

-- Community OOTD posts
CREATE TABLE IF NOT EXISTS ootd_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  image_url TEXT,
  occasion_tag TEXT,
  weather_tag TEXT,
  caption TEXT,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE ootd_posts DISABLE ROW LEVEL SECURITY;

-- OOTD Likes
CREATE TABLE IF NOT EXISTS ootd_likes (
  post_id UUID NOT NULL,
  user_id TEXT NOT NULL,
  PRIMARY KEY (post_id, user_id)
);
ALTER TABLE ootd_likes DISABLE ROW LEVEL SECURITY;

-- OOTD Comments
CREATE TABLE IF NOT EXISTS ootd_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL,
  user_id TEXT NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE ootd_comments DISABLE ROW LEVEL SECURITY;
