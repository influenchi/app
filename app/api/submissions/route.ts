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
    const campaignId = searchParams.get('campaign_id');
    const status = searchParams.get('status'); // 'pending' | 'approved' | 'rejected'

    let query = supabaseAdmin
      .from('campaign_submissions')
      .select(`
        *,
        campaigns!inner (
          id,
          title,
          brand_id
        ),
        users!creator_id (
          id,
          first_name,
          last_name,
          company_name
        ),
        submission_assets (
          id,
          type,
          url,
          thumbnail_url,
          title,
          description,
          file_size,
          dimensions,
          duration
        )
      `);

    // Filter based on user type
    if (session.user.user_type === 'brand') {
      query = query.eq('campaigns.brand_id', session.user.id);
    } else if (session.user.user_type === 'creator') {
      query = query.eq('creator_id', session.user.id);
    } else {
      return NextResponse.json({ error: 'Invalid user type' }, { status: 403 });
    }

    // Apply filters
    if (campaignId) {
      query = query.eq('campaign_id', campaignId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    // Order by most recent submissions first
    query = query.order('created_at', { ascending: false });

    const { data: submissions, error } = await query;

    if (error) {
      console.error('Submissions fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
    }

    // Transform the data to match the SubmissionsView interface
    const transformedSubmissions = submissions?.map(submission => {
      const campaign = submission.campaigns;
      const creator = submission.users;

      return {
        id: submission.id,
        creatorId: submission.creator_id,
        creatorName: creator.first_name && creator.last_name
          ? `${creator.first_name} ${creator.last_name}`
          : creator.company_name || 'Creator',
        creatorImage: '/placeholder.svg', // TODO: Add creator profile images
        campaignId: submission.campaign_id,
        campaignName: campaign.title,
        taskId: submission.task_id || '',
        taskDescription: submission.task_description || '',
        contentType: submission.content_type || '',
        socialChannel: submission.social_channel || '',
        quantity: submission.quantity || 1,
        submittedAssets: submission.submission_assets?.map(asset => ({
          id: asset.id,
          type: asset.type,
          url: asset.url,
          thumbnail: asset.thumbnail_url,
          title: asset.title
        })) || [],
        status: submission.status,
        submittedDate: new Date(submission.created_at).toISOString().split('T')[0],
        rejectionComment: submission.rejection_comment
      };
    }) || [];

    return NextResponse.json({ submissions: transformedSubmissions });
  } catch (error) {
    console.error('Submissions API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session || session.user.user_type !== 'brand') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { submissionId, status, rejectionComment } = body;

    if (!submissionId || !status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    // Verify the submission belongs to this brand's campaigns
    const { data: submission, error: fetchError } = await supabaseAdmin
      .from('campaign_submissions')
      .select(`
        id,
        campaigns!inner (
          brand_id
        )
      `)
      .eq('id', submissionId)
      .single();

    if (fetchError || !submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    if (submission.campaigns.brand_id !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update the submission
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'approved') {
      updateData.approved_date = new Date().toISOString();
      updateData.rejection_comment = null; // Clear any previous rejection comment
    } else if (status === 'rejected') {
      updateData.rejection_comment = rejectionComment || null;
      updateData.approved_date = null; // Clear any previous approval date
    }

    const { data, error: updateError } = await supabaseAdmin
      .from('campaign_submissions')
      .update(updateData)
      .eq('id', submissionId)
      .select(`
        *,
        campaigns!inner (
          title,
          brand_id
        )
      `)
      .single();

    if (updateError) {
      console.error('Submission update error:', updateError);
      return NextResponse.json({ error: 'Failed to update submission' }, { status: 500 });
    }

    // Get brand info for notification
    const { data: brandInfo } = await supabaseAdmin
      .from('users')
      .select('first_name, last_name, company_name')
      .eq('id', session.user.id)
      .single();

    // Create notification for the creator
    if (data && data.campaigns && brandInfo) {
      const brandName = brandInfo.first_name && brandInfo.last_name
        ? `${brandInfo.first_name} ${brandInfo.last_name}`
        : brandInfo.company_name || 'Brand';

      const notificationType = status === 'approved' ? 'submission_approved' : 'submission_rejected';
      const notificationTitle = status === 'approved'
        ? `Submission approved by ${brandName}`
        : `Submission needs revision`;

      const notificationMessage = status === 'approved'
        ? `Your submission for "${data.campaigns.title}" has been approved! 🎉`
        : rejectionComment
          ? `Your submission for "${data.campaigns.title}" needs revision: ${rejectionComment}`
          : `Your submission for "${data.campaigns.title}" was rejected. Please check the feedback and resubmit.`;

      await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: data.creator_id,
          type: notificationType,
          title: notificationTitle,
          message: notificationMessage,
          data: {
            campaign_id: data.campaign_id,
            submission_id: submissionId,
            brand_id: session.user.id,
            brand_name: brandName,
            status: status,
            rejection_comment: rejectionComment || null
          }
        });
    }

    return NextResponse.json({ success: true, submission: data });
  } catch (error) {
    console.error('Submission update API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}