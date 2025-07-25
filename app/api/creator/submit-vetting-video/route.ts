import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { z } from "zod";

const vettingVideoSchema = z.object({
  videoUrl: z.string().url("Please provide a valid URL"),
});

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const validatedData = vettingVideoSchema.parse(body);

    console.log('Looking for creator profile with user_id:', session.user.id);

    const { data: existingProfile, error: fetchError } = await supabaseAdmin
      .from('creators')
      .select('id, user_id, is_vetted, vetting_video_url, is_onboarding_complete')
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching creator profile:', fetchError);
      return NextResponse.json(
        { error: "Failed to fetch creator profile" },
        { status: 500 }
      );
    }

    console.log('Creator profile found:', existingProfile);

    // If no profile exists, they need to complete onboarding first
    if (!existingProfile) {
      return NextResponse.json(
        { error: "Please complete your creator profile before applying for verification" },
        { status: 400 }
      );
    }

    if (existingProfile.is_vetted) {
      return NextResponse.json(
        { error: "You are already verified" },
        { status: 400 }
      );
    }

    const { error: updateError } = await supabaseAdmin
      .from('creators')
      .update({
        vetting_video_url: validatedData.videoUrl,
        vetting_status: 'pending',
        vetting_submitted_at: new Date().toISOString()
      })
      .eq('user_id', session.user.id);

    if (updateError) {
      console.error('Error updating creator profile:', updateError);
      return NextResponse.json(
        { error: "Failed to submit vetting video" },
        { status: 500 }
      );
    }

    console.log('Vetting video submitted successfully for user:', session.user.id);

    return NextResponse.json({
      success: true,
      message: "Vetting video submitted successfully"
    });
  } catch (error) {
    console.error('Error in vetting video submission:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 