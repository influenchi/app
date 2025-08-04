-- Update RLS policies for creators table to allow brands to view creator profiles
-- This allows brands to view profiles of creators who have applied to their campaigns

-- Drop existing view policy
DROP POLICY IF EXISTS "users_view_own_creator_profile" ON creators;
DROP POLICY IF EXISTS "Users can view their own creator profile" ON creators;

-- Allow users to view their own profile
CREATE POLICY "creators_view_own_profile" ON creators
  FOR SELECT USING (auth.uid() = user_id);

-- Allow brands to view creator profiles for their campaign participants
CREATE POLICY "brands_view_campaign_creators" ON creators
  FOR SELECT USING (
    -- Allow if user is a brand and creator has applied to their campaigns
    EXISTS (
      SELECT 1 FROM campaign_applications ca
      JOIN campaigns c ON ca.campaign_id = c.id
      WHERE ca.creator_id = creators.user_id
      AND c.brand_id = auth.uid()
    )
  );

-- Allow public view of vetted creator profiles (for discovery)
CREATE POLICY "public_view_vetted_creators" ON creators
  FOR SELECT USING (is_vetted = true);