"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, Calendar, ChevronRight } from "lucide-react"
import { usePathname } from "next/navigation"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  // Determine background class: solid green except on home page
  const navBgClass = pathname === "/" ? "bg-transparent" : "bg-[#1a5d1a]"
  const borderClass = "border-b-4 border-[#e9b824]"
  const navPositionClass = "absolute top-0 w-full z-50"

  return (
    <nav className={`${navBgClass} ${borderClass} ${navPositionClass}`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-24">
          <Link href="/" className="flex items-center">
            <div className="relative h-20 w-20 mr-3">
              <Image
                src="/images/island-mystiq-logo.png"
                alt="Island Mystic Tours Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-[#e9b824] font-playfair text-2xl font-bold leading-tight">Island Mystic</span>
              <span className="text-[#e9b824] font-playfair text-lg">Tours</span>
            </div>
          </Link>

          <div className="hidden md:flex space-x-8">
            <Link href="/" className="nav-link text-[#e9b824]">
              Home
            </Link>
            <Link href="/tours" className="nav-link text-[#e9b824]">
              Tours
            </Link>
            <Link href="/airport-pickup" className="nav-link text-[#e9b824]">
              Airport Pickup
            </Link>
            <Link href="/about" className="nav-link text-[#e9b824]">
              About
            </Link>
            <Link href="/gallery" className="nav-link text-[#e9b824]">
              Gallery
            </Link>
            <Link href="/contact" className="nav-link text-[#e9b824]">
              Contact
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link href="/tours" className="hidden md:flex items-center justify-center group relative overflow-hidden rounded-md">
              <span className="absolute inset-0 bg-gradient-to-r from-[#e9b824] via-[#fed100] to-[#e9b824] opacity-80 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="absolute inset-0 bg-gradient-to-r from-[#1a5d1a] via-[#009b3a] to-[#1a5d1a] opacity-0 group-hover:opacity-90 transition-opacity duration-500 scale-x-0 group-hover:scale-x-100 origin-left transform"></span>
              <span className="relative flex items-center px-6 py-3 font-bold tracking-wider uppercase text-[#1a5d1a] group-hover:text-[#e9b824] transition-colors duration-300">
                <Calendar className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                Book Now
                <ChevronRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" />
              </span>
              <span className="absolute bottom-0 left-0 right-0 h-1 bg-[#1a5d1a] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></span>
              <span className="absolute -inset-3 border-2 border-[#e9b824] opacity-0 group-hover:opacity-100 rounded-md scale-105 transition-all duration-300 blur-[2px] group-hover:blur-[3px] -z-10"></span>
            </Link>
          </div>

          <button className="md:hidden text-[#e9b824]" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className={`md:hidden ${pathname === "/" ? "bg-[#1a5d1a]/90" : "bg-[#1a5d1a]"} border-t-2 border-[#e9b824]`}>
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <Link
              href="/"
              className="text-[#e9b824] hover:text-[#fed100] text-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/tours"
              className="text-[#e9b824] hover:text-[#fed100] text-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              Tours
            </Link>
            <Link
              href="/airport-pickup"
              className="text-[#e9b824] hover:text-[#fed100] text-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              Airport Pickup
            </Link>
            <Link
              href="/about"
              className="text-[#e9b824] hover:text-[#fed100] text-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/gallery"
              className="text-[#e9b824] hover:text-[#fed100] text-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              Gallery
            </Link>
            <Link
              href="/contact"
              className="text-[#e9b824] hover:text-[#fed100] text-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            <div className="pt-4 border-t border-[#e9b824]/20">
              <Link href="/tours" className="flex items-center justify-center group relative overflow-hidden rounded-md bg-gradient-to-r from-[#e9b824] via-[#fed100] to-[#e9b824] py-3">
                <span className="relative flex items-center font-bold tracking-wider uppercase text-[#1a5d1a]">
                  <Calendar className="w-5 h-5 mr-2" />
                Book Now
                  <ChevronRight className="w-4 h-4 ml-1" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
