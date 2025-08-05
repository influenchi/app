/* eslint-disable @typescript-eslint/no-explicit-any */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Search, Trash2, Copy } from "lucide-react";
import { PaginationWrapper } from "@/components/ui/pagination-wrapper";
import { usePagination } from "@/hooks/usePagination";
import { useState, useMemo } from "react";

interface Campaign {
  id: number;
  title: string;
  status: string;
  applications: number;
  budget: string;
  deadline: string;
  type: string;
  assets: number;
  description: string;
  contentItems: any[];
  targetAudience: any;
  startDate: string;
  completionDate: string;
  image?: string;
}

interface PaginatedCampaignListProps {
  campaigns: Campaign[];
  onViewCampaign: (campaign: Campaign) => void;
  onEditCampaign: (campaign: Campaign) => void;
  onDeleteCampaign?: (campaign: Campaign) => void;
  getStatusColor: (status: string) => string;
}

export function PaginatedCampaignList({
  campaigns,
  onViewCampaign,
  onEditCampaign,
  onDeleteCampaign,
  getStatusColor,
}: PaginatedCampaignListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter campaigns based on search and status
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(campaign => {
      const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [campaigns, searchTerm, statusFilter]);
  const {
    currentPage,
    totalPages,
    paginatedData,
    goToPage,
    itemsPerPage,
  } = usePagination({
    data: filteredCampaigns,
    itemsPerPage: 6, // Show 6 campaigns per page
    initialPage: 1,
  });

  // Marketing and brand-related placeholder images
  const getDefaultImage = (campaign: Campaign) => {
    const title = campaign.title.toLowerCase();

    // Social media campaigns
    if (title.includes('instagram') || title.includes('tiktok') || title.includes('social') || title.includes('influencer')) {
      return 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=200&fit=crop';
    }

    // Product launches
    if (title.includes('launch') || title.includes('product') || title.includes('brand') || title.includes('new')) {
      return 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=200&fit=crop';
    }

    // Fashion/lifestyle campaigns
    if (title.includes('fashion') || title.includes('style') || title.includes('lifestyle') || title.includes('beauty')) {
      return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=200&fit=crop';
    }

    // Tech/digital campaigns
    if (title.includes('tech') || title.includes('digital') || title.includes('app') || title.includes('software')) {
      return 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=200&fit=crop';
    }

    // Fitness/health campaigns
    if (title.includes('fitness') || title.includes('health') || title.includes('wellness') || title.includes('gym')) {
      return 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop';
    }

    // Default fallback - general marketing image
    return 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=200&fit=crop';
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search campaigns by title, description, or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {paginatedData.map((campaign) => (
          <Card
            key={campaign.id}
            className="hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={() => onViewCampaign(campaign)}
          >
            {/* Campaign Image */}
            <div className="relative h-48 overflow-hidden rounded-t-lg">
              <img
                src={campaign.image || getDefaultImage(campaign)}
                alt={campaign.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
              <div className="absolute top-3 right-3">
                <Badge className={getStatusColor(campaign.status)}>
                  {campaign.status}
                </Badge>
              </div>
            </div>

            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg mb-1 group-hover:text-primary transition-colors">
                      {campaign.title}
                    </CardTitle>
                    {campaign.title.includes('(Copy)') && (
                      <Copy className="h-4 w-4 text-amber-500 mb-1" title="This is a duplicated campaign - edit the title to remove (Copy)" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{campaign.type}</p>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Budget:</span>
                  <span className="font-medium">{campaign.budget}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Applications:</span>
                  <span className="font-medium">{campaign.applications}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Assets:</span>
                  <span className="font-medium">{campaign.assets}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Deadline:</span>
                  <span className="font-medium">{campaign.deadline}</span>
                </div>
              </div>

              {campaign.status === 'draft' && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click
                        onEditCampaign(campaign);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Campaign
                    </Button>
                    {onDeleteCampaign && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="px-3"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card click
                          onDeleteCampaign(campaign);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <PaginationWrapper
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={goToPage}
        itemsPerPage={itemsPerPage}
        totalItems={filteredCampaigns.length}
      />
    </div>
  );
}
