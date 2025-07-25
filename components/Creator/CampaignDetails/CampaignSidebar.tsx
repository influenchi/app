
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Send } from "lucide-react";

interface ContentItem {
  quantity: number;
  contentType: string;
  socialChannel: string;
}

interface Campaign {
  compensation: string;
  budget_type: string;
  brand: string;
  content_items: ContentItem[];
}

interface CampaignSidebarProps {
  campaign: Campaign;
  currentStatus: string;
  onApplyClick: () => void;
}

const CampaignSidebar = ({ campaign, currentStatus, onApplyClick }: CampaignSidebarProps) => {
  return (
    <div className="lg:col-span-1 space-y-6">
      <div className="bg-muted p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Compensation</h3>
        <p className="text-2xl font-bold text-primary">{campaign.compensation}</p>
        {campaign.budget_type !== 'cash' && (
          <p className="text-sm text-muted-foreground mt-1">{campaign.brand} provides the product/service.</p>
        )}
      </div>

      <div className="bg-muted p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Deliverables</h3>
        <ul className="space-y-2">
          {campaign.content_items?.map((item: ContentItem, index: number) => (
            <li key={index} className="flex items-center">
              <Check className="h-4 w-4 mr-2 text-green-500" />
              <span>{item.quantity} x {item.contentType} on {item.socialChannel}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6">
        {currentStatus === 'active' ? (
          <Button size="lg" className="w-full  bg-purple-600 hover:bg-purple-700" onClick={onApplyClick}>
            <Send className="h-4 w-4 mr-2" />
            Apply Now
          </Button>
        ) : (
          <Button size="lg" className="w-full" disabled>
            Application Submitted
          </Button>
        )}
      </div>
    </div>
  );
};

export default CampaignSidebar;
