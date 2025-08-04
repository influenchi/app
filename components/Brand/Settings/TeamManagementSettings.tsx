import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2, Mail, Plus, Shield, Crown, User, Clock, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'member';
  avatar?: string;
  joinedAt: string;
  lastActive: string;
  userId?: string;
}

interface TeamInvitation {
  id: string;
  email: string;
  role: string;
  expires_at: string;
  created_at: string;
}

const TeamManagementSettings = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'manager' | 'member'>('member');
  const [inviting, setInviting] = useState(false);

  // Fetch team data
  const fetchTeamData = async () => {
    try {
      const response = await fetch('/api/team');
      if (!response.ok) {
        throw new Error('Failed to fetch team data');
      }
      const data = await response.json();
      setTeamMembers(data.members);
      setInvitations(data.invitations || []);
    } catch (error) {
      console.error('Error fetching team data:', error);
      toast.error('Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamData();
  }, []);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="h-4 w-4 text-amber-600" />;
      case 'manager': return <Shield className="h-4 w-4 text-blue-600" />;
      default: return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'manager': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleInviteMember = async () => {
    if (!inviteEmail) {
      toast.error('Please enter an email address');
      return;
    }

    try {
      setInviting(true);
      const response = await fetch('/api/team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send invitation');
      }

      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
      setInviteRole('member');
      setShowInviteDialog(false);

      // Refresh team data to show new invitation
      fetchTeamData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: 'admin' | 'manager' | 'member') => {
    try {
      const response = await fetch(`/api/team/${memberId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update role');
      }

      // Update local state
      setTeamMembers(prev =>
        prev.map(member =>
          member.id === memberId ? { ...member, role: newRole } : member
        )
      );
      toast.success('Member role updated successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update role');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const response = await fetch(`/api/team/${memberId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove member');
      }

      // Update local state
      setTeamMembers(prev => prev.filter(member => member.id !== memberId));
      toast.success('Member removed from team');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove member');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Team Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Management
              </CardTitle>
              <CardDescription>
                Manage team members and their permissions
              </CardDescription>
            </div>
            <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Invite Member
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md bg-white">
                <DialogHeader>
                  <DialogTitle>Invite Team Member</DialogTitle>
                  <DialogDescription>
                    Send an invitation to join your team
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="invite-email">Email Address</Label>
                    <Input
                      id="invite-email"
                      type="email"
                      placeholder="Enter email address"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="invite-role">Role</Label>
                    <Select value={inviteRole} onValueChange={(value: 'admin' | 'manager' | 'member') => setInviteRole(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowInviteDialog(false)}
                      disabled={inviting}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleInviteMember}
                      disabled={inviting}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {inviting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4 mr-2" />
                          Send Invitation
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 border rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{teamMembers.length}</div>
              <div className="text-sm text-muted-foreground">Total Members</div>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="text-2xl font-bold text-amber-600">
                {teamMembers.filter(m => m.role === 'admin').length}
              </div>
              <div className="text-sm text-muted-foreground">Admins</div>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">
                {teamMembers.filter(m => m.role === 'manager').length}
              </div>
              <div className="text-sm text-muted-foreground">Managers</div>
            </div>
          </div>

          {/* Team Members List */}
          <div className="space-y-4">
            <h4 className="font-medium">Team Members</h4>
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback>
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="font-medium">{member.name}</h5>
                      <Badge className={getRoleBadgeColor(member.role)}>
                        <div className="flex items-center gap-1">
                          {getRoleIcon(member.role)}
                          {member.role}
                        </div>
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                      <span>Joined {new Date(member.joinedAt).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Last active {new Date(member.lastActive).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Select
                    value={member.role}
                    onValueChange={(value: 'admin' | 'manager' | 'member') => handleRoleChange(member.id, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>

                  {member.role !== 'admin' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveMember(member.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {/* Pending Invitations */}
            {invitations.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium mb-3">Pending Invitations ({invitations.length})</h4>
                <div className="space-y-2">
                  {invitations.map((invitation) => (
                    <div key={invitation.id} className="flex items-center justify-between p-3 border rounded-lg bg-amber-50 border-amber-200">
                      <div>
                        <p className="font-medium text-sm">{invitation.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Invited as {invitation.role} • Expires {new Date(invitation.expires_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Role Permissions */}
      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
          <CardDescription>
            Understand what each role can do in your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
                  <User className="h-3 w-3 mr-1" />
                  Member
                </Badge>
              </div>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• View campaigns</li>
                <li>• Comment on campaigns</li>
                <li>• View analytics</li>
                <li>• Communicate with creators</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                  <Shield className="h-3 w-3 mr-1" />
                  Manager
                </Badge>
              </div>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Create campaigns</li>
                <li>• Manage creators</li>
                <li>• View financial data</li>
                <li>• All Member permissions</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                  <Crown className="h-3 w-3 mr-1" />
                  Admin
                </Badge>
              </div>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Full account access</li>
                <li>• Manage team members</li>
                <li>• Billing & settings</li>
                <li>• All Manager permissions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamManagementSettings;
