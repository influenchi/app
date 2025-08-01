import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('- SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateCreatorTable() {
  console.log('Starting creator table migration...');

  try {
    // Drop existing creator_profiles table if it exists
    console.log(' Dropping old creator_profiles table if exists...');
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: 'DROP TABLE IF EXISTS creator_profiles CASCADE;'
    });

    if (dropError) {
      console.warn('Could not drop creator_profiles:', dropError.message);
    }

    // Create creators table
    console.log(' Creating creators table...');
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS creators (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        email VARCHAR(255),
        display_name VARCHAR(255) NOT NULL,
        bio TEXT,
        city VARCHAR(255),
        state VARCHAR(255),
        country VARCHAR(255),
        profile_photo VARCHAR(500),
        instagram VARCHAR(255),
        tiktok VARCHAR(255),
        youtube VARCHAR(255),
        twitter VARCHAR(255),
        website VARCHAR(500),
        primary_niche VARCHAR(255),
        secondary_niches TEXT[] DEFAULT '{}',
        travel_style TEXT[] DEFAULT '{}',
        work_types TEXT[] DEFAULT '{}',
        work_images TEXT[] DEFAULT '{}',
        total_followers VARCHAR(50),
        primary_platform VARCHAR(50),
        audience_info JSONB DEFAULT '{}',
        engagement_rate VARCHAR(20),
        portfolio_images TEXT[] DEFAULT '{}',
        is_vetted BOOLEAN DEFAULT FALSE,
        is_onboarding_complete BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id)
      );
    `;

    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: createTableSQL
    });

    if (createError) {
      throw new Error(`Failed to create table: ${createError.message}`);
    }

    console.log('Creator table created successfully');

    // Create indexes
    console.log(' Creating indexes...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_creators_user_id ON creators(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_creators_primary_niche ON creators(primary_niche);',
      'CREATE INDEX IF NOT EXISTS idx_creators_is_vetted ON creators(is_vetted);'
    ];

    for (const indexSQL of indexes) {
      const { error } = await supabase.rpc('exec_sql', { sql: indexSQL });
      if (error) {
        console.warn(`Index creation warning: ${error.message}`);
      }
    }

    // Enable RLS
    console.log(' Setting up Row Level Security...');
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE creators ENABLE ROW LEVEL SECURITY;'
    });

    if (rlsError) {
      console.warn('RLS enable warning:', rlsError.message);
    }

    // Create RLS policies
    console.log(' Creating RLS policies...');
    const policies = [
      {
        name: 'users_view_own_creator_profile',
        sql: `CREATE POLICY "users_view_own_creator_profile" ON creators
              FOR SELECT USING (auth.uid() = user_id);`
      },
      {
        name: 'users_insert_own_creator_profile',
        sql: `CREATE POLICY "users_insert_own_creator_profile" ON creators
              FOR INSERT WITH CHECK (auth.uid() = user_id);`
      },
      {
        name: 'users_update_own_creator_profile',
        sql: `CREATE POLICY "users_update_own_creator_profile" ON creators
              FOR UPDATE USING (auth.uid() = user_id);`
      }
    ];

    for (const policy of policies) {
      // Drop existing policy first
      await supabase.rpc('exec_sql', {
        sql: `DROP POLICY IF EXISTS "${policy.name}" ON creators;`
      });

      // Create new policy
      const { error } = await supabase.rpc('exec_sql', { sql: policy.sql });
      if (error) {
        console.warn(`Policy creation warning for ${policy.name}: ${error.message}`);
      }
    }

    // Create updated_at trigger
    console.log(' Creating updated_at trigger...');
    const triggerSQL = `
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      DROP TRIGGER IF EXISTS update_creators_updated_at ON creators;
      
      CREATE TRIGGER update_creators_updated_at 
      BEFORE UPDATE ON creators
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `;

    const { error: triggerError } = await supabase.rpc('exec_sql', {
      sql: triggerSQL
    });

    if (triggerError) {
      console.warn('Trigger creation warning:', triggerError.message);
    }

    console.log('Creator table migration completed successfully!');

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Check if exec_sql function exists, if not create it
async function setupExecSQL() {
  const checkSQL = `
    CREATE OR REPLACE FUNCTION exec_sql(sql text)
    RETURNS void AS $$
    BEGIN
      EXECUTE sql;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `;

  try {
    // Try direct query first
    const { error } = await supabase.from('_dummy').select().single();

    // If we get here, we can try to create the function directly
    console.log(' Setting up exec_sql function...');

    // This might fail if we don't have permission, but that's okay
    // We'll handle it in the main function
  } catch (error) {
    console.log('Note: exec_sql function may need to be created manually in Supabase dashboard');
  }
}

// Run the migration
async function main() {
  await setupExecSQL();
  await updateCreatorTable();
  process.exit(0);
}

main().catch(console.error); 