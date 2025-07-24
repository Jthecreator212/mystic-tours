/**
 * Utility function to update the story image in the about page
 */

/**
 * Updates the story image in the about page
 * @param id The ID of the story (e.g., 'about')
 * @param imagePath The path to the new image
 * @returns Promise resolving to success status
 */
export async function updateStoryImage(id: string, imagePath: string): Promise<boolean> {
  try {
    console.log(`Updating story ${id} with image ${imagePath}`);
    
    // Call the API endpoint to update the story image
    const response = await fetch('/api/admin/update-story', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id,
        imagePath,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to update story: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Story update response:', data);
    console.log('Story image updated successfully');
    
    // Force a page reload to avoid hydration errors
    if (data.success && typeof window !== 'undefined') {
      console.log('Reloading page to apply changes...');
      window.location.reload();
    }
    
    return data.success;
  } catch (error) {
    console.error('Error updating story image:', error);
    return false;
  }
}
