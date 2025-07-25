
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, CheckCircle, Package } from "lucide-react";

interface CampaignStatsProps {
  campaign: any;
}

const CampaignStats = ({ campaign }: CampaignStatsProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Budget & Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Budget & Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <span className="text-sm font-medium text-gray-600">Budget:</span>
            <p className="font-semibold">{campaign.budget}</p>
            {campaign.budgetType && campaign.budgetType !== 'cash' && (
              <p className="text-sm text-gray-600 mt-1">
                {campaign.productServiceDescription}
              </p>
            )}
          </div>

          {/* Product Options */}
          {campaign.budgetType === 'product' && (
            <div className="space-y-3 pt-3 border-t">
              <h4 className="text-sm font-medium text-gray-700">Product Requirements:</h4>
              
              {campaign.creatorPurchaseRequired && (
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-gray-700">Creator must purchase and get refunded</span>
                </div>
              )}
              
              {campaign.productShipRequired && (
                <div className="flex items-center space-x-2 text-sm">
                  <Package className="h-4 w-4 text-blue-600" />
                  <span className="text-gray-700">Product shipping required</span>
                </div>
              )}
              
              {!campaign.creatorPurchaseRequired && !campaign.productShipRequired && (
                <p className="text-sm text-gray-500">No special product requirements</p>
              )}
            </div>
          )}

          <div>
            <span className="text-sm font-medium text-gray-600">Start Date:</span>
            <p>{campaign.startDate || campaign.deadline}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-600">Completion Date:</span>
            <p>{campaign.completionDate || campaign.deadline}</p>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Image */}
      {campaign.image && (
        <Card>
          <CardHeader>
            <CardTitle>Campaign Image</CardTitle>
          </CardHeader>
          <CardContent>
            <img 
              src={campaign.image} 
              alt="Campaign" 
              className="w-full h-48 object-cover rounded-lg"
            />
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Applications:</span>
            <span className="font-medium">{campaign.applications || 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Assets Created:</span>
            <span className="font-medium">{campaign.assets || 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Status:</span>
            <Badge className={getStatusColor(campaign.status)}>
              {campaign.status}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CampaignStats;
