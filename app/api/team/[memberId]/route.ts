import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { NextRequest } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { memberId: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });
    if (!session?.user || session.user.user_type !== 'brand') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { role } = await request.json();
    const { memberId } = params;

    if (!role || !['admin', 'manager', 'member'].includes(role)) {
      return Response.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Check if the current user has permission to update roles
    const { data: currentUserMember } = await supabaseAdmin
      .from('team_members')
      .select('role')
      .eq('brand_id', session.user.id)
      .eq('user_id', session.user.id)
      .eq('status', 'active')
      .single();

    if (!currentUserMember || !['admin'].includes(currentUserMember.role)) {
      return Response.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Update team member role
    const { data: updatedMember, error: updateError } = await supabaseAdmin
      .from('team_members')
      .update({
        role,
        updated_at: new Date().toISOString()
      })
      .eq('id', memberId)
      .eq('brand_id', session.user.id)
      .select('id, user_id, role, status, joined_at')
      .single();

    if (updateError) {
      console.error('Error updating team member:', updateError);
      return Response.json({ error: 'Failed to update team member' }, { status: 500 });
    }

    // Get user details
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, first_name, last_name')
      .eq('id', updatedMember.user_id)
      .single();

    if (userError) {
      console.error('Error fetching user details:', userError);
      return Response.json({ error: 'Failed to fetch user details' }, { status: 500 });
    }

    const formattedMember = {
      id: updatedMember.id,
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
      email: user.email,
      role: updatedMember.role,
      joinedAt: updatedMember.joined_at,
      lastActive: updatedMember.joined_at,
      userId: updatedMember.user_id
    };

    return Response.json({
      message: 'Team member role updated successfully',
      member: formattedMember
    });

  } catch (error) {
    console.error('Error in team member PATCH:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { memberId: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });
    if (!session?.user || session.user.user_type !== 'brand') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { memberId } = params;

    // Check if the current user has permission to remove members
    const { data: currentUserMember } = await supabaseAdmin
      .from('team_members')
      .select('role')
      .eq('brand_id', session.user.id)
      .eq('user_id', session.user.id)
      .eq('status', 'active')
      .single();

    if (!currentUserMember || !['admin'].includes(currentUserMember.role)) {
      return Response.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get the member to check if they're trying to remove themselves or another admin
    const { data: memberToRemove } = await supabaseAdmin
      .from('team_members')
      .select('user_id, role')
      .eq('id', memberId)
      .eq('brand_id', session.user.id)
      .single();

    if (!memberToRemove) {
      return Response.json({ error: 'Team member not found' }, { status: 404 });
    }

    // Prevent removing yourself
    if (memberToRemove.user_id === session.user.id) {
      return Response.json({ error: 'Cannot remove yourself from the team' }, { status: 400 });
    }

    // Remove team member (set status to inactive)
    const { error: removeError } = await supabaseAdmin
      .from('team_members')
      .update({
        status: 'inactive',
        updated_at: new Date().toISOString()
      })
      .eq('id', memberId)
      .eq('brand_id', session.user.id);

    if (removeError) {
      console.error('Error removing team member:', removeError);
      return Response.json({ error: 'Failed to remove team member' }, { status: 500 });
    }

    return Response.json({
      message: 'Team member removed successfully'
    });

  } catch (error) {
    console.error('Error in team member DELETE:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
