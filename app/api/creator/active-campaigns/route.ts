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
          status,
          brand_id,
          users!brand_id (
            id,
            company_name
          )
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const campaign = app.campaigns as any; // Type assertion since Supabase types are complex
      if (!campaign) {
        return null;
      }

      // Get brand name from the joined users table
      const brandData = campaign.users;
      const brandName = Array.isArray(brandData) && brandData[0]?.company_name
        ? brandData[0].company_name
        : brandData?.company_name || 'Brand Name';

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
        applicationId: app.id,
        applicationStatus: app.status,
        appliedAt: app.created_at,
        customQuote: app.custom_quote,
        brand: brandName,
        daysLeft: Math.ceil((new Date(campaign.completion_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
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