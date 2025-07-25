
import { PaginatedCampaignList } from "../PaginatedCampaignList";
import AssetLibrary from "../AssetLibrary";
import StatsCards from "./StatsCards";
import RecentCampaigns from "./RecentCampaigns";
import { TransformedCampaign, CampaignData } from "../utils/campaignData";

interface DashboardContentProps {
  activeView: string;
  stats: any;
  campaigns: CampaignData[];
  transformedCampaigns: TransformedCampaign[];
  onCampaignClick: (campaign: any) => void;
  onViewCampaign: (campaign: TransformedCampaign) => void;
  onEditCampaign: (campaign: TransformedCampaign) => void;
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
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {activeView === "overview" && (
        <div className="space-y-8">
          <StatsCards stats={stats} />
          <RecentCampaigns 
            campaigns={campaigns}
            onCampaignClick={onCampaignClick}
          />
        </div>
      )}

      {activeView === "campaigns" && (
        <PaginatedCampaignList 
          campaigns={transformedCampaigns}
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
