
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, Key, Smartphone, AlertTriangle, CheckCircle, Loader2, Clock } from "lucide-react";
import { toast } from "sonner";
import {
  useChangePassword,
  useTwoFactorStatus,
  useTwoFactorSetup,
  useSessions,
  useRevokeSession
} from "@/lib/hooks/useSecuritySettings";

const SecuritySettings = () => {
  // Hooks
  const { data: twoFactorStatus, isLoading: loading2FA } = useTwoFactorStatus();
  const { data: sessions, isLoading: loadingSessions, refetch: refetchSessions } = useSessions();
  const changePasswordMutation = useChangePassword();
  const twoFactorSetupMutation = useTwoFactorSetup();
  const revokeSessionMutation = useRevokeSession();

  // Local state
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  const handleChangePassword = async () => {
    if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (passwordData.new !== passwordData.confirm) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.new.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    changePasswordMutation.mutate(
      {
        currentPassword: passwordData.current,
        newPassword: passwordData.new
      },
      {
        onSuccess: () => {
          setShowChangePassword(false);
          setPasswordData({ current: "", new: "", confirm: "" });
        }
      }
    );
  };

  const handleRevokeSession = async (sessionId: string) => {
    revokeSessionMutation.mutate({ sessionId });
  };

  const handleRevokeAllSessions = async () => {
    revokeSessionMutation.mutate({ revokeAll: true });
  };

  const handleEnable2FA = async () => {
    if (twoFactorStatus?.twoFactorEnabled) {
      // If already enabled, show management options
      toast.info('2FA management coming soon');
      return;
    }

    // Start 2FA setup process
    twoFactorSetupMutation.mutate({ action: 'generate' });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="h-5 w-5" />
            <span>Password Security</span>
          </CardTitle>
          <CardDescription>
            Manage your account password and security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showChangePassword ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Password</p>
                <p className="text-sm text-muted-foreground">Last changed 3 weeks ago</p>
              </div>
              <Button onClick={() => setShowChangePassword(true)}>
                Change Password
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={passwordData.current}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, current: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={passwordData.new}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, new: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={passwordData.confirm}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirm: e.target.value }))}
                />
              </div>
              <div className="flex space-x-3">
                <Button
                  onClick={handleChangePassword}
                  disabled={changePasswordMutation.isPending}
                  className="bg-primary hover:bg-primary/90"
                >
                  {changePasswordMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowChangePassword(false)}
                  disabled={changePasswordMutation.isPending}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Smartphone className="h-5 w-5" />
            <span>Two-Factor Authentication</span>
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <p className="font-medium">2FA Status</p>
                {loading2FA ? (
                  <Skeleton className="h-5 w-16" />
                ) : twoFactorStatus?.twoFactorEnabled ? (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Enabled
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Disabled
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {loading2FA
                  ? "Loading..."
                  : twoFactorStatus?.twoFactorEnabled
                    ? "Your account is protected with 2FA"
                    : "Enable 2FA to secure your account"
                }
              </p>
            </div>
            <Button
              variant={twoFactorStatus?.twoFactorEnabled ? "outline" : "default"}
              onClick={handleEnable2FA}
              disabled={loading2FA || twoFactorSetupMutation.isPending}
              className={!twoFactorStatus?.twoFactorEnabled ? "bg-primary hover:bg-primary/90" : ""}
            >
              {twoFactorSetupMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Setting up...
                </>
              ) : (
                twoFactorStatus?.twoFactorEnabled ? "Manage 2FA" : "Enable 2FA"
              )}
            </Button>
          </div>

          {!loading2FA && !twoFactorStatus?.twoFactorEnabled && (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Two-factor authentication adds an extra layer of security to your account.
                We recommend enabling it to protect against unauthorized access.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>
            Manage devices that are currently logged into your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingSessions ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-16" />
                </div>
              ))}
            </div>
          ) : sessions && sessions.length > 0 ? (
            <div className="space-y-4">
              {sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-muted rounded-lg">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">{session.device}</p>
                        {session.current && (
                          <Badge variant="default" className="text-xs">
                            Current
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {session.browser} • {session.location}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Last active: {session.lastActive}
                      </p>
                    </div>
                  </div>
                  {!session.current && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRevokeSession(session.id)}
                      disabled={revokeSessionMutation.isPending}
                    >
                      {revokeSessionMutation.isPending ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        'Revoke'
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No active sessions found</p>
              <Button variant="outline" size="sm" onClick={() => refetchSessions()} className="mt-2">
                Refresh
              </Button>
            </div>
          )}

          <div className="mt-4">
            <Button
              variant="destructive"
              size="sm"
              className="bg-red-600 hover:bg-red-700 border-red-600 text-white"
              onClick={handleRevokeAllSessions}
              disabled={revokeSessionMutation.isPending || loadingSessions}
            >
              {revokeSessionMutation.isPending ? (
                <>
                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                  Revoking...
                </>
              ) : (
                'Revoke All Other Sessions'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecuritySettings;
