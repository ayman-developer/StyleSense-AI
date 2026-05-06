-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  firebase_uid TEXT UNIQUE NOT NULL,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wardrobe items table
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

-- AI Outfit suggestions history
CREATE TABLE IF NOT EXISTS outfit_suggestions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  weather_snapshot JSONB,
  occasion TEXT,
  suggestion TEXT,
  reasoning TEXT,
  tips TEXT,
  feedback TEXT, -- 'like', 'dislike'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id TEXT PRIMARY KEY,
  style_tags TEXT[],
  preferred_colors TEXT[],
  disliked_colors TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
