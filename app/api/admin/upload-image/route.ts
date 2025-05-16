import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir, access, constants } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

// Simple UUID generation function to avoid external dependencies
function generateUniqueId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Helper to ensure directory exists
async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await access(dirPath, constants.F_OK)
  } catch (error) {
    // Directory doesn't exist, create it
    console.log(`Creating directory: ${dirPath}`)
    await mkdir(dirPath, { recursive: true })
  }
}

// Enhanced logging with timestamps and categories
const logger = {
  info: (category: string, message: string, ...args: any[]) => {
    console.log(`[${new Date().toISOString()}] [INFO] [${category}]`, message, ...args)
  },
  error: (category: string, message: string, ...args: any[]) => {
    console.error(`[${new Date().toISOString()}] [ERROR] [${category}]`, message, ...args)
  },
  debug: (category: string, message: string, ...args: any[]) => {
    console.log(`[${new Date().toISOString()}] [DEBUG] [${category}]`, message, ...args)
  }
}

export async function POST(request: NextRequest) {
  try {
    logger.debug('UPLOAD', 'Received upload request', { url: request.url, method: request.method })
    
    // Log request headers for debugging
    const headers: Record<string, string> = {}
    request.headers.forEach((value, key) => {
      headers[key] = value
    })
    logger.debug('UPLOAD', 'Request headers', headers)
    
    const formData = await request.formData()
    logger.debug('UPLOAD', 'FormData keys', Array.from(formData.keys()))
    
    const file = formData.get('file') as File
    const itemId = formData.get('itemId') as string
    const itemType = formData.get('itemType') as string // 'tour', 'blog', 'gallery', etc.
    
    if (!file) {
      logger.error('UPLOAD', 'No file provided')
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    
    logger.info('UPLOAD', `Processing file upload: ${file.name}, size: ${file.size} bytes, type: ${file.type}`)
    
    // Generate a unique filename
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Create a unique filename with original extension
    const originalName = file.name
    const extension = originalName.split('.').pop() || 'jpg'
    const uniqueId = generateUniqueId()
    const fileName = `${itemType ? itemType + '-' : ''}${itemId ? itemId + '-' : ''}${uniqueId}.${extension}`
    
    // Create the public path
    const publicDir = join(process.cwd(), 'public')
    
    // Try both images and uploads directories
    const imagesDir = join(publicDir, 'images')
    const uploadsDir = join(publicDir, 'uploads')
    
    // Log all paths for debugging
    logger.debug('UPLOAD', 'Path information', {
      cwd: process.cwd(),
      publicDir,
      imagesDir,
      uploadsDir
    })
    
    // Ensure both directories exist
    logger.info('UPLOAD', `Ensuring directories exist`)
    await ensureDirectoryExists(imagesDir)
    await ensureDirectoryExists(uploadsDir)
    
    // Use uploads directory as our target
    const uploadPath = join(uploadsDir, fileName)
    const publicPath = `/uploads/${fileName}` // Path for public URL
    
    // Log the upload
    logger.info('UPLOAD', `Saving file to ${uploadPath}`)
    
    try {
      // Save the file
      await writeFile(uploadPath, buffer)
      
      // Return the public URL
      const imageUrl = publicPath
      logger.info('UPLOAD', `File saved successfully at ${imageUrl} (saved to ${uploadPath})`)
      
      // Log success with all details
      logger.debug('UPLOAD', 'Upload successful', {
        originalName: file.name,
        savedPath: uploadPath,
        publicUrl: imageUrl,
        size: buffer.length,
        itemType,
        itemId
      })
      
      // In a real implementation, you would update your database here
      // to associate this image with the appropriate content item
      
      return NextResponse.json({ 
        success: true, 
        url: imageUrl,
        message: 'File uploaded successfully' 
      })
    } catch (writeError: any) {
      logger.error('UPLOAD', `Error writing file to ${uploadPath}:`, writeError)
      return NextResponse.json({ 
        error: `Failed to save the file: ${writeError?.message || 'Unknown write error'}` 
      }, { status: 500 })
    }
  } catch (error: any) {
    logger.error('UPLOAD', 'Error processing upload:', error)
    return NextResponse.json({ 
      error: `Failed to process the upload: ${error.message || 'Unknown error'}` 
    }, { status: 500 })
  }
}
