// This script updates image URLs in the content_areas table to include the full domain path
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixContentImageUrls() {
  try {
    console.log('Fetching content areas from database...');
    
    // Get all content areas
    const { data: contentAreas, error } = await supabase
      .from('content_areas')
      .select('*');
    
    if (error) {
      throw error;
    }
    
    if (!contentAreas || contentAreas.length === 0) {
      console.log('No content areas found in the database.');
      return;
    }
    
    console.log(`Found ${contentAreas.length} content areas. Updating image URLs...`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const area of contentAreas) {
      // Check if the image_url already has the domain
      if (area.image_url && !area.image_url.startsWith('http')) {
        // Only update if it's a relative URL
        const oldUrl = area.image_url;
        const newUrl = `${siteUrl}${area.image_url.startsWith('/') ? '' : '/'}${area.image_url}`;
        
        // Update the record in the database
        const { error: updateError } = await supabase
          .from('content_areas')
          .update({ image_url: newUrl })
          .eq('id', area.id);
        
        if (updateError) {
          console.error(`❌ Error updating ${area.area_key}:`, updateError.message);
        } else {
          console.log(`✅ Updated ${area.area_key}: ${oldUrl} → ${newUrl}`);
          updatedCount++;
        }
      } else {
        // Skip URLs that are already absolute
        console.log(`⏩ Skipped ${area.area_key}: URL already absolute or empty`);
        skippedCount++;
      }
    }
    
    console.log('\nImage URL update complete!');
    console.log(`✅ Updated ${updatedCount} content areas`);
    console.log(`⏩ Skipped ${skippedCount} content areas (already had absolute URLs)`);
    
  } catch (error) {
    console.error('❌ Error updating image URLs:', error.message);
  }
}

// Run the function
fixContentImageUrls();
