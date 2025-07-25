
import { useState } from "react";
import { Button } from "@/components/ui/button";
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

interface WithdrawDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WithdrawDialog = ({ open, onOpenChange }: WithdrawDialogProps) => {
  const [withdrawMethod, setWithdrawMethod] = useState("original");
  const [amount, setAmount] = useState("");

  const handleWithdraw = () => {
    console.log('Withdrawing funds:', { amount, method: withdrawMethod });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Withdraw Funds</DialogTitle>
          <DialogDescription>
            Withdraw funds back to your original payment source
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="withdraw-amount">Amount</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="withdraw-amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-10"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Available: $2,450.00
            </p>
          </div>

          <div>
            <Label>Withdraw To</Label>
            <RadioGroup value={withdrawMethod} onValueChange={setWithdrawMethod} className="mt-2">
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <RadioGroupItem value="original" id="original" />
                <CreditCard className="h-4 w-4" />
                <Label htmlFor="original" className="flex-1">Original Payment Source</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <RadioGroupItem value="bank" id="bank-withdraw" />
                <Building className="h-4 w-4" />
                <Label htmlFor="bank-withdraw" className="flex-1">Bank Account</Label>
              </div>
            </RadioGroup>
          </div>

          <Button onClick={handleWithdraw} className="w-full">
            Withdraw Funds
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawDialog;
