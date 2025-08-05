import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const invitationToken = params.token;

    // Get invitation details with brand information
    const { data: invitation, error: inviteError } = await supabaseAdmin
      .from('team_invitations')
      .select(`
        *,
        brand:users!team_invitations_brand_id_fkey(
          id, 
          company_name, 
          first_name, 
          last_name
        ),
        inviter:users!team_invitations_invited_by_fkey(
          first_name, 
          last_name
        )
      `)
      .eq('invitation_token', invitationToken)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .single();

    if (inviteError || !invitation) {
      return Response.json({
        error: 'Invalid or expired invitation'
      }, { status: 400 });
    }

    // Return invitation details (without sensitive data)
    return Response.json({
      invitation: {
        email: invitation.email,
        role: invitation.role,
        brandName: invitation.brand?.company_name || 'Influenchi Team',
        inviterName: `${invitation.inviter?.first_name || ''} ${invitation.inviter?.last_name || ''}`.trim() || 'Team Admin',
        expiresAt: invitation.expires_at,
        createdAt: invitation.created_at
      }
    });

  } catch (error) {
    console.error('Error fetching invitation:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const invitationToken = params.token;

    // Get invitation details
    const { data: invitation, error: inviteError } = await supabaseAdmin
      .from('team_invitations')
      .select('*')
      .eq('invitation_token', invitationToken)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .single();

    if (inviteError || !invitation) {
      return Response.json({
        error: 'Invalid or expired invitation'
      }, { status: 400 });
    }

    // Check if invitation email matches user email
    if (invitation.email !== session.user.email) {
      return Response.json({
        error: 'This invitation is not for your email address'
      }, { status: 400 });
    }

    // Check if user is already a team member
    const { data: existingMember } = await supabaseAdmin
      .from('team_members')
      .select('id')
      .eq('brand_id', invitation.brand_id)
      .eq('user_id', session.user.id)
      .single();

    if (existingMember) {
      return Response.json({
        error: 'You are already a member of this team'
      }, { status: 400 });
    }

    // Create team member
    const { data: newMember, error: memberError } = await supabaseAdmin
      .from('team_members')
      .insert({
        brand_id: invitation.brand_id,
        user_id: session.user.id,
        role: invitation.role,
        invited_by: invitation.invited_by,
        invitation_token: invitationToken,
        status: 'active',
        joined_at: new Date().toISOString()
      })
      .select()
      .single();

    if (memberError) {
      console.error('Error creating team member:', memberError);
      return Response.json({
        error: 'Failed to join team'
      }, { status: 500 });
    }

    // Mark invitation as accepted
    await supabaseAdmin
      .from('team_invitations')
      .update({
        status: 'accepted',
        updated_at: new Date().toISOString()
      })
      .eq('id', invitation.id);

    return Response.json({
      message: 'Successfully joined the team',
      member: newMember
    });

  } catch (error) {
    console.error('Error accepting invitation:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}