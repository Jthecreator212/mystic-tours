import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * Logs a message with a timestamp
 * @param level The log level (INFO, DEBUG, ERROR, etc.)
 * @param message The message to log
 * @param data Optional data to include in the log
 */
function log(level: string, message: string, data?: any) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level}] ${message}${data ? ' ' + JSON.stringify(data) : ''}`);
}

/**
 * API route to update story images in the about page
 * 
 * @param request The incoming request
 * @returns Response with success status
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const data = await request.json();
    const { id, imagePath } = data;
    
    // Validate the input
    if (!id || !imagePath) {
      log('ERROR', 'Missing required fields', { id, imagePath });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    log('INFO', `Updating story image for ${id} with ${imagePath}`);
    
    // Create a backup of the about page file
    const aboutPagePath = path.join(process.cwd(), 'app', 'about', 'page.tsx');
    const backupPath = `${aboutPagePath}.backup.${Date.now()}`;
    
    if (fs.existsSync(aboutPagePath)) {
      // Create a backup
      fs.copyFileSync(aboutPagePath, backupPath);
      log('INFO', `Created backup of about page at ${backupPath}`);
      
      // Read the file content
      let content = fs.readFileSync(aboutPagePath, 'utf8');
      
      // Replace the image path using regex
      // Updated to match the new structure with ImageEditOverlay
      const imageSrcRegex = /imageSrc="([^"]+)"[\s\S]*?storyId="about"/;
      
      // Add detailed logging to help debug the regex matching
      log('DEBUG', 'Attempting to match image pattern in about page');
      log('DEBUG', 'Regex test result', { matches: imageSrcRegex.test(content) });
      
      if (imageSrcRegex.test(content)) {
        // Use a more reliable replacement approach
        content = content.replace(imageSrcRegex, (match) => {
          log('DEBUG', 'Found match', { match });
          // Replace the imageSrc attribute for the ImageEditOverlay component
          let updatedMatch = match.replace(/imageSrc="[^"]+"/, `imageSrc="${imagePath}"`);
          
          log('DEBUG', 'Updated match', { updatedMatch });
          return updatedMatch;
        });
        
        // Write the updated content back to the file
        fs.writeFileSync(aboutPagePath, content, 'utf8');
        log('INFO', `Updated about page with new story image: ${imagePath}`);
      } else {
        log('ERROR', 'Could not find image src in about page', { regex: imageSrcRegex.toString() });
        
        // Try a more flexible approach as a fallback
        const fallbackRegex = /imageSrc="([^"]+)"[\s\S]*?storyId/;
        log('DEBUG', 'Trying fallback regex', { regex: fallbackRegex.toString() });
        
        if (fallbackRegex.test(content)) {
          log('INFO', 'Found match with fallback regex');
          content = content.replace(fallbackRegex, (match) => {
            return match.replace(/imageSrc="[^"]+"/, `imageSrc="${imagePath}"`);
          });
          
          fs.writeFileSync(aboutPagePath, content, 'utf8');
          log('INFO', `Updated about page with fallback method: ${imagePath}`);
        } else {
          log('ERROR', 'All regex attempts failed');
          return NextResponse.json(
            { error: 'Could not update image in about page' },
            { status: 500 }
          );
        }
      }
    } else {
      log('ERROR', `About page not found at ${aboutPagePath}`);
      return NextResponse.json(
        { error: 'About page not found' },
        { status: 404 }
      );
    }
    
    // Return success with cache-busting headers to force a full page refresh
    return NextResponse.json(
      { success: true, forceRefresh: true, imagePath },
      { 
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        } 
      }
    );
  } catch (error: any) {
    log('ERROR', 'Error updating story image', { message: error?.message || error, stack: error?.stack });
    return NextResponse.json(
      { error: 'Failed to update story image' },
      { status: 500 }
    );
  }
}
