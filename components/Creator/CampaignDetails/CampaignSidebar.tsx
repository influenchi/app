
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  Clock, 
  Calendar, 
  MapPin, 
  Camera, 
  CheckCircle, 
  Package 
} from "lucide-react";

interface CampaignSidebarProps {
  campaign: any;
  currentStatus: string;
  onApplyClick: () => void;
}

const CampaignSidebar = ({ campaign, currentStatus, onApplyClick }: CampaignSidebarProps) => {
  return (
    <div className="space-y-6">
      {/* Apply Section */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-center">Ready to Apply?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary mb-1">{campaign.compensation}</div>
            <p className="text-sm text-muted-foreground">Total Compensation</p>
          </div>
          
          <div className="flex items-center justify-center p-3 border rounded-lg">
            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm font-medium">
              Application Deadline: {campaign.deadline}
            </span>
          </div>

          <Button 
            onClick={onApplyClick}
            className="w-full"
            disabled={currentStatus !== 'active'}
          >
            {currentStatus === 'applied' ? 'Application Submitted' : 
             currentStatus === 'active' ? 'Apply Now' : 'Application Closed'}
          </Button>
        </CardContent>
      </Card>

      {/* Campaign Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Campaign Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center text-sm">
            <MapPin className="h-4 w-4 mr-3 text-muted-foreground" />
            <div>
              <span className="font-medium">Location</span>
              <p className="text-muted-foreground">{campaign.location}</p>
            </div>
          </div>

          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-3 text-muted-foreground" />
            <div>
              <span className="font-medium">Timeline</span>
              <p className="text-muted-foreground">Application Deadline: {campaign.deadline}</p>
            </div>
          </div>

          <div className="flex items-center text-sm">
            <Camera className="h-4 w-4 mr-3 text-muted-foreground" />
            <div>
              <span className="font-medium">Content Type</span>
              <p className="text-muted-foreground">{campaign.type}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Requirements */}
      {(campaign.budgetType === 'product' && (campaign.creatorPurchaseRequired || campaign.productShipRequired)) && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Requirements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {campaign.creatorPurchaseRequired && (
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Creator purchase & refund required</span>
              </div>
            )}
            
            {campaign.productShipRequired && (
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Product shipping provided</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CampaignSidebar;
