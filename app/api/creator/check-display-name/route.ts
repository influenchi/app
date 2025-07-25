import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const displayName = searchParams.get('displayName');

    if (!displayName || displayName.trim().length === 0) {
      return NextResponse.json({
        available: false,
        message: 'Display name is required'
      });
    }

    // Check if display name is too short
    if (displayName.trim().length < 3) {
      return NextResponse.json({
        available: false,
        message: 'Display name must be at least 3 characters'
      });
    }

    // Check if display name contains only valid characters (alphanumeric, spaces, underscores, hyphens)
    const validPattern = /^[a-zA-Z0-9\s_-]+$/;
    if (!validPattern.test(displayName)) {
      return NextResponse.json({
        available: false,
        message: 'Display name can only contain letters, numbers, spaces, underscores, and hyphens'
      });
    }

    // Query the creators table to check if display name exists
    const { data: existingCreator, error } = await supabaseAdmin
      .from('creators')
      .select('id, display_name')
      .ilike('display_name', displayName.trim())
      .neq('user_id', session.user.id) // Exclude current user's own profile
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Database error:', error);
      return NextResponse.json({
        error: 'Failed to check display name availability'
      }, { status: 500 });
    }

    const isAvailable = !existingCreator;

    // Generate suggestions if name is taken
    let suggestions: string[] = [];
    if (!isAvailable) {
      suggestions = await generateDisplayNameSuggestions(displayName, session.user.id);
    }

    return NextResponse.json({
      available: isAvailable,
      message: isAvailable
        ? 'Display name is available!'
        : 'Display name is already taken',
      suggestions: suggestions.length > 0 ? suggestions : undefined
    });

  } catch (error) {
    console.error('Display name check error:', error);
    return NextResponse.json({
      error: 'Failed to check display name availability'
    }, { status: 500 });
  }
}

async function generateDisplayNameSuggestions(baseName: string, userId: string): Promise<string[]> {
  const suggestions: string[] = [];
  const cleanBaseName = baseName.trim().replace(/\s+/g, '_');

  // Try different variations
  const variations = [
    `${cleanBaseName}_creator`,
    `${cleanBaseName}_official`,
    `${cleanBaseName}${Math.floor(Math.random() * 999) + 1}`,
    `the_${cleanBaseName}`,
    `real_${cleanBaseName}`
  ];

  for (const variation of variations) {
    const { data } = await supabaseAdmin
      .from('creators')
      .select('id')
      .ilike('display_name', variation)
      .neq('user_id', userId)
      .single();

    if (!data && suggestions.length < 3) {
      suggestions.push(variation);
    }

    if (suggestions.length >= 3) break;
  }

  return suggestions;
} 