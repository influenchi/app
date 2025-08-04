-- Manual migration script for creator table
-- Run this in your Supabase SQL editor

-- Drop existing creator_profiles table if it exists
DROP TABLE IF EXISTS creator_profiles CASCADE;

-- Create creators table with all required fields
CREATE TABLE IF NOT EXISTS creators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255),
  display_name VARCHAR(255) NOT NULL,
  bio TEXT,
  city VARCHAR(255),
  state VARCHAR(255),
  country VARCHAR(255),
  profile_photo VARCHAR(500),
  instagram VARCHAR(255),
  tiktok VARCHAR(255),
  youtube VARCHAR(255),
  twitter VARCHAR(255),
  website VARCHAR(500),
  primary_niche VARCHAR(255),
  secondary_niches TEXT[] DEFAULT '{}',
  travel_style TEXT[] DEFAULT '{}',
  work_types TEXT[] DEFAULT '{}',
  work_images TEXT[] DEFAULT '{}',
  total_followers VARCHAR(50),
  primary_platform VARCHAR(50),
  audience_info JSONB DEFAULT '{}',
  engagement_rate VARCHAR(20),
  portfolio_images TEXT[] DEFAULT '{}',
  is_vetted BOOLEAN DEFAULT FALSE,
  is_onboarding_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_creators_user_id ON creators(user_id);
CREATE INDEX IF NOT EXISTS idx_creators_primary_niche ON creators(primary_niche);
CREATE INDEX IF NOT EXISTS idx_creators_is_vetted ON creators(is_vetted);

-- Set up Row Level Security (RLS)
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "users_view_own_creator_profile" ON creators;
DROP POLICY IF EXISTS "users_insert_own_creator_profile" ON creators;
DROP POLICY IF EXISTS "users_update_own_creator_profile" ON creators;

-- RLS Policies for creators
CREATE POLICY "users_view_own_creator_profile" ON creators
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_creator_profile" ON creators
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_creator_profile" ON creators
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_creators_updated_at ON creators;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_creators_updated_at 
BEFORE UPDATE ON creators
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 