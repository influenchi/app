
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreditCard, Building, DollarSign } from "lucide-react";

interface AddFundsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddFundsDialog = ({ open, onOpenChange }: AddFundsDialogProps) => {
  const [fundingMethod, setFundingMethod] = useState("card");
  const [amount, setAmount] = useState("");

  const handleAddFunds = () => {
    console.log('Adding funds:', { amount, method: fundingMethod });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Funds</DialogTitle>
          <DialogDescription>
            Add funds to your account budget
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label>Funding Method</Label>
            <RadioGroup value={fundingMethod} onValueChange={setFundingMethod} className="mt-2">
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <RadioGroupItem value="card" id="card" />
                <CreditCard className="h-4 w-4" />
                <Label htmlFor="card" className="flex-1">Credit/Debit Card</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <RadioGroupItem value="bank" id="bank" />
                <Building className="h-4 w-4" />
                <Label htmlFor="bank" className="flex-1">Bank Account</Label>
              </div>
            </RadioGroup>
          </div>

          <Button onClick={handleAddFunds} className="w-full">
            Add Funds
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddFundsDialog;
