/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { brandOnboardingSchema } from '@/lib/validations/brand';
import { NotificationService } from '@/lib/notifications';
// No longer needed - Better Auth uses users table directly

export async function POST(request: NextRequest) {
  try {

    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {

      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Debug request details
    const contentType = request.headers.get('content-type');

    let body: Record<string, unknown> = {};
    let logoUrl: string | null = null;

    // Handle both FormData and JSON requests
    if (contentType?.includes('multipart/form-data')) {

      try {
        const formData = await request.formData();

        // Extract form fields
        const brandName = formData.get('brandName') as string;
        const website = formData.get('website') as string;
        const description = formData.get('description') as string;
        const industriesStr = formData.get('industries') as string;
        const socialMediaStr = formData.get('socialMedia') as string;
        const logoFile = formData.get('logo') as File | null;

        // Parse JSON strings from FormData
        const industries = industriesStr ? JSON.parse(industriesStr) : [];
        const socialMedia = socialMediaStr ? JSON.parse(socialMediaStr) : {};

        // Handle file upload if present
        if (logoFile) {

          try {
            const { uploadBrandLogo } = await import('@/lib/utils/storageUtils');
            logoUrl = await uploadBrandLogo(logoFile, session.user.id);

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

      try {
        const jsonData = await request.json();

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

    const validatedData = brandOnboardingSchema.parse({
      brandName: body.brandName,
      website: body.website,
      description: body.description,
      industries: body.industries,
      socialMedia: body.socialMedia,
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
          first_name: session.user.first_name || '',
          last_name: session.user.last_name || '',
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

      }
    } else {
      // Create new brand profile with proper user_id reference
      const insertResult = await supabaseAdmin
        .from('brands')
        .insert({
          user_id: userId, // Better Auth now uses users table with UUIDs directly
          first_name: session.user.first_name || '',
          last_name: session.user.last_name || '',
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

        // Send welcome email for new brand signup
        try {
          await NotificationService.sendBrandWelcome(
            userId,
            session.user.first_name || 'there',
            session.user.email!
          );
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError);
          // Don't fail the onboarding process if email fails
        }
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