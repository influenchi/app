import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { brandOnboardingSchema } from '@/lib/validations/brand';
// No longer needed - Better Auth uses users table directly

export async function POST(request: NextRequest) {
  try {
    console.log('Brand onboarding request received');

    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      console.log('No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Session found for user:', session.user.id);

    // Debug request details
    const contentType = request.headers.get('content-type');
    console.log(' Content-Type:', contentType);

    let body: Record<string, unknown> = {};
    let logoUrl: string | null = null;

    // Handle both FormData and JSON requests
    if (contentType?.includes('multipart/form-data')) {
      console.log(' Processing FormData request...');

      try {
        const formData = await request.formData();

        // Extract form fields
        const brandName = formData.get('brandName') as string;
        const website = formData.get('website') as string;
        const description = formData.get('description') as string;
        const industriesStr = formData.get('industries') as string;
        const socialMediaStr = formData.get('socialMedia') as string;
        const logoFile = formData.get('logo') as File | null;

        console.log(' FormData fields extracted:', {
          brandName,
          website: website || 'empty',
          description: description?.substring(0, 50) + '...',
          industriesStr,
          socialMediaStr,
          hasLogoFile: !!logoFile
        });

        // Parse JSON strings from FormData
        const industries = industriesStr ? JSON.parse(industriesStr) : [];
        const socialMedia = socialMediaStr ? JSON.parse(socialMediaStr) : {};

        // Handle file upload if present
        if (logoFile) {
          console.log(' Processing logo file from FormData...');
          try {
            const { uploadBrandLogo } = await import('@/lib/utils/storageUtils');
            logoUrl = await uploadBrandLogo(logoFile, session.user.id);
            console.log('Logo uploaded successfully:', logoUrl);
          } catch (uploadError) {
            console.error('Logo upload failed:', uploadError);
            return NextResponse.json({ error: 'Failed to upload logo' }, { status: 500 });
          }
        }

        // Prepare body object for validation
        body = {
          brandName,
          website,
          description,
          industries,
          socialMedia,
        };

      } catch (formDataError) {
        console.error('FormData parsing failed:', formDataError);
        const errorMessage = formDataError instanceof Error ? formDataError.message : 'Unknown FormData parsing error';
        return NextResponse.json({
          error: 'Invalid form data provided',
          details: errorMessage
        }, { status: 400 });
      }

    } else if (contentType?.includes('application/json')) {
      console.log(' Processing JSON request...');

      try {
        const jsonData = await request.json();
        console.log('JSON parsed successfully');
        console.log(' Request data keys:', Object.keys(jsonData));

        body = jsonData;
        logoUrl = jsonData.logoUrl || null;

      } catch (jsonError) {
        console.error('JSON parsing failed:', jsonError);
        return NextResponse.json({
          error: 'Invalid JSON data provided',
          details: 'The request body could not be parsed as JSON'
        }, { status: 400 });
      }

    } else {
      console.error('Unsupported content type:', contentType);
      return NextResponse.json({
        error: 'Unsupported content type',
        details: `Expected multipart/form-data or application/json, got: ${contentType}`
      }, { status: 400 });
    }

    console.log('Validating data...');
    const validatedData = brandOnboardingSchema.parse({
      brandName: body.brandName,
      website: body.website,
      description: body.description,
      industries: body.industries,
      socialMedia: body.socialMedia,
    });

    console.log('Data validation successful');
    console.log('  Logo URL:', logoUrl ? 'provided' : 'not provided');

    console.log(' Saving to database...');
    console.log(' User ID from Better Auth:', session.user.id);
    console.log(' User data:', {
      email: session.user.email,
      firstName: session.user.firstName,
      lastName: session.user.lastName,
      companyName: session.user.companyName
    });

    // Better Auth now uses users table with UUIDs directly!
    const userId = session.user.id;

    // Check if brand profile already exists for this user
    const { data: existingBrand } = await supabaseAdmin
      .from('brands')
      .select('id')
      .eq('user_id', userId)
      .single();

    let error: unknown = null;

    if (existingBrand) {
      // Update existing brand profile
      const updateResult = await supabaseAdmin
        .from('brands')
        .update({
          first_name: session.user.firstName || '',
          last_name: session.user.lastName || '',
          company: validatedData.brandName,
          website: validatedData.website || null,
          brand_description: logoUrl
            ? `${validatedData.description}\n\n[LOGO:${logoUrl}]`
            : validatedData.description,
          campaign_types: validatedData.industries?.join(', ') || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingBrand.id);

      error = updateResult.error;

      if (!error) {
        console.log('Brand profile updated:', existingBrand.id);
      }
    } else {
      // Create new brand profile with proper user_id reference
      const insertResult = await supabaseAdmin
        .from('brands')
        .insert({
          user_id: userId, // Better Auth now uses users table with UUIDs directly
          first_name: session.user.firstName || '',
          last_name: session.user.lastName || '',
          email: session.user.email || '',
          company: validatedData.brandName,
          website: validatedData.website || null,
          brand_description: logoUrl
            ? `${validatedData.description}\n\n[LOGO:${logoUrl}]`
            : validatedData.description,
          campaign_types: validatedData.industries?.join(', ') || null,
          selected_plan: 'free',
          is_annual: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      error = insertResult.error;

      if (insertResult.data && !error) {
        console.log('Brand profile created:', insertResult.data.id);
      }
    }

    if (error) {
      const supabaseError = error as any;
      console.error('Supabase error details:', {
        message: supabaseError.message,
        code: supabaseError.code,
        details: supabaseError.details,
        hint: supabaseError.hint,
        fullError: JSON.stringify(error, null, 2)
      });

      // Provide more specific error messages
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

    console.log('Brand onboarding completed successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Brand onboarding error:', error);

    // Handle JSON parsing errors specifically
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON data provided' }, { status: 400 });
    }

    // Handle validation errors
    if (error && typeof error === 'object' && 'issues' in error) {
      console.error(' Validation issues:', error.issues);
      return NextResponse.json({
        error: 'Validation failed',
        details: error.issues
      }, { status: 400 });
    }

    return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
  }
} 