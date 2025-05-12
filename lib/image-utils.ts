import { createClient } from '@supabase/supabase-js';

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseAdmin = createClient(
  supabaseUrl || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);
const supabase = createClient(supabaseUrl || '', supabaseKey || '');

// Storage bucket names
export const BUCKETS = {
  GALLERY: 'gallery-images',
  TOURS: 'tour-images',
  SITE: 'site-images',
  TEAM: 'team-images',
};

/**
 * Upload an image to Supabase Storage
 * @param file The file to upload
 * @param bucket The storage bucket to upload to
 * @param customFileName Optional custom filename
 * @returns The public URL of the uploaded image
 */
export async function uploadImage(
  file: File,
  bucket: string = BUCKETS.GALLERY,
  customFileName?: string
) {
  // Create a unique filename if not provided
  const fileExt = file.name.split('.').pop();
  const fileName = customFileName || 
    `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

  // Upload to Supabase Storage
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(fileName, file, {
      upsert: true,
      contentType: file.type,
    });

  if (error) {
    throw error;
  }

  // Get the public URL
  const { data: urlData } = supabaseAdmin.storage
    .from(bucket)
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

/**
 * Delete an image from Supabase Storage
 * @param url The full URL of the image to delete
 * @param bucket The storage bucket the image is in
 */
export async function deleteImage(url: string, bucket: string = BUCKETS.GALLERY) {
  // Extract the filename from the URL
  const urlParts = url.split('/');
  const fileName = urlParts[urlParts.length - 1];

  // Delete the file from storage
  const { error } = await supabaseAdmin.storage.from(bucket).remove([fileName]);

  if (error) {
    throw error;
  }

  return true;
}

/**
 * Get a public URL for an image in Supabase Storage
 * @param fileName The name of the file
 * @param bucket The storage bucket the image is in
 * @returns The public URL of the image
 */
export function getImageUrl(fileName: string, bucket: string = BUCKETS.GALLERY) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
  return data.publicUrl;
}

/**
 * Create a storage bucket if it doesn't exist
 * @param bucketName The name of the bucket to create
 * @param isPublic Whether the bucket should be public
 */
export async function createBucketIfNotExists(
  bucketName: string,
  isPublic: boolean = true
) {
  try {
    // Check if the bucket exists
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const bucketExists = buckets.some((bucket) => bucket.name === bucketName);

    if (!bucketExists) {
      // Create the bucket
      await supabaseAdmin.storage.createBucket(bucketName, {
        public: isPublic,
      });
    }
    return true;
  } catch (error) {
    console.error(`Error creating bucket ${bucketName}:`, error);
    return false;
  }
}

/**
 * Ensure all required buckets exist
 */
export async function ensureAllBucketsExist() {
  await Promise.all([
    createBucketIfNotExists(BUCKETS.GALLERY),
    createBucketIfNotExists(BUCKETS.TOURS),
    createBucketIfNotExists(BUCKETS.SITE),
    createBucketIfNotExists(BUCKETS.TEAM),
  ]);
}
