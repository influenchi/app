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

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: campaignId } = await params;

    // Fetch campaign details
    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from('campaigns')
      .select(`
        *,
        users!brand_id (
          id,
          company_name
        )
      `)
      .eq('id', campaignId)
      .eq('status', 'active')
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Get brand name
    const brandData = campaign.users;
    const brandName = Array.isArray(brandData) && brandData[0]?.company_name
      ? brandData[0].company_name
      : 'Brand Name';

    // If the request is from a creator, check if they have applied
    if (session.user.user_type === 'creator') {
      const { data: application } = await supabaseAdmin
        .from('campaign_applications')
        .select('status')
        .eq('campaign_id', campaignId)
        .eq('creator_id', session.user.id)
        .single();

      // Add application status and brand name to campaign
      return NextResponse.json({
        campaign: {
          ...campaign,
          applicationStatus: application?.status || null,
          brand_name: brandName
        }
      });
    }

    return NextResponse.json({
      campaign: {
        ...campaign,
        brand_name: brandName
      }
    });
  } catch (error) {
    console.error('Error fetching campaign:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 