import { supabase } from '@/lib/supabase';

// File validation constants
export const ALLOWED_FILE_TYPES = {
  'image/png': 'PNG',
  'image/jpeg': 'JPEG',
  'image/jpg': 'JPG',
  'image/gif': 'GIF',
  'image/webp': 'WebP',
  'image/svg+xml': 'SVG'
} as const;

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const RECOMMENDED_MAX_SIZE = 1024 * 1024; // 1MB for compression

export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  if (!file) {
    return { isValid: false, error: 'No file selected' };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size must be less than ${Math.round(MAX_FILE_SIZE / (1024 * 1024))}MB. Your file is ${Math.round(file.size / (1024 * 1024) * 10) / 10}MB.`
    };
  }

  // Check file type
  if (!Object.keys(ALLOWED_FILE_TYPES).includes(file.type)) {
    const allowedTypes = Object.values(ALLOWED_FILE_TYPES).join(', ');
    return {
      isValid: false,
      error: `File type not supported. Please use: ${allowedTypes}. Your file type: ${file.type || 'Unknown'}`
    };
  }

  return { isValid: true };
}

export function getFileTypeDisplay(): string {
  return Object.values(ALLOWED_FILE_TYPES).join(', ');
}

export function getMaxFileSizeDisplay(): string {
  return `${Math.round(MAX_FILE_SIZE / (1024 * 1024))}MB`;
}

// Helper function to compress images before upload (skip SVG files)
export async function compressImage(file: File, maxWidth: number = 800, quality: number = 0.8): Promise<File> {
  // Don't compress SVG files
  if (file.type === 'image/svg+xml') {
    return file;
  }

  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();

    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

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
  try {
    console.log('🔄 Upload attempt details:', {
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
    if (file.size > RECOMMENDED_MAX_SIZE && file.type !== 'image/svg+xml') {
      processedFile = await compressImage(file);
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `brand-logo-${userId}-${Date.now()}.${fileExt}`;
    const filePath = `brand-logos/${fileName}`;

    // Create FormData for API upload
    const formData = new FormData();
    formData.append('file', processedFile);

    console.log('📤 Uploading via secure API endpoint...');

    // Upload via API endpoint (works for both Supabase and Better Auth users)
    const response = await fetch('/api/upload/brand-logo', {
      method: 'POST',
      body: formData,
      credentials: 'include' // Include cookies for Better Auth session
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
      console.error('❌ Upload API error:', errorData);

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

    console.log('✅ Upload successful:', {
      publicUrl: result.url,
      path: result.path,
      userId
    });

    return result.url;

  } catch (err) {
    console.error('❌ Unexpected upload error:', err);
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

    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false // Ensure unique paths
      });

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
  try {
    console.log('🔄 Upload attempt details:', {
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
    if (file.size > RECOMMENDED_MAX_SIZE && file.type !== 'image/svg+xml') {
      processedFile = await compressImage(file);
    }

    const formData = new FormData();
    formData.append('file', processedFile);

    console.log('📤 Uploading via secure API endpoint...');

    const response = await fetch('/api/upload/creator-profile', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
      console.error('❌ Upload API error:', errorData);

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

    console.log('✅ Upload successful:', {
      publicUrl: result.url,
      path: result.path,
      userId
    });

    return result.url;

  } catch (err) {
    console.error('❌ Unexpected upload error:', err);
    throw new Error(`Profile image upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
}

export async function uploadPortfolioImages(
  files: File[],
  userId: string,
  onProgress?: (progress: number) => void
): Promise<{ urls: string[]; errors?: string[] }> {
  try {
    console.log('🔄 Portfolio upload attempt:', {
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
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        validationErrors.push(`${file.name}: ${validation.error}`);
        continue;
      }

      let processedFile = file;
      if (file.size > RECOMMENDED_MAX_SIZE && file.type !== 'image/svg+xml') {
        processedFile = await compressImage(file);
      }
      processedFiles.push(processedFile);
    }

    if (processedFiles.length === 0) {
      throw new Error('No valid images to upload');
    }

    const formData = new FormData();
    processedFiles.forEach(file => {
      formData.append('files', file);
    });

    console.log(`📤 Uploading ${processedFiles.length} portfolio images...`);

    const response = await fetch('/api/upload/portfolio-images', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
      console.error('❌ Upload API error:', errorData);

      if (response.status === 401) {
        throw new Error('Please log in to upload files');
      }

      throw new Error(errorData.error || 'Upload failed. Please try again.');
    }

    const result = await response.json();

    console.log('✅ Portfolio upload complete:', {
      successCount: result.urls?.length || 0,
      errorCount: result.errors?.length || 0,
      userId
    });

    return {
      urls: result.urls || [],
      errors: [...validationErrors, ...(result.errors || [])]
    };

  } catch (err) {
    console.error('❌ Unexpected portfolio upload error:', err);
    throw new Error(`Portfolio upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
}

export async function uploadCampaignImage(
  file: File,
  userId: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  try {
    console.log('🔄 Campaign image upload attempt:', {
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
    if (file.size > RECOMMENDED_MAX_SIZE && file.type !== 'image/svg+xml') {
      processedFile = await compressImage(file);
    }

    const formData = new FormData();
    formData.append('file', processedFile);

    console.log('📤 Uploading via secure API endpoint...');

    const response = await fetch('/api/upload/campaign-image', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
      console.error('❌ Upload API error:', errorData);

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

    console.log('✅ Campaign image upload successful:', {
      publicUrl: result.url,
      path: result.path,
      userId
    });

    return result.url;

  } catch (err) {
    console.error('❌ Unexpected campaign image upload error:', err);
    throw new Error(`Campaign image upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
} 