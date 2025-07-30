import { supabaseAdmin } from '@/lib/supabase/supabase';

// Image upload utility
export async function uploadImage(file: File, bucket: string = 'gallery'): Promise<{ url: string; path: string } | null> {
  try {
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(fileName, file);

    if (error) {
      console.error('Image upload error:', error);
      return null;
    }

    const { data: urlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return {
      url: urlData.publicUrl,
      path: data.path
    };
  } catch (err) {
    console.error('Image upload error:', err);
    return null;
  }
}

// Image deletion utility
export async function deleteImage(path: string, bucket: string = 'gallery'): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      console.error('Image deletion error:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Image deletion error:', err);
    return false;
  }
}

// List images utility
export async function listImages(bucket: string = 'gallery'): Promise<string[]> {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .list();

    if (error) {
      console.error('Image listing error:', error);
      return [];
    }

    return data?.map(file => file.name) || [];
  } catch (err) {
    console.error('Image listing error:', err);
    return [];
  }
}

/**
 * Validate image file
 * @param file The file to validate
 * @param maxSizeMB Maximum file size in MB
 * @returns Validation result
 */
export function validateImageFile(
  file: File,
  maxSizeMB: number = 5
): { valid: boolean; error?: string } {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Please upload a valid image file (JPEG, PNG, WebP, or GIF)'
    };
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size must be less than ${maxSizeMB}MB`
    };
  }

  return { valid: true };
}

/**
 * Generate optimized image URL
 * @param originalUrl The original image URL
 * @param width Optional width for resizing
 * @param height Optional height for resizing
 * @param quality Optional quality (1-100)
 * @returns Optimized image URL
 */
export function getOptimizedImageUrl(
  originalUrl: string,
  width?: number,
  height?: number,
  quality: number = 80
): string {
  if (!originalUrl.includes('supabase.co')) {
    return originalUrl;
  }

  const url = new URL(originalUrl);
  const params = new URLSearchParams();

  if (width) params.append('width', width.toString());
  if (height) params.append('height', height.toString());
  if (quality) params.append('quality', quality.toString());

  if (params.toString()) {
    url.search = params.toString();
  }

  return url.toString();
}
