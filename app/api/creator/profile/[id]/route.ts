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

    const { data: allCreators, error: countError } = await supabaseAdmin
      .from('creators')
      .select('id, user_id, display_name')
      .eq('user_id', creatorUserId);

    console.log('Debug - All creators found:', allCreators);
    console.log('Debug - Count error:', countError);

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
        work_images,
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

    const profile = creatorData[0];
    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Get creator profile error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: creatorUserId } = await params;
    if (session.user.id !== creatorUserId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));

    const allowed: Record<string, unknown> = {};
    if (typeof body.profile_photo === 'string') allowed.profile_photo = body.profile_photo;
    if (Array.isArray(body.portfolio_images)) {
      allowed.portfolio_images = body.portfolio_images;
      // Keep work_images in sync with portfolio_images for now
      allowed.work_images = body.portfolio_images;
    }
    if (typeof body.bio === 'string') allowed.bio = body.bio;
    if (typeof body.website === 'string') allowed.website = body.website;
    if (typeof body.city === 'string') allowed.city = body.city;
    if (typeof body.state === 'string') allowed.state = body.state;
    if (typeof body.country === 'string') allowed.country = body.country;
    if (Array.isArray(body.secondary_niches)) allowed.secondary_niches = body.secondary_niches;
    if (typeof body.primary_niche === 'string') allowed.primary_niche = body.primary_niche;

    if (Object.keys(allowed).length === 0) {
      return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 });
    }

    allowed.updated_at = new Date().toISOString();

    const { error } = await supabaseAdmin
      .from('creators')
      .update(allowed)
      .eq('user_id', creatorUserId);

    if (error) {
      console.error('Update error:', error);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Patch creator profile error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}