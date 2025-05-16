import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile } from 'fs/promises'
import { join } from 'path'

// Enhanced logging with timestamps and categories
const logger = {
  info: (category: string, message: string, ...args: any[]) => {
    const timestamp = new Date().toISOString()
    console.log(`[${timestamp}] [INFO] [${category}] ${message}`, ...args)
  },
  error: (category: string, message: string, ...args: any[]) => {
    const timestamp = new Date().toISOString()
    console.error(`[${timestamp}] [ERROR] [${category}] ${message}`, ...args)
  },
  debug: (category: string, message: string, ...args: any[]) => {
    console.log(`[${new Date().toISOString()}] [DEBUG] [${category}]`, message, ...args)
  }
}

export async function POST(request: NextRequest) {
  try {
    logger.debug('UPDATE_GALLERY', 'Received update request', { url: request.url, method: request.method })
    
    // Parse the request body
    const data = await request.json()
    const { galleryId, imageUrl } = data
    
    if (!galleryId || !imageUrl) {
      logger.error('UPDATE_GALLERY', 'Missing required fields', { galleryId, imageUrl })
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    logger.info('UPDATE_GALLERY', `Updating gallery item ${galleryId} with image ${imageUrl}`)
    
    // Read the current gallery data
    const galleryFilePath = join(process.cwd(), 'data', 'gallery.ts')
    let galleryFileContent = await readFile(galleryFilePath, 'utf-8')
    
    // Create a backup of the original file
    const backupPath = join(process.cwd(), 'data', `gallery.backup.${Date.now()}.ts`)
    await writeFile(backupPath, galleryFileContent)
    logger.info('UPDATE_GALLERY', `Created backup at ${backupPath}`)
    
    // Find the gallery item by ID and update its image
    const galleryIdNumber = parseInt(galleryId.toString(), 10)
    
    // Use regex to update the src property for the specific gallery item
    const galleryRegex = new RegExp(`(id:\\s*${galleryIdNumber}[\\s\\S]*?src:\\s*)"([^"]*)"`, 'g')
    const updatedContent = galleryFileContent.replace(galleryRegex, `$1"${imageUrl}"`)
    
    if (updatedContent === galleryFileContent) {
      logger.error('UPDATE_GALLERY', `Gallery item with ID ${galleryId} not found or no changes made`)
      return NextResponse.json({ error: 'Gallery item not found or no changes made' }, { status: 404 })
    }
    
    // Write the updated content back to the file
    await writeFile(galleryFilePath, updatedContent)
    logger.info('UPDATE_GALLERY', `Successfully updated gallery item ${galleryId} with image ${imageUrl}`)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Gallery item updated successfully',
      galleryId,
      imageUrl
    })
  } catch (error: any) {
    logger.error('UPDATE_GALLERY', 'Error updating gallery item:', error)
    return NextResponse.json({ 
      error: `Failed to update gallery item: ${error.message || 'Unknown error'}` 
    }, { status: 500 })
  }
}
