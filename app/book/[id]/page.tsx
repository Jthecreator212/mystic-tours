"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, CreditCard } from "lucide-react";

type BookingPageProps = {
  params: { id: string };
  searchParams: Record<string, string | string[] | undefined>;
};

export default function BookingPage({ params }: BookingPageProps) {
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
  
  // Tour price - would normally come from API based on tour ID
  const tourPrice = 49.99;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for payment logic
    setPaymentStatus("success");
    setTimeout(() => {
      router.push("/confirmation");
    }, 2000);
  };
  
  const handlePaymentMethodChange = (method: string) => {
    setPaymentMethod(method);
  };

  return (
  <section aria-labelledby="book-tour-heading" className="max-w-5xl mx-auto p-0 md:p-10 bg-gradient-to-br from-[#f8fafc] via-white to-[#e9b824]/10 rounded-2xl shadow-2xl mt-10 border border-[#e9b824]/20">
    <h1 id="book-tour-heading" className="text-4xl font-playfair font-bold mb-8 text-[#1a5d1a] text-center drop-shadow-sm tracking-tight">Book Your Tour</h1>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-5 bg-white rounded-xl shadow p-8 border border-[#e9b824]/10">
        <h2 className="text-2xl font-bold text-[#1a5d1a]">Payment Information</h2>
        <p className="text-[#85603f]">Choose your preferred payment method</p>
        
        <div className="grid grid-cols-3 gap-2 mb-6">
          <button
            type="button"
            onClick={() => handlePaymentMethodChange("credit")}
            className={`py-3 px-4 rounded-md flex justify-center items-center transition ${paymentMethod === "credit" ? "bg-[#1a5d1a] text-white" : "bg-gray-100 text-[#85603f] border border-[#e9b824]/20"}`}
          >
            <CreditCard className="h-5 w-5 mr-2" />
            Credit Card
          </button>
          <button
            type="button"
            onClick={() => handlePaymentMethodChange("paypal")}
            className={`py-3 px-4 rounded-md flex justify-center items-center transition ${paymentMethod === "paypal" ? "bg-[#1a5d1a] text-white" : "bg-gray-100 text-[#85603f] border border-[#e9b824]/20"}`}
          >
            PayPal
          </button>
          <button
            type="button"
            onClick={() => handlePaymentMethodChange("crypto")}
            className={`py-3 px-4 rounded-md flex justify-center items-center transition ${paymentMethod === "crypto" ? "bg-[#1a5d1a] text-white" : "bg-gray-100 text-[#85603f] border border-[#e9b824]/20"}`}
          >
            Crypto
          </button>
        </div>
        
        <form onSubmit={handleSubmit} aria-label="Payment form" className="space-y-5" autoComplete="off" noValidate>
          {paymentMethod === "credit" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block mb-1 font-semibold text-[#85603f]">
                    First name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={name.split(" ")[0] || ""}
                    onChange={e => setName(e.target.value + (name.includes(" ") ? name.substring(name.indexOf(" ")) : ""))}
                    required
                    className="w-full border border-[#e9b824]/40 focus:border-[#e9b824] rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#e9b824]/30 transition focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block mb-1 font-semibold text-[#85603f]">
                    Last name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={name.includes(" ") ? name.substring(name.indexOf(" ") + 1) : ""}
                    onChange={e => setName((name.includes(" ") ? name.substring(0, name.indexOf(" ")) : name) + " " + e.target.value)}
                    required
                    className="w-full border border-[#e9b824]/40 focus:border-[#e9b824] rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#e9b824]/30 transition focus:outline-none"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block mb-1 font-semibold text-[#85603f]">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full border border-[#e9b824]/40 focus:border-[#e9b824] rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#e9b824]/30 transition focus:outline-none"
                />
              </div>
              
              <div>
                <label htmlFor="cardNumber" className="block mb-1 font-semibold text-[#85603f]">
                  Card number
                </label>
                <input
                  id="cardNumber"
                  name="cardNumber"
                  type="text"
                  value={cardNumber}
                  onChange={e => setCardNumber(e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  required
                  className="w-full border border-[#e9b824]/40 focus:border-[#e9b824] rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#e9b824]/30 transition focus:outline-none"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="expiryMonth" className="block mb-1 font-semibold text-[#85603f]">
                    Expiry month
                  </label>
                  <input
                    id="expiryMonth"
                    name="expiryMonth"
                    type="text"
                    placeholder="MM"
                    value={expiryMonth}
                    onChange={e => setExpiryMonth(e.target.value)}
                    required
                    className="w-full border border-[#e9b824]/40 focus:border-[#e9b824] rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#e9b824]/30 transition focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="expiryYear" className="block mb-1 font-semibold text-[#85603f]">
                    Expiry year
                  </label>
                  <input
                    id="expiryYear"
                    name="expiryYear"
                    type="text"
                    placeholder="YY"
                    value={expiryYear}
                    onChange={e => setExpiryYear(e.target.value)}
                    required
                    className="w-full border border-[#e9b824]/40 focus:border-[#e9b824] rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#e9b824]/30 transition focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="cvc" className="block mb-1 font-semibold text-[#85603f]">
                    CVC
                  </label>
                  <input
                    id="cvc"
                    name="cvc"
                    type="text"
                    placeholder="123"
                    value={cvc}
                    onChange={e => setCvc(e.target.value)}
                    required
                    className="w-full border border-[#e9b824]/40 focus:border-[#e9b824] rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#e9b824]/30 transition focus:outline-none"
                  />
                </div>
              </div>
              
              <div className="flex items-center text-sm text-[#85603f]">
                <span className="inline-flex items-center justify-center p-1 bg-[#1a5d1a] text-white rounded-full mr-2">
                  <Check className="h-3 w-3" />
                </span>
                Your payment information is secured with 256-bit encryption
              </div>
            </>
          )}
          
          {paymentMethod === "paypal" && (
            <div className="py-6 text-center">
              <p className="text-[#85603f] mb-4">You will be redirected to PayPal to complete your payment.</p>
              <div className="inline-block bg-[#0070ba] text-white font-bold py-3 px-6 rounded-lg">
                PayPal Checkout
              </div>
            </div>
          )}
          
          {paymentMethod === "crypto" && (
            <div className="py-6 text-center">
              <p className="text-[#85603f] mb-4">Select your preferred cryptocurrency for payment.</p>
              <div className="space-y-2">
                <button type="button" className="w-full bg-[#f7931a] text-white font-bold py-2 rounded-lg">Bitcoin</button>
                <button type="button" className="w-full bg-[#627eea] text-white font-bold py-2 rounded-lg">Ethereum</button>
                <button type="button" className="w-full bg-[#345d9d] text-white font-bold py-2 rounded-lg">Cardano</button>
              </div>
            </div>
          )}
          
          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#d83f31] via-[#e9b824] to-[#1a5d1a] text-white font-bold py-3 rounded-xl shadow-lg hover:from-[#b82e21] hover:to-[#1a5d1a] hover:via-[#fed100] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#e9b824]/50 text-lg tracking-wide"
              disabled={paymentStatus === "success"}
              aria-live="polite"
              aria-label={paymentStatus === "success" ? "Payment Successful!" : "Complete Purchase"}
            >
              {paymentStatus === "success" ? "Payment Successful!" : "Complete Purchase"}
            </button>
          </div>
        </form>
      </div>
      <aside className="bg-gradient-to-br from-[#fffbe6] via-[#fdf6b2] to-[#e9b824]/10 border border-[#e9b824]/30 rounded-xl shadow p-8" aria-labelledby="order-summary-heading">
        <h2 id="order-summary-heading" className="text-2xl font-bold text-[#1a5d1a] mb-6">Order Summary</h2>
        
        <div className="mb-4">
          <h3 className="text-xl font-bold text-[#1a5d1a]">Mystic Tour Experience</h3>
          <p className="text-[#85603f]">One-time payment</p>
          <div className="flex justify-between items-center mt-2">
            <span className="text-[#85603f]">Tour Price</span>
            <span className="text-xl font-bold text-[#d83f31]">${tourPrice.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="border-t border-[#e9b824]/30 my-4 pt-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-[#85603f]">Total</span>
            <span className="text-2xl font-bold text-[#d83f31]">${tourPrice.toFixed(2)}</span>
          </div>
          <p className="text-sm text-[#85603f] mt-1">Lifetime access, no recurring fees</p>
        </div>
        
        <div className="border-t border-[#e9b824]/30 my-4 pt-4">
          <h3 className="text-lg font-bold text-[#1a5d1a] mb-3">What's included:</h3>
          <ul className="space-y-2">
            {[
              "Professional tour guide",
              "Transportation between locations",
              "Lunch and refreshments",
              "Entrance fees to attractions",
              "Photo opportunities",
              "Souvenir package",
              "24/7 customer support"
            ].map((item, index) => (
              <li key={index} className="flex items-start">
                <span className="inline-flex items-center justify-center p-1 bg-[#1a5d1a] text-white rounded-full mr-2 mt-1">
                  <Check className="h-3 w-3" />
                </span>
                <span className="text-[#85603f]">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-[#85603f] mb-2">Need a custom tour experience?</p>
          <a href="mailto:info@islandmystic.com" className="inline-block bg-[#1a5d1a] text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-[#e9b824] hover:text-[#1a5d1a] transition-colors focus:outline-none focus:ring-2 focus:ring-[#e9b824]/50" aria-label="Email Island Mystic to arrange a custom tour">
            Contact Us
          </a>
        </div>
      </aside>
    </div>
  </section>
);
}
