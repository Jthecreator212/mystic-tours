// Main scripts index
// Centralized access to all script categories

export { DATABASE_MIGRATIONS } from './migrations/database';
export { UNIT_TESTS } from './testing/unit';
export { DEBUG_SCRIPTS } from './utilities/debugging';
export { DATA_MIGRATION_SCRIPTS } from './utilities/data-migration';
export { IMAGE_PROCESSING_SCRIPTS } from './utilities/image-processing';

// Script execution helpers
export const SCRIPT_CATEGORIES = {
  database: 'Database migration and schema scripts',
  testing: 'Unit and integration test scripts',
  debugging: 'Diagnostic and troubleshooting scripts',
  dataMigration: 'Data transformation and migration scripts',
  imageProcessing: 'Image upload and processing scripts',
} as const; 