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

    const { id: campaignId } = await params;
    const supabase = supabaseAdmin;
    const userId = session.user.id;

    // Verify user has access to this campaign
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('id, brand_id')
      .eq('id', campaignId)
      .single();

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Only brands can fetch participants
    if (campaign.brand_id !== userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Fetch accepted applications
    const { data: applications, error: appError } = await supabase
      .from('campaign_applications')
      .select('creator_id')
      .eq('campaign_id', campaignId)
      .eq('status', 'accepted');

    if (appError) {
      console.error('Fetch applications error:', appError);
      return NextResponse.json({ error: "Failed to fetch participants" }, { status: 500 });
    }

    if (!applications || applications.length === 0) {
      return NextResponse.json({ participants: [] });
    }

    // Fetch user details
    const creatorIds = applications.map(app => app.creator_id);
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, image')
      .in('id', creatorIds);

    if (usersError) {
      console.error('Fetch users error:', usersError);
      return NextResponse.json({ error: "Failed to fetch user details" }, { status: 500 });
    }

    const participants = users?.map(user => ({
      id: user.id,
      name: user.name || 'Creator',
      avatar: user.image || undefined
    })) || [];

    return NextResponse.json({ participants });
  } catch (error) {
    console.error('Get participants error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 