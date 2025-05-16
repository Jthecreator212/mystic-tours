import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

// Interface for image data
interface ImageData {
  id: string
  url: string
  name: string
  path: string
  selector: string
  pageUrl: string
  context: string
  isBackground?: boolean
  isContainer?: boolean
  isPlaceholder: boolean
  dimensions?: { width: number, height: number } | null
  uploadedAt: string
}

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
    const timestamp = new Date().toISOString()
    console.debug(`[${timestamp}] [DEBUG] [${category}] ${message}`, ...args)
  }
}

// Helper function to get the dimensions of an image
const getImageDimensions = async (url: string): Promise<{ width: number, height: number } | null> => {
  try {
    // For simplicity, we're not actually getting the dimensions here
    // In a real implementation, you would use a library like probe-image-size
    return { width: 800, height: 600 }
  } catch (error) {
    logger.error('DIMENSIONS', 'Error getting image dimensions:', error)
    return null
  }
}

// Helper function to normalize URL
const normalizeUrl = (url: string, baseUrl: string): string => {
  try {
    if (url.startsWith('//')) {
      return `https:${url}`
    }
    if (url.startsWith('/')) {
      const base = new URL(baseUrl)
      return `${base.protocol}//${base.host}${url}`
    }
    if (!url.startsWith('http')) {
      return new URL(url, baseUrl).href
    }
    return url
  } catch (error) {
    logger.error('URL', 'Error normalizing URL:', error)
    return url
  }
}

// Helper function to generate a unique CSS selector for an element
// This is the canonical implementation. Do not redeclare elsewhere.
const getUniqueSelector = (el: any, $: cheerio.CheerioAPI): string => {
  try {
    const element = $(el)
    
    // Try ID
    const id = element.attr('id')
    if (id) {
      return `#${id}`
    }
    
    // Try classes
    const classes = element.attr('class')
    if (classes) {
      const classSelector = `.${classes.trim().replace(/\s+/g, '.')}`
      if ($(classSelector).length === 1) {
        return classSelector
      }
    }
    
    // Try tag with nth-child
    const tagName = el.tagName || el.name || 'div'
    const index = element.parent().children(tagName).index(element) + 1
    const selector = `${tagName}:nth-child(${index})`
    
    // Add parent context if needed
    const parent = element.parent()
    if (parent && parent[0] && parent[0].name !== 'html' && parent[0].name !== 'body') {
      const parentSelector = getUniqueSelector(parent[0], $)
      return `${parentSelector} > ${selector}`
    }
    
    return selector
  } catch (error) {
    logger.error('SELECTOR', 'Error creating selector:', error)
    return el.tagName || 'unknown'
  }
}

// Helper function to determine image context
const determineImageContext = (el: any, $: cheerio.CheerioAPI, src: string, alt: string): string => {
  try {
    // Check for specific patterns in src, alt, and parent elements
    if (src.includes('tour-')) return 'Tour Image'
    if (src.includes('gallery')) return 'Gallery Image'
    if (src.includes('about')) return 'About Image'
    if (src.includes('team')) return 'Team Member Image'
    if (src.includes('logo')) return 'Logo'
    if (src.includes('hero')) return 'Hero Image'
    if (src.includes('banner')) return 'Banner Image'
    
    // Check alt text
    if (alt.includes('tour')) return 'Tour Image'
    if (alt.includes('gallery')) return 'Gallery Image'
    
    // Check parent elements
    const parent = $(el).parent()
    const parentClass = parent.attr('class') || ''
    const grandparent = parent.parent()
    const grandparentClass = grandparent.attr('class') || ''
    
    if (parentClass.includes('tour') || grandparentClass.includes('tour')) return 'Tour Image'
    if (parentClass.includes('gallery') || grandparentClass.includes('gallery')) return 'Gallery Image'
    if (parentClass.includes('hero') || grandparentClass.includes('hero')) return 'Hero Image'
    if (parentClass.includes('banner') || grandparentClass.includes('banner')) return 'Banner Image'
    if (parentClass.includes('header') || grandparentClass.includes('header')) return 'Header Image'
    
    // Check for nearby headings
    const nearbyH1 = $(el).closest('section').find('h1').first().text()
    if (nearbyH1) {
      if (nearbyH1.toLowerCase().includes('tour')) return 'Tour Section Image'
      if (nearbyH1.toLowerCase().includes('gallery')) return 'Gallery Section Image'
      if (nearbyH1.toLowerCase().includes('about')) return 'About Section Image'
      if (nearbyH1.toLowerCase().includes('contact')) return 'Contact Section Image'
      return `${nearbyH1} Section Image`
    }
    
    return 'Unknown'
  } catch (error) {
    logger.error('CONTEXT', 'Error determining image context:', error)
    return 'Unknown'
  }
}

export async function POST(request: NextRequest) {
  logger.info('API', 'Starting website scan')
  try {
    const { url } = await request.json()
    
    if (!url) {
      logger.error('API', 'No URL provided')
      return NextResponse.json(
        { error: 'No URL provided' },
        { status: 400 }
      )
    }

    logger.info('API', `Scanning website: ${url}`)
    
    try {
      // Fetch the HTML content with a timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        logger.error('FETCH', `Failed to fetch URL: ${response.statusText}`)
        return NextResponse.json(
          { error: `Failed to fetch URL: ${response.statusText}` },
          { status: 500 }
        )
      }
      
      const html = await response.text()
      logger.info('FETCH', `Successfully fetched HTML content (${html.length} bytes)`)
      
      // Load HTML with Cheerio
      const $ = cheerio.load(html)
      // Declare images and processedElements ONCE for all phases
      const images: ImageData[] = []
      const processedElements = new Set<string>()
      
      // PHASE 1: Find all <img> tags
      logger.info('SCAN', 'Finding all <img> tags')
      $('img').each((i, el) => {
        try {
          const src = $(el).attr('src') || ''
          const alt = $(el).attr('alt') || ''
          const selector = getUniqueSelector(el, $)
          
          // Skip if already processed
          if (processedElements.has(selector)) return
          processedElements.add(selector)
          
          // Get dimensions
          const width = $(el).attr('width') || $(el).css('width') || ''
          const height = $(el).attr('height') || $(el).css('height') || ''
          
          // Determine context
          const context = determineImageContext(el, $, src, alt)
          
          // Create descriptive name
          const name = alt || `Image ${i+1}`
          
          // Add to images array
          images.push({
            id: `img-${i}`,
            url: src ? normalizeUrl(src, url) : '',
            name,
            path: src,
            selector,
            pageUrl: url,
            context,
            isPlaceholder: !src || src.startsWith('data:') || src.includes('placeholder'),
            dimensions: (width && height) ? { width: parseInt(width) || 0, height: parseInt(height) || 0 } : null,
            uploadedAt: new Date().toISOString()
          })
          
          logger.debug('IMG', `Found image: ${name} (${context})`)
        } catch (error) {
          logger.error('IMG', `Error processing image ${i}:`, error)
        }
      })
      
      // PHASE 2: Find background images in CSS
      logger.info('SCAN', 'Finding background images in CSS')
      $('[style*="background"]').each((i, el) => {
        try {
          const bgStyle = $(el).attr('style') || ''
          const bgMatch = bgStyle.match(/url\(['"](.*?)['"]/i)
          const bgSrc = bgMatch && bgMatch[1] ? bgMatch[1] : ''
          const bgSelector = getUniqueSelector(el, $)
          
          // Skip if already processed
          if (processedElements.has(bgSelector)) return
          processedElements.add(bgSelector)
          
          // Determine element type and context
          const bgTagName = el.tagName || el.name || ''
          const bgClassName = $(el).attr('class') || ''
          const bgId = $(el).attr('id') || ''
          
          // Determine context
          const bgContext = bgClassName.includes('hero') ? 'Hero Background' :
                         bgClassName.includes('banner') ? 'Banner Background' :
                         bgClassName.includes('header') ? 'Header Background' :
                         'Background Image'
          
          // Create descriptive name
          const bgName = bgId || `${bgContext} ${i+1}`
          
          images.push({
            id: `bg-${i}`,
            url: bgSrc ? normalizeUrl(bgSrc, url) : '',
            name: bgName,
            path: bgSrc,
            selector: bgSelector,
            pageUrl: url,
            context: bgContext,
            isBackground: true,
            isPlaceholder: !bgSrc,
            uploadedAt: new Date().toISOString()
          })
          
          logger.debug('BG', `Found background image: ${bgName}`)
        } catch (error) {
          logger.error('BG', `Error processing background image ${i}:`, error)
        }
      })
      
      // PHASE 3: Find image containers (divs that might be used for images)
      logger.info('SCAN', 'Finding potential image containers')
      const containerSelectors = [
        'div.relative.container',
        'div.relative.h-\\[50vh\\]',
        'div.group',
        'div.relative.aspect-square',
        'div.relative.h-64',
        'div[class*="image-container"]',
        'div[class*="img-container"]',
        'div.relative:not(:has(img))'
      ]
      for (const containerSelector of containerSelectors) {
        $(containerSelector).each((i, el) => {
          try {
            const selector = getUniqueSelector(el, $)
            if (processedElements.has(selector) || $(el).find('img').length > 0) return
            processedElements.add(selector)
            const containerClass = $(el).attr('class') || ''
            let context = 'Unknown Container'
            if (containerClass.includes('hero')) context = 'Hero Container'
            else if (containerClass.includes('gallery')) context = 'Gallery Container'
            else if (containerClass.includes('tour')) context = 'Tour Container'
            else if (containerClass.includes('banner')) context = 'Banner Container'
            else if (containerClass.includes('header')) context = 'Header Container'
            const h1Text = $(el).find('h1').first().text()
            const h2Text = $(el).find('h2').first().text()
            const h3Text = $(el).find('h3').first().text()
            const pText = $(el).find('p').first().text()
            let name = `${context} ${i+1}`
            if (h1Text) name = h1Text
            else if (h2Text) name = h2Text
            else if (h3Text) name = h3Text
            images.push({
              id: `container-${i}`,
              url: '',
              name,
              path: '',
              selector,
              pageUrl: url,
              context: pText ? `${context} - ${pText}` : context,
              isContainer: true,
              isPlaceholder: true,
              uploadedAt: new Date().toISOString()
            })
            logger.debug('CONTAINER', `Found container: ${name}`)
          } catch (error) {
            logger.error('CONTAINER', `Error processing container:`, error)
          }
        })
      }
      
      // PHASE 4: User-specific selectors (customized for your UI)
      logger.info('SCAN', 'Targeting specific DOM elements identified by the user')
      const userSelectors = [
        'div.relative.container.mx-auto.px-4.h-full.flex.flex-col.justify-center',
        'img.object-cover.transition-transform.duration-500.group-hover\\:scale-110',
        'img.object-cover.rounded-t-lg',
        'img.object-cover'
      ]
      for (const selector of userSelectors) {
        let elements: cheerio.Cheerio<any>
        if (selector.startsWith('img')) {
          elements = $('img').filter(function() {
            const classes = $(this).attr('class') || ''
            return selector.split('.').slice(1).every(cls => classes.includes(cls.replace('\\:', ':')))
          })
        } else {
          elements = $('div').filter(function() {
            const classes = $(this).attr('class') || ''
            return selector.split('.').slice(1).every(cls => classes.includes(cls.replace('\\:', ':')))
          })
        }
        elements.each((i, el) => {
          try {
            const uniqueSelector = getUniqueSelector(el, $)
            if (processedElements.has(uniqueSelector)) return
            processedElements.add(uniqueSelector)
            const isImg = el.tagName && el.tagName.toLowerCase() === 'img'
            const src = isImg ? $(el).attr('src') || '' : ''
            const alt = isImg ? $(el).attr('alt') || '' : ''
            let context = 'Unknown'
            if (selector.includes('container.mx-auto')) context = 'Page Header'
            else if (selector.includes('transition-transform')) context = 'Tour Image'
            else if (selector.includes('rounded-t-lg')) context = 'Gallery Image'
            else context = 'Content Image'
            const nearestHeading = $(el).closest('section').find('h1, h2, h3').first().text() || ''
            const name = alt || nearestHeading || `${context} ${i}`
            images.push({
              id: `user-specific-${i}`,
              url: src ? normalizeUrl(src, url) : '',
              name,
              path: src,
              selector: uniqueSelector,
              pageUrl: url,
              context,
              isContainer: !isImg,
              isPlaceholder: !src || src.includes('placeholder'),
              uploadedAt: new Date().toISOString()
            })
            logger.debug('USER-SELECTOR', `Found user-specific element: ${name}`)
          } catch (error) {
            logger.error('USER-SELECTOR', `Error processing user-specific selector:`, error)
          }
        })
      }
      
      // Collect dimensions for all images
      logger.info('SCAN', `Processing ${images.length} images to get dimensions`)
      const imagesWithDimensions = await Promise.all(
        images.map(async (image) => {
          if (image.dimensions) return image
          const dimensions = await getImageDimensions(image.url)
          return { ...image, dimensions }
        })
      )
      
      return NextResponse.json(imagesWithDimensions)
    } catch (error) {
      logger.error('API', 'Error scanning website:', error)
      return NextResponse.json(
        { error: 'Error scanning website' },
        { status: 500 }
      )
    }
  } catch (error) {
    logger.error('API', 'Error handling request:', error)
    return NextResponse.json(
      { error: 'Error handling request' },
      { status: 500 }
    )
  }
}

