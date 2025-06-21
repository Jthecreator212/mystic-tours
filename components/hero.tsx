"use client"

import { Music, Palmtree, Mountain, Heart } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"

export function Hero() {
  const [activeIndex, setActiveIndex] = useState(0)
  const phrases = [
    {
      text: "Experience the authentic rhythm and soul of Jamaica",
      icon: <Music className="text-[#e9b824] mr-2" size={20} />,
    },
    {
      text: "Discover hidden beaches and breathtaking landscapes",
      icon: <Palmtree className="text-[#e9b824] mr-2" size={20} />,
    },
    {
      text: "Explore majestic mountains and lush rainforests",
      icon: <Mountain className="text-[#e9b824] mr-2" size={20} />,
    },
    {
      text: "Connect with the vibrant culture and warm people",
      icon: <Heart className="text-[#e9b824] mr-2" size={20} />,
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % phrases.length)
    }, 4000) // Slightly longer duration for better readability
    return () => clearInterval(interval)
  }, [phrases.length])

  return (
    <div className="relative h-[100vh] min-h-[600px]">
      <div className="relative container mx-auto px-4 h-full flex flex-col items-center justify-center pt-16">
        <div className="max-w-2xl">
          <h1 className="text-5xl md:text-6xl lg:text-7xl text-[#e9b824] mb-6 font-extrabold tracking-wide green-outline-heading text-center">
            Feel the Magic.
            <br />
            Hear the Soul.
          </h1>

          <div className="bg-[#1a5d1a]/40 backdrop-blur-sm p-4 rounded-lg border-l-4 border-[#e9b824] mb-8 transform hover:scale-105 transition-all duration-300 text-center">
            <div className="relative h-16 overflow-hidden">
              {phrases.map((phrase, index) => (
                <div
                  key={index}
                  className={`absolute top-0 left-0 w-full transition-all duration-500 flex items-start justify-center ${
                    index === activeIndex ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-8"
                  }`}
                >
                  {phrase.icon}
                  <p className="text-xl md:text-2xl text-[#e9b824] font-medium">{phrase.text}</p>
                </div>
              ))}
            </div>
            <p className="text-lg text-[#f8ede3]">
              Our guided tours take you beyond the tourist traps to experience the real Jamaica.
            </p>

            <div className="flex mt-3 justify-center">
              {phrases.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full mx-1 ${index === activeIndex ? "bg-[#e9b824]" : "bg-[#f8ede3]/50"}`}
                  onClick={() => setActiveIndex(index)}
                  aria-label={`View phrase ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/tours" className="vintage-button">
              Explore Tours
            </Link>
            <button className="bg-transparent hover:bg-[#e9b824] text-[#f8ede3] hover:text-[#1a5d1a] font-bold py-3 px-6 rounded-md border-2 border-[#e9b824] uppercase tracking-wider transition-all duration-300">
              Watch Video
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
