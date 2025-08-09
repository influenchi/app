import { supabase } from '@/lib/supabase';

// File validation constants
export const ALLOWED_IMAGE_TYPES = {
  'image/png': 'PNG',
  'image/jpeg': 'JPEG',
  'image/jpg': 'JPG',
  'image/gif': 'GIF',
  'image/webp': 'WebP',
  'image/svg+xml': 'SVG'
} as const;

export const ALLOWED_VIDEO_TYPES = {
  'video/mp4': 'MP4',
  'video/webm': 'WebM',
  'video/quicktime': 'MOV'
} as const;

// Vercel has a 4.5MB limit for API routes, so we set practical limits below that
export const MAX_IMAGE_SIZE = 3 * 1024 * 1024; // 3MB for images (leaves room for metadata)
export const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB for videos (use direct-to-storage uploads)
export const RECOMMENDED_IMAGE_SIZE = 1024 * 1024; // 1MB for compression target

// Cost-efficient settings for Supabase Storage
export const COMPRESSION_QUALITY = 0.85; // Good quality vs size balance
export const MAX_IMAGE_DIMENSION = 1920; // Max width/height for images

export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  if (!file) {
    return { isValid: false, error: 'No file selected' };
  }

  // Check file size
  if (file.size > MAX_IMAGE_SIZE) {
    return {
      isValid: false,
      error: `Image must be less than ${Math.round(MAX_IMAGE_SIZE / (1024 * 1024))}MB. Your file is ${Math.round(file.size / (1024 * 1024) * 10) / 10}MB.`
    };
  }

  // Check file type
  if (!Object.keys(ALLOWED_IMAGE_TYPES).includes(file.type)) {
    const allowedTypes = Object.values(ALLOWED_IMAGE_TYPES).join(', ');
    return {
      isValid: false,
      error: `File type not supported. Please use: ${allowedTypes}. Your file type: ${file.type || 'Unknown'}`
    };
  }

  return { isValid: true };
}

export function validateMediaFile(file: File): { isValid: boolean; error?: string } {
  if (!file) return { isValid: false, error: 'No file selected' };

  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');

  // Check file size based on type
  if (isImage && file.size > MAX_IMAGE_SIZE) {
    return {
      isValid: false,
      error: `Image must be less than ${Math.round(MAX_IMAGE_SIZE / (1024 * 1024))}MB. Your file is ${Math.round(file.size / (1024 * 1024) * 10) / 10}MB.`
    };
  }

  if (isVideo && file.size > MAX_VIDEO_SIZE) {
    return {
      isValid: false,
      error: `Video must be less than ${Math.round(MAX_VIDEO_SIZE / (1024 * 1024))}MB. Your file is ${Math.round(file.size / (1024 * 1024) * 10) / 10}MB.`
    };
  }

  // Check file type
  if (isImage && !Object.keys(ALLOWED_IMAGE_TYPES).includes(file.type)) {
    const allowedTypes = Object.values(ALLOWED_IMAGE_TYPES).join(', ');
    return {
      isValid: false,
      error: `Image type not supported. Please use: ${allowedTypes}`
    };
  }

  if (isVideo && !Object.keys(ALLOWED_VIDEO_TYPES).includes(file.type)) {
    const allowedTypes = Object.values(ALLOWED_VIDEO_TYPES).join(', ');
    return {
      isValid: false,
      error: `Video type not supported. Please use: ${allowedTypes}`
    };
  }

  if (!isImage && !isVideo) {
    return { isValid: false, error: `File type not supported. Please upload images or videos.` };
  }

  return { isValid: true };
}

export function getFileTypeDisplay(): string {
  return Object.values(ALLOWED_IMAGE_TYPES).join(', ');
}

export function getVideoTypeDisplay(): string {
  return Object.values(ALLOWED_VIDEO_TYPES).join(', ');
}

export function getMaxFileSizeDisplay(): string {
  return `${Math.round(MAX_IMAGE_SIZE / (1024 * 1024))}MB for images, ${Math.round(MAX_VIDEO_SIZE / (1024 * 1024))}MB for videos`;
}

// Helper function to compress images before upload (skip SVG files)
export async function compressImage(file: File, maxWidth: number = MAX_IMAGE_DIMENSION, quality: number = COMPRESSION_QUALITY): Promise<File> {
  // Don't compress SVG files
  if (file.type === 'image/svg+xml') {
    return file;
  }

  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxWidth) {
        if (width > height) {
          height = (height / width) * maxWidth;
          width = maxWidth;
        } else {
          width = (width / height) * maxWidth;
          height = maxWidth;
        }
      }

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob((blob) => {
        const compressedFile = new File([blob!], file.name, {
          type: file.type,
          lastModified: Date.now(),
        });
        resolve(compressedFile);
      }, file.type, quality);
    };

    img.src = URL.createObjectURL(file);
  });
}

export async function uploadBrandLogo(
  file: File,
  userId: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  void onProgress; // Parameter kept for API consistency
  try {
    console.log('Upload attempt details:', {
      betterAuthUserId: userId,
      fileDetails: {
        name: file.name,
        type: file.type,
        size: file.size
      }
    });

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Compress image if it's too large (but skip SVG)
    let processedFile = file;
    if (file.size > RECOMMENDED_IMAGE_SIZE && file.type !== 'image/svg+xml') {
      processedFile = await compressImage(file);
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `brand-logo-${userId}-${Date.now()}.${fileExt}`;
    void fileName; // Used for debugging, silence linter

    // Create FormData for API upload
    const formData = new FormData();
    formData.append('file', processedFile);

    console.log(' Uploading via secure API endpoint...');

    // Upload via API endpoint (works for both Supabase and Better Auth users)
    const response = await fetch('/api/upload/brand-logo', {
      method: 'POST',
      body: formData,
      credentials: 'include' // Include cookies for Better Auth session
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
      console.error('Upload API error:', errorData);

      // Provide user-friendly error messages
      if (response.status === 401) {
        throw new Error('Please log in to upload files');
      }
      if (response.status === 413) {
        throw new Error('File too large. Maximum size is 5MB');
      }
      if (errorData.error?.includes('Invalid file type')) {
        throw new Error(`File type not supported. Please use: ${getFileTypeDisplay()}`);
      }

      throw new Error(errorData.error || 'Upload failed. Please try again.');
    }

    const result = await response.json();

    console.log('Upload successful:', {
      publicUrl: result.url,
      path: result.path,
      userId
    });

    return result.url;

  } catch (err) {
    console.error('Unexpected upload error:', err);
    throw new Error(`Logo upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
}

// Alternative: Upload multiple files concurrently (different paths)
export async function uploadMultipleFiles(
  files: { file: File; userId: string; category: string }[]
): Promise<string[]> {
  const uploadPromises = files.map(async ({ file, userId, category }) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${category}-${userId}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${category}/${fileName}`;

    const { data: _data, error } = await supabase.storage
      .from('uploads')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false // Ensure unique paths
      });
    void _data; // Suppress unused variable warning

    if (error) {
      throw new Error(`Failed to upload ${file.name}: ${error.message}`);
    }

    const { data: urlData } = supabase.storage
      .from('uploads')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  });

  return Promise.all(uploadPromises);
}

export async function deleteBrandLogo(logoUrl: string): Promise<void> {
  if (!logoUrl) return;

  const filePath = logoUrl.split('/').slice(-2).join('/');

  const { error } = await supabase.storage
    .from('uploads')
    .remove([filePath]);

  if (error) {
    console.error('Error deleting brand logo:', error);
  }
}

export async function uploadCreatorProfileImage(
  file: File,
  userId: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  void onProgress; // Parameter kept for API consistency
  try {
    console.log('Upload attempt details:', {
      betterAuthUserId: userId,
      fileDetails: {
        name: file.name,
        type: file.type,
        size: file.size
      }
    });

    const validation = validateImageFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    let processedFile = file;
    if (file.size > RECOMMENDED_IMAGE_SIZE && file.type !== 'image/svg+xml') {
      processedFile = await compressImage(file);
    }

    const formData = new FormData();
    formData.append('file', processedFile);

    console.log(' Uploading via secure API endpoint...');

    const response = await fetch('/api/upload/creator-profile', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
      console.error('Upload API error:', errorData);

      if (response.status === 401) {
        throw new Error('Please log in to upload files');
      }
      if (response.status === 413) {
        throw new Error('File too large. Maximum size is 5MB');
      }
      if (errorData.error?.includes('Invalid file type')) {
        throw new Error(`File type not supported. Please use: ${getFileTypeDisplay()}`);
      }

      throw new Error(errorData.error || 'Upload failed. Please try again.');
    }

    const result = await response.json();

    console.log('Upload successful:', {
      publicUrl: result.url,
      path: result.path,
      userId
    });

    return result.url;

  } catch (err) {
    console.error('Unexpected upload error:', err);
    throw new Error(`Profile image upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
}

export async function uploadPortfolioImages(
  files: File[],
  userId: string,
  onProgress?: (progress: number) => void
): Promise<{ urls: string[]; errors?: string[] }> {
  void onProgress; // Parameter kept for API consistency
  try {
    console.log('Portfolio upload attempt:', {
      userId,
      fileCount: files.length,
      files: files.map(f => ({
        name: f.name,
        type: f.type,
        size: f.size
      }))
    });

    const processedFiles: File[] = [];
    const validationErrors: string[] = [];

    for (const file of files) {
      const validation = validateMediaFile(file);
      if (!validation.isValid) {
        validationErrors.push(`${file.name}: ${validation.error}`);
        continue;
      }

      // Only compress images; skip videos
      let processedFile = file;
      if (file.type.startsWith('image/') && file.size > RECOMMENDED_IMAGE_SIZE && file.type !== 'image/svg+xml') {
        processedFile = await compressImage(file);
      }
      processedFiles.push(processedFile);
    }

    if (processedFiles.length === 0) {
      throw new Error('No valid media to upload');
    }

    console.log(`Uploading ${processedFiles.length} portfolio media files via signed URLs...`);

    const urls: string[] = [];
    const serverErrors: string[] = [];

    for (const file of processedFiles) {
      try {
        const signedRes = await fetch(`/api/upload/signed-url?filename=${encodeURIComponent(file.name)}&contentType=${encodeURIComponent(file.type)}&prefix=${encodeURIComponent('creator-portfolios')}`, {
          method: 'GET',
          credentials: 'include'
        });
        if (!signedRes.ok) {
          const err = await signedRes.json().catch(() => ({}));
          serverErrors.push(err.error || `Failed to get signed URL for ${file.name}`);
          continue;
        }
        const { path, token } = await signedRes.json();

        const { error } = await supabase.storage
          .from('uploads')
          .uploadToSignedUrl(path, token, file, { contentType: file.type });

        if (error) {
          serverErrors.push(`${file.name}: ${error.message}`);
          continue;
        }

        const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(path);
        urls.push(urlData.publicUrl);
      } catch (e) {
        console.error('Signed upload error:', e);
        serverErrors.push(`Failed to upload ${file.name}`);
      }
    }

    console.log('Portfolio upload complete:', {
      successCount: urls.length,
      errorCount: validationErrors.length + serverErrors.length,
      userId
    });

    return {
      urls,
      errors: [...validationErrors, ...serverErrors]
    };

  } catch (err) {
    console.error('Unexpected portfolio upload error:', err);
    throw new Error(`Portfolio upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
}

export async function uploadCampaignImage(
  file: File,
  userId: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  void onProgress; // Parameter kept for API consistency
  try {
    console.log('Campaign image upload attempt:', {
      betterAuthUserId: userId,
      fileDetails: {
        name: file.name,
        type: file.type,
        size: file.size
      }
    });

    const validation = validateImageFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    let processedFile = file;
    if (file.size > RECOMMENDED_IMAGE_SIZE && file.type !== 'image/svg+xml') {
      processedFile = await compressImage(file);
    }

    const formData = new FormData();
    formData.append('file', processedFile);

    console.log(' Uploading via secure API endpoint...');

    const response = await fetch('/api/upload/campaign-image', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
      console.error('Upload API error:', errorData);

      if (response.status === 401) {
        throw new Error('Please log in to upload files');
      }
      if (response.status === 413) {
        throw new Error('File too large. Maximum size is 5MB');
      }
      if (errorData.error?.includes('Invalid file type')) {
        throw new Error(`File type not supported. Please use: ${getFileTypeDisplay()}`);
      }

      throw new Error(errorData.error || 'Upload failed. Please try again.');
    }

    const result = await response.json();

    console.log('Campaign image upload successful:', {
      publicUrl: result.url,
      path: result.path,
      userId
    });

    return result.url;

  } catch (err) {
    console.error('Unexpected campaign image upload error:', err);
    throw new Error(`Campaign image upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
}

export async function uploadSubmissionAssets(
  files: File[],
  campaignId: string,
  taskId: string,
  onProgress?: (progress: number) => void
): Promise<{
  assets: Array<{
    url: string;
    type: 'image' | 'video';
    title: string;
    file_size: string;
    name: string;
    dimensions?: string;
    duration?: string;
    thumbnail_url?: string;
  }>; errors?: string[]
}> {
  // onProgress parameter is unused but kept for API consistency
  void onProgress;
  try {
    console.log('Submission assets upload attempt:', {
      campaignId,
      taskId,
      fileCount: files.length,
      files: files.map(f => ({
        name: f.name,
        type: f.type,
        size: f.size
      }))
    });

    if (files.length === 0) {
      throw new Error('No files provided for upload');
    }

    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    formData.append('campaignId', campaignId);
    formData.append('taskId', taskId);

    console.log(`Uploading ${files.length} submission assets...`);

    const response = await fetch('/api/upload/submission-assets', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
      console.error('Submission assets upload API error:', errorData);

      if (response.status === 401) {
        throw new Error('Please log in to upload files');
      }
      if (response.status === 403) {
        throw new Error('You are not authorized to upload to this campaign');
      }
      if (response.status === 413) {
        throw new Error('One or more files are too large');
      }

      throw new Error(errorData.error || 'Upload failed. Please try again.');
    }

    const result = await response.json();

    console.log('Submission assets upload complete:', {
      successCount: result.assets?.length || 0,
      errorCount: result.errors?.length || 0,
      campaignId,
      taskId
    });

    return {
      assets: result.assets || [],
      errors: result.errors
    };

  } catch (err) {
    console.error('Unexpected submission assets upload error:', err);
    throw new Error(`Submission assets upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
} 