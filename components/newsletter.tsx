"use client"

import { subscribeToNewsletter } from "@/app/actions/newsletter-actions"
import { useState } from "react"

export function Newsletter() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string>("")
  const [isRateLimited, setIsRateLimited] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    setIsRateLimited(false)

    try {
      const result = await subscribeToNewsletter({ email })
      
      if (result.success) {
        setIsSubmitted(true)
        setEmail("")
      } else {
        if ((result as { rateLimited?: boolean }).rateLimited) {
          setIsRateLimited(true)
          setError(result.message || "Newsletter signup limit reached. Please try again later.")
        } else {
          setError(result.message || "Failed to subscribe. Please try again.")
        }
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
                <div className={`p-4 mb-4 rounded-md border-l-4 ${
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
                        {isRateLimited ? 'Newsletter Rate Limit Reached' : 'Newsletter Error'}
                      </p>
                      <p className="text-sm mt-1">{error}</p>
                      {isRateLimited && (
                        <p className="text-sm mt-2 text-orange-600">
                          💡 <strong>Tip:</strong> Each email can only subscribe once per hour. Please try again later.
                        </p>
                      )}
                    </div>
                  </div>
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
                  disabled={isSubmitting || isRateLimited}
                />
                <button
                  type="submit"
                  disabled={isSubmitting || isRateLimited}
                  className={`bg-[#1a5d1a] hover:bg-[#d83f31] text-[#f8ede3] font-bold py-3 px-6 rounded-md shadow-md transition-all duration-300 border-2 border-[#85603f] uppercase tracking-wider ${
                    isSubmitting || isRateLimited
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                >
                  {isSubmitting ? "Subscribing..." : isRateLimited ? "Please Wait" : "Subscribe"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
