import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { z } from "zod";

const updateApplicationSchema = z.object({
  status: z.enum(['accepted', 'rejected', 'pending'])
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; applicationId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await req.headers,
    });

    if (!session?.user || session.user.user_type !== 'brand') {
      return NextResponse.json(
        { error: "Unauthorized - must be logged in as a brand" },
        { status: 401 }
      );
    }

    const { id: campaignId, applicationId } = await params;
    const body = await req.json();
    const validatedData = updateApplicationSchema.parse(body);

    // Verify this campaign belongs to the authenticated brand
    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from('campaigns')
      .select('id, brand_id, title')
      .eq('id', campaignId)
      .eq('brand_id', session.user.id)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: "Campaign not found or unauthorized" },
        { status: 404 }
      );
    }

    // Get the application details before updating
    const { data: application, error: appError } = await supabaseAdmin
      .from('campaign_applications')
      .select('id, creator_id, campaign_id')
      .eq('id', applicationId)
      .eq('campaign_id', campaignId)
      .single();

    if (appError || !application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Update the application status
    const { error: updateError } = await supabaseAdmin
      .from('campaign_applications')
      .update({
        status: validatedData.status,
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId);

    if (updateError) {
      console.error('Error updating application:', updateError);
      return NextResponse.json(
        { error: "Failed to update application" },
        { status: 500 }
      );
    }

    // Create notification for creator about status change
    try {
      await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: application.creator_id,
          type: 'application_status_update',
          title: `Application ${validatedData.status}`,
          message: `Your application for "${campaign.title}" has been ${validatedData.status}.`,
          data: {
            campaign_id: campaignId,
            application_id: applicationId,
            status: validatedData.status
          },
          is_read: false
        });
    } catch (notificationError) {
      console.error('Failed to create notification:', notificationError);
      // Don't fail the main operation if notification fails
    }

    return NextResponse.json({
      success: true,
      message: `Application ${validatedData.status} successfully`
    });
  } catch (error) {
    console.error('Error in update application status:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 