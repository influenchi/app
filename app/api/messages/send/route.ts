import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const sendMessageSchema = z.object({
  campaignId: z.string().uuid(),
  message: z.string().min(1).max(5000),
  recipientId: z.string().uuid().optional(), // Optional for broadcast
  isBroadcast: z.boolean().default(false),
  attachments: z.array(z.object({
    url: z.string().url(),
    type: z.string(),
    name: z.string(),
    size: z.number()
  })).default([])
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = sendMessageSchema.parse(body);

    const supabase = supabaseAdmin;
    const userId = session.user.id;

    // Verify user has permission to send messages in this campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, brand_id, title')
      .eq('id', validatedData.campaignId)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Check if user is either the brand owner or an accepted creator
    const isBrand = campaign.brand_id === userId;
    let hasAccess = isBrand;

    if (!isBrand) {
      const { data: application } = await supabase
        .from('campaign_applications')
        .select('id')
        .eq('campaign_id', validatedData.campaignId)
        .eq('creator_id', userId)
        .eq('status', 'accepted')
        .single();

      hasAccess = !!application;
    }

    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Creators can only send direct messages to the brand
    if (!isBrand && validatedData.isBroadcast) {
      return NextResponse.json({ error: "Creators cannot send broadcast messages" }, { status: 403 });
    }

    // Insert the message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        campaign_id: validatedData.campaignId,
        sender_id: userId,
        recipient_id: validatedData.isBroadcast ? null : (validatedData.recipientId || campaign.brand_id),
        message: validatedData.message,
        is_broadcast: validatedData.isBroadcast,
        attachments: validatedData.attachments
      })
      .select()
      .single();

    if (messageError || !message) {
      console.error('Message insert error:', messageError);
      return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
    }

    // Get sender info for notifications
    const { data: sender } = await supabase
      .from('users')
      .select('name')
      .eq('id', userId)
      .single();

    // Handle broadcast messages
    if (validatedData.isBroadcast && isBrand) {
      // Get all accepted creators for this campaign
      const { data: acceptedApplications } = await supabase
        .from('campaign_applications')
        .select('creator_id')
        .eq('campaign_id', validatedData.campaignId)
        .eq('status', 'accepted');

      if (acceptedApplications && acceptedApplications.length > 0) {
        // Create message recipients
        const recipientInserts = acceptedApplications.map((app: { creator_id: string }) => ({
          message_id: message.id,
          recipient_id: app.creator_id
        }));

        await supabase
          .from('message_recipients')
          .insert(recipientInserts);

        // Create notifications for all recipients
        const notificationInserts = acceptedApplications.map((app: { creator_id: string }) => ({
          user_id: app.creator_id,
          type: 'message_broadcast',
          title: `New broadcast from ${campaign.title}`,
          message: validatedData.message.substring(0, 100) + (validatedData.message.length > 100 ? '...' : ''),
          data: {
            campaign_id: validatedData.campaignId,
            message_id: message.id,
            sender_name: sender?.name || 'Brand'
          }
        }));

        await supabase
          .from('notifications')
          .insert(notificationInserts);
      }
    } else if (!validatedData.isBroadcast) {
      // Direct message - create notification for recipient
      const recipientId = validatedData.recipientId || campaign.brand_id;

      await supabase
        .from('notifications')
        .insert({
          user_id: recipientId,
          type: 'message_direct',
          title: `New message from ${sender?.name || 'User'}`,
          message: validatedData.message.substring(0, 100) + (validatedData.message.length > 100 ? '...' : ''),
          data: {
            campaign_id: validatedData.campaignId,
            message_id: message.id,
            sender_id: userId,
            sender_name: sender?.name || 'User'
          }
        });
    }

    return NextResponse.json({ message, success: true });
  } catch (error) {
    console.error('Send message error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 