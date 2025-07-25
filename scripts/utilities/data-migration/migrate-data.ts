// Load environment variables from .env.local
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

// Import data and create Supabase client directly
import { galleryData } from '@/data/gallery'
import { teamData } from '@/data/team'
import { tourData } from '@/data/tours'
import { createClient } from '@supabase/supabase-js'

// Create Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase URL or service role key in .env.local file')
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function migrateData() {
  console.log('Starting data migration...')
  
  // Check if data already exists
  const { data: existingGalleryImages, error: galleryCheckError } = await supabaseAdmin
    .from('gallery_images')
    .select('count')
    .limit(1)
    .single()
  
  // Migrate gallery images
  console.log('Migrating gallery images...')
  if (existingGalleryImages && existingGalleryImages.count > 0) {
    console.log(`Gallery images already exist (${existingGalleryImages.count} images). Skipping gallery migration.`)
  } else {
    for (const image of galleryData) {
      const { data, error } = await supabaseAdmin
        .from('gallery_images')
        .insert({
          title: image.title,
          name: image.title,
          image_url: image.src,
          alt_text: image.alt,
          category: image.category,
          description: image.location
        })
      
      if (error) {
        console.error(`Error migrating gallery image ${image.id}:`, error)
      } else {
        console.log(`Migrated gallery image: ${image.title}`)
      }
    }
  }
  
  // Migrate tours
  console.log('Migrating tours...')
  
  // Check if tours already exist
  const { data: existingTours, error: toursCheckError } = await supabaseAdmin
    .from('tours')
    .select('count')
    .limit(1)
    .single()
  
  if (existingTours && existingTours.count > 0) {
    console.log(`Tours already exist (${existingTours.count} tours). Skipping tours migration.`)
  } else {
    for (const tour of tourData) {
      try {
        // Insert main tour data
        const { data: tourRecord, error: tourError } = await supabaseAdmin
          .from('tours')
          .insert({
            title: tour.title,
            slug: tour.slug,
            short_description: tour.shortDescription,
            description: tour.description,
            image_url: tour.image,
            price: tour.price,
            duration: tour.duration,
            group_size: tour.groupSize,
            includes: tour.includes,
            departure: tour.departure,
            languages: tour.languages
          })
          .select()
        
        if (tourError) {
          console.error(`Error migrating tour ${tour.id}:`, tourError)
          continue
        }
        
        const tourId = tourRecord[0].id
        
        // Insert tour highlights
        for (const highlight of tour.highlights) {
          await supabaseAdmin
            .from('tour_highlights')
            .insert({
              tour_id: tourId,
              content: highlight
            })
        }
        
        // Insert tour itinerary
        for (let i = 0; i < tour.itinerary.length; i++) {
          const item = tour.itinerary[i]
          await supabaseAdmin
            .from('tour_itinerary')
            .insert({
              tour_id: tourId,
              title: item.title,
              description: item.description,
              display_order: i
            })
        }
        
        // Insert tour gallery images
        for (const image of tour.galleryImages) {
          await supabaseAdmin
            .from('tour_gallery_images')
            .insert({
              tour_id: tourId,
              image_url: image.src,
              alt_text: image.alt
            })
        }
        
        console.log(`Migrated tour: ${tour.title}`)
      } catch (error) {
        console.error(`Error processing tour ${tour.id}:`, error instanceof Error ? error.message : String(error))
      }
    }
  }

  // Migrate team members
  console.log('Migrating team members...')
  try {
    // First check if the team_members table exists
    const { error: tableCheckError } = await supabaseAdmin
      .from('team_members')
      .select('id')
      .limit(1)
    
    if (tableCheckError) {
      console.error('Error checking team_members table:', tableCheckError.message)
      console.log('\n====================================================')
      console.log('IMPORTANT: Team members table does not exist')
      console.log('Please run the following SQL in the Supabase SQL Editor:')
      console.log('----------------------------------------------------')
      console.log(`
        CREATE TABLE IF NOT EXISTS team_members (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name TEXT NOT NULL,
          role TEXT NOT NULL,
          image_url TEXT NOT NULL,
          bio TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `)
      console.log('====================================================')
      console.log('After creating the table, run this script again to migrate team members.')
      console.log('Skipping team members migration for now...')
      return // Exit the function early
    }
    
    // Check if team members already exist
    const { data: existingMembers, error: membersCheckError } = await supabaseAdmin
      .from('team_members')
      .select('count')
      .limit(1)
      .single()
    
    if (existingMembers && existingMembers.count > 0) {
      console.log(`Team members already exist (${existingMembers.count} members). Skipping team members migration.`)
      return
    }
    
    // Now insert the team members
    for (const member of teamData) {
      const { data, error } = await supabaseAdmin
        .from('team_members')
        .insert({
          name: member.name,
          role: member.role,
          image_url: member.image,
          bio: member.bio
        })
      
      if (error) {
        console.error(`Error migrating team member ${member.name}:`, error.message)
      } else {
        console.log(`Migrated team member: ${member.name}`)
      }
    }
  } catch (error) {
    console.error('Error in team members migration:', error instanceof Error ? error.message : String(error))
  }
  
  console.log('Data migration completed!')
}

migrateData().catch(console.error)
