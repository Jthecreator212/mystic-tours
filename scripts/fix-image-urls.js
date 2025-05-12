require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

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

const STORAGE_PUBLIC_URL = `${supabaseUrl}/storage/v1/object/public/gallery-images`;

async function fixImageUrls() {
  console.log('Fixing image URLs in gallery_images table...');
  try {
    const { data, error } = await supabase
      .from('gallery_images')
      .select('*');
    if (error) {
      throw error;
    }
    console.log(`Found ${data.length} images to update.`);
    let updatedCount = 0;
    for (const image of data) {
      if (image.image_url) {
        const isSupabaseStorageUrl = image.image_url.startsWith(`${supabaseUrl}/storage/v1/object/public/gallery-images`);
        if (!isSupabaseStorageUrl) {
          let filename = image.image_url;
          // Extract only the filename from the URL (e.g., 'gallery-1.png')
          try {
            filename = filename.split('/').pop();
          } catch {}
          const newUrl = `${STORAGE_PUBLIC_URL}/${filename}`;
          const { error: updateError } = await supabase
            .from('gallery_images')
            .update({ image_url: newUrl })
            .eq('id', image.id);
          if (updateError) {
            console.error(`Error updating image ${image.id}:`, updateError.message);
          } else {
            updatedCount++;
            console.log(`Updated image ${image.id} URL from "${image.image_url}" to "${newUrl}"`);
          }
        }
      }
    }
    console.log(`\nSuccessfully updated ${updatedCount} out of ${data.length} image URLs.`);
    console.log('Please refresh your admin page to see the updated images.');
  } catch (error) {
    console.error('Error fixing image URLs:', error instanceof Error ? error.message : String(error));
  }
}

fixImageUrls().catch(console.error);
