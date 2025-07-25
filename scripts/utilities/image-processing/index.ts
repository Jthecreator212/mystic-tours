// Image processing scripts
// These scripts handle image upload, processing, and management

export const IMAGE_PROCESSING_SCRIPTS = {
  uploadImagesToSupabase: './upload-images-to-supabase.js',
  fixContentImageUrls: './fix-content-image-urls.js',
  fixImageUrlsJs: './fix-image-urls.js',
  usePlaceholderImages: './use-placeholder-images.js',
} as const; 