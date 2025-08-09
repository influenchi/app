
import { Button } from "@/components/ui/button";
import { Share2, ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Campaign {
  title: string;
  brand: string;
  daysLeft: number;
  brand_logo?: string;
}

interface CampaignHeaderProps {
  campaign: Campaign;
  currentStatus: string;
  onBack: () => void;
  onShare: () => void;
  getStatusColor: (status: string) => string;
  getUrgencyColor: (daysLeft: number) => string;
}

const CampaignHeader = ({ campaign, currentStatus, onBack, onShare, getStatusColor, getUrgencyColor }: CampaignHeaderProps) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Campaigns
        </Button>
        <Button variant="outline" size="sm" onClick={onShare}>
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </div>
      <div className="flex flex-col md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">{campaign.title}</h1>
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={campaign.brand_logo || '/placeholder.svg'} />
              <AvatarFallback className="text-[10px]">{(campaign.brand?.[0] || 'B').toUpperCase()}</AvatarFallback>
            </Avatar>
            <p className="text-lg text-muted-foreground">{campaign.brand}</p>
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentStatus)}`}>
            {currentStatus.replace('-', ' ')}
          </div>
          <p className={`text-sm mt-2 font-medium ${getUrgencyColor(campaign.daysLeft)}`}>
            {campaign.daysLeft} days left to apply
          </p>
        </div>
      </div>
    </div>
  );
};

export default CampaignHeader;
