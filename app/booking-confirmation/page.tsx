"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { tourData } from "../../data/tours"
import { CheckCircle, Calendar, Users, Clock, MapPin } from "lucide-react"
import { use } from "react"

// Client component that uses search params
function BookingConfirmationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [tour, setTour] = useState<any>(null)
  
  useEffect(() => {
    // Get the tourId from the URL query parameters
    const tourId = searchParams.get("tourId")
    
    if (!tourId) {
      // If no tourId is provided, redirect to the tours page
      router.push("/tours")
      return
    }
    
    // Find the tour in the tour data
    const selectedTour = tourData.find(t => t.id === parseInt(tourId))
    
    if (selectedTour) {
      setTour(selectedTour)
    } else {
      // If tour not found, redirect to the tours page
      router.push("/tours")
    }
  }, [searchParams, router])
  
  if (!tour) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1a5d1a]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] py-20">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-b-4 border-[#e9b824]">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1a5d1a] to-[#1a5d1a]/80 p-8 text-white text-center">
            <div className="inline-flex items-center justify-center bg-white/20 rounded-full p-3 mb-4">
              <CheckCircle className="h-10 w-10" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Booking Confirmed!</h1>
            <p className="text-white/80">Your adventure with Mystic Tours awaits</p>
          </div>
          
          {/* Tour Details */}
          <div className="p-8">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-[#1a5d1a] mb-2">{tour.title}</h2>
              <p className="text-[#85603f]">{tour.shortDescription}</p>
            </div>
            
            <div className="bg-[#f8fafc] rounded-xl p-6 mb-8">
              <h3 className="text-lg font-bold text-[#1a5d1a] mb-4 flex items-center">
                <span className="w-2 h-6 bg-[#e9b824] mr-3 rounded-full"></span>
                Tour Details
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-[#1a5d1a] mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium text-[#1a5d1a]">Date & Time</p>
                    <p className="text-[#85603f]">{tour.departure}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-[#1a5d1a] mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium text-[#1a5d1a]">Meeting Point</p>
                    <p className="text-[#85603f]">Mystic Tours Office, Kingston</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Users className="h-5 w-5 text-[#1a5d1a] mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium text-[#1a5d1a]">Group Size</p>
                    <p className="text-[#85603f]">{tour.groupSize}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-[#1a5d1a] mr-3 mt-0.5" />
                  <div>
                    <p className="font-medium text-[#1a5d1a]">Duration</p>
                    <p className="text-[#85603f]">{tour.duration}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-[#fffbe6] border border-[#e9b824]/30 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-bold text-[#1a5d1a] mb-2">Payment Confirmed</h3>
              <p className="text-[#85603f] mb-4">Your payment of <span className="font-bold text-[#ef3340]">${tour.price.toFixed(2)}</span> has been processed successfully.</p>
              <p className="text-sm text-[#85603f]">A confirmation email with all details has been sent to your email address.</p>
            </div>
            
            <div className="text-center">
              <p className="text-[#85603f] mb-6">Thank you for choosing Mystic Tours for your adventure!</p>
              <div className="space-x-4">
                <Link href="/tours" className="inline-block bg-[#1a5d1a] text-white font-bold py-3 px-6 rounded-lg shadow hover:bg-[#e9b824] hover:text-[#1a5d1a] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#e9b824]/50 transform hover:scale-105">
                  Browse More Tours
                </Link>
                <Link href="/" className="inline-block bg-white text-[#1a5d1a] border-2 border-[#1a5d1a] font-bold py-3 px-6 rounded-lg shadow hover:bg-[#1a5d1a]/5 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#1a5d1a]/50">
                  Return Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Loading fallback
function BookingConfirmationLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1a5d1a]"></div>
    </div>
  )
}

// Main page component with Suspense boundary
export default function BookingConfirmationPage() {
  
  return (
    <Suspense fallback={<BookingConfirmationLoading />}>
      <BookingConfirmationContent />
    </Suspense>
  )
}
