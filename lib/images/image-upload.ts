/**
 * Utility functions for handling image uploads
 */

/**
 * Updates the tour data with the new image URL
 * @param tourId The ID of the tour to update
 * @param imageUrl The URL of the new image
 * @returns Promise resolving to success status
 */
export async function updateTourImage(tourId: string | number, imageUrl: string): Promise<boolean> {
  try {
    console.log(`Updating tour ${tourId} with image ${imageUrl}`);
    
    const response = await fetch('/api/admin/update-tour', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tourId,
        imageUrl,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to update tour: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Tour update response:', data);
    return data.success;
  } catch (error) {
    console.error('Error updating tour data:', error);
    return false;
  }
}

/**
 * Uploads an image file to the server
 * @param file The file to upload
 * @param itemId Optional ID of the item the image belongs to (tour, gallery, etc.)
 * @param itemType Optional type of the item ('tour', 'gallery', 'testimonial', 'header', 'story', etc.)
 * @returns Promise resolving to the URL of the uploaded image
 */
export async function uploadImage(file: File, itemId?: string | number, itemType?: string): Promise<string> {
  try {
    // Validate input
    if (!file) {
      throw new Error('No file provided for upload');
    }
    
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    
    // Add optional metadata if provided
    if (itemId) formData.append('itemId', String(itemId));
    if (itemType) formData.append('itemType', itemType);
    
    // Log the upload attempt with file details
    console.log(`Uploading image: ${file.name} (${(file.size / 1024).toFixed(2)} KB) for ${itemType || 'unknown'} ID: ${itemId || 'new'}`);
    
    // Send the request to our API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    // Debug the API endpoint
    console.log('API endpoint URL:', '/api/admin/upload-image');
    console.log('Form data contains file:', formData.has('file'));
    console.log('Form data contains itemId:', formData.has('itemId'));
    console.log('Form data contains itemType:', formData.has('itemType'));
    
    try {
      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Parse the response
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(`Unexpected response format: ${text}`);
      }
      
      if (!response.ok) {
        throw new Error(data.error || `Upload failed with status: ${response.status}`);
      }
      
      if (!data.url) {
        throw new Error('Response missing image URL');
      }
      
      console.log(`Image uploaded successfully: ${data.url}`);
      
      // Update the appropriate data based on item type
      try {
        if (itemType === 'tour' && itemId) {
          // Update tour data
          await updateTourImage(itemId, data.url);
          console.log(`Tour ${itemId} data updated with new image: ${data.url}`);
        } else if (itemType === 'gallery' && itemId) {
          // Update gallery data
          const { updateGalleryImage } = await import('./update-gallery-image');
          await updateGalleryImage(itemId, data.url);
          console.log(`Gallery item ${itemId} data updated with new image: ${data.url}`);
        } else if (itemType === 'header') {
          // Update header data
          const { updateHeaderImage } = await import('./update-header-image');
          // Extract page name from URL or use a default
          const pageName = window.location.pathname.split('/')[1] || 'home';
          await updateHeaderImage(pageName, data.url);
          console.log(`Header image for page ${pageName} updated with: ${data.url}`);
        } else if (itemType === 'testimonial' && itemId) {
          // Update testimonial data
          const { updateTestimonialImage } = await import('./update-testimonial-image');
          await updateTestimonialImage(itemId, data.url);
          console.log(`Testimonial ${itemId} image updated with: ${data.url}`);
        } else if (itemType === 'story' && itemId) {
          // Update story data
          const { updateStoryImage } = await import('./update-story-image');
          await updateStoryImage(String(itemId), data.url);
          console.log(`Story ${itemId} image updated with: ${data.url}`);
        } else if (itemId) {
          console.log(`Item ${itemId} of type ${itemType} updated with image: ${data.url}`);
        }
      } catch (updateError) {
        console.error(`Error updating ${itemType} data:`, updateError);
        // Continue even if update fails - at least the image was uploaded
      }
      
      return data.url;
    } catch (fetchError: unknown) {
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        throw new Error('Upload request timed out after 30 seconds');
      }
      throw fetchError;
    }
  } catch (error: unknown) {
    console.error('Error uploading image:', error instanceof Error ? error.message : error);
    // Return a fallback URL or rethrow based on your error handling strategy
    throw error;
  }
}

/**
 * Updates an image for a specific content item
 * @param file The new image file
 * @param itemId ID of the item to update
 * @param itemType Type of the item ('tour', 'gallery', 'testimonial', 'header', 'story', etc.)
 * @returns Promise resolving to the URL of the updated image
 */
export async function updateImage(file: File, itemId: string | number, itemType: string): Promise<string> {
  // For now, this just calls uploadImage, but in the future it could handle
  // deleting the old image or other update-specific logic
  return uploadImage(file, itemId, itemType);
}
