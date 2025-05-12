import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { uploadImage, BUCKETS } from '@/lib/image-utils'

export async function GET() {
  try {
    // Get all content areas
    const { data, error } = await supabaseAdmin
      .from('content_areas')
      .select('*')
      .order('updated_at', { ascending: false })

    if (error) {
      // Check if the error is because the table doesn't exist
      if (error.code === '42P01' || error.message.includes('does not exist') || error.message.includes('relation')) {
        return NextResponse.json(
          { error: 'content_areas table does not exist', tableExists: false },
          { status: 404 }
        )
      }
      throw error
    }

    return NextResponse.json(data || [])
  } catch (error: any) {
    console.error('Error fetching content areas:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch content areas' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData()
    const id = formData.get('id') as string
    const areaKey = formData.get('area_key') as string
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const altText = formData.get('alt_text') as string
    const section = formData.get('section') as string
    const file = formData.get('image') as File | null

    if (!id) {
      return NextResponse.json(
        { error: 'No ID provided' },
        { status: 400 }
      )
    }

    // Get the current content area
    const { data: currentArea, error: fetchError } = await supabaseAdmin
      .from('content_areas')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) {
      throw fetchError
    }

    let imageUrl = currentArea.image_url

    // If a new file is provided, upload it
    if (file) {
      // Upload to the appropriate bucket based on section
      const bucketName = section === 'tours' ? BUCKETS.TOURS : 
                         section === 'gallery' ? BUCKETS.GALLERY : 
                         BUCKETS.SITE
      
      // Use the area_key as part of the filename for better organization
      const fileName = `${areaKey}-${Date.now()}.${file.name.split('.').pop()}`
      
      // Upload the image
      imageUrl = await uploadImage(file, bucketName, fileName)
    }

    // Update the content area in the database
    const { data: updatedData, error: updateError } = await supabaseAdmin
      .from('content_areas')
      .update({
        name,
        description,
        image_url: imageUrl,
        alt_text: altText,
        section,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    return NextResponse.json(updatedData)
  } catch (error) {
    console.error('Error updating content area:', error)
    return NextResponse.json(
      { error: 'Failed to update content area' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const areaKey = formData.get('area_key') as string
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const altText = formData.get('alt_text') as string
    const section = formData.get('section') as string
    const file = formData.get('image') as File

    if (!areaKey || !name || !section) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if the area_key already exists
    const { data: existingArea } = await supabaseAdmin
      .from('content_areas')
      .select('id')
      .eq('area_key', areaKey)
      .single()

    if (existingArea) {
      return NextResponse.json(
        { error: 'Content area with this key already exists' },
        { status: 400 }
      )
    }

    let imageUrl = 'https://placehold.co/800x600/4a7c59/ffffff?text=' + encodeURIComponent(name)

    // If a file is provided, upload it
    if (file) {
      // Upload to the appropriate bucket based on section
      const bucketName = section === 'tours' ? BUCKETS.TOURS : 
                         section === 'gallery' ? BUCKETS.GALLERY : 
                         BUCKETS.SITE
      
      // Use the area_key as part of the filename for better organization
      const fileName = `${areaKey}-${Date.now()}.${file.name.split('.').pop()}`
      
      // Upload the image
      imageUrl = await uploadImage(file, bucketName, fileName)
    }

    // Create the content area in the database
    const { data, error } = await supabaseAdmin
      .from('content_areas')
      .insert({
        area_key: areaKey,
        name,
        description,
        image_url: imageUrl,
        alt_text: altText,
        section
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating content area:', error)
    return NextResponse.json(
      { error: 'Failed to create content area' },
      { status: 500 }
    )
  }
}
