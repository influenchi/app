
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Key, Smartphone, AlertTriangle, CheckCircle } from "lucide-react";

const SecuritySettings = () => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessions] = useState([
    {
      id: 1,
      device: "MacBook Pro",
      location: "New York, NY",
      lastActive: "2 minutes ago",
      current: true,
      browser: "Chrome 120"
    },
    {
      id: 2,
      device: "iPhone 15 Pro",
      location: "New York, NY",
      lastActive: "1 hour ago",
      current: false,
      browser: "Safari Mobile"
    },
    {
      id: 3,
      device: "Windows PC",
      location: "Los Angeles, CA",
      lastActive: "3 days ago",
      current: false,
      browser: "Firefox 119"
    }
  ]);

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  const handleChangePassword = () => {
    // TODO: Implement password change
    console.log('Changing password');
    setShowChangePassword(false);
    setPasswordData({ current: "", new: "", confirm: "" });
  };

  const handleRevokeSession = (sessionId: number) => {
    // TODO: Implement session revocation
    console.log('Revoking session:', sessionId);
  };

  const handleEnable2FA = () => {
    // TODO: Implement 2FA setup
    setTwoFactorEnabled(true);
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
                <Button onClick={handleChangePassword}>
                  Update Password
                </Button>
                <Button variant="outline" onClick={() => setShowChangePassword(false)}>
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
                {twoFactorEnabled ? (
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
                {twoFactorEnabled 
                  ? "Your account is protected with 2FA"
                  : "Enable 2FA to secure your account"
                }
              </p>
            </div>
            <Button 
              variant={twoFactorEnabled ? "outline" : "default"}
              onClick={handleEnable2FA}
            >
              {twoFactorEnabled ? "Manage 2FA" : "Enable 2FA"}
            </Button>
          </div>

          {!twoFactorEnabled && (
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
                  >
                    Revoke
                  </Button>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-4">
            <Button variant="destructive" size="sm">
              Revoke All Other Sessions
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecuritySettings;
