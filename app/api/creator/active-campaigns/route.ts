import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await req.headers,
    });

    if (!session?.user || session.user.user_type !== 'creator') {
      return NextResponse.json(
        { error: "Unauthorized - must be logged in as a creator" },
        { status: 401 }
      );
    }

    // Fetch campaigns where the creator has applied and status is not rejected
    const { data: applications, error: applicationsError } = await supabaseAdmin
      .from('campaign_applications')
      .select(`
        id,
        status,
        created_at,
        custom_quote,
        campaign:campaign_id (
          id,
          title,
          description,
          image,
          budget,
          budget_type,
          product_service_description,
          completion_date,
          content_items,
          target_audience,
          status
        )
      `)
      .eq('creator_id', session.user.id)
      .neq('status', 'rejected')
      .order('created_at', { ascending: false });

    if (applicationsError) {
      console.error('Error fetching active campaigns:', applicationsError);
      return NextResponse.json(
        { error: "Failed to fetch active campaigns" },
        { status: 500 }
      );
    }

    // Transform the data to match the expected format
    const activeCampaigns = applications?.map(app => {
      const campaign = Array.isArray(app.campaign) ? app.campaign[0] : app.campaign;

      if (!campaign) return null;

      return {
        id: campaign.id,
        title: campaign.title,
        description: campaign.description,
        image: campaign.image,
        budget: campaign.budget,
        budget_type: campaign.budget_type,
        product_service_description: campaign.product_service_description,
        completion_date: campaign.completion_date,
        content_items: campaign.content_items,
        target_audience: campaign.target_audience,
        status: campaign.status,
        // Application specific data
        applicationId: app.id,
        applicationStatus: app.status,
        appliedAt: app.created_at,
        customQuote: app.custom_quote,
        brand: 'Brand Name', // TODO: Fetch actual brand name
        daysLeft: Math.ceil((new Date(campaign.completion_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
      };
    }).filter(Boolean) || [];

    return NextResponse.json({ campaigns: activeCampaigns });
  } catch (error) {
    console.error('Error in get active campaigns:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 