"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { TourCard } from "@/components/tour-card"
import { Testimonial } from "@/components/testimonial"
import { Footer } from "@/components/footer"
import { Newsletter } from "@/components/newsletter"
import { ChevronLeft, ChevronRight, Sun, Music, Palmtree, Compass } from "lucide-react"
import { tourData } from "@/data/tours"

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [autoplay, setAutoplay] = useState(true)
  const [activeFeature, setActiveFeature] = useState(0)

  const features = [
    {
      icon: <Sun className="h-8 w-8 text-[#e9b824]" />,
      title: "Authentic Experiences",
      description: "Discover the real Jamaica beyond tourist attractions",
    },
    {
      icon: <Music className="h-8 w-8 text-[#e9b824]" />,
      title: "Rhythmic Culture",
      description: "Feel the beat of reggae and the island's rich musical heritage",
    },
    {
      icon: <Palmtree className="h-8 w-8 text-[#e9b824]" />,
      title: "Natural Beauty",
      description: "Explore breathtaking landscapes from mountains to beaches",
    },
    {
      icon: <Compass className="h-8 w-8 text-[#e9b824]" />,
      title: "Island Paradise",
      description: "Experience the warmth and magic of our tropical paradise",
    },
  ]

  useEffect(() => {
    const featureInterval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length)
    }, 3000)
    return () => clearInterval(featureInterval)
  }, [features.length])

  // Use the first 3 tours from the imported tourData
  const tours = tourData.slice(0, 3).map(tour => ({
    id: tour.id,
    title: tour.title,
    description: tour.shortDescription,
    image: tour.image,
    price: tour.price,
    duration: tour.duration.split(' ')[0] + ' ' + tour.duration.split(' ')[1] // Format to match what's shown on cards
  }))

  const testimonials = [
    {
      id: 1,
      name: "Marcus J.",
      quote:
        "This tour changed my life! The guides were knowledgeable and the music was incredible. I felt the spirit of the island in my soul.",
      location: "New York, USA",
      image: "/uploads/testimonial-1-595361c7-4a0a-46ec-92bd-33e21a2abdbc.png",
    },
    {
      id: 2,
      name: "Sarah T.",
      quote:
        "An authentic experience that goes beyond the typical tourist attractions. The local connections made this trip unforgettable.",
      location: "London, UK",
      image: "/uploads/testimonial-2-fa4d60c7-4b04-4441-ae37-8b906164057d.png",
    },
  ]

  // Autoplay functionality
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

  // Pause autoplay when user interacts with carousel
  const handleNavigation = (index: number) => {
    setCurrentSlide(index)
    setAutoplay(false)
    // Resume autoplay after 10 seconds of inactivity
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
    <main className="min-h-screen bg-hero-pattern">
      <div className="bg-gradient-to-r from-[#1a5d1a]/80 to-transparent min-h-screen">
        <Navbar />
        <Hero />

        <section className="container mx-auto px-4 py-16 -mt-[5vh]">
          <div className="text-center mb-32">
            <h2 className="text-4xl md:text-5xl text-[#1a5d1a] mb-8 font-bold yellow-outline-heading">
              Experience The Magic
            </h2>

            <div className="max-w-5xl mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className={`p-6 rounded-lg transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                      index === activeFeature
                        ? "bg-[#1a5d1a] text-white shadow-lg scale-105"
                        : "bg-[#f8ede3]/80 text-[#85603f] hover:bg-[#e9b824]/20"
                    }`}
                    onClick={() => setActiveFeature(index)}
                  >
                    <div className="flex justify-center mb-4">{feature.icon}</div>
                    <h3 className="font-bold mb-2 text-lg">{feature.title}</h3>
                    <p className="text-sm">{feature.description}</p>
                  </div>
                ))}
              </div>

              <p className="text-xl text-[#e9b824] max-w-3xl mx-auto relative mt-8 mb-8">
                <span className="inline-block animate-pulse text-2xl mr-2">✨</span>
                Our tours take you beyond the beaten path to experience the authentic rhythm, culture, and natural
                beauty of our island paradise.
                <span className="inline-block animate-pulse text-2xl ml-2">✨</span>
              </p>
            </div>
          </div>

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

            {/* Navigation arrows */}
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

            {/* Dot navigation */}
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

          <div className="text-center mt-8">
            <a href="/tours" className="vintage-button inline-block">
              View All Tours
            </a>
          </div>
        </section>

        <section className="bg-[#1a5d1a] py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl text-[#e9b824] mb-4">Hear The Soul</h2>
              <p className="text-xl text-[#f8ede3] max-w-3xl mx-auto">
                Don't just take our word for it. Listen to the experiences of travelers who have felt the magic of our
                tours.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {testimonials.map((testimonial) => (
                <Testimonial key={testimonial.id} testimonial={testimonial} />
              ))}
            </div>
          </div>
        </section>

        <Newsletter />
        <Footer />
      </div>
    </main>
  )
}
