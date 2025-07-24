/**
 * Utility function to update a testimonial image
 * This sends a request to the update-testimonial API endpoint
 */

export async function updateTestimonialImage(id: number | string, imagePath: string): Promise<string> {
  try {
    console.log(`Updating testimonial ${id} with image: ${imagePath}`)
    
    // Make API request to update the testimonial
    const response = await fetch('/api/admin/update-testimonial', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id,
        imagePath,
      }),
    })
    
    // Handle API response
    if (!response.ok) {
      const errorData = await response.json()
      console.error('Error updating testimonial image:', errorData)
      throw new Error(errorData.error || 'Failed to update testimonial image')
    }
    
    const data = await response.json()
    console.log('Testimonial image updated successfully:', data)
    
    return imagePath
  } catch (error) {
    console.error('Error in updateTestimonialImage:', error)
    throw error
  }
}
