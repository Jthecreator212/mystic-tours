// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });
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

// Categories for placeholder images
const categories = [
  'nature', 'beach', 'mountain', 'food', 
  'music', 'culture', 'waterfall', 'sunset'
];

async function updateImagesWithPlaceholders() {
  console.log('Updating image URLs in gallery_images table with placeholder images...');
  
  try {
    // Get all images from the gallery_images table
    const { data, error } = await supabase
      .from('gallery_images')
      .select('*');
    
    if (error) {
      throw error;
    }
    
    console.log(`Found ${data.length} images to update.`);
    
    let updatedCount = 0;
    
    // Update each image URL with a placeholder
    for (const [index, image] of data.entries()) {
      // Get category from image or use a default one
      let category = image.category?.toLowerCase() || categories[index % categories.length];
      
      // Create a placeholder URL with the image name and category
      const imageName = image.name || `Gallery Image ${index + 1}`;
      const placeholderUrl = `https://placehold.co/800x600/4a7c59/ffffff?text=${encodeURIComponent(imageName)}`;
      
      const { error: updateError } = await supabase
        .from('gallery_images')
        .update({ image_url: placeholderUrl })
        .eq('id', image.id);
      
      if (updateError) {
        console.error(`Error updating image ${image.id}:`, updateError.message);
      } else {
        updatedCount++;
        console.log(`Updated image ${image.id} URL to placeholder: "${placeholderUrl}"`);
      }
    }
    
    console.log(`\nSuccessfully updated ${updatedCount} out of ${data.length} image URLs to placeholders.`);
    console.log('Please refresh your admin page to see the placeholder images.');
    
  } catch (error) {
    console.error('Error updating image URLs:', error instanceof Error ? error.message : String(error));
  }
}

updateImagesWithPlaceholders().catch(console.error);
