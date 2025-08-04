import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get brand profile from brands table
    const { data: brandProfile, error } = await supabaseAdmin
      .from('brands')
      .select(`
        id,
        user_id,
        first_name,
        last_name,
        email,
        company,
        website,
        brand_description,
        campaign_types,
        selected_plan,
        is_annual,
        created_at,
        updated_at
      `)
      .eq('user_id', session.user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching brand profile:', error);
      return NextResponse.json({ error: "Failed to fetch brand profile" }, { status: 500 });
    }

    // If no brand profile exists, return null (will be created on first update)
    if (!brandProfile) {
      return NextResponse.json({ brandProfile: null });
    }

    // Extract logo URL from brand_description if it exists
    let description = brandProfile.brand_description || '';
    let logoUrl = null;

    if (description.includes('[LOGO:')) {
      const logoMatch = description.match(/\[LOGO:([^\]]+)\]/);
      if (logoMatch) {
        logoUrl = logoMatch[1];
        description = description.replace(/\n\n\[LOGO:[^\]]+\]/, '').trim();
      }
    }

    // Map brands table fields to expected brandProfile format
    const mappedProfile = {
      id: brandProfile.id,
      user_id: brandProfile.user_id,
      brand_name: brandProfile.company,
      website: brandProfile.website,
      description: description,
      logo: logoUrl,
      industries: brandProfile.campaign_types ? brandProfile.campaign_types.split(', ') : [],
      social_media: {}, // Not stored in brands table currently
      is_onboarding_complete: true, // If record exists, onboarding is complete
      created_at: brandProfile.created_at,
      updated_at: brandProfile.updated_at
    };

    return NextResponse.json({ brandProfile: mappedProfile });

  } catch (error) {
    console.error('Brand profile fetch error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      brand_name,
      website,
      description,
      industries,
      social_media
    } = body;

    // Check if brand profile exists
    const { data: existingProfile } = await supabaseAdmin
      .from('brands')
      .select('id')
      .eq('user_id', session.user.id)
      .single();

    if (existingProfile) {
      // Update existing profile in brands table
      const { data: updatedProfile, error } = await supabaseAdmin
        .from('brands')
        .update({
          company: brand_name,
          website,
          brand_description: description,
          campaign_types: industries?.join(', ') || null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', session.user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating brand profile:', error);
        return NextResponse.json({ error: "Failed to update brand profile" }, { status: 500 });
      }

      // Extract logo URL from updated brand_description if it exists
      let updatedDescription = updatedProfile.brand_description || '';
      let logoUrl = null;

      if (updatedDescription.includes('[LOGO:')) {
        const logoMatch = updatedDescription.match(/\[LOGO:([^\]]+)\]/);
        if (logoMatch) {
          logoUrl = logoMatch[1];
          updatedDescription = updatedDescription.replace(/\n\n\[LOGO:[^\]]+\]/, '').trim();
        }
      }

      // Map response to expected format
      const mappedProfile = {
        id: updatedProfile.id,
        user_id: updatedProfile.user_id,
        brand_name: updatedProfile.company,
        website: updatedProfile.website,
        description: updatedDescription,
        logo: logoUrl,
        industries: updatedProfile.campaign_types ? updatedProfile.campaign_types.split(', ') : [],
        social_media: social_media || {},
        is_onboarding_complete: true,
        created_at: updatedProfile.created_at,
        updated_at: updatedProfile.updated_at
      };

      return NextResponse.json({ brandProfile: mappedProfile });
    } else {
      // Create new profile in brands table
      const { data: newProfile, error } = await supabaseAdmin
        .from('brands')
        .insert({
          user_id: session.user.id,
          first_name: session.user.first_name || '',
          last_name: session.user.last_name || '',
          email: session.user.email || '',
          company: brand_name,
          website,
          brand_description: description,
          campaign_types: industries?.join(', ') || null,
          selected_plan: 'free',
          is_annual: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating brand profile:', error);
        return NextResponse.json({ error: "Failed to create brand profile" }, { status: 500 });
      }

      // Extract logo URL from new brand_description if it exists
      let newDescription = newProfile.brand_description || '';
      let logoUrl = null;

      if (newDescription.includes('[LOGO:')) {
        const logoMatch = newDescription.match(/\[LOGO:([^\]]+)\]/);
        if (logoMatch) {
          logoUrl = logoMatch[1];
          newDescription = newDescription.replace(/\n\n\[LOGO:[^\]]+\]/, '').trim();
        }
      }

      // Map response to expected format
      const mappedProfile = {
        id: newProfile.id,
        user_id: newProfile.user_id,
        brand_name: newProfile.company,
        website: newProfile.website,
        description: newDescription,
        logo: logoUrl,
        industries: newProfile.campaign_types ? newProfile.campaign_types.split(', ') : [],
        social_media: social_media || {},
        is_onboarding_complete: true,
        created_at: newProfile.created_at,
        updated_at: newProfile.updated_at
      };

      return NextResponse.json({ brandProfile: mappedProfile });
    }

  } catch (error) {
    console.error('Brand profile update error:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
