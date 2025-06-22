"use client"

import Image from "next/image"
import { useState } from "react"
import { ImageEditOverlay } from "./image-edit-overlay"
import { Edit } from "lucide-react"

interface PageHeaderProps {
  title: string
  subtitle: string
  imagePath: string
}

export function PageHeader({ title, subtitle, imagePath }: PageHeaderProps) {

  return (
    <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
      {/* Main image with edit overlay - moved to top level for better visibility */}
      <div className="relative w-full h-full">
        <ImageEditOverlay 
          imageSrc={imagePath || "/placeholder.svg"} 
          alt={title}
        />
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
