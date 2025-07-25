/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Search,
  Calendar,
  DollarSign,
  Camera,
  MapPin,
  Clock,
  Star,
  Filter,
  TrendingUp,
  Award,
  Target,
  Bell
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CampaignDetailsPage from "@/components/Creator/CampaignDetailsPage";
import ActiveProjectsView from "@/components/Creator/ActiveProjects/ActiveProjectsView";
import ActiveProjectDetails from "@/components/Creator/ActiveProjects/ActiveProjectDetails";
import VettedCreatorHighlight from "@/components/Creator/VettedCreatorHighlight";
import { useCurrentUser, CreatorProfileData } from "@/lib/hooks/useCurrentUser";

const CreatorDashboard = () => {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [hasSeenVettedHighlight, setHasSeenVettedHighlight] = useState(false);

  const { currentUser, isLoading } = useCurrentUser();
  const creatorProfile = currentUser?.profile as CreatorProfileData | null;

  // Check if user has seen the vetted highlight before
  useEffect(() => {
    const hasSeenKey = `hasSeenVettedHighlight_${currentUser?.user.id}`;
    const hasSeen = localStorage.getItem(hasSeenKey) === 'true';
    setHasSeenVettedHighlight(hasSeen);
  }, [currentUser?.user.id]);

  // Mark vetted highlight as seen
  const markVettedHighlightAsSeen = () => {
    if (currentUser?.user.id) {
      const hasSeenKey = `hasSeenVettedHighlight_${currentUser.user.id}`;
      localStorage.setItem(hasSeenKey, 'true');
      setHasSeenVettedHighlight(true);
    }
  };

  // Determine if vetted highlight should be expanded
  const shouldExpandVettedHighlight = !creatorProfile?.is_vetted || !hasSeenVettedHighlight;

  const mockCampaigns = [
    {
      id: 1,
      title: "Luxury Beach Resort Content",
      brand: "Paradise Hotels",
      compensation: "$500 + 3 night stay",
      location: "Maldives",
      deadline: "Jan 15, 2025",
      type: "Instagram Reel + Stories",
      status: "active",
      image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=200&fit=crop",
      daysLeft: 5,
      description: "Create stunning content showcasing our luxury beachfront resort with crystal clear waters..."
    },
    {
      id: 2,
      title: "Adventure Gear Testing",
      brand: "Mountain Explorer",
      compensation: "Premium hiking gear package",
      location: "Colorado, USA",
      deadline: "Jan 20, 2025",
      type: "TikTok + Blog Post",
      status: "applied",
      image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=200&fit=crop",
      daysLeft: 10,
      description: "Test our latest hiking gear in challenging mountain conditions and share your experience..."
    },
    {
      id: 3,
      title: "City Food Tour",
      brand: "Local Eats",
      compensation: "$200",
      location: "Tokyo, Japan",
      deadline: "Feb 1, 2025",
      type: "Instagram Posts",
      status: "in-progress",
      image: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=200&fit=crop",
      daysLeft: 22,
      description: "Explore Tokyo's hidden culinary gems and create mouth-watering content for food lovers..."
    },
    {
      id: 4,
      title: "Sustainable Fashion Campaign",
      brand: "EcoWear",
      compensation: "Complete sustainable wardrobe collection",
      location: "Remote",
      deadline: "Jan 12, 2025",
      type: "Instagram Posts + Stories",
      status: "active",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=200&fit=crop",
      daysLeft: 2,
      description: "Showcase our sustainable fashion line and promote eco-conscious lifestyle choices..."
    }
  ];

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

  const filteredCampaigns = mockCampaigns.filter(campaign => {
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    const matchesSearch = campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const newCampaignsCount = mockCampaigns.filter(c => c.status === 'active').length;

  const handleCampaignClick = (campaign: any) => {
    setSelectedCampaign(campaign);
  };

  const handleProjectClick = (project: any) => {
    setSelectedProject(project);
  };

  const handleBackToDashboard = () => {
    setSelectedCampaign(null);
    setSelectedProject(null);
  };

  const handleApply = () => {
    console.log('Apply to campaign');
  };

  // Show project details when a project is selected
  if (selectedProject) {
    return (
      <ActiveProjectDetails
        project={selectedProject}
        onBack={handleBackToDashboard}
      />
    );
  }

  // Show campaign details page when a campaign is selected
  if (selectedCampaign) {
    return (
      <CampaignDetailsPage
        campaign={selectedCampaign}
        onBack={handleBackToDashboard}
        onApply={handleApply}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
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

        {/* Vetted Creator Highlight */}
        <div className="mb-8">
          <VettedCreatorHighlight />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Applications</p>
                  <p className="text-2xl font-bold text-foreground">3</p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">+2 this week</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Completed Collabs</p>
                  <p className="text-2xl font-bold text-foreground">12</p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">+3 this month</p>
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
                  <p className="text-2xl font-bold text-foreground">$2,400</p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">+$500 this month</p>
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
                    <p className="text-2xl font-bold text-foreground">4.8</p>
                    <div className="flex ml-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${star <= 4.8
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                            }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">Excellent rating</p>
                </div>
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                  <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
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

        {/* Content based on active tab */}
        {activeTab === 'campaigns' && (
          <>
            {/* Search and Filters */}
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

            {/* Campaign Cards */}
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
                    >
                      View Details
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
    </div>
  );
};

export default CreatorDashboard;
