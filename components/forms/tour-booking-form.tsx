"use client"

import type React from "react"
import { useState } from "react"
import { createTourBooking } from "@/app/actions/booking-actions"
import { BookingConfirmationDialog } from "@/components/dialogs/booking-confirmation-dialog"

interface TourBookingFormProps {
  tourId: string
  tourName: string
}

export function TourBookingForm({ tourId, tourName }: TourBookingFormProps) {
  const [formData, setFormData] = useState({
    date: "",
    guests: 2,
    name: "",
    email: "",
    phone: "",
    specialRequests: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [bookingResult, setBookingResult] = useState<Record<string, unknown> | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const result = await createTourBooking({
        tourId,
        tourName,
        ...formData,
      })

      if (result.success) {
        setBookingResult(result)
        setShowConfirmation(true)
        setIsSubmitted(true)
      } else {
        setError(result.message || "An error occurred. Please try again.")
      }
    } catch {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split("T")[0]

  return (
    <>
      <form onSubmit={handleSubmit}>
        {isSubmitted ? (
          <div className="bg-[#1a5d1a]/10 border-2 border-[#1a5d1a] rounded-md p-4 text-center">
            <p className="text-[#1a5d1a] font-bold">Booking Request Received!</p>
            <p>We&apos;ll contact you shortly to confirm your booking for {tourName} and discuss payment options.</p>
          </div>
        ) : (
        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-md p-4 text-center">
              <p className="text-red-600 font-bold">Error</p>
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="date" className="block text-[#85603f] mb-1">
              Tour Date <span className="text-[#d83f31]">*</span>
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              min={today}
              required
              className="w-full px-4 py-2 border-2 border-[#85603f] rounded-md focus:outline-none focus:border-[#1a5d1a]"
            />
          </div>

          <div>
            <label htmlFor="guests" className="block text-[#85603f] mb-1">
              Number of Guests <span className="text-[#d83f31]">*</span>
            </label>
            <select
              id="guests"
              name="guests"
              value={formData.guests}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border-2 border-[#85603f] rounded-md focus:outline-none focus:border-[#1a5d1a]"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? "Guest" : "Guests"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="name" className="block text-[#85603f] mb-1">
              Your Name <span className="text-[#d83f31]">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border-2 border-[#85603f] rounded-md focus:outline-none focus:border-[#1a5d1a]"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-[#85603f] mb-1">
              Your Email <span className="text-[#d83f31]">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border-2 border-[#85603f] rounded-md focus:outline-none focus:border-[#1a5d1a]"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-[#85603f] mb-1">
              Phone Number <span className="text-[#d83f31]">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="+1 (555) 123-4567"
              className="w-full px-4 py-2 border-2 border-[#85603f] rounded-md focus:outline-none focus:border-[#1a5d1a]"
            />
          </div>

          <div>
            <label htmlFor="specialRequests" className="block text-[#85603f] mb-1">
              Special Requests
            </label>
            <textarea
              id="specialRequests"
              name="specialRequests"
              value={formData.specialRequests}
              onChange={handleChange}
              rows={3}
              placeholder="Any dietary restrictions, accessibility needs, or special requests..."
              className="w-full px-4 py-2 border-2 border-[#85603f] rounded-md focus:outline-none focus:border-[#1a5d1a]"
            ></textarea>
          </div>

          <button type="submit" disabled={isSubmitting} className="vintage-button w-full">
            {isSubmitting ? "Processing..." : "Book Now"}
          </button>
        </div>
      )}
    </form>
    
    {/* Confirmation Dialog */}
    {showConfirmation && bookingResult && (
      <BookingConfirmationDialog
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        bookingDetails={{
          tourName: tourName,
          date: formData.date,
          guests: formData.guests,
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          bookingId: bookingResult.bookingId as string,
          totalAmount: undefined // Will be calculated in the component if needed
        }}
      />
    )}
    </>
  )
}
