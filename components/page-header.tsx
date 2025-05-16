"use client"

import Image from "next/image"
import { useState } from "react"
import { ImageEditOverlay } from "./image-edit-overlay"
import { uploadImage } from "@/lib/image-upload"
import { useEditMode } from "@/context/edit-mode-context"
import { Edit } from "lucide-react"

interface PageHeaderProps {
  title: string
  subtitle: string
  imagePath: string
  isAdmin?: boolean
  onImageChange?: (file: File) => Promise<string>
}

export function PageHeader({ title, subtitle, imagePath, isAdmin = false, onImageChange }: PageHeaderProps) {
  // Use the edit mode context
  const { isEditMode } = useEditMode()
  
  // Handler for image changes
  const handleImageChange = async (file: File) => {
    try {
      console.log('Uploading header image:', file.name);
      
      // First, upload the image - using empty string instead of null for itemId
      const imageUrl = await uploadImage(file, '', 'header');
      console.log('Header image uploaded successfully:', imageUrl);
      
      // If a custom handler was provided, use it
      if (onImageChange) {
        return await onImageChange(file);
      }
      
      // Otherwise, return the uploaded image URL
      return imageUrl;
    } catch (error) {
      console.error('Error uploading header image:', error);
      // Return a fallback URL in case of error
      return URL.createObjectURL(file);
    }
  }

  return (
    <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
      {/* Main image with edit overlay - moved to top level for better visibility */}
      <div className="relative w-full h-full">
        <ImageEditOverlay 
          imageSrc={imagePath || "/placeholder.svg"} 
          alt={title}
          isAdmin={isAdmin || isEditMode} // Use either explicit isAdmin prop or global edit mode
          onImageChange={handleImageChange}
        />
        
        {/* Special edit indicator for headers when in edit mode */}
        {isEditMode && (
          <div className="absolute top-4 right-4 bg-white/90 text-[#1a5d1a] px-3 py-2 rounded-full shadow-lg z-30 animate-bounce-slow flex items-center gap-2">
            <span className="font-bold">Edit Header</span>
            <Edit className="w-5 h-5" />
          </div>
        )}
      </div>
      
      {/* No gradient overlay - removed as requested */}

      {/* Content */}
      <div className="relative container mx-auto px-4 h-full flex flex-col justify-center z-20">
        <div className="max-w-2xl">
          <h1 className="text-5xl md:text-6xl text-[#e9b824] mb-4 drop-shadow-lg">{title}</h1>
          <p className="text-xl text-[#f8ede3] max-w-xl drop-shadow-md">{subtitle}</p>
        </div>
      </div>
    </div>
  )
}
