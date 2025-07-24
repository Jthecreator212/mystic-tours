"use client"

import Link from "next/link"

export function Hero() {
  return (
    <div className="relative h-[100vh] min-h-[600px]">
      <div className="relative container mx-auto px-4 h-full flex flex-col items-center justify-center pt-16">
        <div className="max-w-2xl text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl text-[#e9b824] mb-6 font-extrabold tracking-wide green-outline-heading">
            Your Authentic Jamaican Adventure
          </h1>

          <div className="bg-[#1a5d1a]/40 backdrop-blur-sm p-4 rounded-lg border-l-4 border-[#e9b824] mb-8 transform hover:scale-105 transition-all duration-300">
            <p className="text-lg md:text-xl text-[#f8ede3]">
              From our listed tours to custom destinations and transport, your unforgettable Jamaican journey starts with us.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/tours" className="vintage-button">
              View Our Tours
            </Link>
            <Link href="/airport-pickup" className="vintage-button-secondary">
             Book Airport Transfer
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
