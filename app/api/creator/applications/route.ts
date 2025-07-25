import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
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

    // Fetch all applications by this creator
    const { data: applications, error } = await supabaseAdmin
      .from('campaign_applications')
      .select(`
        id,
        campaign_id,
        status,
        created_at,
        message,
        custom_quote
      `)
      .eq('creator_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching creator applications:', error);
      return NextResponse.json(
        { error: "Failed to fetch applications" },
        { status: 500 }
      );
    }

    return NextResponse.json({ applications: applications || [] });
  } catch (error) {
    console.error('Error in get creator applications:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 