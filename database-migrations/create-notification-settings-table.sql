-- User notification settings table migration script
-- Run this in your Supabase SQL editor to create the user_notification_settings table

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_notification_settings table
CREATE TABLE IF NOT EXISTS user_notification_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Email notification preferences
  email_campaign_updates BOOLEAN DEFAULT true,
  email_creator_messages BOOLEAN DEFAULT true,
  email_payment_alerts BOOLEAN DEFAULT true,
  email_weekly_reports BOOLEAN DEFAULT false,
  email_marketing_emails BOOLEAN DEFAULT false,
  
  -- Push notification preferences
  push_campaign_updates BOOLEAN DEFAULT true,
  push_creator_messages BOOLEAN DEFAULT true,
  push_payment_alerts BOOLEAN DEFAULT true,
  push_urgent_alerts BOOLEAN DEFAULT true,
  
  -- Desktop notification preferences
  desktop_browser_notifications BOOLEAN DEFAULT true,
  desktop_sound_alerts BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_notification_settings_user_id ON user_notification_settings(user_id);

-- Set up Row Level Security (RLS)
ALTER TABLE user_notification_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "users_view_own_notification_settings" ON user_notification_settings;
DROP POLICY IF EXISTS "users_insert_own_notification_settings" ON user_notification_settings;
DROP POLICY IF EXISTS "users_update_own_notification_settings" ON user_notification_settings;

-- RLS Policies for user_notification_settings
CREATE POLICY "users_view_own_notification_settings" ON user_notification_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_notification_settings" ON user_notification_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_notification_settings" ON user_notification_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_notification_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_user_notification_settings_updated_at_trigger ON user_notification_settings;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_notification_settings_updated_at_trigger
BEFORE UPDATE ON user_notification_settings
FOR EACH ROW EXECUTE FUNCTION update_user_notification_settings_updated_at();