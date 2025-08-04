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

  // Travel-related placeholder images that match campaign content
  const getDefaultImage = (campaign: Campaign) => {
    const title = campaign.title.toLowerCase();

    // Beach/Ocean related
    if (title.includes('beach') || title.includes('ocean') || title.includes('resort') || title.includes('coastal')) {
      return 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=400&h=200&fit=crop'; // ocean wave at beach
    }

    // Mountain related
    if (title.includes('mountain') || title.includes('alpine') || title.includes('peak') || title.includes('hiking')) {
      return 'https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?w=400&h=200&fit=crop'; // river between mountains under white clouds
    }

    // Forest/Nature related
    if (title.includes('forest') || title.includes('nature') || title.includes('wilderness') || title.includes('national park')) {
      return 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=200&fit=crop'; // forest path
    }

    // Desert/Safari related
    if (title.includes('desert') || title.includes('safari') || title.includes('adventure') || title.includes('expedition')) {
      return 'https://images.unsplash.com/photo-1469041797191-50ace28483c3?w=400&h=200&fit=crop'; // five camels on field
    }

    // Scenic/Landscape related
    if (title.includes('scenic') || title.includes('landscape') || title.includes('vista') || title.includes('countryside')) {
      return 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=200&fit=crop'; // landscape photography of mountain hit by sun rays
    }

    // Default fallback - general travel image
    return 'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=400&h=200&fit=crop'; // deer beside trees and mountain
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
