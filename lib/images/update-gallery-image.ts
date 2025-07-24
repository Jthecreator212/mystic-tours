/**
 * Updates the gallery data with the new image URL
 * @param galleryId The ID of the gallery item to update
 * @param imageUrl The URL of the new image
 * @returns Promise resolving to success status
 */
export async function updateGalleryImage(galleryId: string | number, imageUrl: string): Promise<boolean> {
  try {
    console.log(`Updating gallery item ${galleryId} with image ${imageUrl}`);
    
    const response = await fetch('/api/admin/update-gallery', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        galleryId,
        imageUrl,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to update gallery: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Gallery update response:', data);
    return data.success;
  } catch (error) {
    console.error('Error updating gallery data:', error);
    return false;
  }
}
