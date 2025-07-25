
export interface CreatorProfileData {
  // Basic Info
  firstName: string;
  lastName: string;
  displayName: string;
  bio: string;
  location: string;
  profileImage: File | null;
  
  // Social Profiles
  instagram: string;
  tiktok: string;
  youtube: string;
  twitter: string;
  website: string;
  
  // Niche & Interests
  primaryNiche: string;
  secondaryNiches: string[];
  travelStyle: string[];
  contentTypes: string[];
  
  // Audience Info
  totalFollowers: string;
  primaryPlatform: string;
  audienceAge: string[];
  audienceGender: string;
  audienceLocation: string[];
  engagementRate: string;
  
  // Portfolio
  portfolioImages: File[];
}
