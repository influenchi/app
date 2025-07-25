const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('- SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupStorageBucket() {
  try {
    console.log('🔧 Setting up Supabase storage bucket...');

    // Check if bucket exists
    const { data: existingBucket, error: getBucketError } = await supabase.storage.getBucket('uploads');

    if (existingBucket) {
      console.log('✅ Storage bucket "uploads" already exists');
    } else if (getBucketError && getBucketError.message.includes('not found')) {
      // Create bucket
      const { data: newBucket, error: createError } = await supabase.storage.createBucket('uploads', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml'],
        fileSizeLimit: 5242880 // 5MB
      });

      if (createError) {
        console.error('❌ Failed to create storage bucket:', createError);
        process.exit(1);
      }

      console.log('✅ Created storage bucket "uploads"');
    } else {
      console.error('❌ Error checking bucket:', getBucketError);
      process.exit(1);
    }

    // Test upload functionality with a small PNG image
    console.log('🧪 Testing file upload...');

    // Create a minimal PNG file (1x1 pixel)
    const pngBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
      0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);

    const testPath = `test/${Date.now()}.png`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(testPath, pngBuffer, {
        contentType: 'image/png'
      });

    if (uploadError) {
      console.error('❌ Upload test failed:', uploadError);
      console.log('\n🛠️  You may need to set up RLS policies in your Supabase dashboard:');
      console.log('   1. Go to Storage > Policies in your Supabase dashboard');
      console.log('   2. Create policies for the "uploads" bucket');
      console.log('   3. Or run the SQL from scripts/setup-storage.sql');
    } else {
      console.log('✅ Upload test successful');

      // Clean up test file
      await supabase.storage.from('uploads').remove([testPath]);
      console.log('🧹 Cleaned up test file');
    }

    console.log('\n🎉 Storage setup complete!');
    console.log('\n📋 Next steps:');
    console.log('   1. Run your app: npm run dev');
    console.log('   2. Try the brand onboarding with logo upload');
    console.log('   3. Check console logs for debugging info');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

setupStorageBucket(); 