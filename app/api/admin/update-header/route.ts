import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile } from 'fs/promises'
import { join } from 'path'
import path from 'path'
import fs from 'fs'

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
    logger.debug('UPDATE_HEADER', 'Received update request', { url: request.url, method: request.method })
    
    // Parse the request body
    const data = await request.json()
    const { pageName, imageUrl } = data
    
    if (!pageName || !imageUrl) {
      logger.error('UPDATE_HEADER', 'Missing required fields', { pageName, imageUrl })
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    logger.info('UPDATE_HEADER', `Updating header for page ${pageName} with image ${imageUrl}`)
    
    // Find the page file
    const pagesDir = join(process.cwd(), 'app')
    let pageFilePath: string | null = null
    
    // Handle different page names
    if (pageName === 'home') {
      pageFilePath = join(pagesDir, 'page.tsx')
    } else {
      // Check if directory exists
      const potentialDir = join(pagesDir, pageName)
      if (fs.existsSync(potentialDir)) {
        pageFilePath = join(potentialDir, 'page.tsx')
      }
    }
    
    if (!pageFilePath || !fs.existsSync(pageFilePath)) {
      logger.error('UPDATE_HEADER', `Page file not found for ${pageName}`)
      return NextResponse.json({ error: 'Page file not found' }, { status: 404 })
    }
    
    // Read the page file
    let pageContent = await readFile(pageFilePath, 'utf-8')
    
    // Create a backup of the original file
    const backupPath = join(process.cwd(), 'app', `page.backup.${Date.now()}.tsx`)
    await writeFile(backupPath, pageContent)
    logger.info('UPDATE_HEADER', `Created backup at ${backupPath}`)
    
    // Update the imagePath prop in the PageHeader component
    const headerRegex = /<PageHeader[\s\S]*?imagePath=["']([^"']*)["'][\s\S]*?\/?>/
    const match = pageContent.match(headerRegex)
    
    if (!match) {
      logger.error('UPDATE_HEADER', `PageHeader component not found in ${pageFilePath}`)
      return NextResponse.json({ error: 'PageHeader component not found' }, { status: 404 })
    }
    
    // Replace the imagePath value
    const updatedContent = pageContent.replace(
      headerRegex,
      (match) => match.replace(/imagePath=["']([^"']*)["']/, `imagePath="${imageUrl}"`)
    )
    
    if (updatedContent === pageContent) {
      logger.error('UPDATE_HEADER', `No changes made to ${pageFilePath}`)
      return NextResponse.json({ error: 'No changes made' }, { status: 400 })
    }
    
    // Write the updated content back to the file
    await writeFile(pageFilePath, updatedContent)
    logger.info('UPDATE_HEADER', `Successfully updated header for page ${pageName} with image ${imageUrl}`)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Header updated successfully',
      pageName,
      imageUrl
    })
  } catch (error: any) {
    logger.error('UPDATE_HEADER', 'Error updating header:', error)
    return NextResponse.json({ 
      error: `Failed to update header: ${error.message || 'Unknown error'}` 
    }, { status: 500 })
  }
}
