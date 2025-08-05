/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session || session.user.user_type !== 'creator') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      campaignId,
      taskId,
      taskDescription,
      contentType,
      socialChannel,
      quantity,
      assets
    } = body;

    if (!campaignId || !taskId || !assets || assets.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // First verify the creator is accepted for this campaign
    const { data: application, error: appError } = await supabaseAdmin
      .from('campaign_applications')
      .select('status')
      .eq('campaign_id', campaignId)
      .eq('creator_id', session.user.id)
      .eq('status', 'accepted')
      .single();

    if (appError || !application) {
      return NextResponse.json({ error: 'You are not authorized to submit to this campaign' }, { status: 403 });
    }

    // Check if a submission already exists for this task
    const { data: existingSubmission } = await supabaseAdmin
      .from('campaign_submissions')
      .select('id, status')
      .eq('campaign_id', campaignId)
      .eq('creator_id', session.user.id)
      .eq('task_id', taskId)
      .single();

    let submission;
    let submissionError;

    if (existingSubmission) {
      if (existingSubmission.status === 'approved') {
        return NextResponse.json({
          error: 'This task has already been approved and cannot be resubmitted'
        }, { status: 400 });
      }

      // Update existing submission for pending/rejected tasks
      const updateResult = await supabaseAdmin
        .from('campaign_submissions')
        .update({
          task_description: taskDescription || '',
          content_type: contentType || '',
          social_channel: socialChannel || '',
          quantity: quantity || assets.length,
          status: 'pending',
          submitted_date: new Date().toISOString(),
          rejection_comment: null // Clear previous rejection comment
        })
        .eq('id', existingSubmission.id)
        .select()
        .single();

      submission = updateResult.data;
      submissionError = updateResult.error;

      // Delete existing assets for the submission to replace with new ones
      if (!submissionError) {
        await supabaseAdmin
          .from('submission_assets')
          .delete()
          .eq('submission_id', existingSubmission.id);
      }
    } else {
      // Create new submission record
      const insertResult = await supabaseAdmin
        .from('campaign_submissions')
        .insert({
          campaign_id: campaignId,
          creator_id: session.user.id,
          task_id: taskId,
          task_description: taskDescription || '',
          content_type: contentType || '',
          social_channel: socialChannel || '',
          quantity: quantity || assets.length,
          status: 'pending'
        })
        .select()
        .single();

      submission = insertResult.data;
      submissionError = insertResult.error;
    }

    if (submissionError) {
      console.error('Submission creation error:', submissionError);
      return NextResponse.json({ error: 'Failed to create submission' }, { status: 500 });
    }

    // Create asset records for each uploaded file
    const assetPromises = assets.map((asset: any) =>
      supabaseAdmin
        .from('submission_assets')
        .insert({
          submission_id: submission.id,
          type: asset.type,
          url: asset.url,
          thumbnail_url: asset.thumbnail_url,
          title: asset.title || asset.name,
          description: asset.description || '',
          file_size: asset.file_size,
          dimensions: asset.dimensions,
          duration: asset.duration,
          tags: asset.tags || []
        })
    );

    const assetResults = await Promise.all(assetPromises);
    const assetErrors = assetResults.filter(result => result.error);

    if (assetErrors.length > 0) {
      console.error('Asset creation errors:', assetErrors);
      // Clean up the submission if asset creation failed
      await supabaseAdmin
        .from('campaign_submissions')
        .delete()
        .eq('id', submission.id);

      return NextResponse.json({ error: 'Failed to create submission assets' }, { status: 500 });
    }

    // Get campaign and creator info for notification
    const { data: campaignInfo } = await supabaseAdmin
      .from('campaigns')
      .select('title, brand_id')
      .eq('id', campaignId)
      .single();

    const { data: creatorInfo } = await supabaseAdmin
      .from('users')
      .select('first_name, last_name, company_name')
      .eq('id', session.user.id)
      .single();

    // Create notification for the brand
    if (campaignInfo && creatorInfo) {
      const creatorName = creatorInfo.first_name && creatorInfo.last_name
        ? `${creatorInfo.first_name} ${creatorInfo.last_name}`
        : creatorInfo.company_name || 'Creator';

      const isResubmission = !!existingSubmission;
      const notificationTitle = isResubmission
        ? `Updated submission from ${creatorName}`
        : `New submission from ${creatorName}`;
      const notificationMessage = isResubmission
        ? `${creatorName} updated their submission for "${campaignInfo.title}". ${assets.length} file(s) uploaded.`
        : `${creatorName} submitted content for "${campaignInfo.title}". ${assets.length} file(s) uploaded.`;

      await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: campaignInfo.brand_id,
          type: isResubmission ? 'submission_updated' : 'submission_created',
          title: notificationTitle,
          message: notificationMessage,
          data: {
            campaign_id: campaignId,
            submission_id: submission.id,
            creator_id: session.user.id,
            creator_name: creatorName,
            task_id: taskId,
            asset_count: assets.length,
            is_resubmission: isResubmission
          }
        });
    }

    return NextResponse.json({
      success: true,
      submission: {
        ...submission,
        assets: assetResults.map(result => result.data).filter(Boolean)
      }
    });

  } catch (error) {
    console.error('Creator submission error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session || session.user.user_type !== 'creator') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaign_id');

    let query = supabaseAdmin
      .from('campaign_submissions')
      .select(`
        *,
        campaigns!inner (
          id,
          title
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
          duration,
          tags
        )
      `)
      .eq('creator_id', session.user.id);

    if (campaignId) {
      query = query.eq('campaign_id', campaignId);
    }

    query = query.order('created_at', { ascending: false });

    const { data: submissions, error } = await query;

    if (error) {
      console.error('Creator submissions fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
    }

    const transformedSubmissions = submissions?.map(submission => ({
      id: submission.id,
      campaignId: submission.campaign_id,
      campaignName: submission.campaigns?.title,
      taskId: submission.task_id,
      taskDescription: submission.task_description,
      contentType: submission.content_type,
      socialChannel: submission.social_channel,
      quantity: submission.quantity,
      status: submission.status,
      submittedDate: new Date(submission.created_at).toISOString().split('T')[0],
      rejectionComment: submission.rejection_comment,
      assets: submission.submission_assets?.map((asset: any) => ({
        id: asset.id,
        type: asset.type,
        url: asset.url,
        thumbnail: asset.thumbnail_url,
        title: asset.title,
        description: asset.description,
        fileSize: asset.file_size,
        dimensions: asset.dimensions,
        duration: asset.duration,
        tags: asset.tags || []
      })) || []
    })) || [];

    return NextResponse.json({ submissions: transformedSubmissions });

  } catch (error) {
    console.error('Creator submissions API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}