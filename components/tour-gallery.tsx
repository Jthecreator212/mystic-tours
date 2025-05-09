"use client"

import { useState } from "react"
import Image from "next/image"
import { X } from "lucide-react"

interface TourGalleryProps {
  images: {
    src: string
    alt: string
  }[]
}

export function TourGallery({ images }: TourGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  return (
    <div className="mb-12">
      <h2 className="text-3xl text-[#1a5d1a] mb-6">Tour Gallery</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div
            key={index}
            className="relative h-40 overflow-hidden vintage-border cursor-pointer"
            onClick={() => setSelectedImage(image.src)}
          >
            <Image
              src={image.src || "/placeholder.svg"}
              alt={image.alt}
              fill
              className="object-cover hover:scale-110 transition-transform duration-300"
            />
          </div>
        ))}
      </div>

      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white hover:text-[#e9b824] transition-colors"
          >
            <X size={32} />
          </button>
          <div className="relative w-full max-w-4xl h-[80vh]">
            <Image src={selectedImage || "/placeholder.svg"} alt="Gallery image" fill className="object-contain" />
          </div>
        </div>
      )}
    </div>
  )
}
