
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { showConfetti } from "@/components/Brand/CreateCampaign/confetti";
import CreatorApplicationModal from "./CreatorApplicationModal";
import CampaignHeader from "./CampaignDetails/CampaignHeader";
import CampaignContent from "./CampaignDetails/CampaignContent";
import CampaignSidebar from "./CampaignDetails/CampaignSidebar";

interface ContentItem {
  id: string;
  quantity: number;
  contentType: string;
  customTitle: string;
  description: string;
  socialChannel: string;
}

interface Campaign {
  id: string;
  title: string;
  description: string;
  image?: string;
  brand: string;
  budget: string;
  budget_type: 'cash' | 'product' | 'service';
  product_service_description?: string;
  completion_date: string;
  status: string;
  daysLeft: number;
  content_items: ContentItem[];
  target_audience: {
    location: string[];
    gender?: string;
    ageRange?: string[];
    ethnicity?: string;
    interests?: string[];
    audienceSize?: string[];
    socialChannel?: string;
  };
  creator_purchase_required: boolean;
  product_ship_required: boolean;
}

interface CampaignDetailsPageProps {
  campaign: Campaign;
  onBack: () => void;
  onApply: () => void;
}

const CampaignDetailsPage = ({ campaign, onBack, onApply }: CampaignDetailsPageProps) => {
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [isApplied, setIsApplied] = useState(campaign.status === 'applied');
  const { toast } = useToast();

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
    if (daysLeft <= 3) return 'text-red-600';
    if (daysLeft <= 7) return 'text-orange-600';
    return 'text-muted-foreground';
  };

  const handleApplyClick = () => {
    setShowApplicationModal(true);
  };

  const handleApplicationSubmit = () => {
    setShowApplicationModal(false);
    setIsApplied(true);

    showConfetti();

    toast({
      title: "Application Submitted!",
      description: "Your application has been successfully submitted to the brand.",
    });

    onApply();
  };

  const handleShare = async () => {
    const shareData = {
      title: campaign.title,
      text: `Check out this campaign: ${campaign.title} by ${campaign.brand}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Campaign Link Copied!",
          description: "The campaign link has been copied to your clipboard.",
        });
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Campaign Link Copied!",
        description: "The campaign link has been copied to your clipboard.",
      });
    }
  };

  const currentStatus = isApplied ? 'applied' : campaign.status;

  // Transform campaign data for sidebar
  const sidebarCampaign = {
    compensation: campaign.budget_type === 'cash'
      ? `$${campaign.budget}`
      : campaign.product_service_description || 'Product/Service',
    budget: campaign.budget,
    budget_type: campaign.budget_type,
    brand: campaign.brand,
    content_items: campaign.content_items,
    location: campaign.target_audience?.location?.[0] || 'Remote',
    deadline: new Date(campaign.completion_date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }),
    creator_purchase_required: campaign.creator_purchase_required,
    product_ship_required: campaign.product_ship_required,
  };

  // Transform campaign data for application modal
  const modalCampaign = {
    id: campaign.id,
    title: campaign.title,
    image: campaign.image,
    brand: campaign.brand,
    compensation: campaign.budget_type === 'cash'
      ? `$${campaign.budget}`
      : campaign.product_service_description || 'Product/Service',
    deadline: new Date(campaign.completion_date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }),
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CampaignHeader
          campaign={campaign}
          currentStatus={currentStatus}
          onBack={onBack}
          onShare={handleShare}
          getStatusColor={getStatusColor}
          getUrgencyColor={getUrgencyColor}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <CampaignContent campaign={campaign} />
          <CampaignSidebar
            campaign={sidebarCampaign}
            currentStatus={currentStatus}
            onApplyClick={handleApplyClick}
          />
        </div>
      </div>

      {showApplicationModal && (
        <CreatorApplicationModal
          campaign={modalCampaign}
          onClose={() => setShowApplicationModal(false)}
          onSubmit={handleApplicationSubmit}
        />
      )}
    </div>
  );
};

export default CampaignDetailsPage;
