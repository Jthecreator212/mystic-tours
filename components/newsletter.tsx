"use client"

import { useState } from "react"
import { subscribeToNewsletter } from "@/app/actions/newsletter-actions"

export function Newsletter() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string>("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      const result = await subscribeToNewsletter({ email })
      
      if (result.success) {
        setIsSubmitted(true)
        setEmail("")
      } else {
        setError(result.message)
      }
    } catch {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="py-16 bg-[#e9b824]">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl text-[#1a5d1a] mb-4">Join Our Tribe</h2>
          <p className="text-xl text-[#85603f] mb-8">
            Subscribe to our newsletter for exclusive deals, travel tips, and the latest on our tours.
          </p>

          {isSubmitted ? (
            <div className="bg-[#1a5d1a]/10 border-2 border-[#1a5d1a] rounded-lg p-6 max-w-xl mx-auto">
              <div className="text-[#1a5d1a] text-lg font-bold mb-2">🌴 Welcome to the tribe!</div>
              <p className="text-[#85603f] mb-4">
                Thank you for subscribing! You&apos;ll receive exclusive deals, travel tips, and the latest updates on our amazing tours.
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="bg-[#1a5d1a] text-[#f8ede3] px-6 py-2 rounded-md hover:bg-[#1a5d1a]/80 transition-colors font-medium"
              >
                Subscribe Another Email
              </button>
            </div>
          ) : (
            <div className="max-w-xl mx-auto">
              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-md p-3 mb-4">
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
                <input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-grow py-3 px-4 rounded-md border-2 border-[#85603f] focus:outline-none focus:border-[#d83f31]"
                  required
                  disabled={isSubmitting}
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#1a5d1a] hover:bg-[#d83f31] text-[#f8ede3] font-bold py-3 px-6 rounded-md shadow-md transition-all duration-300 border-2 border-[#85603f] uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Subscribing..." : "Subscribe"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
