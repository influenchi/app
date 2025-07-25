
import { useState } from "react";
import CreateCampaignModal from "./CreateCampaignModal";
import CampaignDetails from "./CampaignDetails";
import DashboardHeader from "./Dashboard/DashboardHeader";
import DashboardContent from "./Dashboard/DashboardContent";
import { mockCampaigns, transformCampaigns } from "./utils/campaignData";
import { getStatusColor, getDashboardStats } from "./utils/campaignUtils";

const BrandDashboard = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [activeView, setActiveView] = useState("overview");

  const stats = getDashboardStats();
  const transformedCampaigns = transformCampaigns(mockCampaigns);

  const handleViewChange = (view: string) => {
    setActiveView(view);
    setSelectedCampaign(null);
  };

  const handleViewCampaign = (campaign: any) => {
    console.log('View campaign clicked:', campaign);
    setSelectedCampaign(campaign);
  };

  const handleEditCampaign = (campaign: any) => {
    console.log('Edit campaign clicked:', campaign);
    setSelectedCampaign(campaign);
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        activeView={activeView}
        onViewChange={handleViewChange}
        onCreateCampaign={() => setShowCreateModal(true)}
      />

      {/* Campaign Details View */}
      {selectedCampaign && (
        <CampaignDetails
          campaign={selectedCampaign}
          onBack={() => setSelectedCampaign(null)}
          onEdit={() => {
            console.log("Edit campaign:", selectedCampaign.id);
          }}
        />
      )}

      {/* Main Content */}
      {!selectedCampaign && (
        <DashboardContent
          activeView={activeView}
          stats={stats}
          campaigns={mockCampaigns}
          transformedCampaigns={transformedCampaigns}
          onCampaignClick={setSelectedCampaign}
          onViewCampaign={handleViewCampaign}
          onEditCampaign={handleEditCampaign}
          getStatusColor={getStatusColor}
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
