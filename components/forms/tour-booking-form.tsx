"use client"

import { createTourBooking } from "@/app/actions/booking-actions"
import { BookingConfirmationDialog } from "@/components/dialogs/booking-confirmation-dialog"
import type React from "react"
import { useState } from "react"

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
  const [isRateLimited, setIsRateLimited] = useState(false)
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
    setIsRateLimited(false)

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
        if (result.rateLimited) {
          setIsRateLimited(true)
          setError(result.message || "Too many booking attempts. Please try again later.")
        } else {
          setError(result.message || "Failed to create booking. Please try again.")
        }
      }
    } catch {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split("T")[0]

  const oneYear = new Date()
  oneYear.setFullYear(oneYear.getFullYear() + 1)
  const maxDate = oneYear.toISOString().split("T")[0]

  if (isSubmitted && showConfirmation && bookingResult) {
    return (
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
          bookingId: (bookingResult.booking as Record<string, unknown>)?.id as string || 'unknown',
          totalAmount: (bookingResult.booking as Record<string, unknown>)?.total_amount as number
        }}
      />
    )
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-[#1a5d1a] mb-6">Book Your Tour</h2>
      
      {error && (
        <div className={`mb-6 p-4 rounded-md border-l-4 ${
          isRateLimited 
            ? 'bg-orange-50 border-orange-500 text-orange-700'
            : 'bg-red-50 border-red-500 text-red-700'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {isRateLimited ? (
                <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">
                {isRateLimited ? 'Booking Rate Limit Reached' : 'Booking Error'}
              </p>
              <p className="text-sm mt-1">{error}</p>
              {isRateLimited && (
                <p className="text-sm mt-2 text-orange-600">
                  💡 <strong>Tip:</strong> You can try again in a few minutes, or contact us directly if you need immediate assistance.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Date *
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              min={minDate}
              max={maxDate}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a5d1a] focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-2">
              Number of Guests *
            </label>
            <select
              id="guests"
              name="guests"
              value={formData.guests}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a5d1a] focus:border-transparent"
            >
              {[...Array(20)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} {i + 1 === 1 ? "Guest" : "Guests"}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a5d1a] focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a5d1a] focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a5d1a] focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700 mb-2">
            Special Requests (Optional)
          </label>
          <textarea
            id="specialRequests"
            name="specialRequests"
            value={formData.specialRequests}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1a5d1a] focus:border-transparent"
            placeholder="Let us know if you have any dietary restrictions, accessibility needs, or special requests..."
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || isRateLimited}
          className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
            isSubmitting || isRateLimited
              ? 'bg-gray-400 cursor-not-allowed text-white'
              : 'bg-[#1a5d1a] hover:bg-[#2d7a2d] text-white'
          }`}
        >
          {isSubmitting ? "Processing..." : isRateLimited ? "Please Wait Before Trying Again" : "Book Now"}
        </button>
      </form>
    </div>
  )
}
