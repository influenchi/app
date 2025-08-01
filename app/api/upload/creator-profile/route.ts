import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { validateImageFile, MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from '@/lib/utils/storageUtils';

export async function POST(request: NextRequest) {
  try {
    console.log('Creator profile image upload request received');

    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      console.error('No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Session validated for user:', session.user.id);

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log(' File details:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    const validation = validateImageFile(file);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileExt = file.name.split('.').pop();
    const fileName = `creator-profile-${session.user.id}-${Date.now()}.${fileExt}`;
    const filePath = `creator-profiles/${fileName}`;

    console.log(' Uploading to Supabase Storage:', filePath);

    const { data, error } = await supabaseAdmin.storage
      .from('uploads')
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase storage error:', error);
      return NextResponse.json({
        error: 'Upload failed',
        details: error.message
      }, { status: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage
      .from('uploads')
      .getPublicUrl(filePath);

    console.log('Upload successful:', {
      path: data.path,
      publicUrl: urlData.publicUrl
    });

    return NextResponse.json({
      url: urlData.publicUrl,
      path: data.path
    });

  } catch (error) {
    console.error('Profile image upload error:', error);
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