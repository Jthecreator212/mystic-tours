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
    logger.debug('UPDATE_TOUR', 'Received update request', { url: request.url, method: request.method })
    
    // Parse the request body
    const data = await request.json()
    const { tourId, imageUrl } = data
    
    if (!tourId || !imageUrl) {
      logger.error('UPDATE_TOUR', 'Missing required fields', { tourId, imageUrl })
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    logger.info('UPDATE_TOUR', `Updating tour ${tourId} with image ${imageUrl}`)
    
    // Read the current tour data
    const toursFilePath = join(process.cwd(), 'data', 'tours.ts')
    let toursFileContent = await readFile(toursFilePath, 'utf-8')
    
    // Create a backup of the original file
    const backupPath = join(process.cwd(), 'data', `tours.backup.${Date.now()}.ts`)
    await writeFile(backupPath, toursFileContent)
    logger.info('UPDATE_TOUR', `Created backup at ${backupPath}`)
    
    // Find the tour by ID and update its image
    const tourIdNumber = parseInt(tourId, 10)
    
    // Use regex to update the image property for the specific tour
    const tourRegex = new RegExp(`(id:\\s*${tourIdNumber}[\\s\\S]*?image:\\s*)"([^"]*)"`, 'g')
    const updatedContent = toursFileContent.replace(tourRegex, `$1"${imageUrl}"`)
    
    if (updatedContent === toursFileContent) {
      logger.error('UPDATE_TOUR', `Tour with ID ${tourId} not found or no changes made`)
      return NextResponse.json({ error: 'Tour not found or no changes made' }, { status: 404 })
    }
    
    // Write the updated content back to the file
    await writeFile(toursFilePath, updatedContent)
    logger.info('UPDATE_TOUR', `Successfully updated tour ${tourId} with image ${imageUrl}`)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Tour updated successfully',
      tourId,
      imageUrl
    })
  } catch (error: any) {
    logger.error('UPDATE_TOUR', 'Error updating tour:', error)
    return NextResponse.json({ 
      error: `Failed to update tour: ${error.message || 'Unknown error'}` 
    }, { status: 500 })
  }
}
