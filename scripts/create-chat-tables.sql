-- Chat/Messaging tables for brand-creator communication
-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Messages table for campaign-specific chat
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  recipient_id UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL for broadcast messages
  message TEXT NOT NULL,
  is_broadcast BOOLEAN DEFAULT FALSE,
  attachments JSONB DEFAULT '[]', -- Array of {url, type, name, size}
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message recipients table for broadcast messages
CREATE TABLE IF NOT EXISTS message_recipients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id, recipient_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_campaign_id ON messages(campaign_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_is_broadcast ON messages(is_broadcast);

CREATE INDEX IF NOT EXISTS idx_message_recipients_message_id ON message_recipients(message_id);
CREATE INDEX IF NOT EXISTS idx_message_recipients_recipient_id ON message_recipients(recipient_id);
CREATE INDEX IF NOT EXISTS idx_message_recipients_is_read ON message_recipients(is_read);

-- Set up Row Level Security (RLS)
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_recipients ENABLE ROW LEVEL SECURITY;

-- RLS Policies for messages
-- Users can view messages they sent or received
CREATE POLICY "Users can view their messages" ON messages
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
CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Users can update their own messages (for read status)
CREATE POLICY "Users can update message read status" ON messages
  FOR UPDATE USING (
    auth.uid() = recipient_id
  ) WITH CHECK (
    auth.uid() = recipient_id
  );

-- RLS Policies for message_recipients
CREATE POLICY "Users can view their message recipients" ON message_recipients
  FOR SELECT USING (auth.uid() = recipient_id);

CREATE POLICY "Users can update their read status" ON message_recipients
  FOR UPDATE USING (auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = recipient_id);

-- Trigger to update the updated_at timestamp
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get campaign participants (accepted applicants)
CREATE OR REPLACE FUNCTION get_campaign_participants(campaign_uuid UUID)
RETURNS TABLE (
  user_id UUID,
  user_name TEXT,
  user_email TEXT,
  user_type TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    u.id as user_id,
    u.name as user_name,
    u.email as user_email,
    u.user_type
  FROM users u
  INNER JOIN campaign_applications ca ON u.id = ca.creator_id
  WHERE ca.campaign_id = campaign_uuid
  AND ca.status = 'accepted'
  
  UNION
  
  SELECT DISTINCT
    u.id as user_id,
    u.name as user_name,
    u.email as user_email,
    u.user_type
  FROM users u
  INNER JOIN campaigns c ON u.id = c.brand_id
  WHERE c.id = campaign_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 