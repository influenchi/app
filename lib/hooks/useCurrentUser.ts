import { useQuery } from '@tanstack/react-query';
import { useSession } from '@/lib/auth-client';

export interface CreatorProfileData {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  display_name: string;
  bio: string;
  city: string;
  state: string;
  country: string;
  profile_photo: string;
  instagram: string;
  tiktok: string;
  youtube: string;
  twitter: string;
  website: string;
  primary_niche: string;
  secondary_niches: string[];
  travel_style: string[];
  work_types: string[];
  work_images: string[];
  total_followers: string;
  primary_platform: string;
  audience_info: {
    totalFollowers?: string;
    primaryPlatform?: string;
    audienceAge?: string[];
    audienceGender?: string;
    audienceLocation?: string[];
    engagementRate?: string;
  };
  engagement_rate: string;
  portfolio_images: string[];
  is_vetted: boolean;
  is_onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
  vetting_video_url?: string | null;
  vetting_status?: 'pending' | 'approved' | 'rejected' | null;
  vetting_submitted_at?: string | null;
  vetting_reviewed_at?: string | null;
  vetting_reviewer_notes?: string | null;
}

export interface BrandProfileData {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  company: string;
  website: string;
  brand_description: string;
  campaign_types: string;
  selected_plan: string;
  is_annual: boolean;
  created_at: string;
  updated_at: string;
}

export interface CurrentUserData {
  user: {
    id: string;
    email: string;
    name: string;
    user_type: 'brand' | 'creator';
    first_name?: string;
    last_name?: string;
    company_name?: string;
  };
  profile: CreatorProfileData | BrandProfileData | null;
}

export function useCurrentUser() {
  const { data: session, isPending } = useSession();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['currentUser', session?.user?.id],
    queryFn: async (): Promise<CurrentUserData | null> => {
      if (!session?.user || !session.user.user_type) return null;

      const response = await fetch('/api/user/profile', {
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Not logged in, handled by session
          return null;
        }
        throw new Error('Failed to fetch user profile');
      }
      return response.json();
    },
    enabled: !isPending && !!session?.user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  return {
    currentUser: data,
    isLoading: isLoading || isPending,
    isAuthenticated: !!session?.user,
    error,
    refetch,
  };
} 