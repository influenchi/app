/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import CreateCampaignModal from "./CreateCampaignModal";
import CampaignDetails from "./CampaignDetails";
import DashboardHeader from "./Dashboard/DashboardHeader";
import DashboardContent from "./Dashboard/DashboardContent";
import { useBrandCampaigns, useDeleteCampaign } from "@/lib/hooks/useBrand";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface Campaign {
  id: string;
  title: string;
  status: string;
  applicant_count: number;
  budget: string;
  budget_type: 'paid' | 'gifted' | 'affiliate';
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
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [activeView, setActiveView] = useState("overview");
  const [lastProcessedParams, setLastProcessedParams] = useState<{
    campaign?: string | null;
    tab?: string | null;
    message?: string | null;
  }>({});

  const { data: campaignsData, isLoading, error } = useBrandCampaigns();
  const campaigns = useMemo(() => campaignsData?.campaigns || [], [campaignsData?.campaigns]);
  const hiredCreatorsCount = campaignsData?.hiredCreatorsCount || 0;
  const deleteCampaign = useDeleteCampaign();

  // Campaign duplication mutation
  const duplicateCampaignMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      const response = await fetch(`/api/campaigns/${campaignId}/duplicate`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to duplicate campaign');
      }
      return response.json();
    },
    onSuccess: async (data) => {
      const campaignTitle = data.campaign.title;
      toast.success(
        `Campaign "${campaignTitle}" created as draft. Redirecting to edit...`,
        { duration: 3000 }
      );

      // Invalidate and wait for campaigns to refresh
      await queryClient.invalidateQueries({ queryKey: ['campaigns'] });

      // Small delay to ensure data is refreshed before navigation
      setTimeout(() => {
        router.push(`/brand/dashboard?campaign=${data.campaign.id}&tab=details`);
      }, 800);
    },
    onError: (error) => {
      console.error('Duplication error:', error);
      toast.error('Failed to duplicate campaign. Please try again.');
    },
  });

  // Handle URL parameters for deep linking - process when params actually change
  useEffect(() => {
    if (campaigns.length > 0) {
      const currentParams = {
        campaign: searchParams?.get('campaign'),
        tab: searchParams?.get('tab'),
        message: searchParams?.get('message'),
      };

      // Check if URL parameters have actually changed
      const hasParamsChanged =
        currentParams.campaign !== lastProcessedParams.campaign ||
        currentParams.tab !== lastProcessedParams.tab ||
        currentParams.message !== lastProcessedParams.message;

      // Only process if params changed and we have a campaign ID
      if (hasParamsChanged && currentParams.campaign) {
        const campaign = campaigns.find((c: Campaign) => c.id === currentParams.campaign);

        if (campaign) {
          setSelectedCampaign(campaign);
        }
        setLastProcessedParams(currentParams);
      }
      // If no campaign ID in URL but we had one before, clear the state
      else if (hasParamsChanged && !currentParams.campaign && lastProcessedParams.campaign) {

        setSelectedCampaign(null);
        setLastProcessedParams(currentParams);
      }
    }
  }, [campaigns, searchParams, lastProcessedParams]);

  const transformedCampaigns = campaigns.map((campaign: Campaign & { approved?: number }) => ({
    id: campaign.id,
    title: campaign.title,
    status: campaign.status,
    applications: campaign.applicant_count || 0,
    approved: campaign.approved || 0,
    budget: campaign.budget_type === 'paid' ? `$${campaign.budget}` : campaign.product_service_description || 'Product/Service',
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
    totalApplications: campaigns.reduce((sum: number, c: Campaign) => sum + (c.applicant_count || 0), 0),
    hiredCreators: hiredCreatorsCount,
    totalSpend: campaigns.reduce((sum: number, c: Campaign) => {
      if (c.budget_type === 'paid' && typeof c.budget === 'string') {
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

    // Find the original campaign data by ID (use actualId if available)
    const campaignId = campaign.actualId || campaign.id;
    const originalCampaign = campaigns.find((c: Campaign) => c.id === campaignId);

    if (originalCampaign) {
      setSelectedCampaign(originalCampaign);
    }
  };

  const handleEditCampaign = (campaign: any) => {

    // Find the original campaign data by ID (use actualId if available)
    const campaignId = campaign.actualId || campaign.id;
    const originalCampaign = campaigns.find((c: Campaign) => c.id === campaignId);
    if (originalCampaign) {
      setEditingCampaign(originalCampaign);
      setShowEditModal(true);
    }
  };

  const handleDeleteCampaign = (campaign: any) => {

    const campaignId = campaign.actualId || campaign.id;

    if (confirm('Are you sure you want to delete this draft campaign? This action cannot be undone.')) {
      deleteCampaign.mutate(campaignId);
    }
  };

  const handleDuplicateCampaign = () => {
    if (selectedCampaign) {
      duplicateCampaignMutation.mutate(selectedCampaign.id);
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

            setEditingCampaign(selectedCampaign);
            setShowEditModal(true);
          }}
          onDuplicate={handleDuplicateCampaign}
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

            const campaignId = campaign.actualId || campaign.id;
            const originalCampaign = campaigns.find((c: Campaign) => c.id === campaignId);

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

            setShowCreateModal(false);
          }}
        />
      )}

      {showEditModal && editingCampaign && (
        <CreateCampaignModal
          onClose={() => {
            setShowEditModal(false);
            setEditingCampaign(null);
          }}
          onSuccess={() => {

            setShowEditModal(false);
            setEditingCampaign(null);
            // Refresh campaigns data
            queryClient.invalidateQueries({ queryKey: ['campaigns'] });
          }}
          initialData={{
            title: editingCampaign.title,
            description: editingCampaign.description,
            image: undefined,
            existingImageUrl: editingCampaign.image || undefined,
            campaignGoal: editingCampaign.campaign_goal || [],
            budget: editingCampaign.budget?.replace('$', '') || '',
            budgetType: editingCampaign.budget_type === 'paid' ? ['paid'] :
              editingCampaign.budget_type === 'gifted' ? ['gifted'] :
                editingCampaign.budget_type === 'affiliate' ? ['affiliate'] : ['paid'],
            productServiceDescription: editingCampaign.product_service_description || '',
            creatorCount: editingCampaign.creator_count || '',
            startDate: editingCampaign.start_date || '',
            completionDate: editingCampaign.completion_date || '',
            contentItems: editingCampaign.content_items || [],
            targetAudience: editingCampaign.target_audience || {
              socialChannel: '',
              audienceSize: [],
              ageRange: [],
              gender: '',
              location: [],
              ethnicity: '',
              interests: []
            },
            requirements: editingCampaign.requirements || '',
            creatorPurchaseRequired: editingCampaign.creator_purchase_required || false,
            productShipRequired: editingCampaign.product_ship_required || false,
            id: editingCampaign.id // Include ID for editing
          }}
        />
      )}
    </div>
  );
};

export default BrandDashboard;
