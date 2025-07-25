import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await req.headers,
    });

    if (!session?.user || session.user.user_type !== 'brand') {
      return NextResponse.json(
        { error: "Unauthorized - must be logged in as a brand" },
        { status: 401 }
      );
    }

    const { id: campaignId } = await params;

    // Verify this campaign belongs to the authenticated brand
    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from('campaigns')
      .select('id, brand_id')
      .eq('id', campaignId)
      .eq('brand_id', session.user.id)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: "Campaign not found or unauthorized" },
        { status: 404 }
      );
    }

    // Fetch campaign applications
    const { data: applications, error: applicationsError } = await supabaseAdmin
      .from('campaign_applications')
      .select(`
        id,
        message,
        custom_quote,
        status,
        created_at,
        creator_id,
        users!creator_id (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false });

    if (applicationsError) {
      console.error('Error fetching applications:', applicationsError);
      return NextResponse.json(
        { error: "Failed to fetch applications" },
        { status: 500 }
      );
    }

    // Fetch creator profiles separately
    const creatorIds = applications?.map(app => app.creator_id) || [];

    if (creatorIds.length === 0) {
      return NextResponse.json({ applicants: [] });
    }

    const { data: creators, error: creatorError } = await supabaseAdmin
      .from('creators')
      .select(`
        id,
        user_id,
        display_name,
        bio,
        city,
        state,
        country,
        profile_photo,
        instagram,
        tiktok,
        youtube,
        twitter,
        primary_niche,
        total_followers,
        portfolio_images,
        is_vetted
      `)
      .in('user_id', creatorIds);

    if (creatorError) {
      console.error('Error fetching creator profiles:', creatorError);
      return NextResponse.json(
        { error: "Failed to fetch creator profiles" },
        { status: 500 }
      );
    }

    // Combine the data
    const applicants = applications?.map(app => {
      const user = Array.isArray(app.users) ? app.users[0] : app.users;
      const creator = creators?.find(c => c.user_id === app.creator_id);

      return {
        id: app.id,
        name: creator?.display_name || `${user?.first_name} ${user?.last_name}` || 'Unknown Creator',
        profileImage: creator?.profile_photo || '/placeholder.svg',
        socialChannels: [
          creator?.instagram && { platform: 'instagram', handle: creator.instagram, url: `https://instagram.com/${creator.instagram.replace('@', '')}`, followers: 0 },
          creator?.youtube && { platform: 'youtube', handle: creator.youtube, url: `https://youtube.com/${creator.youtube}`, followers: 0 },
          creator?.twitter && { platform: 'twitter', handle: creator.twitter, url: `https://twitter.com/${creator.twitter.replace('@', '')}`, followers: 0 },
        ].filter(Boolean),
        quote: app.custom_quote ? parseFloat(app.custom_quote) : 0,
        status: app.status,
        viewed: false,
        appliedDate: new Date(app.created_at).toLocaleDateString(),
        specialty: creator?.primary_niche || 'Not specified',
        location: [creator?.city, creator?.state, creator?.country].filter(Boolean).join(', ') || 'Not specified',
        bio: creator?.bio || '',
        portfolioImages: creator?.portfolio_images || [],
        applicationMessage: app.message,
        isVetted: creator?.is_vetted || false,
      };
    }) || [];

    return NextResponse.json({ applicants });
  } catch (error) {
    console.error('Error in get applicants:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 