// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase URL or service role key in .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Path to gallery images
const imagesDir = path.join(process.cwd(), 'public', 'images', 'gallery');
const BUCKET_NAME = 'gallery-images';

async function uploadImagesToSupabase() {
  console.log(`Uploading images from ${imagesDir} to Supabase Storage bucket: ${BUCKET_NAME}`);
  
  try {
    // Check if the bucket exists, create it if it doesn't
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets.some(bucket => bucket.name === BUCKET_NAME);
    
    if (!bucketExists) {
      console.log(`Bucket ${BUCKET_NAME} doesn't exist. Creating it...`);
      await supabase.storage.createBucket(BUCKET_NAME, {
        public: true // Make the bucket public
      });
      console.log(`Created bucket: ${BUCKET_NAME}`);
    }
    
    // Get all PNG files in the gallery folder
    const files = fs.readdirSync(imagesDir).filter(file => file.endsWith('.png'));
    console.log(`Found ${files.length} PNG files to upload.`);
    
    // Upload each file
    let successCount = 0;
    let errorCount = 0;
    
    for (const file of files) {
      const filePath = path.join(imagesDir, file);
      const fileContent = fs.readFileSync(filePath);
      
      console.log(`Uploading ${file}...`);
      
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(file, fileContent, {
          contentType: 'image/png',
          upsert: true // Overwrite if exists
        });
      
      if (error) {
        console.error(`Error uploading ${file}:`, error.message);
        errorCount++;
      } else {
        console.log(`Successfully uploaded ${file}`);
        successCount++;
      }
    }
    
    console.log(`\nUpload complete!`);
    console.log(`Successfully uploaded ${successCount} out of ${files.length} files.`);
    if (errorCount > 0) {
      console.log(`Failed to upload ${errorCount} files.`);
    }
    
    console.log(`\nYour images should now be accessible at URLs like:`);
    console.log(`${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/gallery-1.png`);
    console.log(`\nPlease refresh your admin page to see if the images are now displaying correctly.`);
    
  } catch (error) {
    console.error('Error uploading images:', error instanceof Error ? error.message : String(error));
  }
}

uploadImagesToSupabase().catch(console.error);
