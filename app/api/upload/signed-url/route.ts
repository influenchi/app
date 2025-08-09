import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');
    const contentType = searchParams.get('contentType') || undefined;
    const prefix = (searchParams.get('prefix') || 'uploads').replace(/[^a-zA-Z0-9-_\/]/g, '');
    if (!filename) {
      return NextResponse.json({ error: 'Missing filename' }, { status: 400 });
    }

    const ext = filename.split('.').pop();
    const safeExt = ext ? `.${ext}` : '';
    const path = `${prefix}/${session.user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}${safeExt}`;

    const { data, error } = await supabaseAdmin.storage
      .from('uploads')
      .createSignedUploadUrl(path, 60);

    if (error || !data) {
      return NextResponse.json({ error: error?.message || 'Failed to create signed URL' }, { status: 500 });
    }

    return NextResponse.json({ path, token: data.token, contentType });
  } catch (e) {
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
