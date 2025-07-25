
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Send } from "lucide-react";

interface CreatorApplicationModalProps {
  campaign: any;
  onClose: () => void;
  onSubmit: () => void;
}

const CreatorApplicationModal = ({ campaign, onClose, onSubmit }: CreatorApplicationModalProps) => {
  const [message, setMessage] = useState("");
  const [customQuote, setCustomQuote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      onSubmit();
    }, 1000);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Apply to Campaign</DialogTitle>
          <DialogDescription>
            Submit your application for this campaign
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Campaign Summary */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {campaign.image && (
                  <img 
                    src={campaign.image} 
                    alt={campaign.title}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate">{campaign.title}</h3>
                  <p className="text-muted-foreground text-sm">{campaign.brand}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      <DollarSign className="h-3 w-3 mr-1" />
                      {campaign.compensation}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Deadline: {campaign.deadline}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Application Message */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium">
              Application Message *
            </Label>
            <Textarea
              id="message"
              placeholder="Tell the brand why you're the perfect fit for this campaign. Mention your relevant experience, audience demographics, and what unique value you can bring to their brand..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[120px] resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {message.length}/500 characters
            </p>
          </div>

          {/* Custom Quote */}
          <div className="space-y-2">
            <Label htmlFor="customQuote" className="text-sm font-medium">
              Custom Quote (Optional)
            </Label>
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <Input
                id="customQuote"
                type="number"
                placeholder="Enter your quote amount"
                value={customQuote}
                onChange={(e) => setCustomQuote(e.target.value)}
                className="flex-1"
                min="0"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              If you'd like to propose a different compensation amount, enter it here. Leave blank to accept the original offer.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              className="flex-1"
              disabled={!message.trim() || isSubmitting}
            >
              {isSubmitting ? (
                "Submitting..."
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Application
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatorApplicationModal;
