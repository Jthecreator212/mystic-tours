// Load environment variables from .env.local
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' })

// Fix any relative imports at the top
import { supabaseAdmin } from '@/lib/supabase/supabase';

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase URL or service role key in .env.local file')
  process.exit(1)
}

const supabase = supabaseAdmin

async function testSupabaseConnection() {
  console.log('Testing Supabase connection...')
  
  try {
    // Test 1: Check if we can connect to Supabase
    console.log('\n=== Test 1: Connection Test ===')
    const { data: connectionTest, error: connectionError } = await supabase.from('gallery_images').select('count').limit(1).single()
    
    if (connectionError) {
      console.error('❌ Connection test failed:', connectionError.message)
    } else {
      console.log('✅ Connection test passed! Connected to Supabase.')
      console.log(`   Found ${connectionTest.count} gallery images.`)
    }
    
    // Test 2: Check if tours table exists and has data
    console.log('\n=== Test 2: Tours Table Test ===')
    const { data: toursTest, error: toursError } = await supabase.from('tours').select('count').limit(1).single()
    
    if (toursError) {
      console.error('❌ Tours table test failed:', toursError.message)
    } else {
      console.log('✅ Tours table test passed!')
      console.log(`   Found ${toursTest.count} tours.`)
    }
    
    // Test 3: Check if team_members table exists and has data
    console.log('\n=== Test 3: Team Members Table Test ===')
    const { data: teamTest, error: teamError } = await supabase.from('team_members').select('count').limit(1).single()
    
    if (teamError) {
      console.error('❌ Team members table test failed:', teamError.message)
    } else {
      console.log('✅ Team members table test passed!')
      console.log(`   Found ${teamTest.count} team members.`)
    }
    
    // Test 4: Check if storage buckets exist
    console.log('\n=== Test 4: Storage Buckets Test ===')
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('❌ Storage buckets test failed:', bucketsError.message)
    } else {
      const galleryBucket = buckets.find(b => b.name === 'gallery-images')
      const tourBucket = buckets.find(b => b.name === 'tour-images')
      
      if (galleryBucket && tourBucket) {
        console.log('✅ Storage buckets test passed!')
        console.log('   Found both gallery-images and tour-images buckets.')
      } else {
        console.log('⚠️ Storage buckets test partially passed.')
        console.log(`   gallery-images bucket: ${galleryBucket ? 'Found' : 'Missing'}`)
        console.log(`   tour-images bucket: ${tourBucket ? 'Found' : 'Missing'}`)
      }
    }
    
    console.log('\n=== Summary ===')
    console.log('Supabase integration tests completed.')
    console.log('If all tests passed, your Supabase integration is working correctly!')
    console.log('You can now use the admin dashboard to manage your content.')
    
  } catch (error) {
    console.error('Error testing Supabase connection:', error instanceof Error ? error.message : String(error))
  }
}

testSupabaseConnection().catch(console.error)
