
import { PaginatedCampaignList } from "../PaginatedCampaignList";
import AssetLibrary from "../AssetLibrary";
import StatsCards from "./StatsCards";
import RecentCampaigns from "./RecentCampaigns";

interface ContentItem {
  id: string;
  socialChannel: string;
  contentType: string;
  quantity: number;
  description?: string;
  customTitle?: string;
}

interface TargetAudience {
  socialChannel?: string;
  audienceSize: string[];
  ageRange: string[];
  gender?: string;
  location: string[];
  ethnicity?: string;
  interests: string[];
}

interface Campaign {
  id: string;
  title: string;
  description: string;
  budget: string;
  budget_type: 'cash' | 'product' | 'service';
  product_service_description?: string;
  status: string;
  applicant_count: number;
  completion_date: string;
  start_date: string;
  campaign_goal: string[];
  content_items: ContentItem[];
  target_audience: TargetAudience;
  created_at: string;
  updated_at: string;
}

interface PaginatedCampaign {
  id: number;
  title: string;
  status: string;
  applications: number;
  budget: string;
  deadline: string;
  type: string;
  assets: number;
  description: string;
  contentItems: ContentItem[];
  targetAudience: TargetAudience;
  startDate: string;
  completionDate: string;
  image?: string;
}

interface DashboardContentProps {
  activeView: string;
  stats: {
    totalCampaigns: number;
    activeCampaigns: number;
    totalApplications: number;
    completedCampaigns: number;
    totalSpent: number;
  };
  campaigns: Campaign[];
  transformedCampaigns: any[];
  onCampaignClick: (campaign: any) => void;
  onViewCampaign: (campaign: any) => void;
  onEditCampaign: (campaign: any) => void;
  getStatusColor: (status: string) => string;
}

const DashboardContent = ({
  activeView,
  stats,
  campaigns,
  transformedCampaigns,
  onCampaignClick,
  onViewCampaign,
  onEditCampaign,
  getStatusColor
}: DashboardContentProps) => {
  // Transform campaigns to match RecentCampaigns expected format
  const campaignsForRecent = campaigns?.map(campaign => ({
    id: campaign.id,
    title: campaign.title,
    description: campaign.description,
    budget: parseInt(campaign.budget) || 0,
    budgetType: campaign.budget_type,
    budgetDescription: campaign.product_service_description,
    timeline: `${Math.ceil((new Date(campaign.completion_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days`,
    status: campaign.status as "active" | "draft" | "completed",
    applicants: campaign.applicant_count || 0,
    approved: 0, // This would need to come from campaign_applications table
    deliverables: campaign.content_items?.length || 0,
    platforms: campaign.content_items?.map((item: ContentItem) => item.socialChannel) || [],
    tags: campaign.campaign_goal || [],
    category: campaign.campaign_goal?.[0] || 'Content Creation',
    createdAt: campaign.created_at,
    endDate: campaign.completion_date
  })) || [];

  // Transform for PaginatedCampaignList (needs numeric IDs)
  const campaignsForPaginated: PaginatedCampaign[] = transformedCampaigns.map((campaign, index) => ({
    id: index + 1, // Use index as numeric ID for compatibility
    title: campaign.title,
    status: campaign.status,
    applications: campaign.applications,
    budget: campaign.budget,
    deadline: campaign.deadline,
    type: campaign.type,
    assets: campaign.assets,
    description: campaign.description,
    contentItems: campaign.contentItems || [],
    targetAudience: campaign.targetAudience || {},
    startDate: campaign.startDate,
    completionDate: campaign.completionDate,
    image: campaign.image
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {activeView === "overview" && (
        <div className="space-y-8">
          <StatsCards stats={stats} />
          <RecentCampaigns
            campaigns={campaignsForRecent}
            onCampaignClick={onCampaignClick}
          />
        </div>
      )}

      {activeView === "campaigns" && (
        <PaginatedCampaignList
          campaigns={campaignsForPaginated}
          onViewCampaign={onViewCampaign}
          onEditCampaign={onEditCampaign}
          getStatusColor={getStatusColor}
        />
      )}

      {activeView === "assets" && (
        <AssetLibrary
          subscriptionTier="basic"
          monthlyDownloadsUsed={18}
          monthlyDownloadLimit={20}
        />
      )}
    </div>
  );
};

export default DashboardContent;
