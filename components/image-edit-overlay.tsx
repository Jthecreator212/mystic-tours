"use client"

import { useState, useRef, useEffect } from 'react'
import { Edit, X, Upload, Check, AlertCircle } from 'lucide-react'
import Image from 'next/image'
import { uploadImage } from '@/lib/image-upload'
import { Plus } from "lucide-react"
import { useEditMode } from '@/context/edit-mode-context'

interface ImageEditOverlayProps {
  /** Image source URL */
  imageSrc: string
  /** Alt text for the image */
  alt?: string
  /** Tour ID if this image is for a tour */
  tourId?: number | string
  /** Gallery ID if this image is for a gallery */
  galleryId?: number | string
  /** Testimonial ID if this image is for a testimonial */
  testimonialId?: number | string
  /** Story ID if this image is for a story section */
  storyId?: number | string
  /** Whether the user has admin privileges to edit */
  isAdmin?: boolean
  /** Whether the image should have rounded corners */
  isRounded?: boolean
  /** Custom handler for image changes */
  onImageChange?: (file: File, id?: string | number) => Promise<string>
}

export function ImageEditOverlay({
  imageSrc,
  alt = "Image",
  tourId,
  galleryId,
  testimonialId,
  storyId,
  isAdmin: propIsAdmin = false, // Renamed to propIsAdmin to avoid conflict
  isRounded = false,
  onImageChange
}: ImageEditOverlayProps) {
  // Get the edit mode from context
  const { isEditMode } = useEditMode()
  
  // Use either the prop or the context value (context takes precedence)
  const isAdmin = isEditMode || propIsAdmin
  
  // Add debugging to help troubleshoot visibility issues
  console.log('ImageEditOverlay rendered with:', {
    isAdmin,
    isEditMode,
    propIsAdmin,
    imageSrc,
    ids: { tourId, galleryId, testimonialId, storyId },
    hasChangeHandler: !!onImageChange
  });
  const [isEditing, setIsEditing] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  
  // Determine the ID to use based on what's provided
  const itemId = tourId || galleryId || testimonialId || storyId
  
  // Reset error when editing state changes
  useEffect(() => {
    if (!isEditing) {
      setUploadError(null)
    }
  }, [isEditing])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File input change event triggered')
    const file = e.target.files?.[0]
    if (!file) {
      console.error('No file selected from input')
      setUploadError('No file selected')
      return
    }
    
    // Log file details
    console.log('Selected file:', {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024).toFixed(2)} KB`,
      lastModified: new Date(file.lastModified).toISOString()
    })
    
    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      setUploadError('Selected file is not an image')
      return
    }
    
    // 5MB max size
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size exceeds 5MB limit')
      return
    }
    
    try {
      setUploadError(null)
      setIsUploading(true)
      console.log(`Starting upload for file: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`)
      
      // Use either the provided handler or our default
      const imageUrl = await handleImageChange(file, itemId)
      
      if (!imageUrl) {
        throw new Error('No image URL returned from upload')
      }
      
      console.log(`Upload successful: ${imageUrl}`)
      setUploadedImage(imageUrl)
      setIsEditing(false)
      
      // If we're in a Next.js environment, trigger a revalidation
      if (typeof window !== 'undefined') {
        // Force a cache invalidation/refresh
        window.location.reload()
      }
    } catch (error: any) {
      console.error('Failed to upload image:', error)
      setUploadError(error?.message || 'Failed to upload image')
    } finally {
      setIsUploading(false)
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  /**
   * Default implementation for onImageChange if none is provided
   * @param file The file to upload
   * @param id The ID of the item to update
   * @returns Promise resolving to the URL of the uploaded image
   */
  const defaultImageChange = async (file: File, id?: string | number): Promise<string> => {
    console.log(`Default image change handler called with ID: ${id}`);
    
    try {
      // Determine the item type based on which ID is provided
      let itemType = 'unknown';
      
      if (tourId) {
        itemType = 'tour';
      } else if (galleryId) {
        itemType = 'gallery';
      } else if (testimonialId) {
        itemType = 'testimonial';
      } else if (storyId) {
        itemType = 'story';
      }
      
      console.log(`Uploading image for item type: ${itemType} with ID: ${id}`);
      
      // Use the uploadImage utility function
      const imageUrl = await uploadImage(file, id, itemType);
      
      if (!imageUrl) {
        throw new Error('No image URL returned from upload');
      }
      
      return imageUrl;
    } catch (error: any) {
      console.error('Error in default image change handler:', error?.message || error);
      
      // Log detailed error information for debugging
      console.error('Error details:', {
        file: file?.name,
        size: file?.size,
        type: file?.type,
        id,
        error: error?.stack || error
      });
      
      // For development, we'll fall back to a local object URL
      if (process.env.NODE_ENV === 'development') {
        console.warn('DEV MODE: Falling back to local object URL');
        return URL.createObjectURL(file);
      }
      
      throw error;
    }
  }

  // Use the provided handler or fall back to the default
  const handleImageChange = onImageChange || defaultImageChange

  return (
    <div 
      className="relative w-full h-full"
      onMouseEnter={() => isAdmin && setIsHovering(true)}
      onMouseLeave={() => isAdmin && setIsHovering(false)}
    >
      {/* The actual image */}
      <Image
        src={imageSrc || "/placeholder.svg"}
        alt={alt}
        fill
        className={`object-cover transition-transform duration-500 ${isRounded ? 'rounded-full' : ''} ${!isRounded ? 'group-hover:scale-110' : ''}`}
      />
      
      {/* Edit Overlay - Always render but control visibility with opacity */}
      {isAdmin && (
        <div className={`absolute inset-0 ${isHovering || isEditing ? 'bg-black/40' : 'bg-black/0 hover:bg-black/20'} flex items-center justify-center z-10 transition-all duration-300`}>
          {/* Always visible edit indicator in top-right corner when not editing */}
          {!isEditing && !isHovering && (
            <div className="absolute top-3 right-3 bg-white/80 p-2 rounded-full shadow-lg animate-pulse">
              <Edit className="w-4 h-4 text-[#1a5d1a]" />
            </div>
          )}
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="bg-white/90 hover:bg-white text-[#1a5d1a] p-3 rounded-full shadow-lg transform transition-transform hover:scale-110 animate-bounce-slow"
            >
              <Edit className="w-6 h-6" />
              <span className="sr-only">Edit image</span>
            </button>
          ) : (
            <div className="flex flex-col items-center space-y-4 p-4 bg-black/70 rounded-lg max-w-xs">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                className="hidden" 
                accept="image/*"
              />
              {uploadError ? (
                <div className="text-center mb-2">
                  <div className="flex items-center justify-center mb-2">
                    <AlertCircle className="w-6 h-6 text-red-500 mr-2" />
                    <span className="text-red-400 font-medium">Upload Error</span>
                  </div>
                  <p className="text-white text-sm">{uploadError}</p>
                  <button 
                    onClick={() => setUploadError(null)}
                    className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="bg-white/90 hover:bg-white text-[#1a5d1a] p-3 rounded-full shadow-lg transform transition-transform hover:scale-110 disabled:opacity-50 flex items-center justify-center"
                    title="Upload new image"
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                  <span className="text-white text-xs">Click to upload (max 5MB)</span>
                </>
              )}
              
              <button 
                onClick={() => setIsEditing(false)}
                className="bg-red-500/90 hover:bg-red-500 text-white p-2 rounded-full shadow-lg transform transition-transform hover:scale-110"
                title="Cancel"
              >
                <X className="w-5 h-5" />
              </button>
              
              {isUploading && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
                  <p className="text-white text-sm">Uploading image...</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
