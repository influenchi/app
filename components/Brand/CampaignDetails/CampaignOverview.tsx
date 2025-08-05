/* eslint-disable @typescript-eslint/no-explicit-any */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Target, DollarSign, CheckCircle, Package } from "lucide-react";

interface CampaignOverviewProps {
  campaign: any;
}

const CampaignOverview = ({ campaign }: CampaignOverviewProps) => {
  return (
    <div className="space-y-6">
      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">{campaign.description}</p>
        </CardContent>
      </Card>

      {/* Budget Details */}
      {campaign.budgetType && !campaign.budgetType.includes('paid') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Budget Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-600">Types:</span>
                <p className="font-medium capitalize">{Array.isArray(campaign.budgetType) ? campaign.budgetType.join(', ') : campaign.budgetType}</p>
              </div>

              <div>
                <span className="text-sm font-medium text-gray-600">Description:</span>
                <p className="text-gray-700">{campaign.productServiceDescription}</p>
              </div>

              {/* Product Requirements */}
              {(Array.isArray(campaign.budgetType) ? campaign.budgetType.includes('gifted') : campaign.budgetType === 'gifted') && (campaign.creatorPurchaseRequired || campaign.productShipRequired) && (
                <div className="pt-3 border-t">
                  <span className="text-sm font-medium text-gray-600 block mb-3">Product Requirements:</span>
                  <div className="space-y-2">
                    {campaign.creatorPurchaseRequired && (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-gray-700">Creator must purchase product and get refunded</span>
                      </div>
                    )}

                    {campaign.productShipRequired && (
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-gray-700">Product needs to be shipped to creator</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Camera className="h-5 w-5 mr-2" />
            Content Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {campaign.contentItems?.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium">({item.quantity}) {item.contentType}</span>
                  {item.customTitle && (
                    <p className="text-sm font-medium text-gray-800 mt-1">{item.customTitle}</p>
                  )}
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
                <Badge variant="outline">{item.socialChannel}</Badge>
              </div>
            )) || (
                <p className="text-gray-600">{campaign.type}</p>
              )}
          </div>
        </CardContent>
      </Card>

      {/* Target Audience */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Target Audience
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-600">Platform:</span>
              <p>{campaign.targetAudience?.socialChannel || 'Instagram'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Audience Size:</span>
              <p>{Array.isArray(campaign.targetAudience?.audienceSize)
                ? campaign.targetAudience.audienceSize.join(', ')
                : campaign.targetAudience?.audienceSize || '10K-50K followers'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Age Range:</span>
              <p>{Array.isArray(campaign.targetAudience?.ageRange)
                ? campaign.targetAudience.ageRange.join(', ')
                : campaign.targetAudience?.ageRange || '25-35'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Gender:</span>
              <p>{campaign.targetAudience?.gender || 'Any'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Location:</span>
              <p>{Array.isArray(campaign.targetAudience?.location)
                ? campaign.targetAudience.location.join(', ')
                : campaign.targetAudience?.location || 'Worldwide'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Ethnicity:</span>
              <p>{campaign.targetAudience?.ethnicity || 'Any'}</p>
            </div>
          </div>
          {campaign.targetAudience?.interests && campaign.targetAudience.interests.length > 0 && (
            <div className="mt-4">
              <span className="text-sm font-medium text-gray-600">Interests:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {campaign.targetAudience.interests.map((interest: string, index: number) => (
                  <Badge key={index} variant="outline">{interest}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CampaignOverview;
