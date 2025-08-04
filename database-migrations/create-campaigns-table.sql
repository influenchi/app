-- Campaign table migration script
-- Run this in your Supabase SQL editor to create the campaigns table and related structures

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create campaigns table
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
CREATE INDEX IF NOT EXISTS idx_campaigns_brand_id ON campaigns(brand_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at);
CREATE INDEX IF NOT EXISTS idx_campaign_applications_campaign_id ON campaign_applications(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_applications_creator_id ON campaign_applications(creator_id);
CREATE INDEX IF NOT EXISTS idx_campaign_applications_status ON campaign_applications(status);

-- Set up Row Level Security (RLS)
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_applications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "brands_view_own_campaigns" ON campaigns;
DROP POLICY IF EXISTS "creators_view_active_campaigns" ON campaigns;
DROP POLICY IF EXISTS "brands_insert_own_campaigns" ON campaigns;
DROP POLICY IF EXISTS "brands_update_own_campaigns" ON campaigns;
DROP POLICY IF EXISTS "creators_view_own_applications" ON campaign_applications;
DROP POLICY IF EXISTS "brands_view_applications_to_campaigns" ON campaign_applications;
DROP POLICY IF EXISTS "creators_insert_own_applications" ON campaign_applications;
DROP POLICY IF EXISTS "brands_update_applications_to_campaigns" ON campaign_applications;

-- RLS Policies for campaigns
CREATE POLICY "brands_view_own_campaigns" ON campaigns
  FOR SELECT USING (auth.uid() = brand_id);

CREATE POLICY "creators_view_active_campaigns" ON campaigns
  FOR SELECT USING (status = 'active');

CREATE POLICY "brands_insert_own_campaigns" ON campaigns
  FOR INSERT WITH CHECK (auth.uid() = brand_id);

CREATE POLICY "brands_update_own_campaigns" ON campaigns
  FOR UPDATE USING (auth.uid() = brand_id);

-- RLS Policies for campaign_applications
CREATE POLICY "creators_view_own_applications" ON campaign_applications
  FOR SELECT USING (auth.uid() = creator_id);

CREATE POLICY "brands_view_applications_to_campaigns" ON campaign_applications
  FOR SELECT USING (auth.uid() IN (SELECT brand_id FROM campaigns WHERE id = campaign_id));

CREATE POLICY "creators_insert_own_applications" ON campaign_applications
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "brands_update_applications_to_campaigns" ON campaign_applications
  FOR UPDATE USING (auth.uid() IN (SELECT brand_id FROM campaigns WHERE id = campaign_id));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_campaigns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_campaigns_updated_at_trigger ON campaigns;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_campaigns_updated_at_trigger
BEFORE UPDATE ON campaigns
FOR EACH ROW EXECUTE FUNCTION update_campaigns_updated_at();

-- Also create the trigger for campaign_applications
CREATE OR REPLACE FUNCTION update_campaign_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_campaign_applications_updated_at_trigger ON campaign_applications;

CREATE TRIGGER update_campaign_applications_updated_at_trigger
BEFORE UPDATE ON campaign_applications
FOR EACH ROW EXECUTE FUNCTION update_campaign_applications_updated_at(); 