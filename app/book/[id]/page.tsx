"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, CreditCard, ChevronRight } from "lucide-react";
import { tourData } from "../../../data/tours";
import { use } from "react";

// @ts-ignore - Next.js 15 type compatibility

export default function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params using React.use()
  const resolvedParams = use(params);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [guests, setGuests] = useState(2);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("credit");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cvc, setCvc] = useState("");
  const router = useRouter();
  
  // Find the tour based on the ID parameter
  const tourId = parseInt(resolvedParams.id);
  const tour = tourData.find(tour => tour.id === tourId);
  
  // Redirect to tours page if tour not found
  useEffect(() => {
    if (!tour) {
      router.push('/tours');
    }
  }, [tour, router]);
  
  // Tour price from the selected tour
  const tourPrice = tour?.price || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare booking data with tour details
    const bookingData = {
      tourId,
      tourName: tour?.title,
      tourPrice: tour?.price,
      date,
      time,
      guests,
      customerInfo: {
        name,
        email,
        phone,
        specialRequests
      },
      paymentMethod,
      // Only include partial card info for security
      paymentDetails: paymentMethod === 'credit' ? {
        lastFourDigits: cardNumber.slice(-4),
        expiryMonth,
        expiryYear
      } : {}
    };
    
    console.log('Booking submitted:', bookingData);
    
    // Placeholder for payment processing
    setPaymentStatus("success");
    
    // In a real app, you would send this data to your backend
    // and then redirect after successful payment confirmation
    
    // Redirect after successful payment
    setTimeout(() => {
      // Pass tour ID in the redirect to show relevant confirmation
      router.push(`/booking-confirmation?tourId=${tourId}`);
    }, 2000);
  };
  
  const handlePaymentMethodChange = (method: string) => {
    setPaymentMethod(method);
  };

  return (
  <section aria-labelledby="book-tour-heading" className="max-w-5xl mx-auto p-0 md:p-10 bg-gradient-to-br from-[#f8fafc] via-white to-[#e9b824]/10 rounded-2xl shadow-2xl mt-10 border-b-4 border-[#e9b824] relative overflow-hidden">
    {/* Mystic Tours decorative elements */}
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#1a5d1a] to-[#e9b824]"></div>
    <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#e9b824] opacity-10 rounded-full"></div>
    <div className="absolute -bottom-8 -left-8 w-20 h-20 bg-[#1a5d1a] opacity-10 rounded-full"></div>
    
    <div className="relative">
      <h1 id="book-tour-heading" className="text-4xl font-playfair font-bold mb-2 text-[#1a5d1a] text-center drop-shadow-sm tracking-tight">Book Your Tour</h1>
      <p className="text-center text-[#85603f] mb-8 italic">"Discover the mystical island experience"</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-5 bg-white rounded-xl shadow-lg p-8 border border-[#e9b824]/20 transform transition-all duration-300 hover:shadow-xl relative">
          {/* Corner accent */}
          <div className="absolute top-0 right-0 w-0 h-0 border-t-[40px] border-r-[40px] border-t-[#e9b824] border-r-transparent"></div>
          <h2 className="text-2xl font-bold text-[#1a5d1a] flex items-center">
            <span className="inline-block w-2 h-8 bg-[#e9b824] mr-3 rounded-full"></span>
            Payment Information
          </h2>
          <p className="text-[#85603f]">Choose your preferred payment method</p>
          
          <div className="grid grid-cols-3 gap-2 mb-6">
            <button
              type="button"
              onClick={() => handlePaymentMethodChange("credit")}
              className={`py-3 px-4 rounded-md flex justify-center items-center transition-all duration-300 ${paymentMethod === "credit" 
                ? "bg-gradient-to-r from-[#1a5d1a] to-[#0d4a0d] text-white shadow-md transform scale-105" 
                : "bg-gray-100 text-[#85603f] border border-[#e9b824]/20 hover:bg-[#f8fafc]"}`}
            >
              <CreditCard className={`h-5 w-5 mr-2 ${paymentMethod === "credit" ? "animate-pulse" : ""}`} />
              Credit Card
            </button>
            <button
              type="button"
              onClick={() => handlePaymentMethodChange("paypal")}
              className={`py-3 px-4 rounded-md flex justify-center items-center transition-all duration-300 ${paymentMethod === "paypal" 
                ? "bg-gradient-to-r from-[#1a5d1a] to-[#0d4a0d] text-white shadow-md transform scale-105" 
                : "bg-gray-100 text-[#85603f] border border-[#e9b824]/20 hover:bg-[#f8fafc]"}`}
            >
              PayPal
            </button>
            <button
              type="button"
              onClick={() => handlePaymentMethodChange("crypto")}
              className={`py-3 px-4 rounded-md flex justify-center items-center transition-all duration-300 ${paymentMethod === "crypto" 
                ? "bg-gradient-to-r from-[#1a5d1a] to-[#0d4a0d] text-white shadow-md transform scale-105" 
                : "bg-gray-100 text-[#85603f] border border-[#e9b824]/20 hover:bg-[#f8fafc]"}`}
            >
              Crypto
            </button>
          </div>
        
        <form onSubmit={handleSubmit} aria-label="Payment form" className="space-y-5" autoComplete="off" noValidate>
          {paymentMethod === "credit" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="group">
                  <label htmlFor="firstName" className="block mb-1 font-semibold text-[#85603f] group-focus-within:text-[#009b3a] transition-colors duration-200">
                    First name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={name.split(" ")[0] || ""}
                    onChange={e => setName(e.target.value + (name.includes(" ") ? name.substring(name.indexOf(" ")) : ""))}
                    required
                    className="w-full border-2 border-[#fcd116]/40 focus:border-[#009b3a] rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#e9b824]/30 transition-all duration-200 focus:outline-none"
                  />
                </div>
                <div className="group">
                  <label htmlFor="lastName" className="block mb-1 font-semibold text-[#85603f] group-focus-within:text-[#009b3a] transition-colors duration-200">
                    Last name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={name.includes(" ") ? name.substring(name.indexOf(" ") + 1) : ""}
                    onChange={e => setName((name.includes(" ") ? name.substring(0, name.indexOf(" ")) : name) + " " + e.target.value)}
                    required
                    className="w-full border-2 border-[#fcd116]/40 focus:border-[#009b3a] rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#e9b824]/30 transition-all duration-200 focus:outline-none"
                  />
                </div>
              </div>
              
              <div className="group">
                <label htmlFor="email" className="block mb-1 font-semibold text-[#85603f] group-focus-within:text-[#009b3a] transition-colors duration-200">
                  Email
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full border-2 border-[#fcd116]/40 focus:border-[#009b3a] rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#e9b824]/30 transition-all duration-200 focus:outline-none"
                  />
                </div>
              </div>
              
              <div className="group">
                <label htmlFor="cardNumber" className="block mb-1 font-semibold text-[#85603f] group-focus-within:text-[#009b3a] transition-colors duration-200">
                  Card number
                </label>
                <div className="relative">
                  <input
                    id="cardNumber"
                    name="cardNumber"
                    type="text"
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value)}
                    placeholder="1234 5678 9012 3456"
                    required
                    className="w-full border-2 border-[#e9b824]/40 focus:border-[#1a5d1a] rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-[#e9b824]/30 transition-all duration-200 focus:outline-none"
                  />
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#85603f] h-5 w-5" />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="group col-span-1">
                  <label htmlFor="expiryMonth" className="block mb-1 font-semibold text-[#85603f] group-focus-within:text-[#009b3a] transition-colors duration-200">
                    Month
                  </label>
                  <select
                    id="expiryMonth"
                    name="expiryMonth"
                    value={expiryMonth}
                    onChange={e => setExpiryMonth(e.target.value)}
                    required
                    className="w-full border-2 border-[#fcd116]/40 focus:border-[#009b3a] rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#e9b824]/30 transition-all duration-200 focus:outline-none appearance-none bg-[url('/images/chevron-down.svg')] bg-no-repeat bg-[right_0.5rem_center]"
                  >
                    <option value="">MM</option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                      <option key={month} value={month.toString().padStart(2, '0')}>
                        {month.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="group col-span-1">
                  <label htmlFor="expiryYear" className="block mb-1 font-semibold text-[#85603f] group-focus-within:text-[#009b3a] transition-colors duration-200">
                    Year
                  </label>
                  <select
                    id="expiryYear"
                    name="expiryYear"
                    value={expiryYear}
                    onChange={e => setExpiryYear(e.target.value)}
                    required
                    className="w-full border-2 border-[#fcd116]/40 focus:border-[#009b3a] rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#e9b824]/30 transition-all duration-200 focus:outline-none appearance-none bg-[url('/images/chevron-down.svg')] bg-no-repeat bg-[right_0.5rem_center]"
                  >
                    <option value="">YY</option>
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                      <option key={year} value={year.toString().slice(2)}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="group col-span-1">
                  <label htmlFor="cvc" className="block mb-1 font-semibold text-[#85603f] group-focus-within:text-[#009b3a] transition-colors duration-200">
                    CVC
                  </label>
                  <input
                    id="cvc"
                    name="cvc"
                    type="text"
                    value={cvc}
                    onChange={e => setCvc(e.target.value)}
                    placeholder="123"
                    required
                    maxLength={4}
                    className="w-full border-2 border-[#fcd116]/40 focus:border-[#009b3a] rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#e9b824]/30 transition-all duration-200 focus:outline-none"
                  />
                </div>
              </div>
              
              <div className="flex items-center text-sm text-[#85603f] mt-4 bg-[#f8fafc] p-3 rounded-lg border border-[#e9b824]/30">
                <span className="inline-flex items-center justify-center p-1 bg-[#1a5d1a] text-white rounded-full mr-2">
                  <Check className="h-3 w-3" />
                </span>
                Your payment information is secured with 256-bit encryption
              </div>
            </>
          )}
          
          {paymentMethod === "paypal" && (
            <div className="py-6 text-center">
              <div className="mb-4 p-4 bg-[#f8f0dc] rounded-lg">
                <p className="text-[#85603f] mb-2">Click the button below to connect to PayPal</p>
                <div className="w-full max-w-xs mx-auto p-3 bg-white rounded-lg border-2 border-[#fcd116]/40 shadow-md">
                  <div className="flex justify-center">
                    <div className="h-10 w-24 bg-[url('/images/paypal-logo.png')] bg-contain bg-no-repeat bg-center"></div>
                  </div>
                </div>
              </div>
              <button type="button" className="w-full bg-[#0070ba] hover:bg-[#003087] text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center">
                <span className="mr-2">Connect with PayPal</span>
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 12H4M20 12L14 6M20 12L14 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          )}
          
          {paymentMethod === "crypto" && (
            <div className="py-6 text-center">
              <p className="text-[#85603f] mb-4">Select your preferred cryptocurrency for payment.</p>
              <div className="space-y-3">
                <button type="button" className="w-full bg-gradient-to-r from-[#f7931a] to-[#e6801a] text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center">
                  <span className="mr-2 h-5 w-5 bg-white rounded-full flex items-center justify-center">
                    <span className="h-4 w-4 bg-[url('/images/bitcoin-logo.svg')] bg-contain bg-no-repeat bg-center"></span>
                  </span>
                  Bitcoin
                </button>
                <button type="button" className="w-full bg-gradient-to-r from-[#627eea] to-[#3c5be0] text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center">
                  <span className="mr-2 h-5 w-5 bg-white rounded-full flex items-center justify-center">
                    <span className="h-4 w-4 bg-[url('/images/ethereum-logo.svg')] bg-contain bg-no-repeat bg-center"></span>
                  </span>
                  Ethereum
                </button>
                <button type="button" className="w-full bg-gradient-to-r from-[#345d9d] to-[#2a4a7d] text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center">
                  <span className="mr-2 h-5 w-5 bg-white rounded-full flex items-center justify-center">
                    <span className="h-4 w-4 bg-[url('/images/cardano-logo.svg')] bg-contain bg-no-repeat bg-center"></span>
                  </span>
                  Cardano
                </button>
              </div>
            </div>
          )}
          
          <div className="pt-4">
            <button
              type="submit"
              className={`w-full relative overflow-hidden group bg-gradient-to-r from-[#1a5d1a] via-[#2a6d2a] to-[#1a5d1a] text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#e9b824]/50 text-lg tracking-wide ${
                paymentStatus === "success" ? "bg-[#1a5d1a]" : ""
              }`}
              disabled={paymentStatus === "success"}
              aria-live="polite"
              aria-label={paymentStatus === "success" ? "Payment Successful!" : "Complete Purchase"}
            >
              {/* Animated background effect */}
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#e9b824] via-[#e9b824] to-[#e9b824] opacity-0 group-hover:opacity-20 transform translate-x-full group-hover:translate-x-0 transition-all duration-1000"></span>
              
              {paymentStatus === "success" ? (
                <span className="flex items-center justify-center">
                  <Check className="w-5 h-5 mr-2" />
                  Payment Successful!
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  Complete Purchase
                  <svg className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
      <aside className="bg-gradient-to-br from-[#fffbe6] via-[#fdf6b2] to-[#e9b824]/10 border-2 border-[#e9b824]/30 rounded-xl shadow-lg p-8 relative transform transition-all duration-300 hover:shadow-xl" aria-labelledby="order-summary-heading">
        {/* Mystic Tours decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#1a5d1a] to-[#e9b824]"></div>
        
        <h2 id="order-summary-heading" className="text-2xl font-bold text-[#1a5d1a] flex items-center mb-6">
          <span className="inline-block w-2 h-8 bg-[#e9b824] mr-3 rounded-full"></span>
          Order Summary
        </h2>
        
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-[#e9b824]/20">
          <h3 className="text-xl font-bold text-[#1a5d1a] flex items-center">
            <span className="w-3 h-3 rounded-full bg-[#e9b824] mr-2"></span>
            {tour?.title || "Tour Package"}
          </h3>
          <p className="text-[#85603f] ml-5 text-sm">One-time payment</p>
          <div className="flex justify-between items-center mt-3 ml-5">
            <span className="text-[#85603f]">Tour Price</span>
            <span className="text-xl font-bold text-[#ef3340]">${tourPrice?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center mt-2 ml-5">
            <span className="text-[#85603f]">Duration</span>
            <span className="text-[#85603f]">{tour?.duration || "N/A"}</span>
          </div>
        </div>
        
        <div className="border-t-2 border-dashed border-[#fcd116]/40 my-6 pt-6">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-[#85603f]">Total</span>
            <span className="text-2xl font-bold text-[#ef3340]">${tourPrice.toFixed(2)}</span>
          </div>
          <p className="text-sm text-[#85603f] mt-1 italic">Lifetime access, no recurring fees</p>
        </div>
        
        <div className="border-t-2 border-dashed border-[#e9b824]/40 my-6 pt-6">
          <h3 className="text-lg font-bold text-[#1a5d1a] mb-4 flex items-center">
            <span className="w-3 h-3 rounded-full bg-[#e9b824] mr-2"></span>
            What's included:
          </h3>
          <ul className="space-y-3">
            {(tour?.includes || [
              "Professional guide",
              "Transportation",
              "Entrance fees",
              "Lunch and refreshments",
              "24/7 customer support"
            ]).map((item, index) => (
              <li key={index} className="flex items-start group">
                <span className="inline-flex items-center justify-center p-1 bg-[#1a5d1a] text-white rounded-full mr-2 mt-1 group-hover:bg-[#e9b824] group-hover:text-[#1a5d1a] transition-colors duration-300">
                  <Check className="h-3 w-3" />
                </span>
                <span className="text-[#85603f] group-hover:text-[#1a5d1a] transition-colors duration-300">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="mt-8 mb-4 text-center">
          <h4 className="font-bold text-[#1a5d1a] mb-2">Discover the mystical island experience</h4>
          <p className="text-sm text-[#85603f] italic">"{tour?.shortDescription || "Embark on a journey of discovery with us!"}"</p>
        </div>
        <p className="text-sm text-[#85603f] mb-2">Need a custom tour experience?</p>
        <a href="mailto:info@islandmystic.com" className="inline-block bg-[#1a5d1a] text-white font-bold py-2 px-6 rounded-lg shadow hover:bg-[#e9b824] hover:text-[#1a5d1a] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#e9b824]/50 transform hover:scale-105" aria-label="Email Island Mystic to arrange a custom tour">
          Contact Us
        </a>
      </aside>
    </div>
    </div>
  </section>
  );
}
