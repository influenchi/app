import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session || session.user.user_type !== 'creator') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const campaignId = formData.get('campaignId') as string;
    const taskId = formData.get('taskId') as string;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    if (!campaignId || !taskId) {
      return NextResponse.json({ error: 'Campaign ID and Task ID are required' }, { status: 400 });
    }

    // Verify the creator is accepted for this campaign
    const { data: application, error: appError } = await supabaseAdmin
      .from('campaign_applications')
      .select('status')
      .eq('campaign_id', campaignId)
      .eq('creator_id', session.user.id)
      .eq('status', 'accepted')
      .single();

    if (appError || !application) {
      return NextResponse.json({ error: 'You are not authorized to upload to this campaign' }, { status: 403 });
    }

    const uploadResults: any[] = [];
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      console.log(`Processing submission asset ${i + 1}:`, {
        name: file.name,
        type: file.type,
        size: file.size
      });

      // Validate file type and size
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024; // 100MB for videos, 10MB for images

      if (!isImage && !isVideo) {
        errors.push(`${file.name}: Only images and videos are allowed`);
        continue;
      }

      if (file.size > maxSize) {
        const maxSizeMB = Math.round(maxSize / (1024 * 1024));
        errors.push(`${file.name}: File too large. Maximum size is ${maxSizeMB}MB`);
        continue;
      }

      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const fileExt = file.name.split('.').pop();
        const fileName = `submission-${session.user.id}-${campaignId}-${taskId}-${Date.now()}-${i}.${fileExt}`;
        const filePath = `submission-assets/${fileName}`;

        console.log(`Uploading submission asset ${i + 1} to Supabase Storage:`, filePath);

        const { data, error } = await supabaseAdmin.storage
          .from('uploads')
          .upload(filePath, buffer, {
            contentType: file.type,
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          console.error(`Supabase storage error for file ${i + 1}:`, error);
          errors.push(`${file.name}: Upload failed - ${error.message}`);
          continue;
        }

        const { data: urlData } = supabaseAdmin.storage
          .from('uploads')
          .getPublicUrl(filePath);

        // For videos, we might want to generate a thumbnail in the future
        // For now, we'll just use the video URL as both URL and thumbnail
        const result: any = {
          url: urlData.publicUrl,
          type: isImage ? 'image' : 'video',
          title: file.name,
          file_size: `${Math.round(file.size / 1024)} KB`,
          name: file.name
        };

        // Add dimensions for images (we could extend this for videos too)
        if (isImage) {
          // We could add image dimension detection here in the future
          result.dimensions = 'Unknown';
        } else {
          // For videos, we could add duration detection
          result.duration = 'Unknown';
          result.thumbnail_url = urlData.publicUrl; // Use video URL as thumbnail for now
        }

        uploadResults.push(result);
        console.log(`Submission asset ${i + 1} uploaded successfully:`, urlData.publicUrl);

      } catch (fileError) {
        console.error(`Error processing submission asset ${i + 1}:`, fileError);
        errors.push(`${file.name}: Processing failed`);
      }
    }

    console.log('Submission assets upload complete:', {
      successful: uploadResults.length,
      failed: errors.length,
      campaignId,
      taskId,
      creatorId: session.user.id
    });

    return NextResponse.json({
      assets: uploadResults,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Submission assets upload error:', error);
    return NextResponse.json({
      error: 'Failed to upload submission assets',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}