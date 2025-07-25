import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs/promises';
import * as path from 'path';
import 'dotenv/config';

console.log('--- Script starting ---');

// --- Configuration ---
const BUCKET_NAME = 'site-images';
const PUBLIC_IMAGE_DIR = path.resolve(__dirname, '../../public/images');
// --- End Configuration ---

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// --- Debugging Environment Variables ---
console.log(`Supabase URL loaded: ${supabaseUrl ? 'Yes' : 'No'}`);
console.log(`Supabase Service Key loaded: ${supabaseServiceKey ? 'Yes' : 'No'}`);
// --- End Debugging ---

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('🔴 Critical Error: Supabase URL or service key not found.');
  console.error('Please ensure you have a .env file in the project root with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1); // Exit with an error code
}

// Initialize Supabase admin client
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// --- Helper Functions ---

/**
 * Checks if a Supabase storage bucket exists and creates it if it doesn't.
 */
async function ensureBucketExists() {
  const { data: buckets, error } = await supabaseAdmin.storage.listBuckets();
  if (error) {
    console.error('Error listing buckets:', error.message);
    throw error;
  }

  const bucketExists = buckets.some((bucket) => bucket.name === BUCKET_NAME);

  if (!bucketExists) {
    console.log(`Bucket "${BUCKET_NAME}" not found. Creating it...`);
    const { error: createError } = await supabaseAdmin.storage.createBucket(BUCKET_NAME, {
      public: true, // Make files publicly accessible
    });
    if (createError) {
      console.error(`Error creating bucket:`, createError.message);
      throw createError;
    }
    console.log(`Bucket "${BUCKET_NAME}" created successfully.`);
  } else {
    console.log(`Bucket "${BUCKET_NAME}" already exists.`);
  }
}

/**
 * Finds a local image file, accounting for potential extension mismatches.
 * @param baseFilename - The filename without extension (e.g., 'hero-bg').
 * @returns The full path to the found file or null if not found.
 */
async function findLocalImage(baseFilename: string): Promise<string | null> {
    const extensions = ['.png', '.jpg', '.jpeg', '.svg', '.gif'];
    for (const ext of extensions) {
        const fullPath = path.join(PUBLIC_IMAGE_DIR, `${baseFilename}${ext}`);
        try {
            await fs.access(fullPath);
            return fullPath;
        } catch {
            // File does not exist, try next extension
        }
    }
    // A special check for hero-bg.jpg vs hero-bg.png
    if (baseFilename === 'hero-bg') {
        const fullPath = path.join(PUBLIC_IMAGE_DIR, 'hero-bg.png');
         try {
            await fs.access(fullPath);
            return fullPath;
        } catch {
             // continue
        }
    }
    return null;
}

// --- Main Migration Logic ---

async function migrateImages() {
  try {
    console.log('--- Starting Image Migration ---');
    await ensureBucketExists();

    console.log('\nFetching records with localhost or placeholder URLs...');
    const { data: records, error: fetchError } = await supabaseAdmin
      .from('content_areas')
      .select('id, area_key, image_url')
      .or('image_url.like.%http://localhost:3000/%,image_url.like.%https://placehold.co/%');

    if (fetchError) {
      console.error('Error fetching records:', fetchError.message);
      return;
    }

    if (!records || records.length === 0) {
      console.log('✅ No records with localhost or placeholder URLs found. Nothing to migrate.');
      return;
    }

    console.log(`Found ${records.length} records to process.`);

    for (const record of records) {
      // Skip placeholders
      if (record.image_url.includes('placehold.co')) {
        console.log(`\nSKIPPING (Placeholder): ${record.area_key}`);
        continue;
      }

      console.log(`\nProcessing: ${record.area_key}`);
      const urlPath = path.basename(record.image_url);
      const baseFilename = path.parse(urlPath).name;
      
      const localImagePath = await findLocalImage(baseFilename);

      if (!localImagePath) {
        console.error(`  ❌ ERROR: Local image for "${baseFilename}" not found in ${PUBLIC_IMAGE_DIR}.`);
        continue;
      }

      console.log(`  🔍 Found local file: ${path.basename(localImagePath)}`);
      
      // Read file data
      const fileBuffer = await fs.readFile(localImagePath);
      const uploadPath = `${baseFilename}-${Date.now()}${path.extname(localImagePath)}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .upload(uploadPath, fileBuffer, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error(`  ❌ ERROR uploading file:`, uploadError.message);
        continue;
      }
      console.log(`  ⬆️ Uploaded to Supabase as: ${uploadPath}`);

      // Get public URL
      const { data: urlData } = supabaseAdmin.storage.from(BUCKET_NAME).getPublicUrl(uploadPath);
      const newPublicUrl = urlData.publicUrl;

      // Update the database record
      const { error: updateError } = await supabaseAdmin
        .from('content_areas')
        .update({ image_url: newPublicUrl, updated_at: new Date() })
        .eq('id', record.id);

      if (updateError) {
        console.error(`  ❌ ERROR updating database record:`, updateError.message);
        continue;
      }

      console.log(`  ✅ Successfully updated database with new URL: ${newPublicUrl}`);
    }

    console.log('\n--- Image Migration Complete ---');

  } catch (error) {
    if (error instanceof Error) {
        console.error('\n--- A critical error occurred ---');
        console.error(error.message);
    }
  }
}

migrateImages(); 