"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, Calendar, ChevronRight, User, Settings, LogOut, LayoutDashboard, ImageIcon } from "lucide-react"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  
  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [profileRef])

  return (
    <nav className="bg-transparent border-b-4 border-[#e9b824] absolute top-0 w-full z-50">
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
            <Link href="/blog" className="nav-link text-[#e9b824]">
              Blog
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
            <button className="hidden md:flex items-center justify-center group relative overflow-hidden rounded-md">
              <span className="absolute inset-0 bg-gradient-to-r from-[#e9b824] via-[#fed100] to-[#e9b824] opacity-80 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="absolute inset-0 bg-gradient-to-r from-[#1a5d1a] via-[#009b3a] to-[#1a5d1a] opacity-0 group-hover:opacity-90 transition-opacity duration-500 scale-x-0 group-hover:scale-x-100 origin-left transform"></span>
              <span className="relative flex items-center px-6 py-3 font-bold tracking-wider uppercase text-[#1a5d1a] group-hover:text-[#e9b824] transition-colors duration-300">
                <Calendar className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                Book Now
                <ChevronRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" />
              </span>
              <span className="absolute bottom-0 left-0 right-0 h-1 bg-[#1a5d1a] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></span>
              <span className="absolute -inset-3 border-2 border-[#e9b824] opacity-0 group-hover:opacity-100 rounded-md scale-105 transition-all duration-300 blur-[2px] group-hover:blur-[3px] -z-10"></span>
            </button>
            
            {/* Profile Section */}
            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center justify-center p-2 rounded-full bg-[#e9b824] hover:bg-[#fed100] transition-colors"
              >
                <User className="w-5 h-5 text-[#1a5d1a]" />
              </button>
              
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <div className="px-4 py-2 text-sm text-[#85603f] border-b border-gray-200">
                      <p className="font-bold">Admin User</p>
                      <p className="text-xs">admin@islandmystic.com</p>
                    </div>
                    
                    <Link 
                      href="/admin" 
                      className="flex items-center px-4 py-2 text-sm text-[#1a5d1a] hover:bg-[#f8ede3]"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                    
                    <Link 
                      href="/admin/images" 
                      className="flex items-center px-4 py-2 text-sm text-[#1a5d1a] hover:bg-[#f8ede3]"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <ImageIcon className="mr-2 h-4 w-4" />
                      Image Management
                    </Link>
                    
                    <Link 
                      href="/profile/settings" 
                      className="flex items-center px-4 py-2 text-sm text-[#1a5d1a] hover:bg-[#f8ede3]"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                    
                    <div className="border-t border-gray-200">
                      <button 
                        className="flex w-full items-center px-4 py-2 text-sm text-[#d83f31] hover:bg-[#f8ede3]"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button className="md:hidden text-[#e9b824]" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#1a5d1a]/90 border-t-2 border-[#e9b824]">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <Link
              href="/"
              className="nav-link py-2 px-4 text-center text-[#e9b824]"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/tours"
              className="nav-link py-2 px-4 text-center text-[#e9b824]"
              onClick={() => setIsMenuOpen(false)}
            >
              Tours
            </Link>
            <Link
              href="/about"
              className="nav-link py-2 px-4 text-center text-[#e9b824]"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/gallery"
              className="nav-link py-2 px-4 text-center text-[#e9b824]"
              onClick={() => setIsMenuOpen(false)}
            >
              Gallery
            </Link>
            <Link
              href="/contact"
              className="nav-link py-2 px-4 text-center text-[#e9b824]"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            <div className="flex items-center justify-center">
              <button className="vintage-button" onClick={() => setIsMenuOpen(false)}>
                Book Now
              </button>
            </div>
            
            <Link
              href="/admin"
              className="nav-link py-2 px-4 text-center text-[#e9b824] flex items-center justify-center"
              onClick={() => setIsMenuOpen(false)}
            >
              <LayoutDashboard className="mr-2" size={18} />
              Admin Dashboard
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
