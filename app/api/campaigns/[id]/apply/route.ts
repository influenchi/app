import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { creatorApplicationSchema } from "@/lib/validations/creator";
import { NotificationService } from "@/lib/notifications";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id: campaignId } = await params;

    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from('campaigns')
      .select('id, status, applicant_count')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      console.error('Campaign fetch error:', campaignError);
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    if (campaign.status !== 'active') {
      return NextResponse.json(
        { error: "Campaign is not accepting applications" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const validatedData = creatorApplicationSchema.parse(body);

    // Check for existing application
    const { data: existingApplication } = await supabaseAdmin
      .from('campaign_applications')
      .select('id')
      .eq('campaign_id', campaignId)
      .eq('creator_id', session.user.id)
      .single();

    if (existingApplication) {
      return NextResponse.json(
        { error: "You have already applied to this campaign" },
        { status: 400 }
      );
    }

    // Insert new application
    const { data: newApplication, error: insertError } = await supabaseAdmin
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

    if (insertError) {
      console.error('Error creating application:', insertError);
      return NextResponse.json(
        { error: "Failed to submit application" },
        { status: 500 }
      );
    }

    // Update campaign applicant count
    await supabaseAdmin
      .from('campaigns')
      .update({ applicant_count: (campaign.applicant_count || 0) + 1 })
      .eq('id', campaignId);

    // Create in-app notification for the brand
    try {
      const { data: campaignInfoForNotif } = await supabaseAdmin
        .from('campaigns')
        .select('title, brand_id')
        .eq('id', campaignId)
        .single();

      if (campaignInfoForNotif) {
        await supabaseAdmin
          .from('notifications')
          .insert({
            user_id: campaignInfoForNotif.brand_id,
            type: 'application_created',
            title: 'New campaign application',
            message: `A creator applied to "${campaignInfoForNotif.title}"`,
            data: {
              campaign_id: campaignId,
              application_id: newApplication.id,
              creator_id: session.user.id
            },
            is_read: false
          });
      }
    } catch (notifErr) {
      console.error('Failed to create in-app notification for application:', notifErr);
    }

    // Send notification emails
    try {
      // Get campaign and brand info
      const { data: campaignInfo } = await supabaseAdmin
        .from('campaigns')
        .select(`
          title,
          brand_id,
          users!brand_id(first_name, email)
        `)
        .eq('id', campaignId)
        .single();

      // Get creator info
      const { data: creatorInfo } = await supabaseAdmin
        .from('creators')
        .select('display_name')
        .eq('user_id', session.user.id)
        .single();

      if (campaignInfo?.users) {
        // Notify brand of new application
        await NotificationService.sendBrandCreatorApplied(
          campaignInfo.brand_id,
          campaignInfo.users.first_name || 'there',
          campaignInfo.users.email,
          campaignId,
          campaignInfo.title,
          creatorInfo?.display_name || 'A creator'
        );
      }

      // Confirm application to creator
      await NotificationService.sendCreatorApplicationConfirmation(
        session.user.id,
        session.user.first_name || 'there',
        session.user.email!,
        campaignInfo?.title || 'the campaign',
        campaignInfo?.users?.first_name || 'the brand'
      );

    } catch (emailError) {
      console.error('Failed to send application emails:', emailError);
      // Don't fail the application if email fails
    }

    return NextResponse.json({
      success: true,
      application: newApplication
    });
  } catch (error) {
    console.error('Error in campaign application:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 