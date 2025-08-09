/* eslint-disable @typescript-eslint/no-explicit-any */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target } from "lucide-react";
import Image from "next/image";

interface CampaignContentProps {
  campaign: any;
}

const CampaignContent = ({ campaign }: CampaignContentProps) => {
  return (
    <div className="lg:col-span-2 space-y-6">
      {/* Campaign Image */}
      {campaign.image && (
        <Card>
          <CardContent className="p-0">
            <div className="aspect-[2/1] overflow-hidden rounded-lg">
              <Image
                src={campaign.image}
                alt={campaign.title}
                className="w-full h-full object-cover"
                width={100}
                height={100}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Description</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="prose prose-sm max-w-none text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: campaign.description }}
          />
        </CardContent>
      </Card>

      {/* Content Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">Content Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaign.content_items && campaign.content_items.length > 0 ? (
              campaign.content_items.map((item: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-lg">({item.quantity}) {item.contentType}</span>
                        <Badge variant="outline">{item.socialChannel}</Badge>
                      </div>
                      {item.customTitle && (
                        <h4 className="font-medium text-foreground mb-2">{item.customTitle}</h4>
                      )}
                      <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-lg">Content Creation</span>
                  <Badge variant="outline">Not specified</Badge>
                </div>
                <p className="text-muted-foreground text-sm">High-quality content showcasing the brand/product</p>
              </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-muted-foreground">Gender:</span>
              <p className="text-foreground">{campaign.target_audience?.gender || 'Any'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Age Range:</span>
              <p className="text-foreground">
                {campaign.target_audience?.ageRange?.join(', ') || 'Any'}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Location:</span>
              <p className="text-foreground">
                {campaign.target_audience?.location?.join(', ') || 'Any'}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Ethnicity:</span>
              <p className="text-foreground">{campaign.target_audience?.ethnicity || 'Any'}</p>
            </div>
            {campaign.target_audience?.interests && campaign.target_audience.interests.length > 0 && (
              <div className="sm:col-span-2">
                <span className="text-sm font-medium text-muted-foreground">Interests:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {campaign.target_audience.interests.map((interest: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CampaignContent;
