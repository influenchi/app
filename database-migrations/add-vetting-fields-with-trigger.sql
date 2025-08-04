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

-- Create a function to prevent users from changing their own is_vetted status
CREATE OR REPLACE FUNCTION prevent_is_vetted_self_update()
RETURNS TRIGGER AS $$
BEGIN
  -- If the user is trying to change their own is_vetted status, revert it
  IF NEW.user_id = auth.uid() AND OLD.is_vetted IS DISTINCT FROM NEW.is_vetted THEN
    NEW.is_vetted = OLD.is_vetted;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS prevent_is_vetted_self_update_trigger ON creators;

-- Create trigger to prevent self-update of is_vetted
CREATE TRIGGER prevent_is_vetted_self_update_trigger
  BEFORE UPDATE ON creators
  FOR EACH ROW
  EXECUTE FUNCTION prevent_is_vetted_self_update(); 