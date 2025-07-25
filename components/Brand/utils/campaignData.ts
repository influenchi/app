
// Campaign data and transformation utilities
export interface CampaignData {
  id: string;
  title: string;
  description: string;
  budget: number;
  budgetType: "cash" | "product" | "service";
  budgetDescription: string;
  timeline: string;
  status: "active" | "draft" | "completed";
  applicants: number;
  approved: number;
  deliverables: number;
  platforms: string[];
  tags: string[];
  category: string;
  createdAt: string;
  endDate: string;
}

export interface TransformedCampaign {
  id: number;
  title: string;
  status: string;
  applications: number;
  budget: string;
  deadline: string;
  type: string;
  assets: number;
  description: string;
  contentItems: any[];
  targetAudience: any;
  startDate: string;
  completionDate: string;
}

// Mock data for campaigns - updated with travel-related campaigns and product/service exchanges
export const mockCampaigns: CampaignData[] = [
  {
    id: "1",
    title: "Luxury Beach Resort Getaway",
    description: "Showcase our 5-star beachfront resort through stunning photography and engaging reels highlighting amenities, dining, and guest experiences",
    budget: 0,
    budgetType: "product",
    budgetDescription: "3-night luxury suite stay + spa treatments",
    timeline: "30 days",
    status: "active",
    applicants: 24,
    approved: 8,
    deliverables: 16,
    platforms: ["Instagram", "TikTok"],
    tags: ["Travel", "Luxury", "Resort", "Beach"],
    category: "Travel & Tourism",
    createdAt: "2024-01-15",
    endDate: "2024-02-14"
  },
  {
    id: "2", 
    title: "Mountain Adventure Experience",
    description: "Document an authentic mountain hiking and camping experience with our premium outdoor gear and guided tour services",
    budget: 0,
    budgetType: "service",
    budgetDescription: "Guided 5-day mountain expedition + premium gear package",
    timeline: "45 days", 
    status: "draft",
    applicants: 0,
    approved: 0,
    deliverables: 0,
    platforms: ["YouTube", "Instagram"],
    tags: ["Travel", "Adventure", "Outdoor", "Hiking"],
    category: "Travel & Adventure",
    createdAt: "2024-01-10",
    endDate: "2024-02-25"
  },
  {
    id: "3",
    title: "City Food & Culture Tour",
    description: "Explore local cuisine and cultural hotspots in our vibrant city through authentic storytelling and food photography",
    budget: 2500,
    budgetType: "cash",
    budgetDescription: "$2,500",
    timeline: "21 days",
    status: "completed",
    applicants: 18,
    approved: 12,
    deliverables: 24,
    platforms: ["Instagram", "YouTube", "TikTok"],
    tags: ["Travel", "Food", "Culture", "City"],
    category: "Travel & Food",
    createdAt: "2023-12-01",
    endDate: "2024-01-05"
  },
  {
    id: "4",
    title: "Sustainable Travel Initiative",
    description: "Promote eco-friendly travel practices through our sustainable tourism packages and green accommodations",
    budget: 3500,
    budgetType: "cash",
    budgetDescription: "$3,500",
    timeline: "60 days",
    status: "active",
    applicants: 15,
    approved: 6,
    deliverables: 12,
    platforms: ["Instagram", "YouTube"],
    tags: ["Travel", "Sustainability", "Eco-friendly"],
    category: "Travel & Environment",
    createdAt: "2024-01-08",
    endDate: "2024-03-08"
  }
];

export const transformCampaigns = (campaigns: CampaignData[]): TransformedCampaign[] => {
  return campaigns.map(campaign => ({
    id: parseInt(campaign.id),
    title: campaign.title,
    status: campaign.status,
    applications: campaign.applicants,
    budget: campaign.budgetType === 'cash' ? `$${campaign.budget.toLocaleString()}` : campaign.budgetDescription,
    deadline: campaign.endDate,
    type: campaign.category,
    assets: campaign.deliverables,
    description: campaign.description,
    contentItems: [],
    targetAudience: {},
    startDate: campaign.createdAt,
    completionDate: campaign.endDate
  }));
};
