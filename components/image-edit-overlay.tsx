"use client"

import Image from 'next/image'

interface ImageEditOverlayProps {
  /** Image source URL */
  imageSrc: string
  /** Alt text for the image */
  alt?: string
  /** Whether the image should have rounded corners */
  isRounded?: boolean
}

export function ImageEditOverlay({
  imageSrc,
  alt = "Image",
  isRounded = false,
}: ImageEditOverlayProps) {
  return (
    <div className="relative w-full h-full">
      <Image
        src={imageSrc || "/placeholder.svg"}
        alt={alt}
        fill
        className={`object-cover transition-transform duration-500 ${isRounded ? 'rounded-full' : ''} ${!isRounded ? 'group-hover:scale-110' : ''}`}
      />
    </div>
  )
}
