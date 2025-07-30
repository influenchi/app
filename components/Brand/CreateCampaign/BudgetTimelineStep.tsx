import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { DollarSign, Info } from "lucide-react";
import { CampaignData } from "./types";
import { useEffect } from "react";

interface BudgetTimelineStepProps {
  campaignData: CampaignData;
  onUpdate: (field: string, value: string | boolean) => void;
  onUpdateBudgetType: (budgetType: 'paid' | 'gifted' | 'affiliate') => void;
}

const BudgetTimelineStep = ({ campaignData, onUpdate, onUpdateBudgetType }: BudgetTimelineStepProps) => {
  // Calculate recommended completion date when start date changes
  useEffect(() => {
    if (campaignData.startDate && !campaignData.completionDate) {
      const startDate = new Date(campaignData.startDate);
      const recommendedDate = new Date(startDate);
      recommendedDate.setMonth(startDate.getMonth() + 1);
      
      const formattedDate = recommendedDate.toISOString().split('T')[0];
      onUpdate('completionDate', formattedDate);
    }
  }, [campaignData.startDate, campaignData.completionDate, onUpdate]);

  // Calculate minimum completion date (2 weeks from start)
  const getMinCompletionDate = () => {
    if (!campaignData.startDate) return '';
    const startDate = new Date(campaignData.startDate);
    const minDate = new Date(startDate);
    minDate.setDate(startDate.getDate() + 14);
    return minDate.toISOString().split('T')[0];
  };

  // Calculate recommended completion date (1 month from start)
  const getRecommendedCompletionDate = () => {
    if (!campaignData.startDate) return '';
    const startDate = new Date(campaignData.startDate);
    const recommendedDate = new Date(startDate);
    recommendedDate.setMonth(startDate.getMonth() + 1);
    return recommendedDate.toISOString().split('T')[0];
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold flex items-center">
        <DollarSign className="h-5 w-5 mr-2" />
        Budget & Timeline
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Budget Type</Label>
          <div className="flex space-x-2 mt-2">
            {['paid', 'gifted', 'affiliate'].map((type) => (
              <Badge
                key={type}
                variant={campaignData.budgetType === type ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => onUpdateBudgetType(type as any)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="budget">
            {campaignData.budgetType === 'paid' ? 'Budget Amount' : 
             campaignData.budgetType === 'gifted' ? 'Product Value' : 
             'Commission Rate'}
          </Label>
          <Input
            id="budget"
            value={campaignData.budget}
            onChange={(e) => onUpdate('budget', e.target.value)}
            placeholder={campaignData.budgetType === 'paid' ? '$500' : 
                        campaignData.budgetType === 'gifted' ? '$200' : 
                        '10%'}
          />
        </div>
      </div>

      {campaignData.budgetType === 'gifted' && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="productServiceDescription">Product Description</Label>
            <Textarea
              id="productServiceDescription"
              value={campaignData.productServiceDescription}
              onChange={(e) => onUpdate('productServiceDescription', e.target.value)}
              placeholder="Describe the product you're offering in exchange..."
              rows={4}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="creatorPurchase"
                checked={campaignData.creatorPurchaseRequired || false}
                onCheckedChange={(checked) => onUpdate('creatorPurchaseRequired', !!checked)}
              />
              <Label htmlFor="creatorPurchase">Creator must purchase product and get refunded</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="productShip"
                checked={campaignData.productShipRequired || false}
                onCheckedChange={(checked) => onUpdate('productShipRequired', !!checked)}
              />
              <Label htmlFor="productShip">Product needs to be shipped to creator</Label>
            </div>
          </div>
        </div>
      )}

      {campaignData.budgetType === 'affiliate' && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="affiliateProgram">Affiliate Program Link</Label>
            <Input
              id="affiliateProgram"
              value={campaignData.affiliateProgram || ''}
              onChange={(e) => onUpdate('affiliateProgram', e.target.value)}
              placeholder="https://example.com/affiliate-signup"
            />
          </div>
          <div>
            <Label htmlFor="productServiceDescription">Program Description</Label>
            <Textarea
              id="productServiceDescription"
              value={campaignData.productServiceDescription}
              onChange={(e) => onUpdate('productServiceDescription', e.target.value)}
              placeholder="Describe your affiliate program details..."
              rows={4}
            />
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate">Campaign Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={campaignData.startDate}
              onChange={(e) => onUpdate('startDate', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="completionDate">Campaign Completion Date</Label>
            <Input
              id="completionDate"
              type="date"
              value={campaignData.completionDate}
              onChange={(e) => onUpdate('completionDate', e.target.value)}
              min={getMinCompletionDate()}
            />
          </div>
        </div>

        {campaignData.startDate && (
          <div className="p-3 bg-blue-50 rounded-md">
            <div className="flex items-start space-x-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <p className="font-medium">Recommended completion: {getRecommendedCompletionDate()}</p>
                <p className="text-xs mt-1">We recommend giving creators 1 month to complete tasks. Minimum timeframe is 2 weeks.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetTimelineStep;
