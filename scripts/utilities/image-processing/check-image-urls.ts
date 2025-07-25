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

async function checkImageUrls() {
  console.log('Checking image URLs in gallery_images table...')
  
  try {
    // Get all images from the gallery_images table
    const { data, error } = await supabase
      .from('gallery_images')
      .select('*')
      .limit(5) // Just check the first 5 for brevity
    
    if (error) {
      throw error
    }
    
    console.log(`Found ${data.length} images. Here are the first 5:`)
    
    data.forEach((image, index) => {
      console.log(`\nImage ${index + 1}:`)
      console.log(`- ID: ${image.id}`)
      console.log(`- Title: ${image.title || image.name}`)
      console.log(`- Image URL: ${image.image_url}`)
      console.log(`- Category: ${image.category}`)
      
      // Check if the URL is accessible
      console.log(`- URL format check: ${image.image_url ? 'URL exists' : 'URL is missing or empty'}`)
      
      // Check if URL starts with http or https
      if (image.image_url) {
        const isValidUrl = image.image_url.startsWith('http://') || image.image_url.startsWith('https://')
        console.log(`- URL protocol check: ${isValidUrl ? 'Valid (starts with http:// or https://)' : 'Invalid (does not start with http:// or https://)'}`)
      }
    })
    
    console.log('\nIf the URLs are not starting with http:// or https://, or if they are empty, this could be why the images are not displaying.')
    console.log('You may need to update the image URLs in the database to include the full URL path.')
    
  } catch (error) {
    console.error('Error checking image URLs:', error instanceof Error ? error.message : String(error))
  }
}

checkImageUrls().catch(console.error)
