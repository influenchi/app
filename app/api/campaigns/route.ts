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
    const validatedData = campaignSchema.parse(body);

    const { data, error } = await supabaseAdmin
      .from('campaigns')
      .insert({
        brand_id: session.user.id,
        title: validatedData.title,
        description: validatedData.description,
        campaign_goal: validatedData.campaignGoal,
        budget: validatedData.budget,
        budget_type: validatedData.budgetType,
        product_service_description: validatedData.productServiceDescription || null,
        creator_count: validatedData.creatorCount,
        start_date: validatedData.startDate,
        completion_date: validatedData.completionDate,
        content_items: validatedData.contentItems,
        target_audience: validatedData.targetAudience,
        requirements: validatedData.requirements || '',
        creator_purchase_required: validatedData.creatorPurchaseRequired || false,
        product_ship_required: validatedData.productShipRequired || false,
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