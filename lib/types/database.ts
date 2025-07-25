export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: 'brand' | 'creator';
  companyName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BrandProfile {
  id: string;
  userId: string;
  brandName: string;
  website?: string;
  description?: string;
  logo?: string;
  industries: string[];
  socialMedia: {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    website?: string;
  };
  isOnboardingComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatorProfile {
  id: string;
  userId: string;
  displayName: string;
  bio: string;
  location: string;
  profileImage?: string;
  socialProfiles: {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    twitter?: string;
    website?: string;
  };
  primaryNiche: string;
  secondaryNiches: string[];
  travelStyle: string[];
  contentTypes: string[];
  audienceInfo: {
    totalFollowers: string;
    primaryPlatform: string;
    audienceAge: string[];
    audienceGender: string;
    audienceLocation: string[];
    engagementRate: string;
  };
  portfolioImages: string[];
  isVetted: boolean;
  isOnboardingComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  id: string;
  brandId: string;
  title: string;
  description: string;
  image?: string;
  campaignGoal: string[];
  budget: string;
  budgetType: 'cash' | 'product' | 'service';
  productServiceDescription?: string;
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
  creatorPurchaseRequired: boolean;
  productShipRequired: boolean;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  applicantCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ContentItem {
  id: string;
  socialChannel: string;
  contentType: string;
  quantity: number;
  description: string;
  customTitle: string;
}

export interface CampaignApplication {
  id: string;
  campaignId: string;
  creatorId: string;
  message: string;
  customQuote?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
} 