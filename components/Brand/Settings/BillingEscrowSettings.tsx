
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Plus, ArrowDownToLine } from "lucide-react";
import AddFundsDialog from "./Billing/AddFundsDialog";
import WithdrawDialog from "./Billing/WithdrawDialog";
import PaymentMethodForm from "./Billing/PaymentMethodForm";

const BillingEscrowSettings = () => {
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  const totalBudget = 5000;
  const usedBudget = 2550;
  const availableBudget = totalBudget - usedBudget;
  const usagePercentage = (usedBudget / totalBudget) * 100;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Total Budget</CardTitle>
          <CardDescription>
            Manage your campaign budget and account balance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold">${totalBudget.toLocaleString()}</div>
            <p className="text-muted-foreground">Total Budget</p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Budget Usage</span>
              <span>{usagePercentage.toFixed(1)}%</span>
            </div>
            <Progress value={usagePercentage} className="h-3" />
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="font-semibold text-blue-900">${usedBudget.toLocaleString()}</div>
                <div className="text-sm text-blue-700">Used</div>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="font-semibold text-green-900">${availableBudget.toLocaleString()}</div>
                <div className="text-sm text-green-700">Available</div>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button onClick={() => setShowAddFunds(true)} className="flex-1">
              <Plus className="h-4 w-4 mr-2" />
              Add Funds
            </Button>
            <Button variant="outline" onClick={() => setShowWithdraw(true)} className="flex-1">
              <ArrowDownToLine className="h-4 w-4 mr-2" />
              Withdraw
            </Button>
          </div>
        </CardContent>
      </Card>

      <PaymentMethodForm />

      <AddFundsDialog 
        open={showAddFunds} 
        onOpenChange={setShowAddFunds} 
      />
      
      <WithdrawDialog 
        open={showWithdraw} 
        onOpenChange={setShowWithdraw} 
      />
    </div>
  );
};

export default BillingEscrowSettings;
