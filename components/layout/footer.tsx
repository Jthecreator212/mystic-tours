import Image from "next/image"
import Link from "next/link"
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-[#1a5d1a] text-[#f8ede3] pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-start mb-6">
              <div className="relative h-24 w-24 mr-3">
                <Image
                  src="/images/island-mystiq-logo.png"
                  alt="Island Mystic Tours Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col mt-2">
                <span className="text-[#e9b824] font-playfair text-xl font-bold leading-tight">Island Mystic</span>
                <span className="text-[#e9b824] font-playfair text-lg">Tours</span>
              </div>
            </div>
            <p className="mb-4">
              Experience the authentic rhythm and soul of Jamaica with our guided tours that take you beyond the tourist
              traps.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-[#e9b824] hover:text-[#d83f31] transition-colors duration-300">
                <Facebook size={24} />
              </Link>
              <Link href="#" className="text-[#e9b824] hover:text-[#d83f31] transition-colors duration-300">
                <Instagram size={24} />
              </Link>
              <Link href="#" className="text-[#e9b824] hover:text-[#d83f31] transition-colors duration-300">
                <Twitter size={24} />
              </Link>
              <Link href="#" className="text-[#e9b824] hover:text-[#d83f31] transition-colors duration-300">
                <Youtube size={24} />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-[#e9b824] mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-[#e9b824] transition-colors duration-300">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/tours" className="hover:text-[#e9b824] transition-colors duration-300">
                  Tours
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#e9b824] transition-colors duration-300">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="hover:text-[#e9b824] transition-colors duration-300">
                  Gallery
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#e9b824] transition-colors duration-300">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold text-[#e9b824] mb-4">Popular Tours</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/tours/roots-culture" className="hover:text-[#e9b824] transition-colors duration-300">
                  Roots & Culture Experience
                </Link>
              </li>
              <li>
                <Link href="/tours/island-paradise" className="hover:text-[#e9b824] transition-colors duration-300">
                  Island Paradise Escape
                </Link>
              </li>
              <li>
                <Link href="/tours/mountain-village" className="hover:text-[#e9b824] transition-colors duration-300">
                  Mountain Village Trek
                </Link>
              </li>
              <li>
                <Link href="/tours/music-history" className="hover:text-[#e9b824] transition-colors duration-300">
                  Music History Tour
                </Link>
              </li>
              <li>
                <Link href="/tours/food-culture" className="hover:text-[#e9b824] transition-colors duration-300">
                  Food & Culture Experience
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold text-[#e9b824] mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="mr-2 text-[#e9b824] flex-shrink-0" />
                <span>123 Reggae Road, Kingston, Jamaica</span>
              </li>
              <li className="flex items-center">
                <Phone className="mr-2 text-[#e9b824] flex-shrink-0" />
                <span>+1 (876) 123-4567</span>
              </li>
              <li className="flex items-center">
                <Mail className="mr-2 text-[#e9b824] flex-shrink-0" />
                <span>info@islandmystic.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#e9b824]/30 pt-8 text-center">
          <p>&copy; {new Date().getFullYear()} Island Mystic Tours. All rights reserved.</p>
          <p className="text-sm mt-2 text-[#f8ede3]/70">Feel the magic. Hear the soul.</p>
        </div>
      </div>
    </footer>
  )
}
