import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = session.user;
    let profile = null;

    if (user.user_type === 'creator') {
      const { data: creatorProfile, error } = await supabaseAdmin
        .from('creators')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching creator profile:', error);
        return NextResponse.json({ error: 'Failed to fetch creator profile' }, { status: 500 });
      }
      profile = creatorProfile;
    } else if (user.user_type === 'brand') {
      const { data: brandProfile, error } = await supabaseAdmin
        .from('brands')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching brand profile:', error);
        return NextResponse.json({ error: 'Failed to fetch brand profile' }, { status: 500 });
      }
      profile = brandProfile;
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email || '',
        name: user.name || '',
        user_type: user.user_type as 'brand' | 'creator',
        first_name: user.first_name,
        last_name: user.last_name,
        company_name: user.company_name,
      },
      profile,
    });
  } catch (error) {
    console.error('Error in profile API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 