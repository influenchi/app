import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session || session.user.user_type !== 'brand') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: assetId } = await params;

    // Verify the asset belongs to this brand's campaigns and is approved
    const { data: asset, error } = await supabaseAdmin
      .from('submission_assets')
      .select(`
        *,
        campaign_submissions!inner (
          id,
          status,
          campaigns!inner (
            id,
            title,
            brand_id
          )
        )
      `)
      .eq('id', assetId)
      .eq('campaign_submissions.status', 'approved')
      .eq('campaign_submissions.campaigns.brand_id', session.user.id)
      .single();

    if (error || !asset) {
      return NextResponse.json({ error: 'Asset not found or not accessible' }, { status: 404 });
    }

    try {
      // Extract file path from the full URL
      const url = new URL(asset.url);
      const pathSegments = url.pathname.split('/');
      const filePath = pathSegments.slice(pathSegments.indexOf('uploads') + 1).join('/');

      // Get the file from Supabase Storage
      const { data: fileData, error: downloadError } = await supabaseAdmin.storage
        .from('uploads')
        .download(filePath);

      if (downloadError || !fileData) {
        console.error('Storage download error:', downloadError);
        return NextResponse.json({ error: 'Failed to download file' }, { status: 500 });
      }

      // Convert blob to buffer
      const buffer = Buffer.from(await fileData.arrayBuffer());

      // Generate a filename
      const fileExtension = asset.url.split('.').pop() || (asset.type === 'video' ? 'mp4' : 'jpg');
      const filename = `${asset.title.replace(/[^a-zA-Z0-9]/g, '_')}.${fileExtension}`;

      // Set appropriate headers for download
      const headers = new Headers();
      headers.set('Content-Type', fileData.type || 'application/octet-stream');
      headers.set('Content-Disposition', `attachment; filename="${filename}"`);
      headers.set('Content-Length', buffer.length.toString());

      return new NextResponse(buffer, {
        status: 200,
        headers,
      });

    } catch (downloadError) {
      console.error('File download error:', downloadError);
      return NextResponse.json({ error: 'Failed to process download' }, { status: 500 });
    }

  } catch (error) {
    console.error('Asset download error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}