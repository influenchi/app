/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Camera,
  DollarSign,
  MapPin,
  Clock,
  Star,
  Filter,
  Bell,
  Target,
  Award,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CampaignDetailsPage from "@/components/Creator/CampaignDetailsPage";
import ActiveProjectsView from "@/components/Creator/ActiveProjects/ActiveProjectsView";
import ActiveProjectDetails from "@/components/Creator/ActiveProjects/ActiveProjectDetails";
import VettedCreatorHighlight from "@/components/Creator/VettedCreatorHighlight";
import { useCurrentUser, CreatorProfileData } from "@/lib/hooks/useCurrentUser";
import CreatorApplicationModal from "../Creator/CreatorApplicationModal";
import { useToast } from "@/hooks/use-toast";
import { showConfetti } from "@/components/Brand/CreateCampaign/confetti";

interface Campaign {
  id: string;
  title: string;
  description: string;
  image?: string;
  brand_id: string;
  campaign_goal: string[];
  budget: string;
  budget_type: 'cash' | 'product' | 'service';
  product_service_description?: string;
  creator_count: string;
  start_date: string;
  completion_date: string;
  content_items: any[];
  target_audience: any;
  requirements?: string;
  creator_purchase_required: boolean;
  product_ship_required: boolean;
  status: string;
  applicant_count: number;
  created_at: string;
  updated_at: string;
}

interface TransformedCampaign {
  id: string;
  title: string;
  brand: string;
  compensation: string;
  location: any;
  deadline: string;
  type: any;
  status: string;
  image: string;
  daysLeft: number;
  description: string;
}

const CreatorDashboard = () => {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState<TransformedCampaign | null>(null);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const { toast } = useToast();

  const { currentUser } = useCurrentUser();
  const creatorProfile = currentUser?.profile as CreatorProfileData | null;

  const { data: campaignsData, isLoading: campaignsLoading } = useQuery({
    queryKey: ['campaigns', 'active'],
    queryFn: async () => {
      const response = await fetch('/api/campaigns?status=active');
      if (!response.ok) {
        throw new Error('Failed to fetch campaigns');
      }
      const data = await response.json();
      return data.campaigns as Campaign[];
    }
  });

  const transformedCampaigns: TransformedCampaign[] = campaignsData?.map((campaign: Campaign) => ({
    id: campaign.id,
    title: campaign.title,
    brand: 'Brand Name',
    compensation: campaign.budget_type === 'cash' ? `$${campaign.budget}` : campaign.product_service_description || 'Product/Service',
    location: campaign.target_audience?.location?.[0] || 'Remote',
    deadline: new Date(campaign.completion_date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }),
    type: campaign.content_items?.[0]?.contentType || 'Content Creation',
    status: 'active',
    image: campaign.image || "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=200&fit=crop",
    daysLeft: Math.ceil((new Date(campaign.completion_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
    description: campaign.description
  })) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'applied': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (daysLeft: number) => {
    if (daysLeft <= 3) return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400';
    if (daysLeft <= 7) return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400';
    return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400';
  };

  const filteredCampaigns = transformedCampaigns.filter(campaign => {
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    const matchesSearch = campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const newCampaignsCount = transformedCampaigns.filter(c => c.status === 'active').length;

  const handleCampaignClick = (campaign: TransformedCampaign) => {
    setSelectedCampaign(campaign);
  };

  const handleApplyClick = (campaign: TransformedCampaign) => {
    setSelectedCampaign(campaign);
    setShowApplicationModal(true);
  };

  const handleApplicationSubmit = () => {
    setShowApplicationModal(false);

    showConfetti();

    toast({
      title: "Application Submitted!",
      description: "Your application has been successfully submitted to the brand.",
    });
  };

  const handleProjectClick = (project: any) => {
    setSelectedProject(project);
  };

  const handleBackToDashboard = () => {
    setSelectedCampaign(null);
    setSelectedProject(null);
  };

  if (campaignsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  if (selectedProject) {
    return (
      <ActiveProjectDetails
        project={selectedProject}
        onBack={handleBackToDashboard}
      />
    );
  }

  if (selectedCampaign && !showApplicationModal) {
    return (
      <CampaignDetailsPage
        campaign={selectedCampaign}
        onBack={() => setSelectedCampaign(null)}
        onApply={() => handleApplyClick(selectedCampaign)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-foreground">Creator Dashboard</h1>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                <Bell className="h-3 w-3 mr-1" />
                {newCampaignsCount} New Collabs
              </Badge>
            </div>
          </div>
          <p className="text-muted-foreground">Discover amazing brand partnerships and grow your influence</p>
        </div>

        <div className="mb-8">
          <VettedCreatorHighlight />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Stats Cards */}
        </div>

        <div className="flex space-x-1 mb-6 bg-muted p-1 rounded-lg inline-flex">
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'campaigns'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            Browse Collabs
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'active'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            Active Collabs
          </button>
        </div>

        {activeTab === 'campaigns' && (
          <>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search collabs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Collabs</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredCampaigns.map((campaign) => (
                <Card key={campaign.id} className="hover:shadow-lg transition-all cursor-pointer border-border group" onClick={() => handleCampaignClick(campaign)}>
                  <div className="relative">
                    <div className="aspect-[2/1] overflow-hidden rounded-t-lg">
                      <img
                        src={campaign.image}
                        alt={campaign.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="absolute top-3 right-3 flex gap-2">
                      <Badge className={getStatusColor(campaign.status)}>
                        {campaign.status.replace('-', ' ')}
                      </Badge>
                      {campaign.daysLeft <= 7 && (
                        <Badge className={`${getUrgencyColor(campaign.daysLeft)} border-0`}>
                          {campaign.daysLeft}d left
                        </Badge>
                      )}
                    </div>
                  </div>

                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1 text-foreground group-hover:text-primary transition-colors">
                          {campaign.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground font-medium">{campaign.brand}</p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {campaign.description}
                    </p>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                        <span className="font-medium text-foreground">{campaign.compensation}</span>
                      </div>

                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-2" />
                        {campaign.location}
                      </div>

                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-2" />
                        Application Deadline: {campaign.deadline}
                      </div>

                      <div className="flex items-center text-sm text-muted-foreground">
                        <Camera className="h-4 w-4 mr-2" />
                        {campaign.type}
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                      onClick={() => handleApplyClick(campaign)}
                    >
                      View Details & Apply
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredCampaigns.length === 0 && (
              <div className="text-center py-12">
                <div className="text-muted-foreground">
                  <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No collabs found</p>
                  <p className="text-sm">Try adjusting your filters or search terms</p>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'active' && (
          <ActiveProjectsView onProjectClick={handleProjectClick} />
        )}
      </div>

      {showApplicationModal && selectedCampaign && (
        <CreatorApplicationModal
          campaign={selectedCampaign}
          onClose={() => setShowApplicationModal(false)}
          onSubmit={handleApplicationSubmit}
        />
      )}
    </div>
  );
};

export default CreatorDashboard;
