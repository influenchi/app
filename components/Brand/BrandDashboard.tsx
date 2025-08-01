/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import CreateCampaignModal from "./CreateCampaignModal";
import CampaignDetails from "./CampaignDetails";
import DashboardHeader from "./Dashboard/DashboardHeader";
import DashboardContent from "./Dashboard/DashboardContent";
import { useBrandCampaigns, useDeleteCampaign } from "@/lib/hooks/useBrand";

interface Campaign {
  id: string;
  title: string;
  status: string;
  applicant_count: number;
  budget: string;
  budget_type: 'cash' | 'product' | 'service';
  product_service_description?: string;
  completion_date: string;
  campaign_goal: string[];
  content_items: any[];
  target_audience: any;
  start_date: string;
  image?: string;
  requirements?: string;
  creator_count: string;
  creator_purchase_required: boolean;
  product_ship_required: boolean;
  description: string;
}

const BrandDashboard = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [activeView, setActiveView] = useState("overview");
  const [lastProcessedParams, setLastProcessedParams] = useState<{
    campaign?: string | null;
    tab?: string | null;
    message?: string | null;
  }>({});

  const { data: campaigns = [], isLoading, error } = useBrandCampaigns();
  const deleteCampaign = useDeleteCampaign();

  console.log(' BrandDashboard render:', {
    selectedCampaign: selectedCampaign?.title || 'none',
    searchParams: searchParams?.toString(),
    campaignsLoaded: campaigns.length > 0
  });

  // Handle URL parameters for deep linking - process when params actually change
  useEffect(() => {
    if (campaigns.length > 0) {
      const currentParams = {
        campaign: searchParams?.get('campaign'),
        tab: searchParams?.get('tab'),
        message: searchParams?.get('message'),
      };

      console.log('URL params check:', {
        currentParams,
        lastProcessedParams,
        campaignsLength: campaigns.length
      });

      // Check if URL parameters have actually changed
      const hasParamsChanged =
        currentParams.campaign !== lastProcessedParams.campaign ||
        currentParams.tab !== lastProcessedParams.tab ||
        currentParams.message !== lastProcessedParams.message;

      console.log('Params changed:', hasParamsChanged);

      // Only process if params changed and we have a campaign ID
      if (hasParamsChanged && currentParams.campaign) {
        const campaign = campaigns.find((c: Campaign) => c.id === currentParams.campaign);
        console.log('Found campaign for deep link:', campaign?.title);
        if (campaign) {
          setSelectedCampaign(campaign);
        }
        setLastProcessedParams(currentParams);
      }
      // If no campaign ID in URL but we had one before, clear the state
      else if (hasParamsChanged && !currentParams.campaign && lastProcessedParams.campaign) {
        console.log('Clearing campaign selection');
        setSelectedCampaign(null);
        setLastProcessedParams(currentParams);
      }
    }
  }, [campaigns, searchParams, lastProcessedParams]);

  const transformedCampaigns = campaigns.map((campaign: Campaign) => ({
    id: campaign.id,
    title: campaign.title,
    status: campaign.status,
    applications: campaign.applicant_count || 0,
    budget: campaign.budget_type === 'cash' ? `$${campaign.budget}` : campaign.product_service_description || 'Product/Service',
    deadline: new Date(campaign.completion_date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }),
    type: campaign.campaign_goal?.[0] || 'Content Creation',
    assets: campaign.content_items?.length || 0,
    description: campaign.description,
    contentItems: campaign.content_items || [],
    targetAudience: campaign.target_audience || {},
    startDate: campaign.start_date,
    completionDate: campaign.completion_date,
    image: campaign.image,
    campaignGoal: campaign.campaign_goal || [],
    budgetType: campaign.budget_type,
    productServiceDescription: campaign.product_service_description,
    creatorCount: campaign.creator_count,
    requirements: campaign.requirements,
    creatorPurchaseRequired: campaign.creator_purchase_required,
    productShipRequired: campaign.product_ship_required
  }));

  const stats = {
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter((c: Campaign) => c.status === 'active').length,
    totalApplications: campaigns.reduce((sum: number, c: Campaign) => sum + (c.applicant_count || 0), 0),
    completedCampaigns: campaigns.filter((c: Campaign) => c.status === 'completed').length,
    totalSpent: campaigns.reduce((sum: number, c: Campaign) => {
      if (c.budget_type === 'cash' && typeof c.budget === 'string') {
        return sum + parseFloat(c.budget.replace(/[^0-9.-]+/g, ''));
      }
      return sum;
    }, 0),
  };

  const handleViewChange = (view: string) => {
    setActiveView(view);
    setSelectedCampaign(null);
    // Clear URL parameters when changing views
    router.push('/brand/dashboard');
  };

  const handleViewCampaign = (campaign: any) => {
    console.log('View campaign clicked:', campaign);
    // Find the original campaign data by ID (use actualId if available)
    const campaignId = campaign.actualId || campaign.id;
    const originalCampaign = campaigns.find((c: Campaign) => c.id === campaignId);
    console.log('Looking for campaign with ID:', campaignId);
    console.log('Original campaign found:', originalCampaign);
    if (originalCampaign) {
      setSelectedCampaign(originalCampaign);
    }
  };

  const handleEditCampaign = (campaign: any) => {
    console.log('Edit campaign clicked:', campaign);
    // Find the original campaign data by ID (use actualId if available)
    const campaignId = campaign.actualId || campaign.id;
    const originalCampaign = campaigns.find((c: Campaign) => c.id === campaignId);
    if (originalCampaign) {
      setSelectedCampaign(originalCampaign);
    }
  };

  const handleDeleteCampaign = (campaign: any) => {
    console.log('Delete campaign clicked:', campaign);
    const campaignId = campaign.actualId || campaign.id;

    if (confirm('Are you sure you want to delete this draft campaign? This action cannot be undone.')) {
      deleteCampaign.mutate(campaignId);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your campaigns...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to load campaigns</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        activeView={activeView}
        onViewChange={handleViewChange}
        onCreateCampaign={() => setShowCreateModal(true)}
      />

      {selectedCampaign && (
        <CampaignDetails
          campaign={selectedCampaign}
          onBack={() => {
            setSelectedCampaign(null);
            // Clear URL parameters when going back to dashboard
            router.push('/brand/dashboard');
          }}
          onEdit={() => {
            console.log("Edit campaign:", selectedCampaign.id);
          }}
          defaultTab={searchParams?.get('tab') || 'details'}
          messageId={searchParams?.get('message') || undefined}
        />
      )}

      {!selectedCampaign && (
        <DashboardContent
          activeView={activeView}
          stats={stats}
          campaigns={campaigns}
          transformedCampaigns={transformedCampaigns}
          onCampaignClick={(campaign: any) => {
            console.log('Campaign clicked:', campaign);
            const campaignId = campaign.actualId || campaign.id;
            const originalCampaign = campaigns.find((c: Campaign) => c.id === campaignId);
            console.log('Original campaign found:', originalCampaign);
            if (originalCampaign) {
              setSelectedCampaign(originalCampaign);
            }
          }}
          onViewCampaign={handleViewCampaign}
          onEditCampaign={handleEditCampaign}
          onDeleteCampaign={handleDeleteCampaign}
          getStatusColor={() => ''}
        />
      )}

      {showCreateModal && (
        <CreateCampaignModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            console.log('Campaign creation successful');
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
};

export default BrandDashboard;
