import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { creatorOnboardingSchema } from '@/lib/validations/creator';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Creator onboarding request received');

    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ Session validated for user:', session.user.id);

    const contentType = request.headers.get('content-type');
    let body: Record<string, unknown>;
    let profileImageUrl: string | null = null;

    if (contentType?.includes('multipart/form-data')) {
      console.log('📋 Processing FormData request...');

      try {
        const formData = await request.formData();

        const firstName = formData.get('firstName') as string;
        const lastName = formData.get('lastName') as string;
        const displayName = formData.get('displayName') as string;
        const bio = formData.get('bio') as string;
        const location = formData.get('location') as string;
        const profileImageFile = formData.get('profileImage') as File | null;
        const profileImageUrlFromForm = formData.get('profileImageUrl') as string | null;

        const instagram = formData.get('instagram') as string;
        const tiktok = formData.get('tiktok') as string;
        const youtube = formData.get('youtube') as string;
        const twitter = formData.get('twitter') as string;
        const website = formData.get('website') as string;

        const primaryNiche = formData.get('primaryNiche') as string;
        const secondaryNichesStr = formData.get('secondaryNiches') as string;
        const travelStyleStr = formData.get('travelStyle') as string;
        const contentTypesStr = formData.get('contentTypes') as string;

        const totalFollowers = formData.get('totalFollowers') as string;
        const primaryPlatform = formData.get('primaryPlatform') as string;
        const audienceAgeStr = formData.get('audienceAge') as string;
        const audienceGender = formData.get('audienceGender') as string;
        const audienceLocationStr = formData.get('audienceLocation') as string;
        const engagementRate = formData.get('engagementRate') as string;
        const portfolioImagesStr = formData.get('portfolioImages') as string;

        const secondaryNiches = secondaryNichesStr ? JSON.parse(secondaryNichesStr) : [];
        const travelStyle = travelStyleStr ? JSON.parse(travelStyleStr) : [];
        const contentTypes = contentTypesStr ? JSON.parse(contentTypesStr) : [];
        const audienceAge = audienceAgeStr ? JSON.parse(audienceAgeStr) : [];
        const audienceLocation = audienceLocationStr ? JSON.parse(audienceLocationStr) : [];
        const portfolioImages = portfolioImagesStr ? JSON.parse(portfolioImagesStr) : [];

        // Check for profile image URL from form data (already uploaded)
        if (profileImageUrlFromForm) {
          profileImageUrl = profileImageUrlFromForm;
          console.log('✅ Using pre-uploaded profile image URL:', profileImageUrl);
        } else if (profileImageFile) {
          // Fallback to file upload if file is provided
          console.log('📁 Processing profile image from FormData...');
          try {
            const { uploadCreatorProfileImage } = await import('@/lib/utils/storageUtils');
            profileImageUrl = await uploadCreatorProfileImage(profileImageFile, session.user.id);
            console.log('✅ Profile image uploaded successfully:', profileImageUrl);
          } catch (uploadError) {
            console.error('❌ Profile image upload failed:', uploadError);
            return NextResponse.json({ error: 'Failed to upload profile image' }, { status: 500 });
          }
        }

        body = {
          firstName,
          lastName,
          displayName,
          bio,
          location,
          instagram,
          tiktok,
          youtube,
          twitter,
          website,
          primaryNiche,
          secondaryNiches,
          travelStyle,
          contentTypes,
          totalFollowers,
          primaryPlatform,
          audienceAge,
          audienceGender,
          audienceLocation,
          engagementRate,
          portfolioImages
        };

      } catch (formDataError) {
        console.error('❌ FormData parsing failed:', formDataError);
        return NextResponse.json({
          error: 'Invalid form data provided',
          details: formDataError instanceof Error ? formDataError.message : 'Unknown error'
        }, { status: 400 });
      }

    } else if (contentType?.includes('application/json')) {
      console.log('📋 Processing JSON request...');

      try {
        const jsonData = await request.json();
        body = jsonData;
        profileImageUrl = jsonData.profileImageUrl || null;
      } catch (jsonError) {
        console.error('❌ JSON parsing failed:', jsonError);
        return NextResponse.json({
          error: 'Invalid JSON data provided'
        }, { status: 400 });
      }
    } else {
      return NextResponse.json({
        error: 'Unsupported content type',
        details: `Expected multipart/form-data or application/json`
      }, { status: 400 });
    }

    console.log('🔄 Validating data...');
    const validatedData = creatorOnboardingSchema.parse(body);
    console.log('✅ Data validation successful');

    const userId = session.user.id;

    const { data: existingCreator } = await supabaseAdmin
      .from('creators')
      .select('id')
      .eq('user_id', userId)
      .single();

    let error: unknown = null;

    const audienceInfo = {
      age: validatedData.audienceAge || [],
      gender: validatedData.audienceGender || '',
      location: validatedData.audienceLocation || []
    };

    const profileData = {
      first_name: validatedData.firstName,
      last_name: validatedData.lastName,
      display_name: validatedData.displayName,
      bio: validatedData.bio || null,
      city: validatedData.location?.split(',')[0]?.trim() || null,
      state: validatedData.location?.split(',')[1]?.trim() || null,
      country: validatedData.location?.split(',')[2]?.trim() || null,
      profile_photo: profileImageUrl,
      instagram: validatedData.instagram || null,
      tiktok: validatedData.tiktok || null,
      youtube: validatedData.youtube || null,
      twitter: validatedData.twitter || null,
      website: validatedData.website || null,
      primary_niche: validatedData.primaryNiche,
      secondary_niches: validatedData.secondaryNiches || [],
      travel_style: validatedData.travelStyle || [],
      work_types: validatedData.contentTypes || [],
      total_followers: validatedData.totalFollowers || null,
      primary_platform: validatedData.primaryPlatform || null,
      audience_info: audienceInfo,
      engagement_rate: validatedData.engagementRate || null,
      portfolio_images: validatedData.portfolioImages || [],
      is_onboarding_complete: true,
      updated_at: new Date().toISOString()
    };

    if (existingCreator) {
      console.log('📝 Updating existing creator profile...');
      const updateResult = await supabaseAdmin
        .from('creators')
        .update(profileData)
        .eq('id', existingCreator.id);

      error = updateResult.error;

      if (!error) {
        console.log('✅ Creator profile updated:', existingCreator.id);
      }
    } else {
      console.log('📝 Creating new creator profile...');
      const insertResult = await supabaseAdmin
        .from('creators')
        .insert({
          user_id: userId,
          email: session.user.email || '',
          ...profileData,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      error = insertResult.error;

      if (insertResult.data && !error) {
        console.log('✅ Creator profile created:', insertResult.data.id);
      }
    }

    if (error) {
      const supabaseError = error as { message?: string; code?: string; details?: string; hint?: string };
      console.error('❌ Supabase error details:', {
        message: supabaseError.message,
        code: supabaseError.code,
        details: supabaseError.details,
        hint: supabaseError.hint
      });

      if (supabaseError.code === '23505') {
        return NextResponse.json({ error: 'Profile already exists for this user' }, { status: 409 });
      }
      if (supabaseError.code === '42501') {
        return NextResponse.json({ error: 'Permission denied to save profile' }, { status: 403 });
      }

      return NextResponse.json({
        error: 'Failed to save profile',
        details: supabaseError.message || 'Unknown database error'
      }, { status: 500 });
    }

    console.log('✅ Creator onboarding completed successfully');
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('❌ Creator onboarding error:', error);

    if (error instanceof Error && error.message.includes('Invalid')) {
      return NextResponse.json({
        error: 'Invalid request data',
        details: error.message
      }, { status: 400 });
    }

    return NextResponse.json({
      error: 'An unexpected error occurred',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 