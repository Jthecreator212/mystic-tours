"use client"

import { ImageEditOverlay } from "./image-edit-overlay"

interface PageHeaderProps {
  title: string
  subtitle: string
  imagePaths: string[]
  slideshow?: boolean
  aspectRatio?: string
}

export function PageHeader({ 
  title, 
  subtitle, 
  imagePaths, 
  slideshow = false,
  aspectRatio = "16/9"
}: PageHeaderProps) {

  return (
    <div className="relative overflow-hidden min-h-[300px] aspect-[16/9]">
      {/* Main image with edit overlay */}
        <ImageEditOverlay 
        imageSrc={imagePaths[0] || "/placeholder.svg"}
          alt={title}
        />
      {/* Content overlay - absolute, centered */}
      <div className="absolute inset-0 flex flex-col justify-center items-start container mx-auto px-4 z-20">
        <div className="max-w-2xl">
          <h1 className="text-5xl md:text-6xl text-[#e9b824] mb-4 drop-shadow-lg">{title}</h1>
          <p className="text-xl text-[#f8ede3] max-w-xl drop-shadow-md">{subtitle}</p>
        </div>
      </div>
    </div>
  )
}
