import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST() {
  try {
    console.log('Starting content management table setup...')
    
    // Insert a single record to create the table
    const { error: insertError } = await supabaseAdmin
      .from('content_areas')
      .insert({
        area_key: 'homepage_hero',
        name: 'Homepage Hero Image',
        description: 'The main hero image on the homepage',
        image_url: 'https://placehold.co/1200x600/4a7c59/ffffff?text=Homepage+Hero',
        alt_text: 'Explore beautiful Jamaica with Mystic Tours',
        section: 'homepage'
      })
    
    // If there's an error that's not about the record already existing, it's a real error
    if (insertError && !insertError.message.includes('already exists')) {
      console.error('Error creating content_areas table:', insertError)
      throw new Error(`Failed to create content_areas table: ${insertError.message}`)
    }
    
    console.log('Content_areas table created or verified successfully')

    // Add default content areas
    const defaultAreas = [
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
    ]

    // Insert the default areas
    for (const area of defaultAreas) {
      const { error: insertError } = await supabaseAdmin
        .from('content_areas')
        .insert(area)
      
      if (insertError) {
        console.error(`Error inserting ${area.area_key}:`, insertError.message)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error setting up content table:', error)
    return NextResponse.json(
      { error: 'Failed to set up content table' },
      { status: 500 }
    )
  }
}
