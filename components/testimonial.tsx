"use client"

import Image from "next/image"
import { ImageEditOverlay } from "./image-edit-overlay"
import { useEditMode } from "@/context/edit-mode-context"
import { uploadImage } from "@/lib/image-upload"
import { Edit } from "lucide-react"

interface TestimonialProps {
  testimonial: {
    id: number
    name: string
    quote: string
    location: string
    image: string
  }
}

export function Testimonial({ testimonial }: TestimonialProps) {
  // Use the edit mode context
  const { isEditMode } = useEditMode()
  
  // Handler for image changes
  const handleImageChange = async (file: File) => {
    try {
      console.log(`Updating testimonial image ${testimonial.id}`)
      return await uploadImage(file, testimonial.id, 'testimonial')
    } catch (error) {
      console.error('Error updating testimonial image:', error)
      return URL.createObjectURL(file) // Fallback
    }
  }
  
  return (
    <div className="bg-[#f8ede3] rounded-lg p-6 shadow-lg border-4 border-[#e9b824]">
      <div className="flex items-center mb-4">
        {/* Image with edit button positioned outside */}
        <div className="relative">
          <div className="relative w-16 h-16 mr-4 overflow-hidden rounded-full border-2 border-[#e9b824]">
            <Image 
              src={testimonial.image || "/placeholder.svg"} 
              alt={testimonial.name} 
              fill 
              className="object-cover rounded-full" 
            />
          </div>
          
          {/* Edit button positioned below the image */}
          {isEditMode && (
            <div className="absolute -bottom-3 -right-3 z-10">
              <input 
                type="file" 
                id={`testimonial-image-${testimonial.id}`} 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageChange(file);
                }}
                className="hidden" 
                accept="image/*"
              />
              <label 
                htmlFor={`testimonial-image-${testimonial.id}`}
                className="bg-white text-[#1a5d1a] p-1.5 rounded-full shadow-lg cursor-pointer block hover:bg-[#e9b824] transition-colors"
                title="Edit testimonial image"
              >
                <Edit className="w-3.5 h-3.5" />
              </label>
            </div>
          )}
        </div>
        <div>
          <h3 className="text-xl font-bold text-[#1a5d1a]">{testimonial.name}</h3>
          <p className="text-[#85603f]">{testimonial.location}</p>
        </div>
      </div>

      <blockquote className="relative">
        <span className="absolute top-0 left-0 text-6xl text-[#e9b824] opacity-30">"</span>
        <p className="pl-8 pt-2 italic text-[#85603f]">{testimonial.quote}</p>
      </blockquote>
    </div>
  )
}
