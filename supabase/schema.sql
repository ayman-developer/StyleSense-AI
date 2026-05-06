-- =============================================
-- StyleSense AI — Full Schema (Updated v3)
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

-- User Preferences (added gender)
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  gender TEXT DEFAULT 'male',
  style_personality TEXT,
  favorite_colors TEXT[],
  fit_preference TEXT,
  budget_preference TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE user_preferences DISABLE ROW LEVEL SECURITY;

-- Add gender column if it doesn't exist
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT 'male';

-- Wardrobe items
CREATE TABLE IF NOT EXISTS wardrobe_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT,
  image_url TEXT,
  cloudinary_public_id TEXT,
  category TEXT,
  color TEXT,
  fabric TEXT,
  fit TEXT,
  warmth_level TEXT,
  season TEXT[],
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

-- Outfit plans
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

-- Wardrobe Analysis
CREATE TABLE IF NOT EXISTS wardrobe_analysis (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  analysis JSONB,
  weather_snapshot JSONB,
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE wardrobe_analysis DISABLE ROW LEVEL SECURITY;

-- Chat history, ootd_posts, etc... (omitted for brevity but they exist)
