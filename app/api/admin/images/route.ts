import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    // Get all images from the gallery_images table
    const { data, error } = await supabaseAdmin
      .from('gallery_images')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    // Transform the data to match the expected format
    const images = data.map(image => ({
      id: image.id,
      url: image.image_url,
      name: image.title || image.name,
      description: image.description || '',
      category: image.category || 'uncategorized',
      alt_text: image.alt_text || '',
      size: image.size || 0,
      createdAt: image.created_at
    }))

    return NextResponse.json(images)
  } catch (error) {
    console.error('Error fetching images:', error)
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File
    const description = formData.get('description') as string || ''
    const category = formData.get('category') as string || 'uncategorized'
    const title = formData.get('title') as string || file.name
    const altText = formData.get('alt_text') as string || title

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Create a unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .storage
      .from('gallery-images')
      .upload(fileName, file, {
        upsert: false,
        contentType: file.type
      })

    if (uploadError) {
      throw uploadError
    }

    // Get the public URL
    const { data: urlData } = supabaseAdmin
      .storage
      .from('gallery-images')
      .getPublicUrl(fileName)

    // Save metadata to database
    const { data: galleryData, error: galleryError } = await supabaseAdmin
      .from('gallery_images')
      .insert({
        title: title,
        name: file.name,
        image_url: urlData.publicUrl,
        alt_text: altText,
        description: description,
        category: category,
        size: file.size
      })
      .select()

    if (galleryError) {
      throw galleryError
    }

    return NextResponse.json({
      id: galleryData[0].id,
      url: galleryData[0].image_url,
      name: galleryData[0].title,
      description: galleryData[0].description,
      category: galleryData[0].category,
      alt_text: galleryData[0].alt_text,
      size: file.size,
      createdAt: galleryData[0].created_at
    })
  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()
    
    if (!id) {
      return NextResponse.json(
        { error: 'No ID provided' },
        { status: 400 }
      )
    }

    // Get the image data to find the file to delete
    const { data: image, error: fetchError } = await supabaseAdmin
      .from('gallery_images')
      .select('image_url')
      .eq('id', id)
      .single()

    if (fetchError) {
      throw fetchError
    }

    // Extract the filename from the URL
    const urlParts = image.image_url.split('/')
    const fileName = urlParts[urlParts.length - 1]

    // Delete the file from storage
    const { error: storageError } = await supabaseAdmin
      .storage
      .from('gallery-images')
      .remove([fileName])

    if (storageError) {
      console.warn('Error deleting file from storage:', storageError)
      // Continue anyway to delete the database record
    }

    // Delete the database record
    const { error: deleteError } = await supabaseAdmin
      .from('gallery_images')
      .delete()
      .eq('id', id)

    if (deleteError) {
      throw deleteError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting image:', error)
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData()
    const id = formData.get('id') as string
    const description = formData.get('description') as string
    const category = formData.get('category') as string
    const altText = formData.get('alt_text') as string
    const title = formData.get('title') as string
    const file = formData.get('image') as File | null

    if (!id) {
      return NextResponse.json(
        { error: 'No ID provided' },
        { status: 400 }
      )
    }

    // Get the current image data
    const { data: currentImage, error: fetchError } = await supabaseAdmin
      .from('gallery_images')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) {
      throw fetchError
    }

    let imageUrl = currentImage.image_url
    let imageName = currentImage.name

    // If a new file is provided, upload it and update the URL
    if (file) {
      // Extract the old filename from the URL to delete it
      const oldUrlParts = currentImage.image_url.split('/')
      const oldFileName = oldUrlParts[oldUrlParts.length - 1]

      // Create a unique filename for the new file
      const fileExt = file.name.split('.').pop()
      const newFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
      
      // Upload the new file
      const { data: uploadData, error: uploadError } = await supabaseAdmin
        .storage
        .from('gallery-images')
        .upload(newFileName, file, {
          upsert: false,
          contentType: file.type
        })

      if (uploadError) {
        throw uploadError
      }

      // Get the public URL for the new file
      const { data: urlData } = supabaseAdmin
        .storage
        .from('gallery-images')
        .getPublicUrl(newFileName)

      imageUrl = urlData.publicUrl
      imageName = file.name

      // Delete the old file
      await supabaseAdmin
        .storage
        .from('gallery-images')
        .remove([oldFileName])
    }

    // Update the metadata in the database
    const updateData: any = {}
    if (imageUrl !== currentImage.image_url) updateData.image_url = imageUrl
    if (imageName !== currentImage.name) updateData.name = imageName
    if (description !== undefined) updateData.description = description
    if (category !== undefined) updateData.category = category
    if (altText !== undefined) updateData.alt_text = altText
    if (title !== undefined) updateData.title = title
    updateData.updated_at = new Date().toISOString()
    
    const { data: updatedData, error: updateError } = await supabaseAdmin
      .from('gallery_images')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      id: updatedData.id,
      url: updatedData.image_url,
      name: updatedData.title || updatedData.name,
      description: updatedData.description,
      category: updatedData.category,
      alt_text: updatedData.alt_text,
      size: file ? file.size : currentImage.size,
      updatedAt: updatedData.updated_at
    })
  } catch (error) {
    console.error('Error updating image:', error)
    return NextResponse.json(
      { error: 'Failed to update image' },
      { status: 500 }
    )
  }
}
