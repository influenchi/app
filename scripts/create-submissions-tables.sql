-- Create submissions and assets tables for the asset library functionality

-- Campaign submissions table
CREATE TABLE IF NOT EXISTS campaign_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  task_id VARCHAR(255), -- References specific content items from campaign
  task_description TEXT,
  content_type VARCHAR(100), -- Post, Video, Story, etc.
  social_channel VARCHAR(50), -- Instagram, TikTok, YouTube, etc.
  quantity INTEGER DEFAULT 1,
  status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  rejection_comment TEXT,
  submitted_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(campaign_id, creator_id, task_id)
);

-- Submission assets table (individual files within a submission)
CREATE TABLE IF NOT EXISTS submission_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID REFERENCES campaign_submissions(id) ON DELETE CASCADE,
  type VARCHAR(20) CHECK (type IN ('image', 'video')) NOT NULL,
  url VARCHAR(1000) NOT NULL, -- Storage URL
  thumbnail_url VARCHAR(1000), -- For videos
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_size VARCHAR(50), -- e.g., "2.4 MB"
  dimensions VARCHAR(50), -- e.g., "1080x1080" for images
  duration VARCHAR(50), -- e.g., "30s" for videos
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_campaign_submissions_campaign_id ON campaign_submissions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_submissions_creator_id ON campaign_submissions(creator_id);
CREATE INDEX IF NOT EXISTS idx_campaign_submissions_status ON campaign_submissions(status);
CREATE INDEX IF NOT EXISTS idx_submission_assets_submission_id ON submission_assets(submission_id);
CREATE INDEX IF NOT EXISTS idx_submission_assets_type ON submission_assets(type);

-- Set up Row Level Security (RLS)
ALTER TABLE campaign_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_assets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for campaign_submissions
CREATE POLICY "Creators can view their own submissions" ON campaign_submissions
  FOR SELECT USING (auth.uid() = creator_id);

CREATE POLICY "Brands can view submissions to their campaigns" ON campaign_submissions
  FOR SELECT USING (auth.uid() IN (SELECT brand_id FROM campaigns WHERE id = campaign_id));

CREATE POLICY "Creators can insert their own submissions" ON campaign_submissions
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Brands can update submissions to their campaigns" ON campaign_submissions
  FOR UPDATE USING (auth.uid() IN (SELECT brand_id FROM campaigns WHERE id = campaign_id));

-- RLS Policies for submission_assets
CREATE POLICY "Creators can view assets of their own submissions" ON submission_assets
  FOR SELECT USING (auth.uid() IN (SELECT creator_id FROM campaign_submissions WHERE id = submission_id));

CREATE POLICY "Brands can view assets of submissions to their campaigns" ON submission_assets
  FOR SELECT USING (auth.uid() IN (
    SELECT c.brand_id 
    FROM campaign_submissions cs 
    JOIN campaigns c ON cs.campaign_id = c.id 
    WHERE cs.id = submission_id
  ));

CREATE POLICY "Creators can insert assets to their own submissions" ON submission_assets
  FOR INSERT WITH CHECK (auth.uid() IN (SELECT creator_id FROM campaign_submissions WHERE id = submission_id));

CREATE POLICY "Creators can update assets of their own submissions" ON submission_assets
  FOR UPDATE USING (auth.uid() IN (SELECT creator_id FROM campaign_submissions WHERE id = submission_id));

-- Add a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_campaign_submissions_updated_at 
  BEFORE UPDATE ON campaign_submissions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submission_assets_updated_at 
  BEFORE UPDATE ON submission_assets 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();