import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { validateImageFile } from '@/lib/utils/storageUtils';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Creator portfolio images upload request received');

    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      console.error('❌ No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ Session validated for user:', session.user.id);

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    console.log('📁 Files received:', files.length);

    const uploadResults: string[] = [];
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      console.log(`📁 Processing file ${i + 1}:`, {
        name: file.name,
        type: file.type,
        size: file.size
      });

      const validation = validateImageFile(file);
      if (!validation.isValid) {
        errors.push(`${file.name}: ${validation.error}`);
        continue;
      }

      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const fileExt = file.name.split('.').pop();
        const fileName = `creator-portfolio-${session.user.id}-${Date.now()}-${i}.${fileExt}`;
        const filePath = `creator-portfolios/${fileName}`;

        console.log(`📤 Uploading file ${i + 1} to Supabase Storage:`, filePath);

        const { data, error } = await supabaseAdmin.storage
          .from('uploads')
          .upload(filePath, buffer, {
            contentType: file.type,
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          console.error(`❌ Supabase storage error for file ${i + 1}:`, error);
          errors.push(`${file.name}: Upload failed - ${error.message}`);
          continue;
        }

        const { data: urlData } = supabaseAdmin.storage
          .from('uploads')
          .getPublicUrl(filePath);

        uploadResults.push(urlData.publicUrl);
        console.log(`✅ File ${i + 1} uploaded successfully:`, urlData.publicUrl);

      } catch (fileError) {
        console.error(`❌ Error processing file ${i + 1}:`, fileError);
        errors.push(`${file.name}: Processing failed`);
      }
    }

    console.log('✅ Portfolio upload complete:', {
      successful: uploadResults.length,
      failed: errors.length,
      urls: uploadResults
    });

    return NextResponse.json({
      urls: uploadResults,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('❌ Portfolio images upload error:', error);
    return NextResponse.json({
      error: 'Upload failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
