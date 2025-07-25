
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Share2 } from "lucide-react";

interface CampaignHeaderProps {
  campaign: any;
  currentStatus: string;
  onBack: () => void;
  onShare: () => void;
  getStatusColor: (status: string) => string;
  getUrgencyColor: (daysLeft: number) => string;
}

const CampaignHeader = ({ 
  campaign, 
  currentStatus, 
  onBack, 
  onShare, 
  getStatusColor, 
  getUrgencyColor 
}: CampaignHeaderProps) => {
  return (
    <div className="mb-8">
      <Button variant="outline" onClick={onBack} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>
      
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{campaign.title}</h1>
          <p className="text-lg text-muted-foreground">{campaign.brand}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Badge className={getStatusColor(currentStatus)}>
            {currentStatus.replace('-', ' ')}
          </Badge>
          {campaign.daysLeft <= 7 && (
            <Badge variant="outline" className={getUrgencyColor(campaign.daysLeft)}>
              {campaign.daysLeft}d left
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignHeader;
