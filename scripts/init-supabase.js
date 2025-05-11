// This script initializes the Supabase project using the JavaScript client
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Create a Supabase client with admin privileges
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

// Read the SQL file
const sqlFilePath = path.join(__dirname, 'create-tables.sql');
const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

// Function to execute SQL via the Supabase REST API
async function executeSql(sql) {
  return new Promise((resolve, reject) => {
    // Extract project reference from the URL
    const projectRef = supabaseUrl.match(/https:\/\/([^\.]+)\.supabase\.co/)[1];
    
    // Prepare the request options
    const options = {
      hostname: `${projectRef}.supabase.co`,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      }
    };
    
    // Make the request
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`HTTP Error: ${res.statusCode} - ${data}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    // Send the SQL command
    req.write(JSON.stringify({ query: sql }));
    req.end();
  });
}

async function initializeDatabase() {
  console.log('Initializing Supabase database...');
  
  // Check if tables already exist
  try {
    const { data, error } = await supabase
      .from('gallery_images')
      .select('id')
      .limit(1);
    
    if (!error) {
      console.log('Tables already exist. Skipping table creation.');
    } else {
      // Tables don't exist, create them
      console.log('Creating database tables...');
      try {
        // We'll try to execute the SQL directly using the Supabase client
        const { error } = await supabase.rpc('exec_sql', { query: sqlContent });
        
        if (error) {
          console.log('Using REST API fallback for SQL execution...');
          // If the RPC method fails, we'll try the REST API
          await executeSql(sqlContent);
          console.log('Tables created successfully via REST API');
        } else {
          console.log('Tables created successfully via RPC');
        }
      } catch (error) {
        console.error('Error creating tables:', error.message);
        console.log('You may need to execute the SQL commands manually in the Supabase dashboard.');
      }
    }
  } catch (error) {
    console.error('Error checking if tables exist:', error.message);
  }
  
  // Create storage buckets
  try {
    console.log('Creating gallery-images bucket...');
    const { data: galleryBucket, error: galleryError } = await supabase.storage.createBucket(
      'gallery-images',
      { public: true }
    );
    
    if (galleryError) {
      console.error('Error creating gallery-images bucket:', galleryError);
    } else {
      console.log('gallery-images bucket created successfully');
    }
    
    console.log('Creating tour-images bucket...');
    const { data: tourBucket, error: tourError } = await supabase.storage.createBucket(
      'tour-images',
      { public: true }
    );
    
    if (tourError) {
      console.error('Error creating tour-images bucket:', tourError);
    } else {
      console.log('tour-images bucket created successfully');
    }
  } catch (error) {
    console.error('Error creating storage buckets:', error.message);
  }
  
  console.log('Supabase initialization completed!');
}

initializeDatabase().catch(error => {
  console.error('Error initializing Supabase:', error.message);
  process.exit(1);
});
