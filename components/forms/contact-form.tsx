"use client"

import type React from "react"

import { submitContactForm } from "@/app/actions/contact-actions"
import { useState } from "react"

export function ContactForm() {
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    subject: "Tour Inquiry" | "Booking Question" | "Custom Tour Request" | "General Question" | "";
    message: string;
  }>({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string>("")
  const [isRateLimited, setIsRateLimited] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    setIsRateLimited(false)

    try {
      // Validate that subject is selected
      if (!formData.subject) {
        setError("Please select a subject.")
        return
      }

      const result = await submitContactForm({
        name: formData.name,
        email: formData.email,
        subject: formData.subject as "Tour Inquiry" | "Booking Question" | "Custom Tour Request" | "General Question",
        message: formData.message,
      })
      
      if (result.success) {
        setIsSubmitted(true)
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        })
      } else {
        if ((result as { rateLimited?: boolean }).rateLimited) {
          setIsRateLimited(true)
          setError(result.message || "Too many contact attempts. Please try again later.")
        } else {
          setError(result.message || "Failed to send message. Please try again.")
        }
      }
    } catch {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {isSubmitted ? (
        <div className="bg-[#1a5d1a]/10 border-2 border-[#1a5d1a] rounded-md p-4 text-center">
          <p className="text-[#1a5d1a] font-bold">Thank you for your message!</p>
          <p>We&apos;ll get back to you as soon as possible.</p>
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
          {error && (
            <div className={`p-4 rounded-md border-l-4 ${
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
                    {isRateLimited ? 'Contact Rate Limit Reached' : 'Contact Error'}
                  </p>
                  <p className="text-sm mt-1">{error}</p>
                  {isRateLimited && (
                    <p className="text-sm mt-2 text-orange-600">
                      💡 <strong>Tip:</strong> You can try again in a few minutes, or call us directly for immediate assistance.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

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
              placeholder="Tell us about your inquiry or question..."
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isRateLimited}
            className={`vintage-button w-full ${
              isSubmitting || isRateLimited
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
          >
            {isSubmitting ? "Sending..." : isRateLimited ? "Please Wait Before Trying Again" : "Send Message"}
          </button>
        </div>
      )}
    </form>
  )
}
