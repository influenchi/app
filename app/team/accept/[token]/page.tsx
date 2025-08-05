'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Clock, Shield, Crown, User, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";

interface InvitationData {
  email: string;
  role: string;
  brandName: string;
  inviterName: string;
  expiresAt: string;
  createdAt: string;
}

export default function AcceptInvitationPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();

  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchInvitationDetails();
    }
  }, [token]);

  const fetchInvitationDetails = async () => {
    try {
      const response = await fetch(`/api/team/accept/${token}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to load invitation details');
        return;
      }

      setInvitation(data.invitation);
    } catch (err) {
      setError('Failed to load invitation details');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async () => {
    if (!currentUser) {
      router.push(`/login?redirect=/team/accept/${token}`);
      return;
    }

    setAccepting(true);

    try {
      const response = await fetch(`/api/team/accept/${token}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Failed to accept invitation');
        return;
      }

      toast.success('Successfully joined the team!');
      router.push('/brand/dashboard');
    } catch (err) {
      toast.error('Failed to accept invitation');
    } finally {
      setAccepting(false);
    }
  };

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

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin': return 'Full access to manage team members, billing, and all campaigns';
      case 'manager': return 'Can create campaigns, manage creators, and view analytics';
      default: return 'Can view campaigns, communicate with creators, and access basic features';
    }
  };

  if (loading || userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-muted-foreground">Loading invitation details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Invalid Invitation</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button
              onClick={() => router.push('/login')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitation) {
    return null;
  }

  const isEmailMatch = currentUser?.email === invitation.email;
  const expiresAt = new Date(invitation.expiresAt);
  const isExpired = expiresAt < new Date();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Users className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Team Invitation</CardTitle>
          <p className="text-muted-foreground">
            You've been invited to join a team on Influenchi
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Invitation Details */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Company</span>
              <span className="font-semibold">{invitation.brandName}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Invited by</span>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    {invitation.inviterName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{invitation.inviterName}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Role</span>
              <Badge className={getRoleBadgeColor(invitation.role)}>
                <div className="flex items-center gap-1">
                  {getRoleIcon(invitation.role)}
                  {invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1)}
                </div>
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Email</span>
              <span className="font-medium">{invitation.email}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Expires</span>
              <span className="text-sm flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {expiresAt.toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Role Permissions */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              {getRoleIcon(invitation.role)}
              {invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1)} Permissions
            </h4>
            <p className="text-sm text-muted-foreground">
              {getRoleDescription(invitation.role)}
            </p>
          </div>

          {/* Current User Status */}
          {!currentUser && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> You need to sign in to accept this invitation.
                We'll redirect you back here after login.
              </p>
            </div>
          )}

          {currentUser && !isEmailMatch && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800">
                <strong>Email Mismatch:</strong> This invitation is for {invitation.email}
                but you're signed in as {currentUser.email}. Please sign in with the correct email.
              </p>
            </div>
          )}

          {isExpired && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                <strong>Expired:</strong> This invitation has expired. Please contact the team admin for a new invitation.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => router.push('/')}
              className="flex-1"
            >
              Cancel
            </Button>

            {!currentUser ? (
              <Button
                onClick={() => router.push(`/login?redirect=/team/accept/${token}`)}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Sign In to Accept
              </Button>
            ) : !isEmailMatch ? (
              <Button
                onClick={() => router.push(`/login?redirect=/team/accept/${token}`)}
                variant="outline"
                className="flex-1"
              >
                Sign In with Correct Email
              </Button>
            ) : isExpired ? (
              <Button
                disabled
                className="flex-1 bg-gray-400"
              >
                Invitation Expired
              </Button>
            ) : (
              <Button
                onClick={handleAcceptInvitation}
                disabled={accepting}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {accepting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Accepting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Accept Invitation
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}