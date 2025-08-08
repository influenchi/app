
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { DollarSign, CreditCard, Building, Plus, AlertCircle, TrendingUp } from "lucide-react";

const PaymentSettings = () => {
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

  const [earnings] = useState({
    totalEarnings: 0,
    pendingPayments: 0,
    thisMonth: 0,
    lastPayout: 0
  });

  const [taxInfo, setTaxInfo] = useState({
    taxId: "",
    businessName: "",
    country: "US",
    state: "CA"
  });

  const [isEditingTax, setIsEditingTax] = useState(false);

  const handleAddPaymentMethod = () => {
    // TODO: Implement add payment method
    console.log('Add payment method');
  };

  const handleTaxInfoChange = (field: string, value: string) => {
    setTaxInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveTaxInfo = () => {
    // TODO: Implement save tax info
    console.log('Saving tax info:', taxInfo);
    setIsEditingTax(false);
  };

  return (
    <div className="space-y-6">
      {/* Earnings Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Earnings Overview
          </CardTitle>
          <CardDescription>
            Track your campaign earnings and payment history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">
                ${earnings.totalEarnings.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Earnings</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                ${earnings.pendingPayments.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Pending Payments</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                ${earnings.thisMonth.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">This Month</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                ${earnings.lastPayout.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Last Payout</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Payment Methods
          </CardTitle>
          <CardDescription>
            Manage how you receive payments from campaigns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentMethods.length === 0 && (
            <div className="text-center p-6 text-muted-foreground">
              No payment methods yet
            </div>
          )}

          <Button onClick={handleAddPaymentMethod} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Payment Method
          </Button>
        </CardContent>
      </Card>

      {/* Tax Information */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Information</CardTitle>
          <CardDescription>
            Required for tax reporting and compliance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You'll need to provide tax information to receive payments over $600 per year.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="taxId">Tax ID / SSN</Label>
              <Input
                id="taxId"
                value={taxInfo.taxId}
                onChange={(e) => handleTaxInfoChange('taxId', e.target.value)}
                disabled={!isEditingTax}
                placeholder="XXX-XX-XXXX"
              />
            </div>
            <div>
              <Label htmlFor="businessName">Business Name (Optional)</Label>
              <Input
                id="businessName"
                value={taxInfo.businessName}
                onChange={(e) => handleTaxInfoChange('businessName', e.target.value)}
                disabled={!isEditingTax}
                placeholder="Your business name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="country">Country</Label>
              <Select
                value={taxInfo.country}
                onValueChange={(value) => handleTaxInfoChange('country', value)}
                disabled={!isEditingTax}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="CA">Canada</SelectItem>
                  <SelectItem value="GB">United Kingdom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="state">State/Province</Label>
              <Input
                id="state"
                value={taxInfo.state}
                onChange={(e) => handleTaxInfoChange('state', e.target.value)}
                disabled={!isEditingTax}
                placeholder="CA"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            {isEditingTax ? (
              <>
                <Button variant="outline" onClick={() => setIsEditingTax(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveTaxInfo}>
                  Save Tax Info
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditingTax(true)}>
                Edit Tax Information
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSettings;
