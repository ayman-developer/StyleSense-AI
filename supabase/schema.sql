-- Supabase Schema for StyleSense AI

-- Users table (created_at, etc.)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firebase_uid TEXT UNIQUE NOT NULL,
  name TEXT,
  email TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Preferences
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  style_personality TEXT,
  favorite_colors TEXT[],
  fit_preference TEXT,
  budget_preference TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wardrobe Items
CREATE TABLE IF NOT EXISTS public.wardrobe_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  cloudinary_public_id TEXT,
  category TEXT NOT NULL,
  color TEXT,
  season TEXT,
  occasion_tags TEXT[],
  times_worn INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Outfit Suggestions (Feedback)
CREATE TABLE IF NOT EXISTS public.outfit_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  weather_snapshot JSONB,
  occasion TEXT,
  suggested_outfit JSONB,
  feedback TEXT, -- 'like' or 'dislike' or null
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Outfit Plans
CREATE TABLE IF NOT EXISTS public.outfit_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  planned_date DATE NOT NULL,
  occasion TEXT,
  weather_snapshot JSONB,
  outfit_items TEXT[], -- array of wardrobe_item IDs or descriptions
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat History
CREATE TABLE IF NOT EXISTS public.chat_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'user' or 'assistant'
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Community OOTD Posts
CREATE TABLE IF NOT EXISTS public.ootd_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  occasion_tag TEXT,
  weather_tag TEXT,
  caption TEXT,
  likes_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- OOTD Likes
CREATE TABLE IF NOT EXISTS public.ootd_likes (
  post_id UUID REFERENCES public.ootd_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, user_id)
);

-- OOTD Comments
CREATE TABLE IF NOT EXISTS public.ootd_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES public.ootd_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
