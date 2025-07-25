import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { NextRequest, NextResponse } from "next/server";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const campaignId = formData.get('campaignId') as string;

    if (!file || !campaignId) {
      return NextResponse.json({ error: "Missing file or campaign ID" }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only images and PDFs are allowed." }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large. Maximum size is 10MB." }, { status: 400 });
    }

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

    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}_${Date.now()}.${fileExt}`;
    const filePath = `message-attachments/${campaignId}/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('campaign-assets')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('campaign-assets')
      .getPublicUrl(filePath);

    return NextResponse.json({
      url: publicUrl,
      type: file.type,
      name: file.name,
      size: file.size
    });
  } catch (error) {
    console.error('Upload attachment error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 