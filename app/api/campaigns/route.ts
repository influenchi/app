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
    const { imageUrl, status, ...campaignData } = body;
    const isDraft = status === 'draft';

    // For drafts, use more lenient validation
    let validatedData;
    if (isDraft) {
      // For drafts, don't validate - just use the data with sensible defaults
      validatedData = {
        title: campaignData.title || 'Untitled Campaign',
        description: campaignData.description || '',
        campaignGoal: campaignData.campaignGoal || [],
        budget: campaignData.budget || '0',
        budgetType: campaignData.budgetType || ['paid'],
        productServiceDescription: campaignData.productServiceDescription || '',
        creatorCount: campaignData.creatorCount || '1',
        startDate: campaignData.startDate || '',
        completionDate: campaignData.completionDate || '',
        contentItems: campaignData.contentItems || [],
        targetAudience: campaignData.targetAudience || {
          socialChannel: '',
          audienceSize: [],
          ageRange: [],
          gender: '',
          location: [],
          ethnicity: '',
          interests: []
        },
        requirements: campaignData.requirements || '',
        creatorPurchaseRequired: campaignData.creatorPurchaseRequired || false,
        productShipRequired: campaignData.productShipRequired || false,
        affiliateProgram: campaignData.affiliateProgram || null,
      };
    } else {
      // For active campaigns, use full validation
      validatedData = campaignSchema.parse(campaignData);
    }

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
        start_date: validatedData.startDate || null, // Allow null for drafts
        completion_date: validatedData.completionDate || null, // Allow null for drafts
        content_items: validatedData.contentItems,
        target_audience: validatedData.targetAudience,
        requirements: validatedData.requirements || '',
        creator_purchase_required: validatedData.creatorPurchaseRequired || false,
        product_ship_required: validatedData.productShipRequired || false,
        affiliate_program: validatedData.affiliateProgram || null,
        status: isDraft ? 'draft' : 'active',
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

    // For brand requests, add hired creators count
    let hiredCreatorsCount = 0;
    if (forBrand && campaigns?.length > 0) {
      const campaignIds = campaigns.map(c => c.id);

      const { data: acceptedApplications } = await supabaseAdmin
        .from('campaign_applications')
        .select('creator_id')
        .eq('status', 'accepted')
        .in('campaign_id', campaignIds);

      // Count distinct hired creators
      if (acceptedApplications) {
        const uniqueCreatorIds = new Set(acceptedApplications.map(app => app.creator_id));
        hiredCreatorsCount = uniqueCreatorIds.size;
      }
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

    const response = {
      campaigns: campaignsWithMappedBudgetType,
      ...(forBrand && { hiredCreatorsCount })
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Campaigns fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
  }
} 