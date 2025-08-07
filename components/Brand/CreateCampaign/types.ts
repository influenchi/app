
export interface ContentItem {
  id: string;
  socialChannel: string;
  contentType: string;
  quantity: number;
  description: string;
  customTitle?: string;
}

export interface CampaignData {
  title: string;
  description: string;
  image?: File | null;
  campaignGoal: string[];
  budget: string;
  budgetType: ('paid' | 'gifted' | 'affiliate')[];
  productServiceDescription: string;
  creatorCount: string;
  startDate: string;
  completionDate: string;
  contentItems: ContentItem[];
  targetAudience: {
    socialChannel: string;
    audienceSize: string[];
    ageRange: string[];
    gender: string;
    location: string[];
    ethnicity: string;
    interests: string[];
  };
  requirements: string;
  creatorPurchaseRequired?: boolean;
  productShipRequired?: boolean;
  affiliateProgram?: string;
}

export interface CreateCampaignModalProps {
  onClose: () => void;
  onSuccess: () => void;
}
