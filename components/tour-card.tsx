"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Star, Users, Clock, Heart, Calendar, ChevronRight } from "lucide-react"

interface TourProps {
  tour: {
    id: number
    title: string
    description: string
    image: string
    price: number
    duration: string
  }
}

export function TourCard({ tour }: TourProps) {
  // Initialize state for client-side values
  const [spotsLeft, setSpotsLeft] = useState<number | null>(null)
  const [rating, setRating] = useState<string | null>(null)
  const [reviewCount, setReviewCount] = useState<number | null>(null)
  
  // Generate random values only on the client side
  useEffect(() => {
    // Psychological principle: Scarcity - Generate random spots left (between 1-5)
    setSpotsLeft(Math.floor(Math.random() * 5) + 1)
    
    // Psychological principle: Social proof - Generate random ratings
    setRating((4 + Math.random()).toFixed(1))
    setReviewCount(Math.floor(Math.random() * 50) + 10)
  }, [])

  return (
    <div className="vintage-card group hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col h-full relative">
      {/* Von Restorff Effect - Make important elements stand out */}
      {spotsLeft !== null && (
        <div className="absolute top-3 left-3 z-10 bg-[#d83f31] text-white py-1 px-3 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
          Only {spotsLeft} spots left
        </div>
      )}

      {/* Wishlist button - Engagement and personalization */}
      <button className="absolute top-3 right-3 z-10 bg-white/80 hover:bg-white p-2 rounded-full transition-all duration-300 shadow-lg">
        <Heart size={18} className="text-[#d83f31] hover:fill-[#d83f31] transition-all duration-300" />
      </button>

      {/* Visual hierarchy - Image is largest element */}
      <div className="relative h-56 overflow-hidden vintage-border">
        <Image
          src={tour.image || "/placeholder.svg"}
          alt={tour.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent h-20"></div>
        <div className="absolute bottom-3 left-3 bg-[#e9b824] text-[#1a5d1a] py-1 px-3 font-bold rounded-full flex items-center">
          <Clock size={14} className="mr-1" />
          {tour.duration}
        </div>

        {/* Small logo watermark */}
        <div className="absolute top-3 right-3 h-10 w-10 opacity-70">
          <Image src="/images/island-mystiq-logo.png" alt="Island Mystic Tours" fill className="object-contain" />
        </div>
      </div>

      {/* Social proof - Ratings */}
      <div className="flex items-center mt-4 mb-2">
        {rating !== null && reviewCount !== null ? (
          <>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={`${i < Math.floor(parseFloat(rating)) ? "text-[#e9b824] fill-[#e9b824]" : "text-gray-300"} mr-0.5`}
                />
              ))}
            </div>
            <span className="text-sm ml-1 font-medium text-[#85603f]">{rating}</span>
            <span className="text-xs ml-1 text-[#85603f]/70">({reviewCount} reviews)</span>
          </>
        ) : (
          <div className="h-4"></div>
        )}
      </div>

      {/* F-Pattern Reading - Title at top left where eyes naturally go first */}
      <h3 className="text-2xl font-playfair text-[#1a5d1a] mb-2 line-clamp-2">{tour.title}</h3>

      {/* Cognitive Load Theory - Keep description brief */}
      <p className="mb-4 text-[#85603f] line-clamp-2 text-sm flex-grow">{tour.description}</p>

      {/* Gestalt Principle of Proximity - Group related items */}
      <div className="mt-auto">
        {/* Color Psychology - Using contrasting colors to create visual interest */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-[#e9b824] to-transparent mb-4"></div>

        <div className="flex justify-between items-end">
          {/* Price anchoring - Show value */}
          <div className="flex flex-col">
            <div className="flex items-center mb-1">
              <Users size={14} className="text-[#1a5d1a] mr-1" />
              <span className="text-xs text-[#85603f]">Small groups</span>
            </div>
            <div className="flex items-baseline">
              <span className="text-3xl font-playfair font-bold text-[#d83f31]">${tour.price}</span>
              <span className="ml-1 text-xs text-[#85603f] line-through">${(tour.price * 1.2).toFixed(0)}</span>
              <span className="ml-1 text-xs text-[#85603f]">per person</span>
            </div>
          </div>

          {/* Call to Action - High contrast, clear action */}
          <div className="relative group">
            <button className="relative overflow-hidden rounded-md group-hover:scale-105 transition-transform duration-300">
              <span className="absolute inset-0 bg-gradient-to-r from-[#e9b824] via-[#fed100] to-[#e9b824] opacity-80 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="absolute inset-0 bg-gradient-to-r from-[#1a5d1a] via-[#009b3a] to-[#1a5d1a] opacity-0 group-hover:opacity-90 transition-opacity duration-500 scale-x-0 group-hover:scale-x-100 origin-left transform"></span>
              <span className="relative flex items-center px-4 py-2 font-bold text-sm tracking-wider uppercase text-[#1a5d1a] group-hover:text-[#e9b824] transition-colors duration-300">
                <Calendar className="w-4 h-4 mr-1 group-hover:animate-pulse" />
                Book Now
                <ChevronRight className="w-3 h-3 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" />
              </span>
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1a5d1a] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></span>
            </button>
            <div className="absolute -inset-1 bg-gradient-to-r from-[#e9b824] to-[#1a5d1a] rounded-md blur-sm opacity-0 group-hover:opacity-70 transition duration-300 group-hover:duration-200 -z-10"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
