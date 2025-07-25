// Data migration scripts
// These scripts handle data migration and transformation

export const DATA_MIGRATION_SCRIPTS = {
  migrateData: './migrate-data.ts',
  migrateContent: './migrate-content.ts',
  migrateImages: './migrate-images.ts',
  migrateTestimonials: './migrate-testimonials.ts',
  fixImageUrls: './fix-image-urls.ts',
} as const; 