import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CreatorOnboardingFormData, CreatorApplicationFormData } from '@/lib/validations/creator';
import { toast } from 'sonner';
import { uploadCreatorProfileImage, uploadPortfolioImages, uploadSubmissionAssets } from '@/lib/utils/storageUtils';
import { useSession } from '@/lib/hooks/useAuth';

export function useCreatorOnboarding() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (data: CreatorOnboardingFormData) => {
      console.log(' Starting creator onboarding mutation...');
      console.log(' Raw input data:', {
        ...data,
        bio: data.bio?.substring(0, 50) + '...',
        hasProfileImage: !!data.profileImage,
        portfolioImageCount: data.portfolioImages?.length || 0
      });

      if (!session?.user?.id) {
        throw new Error('User session not found. Please log in again.');
      }

      console.log(' User session validated:', session.user.id);

      let profileImageUrl: string | null = null;
      let portfolioImageUrls: string[] = [];

      // Handle profile image upload
      if (data.profileImage && data.profileImage instanceof File) {
        console.log(' Processing profile image upload...');
        try {
          profileImageUrl = await uploadCreatorProfileImage(data.profileImage, session.user.id);
          console.log('Profile image uploaded successfully:', profileImageUrl);
        } catch (uploadError) {
          const errorMessage = uploadError instanceof Error ? uploadError.message : 'Unknown upload error';
          console.error('Profile image upload failed:', errorMessage);
          throw new Error(`Profile image upload failed: ${errorMessage}`);
        }
      }

      // Handle portfolio images - separate files from URLs
      if (data.portfolioImages && data.portfolioImages.length > 0) {
        console.log(` Processing ${data.portfolioImages.length} portfolio items...`);

        const portfolioFiles: File[] = [];
        const existingUrls: string[] = [];

        // Separate files from URLs
        data.portfolioImages.forEach(item => {
          if (item instanceof File) {
            portfolioFiles.push(item);
          } else if (typeof item === 'string') {
            existingUrls.push(item);
          }
        });

        console.log(` Found ${portfolioFiles.length} new files and ${existingUrls.length} existing URLs`);

        // Upload new files if any
        if (portfolioFiles.length > 0) {
          try {
            const result = await uploadPortfolioImages(portfolioFiles, session.user.id);

            if (result.errors && result.errors.length > 0) {
              console.warn('Some portfolio images failed:', result.errors);
              result.errors.forEach(error => toast.error(error));
            }

            // Combine new uploads with existing URLs
            portfolioImageUrls = [...existingUrls, ...result.urls];
            console.log(`Portfolio images uploaded: ${result.urls.length} new, ${existingUrls.length} existing`);
          } catch (uploadError) {
            const errorMessage = uploadError instanceof Error ? uploadError.message : 'Unknown upload error';
            console.error('Portfolio upload failed:', errorMessage);
            // Don't throw here - we can still save the profile with existing images
            toast.error(`Some portfolio images failed to upload: ${errorMessage}`);
            portfolioImageUrls = existingUrls; // Use only existing URLs
          }
        } else {
          // No new files, just use existing URLs
          portfolioImageUrls = existingUrls;
        }
      }

      // Format website URL if provided
      let formattedWebsite = data.website || '';
      if (formattedWebsite && !formattedWebsite.startsWith('http://') && !formattedWebsite.startsWith('https://')) {
        formattedWebsite = `https://${formattedWebsite}`;
      }

      const hasFiles = (data.profileImage instanceof File) ||
        (data.portfolioImages && data.portfolioImages.some(img => img instanceof File));

      let response;

      if (hasFiles) {
        const formData = new FormData();

        // Basic info
        formData.append('firstName', data.firstName);
        formData.append('lastName', data.lastName);
        formData.append('displayName', data.displayName);
        formData.append('bio', data.bio);
        formData.append('location', data.location);

        // Profile image URL (not the file, since we already uploaded it)
        if (profileImageUrl) {
          formData.append('profileImageUrl', profileImageUrl);
        }

        // Social profiles
        formData.append('instagram', data.instagram || '');
        formData.append('tiktok', data.tiktok || '');
        formData.append('youtube', data.youtube || '');
        formData.append('twitter', data.twitter || '');
        formData.append('website', formattedWebsite);

        // Niche and content
        formData.append('primaryNiche', data.primaryNiche);
        formData.append('secondaryNiches', JSON.stringify(data.secondaryNiches || []));
        formData.append('travelStyle', JSON.stringify(data.travelStyle || []));
        formData.append('contentTypes', JSON.stringify(data.contentTypes || []));

        // Audience info
        formData.append('totalFollowers', data.totalFollowers);
        formData.append('primaryPlatform', data.primaryPlatform);
        formData.append('audienceAge', JSON.stringify(data.audienceAge || []));
        formData.append('audienceGender', data.audienceGender || '');
        formData.append('audienceLocation', JSON.stringify(data.audienceLocation || []));
        formData.append('engagementRate', data.engagementRate || '');

        // Portfolio images (URLs only)
        formData.append('portfolioImages', JSON.stringify(portfolioImageUrls));

        console.log(' Sending FormData to API with uploaded URLs...');

        response = await fetch('/api/creator/onboarding', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });
      } else {
        // No files, send as JSON
        const payload = {
          ...data,
          profileImage: undefined,
          profileImageUrl,
          portfolioImages: portfolioImageUrls,
          website: formattedWebsite
        };

        console.log(' Sending JSON payload to API...');

        response = await fetch('/api/creator/onboarding', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const error = await response.json();
        console.error('API error:', error);
        throw new Error(error.error || 'Failed to complete onboarding');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creator-profile'] });
      queryClient.invalidateQueries({ queryKey: ['session'] });
      toast.success('Creator profile created successfully!');
    },
    onError: (error: Error) => {
      console.error('Onboarding error:', error);
      toast.error(error.message || 'Failed to create creator profile');
    },
  });
}

export function useSubmitApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { campaignId: string; application: CreatorApplicationFormData }) => {
      const response = await fetch(`/api/campaigns/${data.campaignId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data.application),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit application');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Application submitted successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit application');
    },
  });
}

export function useCreatorSubmissions(campaignId?: string) {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ['creator-submissions', session?.user?.id, campaignId],
    queryFn: async () => {
      if (!session?.user?.id) {
        throw new Error('User session not found');
      }

      const url = campaignId
        ? `/api/creator/submissions?campaign_id=${campaignId}`
        : '/api/creator/submissions';

      const response = await fetch(url, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch submissions');
      }

      const data = await response.json();
      return data.submissions;
    },
    enabled: !!session?.user?.id && session.user.user_type === 'creator',
  });
}

export function useSubmitContent() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  return useMutation({
    mutationFn: async (data: {
      campaignId: string;
      taskId: string;
      taskDescription?: string;
      contentType?: string;
      socialChannel?: string;
      quantity?: number;
      files: File[];
      descriptions: { [key: string]: string };
      tags: { [key: string]: string[] };
    }) => {
      if (!session?.user?.id) {
        throw new Error('User session not found. Please log in again.');
      }

      const { files, descriptions, tags, ...submissionData } = data;

      console.log('🚀 Starting content submission process...');

      // First, upload all the files
      const uploadResult = await uploadSubmissionAssets(
        files,
        data.campaignId,
        data.taskId
      );

      if (uploadResult.errors && uploadResult.errors.length > 0) {
        console.warn('Some files failed to upload:', uploadResult.errors);
        toast.warning(`Some files failed to upload: ${uploadResult.errors.join(', ')}`);
      }

      if (!uploadResult.assets || uploadResult.assets.length === 0) {
        throw new Error('No files were uploaded successfully');
      }

      // Prepare assets with descriptions and tags
      const assetsWithMetadata = uploadResult.assets.map((asset, index) => ({
        ...asset,
        description: descriptions[index] || descriptions[asset.name] || '',
        tags: tags[index] || tags[asset.name] || []
      }));

      console.log('📤 Creating submission with uploaded assets...');

      // Create the submission
      const response = await fetch('/api/creator/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...submissionData,
          assets: assetsWithMetadata
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit content');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['creator-submissions'] });
      queryClient.invalidateQueries({ queryKey: ['creator-submissions', session?.user?.id] });
      queryClient.invalidateQueries({ queryKey: ['creator-submissions', session?.user?.id, variables.campaignId] });

      toast.success('Content submitted successfully! The brand will review your submission.');
    },
    onError: (error: Error) => {
      console.error('Content submission error:', error);
      toast.error(error.message || 'Failed to submit content');
    },
  });
} 