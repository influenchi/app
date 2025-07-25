import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: campaignId } = await params;
    const supabase = supabaseAdmin;
    const userId = session.user.id;

    // Verify user has access to this campaign
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('id, brand_id')
      .eq('id', campaignId)
      .single();

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const isBrand = campaign.brand_id === userId;
    let hasAccess = isBrand;

    if (!isBrand) {
      const { data: application } = await supabase
        .from('campaign_applications')
        .select('id')
        .eq('campaign_id', campaignId)
        .eq('creator_id', userId)
        .eq('status', 'accepted')
        .single();

      hasAccess = !!application;
    }

    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Fetch messages
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        message_recipients(recipient_id, is_read, read_at)
      `)
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Fetch messages error:', error);
      return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
    }

    // Fetch sender and recipient user details separately
    const userIds = new Set<string>();
    messages?.forEach(msg => {
      if (msg.sender_id) userIds.add(msg.sender_id);
      if (msg.recipient_id) userIds.add(msg.recipient_id);
    });

    const { data: users } = await supabase
      .from('users')
      .select('id, name, user_type, image')
      .in('id', Array.from(userIds));

    // Map users to messages
    const usersMap = new Map(users?.map(u => [u.id, u]) || []);
    const messagesWithUsers = messages?.map(msg => ({
      ...msg,
      sender: msg.sender_id ? usersMap.get(msg.sender_id) : null,
      recipient: msg.recipient_id ? usersMap.get(msg.recipient_id) : null
    }));

    // Filter messages based on user role
    const filteredMessages = messagesWithUsers?.filter(message => {
      // If user is brand, show all messages
      if (isBrand) return true;

      // If user is creator, show only:
      // 1. Messages they sent
      // 2. Direct messages sent to them
      // 3. Broadcast messages where they are a recipient
      return (
        message.sender_id === userId ||
        message.recipient_id === userId ||
        (message.is_broadcast && message.message_recipients?.some((r: { recipient_id: string }) => r.recipient_id === userId))
      );
    });

    // Mark messages as read
    if (!isBrand) {
      // Mark direct messages as read
      const directMessageIds = filteredMessages
        ?.filter(m => m.recipient_id === userId && !m.is_read)
        .map(m => m.id) || [];

      if (directMessageIds.length > 0) {
        await supabase
          .from('messages')
          .update({ is_read: true })
          .in('id', directMessageIds);
      }

      // Mark broadcast messages as read
      const broadcastMessageIds = filteredMessages
        ?.filter(m => m.is_broadcast)
        .map(m => m.id) || [];

      if (broadcastMessageIds.length > 0) {
        await supabase
          .from('message_recipients')
          .update({ is_read: true, read_at: new Date().toISOString() })
          .eq('recipient_id', userId)
          .in('message_id', broadcastMessageIds);
      }
    }

    return NextResponse.json({ messages: filteredMessages || [] });
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 