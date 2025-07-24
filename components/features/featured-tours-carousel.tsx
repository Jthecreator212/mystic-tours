"use client"

import { useState, useEffect } from "react"
import { TourCard } from "./tour-card"
import { ChevronLeft, ChevronRight } from "lucide-react"

type Tour = {
  id: number;
  slug: string;
  title: string;
  description: string;
  image: string;
  price: number;
  duration: string;
}

interface FeaturedToursCarouselProps {
  tours: Tour[];
}

export function FeaturedToursCarousel({ tours }: FeaturedToursCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [autoplay, setAutoplay] = useState(true)

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined
    if (autoplay) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => (prev === tours.length - 1 ? 0 : prev + 1))
      }, 5000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoplay, tours.length])

  const handleNavigation = (index: number) => {
    setCurrentSlide(index)
    setAutoplay(false)
    setTimeout(() => setAutoplay(true), 10000)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === tours.length - 1 ? 0 : prev + 1))
    setAutoplay(false)
    setTimeout(() => setAutoplay(true), 10000)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? tours.length - 1 : prev - 1))
    setAutoplay(false)
    setTimeout(() => setAutoplay(true), 10000)
  }

  return (
    <div className="tour-carousel-container relative max-w-4xl mx-auto pt-12">
      <div className="tour-carousel overflow-hidden">
        <div
          className="tour-carousel-inner flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {tours.map((tour) => (
            <div key={tour.id} className="tour-carousel-item w-full flex-shrink-0 px-6 py-2">
              <TourCard tour={tour} />
            </div>
          ))}
        </div>
      </div>

      <button
        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-[#1a5d1a]/80 text-[#e9b824] p-2 rounded-full hover:bg-[#1a5d1a] transition-colors z-10"
        onClick={prevSlide}
        aria-label="Previous tour"
      >
        <ChevronLeft size={24} />
      </button>

      <button
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#1a5d1a]/80 text-[#e9b824] p-2 rounded-full hover:bg-[#1a5d1a] transition-colors z-10"
        onClick={nextSlide}
        aria-label="Next tour"
      >
        <ChevronRight size={24} />
      </button>

      <div className="flex justify-center mt-6 space-x-2">
        {tours.map((_, index) => (
          <button
            key={index}
            onClick={() => handleNavigation(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              currentSlide === index ? "bg-[#e9b824]" : "bg-[#85603f]/50 hover:bg-[#85603f]"
            }`}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={currentSlide === index ? "true" : "false"}
          />
        ))}
      </div>
    </div>
  )
} 