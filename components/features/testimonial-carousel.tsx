"use client"

import { useState, useEffect, useCallback } from "react"
import { Testimonial } from "./testimonial"
import { ChevronLeft, ChevronRight } from "lucide-react"

type TestimonialData = {
  id: number;
  name: string;
  location: string;
  quote: string;
  image_url: string;
}

interface TestimonialCarouselProps {
  testimonials: TestimonialData[];
}

export function TestimonialCarousel({ testimonials }: TestimonialCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [autoplay, setAutoplay] = useState(true)

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))
  }, [testimonials.length])

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined
    if (autoplay) {
      interval = setInterval(nextSlide, 7000) // Slower pace for testimonials
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoplay, nextSlide])

  const handleInteraction = (action: () => void) => {
    setAutoplay(false)
    action()
    setTimeout(() => setAutoplay(true), 15000) // Longer pause after manual interaction
  }

  const handlePrevSlide = () => {
    handleInteraction(() => {
      setCurrentSlide((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))
    })
  }

  const handleNextSlide = () => {
    handleInteraction(nextSlide)
  }

  const handleGoToSlide = (index: number) => {
    handleInteraction(() => setCurrentSlide(index))
  }

  return (
    <div className="relative max-w-4xl mx-auto">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="w-full flex-shrink-0 px-4 py-2">
              <Testimonial testimonial={testimonial} />
            </div>
          ))}
        </div>
      </div>

      <button
        className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-[#1a5d1a]/60 text-[#e9b824] p-3 rounded-full hover:bg-[#1a5d1a] transition-colors z-10 -translate-x-1/2"
        onClick={handlePrevSlide}
        aria-label="Previous testimonial"
      >
        <ChevronLeft size={28} />
      </button>

      <button
        className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-[#1a5d1a]/60 text-[#e9b824] p-3 rounded-full hover:bg-[#1a5d1a] transition-colors z-10 translate-x-1/2"
        onClick={handleNextSlide}
        aria-label="Next testimonial"
      >
        <ChevronRight size={28} />
      </button>

      <div className="flex justify-center mt-8 space-x-3">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => handleGoToSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              currentSlide === index ? "bg-[#e9b824]" : "bg-[#f8ede3]/50 hover:bg-[#e9b824]/80"
            }`}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={currentSlide === index ? "true" : "false"}
          />
        ))}
      </div>
    </div>
  )
} 