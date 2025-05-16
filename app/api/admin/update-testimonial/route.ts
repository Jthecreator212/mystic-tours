import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'
import { promises as fsPromises } from 'fs'

export async function POST(request: NextRequest) {
  try {
    console.log('Received request to update testimonial image')
    
    // Parse the request body
    const data = await request.json()
    const { id, imagePath } = data
    
    if (!id || !imagePath) {
      console.error('Missing required fields:', { id, imagePath })
      return NextResponse.json(
        { error: 'Missing required fields: id and imagePath are required' },
        { status: 400 }
      )
    }
    
    console.log(`Updating testimonial ${id} with image: ${imagePath}`)
    
    // Read the testimonials data file
    const testimonialsFilePath = path.join(process.cwd(), 'app', 'page.tsx')
    const fileContent = await fsPromises.readFile(testimonialsFilePath, 'utf8')
    
    // Find the testimonial with the matching ID and update its image
    // We need to use regex to find and update the image property in the testimonials array
    const testimonialRegex = new RegExp(`(id:\\s*${id}[\\s\\S]*?image:\\s*)"([^"]*)"`, 'g')
    
    // Check if we found the testimonial
    if (!testimonialRegex.test(fileContent)) {
      console.error(`Testimonial with ID ${id} not found`)
      return NextResponse.json(
        { error: `Testimonial with ID ${id} not found` },
        { status: 404 }
      )
    }
    
    // Reset the regex to use it again
    testimonialRegex.lastIndex = 0
    
    // Replace the image path
    const updatedContent = fileContent.replace(testimonialRegex, `$1"${imagePath}"`)
    
    // Write the updated content back to the file
    await fsPromises.writeFile(testimonialsFilePath, updatedContent, 'utf8')
    
    console.log(`Successfully updated testimonial ${id} image to ${imagePath}`)
    
    // Return success response
    return NextResponse.json({ 
      success: true, 
      message: `Testimonial ${id} image updated successfully`,
      imagePath
    })
  } catch (error) {
    console.error('Error updating testimonial image:', error)
    return NextResponse.json(
      { error: 'Failed to update testimonial image' },
      { status: 500 }
    )
  }
}
