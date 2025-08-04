
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Mail } from "lucide-react";

const SubscriptionSettings = () => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
            <Clock className="h-8 w-8 text-amber-600" />
          </div>
          <CardTitle className="text-xl">Subscription Settings</CardTitle>
          <CardDescription>
            This feature is coming soon
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            We're working hard to bring you subscription management features. 
            This will include plan upgrades, billing history, and subscription controls.
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span>Questions? Contact us at</span>
            <a 
              href="mailto:info@influenchi.com" 
              className="text-primary hover:underline"
            >
              info@influenchi.com
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionSettings;
