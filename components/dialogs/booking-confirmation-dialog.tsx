import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckCircle, Calendar, Users, DollarSign, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BookingConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  bookingDetails: {
    tourName: string
    date: string
    guests: number
    customerName: string
    customerEmail: string
    customerPhone: string
    bookingId: string
    totalAmount?: number
  }
}

export function BookingConfirmationDialog({ 
  isOpen, 
  onClose, 
  bookingDetails 
}: BookingConfirmationDialogProps) {
  const [showContent, setShowContent] = useState(false)
  const [animateIcon, setAnimateIcon] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // Delay content appearance for smooth animation
      const timer1 = setTimeout(() => setShowContent(true), 300)
      const timer2 = setTimeout(() => setAnimateIcon(true), 600)
      
      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
      }
    } else {
      setShowContent(false)
      setAnimateIcon(false)
    }
  }, [isOpen])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto bg-white rounded-xl shadow-xl border-0 p-0 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300">
        {/* Header with success icon */}
        <div className="bg-gradient-to-br from-[#1a5d1a] to-[#2d8f2d] text-white text-center py-4 px-4">
          <div className={`inline-flex items-center justify-center bg-white/20 rounded-full p-2 mb-2 transition-all duration-500 ${
            animateIcon ? 'scale-100 rotate-0' : 'scale-0 rotate-45'
          }`}>
            <div className={`transition-all duration-300 ${animateIcon ? 'opacity-100' : 'opacity-0'}`}>
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
          </div>
          <DialogHeader>
            <DialogTitle className={`text-lg font-bold text-white mb-1 transition-all duration-500 delay-300 ${
              showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}>
              Booking Request Received!
            </DialogTitle>
          </DialogHeader>
          <p className={`text-white/90 text-xs transition-all duration-500 delay-500 ${
            showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}>
            Ready to experience Jamaica?
          </p>
        </div>

        {/* Main content */}
        <div className={`p-4 space-y-3 transition-all duration-700 delay-700 ${
          showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <div className="text-center mb-3">
            <h3 className="text-sm font-semibold text-[#1a5d1a] mb-1">
              {bookingDetails.tourName}
            </h3>
            <p className="text-xs text-[#85603f]">
              We&apos;ll contact you shortly to confirm your booking and discuss payment options.
            </p>
          </div>

          {/* Booking details */}
          <div className="bg-[#f8fafc] rounded-lg p-3 space-y-2">
            <div className="flex items-center text-xs">
              <Calendar className="h-3 w-3 text-[#1a5d1a] mr-2" />
              <span className="text-[#85603f]">
                {formatDate(bookingDetails.date)}
              </span>
            </div>
            
            <div className="flex items-center text-xs">
              <Users className="h-3 w-3 text-[#1a5d1a] mr-2" />
              <span className="text-[#85603f]">
                {bookingDetails.guests} {bookingDetails.guests === 1 ? 'Guest' : 'Guests'}
              </span>
            </div>

            {bookingDetails.totalAmount && (
              <div className="flex items-center text-xs">
                <DollarSign className="h-3 w-3 text-[#1a5d1a] mr-2" />
                <span className="text-[#85603f] font-semibold">
                  {formatPrice(bookingDetails.totalAmount)} per person
                </span>
              </div>
            )}

            <div className="flex items-center text-xs">
              <MapPin className="h-3 w-3 text-[#1a5d1a] mr-2" />
              <span className="text-[#85603f]">
                Booking ID: #{bookingDetails.bookingId}
              </span>
            </div>
          </div>



          {/* Action button */}
          <Button 
            onClick={onClose}
            className={`w-full vintage-button mt-3 text-sm py-2 transition-all duration-500 delay-1000 ${
              showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Continue Exploring
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 