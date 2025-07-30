import { createClient } from '@supabase/supabase-js';

// Environment variables with fallbacks for development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bsxloajxptdsgqkxbiem.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzeGxvYWp4cHRkc2dxa3hiaWVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5MzUyMzMsImV4cCI6MjA2MjUxMTIzM30.lhZoU7QeDRI4yBVvfOiRs1nBTe7BDkwDxchNWsA1kXk'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzeGxvYWp4cHRkc2dxa3hiaWVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjkzNTIzMywiZXhwIjoyMDYyNTExMjMzfQ.q-T_wVjHm5MtkyvO93pdnuQiXkPIEpYsqeLcFI8sryA'

// Validate required environment variables
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing required Supabase environment variables for image utilities')
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  }
});

// Storage bucket names
export const BUCKETS = {
  GALLERY: 'gallery-images',
  TOURS: 'tour-images',
  SITE: 'site-images',
  TEAM: 'team-images',
} as const;

/**
 * Upload an image to Supabase Storage
 * @param file The file to upload
 * @param bucket The storage bucket to upload to
 * @param customFileName Optional custom filename
 * @returns The public URL of the uploaded image
 */
export async function uploadImage(
  file: File,
  bucket: keyof typeof BUCKETS,
  customFileName?: string
): Promise<string> {
  try {
    const fileName = customFileName || `${Date.now()}-${file.name}`;
    const filePath = `${bucket}/${fileName}`;

    const { data, error } = await supabase.storage
      .from(BUCKETS[bucket])
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    const { data: urlData } = supabase.storage
      .from(BUCKETS[bucket])
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Image upload error:', error);
    throw new Error('Failed to upload image');
  }
}

/**
 * Delete an image from Supabase Storage
 * @param filePath The path to the file to delete
 * @param bucket The storage bucket
 */
export async function deleteImage(
  filePath: string,
  bucket: keyof typeof BUCKETS
): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from(BUCKETS[bucket])
      .remove([filePath]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  } catch (error) {
    console.error('Image deletion error:', error);
    throw new Error('Failed to delete image');
  }
}

/**
 * Get a list of images from a bucket
 * @param bucket The storage bucket
 * @param folder Optional folder path
 * @returns Array of image URLs
 */
export async function listImages(
  bucket: keyof typeof BUCKETS,
  folder?: string
): Promise<string[]> {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKETS[bucket])
      .list(folder || '', {
        limit: 100,
        offset: 0
      });

    if (error) {
      throw new Error(`List failed: ${error.message}`);
    }

    return data
      .filter(item => !item.name.endsWith('/'))
      .map(item => {
        const { data: urlData } = supabase.storage
          .from(BUCKETS[bucket])
          .getPublicUrl(folder ? `${folder}/${item.name}` : item.name);
        return urlData.publicUrl;
      });
  } catch (error) {
    console.error('Image listing error:', error);
    throw new Error('Failed to list images');
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
