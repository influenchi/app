import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get the current user session
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session || !session.user) {

      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user;

    // Fetch the original campaign
    const { data: originalCampaign, error: fetchError } = await supabaseAdmin
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .eq('brand_id', user.id)
      .single();

    if (fetchError || !originalCampaign) {
      console.error('Error fetching campaign:', fetchError);
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Create duplicated campaign data
    const duplicatedCampaign = {
      ...originalCampaign,
      id: undefined, // Let database generate new ID
      title: `${originalCampaign.title} (Copy)`,
      status: 'draft', // Always save duplicates as draft
      original_campaign_id: originalCampaign.id,
      applicant_count: 0,
      created_at: undefined,
      updated_at: undefined
    };

    // Insert the duplicated campaign
    const { data: newCampaign, error: insertError } = await supabaseAdmin
      .from('campaigns')
      .insert(duplicatedCampaign)
      .select()
      .single();

    if (insertError) {
      console.error('Error duplicating campaign:', insertError);
      return NextResponse.json({
        error: "Failed to duplicate campaign"
      }, { status: 500 });
    }

    return NextResponse.json({
      message: "Campaign duplicated successfully",
      campaign: newCampaign
    });

  } catch (error) {
    console.error('Unexpected error in campaign duplication:', error);
    return NextResponse.json({
      error: "Internal server error"
    }, { status: 500 });
  }
}