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

    // Fetch campaigns where the creator has been accepted
    const { data: applications, error: applicationsError } = await supabaseAdmin
      .from('campaign_applications')
      .select(`
        id,
        message,
        custom_quote,
        status,
        created_at,
        campaign_id,
        campaigns (
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
      .eq('status', 'accepted'); // Only fetch accepted applications

    if (applicationsError) {
      console.error('Error fetching active campaigns:', applicationsError);
      return NextResponse.json(
        { error: "Failed to fetch active campaigns" },
        { status: 500 }
      );
    }

    // Transform the data to match the expected format
    const campaigns = applications?.map(app => {
      const campaign = app.campaigns;
      if (!campaign || !Array.isArray(campaign)) {
        return null;
      }

      const campaignData = campaign[0];

      return {
        id: campaignData.id,
        title: campaignData.title,
        description: campaignData.description,
        image: campaignData.image,
        budget: campaignData.budget,
        budget_type: campaignData.budget_type,
        product_service_description: campaignData.product_service_description,
        completion_date: campaignData.completion_date,
        content_items: campaignData.content_items,
        target_audience: campaignData.target_audience,
        status: campaignData.status,
        applicationId: app.id,
        applicationStatus: app.status,
        appliedAt: app.created_at,
        customQuote: app.custom_quote,
        brand: 'Brand Name', // Placeholder until we have brand data
        daysLeft: Math.ceil((new Date(campaignData.completion_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
      };
    }).filter(Boolean);

    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error('Error in active campaigns:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 