
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, MoreHorizontal, Trash2, Edit } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EditRoleDialog from "./Team/EditRoleDialog";
import DeleteMemberDialog from "./Team/DeleteMemberDialog";

const TeamManagementSettings = () => {
  const [teamMembers, setTeamMembers] = useState([
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah@techcorp.com",
      role: "Admin",
      status: "Active",
      joinedDate: "2023-06-15",
      avatar: "/placeholder.svg"
    },
    {
      id: 2,
      name: "Mike Chen",
      email: "mike@techcorp.com",
      role: "Manager",
      status: "Active",
      joinedDate: "2023-08-20",
      avatar: "/placeholder.svg"
    },
    {
      id: 3,
      name: "Emily Davis",
      email: "emily@techcorp.com",
      role: "Member",
      status: "Pending",
      joinedDate: "2024-01-10",
      avatar: "/placeholder.svg"
    }
  ]);

  const [inviteData, setInviteData] = useState({ email: "", role: "" });
  const [editingMember, setEditingMember] = useState<any>(null);
  const [deletingMember, setDeletingMember] = useState<any>(null);

  const handleInviteUser = () => {

    setInviteData({ email: "", role: "" });
  };

  const handleUpdateRole = (updatedMember: any) => {
    setTeamMembers(prev => prev.map(member => 
      member.id === updatedMember.id ? updatedMember : member
    ));
  };

  const handleDeleteMember = (memberToDelete: any) => {
    setTeamMembers(prev => prev.filter(member => member.id !== memberToDelete.id));
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'destructive';
      case 'Manager': return 'default';
      case 'Member': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case 'Active': return 'text-emerald-700 border-emerald-300 bg-emerald-100';
      case 'Pending': return 'text-amber-700 border-amber-300 bg-amber-100';
      case 'Inactive': return 'text-red-700 border-red-300 bg-red-100';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Team Management</CardTitle>
          <CardDescription>
            Manage your team members and their access permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-medium">Team Members ({teamMembers.length})</h3>
              <p className="text-sm text-muted-foreground">
                Manage who has access to your brand account
              </p>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Team Member</DialogTitle>
                  <DialogDescription>
                    Send an invitation to add a new team member
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="colleague@company.com"
                      value={inviteData.email}
                      onChange={(e) => setInviteData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select onValueChange={(value) => setInviteData(prev => ({ ...prev, role: value }))}>
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
                  <Button onClick={handleInviteUser} className="w-full">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Invitation
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{member.name}</h4>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                    <p className="text-xs text-muted-foreground">Joined {member.joinedDate}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Badge variant={getRoleBadgeColor(member.role)}>
                    {member.role}
                  </Badge>
                  <Badge variant="outline" className={getStatusBadgeStyles(member.status)}>
                    {member.status}
                  </Badge>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setEditingMember(member)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Role
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive" 
                        onClick={() => setDeletingMember(member)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove Member
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
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
                <Badge variant="secondary">Member</Badge>
              </div>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• View campaigns</li>
                <li>• Comment on campaigns</li>
                <li>• View analytics</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <Badge variant="default">Manager</Badge>
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
                <Badge variant="destructive">Admin</Badge>
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

      <EditRoleDialog
        member={editingMember}
        open={!!editingMember}
        onOpenChange={(open) => !open && setEditingMember(null)}
        onUpdate={handleUpdateRole}
      />

      <DeleteMemberDialog
        member={deletingMember}
        open={!!deletingMember}
        onOpenChange={(open) => !open && setDeletingMember(null)}
        onDelete={handleDeleteMember}
      />
    </div>
  );
};

export default TeamManagementSettings;
