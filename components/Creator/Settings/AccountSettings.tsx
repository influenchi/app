
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Mail, Lock, Smartphone } from "lucide-react";

const AccountSettings = () => {
  const [accountData, setAccountData] = useState({
    email: "sarah.johnson@example.com",
    phone: "+1 (555) 123-4567",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSaveEmail = () => {
    // TODO: Implement save email functionality
    console.log('Saving email:', accountData.email);
    setIsEditingEmail(false);
  };

  const handleSavePhone = () => {
    // TODO: Implement save phone functionality
    console.log('Saving phone:', accountData.phone);
    setIsEditingPhone(false);
  };

  const handleChangePassword = () => {
    // TODO: Implement change password functionality
    console.log('Changing password');
    setIsChangingPassword(false);
    setAccountData(prev => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
  };

  const handleDeleteAccount = () => {
    // TODO: Implement account deletion
    console.log('Delete account requested');
  };

  const handleInputChange = (field: string, value: string) => {
    setAccountData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            Email Address
          </CardTitle>
          <CardDescription>
            Your email address is used for account access and notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                value={accountData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={!isEditingEmail}
              />
            </div>
            <div className="flex space-x-2">
              {isEditingEmail ? (
                <>
                  <Button variant="outline" onClick={() => setIsEditingEmail(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEmail}>
                    Save
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => setIsEditingEmail(true)}>
                  Change Email
                </Button>
              )}
            </div>
          </div>
          {isEditingEmail && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You'll need to verify your new email address before the change takes effect.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Smartphone className="h-5 w-5 mr-2" />
            Phone Number
          </CardTitle>
          <CardDescription>
            Used for SMS notifications and account verification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                value={accountData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={!isEditingPhone}
              />
            </div>
            <div className="flex space-x-2">
              {isEditingPhone ? (
                <>
                  <Button variant="outline" onClick={() => setIsEditingPhone(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSavePhone}>
                    Save
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => setIsEditingPhone(true)}>
                  Change Phone
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lock className="h-5 w-5 mr-2" />
            Password
          </CardTitle>
          <CardDescription>
            Change your account password
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isChangingPassword ? (
            <Button variant="outline" onClick={() => setIsChangingPassword(true)}>
              Change Password
            </Button>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={accountData.currentPassword}
                  onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={accountData.newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={accountData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                />
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" onClick={() => setIsChangingPassword(false)}>
                  Cancel
                </Button>
                <Button onClick={handleChangePassword}>
                  Change Password
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showDeleteConfirm ? (
            <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
              <div>
                <h4 className="font-medium text-destructive">Delete Account</h4>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your creator account and all associated data
                </p>
              </div>
              <Button 
                variant="destructive" 
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete Account
              </Button>
            </div>
          ) : (
            <Alert className="border-destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-3">
                  <p className="font-medium">Are you absolutely sure?</p>
                  <p className="text-sm">
                    This action cannot be undone. This will permanently delete your account,
                    all portfolio content, campaign history, and earnings data.
                  </p>
                  <div className="flex space-x-3">
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={handleDeleteAccount}
                    >
                      Yes, delete my account
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountSettings;
