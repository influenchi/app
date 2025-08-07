import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { BrandOnboardingFormData, CampaignFormData } from '@/lib/validations/brand';
import { uploadBrandLogo, uploadCampaignImage } from '@/lib/utils/storageUtils';
import { useSession } from '@/lib/hooks/useAuth';
import { toast } from 'sonner';

interface BrandOnboardingData extends BrandOnboardingFormData {
  logoFile?: File | null;
}

interface BrandOnboardingPayload {
  brandName: string;
  website: string;
  description: string;
  industries: string[];
  socialMedia: {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    website?: string;
  };
  logoUrl?: string;
}

// Helper function to clean and validate string values
function cleanStringValue(value: unknown): string {
  if (typeof value !== 'string') return '';

  // Remove problematic values that could cause JSON parsing issues
  const cleaned = value.trim();

  // Avoid single minus signs or other problematic patterns
  if (cleaned === '-' || cleaned === '--' || cleaned.match(/^-+$/)) {
    return '';
  }

  return cleaned;
}

// Ensure website URL has a scheme; prepend https:// if missing
function normalizeWebsiteUrl(url: string): string {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

// Helper function to clean the entire payload
function cleanPayload(data: BrandOnboardingData): BrandOnboardingPayload {
  return {
    brandName: cleanStringValue(data.brandName),
    website: normalizeWebsiteUrl(cleanStringValue(data.website)),
    description: cleanStringValue(data.description),
    industries: Array.isArray(data.industries) ? data.industries.filter(Boolean) : [],
    socialMedia: {
      instagram: cleanStringValue(data.socialMedia?.instagram),
      tiktok: cleanStringValue(data.socialMedia?.tiktok),
      youtube: cleanStringValue(data.socialMedia?.youtube),
      website: cleanStringValue(data.socialMedia?.website),
    },
  };
}

export function useBrandOnboarding() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (data: BrandOnboardingData) => {
      console.log(' Starting brand onboarding mutation...');
      console.log(' Raw input data:', {
        brandName: data.brandName,
        website: data.website,
        description: data.description?.substring(0, 50) + '...',
        industries: data.industries,
        socialMedia: data.socialMedia,
        hasLogoFile: !!data.logoFile
      });

      // Ensure we have a user session
      if (!session?.user?.id) {
        throw new Error('User session not found. Please log in again.');
      }

      console.log(' User session validated:', session.user.id);

      let logoUrl: string | null = null;

      // Handle file upload separately for better error handling
      if (data.logoFile) {
        console.log(' Processing logo file upload...');
        try {
          logoUrl = await uploadBrandLogo(data.logoFile, session.user.id);
          console.log('Logo uploaded successfully:', logoUrl);
        } catch (uploadError) {
          const errorMessage = uploadError instanceof Error ? uploadError.message : 'Unknown upload error';
          console.error('Logo upload failed:', errorMessage);
          throw new Error(`Logo upload failed: ${errorMessage}`);
        }
      }

      // Prepare clean JSON payload (no File objects, no problematic values)
      const payload = cleanPayload(data);

      // Add logoUrl if we have one
      if (logoUrl) {
        payload.logoUrl = logoUrl;
      }

      console.log(' Sending clean JSON payload:', {
        ...payload,
        description: payload.description?.substring(0, 50) + '...',
        logoUrl: payload.logoUrl ? 'provided' : 'not provided'
      });

      // Test JSON serialization before sending
      let jsonString: string;
      try {
        jsonString = JSON.stringify(payload);
        console.log('JSON serialization successful, length:', jsonString.length);
      } catch (serializationError) {
        console.error('JSON serialization failed:', serializationError);
        throw new Error('Failed to prepare request data');
      }

      // Submit form data with logo URL
      const response = await fetch('/api/brand/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: jsonString,
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        let errorMessage = 'Failed to complete onboarding';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          console.error('Server error:', errorData);
        } catch {
          console.error('Failed to parse error response');
          // If JSON parsing fails, use default message
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Brand onboarding completed successfully');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-profile'] });
      queryClient.invalidateQueries({ queryKey: ['session'] });
      toast.success('Brand profile created successfully!');
    },
    onError: (error: Error) => {
      console.error('Brand onboarding mutation failed:', error);
      toast.error(error.message || 'Failed to create brand profile');
    },
  });
}

export function useBrandCampaigns() {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['brand-campaigns', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) {
        throw new Error('User session not found');
      }

      const response = await fetch('/api/campaigns?for_brand=true', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch campaigns');
      }

      const data = await response.json();
      return {
        campaigns: data.campaigns,
        hiredCreatorsCount: data.hiredCreatorsCount || 0
      };
    },
    enabled: !!session?.user?.id,
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (data: CampaignFormData & { image?: File }) => {
      if (!session?.user?.id) {
        throw new Error('User session not found. Please log in again.');
      }

      let imageUrl: string | null = null;

      // Handle image upload if present
      if (data.image && data.image instanceof File) {
        try {
          imageUrl = await uploadCampaignImage(data.image, session.user.id);
        } catch (uploadError) {
          const errorMessage = uploadError instanceof Error ? uploadError.message : 'Unknown upload error';
          throw new Error(`Image upload failed: ${errorMessage}`);
        }
      }

      // Prepare campaign data (exclude File object)
      const { image, ...campaignDataWithoutImage } = data;
      void image; // Explicitly mark as used to avoid linter warning
      const campaignData = {
        ...campaignDataWithoutImage,
      };

      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...campaignData,
          imageUrl // Send image URL separately
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create campaign');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate both campaign queries
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['brand-campaigns'] });
      toast.success('Campaign created successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create campaign');
    },
  });
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (
      params: { id: string } & (CampaignFormData & { image?: File; status?: 'draft' | 'active' })
    ) => {
      if (!session?.user?.id) {
        throw new Error('User session not found. Please log in again.');
      }

      const { id, image, status, ...rest } = params;

      let imageUrl: string | null = null;

      if (image && image instanceof File) {
        try {
          imageUrl = await uploadCampaignImage(image, session.user.id);
        } catch (uploadError) {
          const errorMessage = uploadError instanceof Error ? uploadError.message : 'Unknown upload error';
          throw new Error(`Image upload failed: ${errorMessage}`);
        }
      }

      const response = await fetch(`/api/campaigns/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...rest,
          imageUrl,
          status: status || 'active',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update campaign');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['brand-campaigns'] });
      toast.success('Campaign updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update campaign');
    },
  });
}

export function useSaveCampaignDraft() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (data: Partial<CampaignFormData> & { image?: File, id?: string }) => {
      if (!session?.user?.id) {
        throw new Error('User session not found. Please log in again.');
      }

      let imageUrl: string | null = null;

      // Handle image upload if present
      if (data.image && data.image instanceof File) {
        try {
          imageUrl = await uploadCampaignImage(data.image, session.user.id);
        } catch (uploadError) {
          console.warn('Draft image upload failed, saving without image:', uploadError);
          // For drafts, we don't fail if image upload fails
        }
      }

      // Prepare campaign data (exclude File object)
      const { image: _image, id, ...campaignDataWithoutImage } = data;
      void _image;
      const campaignData = {
        ...campaignDataWithoutImage,
        // Ensure required fields have default values for drafts
        title: data.title || 'Untitled Campaign',
        description: data.description || '',
        campaignGoal: data.campaignGoal || [],
        budget: data.budget || '0',
        budgetType: data.budgetType || ['paid'],
        creatorCount: data.creatorCount || '1',
        startDate: data.startDate || '',
        completionDate: data.completionDate || '',
        contentItems: data.contentItems || [],
        targetAudience: data.targetAudience || {
          socialChannel: '',
          audienceSize: [],
          ageRange: [],
          gender: '',
          location: [],
          ethnicity: '',
          interests: []
        },
      };

      const url = id ? `/api/campaigns/${id}` : '/api/campaigns';
      const method = id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...campaignData,
          imageUrl,
          status: 'draft' // Explicitly set as draft
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save campaign draft');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate campaign queries to show updated drafts
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['brand-campaigns'] });
    },
    onError: (error: Error) => {
      console.error('Failed to save draft:', error);
      // Silently fail for drafts - we don't want to interrupt the user
    },
  });
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignId: string) => {
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete campaign');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['brand-campaigns'] });
      toast.success('Campaign deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete campaign');
    },
  });
}

export function useBrandAssets() {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['brand-assets', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) {
        throw new Error('User session not found');
      }

      const response = await fetch('/api/assets', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch assets');
      }

      const data = await response.json();
      return data.assets;
    },
    enabled: !!session?.user?.id && session.user.user_type === 'brand',
  });
}

export function useDownloadAsset() {
  return useMutation({
    mutationFn: async (assetId: string) => {
      const response = await fetch(`/api/assets/${assetId}/download`, {
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to download asset');
      }

      // Get the blob and create a download
      const blob = await response.blob();
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition?.match(/filename="(.+)"/)?.[1] || 'download';

      // Create a temporary URL and trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      return filename;
    },
    onSuccess: (filename) => {
      toast.success(`Downloaded: ${filename}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to download asset');
    },
  });
}

export function useBrandSubmissions() {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['brand-submissions', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) {
        throw new Error('User session not found');
      }

      const response = await fetch('/api/submissions', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch submissions');
      }

      const data = await response.json();
      return data.submissions;
    },
    enabled: !!session?.user?.id && session.user.user_type === 'brand',
  });
}

export function useUpdateSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ submissionId, status, rejectionComment }: {
      submissionId: string;
      status: 'approved' | 'rejected';
      rejectionComment?: string;
    }) => {
      const response = await fetch('/api/submissions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          submissionId,
          status,
          rejectionComment,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update submission');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['brand-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['brand-assets'] });

      if (variables.status === 'approved') {
        toast.success('Submission approved successfully');
      } else {
        toast.success('Submission rejected');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update submission');
    },
  });
} 