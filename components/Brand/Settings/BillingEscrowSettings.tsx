
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Zap } from "lucide-react";

const BillingEscrowSettings = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            Billing & Escrow
          </CardTitle>
          <CardDescription>
            Campaign budget management and escrow services
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
            <Zap className="h-10 w-10 text-amber-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
          <p className="text-muted-foreground mb-4">
            We're working on advanced billing and escrow features to make campaign payments even more secure and seamless.
          </p>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Secure escrow services</p>
            <p>• Automated milestone payments</p>
            <p>• Multi-currency support</p>
            <p>• Advanced payment analytics</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingEscrowSettings;
