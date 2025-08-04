-- Schema updates for campaign duplication and editing features
-- Run this in your Supabase SQL editor

-- 1. Add fields to support campaign duplication
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS original_campaign_id UUID REFERENCES campaigns(id),
ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS duplicate_count INTEGER DEFAULT 0;

-- 2. Add index for better performance on duplicated campaigns
CREATE INDEX IF NOT EXISTS idx_campaigns_original_campaign_id ON campaigns(original_campaign_id);

-- 3. Create a function to increment duplicate count when a campaign is duplicated
CREATE OR REPLACE FUNCTION increment_duplicate_count()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.original_campaign_id IS NOT NULL THEN
        UPDATE campaigns 
        SET duplicate_count = duplicate_count + 1 
        WHERE id = NEW.original_campaign_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create trigger to automatically increment duplicate count
CREATE TRIGGER campaign_duplicate_trigger
    AFTER INSERT ON campaigns
    FOR EACH ROW
    WHEN (NEW.original_campaign_id IS NOT NULL)
    EXECUTE FUNCTION increment_duplicate_count();

-- 5. Update status constraint to allow 'editing' status for active campaigns
ALTER TABLE campaigns 
DROP CONSTRAINT IF EXISTS campaigns_status_check;

ALTER TABLE campaigns 
ADD CONSTRAINT campaigns_status_check 
CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled', 'editing'));

-- 6. Add edit history tracking (optional - for audit trail)
CREATE TABLE IF NOT EXISTS campaign_edit_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    edited_by UUID REFERENCES users(id),
    changes JSONB,
    edit_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaign_edit_history_campaign_id ON campaign_edit_history(campaign_id);

-- Display updated table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'campaigns' 
ORDER BY ordinal_position;