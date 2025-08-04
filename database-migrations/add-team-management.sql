-- Team management tables for Influenchi

-- Team members table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) CHECK (role IN ('admin', 'manager', 'member')) DEFAULT 'member',
  invited_by UUID REFERENCES users(id),
  invitation_token VARCHAR(255),
  invitation_expires_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) CHECK (status IN ('pending', 'active', 'inactive')) DEFAULT 'pending',
  joined_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(brand_id, user_id)
);

-- Team invitations table (for tracking pending invitations)
CREATE TABLE IF NOT EXISTS team_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(20) CHECK (role IN ('admin', 'manager', 'member')) DEFAULT 'member',
  invitation_token VARCHAR(255) UNIQUE NOT NULL,
  invited_by UUID REFERENCES users(id),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  status VARCHAR(20) CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(brand_id, email)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_team_members_brand_id ON team_members(brand_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_status ON team_members(status);
CREATE INDEX IF NOT EXISTS idx_team_invitations_brand_id ON team_invitations(brand_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON team_invitations(email);
CREATE INDEX IF NOT EXISTS idx_team_invitations_token ON team_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_team_invitations_status ON team_invitations(status);

-- Set up Row Level Security (RLS)
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for team_members
CREATE POLICY "Brand admins/managers can view their team members" ON team_members
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

CREATE POLICY "Brand admins can insert team members" ON team_members
  FOR INSERT WITH CHECK (
    brand_id = auth.uid() OR 
    auth.uid() IN (
      SELECT user_id FROM team_members 
      WHERE brand_id = team_members.brand_id 
      AND role = 'admin' 
      AND status = 'active'
    )
  );

CREATE POLICY "Brand admins can update team members" ON team_members
  FOR UPDATE USING (
    brand_id = auth.uid() OR 
    auth.uid() IN (
      SELECT user_id FROM team_members 
      WHERE brand_id = team_members.brand_id 
      AND role = 'admin' 
      AND status = 'active'
    )
  );

CREATE POLICY "Brand admins can delete team members" ON team_members
  FOR DELETE USING (
    brand_id = auth.uid() OR 
    auth.uid() IN (
      SELECT user_id FROM team_members 
      WHERE brand_id = team_members.brand_id 
      AND role = 'admin' 
      AND status = 'active'
    )
  );

-- RLS Policies for team_invitations
CREATE POLICY "Brand admins/managers can view their team invitations" ON team_invitations
  FOR SELECT USING (
    brand_id = auth.uid() OR 
    auth.uid() IN (
      SELECT user_id FROM team_members 
      WHERE brand_id = team_invitations.brand_id 
      AND role IN ('admin', 'manager') 
      AND status = 'active'
    )
  );

CREATE POLICY "Brand admins/managers can insert team invitations" ON team_invitations
  FOR INSERT WITH CHECK (
    brand_id = auth.uid() OR 
    auth.uid() IN (
      SELECT user_id FROM team_members 
      WHERE brand_id = team_invitations.brand_id 
      AND role IN ('admin', 'manager') 
      AND status = 'active'
    )
  );

CREATE POLICY "Brand admins/managers can update team invitations" ON team_invitations
  FOR UPDATE USING (
    brand_id = auth.uid() OR 
    auth.uid() IN (
      SELECT user_id FROM team_members 
      WHERE brand_id = team_invitations.brand_id 
      AND role IN ('admin', 'manager') 
      AND status = 'active'
    )
  );

-- Function to automatically create brand owner as admin team member
CREATE OR REPLACE FUNCTION create_brand_admin_team_member()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO team_members (brand_id, user_id, role, status, joined_at)
  VALUES (NEW.user_id, NEW.user_id, 'admin', 'active', NOW())
  ON CONFLICT (brand_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically create admin team member when brand is created
CREATE TRIGGER create_brand_admin_trigger
  AFTER INSERT ON brands
  FOR EACH ROW
  EXECUTE FUNCTION create_brand_admin_team_member();
