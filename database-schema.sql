-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (BetterAuth will handle this, but we add custom fields)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  user_type VARCHAR(20) CHECK (user_type IN ('brand', 'creator')) DEFAULT 'creator',
  company_name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Brand profiles table
CREATE TABLE IF NOT EXISTS brand_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  brand_name VARCHAR(255) NOT NULL,
  website VARCHAR(500),
  description TEXT,
  logo VARCHAR(500),
  industries TEXT[] DEFAULT '{}',
  social_media JSONB DEFAULT '{}',
  is_onboarding_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Creator profiles table
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

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image VARCHAR(500),
  campaign_goal TEXT[] DEFAULT '{}',
  budget VARCHAR(100),
  budget_type VARCHAR(20) CHECK (budget_type IN ('cash', 'product', 'service')) DEFAULT 'cash',
  product_service_description TEXT,
  creator_count VARCHAR(50),
  start_date VARCHAR(50),
  completion_date VARCHAR(50),
  content_items JSONB DEFAULT '[]',
  target_audience JSONB DEFAULT '{}',
  requirements TEXT,
  creator_purchase_required BOOLEAN DEFAULT FALSE,
  product_ship_required BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')) DEFAULT 'draft',
  applicant_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaign applications table
CREATE TABLE IF NOT EXISTS campaign_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  custom_quote VARCHAR(255),
  status VARCHAR(20) CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(campaign_id, creator_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_brand_profiles_user_id ON brand_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_creators_user_id ON creators(user_id);
CREATE INDEX IF NOT EXISTS idx_creators_primary_niche ON creators(primary_niche);
CREATE INDEX IF NOT EXISTS idx_creators_is_vetted ON creators(is_vetted);
CREATE INDEX IF NOT EXISTS idx_campaigns_brand_id ON campaigns(brand_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaign_applications_campaign_id ON campaign_applications(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_applications_creator_id ON campaign_applications(creator_id);
CREATE INDEX IF NOT EXISTS idx_campaign_applications_status ON campaign_applications(status);

-- Set up Row Level Security (RLS)
ALTER TABLE brand_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for brand_profiles
CREATE POLICY "Users can view their own brand profile" ON brand_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own brand profile" ON brand_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own brand profile" ON brand_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for creators
CREATE POLICY "Users can view their own creator profile" ON creators
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own creator profile" ON creators
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own creator profile" ON creators
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for campaigns
CREATE POLICY "Brands can view their own campaigns" ON campaigns
  FOR SELECT USING (auth.uid() = brand_id);

CREATE POLICY "Creators can view active campaigns" ON campaigns
  FOR SELECT USING (status = 'active');

CREATE POLICY "Brands can insert their own campaigns" ON campaigns
  FOR INSERT WITH CHECK (auth.uid() = brand_id);

CREATE POLICY "Brands can update their own campaigns" ON campaigns
  FOR UPDATE USING (auth.uid() = brand_id);

-- RLS Policies for campaign_applications
CREATE POLICY "Creators can view their own applications" ON campaign_applications
  FOR SELECT USING (auth.uid() = creator_id);

CREATE POLICY "Brands can view applications to their campaigns" ON campaign_applications
  FOR SELECT USING (auth.uid() IN (SELECT brand_id FROM campaigns WHERE id = campaign_id));

CREATE POLICY "Creators can insert their own applications" ON campaign_applications
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Brands can update applications to their campaigns" ON campaign_applications
  FOR UPDATE USING (auth.uid() IN (SELECT brand_id FROM campaigns WHERE id = campaign_id)); 