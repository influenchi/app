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

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: campaignId } = await params;
    const body = await req.json();

    // Verify the campaign belongs to the current user
    const { data: existingCampaign, error: fetchError } = await supabaseAdmin
      .from('campaigns')
      .select('brand_id')
      .eq('id', campaignId)
      .single();

    if (fetchError || !existingCampaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (existingCampaign.brand_id !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // For drafts, we don't require full validation
    const { imageUrl, ...campaignData } = body;

    const { data, error } = await supabaseAdmin
      .from('campaigns')
      .update({
        title: campaignData.title,
        description: campaignData.description,
        image: imageUrl || null,
        campaign_goal: campaignData.campaignGoal || [],
        budget: campaignData.budget,
        budget_type: campaignData.budgetType?.[0] || 'paid',
        product_service_description: campaignData.productServiceDescription || null,
        creator_count: campaignData.creatorCount,
        start_date: campaignData.startDate,
        completion_date: campaignData.completionDate,
        content_items: campaignData.contentItems || [],
        target_audience: campaignData.targetAudience || {},
        requirements: campaignData.requirements || '',
        creator_purchase_required: campaignData.creatorPurchaseRequired || false,
        product_ship_required: campaignData.productShipRequired || false,
        affiliate_program: campaignData.affiliateProgram || null,
        status: body.status || 'draft',
        updated_at: new Date().toISOString(),
      })
      .eq('id', campaignId)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 });
    }

    return NextResponse.json({ success: true, campaign: data });
  } catch (error) {
    console.error('Campaign update error:', error);
    return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: campaignId } = await params;

    // Verify the campaign belongs to the current user and is a draft
    const { data: existingCampaign, error: fetchError } = await supabaseAdmin
      .from('campaigns')
      .select('brand_id, status')
      .eq('id', campaignId)
      .single();

    if (fetchError || !existingCampaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (existingCampaign.brand_id !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Only allow deletion of draft campaigns to prevent deleting active campaigns with applications
    if (existingCampaign.status !== 'draft') {
      return NextResponse.json({ error: 'Only draft campaigns can be deleted' }, { status: 400 });
    }

    const { error: deleteError } = await supabaseAdmin
      .from('campaigns')
      .delete()
      .eq('id', campaignId);

    if (deleteError) {
      console.error('Supabase delete error:', deleteError);
      return NextResponse.json({ error: 'Failed to delete campaign' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Campaign deletion error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 