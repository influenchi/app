
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Bell, Mail, Smartphone, Monitor } from "lucide-react";

const NotificationSettings = () => {
  const [notifications, setNotifications] = useState({
    email: {
      campaignUpdates: true,
      creatorMessages: true,
      paymentAlerts: true,
      weeklyReports: false,
      marketingEmails: false
    },
    push: {
      campaignUpdates: true,
      creatorMessages: true,
      paymentAlerts: true,
      urgentAlerts: true
    },
    desktop: {
      browserNotifications: true,
      soundAlerts: false
    }
  });

  const handleNotificationChange = (category: string, setting: string, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: value
      }
    }));
  };

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
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSettings;
