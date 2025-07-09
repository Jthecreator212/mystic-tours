"use client"

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Camera, Loader2 } from 'lucide-react'
import Image from 'next/image'

export interface JamaicaSlideImage {
  id: string;
  title: string;
  description: string;
  image_url: string;
  alt_text: string;
  photographer: string;
  tags: string[];
}

// Beautiful local Jamaica images for slideshow
const jamaicaImages: JamaicaSlideImage[] = [
  {
    id: 'local-1',
    title: "Dunn's River Falls",
    description: "Experience Jamaica's most famous waterfall with terraced natural pools and tropical surroundings.",
    image_url: '/images/gallery/paradise-1.png',
    alt_text: "Dunn's River Falls cascading down natural limestone terraces",
    photographer: 'Island Mystiq Tours',
    tags: ['waterfall', 'nature', 'adventure']
  },
  {
    id: 'local-2',
    title: 'Seven Mile Beach Paradise',
    description: 'Relax on the pristine white sands of Negril Beach, where the Caribbean sunset paints the sky in brilliant colors.',
    image_url: '/images/gallery/paradise-2.png',
    alt_text: 'Crystal clear turquoise waters and white sandy beach at Seven Mile Beach',
    photographer: 'Island Mystiq Tours',
    tags: ['beach', 'sunset', 'paradise']
  },
  {
    id: 'local-3',
    title: 'Blue Mountains Majesty',
    description: 'Journey through the misty peaks where the world\'s finest coffee grows, surrounded by lush tropical rainforest.',
    image_url: '/images/gallery/mountain-1.png',
    alt_text: 'Misty Blue Mountains covered in lush green coffee plantations',
    photographer: 'Island Mystiq Tours',
    tags: ['mountains', 'coffee', 'rainforest']
  },
  {
    id: 'local-4',
    title: 'Authentic Reggae Culture',
    description: 'Immerse yourself in the birthplace of reggae music, where Bob Marley\'s legacy lives on in every rhythm.',
    image_url: '/images/gallery/reggae-1.png',
    alt_text: 'Colorful Jamaican street art celebrating reggae culture',
    photographer: 'Island Mystiq Tours',
    tags: ['culture', 'reggae', 'music']
  },
  {
    id: 'local-5',
    title: 'Tropical Paradise Gardens',
    description: 'Wander through vibrant botanical gardens where exotic flowers bloom year-round in the Caribbean sunshine.',
    image_url: '/images/gallery/paradise-3.png',
    alt_text: 'Vibrant tropical flowers and palm trees in a lush garden setting',
    photographer: 'Island Mystiq Tours',
    tags: ['gardens', 'flowers', 'tropical']
  },
  {
    id: 'local-6',
    title: 'Crystal Cave Adventures',
    description: 'Explore hidden underground caverns filled with crystal-clear pools and ancient limestone formations.',
    image_url: '/images/gallery/paradise-4.png',
    alt_text: 'Stunning underground cave with crystal clear blue water',
    photographer: 'Island Mystiq Tours',
    tags: ['caves', 'adventure', 'exploration']
  },
  {
    id: 'local-7',
    title: 'Sunset at Rick\'s Cafe',
    description: 'Watch fearless cliff divers and enjoy spectacular sunsets at the world-famous Rick\'s Cafe in Negril.',
    image_url: '/images/gallery/paradise-5.png',
    alt_text: 'Dramatic sunset view from the cliffs at Rick\'s Cafe',
    photographer: 'Island Mystiq Tours',
    tags: ['sunset', 'cliffs', 'nightlife']
  },
  {
    id: 'local-8',
    title: 'Bamboo River Rafting',
    description: 'Drift peacefully down the Martha Brae River on a traditional bamboo raft, surrounded by tropical vegetation.',
    image_url: '/images/gallery/paradise-6.png',
    alt_text: 'Traditional bamboo raft floating down a serene tropical river',
    photographer: 'Island Mystiq Tours',
    tags: ['river', 'rafting', 'relaxation']
  }
]

export function JamaicaSlideshow() {
  const [images, setImages] = useState<JamaicaSlideImage[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading for smooth user experience
    const timer = setTimeout(() => {
      setImages(jamaicaImages)
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!isAutoPlaying || images.length === 0) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, images.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length)
    setIsAutoPlaying(false)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length)
    setIsAutoPlaying(false)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl text-[#e9b824] mb-4 font-bold green-outline-heading">
            Experience Jamaica&apos;s Beauty
          </h2>
          <p className="text-lg md:text-xl text-white max-w-2xl mx-auto mb-12">
            From stunning beaches to mystical mountains, discover the natural wonders that make Jamaica unforgettable
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {isLoading ? (
            <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl bg-gray-200 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#1a5d1a] mx-auto mb-4" />
                <p className="text-[#1a5d1a] font-medium">Loading beautiful Jamaica images...</p>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                      index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                    }`}
                  >
                    <div className="relative h-full">
                      <Image
                        src={image.image_url}
                        alt={image.alt_text}
                        fill
                        className="object-cover"
                        priority={index === 0}
                      />
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
                      
                      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
                        <div className="max-w-2xl">
                          <div className="flex items-center gap-2 mb-3">
                            <Camera className="w-4 h-4 text-[#e9b824]" />
                            <span className="text-sm opacity-80">Photo by {image.photographer}</span>
                            {image.tags.length > 0 && (
                              <>
                                <span className="text-[#e9b824] mx-2">•</span>
                                <div className="flex items-center gap-1">
                                  <span className="text-[#e9b824] text-sm">#{image.tags[0]}</span>
                                </div>
                              </>
                            )}
                          </div>
                          
                          <h3 className="text-2xl md:text-3xl font-bold mb-3 green-outline-heading">
                            {image.title}
                          </h3>
                          
                          <p className="text-base md:text-lg leading-relaxed opacity-90">
                            {image.description}
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
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2 rounded-full transition-all duration-300"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <div className="flex justify-center gap-2 mt-6">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentSlide ? 'bg-[#1a5d1a] scale-125' : 'bg-[#1a5d1a]/30'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="text-center mt-10">
          <p className="text-lg md:text-xl text-white mb-4">
            Ready to experience these breathtaking destinations?
          </p>
          <a href="/contact" className="vintage-button inline-block">
            Plan Your Jamaica Adventure
          </a>
        </div>
      </div>
    </section>
  )
} 