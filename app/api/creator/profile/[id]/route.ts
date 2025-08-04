import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: creatorUserId } = await params;
    console.log('Fetching creator profile for user_id:', creatorUserId);

    // First, let's check if any creator exists with this user_id
    const { data: allCreators, error: countError } = await supabaseAdmin
      .from('creators')
      .select('id, user_id, display_name')
      .eq('user_id', creatorUserId);

    console.log('Debug - All creators found:', allCreators);
    console.log('Debug - Count error:', countError);

    // Use supabaseAdmin to bypass RLS - try without .single() first
    const { data: creatorData, error } = await supabaseAdmin
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
        website,
        primary_niche,
        secondary_niches,
        portfolio_images,
        is_vetted,
        total_followers,
        primary_platform,
        engagement_rate
      `)
      .eq('user_id', creatorUserId);

    console.log('Creator profile query result:', { creatorData, error });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: "Creator profile not found" }, { status: 404 });
    }

    if (!creatorData || creatorData.length === 0) {
      console.log('No creator profile found for user_id:', creatorUserId);
      return NextResponse.json({ error: "Creator profile not found" }, { status: 404 });
    }

    // Since we removed .single(), creatorData is now an array
    const profile = creatorData[0];
    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Get creator profile error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}