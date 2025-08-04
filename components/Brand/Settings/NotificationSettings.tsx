
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bell, Mail, Smartphone, Monitor, Loader2, AlertTriangle, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotificationSettings, useUpdateNotificationSettings, type NotificationSettings } from "@/lib/hooks/useNotificationSettings";

const NotificationSettings = () => {
  const { data: notifications, isLoading, error, refetch } = useNotificationSettings();
  const updateNotificationsMutation = useUpdateNotificationSettings();

  const handleNotificationChange = (category: string, setting: string, value: boolean) => {
    if (!notifications) return;

    const updatedNotifications: NotificationSettings = {
      ...notifications,
      [category]: {
        ...notifications[category as keyof NotificationSettings],
        [setting]: value
      }
    };

    // Optimistically update and save to server
    updateNotificationsMutation.mutate(updatedNotifications);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-96" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-6 w-11" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Failed to load notification settings. Please try again.</span>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!notifications) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5" />
            <span>Email Notifications</span>
          </CardTitle>
          <CardDescription>
            Configure what email notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="campaign-updates-email">Campaign Updates</Label>
              <p className="text-sm text-muted-foreground">Get notified about campaign status changes</p>
            </div>
            <Switch
              id="campaign-updates-email"
              checked={notifications.email.campaignUpdates}
              onCheckedChange={(checked) => handleNotificationChange('email', 'campaignUpdates', checked)}
              disabled={updateNotificationsMutation.isPending}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="creator-messages-email">Creator Messages</Label>
              <p className="text-sm text-muted-foreground">Receive emails when creators send messages</p>
            </div>
            <Switch
              id="creator-messages-email"
              checked={notifications.email.creatorMessages}
              onCheckedChange={(checked) => handleNotificationChange('email', 'creatorMessages', checked)}
              disabled={updateNotificationsMutation.isPending}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="payment-alerts-email">Payment Alerts</Label>
              <p className="text-sm text-muted-foreground">Important payment and billing notifications</p>
            </div>
            <Switch
              id="payment-alerts-email"
              checked={notifications.email.paymentAlerts}
              onCheckedChange={(checked) => handleNotificationChange('email', 'paymentAlerts', checked)}
              disabled={updateNotificationsMutation.isPending}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="weekly-reports-email">Weekly Reports</Label>
              <p className="text-sm text-muted-foreground">Summary of your campaign performance</p>
            </div>
            <Switch
              id="weekly-reports-email"
              checked={notifications.email.weeklyReports}
              onCheckedChange={(checked) => handleNotificationChange('email', 'weeklyReports', checked)}
              disabled={updateNotificationsMutation.isPending}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="marketing-emails">Marketing Emails</Label>
              <p className="text-sm text-muted-foreground">Product updates and promotional content</p>
            </div>
            <Switch
              id="marketing-emails"
              checked={notifications.email.marketingEmails}
              onCheckedChange={(checked) => handleNotificationChange('email', 'marketingEmails', checked)}
              disabled={updateNotificationsMutation.isPending}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Smartphone className="h-5 w-5" />
            <span>Push Notifications</span>
          </CardTitle>
          <CardDescription>
            Configure mobile and browser push notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="campaign-updates-push">Campaign Updates</Label>
              <p className="text-sm text-muted-foreground">Push notifications for campaign changes</p>
            </div>
            <Switch
              id="campaign-updates-push"
              checked={notifications.push.campaignUpdates}
              onCheckedChange={(checked) => handleNotificationChange('push', 'campaignUpdates', checked)}
              disabled={updateNotificationsMutation.isPending}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="creator-messages-push">Creator Messages</Label>
              <p className="text-sm text-muted-foreground">Push notifications for new messages</p>
            </div>
            <Switch
              id="creator-messages-push"
              checked={notifications.push.creatorMessages}
              onCheckedChange={(checked) => handleNotificationChange('push', 'creatorMessages', checked)}
              disabled={updateNotificationsMutation.isPending}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="urgent-alerts-push">Urgent Alerts</Label>
              <p className="text-sm text-muted-foreground">Critical notifications that need immediate attention</p>
            </div>
            <Switch
              id="urgent-alerts-push"
              checked={notifications.push.urgentAlerts}
              onCheckedChange={(checked) => handleNotificationChange('push', 'urgentAlerts', checked)}
              disabled={updateNotificationsMutation.isPending}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Monitor className="h-5 w-5" />
            <span>Desktop Notifications</span>
          </CardTitle>
          <CardDescription>
            Configure browser and desktop notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="browser-notifications">Browser Notifications</Label>
              <p className="text-sm text-muted-foreground">Show notifications in your browser</p>
            </div>
            <Switch
              id="browser-notifications"
              checked={notifications.desktop.browserNotifications}
              onCheckedChange={(checked) => handleNotificationChange('desktop', 'browserNotifications', checked)}
              disabled={updateNotificationsMutation.isPending}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sound-alerts">Sound Alerts</Label>
              <p className="text-sm text-muted-foreground">Play sound with notifications</p>
            </div>
            <Switch
              id="sound-alerts"
              checked={notifications.desktop.soundAlerts}
              onCheckedChange={(checked) => handleNotificationChange('desktop', 'soundAlerts', checked)}
              disabled={updateNotificationsMutation.isPending}
            />
          </div>
        </CardContent>
      </Card>

      {updateNotificationsMutation.isPending && (
        <div className="flex items-center justify-center p-4 bg-muted/50 rounded-lg">
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          <span className="text-sm text-muted-foreground">Saving notification preferences...</span>
        </div>
      )}
    </div>
  );
};

export default NotificationSettings;
