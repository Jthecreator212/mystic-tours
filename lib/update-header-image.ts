/**
 * Updates the header image for a specific page
 * @param pageName The name of the page (e.g., 'tours', 'about', 'contact')
 * @param imageUrl The URL of the new image
 * @returns Promise resolving to success status
 */
export async function updateHeaderImage(pageName: string, imageUrl: string): Promise<boolean> {
  try {
    console.log(`Updating header image for page ${pageName} with image ${imageUrl}`);
    
    const response = await fetch('/api/admin/update-header', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pageName,
        imageUrl,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to update header: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Header update response:', data);
    return data.success;
  } catch (error) {
    console.error('Error updating header image:', error);
    return false;
  }
}
