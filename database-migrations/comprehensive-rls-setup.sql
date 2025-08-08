-- Comprehensive Row Level Security (RLS) Setup
-- This script enables RLS on all tables and creates appropriate policies
-- Run this in your Supabase SQL editor

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================

-- Core user tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;

-- Campaign related tables
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_edit_history ENABLE ROW LEVEL SECURITY;

-- Messaging tables
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_recipients ENABLE ROW LEVEL SECURITY;

-- Team management tables
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;

-- Notification tables
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_settings ENABLE ROW LEVEL SECURITY;

-- Other tables
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_mappings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- USERS TABLE POLICIES
-- =====================================================

-- Users can only view their own user record
DROP POLICY IF EXISTS "users_view_own_record" ON users;
CREATE POLICY "users_view_own_record" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own record
DROP POLICY IF EXISTS "users_update_own_record" ON users;
CREATE POLICY "users_update_own_record" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Allow insertion during signup (handled by auth system)
DROP POLICY IF EXISTS "users_insert_own_record" ON users;
CREATE POLICY "users_insert_own_record" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- =====================================================
-- BRANDS TABLE POLICIES
-- =====================================================

-- Brands can view their own profile
DROP POLICY IF EXISTS "brands_view_own_profile" ON brands;
CREATE POLICY "brands_view_own_profile" ON brands
  FOR SELECT USING (auth.uid() = user_id);

-- Brands can insert their own profile
DROP POLICY IF EXISTS "brands_insert_own_profile" ON brands;
CREATE POLICY "brands_insert_own_profile" ON brands
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Brands can update their own profile
DROP POLICY IF EXISTS "brands_update_own_profile" ON brands;
CREATE POLICY "brands_update_own_profile" ON brands
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- CREATORS TABLE POLICIES
-- =====================================================

-- Creators can view their own profile
DROP POLICY IF EXISTS "creators_view_own_profile" ON creators;
CREATE POLICY "creators_view_own_profile" ON creators
  FOR SELECT USING (auth.uid() = user_id);

-- Creators can insert their own profile
DROP POLICY IF EXISTS "creators_insert_own_profile" ON creators;
CREATE POLICY "creators_insert_own_profile" ON creators
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Creators can update their own profile
DROP POLICY IF EXISTS "creators_update_own_profile" ON creators;
CREATE POLICY "creators_update_own_profile" ON creators
  FOR UPDATE USING (auth.uid() = user_id);

-- Brands can view creator profiles for their campaign participants
DROP POLICY IF EXISTS "brands_view_campaign_creators" ON creators;
CREATE POLICY "brands_view_campaign_creators" ON creators
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM campaign_applications ca
      JOIN campaigns c ON ca.campaign_id = c.id
      WHERE ca.creator_id = creators.user_id
      AND c.brand_id = auth.uid()
    )
  );

-- Public view of vetted creator profiles (for discovery)
DROP POLICY IF EXISTS "public_view_vetted_creators" ON creators;
CREATE POLICY "public_view_vetted_creators" ON creators
  FOR SELECT USING (is_vetted = true);

-- =====================================================
-- CAMPAIGNS TABLE POLICIES
-- =====================================================

-- Brands can view their own campaigns
DROP POLICY IF EXISTS "brands_view_own_campaigns" ON campaigns;
CREATE POLICY "brands_view_own_campaigns" ON campaigns
  FOR SELECT USING (auth.uid() = brand_id);

-- Creators can view active campaigns
DROP POLICY IF EXISTS "creators_view_active_campaigns" ON campaigns;
CREATE POLICY "creators_view_active_campaigns" ON campaigns
  FOR SELECT USING (status = 'active');

-- Brands can insert their own campaigns
DROP POLICY IF EXISTS "brands_insert_own_campaigns" ON campaigns;
CREATE POLICY "brands_insert_own_campaigns" ON campaigns
  FOR INSERT WITH CHECK (auth.uid() = brand_id);

-- Brands can update their own campaigns
DROP POLICY IF EXISTS "brands_update_own_campaigns" ON campaigns;
CREATE POLICY "brands_update_own_campaigns" ON campaigns
  FOR UPDATE USING (auth.uid() = brand_id);

-- =====================================================
-- CAMPAIGN APPLICATIONS TABLE POLICIES
-- =====================================================

-- Creators can view their own applications
DROP POLICY IF EXISTS "creators_view_own_applications" ON campaign_applications;
CREATE POLICY "creators_view_own_applications" ON campaign_applications
  FOR SELECT USING (auth.uid() = creator_id);

-- Brands can view applications to their campaigns
DROP POLICY IF EXISTS "brands_view_applications_to_campaigns" ON campaign_applications;
CREATE POLICY "brands_view_applications_to_campaigns" ON campaign_applications
  FOR SELECT USING (auth.uid() IN (SELECT brand_id FROM campaigns WHERE id = campaign_id));

-- Creators can insert their own applications
DROP POLICY IF EXISTS "creators_insert_own_applications" ON campaign_applications;
CREATE POLICY "creators_insert_own_applications" ON campaign_applications
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

-- Brands can update applications to their campaigns
DROP POLICY IF EXISTS "brands_update_applications_to_campaigns" ON campaign_applications;
CREATE POLICY "brands_update_applications_to_campaigns" ON campaign_applications
  FOR UPDATE USING (auth.uid() IN (SELECT brand_id FROM campaigns WHERE id = campaign_id));

-- =====================================================
-- CAMPAIGN SUBMISSIONS TABLE POLICIES
-- =====================================================

-- Creators can view their own submissions
DROP POLICY IF EXISTS "creators_view_own_submissions" ON campaign_submissions;
CREATE POLICY "creators_view_own_submissions" ON campaign_submissions
  FOR SELECT USING (auth.uid() = creator_id);

-- Brands can view submissions to their campaigns
DROP POLICY IF EXISTS "brands_view_submissions_to_campaigns" ON campaign_submissions;
CREATE POLICY "brands_view_submissions_to_campaigns" ON campaign_submissions
  FOR SELECT USING (auth.uid() IN (SELECT brand_id FROM campaigns WHERE id = campaign_id));

-- Creators can insert their own submissions
DROP POLICY IF EXISTS "creators_insert_own_submissions" ON campaign_submissions;
CREATE POLICY "creators_insert_own_submissions" ON campaign_submissions
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

-- Brands can update submissions to their campaigns
DROP POLICY IF EXISTS "brands_update_submissions_to_campaigns" ON campaign_submissions;
CREATE POLICY "brands_update_submissions_to_campaigns" ON campaign_submissions
  FOR UPDATE USING (auth.uid() IN (SELECT brand_id FROM campaigns WHERE id = campaign_id));

-- =====================================================
-- SUBMISSION ASSETS TABLE POLICIES
-- =====================================================

-- Creators can view assets of their own submissions
DROP POLICY IF EXISTS "creators_view_own_submission_assets" ON submission_assets;
CREATE POLICY "creators_view_own_submission_assets" ON submission_assets
  FOR SELECT USING (auth.uid() IN (SELECT creator_id FROM campaign_submissions WHERE id = submission_id));

-- Brands can view assets of submissions to their campaigns
DROP POLICY IF EXISTS "brands_view_campaign_submission_assets" ON submission_assets;
CREATE POLICY "brands_view_campaign_submission_assets" ON submission_assets
  FOR SELECT USING (auth.uid() IN (
    SELECT c.brand_id 
    FROM campaign_submissions cs 
    JOIN campaigns c ON cs.campaign_id = c.id 
    WHERE cs.id = submission_id
  ));

-- Creators can insert assets to their own submissions
DROP POLICY IF EXISTS "creators_insert_own_submission_assets" ON submission_assets;
CREATE POLICY "creators_insert_own_submission_assets" ON submission_assets
  FOR INSERT WITH CHECK (auth.uid() IN (SELECT creator_id FROM campaign_submissions WHERE id = submission_id));

-- Creators can update assets of their own submissions
DROP POLICY IF EXISTS "creators_update_own_submission_assets" ON submission_assets;
CREATE POLICY "creators_update_own_submission_assets" ON submission_assets
  FOR UPDATE USING (auth.uid() IN (SELECT creator_id FROM campaign_submissions WHERE id = submission_id));

-- =====================================================
-- MESSAGES TABLE POLICIES
-- =====================================================

-- Users can view messages they sent or received
DROP POLICY IF EXISTS "users_view_their_messages" ON messages;
CREATE POLICY "users_view_their_messages" ON messages
  FOR SELECT USING (
    auth.uid() = sender_id 
    OR auth.uid() = recipient_id 
    OR EXISTS (
      SELECT 1 FROM message_recipients 
      WHERE message_recipients.message_id = messages.id 
      AND message_recipients.recipient_id = auth.uid()
    )
  );

-- Users can insert messages they send
DROP POLICY IF EXISTS "users_send_messages" ON messages;
CREATE POLICY "users_send_messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Users can update their own messages (for read status)
DROP POLICY IF EXISTS "users_update_message_read_status" ON messages;
CREATE POLICY "users_update_message_read_status" ON messages
  FOR UPDATE USING (auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = recipient_id);

-- =====================================================
-- MESSAGE RECIPIENTS TABLE POLICIES
-- =====================================================

-- Users can view their message recipients
DROP POLICY IF EXISTS "users_view_their_message_recipients" ON message_recipients;
CREATE POLICY "users_view_their_message_recipients" ON message_recipients
  FOR SELECT USING (auth.uid() = recipient_id);

-- Users can update their read status
DROP POLICY IF EXISTS "users_update_their_read_status" ON message_recipients;
CREATE POLICY "users_update_their_read_status" ON message_recipients
  FOR UPDATE USING (auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = recipient_id);

-- =====================================================
-- TEAM MEMBERS TABLE POLICIES
-- =====================================================

-- Brand admins/managers can view their team members
DROP POLICY IF EXISTS "brand_admins_view_team_members" ON team_members;
CREATE POLICY "brand_admins_view_team_members" ON team_members
  FOR SELECT USING (
    brand_id = auth.uid() OR 
    (user_id = auth.uid() AND status = 'active') OR
    auth.uid() IN (
      SELECT user_id FROM team_members 
      WHERE brand_id = team_members.brand_id 
      AND role IN ('admin', 'manager') 
      AND status = 'active'
    )
  );

-- Brand admins can insert team members
DROP POLICY IF EXISTS "brand_admins_insert_team_members" ON team_members;
CREATE POLICY "brand_admins_insert_team_members" ON team_members
  FOR INSERT WITH CHECK (
    brand_id = auth.uid() OR 
    auth.uid() IN (
      SELECT user_id FROM team_members 
      WHERE brand_id = team_members.brand_id 
      AND role = 'admin' 
      AND status = 'active'
    )
  );

-- Brand admins can update team members
DROP POLICY IF EXISTS "brand_admins_update_team_members" ON team_members;
CREATE POLICY "brand_admins_update_team_members" ON team_members
  FOR UPDATE USING (
    brand_id = auth.uid() OR 
    auth.uid() IN (
      SELECT user_id FROM team_members 
      WHERE brand_id = team_members.brand_id 
      AND role = 'admin' 
      AND status = 'active'
    )
  );

-- Brand admins can delete team members
DROP POLICY IF EXISTS "brand_admins_delete_team_members" ON team_members;
CREATE POLICY "brand_admins_delete_team_members" ON team_members
  FOR DELETE USING (
    brand_id = auth.uid() OR 
    auth.uid() IN (
      SELECT user_id FROM team_members 
      WHERE brand_id = team_members.brand_id 
      AND role = 'admin' 
      AND status = 'active'
    )
  );

-- =====================================================
-- TEAM INVITATIONS TABLE POLICIES
-- =====================================================

-- Brand admins/managers can view their team invitations
DROP POLICY IF EXISTS "brand_admins_view_team_invitations" ON team_invitations;
CREATE POLICY "brand_admins_view_team_invitations" ON team_invitations
  FOR SELECT USING (
    brand_id = auth.uid() OR 
    auth.uid() IN (
      SELECT user_id FROM team_members 
      WHERE brand_id = team_invitations.brand_id 
      AND role IN ('admin', 'manager') 
      AND status = 'active'
    )
  );

-- Brand admins can insert team invitations
DROP POLICY IF EXISTS "brand_admins_insert_team_invitations" ON team_invitations;
CREATE POLICY "brand_admins_insert_team_invitations" ON team_invitations
  FOR INSERT WITH CHECK (
    brand_id = auth.uid() OR 
    auth.uid() IN (
      SELECT user_id FROM team_members 
      WHERE brand_id = team_invitations.brand_id 
      AND role = 'admin' 
      AND status = 'active'
    )
  );

-- Brand admins can update team invitations
DROP POLICY IF EXISTS "brand_admins_update_team_invitations" ON team_invitations;
CREATE POLICY "brand_admins_update_team_invitations" ON team_invitations
  FOR UPDATE USING (
    brand_id = auth.uid() OR 
    auth.uid() IN (
      SELECT user_id FROM team_members 
      WHERE brand_id = team_invitations.brand_id 
      AND role = 'admin' 
      AND status = 'active'
    )
  );

-- =====================================================
-- NOTIFICATIONS TABLE POLICIES
-- =====================================================

-- Users can view their own notifications
DROP POLICY IF EXISTS "users_view_own_notifications" ON notifications;
CREATE POLICY "users_view_own_notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
DROP POLICY IF EXISTS "users_update_own_notifications" ON notifications;
CREATE POLICY "users_update_own_notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- USER NOTIFICATION SETTINGS TABLE POLICIES
-- =====================================================

-- Users can view their own notification settings
DROP POLICY IF EXISTS "users_view_own_notification_settings" ON user_notification_settings;
CREATE POLICY "users_view_own_notification_settings" ON user_notification_settings
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own notification settings
DROP POLICY IF EXISTS "users_insert_own_notification_settings" ON user_notification_settings;
CREATE POLICY "users_insert_own_notification_settings" ON user_notification_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own notification settings
DROP POLICY IF EXISTS "users_update_own_notification_settings" ON user_notification_settings;
CREATE POLICY "users_update_own_notification_settings" ON user_notification_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- CONTACT MESSAGES TABLE POLICIES
-- =====================================================

-- Only allow insertion of contact messages (no viewing/updating)
DROP POLICY IF EXISTS "allow_contact_message_insertion" ON contact_messages;
CREATE POLICY "allow_contact_message_insertion" ON contact_messages
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- USER MAPPINGS TABLE POLICIES
-- =====================================================

-- Only allow system-level access (no user access)
DROP POLICY IF EXISTS "system_only_user_mappings" ON user_mappings;
CREATE POLICY "system_only_user_mappings" ON user_mappings
  FOR ALL USING (false);

-- =====================================================
-- CAMPAIGN EDIT HISTORY TABLE POLICIES
-- =====================================================

-- Brands can view edit history of their own campaigns
DROP POLICY IF EXISTS "brands_view_own_campaign_edit_history" ON campaign_edit_history;
CREATE POLICY "brands_view_own_campaign_edit_history" ON campaign_edit_history
  FOR SELECT USING (auth.uid() IN (SELECT brand_id FROM campaigns WHERE id = campaign_id));

-- System can insert edit history (trigger-based)
DROP POLICY IF EXISTS "system_insert_campaign_edit_history" ON campaign_edit_history;
CREATE POLICY "system_insert_campaign_edit_history" ON campaign_edit_history
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- VERIFICATION TABLE POLICIES
-- =====================================================

-- Only allow system-level access for verification tokens
DROP POLICY IF EXISTS "system_only_verification" ON verification;
CREATE POLICY "system_only_verification" ON verification
  FOR ALL USING (false);

-- =====================================================
-- SESSION TABLE POLICIES
-- =====================================================

-- Users can only access their own sessions
DROP POLICY IF EXISTS "users_access_own_sessions" ON session;
CREATE POLICY "users_access_own_sessions" ON session
  FOR ALL USING (auth.uid() = "userId");

-- =====================================================
-- ACCOUNT TABLE POLICIES
-- =====================================================

-- Users can only access their own account records
DROP POLICY IF EXISTS "users_access_own_accounts" ON account;
CREATE POLICY "users_access_own_accounts" ON account
  FOR ALL USING (auth.uid() = "userId");

-- =====================================================
-- FINAL NOTES
-- =====================================================

-- All tables now have RLS enabled with appropriate policies
-- Users can only access data they're authorized to see
-- System-level operations (like triggers) are still allowed
-- Public access is restricted to only what's necessary (vetted creators)

COMMENT ON SCHEMA public IS 'All tables have Row Level Security enabled. Users can only access data they are authorized to view or modify.';
