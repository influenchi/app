-- Add vetting video fields to creators table
ALTER TABLE creators
ADD COLUMN IF NOT EXISTS vetting_video_url TEXT,
ADD COLUMN IF NOT EXISTS vetting_status VARCHAR(20) CHECK (vetting_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS vetting_submitted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS vetting_reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS vetting_reviewer_notes TEXT;

-- Create index for vetting status
CREATE INDEX IF NOT EXISTS idx_creators_vetting_status ON creators(vetting_status);

-- Update RLS policy to allow creators to update their own vetting video
DROP POLICY IF EXISTS "Users can update their own creator profile" ON creators;

CREATE POLICY "Users can update their own creator profile" ON creators
  FOR UPDATE USING (auth.uid() = user_id); 