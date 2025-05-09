"use client"

import type React from "react"

import { useState } from "react"

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
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
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      })
    }, 1500)
  }

  return (
    <form onSubmit={handleSubmit}>
      {isSubmitted ? (
        <div className="bg-[#1a5d1a]/10 border-2 border-[#1a5d1a] rounded-md p-4 text-center">
          <p className="text-[#1a5d1a] font-bold">Thank you for your message!</p>
          <p>We'll get back to you as soon as possible.</p>
          <button
            type="button"
            onClick={() => setIsSubmitted(false)}
            className="mt-4 bg-[#1a5d1a] text-[#f8ede3] px-4 py-2 rounded-md hover:bg-[#1a5d1a]/80 transition-colors"
          >
            Send Another Message
          </button>
        </div>
      ) : (
        <div className="space-y-4">
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
            <label htmlFor="subject" className="block text-[#85603f] mb-1">
              Subject <span className="text-[#d83f31]">*</span>
            </label>
            <select
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border-2 border-[#85603f] rounded-md focus:outline-none focus:border-[#1a5d1a]"
            >
              <option value="">Select a subject</option>
              <option value="Tour Inquiry">Tour Inquiry</option>
              <option value="Booking Question">Booking Question</option>
              <option value="Custom Tour Request">Custom Tour Request</option>
              <option value="General Question">General Question</option>
            </select>
          </div>

          <div>
            <label htmlFor="message" className="block text-[#85603f] mb-1">
              Your Message <span className="text-[#d83f31]">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={5}
              className="w-full px-4 py-2 border-2 border-[#85603f] rounded-md focus:outline-none focus:border-[#1a5d1a]"
            ></textarea>
          </div>

          <button type="submit" disabled={isSubmitting} className="vintage-button w-full">
            {isSubmitting ? "Sending..." : "Send Message"}
          </button>
        </div>
      )}
    </form>
  )
}
