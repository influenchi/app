import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { NotificationService } from "@/lib/notifications";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });
    if (!session?.user || session.user.user_type !== 'brand') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get team members for the brand
    const { data: teamMembers, error: teamError } = await supabaseAdmin
      .from('team_members')
      .select('id, user_id, role, status, joined_at, created_at')
      .eq('brand_id', session.user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: true });

    if (teamError) {
      console.error('Error fetching team members:', teamError);
      return Response.json({ error: 'Failed to fetch team members' }, { status: 500 });
    }

    // Get user details for team members
    const userIds = teamMembers.map(member => member.user_id);
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, email, first_name, last_name')
      .in('id', userIds);

    if (usersError) {
      console.error('Error fetching user details:', usersError);
      return Response.json({ error: 'Failed to fetch user details' }, { status: 500 });
    }

    // Get pending invitations
    const { data: invitations, error: inviteError } = await supabaseAdmin
      .from('team_invitations')
      .select('*')
      .eq('brand_id', session.user.id)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString());

    if (inviteError) {
      console.error('Error fetching invitations:', inviteError);
      return Response.json({ error: 'Failed to fetch invitations' }, { status: 500 });
    }

    // Format team members
    const formattedMembers = teamMembers.map(member => {
      const user = users.find(u => u.id === member.user_id);
      return {
        id: member.id,
        name: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email : 'Unknown User',
        email: user?.email || '',
        role: member.role,
        joinedAt: member.joined_at,
        lastActive: member.joined_at, // We don't track last active yet
        userId: member.user_id
      };
    });

    return Response.json({
      members: formattedMembers,
      invitations: invitations || []
    });

  } catch (error) {
    console.error('Error in team GET:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });
    if (!session?.user || session.user.user_type !== 'brand') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, role } = await request.json();

    if (!email || !role) {
      return Response.json({ error: 'Email and role are required' }, { status: 400 });
    }

    if (!['admin', 'manager', 'member'].includes(role)) {
      return Response.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Check if user is already a team member or has pending invitation
    const { data: existingMember } = await supabaseAdmin
      .from('team_members')
      .select('id')
      .eq('brand_id', session.user.id)
      .eq('user_id', (
        await supabaseAdmin
          .from('users')
          .select('id')
          .eq('email', email)
          .single()
      ).data?.id)
      .single();

    if (existingMember) {
      return Response.json({ error: 'User is already a team member' }, { status: 400 });
    }

    const { data: existingInvitation } = await supabaseAdmin
      .from('team_invitations')
      .select('id')
      .eq('brand_id', session.user.id)
      .eq('email', email)
      .eq('status', 'pending')
      .single();

    if (existingInvitation) {
      return Response.json({ error: 'Invitation already sent to this email' }, { status: 400 });
    }

    // Generate invitation token
    const invitationToken = crypto.randomUUID();

    // Create invitation
    const { data: invitation, error: inviteError } = await supabaseAdmin
      .from('team_invitations')
      .insert({
        brand_id: session.user.id,
        email,
        role,
        invitation_token: invitationToken,
        invited_by: session.user.id
      })
      .select()
      .single();

    if (inviteError) {
      console.error('Error creating invitation:', inviteError);
      return Response.json({ error: 'Failed to create invitation' }, { status: 500 });
    }

    // Get brand details for email
    const { data: brandUser } = await supabaseAdmin
      .from('users')
      .select('first_name, last_name, company_name')
      .eq('id', session.user.id)
      .single();

    const inviterName = brandUser ? `${brandUser.first_name} ${brandUser.last_name}`.trim() : 'Team Admin';
    const brandName = brandUser?.company_name || 'Influenchi Team';

    // Send invitation email
    try {
      await NotificationService.sendTeamInvitation(
        email,
        inviterName,
        brandName,
        role,
        invitationToken
      );
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError);
      // Don't fail the invitation creation if email fails
    }

    return Response.json({
      message: 'Invitation sent successfully',
      invitation
    });

  } catch (error) {
    console.error('Error in team POST:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
