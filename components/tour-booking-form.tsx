"use client"

import type React from "react"

import { useState } from "react"

interface TourBookingFormProps {
  tourId: number
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
    }, 1500)
  }

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split("T")[0]

  return (
    <form onSubmit={handleSubmit}>
      {isSubmitted ? (
        <div className="bg-[#1a5d1a]/10 border-2 border-[#1a5d1a] rounded-md p-4 text-center">
          <p className="text-[#1a5d1a] font-bold">Booking Request Received!</p>
          <p>We'll contact you shortly to confirm your booking for {tourName}.</p>
        </div>
      ) : (
        <div className="space-y-4">
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
              className="w-full px-4 py-2 border-2 border-[#85603f] rounded-md focus:outline-none focus:border-[#1a5d1a]"
            ></textarea>
          </div>

          <button type="submit" disabled={isSubmitting} className="vintage-button w-full">
            {isSubmitting ? "Processing..." : "Book Now"}
          </button>
        </div>
      )}
    </form>
  )
}
