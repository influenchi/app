
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Bell, Mail, Smartphone } from "lucide-react";

const NotificationSettings = () => {
  const [notifications, setNotifications] = useState({
    emailNotifications: {
      newCampaigns: true,
      applicationUpdates: true,
      paymentReminders: true,
      campaignDeadlines: true,
      marketingEmails: false
    },
    pushNotifications: {
      newCampaigns: true,
      applicationUpdates: true,
      messages: true,
      paymentUpdates: true
    },
    smsNotifications: {
      urgentUpdates: false,
      paymentAlerts: false
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

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log('Saving notification settings:', notifications);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Choose what email notifications you'd like to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="new-campaigns">New Campaign Opportunities</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when new campaigns match your profile
              </p>
            </div>
            <Switch
              id="new-campaigns"
              checked={notifications.emailNotifications.newCampaigns}
              onCheckedChange={(checked) => 
                handleNotificationChange('emailNotifications', 'newCampaigns', checked)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="application-updates">Application Updates</Label>
              <p className="text-sm text-muted-foreground">
                Status updates on your campaign applications
              </p>
            </div>
            <Switch
              id="application-updates"
              checked={notifications.emailNotifications.applicationUpdates}
              onCheckedChange={(checked) => 
                handleNotificationChange('emailNotifications', 'applicationUpdates', checked)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="payment-reminders">Payment Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Reminders about upcoming payments and earnings
              </p>
            </div>
            <Switch
              id="payment-reminders"
              checked={notifications.emailNotifications.paymentReminders}
              onCheckedChange={(checked) => 
                handleNotificationChange('emailNotifications', 'paymentReminders', checked)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="campaign-deadlines">Campaign Deadlines</Label>
              <p className="text-sm text-muted-foreground">
                Reminders about upcoming campaign deadlines
              </p>
            </div>
            <Switch
              id="campaign-deadlines"
              checked={notifications.emailNotifications.campaignDeadlines}
              onCheckedChange={(checked) => 
                handleNotificationChange('emailNotifications', 'campaignDeadlines', checked)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="marketing-emails">Marketing & Promotions</Label>
              <p className="text-sm text-muted-foreground">
                Updates about new features and promotional offers
              </p>
            </div>
            <Switch
              id="marketing-emails"
              checked={notifications.emailNotifications.marketingEmails}
              onCheckedChange={(checked) => 
                handleNotificationChange('emailNotifications', 'marketingEmails', checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Manage in-app and browser notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="push-new-campaigns">New Campaign Opportunities</Label>
              <p className="text-sm text-muted-foreground">
                Instant notifications for matching campaigns
              </p>
            </div>
            <Switch
              id="push-new-campaigns"
              checked={notifications.pushNotifications.newCampaigns}
              onCheckedChange={(checked) => 
                handleNotificationChange('pushNotifications', 'newCampaigns', checked)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="push-application-updates">Application Updates</Label>
              <p className="text-sm text-muted-foreground">
                Real-time updates on your applications
              </p>
            </div>
            <Switch
              id="push-application-updates"
              checked={notifications.pushNotifications.applicationUpdates}
              onCheckedChange={(checked) => 
                handleNotificationChange('pushNotifications', 'applicationUpdates', checked)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="push-messages">Messages</Label>
              <p className="text-sm text-muted-foreground">
                New messages from brands and campaign updates
              </p>
            </div>
            <Switch
              id="push-messages"
              checked={notifications.pushNotifications.messages}
              onCheckedChange={(checked) => 
                handleNotificationChange('pushNotifications', 'messages', checked)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="push-payment-updates">Payment Updates</Label>
              <p className="text-sm text-muted-foreground">
                Notifications about payments and earnings
              </p>
            </div>
            <Switch
              id="push-payment-updates"
              checked={notifications.pushNotifications.paymentUpdates}
              onCheckedChange={(checked) => 
                handleNotificationChange('pushNotifications', 'paymentUpdates', checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Smartphone className="h-5 w-5 mr-2" />
            SMS Notifications
          </CardTitle>
          <CardDescription>
            Receive important updates via text message
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sms-urgent">Urgent Updates</Label>
              <p className="text-sm text-muted-foreground">
                Critical notifications that require immediate attention
              </p>
            </div>
            <Switch
              id="sms-urgent"
              checked={notifications.smsNotifications.urgentUpdates}
              onCheckedChange={(checked) => 
                handleNotificationChange('smsNotifications', 'urgentUpdates', checked)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sms-payment">Payment Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Notifications about payment processing and deposits
              </p>
            </div>
            <Switch
              id="sms-payment"
              checked={notifications.smsNotifications.paymentAlerts}
              onCheckedChange={(checked) => 
                handleNotificationChange('smsNotifications', 'paymentAlerts', checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>
          Save Notification Settings
        </Button>
      </div>
    </div>
  );
};

export default NotificationSettings;
