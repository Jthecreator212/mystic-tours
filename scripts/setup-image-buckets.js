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

// Bucket definitions
const BUCKETS = {
  GALLERY: 'gallery-images',
  TOURS: 'tour-images',
  SITE: 'site-images',
  TEAM: 'team-images',
};

/**
 * Create a storage bucket if it doesn't exist
 */
async function createBucketIfNotExists(bucketName, isPublic = true) {
  try {
    console.log(`Checking if bucket '${bucketName}' exists...`);
    
    // Check if the bucket exists
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      throw error;
    }
    
    const bucketExists = buckets.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log(`Creating bucket '${bucketName}'...`);
      
      // Create the bucket
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: isPublic
      });
      
      if (createError) {
        throw createError;
      }
      
      console.log(`✅ Bucket '${bucketName}' created successfully.`);
    } else {
      console.log(`✅ Bucket '${bucketName}' already exists.`);
      
      // Update bucket to be public if needed
      if (isPublic) {
        const { error: updateError } = await supabase.storage.updateBucket(bucketName, {
          public: true
        });
        
        if (updateError) {
          console.warn(`Warning: Could not update bucket '${bucketName}' to be public:`, updateError.message);
        } else {
          console.log(`✅ Bucket '${bucketName}' updated to be public.`);
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Error with bucket '${bucketName}':`, error.message);
    return false;
  }
}

async function setupImageBuckets() {
  console.log('Setting up Supabase Storage buckets for Mystic Tours...');
  
  try {
    // Create all required buckets
    await createBucketIfNotExists(BUCKETS.GALLERY);
    await createBucketIfNotExists(BUCKETS.TOURS);
    await createBucketIfNotExists(BUCKETS.SITE);
    await createBucketIfNotExists(BUCKETS.TEAM);
    
    console.log('\n✅ All image storage buckets are set up and ready to use!');
    console.log('\nYou can now upload images to these buckets through the admin panel');
    console.log('or directly through the Supabase dashboard.');
    
  } catch (error) {
    console.error('Error setting up buckets:', error.message);
  }
}

setupImageBuckets().catch(console.error);
