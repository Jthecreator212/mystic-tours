"use client"

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, MapPin } from 'lucide-react'
import Image from 'next/image'

interface Destination {
  id: number
  name: string
  location: string
  description: string
  image: string
  type: 'resort' | 'attraction'
}

const destinations: Destination[] = [
  {
    id: 1,
    name: "Sandals Royal Caribbean",
    location: "Montego Bay",
    description: "An all-inclusive luxury resort on a private island with stunning beaches and world-class amenities.",
    image: "/images/gallery/gallery-1.png",
    type: "resort"
  },
  {
    id: 2,
    name: "Dunn's River Falls",
    location: "Ocho Rios",
    description: "Famous terraced waterfalls where you can climb the natural stone steps surrounded by tropical gardens.",
    image: "/images/gallery/gallery-2.png",
    type: "attraction"
  },
  {
    id: 3,
    name: "Half Moon Resort",
    location: "Montego Bay",
    description: "A luxury beachfront resort set on 400 acres with championship golf course and pristine beaches.",
    image: "/images/gallery/gallery-3.png",
    type: "resort"
  },
  {
    id: 4,
    name: "Blue Mountains",
    location: "Kingston",
    description: "Home to the world-famous Blue Mountain Coffee with breathtaking views and hiking trails.",
    image: "/images/gallery/gallery-4.png",
    type: "attraction"
  },
  {
    id: 5,
    name: "Seven Mile Beach",
    location: "Negril",
    description: "One of the world's most beautiful beaches with crystal clear waters and spectacular sunsets.",
    image: "/images/gallery/gallery-5.png",
    type: "attraction"
  }
]

export function JamaicaSlideshow() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % destinations.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % destinations.length)
    setIsAutoPlaying(false)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + destinations.length) % destinations.length)
    setIsAutoPlaying(false)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
  }

  return (
    <section className="py-16 bg-gradient-to-b from-[#f8ede3] to-[#e9b824]/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl text-[#1a5d1a] mb-4 font-bold green-outline-heading">
            Discover Jamaica's Premier Destinations
          </h2>
          <p className="text-xl text-[#85603f] max-w-3xl mx-auto">
            From luxury resorts to breathtaking natural wonders, explore the best Jamaica has to offer
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
            {destinations.map((destination, index) => (
              <div
                key={destination.id}
                className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                  index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                }`}
              >
                <div className="relative h-full">
                  <Image
                    src={destination.image}
                    alt={destination.name}
                    fill
                    className="object-cover"
                    priority={index === 0}
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
                    <div className="max-w-2xl">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium mb-3 inline-block ${
                        destination.type === 'resort' 
                          ? 'bg-[#e9b824] text-[#1a5d1a]' 
                          : 'bg-[#1a5d1a] text-[#e9b824]'
                      }`}>
                        {destination.type === 'resort' ? 'Luxury Resort' : 'Tourist Attraction'}
                      </span>
                      
                      <h3 className="text-2xl md:text-3xl font-bold mb-2 green-outline-heading">
                        {destination.name}
                      </h3>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className="w-4 h-4 text-[#e9b824]" />
                        <span className="text-lg font-medium">{destination.location}</span>
                      </div>
                      
                      <p className="text-base md:text-lg leading-relaxed opacity-90">
                        {destination.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2 rounded-full transition-all duration-300"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2 rounded-full transition-all duration-300"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="flex justify-center gap-2 mt-6">
            {destinations.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide ? 'bg-[#1a5d1a] scale-125' : 'bg-[#1a5d1a]/30'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="text-center mt-10">
          <p className="text-lg text-[#85603f] mb-4">
            Ready to experience these amazing destinations?
          </p>
          <a href="/contact" className="vintage-button inline-block">
            Plan Your Jamaica Adventure
          </a>
        </div>
      </div>
    </section>
  )
} 