/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
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
import Image from "next/image";

interface Campaign {
  id: string;
  title: string;
  description: string;
  image?: string;
  brand_id: string;
  campaign_goal: string[];
  budget: string;
  budget_type: 'paid' | 'gifted' | 'affiliate';
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
  applicationStatus?: 'pending' | 'accepted' | 'rejected' | null;
  brand_name?: string;
}

interface TransformedCampaign {
  id: string;
  title: string;
  brand: string;
  compensation: string;
  location: any;
  deadline: string;
  deliverables: string;
  status: string;
  image: string;
  daysLeft: number;
  description: string;
  budget: string;
  applicationStatus?: 'pending' | 'accepted' | 'rejected' | null;
  budget_type: 'paid' | 'gifted' | 'affiliate';
}

interface ActiveCampaign {
  id: string;
  title: string;
  description: string;
  image?: string;
  budget: string;
  budget_type: 'paid' | 'gifted' | 'affiliate';
  product_service_description?: string;
  completion_date: string;
  content_items: any[];
  target_audience: any;
  status: string;
  applicationId: string;
  applicationStatus: 'pending' | 'accepted' | 'rejected';
  appliedAt: string;
  customQuote?: string;
  brand: string;
  daysLeft: number;
}

interface ActiveProject {
  id: number | string;
  title: string;
  brand: string;
  compensation: string;
  deadline: string;
  status: 'in-progress' | 'pending-review' | 'revision-requested' | 'completed';
  progress: number;
  image: string;
  submissionCount: number;
  maxSubmissions: number;
  originalCampaign?: ActiveCampaign; // Added for ActiveProjectDetails
  tasks?: {
    id: number;
    title: string;
    description: string;
    deadline: string;
    status: string;
    type: string;
    platform: string;
    quantity: string;
  }[];
}

const CreatorDashboard = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('campaigns');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<ActiveProject | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const { toast } = useToast();

  const { currentUser } = useCurrentUser();
  const creatorProfile = currentUser?.profile as CreatorProfileData | null;

  // Force creator onboarding completion
  useEffect(() => {
    if (currentUser?.user?.user_type === 'creator') {
      const profile = currentUser.profile as CreatorProfileData | null;
      if (profile && !profile.is_onboarding_complete) {
        router.replace('/creator/onboarding');
      }
    }
  }, [currentUser, router]);

  // Fetch all active campaigns
  const { data: campaignsData, isLoading: campaignsLoading } = useQuery({
    queryKey: ['campaigns', 'active'],
    queryFn: async () => {
      const response = await fetch('/api/campaigns?status=active', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch campaigns');
      }
      const data = await response.json();
      return data.campaigns as Campaign[];
    }
  });

  // Fetch creator's applications to know which campaigns they've applied to
  const { data: creatorApplications } = useQuery({
    queryKey: ['creator-applications'],
    queryFn: async () => {
      const response = await fetch('/api/creator/applications', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }
      const data = await response.json();
      return data.applications || [];
    },
    enabled: !!currentUser
  });

  // Fetch active campaigns (campaigns the creator has applied to and not rejected)
  const { data: activeCampaignsData, isLoading: activeCampaignsLoading } = useQuery({
    queryKey: ['creator-active-campaigns'],
    queryFn: async () => {
      const response = await fetch('/api/creator/active-campaigns', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch active campaigns');
      }
      const data = await response.json();
      return data.campaigns as ActiveCampaign[];
    }
    // Removed enabled condition - fetch in background for speed
  });

  // Create a map of campaign IDs to application status
  const applicationStatusMap = useMemo(() => {
    if (!creatorApplications) return {};
    const map: Record<string, 'pending' | 'accepted' | 'rejected'> = {};
    creatorApplications.forEach((app: any) => {
      map[app.campaign_id] = app.status;
    });
    return map;
  }, [creatorApplications]);

  // Calculate real stats
  const activeApplicationsCount = useMemo(() => {
    if (!creatorApplications) return 0;
    return creatorApplications.filter((app: any) => app.status === 'pending').length;
  }, [creatorApplications]);

  const acceptedApplicationsCount = useMemo(() => {
    if (!creatorApplications) return 0;
    return creatorApplications.filter((app: any) => app.status === 'accepted').length;
  }, [creatorApplications]);

  const transformedCampaigns: TransformedCampaign[] = useMemo(() => {
    if (!campaignsData) return [];

    return campaignsData.map((campaign: Campaign) => {
      const deliverables = campaign.content_items && campaign.content_items.length > 0
        ? campaign.content_items
          .map(item => `${item.quantity} x ${item.contentType} on ${item.socialChannel}`)
          .join(', ')
        : 'Not specified';

      return {
        id: campaign.id,
        title: campaign.title,
        brand: campaign.brand_name || 'Brand Name',
        compensation: campaign.budget_type === 'paid' ? `$${campaign.budget}` : campaign.product_service_description || 'Product/Service',
        location: campaign.target_audience?.location?.[0] || 'Remote',
        deadline: new Date(campaign.completion_date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        deliverables,
        status: campaign.applicationStatus ? 'applied' : 'active',
        image: campaign.image || "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=200&fit=crop",
        daysLeft: Math.ceil((new Date(campaign.completion_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
        description: campaign.description,
        budget: campaign.budget,
        applicationStatus: campaign.applicationStatus || applicationStatusMap[campaign.id] || null,
        budget_type: campaign.budget_type,
      };
    });
  }, [campaignsData, applicationStatusMap]);

  // Transform active campaigns to ActiveProject format
  const transformedActiveProjects: ActiveProject[] = useMemo(() => {
    if (!activeCampaignsData) return [];

    return activeCampaignsData.map(campaign => {
      // Transform content_items to tasks format
      const tasks = campaign.content_items?.map((item: any) => ({
        id: item.id, // Use the actual content item ID instead of index
        title: `${item.contentType} on ${item.socialChannel}`,
        description: item.description || `Create ${item.quantity} ${item.contentType} for ${item.socialChannel}`,
        deadline: new Date(campaign.completion_date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        status: "pending",
        type: item.contentType.toLowerCase(),
        platform: item.socialChannel,
        quantity: item.quantity
      })) || [];

      return {
        id: campaign.id,
        title: campaign.title,
        brand: campaign.brand,
        compensation: campaign.budget_type === 'paid'
          ? `$${campaign.budget}`
          : campaign.product_service_description || 'Product/Service',
        deadline: new Date(campaign.completion_date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        status: 'in-progress' as const, // Since these are accepted campaigns
        progress: 0, // Will be calculated based on actual submissions
        image: campaign.image || "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=200&fit=crop",
        submissionCount: 0, // This would come from tracking submissions
        maxSubmissions: campaign.content_items?.length || 1,
        originalCampaign: campaign,
        budget: campaign.budget,
        tasks
      };
    });
  }, [activeCampaignsData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'applied':
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'accepted':
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
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'applied' && campaign.applicationStatus) ||
      (statusFilter === 'active' && !campaign.applicationStatus);
    const matchesSearch = campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const newCampaignsCount = transformedCampaigns.filter(c => !c.applicationStatus).length;

  // Check if creator should see vetting highlight
  const shouldShowVettingHighlight = creatorProfile &&
    !creatorProfile.is_vetted &&
    creatorProfile.vetting_status !== 'pending' &&
    creatorProfile.is_onboarding_complete;

  // Handle URL parameters for deep linking to active projects
  useEffect(() => {
    const projectId = searchParams?.get('project');
    if (projectId) {
      // First try to find in active projects
      if (transformedActiveProjects.length > 0) {
        const activeProject = transformedActiveProjects.find(p => p.id === projectId);
        if (activeProject) {
          setSelectedProject(activeProject);
          setActiveTab('active');
          return;
        }
      }

      // If not found in active projects, check if it's a campaign the creator has applied to
      if (campaignsData && creatorApplications) {
        const campaign = campaignsData.find(c => c.id === projectId);
        const application = creatorApplications.find((app: any) => app.campaign_id === projectId);

        if (campaign && application) {
          // Transform campaign into project format for ActiveProjectDetails
          const projectFromCampaign: ActiveProject = {
            id: campaign.id,
            title: campaign.title,
            brand: campaign.brand_name || 'Brand Name',
            compensation: campaign.budget_type === 'paid' ? `$${campaign.budget}` : campaign.product_service_description || 'Product/Service',
            deadline: new Date(campaign.completion_date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            }),
            status: application.status === 'accepted' ? 'in-progress' as const : 'pending-review' as const,
            progress: 0,
            image: campaign.image || "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=200&fit=crop",
            submissionCount: 0,
            maxSubmissions: campaign.content_items?.length || 1,
            originalCampaign: {
              id: campaign.id,
              title: campaign.title,
              description: campaign.description,
              image: campaign.image,
              budget: campaign.budget,
              budget_type: campaign.budget_type,
              product_service_description: campaign.product_service_description,
              completion_date: campaign.completion_date,
              content_items: campaign.content_items || [],
              target_audience: campaign.target_audience || {},
              status: campaign.status,
              applicationId: application.id,
              applicationStatus: application.status,
              appliedAt: application.created_at || new Date().toISOString(),
              customQuote: application.custom_quote,
              brand: campaign.brand_name || 'Brand Name',
              daysLeft: Math.ceil((new Date(campaign.completion_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
            },
            tasks: campaign.content_items?.map((item: any) => ({
              id: item.id, // Use the actual content item ID instead of index
              title: `${item.contentType} on ${item.socialChannel}`,
              description: item.description || `Create ${item.quantity} ${item.contentType} for ${item.socialChannel}`,
              deadline: new Date(campaign.completion_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              }),
              status: "pending",
              type: item.contentType.toLowerCase(),
              platform: item.socialChannel,
              quantity: item.quantity
            })) || []
          };

          setSelectedProject(projectFromCampaign);
          setActiveTab('active');
        }
      }
    }
  }, [searchParams, transformedActiveProjects, campaignsData, creatorApplications]);

  const handleCampaignClick = (campaign: TransformedCampaign) => {
    setSelectedCampaignId(campaign.id);
  };

  const handleApplyClick = (campaign: TransformedCampaign) => {
    setSelectedCampaignId(campaign.id);
    setShowApplicationModal(false);
  };

  const handleApplicationSubmit = () => {
    setShowApplicationModal(false);

    showConfetti();

    toast({
      title: "Application Submitted!",
      description: "Your application has been successfully submitted to the brand.",
    });
  };

  const handleProjectClick = (project: ActiveProject) => {
    // Find the full project data with original campaign
    const fullProject = transformedActiveProjects.find(p => p.id === project.id);
    if (fullProject) {
      setSelectedProject(fullProject);
    }
  };

  const handleBackToDashboard = () => {
    setSelectedCampaignId(null);
    setSelectedProject(null);
    // Clear URL parameters when going back
    router.push('/creator/dashboard');
  };

  // Find the original campaign data when one is selected
  const selectedCampaign = selectedCampaignId
    ? campaignsData?.find(campaign => campaign.id === selectedCampaignId)
    : null;

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
        campaign={{
          ...selectedCampaign,
          brand: selectedCampaign.brand_name || 'Brand Name',
          daysLeft: Math.ceil((new Date(selectedCampaign.completion_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
          status: selectedCampaign.applicationStatus ? 'applied' : 'active',
        }}
        onBack={() => setSelectedCampaignId(null)}
        onApply={() => handleApplyClick(transformedCampaigns.find(tc => tc.id === selectedCampaignId)!)}
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

        {/* Only show vetting highlight if conditions are met */}
        {shouldShowVettingHighlight && (
          <div className="mb-8">
            <VettedCreatorHighlight />
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Applications</p>
                  <p className="text-2xl font-bold text-foreground">{activeApplicationsCount}</p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">Pending review</p>
                </div>
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Accepted Collabs</p>
                  <p className="text-2xl font-bold text-foreground">{acceptedApplicationsCount}</p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">Ready to work on</p>
                </div>
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <Award className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Earned</p>
                  <p className="text-2xl font-bold text-foreground">$0</p>
                  <p className="text-xs text-muted-foreground mt-1">Complete campaigns to earn</p>
                </div>
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Star Rating</p>
                  <div className="flex items-center">
                    <p className="text-2xl font-bold text-foreground">—</p>
                    <div className="flex ml-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="h-4 w-4 text-gray-300"
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">No ratings yet</p>
                </div>
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                  <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex space-x-1 mb-6 bg-muted p-1 rounded-lg">
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
            Active Collabs ({acceptedApplicationsCount})
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
                  <SelectItem value="active">Available</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredCampaigns.map((campaign) => (
                <Card key={campaign.id} className="hover:shadow-lg transition-all cursor-pointer border-border group" onClick={() => handleCampaignClick(campaign)}>
                  <div className="relative">
                    <div className="aspect-[2/1] overflow-hidden rounded-t-lg">
                      <Image
                        src={campaign.image}
                        alt={campaign.title}
                        width={100}
                        height={100}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="absolute top-3 right-3 flex gap-2">
                      {campaign.applicationStatus ? (
                        <Badge className={getStatusColor(campaign.applicationStatus)}>
                          {campaign.applicationStatus}
                        </Badge>
                      ) : (
                        <Badge className={getStatusColor('active')}>
                          Available
                        </Badge>
                      )}
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
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-muted-foreground font-medium">{campaign.brand}</p>
                        </div>
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
                        <span className="font-medium text-foreground">
                          {campaign.budget_type === 'paid' ? `$${campaign.budget}` : campaign.compensation}
                        </span>
                      </div>

                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-2" />
                        {campaign.location}
                      </div>

                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-2" />
                        Application Deadline: {campaign.deadline}
                      </div>

                      <div className="flex items-center text-sm text-muted-foreground">{campaign.deliverables}</div>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                      disabled={!!campaign.applicationStatus}
                    >
                      {campaign.applicationStatus ? `${campaign.applicationStatus}` : 'View Details'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredCampaigns.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg">No collabs found</p>
                <p className="text-sm">Try adjusting your filters or search terms</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'active' && (
          <div>
            {activeCampaignsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading your active campaigns...</p>
              </div>
            ) : transformedActiveProjects.length > 0 ? (
              <ActiveProjectsView onProjectClick={handleProjectClick} projects={transformedActiveProjects} />
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg">No active collaborations</p>
                <p className="text-sm">You&apos;ll see accepted campaigns here</p>
              </div>
            )}
          </div>
        )}
      </div>

      {showApplicationModal && selectedCampaignId && (
        <CreatorApplicationModal
          campaign={{
            id: selectedCampaignId,
            title: selectedCampaign?.title || '',
            image: selectedCampaign?.image,
            brand: selectedCampaign?.brand_name || 'Brand Name',
            compensation: selectedCampaign?.budget_type === 'paid'
              ? `$${selectedCampaign.budget}`
              : selectedCampaign?.product_service_description || 'Product/Service',
            deadline: new Date(selectedCampaign?.completion_date || '').toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            }),
            budget: selectedCampaign?.budget,
          }}
          onClose={() => setShowApplicationModal(false)}
          onSubmit={handleApplicationSubmit}
        />
      )}
    </div>
  );
};

export default CreatorDashboard;
