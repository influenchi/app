import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { campaignSchema } from '@/lib/validations/brand';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { imageUrl, ...campaignData } = body;
    const validatedData = campaignSchema.parse(campaignData);

    // Take the first budget type (no mapping needed as DB now uses same values)
    const primaryBudgetType = validatedData.budgetType[0] || 'paid';

    const { data, error } = await supabaseAdmin
      .from('campaigns')
      .insert({
        brand_id: session.user.id,
        title: validatedData.title,
        description: validatedData.description,
        image: imageUrl || null,
        campaign_goal: validatedData.campaignGoal,
        budget: validatedData.budget,
        budget_type: primaryBudgetType,
        product_service_description: validatedData.productServiceDescription || null,
        creator_count: validatedData.creatorCount,
        start_date: validatedData.startDate,
        completion_date: validatedData.completionDate,
        content_items: validatedData.contentItems,
        target_audience: validatedData.targetAudience,
        requirements: validatedData.requirements || '',
        creator_purchase_required: validatedData.creatorPurchaseRequired || false,
        product_ship_required: validatedData.productShipRequired || false,
        affiliate_program: validatedData.affiliateProgram || null,
        status: 'active',
        applicant_count: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
    }

    return NextResponse.json({ success: true, campaign: data });
  } catch (error) {
    console.error('Campaign creation error:', error);
    return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    const { searchParams } = new URL(request.url);
    const forBrand = searchParams.get('for_brand') === 'true';
    const status = searchParams.get('status');

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let query = supabaseAdmin.from('campaigns').select('*');

    if (forBrand) {
      // Fetch campaigns for the current brand user
      query = query.eq('brand_id', session.user.id);
    } else {
      // Fetch active campaigns for creators with brand info
      query = supabaseAdmin.from('campaigns').select(`
        *,
        users!brand_id (
          id,
          company_name
        )
      `).eq('status', status || 'active');
    }

    query = query.order('created_at', { ascending: false });

    const { data: campaigns, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
    }

    // If the request is from a creator, check application status for each campaign
    if (!forBrand && session.user.user_type === 'creator' && campaigns) {
      // Get all application statuses for this creator
      const campaignIds = campaigns.map(c => c.id);

      const { data: applications } = await supabaseAdmin
        .from('campaign_applications')
        .select('campaign_id, status')
        .eq('creator_id', session.user.id)
        .in('campaign_id', campaignIds);

      // Create a map of campaign_id to application status
      const applicationMap = new Map();
      applications?.forEach(app => {
        applicationMap.set(app.campaign_id, app.status);
      });

      // Add application status and brand name to each campaign
      const campaignsWithApplicationStatus = campaigns.map(campaign => {
        const brandData = campaign.users;
        const brandName = Array.isArray(brandData) && brandData[0]?.company_name
          ? brandData[0].company_name
          : 'Brand Name';

        return {
          ...campaign,
          applicationStatus: applicationMap.get(campaign.id) || null,
          brand_name: brandName,
          budgetType: [campaign.budget_type || 'paid']
        };
      });

      return NextResponse.json({ campaigns: campaignsWithApplicationStatus });
    }

    // Add budgetType array format for brand campaigns
    const campaignsWithMappedBudgetType = campaigns?.map(campaign => ({
      ...campaign,
      budgetType: [campaign.budget_type || 'paid']
    }));

    return NextResponse.json({ campaigns: campaignsWithMappedBudgetType });
  } catch (error) {
    console.error('Campaigns fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
  }
} 