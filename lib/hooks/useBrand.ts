import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BrandOnboardingFormData, CampaignFormData } from '@/lib/validations/brand';
import { uploadBrandLogo } from '@/lib/utils/storageUtils';
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

// Helper function to clean the entire payload
function cleanPayload(data: BrandOnboardingData): BrandOnboardingPayload {
  return {
    brandName: cleanStringValue(data.brandName),
    website: cleanStringValue(data.website),
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
      console.log('🚀 Starting brand onboarding mutation...');
      console.log('📋 Raw input data:', {
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

      console.log('👤 User session validated:', session.user.id);

      let logoUrl: string | null = null;

      // Handle file upload separately for better error handling
      if (data.logoFile) {
        console.log('📁 Processing logo file upload...');
        try {
          logoUrl = await uploadBrandLogo(data.logoFile, session.user.id);
          console.log('✅ Logo uploaded successfully:', logoUrl);
        } catch (uploadError) {
          const errorMessage = uploadError instanceof Error ? uploadError.message : 'Unknown upload error';
          console.error('❌ Logo upload failed:', errorMessage);
          throw new Error(`Logo upload failed: ${errorMessage}`);
        }
      }

      // Prepare clean JSON payload (no File objects, no problematic values)
      const payload = cleanPayload(data);

      // Add logoUrl if we have one
      if (logoUrl) {
        payload.logoUrl = logoUrl;
      }

      console.log('📤 Sending clean JSON payload:', {
        ...payload,
        description: payload.description?.substring(0, 50) + '...',
        logoUrl: payload.logoUrl ? 'provided' : 'not provided'
      });

      // Test JSON serialization before sending
      let jsonString: string;
      try {
        jsonString = JSON.stringify(payload);
        console.log('✅ JSON serialization successful, length:', jsonString.length);
      } catch (serializationError) {
        console.error('❌ JSON serialization failed:', serializationError);
        throw new Error('Failed to prepare request data');
      }

      // Submit form data with logo URL
      const response = await fetch('/api/brand/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonString,
      });

      console.log('📨 Response status:', response.status);

      if (!response.ok) {
        let errorMessage = 'Failed to complete onboarding';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          console.error('❌ Server error:', errorData);
        } catch {
          console.error('❌ Failed to parse error response');
          // If JSON parsing fails, use default message
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('✅ Brand onboarding completed successfully');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-profile'] });
      toast.success('Brand profile created successfully!');
    },
    onError: (error: Error) => {
      console.error('❌ Brand onboarding mutation failed:', error);
      toast.error(error.message || 'Failed to create brand profile');
    },
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CampaignFormData) => {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create campaign');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Campaign created successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create campaign');
    },
  });
} 