import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session || session.user.user_type !== 'brand') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaign_id');
    const type = searchParams.get('type'); // 'image' | 'video' | 'all'
    const channel = searchParams.get('channel'); // social channel filter
    const search = searchParams.get('search'); // search term

    // Build query to get approved submission assets for this brand
    let query = supabaseAdmin
      .from('submission_assets')
      .select(`
        *,
        campaign_submissions!inner (
          id,
          campaign_id,
          creator_id,
          task_description,
          content_type,
          social_channel,
          status,
          approved_date,
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
          )
        )
      `)
      .eq('campaign_submissions.status', 'approved')
      .eq('campaign_submissions.campaigns.brand_id', session.user.id);

    // Apply filters
    if (campaignId) {
      query = query.eq('campaign_submissions.campaign_id', campaignId);
    }

    if (type && type !== 'all') {
      query = query.eq('type', type);
    }

    if (channel && channel !== 'all') {
      query = query.eq('campaign_submissions.social_channel', channel);
    }

    // Order by most recent approvals first
    query = query.order('created_at', { ascending: false });

    const { data: assets, error } = await query;

    if (error) {
      console.error('Assets fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 });
    }

    // Transform the data to match the AssetLibrary interface
    const transformedAssets = assets?.map(asset => {
      const submission = asset.campaign_submissions;
      const campaign = submission.campaigns;
      const creator = submission.users;

      return {
        id: asset.id,
        type: asset.type,
        url: asset.url,
        thumbnail: asset.thumbnail_url,
        title: asset.title,
        description: asset.description || '',
        creatorId: submission.creator_id,
        creatorName: creator.first_name && creator.last_name
          ? `${creator.first_name} ${creator.last_name}`
          : creator.company_name || 'Creator',
        creatorImage: '/placeholder.svg', // TODO: Add creator profile images
        campaignId: campaign.id,
        campaignName: campaign.title,
        submittedDate: new Date(asset.created_at).toISOString().split('T')[0],
        approvedDate: new Date(submission.approved_date || asset.created_at).toISOString().split('T')[0],
        tags: asset.tags || [],
        socialChannel: submission.social_channel,
        dimensions: asset.dimensions,
        duration: asset.duration,
        fileSize: asset.file_size || 'Unknown'
      };
    }) || [];

    // Apply client-side search filter if provided
    const filteredAssets = search
      ? transformedAssets.filter(asset =>
        asset.title.toLowerCase().includes(search.toLowerCase()) ||
        asset.description.toLowerCase().includes(search.toLowerCase()) ||
        asset.tags.some((tag: string) => tag.toLowerCase().includes(search.toLowerCase()))
      )
      : transformedAssets;

    return NextResponse.json({ assets: filteredAssets });
  } catch (error) {
    console.error('Assets API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}