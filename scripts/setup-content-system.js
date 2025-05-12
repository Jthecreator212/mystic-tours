// This script sets up the content management system
// It creates the content_areas table and adds default content areas
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Define default content areas
const defaultAreas = [
  // Homepage content areas
  {
    area_key: 'hero_background',
    name: 'Homepage Hero Background',
    description: 'The main hero background image displayed on the homepage',
    image_url: '/images/hero-bg.jpg',
    alt_text: 'Mystic Tours homepage hero background',
    section: 'homepage'
  },
  
  // Tour content areas
  {
    area_key: 'tour_1',
    name: 'Roots & Culture Experience Tour Image',
    description: 'Image for the Roots & Culture Experience tour',
    image_url: '/images/tour-1.png',
    alt_text: 'Roots & Culture Experience tour image',
    section: 'tours'
  },
  {
    area_key: 'tour_2',
    name: 'Island Paradise Escape Tour Image',
    description: 'Image for the Island Paradise Escape tour',
    image_url: '/images/tour-2.png',
    alt_text: 'Island Paradise Escape tour image',
    section: 'tours'
  },
  {
    area_key: 'tour_3',
    name: 'Mountain Village Trek Tour Image',
    description: 'Image for the Mountain Village Trek tour',
    image_url: '/images/tour-3.png',
    alt_text: 'Mountain Village Trek tour image',
    section: 'tours'
  },
  
  // Testimonial content areas
  {
    area_key: 'testimonial_1',
    name: 'Marcus J. Testimonial Image',
    description: 'Profile image for Marcus J. testimonial',
    image_url: '/images/testimonial-1.png',
    alt_text: 'Marcus J. from New York',
    section: 'testimonials'
  },
  {
    area_key: 'testimonial_2',
    name: 'Sarah T. Testimonial Image',
    description: 'Profile image for Sarah T. testimonial',
    image_url: '/images/testimonial-2.png',
    alt_text: 'Sarah T. from London',
    section: 'testimonials'
  },
  
  // About page content areas
  {
    area_key: 'about_header',
    name: 'About Page Header',
    description: 'The header image for the about page',
    image_url: 'https://placehold.co/1200x400/4a7c59/ffffff?text=About+Header',
    alt_text: 'About Mystic Tours header image',
    section: 'about'
  },
  
  // Gallery content areas
  {
    area_key: 'gallery_1',
    name: 'Gallery Image 1',
    description: 'First image in the gallery section',
    image_url: 'https://placehold.co/800x600/4a7c59/ffffff?text=Gallery+Image+1',
    alt_text: 'Beautiful scenery from Jamaica',
    section: 'gallery'
  },
  {
    area_key: 'gallery_2',
    name: 'Gallery Image 2',
    description: 'Second image in the gallery section',
    image_url: 'https://placehold.co/800x600/4a7c59/ffffff?text=Gallery+Image+2',
    alt_text: 'Jamaican cultural experience',
    section: 'gallery'
  },
  {
    area_key: 'gallery_3',
    name: 'Gallery Image 3',
    description: 'Third image in the gallery section',
    image_url: 'https://placehold.co/800x600/4a7c59/ffffff?text=Gallery+Image+3',
    alt_text: 'Tropical beach in Jamaica',
    section: 'gallery'
  },
  { 
    area_key: 'footer_logo', 
    name: 'Footer Logo', 
    description: 'The logo displayed in the website footer',
    image_url: 'https://placehold.co/200x100/4a7c59/ffffff?text=Mystic+Tours+Logo',
    alt_text: 'Mystic Tours logo',
    section: 'global'
  }
];

async function setupContentSystem() {
  try {
    console.log('Setting up content management system...');
    
    // Check if the content_areas table exists
    console.log('Checking if content_areas table exists...');
    const { error: checkError } = await supabase
      .from('content_areas')
      .select('id')
      .limit(1);
    
    // If there's no error, the table exists
    if (!checkError) {
      console.log('✅ Content_areas table already exists');
    } else {
      // If we get an error, the table doesn't exist, so create it by inserting a record
      console.log('Creating content_areas table...');
      
      // Try inserting the first record to create the table
      const { error: insertError } = await supabase
        .from('content_areas')
        .insert(defaultAreas[0]);
      
      if (insertError) {
        console.error('❌ Error creating content_areas table:', insertError.message);
        return;
      }
      
      console.log('✅ Content_areas table created successfully');
    }
    
    // Insert all default content areas
    console.log('Adding default content areas...');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const area of defaultAreas) {
      // Skip the first one if we just created the table with it
      if (checkError && area.area_key === defaultAreas[0].area_key) {
        successCount++;
        continue;
      }
      
      const { error: insertError } = await supabase
        .from('content_areas')
        .upsert(area, { onConflict: 'area_key' });
      
      if (insertError) {
        console.error(`❌ Error inserting ${area.area_key}:`, insertError.message);
        errorCount++;
      } else {
        console.log(`✅ Added content area: ${area.area_key}`);
        successCount++;
      }
    }
    
    console.log(`\nContent system setup complete!`);
    console.log(`✅ Successfully added/updated ${successCount} content areas`);
    if (errorCount > 0) {
      console.log(`❌ Failed to add ${errorCount} content areas`);
    }
    
  } catch (error) {
    console.error('❌ Error setting up content system:', error.message);
  }
}

// Run the setup function
setupContentSystem();
