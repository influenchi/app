import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { creatorApplicationSchema } from "@/lib/validations/creator";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const campaignId = params.id;

    const campaign = await supabase
      .from('campaigns')
      .select('id, status, applicant_count')
      .eq('id', campaignId)
      .single();

    if (campaign.error || !campaign.data) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    if (campaign.data.status !== 'active') {
      return NextResponse.json(
        { error: "Campaign is not accepting applications" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const validatedData = creatorApplicationSchema.parse(body);

    const existingApplication = await supabase
      .from('campaign_applications')
      .select('id')
      .eq('campaign_id', campaignId)
      .eq('creator_id', session.user.id)
      .single();

    if (existingApplication.data) {
      return NextResponse.json(
        { error: "You have already applied to this campaign" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('campaign_applications')
      .insert({
        campaign_id: campaignId,
        creator_id: session.user.id,
        message: validatedData.message,
        custom_quote: validatedData.customQuote || null,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating application:', error);
      return NextResponse.json(
        { error: "Failed to submit application" },
        { status: 500 }
      );
    }

    await supabase
      .from('campaigns')
      .update({ applicant_count: campaign.data.applicant_count + 1 })
      .eq('id', campaignId);

    return NextResponse.json({
      success: true,
      application: data
    });
  } catch (error) {
    console.error('Error in campaign application:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 