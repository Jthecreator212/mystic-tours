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

async function createContentManagementTables() {
  console.log('Setting up content management tables for Mystic Tours...');
  
  try {
    // Check if the content_areas table exists
    const { error: checkError } = await supabase
      .from('content_areas')
      .select('id')
      .limit(1);
    
    // If the table doesn't exist, create it
    if (checkError && checkError.code === '42P01') { // Table doesn't exist
      console.log('Creating content_areas table...');
      
      // Instead of creating the table directly, we'll use the Supabase API
      // First, let's try to insert a record - this will create the table if it doesn't exist
      const contentArea = { 
        area_key: 'homepage_hero', 
        name: 'Homepage Hero Image', 
        description: 'The main hero image on the homepage',
        image_url: 'https://placehold.co/1200x600/4a7c59/ffffff?text=Homepage+Hero',
        alt_text: 'Explore beautiful Jamaica with Mystic Tours',
        section: 'homepage'
      };
      
      // Try to create the table by inserting a record
      const { error: createError } = await supabase
        .from('content_areas')
        .insert(contentArea);
      
      if (createError) {
        throw createError;
      }
      
      console.log('✅ content_areas table created successfully.');
      
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
        },
        { 
          area_key: 'homepage_hero', 
          name: 'Homepage Hero Image', 
          description: 'The main hero image on the homepage',
          image_url: 'https://placehold.co/1200x600/4a7c59/ffffff?text=Homepage+Hero',
          alt_text: 'Explore beautiful Jamaica with Mystic Tours',
          section: 'homepage'
        },
        { 
          area_key: 'about_header', 
          name: 'About Us Header', 
          description: 'The header image for the About Us page',
          image_url: 'https://placehold.co/1200x400/4a7c59/ffffff?text=About+Us+Header',
          alt_text: 'Our team at Mystic Tours',
          section: 'about'
        },
        { 
          area_key: 'tour_default', 
          name: 'Default Tour Image', 
          description: 'The default image used for tours without a specific image',
          image_url: 'https://placehold.co/800x600/4a7c59/ffffff?text=Tour+Default+Image',
          alt_text: 'Mystic Tours adventure',
          section: 'tours'
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
      
      for (const area of contentAreas) {
        const { error: insertError } = await supabase
          .from('content_areas')
          .insert(area);
        
        if (insertError) {
          console.error(`Error inserting ${area.area_key}:`, insertError.message);
        } else {
          console.log(`✅ Added content area: ${area.name}`);
        }
      }
    } else {
      console.log('✅ content_areas table already exists.');
    }
    
    console.log('\nContent management tables are set up and ready to use!');
    console.log('\nYou can now manage content areas through the admin panel.');
    
  } catch (error) {
    console.error('Error setting up content management tables:', error.message);
  }
}

// Main function to run the script
async function main() {
  await createContentManagementTables();
}

main().catch(console.error);
