import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';
import * as fs from 'fs/promises';
import * as path from 'path';

// --- Static Data Imports ---
import { teamData } from '@/data/team';
import { tourData } from '@/data/tours';

// --- Configuration ---
const BUCKET_NAME = 'site-images';
const PUBLIC_IMAGE_DIR = path.resolve(__dirname, '../../public'); // Root of public folder

// --- Supabase Client ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase URL or service key not found in .env file.');
}
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// --- Helper Functions ---

/**
 * Ensures a storage bucket exists, creating it if necessary.
 */
async function ensureBucketExists() {
  const { data: buckets, error } = await supabaseAdmin.storage.listBuckets();
  if (error) throw new Error(`Error listing buckets: ${error.message}`);
  
  if (!buckets.some((bucket) => bucket.name === BUCKET_NAME)) {
    console.log(`Bucket "${BUCKET_NAME}" not found. Creating it...`);
    const { error: createError } = await supabaseAdmin.storage.createBucket(BUCKET_NAME, { public: true });
    if (createError) throw new Error(`Error creating bucket: ${createError.message}`);
    console.log(`Bucket "${BUCKET_NAME}" created successfully.`);
  } else {
    console.log(`Bucket "${BUCKET_NAME}" already exists.`);
  }
}

/**
 * Uploads a local file to Supabase Storage if it doesn't already exist.
 * @param localPath - Relative path from the 'public' directory (e.g., '/images/team/marcus.png').
 * @returns The public URL of the uploaded file.
 */
async function uploadImageAndGetUrl(localPath: string): Promise<string> {
    const fullLocalPath = path.join(PUBLIC_IMAGE_DIR, localPath);
    const fileName = path.basename(localPath);

    try {
        await fs.access(fullLocalPath);
    } catch {
        console.error(`  ❌ ERROR: Local file not found at ${fullLocalPath}. Skipping upload.`);
        return localPath; // Return original path if not found
    }

    const fileBuffer = await fs.readFile(fullLocalPath);

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .upload(fileName, fileBuffer, { upsert: true }); // Use upsert to avoid errors on re-runs

    if (uploadError) {
        console.error(`  ❌ ERROR uploading ${fileName}:`, uploadError.message);
        return localPath;
    }

    const { data: urlData } = supabaseAdmin.storage.from(BUCKET_NAME).getPublicUrl(fileName);
    return urlData.publicUrl;
}

// --- Main Migration Logic ---

async function migrateContent() {
  try {
    console.log('--- Starting Content Migration ---');
    await ensureBucketExists();

    // 1. Clear existing data to prevent duplicates
    console.log('\nClearing existing data...');
    await supabaseAdmin.from('tour_highlights').delete().gt('id', -1);
    await supabaseAdmin.from('tour_itinerary').delete().gt('id', -1);
    await supabaseAdmin.from('tour_gallery_images').delete().gt('id', -1);
    await supabaseAdmin.from('team_members').delete().gt('id', -1);
    console.log('✅ Existing related data cleared.');

    // 2. Migrate Team Members
    console.log('\nMigrating Team Members...');
    for (const member of teamData) {
      console.log(`  Processing ${member.name}...`);
      const imageUrl = await uploadImageAndGetUrl(member.image);
      await supabaseAdmin.from('team_members').insert({
        name: member.name,
        role: member.role,
        image_url: imageUrl,
        bio: member.bio,
      });
    }
    console.log('✅ Team Members migrated.');

    // 3. Fetch existing tours and migrate their related data
    console.log('\nFetching existing tours to link related data...');
    const { data: existingTours, error: fetchToursError } = await supabaseAdmin
        .from('tours')
        .select('id, slug');

    if (fetchToursError) {
        throw new Error(`Could not fetch existing tours: ${fetchToursError.message}`);
    }

    console.log(`Found ${existingTours.length} existing tours. Now migrating related content.`);

    for (const tour of tourData) {
      console.log(`  Processing ${tour.title}...`);
      
      const existingTour = existingTours.find(t => t.slug === tour.slug);

      if (!existingTour) {
        console.warn(`  ⚠️ WARNING: Tour with slug "${tour.slug}" not found in database. Skipping.`);
        continue;
      }
      
      const tourId = existingTour.id;

      // Insert highlights
      await supabaseAdmin.from('tour_highlights').insert(
        tour.highlights.map(content => ({ tour_id: tourId, content }))
      );

      // Insert itinerary
      await supabaseAdmin.from('tour_itinerary').insert(
        tour.itinerary.map((item, index) => ({
          tour_id: tourId,
          title: item.title,
          description: item.description,
          display_order: index + 1,
        }))
      );

      // Upload gallery images and insert records
      const galleryImageRecords = await Promise.all(
        tour.galleryImages.map(async (img) => ({
          tour_id: tourId,
          image_url: await uploadImageAndGetUrl(img.src),
          alt_text: img.alt,
        }))
      );
      await supabaseAdmin.from('tour_gallery_images').insert(galleryImageRecords);
      console.log(`  ✅ Related data for "${tour.title}" migrated.`);
    }
    console.log('✅ Tour content migrated.');

    console.log('\n--- Content Migration Complete ---');

  } catch (error) {
    console.error('\n--- A critical error occurred ---', error);
  }
}

migrateContent(); 