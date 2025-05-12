// Load environment variables from .env.local
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

// Import Supabase client
import { createClient } from '@supabase/supabase-js'

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase URL or service role key in .env.local file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Supabase Storage public URL base
const STORAGE_PUBLIC_URL = `${supabaseUrl}/storage/v1/object/public/gallery-images`;

async function fixImageUrls() {
  console.log('Fixing image URLs in gallery_images table...')
  
  try {
    // Get all images from the gallery_images table
    const { data, error } = await supabase
      .from('gallery_images')
      .select('*')
    
    if (error) {
      throw error
    }
    
    console.log(`Found ${data.length} images to update.`)
    
    let updatedCount = 0
    
    // Update each image URL
    for (const image of data) {
      if (image.image_url) {
        // Only update if not already a Supabase storage URL
        const isSupabaseStorageUrl = image.image_url.startsWith(`${supabaseUrl}/storage/v1/object/public/gallery-images`);
        if (!isSupabaseStorageUrl) {
          // Try to extract the filename from the current image_url
          let filename = image.image_url;
          // Remove any leading slashes or local path segments
          if (filename.startsWith('/')) filename = filename.substring(1);
          if (filename.startsWith('images/gallery/')) filename = filename.replace('images/gallery/', '');
          if (filename.startsWith('gallery/')) filename = filename.replace('gallery/', '');
          
          const newUrl = `${STORAGE_PUBLIC_URL}/${filename}`;

          const { error: updateError } = await supabase
            .from('gallery_images')
            .update({ image_url: newUrl })
            .eq('id', image.id)
          
          if (updateError) {
            console.error(`Error updating image ${image.id}:`, updateError.message)
          } else {
            updatedCount++;
            console.log(`Updated image ${image.id} URL from "${image.image_url}" to "${newUrl}"`);
          }
        }
      }
    }
    
    console.log(`\nSuccessfully updated ${updatedCount} out of ${data.length} image URLs.`)
    console.log('Please refresh your admin page to see the updated images.')
    
  } catch (error) {
    console.error('Error fixing image URLs:', error instanceof Error ? error.message : String(error))
  }
}

fixImageUrls().catch(console.error)
